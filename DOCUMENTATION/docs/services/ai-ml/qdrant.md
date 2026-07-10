---
slug: /services/qdrant
title: Qdrant
description: Run Qdrant in Laradock, a high-performance vector database for storing and querying embeddings over a REST or gRPC API.
keywords:
  - laradock qdrant
  - qdrant docker
  - qdrant docker compose
  - vector database docker
  - qdrant laravel rag
  - embeddings search docker
---

## What is Qdrant?

[Qdrant](https://qdrant.tech) is a high-performance vector database for storing and querying embeddings, used for semantic search and RAG (retrieval-augmented generation) pipelines. It exposes both a REST API and a gRPC API, plus a built-in web dashboard.

## Start Qdrant

```bash
docker compose up -d qdrant
```

## Stop Qdrant

```bash
docker compose stop qdrant
```

This stops the container without deleting your collections (kept in the `qdrant` Docker volume). To remove the container: `docker compose rm -f qdrant`.

## Configuration

All settings live in `qdrant/defaults.env` and can be overridden by adding the same line to your own `.env`:

| Variable | Default | What it does |
|---|---|---|
| `QDRANT_VERSION` | `latest` | Image tag from the [`qdrant/qdrant`](https://hub.docker.com/r/qdrant/qdrant) Docker Hub image. |
| `QDRANT_HOST_PORT` | `6333` | Host-side port for the REST API (container port `6333`). |
| `QDRANT_GRPC_PORT` | `6334` | Host-side port for the gRPC API (container port `6334`). |

Collections persist in the `qdrant` named Docker volume at `/qdrant/storage` across restarts.

## Connect

REST API is at `http://localhost:6333`, health check `/healthz`, built-in dashboard at `/dashboard`. gRPC is on `6334`. From another container, use `http://qdrant:6333` (or `qdrant:6334` for gRPC).

## Common issues

- **Dashboard shows no collections.** Collections are created via the API, not automatically. Create one first, either through the dashboard's "create collection" flow or a `PUT /collections/<name>` call.
- **gRPC client can't connect.** Confirm you're using port `6334`, not the REST port `6333`, gRPC and REST are separate ports on this image.
- **Port already in use on your host.** Change `QDRANT_HOST_PORT` or `QDRANT_GRPC_PORT` in `.env` and restart: `docker compose up -d qdrant`.
- **App can't connect but the container is running.** Use the container name `qdrant`, not `localhost`, from inside another container.

---

Comparing vector databases? See **[Weaviate](/docs/services/weaviate)** and **[Chroma](/docs/services/chroma)**. New to Laradock? Start with **[Getting Started](/docs/getting-started)**.
