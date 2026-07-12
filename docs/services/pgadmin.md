# pgAdmin

Source: https://laradock.io/docs/services/pgadmin

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

## What is pgAdmin?

[pgAdmin](https://www.pgadmin.org) is the standard web-based admin GUI for PostgreSQL, browse schemas, run queries, manage roles, and inspect query plans. There's nothing to "install", Laradock runs it straight from the official `dpage/pgadmin4` image and points it at your `postgres` container.

## Start pgAdmin

pgAdmin is useless without a Postgres server to point at, so start both together:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock start postgres pgadmin
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose up -d postgres pgadmin
```

</TabItem>
</Tabs>

`pgadmin` depends on `postgres` in `pgadmin/compose.yml`, so Compose starts `postgres` first automatically even if you just start `pgadmin` on its own.

## Stop pgAdmin

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock stop pgadmin
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose stop pgadmin
```

</TabItem>
</Tabs>

This stops the container without deleting its saved server list. Data lives under `DATA_PATH_HOST/pgadmin`.

To delete the container entirely (the data on disk is still untouched):

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock remove pgadmin
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose rm -sf pgadmin
```

</TabItem>
</Tabs>

## Configuration

All settings live in `pgadmin/defaults.env` and can be overridden by adding the same line to your own `.env`:

| Variable | Default | What it does |
|---|---|---|
| `PGADMIN_PORT` | `5050` | Host-side port for the web UI (container port `80`). |
| `PGADMIN_DEFAULT_EMAIL` | `pgadmin4@pgadmin.org` | Login email for the pgAdmin app itself (not a Postgres credential). |
| `PGADMIN_DEFAULT_PASSWORD` | `admin` | Login password for the pgAdmin app itself. |

## Log in

Open [http://localhost:5050](http://localhost:5050) and sign in with `PGADMIN_DEFAULT_EMAIL` / `PGADMIN_DEFAULT_PASSWORD` (`pgadmin4@pgadmin.org` / `admin` by default).

## Connect to your Postgres server

Once logged in, add a new server in pgAdmin's UI:
- **Host**: `postgres` (the container name)
- **Port**: `5432` (container-internal port)
- **Username/Password**: your `POSTGRES_USER`/`POSTGRES_PASSWORD` (`default`/`secret` by default)

pgAdmin remembers this server definition in its own storage (`DATA_PATH_HOST/pgadmin`), so you only need to add it once, it's still there next time you log in.

## Reset pgAdmin (forget saved servers and login)

To wipe pgAdmin's own storage, saved server list, app login, preferences, without touching your actual Postgres data:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock stop pgadmin
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose stop pgadmin
```

</TabItem>
</Tabs>

```bash
rm -rf "${DATA_PATH_HOST:-~/.laradock/data}/pgadmin"
```

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock start pgadmin
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose up -d pgadmin
```

</TabItem>
</Tabs>

The next start re-applies `PGADMIN_DEFAULT_EMAIL`/`PGADMIN_DEFAULT_PASSWORD` as if it were a brand-new install, and you'll need to re-add your Postgres server connection. Your actual databases (in the `postgres` container's own `DATA_PATH_HOST/postgres` volume) are completely unaffected.

## Common issues

- **pgAdmin login and Postgres login are different things.** `PGADMIN_DEFAULT_EMAIL`/`PGADMIN_DEFAULT_PASSWORD` only get you into the pgAdmin app itself, you still add and authenticate against your actual Postgres server separately inside the UI.
- **Credential changes don't take effect.** `PGADMIN_DEFAULT_EMAIL`/`PGADMIN_DEFAULT_PASSWORD` are only applied when `DATA_PATH_HOST/pgadmin` is created for the first time. If you change them afterward, either [reset pgAdmin](#reset-pgadmin-forget-saved-servers-and-login) (loses saved servers/settings, Postgres data is untouched) or change the user from inside pgAdmin's own user management.
- **Can't reach Postgres by container name.** Use `postgres` as the host inside pgAdmin's server dialog, not `localhost`, that only works from your host machine, not from inside another container.
- **Port already in use on your host.** Change `PGADMIN_PORT` in `.env` and restart: `./laradock restart pgadmin`.
- **"Unable to connect to server" right after first boot.** Postgres needs a few seconds to initialize on a truly fresh `DATA_PATH_HOST`. Run `./laradock logs postgres` and wait for `database system is ready to accept connections` before adding the server in pgAdmin.

---

Need a MySQL/MariaDB GUI instead? See **[phpMyAdmin](https://laradock.io/docs/services/phpmyadmin)**. Back to the **[Getting Started guide](https://laradock.io/docs/getting-started)**.
