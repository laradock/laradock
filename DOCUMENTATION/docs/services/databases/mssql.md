---
slug: /services/mssql
title: SQL Server (MSSQL)
description: Run Microsoft SQL Server in Laradock. Start and stop the container, configure the SA password/port, and connect from your host.
keywords:
  - laradock mssql
  - sql server docker
  - mssql docker compose
  - microsoft sql server docker
  - sqlcmd docker
  - sql server express docker
---

## What is SQL Server?

[Microsoft SQL Server](https://www.microsoft.com/sql-server) is Microsoft's relational database engine. Laradock runs the Linux-based [`mssql/server` image](https://hub.docker.com/_/microsoft-mssql-server) on the free Express edition, useful when your app needs to talk to SQL Server specifically (legacy systems, enterprise integrations, `sqlsrv`/`pdo_sqlsrv` PHP drivers).

## Start SQL Server

```bash
docker compose up -d mssql
```

It runs as its own container with no `depends_on` in `compose.yml`.

## Stop SQL Server

```bash
docker compose stop mssql
```

This stops the container without deleting its data. Data persists in the named Docker volume `mssql` (SQL Server's own volume, not `DATA_PATH_HOST` like most other Laradock databases).

## Configuration

All settings live in `mssql/defaults.env`:

| Variable | Default | What it does |
|---|---|---|
| `MSSQL_DATABASE` | `master` | Database name passed to the container. |
| `MSSQL_PASSWORD` | `"yourStrong(!)Password"` | Password for the `sa` (system administrator) login (mapped to `SA_PASSWORD`). Change this, it's a well-known default. |
| `MSSQL_PORT` | `1433` | Host-side port SQL Server is published on (`host:container`). |

`compose.yml` also hardcodes `MSSQL_PID=Express` (the free Express edition) and `ACCEPT_EULA=Y`, meaning **by using this container you're accepting Microsoft's SQL Server EULA** on your behalf; review the [SQL Server licensing terms](https://www.microsoft.com/en-us/sql-server/sql-server-2022-pricing) if that matters for your use case.

## Connect with sqlcmd

```bash
docker compose exec mssql bash
/opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P 'yourStrong(!)Password'
```

Use your own `MSSQL_PASSWORD` if you changed it. `/opt/mssql-tools` may live at a different path depending on the image version, check with `find / -iname sqlcmd` inside the container if the above path doesn't exist.

## Connect from your host machine

Inside Laradock, other containers reach SQL Server by container name: `DB_HOST=mssql`. From your own machine (Azure Data Studio, DBeaver, TablePlus), connect to `localhost` on `MSSQL_PORT` (`1433` by default) with user `sa` and `MSSQL_PASSWORD`.

## Common issues

- **Container exits immediately after start.** SQL Server enforces a strong-password policy; if you set `MSSQL_PASSWORD` to something too simple it will refuse to start. Check `docker compose logs mssql` for the exact complaint.
- **Weak default password.** `yourStrong(!)Password` is a well-known default from Microsoft's own examples, change `MSSQL_PASSWORD` before using this anywhere beyond a throwaway local environment.
- **Data doesn't reset when you expect it to.** Unlike MySQL/Postgres/MariaDB in Laradock, SQL Server's data lives in the named volume `mssql`, not under `DATA_PATH_HOST`. To wipe it: `docker compose down -v` removes named volumes (this deletes all data, use with care) or `docker volume rm <project>_mssql`.
- **App can't connect but the container is running.** Confirm the app's config uses `mssql` (the container name), not `localhost`, which only works from your host machine.
- **Port already in use on your host.** Another local SQL Server (or another Laradock project) is already bound to `1433`. Change `MSSQL_PORT` in `.env` and restart.

---

Need a MySQL-compatible database instead? See **[MySQL](/docs/services/mysql)**. For the full list of services, see **[Getting Started](/docs/getting-started)**.
