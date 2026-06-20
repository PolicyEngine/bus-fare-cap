"use client";

import { colors } from "../lib/colors";
import BreakdownChart from "./BreakdownChart";
import SectionHeading from "./SectionHeading";

function Stat({ label, value, sub, compare, compareFmt }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6">
      <div className="text-sm text-slate-500">{label}</div>
      <div className="mt-1 text-3xl font-semibold text-slate-900">{value}</div>
      {sub ? <div className="mt-1 text-sm text-slate-500">{sub}</div> : null}
      {compare ? (
        <div className="mt-3 border-t border-slate-100 pt-2 text-xs leading-5 text-slate-500">
{compare.kind === "Independent check" ? "independent check" : "2025 calibration anchor"}: {compareFmt(compare.official)} —{" "}
          <a href={compare.url} target="_blank" rel="noreferrer" className="text-[color:var(--pe-color-primary-600)] underline" title={compare.official_label}>
            {compare.official_label.split(":")[0]}
          </a>
        </div>
      ) : null}
    </div>
  );
}

export default function BaselineTab({ data }) {
  const b = data.baseline;
  const c = b.official_comparison || {};
  const bn = (v) => `£${Number(v).toFixed(1)}bn`;
  const m = (v) => `${Number(v).toFixed(1)}m`;

  return (
    <div className="space-y-10">
      <SectionHeading
        title={`Projected baseline — bus fares and the population, ${data.fiscal_year_label}`}
        description={`Household bus & coach fares (imputed from the LCFS, calibrated to DfT totals), government bus subsidy, and population in the PolicyEngine UK Enhanced FRS, projected to ${data.fiscal_year_label}. Fares are calibrated to DfT statistics for the year ending March 2025 (largely under the older £2 cap) and uplifted from England local-bus figures, so they reflect observed fares then — they do not explicitly model the £3 cap or 2027-28 policy. The chart allocates fares to people by an NTS age profile (concessionary-adjusted), then sums by the selected dimension. Figures are illustrative.`}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Passenger fares paid" value={bn(b.total_bus_fare_bn)} sub={`${data.fiscal_year_label}, UK households`} compare={c.total_bus_fare_bn} compareFmt={bn} />
        <Stat label="Government bus subsidy" value={bn(b.total_bus_subsidy_bn)} sub="benefit-in-kind to households" compare={c.total_bus_subsidy_bn} compareFmt={bn} />
        <Stat label="Population" value={m(b.population_m)} sub="people" compare={c.population_m} compareFmt={m} />
        <Stat
          label="Under-25s"
          value={m(b.under_25_people_m)}
          sub="people"
          compare={{
            kind: "Independent check",
            official: 20.1,
            official_label: "ONS UK mid-2023, aged 0–24 ≈20.1m",
            url: "https://www.ons.gov.uk/peoplepopulationandcommunity/populationandmigration/populationestimates",
          }}
          compareFmt={m}
        />
      </div>

      <BreakdownChart breakdowns={b.breakdowns} metric="Fares" color={colors.primary[500]} period={data.fiscal_year_label} />
    </div>
  );
}
