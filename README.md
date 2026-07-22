# 2027 £2 bus fare cap analysis

Source-backed analysis of the £2 bus fare cap announced by the UK government on 22 July 2026, with PolicyEngine UK distributional context from the Enhanced FRS.

**Live dashboard:** https://bus-fare-cap.vercel.app

## Announced policy

- Maximum single fare falls from £3 to £2.
- Applies from 1 January through 31 December 2027.
- Covers participating bus services in England outside London.
- Government says total scheme cost will exceed £500m and identifies £454m of new funding, including funding that enables devolved governments to take similar action.

The official announcement is the source for the fiscal headline. The analysis does not claim to reproduce it with microsimulation.

## Analysis

PolicyEngine projects household bus and coach fare spending to 2027 and shows baseline fare exposure by English region outside London, family type, age and income quintile. Household fares are imputed from the LCFS, calibrated to DfT Annual Bus Statistics and allocated to household members with an NTS-derived age profile.

This exposure is not a ticket-level savings estimate. The dataset records annual household spending rather than individual ticket prices, so it cannot calculate `journeys × max(current fare − £2, 0)`, identify participating routes, or remove places already charging £2 or less. The dashboard also shows an illustrative middle-income household effect by allocating the official £500m cost floor in proportion to baseline fare exposure and averaging each region's allocation across all Q3 households.

## Layout

- `src/bus_fare_cap/` — Python analysis package.
- `dashboard/` — Next.js dashboard with Announcement, Baseline and Methodology tabs.
- `data/` and `dashboard/public/data/` — generated dashboard JSON.

## Run

```bash
pip install -e ".[dev]"
export HF_TOKEN=hf_xxx
python -m bus_fare_cap --year 2027
```

The default private Enhanced FRS dataset is pinned for reproducibility. The optional Populace path remains available:

```bash
BUS_FARE_CAP_POPULACE=1 python -m bus_fare_cap --year 2027
```

## Caveats

- Operator participation and detailed reimbursement rules for 2027 are not yet represented.
- London and the devolved nations are excluded from the policy-geography analysis.
- Existing local £2-or-lower fares cannot yet be identified in the household dataset.
- People in fare-spending households are an exposure proxy, not observed passengers or confirmed beneficiaries.
- An independent costing requires route/operator fare and journey distributions plus behavioural sensitivity analysis.

## Dashboard

```bash
cd dashboard
bun install
bun run dev
```
