import numpy as np

from bus_fare_cap.formulas import (
    bus_fare_age_weight,
    fare_cap_relief,
    household_fare_share,
)


def test_age_weight_peaks_at_17_to_20_and_zero_floor_for_pensioners():
    w = bus_fare_age_weight([5, 18, 24, 35, 68, 80])
    assert w[1] == 3.9  # 17-20 peak
    assert w[0] == 0.5  # under 17
    assert w[2] == 1.8  # 21-29
    assert w[3] == 1.0  # 30-39
    assert w[5] == 0.07  # 70+ (concessionary, ~free)
    # pension-age weight is far below working-age
    assert w[4] < w[3]


def test_household_fare_share_splits_by_age_weight():
    # one household: a 19-year-old (weight 3.9) and a 40-year-old (weight 0.8)
    ages = np.array([19, 40])
    w = bus_fare_age_weight(ages)
    hid = np.array([1, 1])
    under_25 = ages < 25
    share = household_fare_share(w, hid, under_25)
    assert share.loc[1] == 3.9 / (3.9 + 0.8)


def test_household_fare_share_zero_when_no_eligible_members():
    ages = np.array([40, 50])
    w = bus_fare_age_weight(ages)
    share = household_fare_share(w, np.array([1, 1]), ages < 25)
    assert share.loc[1] == 0.0


def test_fare_cap_relief_is_a_fraction_of_fares():
    assert fare_cap_relief(1_000.0, 0.3) == 300.0
