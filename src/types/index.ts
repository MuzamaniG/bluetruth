export type StatusLevel = "green" | "yellow" | "red" | "gray";

export interface WaterStatus {
  status: StatusLevel;
  summary: string;
  systemName: string | null;
  violationCount: number;
  recentViolations: Violation[];
}

export interface Violation {
  code: string;
  name: string;
  beginDate: string;
  isHealthBased: boolean;
}

export interface Lookup {
  id?: number;
  city: string;
  state: string;
  status: StatusLevel;
  summary: string;
  system_name: string | null;
  violation_count: number;
  violations_json: string;
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
}

export interface CheckWaterRequest {
  city: string;
  state: string;
}

export interface CheckWaterResponse {
  status: StatusLevel;
  summary: string;
  systemName: string | null;
  violationCount: number;
  recentViolations: Violation[];
  recommendations: Recommendation[];
}
