"use client";

import SectionHeading from "./SectionHeading";

export default function MethodologyTab({ data }) {
  const src = data.sources || {};
  const weights = data.assumptions?.age_allocation_weights || {};

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
            The 22 July 2026 government announcement is the source for the £2 cap, calendar-2027
            dates, England-outside-London geography, participating-bus condition, £400m of extra
            funding backing the cap and £454m of total extra funding including devolved-government
            funding. The announcement does not publish a total scheme cost. These funding figures are
            comparison benchmarks, not inputs to our estimate, and neither is presented as England-only
            passenger savings.
          </p>
        </div>
        <div>
          <h3 className="font-semibold text-slate-900">2 · Household microsimulation</h3>
          <p>
            Household bus &amp; coach spending is imputed from the Living Costs and Food Survey in the
            PolicyEngine UK Enhanced FRS and calibrated to DfT Annual Bus Statistics. The LCFS records
            fares at household level, so each household&apos;s fare is split across its members using a{" "}
            {src.nts_age_profile ? (
              <a href={src.nts_age_profile.url} target="_blank" rel="noreferrer" className="text-[color:var(--pe-color-primary-600)] underline">National Travel Survey bus-trips-by-age</a>
            ) : "National Travel Survey bus-trips-by-age"}{" "}
            profile adjusted for concessionary ages. The policy-geography view keeps the eight
            English regions outside London and excludes London, Scotland, Wales and Northern Ireland.
            It cannot identify non-participating routes or local areas already charging £2 or less.
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
            DfT&apos;s evaluation of the previous £2 cap found that average yield across all ticket
            types fell from £1.49 to £1.40, a weighted reduction of 6.3%. We apply that independently
            observed whole-market reduction to each simulated household&apos;s projected fare spending.
            The resulting household savings sum to our fiscal-cost estimate. Average household effects
            divide each group&apos;s modelled saving by all households in that group, including non-bus users.
            The government&apos;s funding figures are not used anywhere in this calculation.
          </p>
        </div>
        <div>
          <h3 className="font-semibold text-slate-900">4 · Limitation</h3>
          <p>
            This restores the original DfT-anchored microsimulation structure, but it is not a
            ticket-level model. The 6.3% evidence comes from the 2023 £2 cap against the fares then
            prevailing, while the 2027 counterfactual is a £3 cap. Route-level fares, final operator
            participation, existing local caps and induced demand are not modelled.
          </p>
        </div>
        <div>
          <h3 className="font-semibold text-slate-900">5 · Projection and interpretation</h3>
          <p>
            The model projects the 2024-25 Enhanced FRS to calendar year {data.projection_year_label}.
            The policy itself is confirmed for 1 January–31 December 2027, so the dashboard does not
            call it a 2027-28 fiscal-year policy. Family type is the benefit unit rather than the whole
            household. Income quintiles fold household income deciles. People in fare-spending
            households are an exposure proxy, not observed passengers or confirmed beneficiaries.
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
