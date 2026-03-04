"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import StatusCard from "@/components/StatusCard";
import RecommendationCard from "@/components/RecommendationCard";
import type {
  CheckWaterResponse,
  ContaminantSummary,
  ContaminantLevel,
} from "@/types";

function MeasuredVsMCL({
  measured,
  mcl,
  unit,
}: {
  measured: number | null;
  mcl: number | null;
  unit: string | null;
}) {
  if (measured == null) return <span className="text-slate-400">--</span>;
  const displayUnit = unit ?? "";
  const exceeds = mcl != null && measured > mcl;
  return (
    <span className={exceeds ? "font-semibold text-red-600" : "text-slate-700"}>
      {measured} {displayUnit}
      {mcl != null && (
        <span className="text-xs text-slate-400"> / {mcl} {displayUnit}</span>
      )}
    </span>
  );
}

function ContaminantRow({ c }: { c: ContaminantSummary }) {
  const exceeds =
    c.highestMeasuredLevel != null && c.mcl != null && c.highestMeasuredLevel > c.mcl;
  return (
    <tr className="border-b border-slate-50 last:border-0">
      <td className="px-4 py-3">
        <div className="font-medium text-slate-700">{c.contaminantName}</div>
        <div className="text-xs text-slate-400">Code {c.contaminantCode}</div>
      </td>
      <td className="px-4 py-3 text-center">
        <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
          {c.violationCount}
        </span>
      </td>
      <td className="px-4 py-3">
        <MeasuredVsMCL
          measured={c.highestMeasuredLevel}
          mcl={c.mcl}
          unit={c.unit}
        />
        {exceeds && (
          <div className="mt-0.5 text-xs font-medium text-red-500">
            Exceeds limit
          </div>
        )}
      </td>
      <td className="px-4 py-3 font-mono text-xs text-slate-500">
        {c.mostRecentDate
          ? new Date(c.mostRecentDate).toLocaleDateString()
          : "—"}
      </td>
      <td className="px-4 py-3">
        {c.isHealthBased ? (
          <span className="inline-flex items-center rounded-full bg-red-50 px-2 py-0.5 text-xs font-medium text-red-700">
            Yes
          </span>
        ) : (
          <span className="text-xs text-slate-400">No</span>
        )}
      </td>
    </tr>
  );
}

const RATING_STYLES = {
  red: {
    row: "bg-red-50/40",
    amount: "font-semibold text-red-700",
    badge: "bg-red-50 text-red-700",
    label: "Exceeds limit",
  },
  yellow: {
    row: "",
    amount: "font-semibold text-amber-700",
    badge: "bg-amber-50 text-amber-700",
    label: "Above guideline",
  },
  green: {
    row: "",
    amount: "text-slate-700",
    badge: "bg-green-50 text-green-700",
    label: "Within limit",
  },
};

function ContaminantLevelRow({ c }: { c: ContaminantLevel }) {
  const style = RATING_STYLES[c.rating];
  return (
    <tr className={`border-b border-slate-50 last:border-0 ${style.row}`}>
      <td className="px-4 py-3 font-medium text-slate-700">{c.name}</td>
      <td className="px-4 py-3">
        <span className={style.amount}>
          {c.amount != null ? `${c.amount} ${c.unit}` : "--"}
        </span>
      </td>
      <td className="px-4 py-3">
        {c.healthLimit != null ? (
          <div>
            <span className="text-slate-600">{c.healthLimit} {c.unit}</span>
            {c.healthSource && (
              <div className="text-xs text-slate-400">{c.healthSource}</div>
            )}
          </div>
        ) : (
          <span className="text-xs text-slate-400">--</span>
        )}
      </td>
      <td className="px-4 py-3">
        {c.epaMCL != null ? (
          <span className="text-slate-600">{c.epaMCL} {c.unit}</span>
        ) : (
          <span className="text-xs text-slate-400">None</span>
        )}
      </td>
      <td className="px-4 py-3">
        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${style.badge}`}>
          {style.label}
        </span>
      </td>
    </tr>
  );
}

function ResultContent() {
  const searchParams = useSearchParams();
  const city = searchParams.get("city") ?? "";
  const state = searchParams.get("state") ?? "";
  const zip = searchParams.get("zip") ?? "";

  const [data, setData] = useState<CheckWaterResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!city || !state) {
      setError("Missing city or state. Please go back and try again.");
      setLoading(false);
      return;
    }

    async function fetchData() {
      try {
        const body: Record<string, string> = { city, state };
        if (zip) body.zip = zip;

        const res = await fetch("/api/check-water", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });

        if (!res.ok) {
          throw new Error("Failed to check water quality");
        }

        const result: CheckWaterResponse = await res.json();
        setData(result);
      } catch {
        setError(
          "Something went wrong while checking water data. Please try again."
        );
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [city, state, zip]);

  if (loading) {
    return (
      <div className="water-bg flex min-h-[calc(100vh-3.5rem)] items-center justify-center px-6">
        <div className="w-full max-w-2xl space-y-6">
          {/* Loading skeleton */}
          <div className="space-y-2 text-center">
            <div className="mx-auto h-4 w-48 shimmer rounded" />
            <div className="mx-auto h-8 w-64 shimmer rounded mt-2" />
          </div>
          <div className="h-56 w-full shimmer rounded-2xl" />
          <div className="space-y-3">
            <div className="h-20 w-full shimmer rounded-xl" />
            <div className="h-20 w-full shimmer rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center px-6">
        <div className="max-w-md text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-2xl">
            !
          </div>
          <h2 className="text-xl font-bold text-slate-900">
            Something went wrong
          </h2>
          <p className="mt-2 text-sm text-slate-500">{error}</p>
          <Link
            href="/"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-slate-800 transition-colors"
          >
            Try again
          </Link>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="water-bg min-h-[calc(100vh-3.5rem)] px-6 py-12">
      <div className="mx-auto max-w-2xl">
        {/* Header */}
        <div className="mb-8 animate-in">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-slate-400 transition-colors hover:text-slate-700"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 19l-7-7 7-7"
              />
            </svg>
            New search
          </Link>
          <h1 className="mt-3 text-2xl font-bold text-slate-900">
            Results for{" "}
            <span className="text-cyan-700">
              {city}, {state}
            </span>
          </h1>
        </div>

        {/* Status card */}
        <div className="animate-in" style={{ animationDelay: "100ms" }}>
          <StatusCard
            status={data.status}
            summary={data.summary}
            systemName={data.systemName}
            violationCount={data.violationCount}
          />
        </div>

        {/* Contaminant levels from EWG */}
        {data.contaminantLevels && data.contaminantLevels.length > 0 && (
          <div className="mt-8 animate-in" style={{ animationDelay: "120ms" }}>
            <h2 className="mb-1 text-lg font-bold text-slate-900">
              Contaminant levels
            </h2>
            <p className="mb-4 text-xs text-slate-400">
              Measured levels in your water vs. health guidelines and federal limits
            </p>
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50">
                      <th className="px-4 py-3 font-medium text-slate-500">
                        Contaminant
                      </th>
                      <th className="px-4 py-3 font-medium text-slate-500">
                        Measured
                      </th>
                      <th className="px-4 py-3 font-medium text-slate-500">
                        Health Guideline
                      </th>
                      <th className="px-4 py-3 font-medium text-slate-500">
                        Legal Limit
                      </th>
                      <th className="px-4 py-3 font-medium text-slate-500">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.contaminantLevels.map((c) => (
                      <ContaminantLevelRow key={c.name} c={c} />
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Contaminant summaries */}
        {data.contaminants && data.contaminants.length > 0 && (
          <div className="mt-8 animate-in" style={{ animationDelay: "150ms" }}>
            <h2 className="mb-4 text-lg font-bold text-slate-900">
              Contaminants detected
            </h2>
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50">
                      <th className="px-4 py-3 font-medium text-slate-500">
                        Contaminant
                      </th>
                      <th className="px-4 py-3 text-center font-medium text-slate-500">
                        Violations
                      </th>
                      <th className="px-4 py-3 font-medium text-slate-500">
                        Measured / Limit
                      </th>
                      <th className="px-4 py-3 font-medium text-slate-500">
                        Last Date
                      </th>
                      <th className="px-4 py-3 font-medium text-slate-500">
                        Health Risk
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.contaminants.map((c) => (
                      <ContaminantRow
                        key={c.contaminantCode}
                        c={c}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Lead & Copper — latest result per contaminant only */}
        {(() => {
          if (!data.leadCopperResults?.length) return null;
          const seen = new Set<string>();
          const latest = data.leadCopperResults.filter((s) => {
            if (seen.has(s.contaminantCode)) return false;
            seen.add(s.contaminantCode);
            return true;
          });
          if (!latest.length) return null;
          return (
            <div className="mt-8 animate-in" style={{ animationDelay: "200ms" }}>
              <h2 className="mb-4 text-lg font-bold text-slate-900">
                Lead &amp; Copper testing
              </h2>
              <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50">
                        <th className="px-4 py-3 font-medium text-slate-500">Contaminant</th>
                        <th className="px-4 py-3 font-medium text-slate-500">90th Percentile</th>
                        <th className="px-4 py-3 font-medium text-slate-500">Action Level</th>
                        <th className="px-4 py-3 font-medium text-slate-500">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {latest.map((s) => (
                        <tr key={s.contaminantCode} className={`border-b border-slate-50 last:border-0 ${s.exceedance ? "bg-red-50/40" : ""}`}>
                          <td className="px-4 py-3 font-medium text-slate-700">{s.contaminantName}</td>
                          <td className="px-4 py-3 text-slate-700">
                            {s.result90thPercentile != null ? `${s.result90thPercentile} ${s.unit ?? ""}` : "--"}
                          </td>
                          <td className="px-4 py-3 text-slate-500">
                            {s.actionLevel != null ? `${s.actionLevel} ${s.unit ?? ""}` : "--"}
                          </td>
                          <td className="px-4 py-3">
                            {s.exceedance ? (
                              <span className="inline-flex items-center rounded-full bg-red-50 px-2 py-0.5 text-xs font-medium text-red-700">Exceeds AL</span>
                            ) : (
                              <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700">Within limit</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          );
        })()}

        {/* Recommendations */}
        {data.recommendations.length > 0 && (
          <div className="mt-8 animate-in" style={{ animationDelay: "250ms" }}>
            <h2 className="mb-4 text-lg font-bold text-slate-900">
              What to do next
            </h2>
            <div className="stagger-children space-y-3">
              {data.recommendations.map((rec, i) => (
                <RecommendationCard
                  key={rec.title}
                  recommendation={rec}
                  index={i}
                />
              ))}
            </div>
          </div>
        )}

        {/* Violations detail */}
        {data.recentViolations.length > 0 && (
          <div className="mt-8 animate-in" style={{ animationDelay: "350ms" }}>
            <h2 className="mb-4 text-lg font-bold text-slate-900">
              Recent violations
            </h2>
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50">
                      <th className="px-4 py-3 font-medium text-slate-500">
                        Violation
                      </th>
                      <th className="px-4 py-3 font-medium text-slate-500">
                        Measured / Limit
                      </th>
                      <th className="px-4 py-3 font-medium text-slate-500">
                        Date
                      </th>
                      <th className="px-4 py-3 font-medium text-slate-500">
                        Health-Based
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.recentViolations.map((v, i) => (
                      <tr
                        key={`${v.code}-${v.beginDate}-${i}`}
                        className="border-b border-slate-50 last:border-0"
                      >
                        <td className="px-4 py-3">
                          <div className="text-slate-700">{v.name}</div>
                          <div className="text-xs text-slate-400">
                            {v.contaminantName}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <MeasuredVsMCL
                            measured={v.measuredLevel}
                            mcl={v.federalMCL ?? v.stateMCL}
                            unit={v.unit}
                          />
                        </td>
                        <td className="px-4 py-3 font-mono text-xs text-slate-500">
                          {v.beginDate
                            ? new Date(v.beginDate).toLocaleDateString()
                            : "—"}
                        </td>
                        <td className="px-4 py-3">
                          {v.isHealthBased ? (
                            <span className="inline-flex items-center rounded-full bg-red-50 px-2 py-0.5 text-xs font-medium text-red-700">
                              Yes
                            </span>
                          ) : (
                            <span className="text-xs text-slate-400">No</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Disclaimer */}
        <p className="mt-10 text-center text-xs text-slate-400">
          Data sourced from EPA SDWIS via Envirofacts and EWG Tap Water Database.
          This is not a substitute for professional water testing.
        </p>
      </div>
    </div>
  );
}

export default function ResultPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-cyan-500" />
        </div>
      }
    >
      <ResultContent />
    </Suspense>
  );
}
