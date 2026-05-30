#!/usr/bin/env node
// build-directory-html.mjs <distDir> <thumbsDir> <outHtml>
// Walk distDir for every index.html, extract <title> + meta description,
// group routes by section, and emit a paginated visual directory HTML
// referencing thumbnails from thumbsDir.

import { readdir, readFile, stat, writeFile } from "node:fs/promises";
import { join, relative, basename } from "node:path";

const [, , DIST, THUMBS, OUT] = process.argv;
if (!DIST || !THUMBS || !OUT) {
  console.error("usage: build-directory-html.mjs <distDir> <thumbsDir> <outHtml>");
  process.exit(1);
}

// -------- Walk dist for index.html files
async function walk(dir, acc = []) {
  for (const ent of await readdir(dir, { withFileTypes: true })) {
    const p = join(dir, ent.name);
    if (ent.isDirectory()) await walk(p, acc);
    else if (ent.isFile() && ent.name === "index.html") acc.push(p);
  }
  return acc;
}

function routeFromPath(htmlPath) {
  const rel = "/" + relative(DIST, htmlPath).replace(/\/index\.html$/, "");
  return rel === "/" || rel === "" ? "/" : rel;
}

function nameFromRoute(route) {
  if (route === "/") return "home";
  return route.replace(/^\//, "").replace(/\/$/, "").replace(/\//g, "__");
}

function extractMeta(html) {
  const t = html.match(/<title>([^<]*)<\/title>/i);
  const d = html.match(/<meta\s+name="description"\s+content="([^"]*)"/i);
  return {
    title: t ? t[1].replace(/\s+/g, " ").trim() : "(untitled)",
    desc: d ? d[1].replace(/\s+/g, " ").trim() : "",
  };
}

// -------- Section grouping (matches Nav structure)
const PRO_LIVE = new Set([
  "/professionals",
  "/professionals/human-resources",
  "/professionals/treatment-providers",
  "/professionals/healthcare-providers",
  "/professionals/teachers",
]);

const SECTION_RULES = [
  { name: "Home", match: (r) => r === "/" },
  { name: "Understand Gambling", match: (r) => r.startsWith("/understand-gambling") },
  { name: "Understand Prevention", match: (r) => r.startsWith("/understand-prevention") },
  { name: "Family & Friends", match: (r) => r.startsWith("/family-and-friends") },
  {
    name: "Professionals",
    match: (r) => r.startsWith("/professionals") && PRO_LIVE.has(r),
  },
  { name: "State pages", match: (r) => r.startsWith("/state") },
  {
    name: "Utility",
    match: (r) =>
      [
        "/about",
        "/accessibility",
        "/credits",
        "/find-your-state",
        "/methodology",
        "/privacy",
        "/resources",
        "/sitemap",
        "/sponsors",
      ].includes(r),
  },
  {
    name: "Archive / orphans",
    match: (r) =>
      r.startsWith("/professionals") && !PRO_LIVE.has(r),
  },
  { name: "Other", match: () => true },
];

function sectionFor(route) {
  for (const s of SECTION_RULES) if (s.match(route)) return s.name;
  return "Other";
}

// -------- Build entries
const htmlPaths = await walk(DIST);
const entries = [];
for (const p of htmlPaths) {
  const route = routeFromPath(p);
  const html = await readFile(p, "utf8");
  const { title, desc } = extractMeta(html);
  const name = nameFromRoute(route);
  const thumb = join(THUMBS, `${name}.png`);
  let thumbRel = `./thumbs/${name}.png`;
  try {
    await stat(thumb);
  } catch {
    thumbRel = null;
  }
  entries.push({ route, name, title, desc, thumbRel, section: sectionFor(route) });
}

// Sort: by section (rules order), then route alpha
const sectionOrder = SECTION_RULES.map((s) => s.name);
entries.sort((a, b) => {
  const sa = sectionOrder.indexOf(a.section);
  const sb = sectionOrder.indexOf(b.section);
  if (sa !== sb) return sa - sb;
  // Home first
  if (a.route === "/") return -1;
  if (b.route === "/") return 1;
  // Hub before sub-pages within same section
  const aHub = a.route.split("/").filter(Boolean).length === 1;
  const bHub = b.route.split("/").filter(Boolean).length === 1;
  if (aHub !== bHub) return aHub ? -1 : 1;
  return a.route.localeCompare(b.route);
});

// Group
const grouped = new Map();
for (const e of entries) {
  if (!grouped.has(e.section)) grouped.set(e.section, []);
  grouped.get(e.section).push(e);
}

// -------- Emit HTML
const totalPages = entries.length;
const generatedAtSrc = `node:${process.hrtime.bigint().toString()}`;

const esc = (s) =>
  String(s ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");

function renderCard(e) {
  return `
    <li class="card">
      ${e.thumbRel ? `<img class="card__thumb" src="${esc(e.thumbRel)}" alt="" />` : `<div class="card__thumb card__thumb--missing">(no thumbnail)</div>`}
      <div class="card__body">
        <p class="card__title">${esc(e.title)}</p>
        <p class="card__route">${esc(e.route)}</p>
        ${e.desc ? `<p class="card__desc">${esc(e.desc).slice(0, 140)}${e.desc.length > 140 ? "…" : ""}</p>` : ""}
      </div>
    </li>`;
}

function renderSection(name, items) {
  return `
  <section class="section">
    <h2 class="section__title">${esc(name)} <span class="section__count">${items.length}</span></h2>
    <ul class="grid">
      ${items.map(renderCard).join("")}
    </ul>
  </section>`;
}

const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>Site directory — problemgamblingprevention.com</title>
<style>
  @page { size: letter portrait; margin: 0.4in 0.4in 0.5in; }
  * { box-sizing: border-box; }
  body {
    margin: 0;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
    color: #1f3024;
    background: #fbfaf6;
    font-size: 11px;
    line-height: 1.4;
  }

  .cover {
    height: 9.6in;
    padding: 1in 0.5in;
    display: flex;
    flex-direction: column;
    justify-content: center;
    page-break-after: always;
  }
  .cover__eyebrow {
    margin: 0 0 0.5rem;
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    font-weight: 700;
    color: #445e43;
  }
  .cover__title {
    margin: 0;
    font-size: 48px;
    line-height: 1.05;
    color: #1f3024;
  }
  .cover__sub {
    margin: 1rem 0 0;
    font-size: 14px;
    max-width: 60ch;
    color: #2a2620;
  }
  .cover__meta {
    margin-top: 2rem;
    font-size: 11px;
    color: #5d5847;
  }
  .cover__meta strong { color: #1f3024; }

  .section {
    page-break-inside: auto;
    margin-top: 1rem;
  }
  .section__title {
    background: #e6ecdf;
    padding: 0.4rem 0.6rem;
    border-radius: 4px;
    margin: 1rem 0 0.5rem;
    font-size: 14px;
    color: #1f3024;
    display: flex;
    align-items: baseline;
    gap: 0.5rem;
    page-break-after: avoid;
  }
  .section__count {
    font-size: 10px;
    font-weight: 400;
    color: #5d5847;
    background: #fbfaf6;
    border: 1px solid #c9c5b8;
    padding: 0 0.4rem;
    border-radius: 999px;
  }

  .grid {
    list-style: none;
    margin: 0;
    padding: 0;
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 0.3rem;
  }
  .card {
    page-break-inside: avoid;
    border: 1px solid #e8e5dc;
    border-radius: 4px;
    background: white;
    overflow: hidden;
  }
  .card__thumb {
    width: 100%;
    height: 1.4in;
    object-fit: cover;
    object-position: top center;
    display: block;
    border-bottom: 1px solid #e8e5dc;
  }
  .card__thumb--missing {
    display: flex;
    align-items: center;
    justify-content: center;
    color: #5d5847;
    background: #f3f1ea;
  }
  .card__body {
    padding: 0.25rem 0.4rem 0.35rem;
  }
  .card__title {
    margin: 0 0 0.1rem;
    font-weight: 700;
    font-size: 10px;
    color: #1f3024;
    line-height: 1.25;
  }
  .card__route {
    margin: 0;
    font-family: ui-monospace, "SF Mono", Menlo, monospace;
    font-size: 8px;
    color: #5d5847;
    word-break: break-all;
  }
  .card__desc {
    margin: 0.1rem 0 0;
    font-size: 9px;
    color: #2a2620;
    line-height: 1.3;
  }

  /* State pages: tighter grid since there are 56 */
  .section:has(.section__count:where(:not(:empty))) .grid--dense {
    grid-template-columns: repeat(4, 1fr);
  }
</style>
</head>
<body>

<section class="cover">
  <p class="cover__eyebrow">Site directory</p>
  <h1 class="cover__title">PGPrevention.com</h1>
  <p class="cover__sub">
    A visual snapshot of every page in the current build —
    grouped by section, with a thumbnail of each.
  </p>
  <div class="cover__meta">
    <p><strong>${totalPages}</strong> pages · <strong>${grouped.size}</strong> sections</p>
    <p>Branch: design-system-sage</p>
    <p>Source: <code>dist/</code> (static build output)</p>
  </div>
</section>

${sectionOrder
  .map((name) => grouped.get(name))
  .filter((g) => g && g.length)
  .map((items) => renderSection(items[0].section, items))
  .join("")}

</body>
</html>`;

await writeFile(OUT, html, "utf8");
console.error(`Wrote ${OUT} (${totalPages} entries, ${grouped.size} sections)`);
