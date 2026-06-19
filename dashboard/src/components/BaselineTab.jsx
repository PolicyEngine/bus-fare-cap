"use client";

import { colors } from "../lib/colors";
import { formatBn, formatPct } from "../lib/formatters";
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
          <span className={`mr-1 rounded px-1.5 py-0.5 ${compare.kind === "Independent check" ? "bg-primary-100 text-[color:var(--pe-color-primary-700)]" : "bg-slate-100 text-slate-500"}`}>
            {compare.kind}
          </span>
          official {compareFmt(compare.official)} —{" "}
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
  const bn = (v) => formatBn(v);
  const m = (v) => `${v}m`;

  return (
    <div className="space-y-10">
      <SectionHeading
        title="Baseline — bus fares and the population today"
        description={`Household bus & coach fares (imputed from the LCFS, calibrated to DfT totals), government bus subsidy, and population in the PolicyEngine UK Enhanced FRS, ${data.fiscal_year_label}. Where an official anchor exists it is shown on the card — fares and subsidy are calibration targets (match by construction), population is an independent check.`}
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="Passenger fares paid" value={formatBn(b.total_bus_fare_bn)} sub="per year (UK households)" compare={c.total_bus_fare_bn} compareFmt={bn} />
        <Stat label="Government bus subsidy" value={formatBn(b.total_bus_subsidy_bn)} sub="benefit-in-kind to households" compare={c.total_bus_subsidy_bn} compareFmt={bn} />
        <Stat label="Fares paid by under-25s" value={formatBn(b.under_25_fare_bn)} sub={`${formatPct(b.under_25_share * 100, 0)} of all fares`} />
        <Stat label="Population" value={`${b.population_m.toFixed(1)}m`} sub="people (weighted)" compare={c.population_m} compareFmt={m} />
        <Stat label="Under-25s" value={`${b.under_25_people_m.toFixed(1)}m`} sub="people" />
        <Stat label="Bus fare-payers" value={`${b.fare_paying_people_m.toFixed(1)}m`} sub="people in fare-paying households" />
      </div>

      <BreakdownChart breakdowns={b.breakdowns} metric="Fares" color={colors.primary[500]} />
      <p className="-mt-6 text-xs text-slate-500">
        Bus fares allocated to people by an NTS age profile (concessionary-adjusted), then summed by
        the selected dimension.
      </p>
    </div>
  );
}
