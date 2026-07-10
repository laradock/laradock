---
slug: /services/typesense
title: Typesense
description: Run Typesense in Laradock. Start the container, configure the API key, back up and restore via snapshots, and use it as a fast, typo-tolerant Laravel Scout driver.
keywords:
  - laradock typesense
  - typesense docker
  - typesense docker compose
  - typesense laravel scout
  - typesense api key
  - typesense backup snapshot
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

## What is Typesense?

[Typesense](https://typesense.org) is a fast, typo-tolerant open-source search engine and a drop-in [Laravel Scout](https://laravel.com/docs/scout) driver. It's designed to be simple to run and tune compared to Elasticsearch, with sensible defaults for instant, as-you-type search.

## Start Typesense

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock start typesense
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose up -d typesense
```

</TabItem>
</Tabs>

Your data is created on first start and kept between restarts. Name any other services alongside it to start them together, for example `./laradock start typesense workspace`.

## Stop Typesense

Stopping just pauses the container; **your data is safe**:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock stop typesense
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose stop typesense
```

</TabItem>
</Tabs>

To delete the container entirely (the data on disk is still untouched, it lives under `DATA_PATH_HOST/typesense`):

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock remove typesense
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose rm -sf typesense
```

</TabItem>
</Tabs>

## Configuration

All settings live in `typesense/defaults.env` and can be overridden by adding the same line to your own `.env` (your `.env` always wins):

| Variable | Default | What it does |
|---|---|---|
| `TYPESENSE_VERSION` | `30.2` | Image tag from the [`typesense/typesense`](https://hub.docker.com/r/typesense/typesense) Docker Hub image. |
| `TYPESENSE_HOST_PORT` | `8108` | Host-side port Typesense is published on (container port `8108`). |
| `TYPESENSE_API_KEY` | `typesense` | API key required on every request; change it for anything beyond local dev. |
| `TYPESENSE_ENABLE_CORS` | `true` | Whether to allow cross-origin requests, useful when calling the API directly from a browser-based frontend. |

## Change the Typesense version

Set the version in your `.env`:

```env
TYPESENSE_VERSION=27.1
```

Then apply the change:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock rebuild typesense
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose build typesense
```

</TabItem>
</Tabs>

If you're crossing a major version, take a [snapshot](#backup-and-restore-snapshots) first. Data compatibility across major Typesense versions isn't guaranteed, so having a restorable backup before you upgrade is the safe move.

## Change the API key

Set a new key in your `.env`:

```env
TYPESENSE_API_KEY=your-own-long-random-key
```

Then restart so the container picks it up:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock restart typesense
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose restart typesense
```

</TabItem>
</Tabs>

Update every client (your app's `.env`, Laravel Scout config, any other Laradock project pointed at this instance) with the new key, they'll get `401`s until they match.

## Connect

The API is available at [http://localhost:8108](http://localhost:8108). Check it's up with:

```bash
curl http://localhost:8108/health
```

Every request needs the API key, sent as the `X-TYPESENSE-API-KEY` header. From another container use `http://typesense:8108`.

## Check cluster health and stats

Beyond the basic `/health` check above, Typesense exposes two more useful endpoints, both need the API key header:

```bash
curl -H "X-TYPESENSE-API-KEY: typesense" http://localhost:8108/stats.json
```

Returns request latency and rate stats (searches, writes, imports per second).

```bash
curl -H "X-TYPESENSE-API-KEY: typesense" http://localhost:8108/metrics.json
```

Returns system-level metrics for the container: CPU, memory, disk, and network usage. Useful for spotting a collection that's outgrown its container's memory before it starts throwing errors.

## List your collections

```bash
curl -H "X-TYPESENSE-API-KEY: typesense" http://localhost:8108/collections
```

Returns every collection (Typesense's equivalent of a table/index) with its schema and document count, handy for confirming Laravel Scout actually created the collection you expect.

## Backup and restore (snapshots)

Typesense's built-in snapshot mechanism is the supported way to back up: it writes a consistent point-in-time copy of `/data` to a path you choose inside the container. It's just an HTTP call, no need to open a shell in the container, run it from your host:

```bash
curl -X POST -H "X-TYPESENSE-API-KEY: typesense" \
  "http://localhost:8108/operations/snapshot?snapshot_path=/data/snapshots/$(date +%Y%m%d)"
```

This creates the snapshot under `/data/snapshots/...` inside the container, which is `DATA_PATH_HOST/typesense/snapshots/...` on your host since `/data` is the mounted volume. Copy that folder out (or back it up like any other file) to keep it safe.

To restore, stop the container, replace the contents of `DATA_PATH_HOST/typesense` on your host with a snapshot folder's contents, then start it again:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock stop typesense
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose stop typesense
```

</TabItem>
</Tabs>

```bash
rm -rf "${DATA_PATH_HOST:-~/.laradock/data}/typesense"
cp -r "${DATA_PATH_HOST:-~/.laradock/data}/typesense/snapshots/20260710" "${DATA_PATH_HOST:-~/.laradock/data}/typesense"
```

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock start typesense
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose up -d typesense
```

</TabItem>
</Tabs>

## Start completely fresh (wipe all data)

To throw away every collection and start Typesense from a clean, empty state (this **permanently deletes** everything, take a [snapshot](#backup-and-restore-snapshots) first if you need anything):

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock stop typesense
./laradock remove typesense
rm -rf "${DATA_PATH_HOST:-~/.laradock/data}/typesense"
./laradock start typesense
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose stop typesense
docker compose rm -sf typesense
rm -rf "${DATA_PATH_HOST:-~/.laradock/data}/typesense"
docker compose up -d typesense
```

</TabItem>
</Tabs>

`DATA_PATH_HOST` is whatever you have set in `.env` (`~/.laradock/data` by default), so the folder above is where every Typesense collection actually lives on your machine. After this, re-run whatever seeds/imports your app uses to rebuild collections (e.g. Laravel Scout's `php artisan scout:import`).

## Talk to this from another Laradock project

Each Laradock project is its own isolated Docker network by default, so a second project's containers can't reach this Typesense by container name out of the box. Easiest fix: publish the port (already done, `TYPESENSE_HOST_PORT`) and have the other project connect to your **host machine's** address instead of `typesense`, for example `TYPESENSE_HOST=host.docker.internal` (Docker Desktop) with the port set to this project's `TYPESENSE_HOST_PORT`, and the matching `TYPESENSE_API_KEY`. Make sure the two projects use different `TYPESENSE_HOST_PORT` values if they're both running at once.

## Common issues

- **401 on every request.** Missing or wrong `X-TYPESENSE-API-KEY` header, check it matches `TYPESENSE_API_KEY`.
- **Browser requests blocked by CORS.** Confirm `TYPESENSE_ENABLE_CORS=true` (the default) if you're calling the API directly from frontend JavaScript rather than through your backend.
- **API key changes don't take effect.** Restart the container after changing `TYPESENSE_API_KEY` in `.env`: `./laradock restart typesense`.
- **App can't connect but the container is running.** Use the container name `typesense`, not `localhost`, from inside another container.
- **Port already in use on your host.** Another local Typesense (or another Laradock project) is already bound to `8108`. Change `TYPESENSE_HOST_PORT` in `.env` and restart: `./laradock restart typesense`.

---

Prefer a search engine with a broader plugin ecosystem? See **[Elasticsearch](/docs/services/elasticsearch)** or **[MeiliSearch](/docs/services/meilisearch)**. New to Laradock? Start with **[Getting Started](/docs/getting-started)**.
