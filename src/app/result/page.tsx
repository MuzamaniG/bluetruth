"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import StatusCard from "@/components/StatusCard";
import RecommendationCard from "@/components/RecommendationCard";
import type { CheckWaterResponse } from "@/types";

function ResultContent() {
  const searchParams = useSearchParams();
  const city = searchParams.get("city") ?? "";
  const state = searchParams.get("state") ?? "";

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
        const res = await fetch("/api/check-water", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ city, state }),
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
  }, [city, state]);

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

        {/* Recommendations */}
        {data.recommendations.length > 0 && (
          <div className="mt-8 animate-in" style={{ animationDelay: "200ms" }}>
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
          <div className="mt-8 animate-in" style={{ animationDelay: "300ms" }}>
            <h2 className="mb-4 text-lg font-bold text-slate-900">
              Recent violations
            </h2>
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50">
                    <th className="px-4 py-3 font-medium text-slate-500">
                      Violation
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
                      <td className="px-4 py-3 text-slate-700">{v.name}</td>
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
        )}

        {/* Disclaimer */}
        <p className="mt-10 text-center text-xs text-slate-400">
          Data sourced from EPA SDWIS via Envirofacts. This is not a substitute
          for professional water testing.
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
