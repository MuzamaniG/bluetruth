// Contaminant limits from public sources:
// - EPA MCLs (Maximum Contaminant Levels) — federal enforceable limits
// - EPA Health Advisories
// - California PHGs (Public Health Goals) / CA MCLs
// - WHO drinking water guidelines
//
// healthLimit = the most protective public health guideline available
// mcl = federal legal limit (null if none exists)

export interface ContaminantLimit {
  mcl: number | null;
  healthLimit: number;
  healthSource: string; // e.g. "EPA MCL", "CA PHG", "WHO", "EPA HA"
  unit: string;
}

const LIMITS: Record<string, ContaminantLimit> = {
  // Disinfection byproducts
  "total trihalomethanes (tthms)": { mcl: 80, healthLimit: 0.15, healthSource: "CA PHG", unit: "ppb" },
  "haloacetic acids (haa5)": { mcl: 60, healthLimit: 0.1, healthSource: "CA PHG", unit: "ppb" },
  "haloacetic acids (haa9)": { mcl: null, healthLimit: 0.06, healthSource: "CA PHG", unit: "ppb" },
  "bromate": { mcl: 10, healthLimit: 0.1, healthSource: "CA PHG", unit: "ppb" },
  "chlorite": { mcl: 1000, healthLimit: 800, healthSource: "EPA MCLG", unit: "ppb" },
  "bromodichloromethane": { mcl: null, healthLimit: 0.06, healthSource: "CA PHG", unit: "ppb" },
  "bromoform": { mcl: null, healthLimit: 0.5, healthSource: "CA PHG", unit: "ppb" },
  "dibromochloromethane": { mcl: null, healthLimit: 0.1, healthSource: "CA PHG", unit: "ppb" },
  "chloroform": { mcl: null, healthLimit: 0.1, healthSource: "CA PHG", unit: "ppb" },
  "dichloroacetic acid": { mcl: null, healthLimit: 7, healthSource: "CA PHG", unit: "ppb" },
  "trichloroacetic acid": { mcl: null, healthLimit: 100, healthSource: "CA PHG", unit: "ppb" },

  // Disinfectants
  "chlorine": { mcl: 4000, healthLimit: 4000, healthSource: "EPA MCL", unit: "ppb" },
  "chloramine": { mcl: 4000, healthLimit: 4000, healthSource: "EPA MCL", unit: "ppb" },
  "chlorine dioxide": { mcl: 800, healthLimit: 800, healthSource: "EPA MCL", unit: "ppb" },
  "chlorate": { mcl: null, healthLimit: 210, healthSource: "EPA HA", unit: "ppb" },

  // Inorganic chemicals
  "arsenic": { mcl: 10, healthLimit: 0.004, healthSource: "CA PHG", unit: "ppb" },
  "barium": { mcl: 2000, healthLimit: 2000, healthSource: "EPA MCL", unit: "ppb" },
  "beryllium": { mcl: 4, healthLimit: 1, healthSource: "CA PHG", unit: "ppb" },
  "cadmium": { mcl: 5, healthLimit: 0.04, healthSource: "CA PHG", unit: "ppb" },
  "chromium": { mcl: 100, healthLimit: 100, healthSource: "EPA MCL", unit: "ppb" },
  "chromium (hexavalent)": { mcl: null, healthLimit: 0.02, healthSource: "CA PHG", unit: "ppb" },
  "copper": { mcl: 1300, healthLimit: 300, healthSource: "CA PHG", unit: "ppb" },
  "cyanide": { mcl: 200, healthLimit: 150, healthSource: "CA PHG", unit: "ppb" },
  "fluoride": { mcl: 4000, healthLimit: 1000, healthSource: "CA PHG", unit: "ppb" },
  "lead": { mcl: 15, healthLimit: 0.2, healthSource: "CA PHG", unit: "ppb" },
  "mercury": { mcl: 2, healthLimit: 1.2, healthSource: "CA PHG", unit: "ppb" },
  "nitrate": { mcl: 10000, healthLimit: 10000, healthSource: "EPA MCL", unit: "ppb" },
  "nitrite": { mcl: 1000, healthLimit: 1000, healthSource: "EPA MCL", unit: "ppb" },
  "selenium": { mcl: 50, healthLimit: 30, healthSource: "CA PHG", unit: "ppb" },
  "thallium": { mcl: 2, healthLimit: 0.1, healthSource: "CA PHG", unit: "ppb" },
  "antimony": { mcl: 6, healthLimit: 1, healthSource: "CA PHG", unit: "ppb" },

  // Contaminants without federal MCLs
  "manganese": { mcl: null, healthLimit: 100, healthSource: "EPA HA", unit: "ppb" },
  "molybdenum": { mcl: null, healthLimit: 40, healthSource: "EPA HA", unit: "ppb" },
  "strontium": { mcl: null, healthLimit: 1500, healthSource: "EPA HA", unit: "ppb" },
  "vanadium": { mcl: null, healthLimit: 21, healthSource: "EPA HA", unit: "ppb" },
  "total chromium": { mcl: 100, healthLimit: 100, healthSource: "EPA MCL", unit: "ppb" },
  "uranium": { mcl: 30, healthLimit: 20, healthSource: "CA PHG", unit: "ppb" },
  "nickel": { mcl: null, healthLimit: 12, healthSource: "CA PHG", unit: "ppb" },
  "boron": { mcl: null, healthLimit: 1000, healthSource: "WHO", unit: "ppb" },
  "aluminum": { mcl: null, healthLimit: 200, healthSource: "WHO", unit: "ppb" },
  "zinc": { mcl: null, healthLimit: 2000, healthSource: "EPA HA", unit: "ppb" },
  "iron": { mcl: null, healthLimit: 300, healthSource: "EPA SMCL", unit: "ppb" },

  // Radionuclides
  "radium-226": { mcl: null, healthLimit: 0.05, healthSource: "CA PHG", unit: "pCi/L" },
  "radium-228": { mcl: null, healthLimit: 0.02, healthSource: "CA PHG", unit: "pCi/L" },
  "combined radium (-226 & -228)": { mcl: 5, healthLimit: 0.05, healthSource: "CA PHG", unit: "pCi/L" },
  "gross alpha particles": { mcl: 15, healthLimit: 15, healthSource: "EPA MCL", unit: "pCi/L" },
  "gross beta particles": { mcl: 50, healthLimit: 50, healthSource: "EPA MCL", unit: "pCi/L" },

  // Organic chemicals
  "atrazine": { mcl: 3, healthLimit: 0.15, healthSource: "CA PHG", unit: "ppb" },
  "benzene": { mcl: 5, healthLimit: 0.15, healthSource: "CA PHG", unit: "ppb" },
  "carbon tetrachloride": { mcl: 5, healthLimit: 0.1, healthSource: "CA PHG", unit: "ppb" },
  "chlorobenzene": { mcl: 100, healthLimit: 70, healthSource: "CA PHG", unit: "ppb" },
  "1,2-dichloroethane": { mcl: 5, healthLimit: 0.4, healthSource: "CA PHG", unit: "ppb" },
  "1,1-dichloroethylene": { mcl: 7, healthLimit: 7, healthSource: "EPA MCL", unit: "ppb" },
  "cis-1,2-dichloroethylene": { mcl: 70, healthLimit: 70, healthSource: "EPA MCL", unit: "ppb" },
  "trans-1,2-dichloroethylene": { mcl: 100, healthLimit: 100, healthSource: "EPA MCL", unit: "ppb" },
  "dichloromethane": { mcl: 5, healthLimit: 4, healthSource: "CA PHG", unit: "ppb" },
  "ethylbenzene": { mcl: 700, healthLimit: 300, healthSource: "CA MCL", unit: "ppb" },
  "styrene": { mcl: 100, healthLimit: 0.5, healthSource: "CA PHG", unit: "ppb" },
  "tetrachloroethylene": { mcl: 5, healthLimit: 0.06, healthSource: "CA PHG", unit: "ppb" },
  "toluene": { mcl: 1000, healthLimit: 150, healthSource: "CA MCL", unit: "ppb" },
  "trichloroethylene": { mcl: 5, healthLimit: 0.8, healthSource: "CA PHG", unit: "ppb" },
  "vinyl chloride": { mcl: 2, healthLimit: 0.05, healthSource: "CA PHG", unit: "ppb" },
  "xylenes": { mcl: 10000, healthLimit: 1750, healthSource: "CA MCL", unit: "ppb" },

  // Other
  "dibromoacetic acid": { mcl: null, healthLimit: 0.1, healthSource: "CA PHG", unit: "ppb" },
  "monochloroacetic acid": { mcl: null, healthLimit: 20, healthSource: "WHO", unit: "ppb" },
  "nitrate and nitrite": { mcl: null, healthLimit: 10, healthSource: "EPA MCL", unit: "ppm" },

  // PFAS
  "pfoa": { mcl: 4, healthLimit: 4, healthSource: "EPA MCL", unit: "ppt" },
  "pfos": { mcl: 4, healthLimit: 4, healthSource: "EPA MCL", unit: "ppt" },
  "pfna": { mcl: 10, healthLimit: 10, healthSource: "EPA MCL", unit: "ppt" },
  "pfhxs": { mcl: 10, healthLimit: 10, healthSource: "EPA MCL", unit: "ppt" },
  "genx": { mcl: 10, healthLimit: 10, healthSource: "EPA MCL", unit: "ppt" },
  "perfluorooctanoic acid (pfoa)": { mcl: 4, healthLimit: 4, healthSource: "EPA MCL", unit: "ppt" },
  "perfluorooctane sulfonate (pfos)": { mcl: 4, healthLimit: 4, healthSource: "EPA MCL", unit: "ppt" },
  "perfluorononanoic acid (pfna)": { mcl: 10, healthLimit: 10, healthSource: "EPA MCL", unit: "ppt" },
  "perfluorohexane sulfonate (pfhxs)": { mcl: 10, healthLimit: 10, healthSource: "EPA MCL", unit: "ppt" },
};

export function getContaminantLimit(
  contaminantName: string
): ContaminantLimit | null {
  const key = contaminantName.toLowerCase().trim();
  return LIMITS[key] ?? null;
}
