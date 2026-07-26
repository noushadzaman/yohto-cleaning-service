# Linux server setup — Extra Team / Yohto cleaning service

Complete runbook for self-hosting this project (or a similar Node.js + Next.js stack) on Ubuntu/Debian with **Cloudflare Tunnel**, **systemd**, and **UFW**.

**Current production architecture (no nginx required):**

```
Browser
  → Cloudflare (DNS + CDN)
  → cloudflared tunnel (outbound from server)
  → 127.0.0.1:3000  Next.js client
  → 127.0.0.1:5000  Express API (also via api subdomain)
```

**Domains (this project):**

| Hostname | Points to |
|----------|-----------|
| `app.pcsmonthlypla.online` | Next.js `:3000` |
| `api.pcsmonthlypla.online` | Express `:5000` |

---

## Table of contents

1. [Prerequisites](#1-prerequisites)
2. [Initial server hardening](#2-initial-server-hardening)
3. [Install system packages](#3-install-system-packages)
4. [PostgreSQL](#4-postgresql)
5. [Node.js](#5-nodejs)
6. [Clone and build the app](#6-clone-and-build-the-app)
7. [Environment files](#7-environment-files)
8. [Users and developers group](#8-users-and-developers-group)
9. [Sudo configuration](#9-sudo-configuration)
10. [systemd services](#10-systemd-services)
11. [Cloudflare Tunnel](#11-cloudflare-tunnel)
12. [Firewall (UFW)](#12-firewall-ufw)
13. [Cloudflare dashboard](#13-cloudflare-dashboard)
14. [Deploy / update workflow](#14-deploy--update-workflow)
15. [Verify](#15-verify)
16. [Logs and troubleshooting](#16-logs-and-troubleshooting)
17. [Optional: nginx (not used in current setup)](#17-optional-nginx-not-used-in-current-setup)
18. [Checklist](#18-checklist)

---

## 1. Prerequisites

- Ubuntu 22.04+ or Debian 12+ server
- Domain on Cloudflare (e.g. `pcsmonthlypla.online`)
- SSH access as admin user (example: `zaman`)
- Git access to this repository

Replace in all commands:

| Placeholder | Your value (example) |
|-------------|----------------------|
| `ADMIN_USER` | `zaman` |
| `APP_DIR` | `/home/zaman/yohto-cleaning-service` |
| `APP_DOMAIN` | `app.pcsmonthlypla.online` |
| `API_DOMAIN` | `api.pcsmonthlypla.online` |

---

## 2. Initial server hardening

### SSH (edit `/etc/ssh/sshd_config`)

```
PermitRootLogin no
PasswordAuthentication no
PubkeyAuthentication yes
AllowUsers zaman
MaxAuthTries 3
```

Apply:

```bash
sudo systemctl reload sshd
```

Use **SSH keys** only. Test in a second terminal before closing your session.

### Automatic security updates

```bash
sudo apt update
sudo apt install -y unattended-upgrades
sudo dpkg-reconfigure -plow unattended-upgrades
```

---

## 3. Install system packages

```bash
sudo apt update
sudo apt install -y git curl build-essential ufw fail2ban postgresql postgresql-contrib
```

Optional (rate-limit SSH brute force):

```bash
sudo systemctl enable --now fail2ban
```

---

## 4. PostgreSQL

```bash
sudo -u postgres psql << 'SQL'
CREATE USER yohto WITH PASSWORD 'CHANGE_ME_STRONG_PASSWORD';
CREATE DATABASE yohto_dashboard OWNER yohto;
GRANT ALL PRIVILEGES ON DATABASE yohto_dashboard TO yohto;
SQL
```

PostgreSQL should listen on **localhost only** (default on Ubuntu).

Connection string for `server/.env`:

```env
DATABASE_URL="postgresql://yohto:CHANGE_ME_STRONG_PASSWORD@localhost:5432/yohto_dashboard"
```

Run migrations after first build (see [§6](#6-clone-and-build-the-app)).

---

## 5. Node.js

Install Node 20+ (LTS). Example with NodeSource:

```bash
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs
node --version
npm --version
```

Confirm paths used by systemd:

```bash
which node    # often /usr/bin/node
which npm
```

---

## 6. Clone and build the app

```bash
cd ~
git clone <YOUR_REPO_URL> yohto-cleaning-service
cd yohto-cleaning-service

# API
cd server
cp .env.example .env
# Edit .env — see §7
npm ci
npm run build
npx prisma migrate deploy
npx prisma db seed

# Client
cd ../client
cp .env.local.example .env.local
# Edit .env.local — see §7
npm ci
npm run build
```

Protect secrets:

```bash
chmod 600 ~/yohto-cleaning-service/server/.env
chmod 600 ~/yohto-cleaning-service/client/.env.local
```

---

## 7. Environment files

### `server/.env` (production)

```env
DATABASE_URL="postgresql://yohto:PASSWORD@localhost:5432/yohto_dashboard"
PORT=5000
HOST=127.0.0.1

JWT_SECRET="<openssl rand -base64 48>"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="30d"
JWT_REFRESH_TTL_SECONDS="2592000"

CLIENT_ORIGIN="https://app.pcsmonthlypla.online"
CLIENT_BASE_URL="https://app.pcsmonthlypla.online"
TRUST_PROXY="1"

PASSWORD_RESET_TTL_SECONDS="1800"

RESEND_API_KEY="re_xxxx"
EMAIL_FROM="Extra Team <onboarding@resend.dev>"

ADMIN_EMAIL="admin@example.com"
ADMIN_PASSWORD="change-me-strong-password"
```

| Variable | Purpose |
|----------|---------|
| `HOST=127.0.0.1` | API not reachable from the internet directly |
| `TRUST_PROXY=1` | Real client IP behind Cloudflare / tunnel |
| `CLIENT_ORIGIN` | CORS — must match app URL |

### `client/.env.local` (production)

```env
NEXT_PUBLIC_APP_URL=https://app.pcsmonthlypla.online
API_BASE_URL=http://127.0.0.1:5000
```

| Variable | Purpose |
|----------|---------|
| `API_BASE_URL` | Next.js server-side calls to Express on localhost |
| Browser | Uses same-origin `/api/*` on the app domain (Next proxies to Express) |

**Do not** expose `http://YOUR_SERVER_IP:5000` to the browser in production.

---

## 8. Users and developers group

Use a **`developers`** group when teammates need access to the codebase **without full sudo**.

### Create group and user (correct order)

```bash
# 1. Group first
sudo groupadd developers

# 2. Create developer account
sudo adduser bob

# 3. Add to group (-aG = append, do not remove other groups)
sudo usermod -aG developers bob

# 4. Set password
sudo passwd bob

# 5. Verify (user must log out/in for group to apply in shell)
groups bob
id bob
```

### Shared app directory (no sudo for daily work)

```bash
sudo chown -R zaman:developers /home/zaman/yohto-cleaning-service
sudo chmod -R g+rwX /home/zaman/yohto-cleaning-service
sudo find /home/zaman/yohto-cleaning-service -type d -exec chmod g+s {} \;
```

New files inherit the `developers` group.

### Remove user from group

```bash
sudo gpasswd -d bob developers
```

---

## 9. Sudo configuration

### Admin user (`zaman`) — example `/etc/sudoers.d/zaman`

```bash
sudo visudo -f /etc/sudoers.d/zaman
```

```sudoers
# Admin: zaman
Defaults timestamp_timeout=15
Defaults mail_badpass

Cmnd_Alias UPDATE_READ = /usr/bin/apt update
Cmnd_Alias SERVICE_STATUS = /usr/bin/systemctl status *
Cmnd_Alias NETWORK_READ = /usr/bin/ss, /usr/bin/ping -c *

# Passwordless read-only / low-risk only
zaman ALL=(ALL) NOPASSWD: UPDATE_READ, SERVICE_STATUS, NETWORK_READ

# Full sudo with password for everything else
zaman ALL=(ALL:ALL) ALL
```

Validate:

```bash
sudo visudo -cf /etc/sudoers.d/zaman
```

### Developers — example `/etc/sudoers.d/developers`

Developers usually **do not need sudo**. If they need to restart the app only:

```bash
sudo visudo -f /etc/sudoers.d/developers
```

```sudoers
# Restart app services only (no root shell)
Cmnd_Alias YOHTO_SERVICES = /usr/bin/systemctl restart yohto-api, \
                            /usr/bin/systemctl restart yohto-client, \
                            /usr/bin/systemctl status yohto-api, \
                            /usr/bin/systemctl status yohto-client

%developers ALL=(ALL) NOPASSWD: YOHTO_SERVICES
```

Validate:

```bash
sudo visudo -cf /etc/sudoers.d/developers
```

---

## 10. systemd services

Unit files live in the repo under `deploy/systemd/`.

### Install units

```bash
cd ~/yohto-cleaning-service
sudo cp deploy/systemd/yohto-api.service /etc/systemd/system/
sudo cp deploy/systemd/yohto-client.service /etc/systemd/system/
sudo cp deploy/systemd/cloudflared-monthly.service /etc/systemd/system/
sudo systemctl daemon-reload
```

### `yohto-api.service`

```ini
[Unit]
Description=Yohto Express API
After=network.target postgresql.service
Wants=postgresql.service

[Service]
Type=simple
User=zaman
WorkingDirectory=/home/zaman/yohto-cleaning-service/server
ExecStart=/usr/bin/node dist/index.js
Restart=on-failure
RestartSec=10
Environment=NODE_ENV=production
Environment=HOST=127.0.0.1
Environment=PORT=5000
EnvironmentFile=/home/zaman/yohto-cleaning-service/server/.env

[Install]
WantedBy=multi-user.target
```

### `yohto-client.service`

```ini
[Unit]
Description=Yohto Next.js Client
After=network.target yohto-api.service
Requires=yohto-api.service

[Service]
Type=simple
User=zaman
WorkingDirectory=/home/zaman/yohto-cleaning-service/client
ExecStart=/home/zaman/yohto-cleaning-service/client/start-client.sh
Restart=on-failure
RestartSec=10
Environment=NODE_ENV=production
EnvironmentFile=-/home/zaman/yohto-cleaning-service/client/.env.local

[Install]
WantedBy=multi-user.target
```

`start-client.sh` runs `npm run start:prod` → Next on `127.0.0.1:3000`.

### Enable and start (API + client first)

```bash
sudo systemctl enable yohto-api yohto-client
sudo systemctl start yohto-api yohto-client
sudo systemctl status yohto-api yohto-client
```

Expected API log: `Server is running on http://127.0.0.1:5000`

---

## 11. Cloudflare Tunnel

With a tunnel you **do not need nginx** and **do not open ports 80/443** on the firewall.

### Install cloudflared

```bash
# Check where it installs on your system
which cloudflared
# Common paths: /usr/local/bin/cloudflared or /usr/bin/cloudflared
```

Download from [Cloudflare Zero Trust docs](https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/downloads/) if needed.

### Create tunnel (one-time)

```bash
cloudflared tunnel login
cloudflared tunnel create monthly-plan
# Note the tunnel UUID and credentials JSON path
```

### Config `~/.cloudflared/config.yml`

**Important:** Do **not** route `app.../api/*` to Express. Next.js owns `/api/*`.

```bash
sudo tee /home/zaman/.cloudflared/config.yml > /dev/null << 'EOF'
tunnel: YOUR_TUNNEL_UUID
credentials-file: /home/zaman/.cloudflared/YOUR_TUNNEL_UUID.json

ingress:
  - hostname: app.pcsmonthlypla.online
    service: http://127.0.0.1:3000
  - hostname: api.pcsmonthlypla.online
    service: http://127.0.0.1:5000
  - service: http_status:404
EOF
```

### Route DNS in Cloudflare

```bash
cloudflared tunnel route dns monthly-plan app.pcsmonthlypla.online
cloudflared tunnel route dns monthly-plan api.pcsmonthlypla.online
```

Or add CNAME records in the Cloudflare dashboard pointing to the tunnel.

### `cloudflared-monthly.service`

Use the **correct path** from `which cloudflared`:

```ini
[Unit]
Description=Cloudflare Tunnel - monthly-plan
After=network.target yohto-client.service
Wants=yohto-client.service

[Service]
Type=simple
User=zaman
WorkingDirectory=/home/zaman
ExecStart=/usr/local/bin/cloudflared tunnel --config /home/zaman/.cloudflared/config.yml run
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

If systemd fails with **`status=203/EXEC`**, the binary path is wrong — fix `ExecStart`.

```bash
sudo systemctl enable cloudflared-monthly
sudo systemctl start cloudflared-monthly
sudo systemctl status cloudflared-monthly
```

Success: `Active: active (running)` and `Registered tunnel connection` in logs.

---

## 12. Firewall (UFW)

With Cloudflare Tunnel, only **SSH** needs to be open inbound:

```bash
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow OpenSSH
sudo ufw enable
sudo ufw status verbose
```

Expected:

```
22/tcp (OpenSSH)    ALLOW IN    Anywhere
```

**Do not open** 3000, 5000, 80, or 443 unless you add nginx and drop the tunnel.

Optional — restrict SSH to your IP:

```bash
sudo ufw delete allow OpenSSH
sudo ufw allow from YOUR_HOME_IP to any port 22 proto tcp
```

---

## 13. Cloudflare dashboard

| Setting | Value |
|---------|--------|
| SSL/TLS mode | Full or Full (strict) |
| Always Use HTTPS | ON |
| WebSockets | ON (Network) |
| Cache — bypass | `app.pcsmonthlypla.online/api/*` |
| Cache — bypass | `api.pcsmonthlypla.online/*` |

After frontend deploys, purge cache for the app hostname if users see stale pages.

---

## 14. Deploy / update workflow

```bash
cd ~/yohto-cleaning-service
git pull

# API
cd server
npm ci
npm run build
npx prisma migrate deploy
sudo systemctl restart yohto-api

# Client
cd ../client
npm ci
npm run build
sudo systemctl restart yohto-client

# Tunnel (only if config changed)
sudo systemctl restart cloudflared-monthly
```

One-liner status check:

```bash
sudo systemctl status yohto-api yohto-client cloudflared-monthly
```

---

## 15. Verify

### Local (on server)

```bash
curl -sI http://127.0.0.1:3000 | head -3          # 307 redirect OK (→ login)
curl -sI http://127.0.0.1:5000/api/health | head -3   # 200 OK
```

### Public (via tunnel)

```bash
curl -sI https://app.pcsmonthlypla.online | head -3
curl -sI https://api.pcsmonthlypla.online/api/health | head -3
```

### Browser

1. Open `https://app.pcsmonthlypla.online`
2. Log in
3. Test main dashboard and weekly showcase

### Ports not public

From another machine, ports 3000 and 5000 on the server IP should be **closed/filtered**.

---

## 16. Logs and troubleshooting

```bash
journalctl -u yohto-api -f
journalctl -u yohto-client -f
journalctl -u cloudflared-monthly -f
```

| Problem | Fix |
|---------|-----|
| `203/EXEC` on cloudflared | Fix `ExecStart` path: `which cloudflared` |
| Login / auth 404 | Remove `path: /api/* → :5000` from tunnel config |
| CORS errors | Set `CLIENT_ORIGIN` to exact app URL in `server/.env` |
| API unreachable from Next | Set `API_BASE_URL=http://127.0.0.1:5000` in `client/.env.local` |
| Tunnel not connecting | Check credentials JSON path and tunnel UUID |
| Group not applied | Developer must log out and back in |

---

## 17. Optional: nginx (not used in current setup)

The repo includes `deploy/nginx/` configs for an **alternative** setup without cloudflared:

```
Internet → Cloudflare → server:443 nginx → 127.0.0.1:3000 / :5000
```

See `deploy/nginx/yohto-app.conf` and `deploy/nginx/yohto-api.conf`.

**Current production uses cloudflared only — nginx is not installed.**

---

## 18. Checklist

### One-time server setup

- [ ] SSH keys only, root login disabled
- [ ] PostgreSQL database and user created
- [ ] Node.js installed
- [ ] Repo cloned, `server/.env` and `client/.env.local` configured
- [ ] `npm run build` + `prisma migrate deploy` + seed
- [ ] `developers` group created (if needed)
- [ ] sudoers files for admin / developers
- [ ] systemd units installed and enabled
- [ ] cloudflared tunnel created and config.yml correct
- [ ] UFW: SSH only, enabled
- [ ] Cloudflare cache bypass for API paths

### After each deploy

- [ ] `git pull` + build server + client
- [ ] `prisma migrate deploy` if schema changed
- [ ] Restart `yohto-api` and `yohto-client`
- [ ] Smoke test login in browser

### Services summary

| Service | Port | Public? |
|---------|------|---------|
| `yohto-client` | 127.0.0.1:3000 | No — via tunnel only |
| `yohto-api` | 127.0.0.1:5000 | No — via tunnel only |
| `cloudflared-monthly` | outbound | Connects to Cloudflare |
| UFW | 22 | SSH only |

---

## Reuse for next project

1. Copy `deploy/systemd/`, `deploy/cloudflared/`, and this doc.
2. Replace domains, paths, user names, and tunnel name.
3. Keep the same pattern: **apps on localhost**, **tunnel or nginx** for public access, **UFW** minimal inbound.
4. Never route frontend `/api/*` to the backend if the frontend has its own API routes.

---

*Last updated for: Extra Team dashboard — Cloudflare Tunnel + systemd production layout.*
