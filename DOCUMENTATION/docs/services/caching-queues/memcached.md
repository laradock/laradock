---
slug: /services/memcached
title: Memcached
description: Run Memcached in Laravel via Laradock. Start and stop the container, configure the port, and use it as a Laravel cache driver.
keywords:
  - laradock memcached
  - memcached docker
  - memcached docker compose
  - laravel memcached cache
  - memcached vs redis
  - in-memory cache docker
---

## What is Memcached?

[Memcached](https://memcached.org) is a simple, high-performance in-memory key-value cache. Unlike Redis, it has no persistence and no built-in data structures (lists, sets, hashes), it's pure cache: store a value, get it back fast, let it expire. That simplicity makes it lighter and sometimes faster for pure caching workloads where you don't need Redis's extra features.

## Start Memcached

```bash
docker compose up -d memcached
```

The container's `compose.yml` declares `depends_on: php-fpm`, so `docker compose up -d memcached` also starts `php-fpm` if it isn't running yet.

## Stop Memcached

```bash
docker compose stop memcached
```

This stops the container without deleting its data. To remove the container (data on disk is untouched, it lives under `DATA_PATH_HOST`): `docker compose rm -f memcached`.

## Configuration

All settings live in `memcached/defaults.env` and can be overridden by adding the same line to your own `.env`:

| Variable | Default | What it does |
|---|---|---|
| `MEMCACHED_HOST_PORT` | `11211` | Host-side port Memcached is published on (`host:container`), Memcached's standard port. |

## Use Memcached from Laravel

1. In your Laravel `.env`, set `CACHE_DRIVER=memcached`.
2. In `config/cache.php`, point the `memcached` connection's host at the container name:
   ```php
   'memcached' => [
       'servers' => [
           [
               'host' => 'memcached',
               'port' => 11211,
               'weight' => 100,
           ],
       ],
   ],
   ```
3. Laravel's Memcached driver requires the PHP `memcached` extension in `php-fpm`/`workspace`; make sure it's installed and enabled in those containers.

## Connect from your host machine

Inside Laradock, other containers reach it by container name: `memcached:11211`. From your own machine, connect to `localhost:11211` (or your custom `MEMCACHED_HOST_PORT`) with a Memcached client or CLI tool.

## Common issues

- **App can't connect but the container is running.** Confirm the app's config uses `memcached` (the container name) as the host, not `localhost` or `127.0.0.1`, those only work from your host machine, not from inside another container.
- **Cache writes silently fail.** The PHP `memcached` extension isn't installed/enabled in `php-fpm` or `workspace`. Without it, Laravel's Memcached driver can't connect and cache operations no-op or throw depending on your error handling.
- **Port already in use on your host.** Another local Memcached (or another Laradock project) is already bound to `11211`. Change `MEMCACHED_HOST_PORT` in `.env` and restart: `docker compose up -d memcached`.
- **Cached data vanishes on restart.** This is expected: Memcached has no persistence by design. If you need cached values to survive a restart, use Redis, Valkey, or Dragonfly instead.

---

Need persistence or richer data structures? See **[Redis](/docs/services/redis)**. New to Laradock? Start at **[Getting Started](/docs/getting-started)**.
