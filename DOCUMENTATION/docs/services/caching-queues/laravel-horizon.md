---
slug: /services/laravel-horizon
title: Laravel Horizon
description: Run Laravel Horizon in Laradock as a dedicated worker container that supervises your Redis queue workers against your mounted application code.
keywords:
  - laradock laravel horizon
  - laravel horizon docker
  - laravel horizon docker compose
  - horizon redis queue
  - laravel queue worker docker
---

## What is Laravel Horizon?

[Laravel Horizon](https://laravel.com/docs/horizon) is Laravel's official dashboard and configuration layer for Redis-backed queues, it doesn't replace the queue worker process, it supervises and reports on it. This container isn't a standalone daemon in the usual sense: it's a dedicated PHP/Alpine image (built via `supervisord`, extending Laradock's usual PHP extension-install pattern) whose job is to run `php artisan horizon` against your mounted Laravel application, under `depends_on: workspace`.

## Start Laravel Horizon

Your app must already have Horizon installed (`composer require laravel/horizon`) and configured to use the `redis` queue connection. Then:

```bash
docker compose up -d laravel-horizon
```

The container `depends_on` `workspace` in `compose.yml`, so Compose starts it first automatically.

## Stop Laravel Horizon

```bash
docker compose stop laravel-horizon
```

This stops the container, which stops the supervised `horizon` process along with it. To remove the container: `docker compose rm -f laravel-horizon`.

## Configuration

Laravel Horizon's own dashboard and queue settings live in your Laravel app (`config/horizon.php`), not in this container. What this container's `laravel-horizon/defaults.env` controls is which optional PHP extensions get compiled into its image at build time, all `false` by default:

| Variable | Default | What it does |
|---|---|---|
| `LARAVEL_HORIZON_INSTALL_BZ2` | `false` | Install the `bz2` extension. |
| `LARAVEL_HORIZON_INSTALL_GD` | `false` | Install the `gd` extension. |
| `LARAVEL_HORIZON_INSTALL_GMP` | `false` | Install the `gmp` extension. |
| `LARAVEL_HORIZON_INSTALL_GNUPG` | `false` | Install the `gnupg` extension. |
| `LARAVEL_HORIZON_INSTALL_LDAP` | `false` | Install the `ldap` extension. |
| `LARAVEL_HORIZON_INSTALL_IMAGEMAGICK` | `false` | Install `imagick`, version controlled by `LARAVEL_HORIZON_IMAGEMAGICK_VERSION`. |
| `LARAVEL_HORIZON_INSTALL_INTL` | `false` | Install the `intl` extension. |
| `LARAVEL_HORIZON_IMAGEMAGICK_VERSION` | `latest` | Git ref of the `imagick` PECL/source build, used only when ImageMagick is installed. |
| `LARAVEL_HORIZON_INSTALL_SOCKETS` | `false` | Install the `sockets` extension. |
| `LARAVEL_HORIZON_INSTALL_YAML` | `false` | Install the `yaml` extension. |
| `LARAVEL_HORIZON_INSTALL_ZIP_ARCHIVE` | `false` | Install the `zip` extension. |
| `LARAVEL_HORIZON_INSTALL_PHPREDIS` | `false` | Install the `redis` PECL extension (in addition to `predis`, if your app uses it). |
| `LARAVEL_HORIZON_INSTALL_MONGO` | `false` | Install the `mongodb` extension. |
| `LARAVEL_HORIZON_INSTALL_CASSANDRA` | `false` | Install the Cassandra PHP driver. |
| `LARAVEL_HORIZON_INSTALL_FFMPEG` | `false` | Install the `ffmpeg` binary for jobs that process media. |
| `LARAVEL_HORIZON_INSTALL_AUDIOWAVEFORM` | `false` | Install the BBC `audiowaveform` binary. |
| `LARAVEL_HORIZON_INSTALL_POPPLER_UTILS` | `false` | Install `poppler-utils` and `antiword` for PDF/document jobs. |
| `LARAVEL_HORIZON_PUID` | `1000` | UID for the container's `laradock` user. |
| `LARAVEL_HORIZON_PGID` | `1000` | GID for the container's `laradock` user. |

This container also inherits `PHP_FPM_INSTALL_PGSQL`, `PHP_FPM_INSTALL_BCMATH`, and `PHP_FPM_INSTALL_MEMCACHED` from the shared PHP-FPM build args, so those extensions follow whatever you've already set for `php-fpm`.

## Supervise queue workers

The actual worker process(es) Horizon supervises are configured on the Laravel side, in `config/horizon.php` (queues, balance strategy, max processes, and so on), same as any Horizon setup. This container just needs Redis and your app code reachable to run `php artisan horizon`:

```bash
docker compose up -d redis workspace laravel-horizon
```

Supervisord config for the container itself lives in `laravel-horizon/supervisord.d`, mounted into `/etc/supervisord.d`, edit it if you need to change how the `horizon` process is launched or restarted inside the container.

## Common issues

- **Horizon container starts but no jobs process.** Confirm your Laravel app's `QUEUE_CONNECTION=redis` and that `redis` is running and reachable; Horizon only supervises Redis-backed queues.
- **Missing PHP extension errors from your app's jobs.** The extension flags above are all `false` by default; if a job needs `gd`, `imagick`, `mongodb`, and so on, set the matching `LARAVEL_HORIZON_INSTALL_*` variable and rebuild: `docker compose build laravel-horizon`.
- **Extension build args changed but the container still lacks them.** These are Dockerfile build args, not runtime env vars; a plain restart won't apply them, rebuild the image after changing `.env`.
- **Horizon dashboard (`/horizon`) shows no metrics.** That dashboard is served by your app itself (through `php-fpm`/`nginx`), not by this container; this container only needs to be running so the underlying queue actually gets worked.

---

Need the queue backend itself? See **[Redis](/docs/services/redis)**. New to Laradock? Start at **[Getting Started](/docs/getting-started)**.
