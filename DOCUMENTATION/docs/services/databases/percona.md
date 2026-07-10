---
slug: /services/percona
title: Percona Server
description: Run Percona Server in Laradock. Start and stop the container, configure port/credentials, create multiple databases, and connect from your host.
keywords:
  - laradock percona
  - percona server docker
  - percona docker compose
  - mysql compatible database docker
  - percona root access docker
  - percona performance database
---

## What is Percona Server?

[Percona Server](https://www.percona.com/software/mysql-database/percona-server) is a free, open-source, performance-focused fork of MySQL, drop-in compatible with MySQL's protocol and SQL syntax but with additional enterprise-grade features (extra performance metrics, XtraDB storage engine improvements) built in. Laradock runs it pinned to Percona `8.0`.

## Start Percona

```bash
docker compose up -d percona
```

It runs as its own container with no `depends_on` in `compose.yml`.

## Stop Percona

```bash
docker compose stop percona
```

This stops the container without deleting its data. To remove the container (data on disk is untouched, it lives under `DATA_PATH_HOST`): `docker compose rm -f percona`.

## Configuration

All settings live in `percona/defaults.env`:

| Variable | Default | What it does |
|---|---|---|
| `PERCONA_DATABASE` | `homestead` | Database created automatically on first boot. |
| `PERCONA_USER` | `homestead` | Non-root user created automatically. |
| `PERCONA_PASSWORD` | `secret` | Password for `PERCONA_USER`. |
| `PERCONA_ROOT_PASSWORD` | `root` | Password for the `root` user. |
| `PERCONA_PORT` | `3306` | Host-side port Percona is published on (`host:container`). |
| `PERCONA_ENTRYPOINT_INITDB` | `./percona/docker-entrypoint-initdb.d` | Folder of `.sql`/`.sh` files auto-run on first boot. |

Unlike Laradock's other MySQL-family services, `percona/Dockerfile` pins the image to `percona:8.0` directly rather than exposing a version build arg, so there's no `PERCONA_VERSION` variable to override.

## Root access

Default root credentials are `root` / `root` (`PERCONA_ROOT_PASSWORD`).

```bash
docker compose exec percona bash
mysql -uroot -proot
```

For the non-root app user instead: `mysql -uhomestead -psecret` (or your own `PERCONA_USER`/`PERCONA_PASSWORD`).

## Create multiple databases

Copy `percona/docker-entrypoint-initdb.d/createdb.sql.example` to `createdb.sql` in the same folder, then uncomment/add your statements, following the same pattern MySQL uses:

```sql
CREATE DATABASE IF NOT EXISTS `your_db_1` COLLATE 'utf8mb4_general_ci';
GRANT ALL ON `your_db_1`.* TO 'homestead'@'%';
```

This file only auto-runs the **first time** the container initializes its data folder (when `DATA_PATH_HOST/percona` doesn't exist yet). If your data folder already exists, run it manually instead:

```bash
docker compose exec percona bash
mysql -uroot -proot < /docker-entrypoint-initdb.d/createdb.sql
```

## Tune server settings

`percona/my.cnf` is mounted into the container as `/etc/mysql/conf.d/my.cnf`. It ships with a strict `sql-mode` (`STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION`); add any other `[mysqld]` directives there and rebuild.

## Connect from your host machine

Inside Laradock, other containers reach Percona by container name: `DB_HOST=percona`. From your own machine (TablePlus, DBeaver, Sequel Ace), connect to `localhost` on `PERCONA_PORT` (`3306` by default) with the credentials above.

## Common issues

- **"Access denied" right after first boot.** The container needs a few seconds to initialize on a truly fresh `DATA_PATH_HOST`. Check `docker compose logs percona` for a ready message before connecting.
- **Credential/database changes don't take effect.** `PERCONA_DATABASE`, `PERCONA_USER`, and `PERCONA_PASSWORD` are only applied when the data folder is created for the first time. Change them afterward and either drop `DATA_PATH_HOST/percona` (data loss) or create the new user/database manually.
- **Running alongside `mysql` or `mariadb`.** They all default to host port `3306`; give each a distinct `PERCONA_PORT`/`MYSQL_PORT`/`MARIADB_PORT` if you need more than one up simultaneously.
- **App can't connect but the container is running.** Confirm the app's `.env` uses `DB_HOST=percona` (the container name), not `localhost`, which only works from your host machine.

---

Need the community MySQL build instead? See **[MySQL](/docs/services/mysql)**. For the full list of services, see **[Getting Started](/docs/getting-started)**.
