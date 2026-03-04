import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { querySDWIS } from "@/lib/water-status";
import type {
  CheckWaterRequest,
  CheckWaterResponse,
  Recommendation,
  Lookup,
} from "@/types";

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

export async function POST(request: NextRequest) {
  try {
    const body: CheckWaterRequest = await request.json();
    const { city, state } = body;

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
        violationCount: cached.violation_count,
        recentViolations: JSON.parse(cached.violations_json || "[]"),
        recommendations: customRecs ?? recommendations,
      };
      return NextResponse.json(response);
    }

    // Cache miss: query EPA
    const waterStatus = await querySDWIS(normalizedCity, normalizedState);

    // Store in Supabase cache
    if (supabase) {
      try {
        await supabase.from("lookups").insert({
          city: normalizedCity,
          state: normalizedState,
          status: waterStatus.status,
          summary: waterStatus.summary,
          system_name: waterStatus.systemName,
          violation_count: waterStatus.violationCount,
          violations_json: JSON.stringify(waterStatus.recentViolations),
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
