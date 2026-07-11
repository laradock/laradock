#!/usr/bin/env bash
#
# Proves the production pipeline works end to end: builds production/Dockerfile
# against a throwaway PHP app, runs it behind nginx.conf, and asserts a request
# is served. No real project needed.
#
#   ./production/smoke-test.sh
#
# Uses a light base (php:8.3-fpm) so it's fast — override with:
#   BASE_IMAGE=laradock/php-fpm:latest-8.3 ./production/smoke-test.sh
#
set -euo pipefail

here=$(cd "$(dirname "$0")" && pwd)
img=laradock-smoke:test
net=laradock-smoke-net
port=8088
app=$(mktemp -d)

cleanup() {
  docker rm -f laradock-smoke-app laradock-smoke-web >/dev/null 2>&1 || true
  docker network rm "$net" >/dev/null 2>&1 || true
  rm -rf "$app"
}
trap cleanup EXIT

mkdir -p "$app/public"
printf '<?php echo "laradock-prod-ok";\n' > "$app/public/index.php"

echo "▸ building image from production/Dockerfile ..."
docker build --quiet -f "$here/Dockerfile" \
  --build-arg BASE_IMAGE="${BASE_IMAGE:-php:8.3-fpm}" -t "$img" "$app" >/dev/null

echo "▸ starting php-fpm + nginx ..."
docker network create "$net" >/dev/null
# alias 'app' so nginx.conf's `fastcgi_pass app:9000` resolves
docker run -d --name laradock-smoke-app --network "$net" --network-alias app "$img" >/dev/null
docker run -d --name laradock-smoke-web --network "$net" -p "$port:80" \
  -v "$here/nginx.conf:/etc/nginx/conf.d/default.conf:ro" nginx:alpine >/dev/null

echo "▸ waiting for a response ..."
for _ in $(seq 1 30); do
  if curl -fsS "http://localhost:$port/" 2>/dev/null | grep -q laradock-prod-ok; then
    echo "✅ PASS — production image built and served a request"
    exit 0
  fi
  sleep 1
done

echo "❌ FAIL — no valid response on :$port"
echo "--- nginx log ---"; docker logs laradock-smoke-web 2>&1 | tail -n 15
echo "--- app log ---";   docker logs laradock-smoke-app 2>&1 | tail -n 15
exit 1
