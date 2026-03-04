/**
 * EPA contaminant code → human-readable name mapping.
 * Covers the ~90 most commonly regulated contaminants in SDWIS.
 * Codes sourced from EPA SDWIS contaminant reference tables.
 */
export const CONTAMINANT_NAMES: Record<string, string> = {
  // Inorganic Chemicals (IOCs)
  "1005": "Barium",
  "1010": "Cadmium",
  "1015": "Chromium",
  "1020": "Fluoride",
  "1024": "Mercury (inorganic)",
  "1025": "Nickel",
  "1030": "Nitrate",
  "1035": "Selenium",
  "1038": "Antimony",
  "1040": "Arsenic",
  "1041": "Beryllium",
  "1045": "Cyanide",
  "1050": "Thallium",
  "1074": "Nitrite",
  "1075": "Total Nitrate/Nitrite",
  "1085": "Asbestos",

  // Lead & Copper
  "1022": "Lead",
  "1028": "Copper",

  // Volatile Organic Chemicals (VOCs)
  "2039": "Toluene",
  "2040": "Benzene",
  "2041": "Carbon tetrachloride",
  "2042": "1,2-Dichloroethane",
  "2043": "Trichloroethylene",
  "2044": "para-Dichlorobenzene",
  "2045": "1,1-Dichloroethylene",
  "2046": "1,1,1-Trichloroethane",
  "2048": "Vinyl chloride",
  "2050": "1,2-Dichloropropane",
  "2051": "Ethylbenzene",
  "2053": "Monochlorobenzene",
  "2054": "o-Dichlorobenzene",
  "2055": "cis-1,2-Dichloroethylene",
  "2056": "trans-1,2-Dichloroethylene",
  "2059": "Styrene",
  "2060": "Tetrachloroethylene",
  "2061": "Methyl tert-butyl ether (MTBE)",
  "2064": "Xylenes (total)",
  "2105": "Dichloromethane",
  "2380": "1,2,4-Trichlorobenzene",
  "2969": "Total Trihalomethanes (TTHM)",
  "2950": "Haloacetic Acids (HAA5)",

  // Synthetic Organic Chemicals (SOCs)
  "2001": "2,4-D",
  "2002": "2,4,5-TP (Silvex)",
  "2005": "Toxaphene",
  "2010": "Endrin",
  "2015": "Lindane",
  "2020": "Methoxychlor",
  "2021": "Total Trihalomethanes",
  "2031": "Heptachlor",
  "2032": "Heptachlor epoxide",
  "2065": "Alachlor",
  "2066": "Atrazine",
  "2067": "Carbofuran",
  "2068": "Chlordane",
  "2069": "Dibromochloropropane (DBCP)",
  "2070": "1,2-Dibromoethane (EDB)",
  "2071": "Pentachlorophenol",
  "2072": "Benzo(a)pyrene",
  "2074": "Di(2-ethylhexyl) adipate",
  "2075": "Di(2-ethylhexyl) phthalate",
  "2076": "Dinoseb",
  "2077": "Diquat",
  "2078": "Endothall",
  "2079": "Glyphosate",
  "2080": "Hexachlorobenzene",
  "2081": "Hexachlorocyclopentadiene",
  "2083": "Oxamyl (Vydate)",
  "2084": "Picloram",
  "2085": "Simazine",
  "2090": "Dalapon",
  "2274": "PCBs (Polychlorinated biphenyls)",

  // Disinfection Byproducts
  "2456": "Bromate",
  "2326": "Chlorite",

  // Disinfectants
  "0100": "Chlorine (free)",
  "0200": "Chloramines",
  "0300": "Chlorine dioxide",
  "0999": "Total Chlorine",

  // Radionuclides
  "4000": "Gross Alpha (excl. radon & uranium)",
  "4002": "Gross Alpha (incl. radon & uranium)",
  "4006": "Combined Radium (226 + 228)",
  "4010": "Radium-226",
  "4020": "Radium-228",
  "4100": "Gross Beta",
  "4101": "Tritium",
  "4102": "Strontium-90",
  "4200": "Uranium",

  // Microbiological
  "3100": "Total Coliform",
  "3013": "Fecal Coliform / E. coli",
  "3014": "E. coli",

  // Treatment Technique / Surface Water Rules
  "0400": "Cryptosporidium",
  "0500": "Giardia lamblia",
  "0600": "Legionella",
  "0700": "Heterotrophic Plate Count",
  "0800": "Viruses (enteric)",
  "0900": "Turbidity",
  "1000": "Total Organic Carbon",

  // PFAS (emerging - newer codes)
  "2167": "PFOS",
  "2168": "PFOA",
  "2169": "PFAS (total)",
};

/**
 * Look up a human-readable name for an EPA contaminant code.
 * Falls back to "Contaminant {code}" if not found.
 */
export function getContaminantName(code: string): string {
  return CONTAMINANT_NAMES[code] ?? `Contaminant ${code}`;
}
