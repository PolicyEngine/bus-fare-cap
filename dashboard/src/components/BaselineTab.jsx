"use client";

import { colors } from "../lib/colors";
import { formatBn, formatPct } from "../lib/formatters";
import BreakdownChart from "./BreakdownChart";
import SectionHeading from "./SectionHeading";

function Stat({ label, value, sub }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6">
      <div className="text-sm text-slate-500">{label}</div>
      <div className="mt-1 text-3xl font-semibold text-slate-900">{value}</div>
      {sub ? <div className="mt-1 text-sm text-slate-500">{sub}</div> : null}
    </div>
  );
}

const COMPARE_LABELS = {
  total_bus_fare_bn: ["Passenger bus fares", "bn"],
  total_bus_subsidy_bn: ["Government bus subsidy", "bn"],
  population_m: ["Population", "m"],
};

export default function BaselineTab({ data }) {
  const b = data.baseline;
  const cmp = b.official_comparison || {};

  return (
    <div className="space-y-10">
      <SectionHeading
        title="Baseline — bus fares and the population today"
        description={`Household bus & coach fares (imputed from the LCFS, calibrated to DfT totals), government bus subsidy, and population in the PolicyEngine UK Enhanced FRS, ${data.fiscal_year_label}.`}
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="Passenger fares paid" value={formatBn(b.total_bus_fare_bn)} sub="per year (UK households)" />
        <Stat label="Government bus subsidy" value={formatBn(b.total_bus_subsidy_bn)} sub="benefit-in-kind to households" />
        <Stat label="Fares paid by under-25s" value={formatBn(b.under_25_fare_bn)} sub={`${formatPct(b.under_25_share * 100, 0)} of all fares`} />
        <Stat label="Population" value={`${b.population_m.toFixed(1)}m`} sub="people (weighted)" />
        <Stat label="Under-25s" value={`${b.under_25_people_m.toFixed(1)}m`} sub="people" />
        <Stat label="Bus fare-payers" value={`${b.fare_paying_people_m.toFixed(1)}m`} sub="people in fare-paying households" />
      </div>

      {/* Comparison with official statistics — honest about what's a target vs a check */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <h3 className="mb-1 text-base font-semibold text-slate-900">Comparison with official statistics</h3>
        <p className="mb-4 text-sm leading-6 text-slate-500">
          Fares and subsidy are <strong>calibration targets</strong> — the dataset is forced to hit
          them, so they match by construction (not an independent test). Population is an{" "}
          <strong>independent check</strong>: it is not calibrated here, and comes out slightly above
          the ONS figure.
        </p>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left text-slate-500">
              <th className="py-2">Measure</th>
              <th className="py-2">Type</th>
              <th className="py-2 text-right">This model</th>
              <th className="py-2 text-right">Official</th>
              <th className="py-2">Source</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(cmp).map(([key, c]) => {
              const [label, unit] = COMPARE_LABELS[key] || [key, ""];
              const fmt = (v) => (unit === "bn" ? formatBn(v) : `${v}m`);
              return (
                <tr key={key} className="border-b border-slate-100">
                  <td className="py-2 text-slate-700">{label}</td>
                  <td className="py-2">
                    <span className={`rounded-md px-2 py-0.5 text-xs ${c.kind === "Independent check" ? "bg-primary-100 text-[color:var(--pe-color-primary-700)]" : "bg-slate-100 text-slate-500"}`}>
                      {c.kind}
                    </span>
                  </td>
                  <td className="py-2 text-right tabular-nums">{fmt(c.ours)}</td>
                  <td className="py-2 text-right tabular-nums text-slate-500">{fmt(c.official)}</td>
                  <td className="py-2 text-xs text-slate-500">
                    {c.official_label}{" "}
                    <a href={c.url} target="_blank" rel="noreferrer" className="text-[color:var(--pe-color-primary-600)] underline">link</a>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Merged: fares by dimension with a toggle */}
      <BreakdownChart breakdowns={b.breakdowns} metric="Fares" color={colors.primary[500]} />
      <p className="-mt-6 text-xs text-slate-500">
        Bus fares allocated to people by an NTS age profile (concessionary-adjusted), then summed by
        the selected dimension.
      </p>
    </div>
  );
}
