# £2 bus fare cap analysis

Source-backed analysis of the £2 bus fare cap announced by the UK government on 22 July 2026, with PolicyEngine UK distributional context from the Enhanced FRS.

**Live dashboard:** https://bus-fare-cap.vercel.app

## Announced policy

- Maximum single fare falls from £3 to £2.
- Applies from 1 January through 31 December 2027.
- Covers participating bus services in England outside London.
- Government says £400m of extra funding backs the cap and reports £454m of extra funding in total, including funding for devolved governments through the Barnett formula. ITV/PA reports an expected total scheme cost above £500m, with the balance from existing DfT bus funding; the GOV.UK release does not state that total.

The dashboard estimates the fiscal cost independently. The government figure is shown only as a benchmark.

## Analysis

PolicyEngine projects household bus and coach fare spending to 2027 by English region outside London, family type, age and income quintile. Household fares are imputed from the LCFS, calibrated to DfT Annual Bus Statistics and allocated to household members with an NTS-derived age profile.

DfT's evaluation of the previous £2 cap found that average operator yield across all ticket types fell from £1.49 to £1.40, a 6.3% reduction. The pipeline applies that observed reduction to simulated fare spending in the policy geography. Household savings sum to the modelled fiscal cost; average household effects divide each group's savings by all households in that group. The official funding figures are not inputs.

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
- The 6.3% evidence comes from the 2023 £2 cap; the 2027 counterfactual is the current £3 cap.
- Existing local £2-or-lower fares and individual ticket prices cannot be identified.
- People in fare-spending households are an exposure proxy, not observed passengers or confirmed beneficiaries.
- The estimate is static and excludes induced demand. Route/operator fare data would enable a stronger ticket-level model.

## Dashboard

```bash
cd dashboard
bun install
bun run dev
```
