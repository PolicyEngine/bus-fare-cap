"use client";

import {
  Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import { colors } from "../lib/colors";
import { formatBn, formatPct } from "../lib/formatters";
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

      {/* Comparison with official statistics */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <h3 className="mb-1 text-base font-semibold text-slate-900">Comparison with official statistics</h3>
        <p className="mb-4 text-sm text-slate-500">Calibrated figures should match the official anchors closely.</p>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left text-slate-500">
              <th className="py-2">Measure</th>
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

      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <h3 className="mb-4 text-sm font-semibold text-slate-700">Bus fares and people by age band</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={b.by_age_band} margin={{ left: 8, right: 16, top: 8, bottom: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={colors.border.light} />
            <XAxis dataKey="band" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip formatter={(v, n) => (n === "fare_bn" ? formatBn(v) : `${v}m people`)} />
            <Bar dataKey="fare_bn" name="fare_bn" radius={[4, 4, 0, 0]}>
              {b.by_age_band.map((row, i) => (
                <Cell key={i} fill={row.band === "16-24" || row.band === "0-15" ? colors.primary[600] : colors.primary[300]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <table className="mt-4 w-full text-sm">
          <thead><tr className="border-b border-slate-200 text-left text-slate-500"><th className="py-1">Age band</th><th className="py-1 text-right">Fares</th><th className="py-1 text-right">People</th></tr></thead>
          <tbody>
            {b.by_age_band.map((r) => (
              <tr key={r.band} className="border-b border-slate-100">
                <td className="py-1 text-slate-700">{r.band}</td>
                <td className="py-1 text-right tabular-nums">{formatBn(r.fare_bn)}</td>
                <td className="py-1 text-right tabular-nums text-slate-500">{r.people_m.toFixed(1)}m</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="mt-3 text-xs text-slate-500">Fares allocated by an NTS age profile (concessionary-adjusted); under-25 bands highlighted.</p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <h3 className="mb-4 text-sm font-semibold text-slate-700">Bus fares by region (£bn/yr)</h3>
        <table className="w-full text-sm">
          <thead><tr className="border-b border-slate-200 text-left text-slate-500"><th className="py-2">Region</th><th className="py-2 text-right">Total fares</th><th className="py-2 text-right">Under-25 fares</th></tr></thead>
          <tbody>
            {b.by_region.map((r) => (
              <tr key={r.region} className="border-b border-slate-100">
                <td className="py-2 text-slate-700">{r.region}</td>
                <td className="py-2 text-right tabular-nums">{formatBn(r.fare_bn)}</td>
                <td className="py-2 text-right tabular-nums text-slate-500">{formatBn(r.under25_fare_bn)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
