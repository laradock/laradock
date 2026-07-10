---
slug: /services/postgres
title: PostgreSQL
description: Run PostgreSQL in Laradock. Start and stop the container, configure version/port/credentials, create multiple databases, and connect from your host.
keywords:
  - laradock postgres
  - postgresql docker
  - postgres docker compose
  - change postgres version docker
  - create multiple postgres databases docker
  - postgres docker connection
---

## What is PostgreSQL?

[PostgreSQL](https://www.postgresql.org) is a powerful open-source object-relational database known for standards compliance, extensibility, and strong support for advanced data types (JSON, arrays, full-text search). It's a common alternative to MySQL for Laravel and other PHP apps. Laradock runs it as its own container, pre-wired with sane defaults.

## Start PostgreSQL

```bash
docker compose up -d postgres
```

Most web servers (`nginx`, `apache`) depend on `php-fpm` but not on `postgres`, so start it explicitly alongside whatever else you need, for example:

```bash
docker compose up -d nginx postgres workspace
```

## Stop PostgreSQL

```bash
docker compose stop postgres
```

This stops the container without deleting its data. To remove the container (data on disk is untouched, it lives under `DATA_PATH_HOST`): `docker compose rm -f postgres`.

## Configuration

The core connection settings (`POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_PORT`) live in the root `.env`, not in `postgres/defaults.env`, because other services (GitLab, Keycloak, SonarQube) share the same Postgres container. `postgres/defaults.env` holds the Postgres-specific settings:

| Variable | Default | Where | What it does |
|---|---|---|---|
| `POSTGRES_VERSION` | `17-alpine` | `postgres/defaults.env` | Image tag from [Postgres's Docker Hub](https://hub.docker.com/_/postgres). |
| `POSTGRES_ENTRYPOINT_INITDB` | `./postgres/docker-entrypoint-initdb.d` | `postgres/defaults.env` | Folder of `.sql`/`.sh` files auto-run on first boot. |
| `POSTGRES_DB` | `default` | root `.env` | Database created automatically on first boot. |
| `POSTGRES_USER` | `default` | root `.env` | User created automatically on first boot. |
| `POSTGRES_PASSWORD` | `secret` | root `.env` | Password for `POSTGRES_USER`. |
| `POSTGRES_PORT` | `5432` | root `.env` | Host-side port Postgres is published on (`host:container`). |

`postgres/defaults.env` also carries `CONFLUENCE_POSTGRES_INIT`, `GITLAB_POSTGRES_INIT`, `SONARQUBE_POSTGRES_INIT`, and `KEYCLOAK_POSTGRES_INIT` flags plus their own db/user/password variables; those exist purely so those other services can get their own database seeded inside the same Postgres instance and aren't needed for a plain app database.

## Change the PostgreSQL version

```env
POSTGRES_VERSION=16-alpine
```

```bash
docker compose build postgres
```

Changing the **major** version against an existing data folder can break startup (Postgres doesn't read another major version's data files). If you hit that, point `DATA_PATH_HOST` at a fresh folder or back up and drop the old one.

## Create multiple databases

Copy `postgres/docker-entrypoint-initdb.d/createdb.sh.example` to `createdb.sh` in the same folder, then uncomment/set the database and user names you need:

```bash
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    CREATE USER db1 WITH PASSWORD 'db1';
    CREATE DATABASE db1;
    GRANT ALL PRIVILEGES ON DATABASE db1 TO db1;
EOSQL
```

This script only auto-runs the **first time** the container initializes its data folder (when `DATA_PATH_HOST/postgres` doesn't exist yet). If your data folder already exists, run the statements manually instead via `docker compose exec postgres psql -U default -d default`.

## Connect from your host machine

Inside Laradock, other containers reach Postgres by container name: `DB_HOST=postgres`. From your own machine (TablePlus, DBeaver, pgAdmin), connect to `localhost` on `POSTGRES_PORT` (`5432` by default) with the credentials above.

## Common issues

- **"Access denied" / connection refused right after first boot.** The container needs a few seconds to initialize on a truly fresh `DATA_PATH_HOST`. Check `docker compose logs postgres` for a "ready to accept connections" message before connecting.
- **Credential/database changes don't take effect.** `POSTGRES_DB`, `POSTGRES_USER`, and `POSTGRES_PASSWORD` are only applied when the data folder is created for the first time. Change them afterward and either drop `DATA_PATH_HOST/postgres` (data loss) or create the new user/database manually.
- **Port already in use on your host.** Another local Postgres (or another Laradock project) is already bound to `5432`. Change `POSTGRES_PORT` in `.env` and restart.
- **App can't connect but the container is running.** Confirm the app's `.env` uses `DB_HOST=postgres` (the container name), not `localhost`, which only works from your host machine.
- **Need PostGIS instead.** This plain `postgres` service has no geospatial extension; use **[postgres-postgis](/docs/services/postgres-postgis)** if your app needs it.

---

Need automated backups? See **[pgbackups](/docs/services/pgbackups)**. Prefer a GUI? See pgAdmin in the **[Databases guide](/docs/Intro#supported-services)**.
