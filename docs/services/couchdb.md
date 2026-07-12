# CouchDB

Source: https://laradock.io/docs/services/couchdb

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

## What is CouchDB?

[Apache CouchDB](https://couchdb.apache.org) is a document-oriented NoSQL database that stores JSON documents and exposes its entire API over plain HTTP, including a built-in web admin UI (Fauxton). It's built around multi-master replication, making it a common choice for offline-first and sync-heavy apps. Laradock runs it via the [official CouchDB image](https://hub.docker.com/_/couchdb).

## Start CouchDB

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock start couchdb
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose up -d couchdb
```

</TabItem>
</Tabs>

It runs as its own container with no `depends_on` in `compose.yml`. Name any other services alongside it to start them together, for example `./laradock start couchdb workspace`.

## Stop CouchDB

Stopping just pauses the container; **your data is safe**, it persists under `DATA_PATH_HOST/couchdb/data`:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock stop couchdb
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose stop couchdb
```

</TabItem>
</Tabs>

To delete the container entirely (the data on disk is still untouched):

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock remove couchdb
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose rm -sf couchdb
```

</TabItem>
</Tabs>

## Configuration

`couchdb/defaults.env` only exposes one setting:

| Variable | Default | What it does |
|---|---|---|
| `COUCHDB_PORT` | `5984` | Host-side port CouchDB's HTTP API and Fauxton UI are published on (`host:container`). |

The Dockerfile doesn't set any admin username/password, so CouchDB starts in its default "admin party" mode with no authentication configured. Set that up yourself before exposing it beyond local development, see the [CouchDB Docker Hub page](https://hub.docker.com/_/couchdb) for the `COUCHDB_USER`/`COUCHDB_PASSWORD` environment variables supported by the base image if you need to add them (you'll need to add an `environment:` block for them in `couchdb/compose.yml`, since only `COUCHDB_PORT` is currently wired through).

## Access Fauxton and the HTTP API

With the container running, open [http://localhost:5984/_utils](http://localhost:5984/_utils) (or your `COUCHDB_PORT`) for the Fauxton admin UI. The raw HTTP API is available at the same host/port, for example:

```bash
curl http://localhost:5984/
```

## Backup and restore

CouchDB has no separate dump tool bundled in this image, so the reliable way to back up is a filesystem copy of its data folder while the container is stopped (CouchDB's `.couch` files aren't safe to copy while it's writing to them).

**Back up:**

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock stop couchdb
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose stop couchdb
```

</TabItem>
</Tabs>

```bash
tar -czf couchdb-backup.tar.gz -C "${DATA_PATH_HOST:-~/.laradock/data}/couchdb" data
```

Then start it again with `./laradock start couchdb`.

**Restore** into a fresh instance (see [Start completely fresh](#start-completely-fresh-wipe-all-data) below to clear out any existing data first):

```bash
tar -xzf couchdb-backup.tar.gz -C "${DATA_PATH_HOST:-~/.laradock/data}/couchdb"
```

Then `./laradock start couchdb`. For selective, per-document backups instead of the whole instance, CouchDB's own replication protocol can also push a database to a file or another CouchDB instance, see the [CouchDB replication docs](https://docs.couchdb.org/en/stable/replication/index.html).

## Compact a database

CouchDB never overwrites data in place, every update appends to the file on disk, so long-lived databases grow larger than the data they actually hold. Reclaim that space with the compaction endpoint:

```bash
curl -X POST -H "Content-Type: application/json" http://localhost:5984/<your-database>/_compact
```

Compaction runs in the background and is safe to run on a live database. There's no fixed schedule, run it whenever a database's file size looks out of proportion to its actual document count.

## Start completely fresh (wipe all data)

To throw away everything and start CouchDB from a clean, empty state (⚠️ this **permanently deletes** every database in this container, back up first if you need anything):

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock stop couchdb
./laradock remove couchdb
rm -rf "${DATA_PATH_HOST:-~/.laradock/data}/couchdb"
./laradock start couchdb
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose stop couchdb
docker compose rm -sf couchdb
rm -rf "${DATA_PATH_HOST:-~/.laradock/data}/couchdb"
docker compose up -d couchdb
```

</TabItem>
</Tabs>

`DATA_PATH_HOST` is whatever you have set in `.env` (`~/.laradock/data` by default), so the folder above is where CouchDB's data actually lives on your machine.

## Talk to this database from another Laradock project

Each Laradock project is its own isolated Docker network by default, so a second project's containers can't reach this CouchDB by container name out of the box. Easiest fix: publish the port (already done, `COUCHDB_PORT`) and have the other project connect to your **host machine's** address instead of `couchdb`, for example `host.docker.internal` (Docker Desktop) on this project's `COUCHDB_PORT`. Make sure the two projects use different `COUCHDB_PORT` values if they're both running at once.

## Common issues

- **No authentication by default.** Nothing in `couchdb/defaults.env` or the Dockerfile sets admin credentials, so the instance runs open. Fine for local dev; add `COUCHDB_USER`/`COUCHDB_PASSWORD` yourself if you need to lock it down (see [Configuration](#configuration) above).
- **App can't connect but the container is running.** Confirm the app's config uses `couchdb` (the container name) as the host from inside other Laradock containers, not `localhost`, which only works from your host machine.
- **Port already in use on your host.** Another local CouchDB (or another Laradock project) is already bound to `5984`. Change `COUCHDB_PORT` in `.env` and restart with `./laradock restart couchdb`.
- **Data not persisting across rebuilds.** Confirm `DATA_PATH_HOST` in your root `.env` points somewhere stable; CouchDB's data lives under `DATA_PATH_HOST/couchdb/data`.
- **Database file size keeps growing.** CouchDB's append-only storage model means deletes and updates don't shrink files automatically, run a [compaction](#compact-a-database) to reclaim space.

---

Need a document database with stronger schema tooling? See **[MongoDB](https://laradock.io/docs/services/mongo)**. For the full list of services, see **[Getting Started](https://laradock.io/docs/getting-started)**.
