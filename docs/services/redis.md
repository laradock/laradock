# Redis

Source: https://laradock.io/docs/services/redis

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

## What is Redis?

[Redis](https://redis.io) is an in-memory data store used as a cache, session store, and queue backend. It's the most common performance upgrade for PHP apps once file-based caching or `array` sessions stop being enough, and Laravel supports it natively.

## Start Redis

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock start redis
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose up -d redis
```

</TabItem>
</Tabs>

## Stop Redis

Stopping just pauses the container; **your data is safe**:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock stop redis
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose stop redis
```

</TabItem>
</Tabs>

To delete the container entirely (the data on disk is still untouched, it lives under `DATA_PATH_HOST`):

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock remove redis
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose rm -sf redis
```

</TabItem>
</Tabs>

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

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock enter redis
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose exec redis bash
```

</TabItem>
</Tabs>

Then start the client, authenticating if `REDIS_PASSWORD` is set:

```bash
redis-cli -a secret_redis
```

## Flush all keys (clear the cache)

⚠️ This **permanently deletes** every key in Redis, there's no undo. Useful when stale cached data is causing bugs and you just want a clean slate:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock exec -T redis redis-cli -a secret_redis FLUSHALL
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose exec -T redis redis-cli -a secret_redis FLUSHALL
```

</TabItem>
</Tabs>

`FLUSHALL` clears every database inside Redis. To clear only the currently selected database (`database => 0` by default in Laravel's config above), use `FLUSHDB` instead.

## Check memory usage and stats

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock exec -T redis redis-cli -a secret_redis INFO memory
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose exec -T redis redis-cli -a secret_redis INFO memory
```

</TabItem>
</Tabs>

`INFO memory` reports `used_memory_human` (current usage) and `maxmemory_policy` (what Redis does when it hits a memory cap, if you've set one). Swap `memory` for `stats` (`INFO stats`) to see hit/miss counters, or run `DBSIZE` for a quick key count in the current database.

## Backup and restore

Redis periodically snapshots its dataset to disk as `dump.rdb` under `/data` in the container, which maps to `DATA_PATH_HOST/redis/dump.rdb` on your host. To back up, force an immediate snapshot, then copy that file out:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock exec -T redis redis-cli -a secret_redis SAVE
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose exec -T redis redis-cli -a secret_redis SAVE
```

</TabItem>
</Tabs>

```bash
cp "${DATA_PATH_HOST:-~/.laradock/data}/redis/dump.rdb" backup.rdb
```

**Restore** a snapshot by putting it back before Redis starts, since Redis only loads `dump.rdb` from disk on boot:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock stop redis
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose stop redis
```

</TabItem>
</Tabs>

```bash
cp backup.rdb "${DATA_PATH_HOST:-~/.laradock/data}/redis/dump.rdb"
```

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock start redis
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose up -d redis
```

</TabItem>
</Tabs>

## Start completely fresh (wipe all data)

To throw away everything (all keys, all snapshots) and start Redis from a clean, empty state (⚠️ this **permanently deletes** the data, back up first if you need anything):

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock stop redis
./laradock remove redis
rm -rf "${DATA_PATH_HOST:-~/.laradock/data}/redis"
./laradock start redis
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose stop redis
docker compose rm -sf redis
rm -rf "${DATA_PATH_HOST:-~/.laradock/data}/redis"
docker compose up -d redis
```

</TabItem>
</Tabs>

`DATA_PATH_HOST` is whatever you have set in `.env` (`~/.laradock/data` by default), so the folder above is where Redis's `dump.rdb` actually lives on your machine.

## Talk to this Redis from another Laradock project

Each Laradock project is its own isolated Docker network by default, so a second project's containers can't reach this Redis by container name out of the box. Easiest fix: publish the port (already done, `REDIS_PORT`) and have the other project connect to your **host machine's** address instead of `redis`, for example `REDIS_HOST=host.docker.internal` (Docker Desktop) with `REDIS_PORT` and `REDIS_PASSWORD` matching this project's values. Make sure the two projects use different `REDIS_PORT` values if they're both running at once, and pick different `database =>` indexes (or a key prefix) if you don't want them to see each other's keys.

## Connect from your host machine

Inside Laradock, other containers reach Redis by container name: `REDIS_HOST=redis`. From your own machine, connect to `localhost:6379` (or your custom `REDIS_PORT`) with a GUI like TablePlus or RedisInsight, using `REDIS_PASSWORD` if set.

## Common issues

- **`NOAUTH Authentication required`.** `REDIS_PASSWORD` is set in `.env` but your client isn't sending it. Pass `-a <password>` to `redis-cli`, or set the password on your Laravel Redis connection config.
- **App can't connect but the container is running.** Confirm the app's `.env` uses `REDIS_HOST=redis` (the container name), not `localhost` or `127.0.0.1`, those only work from your host machine, not from inside another container.
- **Port already in use on your host.** Another local Redis (or another Laradock project) is already bound to `6379`. Change `REDIS_PORT` in `.env` and restart: `./laradock restart redis`.
- **Data disappears after `docker compose down -v`.** Redis data lives under `DATA_PATH_HOST/redis`; `-v` removes named volumes and, depending on your setup, can wipe it. Use `./laradock stop redis` if you just want to pause the container.
- **Cached values from a previous session/database still show up.** You're probably sharing the same `database =>` index across two apps or two Laradock projects. See [Flush all keys](#flush-all-keys-clear-the-cache) above, or give each app its own database index.

---

Need a GUI to browse keys? See **[Redis WebUI](https://laradock.io/docs/services/redis-webui)**. Need a Redis-compatible alternative? See **[Valkey](https://laradock.io/docs/services/valkey)** or **[Dragonfly](https://laradock.io/docs/services/dragonfly)**, or a multi-node setup, **[Redis Cluster](https://laradock.io/docs/services/redis-cluster)**. New to Laradock? Start at **[Getting Started](https://laradock.io/docs/getting-started)**.
