---
slug: /services/postgres-postgis
title: PostgreSQL + PostGIS
description: Run PostgreSQL with the PostGIS geospatial extension in Laradock. Start and stop the container, configure version and credentials, back up and restore, and connect from your host.
keywords:
  - laradock postgis
  - postgres postgis docker
  - postgis docker compose
  - geospatial database docker
  - postgres geospatial extension
  - postgis version docker
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

## What is PostgreSQL + PostGIS?

[PostGIS](https://postgis.net) is an extension for PostgreSQL that adds support for geographic objects, spatial indexes, and spatial SQL functions (distance, intersection, containment, and more). This service is a full Postgres image with PostGIS already installed, use it instead of plain **[postgres](/docs/services/postgres)** when your app needs geospatial queries; for everything else the two behave the same.

## Start PostgreSQL + PostGIS

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock start postgres-postgis
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose up -d postgres-postgis
```

</TabItem>
</Tabs>

It runs as its own container and doesn't depend on any other service in `compose.yml`. Note it shares the same connection variables (`POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_PORT`) as the plain `postgres` service, so avoid running both at once unless you give one a different port and data path.

## Stop PostgreSQL + PostGIS

Stopping just pauses the container; **your data is safe**:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock stop postgres-postgis
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose stop postgres-postgis
```

</TabItem>
</Tabs>

To delete the container entirely (the data on disk is still untouched, it lives under `DATA_PATH_HOST`):

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock remove postgres-postgis
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose rm -sf postgres-postgis
```

</TabItem>
</Tabs>

## Configuration

| Variable | Default | Where | What it does |
|---|---|---|---|
| `POSTGIS_VERSION` | `17-3.5` | `postgres-postgis/defaults.env` | Image tag from [postgis/postgis on Docker Hub](https://hub.docker.com/r/postgis/postgis) (Postgres major version + PostGIS version, e.g. `17-3.5`). |
| `POSTGIS_INSTALL_PGSQL_HTTP_FOR_POSTGIS13` | `false` | `postgres-postgis/defaults.env` | When `true`, builds and installs the [pgsql-http](https://github.com/pramsey/pgsql-http) extension for making HTTP requests from SQL (only relevant on the PostGIS 13 base image). |
| `POSTGRES_DB` | `default` | root `.env` | Database created automatically on first boot. |
| `POSTGRES_USER` | `default` | root `.env` | User created automatically on first boot; it's granted superuser rights on this database. |
| `POSTGRES_PASSWORD` | `secret` | root `.env` | Password for `POSTGRES_USER`. |
| `POSTGRES_PORT` | `5432` | root `.env` | Host-side port published (`host:container`). |

Data is stored under `DATA_PATH_HOST/postgres`, the same path plain Postgres uses; running both services against the same `DATA_PATH_HOST` will conflict.

## Change the PostGIS version

Set the version in your `.env`:

```env
POSTGIS_VERSION=16-3.4
```

Then apply the change:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock rebuild postgres-postgis
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose build postgres-postgis
```

</TabItem>
</Tabs>

Changing the **major** Postgres version against an existing data folder can break startup (Postgres doesn't downgrade/cross-upgrade data files cleanly). The safe way to move to a new major version without losing data:

1. **Back up first** (see [Backup and restore](#backup-and-restore) below): `./laradock exec -T postgres-postgis pg_dump -U default default > backup.sql`
2. Set the new `POSTGIS_VERSION` in `.env` and [start completely fresh](#start-completely-fresh-wipe-all-data), which wipes `DATA_PATH_HOST/postgres` and rebuilds on the new version.
3. Restore your backup into the fresh container: `./laradock exec -T postgres-postgis psql -U default default < backup.sql`

## Enable the extension in a database

PostGIS ships with the image but each database still needs the extension turned on once:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock exec postgres-postgis psql -U default -d default -c "CREATE EXTENSION IF NOT EXISTS postgis;"
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose exec postgres-postgis psql -U default -d default -c "CREATE EXTENSION IF NOT EXISTS postgis;"
```

</TabItem>
</Tabs>

## Backup and restore

**Export (back up) a database** to a `.sql` file on your host:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock exec -T postgres-postgis pg_dump -U default default > backup.sql
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose exec -T postgres-postgis pg_dump -U default default > backup.sql
```

</TabItem>
</Tabs>

Replace `default` with your database name (`POSTGRES_DB`) and user. The `-T` disables the container's pseudo-terminal so the dump isn't corrupted when redirected to a file, always include it when piping output to or from a file.

**Restore (import) a database** from a `.sql` file:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock exec -T postgres-postgis psql -U default default < backup.sql
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose exec -T postgres-postgis psql -U default default < backup.sql
```

</TabItem>
</Tabs>

The target database (`default` here) must already exist before restoring. This is also how you bring in a dump from a client's production PostGIS database or your previous local install; the destination database still needs `CREATE EXTENSION IF NOT EXISTS postgis;` run once if it wasn't created from an already-spatial dump.

## Start completely fresh (wipe all data)

To throw away everything and start PostgreSQL + PostGIS from a clean, empty state (⚠️ this **permanently deletes** every database in this container, back up first if you need anything):

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock stop postgres-postgis
./laradock remove postgres-postgis
rm -rf "${DATA_PATH_HOST:-~/.laradock/data}/postgres"
./laradock start postgres-postgis
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose stop postgres-postgis
docker compose rm -sf postgres-postgis
rm -rf "${DATA_PATH_HOST:-~/.laradock/data}/postgres"
docker compose up -d postgres-postgis
```

</TabItem>
</Tabs>

`DATA_PATH_HOST` is whatever you have set in `.env` (`~/.laradock/data` by default), so the folder above is where the data actually lives on your machine, the same folder plain `postgres` uses. Deleting it and starting again re-runs first-boot initialization: `POSTGRES_DB`, `POSTGRES_USER`, and `POSTGRES_PASSWORD` all apply fresh, exactly like a brand-new install, but PostGIS itself is **not** auto-enabled, run [Enable the extension in a database](#enable-the-extension-in-a-database) again afterward.

## Talk to this database from another Laradock project

Each Laradock project is its own isolated Docker network by default, so a second project's containers can't reach this database by container name out of the box. Easiest fix: publish the port (already done, `POSTGRES_PORT`) and have the other project connect to your **host machine's** address instead of `postgres-postgis`, for example `DB_HOST=host.docker.internal` (Docker Desktop) with `DB_PORT` set to this project's `POSTGRES_PORT`. Make sure the two projects use different `POSTGRES_PORT` values if they're both running at once.

## Connect from your host machine

Inside Laradock, other containers reach it by container name: `DB_HOST=postgres-postgis`. From your own machine (TablePlus, DBeaver, pgAdmin, QGIS), connect to `localhost` on `POSTGRES_PORT` (`5432` by default) with the credentials above.

## Common issues

- **Running `postgres` and `postgres-postgis` together.** Both default to the same `DATA_PATH_HOST/postgres` folder and the same `POSTGRES_PORT`. Pick one, or override `DATA_PATH_HOST`/`POSTGRES_PORT` for whichever you run second.
- **`CREATE EXTENSION postgis` fails.** Make sure you're connecting to a database created after the container booted with the PostGIS image; extensions are per-database and must be created explicitly, they aren't automatic, and wiping the data folder (see above) resets this too.
- **Credential/database changes don't take effect.** `POSTGRES_DB`, `POSTGRES_USER`, and `POSTGRES_PASSWORD` only apply the first time the data folder is created. [Start completely fresh](#start-completely-fresh-wipe-all-data) (data loss, back up first) or create the new user/database manually with `./laradock enter postgres-postgis`.
- **Port already in use on your host.** Another local Postgres (or another Laradock project) is already bound to `5432`. Change `POSTGRES_PORT` in `.env` and restart: `./laradock restart postgres-postgis`.
- **App can't connect but the container is running.** Confirm the app's `.env` uses `DB_HOST=postgres-postgis` (the container name), not `localhost` or `127.0.0.1`, those only work from your host machine, not from inside another container.

---

Need Postgres without the geospatial extension? See **[PostgreSQL](/docs/services/postgres)**. For the full list of services, see **[Getting Started](/docs/getting-started)**.
