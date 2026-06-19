"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
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

export default function BaselineTab({ data }) {
  const b = data.baseline;
  return (
    <div className="space-y-10">
      <SectionHeading
        title="Baseline — bus fares and subsidy today"
        description={`Household bus & coach fares (imputed from the LCFS, calibrated to DfT totals) and government bus subsidy in the PolicyEngine UK Enhanced FRS, ${data.fiscal_year_label}.`}
      />
      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="Passenger fares paid" value={formatBn(b.total_bus_fare_bn)} sub="per year (UK households)" />
        <Stat label="Government bus subsidy" value={formatBn(b.total_bus_subsidy_bn)} sub="benefit-in-kind to households" />
        <Stat label="Fares paid by under-25s" value={formatBn(b.under_25_fare_bn)} sub={`${formatPct(b.under_25_share * 100, 0)} of all fares`} />
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <h3 className="mb-4 text-sm font-semibold text-slate-700">Bus fares by age band (£bn/yr)</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={b.by_age_band} margin={{ left: 8, right: 16, top: 8, bottom: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={colors.border.light} />
            <XAxis dataKey="band" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip formatter={(v) => formatBn(v)} />
            <Bar dataKey="fare_bn" radius={[4, 4, 0, 0]}>
              {b.by_age_band.map((row, i) => (
                <Cell key={i} fill={row.band === "16-24" || row.band === "0-15" ? colors.primary[600] : colors.primary[300]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <p className="mt-3 text-xs text-slate-500">
          Allocated by an NTS age profile (concessionary-adjusted). Under-25 bands highlighted.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <h3 className="mb-4 text-sm font-semibold text-slate-700">Bus fares by region (£bn/yr)</h3>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left text-slate-500">
              <th className="py-2">Region</th>
              <th className="py-2 text-right">Total fares</th>
              <th className="py-2 text-right">Under-25 fares</th>
            </tr>
          </thead>
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
