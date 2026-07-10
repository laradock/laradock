---
slug: /services/dejavu
title: Dejavu
description: Run Dejavu in Laradock, a lightweight web UI for browsing and querying Elasticsearch indices.
keywords:
  - laradock dejavu
  - dejavu docker
  - dejavu docker compose
  - elasticsearch web ui docker
  - browse elasticsearch index
---

## What is Dejavu?

[Dejavu](https://github.com/appbaseio/dejavu) is a lightweight, open-source web UI for browsing and querying Elasticsearch indices, import/export data, inspect mappings, and build queries visually, without Kibana's full dashboarding weight. Laradock builds it from the `appbaseio/dejavu` image.

## Start Dejavu

```bash
docker compose up -d dejavu
```

`dejavu/compose.yml` lists `elasticsearch` as a dependency, so it starts automatically alongside Dejavu. There's nothing to browse without an Elasticsearch instance running.

## Stop Dejavu

```bash
docker compose stop dejavu
```

To remove the container: `docker compose rm -f dejavu`.

## Configuration

The only Laradock-specific setting lives in `dejavu/defaults.env`:

| Variable | Default | What it does |
|---|---|---|
| `DEJAVU_HTTP_PORT` | `1358` | Host-side port Dejavu is published on (container port `1358`). |

The Dejavu image itself isn't version-pinned, `dejavu/Dockerfile` builds from `appbaseio/dejavu` (latest).

## Connect

Open [http://localhost:1358](http://localhost:1358) in your browser. When prompted for a connection, point it at your Elasticsearch endpoint: use `http://localhost:9200` if you're browsing from the same machine (Dejavu runs client-side in your browser and talks to Elasticsearch directly, not through the Dejavu container).

## Common issues

- **"Could not connect" when adding a connection.** Elasticsearch needs CORS enabled to accept cross-origin requests from Dejavu's browser UI. Laradock's default `elasticsearch/compose.yml` doesn't enable CORS, so you may need to add `http.cors.enabled=true` and `http.cors.allow-origin` to the Elasticsearch environment if you hit this.
- **Blank page or connection refused.** Confirm `elasticsearch` is actually up first: `docker compose ps` and `docker compose logs elasticsearch`.
- **Port already in use on your host.** Change `DEJAVU_HTTP_PORT` in `.env` and restart: `docker compose up -d dejavu`.

---

Need full dashboards and visualizations instead? See **[Kibana](/docs/services/kibana)**. Need the underlying engine? See **[Elasticsearch](/docs/services/elasticsearch)**. New to Laradock? Start with **[Getting Started](/docs/getting-started)**.
