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
    assert cap["official_scheme_cost_lower_bound_bn"] == 0.5
    assert cap["announced_new_funding_bn"] == 0.454
    assert cap["people_potentially_affected_m"] > 0
    assert cap["breakdown_metric"] == "estimated_household_benefit"
    assert cap["ticket_level_savings_estimated"] is False
    assert cap["fare_reduction"] == sources.DFT_ALL_TICKET_FARE_REDUCTION
    assert cap["estimated_cost_bn"] == pytest.approx(
        cap["baseline_fare_spending_bn"] * cap["fare_reduction"], abs=0.002
    )
    assert cap["estimated_cost_bn"] != cap["official_scheme_cost_lower_bound_bn"]
    effect = cap["household_effect"]
    assert effect["income_group"] == "Middle income (Q3)"
    assert effect["annual_effect_average_gbp"] > 0
    assert effect["allocation_base_bn"] == cap["estimated_cost_bn"]
    assert len(effect["by_region"]) == 8


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


def test_average_effect_breakdowns_are_positive_and_q3_matches_headline(results):
    cap = results["reforms"]["announced_2pound_cap"]
    averages = cap["average_effect_breakdowns"]
    assert set(averages) == {"region", "household_type", "age_band", "income_quintile"}
    assert all(row["annual_effect_gbp"] >= 0 for rows in averages.values() for row in rows)
    q3 = next(row for row in averages["income_quintile"] if row["group"] == "Q3")
    assert q3["annual_effect_gbp"] == cap["household_effect"]["annual_effect_average_gbp"]
