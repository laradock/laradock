---
slug: /services/cassandra
title: Cassandra
description: Run Apache Cassandra in Laradock. Start and stop the container, configure cluster/auth settings, connect with cqlsh, check cluster status, and back up or reset your data.
keywords:
  - laradock cassandra
  - cassandra docker
  - cassandra docker compose
  - apache cassandra docker
  - cqlsh docker
  - cassandra cluster docker
  - cassandra backup docker
  - nodetool docker
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

## What is Cassandra?

[Apache Cassandra](https://cassandra.apache.org) is a distributed, wide-column NoSQL database built for high availability and horizontal scale across many nodes with no single point of failure. Laradock runs it via the [Bitnami Cassandra image](https://hub.docker.com/r/bitnami/cassandra/) as a single-node instance for local development.

## Start Cassandra

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock start cassandra
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose up -d cassandra
```

</TabItem>
</Tabs>

`compose.yml` declares `depends_on: php-fpm`, so Docker Compose starts `php-fpm` automatically if it isn't already running. The container also runs `privileged: true`, which Cassandra's Bitnami image requires. Your data is created on first start and kept between restarts.

## Stop Cassandra

Stopping just pauses the container; **your data is safe**:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock stop cassandra
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose stop cassandra
```

</TabItem>
</Tabs>

To delete the container entirely (the data on disk is still untouched, it lives under `DATA_PATH_HOST/cassandra`):

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock remove cassandra
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose rm -sf cassandra
```

</TabItem>
</Tabs>

## Configuration

All settings live in `cassandra/defaults.env` and can be overridden by adding the same line to your own `.env` (your `.env` always wins):

| Variable | Default | What it does |
|---|---|---|
| `CASSANDRA_VERSION` | `latest` | Image tag from [bitnami/cassandra on Docker Hub](https://hub.docker.com/r/bitnami/cassandra/). |
| `CASSANDRA_TRANSPORT_PORT_NUMBER` | `7000` | Inter-node cluster communication port. |
| `CASSANDRA_JMX_PORT_NUMBER` | `7199` | JMX connections port. |
| `CASSANDRA_CQL_PORT_NUMBER` | `9042` | Client (CQL) port, what your app/driver connects to. |
| `CASSANDRA_USER` | `cassandra` | Cassandra username. |
| `CASSANDRA_PASSWORD_SEEDER` | `no` | Set `yes` on exactly one node in a cluster to have it change default credentials at initialization. |
| `CASSANDRA_PASSWORD` | `cassandra` | Password for `CASSANDRA_USER`. |
| `CASSANDRA_NUM_TOKENS` | `256` | Number of tokens for the node. |
| `CASSANDRA_HOST` | *(empty)* | Hostname to configure Cassandra with; resolves to the machine IP if left empty. |
| `CASSANDRA_CLUSTER_NAME` | `"My Cluster"` | Cluster name. |
| `CASSANDRA_SEEDS` | *(empty)* | Hosts acting as Cassandra seeds for cluster discovery. |
| `CASSANDRA_ENDPOINT_SNITCH` | `SimpleSnitch` | Snitch strategy, determines which data centers/racks nodes belong to. |
| `CASSANDRA_ENABLE_RPC` | `true` | Enables the Thrift RPC endpoint. |
| `CASSANDRA_DATACENTER` | `dc1` | Datacenter name (ignored under `SimpleSnitch`). |
| `CASSANDRA_RACK` | `rack1` | Rack name (ignored under `SimpleSnitch`). |

## Connect with cqlsh

Open a terminal inside the Cassandra container, then start `cqlsh`:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock enter cassandra
cqlsh -u cassandra -p cassandra
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose exec cassandra bash
cqlsh -u cassandra -p cassandra
```

</TabItem>
</Tabs>

Use your own `CASSANDRA_USER`/`CASSANDRA_PASSWORD` if you changed them. From your host machine or another container, connect on `CASSANDRA_CQL_PORT_NUMBER` (`9042` by default) at `cassandra` (container name) or `localhost` (from the host).

## Check cluster status

Cassandra can take a while to become ready on first boot, and a running container doesn't mean the node has finished starting. `nodetool status` is the standard way to check:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock exec cassandra nodetool status
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose exec cassandra nodetool status
```

</TabItem>
</Tabs>

`UN` in the output means "Up, Normal", the node is fully joined and ready to serve queries. Anything else (`UJ` joining, `DN` down) means it's not ready yet.

## Backup and restore

Cassandra stores everything under `/var/lib/cassandra` inside the container, which is bind-mounted straight from `DATA_PATH_HOST/cassandra` on your host. The simplest reliable backup is archiving that directory while the container is stopped:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock stop cassandra
tar -czf cassandra-backup.tar.gz -C "${DATA_PATH_HOST:-~/.laradock/data}/cassandra" .
./laradock start cassandra
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose stop cassandra
tar -czf cassandra-backup.tar.gz -C "${DATA_PATH_HOST:-~/.laradock/data}/cassandra" .
docker compose up -d cassandra
```

</TabItem>
</Tabs>

To restore, stop the container, replace the data folder with the backup, then start again:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock stop cassandra
rm -rf "${DATA_PATH_HOST:-~/.laradock/data}/cassandra"
mkdir -p "${DATA_PATH_HOST:-~/.laradock/data}/cassandra"
tar -xzf cassandra-backup.tar.gz -C "${DATA_PATH_HOST:-~/.laradock/data}/cassandra"
./laradock start cassandra
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose stop cassandra
rm -rf "${DATA_PATH_HOST:-~/.laradock/data}/cassandra"
mkdir -p "${DATA_PATH_HOST:-~/.laradock/data}/cassandra"
tar -xzf cassandra-backup.tar.gz -C "${DATA_PATH_HOST:-~/.laradock/data}/cassandra"
docker compose up -d cassandra
```

</TabItem>
</Tabs>

For a point-in-time backup **without** stopping the node, use Cassandra's own snapshot mechanism instead:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock exec cassandra nodetool snapshot -t my_backup
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose exec cassandra nodetool snapshot -t my_backup
```

</TabItem>
</Tabs>

This hard-links the current on-disk SSTables into a `snapshots/my_backup` folder inside each table's data directory (still under `DATA_PATH_HOST/cassandra`), which you can then `tar` out while the node keeps running. Clear it afterward with `nodetool clearsnapshot -t my_backup` so it doesn't consume extra disk space forever.

## Start completely fresh (wipe all data)

To throw away everything and start Cassandra from a clean, empty state (⚠️ this **permanently deletes** every keyspace in this container, back up first if you need anything):

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock stop cassandra
./laradock remove cassandra
rm -rf "${DATA_PATH_HOST:-~/.laradock/data}/cassandra"
./laradock start cassandra
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose stop cassandra
docker compose rm -sf cassandra
rm -rf "${DATA_PATH_HOST:-~/.laradock/data}/cassandra"
docker compose up -d cassandra
```

</TabItem>
</Tabs>

`DATA_PATH_HOST` is whatever you have set in `.env` (`~/.laradock/data` by default), so the folder above is where Cassandra's data actually lives on your machine. Deleting it and starting again re-runs first-boot initialization, so `CASSANDRA_USER`/`CASSANDRA_PASSWORD` and the rest of the config table apply fresh, exactly like a brand-new node.

## Talk to this database from another Laradock project

Each Laradock project is its own isolated Docker network by default, so a second project's containers can't reach this Cassandra by container name out of the box. Easiest fix: the port is already published (`CASSANDRA_CQL_PORT_NUMBER`), so have the other project connect to your **host machine's** address instead of `cassandra`, for example `host.docker.internal` (Docker Desktop) with its CQL driver port set to this project's `CASSANDRA_CQL_PORT_NUMBER`. Make sure the two projects use different `CASSANDRA_CQL_PORT_NUMBER` (and `CASSANDRA_TRANSPORT_PORT_NUMBER`/`CASSANDRA_JMX_PORT_NUMBER`) values if they're both running at once.

## Common issues

- **Container won't start / permission errors.** Cassandra's Bitnami image needs `privileged: true`, which `compose.yml` already sets; if your Docker setup restricts privileged containers (some CI runners, rootless Docker), it may fail to boot.
- **Slow first boot.** Cassandra can take longer than other databases to become ready on first start. Check `./laradock logs cassandra` and confirm with `nodetool status` (see [Check cluster status](#check-cluster-status)) before connecting.
- **Credential changes don't take effect.** Credentials are set at initialization; changing `CASSANDRA_USER`/`CASSANDRA_PASSWORD` afterward requires either a [fresh start](#start-completely-fresh-wipe-all-data) (data loss, back up first) or changing them through CQL directly.
- **App can't connect but the container is running.** Confirm the app's driver config uses `cassandra` (the container name) as the host, not `localhost`, which only works from your host machine.
- **Port already in use on your host.** Another service is bound to `7000`, `7199`, or `9042`. Change the relevant `CASSANDRA_*_PORT_NUMBER` in `.env` and restart with `./laradock restart cassandra`.

---

Need a document database instead? See **[CouchDB](/docs/services/couchdb)**. For the full list of services, see **[Getting Started](/docs/getting-started)**.
