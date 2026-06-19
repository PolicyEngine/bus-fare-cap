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

export default function ReformTab({ data }) {
  const u25 = data.reforms.free_under_25;
  const cap = data.reforms.fare_cap_1pound;
  const capData = cap.sensitivity.map((s) => ({
    label: `${Math.round(s.fare_reduction * 100)}% cut`,
    cost_bn: s.cost_bn,
  }));

  return (
    <div className="space-y-12">
      {/* Reform 1 — free under-25s */}
      <section>
        <SectionHeading
          title="Reform 1 — Free buses for under-25s"
          description="Government meets the bus & coach fares of everyone under 25 (a full subsidy for that group), to help young people reach training and work."
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <Stat label="Fiscal cost (static)" value={formatBn(u25.cost_bn)} sub="per year, pre-behavioural" />
          <Stat label="Eligibility" value={`Under ${u25.age_limit}`} sub={`${formatPct(data.baseline.under_25_share * 100, 0)} of UK bus fares`} />
        </div>
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6">
          <h3 className="mb-4 text-sm font-semibold text-slate-700">Cost by region (£bn/yr)</h3>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={u25.by_region} margin={{ left: 8, right: 16, top: 8, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={colors.border.light} />
              <XAxis dataKey="region" angle={-35} textAnchor="end" interval={0} height={70} tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip formatter={(v) => formatBn(v)} />
              <Bar dataKey="cost_bn" radius={[4, 4, 0, 0]}>
                {u25.by_region.map((_, i) => (
                  <Cell key={i} fill={colors.primary[500]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Reform 2 — £1 cap */}
      <section>
        <SectionHeading
          title="Reform 2 — £1 bus fare cap"
          description="A universal £1 per-trip cap for all passengers. The dataset records annual fare £, not per-trip fares, so the cap is approximated as a fare-reduction fraction — treat as order-of-magnitude until NTS trips are added."
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <Stat label="Central cost" value={formatBn(cap.central_cost_bn)} sub="per year, at a 30% fare reduction" />
          <Stat label="Range" value={`${formatBn(cap.sensitivity[0].cost_bn)} – ${formatBn(cap.sensitivity[cap.sensitivity.length - 1].cost_bn)}`} sub="20–40% fare reduction" />
        </div>
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6">
          <h3 className="mb-4 text-sm font-semibold text-slate-700">Cost by assumed fare reduction (£bn/yr)</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={capData} margin={{ left: 8, right: 16, top: 8, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={colors.border.light} />
              <XAxis dataKey="label" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip formatter={(v) => formatBn(v)} />
              <Bar dataKey="cost_bn" radius={[4, 4, 0, 0]}>
                {capData.map((_, i) => (
                  <Cell key={i} fill={colors.primary[400]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <p className="rounded-2xl border border-amber-400 bg-amber-50 p-5 text-sm leading-6 text-amber-700">
        <strong>Static estimates.</strong> {data.methods.behaviour}
      </p>
    </div>
  );
}
