---
slug: /services/varnish
title: Varnish
description: Run Varnish in Laradock as a caching reverse proxy in front of Nginx, tested for WordPress. Configure backends, cache size, and purge the cache.
keywords:
  - laradock varnish
  - varnish docker
  - varnish docker compose
  - varnish nginx cache
  - varnish wordpress cache
  - purge varnish cache
---

## What is Varnish?

[Varnish](https://varnish-cache.org) is an HTTP accelerator that caches responses in memory to serve repeat requests without hitting your app. In Laradock it sits behind Nginx: Nginx listens on 80/443 and forwards to Varnish, and Varnish forwards back to Nginx on port 81 (`VARNISH_BACKEND_PORT`). The shipped config was developed and tested for WordPress but likely works with other systems too; the approach is based on [this Linode guide](https://www.linode.com/docs/websites/varnish/use-varnish-and-nginx-to-serve-wordpress-over-ssl-and-http-on-debian-8/).

## Start Varnish

Varnish must be built after Nginx, because its startup checks the domain's availability:

```bash
docker compose up -d nginx
docker compose up -d proxy
```

The service runs as two containers, `proxy` and `proxy2`, both defined in `varnish/compose.yml`.

## Stop Varnish

```bash
docker compose stop proxy proxy2
```

## Configuration

All settings live in `varnish/defaults.env` and can be overridden by adding the same line to your own `.env`:

| Variable | Default | What it does |
|---|---|---|
| `VARNISH_CONFIG` | `/etc/varnish/default.vcl` | Path to the active VCL config inside the container. |
| `VARNISH_PORT` | `6081` | Port Varnish listens on. |
| `VARNISHD_PARAMS` | `-p default_ttl=3600 -p default_grace=3600` | Extra flags passed to `varnishd`. |
| `VARNISH_PROXY1_CACHE_SIZE` | `128m` | Cache size for the first proxy (`proxy`). |
| `VARNISH_PROXY1_BACKEND_HOST` | `workspace` | Domain/host the first proxy serves. |
| `VARNISH_PROXY1_SERVER` | `SERVER1` | Server label for the first proxy. |
| `VARNISH_PROXY2_CACHE_SIZE` | `128m` | Cache size for the second proxy (`proxy2`). |
| `VARNISH_PROXY2_BACKEND_HOST` | `workspace` | Domain/host the second proxy serves. |
| `VARNISH_PROXY2_SERVER` | `SERVER2` | Server label for the second proxy. |

## Configure a domain

1. Set your domain in `VARNISH_PROXY1_BACKEND_HOST`.
2. Update your Varnish config and add a matching Nginx config, using `nginx/sites/laravel_varnish.conf.example` as a starting point.
3. Rename `default_wordpress.vcl` to `default.vcl` to use the WordPress-tuned config instead of the older `default.vcl`.

## Serve multiple domains

1. Add a second configuration section to `.env`:
   ```env
   VARNISH_PROXY1_CACHE_SIZE=128m
   VARNISH_PROXY1_BACKEND_HOST=replace_with_your_domain.name
   VARNISH_PROXY1_SERVER=SERVER1
   ```
2. Add a matching service to `varnish/compose.yml`, modeled on `proxy2`:
   ```yaml
   custom_proxy_name:
     container_name: custom_proxy_name
     build: ./varnish
     expose:
       - ${VARNISH_PORT}
     environment:
       - VARNISH_CONFIG=${VARNISH_CONFIG}
       - CACHE_SIZE=${VARNISH_PROXY2_CACHE_SIZE}
       - VARNISHD_PARAMS=${VARNISHD_PARAMS}
       - VARNISH_PORT=${VARNISH_PORT}
       - BACKEND_HOST=${VARNISH_PROXY2_BACKEND_HOST}
       - BACKEND_PORT=${VARNISH_BACKEND_PORT}
       - VARNISH_SERVER=${VARNISH_PROXY2_SERVER}
     ports:
       - "${VARNISH_PORT}:${VARNISH_PORT}"
     links:
       - workspace
     networks:
       - frontend
   ```

## Purge and reload

- **Purge cache:** `curl -X PURGE https://yourwebsite.com/`
- **Reload Varnish:** `docker container exec proxy varnishreload`
- **Reload Nginx:** `docker exec Nginx nginx -t` then `docker exec Nginx nginx -s reload`

Allowed Varnish CLI commands inside the container: `varnishadm`, `varnishd`, `varnishhist`, `varnishlog`, `varnishncsa`, `varnishreload`, `varnishstat`, `varnishtest`, `varnishtop`.

## Common issues

- **Varnish container fails to build.** It's expected to be built after Nginx is already up, since it checks the domain's availability at build/start time; run `docker compose up -d nginx` first.
- **Stale content keeps being served.** Purge the cache (`curl -X PURGE ...`) or reload Varnish (`varnishreload`) after deploying changes.
- **Wrong backend served.** Confirm `VARNISH_PROXY1_BACKEND_HOST`/`VARNISH_PROXY2_BACKEND_HOST` match the domain in the corresponding Nginx site config, and that you're using `default_wordpress.vcl` (renamed to `default.vcl`) if following the WordPress setup.

---

Varnish sits in front of **[Nginx](/docs/services/nginx)**; for balancing across multiple Varnish instances see **[HAProxy](/docs/services/haproxy)**. New to Laradock? Start with **[Getting Started](/docs/getting-started)**.
