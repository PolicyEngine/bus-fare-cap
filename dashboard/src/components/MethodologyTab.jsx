"use client";

import SectionHeading from "./SectionHeading";

export default function MethodologyTab({ data }) {
  const src = data.sources || {};
  const weights = data.assumptions?.age_allocation_weights || {};
  const L = (s, text) =>
    s ? (
      <a href={s.url} target="_blank" rel="noreferrer" className="text-[color:var(--pe-color-primary-600)] underline">{text}</a>
    ) : (
      text
    );

  return (
    <div className="space-y-10">
      <SectionHeading
        title="Methodology"
        description="How the DfT evidence and PolicyEngine household microsimulation produce the estimate."
      />

      {/* One comprehensive method box */}
      <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 text-sm leading-6 text-slate-600">
        <div>
          <h3 className="font-semibold text-slate-900">1 · Official policy and fiscal figures</h3>
          <p>
            The {L(src.two_pound_announcement, "22 July 2026 government announcement")} is the
            source for the £2 cap, calendar-2027 dates, England-outside-London geography,
            participating-bus condition, £400m of extra funding backing the cap and £454m of total
            extra funding including devolved-government funding. The GOV.UK announcement does not
            publish a total scheme cost; {L(src.reported_scheme_cost, "contemporaneous ITV/PA reporting")}{" "}
            says the government expects it to exceed £500m, with the balance above the new funding
            coming from existing DfT bus allocations. The £3 cap it replaces was{" "}
            {L(src.current_fare_cap_policy, "funded through 31 March 2027")}. These figures are comparison
            benchmarks, not inputs to our estimate, and none is presented as England-only passenger savings.
          </p>
        </div>
        <div>
          <h3 className="font-semibold text-slate-900">2 · Household microsimulation</h3>
          <p>
            Household bus &amp; coach spending is imputed from the Living Costs and Food Survey in the
            PolicyEngine UK Enhanced FRS, calibrated to{" "}
            {L(src.dft_fare, "DfT's England-wide fare-receipts total")} and
            uprated by PolicyEngine to {data.projection_year_label}. Each household&apos;s fare is split
            across its members using a{" "}
            {src.nts_age_profile ? (
              <a href={src.nts_age_profile.url} target="_blank" rel="noreferrer" className="text-[color:var(--pe-color-primary-600)] underline">National Travel Survey bus-trips-by-age</a>
            ) : "National Travel Survey bus-trips-by-age"}{" "}
            profile adjusted for concessionary ages.
          </p>
          <div className="mt-3 flex flex-wrap gap-2 text-sm">
            {Object.entries(weights).map(([band, w]) => (
              <span key={band} className="rounded-lg bg-slate-100 px-3 py-1 text-slate-700">{band}: <strong>{w}</strong></span>
            ))}
          </div>
        </div>
        <div>
          <h3 className="font-semibold text-slate-900">3 · Costing the £2 cap</h3>
          <p>
            The estimate is projected fare spending of households resident in the eight English
            regions outside London ({data.reforms?.announced_2pound_cap?.baseline_fare_spending_bn ? `£${data.reforms.announced_2pound_cap.baseline_fare_spending_bn.toFixed(2)}bn` : "the policy-geography base"})
            multiplied by the 6.3% all-ticket reduction observed in{" "}
            {L(src.dft_two_pound_cap_evaluation, "DfT's evaluation of the previous £2 cap")}{" "}
            (average yield £1.49 → £1.40). Region, family-type and quintile averages
            divide each group&apos;s saving by all its households, including non-bus users; age-band
            averages are per person in the policy geography. The government&apos;s funding figures are
            not inputs. Treating passenger savings as fiscal cost assumes pound-for-pound operator
            reimbursement.
          </p>
        </div>
        <div>
          <h3 className="font-semibold text-slate-900">4 · Limitations</h3>
          <p>
            This is not a ticket-level model. The{" "}
            {L(src.dft_two_pound_cap_evaluation, "6.3% was measured against 2023 uncapped fares")},
            while the 2027 counterfactual is a £3 cap, so the true marginal reduction is likely
            smaller. Calibration is to the England total only — the London/outside-London split is
            not separately calibrated, and the model&apos;s London share is below{" "}
            {L(src.dft_journeys, "DfT's")}, which can overstate the outside-London base. Spending includes coach fares the cap does not cover;
            geography is where households live, not where journeys happen. Non-participating routes,
            local fares already at £2 or less, and induced demand are not modelled.
          </p>
        </div>
        <div>
          <h3 className="font-semibold text-slate-900">5 · Interpretation</h3>
          <p>
            The policy runs 1 January–31 December 2027, so results are calendar-2027, not fiscal-year.
            Family type is the benefit unit. Income quintiles fold household income deciles. People in
            fare-spending households are an exposure proxy, not confirmed beneficiaries.
          </p>
        </div>
      </div>

      {/* Sources — table */}
      <div>
        <SectionHeading title="Sources" size="lg" />
        <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-left text-slate-500">
                <th className="px-4 py-3">Value</th>
                <th className="px-4 py-3">What it is</th>
                <th className="px-4 py-3">Source</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(src).map(([key, s]) => (
                <tr key={key} className="border-b border-slate-100 align-top">
                  <td className="px-4 py-3 font-medium text-slate-900">{String(s.value)}</td>
                  <td className="px-4 py-3 text-slate-600">{s.description}</td>
                  <td className="px-4 py-3">
                    <a href={s.url} target="_blank" rel="noreferrer" className="text-[color:var(--pe-color-primary-600)] underline">link</a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
