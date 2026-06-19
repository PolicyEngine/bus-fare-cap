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
# £1 cap approximated as a fraction of fares (no per-trip data); sensitivity grid.
FARE_CAP_REDUCTION_SENSITIVITY = [0.20, 0.30, 0.40]
FARE_CAP_REDUCTION_CENTRAL = 0.30


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


def as_json() -> dict:
    return {
        "reform_definition": {
            "under_25_age_limit": UNDER_25_AGE_LIMIT,
            "fare_cap_gbp": FARE_CAP_GBP,
            "england_to_uk_population_uplift": ENGLAND_TO_UK_POPULATION_UPLIFT,
        },
        "assumptions": {
            "age_allocation_weights": AGE_ALLOCATION_WEIGHTS,
            "fare_cap_reduction_sensitivity": FARE_CAP_REDUCTION_SENSITIVITY,
            "fare_cap_reduction_central": FARE_CAP_REDUCTION_CENTRAL,
            "behavioural": "static (no induced demand)",
        },
        "sources": {
            "dft_fare": asdict(DFT_FARE),
            "dft_subsidy": asdict(DFT_SUBSIDY),
            "ons_population": asdict(ONS_POPULATION),
            "nts_age_profile": asdict(NTS_AGE_PROFILE),
            "scotland_under_22": asdict(SCOTLAND_U22),
        },
    }
