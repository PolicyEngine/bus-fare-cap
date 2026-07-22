"""Analysis of the announced 2027 £2 bus fare cap.

PolicyEngine UK distributes baseline household bus-fare exposure across the
policy geography. Official scheme cost is reported separately because the
underlying survey data do not contain ticket-level fares.
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
