---
slug: /services/tarantool-admin
title: Tarantool Admin
description: Run the Tarantool Admin web UI in Laradock. Start and stop the container, configure the port, and connect it to the Tarantool service.
keywords:
  - laradock tarantool admin
  - tarantool web ui
  - tarantool docker compose
  - tarantool gui
  - tarantool dashboard
  - tarantool admin panel docker
---

## What is Tarantool Admin?

Tarantool Admin is a browser-based UI for inspecting and managing a Tarantool instance: browse spaces, run queries, and watch server state without dropping into the Lua console.

## Start Tarantool Admin

```bash
docker compose up -d tarantool tarantool-admin
```

The admin panel only shows data once it's pointed at a running `tarantool` container, start both together.

## Stop Tarantool Admin

```bash
docker compose stop tarantool-admin
```

## Configuration

All settings live in `tarantool-admin/defaults.env` and can be overridden by adding the same line to your own `.env`:

| Variable | Default | What it does |
|---|---|---|
| `TARANTOOL_ADMIN_PORT` | `8002` | Host-side port the admin web UI is published on. |

## Open the admin panel

1. Open [http://localhost:8002](http://localhost:8002) (or your custom `TARANTOOL_ADMIN_PORT`).
2. Set **Hostname** to `tarantool`, the container name of the Tarantool service, your data then appears in the panel.

## Common issues

- **Blank panel / can't connect.** The `tarantool` container isn't running, or the Hostname field isn't set to `tarantool` (the container name). It won't resolve `localhost` since the UI runs inside its own container.
- **Port already in use on your host.** Another local service (or another Laradock project) is already bound to `8002`. Change `TARANTOOL_ADMIN_PORT` in `.env` and restart: `docker compose up -d tarantool-admin`.
- **Changes made in the panel don't persist.** Data lives in the `tarantool` container's own storage, not in `tarantool-admin`; if you're losing data, check the Tarantool service and its `DATA_PATH_HOST/tarantool` volume, not this admin container.

---

Need the Tarantool server itself? See **[Tarantool](/docs/services/tarantool)**. New to Laradock? Start at **[Getting Started](/docs/getting-started)**.
