# MySQL

Source: https://laradock.io/docs/services/mysql

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

## What is MySQL?

[MySQL](https://www.mysql.com) is the world's most widely used open-source relational database, the default choice for most PHP apps (Laravel, WordPress, and most of the frameworks and CMSs Laradock supports ship with MySQL out of the box). Laradock runs it as its own container, pre-wired with sane defaults, so you never install MySQL on your host machine.

## Start MySQL

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock start mysql
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose up -d mysql
```

</TabItem>
</Tabs>

Your data is created on first start and kept between restarts. Name any other services alongside it to start them together, for example `./laradock start mysql redis`.

## Stop MySQL

Stopping just pauses the container; **your data is safe**:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock stop mysql
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose stop mysql
```

</TabItem>
</Tabs>

To delete the container entirely (the data on disk is still untouched, it lives under `DATA_PATH_HOST`):

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock remove mysql
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose rm -sf mysql
```

</TabItem>
</Tabs>

## Configuration

All settings live in `mysql/defaults.env` and can be overridden by adding the same line to your own `.env` (your `.env` always wins):

| Variable | Default | What it does |
|---|---|---|
| `MYSQL_VERSION` | `8.4` | Image tag from [MySQL's Docker Hub](https://hub.docker.com/_/mysql): `5.7`, `8.0`, `8.4`, `9.0`, `latest`, etc. |
| `MYSQL_DATABASE` | `default` | Database created automatically on first boot. |
| `MYSQL_USER` | `default` | Non-root user created automatically. |
| `MYSQL_PASSWORD` | `secret` | Password for `MYSQL_USER`. |
| `MYSQL_ROOT_PASSWORD` | `root` | Password for the `root` user. |
| `MYSQL_PORT` | `3306` | Host-side port MySQL is published on (`host:container`). |
| `MYSQL_ENTRYPOINT_INITDB` | `./mysql/docker-entrypoint-initdb.d` | Folder of `.sql`/`.sh` files auto-run on first boot. |

:::warning Passwords apply on first boot only
`MYSQL_DATABASE`, `MYSQL_USER`, `MYSQL_PASSWORD`, and `MYSQL_ROOT_PASSWORD` take effect the first time MySQL starts and creates its data files. Changing them in `.env` later (even with a rebuild) does not touch an existing database; the old password keeps working. Change it inside MySQL instead (`ALTER USER 'default'@'%' IDENTIFIED BY 'newpass';`), or [wipe the data folder](#start-completely-fresh-wipe-all-data) to re-initialize.
:::

## Change the MySQL version

Set the version in your `.env`:

```env
MYSQL_VERSION=8.0
```

Then apply the change:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock rebuild mysql
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose build mysql
```

</TabItem>
</Tabs>

Changing the **major** version against an existing data folder can break startup (MySQL doesn't downgrade/cross-upgrade data files cleanly). The safe way to move to a new major version without losing data:

1. **Back up first** (see [Backup and restore](#backup-and-restore) below): `./laradock exec -T mysql mysqldump -uroot -proot default > backup.sql`
2. Set the new `MYSQL_VERSION` in `.env` and [start completely fresh](#start-completely-fresh-wipe-all-data), which wipes `DATA_PATH_HOST/mysql` and rebuilds on the new version.
3. Restore your backup into the fresh container: `./laradock exec -T mysql mysql -uroot -proot default < backup.sql`

## Root access

Default root credentials are `root` / `root` (`MYSQL_ROOT_PASSWORD`). Open a terminal inside the MySQL container, then start the MySQL prompt:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock enter mysql
mysql -uroot -proot
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose exec mysql bash
mysql -uroot -proot
```

</TabItem>
</Tabs>

For the non-root app user instead: `mysql -udefault -psecret` (or your own `MYSQL_USER`/`MYSQL_PASSWORD`).

```sql
SELECT User FROM mysql.user;
SHOW DATABASES;
```

## Create multiple databases

Copy `mysql/docker-entrypoint-initdb.d/createdb.sql.example` to `createdb.sql` in the same folder, then uncomment/add your statements:

```sql
CREATE DATABASE IF NOT EXISTS `your_db_1` COLLATE 'utf8mb4_general_ci';
GRANT ALL ON `your_db_1`.* TO 'default'@'%';
```

This file only auto-runs the **first time** the container initializes its data folder (when `DATA_PATH_HOST/mysql` doesn't exist yet). If your data folder already exists, run it manually instead:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock enter mysql
mysql -uroot -proot < /docker-entrypoint-initdb.d/createdb.sql
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose exec mysql bash
mysql -uroot -proot < /docker-entrypoint-initdb.d/createdb.sql
```

</TabItem>
</Tabs>

## Backup and restore

**Export (back up) a database** to a `.sql` file on your host:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock exec -T mysql mysqldump -uroot -proot default > backup.sql
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose exec -T mysql mysqldump -uroot -proot default > backup.sql
```

</TabItem>
</Tabs>

Replace `default` with your database name (`MYSQL_DATABASE`). The `-T` disables the container's pseudo-terminal so the dump isn't corrupted when redirected to a file, always include it when piping output to or from a file.

**Restore (import) a database** from a `.sql` file:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock exec -T mysql mysql -uroot -proot default < backup.sql
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose exec -T mysql mysql -uroot -proot default < backup.sql
```

</TabItem>
</Tabs>

Unlike the `createdb.sql` first-boot init file above, this works anytime, the target database (`default` here) just has to already exist. This is also how you bring in a dump from a client's production site or your previous local MySQL install.

## Start completely fresh (wipe all data)

To throw away everything and start MySQL from a clean, empty state (⚠️ this **permanently deletes** every database in this container, back up first if you need anything):

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock stop mysql
./laradock remove mysql
rm -rf "${DATA_PATH_HOST:-~/.laradock/data}/mysql"
./laradock start mysql
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose stop mysql
docker compose rm -sf mysql
rm -rf "${DATA_PATH_HOST:-~/.laradock/data}/mysql"
docker compose up -d mysql
```

</TabItem>
</Tabs>

`DATA_PATH_HOST` is whatever you have set in `.env` (`~/.laradock/data` by default), so the folder above is where MySQL's data actually lives on your machine. Deleting it and starting again re-runs first-boot initialization: `MYSQL_DATABASE`, `MYSQL_USER`, `MYSQL_PASSWORD`, and any `docker-entrypoint-initdb.d` scripts all apply fresh, exactly like a brand-new install.

## Character set, collation, and timezone

Two common mismatches to fix in `mysql/my.cnf`:

```conf
[mysqld]
character-set-server = utf8mb4
collation-server = utf8mb4_unicode_ci
default-time-zone = "+00:00"
```

- **`utf8mb4`** (not plain `utf8`) is what you need for full emoji/multi-byte Unicode support, common with WordPress and user-generated content.
- **`default-time-zone`** controls what `NOW()`/`CURRENT_TIMESTAMP` return inside MySQL; set it to match your app (`WORKSPACE_TIMEZONE` in `.env` controls the *container's* OS timezone, this is MySQL's own separate setting).

Restart after editing (`./laradock restart mysql`). This only affects **new** databases/tables; existing ones keep their original charset unless you `ALTER` them.

## Talk to this database from another Laradock project

Each Laradock project is its own isolated Docker network by default, so a second project's containers can't reach this MySQL by container name out of the box. Easiest fix: publish the port (already done, `MYSQL_PORT`) and have the other project connect to your **host machine's** address instead of `mysql`, for example `DB_HOST=host.docker.internal` (Docker Desktop) with `DB_PORT` set to this project's `MYSQL_PORT`. Make sure the two projects use different `MYSQL_PORT` values if they're both running at once.

## Change the MySQL port

**Container-internal port** (what MySQL listens on inside the container): set in `mysql/my.cnf`.

```conf
[mysqld]
port=1234
```

If you also need to reach it from your host on that port, update the mapping in `mysql/compose.yml` (`"3306:3306"` → `"3306:1234"`).

**Host-side port** (what you connect to from your machine, container-internal port unchanged): set `MYSQL_PORT` in `.env`, then restart:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock restart mysql
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose restart mysql
```

</TabItem>
</Tabs>

## Connect from your host machine

Inside Laradock, other containers reach MySQL by container name: `DB_HOST=mysql`. From your own machine (a GUI client like TablePlus, DBeaver, or Sequel Ace), connect to `localhost` on `MYSQL_PORT` (`3306` by default) with the credentials above.

## Common issues

- **"Access denied" right after first boot.** The container needs a few seconds to initialize on a truly fresh `DATA_PATH_HOST`. Run `./laradock logs mysql` and wait for `ready for connections` before connecting.
- **Credential/database changes don't take effect.** `MYSQL_DATABASE`, `MYSQL_USER`, and `MYSQL_PASSWORD` are only applied when the data folder is created for the first time. If you change them afterward, either [start completely fresh](#start-completely-fresh-wipe-all-data) (data loss, back up first) or create the new user/database manually after `./laradock enter mysql`.
- **Two Laradock projects overwrite each other's data.** Running more than one Laradock on the same machine? Set both `COMPOSE_PROJECT_NAME` and `DATA_PATH_HOST` to unique values per project, otherwise they share the same MySQL data on disk.
- **Port already in use on your host.** Another local MySQL (or another Laradock project) is already bound to `3306`. Change `MYSQL_PORT` in `.env` and restart: `./laradock restart mysql`.
- **App can't connect but the container is running.** Confirm the app's `.env` uses `DB_HOST=mysql` (the container name), not `localhost` or `127.0.0.1`, those only work from your host machine, not from inside another container.

---

Prefer a GUI over the command line? See **[phpMyAdmin](https://laradock.io/docs/services/phpmyadmin)** or **[Adminer](https://laradock.io/docs/services/adminer)**. Need Postgres or MongoDB instead? See the full **[Databases guide](https://laradock.io/docs/Intro#supported-services)**.
