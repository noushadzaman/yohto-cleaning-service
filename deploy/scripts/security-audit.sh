#!/usr/bin/env bash
# Daily security snapshot for Yohto server.
# Usage: sudo ./security-audit.sh
# Cron:  0 6 * * * /path/to/security-audit.sh >> /var/log/yohto-security-audit.log 2>&1

set -euo pipefail

HOST="$(hostname)"
NOW="$(date -Is)"
AUTH_LOG="/var/log/auth.log"
UFW_LOG="/var/log/ufw.log"

section() {
  echo ""
  echo "========== $1 =========="
}

section "Security audit — $HOST — $NOW"

section "Services"
for svc in yohto-api yohto-client cloudflared-monthly fail2ban ufw; do
  if systemctl list-unit-files "${svc}.service" &>/dev/null; then
    state="$(systemctl is-active "${svc}" 2>/dev/null || echo unknown)"
    echo "  ${svc}: ${state}"
  else
    echo "  ${svc}: (not installed)"
  fi
done

section "Disk"
df -h / /var 2>/dev/null | sed 's/^/  /'

section "Listening ports (public bind check)"
if command -v ss >/dev/null; then
  ss -tlnp 2>/dev/null | grep -E 'LISTEN|:22 |:3000|:5000|:80 |:443 ' | sed 's/^/  /' || echo "  (none matched or need root for -p)"
else
  echo "  ss not installed"
fi

section "SSH failures (last 24h, sample)"
if [[ -r "$AUTH_LOG" ]]; then
  since="$(date -d '24 hours ago' '+%b %e' 2>/dev/null || date '+%b %e')"
  grep -E "Failed password|Invalid user|authentication failure" "$AUTH_LOG" 2>/dev/null \
    | tail -30 | sed 's/^/  /' || echo "  none in sample"
else
  echo "  cannot read $AUTH_LOG (run with sudo?)"
fi

section "SSH successes (last 10)"
if [[ -r "$AUTH_LOG" ]]; then
  grep -E "Accepted publickey|Accepted password|session opened for user" "$AUTH_LOG" 2>/dev/null \
    | tail -10 | sed 's/^/  /' || echo "  none"
fi

section "Sudo usage (last 15)"
if [[ -r "$AUTH_LOG" ]]; then
  grep -E "sudo:|COMMAND=" "$AUTH_LOG" 2>/dev/null | tail -15 | sed 's/^/  /' || echo "  none"
fi
if [[ -r /var/log/sudo.log ]]; then
  tail -10 /var/log/sudo.log 2>/dev/null | sed 's/^/  sudo.log: /'
fi

section "UFW blocks (today, sample)"
if [[ -r "$UFW_LOG" ]]; then
  today="$(date '+%b %e' | tr -s ' ')"
  grep "$today" "$UFW_LOG" 2>/dev/null | grep BLOCK | tail -20 | sed 's/^/  /' || echo "  none today"
else
  echo "  UFW log not found — enable: sudo ufw logging medium"
fi

section "fail2ban banned IPs"
if command -v fail2ban-client >/dev/null; then
  fail2ban-client status sshd 2>/dev/null | sed 's/^/  /' || echo "  sshd jail not active"
else
  echo "  fail2ban not installed"
fi

section "App errors (last 50 lines, yohto-api)"
journalctl -u yohto-api -p err --no-pager -n 50 2>/dev/null | sed 's/^/  /' || echo "  (no journal access)"

section "cloudflared (last 20 lines)"
journalctl -u cloudflared-monthly --no-pager -n 20 2>/dev/null | sed 's/^/  /' || echo "  (no journal access)"

section "End audit"
