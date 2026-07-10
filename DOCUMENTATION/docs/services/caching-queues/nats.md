---
slug: /services/nats
title: NATS
description: Run the NATS messaging server in Laradock. Start and stop the container, configure client/monitoring/route ports, edit the server config, enable clustering, and connect from your app.
keywords:
  - laradock nats
  - nats docker
  - nats docker compose
  - nats messaging server
  - nats client port
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

## What is NATS?

[NATS](https://nats.io) is a lightweight, high-performance messaging system for cloud-native and microservice architectures, used for pub/sub, request/reply, and simple queueing. Laradock runs the official `nats` image with its own config file baked in.

## Start NATS

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock start nats
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose up -d nats
```

</TabItem>
</Tabs>

## Stop NATS

Stopping just pauses the container. NATS in this setup keeps no persistent data volume, so there's nothing to preserve or lose either way:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock stop nats
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose stop nats
```

</TabItem>
</Tabs>

To delete the container entirely:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock remove nats
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose rm -sf nats
```

</TabItem>
</Tabs>

## Configuration

All settings live in `nats/defaults.env` and can be overridden by adding the same line to your own `.env`:

| Variable | Default | What it does |
|---|---|---|
| `NATS_CLIENT_PORT` | `4222` | Host-side port for client connections. |
| `NATS_MONITORING_PORT` | `6222` | Host-side port for the clustering route port (mapped from the container's `6222`). |
| `NATS_ROUTE_PORT` | `8222` | Host-side port for the HTTP monitoring endpoint (mapped from the container's `8222`). |

The container's own `nats-server.conf` (baked into the image via `nats/Dockerfile`) sets the client port to `4222`, the HTTP monitoring port to `8222`, and a `cluster` block on port `6222` for connecting multiple NATS servers together. Note the naming in `defaults.env` doesn't line up 1:1 with what each port actually does inside the container: `NATS_MONITORING_PORT` maps to the container's clustering port `6222`, and `NATS_ROUTE_PORT` maps to the container's HTTP monitoring port `8222`. Double-check `nats/compose.yml` if you rely on a specific one.

## Change the server config

`nats/nats-server.conf` is copied into the image at build time (`COPY nats-server.conf /etc/nats/nats-server.conf` in `nats/Dockerfile`), so editing it needs a rebuild, a plain restart won't pick up the change. After editing the file:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock rebuild nats
./laradock start nats
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose build nats
docker compose up -d nats
```

</TabItem>
</Tabs>

## Enable clustering

`nats-server.conf` ships with an empty `routes = []` list, so clustering to other NATS servers is off by default. To connect this server to others, add their `nats-route://` addresses to `routes` in `nats/nats-server.conf` and rebuild (see above). The `cluster` block's built-in `authorization` credentials for route connections are `ruser` / `T0pS3cr3t`, change these in `nats-server.conf` before exposing the cluster port (`NATS_MONITORING_PORT`, container `6222`) beyond your own machine. Full options are in the [NATS clustering docs](https://docs.nats.io/running-a-nats-service/configuration/clustering).

## Connect from your app

Inside Laradock, other containers reach NATS by container name and its internal client port: `nats:4222`. From your host machine, connect to `localhost:4222` (or your custom `NATS_CLIENT_PORT`) with any NATS client library.

## Check server health

The HTTP monitoring endpoint (container port `8222`, published on `NATS_ROUTE_PORT` by default) serves NATS's built-in monitoring JSON:

```bash
curl http://localhost:8222/varz
```

A few other endpoints on the same port are useful day-to-day:

| Endpoint | Shows |
|---|---|
| `/varz` | General server stats: uptime, connections, memory, CPU. |
| `/connz` | Currently connected clients. |
| `/subsz` | Active subscriptions. |
| `/routez` | Cluster route connections (relevant once [clustering](#enable-clustering) is set up). |

## View logs

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock logs nats
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose logs --tail=100 nats
```

</TabItem>
</Tabs>

## Talk to this NATS server from another Laradock project

Each Laradock project is its own isolated Docker network by default, so a second project's containers can't reach this NATS by container name out of the box. Since the client port is already published (`NATS_CLIENT_PORT`), the other project can connect to your **host machine's** address instead of `nats`, for example `host.docker.internal:4222` (Docker Desktop) using this project's `NATS_CLIENT_PORT`. Make sure the two projects use different `NATS_CLIENT_PORT` values if they're both running at once.

## Common issues

- **Port already in use on your host.** Another local NATS instance (or another Laradock project) is already bound to one of the default ports. Change the relevant `NATS_*_PORT` variable in `.env` and restart: `./laradock restart nats`.
- **Monitoring/route ports feel swapped.** As noted above, `NATS_MONITORING_PORT` and `NATS_ROUTE_PORT` don't map to the container ports their names imply; check `nats/compose.yml` and `nats/nats-server.conf` directly if a specific port matters to you.
- **Clustering doesn't work out of the box.** `nats-server.conf` ships with an empty `routes = []` list; see [Enable clustering](#enable-clustering) above.
- **Config changes don't take effect.** `nats-server.conf` is copied into the image at build time, so a plain restart won't pick up edits, see [Change the server config](#change-the-server-config) above.

---

Need a message queue with a management UI instead? See **[RabbitMQ](/docs/services/rabbitmq)**. New to Laradock? Start at **[Getting Started](/docs/getting-started)**.
