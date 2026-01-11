import Link from "next/link";
import { Button } from "@/components/ui/button";

const grantCatalog: Record<
  string,
  { name: string; agency: string; status: string; due: string }
> = {
  "community-mobility-access": {
    name: "Community Mobility Access",
    agency: "DOT Safe Streets",
    status: "Drafting",
    due: "Sep 12, 2024",
  },
  "water-infrastructure-upgrade": {
    name: "Water Infrastructure Upgrade",
    agency: "EPA SRF",
    status: "Internal Review",
    due: "Oct 02, 2024",
  },
  "main-street-revitalization": {
    name: "Main Street Revitalization",
    agency: "EDA Build Back",
    status: "Submitting",
    due: "Aug 30, 2024",
  },
  "wildfire-mitigation": {
    name: "Wildfire Mitigation",
    agency: "FEMA BRIC",
    status: "Research",
    due: "Oct 18, 2024",
  },
  "parks-trails-expansion": {
    name: "Parks & Trails Expansion",
    agency: "State Recreation",
    status: "Budgeting",
    due: "Sep 28, 2024",
  },
};

const stats = [
  { label: "Overall Progress", value: "58%", detail: "On track this month" },
  { label: "Tasks Completed", value: "24", detail: "8 outstanding" },
  { label: "Review Cycles", value: "3", detail: "Next review tomorrow" },
  { label: "Budget Prepared", value: "$740K", detail: "75% finalized" },
];

type GrantOverviewPageProps = {
  grantId: string;
};

export default function GrantOverviewPage({ grantId }: GrantOverviewPageProps) {
  const grant = grantCatalog[grantId];
  const title = grant?.name ?? "Grant Overview";
  const agency = grant?.agency ?? "Unknown agency";
  const status = grant?.status ?? "In progress";
  const due = grant?.due ?? "TBD";

  return (
    <div className="min-h-screen bg-[#f6f1e8] text-slate-900">
      <div className="flex min-h-screen">
        <aside className="w-72 h-screen sticky top-0 flex-none bg-[#0d2a2b] text-slate-100 px-6 py-8 flex flex-col gap-10">
          <Link
            className="inline-flex items-center gap-2 text-sm font-semibold text-white/80 hover:text-white transition"
            href="/dashboard"
          >
            <span aria-hidden="true">&lt;-</span>
            Dashboard
          </Link>

          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-[#f9d48f]">
              Pubsup
            </p>
            <h1 className="text-2xl font-semibold font-['Fraunces'] mt-3">
              Grant Command
            </h1>
            <p className="text-sm text-slate-300 mt-3 leading-relaxed">
              Monitor a single grant from kickoff through submission.
            </p>
          </div>

          <nav className="space-y-2 text-sm">
            <Link
              className="block w-full text-left rounded-xl px-4 py-3 bg-white/10 text-white font-medium"
              href={`/overview/${grantId}`}
            >
              Overview
            </Link>
            <Link
              className="block w-full text-left rounded-xl px-4 py-3 text-slate-300 hover:bg-white/5 hover:text-white transition"
              href={`/overview/${grantId}/questions`}
            >
              Questions
            </Link>
            <Link
              className="block w-full text-left rounded-xl px-4 py-3 text-slate-300 hover:bg-white/5 hover:text-white transition"
              href={`/overview/${grantId}/documents`}
            >
              Documents
            </Link>
            <Link
              className="block w-full text-left rounded-xl px-4 py-3 text-slate-300 hover:bg-white/5 hover:text-white transition"
              href={`/overview/${grantId}/team`}
            >
              Team
            </Link>
          </nav>
        </aside>

        <main className="flex-1 px-10 py-10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-slate-500">
                Grant overview
              </p>
              <h2 className="text-4xl font-semibold font-['Fraunces'] mt-3">
                {title}
              </h2>
              <p className="text-slate-600 mt-3 max-w-xl">
                Agency: <span className="font-semibold">{agency}</span> ·
                Status: <span className="font-semibold">{status}</span> · Due{" "}
                {due}
              </p>
            </div>
            <div className="rounded-2xl bg-white/60 border border-white/60 px-6 py-4 shadow-lg shadow-black/5">
              <p className="text-sm text-slate-500">Current phase</p>
              <p className="text-2xl font-semibold text-slate-900 mt-1">
                Draft narrative
              </p>
              <p className="text-sm text-slate-500 mt-1">
                3 reviewers assigned
              </p>
            </div>
          </div>

          <section className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {stats.map((stat, index) => (
              <div
                key={stat.label}
                className="rounded-2xl border border-white/60 bg-white/70 p-6 shadow-xl shadow-black/5 animate-fade-up"
                style={{ animationDelay: `${index * 80}ms` }}
              >
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                  {stat.label}
                </p>
                <p className="text-3xl font-semibold mt-3 text-slate-900">
                  {stat.value}
                </p>
                <p className="text-sm text-slate-600 mt-2">{stat.detail}</p>
              </div>
            ))}
          </section>

          <section className="mt-12 grid gap-6 lg:grid-cols-[1.2fr_1fr]">
            <div className="rounded-2xl border border-white/70 bg-white/70 shadow-xl shadow-black/5 p-6">
              <h3 className="text-lg font-semibold text-slate-900">
                Key milestones
              </h3>
              <ul className="mt-4 space-y-3 text-sm text-slate-600">
                <li>Draft narrative complete by Aug 28</li>
                <li>Budget alignment review on Sep 03</li>
                <li>Final approvals locked by Sep 08</li>
              </ul>
            </div>
            <div className="rounded-2xl border border-white/70 bg-white/70 shadow-xl shadow-black/5 p-6">
              <h3 className="text-lg font-semibold text-slate-900">
                Current collaborators
              </h3>
              <p className="text-sm text-slate-600 mt-2">
                Planning Dept., Public Works, Finance, Communications.
              </p>
              <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-600">
                <span className="rounded-full bg-white/80 px-3 py-1">
                  Lead: Maria Gomez
                </span>
                <span className="rounded-full bg-white/80 px-3 py-1">
                  Reviewer: Ethan Cole
                </span>
                <span className="rounded-full bg-white/80 px-3 py-1">
                  Finance: Lila Yu
                </span>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
