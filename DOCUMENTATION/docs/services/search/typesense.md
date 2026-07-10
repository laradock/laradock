---
slug: /services/typesense
title: Typesense
description: Run Typesense in Laradock. Start the container, configure the API key, and use it as a fast, typo-tolerant Laravel Scout driver.
keywords:
  - laradock typesense
  - typesense docker
  - typesense docker compose
  - typesense laravel scout
  - typesense api key
---

## What is Typesense?

[Typesense](https://typesense.org) is a fast, typo-tolerant open-source search engine and a drop-in [Laravel Scout](https://laravel.com/docs/scout) driver. It's designed to be simple to run and tune compared to Elasticsearch, with sensible defaults for instant, as-you-type search.

## Start Typesense

```bash
docker compose up -d typesense
```

## Stop Typesense

```bash
docker compose stop typesense
```

This stops the container without deleting its data (kept under `DATA_PATH_HOST/typesense`). To remove the container: `docker compose rm -f typesense`.

## Configuration

All settings live in `typesense/defaults.env` and can be overridden by adding the same line to your own `.env`:

| Variable | Default | What it does |
|---|---|---|
| `TYPESENSE_VERSION` | `30.2` | Image tag from the [`typesense/typesense`](https://hub.docker.com/r/typesense/typesense) Docker Hub image. |
| `TYPESENSE_HOST_PORT` | `8108` | Host-side port Typesense is published on (container port `8108`). |
| `TYPESENSE_API_KEY` | `typesense` | API key required on every request; change it for anything beyond local dev. |
| `TYPESENSE_ENABLE_CORS` | `true` | Whether to allow cross-origin requests, useful when calling the API directly from a browser-based frontend. |

## Connect

The API is available at [http://localhost:8108](http://localhost:8108). Check it's up with:

```bash
curl http://localhost:8108/health
```

Every request needs the API key, sent as the `X-TYPESENSE-API-KEY` header. From another container use `http://typesense:8108`.

## Common issues

- **401 on every request.** Missing or wrong `X-TYPESENSE-API-KEY` header, check it matches `TYPESENSE_API_KEY`.
- **Browser requests blocked by CORS.** Confirm `TYPESENSE_ENABLE_CORS=true` (the default) if you're calling the API directly from frontend JavaScript rather than through your backend.
- **API key changes don't take effect.** Restart the container after changing `TYPESENSE_API_KEY` in `.env`: `docker compose up -d typesense`.
- **App can't connect but the container is running.** Use the container name `typesense`, not `localhost`, from inside another container.

---

Prefer a search engine with a broader plugin ecosystem? See **[Elasticsearch](/docs/services/elasticsearch)** or **[MeiliSearch](/docs/services/meilisearch)**. New to Laradock? Start with **[Getting Started](/docs/getting-started)**.
