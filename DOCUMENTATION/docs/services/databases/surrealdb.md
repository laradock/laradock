---
slug: /services/surrealdb
title: SurrealDB
description: Run SurrealDB in Laradock. Start and stop the container, configure credentials and port, check its health, and fix common issues.
keywords:
  - laradock surrealdb
  - surrealdb docker
  - surrealdb docker compose
  - multi-model database docker
  - surrealql docker
  - graph and document database docker
---

## What is SurrealDB?

[SurrealDB](https://surrealdb.com) is a multi-model database combining document, graph, and relational data behind a single SQL-like query language (SurrealQL), reachable over both REST and WebSocket. Laradock runs it from the official `surrealdb/surrealdb` image with a RocksDB storage backend.

## Start SurrealDB

```bash
docker compose up -d surrealdb
```

## Stop SurrealDB

```bash
docker compose stop surrealdb
```

This stops the container without deleting its data. Data is kept in the named `surrealdb` Docker volume, not under `DATA_PATH_HOST`.

## Configuration

All settings live in `surrealdb/defaults.env` and can be overridden by adding the same line to your own `.env`:

| Variable | Default | What it does |
|---|---|---|
| `SURREALDB_VERSION` | `v2.6.5` | Image tag from [SurrealDB's Docker Hub image](https://hub.docker.com/r/surrealdb/surrealdb). |
| `SURREALDB_PORT` | `8010` | Host-side port for the REST/WebSocket API (container port `8000`). |
| `SURREALDB_USER` | `root` | Root user, passed to `surreal start --user`. |
| `SURREALDB_PASSWORD` | `secret` | Root password, passed to `surreal start --pass`. |

The container runs as `root` (set in `surrealdb/compose.yml`) so the server can create its RocksDB store inside the named volume, and starts with:

```
start --user ${SURREALDB_USER} --pass ${SURREALDB_PASSWORD} --bind 0.0.0.0:8000 rocksdb:/data/database.db
```

## Check it's up

```bash
curl http://localhost:8010/health
```

## Connect

Use the [SurrealDB CLI](https://surrealdb.com/docs/surrealdb/cli) or any SurrealDB client library against `http://localhost:8010` (from your host) or `http://surrealdb:8000` (from another container), authenticating with `SURREALDB_USER` / `SURREALDB_PASSWORD`.

## Common issues

- **Changing `SURREALDB_VERSION` doesn't take effect.** SurrealDB is pulled by image tag, not built locally, restart after changing it: `docker compose up -d surrealdb`.
- **Credential changes don't take effect.** `--user`/`--pass` are only meaningful the first time the RocksDB store is created inside the volume. If you change `SURREALDB_USER`/`SURREALDB_PASSWORD` afterward, either drop the `surrealdb` volume (data loss) or manage users through SurrealQL instead.
- **Data isn't where you expect.** Persists to a named Docker volume (`surrealdb`), not `DATA_PATH_HOST`. Use `docker volume inspect <project>_surrealdb` to find it, or `docker compose down -v` to wipe it (data loss).
- **Port already in use on your host.** Change `SURREALDB_PORT` in `.env` and restart.

---

Need a different multi-model option? See **[ArangoDB](/docs/services/arangodb)**. Back to the **[Getting Started guide](/docs/getting-started)**.
