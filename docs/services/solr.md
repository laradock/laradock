# Apache Solr

Source: https://laradock.io/docs/services/solr

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

## What is Apache Solr?

[Apache Solr](https://solr.apache.org) is a search platform built on Apache Lucene, offering full-text search, faceting, and indexing over HTTP. Laradock builds it from the official `solr` Docker image, with its admin UI and API on one port.

## Start Solr

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock start solr
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose up -d solr
```

</TabItem>
</Tabs>

Name any other services alongside it to start them together, for example `./laradock start solr mysql`.

## Stop Solr

Stopping just pauses the container; **your cores are safe**, they live under `DATA_PATH_HOST/solr`:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock stop solr
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose stop solr
```

</TabItem>
</Tabs>

To delete the container entirely (the data on disk is still untouched):

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock remove solr
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose rm -sf solr
```

</TabItem>
</Tabs>

## Configuration

All settings live in `solr/defaults.env` and can be overridden by adding the same line to your own `.env`:

| Variable | Default | What it does |
|---|---|---|
| `SOLR_VERSION` | `8.11` | Image tag from the [official Solr image](https://hub.docker.com/_/solr). |
| `SOLR_PORT` | `8983` | Host-side port for both the admin UI and the API (container port `8983`). |
| `SOLR_DATAIMPORTHANDLER_MYSQL` | `false` | When `true`, downloads the MySQL Connector/J JDBC driver at build time for the DataImportHandler. |
| `SOLR_DATAIMPORTHANDLER_MSSQL` | `false` | When `true`, downloads the Microsoft JDBC driver at build time for the DataImportHandler. |

## Open the admin UI

```
http://localhost:8983/solr
```

## Create a core

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock exec solr solr create_core -c mycore
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose exec solr solr create_core -c mycore
```

</TabItem>
</Tabs>

## Check core status

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock exec solr solr status
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose exec solr solr status
```

</TabItem>
</Tabs>

You can also check a single core's health from the admin UI (**Core Admin** page) or by hitting `http://localhost:8983/solr/mycore/admin/ping`.

## Delete a core

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock exec solr solr delete -c mycore
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose exec solr solr delete -c mycore
```

</TabItem>
</Tabs>

## Enable a JDBC data import connector

1. In `.env`, set `SOLR_DATAIMPORTHANDLER_MYSQL=true` (or `SOLR_DATAIMPORTHANDLER_MSSQL=true`).
2. Rebuild with a clean cache, since the connector is downloaded during the build:

```bash
docker compose build --no-cache solr
```

## Backup and restore a core

Solr's replication handler can snapshot a core to disk and restore it later, no extra tooling needed. Both commands hit the core's own HTTP endpoint:

**Back up** `mycore` (writes a `snapshot.<timestamp>` folder inside that core's data directory, under `DATA_PATH_HOST/solr/mycore/data`):

```bash
curl "http://localhost:8983/solr/mycore/replication?command=backup"
```

Check `command=details` to confirm the backup finished before relying on it:

```bash
curl "http://localhost:8983/solr/mycore/replication?command=details"
```

**Restore** the most recent snapshot back into `mycore`:

```bash
curl "http://localhost:8983/solr/mycore/replication?command=restore"
```

Both commands run asynchronously; poll restore progress with `command=restorestatus`. Because the snapshot is written under `DATA_PATH_HOST/solr`, copying that folder off-host is also a valid manual backup.

## Start completely fresh (wipe all data)

To throw away every core and start Solr from a clean, empty state (⚠️ this **permanently deletes** all cores and their indexed data, back up first if you need anything):

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock stop solr
./laradock remove solr
rm -rf "${DATA_PATH_HOST:-~/.laradock/data}/solr"
./laradock start solr
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose stop solr
docker compose rm -sf solr
rm -rf "${DATA_PATH_HOST:-~/.laradock/data}/solr"
docker compose up -d solr
```

</TabItem>
</Tabs>

`DATA_PATH_HOST` is whatever you have set in `.env` (`~/.laradock/data` by default). That folder is mounted straight to `/opt/solr/server/solr/mycores`, Solr's entire cores directory, so wiping it removes every core, not just their documents. After starting again you'll need to [create your cores](#create-a-core) from scratch.

## Tune the JVM heap size

Solr's upstream image reads its JVM heap size from a `SOLR_HEAP` environment variable, but `solr/compose.yml` doesn't pass it through by default. Add it yourself under the `solr` service:

```yaml
environment:
  - SOLR_HEAP=1g
```

Then apply the change:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock restart solr
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose restart solr
```

</TabItem>
</Tabs>

Solr's default heap is fairly small (`512m`); indexing anything non-trivial usually calls for raising this.

## Talk to this Solr from another Laradock project

Each Laradock project is its own isolated Docker network by default, so a second project's containers can't reach this Solr by container name out of the box. Easiest fix: publish the port (already done, `SOLR_PORT`) and have the other project connect to your **host machine's** address instead of `solr`, for example `http://host.docker.internal:8983/solr` (Docker Desktop). Make sure the two projects use different `SOLR_PORT` values if they're both running at once.

## Common issues

- **Changing `SOLR_VERSION` doesn't take effect.** It's a build argument, rebuild after changing it: `./laradock rebuild solr`.
- **JDBC connectors missing.** They're only fetched when the matching flag was `true` at build time, flip the flag and rebuild with `docker compose build --no-cache solr`, a plain rebuild reuses the cached layer and skips the download.
- **Cores don't persist across restarts.** They're written to `DATA_PATH_HOST/solr` (mounted to `/opt/solr/server/solr/mycores`), confirm `DATA_PATH_HOST` is set consistently between runs.
- **Port already in use on your host.** Change `SOLR_PORT` in `.env` and restart: `./laradock restart solr`.
- **Indexing is slow or Solr gets OOM-killed on large collections.** Raise the JVM heap, see [Tune the JVM heap size](#tune-the-jvm-heap-size) above.

---

Need a lighter-weight search engine instead? See **[Manticore](https://laradock.io/docs/services/manticore)**. Back to the **[Getting Started guide](https://laradock.io/docs/getting-started)**.
