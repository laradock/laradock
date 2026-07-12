# ClickHouse

Source: https://laradock.io/docs/services/clickhouse

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

## What is ClickHouse?

[ClickHouse](https://clickhouse.com) is a column-oriented database built for fast analytical (OLAP) queries over very large datasets, the kind of workload row-oriented databases like MySQL or Postgres struggle with. Laradock builds it from the official ClickHouse Debian packages on top of Ubuntu, with an HTTP interface, a native TCP interface, and its own config and users files pre-wired.

## Start ClickHouse

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock start clickhouse
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose up -d clickhouse
```

</TabItem>
</Tabs>

The `clickhouse` service links to the `workspace` container, so it's reachable from there by container name once both are up. Your data is created on first start and kept between restarts. Name any other services alongside it to start them together, for example `./laradock start clickhouse workspace`.

## Stop ClickHouse

Stopping just pauses the container; **your data is safe**, it lives under `DATA_PATH_HOST/clickhouse`:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock stop clickhouse
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose stop clickhouse
```

</TabItem>
</Tabs>

To delete the container entirely (the data on disk is still untouched):

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock remove clickhouse
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose rm -sf clickhouse
```

</TabItem>
</Tabs>

## Configuration

All settings live in `clickhouse/defaults.env` and can be overridden by adding the same line to your own `.env`:

| Variable | Default | What it does |
|---|---|---|
| `CLICKHOUSE_VERSION` | `25.8.2.29` | Version of the `clickhouse-server`/`clickhouse-client` packages installed at build time. |
| `CLICKHOUSE_GOSU_VERSION` | `1.17` | Version of [gosu](https://github.com/tianon/gosu) used by the entrypoint to drop root privileges. |
| `CLICKHOUSE_USER` | `default` | Database user created on boot. |
| `CLICKHOUSE_PASSWORD` | `HAHA` | Password for `CLICKHOUSE_USER`. Change this before using anything beyond local dev. |
| `CLICKHOUSE_HTTP_PORT` | `8123` | Host-side port for the HTTP interface (container port `8123`). |
| `CLICKHOUSE_CLIENT_PORT` | `9000` | Host-side port for the native TCP protocol used by `clickhouse-client` (container port `9000`). |
| `CLICKHOUSE_NATIVE_PORT` | `9009` | Host-side port for the interserver replication port (container port `9009`). |
| `CLICKHOUSE_CUSTOM_CONFIG` | `./clickhouse/config.xml` | Server config file mounted into the container. |
| `CLICKHOUSE_USERS_CUSTOM_CONFIG` | `./clickhouse/users.xml` | Users/roles config file mounted into the container. |
| `CLICKHOUSE_ENTRYPOINT_INITDB` | `./clickhouse/docker-entrypoint-initdb.d` | Folder of scripts auto-run on container start. |
| `CLICKHOUSE_HOST_LOG_PATH` | `./logs/clickhouse` | Host folder ClickHouse writes its logs to. |

## Connect with clickhouse-client

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock enter clickhouse
clickhouse-client --user default --password HAHA
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose exec clickhouse clickhouse-client --user default --password HAHA
```

</TabItem>
</Tabs>

Or from the `workspace` container, reach it by service name: `clickhouse-client --host clickhouse --user default --password HAHA`.

## Connect over HTTP

```bash
curl "http://localhost:8123/?user=default&password=HAHA" -d "SELECT 1"
```

The HTTP interface also exposes a lightweight health check at `/ping`.

## Change the ClickHouse version

Set the version in your `.env`:

```env
CLICKHOUSE_VERSION=24.8.4.13
```

Then apply the change:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock rebuild clickhouse
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose build clickhouse
```

</TabItem>
</Tabs>

Because `CLICKHOUSE_VERSION` is a build argument (baked into the image at build time, not read at container start), a version change always needs a rebuild, not just a restart.

## Run scripts on container start

Anything placed in `clickhouse/docker-entrypoint-initdb.d/` (`CLICKHOUSE_ENTRYPOINT_INITDB`) runs automatically: `.sh` files are executed (or sourced), `.sql` and `.sql.gz` files are piped into `clickhouse-client`. Unlike MySQL's init folder, ClickHouse's entrypoint re-runs everything in this folder **on every container start**, not just the first one, so keep the SQL in there idempotent (`CREATE TABLE IF NOT EXISTS`, `CREATE DATABASE IF NOT EXISTS`) or you'll get errors on the second boot.

## Backup and restore

ClickHouse ships without a database-wide dump tool like `mysqldump`, so back up per table using the native format, which round-trips cleanly through `clickhouse-client`.

**Export (back up) a table** to a file on your host:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock exec -T clickhouse clickhouse-client --user default --password HAHA --query "SELECT * FROM default.your_table FORMAT Native" > your_table.native
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose exec -T clickhouse clickhouse-client --user default --password HAHA --query "SELECT * FROM default.your_table FORMAT Native" > your_table.native
```

</TabItem>
</Tabs>

Replace `default.your_table` with your database and table name. The `-T` disables the container's pseudo-terminal so the binary dump isn't corrupted when redirected to a file, always include it when piping output to or from a file.

**Restore (import) a table** from a `.native` file (the target table must already exist with a matching schema):

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock exec -T clickhouse clickhouse-client --user default --password HAHA --query "INSERT INTO default.your_table FORMAT Native" < your_table.native
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose exec -T clickhouse clickhouse-client --user default --password HAHA --query "INSERT INTO default.your_table FORMAT Native" < your_table.native
```

</TabItem>
</Tabs>

For a whole database, repeat the export/import per table (`SHOW TABLES FROM default` lists what to loop over), or query with `--query "SELECT * FROM default.your_table" --format Native` piped through a small shell loop.

## Start completely fresh (wipe all data)

To throw away everything and start ClickHouse from a clean, empty state (⚠️ this **permanently deletes** every database and table in this container, back up first if you need anything):

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock stop clickhouse
./laradock remove clickhouse
rm -rf "${DATA_PATH_HOST:-~/.laradock/data}/clickhouse"
./laradock start clickhouse
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose stop clickhouse
docker compose rm -sf clickhouse
rm -rf "${DATA_PATH_HOST:-~/.laradock/data}/clickhouse"
docker compose up -d clickhouse
```

</TabItem>
</Tabs>

`DATA_PATH_HOST` is whatever you have set in `.env` (`~/.laradock/data` by default), so the folder above is where ClickHouse's data actually lives on your machine. Deleting it and starting again re-runs everything in `docker-entrypoint-initdb.d/`, exactly like a brand-new install.

## Change resource limits

The container requests high `ulimits` (`nproc: 65535`, `nofile: 262144`), ClickHouse itself recommends this for production-grade workloads. If Docker on your host caps these lower, you'll see startup warnings in `./laradock logs clickhouse`; raise the limits in Docker Desktop's resource settings or your Docker daemon config.

## Talk to this database from another Laradock project

Each Laradock project is its own isolated Docker network by default, so a second project's containers can't reach this ClickHouse by container name out of the box. Easiest fix: the ports are already published (`CLICKHOUSE_HTTP_PORT`, `CLICKHOUSE_CLIENT_PORT`), so have the other project connect to your **host machine's** address instead of `clickhouse`, for example `--host host.docker.internal` (Docker Desktop) with the port set to this project's `CLICKHOUSE_CLIENT_PORT` or `CLICKHOUSE_HTTP_PORT`. Make sure the two projects use different port values if they're both running at once.

## Common issues

- **Default password is `HAHA`.** It's genuinely the shipped default in `clickhouse/defaults.env`, set your own `CLICKHOUSE_PASSWORD` in `.env` before using this for anything beyond local dev.
- **Config changes don't take effect.** `clickhouse/config.xml` and `clickhouse/users.xml` are bind-mounted, edits apply on container restart (`./laradock restart clickhouse`); no rebuild needed. Changing `CLICKHOUSE_VERSION` does require a rebuild: `./laradock rebuild clickhouse`.
- **Client can't connect from another container.** Use the service name `clickhouse` as the host, not `localhost`, and the container-internal ports (`9000` native, `8123` HTTP), not the host-mapped ones.
- **Logs directory missing on host.** `CLICKHOUSE_HOST_LOG_PATH` (`./logs/clickhouse` by default) needs to exist for the bind mount to work; create it if Docker complains on startup.
- **Init script fails on the second boot.** Scripts in `docker-entrypoint-initdb.d/` run on every container start, not just the first, so non-idempotent SQL (a plain `CREATE TABLE` without `IF NOT EXISTS`) errors out after the first successful run.

---

Need a search engine instead? See **[Manticore](https://laradock.io/docs/services/manticore)**. Back to the **[Getting Started guide](https://laradock.io/docs/getting-started)**.
