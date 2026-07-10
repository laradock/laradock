---
slug: /services/neo4j
title: Neo4j
description: Run Neo4j in Laradock. Start and stop the container and open the Neo4j Browser to explore your graph.
keywords:
  - laradock neo4j
  - neo4j docker
  - neo4j docker compose
  - graph database docker
  - neo4j browser docker
  - cypher docker
---

## What is Neo4j?

[Neo4j](https://neo4j.com) is a native graph database: data is stored as nodes and relationships rather than rows or documents, which makes it well-suited for highly connected data (social graphs, recommendation engines, fraud detection). Laradock runs it straight from the [official `neo4j` image](https://hub.docker.com/_/neo4j) with no custom Dockerfile.

## Start Neo4j

```bash
docker compose up -d neo4j
```

It runs as its own container with no `depends_on` in `compose.yml`.

## Stop Neo4j

```bash
docker compose stop neo4j
```

This stops the container without deleting its data. Data persists under `DATA_PATH_HOST/neo4j/data`, and logs under `DATA_PATH_HOST/neo4j/logs`.

## Configuration

There is no `neo4j/defaults.env` file for this service, everything is hardcoded directly in `neo4j/compose.yml`:

| Setting | Value | What it does |
|---|---|---|
| Image | `neo4j:latest` | Not version-pinned or overridable via `.env`; edit `compose.yml` directly to change it. |
| `NEO4J_AUTH` | `none` | Authentication is disabled entirely, no username/password is required to connect. |
| Host port `7401` | → container `7474` | Neo4j Browser (HTTP UI). |
| Host port `7402` | → container `7687` | Bolt protocol port, used by drivers/apps. |

If you need a pinned version, authentication enabled, or different ports, you'll need to edit `neo4j/compose.yml` yourself, there's currently no `.env`-driven way to change these.

## Open the Neo4j Browser

With the container running, open [http://localhost:7401](http://localhost:7401). Since `NEO4J_AUTH=none`, you can connect without entering credentials.

## Connect from your app

Use the Bolt protocol on the mapped port: `bolt://localhost:7402` from your host machine, or `bolt://neo4j:7687` from inside another Laradock container.

## Common issues

- **No authentication by default.** `NEO4J_AUTH=none` means anyone who can reach the port has full access. Fine for local dev; edit `compose.yml` to set real credentials (e.g. `NEO4J_AUTH=neo4j/yourpassword`) before exposing it anywhere less trusted.
- **Can't change the version via `.env`.** Unlike most other Laradock services, the Neo4j image tag isn't parameterized, edit the `image:` line in `neo4j/compose.yml` directly and run `docker compose pull neo4j` (or rebuild) afterward.
- **Port already in use on your host.** Another service is bound to `7401` or `7402`. Edit the port mapping in `neo4j/compose.yml` since there's no env var for it.
- **App can't connect but the container is running.** Confirm the app's config uses `neo4j` (the container name) and port `7687` from inside other Laradock containers, not `localhost`, which only works from your host machine.

---

Need a wide-column store instead? See **[Cassandra](/docs/services/cassandra)**. For the full list of services, see **[Getting Started](/docs/getting-started)**.
