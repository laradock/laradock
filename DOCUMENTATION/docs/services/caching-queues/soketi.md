---
slug: /services/soketi
title: Soketi
description: Run Soketi in Laradock, a Pusher-protocol-compatible WebSockets server for Laravel Echo and broadcasting, without a Pusher account.
keywords:
  - laradock soketi
  - soketi docker
  - pusher protocol docker
  - laravel echo websockets
  - laravel broadcasting docker
---

## What is Soketi?

[Soketi](https://soketi.app) is a fast, open-source WebSockets server that implements the Pusher protocol. It's a drop-in replacement for the hosted Pusher service, letting Laravel apps use `laravel-echo` and broadcasting locally without a Pusher account or internet access. Laradock builds it from the official `quay.io/soketi/soketi` image.

## Start Soketi

```bash
docker compose up -d soketi
```

## Stop Soketi

```bash
docker compose stop soketi
```

This stops the container. To remove it entirely: `docker compose rm -f soketi`.

## Configuration

All settings live in `soketi/defaults.env` and can be overridden by adding the same line to your own `.env`:

| Variable | Default | What it does |
|---|---|---|
| `SOKETI_NODE_VERSION` | `16-debian` | Node.js base image variant used when building. |
| `SOKETI_BASE_IMAGE_TAG_PREFIX` | `latest` | Soketi image tag prefix, combined with `SOKETI_NODE_VERSION` to select the exact `quay.io/soketi/soketi` tag. |
| `SOKETI_PORT` | `6001` | Host-side port the WebSockets server is published on (`host:6001`). |
| `SOKETI_METRICS_SERVER_PORT` | `9601` | Host-side port for Soketi's Prometheus-compatible metrics endpoint. |

Soketi's own app-level config comes from `soketi/config.json`, mounted read-only into the container at `/app/bin/config.json`. Out of the box it only sets `"debug": false`; edit that file to add app credentials, SSL, or other Soketi options (see the [Soketi config reference](https://docs.soketi.app/getting-started/installation/using-docker)).

## Connect from Laravel

1. Set your Laravel `.env` to broadcast over Pusher's protocol, pointed at Soketi instead of Pusher's servers:
   ```env
   BROADCAST_CONNECTION=pusher
   PUSHER_APP_ID=app-id
   PUSHER_APP_KEY=app-key
   PUSHER_APP_SECRET=app-secret
   PUSHER_HOST=soketi
   PUSHER_PORT=6001
   PUSHER_SCHEME=http
   ```
2. Configure `laravel-echo` on the frontend to point at the same host/port with `forceTLS: false`.
3. Start the container:
   ```bash
   docker compose up -d soketi
   ```

Since `config.json` doesn't define specific apps by default, Soketi runs in a mode that accepts any app ID/key/secret; check the config reference above if you need to lock it down.

## Common issues

- **Frontend can't connect from the browser.** The browser connects to `localhost:6001` (or your custom `SOKETI_PORT`), not the container name `soketi`, that only resolves inside the Docker network.
- **Port already in use on your host.** Another local WebSockets server (or another Laradock project) is already bound to `6001`. Change `SOKETI_PORT` in `.env` and restart: `docker compose up -d soketi`.
- **Config changes to `config.json` don't take effect.** It's mounted read-only via a bind mount in `soketi/compose.yml`, so edits should apply on container restart; if not, rebuild: `docker compose build soketi`.
- **Need metrics for monitoring.** Soketi exposes Prometheus-compatible metrics on `SOKETI_METRICS_SERVER_PORT` (`9601` by default).

---

Prefer Laravel's own first-party WebSocket server? See **[Laravel Reverb](/docs/services/laravel-reverb)**. Using the older Node-based option? See **[Laravel Echo Server](/docs/services/laravel-echo-server)**. New to Laradock? Start at **[Getting Started](/docs/getting-started)**.
