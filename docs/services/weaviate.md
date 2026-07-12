# Weaviate

Source: https://laradock.io/docs/services/weaviate

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

## What is Weaviate?

[Weaviate](https://weaviate.io) is an open-source vector database with REST and GraphQL APIs, used for embeddings and RAG (retrieval-augmented generation) from PHP over plain HTTP. Unlike some vector databases, it ships GraphQL as a first-class query interface alongside REST.

## Start Weaviate

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock start weaviate
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose up -d weaviate
```

</TabItem>
</Tabs>

Your data is created on first start and kept between restarts, in a Docker volume (not a `DATA_PATH_HOST` bind mount). Name any other services alongside it to start them together, for example `./laradock start weaviate workspace`.

## Stop Weaviate

Stopping just pauses the container; **your data is safe**:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock stop weaviate
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose stop weaviate
```

</TabItem>
</Tabs>

To delete the container entirely (the data on disk, in the `weaviate` volume, is still untouched):

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock remove weaviate
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose rm -sf weaviate
```

</TabItem>
</Tabs>

## Configuration

All settings live in `weaviate/defaults.env` and can be overridden by adding the same line to your own `.env`:

| Variable | Default | What it does |
|---|---|---|
| `WEAVIATE_VERSION` | `1.38.2` | Image tag from [`cr.weaviate.io/semitechnologies/weaviate`](https://weaviate.io/developers/weaviate). |
| `WEAVIATE_HOST_PORT` | `8085` | Host-side port Weaviate is published on (container port `8080`). |

`weaviate/compose.yml` also sets, directly in the container environment: `AUTHENTICATION_ANONYMOUS_ACCESS_ENABLED=true` (no auth needed by default), `DEFAULT_VECTORIZER_MODULE=none` (you supply your own vectors/embeddings rather than Weaviate generating them), and `QUERY_DEFAULTS_LIMIT=25`. Data persists at `/var/lib/weaviate` in the `weaviate` volume.

## Change the Weaviate version

Set the version in your `.env`:

```env
WEAVIATE_VERSION=1.37.0
```

Then apply it, this recreates the container and pulls the new image tag automatically:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock start weaviate
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose up -d weaviate
```

</TabItem>
</Tabs>

## Connect

Reachable at `http://localhost:8085`, REST endpoints under `/v1`, GraphQL at `/v1/graphql`. Anonymous access is on by default, no API key needed for local dev. From another container, use `http://weaviate:8080`.

## Check status and version

Weaviate's own health/meta endpoints, useful for confirming the cluster came up cleanly before your app starts querying it:

```bash
curl http://localhost:8085/v1/.well-known/ready
curl http://localhost:8085/v1/.well-known/live
curl http://localhost:8085/v1/meta
```

`/v1/.well-known/ready` returns `200` once Weaviate can serve traffic (empty body); `/v1/meta` returns JSON with the running version and enabled modules, handy for confirming `WEAVIATE_VERSION` actually took effect after a version bump.

## Enable API key authentication

`AUTHENTICATION_ANONYMOUS_ACCESS_ENABLED=true` in `weaviate/compose.yml` means anyone who can reach the container can read and write data, fine for local dev, not for anything you'd expose beyond your own machine. To require an API key, edit the `environment:` block in `weaviate/compose.yml`:

```yaml
- AUTHENTICATION_ANONYMOUS_ACCESS_ENABLED=false
- AUTHENTICATION_APIKEY_ENABLED=true
- AUTHENTICATION_APIKEY_ALLOWED_KEYS=your-secret-key
- AUTHENTICATION_APIKEY_USERS=admin@example.com
```

Then apply it:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock start weaviate
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose up -d weaviate
```

</TabItem>
</Tabs>

Clients then need `Authorization: Bearer your-secret-key` on every request.

## Backup and restore

Weaviate's data lives in the `weaviate` Docker volume rather than a host path, so back it up by copying the volume's contents out of the running container:

```bash
docker compose cp weaviate:/var/lib/weaviate ./weaviate-backup
```

To restore into a fresh container, stop it first so nothing is writing to disk mid-copy:

```bash
./laradock stop weaviate
docker compose cp ./weaviate-backup/. weaviate:/var/lib/weaviate
./laradock start weaviate
```

There's no dedicated `./laradock` verb for copying files in and out of a container, `docker compose cp` is the same either way.

## Start completely fresh (wipe all data)

To throw away every collection and object and start Weaviate from a clean, empty state (⚠️ this **permanently deletes** everything in this container, back up first if you need anything):

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock stop weaviate
./laradock remove weaviate
docker volume rm $(docker volume ls -q --filter name=_weaviate$)
./laradock start weaviate
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose stop weaviate
docker compose rm -sf weaviate
docker volume rm $(docker volume ls -q --filter name=_weaviate$)
docker compose up -d weaviate
```

</TabItem>
</Tabs>

The volume is named `<project>_weaviate` (the `<project>` prefix is your `COMPOSE_PROJECT_NAME`), the filter above matches it regardless of what your project is named. Deleting it and starting again is equivalent to a brand-new install: no collections, no objects.

## Talk to this database from another Laradock project

Each Laradock project is its own isolated Docker network by default, so a second project's containers can't reach this Weaviate by container name out of the box. Easiest fix: publish the port (already done, `WEAVIATE_HOST_PORT`) and have the other project connect to your **host machine's** address instead of `weaviate`, for example `http://host.docker.internal:8085` (Docker Desktop). Make sure the two projects use different `WEAVIATE_HOST_PORT` values if they're both running at once.

## Common issues

- **Objects rejected for missing a vector.** `DEFAULT_VECTORIZER_MODULE=none` means Weaviate expects you to provide vectors yourself (e.g. from OpenAI, Ollama, or your own embedding model); it won't generate them for you unless you enable and configure a vectorizer module.
- **Query returns fewer results than expected.** `QUERY_DEFAULTS_LIMIT=25` caps default query results; pass an explicit `limit` in your query if you need more.
- **Port already in use on your host.** Change `WEAVIATE_HOST_PORT` in `.env` and restart: `./laradock restart weaviate`.
- **App can't connect but the container is running.** Use the container name `weaviate` on port `8080`, not `localhost`, from inside another container.
- **Anyone can read or write your data.** Anonymous access is on by default (see [Enable API key authentication](#enable-api-key-authentication) above), fine for local dev, not for anything reachable beyond your own machine.

---

Comparing vector databases? See **[Qdrant](https://laradock.io/docs/services/qdrant)** and **[Chroma](https://laradock.io/docs/services/chroma)**. New to Laradock? Start with **[Getting Started](https://laradock.io/docs/getting-started)**.
