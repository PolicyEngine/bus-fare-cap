from bus_fare_cap.formulas import fare_cap_relief


def test_fare_cap_relief_is_a_fraction_of_fares():
    assert fare_cap_relief(1_000.0, 0.3) == 300.0
