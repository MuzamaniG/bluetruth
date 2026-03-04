export type StatusLevel = "green" | "yellow" | "red" | "gray";

export interface Violation {
  code: string;
  name: string;
  contaminantCode: string;
  contaminantName: string;
  beginDate: string;
  isHealthBased: boolean;
  measuredLevel: number | null;
  unit: string | null;
  federalMCL: number | null;
  stateMCL: number | null;
  returnToComplianceDate: string | null;
  ruleCode: string | null;
}

export interface ContaminantSummary {
  contaminantCode: string;
  contaminantName: string;
  violationCount: number;
  mostRecentDate: string;
  highestMeasuredLevel: number | null;
  unit: string | null;
  mcl: number | null;
  isHealthBased: boolean;
}

export interface LeadCopperSample {
  sampleId: string;
  pwsid: string;
  samplingPeriod: string;
  contaminantCode: string;
  contaminantName: string;
  result90thPercentile: number | null;
  unit: string | null;
  actionLevel: number | null;
  exceedance: boolean;
}

export interface ContaminantLevel {
  name: string;
  amount: number | null;
  unit: string;
  epaMCL: number | null;
  healthLimit: number | null;
  healthSource: string | null;
  rating: "red" | "yellow" | "green";
}

export interface WaterStatus {
  status: StatusLevel;
  summary: string;
  systemName: string | null;
  pwsid: string | null;
  violationCount: number;
  recentViolations: Violation[];
  contaminants: ContaminantSummary[];
  leadCopperResults: LeadCopperSample[];
  contaminantLevels: ContaminantLevel[];
}

export interface Lookup {
  id?: number;
  city: string;
  state: string;
  status: StatusLevel;
  summary: string;
  system_name: string | null;
  pwsid: string | null;
  violation_count: number;
  violations_json: string;
  contaminants_json: string;
  lead_copper_json: string;
  contaminant_levels_json: string;
  checked_at: string;
}

export interface Recommendation {
  status: StatusLevel;
  title: string;
  description: string;
}

export interface GeoResult {
  city: string;
  state: string;
  zip?: string;
}

export interface CheckWaterRequest {
  city: string;
  state: string;
  zip?: string;
}

export interface CheckWaterResponse {
  status: StatusLevel;
  summary: string;
  systemName: string | null;
  pwsid: string | null;
  violationCount: number;
  recentViolations: Violation[];
  contaminants: ContaminantSummary[];
  leadCopperResults: LeadCopperSample[];
  contaminantLevels: ContaminantLevel[];
  recommendations: Recommendation[];
}
