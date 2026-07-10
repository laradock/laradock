---
slug: /services/redis
title: Redis
description: Run Redis in Laradock. Start and stop the container, configure the port and password, wire it up as your Laravel cache/session/queue driver, and connect from your host.
keywords:
  - laradock redis
  - redis docker
  - redis docker compose
  - laravel redis cache
  - redis password docker
  - connect redis host
---

## What is Redis?

[Redis](https://redis.io) is an in-memory data store used as a cache, session store, and queue backend. It's the most common performance upgrade for PHP apps once file-based caching or `array` sessions stop being enough, and Laravel supports it natively.

## Start Redis

```bash
docker compose up -d redis
```

## Stop Redis

```bash
docker compose stop redis
```

This stops the container without deleting its data. To remove the container (data on disk is untouched, it lives under `DATA_PATH_HOST`): `docker compose rm -f redis`.

## Configuration

`redis/defaults.env` holds the port, and the password lives in the main `.env` (uncomment/edit the line under the `### REDIS` section). Either can be overridden in your own `.env`:

| Variable | Default | What it does |
|---|---|---|
| `REDIS_PORT` | `6379` | Host-side port Redis is published on (`host:container`). |
| `REDIS_PASSWORD` | `secret_redis` | Passed to the container as `--requirepass`; set it empty to disable auth. |

## Use Redis from Laravel

1. In your Laravel `.env`, set `REDIS_HOST=redis`. If that variable isn't there, edit `config/database.php` instead and replace the default `127.0.0.1` with `redis`:
   ```php
   'redis' => [
       'cluster' => false,
       'default' => [
           'host'     => 'redis',
           'port'     => 6379,
           'database' => 0,
       ],
   ],
   ```
2. To use Redis for cache and sessions, set `CACHE_DRIVER=redis` and `SESSION_DRIVER=redis` in `.env`.
3. Install the client:
   ```bash
   composer require predis/predis:^1.0
   ```
4. Test it from Laravel:
   ```php
   \Cache::store('redis')->put('Laradock', 'Awesome', 10);
   ```

## Use the redis-cli

```bash
docker compose exec redis bash
redis-cli
```

If `REDIS_PASSWORD` is set, authenticate first: `redis-cli -a secret_redis`.

## Connect from your host machine

Inside Laradock, other containers reach Redis by container name: `REDIS_HOST=redis`. From your own machine, connect to `localhost:6379` (or your custom `REDIS_PORT`) with a GUI like TablePlus or RedisInsight, using `REDIS_PASSWORD` if set.

## Common issues

- **`NOAUTH Authentication required`.** `REDIS_PASSWORD` is set in `.env` but your client isn't sending it. Pass `-a <password>` to `redis-cli`, or set the password on your Laravel Redis connection config.
- **App can't connect but the container is running.** Confirm the app's `.env` uses `REDIS_HOST=redis` (the container name), not `localhost` or `127.0.0.1`, those only work from your host machine, not from inside another container.
- **Port already in use on your host.** Another local Redis (or another Laradock project) is already bound to `6379`. Change `REDIS_PORT` in `.env` and restart: `docker compose up -d redis`.
- **Data disappears after `docker compose down -v`.** Redis data lives under `DATA_PATH_HOST/redis`; `-v` removes named volumes and, depending on your setup, can wipe it. Use `docker compose stop` if you just want to pause the container.

---

Need a GUI to browse keys? See **[Redis WebUI](/docs/services/redis-webui)**. Need a Redis-compatible alternative? See **[Valkey](/docs/services/valkey)** or **[Dragonfly](/docs/services/dragonfly)**, or a multi-node setup, **[Redis Cluster](/docs/services/redis-cluster)**. New to Laradock? Start at **[Getting Started](/docs/getting-started)**.
