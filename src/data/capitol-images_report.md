# Capitol / Statehouse Hero Images — Sourcing & Verification Report

_Generated 2026-05-24. Covers all 56 jurisdictions (50 states + DC + PR + 4 territories)._

## Headline

| Metric | Count |
|---|---|
| Jurisdictions with a verified hero image | **55 / 56** |
| Pending (no image, manifest row only) | **1** — American Samoa |
| Independent copyright verification | **55 / 55 PASS** (every image checked by a copyright-law subagent) |
| Source: Library of Congress (Carol M. Highsmith, Public Domain) | 24 |
| Source: Wikimedia Commons (CC0 / CC BY / CC BY‑SA / PD) | 31 |
| Build | ✓ green (`astro build`, 84 pages, exit 0) |

Every image is **royalty‑free and cleared for commercial use**. No `‑NC`, no `‑ND`, no "editorial only", nothing ambiguous made it in.

## Verification method (the legal audit trail)

Every image was independently verified by a copyright‑law specialist subagent that did **not** trust the sourcing claims. For each image the verifier:
1. Re‑fetched the **authoritative source** — the LOC item JSON (browser‑UA, since loc.gov 403s plain fetches) or the Wikimedia Commons API `extmetadata` — and confirmed the license from the source, not from our notes.
2. Confirmed the license is genuinely royalty‑free **and** commercial‑use‑permitted (PD / no‑known‑restrictions / CC0 / CC BY any version / CC BY‑SA any version), rejecting NC, ND, editorial‑only, all‑rights‑reserved, or unverifiable.
3. **Viewed the actual downloaded image** and confirmed it depicts the correct building's exterior (not an interior, statue, detail, wrong building, or wrong state).

Result: **51 PASS on the first pass; 4 caught and replaced** (see below); all 4 replacements re‑verified PASS → **55/55 PASS**.

### Issues the independent check caught (and we fixed)
- **al (Alabama)** — the LOC item titled "State Capitol, Montgomery, Alabama" is actually the **interior spiral staircase**. Replaced with a Commons exterior (DXR, CC BY‑SA 4.0).
- **ct (Connecticut)** — the LOC pick was a **facade close‑up detail**, not the building. Replaced (Shah Ronak S, CC BY‑SA 4.0).
- **vt (Vermont)** — the LOC pick was a **dome‑only crop**. Replaced with a full‑building exterior (King of Hearts, CC BY‑SA 4.0, a Commons Featured/Quality picture).
- **mo (Missouri)** — the first Commons pick showed the capitol **shrouded in renovation scaffolding**. Replaced with a clean CC0 aerial (KTrimble).

## Tier 1 — Library of Congress, Carol M. Highsmith Archive (24)

Public Domain, "No known restrictions on publication" (https://www.loc.gov/rr/print/res/482_high.html). Largest IIIF JPEG used.

`co ga ia il ks ky ma me mn nd ne nm oh pa sc sd tn tx ny ut wa wv wi wy`

## Tier 2 — Wikimedia Commons (31)

Each verified against the Commons license at the file page. License mix:

| License | Count |
|---|---|
| CC BY‑SA 4.0 | 10 |
| CC BY‑SA 2.0 | 6 |
| CC BY‑SA 3.0 | 5 |
| CC BY 4.0 | 3 |
| CC0 (public‑domain dedication) | 3 |
| CC BY 2.0 | 2 |
| CC BY 3.0 | 1 |
| Public domain | 1 |

States/DC/PR sourced from Commons because LOC had **no usable exterior** (only interiors, statues, details, aerials, wrong building, or nothing in the collection): `al ak ar az ca ct dc de fl hi id in la md mi mo ms mt nc nh nj nv ok or pr ri va vt`. Territories (per plan, Tier 2): `gu vi mp`.

### Notable sourcing judgment calls (for your review)
- **hi (Hawaii)** — LOC only offered **ʻIolani Palace** (the royal palace, *not* the capitol). Used the actual modernist Hawaii State Capitol from Commons.
- **la (Louisiana)** — used the **current Art‑Deco State Capitol tower** (CC0), not the historic "Old State Capitol." The tower is a tall building, so the framing is near‑square and will center‑crop in the wide hero.
- **fl (Florida)** — used the **historic "Old" Florida Capitol** (the iconic candy‑striped building); the working capitol is the high‑rise tower behind it. Swap if you prefer the modern tower.
- **nc (North Carolina)** — the only clean Commons exterior is a **low‑angle portico/facade** shot (dome out of frame). Correct building & state; replace if you want a fuller view.
- **dc (DC)** — used a Public‑Domain full view of the U.S. Capitol (Noclip).
- A few are dusk/night where that was the best clean exterior (`in`, `md`, `ok`); all are unobstructed and correct.

## Tier 3 — American Samoa (pending, no image)

Per plan, **not auto‑sourced** (the Fono was rebuilt recently; the public photo pool is thin and prone to misattribution/AI images). The manifest has one row for `as` with photographer/source/license = `N/A` and notes = `PENDING - awaiting official photo from Fono press office`. The state page renders a **clean title header with no broken image**.

➡️ **Action for the owner:** contact the American Samoa Fono communications office (Maota Fono, Fagatogo/Pago Pago) for an official, licensed exterior photo, then drop it in as `capitol-as.jpg` and flip the manifest row.

## Optimized image footprint (Lighthouse budget)

Astro generates AVIF at the template's requested widths (400 / 800 / 1600).

- **What a visitor actually downloads per hero: ~338 KB average** (the 1600w AVIF; range ~22 KB–5.9 MB before accounting for srcset selection — see flag). The hero CSS caps display at 1100px, so the 1600w variant is the largest ever served.
- **All served srcset variants (400+800+1600 across 55 heroes): ~25 MB total.**

### ⚠️ Flag: full‑resolution `<img src>` fallbacks bloat the build (~160 MB)
The template's `<Image widths={[400,800,1600]}>` has **no explicit `width`**, so Astro sets the `<img src>` *fallback* to the **full‑resolution** AVIF. Because the LOC IIIF masters and several Commons originals are 9,000–12,000 px, those fallbacks are **5–14 MB each — 46 files, ~160 MB of the 198 MB `_astro` output.**

- **Real‑user impact is minimal:** all modern browsers honor `srcset`/`sizes` and fetch the 1600w variant (~338 KB avg); the multi‑MB `src` is only a fallback for browsers without `srcset` support and is essentially never downloaded. Lighthouse measures the srcset‑selected resource, so scores are unaffected.
- **But** it bloats the deploy and is poor hygiene for non‑`srcset` consumers.
- I did **not** fix this autonomously because both available levers are out of bounds per the brief: it requires either a **template change** (`don't change the template`) — add `width={1600}` to the `<Image>` — or **pre‑resizing the sources** (`do not pre-resize`). 
- **Recommended fix (your call):** add `width={1600}` to the hero `<Image>` (one line) — Astro then makes the `src` fallback the 1600w file and stops emitting the giant variants; OR cap the source assets to ~2400px long edge (the 1600w hero is unchanged). Either drops `_astro` from ~198 MB to ~25 MB. Say the word and I'll apply one.

## Where the assets & audit trail live
- Images: `src/assets/capitols/capitol-{code}.jpg` (55 files; American Samoa intentionally absent).
- Manifest / legal audit trail: `src/data/capitol-images.csv` (56 rows incl. AS; per‑row notes record the verified license + "Independent copyright check: PASS").
- Working data (scripts, ranked candidates, per‑image Commons license JSON, verification assignment sheet): `~/capitol-work/`.

## Build verification
`npm run build` → ✓ green, 84 pages, 211 capitol AVIF variants. Spot‑checked built pages:
- `dist/state/texas/` — hero renders; credit "Photo: Carol M. Highsmith / Library of Congress (Public Domain…)" + LOC rights link. ✓
- `dist/state/california/` — hero renders; credit "Quintin Soloviev / Wikimedia Commons (CC BY 4.0)". ✓
- `dist/state/american-samoa/` — clean `<h1>American Samoa</h1>`, **no** hero figure, no broken image. ✓
- 55 jurisdiction pages render a hero figure; American Samoa correctly renders none.
