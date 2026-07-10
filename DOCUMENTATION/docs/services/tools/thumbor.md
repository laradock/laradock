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

## What is Thumbor?

[Thumbor](https://github.com/thumbor/thumbor) is an open-source smart imaging service: it crops, resizes, and flips images on demand via URL parameters, with pluggable loaders and storage backends (filesystem, Redis, MongoDB, S3-compatible).

## Start Thumbor

```bash
docker compose up -d thumbor
```

## Stop Thumbor

```bash
docker compose stop thumbor
```

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

## Try it out

```bash
docker compose up -d thumbor
```

```
http://localhost:8000/unsafe/300x300/i.imgur.com/bvjzPct.jpg
```

`/unsafe/` only works while `ALLOW_UNSAFE_URL=True`. For signed URLs, generate them with your `SECURITY_KEY` using a [Thumbor URL-signing library](https://thumbor.readthedocs.io/en/latest/libraries.html) for your language.

## Common issues

- **Images never resize, just pass through.** Check `docker compose logs thumbor` for loader errors, if `LOADER` can't reach the source URL (network, DNS, or `ALLOWED_SOURCES` blocking it), Thumbor fails the request rather than silently serving the original.
- **Signed URLs stop validating after changing `SECURITY_KEY`.** Any URL signed with the old key becomes invalid immediately, this is expected: re-sign URLs after rotating the key.
- **Result cache never seems to update for a source image that changed.** Thumbor caches by URL, if you overwrite an image at the same source URL, cached results won't reflect the change until `STORAGE_EXPIRATION_SECONDS`/`RESULT_STORAGE_EXPIRATION_SECONDS` expire it.
- **Port already in use on your host.** Change `THUMBOR_PORT` in `.env` and restart: `docker compose up -d thumbor`.

---

Need S3-compatible storage to serve source images from? See **[MinIO](/docs/services/minio)**. New to Laradock? Start at **[Getting Started](/docs/getting-started)**.
