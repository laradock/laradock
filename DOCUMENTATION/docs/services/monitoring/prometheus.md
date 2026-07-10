---
slug: /services/prometheus
title: Prometheus
description: Run Prometheus in Laradock to scrape and store metrics with PromQL, and visualize them in Grafana.
keywords:
  - laradock prometheus
  - prometheus docker
  - prometheus docker compose
  - promql docker
  - prometheus grafana docker
  - scrape targets prometheus
---

## What is Prometheus?

[Prometheus](https://prometheus.io) is the standard open-source metrics and monitoring system: it scrapes metrics from configured targets on an interval, stores them as time series, and lets you query them with PromQL. It's the usual data source behind Laradock's Grafana. Laradock runs it from the official `prom/prometheus` image.

## Start Prometheus

```bash
docker compose up -d prometheus
```

## Stop Prometheus

```bash
docker compose stop prometheus
```

This stops the container without deleting its stored metrics (kept in the `prometheus` volume). To remove the container: `docker compose rm -f prometheus`.

## Configuration

All settings live in `prometheus/defaults.env` and can be overridden by adding the same line to your own `.env`:

| Variable | Default | What it does |
|---|---|---|
| `PROMETHEUS_VERSION` | `v3.13.0` | Image tag from [Prometheus's Docker Hub](https://hub.docker.com/r/prom/prometheus). |
| `PROMETHEUS_HOST_PORT` | `9091` | Host-side port Prometheus is published on (container port `9090`). |

## Check it's running

Open the web UI at [http://localhost:9091](http://localhost:9091), or check the health endpoint: `curl http://localhost:9091/-/healthy`.

## Add scrape targets

Edit `prometheus/prometheus.yml` (mounted read-only into the container) to add jobs and targets, then restart:

```bash
docker compose restart prometheus
```

## Common issues

- **Port already in use on your host.** Change `PROMETHEUS_HOST_PORT` in `.env` and restart: `docker compose up -d prometheus`.
- **New scrape targets aren't picked up.** Prometheus reads `prometheus.yml` at startup; after editing it you need `docker compose restart prometheus`, not just save the file.
- **Data disappears after `docker compose down`.** Metrics live in the named `prometheus` volume, not a bind mount. If you removed volumes (`docker compose down -v`), history is gone.
- **Can't reach a scrape target from inside the container.** Use container names (`php-fpm`, `nginx`, etc.) as targets, not `localhost`, Prometheus runs in its own container on the `frontend`/`backend` networks.

---

Want to chart this data with dashboards? See **[Grafana](/docs/services/grafana)**. Need a general-purpose time-series store instead? See **[InfluxDB](/docs/services/influxdb)**. New to Laradock? Start with **[Getting Started](/docs/getting-started)**.
