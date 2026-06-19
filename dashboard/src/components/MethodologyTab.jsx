"use client";

import SectionHeading from "./SectionHeading";

const METHOD_ORDER = [
  ["baseline", "Baseline fares & subsidy"],
  ["allocation", "Allocating fares to people by age"],
  ["free_under_25", "Reform 1 — free under-25s"],
  ["fare_cap_1pound", "Reform 2 — £1 fare cap"],
  ["behaviour", "Behavioural response"],
];

export default function MethodologyTab({ data }) {
  const sources = data.sources || {};
  const weights = data.assumptions?.age_allocation_weights || {};
  return (
    <div className="space-y-10">
      <SectionHeading
        title="Methodology"
        description="How every result is computed. Modelled quantities are read from the PolicyEngine UK Enhanced FRS; every other number has a source below."
      />

      <div className="space-y-5">
        {METHOD_ORDER.filter(([k]) => data.methods?.[k]).map(([key, title]) => (
          <div key={key} className="rounded-2xl border border-slate-200 bg-white p-6">
            <h3 className="mb-2 text-base font-semibold text-slate-900">{title}</h3>
            <p className="text-sm leading-6 text-slate-600">{data.methods[key]}</p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <h3 className="mb-3 text-base font-semibold text-slate-900">Age allocation weights (NTS, concessionary-adjusted)</h3>
        <div className="flex flex-wrap gap-2 text-sm">
          {Object.entries(weights).map(([band, w]) => (
            <span key={band} className="rounded-lg bg-slate-100 px-3 py-1 text-slate-700">
              {band}: <strong>{w}</strong>
            </span>
          ))}
        </div>
      </div>

      <div>
        <SectionHeading title="Sources" size="lg" />
        <div className="mt-4 space-y-4">
          {Object.entries(sources).map(([key, s]) => (
            <div key={key} className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="flex items-baseline justify-between gap-4">
                <span className="font-semibold text-slate-900">{String(s.value)}</span>
                <a href={s.url} target="_blank" rel="noreferrer" className="shrink-0 text-sm text-[color:var(--pe-color-primary-600)] underline">
                  Source
                </a>
              </div>
              <p className="mt-1 text-sm leading-6 text-slate-600">{s.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
