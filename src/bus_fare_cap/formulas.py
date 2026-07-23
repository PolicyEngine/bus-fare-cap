"""Bus fare reform arithmetic, shared by the pipeline and tests.

Allocating household fares across members lives upstream in policyengine-uk as
``person_bus_fare_spending`` and ``gov.dft.bus.fare_allocation_weight_by_age``
(PolicyEngine/policyengine-uk#1801), so only the reform arithmetic remains here.
"""

from __future__ import annotations


def fare_cap_relief(fare_spending, reduction_fraction):
    """Household saving from a fare cap, as a fraction of fare spending.

    The dataset records annual £ spend, not per-trip fares, so the reduction
    fraction must come from external evidence covering the whole ticket market
    — see ``sources.FARE_CAP_REDUCTION_CENTRAL`` for the derivation and its
    sources.
    """
    return fare_spending * float(reduction_fraction)
