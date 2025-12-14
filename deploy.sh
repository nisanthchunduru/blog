npm run docker:push:x86
scp .env root@150.136.2.200:/opt/blog/.env
scp docker-compose.production.yml root@150.136.2.200:/opt/blog/docker-compose.yml
ssh root@150.136.2.200 "cd /opt/blog && docker compose down"
ssh root@150.136.2.200 "rm -rf /opt/blog-cache/* 2>/dev/null || true"
ssh root@150.136.2.200 "cd /opt/blog && docker compose up -d --pull always"
