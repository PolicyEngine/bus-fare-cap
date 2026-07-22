"use client";

import { colors } from "../lib/colors";
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
  const cap = data.reforms.announced_2pound_cap;
  const householdEffect = cap.household_effect;
  const src = data.sources || {};
  const A = (s, text) => (s ? <a href={s.url} target="_blank" rel="noreferrer" className="underline">{text}</a> : text);

  return (
    <div className="space-y-10">
      <section>
        <SectionHeading
          title="Announced policy — £2 bus fare cap"
          description={
            <>
              From <strong>1 January to 31 December 2027</strong>, single fares are capped at £2 on{" "}
              <strong>participating buses in England outside London</strong>, cutting affected fares
              by up to one third from the existing £3 cap. Existing £3 funding was due to run through
              March 2027, so the announcement both lowers the cap early and extends it. {" "}
              {A(src.two_pound_announcement, "The government announcement")} says £400m of extra
              funding backs the cap and reports £454m of extra funding in total, including funding
              for devolved governments through the Barnett formula. It does not publish a total
              scheme cost. Detailed 2027 operator, route and reimbursement rules are not yet published.
            </>
          }
        />
        <div className="grid gap-4 sm:grid-cols-3">
          <Stat
            label="Estimated fiscal cost"
            value={`£${Math.round(cap.estimated_cost_bn * 1000)}m`}
            sub={<>Our static reimbursement proxy. {A(src.reported_scheme_cost, `Reported government estimate: >£${Math.round(cap.reported_scheme_cost_lower_bound_bn * 1000)}m.`)}</>}
          />
          <Stat
            label="Estimated average household effect"
            value={`£${householdEffect.annual_effect_average_gbp.toFixed(1)}/year`}
            sub="Modelled average across all households in England outside London."
          />
          <Stat
            label="Estimated people potentially affected"
            value={`${cap.people_potentially_affected_m.toFixed(1)}m`}
            sub="People in modelled fare-spending households."
          />
        </div>

        <details className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <summary className="cursor-pointer px-6 py-4 font-semibold text-slate-900">
            Policy details — what, who, where, when and how
          </summary>
          <div className="overflow-x-auto border-t border-slate-200">
            <table className="w-full text-left text-sm">
              <tbody className="divide-y divide-slate-100">
                <tr><th className="w-32 px-6 py-4 text-slate-900">What</th><td className="px-6 py-4 text-slate-600">£2 maximum for single bus tickets. Fares already at or below £2 do not fall.</td></tr>
                <tr><th className="px-6 py-4 text-slate-900">Who</th><td className="px-6 py-4 text-slate-600">Passengers buying single tickets on participating buses; cash savings arise where the fare would otherwise exceed £2.</td></tr>
                <tr><th className="px-6 py-4 text-slate-900">Where</th><td className="px-6 py-4 text-slate-600">Participating buses in all areas of England outside London. The 2027 operator and route list is not yet published.</td></tr>
                <tr><th className="px-6 py-4 text-slate-900">When</th><td className="px-6 py-4 text-slate-600">1 January–31 December 2027.</td></tr>
                <tr><th className="px-6 py-4 text-slate-900">How</th><td className="px-6 py-4 text-slate-600">Participation is confirmed, but detailed 2027 eligibility and reimbursement terms have not yet been published.</td></tr>
                <tr><th className="px-6 py-4 text-slate-900">Funding</th><td className="px-6 py-4 text-slate-600">£400m is the principal new funding source. The wider £454m includes funding for devolved governments through the Barnett formula. ITV/PA reports an expected total scheme cost above £500m, with the balance from existing DfT bus funding; the GOV.UK release does not state that total.</td></tr>
              </tbody>
            </table>
          </div>
        </details>
      </section>

      <section>
        <SectionHeading
          title="Who has bus-fare exposure in the policy geography?"
          description={
            <>
              PolicyEngine estimates household bus and coach fare spending in English regions outside
              London. We apply the <strong>6.3% reduction across all ticket types</strong> observed in
              DfT&apos;s evaluation of the previous £2 cap. Simulated spending determines the cost and
              distribution; the government&apos;s £400m cap funding is only a benchmark. The estimate is
              static and does not model individual ticket prices, participating routes or induced demand.
            </>
          }
        />
        <BreakdownChart
          breakdowns={cap.effect_breakdowns}
          metric="Total estimated benefit"
          color={colors.primary[400]}
          period={data.projection_year_label}
          defaultDimension="income_quintile"
          alternateMetric={{
            label: "Average household effect",
            breakdowns: cap.average_effect_breakdowns,
          }}
        />
      </section>
    </div>
  );
}
