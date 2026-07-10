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

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

## What is Soketi?

[Soketi](https://soketi.app) is a fast, open-source WebSockets server that implements the Pusher protocol. It's a drop-in replacement for the hosted Pusher service, letting Laravel apps use `laravel-echo` and broadcasting locally without a Pusher account or internet access. Laradock builds it from the official `quay.io/soketi/soketi` image.

## Start Soketi

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock start soketi
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose up -d soketi
```

</TabItem>
</Tabs>

Soketi is stateless, there's no data volume to worry about, connections are simply dropped and re-established by clients on restart.

## Stop Soketi

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock stop soketi
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose stop soketi
```

</TabItem>
</Tabs>

To remove the container entirely:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock remove soketi
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose rm -sf soketi
```

</TabItem>
</Tabs>

## Configuration

All settings live in `soketi/defaults.env` and can be overridden by adding the same line to your own `.env`:

| Variable | Default | What it does |
|---|---|---|
| `SOKETI_NODE_VERSION` | `16-debian` | Node.js base image variant used when building. |
| `SOKETI_BASE_IMAGE_TAG_PREFIX` | `latest` | Soketi image tag prefix, combined with `SOKETI_NODE_VERSION` to select the exact `quay.io/soketi/soketi` tag. |
| `SOKETI_PORT` | `6001` | Host-side port the WebSockets server is published on (`host:6001`). |
| `SOKETI_METRICS_SERVER_PORT` | `9601` | Host-side port for Soketi's Prometheus-compatible metrics endpoint. |

Soketi's own app-level config comes from `soketi/config.json`, mounted read-only into the container at `/app/bin/config.json`. Out of the box it only sets `"debug": false`; edit that file to add app credentials, SSL, or other Soketi options (see the [Soketi config reference](https://docs.soketi.app/getting-started/installation/using-docker)).

## Change the Soketi version

Set the version and/or image tag prefix in your `.env`:

```env
SOKETI_NODE_VERSION=18-debian
SOKETI_BASE_IMAGE_TAG_PREFIX=latest
```

Then rebuild:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock rebuild soketi
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose build soketi
```

</TabItem>
</Tabs>

Restart the container afterward so it runs on the new image:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock restart soketi
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose restart soketi
```

</TabItem>
</Tabs>

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

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock start soketi
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose up -d soketi
```

</TabItem>
</Tabs>

Since `config.json` doesn't define specific apps by default, Soketi runs in a mode that accepts any app ID/key/secret; see [Restrict to specific apps](#restrict-to-specific-apps-lock-down-credentials) below to lock it down.

## Restrict to specific apps (lock down credentials)

The default `config.json` has no `appManager` block, so Soketi accepts **any** `PUSHER_APP_ID`/`PUSHER_APP_KEY`/`PUSHER_APP_SECRET` combination, fine for local development, not something you'd want on a shared or exposed environment. To restrict it to specific known apps, add an `appManager` block to `soketi/config.json`:

```json
{
  "debug": false,
  "appManager": {
    "driver": "array",
    "array": {
      "apps": [
        {
          "id": "app-id",
          "key": "app-key",
          "secret": "app-secret",
          "maxConnections": -1,
          "enableClientMessages": true,
          "enabled": true
        }
      ]
    }
  }
}
```

Match `id`/`key`/`secret` to the `PUSHER_APP_ID`/`PUSHER_APP_KEY`/`PUSHER_APP_SECRET` your Laravel app already uses, then restart:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock restart soketi
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose restart soketi
```

</TabItem>
</Tabs>

Only connections presenting one of the configured `id`/`key`/`secret` combinations are accepted once this block is present.

## Check the metrics endpoint

Soketi exposes Prometheus-compatible metrics on `SOKETI_METRICS_SERVER_PORT` (`9601` by default), useful for confirming the server is actually receiving traffic without digging through logs:

```bash
curl http://localhost:9601/metrics
```

This returns current connection counts, messages sent/received, and other counters in Prometheus text format, ready to scrape from Grafana/Prometheus if you're already running the [monitoring stack](/docs/Intro#supported-services).

## Tail the logs

Useful when a client reports it can't connect at all, or you want to confirm Soketi is receiving handshake attempts:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock logs soketi
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose logs --tail=100 soketi
```

</TabItem>
</Tabs>

## Common issues

- **Frontend can't connect from the browser.** The browser connects to `localhost:6001` (or your custom `SOKETI_PORT`), not the container name `soketi`, that only resolves inside the Docker network.
- **Port already in use on your host.** Another local WebSockets server (or another Laradock project) is already bound to `6001`. Change `SOKETI_PORT` in `.env` and restart with `./laradock restart soketi`.
- **Config changes to `config.json` don't take effect.** It's mounted read-only via a bind mount in `soketi/compose.yml`, so edits should apply on `./laradock restart soketi`; if not, rebuild with `./laradock rebuild soketi`.
- **Need metrics for monitoring.** See [Check the metrics endpoint](#check-the-metrics-endpoint) above.
- **Anyone can connect with made-up credentials.** Expected by default, see [Restrict to specific apps](#restrict-to-specific-apps-lock-down-credentials) above to lock it down.

---

Prefer Laravel's own first-party WebSocket server? See **[Laravel Reverb](/docs/services/laravel-reverb)**. Using the older Node-based option? See **[Laravel Echo Server](/docs/services/laravel-echo-server)**. New to Laradock? Start at **[Getting Started](/docs/getting-started)**.
