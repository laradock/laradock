---
slug: /services/memcached
title: Memcached
description: Run Memcached in Laravel via Laradock. Start and stop the container, configure the port, flush and inspect the cache, and use it as a Laravel cache driver.
keywords:
  - laradock memcached
  - memcached docker
  - memcached docker compose
  - laravel memcached cache
  - memcached vs redis
  - in-memory cache docker
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

## What is Memcached?

[Memcached](https://memcached.org) is a simple, high-performance in-memory key-value cache. Unlike Redis, it has no persistence and no built-in data structures (lists, sets, hashes), it's pure cache: store a value, get it back fast, let it expire. That simplicity makes it lighter and sometimes faster for pure caching workloads where you don't need Redis's extra features.

## Start Memcached

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock start memcached
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose up -d memcached
```

</TabItem>
</Tabs>

The container's `compose.yml` declares `depends_on: php-fpm`, so starting `memcached` also starts `php-fpm` if it isn't running yet.

## Stop Memcached

Stopping just pauses the container; nothing to worry about since Memcached holds no data on disk anyway:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock stop memcached
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose stop memcached
```

</TabItem>
</Tabs>

To delete the container entirely:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock remove memcached
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose rm -sf memcached
```

</TabItem>
</Tabs>

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

## Check memory usage and stats

Memcached speaks a simple text protocol, so you can query live stats with `nc` (netcat) from your host machine, no client library needed:

```bash
printf 'stats\r\n' | nc -w 1 localhost 11211
```

This prints counters like `bytes` (current memory used), `limit_maxbytes` (memory cap), `curr_items` (keys currently cached), `get_hits`/`get_misses`, and `evictions` (items dropped because memory ran out, a sign you need a bigger memory limit). Swap `11211` for your custom `MEMCACHED_HOST_PORT` if you changed it.

## Flush all cached keys

There's no per-key delete UI, but you can wipe the entire cache instantly:

```bash
printf 'flush_all\r\n' | nc -w 1 localhost 11211
```

A `OK` response confirms every key was invalidated immediately. Unlike Redis's `FLUSHALL`, this doesn't free memory back to the OS, Memcached just marks existing items expired, memory is reused as new keys come in.

## Increase the memory limit

Memcached's default in-memory cache size is **64MB** (the `-m` flag, stock upstream default), which fills up fast under real traffic and starts evicting keys. Override the container's startup command in `memcached/compose.yml` to raise it:

```yaml
services:
  memcached:
    command: memcached -m 256
```

Then apply it:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock start memcached
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose up -d memcached
```

</TabItem>
</Tabs>

Other useful flags you can add the same way: `-c` (max simultaneous connections, default `1024`) and `-I` (max size of a single cached item, default `1MB`).

## Connect from your host machine

Inside Laradock, other containers reach it by container name: `memcached:11211`. From your own machine, connect to `localhost:11211` (or your custom `MEMCACHED_HOST_PORT`) with a Memcached client library, or use `nc`/`telnet` directly for the ad-hoc `stats`/`flush_all` commands shown above.

## Common issues

- **App can't connect but the container is running.** Confirm the app's config uses `memcached` (the container name) as the host, not `localhost` or `127.0.0.1`, those only work from your host machine, not from inside another container.
- **Cache writes silently fail.** The PHP `memcached` extension isn't installed/enabled in `php-fpm` or `workspace`. Without it, Laravel's Memcached driver can't connect and cache operations no-op or throw depending on your error handling.
- **Port already in use on your host.** Another local Memcached (or another Laradock project) is already bound to `11211`. Change `MEMCACHED_HOST_PORT` in `.env` and restart: `./laradock restart memcached`.
- **Cached data vanishes on restart.** This is expected: Memcached has no persistence by design. If you need cached values to survive a restart, use Redis, Valkey, or Dragonfly instead.
- **No built-in authentication.** Stock Memcached (what this image runs) accepts any connection that can reach its port, there's no username/password. Keep `MEMCACHED_HOST_PORT` off the public internet; it's meant to be reached from other containers or your local machine only.
- **Keys keep getting evicted under load.** Check `evictions` in `stats` (see [Check memory usage and stats](#check-memory-usage-and-stats) above); a rising count means the memory limit is too small for your working set, see [Increase the memory limit](#increase-the-memory-limit).

---

Need persistence or richer data structures? See **[Redis](/docs/services/redis)**. New to Laradock? Start at **[Getting Started](/docs/getting-started)**.
