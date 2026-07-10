---
slug: /services/aerospike
title: Aerospike
description: Run Aerospike in Laradock. Start and stop the container, configure ports and storage, back up and restore data, and connect the PHP extension to the server.
keywords:
  - laradock aerospike
  - aerospike docker
  - aerospike docker compose
  - aerospike php extension
  - aerospike namespace docker
  - nosql key-value store docker
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

## What is Aerospike?

[Aerospike](https://aerospike.com) is a distributed, high-performance NoSQL key-value database built for low-latency reads and writes at scale, commonly used for real-time use cases like ad targeting, fraud detection, and session stores.

## Start Aerospike

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock start aerospike
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose up -d aerospike
```

</TabItem>
</Tabs>

Your data is created on first start and kept between restarts.

## Stop Aerospike

Stopping just pauses the container; **your data is safe**:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock stop aerospike
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose stop aerospike
```

</TabItem>
</Tabs>

To delete the container entirely (the data on disk is still untouched, it lives under `DATA_PATH_HOST`):

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock remove aerospike
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose rm -sf aerospike
```

</TabItem>
</Tabs>

## Configuration

All settings live in `aerospike/defaults.env` and can be overridden by adding the same line to your own `.env`:

| Variable | Default | What it does |
|---|---|---|
| `AEROSPIKE_SERVICE_PORT` | `3000` | Host-side port for the client service port. |
| `AEROSPIKE_FABRIC_PORT` | `3001` | Host-side port for inter-node cluster communication. |
| `AEROSPIKE_HEARTBEAT_PORT` | `3002` | Host-side port for cluster heartbeat messages. |
| `AEROSPIKE_INFO_PORT` | `3003` | Host-side port for the info/monitoring protocol. |
| `AEROSPIKE_STORAGE_GB` | `1` | Storage size (in GB) allocated to the container, passed in as `STORAGE_GB`. |
| `AEROSPIKE_MEM_GB` | `1` | Memory limit (in GB) for the container, passed in as `MEM_GB`. |
| `AEROSPIKE_NAMESPACE` | `test` | Default Aerospike namespace created on boot, passed in as `NAMESPACE`. |

## Change namespace, storage, or memory limits

`AEROSPIKE_NAMESPACE`, `AEROSPIKE_STORAGE_GB`, and `AEROSPIKE_MEM_GB` are passed into the container as plain runtime environment variables (not baked in at build time), so a restart is enough to apply a change, no rebuild needed. Set the new value in `.env`, then:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock restart aerospike
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose restart aerospike
```

</TabItem>
</Tabs>

Changing `AEROSPIKE_NAMESPACE` doesn't rename or migrate data already stored under the old namespace, it just changes which namespace the server exposes on boot.

## Change the Aerospike version

The version is pinned by the `AEROSPIKE_VERSION` build arg at the top of `aerospike/Dockerfile` (`ce-8.1.2.2` by default), it isn't exposed as an `.env` variable. Edit that line to the tag you want from [Aerospike's Docker Hub](https://hub.docker.com/r/aerospike/aerospike-server), then rebuild:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock rebuild aerospike
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose build aerospike
```

</TabItem>
</Tabs>

## Connect from PHP

Aerospike needs its own PHP extension to talk to the server from `php-fpm`/`workspace`. That's a separate install step, see **[Install the Aerospike extension](/docs/services/php-fpm#install-the-aerospike-extension)** for the `WORKSPACE_INSTALL_AEROSPIKE`/`PHP_FPM_INSTALL_AEROSPIKE` flags and rebuild command.

Once installed, connect to the server by container name and service port:

```php
$client = new Aerospike(["hosts" => [["addr" => "aerospike", "port" => 3000]]]);
```

## Connect from your host machine

Inside Laradock, other containers reach it by container name: `aerospike:3000`. From your own machine, connect to `localhost:3000` (or your custom `AEROSPIKE_SERVICE_PORT`) using the Aerospike CLI tools or a compatible client.

## Check node status

Open a terminal inside the container, then ask the running node for its status:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock enter aerospike
asinfo -v status
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose exec aerospike bash
asinfo -v status
```

</TabItem>
</Tabs>

A healthy node replies `ok`. Run `asinfo -v namespaces` the same way to list the namespaces currently configured on the node.

## Backup and restore

Aerospike's data lives entirely under the `DATA_PATH_HOST/aerospike` volume mount, so backing it up is a matter of stopping the node and copying that folder while nothing is writing to it.

**Back up:**

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock stop aerospike
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose stop aerospike
```

</TabItem>
</Tabs>

```bash
cp -r "${DATA_PATH_HOST:-~/.laradock/data}/aerospike" ./aerospike-backup-$(date +%Y%m%d)
```

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock start aerospike
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose up -d aerospike
```

</TabItem>
</Tabs>

**Restore** from a backup folder made the same way (⚠️ this replaces everything currently in `DATA_PATH_HOST/aerospike`):

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock stop aerospike
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose stop aerospike
```

</TabItem>
</Tabs>

```bash
rm -rf "${DATA_PATH_HOST:-~/.laradock/data}/aerospike"
cp -r ./aerospike-backup-20260101 "${DATA_PATH_HOST:-~/.laradock/data}/aerospike"
```

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock start aerospike
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose up -d aerospike
```

</TabItem>
</Tabs>

## Start completely fresh (wipe all data)

To throw away everything and start Aerospike from a clean, empty state (⚠️ this **permanently deletes** all data in this container, back up first if you need anything):

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock stop aerospike
./laradock remove aerospike
rm -rf "${DATA_PATH_HOST:-~/.laradock/data}/aerospike"
./laradock start aerospike
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose stop aerospike
docker compose rm -sf aerospike
rm -rf "${DATA_PATH_HOST:-~/.laradock/data}/aerospike"
docker compose up -d aerospike
```

</TabItem>
</Tabs>

`DATA_PATH_HOST` is whatever you have set in `.env` (`~/.laradock/data` by default), so the folder above is where Aerospike's data actually lives on your machine.

## Talk to this from another Laradock project

Each Laradock project is its own isolated Docker network by default, so a second project's containers can't reach this Aerospike by container name out of the box. Easiest fix: the service, fabric, heartbeat, and info ports are already published to your host, so have the other project connect to your **host machine's** address instead of `aerospike`, for example `host.docker.internal` (Docker Desktop) with the port set to this project's `AEROSPIKE_SERVICE_PORT`. Make sure the two projects use different values for all four Aerospike ports if they're both running at once.

## Common issues

- **Client can't connect at all.** Aerospike needs all four ports (service, fabric, heartbeat, info) reachable for the node to run correctly, not just the service port. Confirm none of `AEROSPIKE_SERVICE_PORT`/`AEROSPIKE_FABRIC_PORT`/`AEROSPIKE_HEARTBEAT_PORT`/`AEROSPIKE_INFO_PORT` collide with something else on your host.
- **"Namespace not found" errors.** Your client is targeting a namespace that doesn't match `AEROSPIKE_NAMESPACE` (default `test`). Either use that namespace or change `AEROSPIKE_NAMESPACE` and `./laradock restart aerospike`.
- **PHP calls fail with "class Aerospike not found."** The PHP extension isn't installed yet, it's not bundled by default. Follow **[Install the Aerospike extension](/docs/services/php-fpm#install-the-aerospike-extension)** and rebuild `workspace`/`php-fpm`.
- **Out-of-memory or storage errors under real load.** `AEROSPIKE_MEM_GB`/`AEROSPIKE_STORAGE_GB` default to `1`, fine for local dev, but bump them in `.env` if you're testing with meaningful data volumes, then `./laradock restart aerospike`.
- **Node reports itself unhealthy after a host reboot.** Run `./laradock logs aerospike` and check for storage errors before assuming data is lost, a node re-joining after an unclean shutdown can take a few seconds to come back to `ok` in `asinfo -v status`.

---

New to Laradock? Start at **[Getting Started](/docs/getting-started)**.
