# Bus fare policies analysis

Costs two bus fare reforms on the PolicyEngine UK Enhanced FRS (household bus and coach fares imputed from the LCFS and calibrated to DfT Annual Bus Statistics totals).

**Live dashboard:** https://bus-fare-cap.vercel.app

## Headline results

Default dataset `enhanced_frs_2024_25`, fiscal year 2027-28, static (no behavioural response).

| Reform | Fiscal cost / yr |
|---|---|
| Free buses for under-25s | ~£0.65bn |
| £1 bus fare cap | ~£0.92bn (≈22% average-fare reduction) |

Baseline: UK household bus and coach fares ≈ £4.2bn; under-25s ≈ 15.5% of fares.

The £1 cap figure uses an all-concessionary denominator for the average fare. A stricter free-only denominator (excluding only genuinely-free older/disabled journeys) gives a sensitivity of ~£0.40bn (≈9.5% reduction).

## Method

Household bus fares are allocated to individuals using a National Travel Survey bus-trips-by-age profile (concessionary-adjusted, so it tracks fares paid rather than trips). **Free buses for under-25s** is the fares allocated to that group. The **£1 cap** is approximated by a flat fare-reduction fraction set by the DfT average fare (receipts ÷ fare-paying journeys), since the dataset holds annual fare spend rather than per-trip fares. The dashboard Methodology tab gives a source for every number.

## Layout

- `src/bus_fare_cap/` — the Python package (`formulas`, `sources`, `pipeline`, `cli`).
- `dashboard/` — Next.js dashboard with Reforms, Baseline and Methodology tabs.
- `data/` and `dashboard/public/data/` — generated results JSON.

## Run

```bash
pip install -e ".[dev]"
export HF_TOKEN=hf_xxx   # access to policyengine/policyengine-uk-data-private
python -m bus_fare_cap --year 2027   # default: Enhanced FRS; regenerates the results JSON
```

To cost the reforms on the Populace UK dataset instead (via policyengine.py `managed_microsimulation`), opt in with an environment variable. This path is kept available but off by default:

```bash
BUS_FARE_CAP_POPULACE=1 python -m bus_fare_cap --year 2027
```

## Caveats

- **Young-adult undercount.** The Enhanced FRS undercounts 18-24s (~3.3m vs ONS ~5.9m) because the FRS misses young adults who have left home. The under-25 fare share and the free-under-25s cost are therefore a lower bound.
- **Modelled age split.** The split across ages uses NTS age weights, not observed individual fares.
- **Flat-fraction cap.** The £1 cap is a flat fare-reduction approximation, not a ticket-level calculation.
- **Static.** No behavioural response — lower or zero fares would induce more trips (cf. Scotland's under-22 scheme) and raise both ridership and cost.
- **Gross of concessions.** Costs are gross of existing youth and child concessions (e.g. Scotland's under-22 free travel).

## Dashboard

```bash
cd dashboard && bun install && bun run dev
```
