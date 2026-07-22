"use client";

import { colors } from "../lib/colors";
import { formatBn } from "../lib/formatters";
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
          <Stat label="Maximum single fare" value="£2" sub="down from the current £3 cap" />
          <Stat label="Official scheme cost" value=">£500m" sub="government announcement, calendar 2027" />
          <Stat label="New funding announced" value="£454m" sub="includes scope for devolved governments" />
          <Stat label="Policy period" value="12 months" sub={data.policy_period_label} />
        </div>
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
            </>
          }
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <Stat label="Baseline fare exposure" value={formatBn(cap.eligible_baseline_fare_exposure_bn)} sub={`${data.projection_year_label} projection · England outside London`} />
          <Stat label="People in fare-spending households" value={`${cap.people_in_fare_spending_households_m.toFixed(2)}m`} sub="exposure proxy, not confirmed beneficiaries" />
        </div>
        <div className="mt-6"><BreakdownChart breakdowns={cap.breakdowns} metric="Baseline fare exposure" color={colors.primary[400]} period={data.projection_year_label} /></div>
      </section>
    </div>
  );
}
