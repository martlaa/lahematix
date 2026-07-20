# Deploy to Hetzner

Production runs on a **Hetzner Cloud VPS** with Docker Compose. Merging to the
**`production`** branch triggers a GitHub Actions workflow that SSHes into the
server and redeploys. Zone stays responsible only for the domain (DNS) and email.

```
merge → production ──▶ GitHub Actions ──ssh──▶ Hetzner VPS
                                                 ├─ git reset --hard origin/production
                                                 ├─ docker compose build
                                                 ├─ prisma migrate deploy   (one-shot)
                                                 └─ docker compose up -d app caddy
                                                      └─ Caddy → auto-HTTPS
```

## Files

| File | Purpose |
|---|---|
| `docker-compose.prod.yml` (repo root) | Production stack: db, migrate, app, caddy |
| `deploy/Caddyfile` | Reverse proxy + automatic Let's Encrypt HTTPS |
| `deploy/bootstrap.sh` | One-time fresh-server setup |
| `deploy/deploy.sh` | Build + migrate + start (run on server / by CI) |
| `deploy/.env.production.example` | Template for the server's `.env` |
| `.github/workflows/deploy.yml` | Auto-deploy on push to `production` |

---

## One-time setup

### 1. Create the Hetzner server
- Hetzner Cloud Console → **Create Server**
- Location: Helsinki (closest to Estonia)
- Image: **Ubuntu 24.04**
- Type: **CX22** (2 vCPU / 4 GB) is plenty
- Add **your personal SSH key** (so you can log in as root)
- Create, note the **public IPv4**

### 2. Point DNS (in Zone)
In Zone DNS for `lahemate.ee`, add an **A record**:
```
app.lahemate.ee.   A   <hetzner-ip>
```
Wait for it to resolve (`dig +short app.lahemate.ee`) before deploying, so Caddy
can obtain the certificate.

### 3. Bootstrap the server
SSH in as root and run the bootstrap script:
```bash
ssh root@<hetzner-ip>
curl -fsSL https://raw.githubusercontent.com/martlaa/lahematix/production/deploy/bootstrap.sh -o bootstrap.sh
bash bootstrap.sh
```
(If the `production` branch doesn't exist yet, clone `main` first — see step 6.)

This installs Docker, adds swap + firewall, creates a `deploy` user, and clones
the repo to `/opt/lahematix`.

### 4. Create the CI deploy key
On your laptop, make a dedicated keypair for GitHub Actions:
```bash
ssh-keygen -t ed25519 -C "github-actions-lahematix" -f ~/.ssh/lahematix_deploy -N ""
```
Add the **public** key to the server's deploy user:
```bash
ssh-copy-id -i ~/.ssh/lahematix_deploy.pub deploy@<hetzner-ip>
# or append ~/.ssh/lahematix_deploy.pub to /home/deploy/.ssh/authorized_keys
```

### 5. Add GitHub secrets
Repo → Settings → Secrets and variables → Actions → **New repository secret**:

| Secret | Value |
|---|---|
| `DEPLOY_HOST` | Hetzner public IPv4 |
| `DEPLOY_USER` | `deploy` |
| `DEPLOY_SSH_KEY` | contents of `~/.ssh/lahematix_deploy` (the **private** key) |
| `DEPLOY_PORT` | `22` (optional) |

### 6. Fill in server secrets
```bash
ssh deploy@<hetzner-ip>
cd /opt/lahematix
nano .env            # set DB password (twice), SESSION_SECRET, SMTP password
```
Generate a strong session secret with `openssl rand -base64 32`.

### 7. Create the production branch + first deploy
From your laptop:
```bash
git checkout -b production
git push -u origin production
```
That push triggers the GitHub Action, which deploys automatically. (Or do the
very first deploy by hand on the server: `bash deploy/deploy.sh`.)

Visit **https://app.lahemate.ee** — Caddy provisions the certificate on first hit.

### 8. Seed the first admin (once)
```bash
ssh deploy@<hetzner-ip>
cd /opt/lahematix
docker compose -f docker-compose.prod.yml run --rm --no-deps \
  --entrypoint "" migrate npm run seed
```

---

## Everyday deploys

Work on `main`, open a PR, and when ready **merge `main` → `production`** (or push
to `production`). The Action redeploys automatically. Watch it under the repo's
**Actions** tab.

## Manual operations

```bash
cd /opt/lahematix
C="docker compose -f docker-compose.prod.yml"

$C ps                       # status
$C logs -f app              # app logs
$C logs -f caddy            # cert / proxy logs
$C run --rm migrate         # apply migrations manually
$C restart app              # restart app only
bash deploy/deploy.sh       # full rebuild + migrate + up
```

## Backups (do this before real users arrive)
The database lives in the `db_data` Docker volume. A simple nightly dump:
```bash
docker compose -f docker-compose.prod.yml exec -T db \
  pg_dump -U lahematix lahematix | gzip > /opt/backups/lahematix-$(date +%F).sql.gz
```
Wire that into a cron job and copy the dumps off the server.
