---
slug: /services/mariadb
title: MariaDB
description: Run MariaDB in Laradock. Start and stop the container, configure version/port/credentials, create multiple databases, back up and restore, and connect from your host.
keywords:
  - laradock mariadb
  - mariadb docker
  - mariadb docker compose
  - change mariadb version docker
  - mariadb root access docker
  - mysql compatible database docker
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

## What is MariaDB?

[MariaDB](https://mariadb.org) is a community-developed fork of MySQL, created by MySQL's original developers after Oracle's acquisition of MySQL. It's drop-in compatible with MySQL's wire protocol and SQL syntax, so any app that speaks to MySQL (Laravel, WordPress, etc.) works against MariaDB unchanged. Laradock runs it as its own container, pre-wired with sane defaults.

## Start MariaDB

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock start mariadb
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose up -d mariadb
```

</TabItem>
</Tabs>

Your data is created on first start and kept between restarts. Name any other services alongside it to start them together, for example `./laradock start mariadb workspace`.

## Stop MariaDB

Stopping just pauses the container; **your data is safe**:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock stop mariadb
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose stop mariadb
```

</TabItem>
</Tabs>

To delete the container entirely (the data on disk is still untouched, it lives under `DATA_PATH_HOST`):

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock remove mariadb
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose rm -sf mariadb
```

</TabItem>
</Tabs>

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

Set the version in your `.env`:

```env
MARIADB_VERSION=10.11
```

Then apply the change:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock rebuild mariadb
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose build mariadb
```

</TabItem>
</Tabs>

Changing the **major** version against an existing data folder can break startup (MariaDB doesn't downgrade/cross-upgrade data files cleanly). The safe way to move to a new major version without losing data:

1. **Back up first** (see [Backup and restore](#backup-and-restore) below): `./laradock exec -T mariadb mariadb-dump -uroot -proot default > backup.sql`
2. Set the new `MARIADB_VERSION` in `.env` and [start completely fresh](#start-completely-fresh-wipe-all-data), which wipes `DATA_PATH_HOST/mariadb` and rebuilds on the new version.
3. Restore your backup into the fresh container: `./laradock exec -T mariadb mariadb -uroot -proot default < backup.sql`

## Root access

Default root credentials are `root` / `root` (`MARIADB_ROOT_PASSWORD`). Open a terminal inside the MariaDB container, then start the MariaDB prompt:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock enter mariadb
mariadb -uroot -proot
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose exec mariadb bash
mariadb -uroot -proot
```

</TabItem>
</Tabs>

For the non-root app user instead: `mariadb -udefault -psecret` (or your own `MARIADB_USER`/`MARIADB_PASSWORD`).

```sql
SELECT User FROM mysql.user;
SHOW DATABASES;
```

## Create multiple databases

Copy `mariadb/docker-entrypoint-initdb.d/createdb.sql.example` to `createdb.sql` in the same folder, then uncomment/add your statements, following the same pattern MySQL uses:

```sql
CREATE DATABASE IF NOT EXISTS `your_db_1` COLLATE 'utf8mb4_general_ci';
GRANT ALL ON `your_db_1`.* TO 'default'@'%';
```

This file only auto-runs the **first time** the container initializes its data folder (when `DATA_PATH_HOST/mariadb` doesn't exist yet). If your data folder already exists, run it manually instead:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock enter mariadb
mariadb -uroot -proot < /docker-entrypoint-initdb.d/createdb.sql
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose exec mariadb bash
mariadb -uroot -proot < /docker-entrypoint-initdb.d/createdb.sql
```

</TabItem>
</Tabs>

## Backup and restore

**Export (back up) a database** to a `.sql` file on your host:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock exec -T mariadb mariadb-dump -uroot -proot default > backup.sql
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose exec -T mariadb mariadb-dump -uroot -proot default > backup.sql
```

</TabItem>
</Tabs>

Replace `default` with your database name (`MARIADB_DATABASE`). The `-T` disables the container's pseudo-terminal so the dump isn't corrupted when redirected to a file, always include it when piping output to or from a file. (`mariadb-dump` is the same tool as `mysqldump`, both ship in the image and work identically.)

**Restore (import) a database** from a `.sql` file:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock exec -T mariadb mariadb -uroot -proot default < backup.sql
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose exec -T mariadb mariadb -uroot -proot default < backup.sql
```

</TabItem>
</Tabs>

Unlike the `createdb.sql` first-boot init file above, this works anytime, the target database (`default` here) just has to already exist. This is also how you bring in a dump from a client's production site or a MySQL install (MariaDB reads standard MySQL dumps directly).

## Start completely fresh (wipe all data)

To throw away everything and start MariaDB from a clean, empty state (⚠️ this **permanently deletes** every database in this container, back up first if you need anything):

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock stop mariadb
./laradock remove mariadb
rm -rf "${DATA_PATH_HOST:-~/.laradock/data}/mariadb"
./laradock start mariadb
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose stop mariadb
docker compose rm -sf mariadb
rm -rf "${DATA_PATH_HOST:-~/.laradock/data}/mariadb"
docker compose up -d mariadb
```

</TabItem>
</Tabs>

`DATA_PATH_HOST` is whatever you have set in `.env` (`~/.laradock/data` by default), so the folder above is where MariaDB's data actually lives on your machine. Deleting it and starting again re-runs first-boot initialization: `MARIADB_DATABASE`, `MARIADB_USER`, `MARIADB_PASSWORD`, and any `docker-entrypoint-initdb.d` scripts all apply fresh, exactly like a brand-new install.

## Tune server settings

`mariadb/my.cnf` is mounted into the container as `/etc/mysql/conf.d/my.cnf`. It ships with `innodb_log_file_size = 4048M` and `innodb_strict_mode = 0`; add any other `[mysqld]` directives there, for example character set/collation:

```conf
[mysqld]
character-set-server = utf8mb4
collation-server = utf8mb4_unicode_ci
```

**`utf8mb4`** (not plain `utf8`) is what you need for full emoji/multi-byte Unicode support, common with WordPress and user-generated content. This only affects **new** databases/tables; existing ones keep their original charset unless you `ALTER` them.

Apply the change:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock restart mariadb
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose restart mariadb
```

</TabItem>
</Tabs>

## Talk to this database from another Laradock project

Each Laradock project is its own isolated Docker network by default, so a second project's containers can't reach this MariaDB by container name out of the box. Easiest fix: publish the port (already done, `MARIADB_PORT`) and have the other project connect to your **host machine's** address instead of `mariadb`, for example `DB_HOST=host.docker.internal` (Docker Desktop) with `DB_PORT` set to this project's `MARIADB_PORT`. Make sure the two projects use different `MARIADB_PORT` values if they're both running at once.

## Connect from your host machine

Inside Laradock, other containers reach MariaDB by container name: `DB_HOST=mariadb`. From your own machine (a GUI client like TablePlus, DBeaver, or Sequel Ace), connect to `localhost` on `MARIADB_PORT` (`3306` by default) with the credentials above.

## Common issues

- **"Access denied" right after first boot.** The container needs a few seconds to initialize on a truly fresh `DATA_PATH_HOST`. Run `./laradock logs mariadb` and wait for a ready message before connecting.
- **Credential/database changes don't take effect.** `MARIADB_DATABASE`, `MARIADB_USER`, and `MARIADB_PASSWORD` are only applied when the data folder is created for the first time. If you change them afterward, either [start completely fresh](#start-completely-fresh-wipe-all-data) (data loss, back up first) or create the new user/database manually after `./laradock enter mariadb`.
- **Two Laradock projects overwrite each other's data.** Running more than one Laradock on the same machine? Set both `COMPOSE_PROJECT_NAME` and `DATA_PATH_HOST` to unique values per project, otherwise they share the same MariaDB data on disk.
- **Port already in use on your host.** Another local MySQL/MariaDB (or another Laradock project) is already bound to `3306`. Change `MARIADB_PORT` in `.env` and restart: `./laradock restart mariadb`.
- **App can't connect but the container is running.** Confirm the app's `.env` uses `DB_HOST=mariadb` (the container name), not `localhost` or `127.0.0.1`, those only work from your host machine, not from inside another container.
- **Running both `mysql` and `mariadb` at once.** They both default to host port `3306`; give one a different `MARIADB_PORT`/`MYSQL_PORT` if you need both up simultaneously.

---

Need the original MySQL instead? See **[MySQL](/docs/services/mysql)**. For the full list of services, see **[Getting Started](/docs/getting-started)**.
