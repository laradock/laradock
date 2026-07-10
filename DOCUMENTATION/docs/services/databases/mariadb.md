---
slug: /services/mariadb
title: MariaDB
description: Run MariaDB in Laradock. Start and stop the container, configure version/port/credentials, create multiple databases, and connect from your host.
keywords:
  - laradock mariadb
  - mariadb docker
  - mariadb docker compose
  - change mariadb version docker
  - mariadb root access docker
  - mysql compatible database docker
---

## What is MariaDB?

[MariaDB](https://mariadb.org) is a community-developed fork of MySQL, created by MySQL's original developers after Oracle's acquisition of MySQL. It's drop-in compatible with MySQL's wire protocol and SQL syntax, so any app that speaks to MySQL (Laravel, WordPress, etc.) works against MariaDB unchanged. Laradock runs it as its own container, pre-wired with sane defaults.

## Start MariaDB

```bash
docker compose up -d mariadb
```

Most web servers (`nginx`, `apache`) depend on `php-fpm` but not on `mariadb`, so start it explicitly alongside whatever else you need, for example:

```bash
docker compose up -d nginx mariadb workspace
```

## Stop MariaDB

```bash
docker compose stop mariadb
```

This stops the container without deleting its data. To remove the container (data on disk is untouched, it lives under `DATA_PATH_HOST`): `docker compose rm -f mariadb`.

## Configuration

All settings live in `mariadb/defaults.env` and can be overridden by adding the same line to your own `.env` (your `.env` always wins):

| Variable | Default | What it does |
|---|---|---|
| `MARIADB_VERSION` | `11.4` | Image tag from [MariaDB's Docker Hub](https://hub.docker.com/_/mariadb). |
| `MARIADB_DATABASE` | `default` | Database created automatically on first boot. |
| `MARIADB_USER` | `default` | Non-root user created automatically. |
| `MARIADB_PASSWORD` | `secret` | Password for `MARIADB_USER`. |
| `MARIADB_ROOT_PASSWORD` | `root` | Password for the `root` user. |
| `MARIADB_PORT` | `3306` | Host-side port MariaDB is published on (`host:container`). |
| `MARIADB_ENTRYPOINT_INITDB` | `./mariadb/docker-entrypoint-initdb.d` | Folder of `.sql`/`.sh` files auto-run on first boot. |

## Change the MariaDB version

```env
MARIADB_VERSION=10.11
```

```bash
docker compose build mariadb
```

Changing the **major** version against an existing data folder can break startup. If you hit that, point `DATA_PATH_HOST` at a fresh folder or back up and drop the old one.

## Root access

Default root credentials are `root` / `root` (`MARIADB_ROOT_PASSWORD`).

```bash
docker compose exec mariadb bash
mariadb -uroot -proot
```

For the non-root app user instead: `mariadb -udefault -psecret` (or your own `MARIADB_USER`/`MARIADB_PASSWORD`).

## Create multiple databases

Copy `mariadb/docker-entrypoint-initdb.d/createdb.sql.example` to `createdb.sql` in the same folder, then uncomment/add your statements, following the same pattern MySQL uses:

```sql
CREATE DATABASE IF NOT EXISTS `your_db_1` COLLATE 'utf8mb4_general_ci';
GRANT ALL ON `your_db_1`.* TO 'default'@'%';
```

This file only auto-runs the **first time** the container initializes its data folder (when `DATA_PATH_HOST/mariadb` doesn't exist yet). If your data folder already exists, run it manually instead:

```bash
docker compose exec mariadb bash
mariadb -uroot -proot < /docker-entrypoint-initdb.d/createdb.sql
```

## Tune server settings

`mariadb/my.cnf` is mounted into the container as `/etc/mysql/conf.d/my.cnf`. It ships with `innodb_log_file_size = 4048M` and `innodb_strict_mode = 0`; add any other `[mysqld]` directives there and rebuild.

## Connect from your host machine

Inside Laradock, other containers reach MariaDB by container name: `DB_HOST=mariadb`. From your own machine (TablePlus, DBeaver, Sequel Ace), connect to `localhost` on `MARIADB_PORT` (`3306` by default) with the credentials above.

## Common issues

- **"Access denied" right after first boot.** The container needs a few seconds to initialize on a truly fresh `DATA_PATH_HOST`. Check `docker compose logs mariadb` for a ready message before connecting.
- **Credential/database changes don't take effect.** `MARIADB_DATABASE`, `MARIADB_USER`, and `MARIADB_PASSWORD` are only applied when the data folder is created for the first time. Change them afterward and either drop `DATA_PATH_HOST/mariadb` (data loss) or create the new user/database manually.
- **Port already in use on your host.** Another local MySQL/MariaDB (or another Laradock project) is already bound to `3306`. Change `MARIADB_PORT` in `.env` and restart.
- **App can't connect but the container is running.** Confirm the app's `.env` uses `DB_HOST=mariadb` (the container name), not `localhost`, which only works from your host machine.
- **Running both `mysql` and `mariadb` at once.** They both default to host port `3306`; give one a different `MARIADB_PORT`/`MYSQL_PORT` if you need both up simultaneously.

---

Need the original MySQL instead? See **[MySQL](/docs/services/mysql)**. For the full list of services, see **[Getting Started](/docs/getting-started)**.
