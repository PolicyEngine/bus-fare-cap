"use client";

import { colors } from "../lib/colors";
import { formatPct } from "../lib/formatters";
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
  const findings = cap.distribution_findings;
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
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Stat
            label="Highest-income quintile exposure"
            value={formatPct(findings.q5_exposure_share * 100, 0)}
            sub="Our spending-based result. DfT trips point the other way: Q1 66 vs Q5 29 trips/person."
          />
          <Stat
            label="Lowest-income quintile exposure"
            value={formatPct(findings.q1_exposure_share * 100, 0)}
            sub="Our spending exposure is not bus usage or savings; see the DfT trip benchmark below."
          />
          <Stat
            label="Largest regional exposure"
            value={findings.top_region}
            sub={`${formatPct(findings.top_region_exposure_share * 100, 0)} of modelled exposure; DfT records 1.85bn journeys across the wider policy geography.`}
          />
          <Stat
            label="Regions represented"
            value={String(findings.regions_in_scope)}
            sub="Matches the government scope: England outside London."
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
              PolicyEngine shows the distribution of <strong>existing household bus and coach fare
              spending</strong> in English regions outside London. This is an exposure measure, not
              estimated savings: neither the Enhanced FRS nor the LCFS extract identifies individual
              tickets above £2, participating routes, or places already charging £2 or less. It
              therefore cannot reproduce the official cost or identify the number of beneficiaries.
              For context, DfT records 1.85bn passenger journeys in England outside London, and its
              NTS benchmark shows 66 trips per person in Q1 versus 29 in Q5. Those are usage measures,
              not like-for-like validations of household spending.
            </>
          }
        />
        <BreakdownChart breakdowns={cap.breakdowns} metric="Baseline fare exposure" color={colors.primary[400]} period={data.projection_year_label} defaultDimension="income_quintile" />
      </section>
    </div>
  );
}
