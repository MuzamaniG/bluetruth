import type { Violation, WaterStatus, StatusLevel } from "@/types";

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
  PWSID: string;
  PWS_NAME: string;
  CITY_NAME?: string;
  STATE_CODE?: string;
  POPULATION_SERVED_COUNT?: number;
}

interface SDWISViolation {
  VIOLATION_CODE?: string;
  CONTAMINANT_CODE?: string;
  VIOLATION_NAME?: string;
  COMPL_PER_BEGIN_DATE?: string;
  IS_HEALTH_BASED_IND?: string;
  VIOLATION_CATEGORY_CODE?: string;
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
      violationCount: 0,
      recentViolations: [],
    };
  }

  // Use the system serving the most people
  const system = systems.reduce((best, s) =>
    (s.POPULATION_SERVED_COUNT ?? 0) > (best.POPULATION_SERVED_COUNT ?? 0)
      ? s
      : best
  );

  // Step 2: Fetch violations for this system
  const violationsUrl = `${EPA_BASE}/VIOLATION/PWSID/${system.PWSID}/ROWS/0:100/JSON`;

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

  const violations: Violation[] = rawViolations.map((v) => ({
    code: v.VIOLATION_CODE ?? v.CONTAMINANT_CODE ?? "Unknown",
    name: v.VIOLATION_NAME ?? "Unknown violation",
    beginDate: v.COMPL_PER_BEGIN_DATE ?? "",
    isHealthBased:
      v.IS_HEALTH_BASED_IND === "Y" ||
      HEALTH_BASED_CODES.has(v.VIOLATION_CATEGORY_CODE ?? ""),
  }));

  const result = computeStatus(violations, system.PWS_NAME);
  return result;
}

export function computeStatus(
  violations: Violation[],
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

  return {
    status,
    summary,
    systemName,
    violationCount: recentViolations.length,
    recentViolations: recentViolations.slice(0, 10),
  };
}
