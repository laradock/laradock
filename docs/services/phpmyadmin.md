# phpMyAdmin

Source: https://laradock.io/docs/services/phpmyadmin

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

## What is phpMyAdmin?

[phpMyAdmin](https://www.phpmyadmin.net) is a web-based admin GUI for MySQL and MariaDB, browse tables, run queries, manage users, and import/export data without touching a command line. There's nothing to "install", Laradock builds it as its own container from the official `phpmyadmin` image and points it at whichever database container you're already running.

## Start phpMyAdmin

phpMyAdmin is useless on its own, it needs a database to point at. Start it alongside the engine set in `PMA_DB_ENGINE` (`mysql` by default):

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock start mysql phpmyadmin
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose up -d mysql phpmyadmin
```

</TabItem>
</Tabs>

With MariaDB instead:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock start mariadb phpmyadmin
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose up -d mariadb phpmyadmin
```

</TabItem>
</Tabs>

## Stop phpMyAdmin

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock stop phpmyadmin
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose stop phpmyadmin
```

</TabItem>
</Tabs>

phpMyAdmin itself keeps no data of its own (your actual data lives in the database container it manages), so there's nothing to back up here. To delete the container entirely:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock remove phpmyadmin
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose rm -sf phpmyadmin
```

</TabItem>
</Tabs>

## Configuration

All settings live in `phpmyadmin/defaults.env` and can be overridden by adding the same line to your own `.env`:

| Variable | Default | What it does |
|---|---|---|
| `PMA_DB_ENGINE` | `mysql` | Which service phpMyAdmin `depends_on` and connects to by default: `mysql` or `mariadb`. |
| `PMA_USER` | `default` | Username phpMyAdmin logs in with. |
| `PMA_PASSWORD` | `secret` | Password for `PMA_USER`. |
| `PMA_ROOT_PASSWORD` | `secret` | Root password passed through to the container. |
| `PMA_PORT` | `8081` | Host-side port for the web UI (container port `80`). |
| `PMA_MAX_EXECUTION_TIME` | `600` | PHP `max_execution_time`, in seconds, for long-running queries/imports. |
| `PMA_MEMORY_LIMIT` | `256M` | PHP `memory_limit` for the container. |
| `PMA_UPLOAD_LIMIT` | `2G` | Max upload size, for importing large SQL/CSV files. |

## Log in

Open [http://localhost:8081](http://localhost:8081) (or your own `PMA_PORT`). For the default MySQL setup, use server `mysql`, user `default`, password `secret` (or your own `PMA_USER`/`PMA_PASSWORD`).

## Connect to any server, not just the default one

Laradock builds phpMyAdmin with `PMA_ARBITRARY=1`, which unlocks the "Server" field on the login screen instead of locking you to `PMA_DB_ENGINE`. Type in any hostname reachable from the container and log in with that server's own credentials, useful for:

- Switching between `mysql` and `mariadb` without changing `.env`, as long as both containers are running.
- Pointing at a database in a different Laradock project on the same machine, for example `host.docker.internal` with that project's `MYSQL_PORT`.
- Pointing at any external MySQL/MariaDB server your Laradock host can reach.

## Switch to MariaDB by default

1. In `.env`, set `PMA_DB_ENGINE=mariadb`.
2. Start `mariadb` instead of `mysql`, see [Start phpMyAdmin](#start-phpmyadmin) above.
3. Log in with server `mariadb`.

## Update to the latest phpMyAdmin version

The image is built fresh from the official `phpmyadmin` image with no version pin, so Laradock always uses whatever tag Docker last pulled locally. To force a newer image and rebuild:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock rebuild phpmyadmin --pull
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose build --pull phpmyadmin
```

</TabItem>
</Tabs>

Then restart it: `./laradock restart phpmyadmin`.

## Common issues

- **"mysqli::real_connect(): (HY000/2002)" or similar connection error.** phpMyAdmin `depends_on: ${PMA_DB_ENGINE}`, meaning it starts alongside whichever engine `PMA_DB_ENGINE` names, but if that container isn't actually up (or you changed `PMA_DB_ENGINE` without restarting), the login form has nothing to connect to. Confirm the matching database container is running: `./laradock info`.
- **Login rejected.** Double-check `PMA_USER`/`PMA_PASSWORD` match the actual credentials on the target database (`MYSQL_USER`/`MYSQL_PASSWORD` or `MARIADB_USER`/`MARIADB_PASSWORD`), they're independent variables and can drift out of sync if you change one without the other.
- **Large import fails partway through.** Raise `PMA_UPLOAD_LIMIT` and `PMA_MAX_EXECUTION_TIME` in `.env`, then restart: `./laradock restart phpmyadmin`.
- **Port already in use on your host.** Change `PMA_PORT` in `.env` and restart: `./laradock restart phpmyadmin`.
- **Need to log into a server other than the default one.** See [Connect to any server, not just the default one](#connect-to-any-server-not-just-the-default-one) above, `PMA_ARBITRARY=1` is already on.

---

Prefer a lighter GUI, or need Postgres/SQLite too? See **[Adminer](https://laradock.io/docs/services/adminer)**. Back to the **[Getting Started guide](https://laradock.io/docs/getting-started)**.
