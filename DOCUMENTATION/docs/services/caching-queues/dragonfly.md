---
slug: /services/dragonfly
title: Dragonfly
description: Run Dragonfly in Laradock, a modern multi-threaded in-memory store compatible with Redis and Memcached. Start and stop the container, configure the version and port, and connect any Redis client.
keywords:
  - laradock dragonfly
  - dragonfly docker
  - dragonflydb docker compose
  - redis compatible database
  - dragonfly vs redis
  - dragonfly laravel
---

## What is Dragonfly?

[Dragonfly](https://www.dragonflydb.io) is a modern, multi-threaded in-memory data store built as a drop-in replacement for Redis and Memcached, wire-compatible with both protocols but designed to make better use of multi-core machines for higher throughput.

## Start Dragonfly

```bash
docker compose up -d dragonfly
```

## Stop Dragonfly

```bash
docker compose stop dragonfly
```

This stops the container without deleting its data. To remove the container (data on disk is untouched, it lives under `DATA_PATH_HOST`): `docker compose rm -f dragonfly`.

## Configuration

All settings live in `dragonfly/defaults.env` and can be overridden by adding the same line to your own `.env`:

| Variable | Default | What it does |
|---|---|---|
| `DRAGONFLY_VERSION` | `latest` | Image tag from [Dragonfly's registry](https://hub.docker.com/r/dragonflydb/dragonfly). |
| `DRAGONFLY_PORT` | `6381` | Host-side port Dragonfly is published on (`host:container`). Deliberately not `6379`, so it can run alongside `redis`/`valkey`. |

The container also sets `ulimits.memlock: -1`, Dragonfly needs unlimited locked memory to run correctly; this is fixed in `dragonfly/compose.yml` and isn't user-configurable via `.env`.

## Use Dragonfly from Laravel

Point any Redis client at it the same way you would Redis. In your Laravel `.env`:

```env
REDIS_HOST=dragonfly
REDIS_PORT=6379
```

Note the app-side `REDIS_PORT` here is the container-internal port (`6379`), not `DRAGONFLY_PORT`, containers talk to each other over the internal network, not the host-published port.

## Connect from your host machine

Inside Laradock, other containers reach it by container name: `dragonfly:6379`. From your own machine, connect to `localhost:6381` (or your custom `DRAGONFLY_PORT`) with any Redis-compatible GUI like TablePlus or RedisInsight.

## Common issues

- **App can't connect but the container is running.** Confirm the app's config uses `dragonfly` (the container name) as the host, not `localhost` or `127.0.0.1`, those only work from your host machine, not from inside another container.
- **Confusing `DRAGONFLY_PORT` with the internal port.** `DRAGONFLY_PORT` (default `6381`) is only the host-side mapping. From inside another container, Dragonfly is always reachable on port `6379`.
- **Container fails to start with a memlock-related error.** Some Docker setups (notably rootless or certain CI runners) restrict `ulimits.memlock`; you may need to adjust your Docker daemon/host configuration since this isn't controlled from Laradock's `.env`.
- **Port already in use on your host.** Another local Dragonfly (or another Laradock project) is already bound to `6381`. Change `DRAGONFLY_PORT` in `.env` and restart: `docker compose up -d dragonfly`.

---

Prefer upstream Redis instead? See **[Redis](/docs/services/redis)**. Want the community Redis fork? See **[Valkey](/docs/services/valkey)**. New to Laradock? Start at **[Getting Started](/docs/getting-started)**.
