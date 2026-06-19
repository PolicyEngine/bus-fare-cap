"use client";

import { useState } from "react";
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

const DIMENSIONS = [
  { id: "region", label: "Region" },
  { id: "household_type", label: "Household type" },
  { id: "age_band", label: "Age" },
  { id: "income_quintile", label: "Income quintile" },
  { id: "income_quartile", label: "Income quartile" },
];

function Stat({ label, value, sub }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6">
      <div className="text-sm text-slate-500">{label}</div>
      <div className="mt-1 text-3xl font-semibold text-slate-900">{value}</div>
      {sub ? <div className="mt-1 text-sm text-slate-500">{sub}</div> : null}
    </div>
  );
}

function BreakdownChart({ breakdowns, color }) {
  const [dim, setDim] = useState("region");
  const rows = breakdowns[dim] || [];
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-sm font-semibold text-slate-700">Cost by {DIMENSIONS.find((d) => d.id === dim).label.toLowerCase()} (£bn/yr)</h3>
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

export default function ReformTab({ data }) {
  const u25 = data.reforms.free_under_25;
  const cap = data.reforms.fare_cap_1pound;
  const src = data.sources || {};

  return (
    <div className="space-y-14">
      {/* What is this policy change */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6">
        <SectionHeading title="What these policies change" />
        <div className="space-y-3 text-sm leading-6 text-slate-600">
          <p>
            <strong>£1 bus fare cap.</strong> A universal cap of £1 on single bus &amp; coach fares.
            England already runs a national fare cap{src.fare_cap_policy ? (
              <> (<a href={src.fare_cap_policy.url} target="_blank" rel="noreferrer" className="underline">£2 from 2023, raised to £3 for 2025–27</a>)</>
            ) : ""}; a £1 cap would cut fares further for every fare-paying passenger.
          </p>
          <p>
            <strong>Free buses for under-25s.</strong> Removes fares entirely for everyone under 25,
            to cut the cost of reaching college, apprenticeships and work — extending the idea of{" "}
            {src.scotland_under_22 ? (
              <a href={src.scotland_under_22.url} target="_blank" rel="noreferrer" className="underline">Scotland&apos;s under-22 free bus scheme</a>
            ) : "Scotland's under-22 free bus scheme"}. For comparison, the{" "}
            {src.cpt_under22_estimate ? (
              <a href={src.cpt_under22_estimate.url} target="_blank" rel="noreferrer" className="underline">Confederation of Passenger Transport estimates a £1 under-22 fare at £100–150m/yr</a>
            ) : "Confederation of Passenger Transport estimates a £1 under-22 fare at £100–150m/yr"}.
          </p>
        </div>
      </section>

      {/* Reform 1 */}
      <section>
        <SectionHeading title="Reform 1 — Free buses for under-25s"
          description="Government meets the bus & coach fares of everyone under 25 (a full subsidy for that group)." />
        <div className="grid gap-4 sm:grid-cols-2">
          <Stat label="Fiscal cost" value={formatBn(u25.cost_bn)} sub="per year" />
          <Stat label="People affected" value={`${u25.people_affected_m.toFixed(1)}m`} sub={`under-25 bus users · ${formatPct(data.baseline.under_25_share * 100, 0)} of fares`} />
        </div>
        <div className="mt-6"><BreakdownChart breakdowns={u25.breakdowns} color={colors.primary[500]} /></div>
      </section>

      {/* Reform 2 */}
      <section>
        <SectionHeading title="Reform 2 — £1 bus fare cap"
          description="A universal £1 per-trip cap for all passengers." />
        <div className="grid gap-4 sm:grid-cols-3">
          <Stat label="Central cost" value={formatBn(cap.central_cost_bn)} sub="at a 30% fare reduction" />
          <Stat label="Range" value={`${formatBn(cap.sensitivity[0].cost_bn)} – ${formatBn(cap.sensitivity[cap.sensitivity.length - 1].cost_bn)}`} sub="20–40% reduction" />
          <Stat label="People affected" value={`${cap.people_affected_m.toFixed(1)}m`} sub="bus fare-payers" />
        </div>
        <div className="mt-6"><BreakdownChart breakdowns={cap.breakdowns} color={colors.primary[400]} /></div>
      </section>

      {/* Assumptions */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6">
        <SectionHeading title="Assumptions" />
        <ul className="list-disc space-y-2 pl-5 text-sm leading-6 text-slate-600">
          <li><strong>Static.</strong> No behavioural response. Lower or zero fares induce extra trips (Scotland&apos;s under-22 scheme saw large uptake), which would raise both ridership and cost — so these are lower-bound mechanical costs.</li>
          <li><strong>£1 cap is approximate.</strong> The data records annual fare spend, not per-trip fares, so the cap is modelled as a 20–40% fare reduction; firming it up needs NTS trips-per-person.</li>
          <li><strong>Age allocation is modelled.</strong> Household fares are split to people by an NTS bus-trips-by-age profile (concessionary-adjusted) — the per-person split is estimated, not observed (LCFS records fares at household level).</li>
          <li><strong>UK figures.</strong> Fares are calibrated to DfT England totals uplifted to the UK by population (~1.18).</li>
        </ul>
      </section>
    </div>
  );
}
