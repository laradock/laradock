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

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

## What is Redis WebUI?

Redis WebUI is a lightweight browser-based admin panel for Redis: browse keys, inspect values, and run basic operations without touching `redis-cli`. In Laradock it's pre-wired to connect to the `redis` service automatically.

## Start Redis WebUI

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock start redis-webui
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose up -d redis-webui
```

</TabItem>
</Tabs>

The container's `compose.yml` declares `depends_on: redis`, so starting `redis-webui` also starts `redis` if it isn't running yet.

## Stop Redis WebUI

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock stop redis-webui
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose stop redis-webui
```

</TabItem>
</Tabs>

Redis WebUI keeps no data of its own (it's just a UI on top of `redis`), so there's nothing to lose by stopping, removing, or rebuilding it.

## Configuration

All settings live in `redis-webui/defaults.env` and can be overridden by adding the same line to your own `.env`:

| Variable | Default | What it does |
|---|---|---|
| `REDIS_WEBUI_USERNAME` | `laradock` | Login username for the web panel. |
| `REDIS_WEBUI_PASSWORD` | `laradock` | Login password for the web panel. |
| `REDIS_WEBUI_CONNECT_HOST` | `redis` | Host of the Redis instance the panel connects to (the `redis` container name). |
| `REDIS_WEBUI_CONNECT_PORT` | `6379` | Port of that Redis instance (container-internal, not `REDIS_PORT`). |
| `REDIS_WEBUI_PORT` | `9987` | Host-side port the web panel itself is published on. |

The panel's Redis connection also picks up `REDIS_PASSWORD` (defined in the main `.env`, shared with the `redis` service, `secret_redis` by default) to authenticate.

## Log in

Open [http://localhost:9987](http://localhost:9987) (or your custom `REDIS_WEBUI_PORT`) and sign in with `REDIS_WEBUI_USERNAME` / `REDIS_WEBUI_PASSWORD`. It should already be connected to the `redis` container, no extra connection setup needed for the default single-instance setup.

## Point it at a different Redis instance

Set `REDIS_WEBUI_CONNECT_HOST` and `REDIS_WEBUI_CONNECT_PORT` in `.env` to another container's name and internal port (for example `valkey` and `6379`), then apply the change:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock start redis-webui
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose up -d redis-webui
```

</TabItem>
</Tabs>

Environment variable changes only take effect on container recreation, a plain `restart` isn't enough here, re-run `start`/`up -d` as shown above.

## Connect to more than one Redis instance at once

The underlying image ([phpRedisAdmin](https://github.com/ErikDubbelboer/phpRedisAdmin)) supports listing multiple servers in its sidebar, it just needs one numbered set of environment variables per instance (`REDIS_1_HOST`/`REDIS_1_PORT`/`REDIS_1_AUTH`, `REDIS_2_HOST`/`REDIS_2_PORT`/`REDIS_2_AUTH`, and so on). Laradock's `redis-webui/compose.yml` only wires up `REDIS_1_*` (mapped from `REDIS_WEBUI_CONNECT_HOST`/`REDIS_WEBUI_CONNECT_PORT`/`REDIS_PASSWORD`) for the default single-instance setup. To browse a second instance (say `valkey`) in the same panel, add a matching `REDIS_2_*` block to the `environment:` section of `redis-webui/compose.yml`, then rebuild:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock rebuild redis-webui
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose build redis-webui
```

</TabItem>
</Tabs>

## Common issues

- **Blank data or "connection refused" in the panel.** The `redis` container isn't up yet or crashed. Check `./laradock logs redis` and confirm it's healthy before reloading the panel.
- **Login fails with the default credentials.** Someone already changed `REDIS_WEBUI_USERNAME`/`REDIS_WEBUI_PASSWORD` in `.env`; check there before assuming a bug.
- **Panel shows no keys even though your app is caching.** Double-check `REDIS_WEBUI_CONNECT_HOST`/`PORT` actually point at the Redis instance your app writes to; if you run multiple Redis-compatible services (Redis, Valkey, Dragonfly), it's easy to point the UI at the wrong one.
- **Changed `.env` but the panel still connects to the old host/port.** Environment variable changes need the container recreated, not just restarted, run `./laradock start redis-webui` again (see [Point it at a different Redis instance](#point-it-at-a-different-redis-instance)).

---

Prefer the command line? See **[Redis](/docs/services/redis)** for `redis-cli` usage. New to Laradock? Start at **[Getting Started](/docs/getting-started)**.
