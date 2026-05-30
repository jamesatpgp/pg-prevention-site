#!/usr/bin/env bash
# build-site-directory.sh
# Crawl dist/, screenshot every page, assemble a visual sitemap PDF.
#
# Output: site-directory/site-directory.pdf
# Thumbnails cached in site-directory/thumbs/ (delete dir to refresh).

set -euo pipefail

ROOT="${ROOT:-/Users/syphax/Sites/pg-prevention-site}"
DIST="$ROOT/dist"
OUT="$ROOT/site-directory"
THUMBS="$OUT/thumbs"
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
PORT="${PORT:-4327}"
PDF="$OUT/site-directory.pdf"
HTML="$OUT/directory.html"

mkdir -p "$THUMBS"

# 1. Start static server on dist/
echo "==> Starting static server on http://127.0.0.1:$PORT (serving $DIST)"
python3 -m http.server -d "$DIST" -b 127.0.0.1 "$PORT" &>/dev/null &
SERVER_PID=$!
trap "echo '==> Stopping server'; kill $SERVER_PID 2>/dev/null || true" EXIT
sleep 1

# 2. List routes (each "/foo/bar/" form). Portable: macOS bash 3.2 has no mapfile.
routes=()
while IFS= read -r r; do routes+=("$r"); done < <(
  find "$DIST" -name 'index.html' \
  | sed "s|$DIST||; s|/index.html$||" \
  | awk '{ if ($0 == "") print "/"; else print $0 }' \
  | sort
)
echo "==> ${#routes[@]} routes to capture"

# 3. Screenshot each route (cache hits skipped)
fresh=0; cached=0
for route in "${routes[@]}"; do
  name=$(echo "$route" | sed 's|^/||; s|/$||; s|/|__|g')
  [ -z "$name" ] && name="home"
  thumb="$THUMBS/$name.png"
  if [ -f "$thumb" ]; then
    cached=$((cached + 1))
    continue
  fi
  url="http://127.0.0.1:$PORT${route}/"
  [ "$route" = "/" ] && url="http://127.0.0.1:$PORT/"
  "$CHROME" --headless=new --disable-gpu --no-sandbox \
    --hide-scrollbars --window-size=1280,900 \
    --virtual-time-budget=3000 \
    --screenshot="$thumb" "$url" &>/dev/null || true
  fresh=$((fresh + 1))
  if (( fresh % 10 == 0 )); then
    echo "  ($fresh captured)"
  fi
done
echo "==> $fresh fresh, $cached cached"

# 4. Build directory.html
echo "==> Building directory.html"
node "$ROOT/scripts/build-directory-html.mjs" "$DIST" "$THUMBS" "$HTML"

# 5. Print directory.html to PDF
echo "==> Rendering PDF"
"$CHROME" --headless=new --disable-gpu --no-sandbox \
  --no-pdf-header-footer \
  --print-to-pdf="$PDF" \
  --print-to-pdf-no-header \
  "file://$HTML" &>/dev/null

ls -la "$PDF"
echo "==> Done: $PDF"
