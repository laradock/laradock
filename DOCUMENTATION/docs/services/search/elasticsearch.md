---
slug: /services/elasticsearch
title: Elasticsearch
description: Run Elasticsearch in Laradock. Start the container, install plugins, and connect from your PHP app or from Kibana/Dejavu.
keywords:
  - laradock elasticsearch
  - elasticsearch docker
  - elasticsearch docker compose
  - elasticsearch laravel scout
  - elk stack docker
---

## What is Elasticsearch?

[Elasticsearch](https://www.elastic.co/elasticsearch) is a distributed search and analytics engine built on Apache Lucene. It's the "ES" in the ELK stack and a common backend for full-text search, log analytics, and Laravel Scout's Elasticsearch driver. Laradock builds it as its own container from the official image.

## Start Elasticsearch

```bash
docker compose up -d elasticsearch
```

The `elasticsearch/compose.yml` lists `php-fpm` as a dependency, so `php-fpm` starts automatically alongside it.

## Stop Elasticsearch

```bash
docker compose stop elasticsearch
```

This stops the container without deleting its data (kept in the `elasticsearch` volume). To remove the container: `docker compose rm -f elasticsearch`.

## Configuration

Laradock builds the image from `elasticsearch/Dockerfile` using the shared `ELK_VERSION` variable in the root `.env` (also used by `kibana`), plus these settings in `elasticsearch/defaults.env`:

| Variable | Default | What it does |
|---|---|---|
| `ELASTICSEARCH_HOST_HTTP_PORT` | `9200` | Host-side port for the REST API (container port `9200`). |
| `ELASTICSEARCH_HOST_TRANSPORT_PORT` | `9300` | Host-side port for the transport/cluster protocol (container port `9300`). |

The container also runs single-node with security disabled by default (`xpack.security.enabled=false`), and JVM heap capped at `-Xms512m -Xmx512m` via `ES_JAVA_OPTS`, both set directly in `elasticsearch/compose.yml`.

## Connect

Open [http://localhost:9200](http://localhost:9200) from your host, or `http://elasticsearch:9200` from another container. There's no authentication by default since the security plugin is disabled, unlike the hosted Elastic Cloud default of user `elastic` / a generated password.

## Install a plugin

```bash
docker compose exec elasticsearch /usr/share/elasticsearch/bin/plugin install <plugin-name>
docker compose restart elasticsearch
```

## Common issues

- **Container exits immediately or fails healthcheck.** Elasticsearch needs `vm.max_map_count` to be at least `262144` on the Docker host. On Linux, set it with `sysctl -w vm.max_map_count=262144`; Docker Desktop on macOS/Windows usually handles this for you.
- **`bootstrap.memory_lock` warnings.** The compose file sets `memlock` ulimits to unlimited already; if your Docker daemon still refuses to lock memory, check your host's own ulimits.
- **Out-of-memory kills under load.** Heap is fixed at 512MB via `ES_JAVA_OPTS` in `elasticsearch/compose.yml`. Raise it there if you're indexing large datasets locally.
- **Can't reach it from another container.** Use the container name `elasticsearch` as the host, not `localhost`, from inside `workspace` or `php-fpm`.

---

Need a UI to browse indices? See **[Dejavu](/docs/services/dejavu)**. Need dashboards? See **[Kibana](/docs/services/kibana)**. New to Laradock? Start with **[Getting Started](/docs/getting-started)**.
