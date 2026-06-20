"""Bus fare reform pipeline.

Costs two reforms on the PolicyEngine UK Enhanced FRS (household bus fares
imputed from the LCFS and calibrated to DfT Annual Bus Statistics totals):

  * **£1 bus fare cap** — a universal per-trip cap; and
  * **Free buses for under-25s** — to help young people access training and work.

Household bus fares are allocated to individuals by an NTS age profile, then
each reform is costed against that baseline with: fiscal cost, people affected,
and breakdowns by region, household type, age band and income quintile/quartile.
Behaviour is static.
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
from .sources import (
    ENGLAND_TO_UK_POPULATION_UPLIFT,
    UNDER_25_AGE_LIMIT,
    dft_average_fare,
    fare_cap_reduction_high,
    fare_cap_reduction_low,
)

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
    under25 = age < UNDER_25_AGE_LIMIT

    def wsum(values):
        return float((np.asarray(values) * pw).sum())

    # Income quintile folds PolicyEngine's published household income deciles (a
    # household-level ranking). Quartiles are dropped: a person-level quantile can
    # split members of one household, which is not meaningful here.
    quintile = np.where(decile >= 1, np.clip(((decile - 1) // 2 + 1).astype(int), 1, 5), 0)

    # Uniform 5-year age bands (so the chart has no width jump above 24).
    _bstart = (np.minimum(age, 80) // 5 * 5).astype(int)
    age_band_labels = np.where(
        _bstart >= 80,
        "80+",
        np.char.add(np.char.add(_bstart.astype(str), "-"), (_bstart + 4).astype(str)),
    )

    def breakdown(value_p, eligible):
        v = np.asarray(value_p) * eligible * pw
        df = pd.DataFrame(
            {
                "v": v,
                "region": [_label(r) for r in region],
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
                if g != "Unknown"
            ]
            if dim == "age_band":
                rows.sort(key=lambda r: int(r["group"].split("-")[0].replace("+", "")))
            elif dim == "income_quintile":
                rows.sort(key=lambda r: r["group"])
            else:
                rows.sort(key=lambda r: r["cost_bn"], reverse=True)
            out[dim] = rows
        return out

    print("Step 3: Reform — free buses for under-25s ...")
    free_under_25 = {
        "label": "Free buses for under-25s",
        "age_limit": UNDER_25_AGE_LIMIT,
        "cost_bn": round(wsum(alloc * under25) / 1e9, 3),
        "people_affected_m": round(wsum(under25 & (alloc > 0)) / 1e6, 2),
        "breakdowns": breakdown(alloc, under25),
    }

    print("Step 4: Reform — £1 fare cap (DfT-anchored range) ...")
    # Approximate: with only annual fare spend, cut each fare by a flat fraction set
    # by the DfT average fare (receipts / fare-paying journeys). The fare-paying
    # denominator is uncertain: excluding only genuinely-free older/disabled journeys
    # gives the lower bound (~£1.11 avg, ~9.5%); excluding all concessionary gives the
    # upper bound (~£1.28 avg, ~21.6%). A flat fraction blends ticket types, so this is
    # indicative, not the exact sum of max(fare - £1, 0) over single tickets.
    red_low = fare_cap_reduction_low()
    red_high = fare_cap_reduction_high()
    fare_cap = {
        "label": "£1 bus fare cap",
        "cap_gbp": sources.FARE_CAP_GBP,
        "average_fare_low_gbp": round(dft_average_fare(free_only=True), 3),
        "average_fare_high_gbp": round(dft_average_fare(free_only=False), 3),
        "reduction_low": round(red_low, 3),
        "reduction_high": round(red_high, 3),
        "cost_low_bn": round(wsum(alloc * red_low) / 1e9, 3),
        "cost_high_bn": round(wsum(alloc * red_high) / 1e9, 3),
        "people_affected_m": round(wsum(alloc > 0) / 1e6, 2),
        "breakdowns": breakdown(alloc * red_low, np.ones_like(age, bool)),
    }

    print("Step 5: Baseline and official-statistic comparisons ...")
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
    reg_df = pd.DataFrame(
        {"region": [_label(r) for r in region], "f": alloc * pw, "u": alloc * under25 * pw}
    )
    reg = reg_df.groupby("region").sum()
    by_region = [
        {"region": r, "fare_bn": round(v.f / 1e9, 3), "under25_fare_bn": round(v.u / 1e9, 3)}
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
        "fiscal_year_label": f"{year}-{(year + 1) % 100:02d}",
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
            "under_25_people_m": round(wsum(under25) / 1e6, 2),
            "fare_paying_people_m": round(wsum(alloc > 0) / 1e6, 2),
            "under_25_fare_bn": round(wsum(alloc * under25) / 1e9, 3),
            "under_25_share": round(wsum(alloc * under25) / total_fare, 3),
            "by_age_band": by_age,
            "by_region": by_region,
            "breakdowns": breakdown(alloc, np.ones_like(age, bool)),
            "official_comparison": official,
        },
        "reforms": {"free_under_25": free_under_25, "fare_cap_1pound": fare_cap},
    }

    print("Step 6: Writing results JSON ...")
    for dest in [
        REPO_ROOT / "data" / "bus_fare_cap_results.json",
        REPO_ROOT / "dashboard" / "public" / "data" / "bus_fare_cap_results.json",
    ]:
        dest.parent.mkdir(parents=True, exist_ok=True)
        dest.write_text(json.dumps(output, indent=2, default=str))
        print(f"    wrote {dest}")
    print(
        f"Done. Free under-25s £{free_under_25['cost_bn']:.2f}bn "
        f"({free_under_25['people_affected_m']:.1f}m people); "
        f"£1 cap £{fare_cap['cost_low_bn']:.2f}–{fare_cap['cost_high_bn']:.2f}bn "
        f"({fare_cap['people_affected_m']:.1f}m people)."
    )
