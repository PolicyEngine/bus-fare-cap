"""Tests for the published calculations: the DfT-anchored £1-cap arithmetic and
the invariants of the generated results JSON the dashboard reads."""

import json
from pathlib import Path

import pytest

from bus_fare_cap import sources

RESULTS = Path(__file__).parent.parent / "data" / "bus_fare_cap_results.json"


def test_dft_average_fare_bounds():
    # Lower bound excludes only genuinely-free older/disabled journeys → lower avg fare.
    low = sources.dft_average_fare(free_only=True)
    high = sources.dft_average_fare(free_only=False)
    assert round(low, 2) == 1.11  # 3.4 / (3.7 - 0.624)
    assert round(high, 2) == 1.28  # 3.4 / (3.7 * 0.72)
    assert low < high


def test_cap_reduction_bounds():
    low = sources.fare_cap_reduction_low()
    high = sources.fare_cap_reduction_high()
    assert round(low, 3) == 0.095
    assert round(high, 3) == 0.216
    assert 0 < low < high < 1


def test_as_json_exposes_cap_range_keys():
    a = sources.as_json()["assumptions"]
    for key in (
        "fare_cap_reduction_low",
        "fare_cap_reduction_high",
        "fare_cap_average_fare_low_gbp",
        "fare_cap_average_fare_high_gbp",
    ):
        assert key in a


@pytest.fixture
def results():
    return json.loads(RESULTS.read_text())


def test_results_cap_is_a_range(results):
    cap = results["reforms"]["fare_cap_1pound"]
    assert cap["cost_low_bn"] <= cap["cost_high_bn"]
    assert cap["reduction_low"] <= cap["reduction_high"]
    # the cap relief equals reduction × total fares (uniform fraction)
    total = results["baseline"]["total_bus_fare_bn"]
    assert cap["cost_low_bn"] == pytest.approx(total * cap["reduction_low"], rel=0.02)


def test_results_breakdowns_have_no_quartile(results):
    for reform in results["reforms"].values():
        dims = set(reform["breakdowns"])
        assert dims == {"region", "household_type", "age_band", "income_quintile"}


def test_results_breakdown_totals_reconcile(results):
    # Each reform's region breakdown should sum to its headline cost (within rounding).
    u25 = results["reforms"]["free_under_25"]
    region_sum = sum(r["cost_bn"] for r in u25["breakdowns"]["region"])
    assert region_sum == pytest.approx(u25["cost_bn"], abs=0.02)
