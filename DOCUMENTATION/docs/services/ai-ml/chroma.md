---
slug: /services/chroma
title: Chroma
description: Run Chroma in Laradock, a lightweight open-source vector database with a simple HTTP API for semantic search and RAG.
keywords:
  - laradock chroma
  - chromadb docker
  - chroma docker compose
  - vector database docker
  - chroma laravel rag
  - embeddings search docker
---

## What is Chroma?

[Chroma](https://www.trychroma.com) is a lightweight open-source vector database with a simple HTTP API, handy for semantic-search and RAG (retrieval-augmented generation) prototypes where you want something simpler to operate than Weaviate or Qdrant.

## Start Chroma

```bash
docker compose up -d chroma
```

## Stop Chroma

```bash
docker compose stop chroma
```

This stops the container without deleting your data (kept in the `chroma` Docker volume). To remove the container: `docker compose rm -f chroma`.

## Configuration

All settings live in `chroma/defaults.env` and can be overridden by adding the same line to your own `.env`:

| Variable | Default | What it does |
|---|---|---|
| `CHROMA_VERSION` | `latest` | Image tag from the [`chromadb/chroma`](https://hub.docker.com/r/chromadb/chroma) Docker Hub image. |
| `CHROMA_HOST_PORT` | `8001` | Host-side port mapped to the Chroma HTTP API (container port `8000`). |

Data persists in the `chroma` named Docker volume at `/data` across restarts.

## Connect

The API is at `http://localhost:8001` from your host. Heartbeat check: `/api/v2/heartbeat`. From another container, use `http://chroma:8000`, note the internal port is `8000`, different from the host-mapped `8001`.

## Common issues

- **Confusing host vs container port.** The container listens on `8000` internally; `CHROMA_HOST_PORT` (`8001`) is only the host-side mapping. From other containers, always use port `8000`.
- **Data disappeared after recreating the container.** Data lives in the `chroma` named volume; running `docker compose down -v` (which removes volumes) rather than `docker compose down` wipes it.
- **Port already in use on your host.** Change `CHROMA_HOST_PORT` in `.env` and restart: `docker compose up -d chroma`.
- **App can't connect but the container is running.** Use the container name `chroma`, not `localhost`, from inside another container.

---

Comparing vector databases? See **[Qdrant](/docs/services/qdrant)** and **[Weaviate](/docs/services/weaviate)**. New to Laradock? Start with **[Getting Started](/docs/getting-started)**.
