# SSDB

Source: https://laradock.io/docs/services/ssdb

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

## What is SSDB?

[SSDB](https://github.com/ideawu/ssdb) is a high-performance NoSQL store built on LevelDB/RocksDB-style storage, supporting lists, hashes, sets, and z-sets like Redis. Unlike Redis, SSDB persists everything to disk rather than keeping the working set in memory, so it can hold datasets far larger than RAM while still speaking (a subset of) the Redis protocol. Laradock builds it from source on Alpine.

## Start SSDB

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock start ssdb
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose up -d ssdb
```

</TabItem>
</Tabs>

Your data is created on first start and kept between restarts. Name any other services alongside it to start them together, for example `./laradock start ssdb workspace`.

## Stop SSDB

Stopping just pauses the container; **your data is safe**, it lives under `DATA_PATH_HOST/ssdb`:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock stop ssdb
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose stop ssdb
```

</TabItem>
</Tabs>

To delete the container entirely (the data on disk is still untouched):

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock remove ssdb
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose rm -sf ssdb
```

</TabItem>
</Tabs>

## Configuration

All settings live in `ssdb/defaults.env` and can be overridden by adding the same line to your own `.env`:

| Variable | Default | What it does |
|---|---|---|
| `SSDB_PORT` | `16801` | Host-side port mapped to SSDB's internal port `8888`. |

There's no version variable, `ssdb/Dockerfile` builds from the `master` branch of the [ideawu/ssdb](https://github.com/ideawu/ssdb) source and isn't pinned to a release tag.

Server behavior itself (bind address, allowed IP ranges, replication, logging, storage engine tuning) is controlled by `ssdb/ssdb.conf`, which is baked into the image with `COPY` rather than mounted. Any edit to this file needs an image rebuild, not just a restart, to take effect:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock rebuild ssdb
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose build ssdb
```

</TabItem>
</Tabs>

## Connect with a client

Because SSDB speaks the Redis protocol, `redis-cli` and most Redis clients work against it. From your host machine, connect to `localhost` on `SSDB_PORT` (`16801` by default):

```bash
redis-cli -h 127.0.0.1 -p 16801
```

From inside the container, `redis-cli` isn't installed, use SSDB's own `ssdb-cli` instead, which the build installs alongside `ssdb-server`:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock enter ssdb
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose exec ssdb bash
```

</TabItem>
</Tabs>

```bash
/ssdb/ssdb-cli -p 8888
```

## Enable authentication

By default SSDB has **no password**, anyone who can reach `SSDB_PORT` can read and write. `ssdb/ssdb.conf` has a commented-out `auth:` line under the `server:` block:

```conf
server:
	#auth: very-strong-password
```

Uncomment it and set a password of **at least 32 characters**, then rebuild (it's a baked-in file, see [Configuration](#configuration) above) and restart:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock rebuild ssdb
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose build ssdb
```

</TabItem>
</Tabs>

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock restart ssdb
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose restart ssdb
```

</TabItem>
</Tabs>

Clients then need to run `AUTH your-password` (or pass `-a your-password` to `redis-cli`) before issuing other commands.

## Backup and restore

SSDB has no built-in dump command in this build, but all of its data lives as plain files under `DATA_PATH_HOST/ssdb` (mounted to `/data` in the container), so a filesystem-level copy is a complete, reliable backup. Stop the container first so nothing is writing to the storage files mid-copy:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock stop ssdb
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose stop ssdb
```

</TabItem>
</Tabs>

```bash
tar -czf ssdb-backup.tar.gz -C "${DATA_PATH_HOST:-~/.laradock/data}/ssdb" .
```

Start it back up once the copy is done:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock start ssdb
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose up -d ssdb
```

</TabItem>
</Tabs>

**Restore** by stopping SSDB, replacing the contents of that same data folder with your backup, then starting again:

```bash
rm -rf "${DATA_PATH_HOST:-~/.laradock/data}/ssdb"/*
tar -xzf ssdb-backup.tar.gz -C "${DATA_PATH_HOST:-~/.laradock/data}/ssdb"
```

## Start completely fresh (wipe all data)

To throw away everything and start SSDB from a clean, empty state (⚠️ this **permanently deletes** every key in this container, back up first if you need anything):

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock stop ssdb
./laradock remove ssdb
rm -rf "${DATA_PATH_HOST:-~/.laradock/data}/ssdb"
./laradock start ssdb
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose stop ssdb
docker compose rm -sf ssdb
rm -rf "${DATA_PATH_HOST:-~/.laradock/data}/ssdb"
docker compose up -d ssdb
```

</TabItem>
</Tabs>

`DATA_PATH_HOST` is whatever you have set in `.env` (`~/.laradock/data` by default), so the folder above is where SSDB's data actually lives on your machine.

## Talk to this database from another Laradock project

Each Laradock project is its own isolated Docker network by default, so a second project's containers can't reach this SSDB by container name out of the box. Easiest fix: the port is already published (`SSDB_PORT`), have the other project connect to your **host machine's** address instead of `ssdb`, for example `host.docker.internal` (Docker Desktop) on this project's `SSDB_PORT`. Make sure the two projects use different `SSDB_PORT` values if they're both running at once.

## Common issues

- **Connections refused from other hosts.** `ssdb/ssdb.conf` only allows `127.0.0.1`, `192.*`, and `172.*` by default (`allow:` lines under `server:`), edit that file and rebuild (`./laradock rebuild ssdb`) if you need to allow a different range.
- **Image drifts over time.** Since the build isn't pinned to a release tag, rebuilding without cache can pull in newer upstream commits than you tested against.
- **Data not persisting.** Confirm `DATA_PATH_HOST` is set consistently, SSDB's data is written to `DATA_PATH_HOST/ssdb` on the host.
- **Port already in use on your host.** Change `SSDB_PORT` in `.env` and restart: `./laradock restart ssdb`.
- **Config edits not taking effect.** `ssdb.conf` is copied into the image at build time, not mounted, so any change needs `./laradock rebuild ssdb` followed by `./laradock restart ssdb`.

---

Need an in-memory store instead? See the **[Databases guide](https://laradock.io/docs/Intro#supported-services)** for Redis and friends. Back to the **[Getting Started guide](https://laradock.io/docs/getting-started)**.
