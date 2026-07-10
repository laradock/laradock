---
slug: /services/meilisearch
title: MeiliSearch
description: Run MeiliSearch in Laradock. Start the container, configure the master key, back up and restore your indexes, and connect it as a Laravel Scout driver.
keywords:
  - laradock meilisearch
  - meilisearch docker
  - meilisearch docker compose
  - meilisearch laravel scout
  - meilisearch master key
  - meilisearch backup
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

## What is MeiliSearch?

[MeiliSearch](https://www.meilisearch.com) is a fast, open-source search engine built for developer experience: typo tolerance, instant results, and a simple REST API. It's a popular [Laravel Scout](https://laravel.com/docs/scout) driver for adding full-text search without the operational overhead of Elasticsearch.

## Start MeiliSearch

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock start meilisearch
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose up -d meilisearch
```

</TabItem>
</Tabs>

Your indexes are created on first start and kept between restarts under `DATA_PATH_HOST/meilisearch`. Name any other services alongside it to start them together, for example `./laradock start meilisearch workspace`.

## Stop MeiliSearch

Stopping just pauses the container; **your indexes are safe**:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock stop meilisearch
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose stop meilisearch
```

</TabItem>
</Tabs>

To delete the container entirely (the data on disk is still untouched, it lives under `DATA_PATH_HOST`):

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock remove meilisearch
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose rm -sf meilisearch
```

</TabItem>
</Tabs>

## Configuration

All settings live in `meilisearch/defaults.env` and can be overridden by adding the same line to your own `.env`:

| Variable | Default | What it does |
|---|---|---|
| `MEILISEARCH_HOST_PORT` | `7700` | Host-side port MeiliSearch is published on (container port `7700`). |
| `MEILISEARCH_KEY` | `masterkey` | Passed to the container as `MEILI_MASTER_KEY`, the admin key for the instance. |

Note the image itself isn't version-pinned in `meilisearch/compose.yml`, it always pulls `getmeili/meilisearch:latest`.

## Connect

Open [http://localhost:7700](http://localhost:7700) for the built-in web UI, or point Laravel Scout / any HTTP client at that same URL with the master key `masterkey` (or your own `MEILISEARCH_KEY`) as the API key. From another container use `http://meilisearch:7700`.

## Check health and stats

Before debugging a "search isn't working" issue in your app, confirm the engine itself is healthy:

```bash
curl http://localhost:7700/health
curl http://localhost:7700/version
curl -H "Authorization: Bearer masterkey" http://localhost:7700/stats
```

`/health` returns `{"status":"available"}` when it's ready to take requests. `/stats` (needs the master key) reports database size and per-index document counts, useful for spotting an index that silently stopped growing or a database approaching disk limits.

## Backup and restore

MeiliSearch's entire database (indexes, settings, tasks) lives in the single folder mounted at `DATA_PATH_HOST/meilisearch` (container path `/data.ms`), so the simplest reliable backup is a filesystem copy taken while the container is stopped:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock stop meilisearch
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose stop meilisearch
```

</TabItem>
</Tabs>

```bash
cp -a "${DATA_PATH_HOST:-~/.laradock/data}/meilisearch" ./meilisearch-backup
```

Then start it back up:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock start meilisearch
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose up -d meilisearch
```

</TabItem>
</Tabs>

To restore, stop the container, replace the contents of `DATA_PATH_HOST/meilisearch` with your backup folder, then start it again. For a live backup without downtime, MeiliSearch also exposes a [dumps API](https://www.meilisearch.com/docs/reference/api/dump) (`POST /dumps`), useful when you can't afford to stop the container but want a point-in-time export.

## Start completely fresh (wipe all data)

To throw away every index and start MeiliSearch from a clean, empty state (⚠️ this **permanently deletes** everything in this instance, back up first if you need anything):

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock stop meilisearch
./laradock remove meilisearch
rm -rf "${DATA_PATH_HOST:-~/.laradock/data}/meilisearch"
./laradock start meilisearch
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose stop meilisearch
docker compose rm -sf meilisearch
rm -rf "${DATA_PATH_HOST:-~/.laradock/data}/meilisearch"
docker compose up -d meilisearch
```

</TabItem>
</Tabs>

`DATA_PATH_HOST` is whatever you have set in `.env` (`~/.laradock/data` by default), so the folder above is where MeiliSearch's indexes actually live on your machine. After this, re-index your app's searchable models (for Laravel Scout, `php artisan scout:import "App\\Models\\YourModel"`).

## Pin a specific version

`meilisearch/compose.yml` always pulls `getmeili/meilisearch:latest`, there's no `MEILISEARCH_VERSION` variable to set in `.env`. For a reproducible setup, edit the `image:` line in `meilisearch/compose.yml` directly to a specific tag, for example `getmeili/meilisearch:v1.9`, then rebuild:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock rebuild meilisearch
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose build meilisearch
```

</TabItem>
</Tabs>

## Talk to this search index from another Laradock project

Each Laradock project is its own isolated Docker network by default, so a second project's containers can't reach this MeiliSearch by container name out of the box. Easiest fix: publish the port (already done, `MEILISEARCH_HOST_PORT`) and have the other project connect to your **host machine's** address instead of `meilisearch`, for example `MEILISEARCH_HOST=http://host.docker.internal:7700` (Docker Desktop). Make sure the two projects use different `MEILISEARCH_HOST_PORT` values if they're both running at once.

## Common issues

- **401/403 on every request.** You need the master key as a Bearer token (`Authorization: Bearer masterkey`) for any write or protected endpoint.
- **Master key changed but old key still works, or vice versa.** MeiliSearch reads `MEILI_MASTER_KEY` at container start; restart the container (`./laradock restart meilisearch`) after changing `MEILISEARCH_KEY` in `.env`.
- **Image updates unexpectedly.** Because `meilisearch/compose.yml` pins `:latest` rather than reading a version variable, a plain `docker compose pull` can bump you to a new MeiliSearch major version. [Pin a specific tag](#pin-a-specific-version) yourself if you need reproducibility.
- **Index looks stale or empty after a Scout sync.** Check `/stats` (see [Check health and stats](#check-health-and-stats)) to confirm documents actually landed, then re-run `php artisan scout:import` for the affected model.
- **App can't connect but the container is running.** Use the container name `meilisearch`, not `localhost`, from inside another container.

---

Prefer typo-tolerant search with more filtering options? See **[Typesense](/docs/services/typesense)**. New to Laradock? Start with **[Getting Started](/docs/getting-started)**.
