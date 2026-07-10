---
slug: /services/mssql
title: SQL Server (MSSQL)
description: Run Microsoft SQL Server in Laradock. Start and stop the container, configure the SA password/port, back up and restore, wipe data, and connect from your host.
keywords:
  - laradock mssql
  - sql server docker
  - mssql docker compose
  - microsoft sql server docker
  - sqlcmd docker
  - sql server express docker
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

## What is SQL Server?

[Microsoft SQL Server](https://www.microsoft.com/sql-server) is Microsoft's relational database engine. Laradock runs the Linux-based [`mssql/server` image](https://hub.docker.com/_/microsoft-mssql-server) on the free Express edition, useful when your app needs to talk to SQL Server specifically (legacy systems, enterprise integrations, `sqlsrv`/`pdo_sqlsrv` PHP drivers).

## Start SQL Server

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock start mssql
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose up -d mssql
```

</TabItem>
</Tabs>

It runs as its own container with no `depends_on` in `compose.yml`. Name any other services alongside it to start them together, for example `./laradock start mssql redis`.

## Stop SQL Server

Stopping just pauses the container; **your data is safe**:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock stop mssql
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose stop mssql
```

</TabItem>
</Tabs>

To delete the container entirely (the data is still untouched, it lives in the named Docker volume `mssql`, not `DATA_PATH_HOST` like most other Laradock databases):

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock remove mssql
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose rm -sf mssql
```

</TabItem>
</Tabs>

## Configuration

All settings live in `mssql/defaults.env` and can be overridden by adding the same line to your own `.env` (your `.env` always wins):

| Variable | Default | What it does |
|---|---|---|
| `MSSQL_DATABASE` | `master` | Database name passed to the container. |
| `MSSQL_PASSWORD` | `"yourStrong(!)Password"` | Password for the `sa` (system administrator) login (mapped to `SA_PASSWORD`). Change this, it's a well-known default. |
| `MSSQL_PORT` | `1433` | Host-side port SQL Server is published on (`host:container`). |

`compose.yml` also hardcodes `MSSQL_PID=Express` (the free Express edition) and `ACCEPT_EULA=Y`, meaning **by using this container you're accepting Microsoft's SQL Server EULA** on your behalf; review the [SQL Server licensing terms](https://www.microsoft.com/en-us/sql-server/sql-server-2022-pricing) if that matters for your use case.

## Connect with sqlcmd

Open a terminal inside the container, then start `sqlcmd`:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock enter mssql
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose exec mssql bash
```

</TabItem>
</Tabs>

```bash
/opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P 'yourStrong(!)Password'
```

Use your own `MSSQL_PASSWORD` if you changed it. `/opt/mssql-tools` may live at a different path depending on the image version, check with `find / -iname sqlcmd` inside the container if the above path doesn't exist.

## Connect from your host machine

Inside Laradock, other containers reach SQL Server by container name: `DB_HOST=mssql`. From your own machine (Azure Data Studio, DBeaver, TablePlus), connect to `localhost` on `MSSQL_PORT` (`1433` by default) with user `sa` and `MSSQL_PASSWORD`.

## Backup and restore

Because SQL Server's data lives in a named Docker volume rather than a `DATA_PATH_HOST` bind mount, backups go through `sqlcmd`'s own `BACKUP`/`RESTORE` commands plus `docker compose cp` to move the file to and from your host.

**Back up** the database to a `.bak` file inside the container, then copy it out:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock exec mssql /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P 'yourStrong(!)Password' -Q "BACKUP DATABASE [master] TO DISK = N'/var/opt/mssql/data/backup.bak'"
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose exec mssql /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P 'yourStrong(!)Password' -Q "BACKUP DATABASE [master] TO DISK = N'/var/opt/mssql/data/backup.bak'"
```

</TabItem>
</Tabs>

```bash
docker compose cp mssql:/var/opt/mssql/data/backup.bak ./backup.bak
```

Replace `master` with your database name (`MSSQL_DATABASE`). `docker compose cp` works regardless of which tab you use above, it isn't a per-service command.

**Restore** a `.bak` file: copy it into the container, then run `RESTORE DATABASE`:

```bash
docker compose cp ./backup.bak mssql:/var/opt/mssql/data/backup.bak
```

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock exec mssql /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P 'yourStrong(!)Password' -Q "RESTORE DATABASE [master] FROM DISK = N'/var/opt/mssql/data/backup.bak' WITH REPLACE"
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose exec mssql /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P 'yourStrong(!)Password' -Q "RESTORE DATABASE [master] FROM DISK = N'/var/opt/mssql/data/backup.bak' WITH REPLACE"
```

</TabItem>
</Tabs>

`WITH REPLACE` overwrites the existing database of that name, drop it if you're restoring into a database that doesn't exist yet.

## Start completely fresh (wipe all data)

To throw away everything and start SQL Server from a clean, empty state (⚠️ this **permanently deletes** every database in this container, back up first if you need anything):

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock stop mssql
./laradock remove mssql
docker volume rm ${COMPOSE_PROJECT_NAME:-laradock}_mssql
./laradock start mssql
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose stop mssql
docker compose rm -sf mssql
docker volume rm ${COMPOSE_PROJECT_NAME:-laradock}_mssql
docker compose up -d mssql
```

</TabItem>
</Tabs>

Docker Compose names the volume `<project>_mssql` by default, `COMPOSE_PROJECT_NAME` is whatever you have set in `.env`. Run `docker volume ls | grep mssql` first if you're not sure of the exact name. Deleting the volume and starting again re-runs first-boot initialization, exactly like a brand-new install.

## Talk to this database from another Laradock project

Each Laradock project is its own isolated Docker network by default, so a second project's containers can't reach this SQL Server by container name out of the box. Easiest fix: publish the port (already done, `MSSQL_PORT`) and have the other project connect to your **host machine's** address instead of `mssql`, for example `DB_HOST=host.docker.internal` (Docker Desktop) with `DB_PORT` set to this project's `MSSQL_PORT`. Make sure the two projects use different `MSSQL_PORT` values if they're both running at once.

## Common issues

- **Container exits immediately after start.** SQL Server enforces a strong-password policy; if you set `MSSQL_PASSWORD` to something too simple it will refuse to start. Check `./laradock logs mssql` for the exact complaint.
- **Weak default password.** `yourStrong(!)Password` is a well-known default from Microsoft's own examples, change `MSSQL_PASSWORD` before using this anywhere beyond a throwaway local environment.
- **Data doesn't reset when you expect it to.** Unlike MySQL/Postgres/MariaDB in Laradock, SQL Server's data lives in the named volume `mssql`, not under `DATA_PATH_HOST`. See [Start completely fresh](#start-completely-fresh-wipe-all-data) above to wipe it.
- **App can't connect but the container is running.** Confirm the app's config uses `mssql` (the container name), not `localhost`, which only works from your host machine.
- **Port already in use on your host.** Another local SQL Server (or another Laradock project) is already bound to `1433`. Change `MSSQL_PORT` in `.env` and restart: `./laradock restart mssql`.

---

Need a MySQL-compatible database instead? See **[MySQL](/docs/services/mysql)**. For the full list of services, see **[Getting Started](/docs/getting-started)**.
