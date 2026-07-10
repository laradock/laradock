---
slug: /services/laravel-echo-server
title: Laravel Echo Server
description: Run the legacy Node.js Laravel Echo Server in Laradock for Pusher-protocol WebSocket broadcasting, backed by Redis.
keywords:
  - laradock laravel echo server
  - laravel echo server docker
  - laravel broadcasting websockets
  - laravel-echo-server docker compose
  - legacy laravel websockets
---

## What is Laravel Echo Server?

[Laravel Echo Server](https://github.com/tlaverdure/laravel-echo-server) is a Node.js WebSocket server that implements the Pusher protocol for Laravel's broadcasting system, using Redis as its backing pub/sub layer. It's the older, community-maintained option that predates Laravel's first-party **[Reverb](/docs/services/laravel-reverb)** and the Pusher-compatible **[Soketi](/docs/services/soketi)**; both are generally preferred for new projects, but this remains available for existing apps already wired up to it. Laradock builds it from `node:alpine`.

## Start Laravel Echo Server

```bash
docker compose up -d laravel-echo-server
```

The container links to `redis` in `compose.yml` (it uses Redis as its pub/sub backend), so make sure Redis is running too:

```bash
docker compose up -d redis laravel-echo-server
```

## Stop Laravel Echo Server

```bash
docker compose stop laravel-echo-server
```

This stops the container. To remove it entirely: `docker compose rm -f laravel-echo-server`.

## Configuration

`laravel-echo-server/defaults.env` holds the port, overridable by adding the same line to your own `.env`:

| Variable | Default | What it does |
|---|---|---|
| `LARAVEL_ECHO_SERVER_PORT` | `6001` | Host-side port the WebSocket server is published on (`host:6001`). |

Server behavior itself (auth endpoint, Redis connection, dev mode, and so on) is configured in `laravel-echo-server/laravel-echo-server.json`, mounted read-only into the container. Out of the box it points at Redis by container name (`host: "redis"`, `port: "6379"`), listens on port `6001`, and runs with `devMode: true`.

## Connect from Laravel

1. In your Laravel `.env`, configure broadcasting for the Pusher driver (Echo Server speaks the Pusher protocol) and point Echo's frontend client at the container's published port, `localhost:6001` by default.
2. Set `REDIS_HOST=redis` so your app and Echo Server share the same Redis pub/sub backend, this is required, Echo Server only relays events published to Redis.
3. Start both containers:
   ```bash
   docker compose up -d redis laravel-echo-server
   ```

## Common issues

- **No events arrive on the frontend.** Laravel publishes broadcast events to Redis; Echo Server only relays what it sees there. Confirm your app's `.env` uses `BROADCAST_CONNECTION=redis` (or your Pusher-compatible driver of choice) and the same `REDIS_HOST` as `laravel-echo-server.json`.
- **Auth fails on private/presence channels.** `laravel-echo-server.json` sets `authEndpoint: "/broadcasting/auth"` and `authHost: "localhost"`; adjust `authHost` if your app isn't reachable at `localhost` from wherever Echo Server resolves it.
- **Port already in use on your host.** Another local WebSocket server (or another Laradock project) is already bound to `6001`. Change `LARAVEL_ECHO_SERVER_PORT` in `.env` and restart.
- **Config changes to `laravel-echo-server.json` don't take effect.** It's mounted read-only in `compose.yml`; a restart should pick up edits, but if not, rebuild: `docker compose build laravel-echo-server`.

---

Starting a new project? Prefer Laravel's own first-party server, **[Laravel Reverb](/docs/services/laravel-reverb)**, or the Pusher-compatible **[Soketi](/docs/services/soketi)**. New to Laradock? Start at **[Getting Started](/docs/getting-started)**.
