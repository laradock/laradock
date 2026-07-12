# Laravel Echo Server

Source: https://laradock.io/docs/services/laravel-echo-server

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

## What is Laravel Echo Server?

[Laravel Echo Server](https://github.com/tlaverdure/laravel-echo-server) is a Node.js WebSocket server that implements the Pusher protocol for Laravel's broadcasting system, using Redis as its backing pub/sub layer. It's the older, community-maintained option that predates Laravel's first-party **[Reverb](https://laradock.io/docs/services/laravel-reverb)** and the Pusher-compatible **[Soketi](https://laradock.io/docs/services/soketi)**; both are generally preferred for new projects, but this remains available for existing apps already wired up to it. Laradock builds it from `node:alpine`.

## Start Laravel Echo Server

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock start laravel-echo-server
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose up -d laravel-echo-server
```

</TabItem>
</Tabs>

The container `links` to `redis` in `compose.yml` (it uses Redis as its pub/sub backend), so make sure Redis is running too. Start both together:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock start redis laravel-echo-server
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose up -d redis laravel-echo-server
```

</TabItem>
</Tabs>

## Stop Laravel Echo Server

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock stop laravel-echo-server
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose stop laravel-echo-server
```

</TabItem>
</Tabs>

To remove the container entirely (nothing persists on disk for this service, so there's no data to lose):

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock remove laravel-echo-server
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose rm -sf laravel-echo-server
```

</TabItem>
</Tabs>

## Configuration

`laravel-echo-server/defaults.env` holds the port, overridable by adding the same line to your own `.env`:

| Variable | Default | What it does |
|---|---|---|
| `LARAVEL_ECHO_SERVER_PORT` | `6001` | Host-side port the WebSocket server is published on (`host:6001`). |

Server behavior itself (auth endpoint, Redis connection, dev mode, and so on) is configured in `laravel-echo-server/laravel-echo-server.json`, mounted read-only into the container. Out of the box it points at Redis by container name (`host: "redis"`, `port: "6379"`), listens on port `6001`, and runs with `devMode: true`.

## Authenticating private and presence channels

Laravel Echo Server needs to know how to validate a client before letting it join a private or presence channel. `laravel-echo-server.json` supports two approaches, and you can use either or both:

- **`authHost` + `authEndpoint`** (the default): Echo Server forwards the auth check to your Laravel app, `authHost: "localhost"` and `authEndpoint: "/broadcasting/auth"` out of the box. Set `authHost` to wherever your app is actually reachable from the container if `localhost` doesn't resolve there.
- **`clients`**: an array of `{ "appId": "...", "key": "..." }` pairs Echo Server can validate directly, without calling your app at all. Useful for server-to-server or API clients that already hold an app key. It's empty by default, add entries if you need it.

## Change the Laravel Echo Server version

There's no version env var for this service, the npm package version is pinned in `laravel-echo-server/package.json`:

```json
"dependencies": {
  "laravel-echo-server": "^1.5.0"
}
```

Edit that version, then rebuild the image:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock rebuild laravel-echo-server
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose build laravel-echo-server
```

</TabItem>
</Tabs>

## Enable HTTPS/WSS

By default the server speaks plain `http`/`ws` (`protocol: "http"` in `laravel-echo-server.json`). To serve over TLS instead, mount your certificate and key into the container, then point `sslCertPath` and `sslKeyPath` at them and set `protocol` to `"https"`:

```json
"protocol": "https",
"sslCertPath": "/path/inside/container/cert.pem",
"sslKeyPath": "/path/inside/container/key.pem"
```

You'll need to add a volume mount for your certificate files in `laravel-echo-server/compose.yml` since only `laravel-echo-server.json` itself is mounted by default.

## Turn off dev mode for production

`devMode: true` makes Echo Server log every connection, subscription, and disconnection, useful while wiring things up, noisy and unnecessary once broadcasting works. Set `devMode: false` in `laravel-echo-server.json` when you're done debugging.

## Connect from Laravel

1. In your Laravel `.env`, configure broadcasting for the Pusher driver (Echo Server speaks the Pusher protocol) and point Echo's frontend client at the container's published port, `localhost:6001` by default.
2. Set `REDIS_HOST=redis` so your app and Echo Server share the same Redis pub/sub backend, this is required, Echo Server only relays events published to Redis.
3. Start both containers:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock start redis laravel-echo-server
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose up -d redis laravel-echo-server
```

</TabItem>
</Tabs>

## Verify it's working

With `devMode: true` (the default), Echo Server logs each client connection and channel subscription as it happens. Tail the logs while your frontend connects to confirm it's receiving traffic:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock logs laravel-echo-server
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose logs --tail=100 laravel-echo-server
```

</TabItem>
</Tabs>

No logs when your app fires a broadcast event usually means the event never reached Redis, check `BROADCAST_CONNECTION` and `REDIS_HOST` in your Laravel `.env` first.

## Common issues

- **No events arrive on the frontend.** Laravel publishes broadcast events to Redis; Echo Server only relays what it sees there. Confirm your app's `.env` uses `BROADCAST_CONNECTION=redis` (or your Pusher-compatible driver of choice) and the same `REDIS_HOST` as `laravel-echo-server.json`.
- **Auth fails on private/presence channels.** `laravel-echo-server.json` sets `authEndpoint: "/broadcasting/auth"` and `authHost: "localhost"`; adjust `authHost` if your app isn't reachable at `localhost` from wherever Echo Server resolves it, or add a `clients` entry to bypass your app entirely.
- **Port already in use on your host.** Another local WebSocket server (or another Laradock project) is already bound to `6001`. Change `LARAVEL_ECHO_SERVER_PORT` in `.env` and restart: `./laradock restart laravel-echo-server`.
- **Config changes to `laravel-echo-server.json` don't take effect.** It's mounted read-only in `compose.yml`; a restart should pick up edits, but if not, rebuild: `./laradock rebuild laravel-echo-server`.

---

Starting a new project? Prefer Laravel's own first-party server, **[Laravel Reverb](https://laradock.io/docs/services/laravel-reverb)**, or the Pusher-compatible **[Soketi](https://laradock.io/docs/services/soketi)**. New to Laradock? Start at **[Getting Started](https://laradock.io/docs/getting-started)**.
