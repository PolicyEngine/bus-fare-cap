"use client";

import { useState } from "react";
import {
  Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import { colors } from "../lib/colors";
import { formatMn } from "../lib/formatters";

const DIMENSIONS = [
  { id: "region", label: "Region" },
  { id: "household_type", label: "Family type" },
  { id: "age_band", label: "Age" },
  { id: "income_quintile", label: "Income quintile" },
];

export default function BreakdownChart({ breakdowns, metric = "Cost", color = colors.primary[500], period, defaultDimension = "region", alternateMetric = null }) {
  const [dim, setDim] = useState(defaultDimension);
  const [metricView, setMetricView] = useState("primary");
  const showAlternate = metricView === "alternate" && alternateMetric;
  // Drop empty categories so the chart only shows groups with exposure.
  const rows = showAlternate
    ? (alternateMetric.breakdowns[dim] || []).filter((r) => r.annual_effect_gbp > 0)
    : (breakdowns[dim] || [])
        .filter((r) => r.cost_bn > 0)
        // Results are stored in £bn; the chart reads better in £m at this scale.
        .map((r) => ({ ...r, cost_m: r.cost_bn * 1000 }));
  const dimLabel = DIMENSIONS.find((d) => d.id === dim).label.toLowerCase();
  const chartMetric = showAlternate
    ? dim === "age_band" ? "Average person effect" : alternateMetric.label
    : metric;
  const unit = showAlternate ? "£/year" : "£m";
  const dataKey = showAlternate ? "annual_effect_gbp" : "cost_m";
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6">
      <div className="mb-5 grid gap-3 sm:grid-cols-2">
        {alternateMetric ? (
          <label className="min-w-0">
            <span className="mb-1 block text-xs font-medium text-slate-500">Measure</span>
            <select
              value={metricView}
              onChange={(event) => setMetricView(event.target.value)}
              className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 outline-none transition-colors focus:border-[color:var(--pe-color-primary-500)] focus:ring-2 focus:ring-[color:var(--pe-color-primary-100)]"
            >
              <option value="primary">Total estimated benefit</option>
              <option value="alternate">Average household effect</option>
            </select>
          </label>
        ) : null}
        <label className="min-w-0">
          <span className="mb-1 block text-xs font-medium text-slate-500">Breakdown</span>
          <select
            value={dim}
            onChange={(event) => setDim(event.target.value)}
            className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 outline-none transition-colors focus:border-[color:var(--pe-color-primary-500)] focus:ring-2 focus:ring-[color:var(--pe-color-primary-100)]"
          >
            {DIMENSIONS.map((d) => <option key={d.id} value={d.id}>{d.label}</option>)}
          </select>
        </label>
      </div>
      <h3 className="mb-4 text-sm font-semibold text-slate-700">{chartMetric} by {dimLabel} ({unit}{period ? `, ${period}` : ""})</h3>
      <ResponsiveContainer width="100%" height={320}>
        <BarChart data={rows} margin={{ left: 8, right: 16, top: 8, bottom: 64 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={colors.border.light} />
          <XAxis dataKey="group" angle={-30} textAnchor="end" interval={0} height={72} tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip formatter={(v) => showAlternate ? `£${Number(v).toFixed(2)}` : formatMn(v)} />
          <Bar dataKey={dataKey} radius={[4, 4, 0, 0]}>
            {rows.map((_, i) => <Cell key={i} fill={color} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
