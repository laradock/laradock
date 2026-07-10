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

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

## What is NetData?

[NetData](https://www.netdata.cloud) is a real-time performance monitoring tool that needs essentially no configuration: point it at a host and it starts charting CPU, memory, disk I/O, network, and per-process metrics immediately in a web dashboard. Laradock runs it from the official `netdata/netdata` image with access to the host's `/proc`, `/sys`, and the Docker socket, so it can monitor the machine Docker itself is running on, not just the container.

## Start NetData

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock start netdata
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose up -d netdata
```

</TabItem>
</Tabs>

## Stop NetData

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock stop netdata
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose stop netdata
```

</TabItem>
</Tabs>

To remove the container:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock remove netdata
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose rm -sf netdata
```

</TabItem>
</Tabs>

## Configuration

All settings live in `netdata/defaults.env` and can be overridden by adding the same line to your own `.env`:

| Variable | Default | What it does |
|---|---|---|
| `NETDATA_PORT` | `19999` | Host-side port the NetData dashboard is published on (container port `19999`). |

## View the dashboard

Open [http://localhost:19999](http://localhost:19999). Charts update live, no login or setup required, NetData ships wide open by default (no auth on the dashboard), so don't expose `NETDATA_PORT` beyond your local machine or a trusted network.

## What it can see

`netdata/compose.yml` mounts the host's `/proc` and `/sys` read-only and adds the `SYS_PTRACE` capability, so NetData reports on the Docker host itself (all processes, all containers), not just its own container. It also mounts `/var/run/docker.sock` read-only to report per-container Docker stats.

## Data retention (metrics are not persisted by default)

`netdata/compose.yml` doesn't mount a volume for NetData's own storage (`/var/cache/netdata` for its metrics database, `/etc/netdata` for config), so everything NetData collects and any dashboard settings live only inside the running container's writable layer:

- `./laradock stop netdata` / `docker compose stop netdata` keeps the container intact, history is safe across a stop/start.
- `./laradock remove netdata` / `docker compose rm -sf netdata` deletes the container, and with it **all collected history**. The next `start` boots a completely empty NetData with no charts before it, exactly as if freshly installed, there's nothing to explicitly "wipe" beyond removing the container.

If you want metrics and config to survive a `remove`/rebuild, add your own bind mounts to `netdata/compose.yml` before starting it for the first time:

```yaml
volumes:
  - /proc:/host/proc:ro
  - /sys:/host/sys:ro
  - /var/run/docker.sock:/var/run/docker.sock:ro
  - netdata-lib:/var/lib/netdata
  - netdata-cache:/var/cache/netdata
  - netdata-config:/etc/netdata
```

(declare `netdata-lib`, `netdata-cache`, and `netdata-config` under a top-level `volumes:` key). This isn't Laradock's default, since NetData is normally used for live/short-term monitoring rather than long-term retention, add it only if you specifically need history to outlive a container recreate.

## Check status via the API

NetData exposes its own data over a REST API, useful for scripting or a quick health check without opening the dashboard:

```bash
curl http://localhost:19999/api/v1/info
```

## Common issues

- **Port already in use on your host.** Change `NETDATA_PORT` in `.env` and restart: `./laradock restart netdata`.
- **Metrics look like they're for the whole machine, not just Laradock.** That's expected, NetData mounts the host's `/proc` and `/sys`, so it reports on everything running on the Docker host, not a sandboxed view of just this project.
- **Missing per-process detail.** Some deeper process-level metrics need the `SYS_PTRACE` capability, already granted in `netdata/compose.yml`; if you're running a hardened Docker setup that strips capabilities globally, NetData's visibility will be reduced.
- **All my charts disappeared.** Expected if you ran `./laradock remove netdata` (or rebuilt it): metrics aren't persisted by default, see [Data retention](#data-retention-metrics-are-not-persisted-by-default) above.

---

Want application logs instead of host metrics? See **[Graylog](/docs/services/graylog)**. Want metrics with PromQL and dashboards? See **[Prometheus](/docs/services/prometheus)** and **[Grafana](/docs/services/grafana)**. New to Laradock? Start with **[Getting Started](/docs/getting-started)**.
