"use client";

import { useState } from "react";
import {
  Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import { colors } from "../lib/colors";
import { formatBn } from "../lib/formatters";

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
    : (breakdowns[dim] || []).filter((r) => r.cost_bn > 0);
  const dimLabel = DIMENSIONS.find((d) => d.id === dim).label.toLowerCase();
  const chartMetric = showAlternate
    ? dim === "age_band" ? "Average person effect" : alternateMetric.label
    : metric;
  const unit = showAlternate ? "£/year" : "£bn";
  const dataKey = showAlternate ? "annual_effect_gbp" : "cost_bn";
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6">
      {alternateMetric ? (
        <div className="mb-5 grid w-full max-w-xl grid-cols-2 rounded-xl border border-slate-200 bg-slate-50 p-1">
          <button type="button" aria-pressed={metricView === "primary"} onClick={() => setMetricView("primary")} className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${metricView === "primary" ? "bg-[color:var(--pe-color-primary-600)] text-white shadow-sm" : "text-slate-600 hover:bg-slate-100"}`}>Total estimated benefit</button>
          <button type="button" aria-pressed={metricView === "alternate"} onClick={() => setMetricView("alternate")} className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${metricView === "alternate" ? "bg-[color:var(--pe-color-primary-600)] text-white shadow-sm" : "text-slate-600 hover:bg-slate-100"}`}>Average household effect</button>
        </div>
      ) : null}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-sm font-semibold text-slate-700">{chartMetric} by {dimLabel} ({unit}{period ? `, ${period}` : ""})</h3>
        <div className="flex flex-wrap gap-1">
          {DIMENSIONS.map((d) => (
            <button
              type="button"
              key={d.id}
              onClick={() => setDim(d.id)}
              className={`rounded-lg px-3 py-1 text-xs font-medium transition-colors ${dim === d.id ? "bg-[color:var(--pe-color-primary-600)] text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
            >
              {d.label}
            </button>
          ))}
        </div>
      </div>
      <ResponsiveContainer width="100%" height={320}>
        <BarChart data={rows} margin={{ left: 8, right: 16, top: 8, bottom: 64 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={colors.border.light} />
          <XAxis dataKey="group" angle={-30} textAnchor="end" interval={0} height={72} tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip formatter={(v) => showAlternate ? `£${Number(v).toFixed(2)}` : formatBn(v)} />
          <Bar dataKey={dataKey} radius={[4, 4, 0, 0]}>
            {rows.map((_, i) => <Cell key={i} fill={color} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
