---
slug: /services/clickhouse
title: ClickHouse
description: Run ClickHouse in Laradock. Start and stop the container, configure ports and credentials, connect over HTTP or the native client, and fix common issues.
keywords:
  - laradock clickhouse
  - clickhouse docker
  - clickhouse docker compose
  - column-oriented database docker
  - olap database docker
  - clickhouse client port
---

## What is ClickHouse?

[ClickHouse](https://clickhouse.com) is a column-oriented database built for fast analytical (OLAP) queries over very large datasets, the kind of workload row-oriented databases like MySQL or Postgres struggle with. Laradock builds it from the official ClickHouse Debian packages on top of Ubuntu, with an HTTP interface, a native TCP interface, and its own config and users files pre-wired.

## Start ClickHouse

```bash
docker compose up -d clickhouse
```

The `clickhouse` service links to the `workspace` container, so it's reachable from there by container name once both are up.

## Stop ClickHouse

```bash
docker compose stop clickhouse
```

This stops the container without deleting its data. Data lives under `DATA_PATH_HOST/clickhouse`.

## Configuration

All settings live in `clickhouse/defaults.env` and can be overridden by adding the same line to your own `.env`:

| Variable | Default | What it does |
|---|---|---|
| `CLICKHOUSE_VERSION` | `25.8.2.29` | Version of the `clickhouse-server`/`clickhouse-client` packages installed at build time. |
| `CLICKHOUSE_GOSU_VERSION` | `1.17` | Version of [gosu](https://github.com/tianon/gosu) used by the entrypoint to drop root privileges. |
| `CLICKHOUSE_USER` | `default` | Database user created on boot. |
| `CLICKHOUSE_PASSWORD` | `HAHA` | Password for `CLICKHOUSE_USER`. Change this before using anything beyond local dev. |
| `CLICKHOUSE_HTTP_PORT` | `8123` | Host-side port for the HTTP interface (container port `8123`). |
| `CLICKHOUSE_CLIENT_PORT` | `9000` | Host-side port for the native TCP protocol used by `clickhouse-client` (container port `9000`). |
| `CLICKHOUSE_NATIVE_PORT` | `9009` | Host-side port for the interserver replication port (container port `9009`). |
| `CLICKHOUSE_CUSTOM_CONFIG` | `./clickhouse/config.xml` | Server config file mounted into the container. |
| `CLICKHOUSE_USERS_CUSTOM_CONFIG` | `./clickhouse/users.xml` | Users/roles config file mounted into the container. |
| `CLICKHOUSE_ENTRYPOINT_INITDB` | `./clickhouse/docker-entrypoint-initdb.d` | Folder of scripts auto-run on first boot. |
| `CLICKHOUSE_HOST_LOG_PATH` | `./logs/clickhouse` | Host folder ClickHouse writes its logs to. |

## Connect with clickhouse-client

```bash
docker compose exec clickhouse clickhouse-client --user default --password HAHA
```

Or from the `workspace` container, reach it by service name: `clickhouse-client --host clickhouse --user default --password HAHA`.

## Connect over HTTP

```bash
curl "http://localhost:8123/?user=default&password=HAHA" -d "SELECT 1"
```

The HTTP interface also exposes a lightweight health check at `/ping`.

## Change resource limits

The container requests high `ulimits` (`nproc: 65535`, `nofile: 262144`), ClickHouse itself recommends this for production-grade workloads. If Docker on your host caps these lower, you'll see startup warnings in `docker compose logs clickhouse`; raise the limits in Docker Desktop's resource settings or your Docker daemon config.

## Common issues

- **Default password is `HAHA`.** It's genuinely the shipped default in `clickhouse/defaults.env`, set your own `CLICKHOUSE_PASSWORD` in `.env` before using this for anything beyond local dev.
- **Config changes don't take effect.** `clickhouse/config.xml` and `clickhouse/users.xml` are bind-mounted, edits apply on container restart; no rebuild needed. Changing `CLICKHOUSE_VERSION` does require a rebuild: `docker compose build clickhouse`.
- **Client can't connect from another container.** Use the service name `clickhouse` as the host, not `localhost`, and the container-internal ports (`9000` native, `8123` HTTP), not the host-mapped ones.
- **Logs directory missing on host.** `CLICKHOUSE_HOST_LOG_PATH` (`./logs/clickhouse` by default) needs to exist for the bind mount to work; create it if Docker complains on startup.

---

Need a search engine instead? See **[Manticore](/docs/services/manticore)**. Back to the **[Getting Started guide](/docs/getting-started)**.
