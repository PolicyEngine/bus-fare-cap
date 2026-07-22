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
REPORTED_SCHEME_COST_LOWER_BOUND_BN = 0.5

# Independent empirical costing assumption, derived from DfT's evaluation of
# the previous £2 cap (Table 6). The evaluation's headline 6.3% all-ticket
# yield reduction measures uncapped-2022 fares -> £2 with a 2022 ticket mix
# (singles ~28% of trips). The 2027 counterfactual is a £3 cap: singles that
# would price above £3 sit at the cap and save a full £1 (33%), and under cap
# regimes singles rose to ~85% of tickets sold. Re-weighting the evaluation's
# affected-single reduction (~27%) by a cap-era single trip share of 0.35-0.50
# gives an all-ticket reduction of 10-15%, central 12.5%.
FARE_CAP_REDUCTION_LOW = 0.10
FARE_CAP_REDUCTION_CENTRAL = 0.125
FARE_CAP_REDUCTION_HIGH = 0.15

# DfT BUS05ai, year ending March 2025: England passenger fare receipts £3,417m,
# of which London £1,347m and England outside London £2,070m. Used to
# recalibrate the model's within-England regional fare split, which the
# LCFS imputation alone gets wrong (it under-captures London fares).
DFT_ENGLAND_FARE_RECEIPTS_M = 3417
DFT_LONDON_FARE_RECEIPTS_M = 1347
DFT_LONDON_FARE_SHARE_OF_ENGLAND = DFT_LONDON_FARE_RECEIPTS_M / DFT_ENGLAND_FARE_RECEIPTS_M

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
    "Local bus trips/person/year, 2024: Q1 47.6 … Q5 13.0",
    "National Travel Survey table NTS0705a, 2024, 'Other local bus' (outside "
    "London): average trips per person per year by household income quintile — "
    "Q1 47.6, Q2 37.5, Q3 24.8, Q4 18.5, Q5 13.0. Anchors the income "
    "distribution of household fare spending, assuming a common average fare "
    "per trip across quintiles.",
    "https://www.gov.uk/government/statistical-data-sets/nts07-car-ownership-and-access",
)

# NTS0705a 2024 'Other local bus' trips per person per year by household income
# quintile (England). Anchors the across-household income allocation of fares.
NTS_BUS_TRIPS_BY_INCOME_QUINTILE = {1: 47.6, 2: 37.5, 3: 24.8, 4: 18.5, 5: 13.0}
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
    "Table 6: singles £2.73 → £2.00; all tickets £1.49 → £1.40",
    "DfT's evaluation of the first ten months of the previous £2 cap. Affected "
    "singles (pre-cap price above £2) fell 26.8%; the all-ticket average fell "
    "6.3% on a 2022 ticket mix where singles were a minority of trips. Under "
    "cap regimes singles rose to ~85% of tickets sold.",
    "https://www.gov.uk/government/publications/evaluation-of-the-2-bus-fare-cap",
)

DERIVED_FARE_REDUCTION = Source(
    "12.5% all-ticket reduction (range 10-15%)",
    "Derived for the £3-to-£2 change: singles priced at the £3 cap save £1 "
    "(33%) and those between £2 and £3 save less, giving roughly a 27% single "
    "yield reduction, weighted by a cap-era single trip share of 0.35-0.50. "
    "The evaluation's headline 6.3% is not used directly because it measures "
    "uncapped 2022 fares to £2 on a pre-cap ticket mix.",
    "https://www.gov.uk/government/publications/evaluation-of-the-2-bus-fare-cap",
)

DFT_REGIONAL_FARE_SPLIT = Source(
    "England £3,417m: London £1,347m / outside London £2,070m",
    "DfT Annual Bus Statistics table BUS05ai, year ending March 2025: passenger "
    "fare receipts by area. The model's within-England regional fare split is "
    "recalibrated to this London/outside-London split, since the LCFS "
    "imputation under-captures London fares.",
    "https://www.gov.uk/government/statistical-data-sets/bus-statistics-data-tables",
)

REPORTED_SCHEME_COST = Source(
    ">£500m expected total scheme cost",
    "Contemporaneous PA reporting says the government expects the scheme to "
    "cost more than £500m. It reports £454m of new funding, with the balance from "
    "Department for Transport funding already allocated to buses. The GOV.UK press "
    "release itself does not state the total.",
    "https://www.newburytoday.co.uk/national/burnham-announces-2-bus-fare-cap-from-january-169628/",
)


THREE_POUND_CAP_2025_COST = Source(
    "£151m for the £3 cap in calendar 2025",
    "DfT allocations for the £3 national bus fare cap in 2025 totalled £151m — "
    "the annual cost of having a £3 cap at all versus uncapped commercial "
    "fares. The government's 2027 budget prices April-December against no cap, "
    "since existing £3 funding ends on 31 March 2027.",
    "https://www.gov.uk/government/publications/bus-service-improvement-plans-local-transport-authority-allocations/bus-service-operators-grant-local-transport-authority-final-allocations-2025-to-2026",
)

REIMBURSEMENT_MECHANISM = Source(
    "Revenue foregone vs commercial fares; indexed to fare rises",
    "DfT reimbursement guidance: operators are compensated for revenue foregone "
    "measured against commercial average fares, indexed to fare increases. "
    "Generated (induced) trips are not reimbursed. The £2 cap evaluation "
    "reports £210m paid over ten months against a £245m budget, a 14% "
    "underspend, indicating budget contingency.",
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
            "fare_cap_reduction": FARE_CAP_REDUCTION_CENTRAL,
            "fare_cap_reduction_low": FARE_CAP_REDUCTION_LOW,
            "fare_cap_reduction_high": FARE_CAP_REDUCTION_HIGH,
            "london_fare_share_of_england": round(DFT_LONDON_FARE_SHARE_OF_ENGLAND, 4),
            "nts_bus_trips_by_income_quintile": NTS_BUS_TRIPS_BY_INCOME_QUINTILE,
            "incidence_method": (
                "Derived all-ticket reduction applied to household fare spending, "
                "regionally recalibrated to DfT BUS05ai"
            ),
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
            "derived_fare_reduction": asdict(DERIVED_FARE_REDUCTION),
            "dft_regional_fare_split": asdict(DFT_REGIONAL_FARE_SPLIT),
            "three_pound_cap_2025_cost": asdict(THREE_POUND_CAP_2025_COST),
            "reimbursement_mechanism": asdict(REIMBURSEMENT_MECHANISM),
            "reported_scheme_cost": asdict(REPORTED_SCHEME_COST),
        },
    }
