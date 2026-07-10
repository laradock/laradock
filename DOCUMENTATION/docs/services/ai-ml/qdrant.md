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

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

## What is Qdrant?

[Qdrant](https://qdrant.tech) is a high-performance vector database for storing and querying embeddings, used for semantic search and RAG (retrieval-augmented generation) pipelines. It exposes both a REST API and a gRPC API, plus a built-in web dashboard.

## Start Qdrant

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock start qdrant
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose up -d qdrant
```

</TabItem>
</Tabs>

Your collections are created on first use and kept between restarts. Name any other services alongside it to start them together, for example `./laradock start qdrant workspace`.

## Stop Qdrant

Stopping just pauses the container; **your collections are safe**:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock stop qdrant
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose stop qdrant
```

</TabItem>
</Tabs>

To delete the container entirely (the data in the `qdrant` volume is still untouched):

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock remove qdrant
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose rm -sf qdrant
```

</TabItem>
</Tabs>

## Configuration

All settings live in `qdrant/defaults.env` and can be overridden by adding the same line to your own `.env`:

| Variable | Default | What it does |
|---|---|---|
| `QDRANT_VERSION` | `latest` | Image tag from the [`qdrant/qdrant`](https://hub.docker.com/r/qdrant/qdrant) Docker Hub image. |
| `QDRANT_HOST_PORT` | `6333` | Host-side port for the REST API (container port `6333`). |
| `QDRANT_GRPC_PORT` | `6334` | Host-side port for the gRPC API (container port `6334`). |

Collections persist in the `qdrant` named Docker volume, mounted at `/qdrant/storage` inside the container, across restarts.

## Connect

REST API is at `http://localhost:6333`, health check `/healthz`, built-in dashboard at `/dashboard`. gRPC is on `6334`. From another container, use `http://qdrant:6333` (or `qdrant:6334` for gRPC).

## Check collection and cluster health

Qdrant reports collection state through the REST API, useful after a bulk import or to confirm indexing finished:

```bash
curl http://localhost:6333/collections/<collection_name>
```

The `status` field is `green` (fully indexed and ready), `yellow` (indexing/optimizing in the background, still usable), or `red` (something failed). The response also includes `vectors_count` and `points_count` so you can confirm an import actually landed.

To confirm the node itself is up before your app starts querying it:

```bash
curl http://localhost:6333/healthz
```

## Enable API key authentication

By default this container accepts unauthenticated requests from anyone who can reach its port, fine for local development but worth locking down if you expose it beyond your own machine. Set an API key in your `.env`:

```env
QDRANT__SERVICE__API_KEY=your-secret-key
```

Then apply it:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock restart qdrant
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose restart qdrant
```

</TabItem>
</Tabs>

Every REST and gRPC request then needs an `api-key` header:

```bash
curl -H "api-key: your-secret-key" http://localhost:6333/collections
```

Update your app's Qdrant client config with the same key, otherwise it starts getting `401 Unauthorized` responses after you turn this on.

## Backup and restore

Qdrant backs up data per collection via its built-in snapshot API rather than a file you copy off disk directly.

**Create a snapshot** of a collection:

```bash
curl -X POST http://localhost:6333/collections/<collection_name>/snapshots
```

**List existing snapshots** for a collection:

```bash
curl http://localhost:6333/collections/<collection_name>/snapshots
```

**Download a snapshot** to your host machine:

```bash
curl -o backup.snapshot http://localhost:6333/collections/<collection_name>/snapshots/<snapshot_name>
```

**Restore** a collection from a snapshot file by uploading it back through the same API (see the [Qdrant snapshot docs](https://qdrant.tech/documentation/concepts/snapshots/) for the exact recovery endpoint and options for your Qdrant version, since this has changed across releases). Keep the `.snapshot` file itself somewhere safe, it's the actual backup.

## Start completely fresh (wipe all data)

To throw away every collection and start Qdrant from a clean, empty state (⚠️ this **permanently deletes** everything in the `qdrant` volume, back up any collections you need first):

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock stop qdrant
./laradock remove qdrant
docker volume rm "${COMPOSE_PROJECT_NAME}_qdrant"
./laradock start qdrant
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose stop qdrant
docker compose rm -sf qdrant
docker volume rm "${COMPOSE_PROJECT_NAME}_qdrant"
docker compose up -d qdrant
```

</TabItem>
</Tabs>

Unlike bind-mounted services, Qdrant's storage lives in a **named Docker volume**, not a folder under `DATA_PATH_HOST`, so wiping it means removing the volume itself. If you're unsure of the exact volume name on your machine (it's prefixed with your `COMPOSE_PROJECT_NAME`), list it first with `docker volume ls | grep qdrant`.

## Talk to this database from another Laradock project

Each Laradock project is its own isolated Docker network by default, so a second project's containers can't reach this Qdrant by container name out of the box. Easiest fix: the REST and gRPC ports are already published (`QDRANT_HOST_PORT`, `QDRANT_GRPC_PORT`), so point the other project at your **host machine's** address instead of `qdrant`, for example `http://host.docker.internal:6333` (Docker Desktop). Make sure the two projects use different `QDRANT_HOST_PORT`/`QDRANT_GRPC_PORT` values if they're both running at once.

## Common issues

- **Dashboard shows no collections.** Collections are created via the API, not automatically. Create one first, either through the dashboard's "create collection" flow or a `PUT /collections/<name>` call.
- **gRPC client can't connect.** Confirm you're using port `6334`, not the REST port `6333`, gRPC and REST are separate ports on this image.
- **Port already in use on your host.** Change `QDRANT_HOST_PORT` or `QDRANT_GRPC_PORT` in `.env` and restart: `./laradock restart qdrant`.
- **App can't connect but the container is running.** Use the container name `qdrant`, not `localhost`, from inside another container.
- **Requests suddenly return `401 Unauthorized`.** You (or a teammate) set `QDRANT__SERVICE__API_KEY`. Add the matching `api-key` header to every request, or unset the variable and restart if auth wasn't intended.

---

Comparing vector databases? See **[Weaviate](/docs/services/weaviate)** and **[Chroma](/docs/services/chroma)**. New to Laradock? Start with **[Getting Started](/docs/getting-started)**.
