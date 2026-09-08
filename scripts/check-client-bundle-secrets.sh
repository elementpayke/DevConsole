#!/usr/bin/env bash
# Post-build scan: FE_CLIENT_SECRET must never appear in client bundles.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
NEXT_DIR="$ROOT/.next"

if [[ ! -d "$NEXT_DIR" ]]; then
  echo "security:bundle — .next missing; run npm run build first" >&2
  exit 1
fi

# Scan browser chunks only (static/chunks), not server bundles.
HITS="$(
  grep -R --include='*.js' -l 'FE_CLIENT_SECRET' "$NEXT_DIR/static" 2>/dev/null || true
)"

if [[ -n "$HITS" ]]; then
  echo "SECURITY FAIL: FE_CLIENT_SECRET found in client bundle files:" >&2
  echo "$HITS" >&2
  exit 1
fi

# Also fail if a NEXT_PUBLIC_ FE secret was ever introduced.
PUB="$(
  grep -R --include='*.js' -l 'NEXT_PUBLIC_FE_CLIENT_SECRET' "$NEXT_DIR" 2>/dev/null || true
)"
if [[ -n "$PUB" ]]; then
  echo "SECURITY FAIL: NEXT_PUBLIC_FE_CLIENT_SECRET found in build output:" >&2
  echo "$PUB" >&2
  exit 1
fi

echo "security:bundle — OK (no FE_CLIENT_SECRET in client static chunks)"
