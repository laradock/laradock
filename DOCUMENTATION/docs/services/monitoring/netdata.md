---
slug: /services/netdata
title: NetData
description: Run NetData in Laradock for real-time, zero-configuration monitoring of your Docker host's CPU, memory, disk, and network.
keywords:
  - laradock netdata
  - netdata docker
  - netdata docker compose
  - real time server monitoring docker
  - docker host metrics
---

## What is NetData?

[NetData](https://www.netdata.cloud) is a real-time performance monitoring tool that needs essentially no configuration: point it at a host and it starts charting CPU, memory, disk I/O, network, and per-process metrics immediately in a web dashboard. Laradock runs it from the official `netdata/netdata` image with access to the host's `/proc`, `/sys`, and the Docker socket, so it can monitor the machine Docker itself is running on, not just the container.

## Start NetData

```bash
docker compose up -d netdata
```

## Stop NetData

```bash
docker compose stop netdata
```

To remove the container: `docker compose rm -f netdata`.

## Configuration

All settings live in `netdata/defaults.env` and can be overridden by adding the same line to your own `.env`:

| Variable | Default | What it does |
|---|---|---|
| `NETDATA_PORT` | `19999` | Host-side port the NetData dashboard is published on (container port `19999`). |

## View the dashboard

Open [http://localhost:19999](http://localhost:19999). Charts update live, no setup or login required.

## What it can see

`netdata/compose.yml` mounts the host's `/proc` and `/sys` read-only and adds the `SYS_PTRACE` capability, so NetData reports on the Docker host itself (all processes, all containers), not just its own container. It also mounts `/var/run/docker.sock` read-only to report per-container Docker stats.

## Common issues

- **Port already in use on your host.** Change `NETDATA_PORT` in `.env` and restart: `docker compose up -d netdata`.
- **Metrics look like they're for the whole machine, not just Laradock.** That's expected, NetData mounts the host's `/proc` and `/sys`, so it reports on everything running on the Docker host, not a sandboxed view of just this project.
- **Missing per-process detail.** Some deeper process-level metrics need the `SYS_PTRACE` capability, already granted in `netdata/compose.yml`; if you're running a hardened Docker setup that strips capabilities globally, NetData's visibility will be reduced.

---

Want application logs instead of host metrics? See **[Graylog](/docs/services/graylog)**. Want metrics with PromQL and dashboards? See **[Prometheus](/docs/services/prometheus)** and **[Grafana](/docs/services/grafana)**. New to Laradock? Start with **[Getting Started](/docs/getting-started)**.
