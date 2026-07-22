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

# Policy announced on 22 July 2026.
BASELINE_FARE_CAP_GBP = 3
REFORM_FARE_CAP_GBP = 2
POLICY_START_DATE = "2027-01-01"
POLICY_END_DATE = "2027-12-31"
ANNOUNCED_CAP_FUNDING_BN = 0.4
ANNOUNCED_TOTAL_EXTRA_FUNDING_BN = 0.454

# Independent empirical costing assumption. DfT's evaluation of the first ten
# months of the previous £2 cap found that average yield across *all ticket
# types* fell from £1.49 to £1.40, a weighted reduction of 6.3%. Applying this
# observed whole-market reduction to simulated fare spending restores the
# original dashboard's DfT-anchored microsimulation method. Because the 2027
# counterfactual already has a £3 cap, this is best treated as an indicative
# static estimate rather than a ticket-level forecast.
DFT_ALL_TICKET_FARE_REDUCTION = 0.063

# DfT Annual Bus Statistics, year ending March 2025 (England). These remain the
# calibration anchors for household fare exposure, not a ticket-level estimate
# of the newly announced £3-to-£2 cap.
DFT_ENGLAND_FARE_RECEIPTS_BN = 3.4  # BUS05a: passenger fare receipts
DFT_ENGLAND_PASSENGER_JOURNEYS_BN = 3.7  # BUS01: local bus passenger journeys


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
    "local bus passenger journeys in England, of which 28% (1.0 billion) were "
    "concessionary. This provides context, but cannot identify tickets above £2.",
    "https://www.gov.uk/government/statistics/annual-bus-statistics-year-ending-march-2025/annual-bus-statistics-year-ending-march-2025",
)
DFT_OUTSIDE_LONDON_JOURNEYS = Source(
    "1.85bn passenger journeys",
    "DfT Annual Bus Statistics, year ending March 2025: passenger journeys on "
    "local buses in England outside London.",
    "https://www.gov.uk/government/statistics/annual-bus-statistics-year-ending-march-2025/annual-bus-statistics-year-ending-march-2025",
)
DFT_INCOME_QUINTILE_TRIPS = Source(
    "Q1: 66 trips/person; Q5: 29",
    "National Travel Survey 2024 benchmark reported by DfT. This measures local "
    "bus trips, not household fare spending, so it is a directional comparison.",
    "https://www.gov.uk/government/statistics/annual-bus-statistics-year-ending-march-2025/annual-bus-statistics-year-ending-march-2025",
)
NTS_AGE_PROFILE = Source(
    "Bus trips by age; 17-20 peak",
    "National Travel Survey 2023 bus trips by age (concessionary-adjusted), used "
    "to allocate household bus fares to individuals.",
    "https://www.gov.uk/government/statistics/national-travel-survey-2023/nts-2023-trips-by-purpose-age-mode-and-sex",
)
CURRENT_FARE_CAP_POLICY = Source(
    "£3 funded until 31 March 2027",
    "The existing national scheme funds a £3 maximum single fare on participating "
    "services through March 2027. The new policy supersedes it from 1 January 2027, "
    "lowering the cap to £2 and extending it through December.",
    "https://www.gov.uk/guidance/3-national-bus-fare-cap",
)

TWO_POUND_ANNOUNCEMENT = Source(
    "£2 from 1 January 2027; £400m backs the cap",
    "Government announcement of a £2 maximum single fare on participating buses "
    "in England outside London throughout 2027. It says £400m of extra funding "
    "backs the cap and separately reports £454m of extra funding including Barnett "
    "funding for devolved governments. It does not publish a total scheme cost.",
    "https://www.gov.uk/government/news/cheaper-travel-for-millions-with-a-third-off-fares",
)

DFT_TWO_POUND_CAP_EVALUATION = Source(
    "6.3% reduction across all ticket types",
    "DfT's evaluation of the first ten months of the previous £2 cap reports "
    "average operator yield of £1.49 before and £1.40 after the cap across all "
    "ticket types, a weighted average saving of 6.3%. Affected singles fell from "
    "£2.73 to £2.00, but they represented less than half of trips.",
    "https://www.gov.uk/government/publications/evaluation-of-the-2-bus-fare-cap",
)


def as_json() -> dict:
    return {
        "reform_definition": {
            "baseline_fare_cap_gbp": BASELINE_FARE_CAP_GBP,
            "reform_fare_cap_gbp": REFORM_FARE_CAP_GBP,
            "start_date": POLICY_START_DATE,
            "end_date": POLICY_END_DATE,
            "geography": "England outside London",
            "participating_services_only": True,
        },
        "assumptions": {
            "age_allocation_weights": AGE_ALLOCATION_WEIGHTS,
            "fare_cap_reduction": DFT_ALL_TICKET_FARE_REDUCTION,
            "incidence_method": "DfT observed all-ticket reduction applied to household fare spending",
            "behavioural": "static (no induced demand)",
        },
        "sources": {
            "dft_fare": asdict(DFT_FARE),
            "dft_subsidy": asdict(DFT_SUBSIDY),
            "dft_journeys": asdict(DFT_JOURNEYS),
            "dft_outside_london_journeys": asdict(DFT_OUTSIDE_LONDON_JOURNEYS),
            "dft_income_quintile_trips": asdict(DFT_INCOME_QUINTILE_TRIPS),
            "ons_population": asdict(ONS_POPULATION),
            "nts_age_profile": asdict(NTS_AGE_PROFILE),
            "current_fare_cap_policy": asdict(CURRENT_FARE_CAP_POLICY),
            "two_pound_announcement": asdict(TWO_POUND_ANNOUNCEMENT),
            "dft_two_pound_cap_evaluation": asdict(DFT_TWO_POUND_CAP_EVALUATION),
        },
    }
