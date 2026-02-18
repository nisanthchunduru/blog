set -e

SERVER_USER="root"
SERVER_IP="150.136.2.200"
DESTINATION_DIR="/opt/blog"

# Parse flags
DIRECT=false
for arg in "$@"; do
  case $arg in
    --direct)
      DIRECT=true
      ;;
  esac
done

echo "Building image..."
docker buildx build --platform linux/amd64 -f Dockerfile.production -t nisanth074/blog:latest .
echo "Built image."

if [ "$DIRECT" = true ]; then
  echo "Saving image..."
  docker save nisanth074/blog:latest > /tmp/blog-image.tar
  echo "Saved image."

  echo "Copying image to server..."
  scp /tmp/blog-image.tar "$SERVER_USER@$SERVER_IP:$DESTINATION_DIR/"
  echo "Copied image to server."

  echo "Loading image on server..."
  ssh "$SERVER_USER@$SERVER_IP" "docker load < $DESTINATION_DIR/blog-image.tar"
  echo "Loaded image on server."

  rm /tmp/blog-image.tar
else
  echo "Pushing image to Docker Hub..."
  docker push nisanth074/blog:latest
  echo "Pushed image to Docker Hub."
fi

echo "Copying .env to server..."
scp .env "$SERVER_USER@$SERVER_IP:$DESTINATION_DIR/.env"
echo "Copied .env to server."

echo "Copying docker-compose.yml to server..."
scp docker-compose.production.yml "$SERVER_USER@$SERVER_IP:$DESTINATION_DIR/docker-compose.yml"
echo "Copied docker-compose.yml to server."

echo "Restarting blog..."
ssh "$SERVER_USER@$SERVER_IP" "cd $DESTINATION_DIR && docker compose down"
ssh "$SERVER_USER@$SERVER_IP" "cd $DESTINATION_DIR && docker compose up -d --pull always"
echo "Restarted blog."
