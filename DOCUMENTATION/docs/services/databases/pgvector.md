---
slug: /services/pgvector
title: pgvector
description: Run Postgres with the pgvector extension in Laradock. Start and stop the container, configure credentials and port, and connect for vector/embedding storage.
keywords:
  - laradock pgvector
  - pgvector docker
  - pgvector docker compose
  - postgres vector extension docker
  - vector similarity search docker
  - rag database docker
---

## What is pgvector?

[pgvector](https://github.com/pgvector/pgvector) is a PostgreSQL extension that adds vector similarity search, the standard building block for AI/RAG features (storing and querying embeddings). Laradock runs this as a separate Postgres instance built from the official `pgvector/pgvector` image, with its own port and data folder so it can run alongside the regular [`postgres`](/docs/services/postgres) service without conflicting.

## Start pgvector

```bash
docker compose up -d pgvector
```

## Stop pgvector

```bash
docker compose stop pgvector
```

This stops the container without deleting its data. Data lives under `DATA_PATH_HOST/pgvector`.

## Configuration

All settings live in `pgvector/defaults.env` and can be overridden by adding the same line to your own `.env`:

| Variable | Default | What it does |
|---|---|---|
| `PGVECTOR_VERSION` | `pg17` | Image tag from [pgvector's Docker Hub image](https://hub.docker.com/r/pgvector/pgvector), matches the underlying Postgres major version. |
| `PGVECTOR_PORT` | `5433` | Host-side port (container port `5432`), deliberately different from the regular `postgres` service's `5432` so both can run at once. |
| `PGVECTOR_DB` | `default` | Database created automatically on first boot; the `vector` extension is enabled in this database automatically. |
| `PGVECTOR_USER` | `default` | Non-root user created automatically. |
| `PGVECTOR_PASSWORD` | `secret` | Password for `PGVECTOR_USER`. |
| `PGVECTOR_ENTRYPOINT_INITDB` | `./pgvector/docker-entrypoint-initdb.d` | Folder of init scripts auto-run on first boot, this is where `CREATE EXTENSION vector` happens (`init.sql`). |

## Connect from your host machine

Connect to `localhost` on `PGVECTOR_PORT` (`5433` by default) with `PGVECTOR_USER`/`PGVECTOR_PASSWORD`, using any Postgres client (psql, TablePlus, DBeaver):

```bash
psql -h localhost -p 5433 -U default -d default
```

From another Laradock container, use `DB_HOST=pgvector` and port `5432` (the container-internal port).

## Verify the extension is enabled

```bash
docker compose exec pgvector psql -U default -d default -c "SELECT * FROM pg_extension WHERE extname = 'vector';"
```

## Common issues

- **`vector` extension missing.** It's enabled by `pgvector/docker-entrypoint-initdb.d/init.sql`, which only runs the **first time** the data folder is created. If you changed `PGVECTOR_DB` after the volume already existed, connect and run `CREATE EXTENSION IF NOT EXISTS vector;` manually.
- **Confusing this with the regular `postgres` service.** They're two separate containers with separate ports (`5433` vs `5432`) and separate data folders (`DATA_PATH_HOST/pgvector` vs `DATA_PATH_HOST/postgres`), on purpose, so you can run both.
- **Port already in use on your host.** Change `PGVECTOR_PORT` in `.env` and restart: `docker compose up -d pgvector`.
- **App can't connect but the container is running.** From inside another container, the host is `pgvector` and the port is the container-internal `5432`, not `PGVECTOR_PORT`.

---

Need plain Postgres without vectors? See the **[Databases guide](/docs/Intro#supported-services)**. Back to the **[Getting Started guide](/docs/getting-started)**.
