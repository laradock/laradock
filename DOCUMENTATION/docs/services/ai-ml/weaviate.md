---
slug: /services/weaviate
title: Weaviate
description: Run Weaviate in Laradock, an open-source vector database with REST and GraphQL APIs for embeddings and RAG.
keywords:
  - laradock weaviate
  - weaviate docker
  - weaviate docker compose
  - vector database docker
  - weaviate laravel rag
  - graphql vector search
---

## What is Weaviate?

[Weaviate](https://weaviate.io) is an open-source vector database with REST and GraphQL APIs, used for embeddings and RAG (retrieval-augmented generation) from PHP over plain HTTP. Unlike some vector databases, it ships GraphQL as a first-class query interface alongside REST.

## Start Weaviate

```bash
docker compose up -d weaviate
```

## Stop Weaviate

```bash
docker compose stop weaviate
```

This stops the container without deleting your data (kept in the `weaviate` Docker volume). To remove the container: `docker compose rm -f weaviate`.

## Configuration

All settings live in `weaviate/defaults.env` and can be overridden by adding the same line to your own `.env`:

| Variable | Default | What it does |
|---|---|---|
| `WEAVIATE_VERSION` | `1.38.2` | Image tag from [`cr.weaviate.io/semitechnologies/weaviate`](https://weaviate.io/developers/weaviate). |
| `WEAVIATE_HOST_PORT` | `8085` | Host-side port Weaviate is published on (container port `8080`). |

`weaviate/compose.yml` also sets, directly in the container environment: `AUTHENTICATION_ANONYMOUS_ACCESS_ENABLED=true` (no auth needed by default), `DEFAULT_VECTORIZER_MODULE=none` (you supply your own vectors/embeddings rather than Weaviate generating them), and `QUERY_DEFAULTS_LIMIT=25`. Data persists at `/var/lib/weaviate` in the `weaviate` volume.

## Connect

Reachable at `http://localhost:8085`, REST endpoints under `/v1`, readiness check at `/v1/.well-known/ready`. Anonymous access is on by default, no API key needed for local dev. From another container, use `http://weaviate:8080`.

## Common issues

- **Objects rejected for missing a vector.** `DEFAULT_VECTORIZER_MODULE=none` means Weaviate expects you to provide vectors yourself (e.g. from OpenAI, Ollama, or your own embedding model); it won't generate them for you unless you enable and configure a vectorizer module.
- **Query returns fewer results than expected.** `QUERY_DEFAULTS_LIMIT=25` caps default query results; pass an explicit `limit` in your query if you need more.
- **Port already in use on your host.** Change `WEAVIATE_HOST_PORT` in `.env` and restart: `docker compose up -d weaviate`.
- **App can't connect but the container is running.** Use the container name `weaviate` on port `8080`, not `localhost`, from inside another container.

---

Comparing vector databases? See **[Qdrant](/docs/services/qdrant)** and **[Chroma](/docs/services/chroma)**. New to Laradock? Start with **[Getting Started](/docs/getting-started)**.
