---
slug: /services/ssdb
title: SSDB
description: Run SSDB in Laradock. Start and stop the container, configure the port, connect with redis-cli, and fix common issues.
keywords:
  - laradock ssdb
  - ssdb docker
  - ssdb docker compose
  - redis protocol disk backed store
  - ssdb vs redis
  - nosql key value store docker
---

## What is SSDB?

[SSDB](https://github.com/ideawu/ssdb) is a high-performance NoSQL store built on LevelDB/RocksDB-style storage, supporting lists, hashes, sets, and z-sets like Redis. Unlike Redis, SSDB persists everything to disk rather than keeping the working set in memory, so it can hold datasets far larger than RAM while still speaking (a subset of) the Redis protocol. Laradock builds it from source on Alpine.

## Start SSDB

```bash
docker compose up -d ssdb
```

## Stop SSDB

```bash
docker compose stop ssdb
```

This stops the container without deleting its data. Data lives under `DATA_PATH_HOST/ssdb`.

## Configuration

All settings live in `ssdb/defaults.env` and can be overridden by adding the same line to your own `.env`:

| Variable | Default | What it does |
|---|---|---|
| `SSDB_PORT` | `16801` | Host-side port mapped to SSDB's internal port `8888`. |

There's no version variable, `ssdb/Dockerfile` builds from the `master` branch of the [ideawu/ssdb](https://github.com/ideawu/ssdb) source and isn't pinned to a release tag.

## Connect with a Redis client

Because SSDB speaks the Redis protocol, `redis-cli` and most Redis clients work against it:

```bash
docker compose exec ssdb bash
redis-cli -h 127.0.0.1 -p 8888
```

From your host machine, connect to `localhost` on `SSDB_PORT` (`16801` by default).

## Common issues

- **Connections refused from other hosts.** `ssdb/ssdb.conf` only allows `127.0.0.1`, `192.*`, and `172.*` by default (`allow:` lines under `server:`), edit that file and rebuild if you need to allow a different range.
- **Image drifts over time.** Since the build isn't pinned to a release tag, `docker compose build --no-cache ssdb` can pull in newer upstream commits than you tested against.
- **Data not persisting.** Confirm `DATA_PATH_HOST` is set consistently, SSDB's data is written to `DATA_PATH_HOST/ssdb` on the host.
- **Port already in use on your host.** Change `SSDB_PORT` in `.env` and restart: `docker compose up -d ssdb`.

---

Need an in-memory store instead? See the **[Databases guide](/docs/Intro#supported-services)** for Redis and friends. Back to the **[Getting Started guide](/docs/getting-started)**.
