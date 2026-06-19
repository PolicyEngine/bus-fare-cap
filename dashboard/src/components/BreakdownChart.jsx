"use client";

import { useState } from "react";
import {
  Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import { colors } from "../lib/colors";
import { formatBn } from "../lib/formatters";

const DIMENSIONS = [
  { id: "region", label: "Region" },
  { id: "household_type", label: "Household type" },
  { id: "age_band", label: "Age" },
  { id: "income_quintile", label: "Income quintile" },
  { id: "income_quartile", label: "Income quartile" },
];

export default function BreakdownChart({ breakdowns, metric = "Cost", color = colors.primary[500] }) {
  const [dim, setDim] = useState("region");
  // Drop empty categories (e.g. the 25+ age bands under the under-25 reform,
  // which carry £0) so the chart only shows bands with cost.
  const rows = (breakdowns[dim] || []).filter((r) => r.cost_bn > 0);
  const dimLabel = DIMENSIONS.find((d) => d.id === dim).label.toLowerCase();
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-sm font-semibold text-slate-700">{metric} by {dimLabel} (£bn/yr)</h3>
        <div className="flex flex-wrap gap-1">
          {DIMENSIONS.map((d) => (
            <button
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
          <Tooltip formatter={(v) => formatBn(v)} />
          <Bar dataKey="cost_bn" radius={[4, 4, 0, 0]}>
            {rows.map((_, i) => <Cell key={i} fill={color} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
