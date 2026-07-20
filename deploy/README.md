# Deploy to Hetzner

Production runs on a **Hetzner Cloud VPS** with Docker Compose. Merging to the
**`production`** branch triggers a GitHub Actions workflow that SSHes into the
server and redeploys. Zone provides only the domain (DNS) and email.

```
merge → production ──▶ GitHub Actions ──ssh──▶ VPS
                                                 ├─ git reset --hard origin/production
                                                 ├─ docker compose build
                                                 ├─ prisma migrate deploy   (one-shot)
                                                 └─ docker compose up -d app caddy
                                                      └─ Caddy → auto-HTTPS
```

## Pieces

| File | Purpose |
|---|---|
| `docker-compose.prod.yml` (repo root) | Production stack: db, migrate, app, caddy |
| `deploy/Caddyfile` | Reverse proxy + automatic HTTPS |
| `deploy/bootstrap.sh` | One-time fresh-server setup (Docker, firewall, deploy user, clone) |
| `deploy/deploy.sh` | Build + migrate + start (run on the server / by CI) |
| `deploy/.env.production.example` | Template for the server's `.env` |
| `.github/workflows/deploy.yml` | Auto-deploy on push to `production` |

## First-time setup (outline)

1. Create an Ubuntu VPS, add your SSH key, and point a DNS **A record** for your
   domain at its IP.
2. Run `deploy/bootstrap.sh` on the server as root (installs Docker, adds swap +
   firewall, creates a `deploy` user, clones the repo to `/opt/lahematix`).
3. Fill in `/opt/lahematix/.env` from `deploy/.env.production.example` (DB
   password, `SESSION_SECRET`, SMTP, `APP_BASE_URL`).
4. Add a CI deploy key and set the repo's GitHub Actions secrets: `DEPLOY_HOST`,
   `DEPLOY_USER`, `DEPLOY_SSH_KEY`, `DEPLOY_PORT`.
5. Push the `production` branch to trigger the first deploy (or run
   `bash deploy/deploy.sh` on the server once by hand).

Caddy provisions the TLS certificate automatically once DNS resolves to the server.

## Everyday deploys

Work on `main`, then merge `main` → `production` (or push to `production`). The
Action redeploys automatically — watch it under the repo's **Actions** tab.

## Common operations

```bash
cd /opt/lahematix
C="docker compose -f docker-compose.prod.yml"

$C ps                                   # status
$C logs -f app                          # app logs
$C logs -f caddy                        # cert / proxy logs
$C run --rm migrate                     # apply migrations manually
bash deploy/deploy.sh                   # full rebuild + migrate + up

# Create the first / an additional admin (the invite UI can't make admins):
$C run --rm migrate npm run admin:create -- someone@example.com "Full Name"

# Nightly DB backup (wire into cron; copy dumps off-server):
$C exec -T db pg_dump -U "$POSTGRES_USER" "$POSTGRES_DB" | gzip > backup-$(date +%F).sql.gz
```
