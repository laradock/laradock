---
slug: /services/nats
title: NATS
description: Run the NATS messaging server in Laradock. Start and stop the container, configure client/monitoring/route ports, and connect from your app.
keywords:
  - laradock nats
  - nats docker
  - nats docker compose
  - nats messaging server
  - nats client port
---

## What is NATS?

[NATS](https://nats.io) is a lightweight, high-performance messaging system for cloud-native and microservice architectures, used for pub/sub, request/reply, and simple queueing. Laradock runs the official `nats` image with its own config file baked in.

## Start NATS

```bash
docker compose up -d nats
```

## Stop NATS

```bash
docker compose stop nats
```

This stops the container. NATS in this setup keeps no persistent data volume, so there's nothing to preserve or lose: `docker compose rm -f nats` removes the container entirely.

## Configuration

All settings live in `nats/defaults.env` and can be overridden by adding the same line to your own `.env`:

| Variable | Default | What it does |
|---|---|---|
| `NATS_CLIENT_PORT` | `4222` | Host-side port for client connections. |
| `NATS_MONITORING_PORT` | `6222` | Host-side port for the clustering route port (mapped from the container's `6222`). |
| `NATS_ROUTE_PORT` | `8222` | Host-side port for the HTTP monitoring endpoint (mapped from the container's `8222`). |

The container's own `nats-server.conf` (baked into the image via `nats/Dockerfile`) sets the client port to `4222`, the HTTP monitoring port to `8222`, and a `cluster` block on port `6222` for connecting multiple NATS servers together. Note the naming in `defaults.env` doesn't line up 1:1 with what each port actually does inside the container: `NATS_MONITORING_PORT` maps to the container's clustering port `6222`, and `NATS_ROUTE_PORT` maps to the container's HTTP monitoring port `8222`. Double-check `nats/compose.yml` if you rely on a specific one.

## Connect from your app

Inside Laradock, other containers reach NATS by container name and its internal client port: `nats:4222`. From your host machine, connect to `localhost:4222` (or your custom `NATS_CLIENT_PORT`) with any NATS client library.

## Check server health

The HTTP monitoring endpoint (container port `8222`, published on `NATS_ROUTE_PORT` by default) serves NATS's built-in monitoring JSON:

```bash
curl http://localhost:8222/varz
```

## Common issues

- **Port already in use on your host.** Another local NATS instance (or another Laradock project) is already bound to one of the default ports. Change the relevant `NATS_*_PORT` variable in `.env` and restart: `docker compose up -d nats`.
- **Monitoring/route ports feel swapped.** As noted above, `NATS_MONITORING_PORT` and `NATS_ROUTE_PORT` don't map to the container ports their names imply; check `nats/compose.yml` and `nats/nats-server.conf` directly if a specific port matters to you.
- **Clustering doesn't work out of the box.** `nats-server.conf` ships with an empty `routes = []` list; clustering to other NATS servers needs to be configured manually per the [NATS clustering docs](https://docs.nats.io/running-a-nats-service/configuration/clustering).
- **Config changes don't take effect.** `nats-server.conf` is copied into the image at build time, so a plain restart won't pick up edits: `docker compose build nats && docker compose up -d nats`.

---

Need a message queue with a management UI instead? See **[RabbitMQ](/docs/services/rabbitmq)**. New to Laradock? Start at **[Getting Started](/docs/getting-started)**.
