---
slug: /services/opensearch
title: OpenSearch
description: Run OpenSearch in Laradock, the Apache-2.0 fork of Elasticsearch. Start the container, configure the port, and connect from your app.
keywords:
  - laradock opensearch
  - opensearch docker
  - opensearch docker compose
  - elasticsearch alternative docker
  - opensearch laravel
---

## What is OpenSearch?

[OpenSearch](https://opensearch.org) is the Apache-2.0 open-source fork of Elasticsearch, created and maintained by AWS after Elastic changed Elasticsearch's license. It provides the same search-and-analytics engine feature set with a REST API that's largely compatible with Elasticsearch clients. Laradock runs it as a single-node container with the security plugin disabled for local development.

## Start OpenSearch

```bash
docker compose up -d opensearch
```

## Stop OpenSearch

```bash
docker compose stop opensearch
```

This stops the container without deleting its data (kept under `DATA_PATH_HOST/opensearch`). To remove the container: `docker compose rm -f opensearch`.

## Configuration

All settings live in `opensearch/defaults.env` and can be overridden by adding the same line to your own `.env`:

| Variable | Default | What it does |
|---|---|---|
| `OPENSEARCH_VERSION` | `2` | Image tag from the [`opensearchproject/opensearch`](https://hub.docker.com/r/opensearchproject/opensearch) Docker Hub image. |
| `OPENSEARCH_HOST_PORT` | `9202` | Host-side port for the REST API (container port `9200`). |
| `OPENSEARCH_MONITORING_PORT` | `9600` | Host-side port for the monitoring/performance-analyzer endpoint (container port `9600`). |

`opensearch/compose.yml` also runs it single-node (`discovery.type=single-node`), with `DISABLE_SECURITY_PLUGIN=true` and JVM heap capped at `-Xms512m -Xmx512m` via `OPENSEARCH_JAVA_OPTS`.

## Connect

```bash
curl http://localhost:9202
```

That returns the cluster/version info if it's up. From another container (e.g. `workspace`), use `http://opensearch:9200`, note the container listens on `9200` internally regardless of the host-side `OPENSEARCH_HOST_PORT` mapping.

## Common issues

- **Port clash with `elasticsearch`.** If you're running both search engines side by side, `OPENSEARCH_HOST_PORT` (`9202`) is intentionally different from Elasticsearch's `9200` so they don't collide.
- **Container exits or fails to start.** Like Elasticsearch, OpenSearch needs `vm.max_map_count >= 262144` on the Docker host (`sysctl -w vm.max_map_count=262144` on Linux).
- **Security plugin is off.** `DISABLE_SECURITY_PLUGIN=true` means no authentication on the REST API by default, fine for local dev, not something to carry into production.
- **App can't connect but the container is running.** Use the container name `opensearch`, not `localhost`, from inside another container.

---

Looking for the original Elasticsearch instead? See **[Elasticsearch](/docs/services/elasticsearch)**. New to Laradock? Start with **[Getting Started](/docs/getting-started)**.
