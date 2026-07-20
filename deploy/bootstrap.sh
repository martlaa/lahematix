#!/usr/bin/env bash
# One-time server setup for a fresh Ubuntu 24.04 Hetzner Cloud server.
# Run as root:  bash bootstrap.sh
set -euo pipefail

APP_DIR=/opt/lahematix
REPO=https://github.com/martlaa/lahematix.git
BRANCH=production

echo "==> Updating system"
export DEBIAN_FRONTEND=noninteractive
apt-get update && apt-get upgrade -y
apt-get install -y git curl ufw

echo "==> Adding 2G swap (helps the Next.js build on small RAM)"
if [ ! -f /swapfile ]; then
	fallocate -l 2G /swapfile
	chmod 600 /swapfile
	mkswap /swapfile
	swapon /swapfile
	echo '/swapfile none swap sw 0 0' >>/etc/fstab
fi

echo "==> Installing Docker"
if ! command -v docker >/dev/null 2>&1; then
	curl -fsSL https://get.docker.com | sh
fi

echo "==> Configuring firewall (SSH + HTTP + HTTPS)"
ufw allow OpenSSH
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable

echo "==> Creating 'deploy' user (for GitHub Actions SSH)"
if ! id deploy >/dev/null 2>&1; then
	useradd -m -s /bin/bash deploy
fi
usermod -aG docker deploy
install -d -m 700 -o deploy -g deploy /home/deploy/.ssh
touch /home/deploy/.ssh/authorized_keys
chown deploy:deploy /home/deploy/.ssh/authorized_keys
chmod 600 /home/deploy/.ssh/authorized_keys

echo "==> Cloning repository into $APP_DIR"
if [ ! -d "$APP_DIR/.git" ]; then
	git clone --branch "$BRANCH" "$REPO" "$APP_DIR" 2>/dev/null ||
		git clone "$REPO" "$APP_DIR"
fi
chown -R deploy:deploy "$APP_DIR"

echo "==> Creating .env from template (if missing)"
if [ ! -f "$APP_DIR/.env" ]; then
	cp "$APP_DIR/deploy/.env.production.example" "$APP_DIR/.env"
	chown deploy:deploy "$APP_DIR/.env"
	chmod 600 "$APP_DIR/.env"
fi

cat <<'DONE'

==> Bootstrap complete.

Next steps:
  1. Add the GitHub Actions deploy PUBLIC key to:
       /home/deploy/.ssh/authorized_keys
  2. Edit real secrets in:
       /opt/lahematix/.env
  3. First deploy (as the deploy user):
       sudo -u deploy bash -c 'cd /opt/lahematix && bash deploy/deploy.sh'
DONE
