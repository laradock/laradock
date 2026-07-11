#!/usr/bin/env bash
#
# Proves the production image works: builds production/Dockerfile against a
# throwaway PHP app and asserts the single container serves an HTTP request.
# No real project needed.
#
#   ./production/smoke-test.sh
#
# Uses a light base so it's fast; override with:
#   BASE_IMAGE=laradock/php-fpm:latest-8.3 ./production/smoke-test.sh
#
set -euo pipefail

here=$(cd "$(dirname "$0")" && pwd)
img=laradock-smoke:test
port=8088
app=$(mktemp -d)

cleanup() {
  docker rm -f laradock-smoke >/dev/null 2>&1 || true
  rm -rf "$app"
}
trap cleanup EXIT

mkdir -p "$app/public"
printf '<?php echo "laradock-prod-ok";\n' > "$app/public/index.php"

echo "▸ building production image from production/Dockerfile ..."
docker build --quiet -f "$here/Dockerfile" \
  --build-arg BASE_IMAGE="${BASE_IMAGE:-php:8.3-fpm}" -t "$img" "$app" >/dev/null

echo "▸ running it (one self-contained container, nginx + php-fpm inside) ..."
docker run -d --name laradock-smoke -p "$port:8080" "$img" >/dev/null

echo "▸ waiting for a response ..."
for _ in $(seq 1 30); do
  if curl -fsS "http://localhost:$port/" 2>/dev/null | grep -q laradock-prod-ok; then
    echo "✅ PASS — production image built and served an HTTP request"
    exit 0
  fi
  sleep 1
done

echo "❌ FAIL — no valid response on :$port"
docker logs laradock-smoke 2>&1 | tail -n 20
exit 1
