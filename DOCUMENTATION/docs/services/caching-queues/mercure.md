---
slug: /services/mercure
title: Mercure
description: Run a Mercure hub in Laradock for real-time updates over Server-Sent Events, popular in the Symfony and API Platform ecosystem.
keywords:
  - laradock mercure
  - mercure docker
  - mercure hub docker
  - server-sent events docker
  - symfony real-time updates
  - api platform mercure
---

## What is Mercure?

[Mercure](https://mercure.rocks) is an open protocol and hub for pushing real-time updates to web and mobile clients using Server-Sent Events. It's the default real-time solution for Symfony and API Platform, and works as a lightweight alternative to WebSocket servers when you only need server-to-client push. Laradock builds it from the official `dunglas/mercure` image.

## Start Mercure

```bash
docker compose up -d mercure
```

## Stop Mercure

```bash
docker compose stop mercure
```

This stops the container. To remove it entirely: `docker compose rm -f mercure`.

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

## Common issues

- **`401 Unauthorized` when publishing.** The JWT must be signed with `MERCURE_PUBLISHER_JWT_KEY` and include the `mercure.publish` claim for the topics you're targeting.
- **Browser can't subscribe via CORS.** `MERCURE_EXTRA_DIRECTIVES` in `mercure/compose.yml` already allows all origins (`cors_allowed_origins *`) by default; if you've narrowed it, make sure your frontend's origin is included.
- **Port already in use on your host.** Another local Mercure hub (or another Laradock project) is already bound to `1337` or `1338`. Change `MERCURE_NODE_HOST_HTTP_PORT` / `MERCURE_NODE_HOST_HTTPS_PORT` in `.env` and restart.
- **Using the default JWT keys in anything beyond local dev.** `secret` and `another_secret` are placeholders; change `MERCURE_PUBLISHER_JWT_KEY` and `MERCURE_SUBSCRIBER_JWT_KEY` in `.env` before this leaves your machine.

---

Need Pusher-protocol WebSockets for Laravel Echo instead? See **[Soketi](/docs/services/soketi)** or **[Laravel Reverb](/docs/services/laravel-reverb)**. New to Laradock? Start at **[Getting Started](/docs/getting-started)**.
