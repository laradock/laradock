---
slug: /services/cassandra
title: Cassandra
description: Run Apache Cassandra in Laradock. Start and stop the container, configure cluster/auth settings, and connect with cqlsh.
keywords:
  - laradock cassandra
  - cassandra docker
  - cassandra docker compose
  - apache cassandra docker
  - cqlsh docker
  - cassandra cluster docker
---

## What is Cassandra?

[Apache Cassandra](https://cassandra.apache.org) is a distributed, wide-column NoSQL database built for high availability and horizontal scale across many nodes with no single point of failure. Laradock runs it via the [Bitnami Cassandra image](https://hub.docker.com/r/bitnami/cassandra/) as a single-node instance for local development.

## Start Cassandra

```bash
docker compose up -d cassandra
```

`compose.yml` declares `depends_on: php-fpm`, so Docker Compose starts `php-fpm` automatically if it isn't already running. The container also runs `privileged: true`, which Cassandra's Bitnami image requires.

## Stop Cassandra

```bash
docker compose stop cassandra
```

This stops the container without deleting its data. Data persists under `DATA_PATH_HOST/cassandra`.

## Configuration

All settings live in `cassandra/defaults.env`:

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

```bash
docker compose exec cassandra cqlsh -u cassandra -p cassandra
```

Use your own `CASSANDRA_USER`/`CASSANDRA_PASSWORD` if you changed them. From your host machine or another container, connect on `CASSANDRA_CQL_PORT_NUMBER` (`9042` by default) at `cassandra` (container name) or `localhost` (from the host).

## Common issues

- **Container won't start / permission errors.** Cassandra's Bitnami image needs `privileged: true`, which `compose.yml` already sets; if your Docker setup restricts privileged containers (some CI runners, rootless Docker), it may fail to boot.
- **Slow first boot.** Cassandra can take longer than other databases to become ready on first start. Check `docker compose logs cassandra` before connecting.
- **Credential changes don't take effect.** Credentials are set at initialization; changing `CASSANDRA_USER`/`CASSANDRA_PASSWORD` afterward requires either a fresh `DATA_PATH_HOST/cassandra` or changing them through CQL directly.
- **App can't connect but the container is running.** Confirm the app's driver config uses `cassandra` (the container name) as the host, not `localhost`, which only works from your host machine.
- **Port already in use on your host.** Another service is bound to `7000`, `7199`, or `9042`. Change the relevant `CASSANDRA_*_PORT_NUMBER` in `.env` and restart.

---

Need a document database instead? See **[CouchDB](/docs/services/couchdb)**. For the full list of services, see **[Getting Started](/docs/getting-started)**.
