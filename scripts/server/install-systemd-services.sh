#!/usr/bin/env bash
set -euo pipefail

destination_dir="${1:?destination directory is required}"
service_user="${2:?service user is required}"
node_path="${3:-/usr/bin/node}"

sudo tee /etc/systemd/system/blog.service >/dev/null <<SERVICE
[Unit]
Description=Blog web server
After=network-online.target
Wants=network-online.target

[Service]
Type=simple
WorkingDirectory=${destination_dir}
User=${service_user}
EnvironmentFile=-${destination_dir}/.env
Environment=NODE_ENV=production
Environment=PORT=3001
ExecStart=${node_path} ${destination_dir}/backend/dist/index.js
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
SERVICE

sudo tee /etc/systemd/system/blog-sync.service >/dev/null <<SERVICE
[Unit]
Description=Blog cache sync
After=network-online.target
Wants=network-online.target

[Service]
Type=simple
WorkingDirectory=${destination_dir}
User=${service_user}
EnvironmentFile=-${destination_dir}/.env
Environment=NODE_ENV=production
ExecStart=${node_path} ${destination_dir}/backend/dist/daemons/sync.js
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
SERVICE

sudo systemctl daemon-reload
sudo systemctl enable blog.service blog-sync.service
