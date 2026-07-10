---
slug: /services/meilisearch
title: MeiliSearch
description: Run MeiliSearch in Laradock. Start the container, configure the master key, and connect it as a Laravel Scout driver.
keywords:
  - laradock meilisearch
  - meilisearch docker
  - meilisearch docker compose
  - meilisearch laravel scout
  - meilisearch master key
---

## What is MeiliSearch?

[MeiliSearch](https://www.meilisearch.com) is a fast, open-source search engine built for developer experience: typo tolerance, instant results, and a simple REST API. It's a popular [Laravel Scout](https://laravel.com/docs/scout) driver for adding full-text search without the operational overhead of Elasticsearch.

## Start MeiliSearch

```bash
docker compose up -d meilisearch
```

## Stop MeiliSearch

```bash
docker compose stop meilisearch
```

This stops the container without deleting its data (kept under `DATA_PATH_HOST/meilisearch`). To remove the container: `docker compose rm -f meilisearch`.

## Configuration

All settings live in `meilisearch/defaults.env` and can be overridden by adding the same line to your own `.env`:

| Variable | Default | What it does |
|---|---|---|
| `MEILISEARCH_HOST_PORT` | `7700` | Host-side port MeiliSearch is published on (container port `7700`). |
| `MEILISEARCH_KEY` | `masterkey` | Passed to the container as `MEILI_MASTER_KEY`, the admin key for the instance. |

Note the image itself isn't version-pinned in `meilisearch/compose.yml`, it always pulls `getmeili/meilisearch:latest`.

## Connect

Open [http://localhost:7700](http://localhost:7700) for the built-in web UI, or point Laravel Scout / any HTTP client at that same URL with the master key `masterkey` (or your own `MEILISEARCH_KEY`) as the API key. From another container use `http://meilisearch:7700`.

## Common issues

- **401/403 on every request.** You need the master key as a Bearer token (`Authorization: Bearer masterkey`) for any write or protected endpoint.
- **Master key changed but old key still works, or vice versa.** MeiliSearch reads `MEILI_MASTER_KEY` at container start; restart the container after changing `MEILISEARCH_KEY` in `.env`.
- **Image updates unexpectedly.** Because `meilisearch/compose.yml` pins `:latest` rather than reading a version variable, a plain `docker compose pull` can bump you to a new MeiliSearch major version. Pin a specific tag in the compose file yourself if you need reproducibility.
- **App can't connect but the container is running.** Use the container name `meilisearch`, not `localhost`, from inside another container.

---

Prefer typo-tolerant search with more filtering options? See **[Typesense](/docs/services/typesense)**. New to Laradock? Start with **[Getting Started](/docs/getting-started)**.
