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
            DfT net government support (£3.0bn England, BUS05bii). The DfT data is for the year
            ending March 2025 (largely under the older £2 cap) and covers England local buses
            (excluding coaches and Northern Ireland), uplifted to the UK — so the baseline is
            indicative, not an explicit model of the £3 cap or 2027-28 policy.
          </p>
        </div>
        <div>
          <h3 className="font-semibold text-slate-900">2 · Allocating fares to people by age</h3>
          <p>
            The LCFS records fares at <em>household</em> level, so each household&apos;s fare is split
            across its members by a relative weight that proxies who pays. The weights are
            built from{" "}
            {src.nts_age_profile ? (
              <a href={src.nts_age_profile.url} target="_blank" rel="noreferrer" className="text-[color:var(--pe-color-primary-600)] underline">National Travel Survey bus-trips-by-age</a>
            ) : "National Travel Survey bus-trips-by-age"}{" "}
            (bus use peaks sharply at 17–20), then lowered for concessionary ages. The weights only
            redistribute fares <em>within mixed-age households</em> — a single-age household (e.g. a
            lone pensioner, or an all-adult one) keeps its full imputed fare regardless of weight, so
            65+ still carries ~18% of fares. The split is a rough heuristic, not observed, and the
            exact weight values are an illustrative calibration of the NTS profile, not a
            reproducible derivation.
          </p>
          <div className="mt-3 flex flex-wrap gap-2 text-sm">
            {Object.entries(weights).map(([band, w]) => (
              <span key={band} className="rounded-lg bg-slate-100 px-3 py-1 text-slate-700">{band}: <strong>{w}</strong></span>
            ))}
          </div>
        </div>
        <div>
          <h3 className="font-semibold text-slate-900">3 · Reform 1 — free buses for under-25s</h3>
          <p>
            Fiscal cost = the bus fares allocated to people under 25, which the government would now
            meet (a full subsidy for that group). This is a <strong>gross, illustrative</strong>
            figure: it does not net out existing youth/child concessions (notably Scotland&apos;s
            under-22 scheme), and the under-25 split comes from age weights, not observed individual
            fares, so small-child bands are over-stated. &ldquo;People affected&rdquo; counts
            under-25s in households with imputed bus-fare spending, not observed bus users.
          </p>
        </div>
        <div>
          <h3 className="font-semibold text-slate-900">4 · Reform 2 — £1 fare cap</h3>
          <p>
            A universal £1 per-trip cap, approximated. With only annual fare spend (no per-trip
            fares), fares are cut by a flat fraction set by the DfT average fare = receipts ÷
            fare-paying journeys. We report the all-concessionary figure: treating <em>all</em>
            concessionary journeys (incl. fare-paying youth, whose fares are in the receipts) as
            non-paying gives ≈£1.28 → ≈22% (≈£0.92bn). A stricter denominator that excludes only the
            genuinely-free older/disabled (ENCTS) journeys gives a lower ≈£1.11 → 9.5% (≈£0.40bn).
            A flat fraction over a blended average is not the exact Σ max(fare − £1, 0) over single
            tickets, so this is an indicative figure.
          </p>
        </div>
        <div>
          <h3 className="font-semibold text-slate-900">5 · Behaviour, scope and breakdowns</h3>
          <p>
            All figures are <strong>static</strong> — lower or zero fares induce extra trips (cf.
            Scotland&apos;s under-22 scheme), which a behavioural elasticity would add, raising both
            ridership and cost. Figures are UK-wide (England-anchored, population-uplifted).
            Breakdowns allocate the same per-person fares by PolicyEngine&apos;s region, age, income
            quintile and family type — &ldquo;Family type&rdquo; is the <em>benefit unit</em> (not the
            whole household), and income quintiles fold the published household income deciles,
            excluding a small &ldquo;unknown decile&rdquo; group (~£23m of baseline fares).{" "}
            <strong>Projection:</strong> {data.fiscal_year_label} figures uprate the 2024-25 dataset —
            fares by PolicyEngine&apos;s price/earnings uprating <em>and</em> population, but the bus
            subsidy only by population (no price uprating), so the two are not on a fully consistent
            price basis.
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
