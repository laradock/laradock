---
slug: /services/manticore
title: Manticore Search
description: Run Manticore Search in Laradock. Start and stop the container, configure ports, query over SphinxQL or HTTP, create indexes, back up data, and fix common issues.
keywords:
  - laradock manticore
  - manticore search docker
  - manticore docker compose
  - sphinxql docker
  - full text search docker
  - sphinx search fork
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

## What is Manticore Search?

[Manticore Search](https://manticoresearch.com) is an open-source search engine forked from Sphinx, built for fast full-text and vector search. It's a lighter-weight alternative to Elasticsearch or Solr, speaking its own SphinxQL dialect (MySQL wire protocol) as well as a JSON/HTTP API. Laradock runs it as its own container, built straight from the official `manticoresearch/manticore` image.

## Start Manticore

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock start manticore
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose up -d manticore
```

</TabItem>
</Tabs>

Name any other services alongside it to start them together, for example `./laradock start manticore workspace`.

## Stop Manticore

Stopping just pauses the container; **your data is safe** (it lives under `DATA_PATH_HOST/manticore/data`):

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock stop manticore
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose stop manticore
```

</TabItem>
</Tabs>

To delete the container entirely (the data on disk is still untouched):

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock remove manticore
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose rm -sf manticore
```

</TabItem>
</Tabs>

## Configuration

All settings live in `manticore/defaults.env` and can be overridden by adding the same line to your own `.env`:

| Variable | Default | What it does |
|---|---|---|
| `MANTICORE_CONFIG_PATH` | `./manticore/config` | Folder mounted to `/etc/sphinxsearch`, holds `sphinx.conf`. |
| `MANTICORE_API_PORT` | `9312` | Host-side port for the legacy Sphinx binary API (container port `9312`). |
| `MANTICORE_SPHINXQL_PORT` | `9306` | Host-side port for SphinxQL, the MySQL-protocol query interface (container port `9306`). |
| `MANTICORE_HTTP_PORT` | `9308` | Host-side port for the HTTP/JSON API (container port `9308`). |

There's no `MANTICORE_VERSION` variable, the `manticore/Dockerfile` builds from `manticoresearch/manticore` unpinned, so it always pulls whatever tag is latest at build time.

## Query over SphinxQL

SphinxQL speaks the MySQL protocol, so any MySQL client works:

```bash
mysql -h127.0.0.1 -P9306
```

No username or password is required by default.

## Query over HTTP

```bash
curl -s http://localhost:9308/sql -d "query=show tables"
```

## Create an index

The bundled `manticore/config/sphinx.conf` defines one sample real-time index, `testrt`. You don't have to edit that file to add more, Manticore supports creating real-time tables straight from SphinxQL (no restart needed, and they persist across restarts):

```bash
mysql -h127.0.0.1 -P9306 -e "CREATE TABLE products(title text, content text, gid int) rt_mem_limit='128M';"
```

Insert and query it the same way:

```bash
mysql -h127.0.0.1 -P9306 -e "INSERT INTO products(id, title, content, gid) VALUES (1, 'first post', 'hello world', 10);"
mysql -h127.0.0.1 -P9306 -e "SELECT * FROM products WHERE MATCH('hello');"
```

Indexes defined in `sphinx.conf` (like `testrt`) instead require a config edit and a restart, see [Common issues](#common-issues).

## Check index and server health

```bash
mysql -h127.0.0.1 -P9306 -e "SHOW TABLES;"
mysql -h127.0.0.1 -P9306 -e "SHOW STATUS;"
```

`SHOW TABLES` lists every index Manticore currently knows about (both the ones from `sphinx.conf` and any created live over SphinxQL). `SHOW STATUS` reports uptime, connections, and query counters, useful for confirming the server is actually healthy rather than just "container running."

## Backup and restore

Manticore's real-time indexes keep recent writes in memory before they're flushed to disk, so flush before copying files to make sure the backup is complete:

```bash
mysql -h127.0.0.1 -P9306 -e "FLUSH RTINDEX testrt;"
```

Repeat for each real-time index you care about (or use `FLUSH RTINDEXES;` in newer versions to flush all of them at once).

**Back up** by archiving the data directory on your host, no need to enter the container:

```bash
tar -czf manticore-backup.tar.gz -C "${DATA_PATH_HOST:-~/.laradock/data}/manticore" data
```

**Restore** into a fresh container by stopping it, clearing the data folder, extracting your archive back in, then starting again:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock stop manticore
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose stop manticore
```

</TabItem>
</Tabs>

```bash
rm -rf "${DATA_PATH_HOST:-~/.laradock/data}/manticore/data"
tar -xzf manticore-backup.tar.gz -C "${DATA_PATH_HOST:-~/.laradock/data}/manticore"
```

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock start manticore
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose up -d manticore
```

</TabItem>
</Tabs>

## Start completely fresh (wipe all data)

To throw away every index and start Manticore from a clean, empty state (⚠️ this **permanently deletes** all indexed data, back up first if you need anything):

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock stop manticore
./laradock remove manticore
rm -rf "${DATA_PATH_HOST:-~/.laradock/data}/manticore/data"
./laradock start manticore
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose stop manticore
docker compose rm -sf manticore
rm -rf "${DATA_PATH_HOST:-~/.laradock/data}/manticore/data"
docker compose up -d manticore
```

</TabItem>
</Tabs>

This only wipes the `data` folder, not `manticore/config/sphinx.conf` (that's a bind-mounted config file, not generated data), so any indexes defined there come back automatically on next start. Indexes you created live over SphinxQL are gone for good since they only ever lived in `data`.

## Talk to this service from another Laradock project

Each Laradock project is its own isolated Docker network by default, so a second project's containers can't reach this Manticore by container name out of the box. Easiest fix: the ports are already published, have the other project connect to your **host machine's** address instead of `manticore`, for example `host.docker.internal` (Docker Desktop) on this project's `MANTICORE_SPHINXQL_PORT` or `MANTICORE_HTTP_PORT`. Make sure the two projects use different ports if they're both running at once.

## Common issues

- **`sphinx.conf` edits don't take effect.** It's bind-mounted, so edits apply after a container restart (`./laradock restart manticore`), no rebuild needed.
- **Image drifts over time.** Because the image isn't version-pinned, `./laradock rebuild manticore` can pull a newer Manticore release than you tested against. Pin a tag yourself in `manticore/Dockerfile` if you need reproducibility.
- **Port already in use on your host.** Change `MANTICORE_SPHINXQL_PORT`, `MANTICORE_API_PORT`, or `MANTICORE_HTTP_PORT` in `.env` and restart.
- **Data not persisting.** Confirm `DATA_PATH_HOST` is set consistently, Manticore's index data and logs live at `DATA_PATH_HOST/manticore/data` and `DATA_PATH_HOST/manticore/log`.
- **Writes to a real-time index disappear after a crash.** You skipped the `FLUSH RTINDEX` step above before copying/backing up data, or the container was killed hard enough that recent writes never made it to the binlog.

---

Need OLAP analytics instead? See **[ClickHouse](/docs/services/clickhouse)**. Back to the **[Getting Started guide](/docs/getting-started)**.
