#!/usr/bin/env bash
# Export systemd journal logs for Yohto services to a dated file.
# Usage: ./export-journal-logs.sh [days] [output_dir]
# Example: ./export-journal-logs.sh 7 ~/log-exports

set -euo pipefail

DAYS="${1:-7}"
OUT_DIR="${2:-$HOME/log-exports}"
STAMP="$(date +%Y%m%d-%H%M%S)"
mkdir -p "$OUT_DIR"

SERVICES=(yohto-api yohto-client cloudflared-monthly)

for svc in "${SERVICES[@]}"; do
  out="$OUT_DIR/${svc}-${STAMP}.log"
  echo "Exporting $svc (last ${DAYS}d) -> $out"
  journalctl -u "$svc" --since "${DAYS} days ago" --no-pager > "$out" 2>/dev/null || true
done

echo "Done. Files in $OUT_DIR"
ls -la "$OUT_DIR"/*"${STAMP}"* 2>/dev/null || true
