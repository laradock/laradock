---
slug: /services/thumbor
title: Thumbor
description: Run Thumbor in Laradock for on-the-fly image cropping, resizing, and smart processing. Start the container and configure loaders, storage, and limits.
keywords:
  - laradock thumbor
  - thumbor docker
  - thumbor docker compose
  - image resizing docker
  - smart image cropping
  - thumbor security key
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

## What is Thumbor?

[Thumbor](https://github.com/thumbor/thumbor) is an open-source smart imaging service: it crops, resizes, and flips images on demand via URL parameters, with pluggable loaders and storage backends (filesystem, Redis, MongoDB, S3-compatible).

## Start Thumbor

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock start thumbor
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose up -d thumbor
```

</TabItem>
</Tabs>

## Stop Thumbor

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock stop thumbor
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose stop thumbor
```

</TabItem>
</Tabs>

To delete the container entirely (the cached images on disk are untouched, they live under `DATA_PATH_HOST`):

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock remove thumbor
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose rm -sf thumbor
```

</TabItem>
</Tabs>

## Configuration

Thumbor exposes nearly every native Thumbor setting as an env var in `thumbor/defaults.env`. The most commonly changed ones:

| Variable | Default | What it does |
|---|---|---|
| `THUMBOR_PORT` | `8000` | Host port Thumbor is published on. |
| `SECURITY_KEY` | `MY_SECURE_KEY` | Signing key for generated URLs. Change this before using anything beyond local dev. |
| `ALLOW_UNSAFE_URL` | `True` | Allows `/unsafe/` URLs that skip signature verification. Convenient locally, disable it for anything public. |
| `MAX_WIDTH` / `MAX_HEIGHT` | `0` | Maximum output dimensions (`0` = unlimited). |
| `MIN_WIDTH` / `MIN_HEIGHT` | `1` | Minimum output dimensions. |
| `QUALITY` | `80` | JPEG output quality (0-100). |
| `LOADER` | `thumbor.loaders.http_loader` | Where Thumbor fetches source images from (HTTP by default). |
| `STORAGE` | `thumbor.storages.file_storage` | Where Thumbor caches source images (`FILE_STORAGE_ROOT_PATH=/data/storage`). |
| `RESULT_STORAGE` | `thumbor.result_storages.file_storage` | Where Thumbor caches generated results (`RESULT_STORAGE_FILE_STORAGE_ROOT_PATH=/data/result_storage`). |
| `ENGINE` | `thumbor.engines.pil` | Image processing engine. |
| `ALLOWED_SOURCES` | `[]` | Optional allow-list of source hostnames/patterns Thumbor will fetch from. |

There are dozens more (Redis/MongoDB storage hosts, S3-compatible `TC_AWS_*` settings, HTTP loader timeouts and proxy settings, upload handling, Sentry error reporting), all listed in `thumbor/defaults.env` and passed straight through as environment variables in `thumbor/compose.yml`.

Everything Thumbor writes to disk (file-based source/result storage, logs) lives under `${DATA_PATH_HOST}/thumbor/data` on your host, mounted into the container at `/data`.

## Apply a configuration change

Env var changes in `.env` are only picked up when the container is recreated, a plain restart isn't enough. Re-run the start command after editing `.env`:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock start thumbor
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose up -d thumbor
```

</TabItem>
</Tabs>

## Try it out

```
http://localhost:8000/unsafe/300x300/i.imgur.com/bvjzPct.jpg
```

`/unsafe/` only works while `ALLOW_UNSAFE_URL=True`. For signed URLs, generate them with your `SECURITY_KEY` using a [Thumbor URL-signing library](https://thumbor.readthedocs.io/en/latest/libraries.html) for your language.

## Health check

Thumbor ships a built-in health endpoint that returns `200 OK` with the body `WORKING` when the service is up, useful for load balancers, uptime checks, or just confirming the container is actually serving requests:

```
http://localhost:8000/healthcheck
```

## Use Redis or MongoDB for storage

By default Thumbor caches source and result images to the filesystem (`FILE_STORAGE_ROOT_PATH`/`RESULT_STORAGE_FILE_STORAGE_ROOT_PATH`). If you're already running Laradock's `redis` or `mongo` services, Thumbor's Redis/Mongo storage env vars already default to those container names (`REDIS_STORAGE_SERVER_HOST=redis`, `MONGO_STORAGE_SERVER_HOST=mongo`), so switching backends is just a `STORAGE`/`RESULT_STORAGE` change plus starting the backend service alongside Thumbor:

```env
STORAGE=thumbor.storages.redis_storage
RESULT_STORAGE=thumbor.result_storages.redis_storage
```

```bash
./laradock start thumbor redis
```

Swap in `thumbor.storages.mongo_storage` / `thumbor.result_storages.mongo_storage` for MongoDB instead, and start `mongo` alongside it. Sharing a storage backend across multiple Thumbor instances (e.g. behind a load balancer) is the main reason to move off the filesystem default.

## Clear the on-disk cache

Thumbor caches source images and generated results by URL under `${DATA_PATH_HOST}/thumbor/data`. If you've overwritten an image at the same source URL and need Thumbor to stop serving a stale result before `STORAGE_EXPIRATION_SECONDS`/`RESULT_STORAGE_EXPIRATION_SECONDS` naturally expires it, clear the cache directories directly:

```bash
rm -rf "${DATA_PATH_HOST:-~/.laradock/data}/thumbor/data/storage" "${DATA_PATH_HOST:-~/.laradock/data}/thumbor/data/result_storage"
```

This only clears the file-based cache. If you've switched `STORAGE`/`RESULT_STORAGE` to Redis or MongoDB (see above), flush or clear that backend instead.

## Common issues

- **Images never resize, just pass through.** Check `./laradock logs thumbor` for loader errors, if `LOADER` can't reach the source URL (network, DNS, or `ALLOWED_SOURCES` blocking it), Thumbor fails the request rather than silently serving the original.
- **Signed URLs stop validating after changing `SECURITY_KEY`.** Any URL signed with the old key becomes invalid immediately, this is expected: re-sign URLs after rotating the key.
- **Result cache never seems to update for a source image that changed.** Thumbor caches by URL, if you overwrite an image at the same source URL, cached results won't reflect the change until `STORAGE_EXPIRATION_SECONDS`/`RESULT_STORAGE_EXPIRATION_SECONDS` expire it, or you [clear the cache](#clear-the-on-disk-cache) manually.
- **Config changes in `.env` don't seem to apply.** A plain `./laradock restart thumbor` doesn't re-read `.env`, [recreate the container](#apply-a-configuration-change) instead.
- **Port already in use on your host.** Change `THUMBOR_PORT` in `.env` and restart: `./laradock start thumbor`.

---

Need S3-compatible storage to serve source images from? See **[MinIO](/docs/services/minio)**. New to Laradock? Start at **[Getting Started](/docs/getting-started)**.
