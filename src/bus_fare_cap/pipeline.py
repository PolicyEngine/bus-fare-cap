"""Bus fare reform pipeline.

Costs the £3-to-£2 English bus fare cap announced on 22 July 2026 using the
PolicyEngine UK Enhanced FRS. Household bus-fare spending is allocated to people
and reduced by a 12.5% (range 10-15%) all-ticket fare reduction derived from
DfT's evaluation of the previous £2 cap, re-weighted for the £3-cap
counterfactual and cap-era ticket mix. Fares are regionally recalibrated to
DfT's London/outside-London receipts split. The result is an independent,
static microsimulation estimate; the government's funding figures are retained
only as benchmarks.
"""

from __future__ import annotations

import argparse
import importlib.metadata
import json
import os
from pathlib import Path

import numpy as np
import pandas as pd

from . import sources
from .formulas import bus_fare_age_weight
from .sources import ENGLAND_TO_UK_POPULATION_UPLIFT

REPO_ROOT = Path(__file__).resolve().parents[2]
# Default simulation source: the PolicyEngine UK Enhanced FRS, downloaded from
# the private release at a pinned revision for reproducibility
# (policyengine-uk-data 1.56.5, built with policyengine-uk 2.89.2).
DATASET = "enhanced_frs_2024_25.h5"
PRIVATE_REPO = "policyengine/policyengine-uk-data-private"
DATASET_REVISION = "8a43d256f0f59c8be26f1416343d0798098cc6b6"
# Opt-in alternative: the Populace UK dataset, simulated through the
# policyengine.py wrapper (managed_microsimulation). Kept available but NOT
# triggered by default — set BUS_FARE_CAP_POPULACE=1 to use it.
POPULACE_DATASET = "populace_uk_2023"


def _use_populace() -> bool:
    return os.environ.get("BUS_FARE_CAP_POPULACE", "").strip().lower() not in (
        "",
        "0",
        "false",
        "no",
    )


def _label(level: str) -> str:
    return str(level).replace("_", " ").title().replace(" Of ", " of ")


def _load_sim():
    if _use_populace():
        # Populace UK via policyengine.py. managed_microsimulation returns a
        # real policyengine_uk.Microsimulation, so .calculate(...) is unchanged.
        from policyengine.tax_benefit_models.uk import managed_microsimulation

        return managed_microsimulation(dataset=POPULACE_DATASET)

    from huggingface_hub import hf_hub_download
    from policyengine_uk import Microsimulation
    from policyengine_uk.data import UKSingleYearDataset

    path = hf_hub_download(
        repo_id=PRIVATE_REPO, filename=DATASET, repo_type="model", revision=DATASET_REVISION
    )
    return Microsimulation(dataset=UKSingleYearDataset(path))


def run(args: argparse.Namespace) -> None:
    year = args.year
    print(f"Step 1: Microsimulation on {DATASET} ...")
    sim = _load_sim()

    print("Step 2: Person-level arrays and age allocation ...")
    fare_p = np.asarray(
        sim.calculate("bus_fare_spending", period=year, map_to="person").values, float
    )
    age = np.asarray(sim.calculate("age", period=year, map_to="person").values, float)
    hid = np.asarray(sim.calculate("household_id", period=year, map_to="person").values)
    region = np.asarray(sim.calculate("region", period=year, map_to="person").values).astype(str)
    region_label = np.asarray([_label(r) for r in region])
    famtype = np.asarray(sim.calculate("family_type", period=year, map_to="person").values).astype(
        str
    )
    decile = np.asarray(
        sim.calculate("household_income_decile", period=year, map_to="person").values, float
    )
    pw = np.asarray(sim.calculate("bus_fare_spending", period=year, map_to="person").weights, float)

    aw = bus_fare_age_weight(age)
    hh_total_aw = pd.Series(aw).groupby(hid).transform("sum").to_numpy()
    share = np.where(hh_total_aw > 0, aw / hh_total_aw, 0.0)
    alloc = fare_p * share  # person's allocated annual bus fare; sums to hh fare

    fare_hh = sim.calculate("bus_fare_spending", period=year, map_to="household")
    sub_hh = sim.calculate("bus_subsidy_spending", period=year, map_to="household")
    total_fare = float(fare_hh.sum())
    total_subsidy = float(sub_hh.sum())
    total_people = float(pw.sum())
    english_regions_outside_london = {
        "North East",
        "North West",
        "Yorkshire",
        "East Midlands",
        "West Midlands",
        "East of England",
        "South East",
        "South West",
    }
    in_policy_geography = np.isin(region_label, list(english_regions_outside_london))
    is_london = region_label == "London"

    def wsum(values):
        return float((np.asarray(values) * pw).sum())

    # Income quintile folds PolicyEngine's published household income deciles (a
    # household-level ranking). Quartiles are dropped: a person-level quantile can
    # split members of one household, which is not meaningful here.
    quintile = np.where(decile >= 1, np.clip(((decile - 1) // 2 + 1).astype(int), 1, 5), 0)

    # Recalibrate within-England fares to two observed anchors, alternating in a
    # small IPF loop (each step preserves the model's England total; devolved
    # nations are untouched):
    #   1. Income: quintile fare shares proportional to population x NTS0705a
    #      local-bus trips per person (the LCFS spend gradient runs the wrong
    #      way — richer households record more spend, but NTS shows Q1 makes
    #      ~3.7x the trips of Q5). Assumes a common average fare per trip.
    #   2. Region: DfT BUS05ai London/outside-London receipts split (the LCFS
    #      imputation under-captures London contactless/Oyster spend).
    in_england = in_policy_geography | is_london
    london_share = sources.DFT_LONDON_FARE_SHARE_OF_ENGLAND
    nts_rates = sources.NTS_BUS_TRIPS_BY_INCOME_QUINTILE
    eng_total = wsum(alloc * in_england)
    quintile_people = {q: wsum(in_england & (quintile == q)) for q in nts_rates}
    target_norm = sum(quintile_people[q] * r for q, r in nts_rates.items())
    for _ in range(3):
        for q, rate in nts_rates.items():
            m = in_england & (quintile == q)
            current = wsum(alloc * m)
            if current > 0:
                target = quintile_people[q] * rate / target_norm * eng_total
                alloc = np.where(m, alloc * target / current, alloc)
        model_london = wsum(alloc * is_london)
        model_outside = wsum(alloc * in_england) - model_london
        alloc = np.where(
            is_london,
            alloc * london_share * eng_total / model_london,
            np.where(
                in_policy_geography,
                alloc * (1 - london_share) * eng_total / model_outside,
                alloc,
            ),
        )

    # Uniform 5-year age bands (so the chart has no width jump above 24).
    _bstart = (np.minimum(age, 80) // 5 * 5).astype(int)
    age_band_labels = np.where(
        _bstart >= 80,
        "80+",
        np.char.add(np.char.add(_bstart.astype(str), "-"), (_bstart + 4).astype(str)),
    )

    def breakdown(value_p, eligible, include_unknown=False, target_total_bn=None):
        v = np.asarray(value_p) * eligible * pw
        df = pd.DataFrame(
            {
                "v": v,
                "region": region_label,
                "household_type": [_label(f) for f in famtype],
                "age_band": age_band_labels,
                "income_quintile": [f"Q{n}" if n else "Unknown" for n in quintile],
            }
        )
        out = {}
        for dim in ["region", "household_type", "age_band", "income_quintile"]:
            rows = [
                {"group": g, "cost_bn": round(float(c) / 1e9, 3)}
                for g, c in df.groupby(dim)["v"].sum().items()
                if (include_unknown or g != "Unknown") and c > 0
            ]
            if dim == "age_band":
                rows.sort(key=lambda r: int(r["group"].split("-")[0].replace("+", "")))
            elif dim == "income_quintile":
                rows.sort(key=lambda r: r["group"])
            else:
                rows.sort(key=lambda r: r["cost_bn"], reverse=True)
            if target_total_bn is not None and rows:
                current_total = sum(r["cost_bn"] for r in rows)
                if current_total > 0:
                    scale = target_total_bn / current_total
                    for row in rows:
                        row["cost_bn"] = round(row["cost_bn"] * scale, 3)
                residual = round(target_total_bn - sum(r["cost_bn"] for r in rows), 3)
                largest = max(rows, key=lambda r: r["cost_bn"])
                largest["cost_bn"] = round(largest["cost_bn"] + residual, 3)
            out[dim] = rows
        return out

    print("Step 3: Announced reform — £3 to £2 fare cap ...")
    exposure_total_gbp = wsum(alloc * in_policy_geography)
    reduction = sources.FARE_CAP_REDUCTION_CENTRAL
    allocated_relief = alloc * in_policy_geography * reduction
    estimated_cost_gbp = wsum(allocated_relief)
    estimated_cost_bn = estimated_cost_gbp / 1e9
    effect_breakdowns = breakdown(
        allocated_relief,
        np.ones_like(age, bool),
        include_unknown=False,
        target_total_bn=round(estimated_cost_bn, 3),
    )
    household_frame = pd.DataFrame(
        {
            "household_id": hid,
            "region": region_label,
            "household_type": [_label(f) for f in famtype],
            "income_quintile": quintile,
            "weight": pw,
        }
    ).drop_duplicates("household_id")
    household_relief = (
        pd.DataFrame({"household_id": hid, "relief": allocated_relief})
        .groupby("household_id")["relief"]
        .sum()
    )
    household_frame = household_frame.join(household_relief, on="household_id")
    policy_household_frame = household_frame[
        household_frame["region"].isin(english_regions_outside_london)
    ]

    def average_household_effect(dimension):
        grouped = policy_household_frame.groupby(dimension).apply(
            lambda group: np.average(group["relief"], weights=group["weight"]),
            include_groups=False,
        )
        return [
            {
                "group": f"Q{int(group)}" if dimension == "income_quintile" else _label(group),
                "annual_effect_gbp": round(float(value), 2),
            }
            for group, value in grouped.items()
            if group not in (0, "Unknown")
        ]

    # Age is a person attribute, so age-band averages are per person, restricted
    # to the policy geography (the other dimensions average per household).
    age_effect_frame = pd.DataFrame(
        {
            "age_band": age_band_labels[in_policy_geography],
            "relief": (allocated_relief * pw)[in_policy_geography],
            "weight": pw[in_policy_geography],
        }
    )
    age_effect = age_effect_frame.groupby("age_band").sum()
    average_effect_breakdowns = {
        "region": average_household_effect("region"),
        "household_type": average_household_effect("household_type"),
        "age_band": [
            {
                "group": group,
                "annual_effect_gbp": round(float(row.relief / row.weight), 2),
            }
            for group, row in age_effect.iterrows()
        ],
        "income_quintile": average_household_effect("income_quintile"),
    }
    average_effect_breakdowns["region"].sort(key=lambda row: row["annual_effect_gbp"], reverse=True)
    average_effect_breakdowns["household_type"].sort(
        key=lambda row: row["annual_effect_gbp"], reverse=True
    )
    average_effect_breakdowns["age_band"].sort(
        key=lambda row: int(row["group"].split("-")[0].replace("+", ""))
    )
    average_effect_breakdowns["income_quintile"].sort(key=lambda row: row["group"])
    household_effect_by_region = [
        {
            "region": row["group"],
            "annual_effect_gbp": row["annual_effect_gbp"],
        }
        for row in average_effect_breakdowns["region"]
    ]
    household_effect_average = round(
        float(
            np.average(
                policy_household_frame["relief"],
                weights=policy_household_frame["weight"],
            )
        ),
        2,
    )
    fare_cap = {
        "label": "Announced £2 bus fare cap",
        "baseline_cap_gbp": sources.BASELINE_FARE_CAP_GBP,
        "reform_cap_gbp": sources.REFORM_FARE_CAP_GBP,
        "start_date": sources.POLICY_START_DATE,
        "end_date": sources.POLICY_END_DATE,
        "geography": "England outside London",
        "participating_services_only": True,
        "people_potentially_affected_m": round(wsum(in_policy_geography & (alloc > 0)) / 1e6, 2),
        "announced_cap_funding_bn": sources.ANNOUNCED_CAP_FUNDING_BN,
        "announced_total_extra_funding_bn": sources.ANNOUNCED_TOTAL_EXTRA_FUNDING_BN,
        "reported_scheme_cost_lower_bound_bn": sources.REPORTED_SCHEME_COST_LOWER_BOUND_BN,
        "official_total_scheme_cost_published": False,
        "estimated_cost_bn": round(estimated_cost_bn, 3),
        "estimated_cost_low_bn": round(
            exposure_total_gbp * sources.FARE_CAP_REDUCTION_LOW / 1e9, 3
        ),
        "estimated_cost_high_bn": round(
            exposure_total_gbp * sources.FARE_CAP_REDUCTION_HIGH / 1e9, 3
        ),
        "fare_reduction": reduction,
        "fare_reduction_low": sources.FARE_CAP_REDUCTION_LOW,
        "fare_reduction_high": sources.FARE_CAP_REDUCTION_HIGH,
        "baseline_fare_spending_bn": round(exposure_total_gbp / 1e9, 3),
        "breakdowns": effect_breakdowns,
        "effect_breakdowns": effect_breakdowns,
        "average_effect_breakdowns": average_effect_breakdowns,
        "breakdown_metric": "estimated_household_benefit",
        "ticket_level_savings_estimated": False,
        "household_effect": {
            "population": "All households in England outside London",
            "annual_effect_average_gbp": household_effect_average,
            "by_region": household_effect_by_region,
            "allocation_base_bn": round(estimated_cost_bn, 3),
            "method": (
                "12.5% derived all-ticket reduction applied to simulated fare "
                "spending, regionally recalibrated to DfT BUS05ai"
            ),
        },
    }

    print("Step 4: Baseline and official-statistic comparisons ...")
    bands = [
        ("0-15", age < 16),
        ("16-24", (age >= 16) & (age < 25)),
        ("25-44", (age >= 25) & (age < 45)),
        ("45-64", (age >= 45) & (age < 65)),
        ("65+", age >= 65),
    ]
    by_age = [
        {
            "band": n,
            "fare_bn": round(wsum(alloc * m) / 1e9, 3),
            "share": round(wsum(alloc * m) / total_fare, 3),
            "people_m": round(wsum(m) / 1e6, 2),
        }
        for n, m in bands
    ]
    reg_df = pd.DataFrame({"region": region_label, "f": alloc * pw})
    reg = reg_df.groupby("region").sum()
    by_region = [
        {"region": r, "fare_bn": round(v.f / 1e9, 3)}
        for r, v in reg.sort_values("f", ascending=False).iterrows()
    ]

    uk_fare = 3.4 * ENGLAND_TO_UK_POPULATION_UPLIFT
    uk_sub = 3.0 * ENGLAND_TO_UK_POPULATION_UPLIFT
    official = {
        "total_bus_fare_bn": {
            "ours": round(total_fare / 1e9, 2),
            "official": round(uk_fare, 2),
            "kind": "Calibration target",
            "official_label": "DfT England £3.4bn (BUS05aii) × 1.18 UK uplift",
            "url": sources.DFT_FARE.url,
        },
        "total_bus_subsidy_bn": {
            "ours": round(total_subsidy / 1e9, 2),
            "official": round(uk_sub, 2),
            "kind": "Calibration target",
            "official_label": "DfT England £3.0bn (BUS05bii) × 1.18 UK uplift",
            "url": sources.DFT_SUBSIDY.url,
        },
        "population_m": {
            "ours": round(total_people / 1e6, 1),
            "official": 68.3,
            "kind": "Independent check",
            "official_label": "ONS UK mid-2023 population 68.3m",
            "url": sources.ONS_POPULATION.url,
        },
    }

    output = {
        "year": year,
        "projection_year_label": str(year),
        "policy_period_label": "1 January–31 December 2027",
        "currency": "GBP",
        "dataset": (
            "populace_uk_2023"
            if _use_populace()
            else "PolicyEngine UK Enhanced FRS (enhanced_frs_2024_25)"
        ),
        "dataset_source": "populace-uk" if _use_populace() else "enhanced-frs",
        "simulation_stack": (
            "policyengine.py (managed_microsimulation)"
            if _use_populace()
            else "policyengine-uk (direct)"
        ),
        "policyengine_uk_version": importlib.metadata.version("policyengine-uk"),
        **sources.as_json(),
        "baseline": {
            "total_bus_fare_bn": round(total_fare / 1e9, 3),
            "total_bus_subsidy_bn": round(total_subsidy / 1e9, 3),
            "population_m": round(total_people / 1e6, 2),
            "fare_paying_people_m": round(wsum(alloc > 0) / 1e6, 2),
            "by_age_band": by_age,
            "by_region": by_region,
            "breakdowns": breakdown(alloc, np.ones_like(age, bool)),
            "official_comparison": official,
        },
        "reforms": {"announced_2pound_cap": fare_cap},
    }

    print("Step 5: Writing results JSON ...")
    for dest in [
        REPO_ROOT / "data" / "bus_fare_cap_results.json",
        REPO_ROOT / "dashboard" / "public" / "data" / "bus_fare_cap_results.json",
    ]:
        dest.parent.mkdir(parents=True, exist_ok=True)
        dest.write_text(json.dumps(output, indent=2, default=str))
        print(f"    wrote {dest}")
    print(
        f"Done. Microsimulation estimate £{fare_cap['estimated_cost_bn']:.3f}bn; "
        f"reported government scheme cost >£{fare_cap['reported_scheme_cost_lower_bound_bn']:.1f}bn."
    )
