"""Analysis of the announced 2027 £2 bus fare cap.

PolicyEngine UK estimates the distribution of household savings using the
whole-market fare reduction observed in DfT's evaluation of the previous £2 cap.
The official scheme cost is retained as a separate comparison benchmark.
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
