#!/usr/bin/env bash
#
# Proves the Kubernetes path works: builds the production image and deploys the
# same manifest shape as kubernetes.yaml (php-fpm + nginx sidecar + service) to a
# real cluster, then asserts a request is served.
#
#   ./production/smoke-test-k8s.sh
#
# Uses your CURRENT kubectl cluster if one is reachable (OrbStack, Docker Desktop,
# minikube all share the local image store). If none is reachable it spins up a
# throwaway k3d cluster and deletes it afterwards. On your own cluster it only ever
# creates and deletes a dedicated namespace, never the cluster. Needs docker +
# kubectl (+ k3d only for the fallback). Uses a light base so it's fast.
#
set -euo pipefail

ns=laradock-smoke
img=laradock-k8s-smoke:test
port=8091
app=$(mktemp -d)
ctx=""
k3d_created=""
pf_pid=""

command -v docker  >/dev/null 2>&1 || { echo "❌ need 'docker' installed";  exit 2; }
command -v kubectl >/dev/null 2>&1 || { echo "❌ need 'kubectl' installed"; exit 2; }

cleanup() {
  [ -n "$pf_pid" ] && kill "$pf_pid" >/dev/null 2>&1 || true
  [ -n "$ctx" ] && kubectl --context "$ctx" delete ns "$ns" --ignore-not-found --wait=false >/dev/null 2>&1 || true
  [ -n "$k3d_created" ] && k3d cluster delete "$k3d_created" >/dev/null 2>&1 || true
  rm -rf "$app"
}
trap cleanup EXIT

mkdir -p "$app/public"
printf '<?php echo "laradock-k8s-ok";\n' > "$app/public/index.php"

echo "▸ building production image ..."
docker build --quiet -f "$(dirname "$0")/Dockerfile" \
  --build-arg BASE_IMAGE="${BASE_IMAGE:-php:8.3-fpm}" -t "$img" "$app" >/dev/null

# Prefer a cluster that's already up (shares your local image store); else k3d.
if kubectl cluster-info >/dev/null 2>&1; then
  ctx=$(kubectl config current-context)
  echo "▸ using your current cluster: $ctx"
else
  command -v k3d >/dev/null 2>&1 || { echo "❌ no reachable cluster and k3d not installed"; exit 2; }
  k3d_created=laradock-smoke
  echo "▸ no cluster reachable, creating throwaway k3d cluster '$k3d_created' ..."
  k3d cluster create "$k3d_created" --wait --timeout 120s >/dev/null
  ctx="k3d-$k3d_created"
  echo "▸ importing image into the cluster ..."
  k3d image import "$img" -c "$k3d_created"
fi

kubectl --context "$ctx" create ns "$ns" >/dev/null 2>&1 || true

echo "▸ applying manifest (php-fpm + nginx sidecar + service) ..."
kubectl --context "$ctx" -n "$ns" apply -f - >/dev/null <<YAML
apiVersion: v1
kind: ConfigMap
metadata: { name: web-nginx }
data:
  default.conf: |
    server {
      listen 80;
      root /var/www/public;
      index index.php index.html;
      location / { try_files \$uri \$uri/ /index.php?\$query_string; }
      location ~ \.php\$ {
        fastcgi_pass 127.0.0.1:9000;
        fastcgi_param SCRIPT_FILENAME \$document_root\$fastcgi_script_name;
        include fastcgi_params;
      }
    }
---
apiVersion: apps/v1
kind: Deployment
metadata: { name: app }
spec:
  replicas: 1
  selector: { matchLabels: { app: app } }
  template:
    metadata: { labels: { app: app } }
    spec:
      containers:
        - name: php-fpm
          image: ${img}
          imagePullPolicy: IfNotPresent
          ports: [{ containerPort: 9000 }]
          livenessProbe: { tcpSocket: { port: 9000 }, initialDelaySeconds: 5 }
          readinessProbe: { tcpSocket: { port: 9000 } }
        - name: nginx
          image: nginx:alpine
          ports: [{ containerPort: 80 }]
          volumeMounts: [{ name: nginx-conf, mountPath: /etc/nginx/conf.d }]
      volumes:
        - name: nginx-conf
          configMap: { name: web-nginx }
---
apiVersion: v1
kind: Service
metadata: { name: app }
spec:
  selector: { app: app }
  ports: [{ port: 80, targetPort: 80 }]
YAML

echo "▸ waiting for rollout ..."
if ! kubectl --context "$ctx" -n "$ns" rollout status deploy/app --timeout=90s; then
  echo "❌ rollout did not complete, diagnostics:"
  kubectl --context "$ctx" -n "$ns" get pods -o wide
  kubectl --context "$ctx" -n "$ns" get events --sort-by=.lastTimestamp 2>/dev/null | tail -20
  kubectl --context "$ctx" -n "$ns" logs -l app=app --all-containers --tail=30 2>/dev/null || true
  exit 1
fi

kubectl --context "$ctx" -n "$ns" port-forward svc/app "$port:80" >/dev/null 2>&1 &
pf_pid=$!

echo "▸ waiting for a response ..."
for _ in $(seq 1 30); do
  if curl -fsS "http://localhost:$port/" 2>/dev/null | grep -q laradock-k8s-ok; then
    echo "✅ PASS — deployed to Kubernetes ($ctx) and served a request"
    exit 0
  fi
  sleep 1
done

echo "❌ FAIL — no valid response"
kubectl --context "$ctx" -n "$ns" get pods
exit 1
