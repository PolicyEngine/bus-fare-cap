# £2 bus fare cap analysis

Source-backed analysis of the £2 bus fare cap announced by the UK government on 22 July 2026, with PolicyEngine UK distributional context from the certified Microcosm UK dataset.

**Live dashboard:** https://bus-fare-cap.vercel.app

## Announced policy

- Maximum single fare falls from £3 to £2.
- Applies from 1 January through 31 December 2027.
- Covers participating bus services in England outside London.
- Government says £400m of extra funding backs the cap and reports £454m of extra funding in total, including funding for devolved governments through the Barnett formula. ITV/PA reports an expected total scheme cost above £500m, with the balance from existing DfT bus funding; the GOV.UK release does not state that total.

The dashboard estimates the fiscal cost independently. The government figure is shown only as a benchmark.

## Analysis

PolicyEngine projects bus fare spending in 2027 by English region outside London, family type, age and income quintile. The simulation runs through `policyengine.py`'s `managed_microsimulation`, which pins `policyengine-uk` and the certified Microcosm UK dataset together; the results JSON records the policyengine and policyengine-uk versions and the dataset name, build revision and SHA-256. In `policyengine-uk`, `person_bus_fare_spending` prices each person's imputed local-bus trips at DfT passenger receipts per fare-paying boarding, and concessionary pass holders pay nothing. Current law in `policyengine-uk` already applies the £2 cap from January 2027, so the pipeline holds the cap at £3 to measure the base. This repo contains only the reform modelling and the dashboard.

The pipeline applies a 12.5% all-ticket reduction (range 10–15%), derived from Table 6 of DfT's £2-cap evaluation re-weighted for the £3-cap counterfactual and cap-era ticket mix.

Results are reported against two counterfactuals. The **fare reduction** (~£354m) assumes a £3 cap runs throughout 2027. **Versus funding expiry** (~£531m) reflects current law, under which £3 funding ends on 31 March 2027, so nine of twelve months would otherwise be uncapped; it adds an 8.3% cap-existence wedge derived from the £151m one-year cost of the £3 cap. The second figure is the like-for-like comparison with the government's £400m of England funding. Household savings sum to the modelled fiscal cost; average household effects divide each group's savings by all households in that group. The official funding figures are not inputs.

## Layout

- `src/bus_fare_cap/` — Python analysis package.
- `dashboard/` — Next.js dashboard with Announcement, Baseline and Methodology tabs.
- `data/` and `dashboard/public/data/` — generated dashboard JSON.

## Run

```bash
pip install -e ".[dev]"
export HUGGING_FACE_TOKEN=hf_xxx  # or a saved `huggingface-cli login`
python -m bus_fare_cap --year 2027
```

The Microcosm UK dataset is private. `uv.lock` pins `policyengine` 6.10.2, which certifies `policyengine-uk` 2.132.6 and the `microcosm_uk_2024_25` build it uses.

## Caveats

- Operator participation and detailed reimbursement rules for 2027 are not yet represented.
- London and the devolved nations are excluded from the policy-geography analysis.
- The 12.5% reduction is a derived re-weighting of 2023 £2-cap evidence, not an observed £3→£2 outcome.
- Existing local £2-or-lower fares and individual ticket prices cannot be identified.
- People with modelled fare spending are an exposure proxy, not observed passengers or confirmed beneficiaries. Microcosm UK gives every person at least a few imputed local-bus trips a year, so everyone not eligible for a concessionary pass has some modelled fare spending.
- The estimate is static and excludes induced demand. Route/operator fare data would enable a stronger ticket-level model.

## Dashboard

```bash
cd dashboard
bun install
bun run dev
```
