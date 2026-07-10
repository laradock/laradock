---
slug: /services/minio
title: MinIO
description: Run MinIO in Laradock as a local S3-compatible object store. Start the container, create a bucket, back up and restore data, and point your Laravel filesystem disk at it.
keywords:
  - laradock minio
  - minio docker
  - minio docker compose
  - s3 compatible storage docker
  - laravel s3 local
  - minio console
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

## What is MinIO?

[MinIO](https://min.io) is an open-source, S3-compatible object storage server. Laradock runs it locally so you can develop against `AWS_*`-style filesystem code (Laravel's `s3` disk, presigned URLs, multipart uploads) without touching a real AWS bucket.

## Start MinIO

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock start minio
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose up -d minio
```

</TabItem>
</Tabs>

## Stop MinIO

Stopping just pauses the container; **your data is safe**:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock stop minio
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose stop minio
```

</TabItem>
</Tabs>

To delete the container entirely (the data on disk is still untouched, it lives under `DATA_PATH_HOST`):

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock remove minio
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose rm -sf minio
```

</TabItem>
</Tabs>

## Configuration

Settings live in `minio/defaults.env` and can be overridden in your own `.env`:

| Variable | Default | What it does |
|---|---|---|
| `MINIO_PORT` | `9000` | Host port for the S3 API endpoint. |
| `MINIO_CONSOLE_PORT` | `9001` | Host port for the MinIO web console. |
| `MINIO_ROOT_USER` | `laradock` | Root access key (used as both username and S3 access key). |
| `MINIO_ROOT_PASSWORD` | `laradock` | Root secret key (used as both password and S3 secret key). |

Data is stored under `DATA_PATH_HOST/minio/data` (buckets/objects) and `DATA_PATH_HOST/minio/config` (server config), both mounted as volumes so they survive container restarts.

Unlike MySQL's root credentials, MinIO's root user/password aren't a one-time first-boot setting: MinIO reads `MINIO_ROOT_USER`/`MINIO_ROOT_PASSWORD` from the environment on **every** startup, so changing them in `.env` and restarting takes effect immediately, even against existing data.

## Open the console and create a bucket

Open [http://localhost:9001](http://localhost:9001) and log in with `MINIO_ROOT_USER` / `MINIO_ROOT_PASSWORD` (`laradock` / `laradock` by default). Create a bucket from the console UI, or from the [MinIO client](https://min.io/docs/minio/linux/reference/minio-mc.html) (`mc`) if you've installed it in the workspace container by setting `WORKSPACE_INSTALL_MC=true` in `.env` and rebuilding workspace:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock workspace
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose exec workspace bash
```

</TabItem>
</Tabs>

Then, inside the workspace shell:

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

## Backup and restore

MinIO stores every bucket and object as plain files under `DATA_PATH_HOST/minio/data`, so the simplest reliable backup is a filesystem copy of that folder while the container is stopped:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock stop minio
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose stop minio
```

</TabItem>
</Tabs>

```bash
cp -r "${DATA_PATH_HOST:-~/.laradock/data}/minio/data" ~/minio-backup
```

Then start it again:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock start minio
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose up -d minio
```

</TabItem>
</Tabs>

**Restore** the same way, in reverse: stop MinIO, replace the contents of `DATA_PATH_HOST/minio/data` with your backup, then start it again.

## Start completely fresh (wipe all data)

To throw away every bucket, object, and server config and start MinIO from a clean, empty state (⚠️ this **permanently deletes** everything, back up first if you need anything):

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock stop minio
./laradock remove minio
rm -rf "${DATA_PATH_HOST:-~/.laradock/data}/minio"
./laradock start minio
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose stop minio
docker compose rm -sf minio
rm -rf "${DATA_PATH_HOST:-~/.laradock/data}/minio"
docker compose up -d minio
```

</TabItem>
</Tabs>

`DATA_PATH_HOST` is whatever you have set in `.env` (`~/.laradock/data` by default). Deleting the `minio` folder removes both `data` (buckets/objects) and `config` (server state), so the next start is a genuinely fresh MinIO instance with no buckets and only the root user from `.env`.

## Talk to this bucket from another Laradock project

Each Laradock project is its own isolated Docker network by default, so a second project's containers can't reach this MinIO by container name out of the box. Easiest fix: publish the port (already done, `MINIO_PORT`) and have the other project connect to your **host machine's** address instead of `minio`, for example `AWS_URL=http://host.docker.internal:9000` (Docker Desktop) using this project's `MINIO_PORT`. Make sure the two projects use different `MINIO_PORT`/`MINIO_CONSOLE_PORT` values if they're both running at once.

## Common issues

- **App can't connect but the container is running.** Use `AWS_URL=http://minio:9000` (the container name), not `localhost`, that only works from your host machine, not from inside another container like `php-fpm` or `workspace`.
- **"Access Denied" from the S3 API.** Double-check `AWS_ACCESS_KEY_ID`/`AWS_SECRET_ACCESS_KEY` in your app's `.env` match `MINIO_ROOT_USER`/`MINIO_ROOT_PASSWORD` exactly.
- **`mc: command not found` in workspace.** Set `WORKSPACE_INSTALL_MC=true` in `.env` and `./laradock rebuild workspace`, it isn't installed by default.
- **Console loads but shows no buckets you expect.** Confirm you're browsing the same MinIO instance your app writes to, if you've reset `DATA_PATH_HOST` or run multiple Laradock projects, buckets don't carry over.
- **Port already in use on your host.** Change `MINIO_PORT` or `MINIO_CONSOLE_PORT` in `.env` and restart: `./laradock restart minio`.

---

Need image resizing on top of your object store? See **[Thumbor](/docs/services/thumbor)**. New to Laradock? Start at **[Getting Started](/docs/getting-started)**.
