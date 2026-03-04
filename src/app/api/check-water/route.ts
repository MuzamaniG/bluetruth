import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { querySDWIS } from "@/lib/water-status";
import { scrapeEWGByZip, scrapeEWGByPWSID } from "@/lib/ewg-scraper";
import { getContaminantLimit } from "@/lib/epa-mcls";
import type {
  CheckWaterRequest,
  CheckWaterResponse,
  Recommendation,
  ContaminantLevel,
  Lookup,
} from "@/types";

async function geocodeCityToZip(
  city: string,
  state: string
): Promise<string | undefined> {
  const headers = { "User-Agent": "TapCheck/1.0 (water-safety-checker)" };

  // Step 1: Forward geocode city/state to get lat/lon
  const query = `${city}, ${state}, United States`;
  const searchUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`;
  const searchRes = await fetch(searchUrl, {
    headers,
    signal: AbortSignal.timeout(5000),
  });
  if (!searchRes.ok) return undefined;
  const searchData = await searchRes.json();
  if (!Array.isArray(searchData) || searchData.length === 0) return undefined;

  const { lat, lon } = searchData[0];
  if (!lat || !lon) return undefined;

  // Step 2: Reverse geocode lat/lon to get zip code
  const reverseUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`;
  const reverseRes = await fetch(reverseUrl, {
    headers,
    signal: AbortSignal.timeout(5000),
  });
  if (!reverseRes.ok) return undefined;
  const reverseData = await reverseRes.json();
  return reverseData?.address?.postcode || undefined;
}

const DEFAULT_RECOMMENDATIONS: Record<string, Recommendation[]> = {
  green: [
    {
      status: "green",
      title: "Stay informed",
      description:
        "Your water meets safety standards. Review your utility's annual Consumer Confidence Report for detailed testing results.",
    },
    {
      status: "green",
      title: "Basic maintenance",
      description:
        "Run cold water for 30 seconds before drinking if taps have been unused for several hours, especially in older homes.",
    },
  ],
  yellow: [
    {
      status: "yellow",
      title: "Check your CCR",
      description:
        "Request your utility's Consumer Confidence Report to understand what violations were found and how they were addressed.",
    },
    {
      status: "yellow",
      title: "Consider a filter",
      description:
        "An NSF-certified water filter can provide an extra layer of protection. Choose one rated for the specific contaminants of concern.",
    },
    {
      status: "yellow",
      title: "Test your water",
      description:
        "Home test kits or lab testing can tell you exactly what's in your tap water. Contact your local health department for guidance.",
    },
  ],
  red: [
    {
      status: "red",
      title: "Use an alternative source",
      description:
        "Consider using bottled water or a certified filtration system for drinking and cooking until violations are resolved.",
    },
    {
      status: "red",
      title: "Contact your utility",
      description:
        "Call your water utility to ask about the specific violations, corrective actions being taken, and expected timeline for resolution.",
    },
    {
      status: "red",
      title: "Get your water tested",
      description:
        "Have your water independently tested by a state-certified lab to understand your specific exposure levels.",
    },
    {
      status: "red",
      title: "Report concerns",
      description:
        "Contact your state drinking water agency or the EPA Safe Drinking Water Hotline at 1-800-426-4791.",
    },
  ],
  gray: [
    {
      status: "gray",
      title: "Try a different search",
      description:
        "Your city name may not match EPA records exactly. Try the county name or a nearby larger city.",
    },
    {
      status: "gray",
      title: "Check directly with EPA",
      description:
        "Search the EPA SDWIS database directly at epa.gov/enviro for your water system.",
    },
  ],
};

// Convert a value between units for comparison
function convertUnit(
  value: number,
  fromUnit: string,
  toUnit: string
): number {
  const from = fromUnit.toLowerCase();
  const to = toUnit.toLowerCase();
  if (from === to) return value;

  // Convert to ppb first
  let inPPB = value;
  if (from === "ppm" || from === "mg/l") inPPB = value * 1000;
  else if (from === "ppt") inPPB = value / 1000;

  // Convert from ppb to target
  if (to === "ppm" || to === "mg/l") return inPPB / 1000;
  if (to === "ppt") return inPPB * 1000;
  return inPPB;
}

function buildContaminantLevels(
  ewgData: { name: string; amountValue: number | null; unit: string }[]
): ContaminantLevel[] {
  return ewgData.map((c) => {
    const limit = getContaminantLimit(c.name);
    const ewgUnit = c.unit.toLowerCase();

    // Convert limits to EWG's display unit
    let displayMCL: number | null = null;
    let displayHealthLimit: number | null = null;

    if (limit) {
      const limUnit = limit.unit.toLowerCase();
      if (limit.mcl != null) {
        displayMCL = convertUnit(limit.mcl, limUnit, ewgUnit);
      }
      displayHealthLimit = convertUnit(limit.healthLimit, limUnit, ewgUnit);
    }

    // Determine rating: red/yellow/green
    let rating: "red" | "yellow" | "green" = "green";
    if (c.amountValue != null) {
      if (displayMCL != null && c.amountValue > displayMCL) {
        rating = "red"; // exceeds legal limit
      } else if (displayHealthLimit != null && c.amountValue > displayHealthLimit) {
        rating = "yellow"; // exceeds health guideline but within legal limit
      }
    }

    return {
      name: c.name,
      amount: c.amountValue,
      unit: c.unit,
      epaMCL: displayMCL,
      healthLimit: displayHealthLimit,
      healthSource: limit?.healthSource ?? null,
      rating,
    };
  });
}

export async function POST(request: NextRequest) {
  try {
    const body: CheckWaterRequest = await request.json();
    const { city, state, zip } = body;

    if (!city || !state) {
      return NextResponse.json(
        { error: "City and state are required" },
        { status: 400 }
      );
    }

    const normalizedCity = city.trim().toLowerCase();
    const normalizedState = state.trim().toUpperCase();

    // Check Supabase cache (< 24h old)
    let cached: Lookup | null = null;
    if (supabase) {
      try {
        const twentyFourHoursAgo = new Date(
          Date.now() - 24 * 60 * 60 * 1000
        ).toISOString();

        const { data } = await supabase
          .from("lookups")
          .select("*")
          .eq("city", normalizedCity)
          .eq("state", normalizedState)
          .gte("checked_at", twentyFourHoursAgo)
          .order("checked_at", { ascending: false })
          .limit(1)
          .single();

        cached = data as Lookup | null;
      } catch {
        // Supabase may not be configured — continue without cache
      }
    }

    if (cached) {
      const recommendations =
        DEFAULT_RECOMMENDATIONS[cached.status] ?? DEFAULT_RECOMMENDATIONS.gray;

      // Try to load custom recommendations from Supabase
      let customRecs: Recommendation[] | null = null;
      if (supabase) {
        try {
          const { data } = await supabase
            .from("recommendations")
            .select("*")
            .eq("status", cached.status);
          if (data && data.length > 0) {
            customRecs = data as Recommendation[];
          }
        } catch {
          // Use defaults
        }
      }

      const response: CheckWaterResponse = {
        status: cached.status,
        summary: cached.summary,
        systemName: cached.system_name,
        pwsid: cached.pwsid ?? null,
        violationCount: cached.violation_count,
        recentViolations: JSON.parse(cached.violations_json || "[]"),
        contaminants: JSON.parse(cached.contaminants_json || "[]"),
        leadCopperResults: JSON.parse(cached.lead_copper_json || "[]"),
        contaminantLevels: JSON.parse(
          cached.contaminant_levels_json || "[]"
        ),
        recommendations: customRecs ?? recommendations,
      };
      return NextResponse.json(response);
    }

    // Run EPA query and zip geocoding in parallel
    const resolvedZipPromise = zip
      ? Promise.resolve(zip)
      : geocodeCityToZip(normalizedCity, normalizedState).catch((e) => {
          console.error("[TapCheck] Geocode failed:", e);
          return undefined;
        });

    const [waterStatus, resolvedZip] = await Promise.all([
      querySDWIS(normalizedCity, normalizedState),
      resolvedZipPromise,
    ]);

    // Scrape EWG using resolved zip
    let contaminantLevels: ContaminantLevel[] = [];
    if (resolvedZip) {
      try {
        const ewgData = await scrapeEWGByZip(resolvedZip);
        console.log(`[TapCheck] EWG scrape for zip ${resolvedZip}: ${ewgData.length} contaminants`);
        if (ewgData.length > 0) {
          contaminantLevels = buildContaminantLevels(ewgData);
        }
      } catch (e) {
        console.error("[TapCheck] EWG scrape failed:", e);
      }
    } else {
      console.warn("[TapCheck] No zip code resolved, skipping EWG scrape");
    }

    waterStatus.contaminantLevels = contaminantLevels;

    // Store in Supabase cache
    if (supabase) {
      try {
        await supabase.from("lookups").insert({
          city: normalizedCity,
          state: normalizedState,
          status: waterStatus.status,
          summary: waterStatus.summary,
          system_name: waterStatus.systemName,
          pwsid: waterStatus.pwsid,
          violation_count: waterStatus.violationCount,
          violations_json: JSON.stringify(waterStatus.recentViolations),
          contaminants_json: JSON.stringify(waterStatus.contaminants),
          lead_copper_json: JSON.stringify(waterStatus.leadCopperResults),
          contaminant_levels_json: JSON.stringify(contaminantLevels),
          checked_at: new Date().toISOString(),
        });
      } catch {
        // Cache write failure is non-critical
      }
    }

    const recommendations =
      DEFAULT_RECOMMENDATIONS[waterStatus.status] ??
      DEFAULT_RECOMMENDATIONS.gray;

    const response: CheckWaterResponse = {
      ...waterStatus,
      recommendations,
    };

    return NextResponse.json(response);
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
