"""Analysis of the announced 2027 £2 bus fare cap.

PolicyEngine UK estimates the distribution of household savings using the
whole-market fare reduction derived from DfT's evaluation of the previous £2
cap. The announced cap funding is retained as a separate comparison benchmark.
"""

from .formulas import fare_cap_relief

__all__ = [
    "fare_cap_relief",
    "run",
]


def __getattr__(name: str):
    if name == "run":
        from .pipeline import run

        return run
    raise AttributeError(f"module {__name__!r} has no attribute {name!r}")
