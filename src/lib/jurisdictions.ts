import fs from "node:fs";
import path from "node:path";
import Papa from "papaparse";

// Anchored to the project root so it resolves identically in `astro dev`,
// `astro build`, and the Cloudflare Pages build (all run from the repo root).
const DATA_DIR = path.resolve(process.cwd(), "src/data");

function readCsv(file: string): Record<string, string>[] {
  const text = fs.readFileSync(path.join(DATA_DIR, file), "utf-8");
  return Papa.parse<Record<string, string>>(text, {
    header: true,
    skipEmptyLines: true,
  }).data;
}

// Values in the archive that mean "not available," shown to users as a gap.
const SENTINELS = new Set([
  "",
  "n/a",
  "na",
  "none",
  "not publicly available",
  "not available",
  "no ncpg affiliate",
  "not disclosed",
  "unknown",
  "tbd",
]);

function clean(v: string | undefined): string | null {
  if (!v) return null;
  const t = v.trim();
  const low = t.toLowerCase();
  if (SENTINELS.has(low)) return null;
  if (low.startsWith("not found")) return null;
  if (low.startsWith("no ncpg affiliate")) return null;
  return t;
}

export function toSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/\./g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

const ABBR: Record<string, string> = {
  Alabama: "AL", Alaska: "AK", Arizona: "AZ", Arkansas: "AR", California: "CA",
  Colorado: "CO", Connecticut: "CT", Delaware: "DE", "District of Columbia": "DC",
  Florida: "FL", Georgia: "GA", Hawaii: "HI", Idaho: "ID", Illinois: "IL",
  Indiana: "IN", Iowa: "IA", Kansas: "KS", Kentucky: "KY", Louisiana: "LA",
  Maine: "ME", Maryland: "MD", Massachusetts: "MA", Michigan: "MI", Minnesota: "MN",
  Mississippi: "MS", Missouri: "MO", Montana: "MT", Nebraska: "NE", Nevada: "NV",
  "New Hampshire": "NH", "New Jersey": "NJ", "New Mexico": "NM", "New York": "NY",
  "North Carolina": "NC", "North Dakota": "ND", Ohio: "OH", Oklahoma: "OK",
  Oregon: "OR", Pennsylvania: "PA", "Rhode Island": "RI", "South Carolina": "SC",
  "South Dakota": "SD", Tennessee: "TN", Texas: "TX", Utah: "UT", Vermont: "VT",
  Virginia: "VA", Washington: "WA", "West Virginia": "WV", Wisconsin: "WI",
  Wyoming: "WY", "Puerto Rico": "PR", "US Virgin Islands": "VI", Guam: "GU",
  "American Samoa": "AS", "Northern Mariana Islands": "MP",
};

const TERRITORIES = new Set([
  "Puerto Rico", "US Virgin Islands", "Guam", "American Samoa",
  "Northern Mariana Islands",
]);

export const MYRESET = {
  label: "1-800-MY-RESET",
  digits: "1-800-697-3738",
  tel: "+18006973738",
};

// The 8 gambling types shown in the legal-status grid (Blueprint 5.1).
// `match` ties each to the statute_inventory "vertical" column; tribal is
// derived from the regulators file instead.
const VERTICALS: { id: string; label: string; match: string[]; tribal?: boolean }[] = [
  { id: "lottery", label: "Lottery", match: ["Lottery"] },
  { id: "commercial-casino", label: "Commercial casino", match: ["Commercial casino"] },
  { id: "tribal", label: "Tribal gaming", match: [], tribal: true },
  { id: "sports-betting", label: "Sports betting", match: ["Sports betting"] },
  { id: "online-casino", label: "Online casino", match: ["iGaming/online casino"] },
  { id: "charitable", label: "Charitable gaming", match: ["Charitable gaming"] },
  { id: "horse-racing", label: "Horse / parimutuel", match: ["Horse/parimutuel racing"] },
  { id: "dfs", label: "Daily fantasy (DFS)", match: ["DFS / fantasy sports"] },
];

export type LegalStatus = "authorized" | "limited" | "tribal-only" | "not-authorized";

export interface VerticalStatus {
  id: string;
  label: string;
  status: LegalStatus;
  year: string | null;
  note: string | null;
  citation: string | null;
  url: string | null;
}

export interface Regulator {
  name: string;
  type: string;
  website: string | null;
  phone: string | null;
  email: string | null;
  verticals: string | null;
}

export interface Jurisdiction {
  name: string;
  slug: string;
  abbr: string;
  isTerritory: boolean;
  summary: string | null;
  helpline: {
    national: typeof MYRESET;
    stateLine: string | null;
    stateTel: string | null;
    is24_7: boolean;
  };
  legal: VerticalStatus[];
  regulators: { primary: Regulator[]; tribalCount: number; tribal: Regulator[]; county: Regulator[] };
  help: {
    affiliateName: string | null;
    affiliateUrl: string | null;
    preventionOrg: string | null;
    preventionUrl: string | null;
    treatmentDirectoryUrl: string | null;
  };
  funding: { mechanism: string | null; budgetDisclosed: string | null };
  retrievalDate: string | null;
}

function deriveStatusFromTitle(title: string): { status: LegalStatus; note: string } {
  const t = title.toLowerCase();
  if (t.includes("tribal")) return { status: "tribal-only", note: title };
  if (
    t.includes("unsettled") || t.includes("rely on") || t.includes("operating") ||
    t.includes("under ") || t.includes("only at") || t.includes("limited")
  )
    return { status: "limited", note: title };
  return { status: "not-authorized", note: title };
}

function extractTel(value: string): string | null {
  // Prefer a parenthetical resolved number, else the leading token.
  const groups = value.match(/[\d][\d\-]{6,}[\d]/g);
  if (!groups) return null;
  for (const g of groups) {
    const d = g.replace(/\D/g, "");
    if (d.length === 10) return `+1${d}`;
    if (d.length === 11 && d.startsWith("1")) return `+${d}`;
  }
  return null;
}

let cache: Map<string, Jurisdiction> | null = null;

function build(): Map<string, Jurisdiction> {
  if (cache) return cache;

  const pg = readCsv("pg_resources_inventory.csv");
  const statutes = readCsv("statute_inventory.csv");
  const bodies = readCsv("regulatory_bodies.csv");

  const byJurStatutes = new Map<string, Record<string, string>[]>();
  for (const r of statutes) {
    const j = r.jurisdiction?.trim();
    if (!j) continue;
    (byJurStatutes.get(j) ?? byJurStatutes.set(j, []).get(j)!).push(r);
  }
  const byJurBodies = new Map<string, Record<string, string>[]>();
  for (const r of bodies) {
    const j = r.jurisdiction?.trim();
    if (!j) continue;
    (byJurBodies.get(j) ?? byJurBodies.set(j, []).get(j)!).push(r);
  }

  const result = new Map<string, Jurisdiction>();

  for (const row of pg) {
    const name = row.jurisdiction?.trim();
    if (!name) continue;
    const slug = toSlug(name);

    // ---- Legal-status grid ----
    const jStatutes = byJurStatutes.get(name) ?? [];
    const jBodies = byJurBodies.get(name) ?? [];
    const tribalBodies = jBodies.filter((b) => /tribal gaming commission/i.test(b.body_type ?? ""));

    const legal: VerticalStatus[] = VERTICALS.map((v) => {
      if (v.tribal) {
        const present = tribalBodies.length > 0;
        return {
          id: v.id,
          label: v.label,
          status: present ? "authorized" : "not-authorized",
          year: null,
          note: present
            ? `${tribalBodies.length} tribal gaming commission${tribalBodies.length === 1 ? "" : "s"} on file`
            : "No tribal gaming commission on file",
          citation: null,
          url: null,
        };
      }
      const rows = jStatutes.filter((r) => v.match.includes((r.vertical ?? "").trim()));
      const real = rows.find((r) => clean(r.statute_citation) && !/^not found/i.test(r.statute_citation ?? ""));
      if (real) {
        const y = (real.year_enacted ?? "").trim();
        return {
          id: v.id,
          label: v.label,
          status: "authorized",
          year: /^\d{4}$/.test(y) ? y : null,
          note: clean(real.statute_title),
          citation: clean(real.statute_citation),
          url: clean(real.official_url),
        };
      }
      const nf = rows[0];
      if (nf) {
        const d = deriveStatusFromTitle(nf.statute_title ?? "");
        return { id: v.id, label: v.label, status: d.status, year: null, note: d.note || null, citation: null, url: clean(nf.official_url) };
      }
      return { id: v.id, label: v.label, status: "not-authorized", year: null, note: "No authorizing statute on file", citation: null, url: null };
    });

    // ---- Regulators ----
    const primary: Regulator[] = [];
    const tribal: Regulator[] = [];
    const county: Regulator[] = [];
    for (const b of jBodies) {
      const reg: Regulator = {
        name: b.body_name?.trim() ?? "",
        type: b.body_type?.trim() ?? "",
        website: clean(b.website),
        phone: clean(b.phone),
        email: clean(b.general_email) ?? clean(b.leadership_email),
        verticals: clean(b.verticals_covered),
      };
      if (/tribal gaming commission/i.test(reg.type)) tribal.push(reg);
      else if (/county/i.test(reg.type)) county.push(reg);
      else primary.push(reg);
    }

    // ---- Helpline ----
    const hlRaw = (row.helpline_number ?? "").trim();
    const hasStateLine = hlRaw.length > 0 && !/my-?reset/i.test(hlRaw);

    // ---- Summary (first paragraph of the history's "Where things stand") ----
    let summary: string | null = null;
    const histPath = path.join(DATA_DIR, "history", `${slug}.md`);
    if (fs.existsSync(histPath)) {
      const md = fs.readFileSync(histPath, "utf-8");
      const idx = md.search(/##\s*Where things stand/i);
      const section = idx >= 0 ? md.slice(idx) : md;
      const para = section
        .replace(/^#.*$/gm, "")
        .split(/\n\s*\n/)
        .map((p) => p.trim())
        .find((p) => p.length > 0);
      if (para) {
        summary = para
          .replace(/\*\*/g, "")
          .replace(/[¹²³⁰-⁹]/g, "") // footnote superscripts
          .replace(/\s+/g, " ")
          .trim();
      }
    }

    result.set(slug, {
      name,
      slug,
      abbr: ABBR[name] ?? "",
      isTerritory: TERRITORIES.has(name),
      summary,
      helpline: {
        national: MYRESET,
        stateLine: hasStateLine ? hlRaw : null,
        stateTel: hasStateLine ? extractTel(hlRaw) : null,
        is24_7: (row.helpline_24_7_yn ?? "").trim().toLowerCase() === "yes",
      },
      legal,
      regulators: { primary, tribalCount: tribal.length, tribal, county },
      help: {
        affiliateName: clean(row.ncpg_affiliate_name),
        affiliateUrl: clean(row.ncpg_affiliate_url),
        preventionOrg: clean(row.primary_prevention_org),
        preventionUrl: clean(row.prevention_org_url),
        treatmentDirectoryUrl: clean(row.treatment_directory_url),
      },
      funding: {
        mechanism: clean(row.funding_mechanism),
        budgetDisclosed: clean(row.annual_budget_disclosed),
      },
      retrievalDate: clean(row.retrieval_date),
    });
  }

  cache = result;
  return result;
}

export function getAllJurisdictions(): Jurisdiction[] {
  return [...build().values()].sort((a, b) => a.name.localeCompare(b.name));
}

export function getJurisdiction(slug: string): Jurisdiction | undefined {
  return build().get(slug);
}
