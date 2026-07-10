---
slug: /services/arangodb
title: ArangoDB
description: Run ArangoDB in Laradock. Start and stop the container, configure the root password and port, open the web UI, and fix common issues.
keywords:
  - laradock arangodb
  - arangodb docker
  - arangodb docker compose
  - multi-model database docker
  - aql query language docker
  - graph database docker
---

## What is ArangoDB?

[ArangoDB](https://arangodb.com) is a multi-model database that combines document, graph, and key/value storage behind one query language, AQL. It's a graph-capable alternative to running Neo4j alongside a separate document store. Laradock runs it straight from the official `arangodb` image.

## Start ArangoDB

```bash
docker compose up -d arangodb
```

## Stop ArangoDB

```bash
docker compose stop arangodb
```

This stops the container without deleting its data. Data is kept in the named `arangodb` Docker volume, not under `DATA_PATH_HOST`.

## Configuration

All settings live in `arangodb/defaults.env` and can be overridden by adding the same line to your own `.env`:

| Variable | Default | What it does |
|---|---|---|
| `ARANGODB_VERSION` | `3.12` | Image tag from the [official ArangoDB image](https://hub.docker.com/_/arangodb). |
| `ARANGODB_PORT` | `8529` | Host-side port for the web UI and API (container port `8529`). |
| `ARANGODB_ROOT_PASSWORD` | `secret` | Password for the `root` user. |

## Open the web UI

```
http://localhost:8529
```

Log in as `root` with `ARANGODB_ROOT_PASSWORD`.

## Check the API from the command line

```bash
curl http://localhost:8529/_api/version
```

## Common issues

- **Changing `ARANGODB_VERSION` doesn't take effect.** ArangoDB is pulled by image tag, not built locally, restart after changing it: `docker compose up -d arangodb`. Crossing a major version against existing data can require ArangoDB's own upgrade procedure, check their docs before jumping versions on a real dataset.
- **Data isn't where you expect.** Unlike most Laradock database services, ArangoDB persists to a named Docker volume (`arangodb`), not `DATA_PATH_HOST`. Use `docker volume inspect <project>_arangodb` to find it on disk, or `docker compose down -v` to wipe it (data loss).
- **Port already in use on your host.** Change `ARANGODB_PORT` in `.env` and restart.
- **Forgot the root password.** It's only applied on first boot into a fresh volume. If you changed `ARANGODB_ROOT_PASSWORD` after that, either reset it from inside ArangoDB or drop the `arangodb` volume (data loss).

---

Need a different multi-model option? See **[SurrealDB](/docs/services/surrealdb)**. Back to the **[Getting Started guide](/docs/getting-started)**.
