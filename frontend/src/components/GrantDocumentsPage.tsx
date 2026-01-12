import Link from "next/link";
import { Button } from "@/components/ui/button";

const templates = [
  {
    name: "Budget Narrative Template",
    type: "Docx",
    owner: "Finance Office",
    updated: "Aug 09, 2024",
    status: "Approved",
  },
  {
    name: "Project Timeline Sheet",
    type: "Xlsx",
    owner: "Grants Team",
    updated: "Aug 14, 2024",
    status: "Draft",
  },
  {
    name: "Community Impact Letter",
    type: "PDF",
    owner: "Outreach",
    updated: "Aug 18, 2024",
    status: "Approved",
  },
  {
    name: "Letters of Support Bundle",
    type: "Zip",
    owner: "Comms",
    updated: "Aug 20, 2024",
    status: "Pending Review",
  },
];

export default function GrantDocumentsPage() {
  return (
    <div className="min-h-screen bg-[#f6f1e8] text-slate-900">
      <div className="flex min-h-screen">
        <aside className="w-72 h-screen sticky top-0 flex-none bg-[#0d2a2b] text-slate-100 px-6 py-8 flex flex-col gap-10">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-[#f9d48f]">
              Pubsup
            </p>
            <h1 className="text-2xl font-semibold font-['Fraunces'] mt-3">
              Grant Command
            </h1>
            <p className="text-sm text-slate-300 mt-3 leading-relaxed">
              Centralize every template and keep submissions consistent.
            </p>
          </div>

          <nav className="space-y-2 text-sm">
            <Link
              className="block w-full text-left rounded-xl px-4 py-3 text-slate-300 hover:bg-white/5 hover:text-white transition"
              href="/dashboard"
            >
              Overview
            </Link>
            <Link
              className="block w-full text-left rounded-xl px-4 py-3 bg-white/10 text-white font-medium"
              href="/documents"
            >
              Documents
            </Link>
          </nav>

          <div className="mt-auto">
            <Button
              asChild
              className="w-full bg-[#f29f5c] text-[#0d2a2b] hover:bg-[#f6b57f] font-semibold"
            >
              <Link href="/new">New Project</Link>
            </Button>
            <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 px-4 py-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-300">
                Storage
              </p>
              <p className="text-sm mt-2 text-white">
                38 templates
                <span className="text-[#f9d48f]"> •</span> 2 pending reviews
              </p>
            </div>
          </div>
        </aside>

        <main className="flex-1 px-10 py-10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-slate-500">
                Documents
              </p>
              <h2 className="text-4xl font-semibold font-['Fraunces'] mt-3">
                Template library
              </h2>
              <p className="text-slate-600 mt-3 max-w-xl">
                Upload shared narratives, budget sheets, and letters so every
                team works from the latest approved templates.
              </p>
            </div>
          </div>

          <section className="mt-10 grid gap-6 lg:grid-cols-[1.2fr_1fr]">
            <div className="rounded-2xl border border-white/70 bg-white/70 shadow-xl shadow-black/5 p-6">
              <h3 className="text-lg font-semibold text-slate-900">
                Upload template documents
              </h3>
              <p className="text-sm text-slate-600 mt-2">
                Store reusable templates and tag them for faster applications.
              </p>
              <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-white/60 px-6 py-8 text-center">
                <p className="text-sm text-slate-600">
                  Drag and drop files here or browse your computer.
                </p>
                <Button
                  className="mt-4 bg-[#0d2a2b] text-white hover:bg-[#133d3f]"
                  type="button"
                >
                  Choose files
                </Button>
                <p className="text-xs text-slate-500 mt-3">
                  Supports PDF, DOCX, XLSX, PPTX up to 25MB.
                </p>
              </div>
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <div className="rounded-xl border border-white/70 bg-white/70 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                    Suggested tags
                  </p>
                  <p className="text-sm text-slate-600 mt-2">
                    Budget, Narrative, Letters, Eligibility
                  </p>
                </div>
                <div className="rounded-xl border border-white/70 bg-white/70 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                    Visibility
                  </p>
                  <p className="text-sm text-slate-600 mt-2">
                    Share templates with all departments by default.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="mt-12">
            <div className="rounded-2xl border border-white/70 bg-white/70 shadow-xl shadow-black/5 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold text-slate-900">
                    Existing templates
                  </h3>
                  <p className="text-sm text-slate-600 mt-1">
                    Review, replace, or archive current files.
                  </p>
                </div>
              </div>

              <div className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {templates.map((doc) => (
                  <div
                    key={doc.name}
                    className="rounded-2xl outline outline-1 outline-slate-200/60  border border-white/70 bg-white/70 shadow-xl shadow-black/5 p-5 hover:bg-white/80 transition"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="h-12 w-12 rounded-xl bg-[#0d2a2b]/10 text-[#0d2a2b] flex items-center justify-center text-sm font-semibold">
                        {doc.type}
                      </div>
                      <span className="rounded-full bg-[#0d2a2b]/10 text-[#0d2a2b] px-3 py-1 text-xs font-semibold">
                        {doc.status}
                      </span>
                    </div>
                    <div className="mt-4">
                      <p className="font-semibold text-slate-900">{doc.name}</p>
                      <p className="text-sm text-slate-600 mt-1">{doc.owner}</p>
                      <p className="text-xs text-slate-500 mt-2">
                        Updated {doc.updated}
                      </p>
                    </div>
                    <div className="mt-4 flex items-center justify-between text-sm">
                      <button
                        className="font-semibold text-[#0d2a2b] hover:underline"
                        type="button"
                      >
                        Open
                      </button>
                      <button
                        className="text-slate-500 hover:text-slate-700"
                        type="button"
                      >
                        Manage
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
