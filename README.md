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

Distributional calibration of household fares — DfT's London/outside-London receipts split (BUS05ai) and NTS0705a local-bus trip rates by income quintile — happens upstream in the policyengine-uk-data build (PolicyEngine/policyengine-uk-data#447); this repo consumes the calibrated dataset. The pipeline applies a 12.5% all-ticket reduction (range 10–15%), derived from Table 6 of DfT's £2-cap evaluation re-weighted for the £3-cap counterfactual and cap-era ticket mix.

Results are reported against two counterfactuals. The **fare reduction** (~£273m) assumes a £3 cap runs throughout 2027. **Versus funding expiry** (~£409m) reflects current law, under which £3 funding ends on 31 March 2027, so nine of twelve months would otherwise be uncapped; it adds an 8.3% cap-existence wedge derived from the £151m one-year cost of the £3 cap. The second figure is the like-for-like comparison with the government's £400m of England funding. Household savings sum to the modelled fiscal cost; average household effects divide each group's savings by all households in that group. The official funding figures are not inputs.

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
- The 12.5% reduction is a derived re-weighting of 2023 £2-cap evidence, not an observed £3→£2 outcome.
- Existing local £2-or-lower fares and individual ticket prices cannot be identified.
- People in fare-spending households are an exposure proxy, not observed passengers or confirmed beneficiaries.
- The estimate is static and excludes induced demand. Route/operator fare data would enable a stronger ticket-level model.

## Dashboard

```bash
cd dashboard
bun install
bun run dev
```
