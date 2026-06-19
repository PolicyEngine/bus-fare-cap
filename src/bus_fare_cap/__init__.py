"""Bus fare reform analysis.

Costs two reforms on the PolicyEngine UK Enhanced FRS:
  * a £1 per-trip bus fare cap, and
  * free bus travel for under-25s,
to help young people access training and employment. Household bus fares
(imputed from the LCFS, calibrated to DfT totals) are allocated to people by an
NTS age profile; the reforms are costed against that baseline.
"""

from .formulas import bus_fare_age_weight, fare_cap_relief, household_fare_share

__all__ = [
    "bus_fare_age_weight",
    "household_fare_share",
    "fare_cap_relief",
    "run",
]


def __getattr__(name: str):
    if name == "run":
        from .pipeline import run

        return run
    raise AttributeError(f"module {__name__!r} has no attribute {name!r}")
