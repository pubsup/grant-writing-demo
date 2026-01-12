"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

const stats = [
  {
    label: "Active Grants",
    value: "12",
    change: "+3 this month",
  },
  {
    label: "In Review",
    value: "5",
    change: "2 waiting on docs",
  },
  {
    label: "Funding Target",
    value: "$4.2M",
    change: "62% projected",
  },
  {
    label: "Upcoming Deadlines",
    value: "7",
    change: "Next: Sep 12",
  },
];

type Grant = {
  id?: string;
  name?: string;
  department?: string;
  county?: string;
  due_date?: string;
  status?: string;
};

export default function GrantDashboardPage() {
  const router = useRouter();
  const [grants, setGrants] = useState<Grant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchGrants = async () => {
      try {
        const response = await fetch("http://localhost:8000/api/all_grants");
        if (!response.ok) {
          throw new Error("Failed to load grants.");
        }
        const data = await response.json();
        if (isMounted) {
          setGrants(Array.isArray(data?.grants) ? data.grants : []);
          setLoadError(null);
        }
      } catch (error) {
        if (isMounted) {
          setLoadError(
            error instanceof Error ? error.message : "Failed to load grants."
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchGrants();

    return () => {
      isMounted = false;
    };
  }, []);

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
              Track every application, align teams, and keep deadlines visible.
            </p>
          </div>

          <nav className="space-y-2 text-sm">
            <Link
              className="block w-full text-left rounded-xl px-4 py-3 bg-white/10 text-white font-medium"
              href="/dashboard"
            >
              Overview
            </Link>
            <Link
              className="block w-full text-left rounded-xl px-4 py-3 text-slate-300 hover:bg-white/5 hover:text-white transition"
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
                System Status
              </p>
              <p className="text-sm mt-2 text-white">
                18 teams active
                <span className="text-[#f9d48f]"> •</span> 4 reviews today
              </p>
            </div>
          </div>
        </aside>

        <main className="flex-1 px-10 py-10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-slate-500">
                Dashboard
              </p>
              <h2 className="text-4xl font-semibold font-['Fraunces'] mt-3">
                Active grant pipeline
              </h2>
              <p className="text-slate-600 mt-3 max-w-xl">
                Keep every grant application moving with shared visibility,
                status changes, and live progress tracking.
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
                <p className="text-sm text-slate-600 mt-2">{stat.change}</p>
              </div>
            ))}
          </section>

          <section className="mt-12">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold text-slate-900">
                  Active grant applications
                </h3>
                <p className="text-sm text-slate-600 mt-1">
                  All grants currently in-flight across departments.
                </p>
              </div>
            </div>

            <div className="mt-6 rounded-2xl bg-white/70 shadow-xl shadow-black/5 overflow-hidden">
              <table className="w-full text-left text-sm border-collapse">
                <thead className="bg-white/70 text-slate-500">
                  <tr>
                    <th className="px-6 py-4 font-medium border border-slate-200/60">
                      Grant
                    </th>
                    <th className="px-6 py-4 font-medium border border-slate-200/60">
                      Status
                    </th>
                    <th className="px-6 py-4 font-medium border border-slate-200/60">
                      Agency
                    </th>
                    <th className="px-6 py-4 font-medium border border-slate-200/60">
                      Owner
                    </th>
                    <th className="px-6 py-4 font-medium border border-slate-200/60">
                      Due
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/70">
                  {isLoading && (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-6 py-6 text-slate-500 border border-slate-200/60"
                      >
                        Loading grants...
                      </td>
                    </tr>
                  )}
                  {!isLoading && loadError && (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-6 py-6 text-[#8b4b1a] border border-slate-200/60"
                      >
                        {loadError}
                      </td>
                    </tr>
                  )}
                  {!isLoading && !loadError && grants.length === 0 && (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-6 py-6 text-slate-500 border border-slate-200/60"
                      >
                        No grants yet. Upload a grant to get started.
                      </td>
                    </tr>
                  )}
                  {!isLoading &&
                    !loadError &&
                    grants.map((grant, index) => (
                      <tr
                        key={grant.id || grant.name || `grant-${index}`}
                        className="hover:bg-white/80 cursor-pointer"
                        role="button"
                        tabIndex={0}
                        onClick={() => {
                          if (grant.id) {
                            router.push(`/overview/${grant.id}`);
                          }
                        }}
                        onKeyDown={(event) => {
                          if (!grant.id) {
                            return;
                          }
                          if (event.key === "Enter" || event.key === " ") {
                            event.preventDefault();
                            router.push(`/overview/${grant.id}`);
                          }
                        }}
                      >
                        <td className="px-6 py-4 border border-slate-200/60">
                          <p className="font-semibold text-slate-900">
                            {grant.name || "Untitled grant"}
                          </p>
                        </td>
                        <td className="px-6 py-4 border border-slate-200/60">
                          <span className="rounded-full bg-[#0d2a2b]/10 text-[#0d2a2b] px-3 py-1 text-xs font-semibold">
                            {grant.status || "Pending"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-slate-600 border border-slate-200/60">
                          {grant.county || "—"}
                        </td>
                        <td className="px-6 py-4 text-slate-600 border border-slate-200/60">
                          {grant.department || "—"}
                        </td>
                        <td className="px-6 py-4 text-slate-600 border border-slate-200/60">
                          {grant.due_date || "—"}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
