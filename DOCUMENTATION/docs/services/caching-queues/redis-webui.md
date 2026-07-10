---
slug: /services/redis-webui
title: Redis WebUI
description: Run Redis WebUI in Laradock, a browser-based admin panel for browsing and editing Redis keys. Start and stop the container, configure credentials and connection, and log in.
keywords:
  - laradock redis webui
  - redis gui docker
  - redis admin panel
  - redis web interface
  - browse redis keys docker
  - redis dashboard
---

## What is Redis WebUI?

Redis WebUI is a lightweight browser-based admin panel for Redis: browse keys, inspect values, and run basic operations without touching `redis-cli`. In Laradock it's pre-wired to connect to the `redis` service automatically.

## Start Redis WebUI

```bash
docker compose up -d redis-webui
```

The container's `compose.yml` declares `depends_on: redis`, so `docker compose up -d redis-webui` also starts `redis` if it isn't running yet.

## Stop Redis WebUI

```bash
docker compose stop redis-webui
```

## Configuration

All settings live in `redis-webui/defaults.env` and can be overridden by adding the same line to your own `.env`:

| Variable | Default | What it does |
|---|---|---|
| `REDIS_WEBUI_USERNAME` | `laradock` | Login username for the web panel. |
| `REDIS_WEBUI_PASSWORD` | `laradock` | Login password for the web panel. |
| `REDIS_WEBUI_CONNECT_HOST` | `redis` | Host of the Redis instance the panel connects to (the `redis` container name). |
| `REDIS_WEBUI_CONNECT_PORT` | `6379` | Port of that Redis instance (container-internal, not `REDIS_PORT`). |
| `REDIS_WEBUI_PORT` | `9987` | Host-side port the web panel itself is published on. |

The panel's Redis connection also picks up `REDIS_PASSWORD` (defined in the main `.env`, shared with the `redis` service) to authenticate.

## Log in

Open [http://localhost:9987](http://localhost:9987) (or your custom `REDIS_WEBUI_PORT`) and sign in with `REDIS_WEBUI_USERNAME` / `REDIS_WEBUI_PASSWORD`. It should already be connected to the `redis` container, no extra connection setup needed for the default single-instance setup.

## Point it at a different Redis instance

Set `REDIS_WEBUI_CONNECT_HOST` and `REDIS_WEBUI_CONNECT_PORT` in `.env` to another container's name and internal port (for example `valkey` and `6379`), then restart:

```bash
docker compose up -d redis-webui
```

## Common issues

- **Blank data or "connection refused" in the panel.** The `redis` container isn't up yet or crashed. Check `docker compose logs redis` and confirm it's healthy before reloading the panel.
- **Login fails with the default credentials.** Someone already changed `REDIS_WEBUI_USERNAME`/`REDIS_WEBUI_PASSWORD` in `.env`; check there before assuming a bug.
- **Panel shows no keys even though your app is caching.** Double-check `REDIS_WEBUI_CONNECT_HOST`/`PORT` actually point at the Redis instance your app writes to; if you run multiple Redis-compatible services (Redis, Valkey, Dragonfly), it's easy to point the UI at the wrong one.

---

Prefer the command line? See **[Redis](/docs/services/redis)** for `redis-cli` usage. New to Laradock? Start at **[Getting Started](/docs/getting-started)**.
