# Security logging — server PC (Yohto / Extra Team stack)

What to **collect**, **retain**, and **monitor** on your Linux server when running:

- `yohto-api.service` (Express)
- `yohto-client.service` (Next.js)
- `cloudflared-monthly.service`
- UFW firewall
- SSH
- PostgreSQL (local)

**Do not log:** passwords, JWT tokens, full cookies, `DATABASE_URL`, API keys, request bodies with credentials.

---

## 1. Logs you should keep

| Source | Path / command | Why |
|--------|----------------|-----|
| **SSH / auth** | `/var/log/auth.log` | Failed logins, sudo, session opens |
| **UFW firewall** | `/var/log/ufw.log` (if enabled) | Blocked scans, port probes |
| **Sudo** | `/var/log/auth.log` + optional `/var/log/sudo.log` | Who ran root commands |
| **fail2ban** | `/var/log/fail2ban.log` | IP bans after brute force |
| **systemd — API** | `journalctl -u yohto-api` | App errors, crashes, 500s |
| **systemd — client** | `journalctl -u yohto-client` | Next.js errors |
| **systemd — tunnel** | `journalctl -u cloudflared-monthly` | Tunnel disconnects |
| **PostgreSQL** | `/var/log/postgresql/` | DB auth failures (optional) |
| **Cloudflare** | Cloudflare dashboard → Analytics / Security | WAF, bot traffic (no local file) |

### Enable UFW logging (recommended)

```bash
sudo ufw logging medium
# or in /etc/ufw/ufw.conf: LOGLEVEL=medium
sudo ufw reload
```

### Enable dedicated sudo log (optional)

In `/etc/sudoers` or `/etc/sudoers.d/00-logging`:

```sudoers
Defaults logfile="/var/log/sudo.log"
Defaults log_input,log_output
```

---

## 2. Retention (how long to keep)

| Log type | Suggested retention |
|----------|---------------------|
| auth / ssh / sudo | 90–365 days |
| ufw / fail2ban | 30–90 days |
| app journals (systemd) | 30–90 days |
| Full disk backups of logs | Off-server (S3, another VPS) |

### systemd journal size limit

`/etc/systemd/journald.conf`:

```ini
SystemMaxUse=500M
MaxRetentionSec=90day
```

Then:

```bash
sudo systemctl restart systemd-journald
```

### logrotate (classic files)

Example `/etc/logrotate.d/yohto-security`:

```
/var/log/sudo.log
/var/log/ufw.log
{
    weekly
    rotate 12
    compress
    delaycompress
    missingok
    notifempty
}
```

---

## 3. What to monitor (alerts)

Watch for these **events** (daily review or automated alert):

| Event | Where | Action |
|-------|-------|--------|
| Many SSH failures from one IP | `auth.log`, fail2ban | Ban IP, check fail2ban |
| Successful SSH from unknown IP | `auth.log` | Verify it was you |
| Sudo / root usage | `auth.log`, `sudo.log` | Audit who changed what |
| UFW BLOCK spike | `ufw.log` | Normal on public IP; spike = scan |
| `yohto-api` restart loop | `journalctl -u yohto-api` | Fix crash, check DB |
| cloudflared disconnect | `journalctl -u cloudflared-monthly` | Site down — restart |
| Disk full | `df -h` | Expand disk or trim logs |
| Postgres auth failure | postgresql log | Wrong credentials / attack |

---

## 4. Daily / weekly commands (bash)

Use the scripts in `deploy/scripts/`:

```bash
# Quick security snapshot (run daily via cron)
~/yohto-cleaning-service/deploy/scripts/security-audit.sh

# Follow live auth failures
sudo tail -f /var/log/auth.log | grep -i "Failed\|Invalid"

# App logs
journalctl -u yohto-api -u yohto-client -u cloudflared-monthly -f

# Last 24h failed SSH
sudo grep "Failed password\|Invalid user" /var/log/auth.log | tail -50

# UFW blocks today
sudo grep "$(date +%b\ %e)" /var/log/ufw.log 2>/dev/null | grep BLOCK | tail -20

# Service health
systemctl is-active yohto-api yohto-client cloudflared-monthly
```

---

## 5. Cron examples

Edit crontab as root or your admin user:

```bash
sudo crontab -e
```

```cron
# Daily security audit at 6:00 AM → /var/log/yohto-security-audit.log
0 6 * * * /home/zaman/yohto-cleaning-service/deploy/scripts/security-audit.sh >> /var/log/yohto-security-audit.log 2>&1

# Weekly: email audit (requires mailutils + MAILTO)
0 7 * * 1 /home/zaman/yohto-cleaning-service/deploy/scripts/security-audit.sh | mail -s "Weekly security audit" admin@example.com
```

Ensure audit log is rotated:

```bash
sudo touch /var/log/yohto-security-audit.log
sudo chown root:adm /var/log/yohto-security-audit.log
sudo chmod 640 /var/log/yohto-security-audit.log
```

---

## 6. Application-level logging (Express)

**Do log (structured JSON in production):**

- Request: method, path, status, duration, client IP (from `X-Forwarded-For`)
- Auth: login success/failure (no password), user id, IP
- Admin actions: user approval, delete user
- Errors: stack in dev only; message + code in prod

**Do not log:**

- Passwords, reset tokens, JWT, refresh tokens
- Full `Authorization` header
- Email bodies with secrets

Optional: add `morgan` + Winston/Pino to Express with redaction — see `deploy/scripts/log-redact.example.json`.

---

## 7. Python vs bash

| Use | Tool |
|-----|------|
| Cron snapshots, grep, journalctl | **bash** (simple, no deps) |
| Parse JSON logs, Slack/email alerts, dashboards | **Python** |
| Long-term SIEM | External (Grafana Loki, Datadog, Cloudflare logs) |

For one server, **bash + journalctl + fail2ban + UFW logging** is enough to start.

---

## 8. Cloudflare (off-server)

In Cloudflare dashboard, enable and review:

- **Security → Events** — blocked requests, challenges
- **Analytics → Traffic** — spikes
- **Zero Trust → Tunnel** — tunnel health

Optional: **Logpush** to S3/R2 for long-term storage (paid feature on some plans).

---

## 9. Backup logs off-server

Copy weekly to another machine or object storage:

```bash
# Example: tarball auth + audit logs
sudo tar czf /tmp/security-logs-$(date +%F).tar.gz \
  /var/log/auth.log* \
  /var/log/ufw.log* \
  /var/log/yohto-security-audit.log* \
  2>/dev/null
# scp to backup host — do not commit archives to git
```

---

## 10. Checklist

```
[ ] UFW logging enabled
[ ] fail2ban installed and jails active (sshd)
[ ] journald retention configured
[ ] security-audit.sh in daily cron
[ ] SSH key-only, no root login
[ ] App .env chmod 600
[ ] No secrets in application logs
[ ] Review auth.log weekly
[ ] Cloudflare cache bypass on /api/*
```

---

## Scripts in this repo

| Script | Purpose |
|--------|---------|
| `deploy/scripts/security-audit.sh` | Daily snapshot: services, disk, SSH fails, UFW |
| `deploy/scripts/watch-auth-failures.sh` | Live tail failed SSH |
| `deploy/scripts/export-journal-logs.sh` | Export last N days app logs to file |
| `deploy/scripts/security_report.py` | Optional Python report + threshold alerts |

See `deploy/scripts/README.md` for usage.
