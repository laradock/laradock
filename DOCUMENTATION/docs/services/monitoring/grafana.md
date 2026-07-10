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

## What is Grafana?

[Grafana](https://grafana.com) is the standard open-source dashboarding and visualization tool for metrics, most commonly paired with a time-series data source like Prometheus or InfluxDB. Laradock builds it as its own container so you can chart data from the other monitoring services without installing anything on your host.

## Start Grafana

```bash
docker compose up -d grafana
```

Grafana is only useful once it has a data source to query, typically start it alongside `prometheus` or `influxdb`.

## Stop Grafana

```bash
docker compose stop grafana
```

This stops the container without deleting its dashboards or data source config (kept under `DATA_PATH_HOST/grafana`). To remove the container: `docker compose rm -f grafana`.

## Configuration

All settings live in `grafana/defaults.env` and can be overridden by adding the same line to your own `.env`:

| Variable | Default | What it does |
|---|---|---|
| `GRAFANA_PORT` | `3000` | Host-side port Grafana is published on (container port `3000`). |

## Log in

Open [http://localhost:3000](http://localhost:3000). Default credentials are user `admin`, password `admin`, Grafana will prompt you to change the password on first login.

## Add a data source

From the web UI, go to **Connections → Data sources → Add data source** and point it at another Laradock container by name, for example `http://prometheus:9090` for Prometheus or `http://influxdb:8086` for InfluxDB (both reachable over the internal `backend` network).

## Common issues

- **Can't log in.** Default credentials are `admin`/`admin`. If you already changed the password and forgot it, you'll need to reset it from inside the container or drop `DATA_PATH_HOST/grafana` (loses dashboards).
- **Port already in use on your host.** Change `GRAFANA_PORT` in `.env` and restart: `docker compose up -d grafana`.
- **Data source connection fails.** Use the container name (`prometheus`, `influxdb`, etc.), not `localhost`, when configuring a data source URL, Grafana runs in its own container and can't reach your host's `localhost`.
- **Dashboards disappear after a rebuild.** Dashboards and data source configs persist under `DATA_PATH_HOST/grafana`; if you changed `DATA_PATH_HOST` or ran on a fresh data folder, they won't carry over.

---

Visualizing metrics from Prometheus? See **[Prometheus](/docs/services/prometheus)**. Need a time-series store instead? See **[InfluxDB](/docs/services/influxdb)**. New to Laradock? Start with **[Getting Started](/docs/getting-started)**.
