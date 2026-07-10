---
slug: /services/tarantool
title: Tarantool
description: Run Tarantool in Laradock. Start and stop the container, configure the port, use the interactive console, and pair it with the Tarantool admin web UI.
keywords:
  - laradock tarantool
  - tarantool docker
  - tarantool docker compose
  - tarantool console
  - tarantool admin ui
  - in-memory database docker
---

## What is Tarantool?

[Tarantool](https://www.tarantool.io) is an in-memory computing platform that combines a database with an embedded Lua application server, used for fast key-value and relational-style workloads plus custom server-side logic written in Lua.

## Start Tarantool

```bash
docker compose up -d tarantool
```

Pair it with the admin web UI: `docker compose up -d tarantool tarantool-admin`.

## Stop Tarantool

```bash
docker compose stop tarantool
```

This stops the container without deleting its data. To remove the container (data on disk is untouched, it lives under `DATA_PATH_HOST`): `docker compose rm -f tarantool`.

## Configuration

All settings live in `tarantool/defaults.env` and can be overridden by adding the same line to your own `.env`:

| Variable | Default | What it does |
|---|---|---|
| `TARANTOOL_PORT` | `3301` | Host-side port Tarantool is published on (`host:container`). |

Lua scripts placed in `tarantool/lua` on your host are mounted into the container at `/opt/tarantool`.

## Use the interactive console

```bash
docker compose exec tarantool console
```

## Use the admin web UI

1. Start the admin container too: `docker compose up -d tarantool tarantool-admin`.
2. Open [http://localhost:8002](http://localhost:8002) (or your custom `TARANTOOL_ADMIN_PORT`, see the **[Tarantool Admin](/docs/services/tarantool-admin)** page).
3. Set **Hostname** to `tarantool`, your data then appears in the panel.

See the [Tarantool documentation](https://www.tarantool.io/en/doc/latest/) for query and Lua scripting reference.

## Common issues

- **Admin UI shows no data.** It needs the hostname set explicitly to `tarantool` (the container name), not `localhost`, since it's connecting from inside another container.
- **App can't connect but the container is running.** Confirm your client uses `tarantool` (the container name) as the host, not `localhost` or `127.0.0.1`, those only work from your host machine, not from inside another container.
- **Port already in use on your host.** Another local Tarantool (or another Laradock project) is already bound to `3301`. Change `TARANTOOL_PORT` in `.env` and restart: `docker compose up -d tarantool`.
- **Lua scripts in `tarantool/lua` aren't picked up.** The folder is mounted at `/opt/tarantool` inside the container; confirm your init logic actually loads from that path.

---

Need the admin panel? See **[Tarantool Admin](/docs/services/tarantool-admin)**. New to Laradock? Start at **[Getting Started](/docs/getting-started)**.
