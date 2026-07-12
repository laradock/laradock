# Tarantool Admin

Source: https://laradock.io/docs/services/tarantool-admin

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

## What is Tarantool Admin?

Tarantool Admin is a browser-based UI for inspecting and managing a Tarantool instance: browse spaces, run queries, and watch server state without dropping into the Lua console.

## Start Tarantool Admin

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock start tarantool tarantool-admin
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose up -d tarantool tarantool-admin
```

</TabItem>
</Tabs>

The admin panel only shows data once it's pointed at a running `tarantool` container, start both together.

## Stop Tarantool Admin

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock stop tarantool-admin
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose stop tarantool-admin
```

</TabItem>
</Tabs>

To delete the container entirely, this is safe any time since the panel holds no data of its own (all the data lives in the `tarantool` container, untouched):

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock remove tarantool-admin
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose rm -sf tarantool-admin
```

</TabItem>
</Tabs>

## Configuration

All settings live in `tarantool-admin/defaults.env` and can be overridden by adding the same line to your own `.env`:

| Variable | Default | What it does |
|---|---|---|
| `TARANTOOL_ADMIN_PORT` | `8002` | Host-side port the admin web UI is published on. |

## Open the admin panel

1. Open [http://localhost:8002](http://localhost:8002) (or your custom `TARANTOOL_ADMIN_PORT`).
2. Set **Hostname** to `tarantool`, the container name of the Tarantool service, your data then appears in the panel.

## Change the port

Set `TARANTOOL_ADMIN_PORT` in your `.env`, then apply it:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock restart tarantool-admin
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose restart tarantool-admin
```

</TabItem>
</Tabs>

`TARANTOOL_ADMIN_PORT` only changes the host-side port, the container itself always serves the UI on its internal port `80`, so no image rebuild is needed, a restart is enough.

## Common issues

- **Blank panel / can't connect.** The `tarantool` container isn't running, or the Hostname field isn't set to `tarantool` (the container name). It won't resolve `localhost` since the UI runs inside its own container.
- **Port already in use on your host.** Another local service (or another Laradock project) is already bound to `8002`. Change `TARANTOOL_ADMIN_PORT` in `.env` and restart: `./laradock restart tarantool-admin`.
- **Changes made in the panel don't persist.** Data lives in the `tarantool` container's own storage, not in `tarantool-admin`; if you're losing data, check the Tarantool service and its `DATA_PATH_HOST/tarantool` volume, not this admin container.

---

Need the Tarantool server itself? See **[Tarantool](https://laradock.io/docs/services/tarantool)**. New to Laradock? Start at **[Getting Started](https://laradock.io/docs/getting-started)**.
