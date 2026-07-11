# Laradock → Production

You built locally with Laradock. Now ship the **same stack** as one hardened,
portable image that runs anywhere. Works for any PHP app: Laravel, Symfony,
WordPress, Moodle, Drupal, plain PHP.

The idea in one line: **the image is the universal deploy adapter.** `./laradock
ship` produces a single container that serves HTTP on `$PORT` (nginx + php-fpm
inside), so every target below just runs that same image.

---

## 1. Build the image (once)

```bash
./laradock ship                      # builds a self-contained web image
./laradock ship registry/you/app:1.0 --push   # tag + push to your registry
```

What you get vs. your dev container: nginx + php-fpm baked into **one** container
serving `$PORT`, code baked in, `composer install --no-dev`, opcache with
`validate_timestamps=0`, **no Xdebug**. On Apple Silicon it builds `linux/amd64`
by default (most servers/clouds are amd64).

Run it locally to check:
```bash
docker run -p 8080:8080 registry/you/app:1.0   # → http://localhost:8080
```

---

## 2. Pick a target — same image everywhere

**Managed DB always.** Point `DB_*` / `REDIS_*` at a managed service (RDS,
CloudSQL, ElastiCache…). Never run your production database as a container.

### Self-run

| Target | How |
|--------|-----|
| **One server** | `cp .env.example .env` → `docker compose -f production/compose.yml up -d` |
| **Kubernetes** (your own, EKS, GKE, AKS, DOKS) | edit + `kubectl apply -f production/kubernetes.yaml` |
| **Your own servers, no k8s** | [Kamal](https://kamal-deploy.org) → [`providers/kamal-deploy.yml`](providers/kamal-deploy.yml) |

### Managed clouds (push image → point the platform at it)

| Provider | Reference config |
|----------|------------------|
| AWS ECS / Fargate | [`providers/aws-ecs-task-definition.json`](providers/aws-ecs-task-definition.json) |
| AWS App Runner | [`providers/aws-app-runner.json`](providers/aws-app-runner.json) |
| Google Cloud Run | [`providers/google-cloud-run.yaml`](providers/google-cloud-run.yaml) |
| Azure Container Apps | [`providers/azure-container-app.yaml`](providers/azure-container-app.yaml) |
| Fly.io | [`providers/fly.toml`](providers/fly.toml) |
| Render | [`providers/render.yaml`](providers/render.yaml) |
| Railway | [`providers/railway.json`](providers/railway.json) |
| DigitalOcean App Platform | [`providers/digitalocean-app.yaml`](providers/digitalocean-app.yaml) |
| Heroku | [`providers/heroku.yml`](providers/heroku.yml) |

Each file has a header comment with the exact deploy command and what to fill in
(image, region, secrets). They're **starting points**, copy and adjust.

---

## 3. What your framework needs on top

Every PHP app is `web container + managed DB`. Frameworks add optional bits.
Run these as extra containers/services using the **same image** with a command
override (compose `--profile`, a second k8s Deployment, a provider worker, etc.):

| App | Worker | Scheduler/cron | Persistent files |
|-----|:------:|:--------------:|------------------|
| Laravel | `queue:work` | `schedule:run` | `storage/` |
| Symfony | `messenger:consume` | if used | `var/` |
| WordPress | — | wp-cron / system cron | `wp-content/uploads` |
| Moodle | — | **required** (`admin/cli/cron.php`) | `moodledata` |
| Plain PHP | — | — | as needed |

```bash
docker compose -f production/compose.yml --profile worker --profile scheduler up -d
```

**Persistent files** must live on object storage (S3) or a mounted volume, never
inside the image (a deploy replaces it). See the PVC note in `kubernetes.yaml`.

**Migrations** run once per deploy, before traffic shifts:
`docker run --rm myapp php artisan migrate --force` (k8s: the `migrate` Job).

---

## Verify it works

```bash
./production/smoke-test.sh        # builds the image, asserts it serves HTTP
./production/smoke-test-k8s.sh    # deploys to your cluster (or a throwaway k3d), asserts it serves
```

## Security

- **No database ports exposed.** `compose.yml` publishes only the web port.
- **Secrets** come from real env / secret managers at runtime, never baked into
  the image (that's what `dockerignore.sample` is for).
- These files are a **reference**, deliberately plain. Copy them into your
  project and adjust; a starting line, not a framework to learn.
