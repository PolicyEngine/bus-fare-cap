"use client";

import SectionHeading from "./SectionHeading";

export default function MethodologyTab({ data }) {
  const src = data.sources || {};
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
            participating-bus condition and the funding figures: the cap is backed by £400m of extra
            funding, within £454m of extra funding in total that comes from reprioritising the DESNZ
            budget and includes money for devolved governments. Devolved governments receive Barnett
            consequentials &ldquo;in the usual way&rdquo;, but no amount is published for them, so the
            England / devolved split of the £454m is not stated. Nor is a total scheme cost:{" "}
            {L(src.reported_scheme_cost, "contemporaneous PA reporting")} says the government expects
            it to exceed £500m, with the balance from existing DfT bus allocations. The £3 cap it
            replaces was {L(src.current_fare_cap_policy, "funded through 31 March 2027")}. All of
            these are comparison benchmarks, never inputs to our estimate.
          </p>
        </div>
        <div>
          <h3 className="font-semibold text-slate-900">2 · Household microsimulation</h3>
          <p>
            Fare spending comes from the {data.dataset || "PolicyEngine Microcosm UK dataset"}, run
            through policyengine-uk&apos;s bus fare model. Each person&apos;s imputed local-bus trips
            are priced at DfT passenger receipts per fare-paying boarding for their area, with single
            tickets priced at the fare cap in force. People eligible for a concessionary bus pass pay
            no fares, so pension-age passengers carry no fare spending. Fares are compared with{" "}
            {L(src.dft_fare, "DfT's England-wide fare-receipts total")} as a benchmark, not
            calibrated to it here.
          </p>
        </div>
        <div>
          <h3 className="font-semibold text-slate-900">3 · Costing the £2 cap</h3>
          <p>
            The estimate is projected fare spending of households resident in the eight English
            regions outside London ({data.reforms?.announced_2pound_cap?.baseline_fare_spending_bn ? `£${data.reforms.announced_2pound_cap.baseline_fare_spending_bn.toFixed(2)}bn` : "the policy-geography base"})
            multiplied by a <strong>12.5% all-ticket reduction (range 10–15%)</strong>{" "}
            {L(src.derived_fare_reduction, "derived")} from Table 6 of{" "}
            {L(src.dft_two_pound_cap_evaluation, "DfT's evaluation of the previous £2 cap")}:
            singles at the £3 cap save £1 (33%), those between £2 and £3 save less (~27% single-yield
            reduction), weighted by a cap-era single trip share of 0.35–0.50. The base holds the £3 cap
            in force all year; current law in policyengine-uk already applies the £2 cap from January
            2027, so the pipeline overrides that cap to £3 before measuring spending. Region,
            family-type and quintile averages
            divide each group&apos;s saving by all its households, including non-bus users; age-band
            averages are per person in the policy geography. The government&apos;s funding figures are
            not inputs. Treating passenger savings as fiscal cost assumes pound-for-pound operator
            reimbursement.
          </p>
        </div>
        <div>
          <h3 className="font-semibold text-slate-900">4 · The counterfactual</h3>
          <p>
            Results are reported against current law, under which{" "}
            {L(src.funding_expiry_counterfactual, "the £3 cap is funded only to 31 March 2027")} — so
            for nine of twelve months there would be no cap at all. The announcement therefore buys
            both the £3-to-£2 reduction and the cap&apos;s continued existence. The second part is
            worth a further 8.3% of fare spending, derived from{" "}
            {L(src.three_pound_cap_2025_cost, "the £151m one-year cost of the £3 cap")} and converted
            from operator reimbursement to household savings by uprating 2025 fares to 2027 and
            grossing up ~90% operator participation. Blending three months at 12.5% with nine at
            20.8% gives 18.7%. Priced instead against a £3 cap running all year — the fare reduction
            alone — the estimate is{" "}
            £{Math.round((data.reforms?.announced_2pound_cap?.estimated_cost_bn || 0) * 1000)}m.
          </p>
        </div>
        <div>
          <h3 className="font-semibold text-slate-900">5 · Limitations</h3>
          <p>
            This is not a ticket-level model. The 12.5% reduction is a derived re-weighting of{" "}
            {L(src.dft_two_pound_cap_evaluation, "2023 evaluation evidence")}, not an observed
            outcome of a £3→£2 change; the 10–15% band reflects uncertainty in the cap-era single
            trip share. Spending includes coach fares the cap does not cover;
            geography is where households live, not where journeys happen. Non-participating routes,
            local fares already at £2 or less, and induced demand are not modelled.
          </p>
        </div>
        <div>
          <h3 className="font-semibold text-slate-900">6 · Interpretation</h3>
          <p>
            The policy runs 1 January–31 December 2027, so results are calendar-2027, not fiscal-year.
            Family type is the benefit unit. Income quintiles fold household income deciles. People
            with modelled fare spending are an exposure proxy, not confirmed beneficiaries.
          </p>
          <p className="mt-2">
            Results were produced with policyengine {data.policyengine_version} (policyengine-uk{" "}
            {data.policyengine_uk_version}) on the certified {data.dataset_name} dataset, build{" "}
            <code className="text-xs">{data.dataset_revision}</code>.
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
