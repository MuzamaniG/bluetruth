"use client";

import type { StatusLevel } from "@/types";

interface StatusCardProps {
  status: StatusLevel;
  summary: string;
  systemName: string | null;
  violationCount: number;
}

const STATUS_CONFIG = {
  green: {
    label: "Safe to Drink",
    icon: "✓",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    accent: "bg-emerald-500",
    text: "text-emerald-900",
    iconBg: "bg-emerald-500",
    glow: "shadow-emerald-100",
  },
  yellow: {
    label: "Use Caution",
    icon: "!",
    bg: "bg-amber-50",
    border: "border-amber-200",
    accent: "bg-amber-500",
    text: "text-amber-900",
    iconBg: "bg-amber-500",
    glow: "shadow-amber-100",
  },
  red: {
    label: "Health Risk",
    icon: "✕",
    bg: "bg-red-50",
    border: "border-red-200",
    accent: "bg-red-500",
    text: "text-red-900",
    iconBg: "bg-red-600",
    glow: "shadow-red-100",
  },
  gray: {
    label: "Unknown",
    icon: "?",
    bg: "bg-slate-50",
    border: "border-slate-200",
    accent: "bg-slate-400",
    text: "text-slate-700",
    iconBg: "bg-slate-400",
    glow: "shadow-slate-100",
  },
};

export default function StatusCard({
  status,
  summary,
  systemName,
  violationCount,
}: StatusCardProps) {
  const config = STATUS_CONFIG[status];

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border ${config.border} ${config.bg} shadow-lg ${config.glow} transition-all duration-500 animate-in fade-in`}
    >
      {/* Top accent bar */}
      <div className={`h-1.5 w-full ${config.accent}`} />

      <div className="p-8 sm:p-10">
        {/* Status badge */}
        <div className="flex items-start gap-5">
          <div
            className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl ${config.iconBg} text-2xl font-bold text-white shadow-md`}
          >
            {config.icon}
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-mono text-xs tracking-[0.2em] text-slate-400 uppercase">
              Water Safety Status
            </p>
            <h2 className={`mt-1 text-3xl font-bold tracking-tight ${config.text}`}>
              {config.label}
            </h2>
            {systemName && (
              <p className="mt-1 text-sm text-slate-500 truncate">
                {systemName}
              </p>
            )}
          </div>
        </div>

        {/* Summary */}
        <p className="mt-6 text-base leading-relaxed text-slate-700">
          {summary}
        </p>

        {/* Stats row */}
        {violationCount > 0 && (
          <div className="mt-6 flex items-center gap-2 rounded-lg bg-white/60 px-4 py-3 backdrop-blur-sm">
            <span className="font-mono text-2xl font-bold text-slate-900">
              {violationCount}
            </span>
            <span className="text-sm text-slate-500">
              violation{violationCount !== 1 ? "s" : ""} in the past 5 years
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
