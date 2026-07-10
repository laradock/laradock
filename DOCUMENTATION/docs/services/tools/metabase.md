---
slug: /services/metabase
title: Metabase
description: Run Metabase in Laradock for BI dashboards and ad-hoc SQL exploration over your app's databases.
keywords:
  - laradock metabase
  - metabase docker
  - metabase docker compose
  - business intelligence docker
  - sql dashboard docker
---

## What is Metabase?

[Metabase](https://www.metabase.com) is an open-source business intelligence tool: connect it to a database, and non-technical users can build charts and dashboards without writing SQL (though you still can, if you want to). Laradock runs it from the official `metabase/metabase:latest` image.

## Start Metabase

```bash
docker compose up -d metabase
```

## Stop Metabase

```bash
docker compose stop metabase
```

## Configuration

Settings live in `metabase/defaults.env` and can be overridden in your own `.env`:

| Variable | Default | What it does |
|---|---|---|
| `METABASE_PORT` | `3030` | Host port Metabase is published on (container always listens on `3000` internally). |
| `METABASE_DB_FILE` | `metabase.db` | Filename for Metabase's own application database (an embedded H2 file, stores dashboards/questions/users, not your app data). |

Metabase's application data persists under `DATA_PATH_HOST/metabase-data`, mounted into the container. Connecting Metabase to your actual app database (MySQL, Postgres, etc.) is done from Metabase's own admin UI after first boot, not via `.env`.

## First-time setup

```bash
docker compose up -d metabase
```

Open [http://localhost:3030](http://localhost:3030) and follow the setup wizard to create an admin account, then add a database connection. Inside Laradock, other containers are reachable by name (`mysql`, `postgres`, etc.), use those as the host, not `localhost`.

See [Running Metabase on Docker](https://www.metabase.com/docs/latest/installation-and-operation/running-metabase-on-docker) for the full range of configuration options (email, SSO, embedding) beyond what Laradock wires up by default.

## Common issues

- **Setup wizard runs again after a restart.** Confirm `DATA_PATH_HOST/metabase-data` actually persisted, if that folder was deleted or `DATA_PATH_HOST` changed, Metabase starts with a fresh application database.
- **Can't connect to your app's database from Metabase.** Use the container name (`mysql`, `postgres`, ...) as the host in Metabase's connection form, `localhost` from inside the `metabase` container refers to the Metabase container itself.
- **Port already in use on your host.** Change `METABASE_PORT` in `.env` and restart: `docker compose up -d metabase`.
- **Metabase feels slow on first load.** This is normal, Metabase's JVM-based backend takes a bit longer to start than most containers; check `docker compose logs metabase` for `Metabase Initialization COMPLETE` before assuming it's stuck.

---

Need the database Metabase is reporting on? See the **[Databases guide](/docs/Intro#supported-services)**. New to Laradock? Start at **[Getting Started](/docs/getting-started)**.
