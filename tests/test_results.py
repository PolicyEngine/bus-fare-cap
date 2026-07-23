"""Tests for the announced-policy metadata and dashboard result invariants."""

import json
from pathlib import Path

import pytest

from bus_fare_cap import sources

RESULTS = Path(__file__).parent.parent / "data" / "bus_fare_cap_results.json"


def test_as_json_exposes_announced_policy():
    policy = sources.as_json()["reform_definition"]
    assert policy == {
        "baseline_fare_cap_gbp": 3,
        "reform_fare_cap_gbp": 2,
        "start_date": "2027-01-01",
        "end_date": "2027-12-31",
        "geography": "England outside London",
        "participating_services_only": True,
    }


@pytest.fixture
def results():
    return json.loads(RESULTS.read_text())


def test_results_cost_is_microsimulated_and_official_cost_is_a_benchmark(results):
    cap = results["reforms"]["announced_2pound_cap"]
    assert cap["announced_cap_funding_bn"] == 0.4
    assert cap["announced_total_extra_funding_bn"] == 0.454
    assert cap["reported_scheme_cost_lower_bound_bn"] == 0.5
    assert cap["official_total_scheme_cost_published"] is False
    assert cap["people_potentially_affected_m"] > 0
    assert cap["breakdown_metric"] == "estimated_household_benefit"
    assert cap["ticket_level_savings_estimated"] is False
    assert cap["fare_reduction"] == sources.FARE_CAP_REDUCTION_CENTRAL
    assert cap["fare_reduction_low"] == sources.FARE_CAP_REDUCTION_LOW
    assert cap["fare_reduction_high"] == sources.FARE_CAP_REDUCTION_HIGH
    assert cap["estimated_cost_low_bn"] < cap["estimated_cost_bn"] < cap["estimated_cost_high_bn"]
    assert cap["estimated_cost_bn"] == pytest.approx(
        cap["baseline_fare_spending_bn"] * cap["fare_reduction"], abs=0.002
    )
    assert cap["estimated_cost_bn"] != cap["announced_cap_funding_bn"]
    effect = cap["household_effect"]
    assert effect["population"] == "All households in England outside London"
    assert effect["annual_effect_average_gbp"] > 0
    assert effect["allocation_base_bn"] == cap["estimated_cost_bn"]
    assert len(effect["by_region"]) == 8


def test_funding_expiry_scenario_exceeds_fare_reduction(results):
    """The current-law scenario also buys the cap's existence, so costs more."""
    cap = results["reforms"]["announced_2pound_cap"]
    expiry = cap["vs_funding_expiry"]
    assert expiry["cap_existence_reduction"] == sources.CAP_EXISTENCE_REDUCTION
    # Blended = 3 months at the fare-reduction rate, 9 months at that rate plus
    # the cap-existence wedge.
    months = sources.MONTHS_VS_THREE_POUND_CAP + sources.MONTHS_VS_NO_CAP
    expected = (
        sources.MONTHS_VS_THREE_POUND_CAP * cap["fare_reduction"]
        + sources.MONTHS_VS_NO_CAP * (cap["fare_reduction"] + sources.CAP_EXISTENCE_REDUCTION)
    ) / months
    assert expiry["blended_reduction"] == pytest.approx(expected, abs=1e-4)
    assert expiry["estimated_cost_bn"] > cap["estimated_cost_bn"]
    assert (
        expiry["estimated_cost_low_bn"]
        < expiry["estimated_cost_bn"]
        < expiry["estimated_cost_high_bn"]
    )
    assert expiry["estimated_cost_bn"] == pytest.approx(
        cap["baseline_fare_spending_bn"] * expiry["blended_reduction"], abs=0.002
    )
    # The dashboard headlines this scenario, so its breakdowns must reconcile.
    for rows in expiry["effect_breakdowns"].values():
        assert sum(row["cost_bn"] for row in rows) == pytest.approx(
            expiry["estimated_cost_bn"], abs=0.01
        )
    assert (
        expiry["household_effect_average_gbp"]
        > cap["household_effect"]["annual_effect_average_gbp"]
    )


def test_results_breakdowns_have_no_quartile(results):
    cap = results["reforms"]["announced_2pound_cap"]
    dims = set(cap["breakdowns"])
    assert dims == {"region", "household_type", "age_band", "income_quintile"}


def test_results_breakdown_totals_reconcile(results):
    cap = results["reforms"]["announced_2pound_cap"]
    region_rows = cap["breakdowns"]["region"]
    assert {row["group"] for row in region_rows}.isdisjoint(
        {"London", "Scotland", "Wales", "Northern Ireland"}
    )
    assert sum(r["cost_bn"] for r in region_rows) > 0


def test_effect_breakdowns_reconcile_to_modelled_cost(results):
    cap = results["reforms"]["announced_2pound_cap"]
    for rows in cap["effect_breakdowns"].values():
        assert sum(row["cost_bn"] for row in rows) == pytest.approx(
            cap["estimated_cost_bn"], abs=0.01
        )
    assert {row["group"] for row in cap["effect_breakdowns"]["income_quintile"]} == {
        "Q1",
        "Q2",
        "Q3",
        "Q4",
        "Q5",
    }


def test_average_effect_breakdowns_are_positive(results):
    cap = results["reforms"]["announced_2pound_cap"]
    averages = cap["average_effect_breakdowns"]
    assert set(averages) == {"region", "household_type", "age_band", "income_quintile"}
    assert all(row["annual_effect_gbp"] >= 0 for rows in averages.values() for row in rows)
