"""Bus fare reform pipeline.

Costs two reforms on the PolicyEngine UK Enhanced FRS (in which household bus
fares are imputed from the LCFS and calibrated to DfT Annual Bus Statistics
totals):

  * **£1 bus fare cap** — a universal per-trip cap; and
  * **Free buses for under-25s** — to help young people access training and work.

Household bus fares are allocated to individuals by an NTS age profile
(:mod:`bus_fare_cap.sources`), then each reform is costed against that baseline
and written to a dashboard-ready JSON. Every modelled quantity is read from the
dataset; every other number comes from :mod:`bus_fare_cap.sources`.
"""

from __future__ import annotations

import argparse
import json
from pathlib import Path

import numpy as np
import pandas as pd

from . import sources
from .formulas import bus_fare_age_weight, fare_cap_relief, household_fare_share
from .sources import (
    FARE_CAP_REDUCTION_CENTRAL,
    FARE_CAP_REDUCTION_SENSITIVITY,
    UNDER_25_AGE_LIMIT,
)

REPO_ROOT = Path(__file__).resolve().parents[2]
DATASET = "enhanced_frs_2024_25.h5"
PRIVATE_REPO = "policyengine/policyengine-uk-data-private"


def _load_dataset() -> tuple[pd.DataFrame, pd.DataFrame]:
    """Load the calibrated Enhanced FRS household + person tables from Hugging Face."""
    from huggingface_hub import hf_hub_download

    path = hf_hub_download(DATASET, repo_id=PRIVATE_REPO, repo_type="model")
    with pd.HDFStore(path, "r") as store:
        return store["/household"], store["/person"]


def _region_label(level: str) -> str:
    return str(level).replace("_", " ").title().replace(" Of ", " of ")


def run(args: argparse.Namespace) -> None:
    year = args.year
    print(f"Step 1: Loading Enhanced FRS ({DATASET}) ...")
    hh, person = _load_dataset()

    fare = pd.to_numeric(hh["bus_fare_spending"], errors="coerce").fillna(0.0).to_numpy()
    subsidy = pd.to_numeric(hh["bus_subsidy_spending"], errors="coerce").fillna(0.0).to_numpy()
    weight = pd.to_numeric(hh["household_weight"], errors="coerce").fillna(0.0).to_numpy()
    region = hh["region"].astype(str).to_numpy()
    hh_id = hh["household_id"].to_numpy()

    age = pd.to_numeric(person["age"], errors="coerce").fillna(40).to_numpy()
    person_w = bus_fare_age_weight(age)
    person_hid = person["person_household_id"].to_numpy()

    print("Step 2: Allocating household fares to people by NTS age profile ...")

    def share_for(eligible_mask) -> np.ndarray:
        s = household_fare_share(person_w, person_hid, eligible_mask)
        return s.reindex(hh_id).fillna(0.0).to_numpy()

    def weighted(values) -> float:
        return float((np.asarray(values) * weight).sum())

    total_fare = weighted(fare)
    total_subsidy = weighted(subsidy)

    # ── Baseline breakdowns ────────────────────────────────────────────────
    print("Step 3: Baseline by age band and region ...")
    bands = [
        ("0-15", age < 16),
        ("16-24", (age >= 16) & (age < 25)),
        ("25-44", (age >= 25) & (age < 45)),
        ("45-64", (age >= 45) & (age < 65)),
        ("65+", age >= 65),
    ]
    by_age = []
    for name, mask in bands:
        f = weighted(fare * share_for(mask))
        by_age.append(
            {"band": name, "fare_bn": round(f / 1e9, 3), "share": round(f / total_fare, 3)}
        )

    u25_share = share_for(age < UNDER_25_AGE_LIMIT)
    u25_fare = weighted(fare * u25_share)

    by_region_df = pd.DataFrame(
        {"region": region, "fare": fare, "weight": weight, "u25": u25_share}
    )
    region_rows = (
        by_region_df.groupby("region")
        .apply(
            lambda d: pd.Series(
                {
                    "fare_bn": float((d.fare * d.weight).sum()) / 1e9,
                    "under25_fare_bn": float((d.fare * d.u25 * d.weight).sum()) / 1e9,
                }
            ),
            include_groups=False,
        )
        .sort_values("fare_bn", ascending=False)
    )
    by_region = [
        {
            "region": _region_label(r),
            "fare_bn": round(v.fare_bn, 3),
            "under25_fare_bn": round(v.under25_fare_bn, 3),
        }
        for r, v in region_rows.iterrows()
    ]

    # ── Reform A: free buses for under-25s ─────────────────────────────────
    print("Step 4: Reform — free buses for under-25s ...")
    free_under_25 = {
        "label": "Free buses for under-25s",
        "age_limit": UNDER_25_AGE_LIMIT,
        "cost_bn": round(u25_fare / 1e9, 3),
        "by_region": [{"region": r["region"], "cost_bn": r["under25_fare_bn"]} for r in by_region],
    }

    # ── Reform B: £1 fare cap ──────────────────────────────────────────────
    print("Step 5: Reform — £1 fare cap (fare-reduction approximation) ...")
    fare_cap = {
        "label": "£1 bus fare cap",
        "cap_gbp": sources.FARE_CAP_GBP,
        "central_cost_bn": round(fare_cap_relief(total_fare, FARE_CAP_REDUCTION_CENTRAL) / 1e9, 3),
        "sensitivity": [
            {"fare_reduction": fr, "cost_bn": round(fare_cap_relief(total_fare, fr) / 1e9, 3)}
            for fr in FARE_CAP_REDUCTION_SENSITIVITY
        ],
    }

    methods = {
        "baseline": (
            "Household bus & coach fare spending is imputed from the LCFS in the "
            "PolicyEngine UK Enhanced FRS and calibrated to the DfT Annual Bus "
            "Statistics passenger-fare total (England, uplifted to the UK by "
            "population). Bus subsidy is the ETB-imputed government benefit-in-kind, "
            "calibrated to DfT net government support."
        ),
        "allocation": (
            "Household fare is allocated to individuals by an NTS bus-trips-by-age "
            "profile adjusted for concessionary (free-pass) travel, so it tracks "
            "fares paid not trips. LCFS records fares at household level, so the "
            "per-person split is modelled, not observed."
        ),
        "free_under_25": (
            "Fiscal cost = the bus fares allocated to people under 25, which the "
            "government would now meet (a full subsidy for that group). Static."
        ),
        "fare_cap_1pound": (
            "A £1 per-trip cap. The dataset records annual £ spend, not per-trip "
            "fares, so the cap is approximated as a fare-reduction fraction (20-40% "
            "sensitivity). Firming it up needs NTS trips-per-person."
        ),
        "behaviour": (
            "All figures are static. Lower or zero fares induce extra trips "
            "(Scotland's under-22 free scheme saw large uptake); a behavioural trip "
            "elasticity would raise both ridership and cost."
        ),
    }

    output = {
        "year": year,
        "fiscal_year_label": f"{year}-{(year + 1) % 100:02d}",
        "currency": "GBP",
        "dataset": "PolicyEngine UK Enhanced FRS (enhanced_frs_2024_25)",
        "methods": methods,
        **sources.as_json(),
        "baseline": {
            "total_bus_fare_bn": round(total_fare / 1e9, 3),
            "total_bus_subsidy_bn": round(total_subsidy / 1e9, 3),
            "under_25_fare_bn": round(u25_fare / 1e9, 3),
            "under_25_share": round(u25_fare / total_fare, 3),
            "by_age_band": by_age,
            "by_region": by_region,
        },
        "reforms": {"free_under_25": free_under_25, "fare_cap_1pound": fare_cap},
    }

    print("Step 6: Writing results JSON ...")
    for destination in [
        REPO_ROOT / "data" / "bus_fare_cap_results.json",
        REPO_ROOT / "dashboard" / "public" / "data" / "bus_fare_cap_results.json",
    ]:
        destination.parent.mkdir(parents=True, exist_ok=True)
        destination.write_text(json.dumps(output, indent=2, default=str))
        print(f"    wrote {destination}")

    print(
        f"Done. Free under-25s £{free_under_25['cost_bn']:.2f}bn; "
        f"£1 cap £{fare_cap['central_cost_bn']:.2f}bn (central)."
    )
