---
slug: /services/traefik
title: Traefik
description: Run Traefik in Laradock as a reverse proxy with automatic Let's Encrypt HTTPS, routing to your containers via labels instead of published ports.
keywords:
  - laradock traefik
  - traefik docker
  - traefik docker compose
  - traefik letsencrypt
  - traefik reverse proxy labels
  - traefik dashboard
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

## What is Traefik?

[Traefik](https://traefik.io) is a reverse proxy and load balancer that discovers backend containers automatically and terminates TLS for them. Instead of publishing a web server's ports directly to your host, you route through Traefik using Docker labels, and it handles certificate issuance via Let's Encrypt.

## Start Traefik

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock start traefik
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose up -d traefik
```

</TabItem>
</Tabs>

Traefik doesn't declare a `depends_on` on `php-fpm`, it routes to whatever containers you've labeled, so start your web server and other services alongside it as needed, for example `./laradock start traefik nginx`.

## Stop Traefik

Stopping just pauses the container; the ACME account and issued certificates in `traefik/data` are untouched:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock stop traefik
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose stop traefik
```

</TabItem>
</Tabs>

To delete the container entirely (the data on disk is still untouched, it lives under `traefik/data`):

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock remove traefik
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose rm -sf traefik
```

</TabItem>
</Tabs>

## Configuration

All settings live in `traefik/defaults.env` and can be overridden by adding the same line to your own `.env`:

| Variable | Default | What it does |
|---|---|---|
| `TRAEFIK_HOST_HTTP_PORT` | `80` | Host-side HTTP entrypoint port. |
| `TRAEFIK_HOST_HTTPS_PORT` | `443` | Host-side HTTPS entrypoint port. |
| `TRAEFIK_DASHBOARD_PORT` | `8888` | Host-side port for the Traefik dashboard. |
| `TRAEFIK_DASHBOARD_USER` | `admin:$2y$10$...` (bcrypt hash) | Basic-auth credentials for the dashboard, default `admin` / `admin`. |
| `ACME_DOMAIN` | `example.org` | Domain Traefik requests a Let's Encrypt certificate for. |
| `ACME_EMAIL` | `email@example.org` | Email used for the Let's Encrypt account. |

## Route a service through Traefik

Traefik routes by label, not by published port. To route a service like Nginx:

1. Set `ACME_DOMAIN` and `ACME_EMAIL` in `.env` to your real domain and email.
2. In the routed service's `compose.yml` (e.g. `nginx/compose.yml`), remove the `ports:` section and add Traefik labels instead:

```yaml
nginx:
  build:
    context: ./nginx
    args:
      - PHP_UPSTREAM_CONTAINER=${NGINX_PHP_UPSTREAM_CONTAINER}
      - PHP_UPSTREAM_PORT=${NGINX_PHP_UPSTREAM_PORT}
      - CHANGE_SOURCE=${CHANGE_SOURCE}
  volumes:
    - ${APP_CODE_PATH_HOST}:${APP_CODE_PATH_CONTAINER}
    - ${NGINX_HOST_LOG_PATH}:/var/log/nginx
    - ${NGINX_SITES_PATH}:/etc/nginx/sites-available
  depends_on:
    - php-fpm
  networks:
    - frontend
    - backend
  labels:
    - "traefik.enable=true"
    - "traefik.http.services.nginx.loadbalancer.server.port=80"
    # https router
    - "traefik.http.routers.https.rule=Host(`${ACME_DOMAIN}`, `www.${ACME_DOMAIN}`)"
    - "traefik.http.routers.https.entrypoints=https"
    - "traefik.http.routers.https.middlewares=www-redirectregex"
    - "traefik.http.routers.https.service=nginx"
    - "traefik.http.routers.https.tls.certresolver=letsencrypt"
    # http router
    - "traefik.http.routers.http.rule=Host(`${ACME_DOMAIN}`, `www.${ACME_DOMAIN}`)"
    - "traefik.http.routers.http.entrypoints=http"
    - "traefik.http.routers.http.middlewares=http-redirectscheme"
    - "traefik.http.routers.http.service=nginx"
    # middlewares
    - "traefik.http.middlewares.www-redirectregex.redirectregex.permanent=true"
    - "traefik.http.middlewares.www-redirectregex.redirectregex.regex=^https://www.(.*)"
    - "traefik.http.middlewares.www-redirectregex.redirectregex.replacement=https://$$1"
    - "traefik.http.middlewares.http-redirectscheme.redirectscheme.permanent=true"
    - "traefik.http.middlewares.http-redirectscheme.redirectscheme.scheme=https"
```

This replaces the port-publishing version (`ports: - "${NGINX_HOST_HTTP_PORT}:80"` etc.), letting Traefik own ports 80/443 on the host and forward to Nginx internally over the `frontend`/`backend` networks.

After adding or changing labels on a routed service, apply them:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock restart nginx
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose restart nginx
```

</TabItem>
</Tabs>

Traefik picks up label changes on the container automatically once it restarts (or, for most label edits, without even restarting Traefik itself, only the routed service).

## The dashboard

The dashboard is exposed on `TRAEFIK_DASHBOARD_PORT` (`8888` by default) and protected by basic auth via `TRAEFIK_DASHBOARD_USER`. It's routed by its own labels in `traefik/compose.yml`, gated behind a `Host()` rule matching `ACME_DOMAIN` and the `access-auth` basic-auth middleware. Generate a new bcrypt hash for `TRAEFIK_DASHBOARD_USER` if you want to change the default `admin`/`admin` credentials, then apply it:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock restart traefik
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose restart traefik
```

</TabItem>
</Tabs>

## View logs

Container logs (Traefik's own startup/ACME/routing log messages):

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock logs traefik
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose logs --tail=100 traefik
```

</TabItem>
</Tabs>

Traefik also writes a separate HTTP **access log**, one line per request, to `traefik/data/access.log` (set via `--accesslog.filepath=/data/access.log` in `traefik/compose.yml`). Tail it directly on your host:

```bash
tail -f traefik/data/access.log
```

## Backup and restore the certificate store

Traefik's Let's Encrypt account key and issued certificates live in a single file, `traefik/data/acme.json`, bind-mounted from the repo (not under `DATA_PATH_HOST` like most other services). Losing it means Traefik has to request fresh certificates from Let's Encrypt on next start, which is rate-limited.

**Back it up**:

```bash
cp traefik/data/acme.json acme.json.bak
```

**Restore it** (Traefik must be stopped first, since it holds the file open):

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock stop traefik
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose stop traefik
```

</TabItem>
</Tabs>

```bash
cp acme.json.bak traefik/data/acme.json
chmod 600 traefik/data/acme.json
```

Then start it again with the CLI or Compose command from [Start Traefik](#start-traefik) above. The `600` permission is required, Traefik refuses to use an `acme.json` that's group- or world-readable.

## Force a certificate re-issue (start fresh)

To throw away the current ACME account/certificates and have Traefik request everything from scratch (useful if a certificate got issued for the wrong domain, or `acme.json` got corrupted):

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock stop traefik
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose stop traefik
```

</TabItem>
</Tabs>

```bash
rm traefik/data/acme.json
touch traefik/data/acme.json
chmod 600 traefik/data/acme.json
```

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock start traefik
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose up -d traefik
```

</TabItem>
</Tabs>

Let's Encrypt rate-limits certificate issuance per domain (currently 5 duplicate certificates per week), so don't do this repeatedly against the same `ACME_DOMAIN` while testing.

## Change the Traefik version

The version is pinned in `traefik/Dockerfile` (`FROM traefik:v3.7`), not an env var. Edit the tag to the [release](https://github.com/traefik/traefik/releases) you want, then rebuild:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock rebuild traefik
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose build traefik
```

</TabItem>
</Tabs>

## Common issues

- **Certificate isn't issued.** Let's Encrypt needs `ACME_DOMAIN` to actually resolve to this host on ports 80/443, and `ACME_EMAIL` to be a real address. Check `traefik/data/acme.json` and the container logs (`./laradock logs traefik`) for ACME errors.
- **Routed service still reachable on its old port.** Removing `ports:` isn't enough if you forgot to also remove any override elsewhere; confirm the service's `compose.yml` no longer publishes ports directly.
- **Dashboard prompts for a password you don't know.** Default is `admin` / `admin` (`TRAEFIK_DASHBOARD_USER`). Generate your own bcrypt hash and update the `.env` value to change it.
- **Traefik can't see other containers.** It needs the Docker socket mounted (`/var/run/docker.sock`, already wired in `traefik/compose.yml`) and the routed service on the same `frontend`/`backend` networks.
- **Only one Traefik can bind ports 80/443 per host.** If you're also running another Laradock project's Traefik, or a system-level web server, on the same machine, they'll fight over `TRAEFIK_HOST_HTTP_PORT`/`TRAEFIK_HOST_HTTPS_PORT`. Only one project's Traefik should own 80/443 at a time; give the others different ports or stop them.

---

Prefer a simpler reverse proxy with built-in HTTPS? See **[Caddy](/docs/services/caddy)**. New to Laradock? Start with **[Getting Started](/docs/getting-started)**.
