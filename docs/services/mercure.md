# Mercure

Source: https://laradock.io/docs/services/mercure

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

## What is Mercure?

[Mercure](https://mercure.rocks) is an open protocol and hub for pushing real-time updates to web and mobile clients using Server-Sent Events. It's the default real-time solution for Symfony and API Platform, and works as a lightweight alternative to WebSocket servers when you only need server-to-client push. Laradock builds it from the official `dunglas/mercure` image.

## Start Mercure

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock start mercure
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose up -d mercure
```

</TabItem>
</Tabs>

The hub keeps no persistent data on disk, there's no volume in `mercure/compose.yml`. All subscriptions and in-flight updates live in the running container's memory only, so a restart clears them, there's nothing to back up. Name any other services alongside it to start them together, for example `./laradock start mercure workspace`.

## Stop Mercure

Stopping just pauses the container:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock stop mercure
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose stop mercure
```

</TabItem>
</Tabs>

To remove the container entirely:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock remove mercure
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose rm -sf mercure
```

</TabItem>
</Tabs>

Since there's no data volume, stopping and removing are functionally the same in terms of what's lost: any currently-open subscriptions and undelivered updates. Starting again gives you a clean hub.

## Configuration

All settings live in `mercure/defaults.env` and can be overridden by adding the same line to your own `.env`:

| Variable | Default | What it does |
|---|---|---|
| `MERCURE_NODE_HOST_HTTP_PORT` | `1337` | Host-side port for HTTP (`host:80`). |
| `MERCURE_NODE_HOST_HTTPS_PORT` | `1338` | Host-side port for HTTPS (`host:443`). |
| `MERCURE_PUBLISHER_JWT_KEY` | `secret` | Signing key used to validate JWTs from publishers. Change this for anything beyond local development. |
| `MERCURE_SUBSCRIBER_JWT_KEY` | `another_secret` | Signing key used to validate JWTs from subscribers. Change this for anything beyond local development. |
| `MERCURE_DEBUG` | `debug` | Passed through as the container's `DEBUG` environment variable. |
| `MERCURE_SERVER_NAME` | `:80` | Passed through as the Caddy `SERVER_NAME` the Mercure hub binds to. |

`mercure/compose.yml` also sets `MERCURE_EXTRA_DIRECTIVES` to allow CORS from any origin and to allow publishing from `http://localhost:<MERCURE_NODE_HOST_HTTP_PORT>` and its HTTPS equivalent. Edit that block in `mercure/compose.yml` directly if you need different origins.

## Publish and subscribe

Inside Laradock, other containers reach the hub by container name: `mercure:80`. From your host machine (or the browser), use `http://localhost:1337` (or your custom `MERCURE_NODE_HOST_HTTP_PORT`).

Publishing requires a JWT signed with `MERCURE_PUBLISHER_JWT_KEY` containing the topics you're allowed to publish to; subscribing (from the browser via `EventSource`) requires a JWT signed with `MERCURE_SUBSCRIBER_JWT_KEY` for private topics, or no JWT at all for public ones. See the [Mercure documentation](https://mercure.rocks/docs/hub/config) for the JWT claim format.

## Test it from the command line

Every Mercure hub exposes the protocol's fixed endpoint, `/.well-known/mercure`, for both publishing and subscribing, useful for a quick sanity check without wiring up your app first.

Subscribe to a topic (this blocks and streams events as they arrive, `-N` disables curl's output buffering):

```bash
curl -N "http://localhost:1337/.well-known/mercure?topic=https://example.com/my-topic"
```

In a second terminal, publish an update to that same topic (`data` is the payload your subscribers receive):

```bash
curl -X POST "http://localhost:1337/.well-known/mercure" \
  -H "Authorization: Bearer <your publisher JWT>" \
  -d "topic=https://example.com/my-topic" \
  -d 'data={"hello":"world"}'
```

You should see the update appear on the first terminal's stream. The publisher JWT must be signed (HS256) with your `MERCURE_PUBLISHER_JWT_KEY` and carry a `mercure.publish` claim covering the topic (`["*"]` to allow all topics during local testing). If the topic you're subscribing to is private, the subscribe request also needs an `Authorization` header with a JWT signed by `MERCURE_SUBSCRIBER_JWT_KEY`.

## Debug mode

`MERCURE_DEBUG` (default `debug`) is passed straight through as the container's `DEBUG` variable, turning on more verbose logging from the underlying Caddy server. Tail it while reproducing a failing publish or subscribe:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock logs mercure
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose logs --tail=100 mercure
```

</TabItem>
</Tabs>

## Talk to this hub from another Laradock project

Each Laradock project is its own isolated Docker network by default, so a second project's containers can't reach this hub by container name (`mercure`) out of the box. The ports are already published to your host (`MERCURE_NODE_HOST_HTTP_PORT`/`MERCURE_NODE_HOST_HTTPS_PORT`), so point the other project at your **host machine's** address instead, for example `http://host.docker.internal:1337` (Docker Desktop) from inside another project's containers. Make sure the two projects use different `MERCURE_NODE_HOST_HTTP_PORT` values if they're both running at once.

## Common issues

- **`401 Unauthorized` when publishing.** The JWT must be signed with `MERCURE_PUBLISHER_JWT_KEY` and include the `mercure.publish` claim for the topics you're targeting.
- **Browser can't subscribe via CORS.** `MERCURE_EXTRA_DIRECTIVES` in `mercure/compose.yml` already allows all origins (`cors_allowed_origins *`) by default; if you've narrowed it, make sure your frontend's origin is included.
- **Port already in use on your host.** Another local Mercure hub (or another Laradock project) is already bound to `1337` or `1338`. Change `MERCURE_NODE_HOST_HTTP_PORT` / `MERCURE_NODE_HOST_HTTPS_PORT` in `.env` and restart with `./laradock restart mercure`.
- **Using the default JWT keys in anything beyond local dev.** `secret` and `another_secret` are placeholders; change `MERCURE_PUBLISHER_JWT_KEY` and `MERCURE_SUBSCRIBER_JWT_KEY` in `.env` before this leaves your machine.
- **Updates aren't reaching subscribers after a restart.** Expected: Mercure keeps no persistent state, subscriptions and undelivered updates don't survive a restart. Your app needs to resubscribe.

---

Need Pusher-protocol WebSockets for Laravel Echo instead? See **[Soketi](https://laradock.io/docs/services/soketi)** or **[Laravel Reverb](https://laradock.io/docs/services/laravel-reverb)**. New to Laradock? Start at **[Getting Started](https://laradock.io/docs/getting-started)**.
