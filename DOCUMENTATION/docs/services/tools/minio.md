---
slug: /services/minio
title: MinIO
description: Run MinIO in Laradock as a local S3-compatible object store. Start the container, create a bucket, and point your Laravel filesystem disk at it.
keywords:
  - laradock minio
  - minio docker
  - minio docker compose
  - s3 compatible storage docker
  - laravel s3 local
  - minio console
---

## What is MinIO?

[MinIO](https://min.io) is an open-source, S3-compatible object storage server. Laradock runs it locally so you can develop against `AWS_*`-style filesystem code (Laravel's `s3` disk, presigned URLs, multipart uploads) without touching a real AWS bucket.

## Start MinIO

```bash
docker compose up -d minio
```

## Stop MinIO

```bash
docker compose stop minio
```

## Configuration

Settings live in `minio/defaults.env` and can be overridden in your own `.env`:

| Variable | Default | What it does |
|---|---|---|
| `MINIO_PORT` | `9000` | Host port for the S3 API endpoint. |
| `MINIO_CONSOLE_PORT` | `9001` | Host port for the MinIO web console. |
| `MINIO_ROOT_USER` | `laradock` | Root access key (used as both username and S3 access key). |
| `MINIO_ROOT_PASSWORD` | `laradock` | Root secret key (used as both password and S3 secret key). |

Data is stored under `DATA_PATH_HOST/minio/data` (buckets/objects) and `DATA_PATH_HOST/minio/config` (server config), both mounted as volumes so they survive container restarts.

## Open the console and create a bucket

Open [http://localhost:9001](http://localhost:9001) and log in with `MINIO_ROOT_USER` / `MINIO_ROOT_PASSWORD` (`laradock` / `laradock` by default). Create a bucket from the console UI, or from the [MinIO client](https://min.io/docs/minio/linux/reference/minio-mc.html) if you've installed it in the workspace container with `WORKSPACE_INSTALL_MC=true`:

```bash
mc alias set local http://minio:9000 laradock laradock
mc mb local/your-bucket
```

The S3 API itself is on port `9000` (`MINIO_PORT`), not `9001`, if you're testing the API directly with `curl` or an S3 client.

## Point a Laravel app at it

```env
AWS_URL=http://minio:9000
AWS_ACCESS_KEY_ID=laradock
AWS_SECRET_ACCESS_KEY=laradock
AWS_DEFAULT_REGION=us-east-1
AWS_BUCKET=your-bucket
AWS_USE_PATH_STYLE_ENDPOINT=true
```

```php
's3' => [
    'driver' => 's3',
    'key' => env('AWS_ACCESS_KEY_ID'),
    'secret' => env('AWS_SECRET_ACCESS_KEY'),
    'region' => env('AWS_DEFAULT_REGION'),
    'bucket' => env('AWS_BUCKET'),
    'endpoint' => env('AWS_URL'),
    'use_path_style_endpoint' => env('AWS_USE_PATH_STYLE_ENDPOINT', false),
],
```

`AWS_USE_PATH_STYLE_ENDPOINT=true` is required for local MinIO (it doesn't support virtual-hosted-style bucket addressing out of the box), don't carry it over to a real AWS S3 config.

## Common issues

- **App can't connect but the container is running.** Use `AWS_URL=http://minio:9000` (the container name), not `localhost`, that only works from your host machine, not from inside another container like `php-fpm` or `workspace`.
- **"Access Denied" from the S3 API.** Double-check `AWS_ACCESS_KEY_ID`/`AWS_SECRET_ACCESS_KEY` in your app's `.env` match `MINIO_ROOT_USER`/`MINIO_ROOT_PASSWORD` exactly.
- **Console loads but shows no buckets you expect.** Confirm you're browsing the same MinIO instance your app writes to, if you've reset `DATA_PATH_HOST` or run multiple Laradock projects, buckets don't carry over.
- **Port already in use on your host.** Change `MINIO_PORT` or `MINIO_CONSOLE_PORT` in `.env` and restart: `docker compose up -d minio`.

---

Need image resizing on top of your object store? See **[Thumbor](/docs/services/thumbor)**. New to Laradock? Start at **[Getting Started](/docs/getting-started)**.
