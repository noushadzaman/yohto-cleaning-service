# Extra Team Dashboard — Product Overview

> **Shorter formats:** [One-pager](./PRODUCT-ONE-PAGER.md) · [Sales & pricing](./PRODUCT-SALES.md)

**Extra Team Dashboard** is a web application for cleaning and field-service teams who need a clear, shared view of **who works when**, **what jobs are planned**, and **detailed weekly job information** — all in one secure place.

Production example: **https://app.pcsmonthlypla.online**

---

## Who is it for?

| Role | How they use the app |
|------|----------------------|
| **Team members** | View their schedule, see job details, use light/dark mode on phone or desktop |
| **Administrators** | Plan the month, edit weekly job sheets, approve new users, manage columns |
| **Operations / office** | Track hours per person, per day, and per week from automatic summaries |

Built for teams like **Extra Team** (cleaning services) but flexible enough for any business that schedules people by day and needs a weekly planning grid.

---

## How it works

```
┌─────────────────────────────────────────────────────────────────┐
│  Browser (phone, tablet, or PC)                                  │
│  https://app.yourdomain.com                                      │
└────────────────────────────┬────────────────────────────────────┘
                             │ HTTPS (secure)
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│  Cloudflare — DNS, SSL, optional caching & security              │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│  Your server — Cloudflare Tunnel (no public ports required)      │
│    • Next.js app (pages, login, dashboard UI)                    │
│    • Express API (data, auth, email)                             │
│    • PostgreSQL database (all schedules saved permanently)       │
└─────────────────────────────────────────────────────────────────┘
```

### Typical day for a team member

1. Open the app and **log in**.
2. On the **Main dashboard**, find their name column and scroll to today’s date.
3. Read the task: company, description, car, transport type, shift times, location link.
4. On **Weekly showcase**, open the current calendar week for detailed site instructions (keys, alarm, equipment, max hours, etc.).

### Typical day for an admin

1. Log in and open the **Main dashboard** for the month.
2. Click **+** in a cell to assign or update a job for a team member on a specific day.
3. Open **Weekly showcase**, add rows, fill cells, or **Manage columns** to show/hide or add custom fields.
4. Approve new registrations from the sidebar **Manage users** panel.

All changes are **saved to the database immediately** and visible to the team after refresh.

---

## Features

### Main dashboard (monthly schedule)

- **Calendar grid** — every day of the month × each approved team member.
- **Task details per cell:**
  - Shift time range (start–end)
  - Company name
  - Task description (rich text)
  - Car / vehicle
  - Transport type (own car, company car, bike, public transport, taxi, etc.) with colour indicators
  - Location (text or clickable map link)
- **Automatic hour summaries:**
  - Total hours per person for the month
  - Weekly average per person
  - Daily total hours (all staff)
- **Month navigation** — move between past and future months.
- **Sticky date columns** on mobile — date, day, and week stay visible while scrolling.
- **Your name highlighted** in the header so you can find your column quickly.

### Weekly showcase (detailed job planning)

- **Week-by-week table** with rich job information, including:
  - Title
  - Weekday / date (with assigned team members)
  - Customer
  - Point of business
  - Keys (Sandra)
  - Alarm (Sandra)
  - Instructions
  - Special equipment / detergent
  - Max time (hours, inclusive of driving)
- **Custom columns** — admins can add fields (e.g. “Working hours”, parking notes).
- **Show / hide columns** — hide built-in columns without losing data; restore anytime.
- **Edit column labels** and header colours for important columns.
- **Multiple rows per week** — add a row when you have more than one job line.
- **Rich text** in cells — formatting, links, file-style link chips.
- **Week navigation** — browse any calendar week in any year.

### User & security

- **Self-registration** — new staff sign up; admin approves before access.
- **Secure login** — passwords hashed; sessions use short-lived tokens + refresh tokens in httpOnly cookies.
- **Password reset** via email.
- **Role-based access:**
  - **Admin** — full edit, user management, column management.
  - **Approved user** — view schedules; admins edit on their behalf.
- **Rate limiting** on login and registration to reduce abuse.

### User experience

- **Light and dark mode** — switch in the sidebar; works on mobile.
- **Responsive layout** — usable on phone, tablet, and desktop.
- **Sidebar navigation** — Main dashboard and Weekly showcase.
- **Branded header** — Extra Team logo and title.

### Administration

- **Approve / unapprove users** from the sidebar.
- **Delete unapproved users** when needed.
- **Pending approval badge** — admins see how many users are waiting.
- **Polling** — user list updates periodically for admins.

---

## Flexibility for users and administrators

| Need | How the app adapts |
|------|---------------------|
| Different job fields each week | Add **custom columns** on Weekly showcase |
| Too many columns on screen | **Hide** columns; data stays in the database |
| Rename a column for your team | **Edit header label** (e.g. “Max time (h)” → “Working hours”) |
| Highlight important columns | **Header styles** (default, keys, alarm colours) |
| More than one job line per week | **Add row** on Weekly showcase |
| Different transport methods | Six built-in transport types with visual indicators |
| Location as text or map link | Enter plain address text or a URL; map icon only for links |
| Work from phone | Full mobile layout; tunnel + HTTPS; no app store install |
| Personal preference | Light / dark theme |
| Growing team | New users register; admin approves — no manual account creation required |
| Multi-month planning | Navigate months on main dashboard; weeks on weekly view |

---

## Step-by-step guide

### For new team members

1. Go to the app URL (e.g. `https://app.pcsmonthlypla.online`).
2. Click **Register** and fill in name, email, and password.
3. Wait for **administrator approval** (you’ll see a pending message until approved).
4. After approval, **log in**.
5. Open **Main dashboard** — find your name in the header row.
6. Scroll to the day you need and read your assignment.
7. Open **Weekly showcase** from the sidebar for detailed weekly instructions.

### For administrators — first-time setup

1. Deploy the application on your server (see `deploy/SERVER-SETUP.md`).
2. Set environment variables (database, JWT secret, email, domain).
3. Run database migrations and seed the first admin user.
4. Start services: API, client, Cloudflare Tunnel.
5. Log in as admin and verify both dashboards load.

### For administrators — daily use

**Assign a job (monthly grid)**

1. Main dashboard → select month.
2. Click **+** in the cell (team member × day).
3. Set shift time, company, task, car, transport, location.
4. Save — the cell updates for everyone.

**Edit weekly job sheet**

1. Sidebar → **Weekly showcase**.
2. Select the correct **week** with arrows.
3. Click **+** in a cell or use the pencil icon on filled cells.
4. Save — data is stored per week and row.

**Manage columns (weekly)**

1. Weekly showcase → **Manage columns**.
2. Hide/show built-in columns, add a custom column, or restore hidden ones.
3. Click a column header to **rename** or change style.

**Approve a new user**

1. Sidebar → **Manage users** (badge shows pending count).
2. Toggle approval **on** for the new team member.
3. They can log in on their next visit.

### For administrators — monthly review

1. Main dashboard → scroll to the **summary footer**.
2. Review **SUM h/month** and **AVERAGE h/week** per person.
3. Review **Tot. hours** per day on the right column.

---

## Cost

This product is **self-hosted software** — there is no built-in subscription or per-seat fee inside the application. Your costs depend on how you run it:

| Item | Typical cost | Notes |
|------|----------------|-------|
| **Software license** | Project-specific | Contact your provider / internal IT |
| **Server (VPS or PC)** | ~€5–40 / month | Small team; e.g. Ubuntu on a VPS or office PC |
| **Domain name** | ~€10–15 / year | e.g. `yourcompany.com` |
| **Cloudflare** | Free tier often sufficient | DNS, SSL, Tunnel, basic security |
| **Email (password reset)** | Free tier → paid | e.g. Resend — free tier for testing |
| **PostgreSQL** | Included on server | Runs locally on the same machine |
| **Support & maintenance** | Optional | Updates, backups, monitoring |

**No hidden per-user charges** in the app itself. You control:

- How many users can register (admin approval gate).
- How long you keep the server running.
- Whether you add paid email, backup, or monitoring services.

### What you get for that investment

- Unlimited approved team members (within server capacity).
- Unlimited months and weeks of schedule history (database storage).
- Custom weekly columns without extra modules.
- Secure HTTPS access from anywhere (with Cloudflare Tunnel).

---

## Technical summary (for IT / decision makers)

| Aspect | Detail |
|--------|--------|
| Type | Web application (browser-based) |
| Frontend | Next.js 16, React 19 |
| Backend | Express 5, PostgreSQL, Prisma |
| Auth | JWT + refresh tokens, bcrypt passwords |
| Hosting | Self-hosted; Cloudflare Tunnel recommended |
| Mobile | Responsive web — no native app required |
| Data | Stored in your PostgreSQL database on your server |
| Availability | Depends on your server and tunnel uptime |

---

## Support & documentation

| Document | Audience |
|----------|----------|
| **PRODUCT-ONE-PAGER.md** | Quick overview, email attachment |
| **PRODUCT-SALES.md** | Sales brochure, pricing, support packages |
| **PRODUCT.md** (this file) | Customers, managers, new users |
| **DOCUMENTATION.md** | Developers, technical staff |
| **deploy/SERVER-SETUP.md** | Server administrators |
| **deploy/SECURITY-LOGGING.md** | Security and audit |

---

## Quick FAQ

**Do I need to install an app on my phone?**  
No. Use Chrome, Safari, or any modern browser.

**Can I see last month’s schedule?**  
Yes. Use month navigation on the main dashboard.

**What if I forget my password?**  
Use **Forgot password** on the login page; you’ll receive a reset link by email.

**Can team members edit the schedule?**  
Only **administrators** create and edit tasks. Team members view their assignments.

**Can we add our own column names?**  
Yes. Admins use **Manage columns** on Weekly showcase and can add custom columns.

**Is our data on someone else’s cloud?**  
The database runs on **your server**. Cloudflare handles public access and security in front of it; you control the machine and backups.

---

*Extra Team Dashboard — workforce scheduling and weekly job planning for field teams.*
