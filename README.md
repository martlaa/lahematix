# LAHEMATIX

LAHEMATIX is the web application for the **LAHEMATE** research project — an
intervention study on teaching mathematical problem-solving. It gathers the
study's data in one place: consents, questionnaires, tests, lesson plans,
lesson observations and researcher journals — for students, teacher-researchers,
school leaders, parents, researchers and the project admin.

The app is built with **Next.js (App Router, server-side rendered)**,
**PostgreSQL** and **Prisma**, and works **without client-side JavaScript** —
every form and action runs as a plain HTML form backed by a server route.

For the full requirements, phase-by-phase development plan and decision log,
see [`ARENDUSPLAAN.md`](ARENDUSPLAAN.md) (Estonian).

## Tech stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router, SSR), React 19 |
| Language | TypeScript 5 |
| Database | PostgreSQL 16 via Prisma 6 |
| Styling | Tailwind CSS 4 |
| Auth / sessions | iron-session (email magic links) |
| Email | nodemailer (Zone SMTP) |
| Validation | zod |
| Local dev | DDEV (Docker) |
| Production | Hetzner VPS + Docker Compose, deployed via GitHub Actions |

## User roles

| Role | Authentication | Main actions |
|---|---|---|
| Admin | Email (magic link) | Manage schools/users, approve export permissions, delete data, close the app |
| Researcher | Email (magic link) | Track consents, sample lesson plans, try instruments, export data, observations |
| Teacher-researcher | Email (magic link) | Consent, student list, study plan, lesson plans, journal, questionnaire |
| Student | One-time token link (no account) | Consent (15+), test, questionnaire |
| Parent | Email (magic link) | Give/withdraw consent on behalf of a child |
| School leader | One-time token link (no account) | School consent |
| Guest (no account) | — | Public lesson-plan gallery (`/galerii`) |

---

## Local development (DDEV)

Local development runs entirely in [DDEV](https://ddev.com) — both PostgreSQL and
the Next.js app run in containers, so you don't need Node or Postgres installed on
the host. You only need **DDEV** and **Docker**.

### First-time setup

```bash
git clone https://github.com/martlaa/lahematix.git
cd lahematix

# Create your local env file (gitignored)
cp .env.example .env
# Edit .env: the DDEV DATABASE_URL is already correct; set a SESSION_SECRET
# (generate one with: openssl rand -base64 32). SMTP can stay as placeholders —
# in dev, login links are printed to the log instead of emailed.

ddev start                                 # starts Postgres + the Next.js app

ddev exec npm ci                           # install deps INSIDE the container
ddev exec npx prisma migrate deploy        # apply migrations
ddev exec npm run seed                     # create the admin@lahemate.ee user
ddev restart                               # reload the dev server with deps ready
```

The app is served at **https://lahematix.ddev.site:3000** — logged-out visitors
see the public gallery; logged-in users are routed to their role dashboard.

> **Note on `node_modules`:** always install inside the container
> (`ddev exec npm ci`), never on the host. Prisma ships a platform-specific query
> engine, and the container is Linux. If you ever run `npm install` on the host,
> re-run `ddev exec npm ci` to restore the Linux binaries.

### Logging in locally

SMTP isn't configured in dev, so the magic link is written to the log instead of
emailed:

1. Open `https://lahematix.ddev.site:3000/login` and enter `admin@lahemate.ee`.
2. Read the link from the log:
   ```bash
   ddev logs -s web | grep Sisselogimislink
   ```
3. Paste it into the browser — you're in as admin.

From the admin account you can create a school, invite teachers/researchers and
follow the whole study.

### Handy commands

```bash
ddev exec npx prisma migrate deploy   # apply new migrations
ddev exec npm run seed                # re-seed the admin user
ddev exec npx prisma studio           # browse the database
ddev exec npm run build               # production build (catches type errors)
ddev restart                          # reload after dependency/config changes
ddev logs -s web -f                   # tail the app log
```

## Testing

There is a smoke-test suite (Playwright, API-testing mode — the app has no
client-side JS, so tests drive it via plain HTTP requests, no browser needed)
covering the critical user journeys: login (magic link), giving/withdrawing
consent, filling in a questionnaire and a test, and the gated data-export
approval flow.

```bash
ddev exec npm run test:e2e
```

The tests connect directly to the DDEV database (same `DATABASE_URL` the app
uses) to fetch the tokens a real user would receive by email, and to assert on
what got written. They refuse to run unless `DATABASE_URL`/`APP_BASE_URL` look
like the local DDEV environment (see `tests/e2e/support/global-setup.ts`) —
**never point this suite at production**. Each run creates its own
uniquely-named fixtures (school, teacher, student) and cleans them up
afterwards, so it's safe to run repeatedly against the same dev database.

Test files live in `tests/e2e/`; this is a starting smoke-test set for the
riskiest paths, not full coverage (see [`ARENDUSPLAAN.md`](ARENDUSPLAAN.md),
Faas 7, for what's still missing — broader coverage, CI wiring, etc.).

## Environment variables

See `.env.example` for the full list. In short:

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `SESSION_SECRET` | Session encryption key (iron-session) — at least 32 chars |
| `SMTP_HOST` / `SMTP_PORT` / `SMTP_USER` / `SMTP_PASSWORD` / `SMTP_FROM` | Email settings (invites, login links) |
| `APP_BASE_URL` | The app's public URL — used when generating links |

## Project structure

```
prisma/schema.prisma        data model (all phase 1–5 models)
prisma/migrations/          migrations (apply: npx prisma migrate deploy)
prisma/seed.ts              creates the first admin user

src/lib/
  session.ts                 session handling (iron-session)
  prisma.ts                  database connection singleton
  mail.ts                    sending email (SMTP)
  pseudonym.ts               student/teacher pseudonym-code generation
  appSettings.ts             app closed/open state
  gallery.ts, galleryDocx.ts public gallery data and DOCX generation
  export/                    researcher data-export CSV/XLSX logic
  questionnaires/, tests/, journal/, lessonplan/, observation/
                             questionnaire/test/journal/lesson-plan/observation
                             content (hardcoded, appendices 4–11)

src/components/              shared UI components (form renderers, etc.)

src/app/
  admin/                     schools/users management, export approvals,
                             data deletion, closing flow
  teadur/                    researcher tracking view, sample lesson plans,
                             instrument sandbox, data export
  opetaja/                   teacher dashboard, consent, student list,
                             study plan, lesson plan, journal, questionnaire
  koolijuht/, lapsevanem/, opilane/
                             token-based (mostly account-less) views
  vaatlused/                 lesson-observation booking market + protocol
  galerii/                   public lesson-plan gallery (no account)
  api/                       all corresponding API routes
```

---

## Deployment

Production runs on a **Hetzner Cloud VPS** with Docker Compose. Merging to the
**`production`** branch triggers a GitHub Actions workflow that SSHes into the
server and redeploys automatically. **Zone** is used only for the domain (DNS)
and email (SMTP).

```
merge → production ──▶ GitHub Actions ──ssh──▶ Hetzner VPS
                                                 ├─ git reset --hard origin/production
                                                 ├─ docker compose build
                                                 ├─ prisma migrate deploy
                                                 └─ docker compose up -d app caddy
                                                      └─ Caddy → automatic HTTPS
```

The production stack (`docker-compose.prod.yml`) runs four services: PostgreSQL,
a one-shot migration runner, the Next.js app, and **Caddy** as a reverse proxy
with automatic Let's Encrypt certificates.

**Full step-by-step setup — creating the server, DNS, secrets and the first
deploy — is in [`deploy/README.md`](deploy/README.md).**

### Everyday deploys

Work on `main`, open a PR, and when ready merge `main` → `production` (or push to
`production`). The GitHub Action redeploys automatically; watch it under the
repository's **Actions** tab.

## Troubleshooting

- **"Can't reach database"** — make sure `ddev start` is running and the
  `DATABASE_URL` in `.env` matches the DDEV Postgres service.
- **No emails sent** — check the SMTP settings in `.env`. In local development
  the app works without them: login links and invites appear in the log
  (`ddev logs -s web`), so this doesn't block usage.
- **"SESSION_SECRET is not defined"** — make sure `.env` exists (not just
  `.env.example`) and `SESSION_SECRET` is filled in.
- **Prisma errors after a host `npm install`** — re-run `ddev exec npm ci` to
  restore the container's Linux query engine.

## License

The source code is released under the MIT license (see `LICENSE`). Lesson-plan
content published in the public gallery (`/galerii`) is licensed separately under
CC BY 4.0 — see each lesson plan's detail view.
