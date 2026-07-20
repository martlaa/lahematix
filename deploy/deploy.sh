#!/usr/bin/env bash
# Build and (re)deploy the production stack. Assumes the repo is already at the
# desired commit (the GitHub Action does `git reset --hard origin/production`
# before calling this). Safe to run by hand for a manual deploy.
set -euo pipefail

cd "$(dirname "$0")/.." # repo root
COMPOSE="docker compose -f docker-compose.prod.yml"

if [ ! -f .env ]; then
	echo "ERROR: .env is missing. Copy deploy/.env.production.example to .env and fill it in." >&2
	exit 1
fi

echo "==> Building images"
$COMPOSE build

echo "==> Starting database"
$COMPOSE up -d db

echo "==> Applying database migrations"
$COMPOSE run --rm migrate

echo "==> Starting app + reverse proxy"
$COMPOSE up -d app caddy

# A bind-mounted Caddyfile edit doesn't restart Caddy on its own — reload it so
# domain / proxy changes take effect (graceful; falls back to a restart).
echo "==> Reloading Caddy config"
$COMPOSE exec -T caddy caddy reload --config /etc/caddy/Caddyfile --adapter caddyfile 2>/dev/null ||
	$COMPOSE restart caddy

echo "==> Pruning dangling images"
docker image prune -f >/dev/null || true

echo "==> Current status:"
$COMPOSE ps
