# Dragonfly

Source: https://laradock.io/docs/services/dragonfly

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

## What is Dragonfly?

[Dragonfly](https://www.dragonflydb.io) is a modern, multi-threaded in-memory data store built as a drop-in replacement for Redis and Memcached, wire-compatible with both protocols but designed to make better use of multi-core machines for higher throughput.

## Start Dragonfly

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock start dragonfly
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose up -d dragonfly
```

</TabItem>
</Tabs>

Name any other services alongside it to start them together, for example `./laradock start dragonfly workspace`.

## Stop Dragonfly

Stopping just pauses the container; **your data is safe**:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock stop dragonfly
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose stop dragonfly
```

</TabItem>
</Tabs>

To delete the container entirely (the data on disk is still untouched, it lives under `DATA_PATH_HOST`):

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock remove dragonfly
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose rm -sf dragonfly
```

</TabItem>
</Tabs>

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

## Connect with the CLI client

Dragonfly speaks the Redis protocol, so `redis-cli` (bundled in the image) works against it directly:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock enter dragonfly
redis-cli
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose exec dragonfly bash
redis-cli
```

</TabItem>
</Tabs>

From your host machine instead, point any Redis GUI (RedisInsight, TablePlus) or the `redis-cli` binary at `localhost:6381` (or your custom `DRAGONFLY_PORT`).

## Check memory usage and stats

From inside `redis-cli`:

```bash
INFO memory
DBSIZE
MEMORY USAGE <key>
```

`INFO memory` reports overall memory consumption, `DBSIZE` counts how many keys are stored, and `MEMORY USAGE <key>` sizes a single key, all standard Redis commands Dragonfly implements natively.

## Flush all data

To wipe every key without stopping the container (⚠️ this **permanently deletes** everything in the current database, there is no undo):

```bash
FLUSHALL
```

Run it from inside `redis-cli` (see [Connect with the CLI client](#connect-with-the-cli-client) above), or non-interactively:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock exec dragonfly redis-cli FLUSHALL
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose exec dragonfly redis-cli FLUSHALL
```

</TabItem>
</Tabs>

## Start completely fresh (wipe all data on disk)

`FLUSHALL` clears keys in a running instance; to also remove the container and its on-disk snapshot and start from a totally clean state:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock stop dragonfly
./laradock remove dragonfly
rm -rf "${DATA_PATH_HOST:-~/.laradock/data}/dragonfly"
./laradock start dragonfly
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose stop dragonfly
docker compose rm -sf dragonfly
rm -rf "${DATA_PATH_HOST:-~/.laradock/data}/dragonfly"
docker compose up -d dragonfly
```

</TabItem>
</Tabs>

`DATA_PATH_HOST` is whatever you have set in `.env` (`~/.laradock/data` by default), so the folder above is where Dragonfly's data actually lives on your machine (mounted to `/data` in the container).

## Connect from your host machine

Inside Laradock, other containers reach it by container name: `dragonfly:6379`. From your own machine, connect to `localhost:6381` (or your custom `DRAGONFLY_PORT`) with any Redis-compatible GUI like TablePlus or RedisInsight.

## Common issues

- **App can't connect but the container is running.** Confirm the app's config uses `dragonfly` (the container name) as the host, not `localhost` or `127.0.0.1`, those only work from your host machine, not from inside another container.
- **Confusing `DRAGONFLY_PORT` with the internal port.** `DRAGONFLY_PORT` (default `6381`) is only the host-side mapping. From inside another container, Dragonfly is always reachable on port `6379`.
- **Container fails to start with a memlock-related error.** Some Docker setups (notably rootless or certain CI runners) restrict `ulimits.memlock`; you may need to adjust your Docker daemon/host configuration since this isn't controlled from Laradock's `.env`.
- **Port already in use on your host.** Another local Dragonfly (or another Laradock project) is already bound to `6381`. Change `DRAGONFLY_PORT` in `.env` and restart: `./laradock restart dragonfly`.
- **Memory keeps growing.** Dragonfly (like Redis) keeps everything in RAM. Check usage with `INFO memory`, and consider `FLUSHALL` or a fresh start above if a dev/test workload has filled it up with stale keys.

---

Prefer upstream Redis instead? See **[Redis](https://laradock.io/docs/services/redis)**. Want the community Redis fork? See **[Valkey](https://laradock.io/docs/services/valkey)**. New to Laradock? Start at **[Getting Started](https://laradock.io/docs/getting-started)**.
