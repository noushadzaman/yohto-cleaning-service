# Deploy scripts

## Security logging

Full guide: [../SECURITY-LOGGING.md](../SECURITY-LOGGING.md)

```bash
chmod +x deploy/scripts/*.sh deploy/scripts/*.py

# Daily audit (use sudo for auth.log)
sudo deploy/scripts/security-audit.sh

# Live SSH failure watch
sudo deploy/scripts/watch-auth-failures.sh

# Export app journals
deploy/scripts/export-journal-logs.sh 7 ~/log-exports

# Python report (optional cron alert)
sudo python3 deploy/scripts/security_report.py
sudo python3 deploy/scripts/security_report.py --json
```

### Cron (daily 6 AM)

```bash
sudo crontab -e
```

```
0 6 * * * /home/zaman/yohto-cleaning-service/deploy/scripts/security-audit.sh >> /var/log/yohto-security-audit.log 2>&1
0 6 * * * /usr/bin/python3 /home/zaman/yohto-cleaning-service/deploy/scripts/security_report.py >> /var/log/yohto-security-audit.log 2>&1
```
