---
slug: /services/postgres
title: PostgreSQL
description: Run PostgreSQL in Laradock. Start and stop the container, configure version/port/credentials, create multiple databases, back up and restore, and connect from your host.
keywords:
  - laradock postgres
  - postgresql docker
  - postgres docker compose
  - change postgres version docker
  - create multiple postgres databases docker
  - postgres docker connection
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

## What is PostgreSQL?

[PostgreSQL](https://www.postgresql.org) is a powerful open-source object-relational database known for standards compliance, extensibility, and strong support for advanced data types (JSON, arrays, full-text search). It's a common alternative to MySQL for Laravel and other PHP apps. Laradock runs it as its own container, pre-wired with sane defaults.

## Start PostgreSQL

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock start postgres
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose up -d postgres
```

</TabItem>
</Tabs>

Your data is created on first start and kept between restarts. Name any other services alongside it to start them together, for example `./laradock start postgres workspace`.

## Stop PostgreSQL

Stopping just pauses the container; **your data is safe**:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock stop postgres
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose stop postgres
```

</TabItem>
</Tabs>

To delete the container entirely (the data on disk is still untouched, it lives under `DATA_PATH_HOST`):

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock remove postgres
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose rm -sf postgres
```

</TabItem>
</Tabs>

## Configuration

The core connection settings (`POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_PORT`) live in the root `.env`, not in `postgres/defaults.env`, because other services (GitLab, Keycloak, SonarQube, Confluence) share the same Postgres container. `postgres/defaults.env` holds the Postgres-specific settings:

| Variable | Default | Where | What it does |
|---|---|---|---|
| `POSTGRES_VERSION` | `17-alpine` | `postgres/defaults.env` | Image tag from [Postgres's Docker Hub](https://hub.docker.com/_/postgres). |
| `POSTGRES_ENTRYPOINT_INITDB` | `./postgres/docker-entrypoint-initdb.d` | `postgres/defaults.env` | Folder of `.sql`/`.sh` files auto-run on first boot. |
| `POSTGRES_DB` | `default` | root `.env` | Database created automatically on first boot. |
| `POSTGRES_USER` | `default` | root `.env` | User created automatically on first boot. |
| `POSTGRES_PASSWORD` | `secret` | root `.env` | Password for `POSTGRES_USER`. |
| `POSTGRES_PORT` | `5432` | root `.env` | Host-side port Postgres is published on (`host:container`). |

`postgres/defaults.env` also carries `CONFLUENCE_POSTGRES_INIT`, `GITLAB_POSTGRES_INIT`, `SONARQUBE_POSTGRES_INIT`, and `KEYCLOAK_POSTGRES_INIT` flags plus their own db/user/password variables; those exist purely so those other services can get their own database seeded inside the same Postgres instance and aren't needed for a plain app database.

:::warning Passwords apply on first boot only
`POSTGRES_DB`, `POSTGRES_USER`, and `POSTGRES_PASSWORD` take effect the first time Postgres starts and creates its data files. Changing them in `.env` later (even with a rebuild) does not touch an existing database; the old password keeps working. Change it inside Postgres instead (`ALTER USER "default" WITH PASSWORD 'newpass';`), or [wipe the data folder](#start-completely-fresh-wipe-all-data) to re-initialize.
:::

## Change the PostgreSQL version

Set the version in your `.env`:

```env
POSTGRES_VERSION=16-alpine
```

Then apply the change:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock rebuild postgres
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose build postgres
```

</TabItem>
</Tabs>

Changing the **major** version against an existing data folder can break startup (Postgres doesn't read another major version's data files). The safe way to move to a new major version without losing data:

1. **Back up first** (see [Backup and restore](#backup-and-restore) below): `./laradock exec -T postgres pg_dump -U default default > backup.sql`
2. Set the new `POSTGRES_VERSION` in `.env` and [start completely fresh](#start-completely-fresh-wipe-all-data), which wipes `DATA_PATH_HOST/postgres` and rebuilds on the new version.
3. Restore your backup into the fresh container: `./laradock exec -T postgres psql -U default -d default < backup.sql`

## Create multiple databases

Copy `postgres/docker-entrypoint-initdb.d/createdb.sh.example` to `createdb.sh` in the same folder, then uncomment/set the database and user names you need:

```bash
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    CREATE USER db1 WITH PASSWORD 'db1';
    CREATE DATABASE db1;
    GRANT ALL PRIVILEGES ON DATABASE db1 TO db1;
EOSQL
```

This script only auto-runs the **first time** the container initializes its data folder (when `DATA_PATH_HOST/postgres` doesn't exist yet). If your data folder already exists, run the statements manually instead:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock enter postgres
psql -U default -d default
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose exec postgres bash
psql -U default -d default
```

</TabItem>
</Tabs>

## Backup and restore

**Export (back up) a database** to a `.sql` file on your host:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock exec -T postgres pg_dump -U default default > backup.sql
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose exec -T postgres pg_dump -U default default > backup.sql
```

</TabItem>
</Tabs>

Replace `default` with your database and user name (`POSTGRES_DB` / `POSTGRES_USER`). The `-T` disables the container's pseudo-terminal so the dump isn't corrupted when redirected to a file, always include it when piping output to or from a file.

**Restore (import) a database** from a `.sql` file:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock exec -T postgres psql -U default -d default < backup.sql
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose exec -T postgres psql -U default -d default < backup.sql
```

</TabItem>
</Tabs>

Unlike the `createdb.sh` first-boot init script above, this works anytime, the target database (`default` here) just has to already exist. This is also how you bring in a dump from a client's production site or your previous local Postgres install.

## Start completely fresh (wipe all data)

To throw away everything and start Postgres from a clean, empty state (this **permanently deletes** every database in this container, including any GitLab/Keycloak/SonarQube/Confluence databases seeded alongside it, back up first if you need anything):

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock stop postgres
./laradock remove postgres
rm -rf "${DATA_PATH_HOST:-~/.laradock/data}/postgres"
./laradock start postgres
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose stop postgres
docker compose rm -sf postgres
rm -rf "${DATA_PATH_HOST:-~/.laradock/data}/postgres"
docker compose up -d postgres
```

</TabItem>
</Tabs>

`DATA_PATH_HOST` is whatever you have set in `.env` (`~/.laradock/data` by default), so the folder above is where Postgres's data actually lives on your machine. Deleting it and starting again re-runs first-boot initialization: `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD`, and any `docker-entrypoint-initdb.d` scripts (including the `*_POSTGRES_INIT` seeding for GitLab/Keycloak/SonarQube/Confluence) all apply fresh, exactly like a brand-new install.

## Talk to this database from another Laradock project

Each Laradock project is its own isolated Docker network by default, so a second project's containers can't reach this Postgres by container name out of the box. Easiest fix: publish the port (already done, `POSTGRES_PORT`) and have the other project connect to your **host machine's** address instead of `postgres`, for example `DB_HOST=host.docker.internal` (Docker Desktop) with `DB_PORT` set to this project's `POSTGRES_PORT`. Make sure the two projects use different `POSTGRES_PORT` values if they're both running at once.

## Connect from your host machine

Inside Laradock, other containers reach Postgres by container name: `DB_HOST=postgres`. From your own machine (TablePlus, DBeaver, pgAdmin), connect to `localhost` on `POSTGRES_PORT` (`5432` by default) with the credentials above.

## Common issues

- **"Access denied" / connection refused right after first boot.** The container needs a few seconds to initialize on a truly fresh `DATA_PATH_HOST`. Run `./laradock logs postgres` and wait for a "ready to accept connections" message before connecting.
- **Credential/database changes don't take effect.** `POSTGRES_DB`, `POSTGRES_USER`, and `POSTGRES_PASSWORD` are only applied when the data folder is created for the first time. If you change them afterward, either [start completely fresh](#start-completely-fresh-wipe-all-data) (data loss, back up first) or create the new user/database manually after `./laradock enter postgres`.
- **Two Laradock projects overwrite each other's data.** Running more than one Laradock on the same machine? Set both `COMPOSE_PROJECT_NAME` and `DATA_PATH_HOST` to unique values per project, otherwise they share the same Postgres data on disk.
- **Port already in use on your host.** Another local Postgres (or another Laradock project) is already bound to `5432`. Change `POSTGRES_PORT` in `.env` and restart: `./laradock restart postgres`.
- **App can't connect but the container is running.** Confirm the app's `.env` uses `DB_HOST=postgres` (the container name), not `localhost` or `127.0.0.1`, those only work from your host machine, not from inside another container.
- **Need PostGIS instead.** This plain `postgres` service has no geospatial extension; use **[postgres-postgis](/docs/services/postgres-postgis)** if your app needs it.

---

Need automated backups? See **[pgbackups](/docs/services/pgbackups)**. Prefer a GUI? See pgAdmin in the **[Databases guide](/docs/Intro#supported-services)**.
