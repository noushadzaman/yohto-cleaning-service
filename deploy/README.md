# Deployment

**Full server setup guide:** [SERVER-SETUP.md](./SERVER-SETUP.md)

Quick reference for this repo:

| Topic | Location |
|-------|----------|
| Complete Linux + tunnel + systemd runbook | [SERVER-SETUP.md](./SERVER-SETUP.md) |
| Security logging & audit scripts | [SECURITY-LOGGING.md](./SECURITY-LOGGING.md) |
| systemd units | [systemd/](./systemd/) |
| Cloudflare Tunnel config | [cloudflared/config.yml.example](./cloudflared/config.yml.example) |
| Sudo examples | [sudoers/](./sudoers/) |
| nginx (optional, not used in current prod) | [nginx/](./nginx/) |

**Current production:** Cloudflare Tunnel → `127.0.0.1:3000` + `127.0.0.1:5000`. No nginx.
