# Production & Deployment

Source: https://laradock.io/docs/production

Laradock's default `docker-compose.yml` is tuned for local development: your code is bind-mounted, Xdebug is available, opcache re-checks files on every request. Production wants the opposite, code baked into an immutable image, Xdebug gone, opcache frozen.

The [`production/`](https://github.com/laradock/laradock/tree/master/production) folder does exactly that, for **any** PHP app: Laravel, Symfony, WordPress, Moodle, Drupal, or plain PHP.

{/* id kept for backward-compat: ~40 project pages deep-link to #prepare-laradock-for-production */}
## The idea in one line {#prepare-laradock-for-production}

**A Docker image is the universal deploy adapter.** You build one hardened image of your app, and every target below already knows how to run it, a server, Kamal, Kubernetes, Fly.io. There is no per-provider magic to learn, and Laradock does not try to be a deployment platform.

## 1. Build the image {#build}

```bash
./laradock ship
```

That resolves your app (from `APP_CODE_PATH_HOST`), writes a safe `.dockerignore` if you don't have one, and builds a production image. Add `--push` to push it to a registry, or pass a tag: `./laradock ship registry.example.com/myapp:1.0 --push`.

Prefer plain Docker? It's the same thing:

```bash
cp laradock/production/dockerignore.sample .dockerignore
docker build -f laradock/production/Dockerfile -t myapp:latest .
```

What you get versus your dev container: code **baked in** (no bind mount), `composer install --no-dev` (skipped automatically if your project has no `composer.json`, so WordPress and Moodle just work), `opcache.validate_timestamps=0`, **no Xdebug**, and a production `php.ini`. Same PHP version and base extensions as dev.

The image is **self-contained** (nginx + php-fpm inside) and serves HTTP on `$PORT` (default 8080), so it runs as a single container on any platform, from Kubernetes to Cloud Run. On Apple Silicon `ship` builds `linux/amd64` by default. Check it locally with `docker run -p 8080:8080 myapp:latest`.

:::tip[Enabled extra extensions in dev?]
If you toggled on things like `redis`, `pdo_pgsql` or `gd`, add them at the `extensions` line in [`production/Dockerfile`](https://github.com/laradock/laradock/tree/master/production/Dockerfile), or point `--build-arg BASE_IMAGE=` at your locally-built laradock php-fpm image for exact parity.
:::

## 2. Deploy it, the image runs anywhere {#deploy}

Because it's a standard OCI image, **every target below just runs it**, there is nothing Laradock-specific to install on the server. The only real decision is **who runs the infrastructure**: a managed platform, or you.

Each platform has its own step-by-step guide.

**Managed clouds** (push the image, they run everything):

| Platform | Guide |
|----------|-------|
| Google Cloud Run | [Deploy to Cloud Run](https://laradock.io/docs/deploy-to-google-cloud-run) |
| AWS ECS / Fargate | [Deploy to AWS ECS](https://laradock.io/docs/deploy-to-aws-ecs) |
| AWS App Runner | [Deploy to App Runner](https://laradock.io/docs/deploy-to-aws-app-runner) |
| Azure Container Apps | [Deploy to Azure](https://laradock.io/docs/deploy-to-azure-container-apps) |
| Fly.io | [Deploy to Fly.io](https://laradock.io/docs/deploy-to-fly-io) |
| Render | [Deploy to Render](https://laradock.io/docs/deploy-to-render) |
| Railway | [Deploy to Railway](https://laradock.io/docs/deploy-to-railway) |
| DigitalOcean App Platform | [Deploy to DigitalOcean](https://laradock.io/docs/deploy-to-digitalocean) |
| Heroku | [Deploy to Heroku](https://laradock.io/docs/deploy-to-heroku) |

**Your own infrastructure** (you run it):

| Platform | Guide |
|----------|-------|
| Kubernetes (EKS / GKE / AKS / DOKS, or your own) | [Deploy to Kubernetes](https://laradock.io/docs/deploy-to-kubernetes) |
| Your own servers, no Kubernetes (Kamal) | [Deploy with Kamal](https://laradock.io/docs/deploy-to-kamal) |
| A single server (Docker Compose) | [Deploy to a Server](https://laradock.io/docs/deploy-to-a-server) |

The flows in brief (each guide above has the full steps):

### Managed platforms: Cloud Run, ECS/Fargate, App Runner, Container Apps {#managed}

Same shape everywhere: push the image to that cloud's registry, then point its container service at the image and set your env vars. The platform hands you the load balancer, TLS, autoscaling and rollouts, no compose or manifests to maintain.

```bash
# example: AWS ECR (same idea for GCP Artifact Registry / Azure ACR)
./laradock ship 1234567890.dkr.ecr.us-east-1.amazonaws.com/myapp:latest --push
# then create an ECS/Fargate service (or App Runner / Cloud Run) from that image
```

**Ready-made configs** live in [`production/providers/`](https://github.com/laradock/laradock/tree/master/production/providers), copy the one you need and fill in image + secrets:

| Provider | Config |
|----------|--------|
| AWS ECS / Fargate | [`aws-ecs-task-definition.json`](https://github.com/laradock/laradock/blob/master/production/providers/aws-ecs-task-definition.json) |
| AWS App Runner | [`aws-app-runner.json`](https://github.com/laradock/laradock/blob/master/production/providers/aws-app-runner.json) |
| Google Cloud Run | [`google-cloud-run.yaml`](https://github.com/laradock/laradock/blob/master/production/providers/google-cloud-run.yaml) |
| Azure Container Apps | [`azure-container-app.yaml`](https://github.com/laradock/laradock/blob/master/production/providers/azure-container-app.yaml) |
| Fly.io | [`fly.toml`](https://github.com/laradock/laradock/blob/master/production/providers/fly.toml) |
| Render | [`render.yaml`](https://github.com/laradock/laradock/blob/master/production/providers/render.yaml) |
| Railway | [`railway.json`](https://github.com/laradock/laradock/blob/master/production/providers/railway.json) |
| DigitalOcean App Platform | [`digitalocean-app.yaml`](https://github.com/laradock/laradock/blob/master/production/providers/digitalocean-app.yaml) |
| Heroku | [`heroku.yml`](https://github.com/laradock/laradock/blob/master/production/providers/heroku.yml) |
| Kamal (your own servers) | [`kamal-deploy.yml`](https://github.com/laradock/laradock/blob/master/production/providers/kamal-deploy.yml) |

### Kubernetes: managed (EKS / GKE / AKS / DOKS) or your own {#kubernetes}

Push the image, then apply the reference manifests. Managed clusters give you the control plane; the manifests are identical either way.

```bash
kubectl create secret generic app-env --from-env-file=laradock/production/.env
kubectl apply -f laradock/production/kubernetes.yaml
```

[`kubernetes.yaml`](https://github.com/laradock/laradock/tree/master/production/kubernetes.yaml) is a deliberately plain starting point: a deployment (the self-contained web container, with resource limits and probes), a service, a TLS-ready ingress (cert-manager), an uploads PVC, plus optional worker, scheduler CronJob, and a migrate Job.

### Your own servers {#self-hosted}

**One box** (the 80% case). One self-contained container serves HTTP; point the database and Redis at managed services:

```bash
cp laradock/production/.env.example laradock/production/.env   # fill real values
docker compose -f laradock/production/compose.yml up -d
```

**Several boxes, no Kubernetes** → [Kamal](https://kamal-deploy.org) ships your image with zero-downtime rollovers (`kamal setup`, then `kamal deploy` per release), or Docker Swarm if you prefer. Don't hand-roll deploy scripts.

## 3. What your framework needs on top {#frameworks}

Every PHP app is `php-fpm + web server + database`. Frameworks only add optional pieces. Toggle them with compose `--profile` flags, or by deleting the matching Kubernetes block:

| App        | Worker `--profile worker` | Scheduler/cron `--profile scheduler` | Persistent volume    |
|------------|:-------------------------:|:------------------------------------:|----------------------|
| Laravel    | `queue:work`              | `schedule:run`                       | `storage/`           |
| Symfony    | `messenger:consume`       | if you use cron                      | `var/`               |
| WordPress  | —                         | wp-cron or system cron               | `wp-content/uploads` |
| Moodle     | —                         | **required** (`admin/cli/cron.php`)  | `moodledata`         |
| Plain PHP  | —                         | —                                    | as needed            |

```bash
docker compose -f laradock/production/compose.yml --profile worker --profile scheduler up -d
```

:::warning[Persistent files]
Anything users upload must live on a mounted volume or object storage (S3), never inside the image. A deploy replaces the image and wipes anything written to its filesystem.
:::

**Migrations** run once per deploy, before traffic shifts. Compose: `docker compose -f laradock/production/compose.yml run --rm app php artisan migrate --force`. Kubernetes: the `migrate` Job.

## Security {#security}

:::danger[Never forward database ports in production]
Docker publishes ports on the host unless told otherwise. The production compose file deliberately does **not** expose the database. If you add a database container, do not write:

```yml
ports:
  - "3306:3306"
```

See [Docker and iptables](https://fralef.me/docker-and-iptables.html) for why.
:::

- **Database is managed, not a pod.** Run MySQL/Postgres/Redis as managed services (RDS, CloudSQL, ElastiCache). Laradock's database services are for local dev only.
- **Secrets** come from real env vars or a secret manager at runtime. Never bake `.env` into the image, that's what the `.dockerignore` is for.

### Pushing to Google Container Registry

```bash
gcloud auth configure-docker
gcloud auth login
./laradock ship gcr.io/your-project/myapp:latest --push
```

## Verify it works

A smoke test builds the image against a throwaway app and asserts nginx serves a request:

```bash
./laradock/production/smoke-test.sh
```

These files are a **reference**, deliberately plain. Copy them into your project and adjust, they're a starting line, not a framework to learn.
