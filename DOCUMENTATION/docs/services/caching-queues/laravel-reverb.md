---
slug: /services/laravel-reverb
title: Laravel Reverb
description: Run Laravel Reverb in Laradock, Laravel's own first-party WebSocket server for broadcasting, against your mounted application code.
keywords:
  - laradock laravel reverb
  - laravel reverb docker
  - laravel reverb docker compose
  - laravel broadcasting reverb
  - reverb websockets
---

## What is Laravel Reverb?

[Laravel Reverb](https://reverb.laravel.com) is Laravel's first-party WebSocket server, a modern, officially-maintained replacement for older options like `laravel-echo-server` or Soketi. This container runs `php artisan reverb:start` directly against your mounted application code rather than shipping a separate standalone server.

## Start Laravel Reverb

1. Install Reverb in your Laravel app (once): `php artisan install:broadcasting`, and set `BROADCAST_CONNECTION=reverb` in your app's `.env`.
2. Point Reverb at `0.0.0.0` in your app's `.env` so it's reachable from the host: `REVERB_HOST=0.0.0.0`, `REVERB_PORT=8080`.
3. Start the container:
   ```bash
   docker compose up -d laravel-reverb
   ```

The container `depends_on` `redis` in `compose.yml` (needed if you scale Reverb horizontally over Redis), so Compose starts it automatically.

## Stop Laravel Reverb

```bash
docker compose stop laravel-reverb
```

This stops the container. To remove it entirely: `docker compose rm -f laravel-reverb`.

## Configuration

`laravel-reverb/defaults.env` holds the port, overridable by adding the same line to your own `.env`:

| Variable | Default | What it does |
|---|---|---|
| `LARAVEL_REVERB_PORT` | `8080` | Host-side port the WebSocket server is published on (`host:8080`), and the port the container's `reverb:start` command binds to. |

The image (`laravel-reverb/Dockerfile`) is built from `php:${PHP_VERSION}-cli-alpine` with `pcntl`, `posix`, `sockets`, and the `redis` PECL extension installed, everything Reverb needs for its event loop and Redis-backed horizontal scaling. Your application code is mounted in from `APP_CODE_PATH_HOST`, same as the other PHP containers.

## Connect from your app

The WebSocket server is available on host port `8080` (or your custom `LARAVEL_REVERB_PORT`). Configure Laravel Echo on the frontend to connect there with `forceTLS: false` for local development.

## Common issues

- **Reverb starts but the browser can't connect.** Make sure `REVERB_HOST=0.0.0.0` in your Laravel app's `.env`, if it's left at the default `localhost`, Reverb only binds inside the container and is unreachable from the host.
- **Port already in use on your host.** Another local WebSocket server (or another Laradock project) is already bound to `8080`. Change `LARAVEL_REVERB_PORT` in `.env` and restart: `docker compose up -d laravel-reverb`.
- **Broadcasting still uses Pusher or another driver.** Confirm `BROADCAST_CONNECTION=reverb` is set in your Laravel app's `.env`, not just in the container config.
- **App code changes don't show up.** The container runs `reverb:start` against your mounted `APP_CODE_PATH_HOST`; code changes apply on the next request as usual, but Reverb itself needs a restart to pick up config changes (`REVERB_*` env vars): `docker compose restart laravel-reverb`.

---

Need the older Node-based alternative? See **[Laravel Echo Server](/docs/services/laravel-echo-server)**. Need a Pusher-protocol server instead? See **[Soketi](/docs/services/soketi)**. New to Laradock? Start at **[Getting Started](/docs/getting-started)**.
