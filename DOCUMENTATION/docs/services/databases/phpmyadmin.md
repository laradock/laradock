---
slug: /services/phpmyadmin
title: phpMyAdmin
description: Run phpMyAdmin in Laradock as a GUI for MySQL or MariaDB. Start the container, log in, switch database engines, and fix common issues.
keywords:
  - laradock phpmyadmin
  - phpmyadmin docker
  - phpmyadmin docker compose
  - mysql gui docker
  - mariadb gui docker
  - database admin ui docker
---

## What is phpMyAdmin?

[phpMyAdmin](https://www.phpmyadmin.net) is a web-based admin GUI for MySQL and MariaDB, browse tables, run queries, manage users, and import/export data without touching a command line. There's nothing to "install", Laradock builds it as its own container from the official `phpmyadmin` image and points it at whichever database container you're already running.

## Start phpMyAdmin

Start it alongside the database it should manage:

```bash
# with MySQL
docker compose up -d mysql phpmyadmin

# with MariaDB
docker compose up -d mariadb phpmyadmin
```

## Stop phpMyAdmin

```bash
docker compose stop phpmyadmin
```

## Configuration

All settings live in `phpmyadmin/defaults.env` and can be overridden by adding the same line to your own `.env`:

| Variable | Default | What it does |
|---|---|---|
| `PMA_DB_ENGINE` | `mysql` | Which service phpMyAdmin depends on and connects to by default: `mysql` or `mariadb`. |
| `PMA_USER` | `default` | Username phpMyAdmin logs in with. |
| `PMA_PASSWORD` | `secret` | Password for `PMA_USER`. |
| `PMA_ROOT_PASSWORD` | `secret` | Root password passed through to the container. |
| `PMA_PORT` | `8081` | Host-side port for the web UI (container port `80`). |
| `PMA_MAX_EXECUTION_TIME` | `600` | PHP `max_execution_time`, in seconds, for long-running queries/imports. |
| `PMA_MEMORY_LIMIT` | `256M` | PHP `memory_limit` for the container. |
| `PMA_UPLOAD_LIMIT` | `2G` | Max upload size, for importing large SQL/CSV files. |

## Log in

Open [http://localhost:8081](http://localhost:8081). For the default MySQL setup, use server `mysql`, user `default`, password `secret` (or your own `PMA_USER`/`PMA_PASSWORD`).

## Switch to MariaDB

1. In `.env`, set `PMA_DB_ENGINE=mariadb`.
2. Start `mariadb` instead of `mysql`: `docker compose up -d mariadb phpmyadmin`.
3. Log in with server `mariadb`.

## Common issues

- **"mysqli::real_connect(): (HY000/2002)" or similar connection error.** phpMyAdmin `depends_on: ${PMA_DB_ENGINE}`, meaning it starts alongside whichever engine `PMA_DB_ENGINE` names, but if that container isn't actually up (or you changed `PMA_DB_ENGINE` without restarting), the login form has nothing to connect to. Confirm the matching database container is running: `docker compose ps`.
- **Login rejected.** Double-check `PMA_USER`/`PMA_PASSWORD` match the actual credentials on the target database (`MYSQL_USER`/`MYSQL_PASSWORD` or `MARIADB_USER`/`MARIADB_PASSWORD`), they're independent variables and can drift out of sync if you change one without the other.
- **Large import fails partway through.** Raise `PMA_UPLOAD_LIMIT` and `PMA_MAX_EXECUTION_TIME` in `.env`, then restart: `docker compose up -d phpmyadmin`.
- **Port already in use on your host.** Change `PMA_PORT` in `.env` and restart.

---

Prefer a lighter GUI, or need Postgres/SQLite too? See **[Adminer](/docs/services/adminer)**. Back to the **[Getting Started guide](/docs/getting-started)**.
