#!/usr/bin/env bash
set -euo pipefail

instance_name="${1:?instance name is required}"
server_username="${GCLOUD_SERVER_USERNAME:?GCLOUD_SERVER_USERNAME is required}"
server_zone="${GCLOUD_SERVER_ZONE:?GCLOUD_SERVER_ZONE is required}"
gcloud_bin="${GCLOUD_BIN:-gcloud}"
shift

printf -v remote_command '%q ' "$@"
exec "$gcloud_bin" compute ssh "${server_username}@${instance_name}" --zone="$server_zone" --command="${remote_command% }"
