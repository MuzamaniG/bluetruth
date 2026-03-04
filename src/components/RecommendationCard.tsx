"use client";

import type { Recommendation } from "@/types";

interface RecommendationCardProps {
  recommendation: Recommendation;
  index: number;
}

export default function RecommendationCard({
  recommendation,
  index,
}: RecommendationCardProps) {
  return (
    <div
      className="group rounded-xl border border-slate-150 bg-white p-5 shadow-sm transition-all hover:shadow-md hover:border-slate-200"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <div className="flex items-start gap-3">
        <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-slate-100 font-mono text-xs font-bold text-slate-500">
          {index + 1}
        </span>
        <div>
          <h3 className="text-sm font-semibold text-slate-900">
            {recommendation.title}
          </h3>
          <p className="mt-1 text-sm leading-relaxed text-slate-500">
            {recommendation.description}
          </p>
        </div>
      </div>
    </div>
  );
}
