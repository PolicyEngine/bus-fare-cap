"use client";

import SectionHeading from "./SectionHeading";

export default function MethodologyTab({ data }) {
  const src = data.sources || {};
  const weights = data.assumptions?.age_allocation_weights || {};
  const uplift = data.reform_definition?.england_to_uk_population_uplift;

  return (
    <div className="space-y-10">
      <SectionHeading
        title="Methodology"
        description="How every result is computed. Modelled quantities are read from the PolicyEngine UK Enhanced FRS microsimulation; every other number has a source in the table below."
      />

      {/* One comprehensive method box */}
      <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 text-sm leading-6 text-slate-600">
        <div>
          <h3 className="font-semibold text-slate-900">1 · Baseline fares &amp; subsidy</h3>
          <p>
            Household bus &amp; coach fare spending is imputed from the Living Costs and Food Survey
            (LCFS) in the PolicyEngine UK Enhanced FRS (COICOP 7.3.2 bus/coach codes) and calibrated
            to the DfT Annual Bus Statistics passenger-fare total — £3.4bn for England (table
            BUS05aii), uplifted England→UK by population (×{uplift ? uplift.toFixed(2) : "1.18"}).
            Bus subsidy is the ETB-imputed government benefit-in-kind, calibrated the same way to
            DfT net government support (£3.0bn England, BUS05bii).
          </p>
        </div>
        <div>
          <h3 className="font-semibold text-slate-900">2 · Allocating fares to people by age</h3>
          <p>
            The LCFS records fares at <em>household</em> level, so each household&apos;s fare is split
            across its members by a relative weight that reflects who actually pays. The weights are
            built from National Travel Survey bus-trips-by-age (bus use peaks sharply at 17–20), then
            adjusted for concessionary travel: pension-age riders travel free, so they carry a
            near-zero <em>fare</em> weight even though they make many trips. This tracks fares paid,
            not trips. The per-person split is therefore modelled, not observed.
          </p>
        </div>
        <div>
          <h3 className="font-semibold text-slate-900">3 · Reform 1 — free buses for under-25s</h3>
          <p>
            Fiscal cost = the bus fares allocated to people under 25, which the government would now
            meet (a full subsidy for that group). People affected = under-25s in fare-paying
            households.
          </p>
        </div>
        <div>
          <h3 className="font-semibold text-slate-900">4 · Reform 2 — £1 fare cap</h3>
          <p>
            A universal £1 per-trip cap. The dataset records annual £ spend, not per-trip fares, so
            the cap is approximated as a fare-reduction fraction with a 20–40% sensitivity band
            (central 30%). Firming it up requires NTS trips-per-person (cost = fares −
            trips × £1).
          </p>
        </div>
        <div>
          <h3 className="font-semibold text-slate-900">5 · Behaviour, scope and breakdowns</h3>
          <p>
            All figures are <strong>static</strong> — lower or zero fares induce extra trips (cf.
            Scotland&apos;s under-22 scheme), which a behavioural elasticity would add, raising both
            ridership and cost. Figures are UK-wide (England-anchored, population-uplifted).
            Breakdowns by region, household type, age, and income quintile/quartile allocate the same
            per-person fares using PolicyEngine&apos;s region, family type and household income
            decile / equivalised net income.
          </p>
        </div>
      </div>

      {/* Age allocation weights — how + source */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <h3 className="mb-2 text-base font-semibold text-slate-900">Age allocation weights</h3>
        <p className="mb-4 text-sm leading-6 text-slate-600">
          Relative bus-<em>fare</em> weight by age. Derived from{" "}
          {src.nts_age_profile ? (
            <a href={src.nts_age_profile.url} target="_blank" rel="noreferrer" className="text-[color:var(--pe-color-primary-600)] underline">National Travel Survey bus trips by age</a>
          ) : "National Travel Survey bus trips by age"}{" "}
          (17–20 is the clear peak), then scaled down for concessionary ages so the weight reflects
          fares <em>paid</em> rather than trips made (pensioners travel free → ≈0). Only the ratios
          matter; they are normalised to the 30–39 band = 1.0.
        </p>
        <div className="flex flex-wrap gap-2 text-sm">
          {Object.entries(weights).map(([band, w]) => (
            <span key={band} className="rounded-lg bg-slate-100 px-3 py-1 text-slate-700">{band}: <strong>{w}</strong></span>
          ))}
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
