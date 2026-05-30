# scripts

Utility scripts for the project. Run from the repo root.

## `build-site-directory.sh`

Generates a visual, paginated PDF directory of every page in the live build —
thumbnail + title + URL + description per page, grouped by section.

```bash
npm run build              # make sure dist/ is current
bash scripts/build-site-directory.sh
```

Output:

- `site-directory/site-directory.pdf` — the deliverable
- `site-directory/directory.html` — intermediate HTML the PDF is rendered from
- `site-directory/thumbs/*.png` — 1280×900 screenshots, one per route (cached)

To force fresh thumbnails, `rm -rf site-directory/thumbs/` before re-running.

The whole `site-directory/` tree is gitignored — it's a regenerable artifact.

### How it works

1. Static-serves `dist/` on `http://127.0.0.1:4327` via `python3 -m http.server`.
2. Crawls `dist/` for every `index.html`, derives a route per file.
3. For each route, uses headless Google Chrome.app to capture a 1280×900 PNG
   thumbnail (`--virtual-time-budget=3000` so deferred JS settles).
4. Hands the route list + thumbnails to `build-directory-html.mjs` (Node), which
   reads each page's `<title>` and `<meta name="description">`, groups by
   section (Home / Understand Gambling / Understand Prevention / Family &
   Friends / Professionals / State pages / Utility / Archive-orphans), and
   emits `directory.html` with a cover page + a CSS-grid of cards per section.
5. Pipes `directory.html` back through headless Chrome with `--print-to-pdf` to
   produce the final letter-portrait PDF.

### Requirements

- Google Chrome.app installed at `/Applications/Google Chrome.app` (used for
  both screenshots and PDF rendering — no extra deps needed).
- `python3` (used to static-serve `dist/`).
- `node` (used for HTML templating).
- Bash 3.2+ (macOS default).
