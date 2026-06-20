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
  const fy = data.fiscal_year_label;
  const capLowPct = (cap.reduction_low * 100).toFixed(1);
  const capHighPct = Math.round(cap.reduction_high * 100);
  const bn1 = (v) => `£${Number(v).toFixed(1)}bn`;
  const A = (s, text) => (s ? <a href={s.url} target="_blank" rel="noreferrer" className="underline">{text}</a> : text);

  return (
    <div className="space-y-14">
      {/* Reform 1 */}
      <section>
        <SectionHeading
          title="Reform 1 — Free buses for under-25s"
          description={
            <>
              Removes bus &amp; coach fares entirely for everyone under 25, <strong>modelled
              UK-wide</strong> for {fy}, to cut the cost of reaching college, apprenticeships and
              work — extending the idea of{" "}
              {A(src.scotland_under_22, "Scotland's under-22 free bus scheme")}. Fiscal cost = the
              fares government would now meet; this is <strong>static</strong> (lower fares would
              induce extra trips and cost). Bus fares are not in the FRS — they are imputed from the{" "}
              <a href="https://www.ons.gov.uk/peoplepopulationandcommunity/personalandhouseholdfinances/incomeandwealth/methodologies/livingcostsandfoodsurvey" target="_blank" rel="noreferrer" className="underline">Living Costs and Food Survey</a>{" "}
              onto PolicyEngine&apos;s Enhanced FRS and calibrated to DfT totals; each household&apos;s
              fare is then split across its members by a{" "}
              {A(src.nts_age_profile, "National Travel Survey bus-trips-by-age profile")}{" "}
              (adjusted so concessionary, free-travelling pensioners carry ~zero fare weight), so the
              under-25 attribution is modelled, not observed.
            </>
          }
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <Stat label="Fiscal cost (gross, illustrative)" value={formatBn(u25.cost_bn)} sub={`${fy}, static · before netting concessions`} />
          <Stat label="Under-25s in fare-imputed h'holds" value={`${u25.people_affected_m.toFixed(2)}m`} sub={`${formatPct(data.baseline.under_25_share * 100, 1)} of UK fares`} />
        </div>
        <div className="mt-6"><BreakdownChart breakdowns={u25.breakdowns} metric="Cost" color={colors.primary[500]} period={fy} /></div>
      </section>

      {/* Reform 2 */}
      <section>
        <SectionHeading
          title="Reform 2 — £1 bus fare cap"
          description={
            <>
              A universal £1 cap on single bus &amp; coach fares, modelled UK-wide — an{" "}
              <strong>illustrative scenario</strong>, not a costed proposal. England already runs a{" "}
              {A(src.fare_cap_policy, "national fare cap (£2 from 2023, £3 for 2025–27)")}; Scotland
              and Wales set their own.{" "}
              <strong>How it&apos;s approximated:</strong> the imputed data records annual fare spend,
              not per-trip fares, so the cap can&apos;t be applied ticket-by-ticket. Instead fares are
              cut by a flat fraction set by the DfT average fare — £3.4bn{" "}
              {A(src.dft_journeys, "receipts over fare-paying journeys")}. That denominator is
              uncertain: counting only genuinely-free older/disabled journeys as non-paying gives an
              average fare of ≈£{cap.average_fare_low_gbp.toFixed(2)} ({capLowPct}% reduction →{" "}
              {bn1(cap.cost_low_bn)}), while treating <em>all</em> concessionary journeys as
              non-paying gives ≈£{cap.average_fare_high_gbp.toFixed(2)} ({capHighPct}% →{" "}
              {bn1(cap.cost_high_bn)}). We report the all-concessionary figure ({capHighPct}%)
              here.{" "}
              <strong>Caveats:</strong> a flat fraction over a blended average is not the exact
              Σ max(fare − £1, 0) over single tickets; the baseline is calibrated to
              year-ending-March-2025 DfT data (largely under the older £2 cap) and population-uplifted
              from England local-bus statistics (excluding coaches and Northern Ireland); and it is{" "}
              <strong>static</strong> — a real cap would induce extra trips, raising cost.
            </>
          }
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <Stat label="Fiscal cost" value={`£${Number(cap.cost_high_bn).toFixed(2)}bn`} sub={`${fy} · ${capHighPct}% fare reduction (all concessionary journeys non-paying)`} />
          <Stat label="In fare-imputed households" value={`${cap.people_affected_m.toFixed(2)}m`} sub="people" />
        </div>
        <div className="mt-6"><BreakdownChart breakdowns={cap.breakdowns} metric="Cost" color={colors.primary[400]} period={fy} /></div>
      </section>
    </div>
  );
}
