#!/usr/bin/env bash
# Live tail of SSH authentication failures.
# Usage: sudo ./watch-auth-failures.sh

set -euo pipefail

AUTH_LOG="/var/log/auth.log"

if [[ ! -r "$AUTH_LOG" ]]; then
  echo "Cannot read $AUTH_LOG — run with sudo." >&2
  exit 1
fi

echo "Watching SSH failures in $AUTH_LOG (Ctrl+C to stop)..."
tail -f "$AUTH_LOG" | grep --line-buffered -iE "Failed|Invalid user|authentication failure|BREAK-IN"
