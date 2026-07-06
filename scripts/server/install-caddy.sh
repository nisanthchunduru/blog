#!/usr/bin/env bash
set -euo pipefail

domain_name="${1:?domain name is required}"
upstream_address="${2:-127.0.0.1:3001}"

if ! command -v caddy >/dev/null 2>&1; then
  sudo apt-get update
  sudo apt-get install -y debian-keyring debian-archive-keyring apt-transport-https curl gpg
  if [ ! -f /usr/share/keyrings/caddy-stable-archive-keyring.gpg ]; then
    curl -1sLf https://dl.cloudsmith.io/public/caddy/stable/gpg.key | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
  fi
  if [ ! -f /etc/apt/sources.list.d/caddy-stable.list ]; then
    curl -1sLf https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt | sudo tee /etc/apt/sources.list.d/caddy-stable.list >/dev/null
  fi
  sudo apt-get update
  sudo apt-get install -y caddy
fi

sudo tee /etc/caddy/Caddyfile >/dev/null <<CADDYFILE
${domain_name} {
	reverse_proxy ${upstream_address}
}
CADDYFILE

sudo caddy fmt --overwrite /etc/caddy/Caddyfile
sudo systemctl enable caddy
sudo systemctl restart caddy
