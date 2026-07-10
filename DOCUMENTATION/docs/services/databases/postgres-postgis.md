---
slug: /services/postgres-postgis
title: PostgreSQL + PostGIS
description: Run PostgreSQL with the PostGIS geospatial extension in Laradock. Start and stop the container, configure version and credentials, and connect from your host.
keywords:
  - laradock postgis
  - postgres postgis docker
  - postgis docker compose
  - geospatial database docker
  - postgres geospatial extension
  - postgis version docker
---

## What is PostgreSQL + PostGIS?

[PostGIS](https://postgis.net) is an extension for PostgreSQL that adds support for geographic objects, spatial indexes, and spatial SQL functions (distance, intersection, containment, and more). This service is a full Postgres image with PostGIS already installed, use it instead of plain **[postgres](/docs/services/postgres)** when your app needs geospatial queries; for everything else the two behave the same.

## Start PostgreSQL + PostGIS

```bash
docker compose up -d postgres-postgis
```

It runs as its own container and doesn't depend on any other service in `compose.yml`. Note it shares the same connection variables (`POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_PORT`) as the plain `postgres` service, so avoid running both at once unless you give one a different port and data path.

## Stop PostgreSQL + PostGIS

```bash
docker compose stop postgres-postgis
```

This stops the container without deleting its data. To remove the container (data on disk is untouched, it lives under `DATA_PATH_HOST`): `docker compose rm -f postgres-postgis`.

## Configuration

| Variable | Default | Where | What it does |
|---|---|---|---|
| `POSTGIS_VERSION` | `17-3.5` | `postgres-postgis/defaults.env` | Image tag from [postgis/postgis on Docker Hub](https://hub.docker.com/r/postgis/postgis) (Postgres major version + PostGIS version, e.g. `17-3.5`). |
| `POSTGIS_INSTALL_PGSQL_HTTP_FOR_POSTGIS13` | `false` | `postgres-postgis/defaults.env` | When `true`, builds and installs the [pgsql-http](https://github.com/pramsey/pgsql-http) extension for making HTTP requests from SQL (only relevant on the PostGIS 13 base image). |
| `POSTGRES_DB` | `default` | root `.env` | Database created automatically on first boot. |
| `POSTGRES_USER` | `default` | root `.env` | User created automatically on first boot. |
| `POSTGRES_PASSWORD` | `secret` | root `.env` | Password for `POSTGRES_USER`. |
| `POSTGRES_PORT` | `5432` | root `.env` | Host-side port published (`host:container`). |

Data is stored under `DATA_PATH_HOST/postgres`, the same path plain Postgres uses; running both services against the same `DATA_PATH_HOST` will conflict.

## Change the PostGIS version

```env
POSTGIS_VERSION=16-3.4
```

```bash
docker compose build postgres-postgis
```

Changing the **major** Postgres version against an existing data folder can break startup. Point `DATA_PATH_HOST` at a fresh folder or back up and drop the old one first.

## Enable the extension in a database

PostGIS ships with the image but each database still needs the extension turned on once:

```bash
docker compose exec postgres-postgis psql -U default -d default -c "CREATE EXTENSION IF NOT EXISTS postgis;"
```

## Connect from your host machine

Inside Laradock, other containers reach it by container name: `DB_HOST=postgres-postgis`. From your own machine (TablePlus, DBeaver, pgAdmin, QGIS), connect to `localhost` on `POSTGRES_PORT` (`5432` by default) with the credentials above.

## Common issues

- **Running `postgres` and `postgres-postgis` together.** Both default to the same `DATA_PATH_HOST/postgres` folder and the same `POSTGRES_PORT`. Pick one, or override `DATA_PATH_HOST`/`POSTGRES_PORT` for whichever you run second.
- **`CREATE EXTENSION postgis` fails.** Make sure you're connecting to a database created after the container booted with the PostGIS image; extensions are per-database and must be created explicitly, they aren't automatic.
- **Credential/database changes don't take effect.** `POSTGRES_DB`, `POSTGRES_USER`, and `POSTGRES_PASSWORD` only apply the first time the data folder is created. Drop `DATA_PATH_HOST/postgres` (data loss) or create the new user/database manually.
- **Port already in use on your host.** Change `POSTGRES_PORT` in `.env` and restart.

---

Need Postgres without the geospatial extension? See **[PostgreSQL](/docs/services/postgres)**. For the full list of services, see **[Getting Started](/docs/getting-started)**.
