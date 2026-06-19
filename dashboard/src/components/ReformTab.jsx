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

export default function ReformTab({ data }) {
  const u25 = data.reforms.free_under_25;
  const cap = data.reforms.fare_cap_1pound;
  const src = data.sources || {};
  const A = (s, text) => (s ? <a href={s.url} target="_blank" rel="noreferrer" className="underline">{text}</a> : text);

  return (
    <div className="space-y-14">
      {/* Reform 1 */}
      <section>
        <SectionHeading
          title="Reform 1 — Free buses for under-25s"
          description={
            <>
              Removes bus &amp; coach fares entirely for everyone under 25, to cut the cost of
              reaching college, apprenticeships and work — extending the idea of{" "}
              {A(src.scotland_under_22, "Scotland's under-22 free bus scheme")}. Fiscal cost = the
              fares government would now meet. For comparison, the{" "}
              {A(src.cpt_under22_estimate, "Confederation of Passenger Transport estimates a £1 under-22 fare at £100–150m/yr")}.
            </>
          }
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <Stat label="Fiscal cost" value={formatBn(u25.cost_bn)} sub="per year (static)" />
          <Stat label="People affected" value={`${u25.people_affected_m.toFixed(1)}m`} sub={`under-25 bus users · ${formatPct(data.baseline.under_25_share * 100, 0)} of fares`} />
        </div>
        <div className="mt-6"><BreakdownChart breakdowns={u25.breakdowns} metric="Cost" color={colors.primary[500]} /></div>
        <p className="mt-3 text-xs leading-5 text-slate-500">
          Static (no induced demand — lower fares would add trips and cost, so this is a lower bound).
          The per-person split uses an NTS age profile, so under-25 attribution is modelled, not observed.
        </p>
      </section>

      {/* Reform 2 */}
      <section>
        <SectionHeading
          title="Reform 2 — £1 bus fare cap"
          description={
            <>
              A universal £1 cap on single bus &amp; coach fares. England already runs a{" "}
              {A(src.fare_cap_policy, "national fare cap (£2 from 2023, £3 for 2025–27)")}; a £1 cap
              would cut fares further for every fare-paying passenger.
            </>
          }
        />
        <div className="grid gap-4 sm:grid-cols-3">
          <Stat label="Central cost" value={formatBn(cap.central_cost_bn)} sub="at a 30% fare reduction" />
          <Stat label="Range" value={`${formatBn(cap.sensitivity[0].cost_bn)} – ${formatBn(cap.sensitivity[cap.sensitivity.length - 1].cost_bn)}`} sub="20–40% reduction" />
          <Stat label="People affected" value={`${cap.people_affected_m.toFixed(1)}m`} sub="bus fare-payers" />
        </div>
        <div className="mt-6"><BreakdownChart breakdowns={cap.breakdowns} metric="Cost" color={colors.primary[400]} /></div>
        <p className="mt-3 text-xs leading-5 text-slate-500">
          Approximate: the data records annual fare spend, not per-trip fares, so the cap is modelled
          as a 20–40% fare reduction (central 30%); firming it up needs NTS trips-per-person. Static.
        </p>
      </section>
    </div>
  );
}
