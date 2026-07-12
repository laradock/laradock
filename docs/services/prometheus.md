# Prometheus

Source: https://laradock.io/docs/services/prometheus

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

## What is Prometheus?

[Prometheus](https://prometheus.io) is the standard open-source metrics and monitoring system: it scrapes metrics from configured targets on an interval, stores them as time series, and lets you query them with PromQL. It's the usual data source behind Laradock's Grafana. Laradock runs it from the official `prom/prometheus` image.

## Start Prometheus

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock start prometheus
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose up -d prometheus
```

</TabItem>
</Tabs>

Name any other services alongside it to start them together, for example `./laradock start prometheus grafana`.

## Stop Prometheus

Stopping just pauses the container; **your stored metrics are safe** (kept in the `prometheus` volume):

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock stop prometheus
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose stop prometheus
```

</TabItem>
</Tabs>

To delete the container entirely (the metrics in the `prometheus` volume are still untouched):

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock remove prometheus
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose rm -sf prometheus
```

</TabItem>
</Tabs>

## Configuration

All settings live in `prometheus/defaults.env` and can be overridden by adding the same line to your own `.env`:

| Variable | Default | What it does |
|---|---|---|
| `PROMETHEUS_VERSION` | `v3.13.0` | Image tag from [Prometheus's Docker Hub](https://hub.docker.com/r/prom/prometheus). |
| `PROMETHEUS_HOST_PORT` | `9091` | Host-side port Prometheus is published on (container port `9090`). |

## Check it's running

Open the web UI at [http://localhost:9091](http://localhost:9091), or check the health endpoint: `curl http://localhost:9091/-/healthy`.

There's no login by default, Prometheus's web UI and API are open to anyone who can reach the port. Don't publish `PROMETHEUS_HOST_PORT` beyond your local machine without putting something (a reverse proxy with auth, a firewall rule) in front of it.

## Add scrape targets

Edit `prometheus/prometheus.yml` (mounted read-only into the container) to add jobs and targets, then apply the change:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock restart prometheus
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose restart prometheus
```

</TabItem>
</Tabs>

Target other Laradock containers by their service name, not `localhost`, for example `php-fpm:9253` for a php-fpm exporter or `mysqld-exporter:9104` for MySQL. Prometheus's own container joins the `frontend` and `backend` networks, so it can reach anything else on either.

## Query metrics with PromQL

The web UI's **Graph** tab (`http://localhost:9091/graph`) lets you run PromQL queries interactively. A few to get started, all valid against the built-in self-scrape:

```promql
up
```

```promql
rate(prometheus_http_requests_total[5m])
```

`up` returns `1`/`0` per scrape target and is the fastest way to check whether a target is being reached at all; start troubleshooting any "missing metrics" problem there before writing a more specific query.

## Data retention

By default Prometheus keeps **15 days** of data in the `prometheus` volume, then drops the oldest samples as new ones come in. To change that, add a `command:` override in `prometheus/compose.yml` with a longer or shorter `--storage.tsdb.retention.time`:

```yaml
services:
  prometheus:
    command:
      - --config.file=/etc/prometheus/prometheus.yml
      - --storage.tsdb.path=/prometheus
      - --storage.tsdb.retention.time=30d
```

Apply it:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock restart prometheus
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose restart prometheus
```

</TabItem>
</Tabs>

Longer retention means more disk usage in the `prometheus` volume, there's no automatic size cap, only the time-based one.

## Start completely fresh (wipe stored metrics)

Metrics live in the named `prometheus` Docker volume, not a bind mount under `DATA_PATH_HOST`, so wiping it works a little differently than for a service with a data folder on disk. To throw away all stored history and start clean (⚠️ this **permanently deletes** every metric this container has collected):

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock stop prometheus
./laradock remove prometheus
docker volume rm "${COMPOSE_PROJECT_NAME:-laradock}_prometheus"
./laradock start prometheus
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose stop prometheus
docker compose rm -sf prometheus
docker volume rm "${COMPOSE_PROJECT_NAME:-laradock}_prometheus"
docker compose up -d prometheus
```

</TabItem>
</Tabs>

`COMPOSE_PROJECT_NAME` (`laradock` by default) prefixes every volume Compose creates, run `docker volume ls | grep prometheus` first if you're not sure of the exact name on your machine, especially if you run multiple Laradock projects.

## Scrape a target in another Laradock project

Each Laradock project is its own isolated Docker network by default, so this Prometheus can't reach another project's containers by service name. Point the scrape target at the other project's **host-published port** instead: in `prometheus/prometheus.yml`, use `host.docker.internal:<port>` (Docker Desktop) with whatever host port that service publishes (its own `*_HOST_PORT`/`*_PORT` variable), then [restart](#add-scrape-targets).

## Common issues

- **Port already in use on your host.** Change `PROMETHEUS_HOST_PORT` in `.env` and restart: `./laradock restart prometheus`.
- **New scrape targets aren't picked up.** Prometheus reads `prometheus.yml` at startup; after editing it you need to `./laradock restart prometheus`, not just save the file.
- **Data disappears after `docker compose down -v`.** Metrics live in the named `prometheus` volume, not a bind mount. Removing volumes (`docker compose down -v`) deletes that history along with everything else.
- **Can't reach a scrape target from inside the container.** Use container names (`php-fpm`, `nginx`, etc.) as targets, not `localhost`, Prometheus runs in its own container on the `frontend`/`backend` networks.
- **Target shows `up == 0`.** The target itself either isn't exposing a `/metrics` endpoint, isn't running, or isn't reachable on the network/port you configured, check with `curl` from inside the workspace container before assuming Prometheus is misconfigured.

---

Want to chart this data with dashboards? See **[Grafana](https://laradock.io/docs/services/grafana)**. Need a general-purpose time-series store instead? See **[InfluxDB](https://laradock.io/docs/services/influxdb)**. New to Laradock? Start with **[Getting Started](https://laradock.io/docs/getting-started)**.
