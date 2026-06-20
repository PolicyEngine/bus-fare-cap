"""Single registry of every non-PolicyEngine number used in the analysis.

Quantities PolicyEngine UK models (bus fares/subsidy imputed and calibrated in
the Enhanced FRS, ages, region, weights) come from the dataset at run time.
Everything else — the calibration targets, the England->UK uplift, the NTS age
profile, empirical assumptions, and validation context — lives here with a
value, a description and a source URL, and is emitted verbatim into the results
JSON so the dashboard renders no hardcoded numbers.
"""

from __future__ import annotations

from dataclasses import asdict, dataclass
from typing import Any

# England -> UK uplift for England-only DfT bus finance (ONS mid-2023 pop).
ENGLAND_TO_UK_POPULATION_UPLIFT = 68.3 / 57.7  # ~1.18

# NTS-derived, concessionary-adjusted fare allocation weight by age.
AGE_ALLOCATION_WEIGHTS = {
    "0-16": 0.5,
    "17-20": 3.9,
    "21-29": 1.8,
    "30-39": 1.0,
    "40-49": 0.8,
    "50-59": 0.7,
    "60-69": 0.3,
    "70+": 0.07,
}

# Reform levers.
UNDER_25_AGE_LIMIT = 25
FARE_CAP_GBP = 1

# £1 cap anchored on DfT Annual Bus Statistics, year ending March 2025 (England) —
# the same release the fare/subsidy calibration targets come from. The cap cost is
# the fares forgone, fares - journeys x £1, expressed as a reduction fraction
# (1 - £1 / average fare) applied to the calibrated fare total.
DFT_ENGLAND_FARE_RECEIPTS_BN = 3.4  # BUS05a: passenger fare receipts
DFT_ENGLAND_PASSENGER_JOURNEYS_BN = 3.7  # BUS01: local bus passenger journeys
# Genuinely-free statutory (older/disabled, ENCTS) journeys generate no fare receipts
# (they are reimbursed as subsidy). Concessionary Travel Statistics, y/e March 2025.
DFT_ENGLAND_FREE_CONCESSIONARY_JOURNEYS_BN = 0.624
# All "concessionary" journeys in BUS01 (≈28%) also lump in youth concessions, who pay
# reduced fares that ARE in the receipts — so this is only the upper-bound denominator.
DFT_ENGLAND_CONCESSIONARY_JOURNEY_SHARE = 0.28


def _cap_reduction(fare_paying_journeys_bn: float) -> float:
    """Reduction = 1 - £1 / (receipts / fare-paying journeys)."""
    avg_fare = DFT_ENGLAND_FARE_RECEIPTS_BN / fare_paying_journeys_bn
    return 1 - FARE_CAP_GBP / avg_fare


def dft_average_fare(free_only: bool = True) -> float:
    """Average fare = receipts / fare-paying journeys. ``free_only`` excludes only the
    genuinely-free older/disabled journeys (lower bound); otherwise all concessionary."""
    excluded = (
        DFT_ENGLAND_FREE_CONCESSIONARY_JOURNEYS_BN
        if free_only
        else DFT_ENGLAND_PASSENGER_JOURNEYS_BN * DFT_ENGLAND_CONCESSIONARY_JOURNEY_SHARE
    )
    return DFT_ENGLAND_FARE_RECEIPTS_BN / (DFT_ENGLAND_PASSENGER_JOURNEYS_BN - excluded)


def fare_cap_reduction_low() -> float:
    """Lower bound on cost: exclude only genuinely-free older/disabled journeys."""
    return _cap_reduction(
        DFT_ENGLAND_PASSENGER_JOURNEYS_BN - DFT_ENGLAND_FREE_CONCESSIONARY_JOURNEYS_BN
    )


def fare_cap_reduction_high() -> float:
    """Upper bound on cost: exclude all concessionary journeys (incl. fare-paying youth)."""
    return _cap_reduction(
        DFT_ENGLAND_PASSENGER_JOURNEYS_BN * (1 - DFT_ENGLAND_CONCESSIONARY_JOURNEY_SHARE)
    )


@dataclass(frozen=True)
class Source:
    value: Any
    description: str
    url: str


DFT_FARE = Source(
    "£3.4bn (England)",
    "DfT Annual Bus Statistics, year ending March 2025, table BUS05aii: passenger "
    "fare receipts on local bus services (England), ~52% of £6.6bn operating "
    "revenue. Calibration target for bus_fare_spending, uplifted England->UK by "
    "population.",
    "https://www.gov.uk/government/statistics/annual-bus-statistics-year-ending-march-2025/annual-bus-statistics-year-ending-march-2025",
)
DFT_SUBSIDY = Source(
    "£3.0bn (England)",
    "DfT Annual Bus Statistics, year ending March 2025, table BUS05bii: total net "
    "government support for local bus services (England), of which £0.8bn "
    "concessionary travel reimbursement. Calibration target for "
    "bus_subsidy_spending, uplifted England->UK by population.",
    "https://www.gov.uk/government/statistics/annual-bus-statistics-year-ending-march-2025/annual-bus-statistics-year-ending-march-2025",
)
ONS_POPULATION = Source(
    "UK 68.3M / England 57.7M ~ 1.18",
    "ONS mid-2023 population estimates, used to uplift England-only DfT bus "
    "finance to a UK total. Indicative: bus use per head varies by nation.",
    "https://www.ons.gov.uk/peoplepopulationandcommunity/populationandmigration/populationestimates",
)
DFT_JOURNEYS = Source(
    "3.7bn journeys (England), 28% concessionary",
    "DfT Annual Bus Statistics, year ending March 2025, table BUS01: 3.7 billion "
    "local bus passenger journeys in England, of which 28% (1.0 billion) were free "
    "concessionary journeys. With fare receipts this gives the average fare paid "
    "(~£1.28), which anchors the £1 cap cost (fares - journeys x £1).",
    "https://www.gov.uk/government/statistics/annual-bus-statistics-year-ending-march-2025/annual-bus-statistics-year-ending-march-2025",
)
NTS_AGE_PROFILE = Source(
    "Bus trips by age; 17-20 peak",
    "National Travel Survey 2023 bus trips by age (concessionary-adjusted), used "
    "to allocate household bus fares to individuals.",
    "https://www.gov.uk/government/statistics/national-travel-survey-2023/nts-2023-trips-by-purpose-age-mode-and-sex",
)
SCOTLAND_U22 = Source(
    "Free bus travel for under-22s",
    "Transport Scotland's under-22 free bus scheme — a real-world comparator for "
    "a youth free-travel policy, and evidence of large induced demand.",
    "https://www.transport.gov.scot/concessionary-travel/young-persons-free-bus-travel-scheme/",
)

FARE_CAP_POLICY = Source(
    "£2 (2023) -> £3 (Jan 2025 - Mar 2027)",
    "England's national bus fare cap: single fares capped at £2 from 2023, raised "
    "to £3 from January 2025 and funded to March 2027. The real-world comparator "
    "for a £1 cap.",
    "https://www.gov.uk/guidance/3-national-bus-fare-cap",
)

CPT_UNDER22_ESTIMATE = Source(
    "£100-150m/yr (under-22, £1 fare)",
    "Confederation of Passenger Transport estimate that a £1 fare for under-22s in "
    "England would cost £100-150m/yr — an external comparator (this analysis costs "
    "free travel for the wider under-25 group).",
    "https://www.route-one.net/news/what-should-come-next-after-the-bus-fare-cap-scheme-in-england/",
)


def as_json() -> dict:
    return {
        "reform_definition": {
            "under_25_age_limit": UNDER_25_AGE_LIMIT,
            "fare_cap_gbp": FARE_CAP_GBP,
            "england_to_uk_population_uplift": ENGLAND_TO_UK_POPULATION_UPLIFT,
        },
        "assumptions": {
            "age_allocation_weights": AGE_ALLOCATION_WEIGHTS,
            "fare_cap_average_fare_low_gbp": round(dft_average_fare(free_only=True), 3),
            "fare_cap_average_fare_high_gbp": round(dft_average_fare(free_only=False), 3),
            "fare_cap_reduction_low": round(fare_cap_reduction_low(), 3),
            "fare_cap_reduction_high": round(fare_cap_reduction_high(), 3),
            "behavioural": "static (no induced demand)",
        },
        "sources": {
            "dft_fare": asdict(DFT_FARE),
            "dft_subsidy": asdict(DFT_SUBSIDY),
            "dft_journeys": asdict(DFT_JOURNEYS),
            "ons_population": asdict(ONS_POPULATION),
            "nts_age_profile": asdict(NTS_AGE_PROFILE),
            "scotland_under_22": asdict(SCOTLAND_U22),
            "fare_cap_policy": asdict(FARE_CAP_POLICY),
            "cpt_under22_estimate": asdict(CPT_UNDER22_ESTIMATE),
        },
    }
