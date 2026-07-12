# Tarantool

Source: https://laradock.io/docs/services/tarantool

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

## What is Tarantool?

[Tarantool](https://www.tarantool.io) is an in-memory computing platform that combines a database with an embedded Lua application server, used for fast key-value and relational-style workloads plus custom server-side logic written in Lua.

## Start Tarantool

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock start tarantool
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose up -d tarantool
```

</TabItem>
</Tabs>

Your data is created on first start and kept between restarts. Name any other services alongside it to start them together, for example to pair it with the admin web UI: `./laradock start tarantool tarantool-admin`.

## Stop Tarantool

Stopping just pauses the container; **your data is safe**:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock stop tarantool
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose stop tarantool
```

</TabItem>
</Tabs>

To delete the container entirely (the data on disk is still untouched, it lives under `DATA_PATH_HOST`):

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock remove tarantool
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose rm -sf tarantool
```

</TabItem>
</Tabs>

## Configuration

All settings live in `tarantool/defaults.env` and can be overridden by adding the same line to your own `.env`:

| Variable | Default | What it does |
|---|---|---|
| `TARANTOOL_PORT` | `3301` | Host-side port Tarantool is published on (`host:container`). |

Lua scripts placed in `tarantool/lua` on your host are mounted into the container at `/opt/tarantool`.

## Use the interactive console

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock exec tarantool console
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose exec tarantool console
```

</TabItem>
</Tabs>

## Use the admin web UI

1. Start the admin container too: `./laradock start tarantool tarantool-admin`.
2. Open [http://localhost:8002](http://localhost:8002) (or your custom `TARANTOOL_ADMIN_PORT`, see the **[Tarantool Admin](https://laradock.io/docs/services/tarantool-admin)** page).
3. Set **Hostname** to `tarantool`, your data then appears in the panel.

See the [Tarantool documentation](https://www.tarantool.io/en/doc/latest/) for query and Lua scripting reference.

## Backup and restore

Tarantool persists its in-memory data to disk as snapshot (`.snap`) and write-ahead-log (`.xlog`) files under `/var/lib/tarantool` in the container, mapped to `DATA_PATH_HOST/tarantool` on your host. Backing up is a matter of forcing a fresh snapshot, then copying that folder.

**Force a snapshot** from the interactive console so the on-disk files reflect the current in-memory state:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock exec tarantool console
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose exec tarantool console
```

</TabItem>
</Tabs>

Then, inside the console:

```lua
box.snapshot()
```

**Copy the data directory** to back it up:

```bash
cp -r "${DATA_PATH_HOST:-~/.laradock/data}/tarantool" ./tarantool-backup
```

**Restore** by stopping the container, replacing the data directory with your backup, then starting again:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock stop tarantool
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose stop tarantool
```

</TabItem>
</Tabs>

```bash
rm -rf "${DATA_PATH_HOST:-~/.laradock/data}/tarantool"
cp -r ./tarantool-backup "${DATA_PATH_HOST:-~/.laradock/data}/tarantool"
```

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock start tarantool
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose up -d tarantool
```

</TabItem>
</Tabs>

## Start completely fresh (wipe all data)

To throw away everything and start Tarantool from a clean, empty state (⚠️ this **permanently deletes** all snapshots and logs in this container, back up first if you need anything):

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock stop tarantool
./laradock remove tarantool
rm -rf "${DATA_PATH_HOST:-~/.laradock/data}/tarantool"
./laradock start tarantool
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose stop tarantool
docker compose rm -sf tarantool
rm -rf "${DATA_PATH_HOST:-~/.laradock/data}/tarantool"
docker compose up -d tarantool
```

</TabItem>
</Tabs>

`DATA_PATH_HOST` is whatever you have set in `.env` (`~/.laradock/data` by default), so the folder above is where Tarantool's data actually lives on your machine.

## Talk to this from another Laradock project

Each Laradock project is its own isolated Docker network by default, so a second project's containers can't reach this Tarantool by container name out of the box. Easiest fix: publish the port (already done, `TARANTOOL_PORT`) and have the other project connect to your **host machine's** address instead of `tarantool`, for example `host.docker.internal` (Docker Desktop) on this project's `TARANTOOL_PORT`. Make sure the two projects use different `TARANTOOL_PORT` values if they're both running at once.

## Common issues

- **Admin UI shows no data.** It needs the hostname set explicitly to `tarantool` (the container name), not `localhost`, since it's connecting from inside another container.
- **App can't connect but the container is running.** Confirm your client uses `tarantool` (the container name) as the host, not `localhost` or `127.0.0.1`, those only work from your host machine, not from inside another container.
- **Port already in use on your host.** Another local Tarantool (or another Laradock project) is already bound to `3301`. Change `TARANTOOL_PORT` in `.env` and restart: `./laradock restart tarantool`.
- **Lua scripts in `tarantool/lua` aren't picked up.** The folder is mounted at `/opt/tarantool` inside the container; confirm your init logic actually loads from that path.

---

Need the admin panel? See **[Tarantool Admin](https://laradock.io/docs/services/tarantool-admin)**. New to Laradock? Start at **[Getting Started](https://laradock.io/docs/getting-started)**.
