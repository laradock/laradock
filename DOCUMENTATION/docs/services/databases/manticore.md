---
slug: /services/manticore
title: Manticore Search
description: Run Manticore Search in Laradock. Start and stop the container, configure ports, query over SphinxQL or HTTP, and fix common issues.
keywords:
  - laradock manticore
  - manticore search docker
  - manticore docker compose
  - sphinxql docker
  - full text search docker
  - sphinx search fork
---

## What is Manticore Search?

[Manticore Search](https://manticoresearch.com) is an open-source search engine forked from Sphinx, built for fast full-text and vector search. It's a lighter-weight alternative to Elasticsearch or Solr, speaking its own SphinxQL dialect (MySQL wire protocol) as well as a JSON/HTTP API. Laradock runs it as its own container, built straight from the official `manticoresearch/manticore` image.

## Start Manticore

```bash
docker compose up -d manticore
```

## Stop Manticore

```bash
docker compose stop manticore
```

This stops the container without deleting its data. Data lives under `DATA_PATH_HOST/manticore/data`.

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

## Common issues

- **Config edits don't take effect.** `manticore/config/sphinx.conf` is bind-mounted, so edits apply after a container restart (`docker compose restart manticore`), no rebuild needed.
- **Image drifts over time.** Because the image isn't version-pinned, `docker compose build --no-cache manticore` can pull a newer Manticore release than you tested against. Pin a tag yourself in `manticore/Dockerfile` if you need reproducibility.
- **Port already in use on your host.** Change `MANTICORE_SPHINXQL_PORT`, `MANTICORE_API_PORT`, or `MANTICORE_HTTP_PORT` in `.env` and restart.
- **Data not persisting.** Confirm `DATA_PATH_HOST` is set consistently, Manticore's index data and logs live at `DATA_PATH_HOST/manticore/data` and `DATA_PATH_HOST/manticore/log`.

---

Need OLAP analytics instead? See **[ClickHouse](/docs/services/clickhouse)**. Back to the **[Getting Started guide](/docs/getting-started)**.
