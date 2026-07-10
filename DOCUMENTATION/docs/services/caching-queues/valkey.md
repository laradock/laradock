---
slug: /services/valkey
title: Valkey
description: Run Valkey in Laradock, the open-source Redis fork. Start and stop the container, configure the version and port, and connect any Redis client.
keywords:
  - laradock valkey
  - valkey docker
  - valkey docker compose
  - redis fork
  - valkey vs redis
  - valkey laravel
---

## What is Valkey?

[Valkey](https://valkey.io) is the community-driven fork of Redis, created after Redis's 2024 license change moved it away from an open-source license. Valkey stays fully protocol-compatible with Redis, so any Redis client, including Laravel's, works against it unmodified.

## Start Valkey

```bash
docker compose up -d valkey
```

## Stop Valkey

```bash
docker compose stop valkey
```

This stops the container without deleting its data. To remove the container (data on disk is untouched, it lives under `DATA_PATH_HOST`): `docker compose rm -f valkey`.

## Configuration

All settings live in `valkey/defaults.env` and can be overridden by adding the same line to your own `.env`:

| Variable | Default | What it does |
|---|---|---|
| `VALKEY_VERSION` | `8-alpine` | Image tag from [Valkey's Docker Hub](https://hub.docker.com/r/valkey/valkey). |
| `VALKEY_PORT` | `6380` | Host-side port Valkey is published on (`host:container`). Deliberately not `6379`, so it can run alongside the `redis` service. |

## Use Valkey from Laravel

Point any Redis client at it the same way you would Redis. In your Laravel `.env`:

```env
REDIS_HOST=valkey
REDIS_PORT=6379
```

Note the app-side `REDIS_PORT` here is the container-internal port (`6379`), not `VALKEY_PORT`, containers talk to each other over the internal network, not the host-published port.

## Connect from your host machine

Inside Laradock, other containers reach it by container name: `valkey:6379`. From your own machine, connect to `localhost:6380` (or your custom `VALKEY_PORT`) with any Redis-compatible GUI like TablePlus or RedisInsight.

## Common issues

- **App can't connect but the container is running.** Confirm the app's config uses `valkey` (the container name) as the host, not `localhost` or `127.0.0.1`, those only work from your host machine, not from inside another container.
- **Confusing `VALKEY_PORT` with the internal port.** `VALKEY_PORT` (default `6380`) is only the host-side mapping. From inside another container, Valkey is always reachable on port `6379`.
- **Port already in use on your host.** Another local Valkey/Redis (or another Laradock project) is already bound to `6380`. Change `VALKEY_PORT` in `.env` and restart: `docker compose up -d valkey`.
- **Running both `redis` and `valkey` together.** They're separate containers with separate data (`DATA_PATH_HOST/valkey` vs `DATA_PATH_HOST/redis`), decide which one your app actually points at before debugging "missing" cache data.

---

Prefer upstream Redis instead? See **[Redis](/docs/services/redis)**. Want an even higher-throughput alternative? See **[Dragonfly](/docs/services/dragonfly)**. New to Laradock? Start at **[Getting Started](/docs/getting-started)**.
