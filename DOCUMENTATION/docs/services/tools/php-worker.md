---
slug: /services/php-worker
title: PHP Worker
description: Run background queue workers in Laradock. php-worker runs Supervisor to keep Laravel queue:work (and similar) processes alive.
keywords:
  - laradock php-worker
  - php worker docker
  - laravel queue worker docker
  - supervisor docker
  - queue:work docker
---

## What is PHP Worker?

`php-worker` is Laradock's dedicated background-processing container. It's built on `php:${PHP_VERSION}-alpine` with [Supervisor](http://supervisord.org) installed, and its Dockerfile sets Supervisor as the container's entrypoint (`ENTRYPOINT ["/usr/bin/supervisord", "-n", "-c", "/etc/supervisord.conf"]`). Supervisor keeps whatever processes you configure alive and restarts them if they crash, in practice, that means Laravel's `queue:work` (or any other long-running worker command) instead of one-off `queue:work` runs that die when a request-scoped process exits.

Unlike `php-fpm`, this container never serves HTTP requests, it just runs Supervisor-managed background processes against your mounted code.

## Start PHP Worker

```bash
docker compose up -d php-worker
```

It depends on `workspace` (shares PHP version and build context) and mounts `./php-worker/supervisord.d` into `/etc/supervisord.d` inside the container, that's where you define which commands Supervisor actually runs.

## Stop PHP Worker

```bash
docker compose stop php-worker
```

## Configure what it runs

Add a Supervisor program config to `php-worker/supervisord.d/` (mounted, not baked into the image), for example a Laravel queue worker:

```ini
[program:laravel-worker]
process_name=%(program_name)s_%(process_num)02d
command=php /var/www/artisan queue:work --sleep=3 --tries=3
autostart=true
autorestart=true
numprocs=1
```

Restart the container to pick up new or changed Supervisor configs:

```bash
docker compose restart php-worker
```

## Configuration

The PHP version follows the shared `PHP_VERSION` variable in the root `.env` (same as `workspace`/`php-fpm`), passed in as `LARADOCK_PHP_VERSION`. Extension toggles live in `php-worker/defaults.env` as `PHP_WORKER_INSTALL_*` build-time flags, almost all default to `false`; the one exception:

| Variable | Default | What it does |
|---|---|---|
| `PHP_WORKER_INSTALL_INTL` | `true` | Internationalization extension. |
| `PHP_WORKER_PUID` / `PHP_WORKER_PGID` | `1000` / `1000` | UID/GID for the container's non-root `laradock` user. |

Everything else, BZ2, GD, ImageMagick, GMP, GnuPG, LDAP, PostgreSQL, MongoDB, BCMath, Memcached, OCI8, MSSQL, Phalcon, APCu, SOAP, ZipArchive, MySQL client, AMQP, Ghostscript, Swoole, Taint, FFmpeg, Cassandra, Gearman, Redis, IMAP, XML-RPC, SSDB, Event, poppler-utils, GraphViz, follows the same pattern:

```env
PHP_WORKER_INSTALL_REDIS=true
```

```bash
docker compose build php-worker
docker compose up -d php-worker
```

## Common issues

- **Worker doesn't pick up code changes.** `artisan queue:work` caches your app in memory per worker process; Supervisor restarting the process (`autorestart=true`) handles crashes, but code changes still need an explicit restart: `docker compose restart php-worker`, or use `queue:listen` instead of `queue:work` if you want changes picked up per job (slower, more overhead).
- **Added a Supervisor config but nothing runs.** Config changes in `php-worker/supervisord.d/` need a container restart to be read: `docker compose restart php-worker`.
- **Enabled an extension but it's not loaded.** `PHP_WORKER_INSTALL_*` flags only take effect on build: `docker compose build php-worker && docker compose up -d php-worker`.
- **Jobs fail silently.** Check `docker compose logs php-worker`, Supervisor logs each managed process's stdout/stderr there by default.

---

Need the container that serves HTTP requests? See the **[PHP-FPM guide](/docs/services/php-fpm)**. New to Laradock? Start at **[Getting Started](/docs/getting-started)**.
