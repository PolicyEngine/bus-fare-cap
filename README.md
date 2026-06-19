# Bus fares for young people

Microsimulation of two policies to help young people access training and employment, built on the **PolicyEngine UK Enhanced FRS** (in which household bus & coach fares are imputed from the LCFS and calibrated to DfT Annual Bus Statistics totals):

1. **£1 bus fare cap** — a universal per-trip cap.
2. **Free buses for under-25s** — full fare subsidy for that group.

Each is costed as a fiscal cost (the fares government would now meet), with breakdowns by age and region. Static (pre-behavioural).

## Headline results (`enhanced_frs_2024_25`, 2025-26, static)

| | Fiscal cost / yr |
|---|---|
| Free buses for under-25s | **~£0.6bn** |
| £1 bus fare cap | **~£0.8–1.5bn** (20–40% fare-reduction assumption) |

Baseline: UK household bus/coach fares ≈ £3.9bn; under-25s ≈ 15% of fares.

## Method

Household bus fares are allocated to individuals by an NTS bus-trips-by-age profile (concessionary-adjusted, so it tracks fares paid not trips — pensioners travel free). **Free under-25s** is the fares allocated to under-25s. The **£1 cap** is approximated as a fare-reduction fraction because the dataset has annual £ spend, not per-trip fares; firming it up needs NTS trips-per-person. See the dashboard Methodology tab for a source on every number.

## Layout

- `src/bus_fare_cap/` — the Python package (`formulas`, `sources`, `pipeline`, `cli`).
- `dashboard/` — Next.js dashboard with **Reforms**, **Baseline** and **Methodology** tabs.
- `data/` + `dashboard/public/data/` — generated results JSON.

## Run

```bash
pip install -e ".[dev]"
export HUGGING_FACE_TOKEN=hf_xxx   # access to policyengine/policyengine-uk-data-private
python -m bus_fare_cap --year 2025   # regenerates the results JSON
cd dashboard && bun install && bun run dev
```

## Caveats

- **Static** — lower/zero fares induce more trips (cf. Scotland's under-22 scheme); a behavioural elasticity raises both ridership and cost.
- **£1 cap** is a fare-reduction approximation (no per-trip data).
- Bus fares are calibrated to **DfT England** figures uplifted to the UK by population (~1.18); the per-person age split is **modelled** (LCFS fares are household-level).
