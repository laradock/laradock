# SurrealDB

Source: https://laradock.io/docs/services/surrealdb

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

## What is SurrealDB?

[SurrealDB](https://surrealdb.com) is a multi-model database combining document, graph, and relational data behind a single SQL-like query language (SurrealQL), reachable over both REST and WebSocket. Laradock runs it from the official `surrealdb/surrealdb` image with a RocksDB storage backend.

## Start SurrealDB

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock start surrealdb
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose up -d surrealdb
```

</TabItem>
</Tabs>

Data is created on first start and kept between restarts. Name any other services alongside it to start them together, for example `./laradock start surrealdb redis`.

## Stop SurrealDB

Stopping just pauses the container; **your data is safe**:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock stop surrealdb
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose stop surrealdb
```

</TabItem>
</Tabs>

To delete the container entirely (the data is still safe, it lives in the named `surrealdb` Docker volume, not in the container):

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock remove surrealdb
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose rm -sf surrealdb
```

</TabItem>
</Tabs>

## Configuration

All settings live in `surrealdb/defaults.env` and can be overridden by adding the same line to your own `.env`:

| Variable | Default | What it does |
|---|---|---|
| `SURREALDB_VERSION` | `v2.6.5` | Image tag from [SurrealDB's Docker Hub image](https://hub.docker.com/r/surrealdb/surrealdb). |
| `SURREALDB_PORT` | `8010` | Host-side port for the REST/WebSocket API (container port `8000`). |
| `SURREALDB_USER` | `root` | Root user, passed to `surreal start --user`. |
| `SURREALDB_PASSWORD` | `secret` | Root password, passed to `surreal start --pass`. |

The container runs as `root` (set in `surrealdb/compose.yml`) so the server can create its RocksDB store inside the named volume, and starts with:

```
start --user ${SURREALDB_USER} --pass ${SURREALDB_PASSWORD} --bind 0.0.0.0:8000 rocksdb:/data/database.db
```

There's no `SURREALDB_NAMESPACE`/`SURREALDB_DATABASE` variable: unlike MySQL's `MYSQL_DATABASE`, SurrealDB doesn't pre-create a namespace or database for you. You choose both yourself, either with `USE NS your_ns DB your_db;` in a query session, or with `--ns`/`--db` flags on the CLI, they're created automatically the first time you use them.

## Change the SurrealDB version

Set the version in your `.env`:

```env
SURREALDB_VERSION=v2.7.0
```

Then apply the change (the image is pulled by tag, not built locally, so starting again is enough to pull and switch to it):

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock start surrealdb
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose up -d surrealdb
```

</TabItem>
</Tabs>

Moving to a new major version against an existing RocksDB store on disk isn't guaranteed safe. Back up first (see [Backup and restore](#backup-and-restore) below), and if startup fails after the version bump, [start completely fresh](#start-completely-fresh-wipe-all-data) and restore your export into the new version.

## Check it's up

```bash
curl http://localhost:8010/health
```

## Connect

Use the [SurrealDB CLI](https://surrealdb.com/docs/surrealdb/cli) or any SurrealDB client library against `http://localhost:8010` (from your host) or `http://surrealdb:8000` (from another container), authenticating with `SURREALDB_USER` / `SURREALDB_PASSWORD`.

## Run SurrealQL queries

Open a terminal inside the SurrealDB container, then start the SurrealQL shell against your own namespace/database (replace `test`/`test` with your own):

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock enter surrealdb
surreal sql --conn http://localhost:8000 --user root --pass secret --ns test --db test
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose exec surrealdb bash
surreal sql --conn http://localhost:8000 --user root --pass secret --ns test --db test
```

</TabItem>
</Tabs>

```sql
DEFINE TABLE person SCHEMALESS;
CREATE person SET name = "Laradock";
SELECT * FROM person;
```

## Backup and restore

**Export a namespace/database** to a `.surql` file on your host (replace `test`/`test` with your own namespace/database):

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock exec -T surrealdb surreal export --conn http://localhost:8000 --user root --pass secret --ns test --db test - > backup.surql
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose exec -T surrealdb surreal export --conn http://localhost:8000 --user root --pass secret --ns test --db test - > backup.surql
```

</TabItem>
</Tabs>

The `-T` disables the container's pseudo-terminal so the export isn't corrupted when redirected to a file, always include it when piping output to or from a file.

**Restore (import) a namespace/database** from a `.surql` file:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock exec -T surrealdb surreal import --conn http://localhost:8000 --user root --pass secret --ns test --db test - < backup.surql
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose exec -T surrealdb surreal import --conn http://localhost:8000 --user root --pass secret --ns test --db test - < backup.surql
```

</TabItem>
</Tabs>

This works anytime, the target namespace/database doesn't need to exist first, `surreal import` creates it. This is also how you bring in a `.surql` export from another environment.

## Start completely fresh (wipe all data)

To throw away everything and start SurrealDB from a clean, empty state (⚠️ this **permanently deletes** every namespace/database in this container, back up first if you need anything):

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock stop surrealdb
./laradock remove surrealdb
docker volume rm ${COMPOSE_PROJECT_NAME:-laradock}_surrealdb
./laradock start surrealdb
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose stop surrealdb
docker compose rm -sf surrealdb
docker volume rm ${COMPOSE_PROJECT_NAME:-laradock}_surrealdb
docker compose up -d surrealdb
```

</TabItem>
</Tabs>

Unlike MySQL and other services that store data under `DATA_PATH_HOST`, SurrealDB's RocksDB store lives in a named Docker volume, not a host folder. Confirm the exact volume name first with `docker volume ls | grep surrealdb` if you're unsure what `COMPOSE_PROJECT_NAME` resolves to (it's set in your `.env`).

## Talk to this database from another Laradock project

Each Laradock project is its own isolated Docker network by default, so a second project's containers can't reach this SurrealDB by container name out of the box. Easiest fix: publish the port (already done, `SURREALDB_PORT`) and have the other project connect to your **host machine's** address instead of `surrealdb`, for example `http://host.docker.internal:8010` (Docker Desktop). Make sure the two projects use different `SURREALDB_PORT` values if they're both running at once.

## Common issues

- **Changing `SURREALDB_VERSION` doesn't take effect.** SurrealDB is pulled by image tag, not built locally, apply it with `./laradock start surrealdb`.
- **Credential changes don't take effect.** `SURREALDB_USER`/`SURREALDB_PASSWORD` are only meaningful the first time the RocksDB store is created inside the volume. If you change them afterward, either [start completely fresh](#start-completely-fresh-wipe-all-data) (data loss) or manage users through SurrealQL instead.
- **Data isn't where you expect.** Persists to a named Docker volume (`surrealdb`), not `DATA_PATH_HOST`. Use `docker volume inspect <project>_surrealdb` to find it.
- **"There was a problem with the database" / queries fail with no namespace/database selected.** SurrealDB doesn't pre-create a namespace or database like `MYSQL_DATABASE` does. Add `--ns`/`--db` flags to the CLI, or run `USE NS your_ns DB your_db;` first, in every session.
- **Port already in use on your host.** Another local SurrealDB (or another Laradock project) is already bound to `8010`. Change `SURREALDB_PORT` in `.env` and restart: `./laradock restart surrealdb`.

---

Need a different multi-model option? See **[ArangoDB](https://laradock.io/docs/services/arangodb)**. Back to the **[Getting Started guide](https://laradock.io/docs/getting-started)**.
