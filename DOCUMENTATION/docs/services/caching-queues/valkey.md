---
slug: /services/valkey
title: Valkey
description: Run Valkey in Laradock, the open-source Redis fork. Start and stop the container, configure the version and port, flush keys, check memory stats, back up and restore data, and connect any Redis client.
keywords:
  - laradock valkey
  - valkey docker
  - valkey docker compose
  - redis fork
  - valkey vs redis
  - valkey laravel
  - valkey-cli
  - flush valkey
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

## What is Valkey?

[Valkey](https://valkey.io) is the community-driven fork of Redis, created after Redis's 2024 license change moved it away from an open-source license. Valkey stays fully protocol-compatible with Redis, so any Redis client, including Laravel's, works against it unmodified.

## Start Valkey

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock start valkey
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose up -d valkey
```

</TabItem>
</Tabs>

Your data is created on first start and kept between restarts. Name any other services alongside it to start them together, for example `./laradock start valkey workspace`.

## Stop Valkey

Stopping just pauses the container; **your data is safe**:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock stop valkey
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose stop valkey
```

</TabItem>
</Tabs>

To delete the container entirely (the data on disk is still untouched, it lives under `DATA_PATH_HOST`):

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock remove valkey
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose rm -sf valkey
```

</TabItem>
</Tabs>

## Configuration

All settings live in `valkey/defaults.env` and can be overridden by adding the same line to your own `.env`:

| Variable | Default | What it does |
|---|---|---|
| `VALKEY_VERSION` | `8-alpine` | Image tag from [Valkey's Docker Hub](https://hub.docker.com/r/valkey/valkey). |
| `VALKEY_PORT` | `6380` | Host-side port Valkey is published on (`host:container`). Deliberately not `6379`, so it can run alongside the `redis` service. |

## Change the Valkey version

Set the version in your `.env`:

```env
VALKEY_VERSION=8-alpine
```

Then apply the change:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock rebuild valkey
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose build valkey
```

</TabItem>
</Tabs>

## Use Valkey from Laravel

Point any Redis client at it the same way you would Redis. In your Laravel `.env`:

```env
REDIS_HOST=valkey
REDIS_PORT=6379
```

Note the app-side `REDIS_PORT` here is the container-internal port (`6379`), not `VALKEY_PORT`, containers talk to each other over the internal network, not the host-published port.

## Connect from your host machine

Inside Laradock, other containers reach it by container name: `valkey:6379`. From your own machine, connect to `localhost:6380` (or your custom `VALKEY_PORT`) with any Redis-compatible GUI like TablePlus or RedisInsight.

## Connect with the native CLI

Open a terminal inside the container and use `valkey-cli`, the Redis-protocol CLI client bundled with the image:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock enter valkey
valkey-cli
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose exec valkey bash
valkey-cli
```

</TabItem>
</Tabs>

```
127.0.0.1:6379> PING
PONG
127.0.0.1:6379> KEYS *
```

## Check memory usage and stats

Run a one-off `INFO` query without opening an interactive shell:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock exec valkey valkey-cli INFO memory
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose exec valkey valkey-cli INFO memory
```

</TabItem>
</Tabs>

Swap `memory` for `stats` (hit/miss ratio, ops/sec, connections) or `keyspace` (key counts and expiry counts per logical database). Plain `INFO` with no section returns everything.

## Flush all keys

⚠️ This **permanently deletes** every key in every logical database on this instance, there's no undo:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock exec valkey valkey-cli FLUSHALL
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose exec valkey valkey-cli FLUSHALL
```

</TabItem>
</Tabs>

To clear only the currently selected logical database instead of all of them, use `FLUSHDB` from inside `valkey-cli` after `SELECT <n>`.

## Backup and restore

Valkey persists to a single RDB snapshot file (`dump.rdb`) under its data volume. Trigger a synchronous save, then copy the file out while the container is still running:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock exec valkey valkey-cli SAVE
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose exec valkey valkey-cli SAVE
```

</TabItem>
</Tabs>

```bash
cp "${DATA_PATH_HOST:-~/.laradock/data}/valkey/dump.rdb" ./valkey-backup.rdb
```

`SAVE` blocks the server until the snapshot finishes (fine for a small local cache; for a large dataset use `BGSAVE` instead and poll `INFO persistence` for `rdb_bgsave_in_progress:0` before copying).

**Restore** a snapshot: stop the container, replace the data file, then start again so Valkey loads it on boot:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock stop valkey
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose stop valkey
```

</TabItem>
</Tabs>

```bash
cp ./valkey-backup.rdb "${DATA_PATH_HOST:-~/.laradock/data}/valkey/dump.rdb"
```

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock start valkey
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose up -d valkey
```

</TabItem>
</Tabs>

Since most Laradock apps only use Valkey as a cache/session/queue store rather than a source of truth, backups here are usually optional, take one before anything you can't easily regenerate (long-lived sessions, queued jobs not yet processed).

## Start completely fresh (wipe all data)

To throw away every key and start Valkey from a clean, empty state (⚠️ this **permanently deletes** all data in this container, back up first if you need anything):

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock stop valkey
./laradock remove valkey
rm -rf "${DATA_PATH_HOST:-~/.laradock/data}/valkey"
./laradock start valkey
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose stop valkey
docker compose rm -sf valkey
rm -rf "${DATA_PATH_HOST:-~/.laradock/data}/valkey"
docker compose up -d valkey
```

</TabItem>
</Tabs>

`DATA_PATH_HOST` is whatever you have set in `.env` (`~/.laradock/data` by default), so the folder above is where Valkey's RDB snapshot actually lives on your machine.

## Talk to this from another Laradock project

Each Laradock project is its own isolated Docker network by default, so a second project's containers can't reach this Valkey by container name out of the box. Easiest fix: the port is already published (`VALKEY_PORT`), have the other project connect to your **host machine's** address instead of `valkey`, for example `REDIS_HOST=host.docker.internal` (Docker Desktop) with `REDIS_PORT` set to this project's `VALKEY_PORT`. Make sure the two projects use different `VALKEY_PORT` values if they're both running at once.

## Common issues

- **App can't connect but the container is running.** Confirm the app's config uses `valkey` (the container name) as the host, not `localhost` or `127.0.0.1`, those only work from your host machine, not from inside another container.
- **Confusing `VALKEY_PORT` with the internal port.** `VALKEY_PORT` (default `6380`) is only the host-side mapping. From inside another container, Valkey is always reachable on port `6379`.
- **Port already in use on your host.** Another local Valkey/Redis (or another Laradock project) is already bound to `6380`. Change `VALKEY_PORT` in `.env` and restart: `./laradock restart valkey`.
- **Running both `redis` and `valkey` together.** They're separate containers with separate data (`DATA_PATH_HOST/valkey` vs `DATA_PATH_HOST/redis`), decide which one your app actually points at before debugging "missing" cache data.
- **Cached data survives a `FLUSHALL` you expected to clear everything.** Laravel's cache/session/queue connections can each target a different logical database (`0`-`15` by default); `FLUSHALL` clears all of them, `FLUSHDB` only the one currently selected.

---

Prefer upstream Redis instead? See **[Redis](/docs/services/redis)**. Want an even higher-throughput alternative? See **[Dragonfly](/docs/services/dragonfly)**. New to Laradock? Start at **[Getting Started](/docs/getting-started)**.
