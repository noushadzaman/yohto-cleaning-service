#!/usr/bin/env python3
"""
Security report for Yohto server — run daily via cron.
Reads auth.log and optional audit thresholds; prints JSON or text.

Usage:
  sudo python3 security_report.py
  sudo python3 security_report.py --json
  sudo python3 security_report.py --alert-threshold 20

Exit code 1 if SSH failure count exceeds threshold (for cron alerting).
"""

from __future__ import annotations

import argparse
import json
import re
import subprocess
import sys
from collections import Counter
from datetime import datetime, timedelta, timezone
from pathlib import Path

AUTH_LOG = Path("/var/log/auth.log")
UFW_LOG = Path("/var/log/ufw.log")
SERVICES = ("yohto-api", "yohto-client", "cloudflared-monthly")


def run(cmd: list[str]) -> str:
    try:
        return subprocess.check_output(cmd, stderr=subprocess.DEVNULL, text=True).strip()
    except (subprocess.CalledProcessError, FileNotFoundError):
        return ""


def service_states() -> dict[str, str]:
    out: dict[str, str] = {}
    for svc in SERVICES:
        state = run(["systemctl", "is-active", f"{svc}.service"])
        out[svc] = state or "unknown"
    return out


def parse_auth_failures(hours: int = 24) -> tuple[int, Counter[str]]:
    if not AUTH_LOG.is_file():
        return 0, Counter()

    cutoff = datetime.now(timezone.utc) - timedelta(hours=hours)
    fail_re = re.compile(
        r"Failed password for (?:invalid user )?(\S+)|Invalid user (\S+)",
        re.I,
    )
    count = 0
    ips: Counter[str] = Counter()

    # auth.log timestamps: "Jul  8 06:00:01" — approximate filter via tail
    try:
        lines = AUTH_LOG.read_text(errors="replace").splitlines()[-5000:]
    except PermissionError:
        return -1, Counter()

    for line in lines:
        if not re.search(r"Failed password|Invalid user|authentication failure", line, re.I):
            continue
        count += 1
        m = re.search(r"from (\d+\.\d+\.\d+\.\d+)", line)
        if m:
            ips[m.group(1)] += 1

    return count, ips


def ufw_blocks_today() -> int:
    if not UFW_LOG.is_file():
        return -1
    try:
        text = UFW_LOG.read_text(errors="replace")
    except PermissionError:
        return -1
    today = datetime.now().strftime("%b %e").replace("  ", " ")
    return sum(1 for line in text.splitlines() if today in line and "BLOCK" in line)


def main() -> int:
    parser = argparse.ArgumentParser(description="Yohto security report")
    parser.add_argument("--json", action="store_true", help="Output JSON")
    parser.add_argument(
        "--alert-threshold",
        type=int,
        default=50,
        help="Exit 1 if SSH failures in sample exceed this (default 50)",
    )
    args = parser.parse_args()

    services = service_states()
    ssh_fails, top_ips = parse_auth_failures()
    ufw_blocks = ufw_blocks_today()
    disk = run(["df", "-h", "/"])

    report = {
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "hostname": run(["hostname"]) or "unknown",
        "services": services,
        "ssh_failures_sampled": ssh_fails,
        "top_ssh_fail_ips": dict(top_ips.most_common(10)),
        "ufw_blocks_today": ufw_blocks,
        "disk": disk.splitlines() if disk else [],
        "alerts": [],
    }

    for svc, state in services.items():
        if state != "active":
            report["alerts"].append(f"service {svc} is {state}")

    if ssh_fails >= 0 and ssh_fails >= args.alert_threshold:
        report["alerts"].append(f"high SSH failure count: {ssh_fails}")

    if args.json:
        print(json.dumps(report, indent=2))
    else:
        print(f"Security report — {report['hostname']} — {report['timestamp']}")
        print("Services:", services)
        print(f"SSH failures (sample): {ssh_fails}")
        if top_ips:
            print("Top fail IPs:", dict(top_ips.most_common(5)))
        print(f"UFW blocks today: {ufw_blocks}")
        if report["alerts"]:
            print("ALERTS:")
            for a in report["alerts"]:
                print(f"  - {a}")

    return 1 if report["alerts"] and ssh_fails >= args.alert_threshold else 0


if __name__ == "__main__":
    sys.exit(main())
