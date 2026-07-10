---
slug: /services/adminer
title: Adminer
description: Run Adminer in Laradock, a single-file GUI for MySQL, MariaDB, PostgreSQL, SQLite, and more. Start the container, log in, load plugins, and fix common issues.
keywords:
  - laradock adminer
  - adminer docker
  - adminer docker compose
  - database gui docker
  - mysql gui docker
  - postgres gui docker
---

## What is Adminer?

[Adminer](https://www.adminer.org) is a single-file database admin GUI that supports MySQL, MariaDB, PostgreSQL, SQLite, and more from one login screen, a lighter alternative to running a dedicated GUI per database engine. There's nothing to "install", Laradock builds it as its own container and you just log in with credentials for whichever database you're already running.

## Start Adminer

```bash
docker compose up -d adminer
```

## Stop Adminer

```bash
docker compose stop adminer
```

## Configuration

All settings live in `adminer/defaults.env` and can be overridden by adding the same line to your own `.env`:

| Variable | Default | What it does |
|---|---|---|
| `ADM_PORT` | `8081` | Host-side port for the web UI (container port `8080`). |
| `ADM_INSTALL_MSSQL` | `false` | Build flag, when `true`, installs `pdo_odbc`/`pdo_dblib` so Adminer can connect to SQL Server. |
| `ADM_PLUGINS` | *(empty)* | Space-separated list of Adminer plugins to enable. |
| `ADM_DESIGN` | `pepa-linha` | UI theme. |
| `ADM_DEFAULT_SERVER` | `mysql` | Server pre-filled on the login screen, handy for an external server or a non-default container name. |

## Log in

Open [http://localhost:8081](http://localhost:8081). Pick the system (MySQL, PostgreSQL, SQLite, ...), enter the server (container name, e.g. `mysql` or `postgres`), and the matching credentials.

## Add SQL Server support

1. In `.env`, set `ADM_INSTALL_MSSQL=true`.
2. Rebuild:
   ```bash
   docker compose build adminer
   ```

## Load plugins

1. Set `ADM_PLUGINS` in `.env` to the plugin names you want, space-separated.
2. Some plugins need extra parameters and a custom file inside the container, see Adminer's [Loading plugins](https://hub.docker.com/_/adminer) instructions.
3. Restart: `docker compose up -d adminer`.

## Common issues

- **SQL Server option missing.** `ADM_INSTALL_MSSQL` is a build-time flag, changing it requires a rebuild (`docker compose build adminer`), not just a restart.
- **Login rejected.** Adminer connects with whatever credentials you type in on the login form, it doesn't read `PMA_*`-style env vars for the target database. Use the same `MYSQL_USER`/`MYSQL_PASSWORD` (or the equivalent for your database) you'd use anywhere else.
- **Can't reach a database by container name.** Use the Docker Compose service name (`mysql`, `postgres`, `mariadb`, ...) as the server, not `localhost`, that only works from your host machine.
- **Port already in use on your host.** Change `ADM_PORT` in `.env` and restart.

---

Prefer a MySQL-focused GUI instead? See **[phpMyAdmin](/docs/services/phpmyadmin)**. Back to the **[Getting Started guide](/docs/getting-started)**.
