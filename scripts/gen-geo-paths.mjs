// Regenerates src/data/us-geo-paths.json for the USGeoMap component.
//
// Source: btskinner/usa_territory_topojson (CC0) — the 20m state file
// pre-projected with the AlbersUsaTerritories composite projection (insets
// AK, HI, PR). The 20m source omits the 4 small Pacific/Atlantic territories
// (AS, GU, MP, VI); those are covered by the hex map and the list instead.
//
// Because the coordinates are already projected, we render them with a plain
// geoIdentity (reflectY to match SVG's y-down axis) fit to a 960x500 box, and
// store integer-rounded path strings. No projection runs at site build time.
//
// Run from the project root:  node scripts/gen-geo-paths.mjs
import { feature } from "topojson-client";
import { geoPath, geoIdentity } from "d3-geo";
import fs from "node:fs";

const SRC =
  "https://raw.githubusercontent.com/btskinner/usa_territory_topojson/master/data/json/proj/state_20m_2023_proj.json";

const topo = await (await fetch(SRC)).json();
const fc = feature(topo, topo.objects.states);
const projection = geoIdentity().reflectY(true).fitSize([960, 500], fc);
const path = geoPath(projection);
const round = (d) => d.replace(/-?\d+\.\d+/g, (m) => Math.round(+m));

const out = fc.features
  .map((f) => ({ fips: String(f.id), d: round(path(f) || "") }))
  .filter((s) => s.d);

fs.writeFileSync(
  new URL("../src/data/us-geo-paths.json", import.meta.url),
  JSON.stringify(out),
);
console.log(`Wrote ${out.length} jurisdiction paths.`);
