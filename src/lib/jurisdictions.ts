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

// The self-exclusion CSV names a few jurisdictions differently than the
// pg_resources file; normalize so rows join. ("Federal" has no state page.)
const SE_NAME_ALIASES: Record<string, string> = {
  "Virgin Islands": "US Virgin Islands",
};

const SE_TYPE_LABEL: Record<string, string> = {
  "state-run": "Statewide program",
  "national-NVSEP": "Multi-state program (NVSEP)",
  "property-by-property": "Per-property / per-operator",
  none: "No formal program",
};

// Some descriptive cells carry an internal reviewer annotation appended as a
// trailing clause (e.g. "...; needs human review"). Strip those clauses so the
// public never sees research scaffolding, then fall back to clean().
function cleanField(v: string | undefined): string | null {
  const c = clean(v);
  if (!c) return null;
  const kept = c
    .split(";")
    .map((s) => s.trim())
    .filter((s) => s && !/needs human review|not confirmed on official|^not found/i.test(s));
  const out = kept.join("; ").trim();
  return out || null;
}

// Verticals are a ";"-joined list; tidy spacing and drop "N/A".
function cleanVerticals(v: string | undefined): string | null {
  const c = clean(v);
  if (!c) return null;
  return (
    c
      .split(";")
      .map((s) => s.trim())
      .filter(Boolean)
      .join("; ") || null
  );
}

export type LegalStatus = "authorized" | "limited" | "tribal-only" | "not-authorized";

export interface VerticalStatus {
  id: string;
  label: string;
  status: LegalStatus;
  year: string | null;
  note: string | null;
  citation: string | null;
  url: string | null;
  agency: string | null;
  agencyUrl: string | null;
  adminCodeCitation: string | null;
  adminCodeUrl: string | null;
  adminCodeVerified: boolean;
}

export interface Regulator {
  name: string;
  type: string;
  website: string | null;
  phone: string | null;
  email: string | null;
  verticals: string | null;
}

export type SelfExclusionType =
  | "state-run"
  | "national-NVSEP"
  | "property-by-property"
  | "none";

export interface SelfExclusionProgram {
  name: string;
  type: SelfExclusionType;
  typeLabel: string;
  body: string | null;
  verticals: string | null;
  enrollment: string | null;
  duration: string | null;
  removal: string | null;
  url: string | null;
  isNvsep: boolean;
  idpairFlag: boolean;
  verified: boolean;
}

export interface SelfExclusion {
  // Enrollable programs (statewide, multi-state NVSEP, or per-property/operator).
  programs: SelfExclusionProgram[];
  // Verticals with a sourced "no self-exclusion program" finding (context only).
  noProgramFindings: SelfExclusionProgram[];
  retrievalDate: string | null;
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
  selfExclusion: SelfExclusion;
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

// Normalize an agency/body name for fuzzy matching: drop parentheticals,
// unify dashes, strip punctuation, collapse whitespace.
function normName(s: string): string {
  return s
    .toLowerCase()
    .replace(/\(.*?\)/g, " ")
    .replace(/[—–-]/g, " ")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// Keywords that tie one of our verticals to a regulatory body's free-text
// `verticals_covered`, used as a fallback when names don't match.
const REG_VERTICAL_KW: Record<string, RegExp> = {
  lottery: /lottery/,
  "commercial-casino": /casino/,
  "sports-betting": /sports|sportsbook|sports wager/,
  "online-casino": /igaming|internet gaming|online casino|interactive|i-?gaming/,
  charitable: /charitable|bingo|raffle|pull-?tab/,
  "horse-racing": /horse|racing|pari-?mutuel|parimutuel|harness|thoroughbred/,
  dfs: /fantasy|dfs/,
};

// Stable grouping key for a regulator name: collapses parenthetical
// clarifiers, dashes, and punctuation so "Maine Gambling Control Unit" and
// "Maine Gambling Control Unit (Dept. of Public Safety)" group as one.
export function agencyKey(agency: string | null | undefined): string {
  return normName(agency ?? "") || "__none__";
}

// Resolve a statute's regulator to a website. Two complementary passes — the
// statute's `agency_governed` name rarely matches a body name exactly
// ("Ohio Lottery Commission" vs "Ohio Lottery", "(OCCC)" suffixes, em-dashes),
// and a body's `verticals_covered` is sometimes incomplete — so we try the name
// first, then fall back to matching the vertical against the bodies. Tribal
// commissions are excluded (tribal gaming is handled as its own vertical).
function resolveAgencyUrl(
  agency: string | null,
  bodies: Record<string, string>[],
  verticalId?: string,
): string | null {
  const cands = bodies.filter(
    (b) => !/tribal gaming commission/i.test(b.body_type ?? ""),
  );

  // Pass 1 — fuzzy name match.
  const a = normName(agency ?? "");
  if (a.length >= 4) {
    let bestUrl: string | null = null;
    let bestScore = 0;
    for (const b of cands) {
      const n = normName(b.body_name ?? "");
      if (n.length < 4) continue;
      let score = 0;
      if (n === a) score = 3;
      else if (a.includes(n) || n.includes(a)) score = 2;
      else continue;
      const url = clean(b.website);
      const adj = score + (url ? 0.5 : 0);
      if (adj > bestScore) {
        bestScore = adj;
        bestUrl = url;
      }
    }
    if (bestUrl) return bestUrl;
  }

  // Pass 2 — match the vertical against each body's covered verticals.
  const kw = verticalId ? REG_VERTICAL_KW[verticalId] : undefined;
  if (kw) {
    for (const b of cands) {
      if (kw.test((b.verticals_covered ?? "").toLowerCase())) {
        const url = clean(b.website);
        if (url) return url;
      }
    }
    for (const b of cands) {
      if (/multiple/i.test(b.verticals_covered ?? "")) {
        const url = clean(b.website);
        if (url) return url;
      }
    }
  }
  return null;
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

  // Supplemental regulator rows: websites for agencies that were missing from
  // regulatory_bodies.csv. Used ONLY to resolve the regulator-box link — not
  // added to the regulators directory or the at-a-glance regulator count.
  const supBodiesByJur = new Map<string, Record<string, string>[]>();
  try {
    for (const r of readCsv("regulatory_bodies_supplement.csv")) {
      let j = r.jurisdiction?.trim();
      if (!j) continue;
      j = SE_NAME_ALIASES[j] ?? j; // "Virgin Islands" -> "US Virgin Islands"
      (supBodiesByJur.get(j) ?? supBodiesByJur.set(j, []).get(j)!).push(r);
    }
  } catch {
    // Supplement is optional; absence just means fewer regulator links.
  }

  // Administrative-rules layer, keyed by jurisdiction||vertical (raw statute
  // vertical). Only "verified" rows expose a citation.
  const adminByKey = new Map<string, Record<string, string>>();
  for (const r of readCsv("admin_code_inventory.csv")) {
    adminByKey.set(`${(r.jurisdiction ?? "").trim()}||${(r.vertical ?? "").trim()}`, r);
  }
  const adminFor = (jur: string, vertical: string) => {
    const r = adminByKey.get(`${jur}||${vertical}`);
    const verified = (r?.verification_status ?? "").trim().toLowerCase() === "verified";
    return {
      adminCodeCitation: verified ? clean(r?.admin_code_citation) : null,
      adminCodeUrl: verified ? clean(r?.admin_code_url) : null,
      adminCodeVerified: verified,
    };
  };
  const noAdmin = { adminCodeCitation: null, adminCodeUrl: null, adminCodeVerified: false };

  // Self-exclusion layer, grouped by (normalized) jurisdiction name.
  const seByJur = new Map<string, SelfExclusionProgram[]>();
  for (const r of readCsv("self_exclusion_inventory.csv")) {
    let jur = (r.jurisdiction ?? "").trim();
    if (!jur || jur === "Federal") continue; // no Federal state page
    jur = SE_NAME_ALIASES[jur] ?? jur;
    const type = (r.program_type ?? "").trim();
    const prog: SelfExclusionProgram = {
      name: (r.program_name ?? "").trim(),
      type: (["state-run", "national-NVSEP", "property-by-property"].includes(type)
        ? type
        : "none") as SelfExclusionType,
      typeLabel: SE_TYPE_LABEL[type] ?? "Program",
      body: cleanField(r.administering_body),
      verticals: cleanVerticals(r.verticals_covered),
      enrollment: cleanField(r.enrollment_method),
      duration: cleanField(r.duration_options),
      removal: cleanField(r.removal_process),
      url: clean(r.official_url),
      isNvsep: (r.is_nvsep ?? "").trim().toLowerCase() === "yes",
      idpairFlag: (r.idpair_flag ?? "").trim().toLowerCase() === "yes",
      verified: (r.verification_status ?? "").trim().toLowerCase() === "verified",
    };
    (seByJur.get(jur) ?? seByJur.set(jur, []).get(jur)!).push(prog);
  }
  const buildSelfExclusion = (name: string): SelfExclusion => {
    const rows = seByJur.get(name) ?? [];
    return {
      programs: rows.filter((p) => p.type !== "none"),
      noProgramFindings: rows.filter((p) => p.type === "none"),
      retrievalDate: "2026-05-23",
    };
  };

  const result = new Map<string, Jurisdiction>();

  for (const row of pg) {
    const name = row.jurisdiction?.trim();
    if (!name) continue;
    const slug = toSlug(name);

    // ---- Legal-status grid ----
    const jStatutes = byJurStatutes.get(name) ?? [];
    const jBodies = byJurBodies.get(name) ?? [];
    // Candidate pool for resolving regulator links = directory bodies + any
    // supplemental rows for this jurisdiction (link-only; not shown/counted).
    const jSup = supBodiesByJur.get(name);
    const jBodiesForUrl = jSup && jSup.length ? [...jBodies, ...jSup] : jBodies;
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
          agency: present ? "Tribal gaming commissions (under NIGC oversight)" : null,
          agencyUrl: null,
          ...noAdmin,
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
          agency: clean(real.agency_governed),
          agencyUrl: resolveAgencyUrl(clean(real.agency_governed), jBodiesForUrl, v.id),
          ...adminFor(name, (real.vertical ?? "").trim()),
        };
      }
      const nf = rows[0];
      if (nf) {
        const d = deriveStatusFromTitle(nf.statute_title ?? "");
        return { id: v.id, label: v.label, status: d.status, year: null, note: d.note || null, citation: null, url: clean(nf.official_url), agency: clean(nf.agency_governed), agencyUrl: resolveAgencyUrl(clean(nf.agency_governed), jBodiesForUrl, v.id), ...adminFor(name, (nf.vertical ?? "").trim()) };
      }
      return { id: v.id, label: v.label, status: "not-authorized", year: null, note: "No authorizing statute on file", citation: null, url: null, agency: null, agencyUrl: null, ...noAdmin };
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
      // No revenue / taxation / funding figures for now: drop any summary that
      // mentions money, so financial figures never slip through the auto-extract.
      if (summary && /\$|\bmillion\b|\bbillion\b|\brevenue\b|\btax(es|ed|ation)?\b|appropriat|per-slot|\bfee\b/i.test(summary)) {
        summary = null;
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
      selfExclusion: buildSelfExclusion(name),
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

// ---- Capitol / statehouse image manifest (audit trail) ----
// `capitol-images.csv` documents the source/license of each hero photo. A hero
// is only rendered when BOTH the image file and a manifest row exist, so the
// attribution trail is never missing.
export interface CapitolImage {
  code: string;
  jurisdiction: string | null;
  filename: string | null;
  photographer: string | null;
  sourceUrl: string | null;
  license: string | null;
  licenseUrl: string | null;
  notes: string | null;
}

let capitolCache: Map<string, CapitolImage> | null = null;

function capitolRows(): Map<string, CapitolImage> {
  if (capitolCache) return capitolCache;
  const m = new Map<string, CapitolImage>();
  try {
    for (const r of readCsv("capitol-images.csv")) {
      const code = (r.code ?? "").trim().toLowerCase();
      if (!code) continue;
      m.set(code, {
        code,
        jurisdiction: clean(r.jurisdiction),
        filename: clean(r.filename),
        photographer: clean(r.photographer),
        sourceUrl: clean(r.source_url),
        license: clean(r.license),
        licenseUrl: clean(r.license_url),
        notes: clean(r.notes),
      });
    }
  } catch {
    // Manifest is optional; absence simply means no hero images yet.
  }
  capitolCache = m;
  return m;
}

export function getCapitolImage(code: string): CapitolImage | undefined {
  return capitolRows().get(code.toLowerCase());
}

export function getAllCapitolImages(): CapitolImage[] {
  return [...capitolRows().values()].sort((a, b) =>
    (a.jurisdiction ?? a.code).localeCompare(b.jurisdiction ?? b.code),
  );
}

// ---- State prevention campaigns ----
// CSV at src/data/state_pg_campaigns.csv (one row per campaign per jurisdiction).
// Per site policy we surface only umbrella / prevention / responsible_gambling
// categories; helpline rows duplicate the MY-RESET/988 CTA we already promote,
// and treatment rows conflict with the no-treatment-directory stance.

export interface StateCampaign {
  jurisdiction: string;
  name: string;
  url: string;
  category: "umbrella" | "prevention" | "responsible_gambling";
  fundingAgency: string | null;
  fundingAgencyUrl: string | null;
  fundingChain: string | null;
  audience: string[];
  blurb: string | null;
  lastVerified: string | null;
}

// CSV jurisdiction names that differ from the canonical names used elsewhere.
const CAMPAIGN_JURISDICTION_ALIASES: Record<string, string> = {
  "U.S. Virgin Islands": "US Virgin Islands",
};

const CAMPAIGN_ALLOWED_CATEGORIES = new Set([
  "umbrella",
  "prevention",
  "responsible_gambling",
]);

let campaignsCache: Map<string, StateCampaign[]> | null = null;

function loadCampaigns(): Map<string, StateCampaign[]> {
  if (campaignsCache) return campaignsCache;
  const byJ = new Map<string, StateCampaign[]>();
  try {
    for (const r of readCsv("state_pg_campaigns.csv")) {
      const cat = (r.category ?? "").trim();
      if (!CAMPAIGN_ALLOWED_CATEGORIES.has(cat)) continue;
      let jurisdiction = (r.jurisdiction ?? "").trim();
      jurisdiction = CAMPAIGN_JURISDICTION_ALIASES[jurisdiction] ?? jurisdiction;
      const name = (r.campaign_name ?? "").trim();
      const url = (r.url ?? "").trim();
      if (!jurisdiction || !name || !url) continue;
      const campaign: StateCampaign = {
        jurisdiction,
        name,
        url,
        category: cat as StateCampaign["category"],
        fundingAgency: clean(r.funding_agency),
        fundingAgencyUrl: clean(r.funding_agency_url),
        fundingChain: clean(r.funding_chain),
        audience: (r.audience ?? "")
          .split("|")
          .map((s) => s.trim())
          .filter(Boolean),
        blurb: clean(r.blurb),
        lastVerified: clean(r.last_verified),
      };
      const list = byJ.get(jurisdiction) ?? [];
      list.push(campaign);
      byJ.set(jurisdiction, list);
    }
  } catch {
    // CSV absent in some environments — return empty index rather than failing the build.
  }
  // Stable order: umbrella first, then prevention, then responsible_gambling.
  const categoryOrder: Record<StateCampaign["category"], number> = {
    umbrella: 0,
    prevention: 1,
    responsible_gambling: 2,
  };
  for (const list of byJ.values()) {
    list.sort((a, b) => {
      const co = categoryOrder[a.category] - categoryOrder[b.category];
      if (co !== 0) return co;
      return a.name.localeCompare(b.name);
    });
  }
  campaignsCache = byJ;
  return campaignsCache;
}

export function getCampaignsForJurisdiction(name: string): StateCampaign[] {
  return loadCampaigns().get(name) ?? [];
}

// First sentence of a blurb — used to keep campaign cards skim-able.
export function firstSentence(text: string | null): string | null {
  if (!text) return null;
  const trimmed = text.trim();
  if (!trimmed) return null;
  const m = trimmed.match(/^.*?[.!?](?=\s|$)/);
  return (m ? m[0] : trimmed).trim();
}

// ---- State prevalence (youth + adult past-year figures) ----
// Source: src/data/state_prevalence.json. Per the data file's rendering
// contract, the youth and adult figures measure different constructs and must
// never be combined, compared, or ranked. Methodology (instrument + year +
// measured/estimated label) must accompany every number displayed.

export interface PrevalenceMeasure {
  stat_type: string; // "measured" | "measured (range)" | "modeled estimate" | "national reference" | "no data"
  value_pct: number | string;
  display_stat: string;
  metric: string;
  instrument: string;
  year: string;
  source: string;
  source_url: string;
  caveat: string;
}

export interface PrevalenceRecord {
  jurisdiction: string;
  abbrev: string;
  jurisdiction_type: string;
  snippets: {
    sidebar: string;
    body: string;
    youth_sentence: string;
    adult_sentence: string;
  };
  youth: PrevalenceMeasure;
  adult: PrevalenceMeasure;
  sources: { label: string; url: string }[];
  epi_review_note: string;
}

const PREVALENCE_JURISDICTION_ALIASES: Record<string, string> = {
  "U.S. Virgin Islands": "US Virgin Islands",
};

let prevalenceCache: Map<string, PrevalenceRecord> | null = null;

function loadPrevalence(): Map<string, PrevalenceRecord> {
  if (prevalenceCache) return prevalenceCache;
  const m = new Map<string, PrevalenceRecord>();
  try {
    const text = fs.readFileSync(
      path.join(DATA_DIR, "state_prevalence.json"),
      "utf-8",
    );
    const parsed = JSON.parse(text);
    for (const rec of parsed.data ?? []) {
      let j = String(rec.jurisdiction ?? "").trim();
      j = PREVALENCE_JURISDICTION_ALIASES[j] ?? j;
      if (!j) continue;
      m.set(j, rec as PrevalenceRecord);
    }
  } catch {
    // Missing/unreadable file: return empty index (graceful no-render).
  }
  prevalenceCache = m;
  return prevalenceCache;
}

export function getPrevalenceForJurisdiction(
  name: string,
): PrevalenceRecord | null {
  return loadPrevalence().get(name) ?? null;
}

// Strip the hedge from a display_stat ("~17.9% (est.)" -> "17.9%") for
// the modeled-summary sentence, since "an estimated" already carries hedge.
function stripDisplayHedge(s: string): string {
  return s
    .replace(/^~/, "")
    .replace(/\s*\((est|adj)\.\)\s*$/i, "")
    .trim();
}

// Plain-English summary (Option A). Generated only from structured fields.
export function prevalencePlainSummary(
  audience: "youth" | "adult",
  rec: PrevalenceRecord,
  stateName: string,
): string {
  const m = audience === "youth" ? rec.youth : rec.adult;
  if (m.stat_type === "no data") return "";
  const ageBand = audience === "youth" ? "teens" : "adults";
  const subject =
    audience === "youth"
      ? "gambled at all in the past year"
      : "have problems with gambling in any given year";
  const isMeasured = m.stat_type.startsWith("measured");
  if (isMeasured) {
    return `About ${m.display_stat} of ${stateName} ${ageBand} ${subject}, based on a ${m.year} state survey.`;
  }
  const cleaned = stripDisplayHedge(m.display_stat);
  const verb =
    audience === "youth"
      ? "may have gambled in the past year"
      : "may have problems with gambling";
  return `${stateName} doesn't have its own ${audience} gambling survey. Applying the national rate, an estimated ${cleaned} of ${ageBand} ${verb}.`;
}

export function prevalenceCaption(m: PrevalenceMeasure): string {
  if (m.stat_type === "no data") return "";
  if (m.stat_type.startsWith("measured")) {
    return `${m.display_stat} · ${m.instrument}, ${m.year}`;
  }
  return `${m.display_stat} · national estimate applied to state, ${m.year}`;
}

export function prevalenceCardHeading(
  audience: "youth" | "adult",
  rec: PrevalenceRecord,
  stateName: string,
): string {
  const measured = (audience === "youth" ? rec.youth : rec.adult).stat_type.startsWith("measured");
  if (audience === "youth") {
    return measured
      ? `How many ${stateName} teens gambled in the past year`
      : `How many ${stateName} teens may have gambled`;
  }
  return measured
    ? `Adults with a gambling problem in ${stateName}`
    : `Adults who may have a gambling problem in ${stateName}`;
}
