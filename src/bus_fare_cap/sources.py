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
# https://www.ons.gov.uk/peoplepopulationandcommunity/populationandmigration/populationestimates
ENGLAND_TO_UK_POPULATION_UPLIFT = 68.3 / 57.7  # ~1.18

# NTS-derived, concessionary-adjusted fare allocation weight by age. Mirrors
# gov.dft.bus.fare_allocation_weight_by_age (PolicyEngine/policyengine-uk#1801),
# and is reported here only so the dashboard can display the profile.
# https://www.gov.uk/government/statistics/national-travel-survey-2023/nts-2023-trips-by-purpose-age-mode-and-sex
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

# Policy announced on 22 July 2026. Cap levels, dates, geography and the £400m
# / £454m funding figures all come from the announcement; the >£500m total is
# PA reporting, not the GOV.UK release.
# https://www.gov.uk/government/news/cheaper-travel-for-millions-with-a-third-off-fares
# https://www.newburytoday.co.uk/national/burnham-announces-2-bus-fare-cap-from-january-169628/
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
# Evaluation (Table 6, single-ticket shares in Fig 25):
# https://www.gov.uk/government/publications/evaluation-of-the-2-bus-fare-cap
# https://assets.publishing.service.gov.uk/media/681b355b9ef97b58cce3e4e0/evaluation-of-the-first-10-months-of-the-2-bus-fare-cap.pdf
FARE_CAP_REDUCTION_LOW = 0.10
FARE_CAP_REDUCTION_CENTRAL = 0.125
FARE_CAP_REDUCTION_HIGH = 0.15

# Cap-existence wedge: the saving from having a £3 cap at all, versus uncapped
# commercial fares. DfT costed the one-year £3 cap extension for calendar 2025
# at £151m. That is a reimbursement figure, so converting it to the
# household-savings basis used here means uprating 2025 -> 2027 fares (~4%/yr,
# CPT cost monitor) and grossing up the ~90% operator participation DfT
# achieved: 151 * 1.08 / 0.90 ~ £181m, or ~8.3% of projected outside-London
# fare spending. Smaller than the £3 -> £2 step because only singles that
# would price above £3 are affected, rather than every single above £2.
# £151m one-year cost of the £3 cap:
# https://www.gov.uk/government/publications/bus-service-improvement-plans-local-transport-authority-allocations/bus-service-operators-grant-local-transport-authority-final-allocations-2025-to-2026
# ~90% operator participation and the reimbursement mechanism (Fig 2):
# https://assets.publishing.service.gov.uk/media/681b355b9ef97b58cce3e4e0/evaluation-of-the-first-10-months-of-the-2-bus-fare-cap.pdf
# ~4%/yr bus cost inflation (CPT Cost Monitor):
# https://www.cpt-uk.org/news/cpt-cost-monitor-operating-costs-across-great-britain-s-bus-sector-rise-4-over-the-past-year/
CAP_EXISTENCE_REDUCTION = 0.083
THREE_POUND_CAP_2025_COST_M = 151

# Under current law the £3 cap is funded only to 31 March 2027, so nine of the
# twelve months of 2027 would have no cap at all. The announcement is
# therefore measured against two different counterfactuals.
# https://www.gov.uk/guidance/3-national-bus-fare-cap
MONTHS_VS_THREE_POUND_CAP = 3
MONTHS_VS_NO_CAP = 9

# Distributional calibration of bus_fare_spending (DfT BUS05ai regional split,
# NTS0705a income anchoring) is applied upstream in policyengine-uk-data
# (calibrate_bus_fare_spending, PolicyEngine/policyengine-uk-data#447); the
# dataset arrives already calibrated. Sources below document those anchors.

# DfT Annual Bus Statistics, year ending March 2025 (England). These remain the
# calibration anchors for household fare exposure, not a ticket-level estimate
# of the newly announced £3-to-£2 cap.
# https://www.gov.uk/government/statistics/annual-bus-statistics-year-ending-march-2025/annual-bus-statistics-year-ending-march-2025
DFT_ENGLAND_FARE_RECEIPTS_BN = 3.4  # BUS05aii: passenger fare receipts
DFT_ENGLAND_SUBSIDY_BN = 3.0  # BUS05bii: net government support
DFT_ENGLAND_PASSENGER_JOURNEYS_BN = 3.7  # BUS01: local bus passenger journeys

# ONS mid-2023 UK population, the independent check on the dataset's weights.
# https://www.ons.gov.uk/peoplepopulationandcommunity/populationandmigration/populationestimates
ONS_UK_POPULATION_M = 68.3


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
    "distribution of household fare spending in the policyengine-uk-data build "
    "(assuming a common average fare per trip across quintiles).",
    "https://www.gov.uk/government/statistical-data-sets/nts07-car-ownership-and-access",
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
    "fare receipts by area. The within-England regional fare split is "
    "calibrated to this London/outside-London split in the policyengine-uk-data "
    "build, since the LCFS imputation under-captures London fares.",
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
    "£151m one-year £3 cap extension (2025) → 8.3% cap-existence wedge",
    "DfT put the one-year extension of the £3 national bus fare cap at £151m "
    "for calendar 2025 — the cost of having a £3 cap at all, versus uncapped "
    "commercial fares. That is operator reimbursement, so this analysis "
    "converts it to a household-savings basis by uprating 2025 fares to 2027 "
    "(~4%/yr) and grossing up the ~90% operator participation DfT achieved, "
    "giving ~£181m or 8.3% of projected outside-London fare spending.",
    "https://www.gov.uk/government/publications/bus-service-improvement-plans-local-transport-authority-allocations/bus-service-operators-grant-local-transport-authority-final-allocations-2025-to-2026",
)

FUNDING_EXPIRY_COUNTERFACTUAL = Source(
    "£3 cap funded only to 31 March 2027",
    "Under current law the £3 cap expires on 31 March 2027, so for nine of the "
    "twelve months of 2027 there would be no cap. Measured against that "
    "current-law counterfactual, the announcement buys three months of a £3 → "
    "£2 reduction plus nine months of uncapped → £2, which is the basis the "
    "government's own funding figure is closest to.",
    "https://www.gov.uk/guidance/3-national-bus-fare-cap",
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
            "cap_existence_reduction": CAP_EXISTENCE_REDUCTION,
            "months_vs_three_pound_cap": MONTHS_VS_THREE_POUND_CAP,
            "months_vs_no_cap": MONTHS_VS_NO_CAP,
            "distributional_calibration": (
                "Upstream in policyengine-uk-data: BUS05ai regional split and "
                "NTS0705a income-quintile anchoring"
            ),
            "incidence_method": (
                "Derived all-ticket reduction applied to household fare spending, "
                "distributionally calibrated upstream in policyengine-uk-data"
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
            "funding_expiry_counterfactual": asdict(FUNDING_EXPIRY_COUNTERFACTUAL),
            "reimbursement_mechanism": asdict(REIMBURSEMENT_MECHANISM),
            "reported_scheme_cost": asdict(REPORTED_SCHEME_COST),
        },
    }
