---
slug: /services/kibana
title: Kibana
description: Run Kibana in Laradock to visualize and explore data stored in Elasticsearch.
keywords:
  - laradock kibana
  - kibana docker
  - kibana docker compose
  - elasticsearch dashboard docker
  - elk stack docker
---

## What is Kibana?

[Kibana](https://www.elastic.co/kibana) is the official visualization and dashboard UI for Elasticsearch. It lets you explore indices, build charts, and query data through a web interface instead of the raw REST API. Laradock builds it from the official image, version-matched to Elasticsearch.

## Start Kibana

```bash
docker compose up -d kibana
```

`kibana/compose.yml` lists `elasticsearch` as a dependency, so it starts automatically alongside Kibana. Kibana has nothing to visualize without it.

## Stop Kibana

```bash
docker compose stop kibana
```

To remove the container: `docker compose rm -f kibana`.

## Configuration

Laradock builds the image from `kibana/Dockerfile` using the shared `ELK_VERSION` variable in the root `.env` (the same version used for `elasticsearch`), plus this setting in `kibana/defaults.env`:

| Variable | Default | What it does |
|---|---|---|
| `KIBANA_HTTP_PORT` | `5601` | Host-side port Kibana is published on (container port `5601`). |

## Connect

Open [http://localhost:5601](http://localhost:5601) in your browser. Kibana auto-detects the `elasticsearch` container over the internal `backend` network, no manual host configuration needed for the bundled setup.

## Common issues

- **Kibana shows "Kibana server is not ready yet".** It waits on Elasticsearch to be reachable and healthy first; confirm `elasticsearch` is actually up with `docker compose ps` and check `docker compose logs elasticsearch`.
- **Version mismatch errors.** Kibana and Elasticsearch both read `ELK_VERSION` from the root `.env`, so they build to the same version automatically. If you changed one manually, rebuild both: `docker compose build kibana elasticsearch`.
- **Port already in use on your host.** Change `KIBANA_HTTP_PORT` in `.env` and restart: `docker compose up -d kibana`.

---

Need a lighter-weight index browser instead? See **[Dejavu](/docs/services/dejavu)**. Need the underlying engine? See **[Elasticsearch](/docs/services/elasticsearch)**. New to Laradock? Start with **[Getting Started](/docs/getting-started)**.
