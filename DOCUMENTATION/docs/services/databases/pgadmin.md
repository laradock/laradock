---
slug: /services/pgadmin
title: pgAdmin
description: Run pgAdmin in Laradock as a GUI for PostgreSQL. Start the container, log in, connect to your Postgres server, and fix common issues.
keywords:
  - laradock pgadmin
  - pgadmin docker
  - pgadmin docker compose
  - postgres gui docker
  - postgresql admin ui docker
  - pgadmin default credentials
---

## What is pgAdmin?

[pgAdmin](https://www.pgadmin.org) is the standard web-based admin GUI for PostgreSQL, browse schemas, run queries, manage roles, and inspect query plans. There's nothing to "install", Laradock runs it straight from the official `dpage/pgadmin4` image and points it at your `postgres` container.

## Start pgAdmin

Start it alongside Postgres:

```bash
docker compose up -d postgres pgadmin
```

`pgadmin` depends on `postgres` in `pgadmin/compose.yml`, so Compose starts `postgres` first automatically if you just run `docker compose up -d pgadmin`.

## Stop pgAdmin

```bash
docker compose stop pgadmin
```

This stops the container without deleting its saved server list. Data lives under `DATA_PATH_HOST/pgadmin`.

## Configuration

All settings live in `pgadmin/defaults.env` and can be overridden by adding the same line to your own `.env`:

| Variable | Default | What it does |
|---|---|---|
| `PGADMIN_PORT` | `5050` | Host-side port for the web UI (container port `80`). |
| `PGADMIN_DEFAULT_EMAIL` | `pgadmin4@pgadmin.org` | Login email for the pgAdmin app itself (not a Postgres credential). |
| `PGADMIN_DEFAULT_PASSWORD` | `admin` | Login password for the pgAdmin app itself. |

## Log in

Open [http://localhost:5050](http://localhost:5050) and sign in with `PGADMIN_DEFAULT_EMAIL` / `PGADMIN_DEFAULT_PASSWORD` (`pgadmin4@pgadmin.org` / `admin` by default).

## Connect to your Postgres server

Once logged in, add a new server in pgAdmin's UI:
- **Host**: `postgres` (the container name)
- **Port**: `5432` (container-internal port)
- **Username/Password**: your `POSTGRES_USER`/`POSTGRES_PASSWORD`

## Common issues

- **pgAdmin login and Postgres login are different things.** `PGADMIN_DEFAULT_EMAIL`/`PGADMIN_DEFAULT_PASSWORD` only get you into the pgAdmin app itself, you still add and authenticate against your actual Postgres server separately inside the UI.
- **Credential changes don't take effect.** `PGADMIN_DEFAULT_EMAIL`/`PGADMIN_DEFAULT_PASSWORD` are only applied when `DATA_PATH_HOST/pgadmin` is created for the first time. If you change them afterward, either drop that folder (loses saved servers/settings) or change the user from inside pgAdmin's own user management.
- **Can't reach Postgres by container name.** Use `postgres` as the host inside pgAdmin's server dialog, not `localhost`, that only works from your host machine, not from inside another container.
- **Port already in use on your host.** Change `PGADMIN_PORT` in `.env` and restart: `docker compose up -d pgadmin`.

---

Need a MySQL/MariaDB GUI instead? See **[phpMyAdmin](/docs/services/phpmyadmin)**. Back to the **[Getting Started guide](/docs/getting-started)**.
