---
slug: /services/influxdb
title: InfluxDB
description: Run InfluxDB in Laradock for high-volume time-series metrics, events, and IoT/analytics data, and chart it with Grafana.
keywords:
  - laradock influxdb
  - influxdb docker
  - influxdb docker compose
  - time series database docker
  - influxdb grafana docker
  - influxdb 2 docker
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

## What is InfluxDB?

[InfluxDB](https://www.influxdata.com) is an open-source time-series database purpose-built for high-volume metrics, events, and IoT/analytics data. It's commonly paired with Grafana for dashboards. Laradock builds it (InfluxDB 2.x) as its own container from the official image.

## Start InfluxDB

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock start influxdb
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose up -d influxdb
```

</TabItem>
</Tabs>

Your organization, bucket, and admin user are created on first boot and kept between restarts. Name any other services alongside it to start them together, for example `./laradock start influxdb workspace`.

## Stop InfluxDB

Stopping just pauses the container; **your data is safe** (kept in the `influxdb` volume):

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock stop influxdb
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose stop influxdb
```

</TabItem>
</Tabs>

To delete the container entirely (the data in the `influxdb` volume is still untouched):

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock remove influxdb
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose rm -sf influxdb
```

</TabItem>
</Tabs>

## Configuration

All settings live in `influxdb/defaults.env` and can be overridden by adding the same line to your own `.env`:

| Variable | Default | What it does |
|---|---|---|
| `INFLUXDB_VERSION` | `2.7` | Image version built via `influxdb/Dockerfile`. |
| `INFLUXDB_HOST_PORT` | `8086` | Host-side port InfluxDB is published on (container port `8086`). |
| `INFLUXDB_INIT_USERNAME` | `laradock` | Admin username created on first boot. |
| `INFLUXDB_INIT_PASSWORD` | `secretpassword` | Password for that admin user. |
| `INFLUXDB_INIT_ORG` | `laradock` | Organization created on first boot. |
| `INFLUXDB_INIT_BUCKET` | `default` | Bucket (database) created on first boot. |

These map directly to InfluxDB's own `DOCKER_INFLUXDB_INIT_*` environment variables (set in `influxdb/compose.yml`), with `DOCKER_INFLUXDB_INIT_MODE=setup` triggering the automatic first-run setup. Data itself persists in the `influxdb` **named Docker volume**, mounted at `/var/lib/influxdb2` inside the container, not a `DATA_PATH_HOST` folder.

## Connect

Open the UI and API at [http://localhost:8086](http://localhost:8086); check readiness with `curl http://localhost:8086/health`. Log in with `INFLUXDB_INIT_USERNAME`/`INFLUXDB_INIT_PASSWORD`, org `INFLUXDB_INIT_ORG`, bucket `INFLUXDB_INIT_BUCKET`. From another container, use `http://influxdb:8086`. The UI login is username/password, but the write and query **APIs** (and any client library, including Grafana's InfluxDB data source) need a token instead, see [Get an API token](#get-an-api-token) below.

## Get an API token

`influxdb/compose.yml` doesn't pin `DOCKER_INFLUXDB_INIT_ADMIN_TOKEN`, so InfluxDB generates a random all-access token during first-run setup rather than a predictable one. The official image also writes a CLI config pointing at that token, so the `influx` CLI works inside the container without any extra flags.

Open a terminal inside the container and list existing tokens:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock enter influxdb
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose exec influxdb bash
```

</TabItem>
</Tabs>

Then, inside the container:

```bash
influx auth list
```

Or from the UI: log in at [http://localhost:8086](http://localhost:8086), then **Load Data > API Tokens** to view or copy one. Use the token in an `Authorization: Token <token>` header on API requests, or paste it into Grafana's InfluxDB data source config.

To create a new, separate token instead of reusing the auto-generated one:

```bash
influx auth create --org laradock --all-access
```

## Buckets and retention

A bucket is InfluxDB 2.x's unit of storage, roughly a database and a retention period combined. `INFLUXDB_INIT_BUCKET` only creates one bucket on first boot; day-to-day you'll likely want more, each with its own retention.

List existing buckets (run after `./laradock enter influxdb`, same as above):

```bash
influx bucket list --org laradock
```

Create a new bucket with, for example, 30 days of retention:

```bash
influx bucket create --name metrics_30d --org laradock --retention 30d
```

## Backup and restore

**Back up** all organizations and buckets to a folder inside the container, then copy that folder to your host:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock exec influxdb influx backup /tmp/influxdb-backup
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose exec influxdb influx backup /tmp/influxdb-backup
```

</TabItem>
</Tabs>

```bash
docker cp "$(docker compose ps -q influxdb)":/tmp/influxdb-backup ./influxdb-backup
```

**Restore** by copying a backup folder back in, then restoring from it:

```bash
docker cp ./influxdb-backup "$(docker compose ps -q influxdb)":/tmp/influxdb-backup
```

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock exec influxdb influx restore /tmp/influxdb-backup
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose exec influxdb influx restore /tmp/influxdb-backup
```

</TabItem>
</Tabs>

Restore flags and behavior have changed across InfluxDB releases, check the [InfluxDB backup/restore docs](https://docs.influxdata.com/influxdb/v2/backup-restore/) for options specific to your `INFLUXDB_VERSION`. Keep the `influxdb-backup` folder itself somewhere safe, it's the actual backup.

## Start completely fresh (wipe all data)

To throw away every organization, bucket, and data point, and start InfluxDB from a clean, empty state (⚠️ this **permanently deletes** everything in the `influxdb` volume, back up first if you need anything):

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock stop influxdb
./laradock remove influxdb
docker volume rm "${COMPOSE_PROJECT_NAME}_influxdb"
./laradock start influxdb
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose stop influxdb
docker compose rm -sf influxdb
docker volume rm "${COMPOSE_PROJECT_NAME}_influxdb"
docker compose up -d influxdb
```

</TabItem>
</Tabs>

Unlike bind-mounted services, InfluxDB's storage lives in a **named Docker volume**, not a folder under `DATA_PATH_HOST`, so wiping it means removing the volume itself. If you're unsure of the exact volume name on your machine (it's prefixed with your `COMPOSE_PROJECT_NAME`), list it first with `docker volume ls | grep influxdb`. Deleting it and starting again re-runs first-boot setup: `INFLUXDB_INIT_USERNAME`, `INFLUXDB_INIT_PASSWORD`, `INFLUXDB_INIT_ORG`, and `INFLUXDB_INIT_BUCKET` all apply fresh, and a new admin token is generated, exactly like a brand-new install.

## Talk to this database from another Laradock project

Each Laradock project is its own isolated Docker network by default, so a second project's containers can't reach this InfluxDB by container name out of the box. Easiest fix: the API port is already published (`INFLUXDB_HOST_PORT`), so point the other project (or a shared Grafana) at your **host machine's** address instead of `influxdb`, for example `http://host.docker.internal:8086` (Docker Desktop). Make sure the two projects use different `INFLUXDB_HOST_PORT` values if they're both running at once.

## Common issues

- **Port already in use on your host.** Change `INFLUXDB_HOST_PORT` in `.env` and restart: `./laradock restart influxdb`.
- **`INFLUXDB_INIT_*` changes don't take effect.** These only apply during the automatic first-run setup. If InfluxDB already initialized its volume, changing them afterward has no effect, you'd need to create a new user/org/bucket manually or [start completely fresh](#start-completely-fresh-wipe-all-data).
- **Default credentials in a shared environment.** `secretpassword` is a placeholder meant for local dev only, override `INFLUXDB_INIT_PASSWORD` in `.env` before exposing this beyond your machine.
- **API requests return `401 Unauthorized`.** The UI login (username/password) doesn't work for the write/query API, you need a token, see [Get an API token](#get-an-api-token).
- **App can't connect but the container is running.** Confirm your app or Grafana data source uses `influxdb` as the host, not `localhost`, that only works from your host machine.

---

Want to chart this data with dashboards? See **[Grafana](/docs/services/grafana)**. Want PromQL-based metrics instead? See **[Prometheus](/docs/services/prometheus)**. New to Laradock? Start with **[Getting Started](/docs/getting-started)**.
