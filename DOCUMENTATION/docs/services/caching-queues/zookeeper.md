---
slug: /services/zookeeper
title: ZooKeeper
description: Run Apache ZooKeeper in Laradock as a coordination service for Kafka. Start and stop the container and configure its port.
keywords:
  - laradock zookeeper
  - zookeeper docker
  - zookeeper docker compose
  - kafka zookeeper
  - apache zookeeper docker
---

## What is ZooKeeper?

[Apache ZooKeeper](https://zookeeper.apache.org) is a centralized coordination service for distributed systems: configuration, naming, and synchronization. In Laradock it exists almost exclusively as a dependency for **[Kafka](/docs/services/kafka)**, which uses it for broker coordination. You generally won't run ZooKeeper on its own.

## Start ZooKeeper

```bash
docker compose up -d zookeeper
```

If you're using it for Kafka (the common case), start both together:

```bash
docker compose up -d zookeeper kafka
```

## Stop ZooKeeper

```bash
docker compose stop zookeeper
```

This stops the container without deleting its data. To remove the container (data on disk is untouched, it lives under `DATA_PATH_HOST`): `docker compose rm -f zookeeper`.

## Configuration

`zookeeper/defaults.env` holds the port, overridable by adding the same line to your own `.env`:

| Variable | Default | What it does |
|---|---|---|
| `ZOOKEEPER_PORT` | `2181` | Host-side port ZooKeeper is published on (`host:2181`). |

Data is persisted under `DATA_PATH_HOST/zookeeper/data` (snapshots) and `DATA_PATH_HOST/zookeeper/datalog` (transaction logs), mounted as volumes in `zookeeper/compose.yml`.

## Use it with Kafka

Kafka's own `compose.yml` points at ZooKeeper by container name and internal port: `KAFKA_ZOOKEEPER_CONNECT: zookeeper:2181`. As long as both containers are on the `backend` network (the default), no further wiring is needed, just start both:

```bash
docker compose up -d zookeeper kafka
```

## Common issues

- **Kafka won't start / can't find its broker metadata.** Confirm `zookeeper` is actually running before or alongside `kafka`: `docker compose ps zookeeper`.
- **Port already in use on your host.** Another local ZooKeeper (or another Laradock project) is already bound to `2181`. Change `ZOOKEEPER_PORT` in `.env` and restart: `docker compose up -d zookeeper`.
- **Stale cluster state after a Kafka rebuild.** ZooKeeper's data at `DATA_PATH_HOST/zookeeper` persists across restarts; if Kafka and ZooKeeper get out of sync (for example after wiping Kafka's data but not ZooKeeper's, or vice versa), clear both data directories and start fresh.
- **Two Laradock projects overwrite each other's data.** Running more than one Laradock on the same machine? Set both `COMPOSE_PROJECT_NAME` and `DATA_PATH_HOST` to unique values per project, otherwise they share the same ZooKeeper data on disk.

---

Using this for event streaming? See **[Apache Kafka](/docs/services/kafka)**. New to Laradock? Start at **[Getting Started](/docs/getting-started)**.
