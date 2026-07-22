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
              From <strong>1 January to 31 December 2027</strong>, the maximum single fare falls
              from £3 to £2 on <strong>participating bus services in England outside London</strong>.{" "}
              {A(src.two_pound_announcement, "The government announcement")} says the scheme will
              cost more than £500m and identifies £454m of new funding. Scotland, Wales and Northern
              Ireland are not automatically covered; the funding package allows their governments
              to take similar action. Detailed 2027 operator participation and reimbursement rules
              have not yet been published.
            </>
          }
        />
        <div className="grid gap-4 sm:grid-cols-3">
          <Stat
            label="Estimated fiscal cost"
            value={`£${Math.round(cap.estimated_cost_bn * 1000)}m`}
            sub="Our static microsimulation. Government benchmark: >£500m."
          />
          <Stat
            label="Estimated middle-income household effect"
            value={`£${householdEffect.annual_effect_average_gbp.toFixed(2)}/year`}
            sub="Modelled Q3 average across England outside London."
          />
          <Stat
            label="Estimated people potentially affected"
            value={`${cap.people_potentially_affected_m.toFixed(2)}m`}
            sub="People in modelled fare-spending households; government benchmark: millions benefit."
          />
        </div>

        <details className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <summary className="cursor-pointer px-6 py-4 font-semibold text-slate-900">
            Policy details — what, who, where, when and how
          </summary>
          <div className="overflow-x-auto border-t border-slate-200">
            <table className="w-full text-left text-sm">
              <tbody className="divide-y divide-slate-100">
                <tr><th className="w-32 px-6 py-4 text-slate-900">What</th><td className="px-6 py-4 text-slate-600">Maximum participating single fare falls from £3 to £2.</td></tr>
                <tr><th className="px-6 py-4 text-slate-900">Who</th><td className="px-6 py-4 text-slate-600">Passengers whose eligible single fare would otherwise exceed £2. The number of beneficiaries has not been published.</td></tr>
                <tr><th className="px-6 py-4 text-slate-900">Where</th><td className="px-6 py-4 text-slate-600">Participating bus services in England outside London. Devolved governments may take similar action.</td></tr>
                <tr><th className="px-6 py-4 text-slate-900">When</th><td className="px-6 py-4 text-slate-600">1 January–31 December 2027.</td></tr>
                <tr><th className="px-6 py-4 text-slate-900">How</th><td className="px-6 py-4 text-slate-600">Government reimburses participating operators under rules still to be published.</td></tr>
                <tr><th className="px-6 py-4 text-slate-900">Funding</th><td className="px-6 py-4 text-slate-600">Official scheme cost is more than £500m, including £454m of newly announced funding.</td></tr>
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
              distribution; the government&apos;s &gt;£500m figure is only a benchmark. The estimate is
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
