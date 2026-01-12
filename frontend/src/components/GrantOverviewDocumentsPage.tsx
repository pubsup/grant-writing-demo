"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

const contextDocuments = [
  {
    name: "2024 Housing Needs Assessment",
    type: "PDF",
    source: "Research Library",
    updated: "Aug 12, 2024",
    status: "Included",
  },
  {
    name: "Capital Improvement Plan",
    type: "Docx",
    source: "Planning Dept.",
    updated: "Jul 28, 2024",
    status: "Included",
  },
  {
    name: "Community Survey Results",
    type: "Xlsx",
    source: "Public Outreach",
    updated: "Aug 04, 2024",
    status: "Review",
  },
];

const templateLibrary = [
  {
    name: "Budget Narrative Template",
    type: "Docx",
    owner: "Finance Office",
  },
  {
    name: "Project Timeline Sheet",
    type: "Xlsx",
    owner: "Grants Team",
  },
  {
    name: "Letters of Support Bundle",
    type: "Zip",
    owner: "Comms",
  },
];

type GrantOverviewDocumentsPageProps = {
  grantId: string;
};

export default function GrantOverviewDocumentsPage({
  grantId,
}: GrantOverviewDocumentsPageProps) {
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
              Curate the documents that power this grant response.
            </p>
          </div>
          <nav className="space-y-2 text-sm">
            <Link
              className="block w-full text-left rounded-xl px-4 py-3 text-slate-300 hover:bg-white/5 hover:text-white transition"
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
              className="block w-full text-left rounded-xl px-4 py-3 bg-white/10 text-white font-medium"
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
                Grant documents
              </p>
              <h2 className="text-4xl font-semibold font-['Fraunces'] mt-3">
                Context library
              </h2>
              <p className="text-slate-600 mt-3 max-w-2xl">
                Choose which documents inform this grant application and attach
                the right templates for consistent submissions.
              </p>
            </div>
          </div>

          <section className="mt-10 grid gap-6 lg:grid-cols-2">
            <div className="rounded-2xl border border-white/70 bg-white/70 shadow-xl shadow-black/5 p-6">
              <h3 className="text-lg font-semibold text-slate-900">
                Add templates
              </h3>
              <p className="text-sm text-slate-600 mt-2">
                Pull from your shared template library and connect them to this
                grant.
              </p>
              <div className="mt-6 space-y-3">
                {templateLibrary.map((template) => (
                  <div
                    key={template.name}
                    className="flex items-center justify-between rounded-xl outline outline-1 outline-slate-200/60 border border-white/70 bg-white/80 px-4 py-3"
                  >
                    <div>
                      <p className="font-semibold text-slate-900">
                        {template.name}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        {template.type} · {template.owner}
                      </p>
                    </div>
                    <Button
                      className="bg-[#0d2a2b] hover:bg-[#133d3f] text-white text-xs px-3 py-2"
                      type="button"
                    >
                      Add
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-white/70 bg-white/70 shadow-xl shadow-black/5 p-6">
              <h3 className="text-lg font-semibold text-slate-900">
                Upload additional context
              </h3>
              <p className="text-sm text-slate-600 mt-2">
                Add memos, reports, or data tables that should inform this grant
                response.
              </p>
              <div className="mt-6 rounded-xl border border-dashed border-slate-300 bg-white/60 px-4 py-6 text-left">
                <p className="text-sm text-slate-600">
                  Add a title and short description before uploading.
                </p>
                <div className="mt-4 flex flex-col gap-3">
                  <input
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700"
                    placeholder="Title"
                    type="text"
                  />
                  <input
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700"
                    placeholder="Short description"
                    type="text"
                  />
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <Button
                      className="bg-[#f29f5c] text-[#0d2a2b] hover:bg-[#f6b57f] font-semibold"
                      type="button"
                    >
                      Upload context
                    </Button>
                  </div>
                </div>
                <p className="text-xs text-slate-500 mt-3">
                  Accepted formats: PDF, DOCX, XLSX, CSV.
                </p>
              </div>
            </div>
          </section>

          <section className="mt-6 rounded-2xl border border-white/70 bg-white/70 shadow-xl shadow-black/5 p-6">
            <h3 className="text-lg font-semibold text-slate-900">
              Grant context documents
            </h3>
            <p className="text-sm text-slate-600 mt-2">
              Toggle which files should be used for extraction, summaries, and
              drafted answers.
            </p>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {contextDocuments.map((doc) => (
                <div
                  key={doc.name}
                  className="rounded-2xl border border-white/70 outline outline-1 outline-slate-200/60 bg-white/80 p-4 hover:bg-white/90 transition"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="h-11 w-11 rounded-xl bg-[#0d2a2b]/10 text-[#0d2a2b] flex items-center justify-center text-xs font-semibold">
                      {doc.type}
                    </div>
                    <span className="rounded-full bg-[#0d2a2b]/10 text-[#0d2a2b] px-3 py-1 text-xs font-semibold">
                      {doc.status}
                    </span>
                  </div>
                  <div className="mt-4">
                    <p className="font-semibold text-slate-900">{doc.name}</p>
                    <p className="text-sm text-slate-600 mt-1">{doc.source}</p>
                    <p className="text-xs text-slate-500 mt-2">
                      Updated {doc.updated}
                    </p>
                  </div>
                  <div className="mt-4 flex items-center justify-between text-xs text-slate-600">
                    <button
                      type="button"
                      className="font-semibold text-[#0d2a2b] hover:underline"
                    >
                      Manage
                    </button>
                    <span className="text-slate-500">Included</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
