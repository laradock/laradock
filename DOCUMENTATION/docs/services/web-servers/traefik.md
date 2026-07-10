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

## What is Traefik?

[Traefik](https://traefik.io) is a reverse proxy and load balancer that discovers backend containers automatically and terminates TLS for them. Instead of publishing a web server's ports directly to your host, you route through Traefik using Docker labels, and it handles certificate issuance via Let's Encrypt.

## Start Traefik

```bash
docker compose up -d traefik
```

Traefik doesn't declare a `depends_on` on `php-fpm`, it routes to whatever containers you've labeled, so start your web server and other services alongside it as needed.

## Stop Traefik

```bash
docker compose stop traefik
```

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

## The dashboard

The dashboard is exposed on `TRAEFIK_DASHBOARD_PORT` (`8888` by default) and protected by basic auth via `TRAEFIK_DASHBOARD_USER`. It's routed by its own labels in `traefik/compose.yml`, gated behind a `Host()` rule matching `ACME_DOMAIN` and the `access-auth` basic-auth middleware. Generate a new bcrypt hash for `TRAEFIK_DASHBOARD_USER` if you want to change the default `admin`/`admin` credentials.

## Common issues

- **Certificate isn't issued.** Let's Encrypt needs `ACME_DOMAIN` to actually resolve to this host on ports 80/443, and `ACME_EMAIL` to be a real address. Check `traefik/data/acme.json` and the container logs (`docker compose logs traefik`) for ACME errors.
- **Routed service still reachable on its old port.** Removing `ports:` isn't enough if you forgot to also remove any override elsewhere; confirm the service's `compose.yml` no longer publishes ports directly.
- **Dashboard prompts for a password you don't know.** Default is `admin` / `admin` (`TRAEFIK_DASHBOARD_USER`). Generate your own bcrypt hash and update the `.env` value to change it.
- **Traefik can't see other containers.** It needs the Docker socket mounted (`/var/run/docker.sock`, already wired in `traefik/compose.yml`) and the routed service on the same `frontend`/`backend` networks.

---

Prefer a simpler reverse proxy with built-in HTTPS? See **[Caddy](/docs/services/caddy)**. New to Laradock? Start with **[Getting Started](/docs/getting-started)**.
