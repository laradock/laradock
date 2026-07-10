---
slug: /services/grafana
title: Grafana
description: Run Grafana in Laradock to build dashboards on top of Prometheus, InfluxDB, or other data sources.
keywords:
  - laradock grafana
  - grafana docker
  - grafana docker compose
  - grafana prometheus docker
  - docker dashboards
  - grafana default password
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

## What is Grafana?

[Grafana](https://grafana.com) is the standard open-source dashboarding and visualization tool for metrics, most commonly paired with a time-series data source like Prometheus or InfluxDB. Laradock builds it as its own container so you can chart data from the other monitoring services without installing anything on your host.

## Start Grafana

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock start grafana
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose up -d grafana
```

</TabItem>
</Tabs>

Grafana is only useful once it has a data source to query, typically start it alongside `prometheus` or `influxdb`, for example `./laradock start grafana prometheus`.

## Stop Grafana

Stopping just pauses the container; **your dashboards and data source config are safe** (kept under `DATA_PATH_HOST/grafana`):

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock stop grafana
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose stop grafana
```

</TabItem>
</Tabs>

To delete the container entirely (the data on disk is still untouched):

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock remove grafana
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose rm -sf grafana
```

</TabItem>
</Tabs>

## Configuration

All settings live in `grafana/defaults.env` and can be overridden by adding the same line to your own `.env`:

| Variable | Default | What it does |
|---|---|---|
| `GRAFANA_PORT` | `3000` | Host-side port Grafana is published on (container port `3000`). |

`grafana/Dockerfile` builds from `grafana/grafana:latest`, there's no version env var, see [Pin a specific version](#pin-a-specific-version) below if you need a fixed release instead of always tracking latest.

## Log in

Open [http://localhost:3000](http://localhost:3000). Default credentials are user `admin`, password `admin`, Grafana will prompt you to change the password on first login.

## Add a data source

From the web UI, go to **Connections → Data sources → Add data source** and point it at another Laradock container by name, for example `http://prometheus:9090` for Prometheus or `http://influxdb:8086` for InfluxDB (both reachable over the internal `backend` network).

## Reset the admin password

If you changed the admin password after first login and forgot it, reset it from inside the container without losing any dashboards:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock enter grafana
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose exec grafana bash
```

</TabItem>
</Tabs>

Then, inside the container:

```bash
grafana-cli admin reset-admin-password newpassword
```

## Backup and restore

Grafana keeps everything, dashboards, data source configs, users, in a single SQLite database plus assets under `DATA_PATH_HOST/grafana`. Back it up as a plain file copy while the container is stopped, so the SQLite file isn't mid-write:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock stop grafana
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose stop grafana
```

</TabItem>
</Tabs>

```bash
tar -czf grafana-backup.tar.gz -C "${DATA_PATH_HOST:-~/.laradock/data}/grafana" .
```

Restart it once the copy finishes with `./laradock start grafana`. To restore, stop Grafana, clear the folder, extract the backup into it, then start again:

```bash
rm -rf "${DATA_PATH_HOST:-~/.laradock/data}/grafana"/*
tar -xzf grafana-backup.tar.gz -C "${DATA_PATH_HOST:-~/.laradock/data}/grafana"
```

For a single dashboard instead of the whole instance, use the web UI's **Share → Export → Save to file** on that dashboard to get a portable JSON file, no container access needed.

## Start completely fresh (wipe all data)

To throw away every dashboard, data source, and user and start Grafana from a clean, empty state (⚠️ this **permanently deletes** everything, back up first if you need any of it):

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock stop grafana
./laradock remove grafana
rm -rf "${DATA_PATH_HOST:-~/.laradock/data}/grafana"
./laradock start grafana
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose stop grafana
docker compose rm -sf grafana
rm -rf "${DATA_PATH_HOST:-~/.laradock/data}/grafana"
docker compose up -d grafana
```

</TabItem>
</Tabs>

`DATA_PATH_HOST` is whatever you have set in `.env` (`~/.laradock/data` by default). Deleting the folder and starting again re-runs first-boot setup: the `admin`/`admin` login, an empty dashboard list, and no data sources, exactly like a brand-new install.

## Pin a specific version

`grafana/Dockerfile` builds from `grafana/grafana:latest`, so a plain rebuild always pulls whatever Grafana currently tags as latest. To pin a fixed version instead, edit the `FROM` line in `grafana/Dockerfile`:

```dockerfile
FROM grafana/grafana:11.2.0
```

Then apply the change:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock rebuild grafana
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose build grafana
```

</TabItem>
</Tabs>

## Common issues

- **Can't log in.** Default credentials are `admin`/`admin`. If you already changed the password and forgot it, [reset it](#reset-the-admin-password) from inside the container instead of wiping `DATA_PATH_HOST/grafana` (that loses every dashboard too).
- **Port already in use on your host.** Change `GRAFANA_PORT` in `.env` and restart: `./laradock restart grafana`.
- **Data source connection fails.** Use the container name (`prometheus`, `influxdb`, etc.), not `localhost`, when configuring a data source URL, Grafana runs in its own container and can't reach your host's `localhost`.
- **Dashboards disappear after a rebuild.** Dashboards and data source configs persist under `DATA_PATH_HOST/grafana`; if you changed `DATA_PATH_HOST` or ran on a fresh data folder, they won't carry over.

---

Visualizing metrics from Prometheus? See **[Prometheus](/docs/services/prometheus)**. Need a time-series store instead? See **[InfluxDB](/docs/services/influxdb)**. New to Laradock? Start with **[Getting Started](/docs/getting-started)**.
