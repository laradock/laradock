# Laradock → Production

You built locally with Laradock. Now ship the **same stack** as a hardened,
portable image. Works for any PHP app: Laravel, Symfony, WordPress, Moodle,
Drupal, plain PHP.

The idea in one line: **a Docker image is the universal deploy adapter.** Build
one clean image and every target below already knows how to run it. There is no
per-provider magic to learn.

---

## 1. Build the image (do this once)

From your **project root** (where `composer.json` / `index.php` lives):

```bash
# keep secrets & dev junk out of the image
cp laradock/production/dockerignore.sample .dockerignore

docker build -f laradock/production/Dockerfile -t myapp:latest .
```

What you get vs. your dev container: code **baked in** (no bind mount),
`composer install --no-dev`, opcache with `validate_timestamps=0`, **no xdebug**,
production `php.ini`. Same PHP version and base extensions as dev.

> **On Apple Silicon (arm64):** most servers and Kubernetes run amd64, so an
> arm64 image fails there with `exec format error`. `./laradock ship` builds
> `linux/amd64` automatically (override with `--platform linux/arm64`); with
> plain `docker build`, add `--platform linux/amd64` yourself.

> Enabled extra extensions in dev (redis, pdo_pgsql, gd…)? Add them in
> `Dockerfile` (there's a commented line), or point `--build-arg BASE_IMAGE=` at
> your locally-built laradock php-fpm image for exact parity.

Test it:

```bash
cp laradock/production/.env.example laradock/production/.env   # fill real values
docker compose -f laradock/production/compose.yml up -d --build
```

---

## 2. Pick a target — the image is identical for all of them

### A. One server (the 80% case)
Copy the repo to a VPS (Hetzner, DO, EC2) and:
```bash
docker compose -f laradock/production/compose.yml up -d --build
```
Managed DB/Redis recommended; put their hosts in `.env`.

### B. Your own servers, no cluster → **Kamal**
Don't hand-roll deploy scripts. [Kamal](https://kamal-deploy.org) deploys your
image with zero-downtime rollovers:
```bash
kamal setup      # first time
kamal deploy     # every release
```
Point its `image:` at what you built in step 1.

### C. Kubernetes (EKS / GKE / your cluster)
Push the image, then apply the reference manifests:
```bash
docker tag myapp:latest registry.example.com/myapp:latest
docker push registry.example.com/myapp:latest
kubectl create secret generic app-env --from-env-file=laradock/production/.env
kubectl apply -f laradock/production/kubernetes.yaml
```
See [`kubernetes.yaml`](kubernetes.yaml) — deployment (php-fpm + nginx sidecar),
service, ingress, plus optional worker / scheduler CronJob / migrate Job.

### D. PaaS (Fly.io, Render, Railway)
They accept a Dockerfile directly. Point them at `laradock/production/Dockerfile`
and set env vars in their dashboard. No compose, no k8s.

---

## 3. What your framework needs on top of the base

Every PHP app is `php-fpm + web server + DB`. Frameworks only add optional bits.
Toggle these via compose `--profile` or by deleting the k8s blocks:

| App          | Worker (`--profile worker`) | Scheduler/cron (`--profile scheduler`) | Persistent volume |
|--------------|:---------------------------:|:--------------------------------------:|-------------------|
| Laravel      | queue:work                  | schedule:run                           | `storage/`        |
| Symfony      | messenger:consume (if used) | if you use cron                        | `var/`            |
| WordPress    | —                           | wp-cron or system cron                 | `wp-content/uploads` |
| Moodle       | —                           | **required** (`admin/cli/cron.php`)    | `moodledata`      |
| Plain PHP    | —                           | —                                      | as needed         |

**Persistent files:** anything users upload must live on a mounted volume or
object storage (S3), never inside the image — a new deploy replaces the image
and wipes anything written to its filesystem.

**Migrations:** run once per deploy, before traffic shifts. Compose: `docker
compose run --rm app php artisan migrate --force`. K8s: the `migrate` Job.

---

## Notes

- **Database is managed, not a pod.** Run MySQL/Postgres/Redis as managed
  services (RDS, CloudSQL, ElastiCache). Containerizing your DB for production
  is a footgun; Laradock's DB services are for local dev only.
- **Secrets** come from real env vars / secret managers at runtime. Never bake
  `.env` into the image (that's what `.dockerignore` is for).
- These files are a **reference**, deliberately plain. Copy them into your
  project and adjust; they're a starting line, not a framework to learn.
