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

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

## What is Laravel Reverb?

[Laravel Reverb](https://reverb.laravel.com) is Laravel's first-party WebSocket server, a modern, officially-maintained replacement for older options like `laravel-echo-server` or Soketi. This container runs `php artisan reverb:start` directly against your mounted application code rather than shipping a separate standalone server.

## Start Laravel Reverb

1. Install Reverb in your Laravel app (once): `php artisan install:broadcasting`, and set `BROADCAST_CONNECTION=reverb` in your app's `.env`.
2. Point Reverb at `0.0.0.0` in your app's `.env` so it's reachable from the host: `REVERB_HOST=0.0.0.0`, `REVERB_PORT=8080`.
3. Start the container:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock start laravel-reverb
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose up -d laravel-reverb
```

</TabItem>
</Tabs>

The container `depends_on` `redis` in `compose.yml` (needed if you scale Reverb horizontally over Redis, see [Scale Reverb horizontally](#scale-reverb-horizontally) below), so Compose starts it automatically.

## Stop Laravel Reverb

Stopping just pauses the container:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock stop laravel-reverb
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose stop laravel-reverb
```

</TabItem>
</Tabs>

To remove the container entirely:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock remove laravel-reverb
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose rm -sf laravel-reverb
```

</TabItem>
</Tabs>

Reverb keeps no data of its own on disk (it's not a stateful service), so there's nothing to back up here, removing the container is safe at any time.

## Configuration

`laravel-reverb/defaults.env` holds the port, overridable by adding the same line to your own `.env`:

| Variable | Default | What it does |
|---|---|---|
| `LARAVEL_REVERB_PORT` | `8080` | Host-side port the WebSocket server is published on (`host:8080`), and the port the container's `reverb:start` command binds to. |

The image (`laravel-reverb/Dockerfile`) is built from `php:${PHP_VERSION}-cli-alpine` with `pcntl`, `posix`, `sockets`, and the `redis` PECL extension installed, everything Reverb needs for its event loop and Redis-backed horizontal scaling. Your application code is mounted in from `APP_CODE_PATH_HOST`, same as the other PHP containers.

## Change the PHP version

The container's PHP version tracks your project-wide `PHP_VERSION` in `.env` (passed in as the `LARADOCK_PHP_VERSION` build arg). After changing it, rebuild the image:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock rebuild laravel-reverb
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose build laravel-reverb
```

</TabItem>
</Tabs>

## Connect from your app

The WebSocket server is available on host port `8080` (or your custom `LARAVEL_REVERB_PORT`). Configure Laravel Echo on the frontend to connect there with `forceTLS: false` for local development.

## Scale Reverb horizontally

Reverb `depends_on` `redis` so it can coordinate connection state across multiple Reverb instances instead of holding it in a single process's memory. To turn this on, set `REVERB_SCALING_ENABLED=true` in your Laravel app's `.env` alongside your existing `REDIS_HOST`/`REDIS_PORT` settings (pointed at Laradock's `redis` service). This is a Laravel-level setting, not a Laradock one, restart the container after changing it so the new config is picked up:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock restart laravel-reverb
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose restart laravel-reverb
```

</TabItem>
</Tabs>

## View logs

Reverb logs every connection, disconnection, and broadcast event to stdout, useful when a client can't connect or a broadcast isn't arriving:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock logs laravel-reverb
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose logs --tail=100 laravel-reverb
```

</TabItem>
</Tabs>

## Common issues

- **Reverb starts but the browser can't connect.** Make sure `REVERB_HOST=0.0.0.0` in your Laravel app's `.env`, if it's left at the default `localhost`, Reverb only binds inside the container and is unreachable from the host.
- **Port already in use on your host.** Another local WebSocket server (or another Laradock project) is already bound to `8080`. Change `LARAVEL_REVERB_PORT` in `.env` and restart: `./laradock restart laravel-reverb`.
- **Broadcasting still uses Pusher or another driver.** Confirm `BROADCAST_CONNECTION=reverb` is set in your Laravel app's `.env`, not just in the container config.
- **App code changes don't show up.** The container runs `reverb:start` against your mounted `APP_CODE_PATH_HOST`; code changes apply on the next request as usual, but Reverb itself needs a restart to pick up config changes (`REVERB_*` env vars): `./laradock restart laravel-reverb`.
- **Connections drop or state resets across multiple Reverb instances.** Check that `redis` is running (`./laradock logs redis`) and that `REVERB_SCALING_ENABLED=true` is actually set in your app's `.env`, not just assumed from `depends_on`.

---

Need the older Node-based alternative? See **[Laravel Echo Server](/docs/services/laravel-echo-server)**. Need a Pusher-protocol server instead? See **[Soketi](/docs/services/soketi)**. New to Laradock? Start at **[Getting Started](/docs/getting-started)**.
