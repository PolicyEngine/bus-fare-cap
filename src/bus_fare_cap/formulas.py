"""Bus fare reform arithmetic, shared by the pipeline and tests.

The age-weight and cap helpers are pure functions of their inputs so they can
be unit-tested without the PolicyEngine stack.
"""

from __future__ import annotations

import numpy as np

# NTS-derived, concessionary-adjusted relative bus-fare weight by age. Mirrors
# gov.dft.bus.fare_allocation_weight_by_age in policyengine-uk: bus use peaks at
# 17-20, and pension-age riders travel free so carry ~zero fare weight.
AGE_BREAKS = [17, 21, 30, 40, 50, 60, 70]
AGE_WEIGHTS = [0.5, 3.9, 1.8, 1.0, 0.8, 0.7, 0.3, 0.07]


def bus_fare_age_weight(age):
    """Relative fare weight for each person's age (vectorised)."""
    age = np.asarray(age, dtype=float)
    conditions = [age < b for b in AGE_BREAKS]
    return np.select(conditions, AGE_WEIGHTS[:-1], default=AGE_WEIGHTS[-1])


def household_fare_share(person_weight, person_household_id, eligible):
    """Share of each household's bus fare attributable to ``eligible`` members.

    The share is the eligible members' age-weight over all members' age-weight,
    returned as a Series indexed by household_id.
    """
    import pandas as pd

    w = np.asarray(person_weight, dtype=float)
    elig = np.asarray(eligible, dtype=bool)
    df = pd.DataFrame({"hid": np.asarray(person_household_id), "w": w, "ew": w * elig})
    g = df.groupby("hid").sum()
    return (g["ew"] / g["w"].where(g["w"] > 0, np.nan)).fillna(0.0)


def fare_cap_relief(fare_spending, reduction_fraction):
    """Government cost of a per-trip fare cap, approximated as a fraction of fares.

    The dataset records annual £ spend, not per-trip fares. This generic helper
    is retained for sensitivity analysis; the announced £2 policy does not use
    it because a blended fraction cannot identify tickets currently above £2.
    """
    return fare_spending * float(reduction_fraction)
