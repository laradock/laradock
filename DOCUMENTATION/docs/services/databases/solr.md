---
slug: /services/solr
title: Apache Solr
description: Run Apache Solr in Laradock. Start and stop the container, configure the version and admin port, enable JDBC data import connectors, and fix common issues.
keywords:
  - laradock solr
  - apache solr docker
  - solr docker compose
  - solr admin ui docker
  - lucene search docker
  - solr dataimporthandler
---

## What is Apache Solr?

[Apache Solr](https://solr.apache.org) is a search platform built on Apache Lucene, offering full-text search, faceting, and indexing over HTTP. Laradock builds it from the official `solr` Docker image, with its admin UI and API on one port.

## Start Solr

```bash
docker compose up -d solr
```

## Stop Solr

```bash
docker compose stop solr
```

This stops the container without deleting its data. Cores live under `DATA_PATH_HOST/solr`.

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

```bash
docker compose exec solr solr create_core -c mycore
```

## Enable a JDBC data import connector

1. In `.env`, set `SOLR_DATAIMPORTHANDLER_MYSQL=true` (or `SOLR_DATAIMPORTHANDLER_MSSQL=true`).
2. Rebuild with a clean cache, since the connector is downloaded during the build:
   ```bash
   docker compose build --no-cache solr
   ```

## Common issues

- **Changing `SOLR_VERSION` doesn't take effect.** It's a build argument, rebuild after changing it: `docker compose build solr`.
- **JDBC connectors missing.** They're only fetched when the matching flag was `true` at build time, flip the flag and rebuild with `--no-cache`, a plain rebuild reuses the cached layer and skips the download.
- **Cores don't persist across `docker compose down`.** They're written to `DATA_PATH_HOST/solr` (mounted to `/opt/solr/server/solr/mycores`), confirm `DATA_PATH_HOST` is set consistently between runs.
- **Port already in use on your host.** Change `SOLR_PORT` in `.env` and restart: `docker compose up -d solr`.

---

Need a lighter-weight search engine instead? See **[Manticore](/docs/services/manticore)**. Back to the **[Getting Started guide](/docs/getting-started)**.
