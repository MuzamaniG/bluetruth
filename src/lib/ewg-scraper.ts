import * as cheerio from "cheerio";

export interface EWGRawContaminant {
  name: string;
  amount: string;
  amountValue: number | null;
  unit: string;
}

const EWG_BASE = "https://www.ewg.org/tapwater";

/**
 * Scrape EWG contaminant data by zip code.
 * Searches EWG for water systems in the zip, then scrapes the first result.
 */
export async function scrapeEWGByZip(
  zip: string
): Promise<EWGRawContaminant[]> {
  try {
    const searchUrl = `${EWG_BASE}/search-results.php?zip5=${encodeURIComponent(zip)}&searchtype=zip`;
    const searchHtml = await fetchPage(searchUrl);
    const $ = cheerio.load(searchHtml);

    // Find the first system link: system.php?pws=XXXXX
    let pwsid: string | null = null;
    $("a[href*='system.php?pws=']").each((_, el) => {
      if (!pwsid) {
        const href = $(el).attr("href") ?? "";
        const match = href.match(/pws=([A-Z0-9]+)/i);
        if (match) pwsid = match[1];
      }
    });

    if (!pwsid) return [];
    return scrapeEWGByPWSID(pwsid);
  } catch {
    return [];
  }
}

/**
 * Scrape EWG contaminant data directly by PWSID.
 */
export async function scrapeEWGByPWSID(
  pwsid: string
): Promise<EWGRawContaminant[]> {
  try {
    const url = `${EWG_BASE}/system.php?pws=${encodeURIComponent(pwsid)}`;
    const html = await fetchPage(url);
    return parseEWGSystemPage(html);
  } catch {
    return [];
  }
}

async function fetchPage(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (compatible; TapCheck/1.0; water-safety-checker)",
      Accept: "text/html,application/xhtml+xml",
    },
    signal: AbortSignal.timeout(10000),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.text();
}

/**
 * Parse contaminant data from an EWG system page HTML.
 * Uses cheerio to extract from .contaminant-grid-item elements.
 */
function parseEWGSystemPage(html: string): EWGRawContaminant[] {
  const $ = cheerio.load(html);
  const contaminants: EWGRawContaminant[] = [];
  const seen = new Set<string>();

  $(".contaminant-grid-item").each((_, el) => {
    const name = $(el).find("h3").first().text().trim();
    const utilityText = $(el).find(".this-utility-text").first().text().trim();

    if (!name || !utilityText) return;

    // Parse "This Utility: 5.45 ppb"
    const match = utilityText.match(
      /This Utility:\s*([0-9.,]+)\s*(ppb|ppm|ppt|pCi\/L|mg\/L)/i
    );
    if (!match) return;

    const key = name.toLowerCase();
    if (seen.has(key)) return;
    seen.add(key);

    const rawValue = match[1].replace(/,/g, "");
    const amountValue = parseFloat(rawValue);

    contaminants.push({
      name,
      amount: `${match[1]} ${match[2]}`,
      amountValue: isNaN(amountValue) ? null : amountValue,
      unit: match[2],
    });
  });

  return contaminants;
}
