---
slug: /services/mysql
title: MySQL
description: Run MySQL in Laradock. Start and stop the container, configure version/port/credentials, create multiple databases, connect from your host, and fix common issues.
keywords:
  - laradock mysql
  - mysql docker
  - mysql docker compose
  - change mysql version docker
  - mysql root access docker
  - create multiple mysql databases docker
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

## What is MySQL?

[MySQL](https://www.mysql.com) is the world's most widely used open-source relational database, the default choice for most PHP apps (Laravel, WordPress, and most of the frameworks and CMSs Laradock supports ship with MySQL out of the box). Laradock runs it as its own container, pre-wired with sane defaults, so you never install MySQL on your host machine.

:::tip Two ways to run everything
Each command below has a **Laradock CLI (Easy)** tab (plain English, recommended) and a **Docker Compose (Advanced)** tab (the raw command it runs under the hood). Pick a tab once and the whole page follows it. New here? Stay on the CLI.
:::

## Start MySQL

Normally you start MySQL **alongside your site**, not on its own. With the CLI, `php-fpm` and the `workspace` are added for you automatically:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI (Easy)">

```bash
./laradock start nginx mysql
```

</TabItem>
<TabItem value="docker" label="Docker Compose (Advanced)">

```bash
docker compose up -d nginx mysql php-fpm workspace
```

</TabItem>
</Tabs>

To start just MySQL by itself:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI (Easy)">

```bash
./laradock start mysql
```

</TabItem>
<TabItem value="docker" label="Docker Compose (Advanced)">

```bash
docker compose up -d mysql
```

</TabItem>
</Tabs>

Your data is created on first start and kept between restarts.

## Stop MySQL

Stopping just pauses the container; **your data is safe**:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI (Easy)">

```bash
./laradock stop mysql
```

</TabItem>
<TabItem value="docker" label="Docker Compose (Advanced)">

```bash
docker compose stop mysql
```

</TabItem>
</Tabs>

To delete the container entirely (the data on disk is still untouched, it lives under `DATA_PATH_HOST`):

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI (Easy)">

```bash
./laradock remove mysql
```

</TabItem>
<TabItem value="docker" label="Docker Compose (Advanced)">

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

## Change the MySQL version

Set the version in your `.env`:

```env
MYSQL_VERSION=8.0
```

Then apply the change:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI (Easy)">

```bash
./laradock rebuild mysql
```

</TabItem>
<TabItem value="docker" label="Docker Compose (Advanced)">

```bash
docker compose build mysql
```

</TabItem>
</Tabs>

Changing the **major** version against an existing data folder can break startup (MySQL doesn't downgrade/cross-upgrade data files cleanly). If you hit that, point `DATA_PATH_HOST` at a fresh folder or back up and drop the old one.

## Root access

Default root credentials are `root` / `root` (`MYSQL_ROOT_PASSWORD`). Open a terminal inside the MySQL container, then start the MySQL prompt:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI (Easy)">

```bash
./laradock enter mysql
mysql -uroot -proot
```

</TabItem>
<TabItem value="docker" label="Docker Compose (Advanced)">

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
<TabItem value="cli" label="Laradock CLI (Easy)">

```bash
./laradock enter mysql
mysql -uroot -proot < /docker-entrypoint-initdb.d/createdb.sql
```

</TabItem>
<TabItem value="docker" label="Docker Compose (Advanced)">

```bash
docker compose exec mysql bash
mysql -uroot -proot < /docker-entrypoint-initdb.d/createdb.sql
```

</TabItem>
</Tabs>

## Change the MySQL port

**Container-internal port** (what MySQL listens on inside the container): set in `mysql/my.cnf`.

```conf
[mysqld]
port=1234
```

If you also need to reach it from your host on that port, update the mapping in `mysql/compose.yml` (`"3306:3306"` → `"3306:1234"`).

**Host-side port** (what you connect to from your machine, container-internal port unchanged): set `MYSQL_PORT` in `.env`, then restart:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI (Easy)">

```bash
./laradock restart mysql
```

</TabItem>
<TabItem value="docker" label="Docker Compose (Advanced)">

```bash
docker compose restart mysql
```

</TabItem>
</Tabs>

## Connect from your host machine

Inside Laradock, other containers reach MySQL by container name: `DB_HOST=mysql`. From your own machine (a GUI client like TablePlus, DBeaver, or Sequel Ace), connect to `localhost` on `MYSQL_PORT` (`3306` by default) with the credentials above.

## Common issues

- **"Access denied" right after first boot.** The container needs a few seconds to initialize on a truly fresh `DATA_PATH_HOST`. Run `./laradock logs mysql` and wait for `ready for connections` before connecting.
- **Credential/database changes don't take effect.** `MYSQL_DATABASE`, `MYSQL_USER`, and `MYSQL_PASSWORD` are only applied when the data folder is created for the first time. If you change them afterward, either drop `DATA_PATH_HOST/mysql` (data loss) or create the new user/database manually after `./laradock enter mysql`.
- **Two Laradock projects overwrite each other's data.** Running more than one Laradock on the same machine? Set both `COMPOSE_PROJECT_NAME` and `DATA_PATH_HOST` to unique values per project, otherwise they share the same MySQL data on disk.
- **Port already in use on your host.** Another local MySQL (or another Laradock project) is already bound to `3306`. Change `MYSQL_PORT` in `.env` and restart: `./laradock restart mysql`.
- **App can't connect but the container is running.** Confirm the app's `.env` uses `DB_HOST=mysql` (the container name), not `localhost` or `127.0.0.1`, those only work from your host machine, not from inside another container.

---

Prefer a GUI over the command line? See **[phpMyAdmin](/docs/services/phpmyadmin)** or **[Adminer](/docs/services/adminer)**. Need Postgres or MongoDB instead? See the full **[Databases guide](/docs/Intro#supported-services)**.
