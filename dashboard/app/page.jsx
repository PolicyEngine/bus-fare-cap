"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import BaselineTab from "../src/components/BaselineTab";
import MethodologyTab from "../src/components/MethodologyTab";
import ReformTab from "../src/components/ReformTab";

const TAB_OPTIONS = [
  { id: "reform", label: "Reforms" },
  { id: "baseline", label: "Baseline" },
  { id: "methodology", label: "Methodology" },
];

function getInitialTab(tabParam) {
  return TAB_OPTIONS.some((t) => t.id === tabParam) ? tabParam : "reform";
}

function TabLink({ onSelect, children }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className="font-semibold text-[color:var(--pe-color-primary-600)] underline decoration-1 underline-offset-2 transition-opacity hover:opacity-80"
    >
      {children}
    </button>
  );
}

function Dashboard() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState(() => getInitialTab(searchParams.get("tab")));
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setActiveTab(getInitialTab(searchParams.get("tab")));
  }, [searchParams]);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch("/data/bus_fare_cap_results.json");
        if (!res.ok) throw new Error("bus_fare_cap_results.json not found; run the pipeline first");
        setData(await res.json());
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  function handleTabChange(tab) {
    setActiveTab(tab);
    router.replace(tab === "reform" ? "/" : `/?tab=${tab}`, { scroll: false });
  }

  return (
    <div className="app-shell min-h-screen">
      <header className="title-row">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between px-6 py-4 md:px-8">
          <h1>Bus fares policies analysis</h1>
        </div>
      </header>

      <main className="relative z-[1] mx-auto max-w-[1400px] px-6 py-10 md:px-8 md:py-12">
        <p className="mb-3 text-[1.05rem] leading-relaxed text-slate-600">
          This dashboard uses{" "}
          <a href="https://policyengine.org" target="_blank" rel="noreferrer" className="underline">PolicyEngine</a>{" "}
          UK&apos;s microsimulation (the Enhanced FRS, with household bus fares imputed from the LCFS
          and calibrated to DfT Annual Bus Statistics) to cost two bus policies
          {data ? ` for fiscal year ${data.fiscal_year_label}` : ""}: a{" "}
          <strong>£1 bus fare cap</strong> (England already runs a{" "}
          <a href="https://www.gov.uk/guidance/get-around-for-2-pounds-bus-fares" target="_blank" rel="noreferrer" className="underline">national fare cap</a>
          ) and <strong>free buses for under-25s</strong> (cf.{" "}
          <a href="https://www.transport.gov.scot/concessionary-travel/young-persons-free-bus-travel-scheme/" target="_blank" rel="noreferrer" className="underline">Scotland&apos;s under-22 scheme</a>
          ), to help young people access training and employment. The{" "}
          <TabLink onSelect={() => handleTabChange("reform")}>Reforms</TabLink> tab shows each
          policy&apos;s fiscal cost and breakdowns. The{" "}
          <TabLink onSelect={() => handleTabChange("baseline")}>Baseline</TabLink> tab shows current
          bus fares by age and region. The{" "}
          <TabLink onSelect={() => handleTabChange("methodology")}>Methodology</TabLink> tab explains
          how every result is computed, with a source for every assumption.
        </p>

        <div className="mb-8 mt-8 flex w-fit flex-wrap border-b-2 border-slate-200">
          {TAB_OPTIONS.map((tab) => (
            <button
              key={tab.id}
              className={`tab-button ${activeTab === tab.id ? "active" : ""}`}
              onClick={() => handleTabChange(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {error && (
          <p className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">Error: {error}</p>
        )}
        {loading && !error && (
          <p className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500">Loading data...</p>
        )}

        {!loading && !error && data && (
          <>
            {activeTab === "reform" && <ReformTab data={data} />}
            {activeTab === "baseline" && <BaselineTab data={data} />}
            {activeTab === "methodology" && <MethodologyTab data={data} />}
          </>
        )}

        <footer className="mt-12 border-t border-slate-200 pt-8 text-center text-sm text-slate-500">
          <p>
            Replication code:{" "}
            <a href="https://github.com/PolicyEngine/bus-fare-cap" target="_blank" rel="noreferrer">
              PolicyEngine/bus-fare-cap
            </a>
            . Static (pre-behavioural) estimates.
          </p>
        </footer>
      </main>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<p className="p-12 text-center text-slate-500">Loading...</p>}>
      <Dashboard />
    </Suspense>
  );
}
