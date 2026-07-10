---
slug: /services/aerospike
title: Aerospike
description: Run Aerospike in Laradock. Start and stop the container, configure ports and storage, and connect the PHP extension to the server.
keywords:
  - laradock aerospike
  - aerospike docker
  - aerospike docker compose
  - aerospike php extension
  - aerospike namespace docker
  - nosql key-value store docker
---

## What is Aerospike?

[Aerospike](https://aerospike.com) is a distributed, high-performance NoSQL key-value database built for low-latency reads and writes at scale, commonly used for real-time use cases like ad targeting, fraud detection, and session stores.

## Start Aerospike

```bash
docker compose up -d aerospike
```

## Stop Aerospike

```bash
docker compose stop aerospike
```

This stops the container without deleting its data. To remove the container (data on disk is untouched, it lives under `DATA_PATH_HOST`): `docker compose rm -f aerospike`.

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

## Connect from PHP

Aerospike needs its own PHP extension to talk to the server from `php-fpm`/`workspace`. That's a separate install step, see **[Install the Aerospike extension](/docs/services/php-fpm#install-the-aerospike-extension)** for the `WORKSPACE_INSTALL_AEROSPIKE`/`PHP_FPM_INSTALL_AEROSPIKE` flags and rebuild command.

Once installed, connect to the server by container name and service port:

```php
$client = new Aerospike(["hosts" => [["addr" => "aerospike", "port" => 3000]]]);
```

## Connect from your host machine

Inside Laradock, other containers reach it by container name: `aerospike:3000`. From your own machine, connect to `localhost:3000` (or your custom `AEROSPIKE_SERVICE_PORT`) using the Aerospike CLI tools or a compatible client.

## Common issues

- **Client can't connect at all.** Aerospike needs all four ports (service, fabric, heartbeat, info) reachable for the node to run correctly, not just the service port. Confirm none of `AEROSPIKE_SERVICE_PORT`/`AEROSPIKE_FABRIC_PORT`/`AEROSPIKE_HEARTBEAT_PORT`/`AEROSPIKE_INFO_PORT` collide with something else on your host.
- **"Namespace not found" errors.** Your client is targeting a namespace that doesn't match `AEROSPIKE_NAMESPACE` (default `test`). Either use that namespace or change `AEROSPIKE_NAMESPACE` and restart the container.
- **PHP calls fail with "class Aerospike not found."** The PHP extension isn't installed yet, it's not bundled by default. Follow **[Install the Aerospike extension](/docs/services/php-fpm#install-the-aerospike-extension)** and rebuild `workspace`/`php-fpm`.
- **Out-of-memory or storage errors under real load.** `AEROSPIKE_MEM_GB`/`AEROSPIKE_STORAGE_GB` default to `1`, fine for local dev, but bump them in `.env` if you're testing with meaningful data volumes.

---

New to Laradock? Start at **[Getting Started](/docs/getting-started)**.
