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

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

## What is Adminer?

[Adminer](https://www.adminer.org) is a single-file database admin GUI that supports MySQL, MariaDB, PostgreSQL, SQLite, and more from one login screen, a lighter alternative to running a dedicated GUI per database engine. There's nothing to "install", Laradock builds it as its own container and you just log in with credentials for whichever database you're already running.

## Start Adminer

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock start adminer
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose up -d adminer
```

</TabItem>
</Tabs>

Adminer itself holds no database data, it's just the GUI. Start whatever database it should connect to alongside it, for example `./laradock start adminer mysql`.

## Stop Adminer

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock stop adminer
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose stop adminer
```

</TabItem>
</Tabs>

To delete the container entirely (nothing important is lost, Adminer has no data of its own beyond the login session, see [Persist login sessions](#persist-login-sessions-across-restarts) below):

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock remove adminer
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose rm -sf adminer
```

</TabItem>
</Tabs>

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

Open [http://localhost:8081](http://localhost:8081). Pick the system (MySQL, PostgreSQL, SQLite, ...), enter the server (container name, e.g. `mysql` or `postgres`), and the matching credentials. Adminer is attached to the same Docker network as every other Laradock service, so any running database container is reachable by its service name.

## Add SQL Server support

1. In `.env`, set `ADM_INSTALL_MSSQL=true`.
2. Rebuild:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock rebuild adminer
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose build adminer
```

</TabItem>
</Tabs>

## Load plugins

1. Set `ADM_PLUGINS` in `.env` to the plugin names you want, space-separated.
2. Some plugins need extra parameters and a custom file inside the container, see Adminer's [Loading plugins](https://hub.docker.com/_/adminer) instructions.
3. Recreate the container so the new environment value is picked up:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock start adminer
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose up -d adminer
```

</TabItem>
</Tabs>

## Pre-fill the login screen

Typing the same server name on every login gets old fast. Set `ADM_DEFAULT_SERVER` in `.env` to the container name you connect to most (`mysql`, `postgres`, `mariadb`, ...), then recreate the container the same way as [Load plugins](#load-plugins) above. The login form's "Server" field now comes pre-filled, you still choose the system and enter credentials yourself.

## Persist login sessions across restarts

Adminer's image declares `/sessions` as a volume for its "permanent login" feature, but Laradock doesn't mount it to your host by default, so any remembered session is lost when the container is removed or rebuilt. If you rely on staying logged in, add a bind mount to `adminer/compose.yml`:

```yaml
services:
  adminer:
    volumes:
      - ${DATA_PATH_HOST}/adminer:/sessions
```

Then recreate the container:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock start adminer
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose up -d adminer
```

</TabItem>
</Tabs>

## Common issues

- **SQL Server option missing.** `ADM_INSTALL_MSSQL` is a build-time flag, changing it requires a rebuild (`./laradock rebuild adminer`), not just a restart.
- **Login rejected.** Adminer connects with whatever credentials you type in on the login form, it doesn't read `PMA_*`-style env vars for the target database. Use the same `MYSQL_USER`/`MYSQL_PASSWORD` (or the equivalent for your database) you'd use anywhere else.
- **Can't reach a database by container name.** Use the Docker Compose service name (`mysql`, `postgres`, `mariadb`, ...) as the server, not `localhost`, that only works from your host machine.
- **Stayed logged in, then suddenly logged out.** Login sessions live in the container's `/sessions` folder, which isn't persisted by default, see [Persist login sessions](#persist-login-sessions-across-restarts) above. Removing or rebuilding the container always logs you out unless you've mounted that folder.
- **Port already in use on your host.** Change `ADM_PORT` in `.env` and restart with `./laradock restart adminer`.

---

Prefer a MySQL-focused GUI instead? See **[phpMyAdmin](/docs/services/phpmyadmin)**. Back to the **[Getting Started guide](/docs/getting-started)**.
