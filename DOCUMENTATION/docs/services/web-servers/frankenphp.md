---
slug: /services/frankenphp
title: FrankenPHP
description: Run FrankenPHP in Laradock, a modern Caddy-based PHP application server and the recommended runtime for Laravel Octane, with automatic HTTPS and HTTP/3.
keywords:
  - laradock frankenphp
  - frankenphp docker
  - frankenphp docker compose
  - laravel octane frankenphp
  - frankenphp automatic https
  - php application server docker
---

## What is FrankenPHP?

[FrankenPHP](https://frankenphp.dev) is a modern PHP application server built on Caddy, an alternative to the classic Nginx + PHP-FPM split. It serves your app directly (no separate web server container needed) with automatic HTTPS, HTTP/3, and a worker mode, and is the recommended runtime for [Laravel Octane](https://laravel.com/docs/octane).

## Start FrankenPHP

```bash
docker compose up -d frankenphp
```

FrankenPHP is self-contained: it doesn't declare a dependency on `php-fpm` or Nginx, it serves your app directly.

## Stop FrankenPHP

```bash
docker compose stop frankenphp
```

## Configuration

All settings live in `frankenphp/defaults.env` and can be overridden by adding the same line to your own `.env`:

| Variable | Default | What it does |
|---|---|---|
| `FRANKENPHP_VERSION` | `1-php8` | FrankenPHP image tag (build arg). |
| `FRANKENPHP_HTTP_PORT` | `8000` | Host-side port mapped to container port 80. |
| `FRANKENPHP_HTTPS_PORT` | `8443` | Host-side port mapped to container port 443. |

Your app is mounted at `/app` inside the container (Laravel docroot `/app/public`), via `${APP_CODE_PATH_HOST}:/app`.

## Access your app

```
https://localhost:8443
```

HTTP on `FRANKENPHP_HTTP_PORT` (`8000` by default) auto-redirects to HTTPS.

## Add PHP extensions

Edit `frankenphp/Dockerfile` and add to its `install-php-extensions` call, then rebuild:

```bash
docker compose build frankenphp
docker compose up -d frankenphp
```

## Use with Laravel Octane worker mode

For Octane's worker mode (keeping your app booted in memory between requests instead of bootstrapping per request), follow the [Octane + FrankenPHP docs](https://laravel.com/docs/octane#frankenphp). The container already serves your mounted app; worker mode is configured on the Laravel side.

## Common issues

- **Browser doesn't trust the HTTPS certificate.** FrankenPHP, like Caddy, issues a locally trusted certificate automatically for development; trust it locally or configure a real domain for production use.
- **Extension changes don't apply.** PHP extensions are installed at build time via the `Dockerfile`, so after editing it you need `docker compose build frankenphp`, not just a restart.
- **Port already in use on your host.** Another service is already bound to `8000`/`8443`. Change `FRANKENPHP_HTTP_PORT`/`FRANKENPHP_HTTPS_PORT` and restart.
- **App not found / blank page.** Confirm your Laravel docroot is `public/` under the mounted app folder, FrankenPHP expects `/app/public` inside the container.

---

Looking for the classic Nginx + PHP-FPM setup instead? See **[Nginx](/docs/services/nginx)**. Want another Octane-compatible runtime? See **[RoadRunner](/docs/services/roadrunner)**. New to Laradock? Start with **[Getting Started](/docs/getting-started)**.
