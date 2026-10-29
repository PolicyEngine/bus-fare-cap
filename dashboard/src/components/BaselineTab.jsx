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
{compare.kind === "Independent check" ? "independent check" : "2024-25 benchmark"}: {compareFmt(compare.official)} —{" "}
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
        title={`Projected baseline — bus fares and population, ${data.projection_year_label}`}
        description={`UK bus fares, government bus subsidy and population in the ${data.dataset || "PolicyEngine Microcosm UK dataset"}, ${data.projection_year_label}, with the £3 cap held in force all year (the counterfactual the estimate is measured against). Fares price each person's imputed local-bus trips at DfT receipts per fare-paying boarding; concessionary pass holders pay nothing. DfT figures for the year ending March 2025 are shown as benchmarks.`}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Stat label="Passenger fares paid" value={bn(b.total_bus_fare_bn)} sub={`${data.projection_year_label}, UK households`} compare={c.total_bus_fare_bn} compareFmt={bn} />
        <Stat label="Government bus subsidy" value={bn(b.total_bus_subsidy_bn)} sub="benefit-in-kind to households" compare={c.total_bus_subsidy_bn} compareFmt={bn} />
        <Stat
          label="With modelled fare spending"
          value={m(b.fare_paying_people_m)}
          sub="people with modelled fare spending; exposure proxy"
        />
      </div>

      <BreakdownChart breakdowns={b.breakdowns} metric="Fares" color={colors.primary[500]} period={data.projection_year_label} />
    </div>
  );
}
