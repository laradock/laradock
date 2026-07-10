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

## What is InfluxDB?

[InfluxDB](https://www.influxdata.com) is an open-source time-series database purpose-built for high-volume metrics, events, and IoT/analytics data. It's commonly paired with Grafana for dashboards. Laradock builds it (InfluxDB 2.x) as its own container from the official image.

## Start InfluxDB

```bash
docker compose up -d influxdb
```

## Stop InfluxDB

```bash
docker compose stop influxdb
```

This stops the container without deleting its data (kept in the `influxdb` volume). To remove the container: `docker compose rm -f influxdb`.

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

These map directly to InfluxDB's own `DOCKER_INFLUXDB_INIT_*` environment variables (set in `influxdb/compose.yml`), with `DOCKER_INFLUXDB_INIT_MODE=setup` triggering the automatic first-run setup.

## Connect

Open the UI and API at [http://localhost:8086](http://localhost:8086); check readiness with `curl http://localhost:8086/health`. Log in with `INFLUXDB_INIT_USERNAME`/`INFLUXDB_INIT_PASSWORD`, org `INFLUXDB_INIT_ORG`, bucket `INFLUXDB_INIT_BUCKET`. From another container, use `http://influxdb:8086`.

## Common issues

- **Port already in use on your host.** Change `INFLUXDB_HOST_PORT` in `.env` and restart: `docker compose up -d influxdb`.
- **`INFLUXDB_INIT_*` changes don't take effect.** These only apply during the automatic first-run setup. If InfluxDB already initialized its data volume, changing them afterward has no effect, you'd need to create a new user/org/bucket manually or start from a fresh volume.
- **Default credentials in a shared environment.** `secretpassword` is a placeholder meant for local dev only, override `INFLUXDB_INIT_PASSWORD` in `.env` before exposing this beyond your machine.
- **App can't connect but the container is running.** Confirm your app or Grafana data source uses `influxdb` as the host, not `localhost`, that only works from your host machine.

---

Want to chart this data with dashboards? See **[Grafana](/docs/services/grafana)**. Want PromQL-based metrics instead? See **[Prometheus](/docs/services/prometheus)**. New to Laradock? Start with **[Getting Started](/docs/getting-started)**.
