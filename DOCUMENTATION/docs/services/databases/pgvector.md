---
slug: /services/pgvector
title: pgvector
description: Run Postgres with the pgvector extension in Laradock. Start and stop the container, configure credentials and port, back up and restore, and connect for vector/embedding storage.
keywords:
  - laradock pgvector
  - pgvector docker
  - pgvector docker compose
  - postgres vector extension docker
  - vector similarity search docker
  - rag database docker
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

## What is pgvector?

[pgvector](https://github.com/pgvector/pgvector) is a PostgreSQL extension that adds vector similarity search, the standard building block for AI/RAG features (storing and querying embeddings). Laradock runs this as a separate Postgres instance built from the official `pgvector/pgvector` image, with its own port and data folder so it can run alongside the regular [`postgres`](/docs/services/postgres) service without conflicting.

## Start pgvector

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock start pgvector
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose up -d pgvector
```

</TabItem>
</Tabs>

Your data is created on first start and kept between restarts. Name any other services alongside it to start them together, for example `./laradock start pgvector workspace`.

## Stop pgvector

Stopping just pauses the container; **your data is safe**:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock stop pgvector
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose stop pgvector
```

</TabItem>
</Tabs>

To delete the container entirely (the data on disk is still untouched, it lives under `DATA_PATH_HOST/pgvector`):

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock remove pgvector
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose rm -sf pgvector
```

</TabItem>
</Tabs>

## Configuration

All settings live in `pgvector/defaults.env` and can be overridden by adding the same line to your own `.env` (your `.env` always wins):

| Variable | Default | What it does |
|---|---|---|
| `PGVECTOR_VERSION` | `pg17` | Image tag from [pgvector's Docker Hub image](https://hub.docker.com/r/pgvector/pgvector), matches the underlying Postgres major version. |
| `PGVECTOR_PORT` | `5433` | Host-side port (container port `5432`), deliberately different from the regular `postgres` service's `5432` so both can run at once. |
| `PGVECTOR_DB` | `default` | Database created automatically on first boot; the `vector` extension is enabled in this database automatically. |
| `PGVECTOR_USER` | `default` | Non-root user created automatically. In the upstream Postgres image this user is also the database superuser, there's no separate root account to manage. |
| `PGVECTOR_PASSWORD` | `secret` | Password for `PGVECTOR_USER`. |
| `PGVECTOR_ENTRYPOINT_INITDB` | `./pgvector/docker-entrypoint-initdb.d` | Folder of init scripts auto-run on first boot, this is where `CREATE EXTENSION vector` happens (`init.sql`). |

## Change the pgvector version

Set the version in your `.env`:

```env
PGVECTOR_VERSION=pg16
```

Then apply the change:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock rebuild pgvector
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose build pgvector
```

</TabItem>
</Tabs>

Changing the **major** Postgres version against an existing data folder can break startup, Postgres doesn't read another major version's data files. The safe way to move to a new major version without losing data:

1. **Back up first** (see [Backup and restore](#backup-and-restore) below): `./laradock exec -T pgvector pg_dump -U default default > backup.sql`
2. Set the new `PGVECTOR_VERSION` in `.env` and [start completely fresh](#start-completely-fresh-wipe-all-data), which wipes `DATA_PATH_HOST/pgvector` and rebuilds on the new version.
3. Restore your backup into the fresh container: `./laradock exec -T pgvector psql -U default -d default -f - < backup.sql`

## Connect from your host machine

Connect to `localhost` on `PGVECTOR_PORT` (`5433` by default) with `PGVECTOR_USER`/`PGVECTOR_PASSWORD`, using any Postgres client (psql, TablePlus, DBeaver):

```bash
psql -h localhost -p 5433 -U default -d default
```

From another Laradock container, use `DB_HOST=pgvector` and port `5432` (the container-internal port).

## Verify the extension is enabled

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock exec pgvector psql -U default -d default -c "SELECT * FROM pg_extension WHERE extname = 'vector';"
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose exec pgvector psql -U default -d default -c "SELECT * FROM pg_extension WHERE extname = 'vector';"
```

</TabItem>
</Tabs>

## Backup and restore

**Export (back up) a database** to a `.sql` file on your host:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock exec -T pgvector pg_dump -U default default > backup.sql
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose exec -T pgvector pg_dump -U default default > backup.sql
```

</TabItem>
</Tabs>

Replace `default` with your database name (`PGVECTOR_DB`). The `-T` disables the container's pseudo-terminal so the dump isn't corrupted when redirected to a file, always include it when piping output to or from a file. `pg_dump` includes the stored vector data and the `CREATE EXTENSION vector` statement, so a restore into a fresh database re-enables the extension automatically.

**Restore (import) a database** from a `.sql` file:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock exec -T pgvector psql -U default -d default -f - < backup.sql
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose exec -T pgvector psql -U default -d default -f - < backup.sql
```

</TabItem>
</Tabs>

The target database (`default` here) just has to already exist. This is also how you bring in a dump from a client's production pgvector instance or a hosted vector DB export.

## Start completely fresh (wipe all data)

To throw away everything and start pgvector from a clean, empty state (this **permanently deletes** every database and every stored embedding in this container, back up first if you need anything):

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock stop pgvector
./laradock remove pgvector
rm -rf "${DATA_PATH_HOST:-~/.laradock/data}/pgvector"
./laradock start pgvector
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose stop pgvector
docker compose rm -sf pgvector
rm -rf "${DATA_PATH_HOST:-~/.laradock/data}/pgvector"
docker compose up -d pgvector
```

</TabItem>
</Tabs>

`DATA_PATH_HOST` is whatever you have set in `.env` (`~/.laradock/data` by default), so the folder above is where pgvector's data actually lives on your machine. Deleting it and starting again re-runs first-boot initialization: `PGVECTOR_DB`, `PGVECTOR_USER`, `PGVECTOR_PASSWORD`, and `init.sql` (which re-creates the `vector` extension) all apply fresh, exactly like a brand-new install.

## Talk to this database from another Laradock project

Each Laradock project is its own isolated Docker network by default, so a second project's containers can't reach this pgvector by container name out of the box. Easiest fix: publish the port (already done, `PGVECTOR_PORT`) and have the other project connect to your **host machine's** address instead of `pgvector`, for example `DB_HOST=host.docker.internal` (Docker Desktop) with `DB_PORT` set to this project's `PGVECTOR_PORT`. Make sure the two projects use different `PGVECTOR_PORT` values if they're both running at once.

## Common issues

- **`vector` extension missing.** It's enabled by `pgvector/docker-entrypoint-initdb.d/init.sql`, which only runs the **first time** the data folder is created. If you changed `PGVECTOR_DB` after the volume already existed, connect and run `CREATE EXTENSION IF NOT EXISTS vector;` manually.
- **Confusing this with the regular `postgres` service.** They're two separate containers with separate ports (`5433` vs `5432`) and separate data folders (`DATA_PATH_HOST/pgvector` vs `DATA_PATH_HOST/postgres`), on purpose, so you can run both.
- **Port already in use on your host.** Another local Postgres (or another Laradock project) is already bound to `5433`. Change `PGVECTOR_PORT` in `.env` and restart: `./laradock restart pgvector`.
- **App can't connect but the container is running.** From inside another container, the host is `pgvector` and the port is the container-internal `5432`, not `PGVECTOR_PORT`; from your host machine it's the reverse, `localhost` and `PGVECTOR_PORT`.
- **Credential/database changes don't take effect.** `PGVECTOR_DB`, `PGVECTOR_USER`, and `PGVECTOR_PASSWORD` are only applied when the data folder is created for the first time. If you change them afterward, either [start completely fresh](#start-completely-fresh-wipe-all-data) (data loss, back up first) or create the new user/database manually after `./laradock enter pgvector`.

---

Need plain Postgres without vectors? See the **[PostgreSQL](/docs/services/postgres)** page. Back to the **[Databases guide](/docs/Intro#supported-services)**.
