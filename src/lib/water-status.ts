import type {
  Violation,
  WaterStatus,
  StatusLevel,
  ContaminantSummary,
  LeadCopperSample,
} from "@/types";
import { getContaminantName } from "@/lib/contaminant-codes";

const EPA_BASE = "https://data.epa.gov/efservice";

// Health-based violation codes (MCL, TT, etc.)
const HEALTH_BASED_CODES = new Set([
  "01", "02", "03", "04", "05", "06", "07",
  "09", "10", "11", "12", "13", "14",
  "21", "22", "23", "24", "25", "26", "27",
  "28", "29", "30", "31", "32", "33", "34",
  "35", "36", "37", "38", "39", "40", "41",
  "42", "43", "44", "45", "46",
]);

interface SDWISWaterSystem {
  pwsid: string;
  pws_name: string;
  city_name?: string;
  state_code?: string;
  population_served_count?: number;
}

interface SDWISViolation {
  violation_code?: string;
  contaminant_code?: string;
  compl_per_begin_date?: string;
  is_health_based_ind?: string;
  violation_category_code?: string;
  viol_measure?: number | string | null;
  unit_of_measure?: string | null;
  state_mcl?: number | string | null;
  rtc_date?: string | null;
  rule_code?: string | null;
}

interface SDWISLCRSample {
  sample_id?: string;
  pwsid?: string;
  contaminant_code?: string;
  sample_measure?: number | null;
  unit_of_measure?: string | null;
}

function parseNumber(val: unknown): number | null {
  if (val == null || val === "") return null;
  const n = Number(val);
  return isNaN(n) ? null : n;
}

export async function querySDWIS(
  city: string,
  state: string
): Promise<WaterStatus> {
  const stateCode = state.toUpperCase().trim();
  const cityName = city.toUpperCase().trim();

  // Step 1: Find water systems in this city/state
  const systemsUrl = `${EPA_BASE}/WATER_SYSTEM/STATE_CODE/${stateCode}/CITY_NAME/${encodeURIComponent(cityName)}/ROWS/0:10/JSON`;

  let systems: SDWISWaterSystem[] = [];
  try {
    const res = await fetch(systemsUrl, { next: { revalidate: 3600 } });
    if (res.ok) {
      const data = await res.json();
      systems = Array.isArray(data) ? data : [];
    }
  } catch {
    // EPA API may be down
  }

  if (systems.length === 0) {
    return {
      status: "gray",
      summary:
        "We couldn't find a matching water system for this location. This may mean the city name doesn't match EPA records, or the area is served by a regional system.",
      systemName: null,
      pwsid: null,
      violationCount: 0,
      recentViolations: [],
      contaminants: [],
      leadCopperResults: [],
      contaminantLevels: [],
    };
  }

  // Use the system serving the most people
  const system = systems.reduce((best, s) =>
    (s.population_served_count ?? 0) > (best.population_served_count ?? 0)
      ? s
      : best
  );

  // Step 2: Fetch violations and LCR samples in parallel
  const [violations, leadCopperResults] = await Promise.all([
    fetchViolations(system.pwsid),
    fetchLeadCopperSamples(system.pwsid),
  ]);

  const result = computeStatus(violations, leadCopperResults, system.pws_name);
  result.pwsid = system.pwsid;
  return result;
}

async function fetchViolations(pwsid: string): Promise<Violation[]> {
  const violationsUrl = `${EPA_BASE}/VIOLATION/PWSID/${pwsid}/ROWS/0:100/JSON`;

  let rawViolations: SDWISViolation[] = [];
  try {
    const res = await fetch(violationsUrl, { next: { revalidate: 3600 } });
    if (res.ok) {
      const data = await res.json();
      rawViolations = Array.isArray(data) ? data : [];
    }
  } catch {
    // If we can't fetch violations, treat as no violations found
  }

  return rawViolations.map((v) => {
    const contaminantCode = v.contaminant_code ?? "";
    const contaminantName = contaminantCode
      ? getContaminantName(contaminantCode)
      : "Unknown";
    return {
      code: v.violation_code ?? contaminantCode ?? "Unknown",
      name: contaminantName,
      contaminantCode,
      contaminantName,
      beginDate: v.compl_per_begin_date ?? "",
      isHealthBased:
        v.is_health_based_ind === "Y" ||
        HEALTH_BASED_CODES.has(v.violation_category_code ?? ""),
      measuredLevel: parseNumber(v.viol_measure),
      unit: v.unit_of_measure ?? null,
      federalMCL: null,
      stateMCL: parseNumber(v.state_mcl),
      returnToComplianceDate: v.rtc_date ?? null,
      ruleCode: v.rule_code ?? null,
    };
  });
}

async function fetchLeadCopperSamples(
  pwsid: string
): Promise<LeadCopperSample[]> {
  const lcrUrl = `${EPA_BASE}/LCR_SAMPLE_RESULT/PWSID/${pwsid}/ROWS/0:50/JSON`;

  let rawSamples: SDWISLCRSample[] = [];
  try {
    const res = await fetch(lcrUrl, { next: { revalidate: 3600 } });
    if (res.ok) {
      const data = await res.json();
      rawSamples = Array.isArray(data) ? data : [];
    }
  } catch {
    // LCR data unavailable — not critical
  }

  // LCR uses PB90 (lead 90th percentile) and CU90 (copper 90th percentile)
  const ACTION_LEVELS: Record<string, number> = {
    PB90: 0.015,
    CU90: 1.3,
  };

  const LCR_NAMES: Record<string, string> = {
    PB90: "Lead (90th percentile)",
    CU90: "Copper (90th percentile)",
  };

  return rawSamples.map((s) => {
    const contaminantCode = s.contaminant_code ?? "";
    const result90th = parseNumber(s.sample_measure);
    const actionLevel = ACTION_LEVELS[contaminantCode] ?? null;
    return {
      sampleId: s.sample_id ?? "",
      pwsid: s.pwsid ?? "",
      samplingPeriod: "",
      contaminantCode,
      contaminantName:
        LCR_NAMES[contaminantCode] ?? getContaminantName(contaminantCode),
      result90thPercentile: result90th,
      unit: s.unit_of_measure ?? null,
      actionLevel,
      exceedance:
        result90th != null && actionLevel != null && result90th > actionLevel,
    };
  });
}

function buildContaminantSummaries(
  violations: Violation[]
): ContaminantSummary[] {
  const map = new Map<string, ContaminantSummary>();

  for (const v of violations) {
    const key = v.contaminantCode || v.code;
    const existing = map.get(key);

    if (!existing) {
      map.set(key, {
        contaminantCode: v.contaminantCode || v.code,
        contaminantName: v.contaminantName,
        violationCount: 1,
        mostRecentDate: v.beginDate,
        highestMeasuredLevel: v.measuredLevel,
        unit: v.unit,
        mcl: v.stateMCL,
        isHealthBased: v.isHealthBased,
      });
    } else {
      existing.violationCount++;
      if (
        v.beginDate &&
        (!existing.mostRecentDate || v.beginDate > existing.mostRecentDate)
      ) {
        existing.mostRecentDate = v.beginDate;
      }
      if (
        v.measuredLevel != null &&
        (existing.highestMeasuredLevel == null ||
          v.measuredLevel > existing.highestMeasuredLevel)
      ) {
        existing.highestMeasuredLevel = v.measuredLevel;
        existing.unit = v.unit;
      }
      if (v.isHealthBased) {
        existing.isHealthBased = true;
      }
      if (existing.mcl == null) {
        existing.mcl = v.stateMCL;
      }
    }
  }

  return Array.from(map.values()).sort(
    (a, b) => b.violationCount - a.violationCount
  );
}

export function computeStatus(
  violations: Violation[],
  leadCopperResults: LeadCopperSample[],
  systemName: string
): WaterStatus {
  const fiveYearsAgo = new Date();
  fiveYearsAgo.setFullYear(fiveYearsAgo.getFullYear() - 5);

  const recentViolations = violations.filter((v) => {
    if (!v.beginDate) return false;
    const date = new Date(v.beginDate);
    return date >= fiveYearsAgo;
  });

  const recentHealthViolations = recentViolations.filter(
    (v) => v.isHealthBased
  );
  const recentNonHealthViolations = recentViolations.filter(
    (v) => !v.isHealthBased
  );

  let status: StatusLevel;
  let summary: string;

  if (recentHealthViolations.length > 0) {
    status = "red";
    summary = `${systemName} has ${recentHealthViolations.length} health-based violation${recentHealthViolations.length > 1 ? "s" : ""} in the past 5 years. These involve contaminants that may pose a risk to human health.`;
  } else if (recentNonHealthViolations.length > 0) {
    status = "yellow";
    summary = `${systemName} has ${recentNonHealthViolations.length} non-health-based violation${recentNonHealthViolations.length > 1 ? "s" : ""} in the past 5 years. These are typically reporting or monitoring issues, not direct health risks.`;
  } else if (violations.length > 0) {
    status = "yellow";
    summary = `${systemName} has older violations on record but none in the past 5 years. The system appears to be in compliance currently.`;
  } else {
    status = "green";
    summary = `${systemName} has no violations on record. Your tap water meets all EPA safety standards.`;
  }

  const contaminants = buildContaminantSummaries(recentViolations);

  return {
    status,
    summary,
    systemName,
    pwsid: null,
    violationCount: recentViolations.length,
    recentViolations: recentViolations.slice(0, 10),
    contaminants,
    leadCopperResults,
    contaminantLevels: [],
  };
}
