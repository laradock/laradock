---
slug: /services/kafka-manager
title: Kafka Manager
description: Run Kafka Manager in Laradock, a web UI for managing Kafka clusters. Start the container and connect it to ZooKeeper and Kafka.
keywords:
  - laradock kafka manager
  - kafka web ui
  - kafka docker compose
  - kafka cluster management
  - kafka manager zookeeper
  - kafka dashboard docker
---

## What is Kafka Manager?

Kafka Manager is a web-based tool for managing and monitoring Apache Kafka clusters: view brokers, topics, partitions, and consumer group offsets from a browser instead of the Kafka CLI tools.

## Start Kafka Manager

```bash
docker compose up -d zookeeper kafka kafka-manager
```

Kafka Manager talks to ZooKeeper to discover the cluster, so both `zookeeper` and `kafka` need to be running for it to be useful.

## Stop Kafka Manager

```bash
docker compose stop kafka-manager
```

## Configuration

`kafka-manager/defaults.env` doesn't exist, the container has no configurable `.env` variables. Its settings are fixed directly in `kafka-manager/compose.yml`:

| Setting | Value | What it does |
|---|---|---|
| Host port | `9020` | Fixed mapping to the container's port `9000` (not overridable via `.env`). |
| `ZK_HOSTS` | `zookeeper:2181` | ZooKeeper connection string the manager uses to discover the cluster. |

## Add your cluster

1. Open [http://localhost:9020](http://localhost:9020).
2. Add a cluster pointing at the ZooKeeper host `zookeeper:2181`.

## Common issues

- **Port `9020` already in use on your host.** Since it's hardcoded in `compose.yml` (not an `.env` variable), you'll need to edit `kafka-manager/compose.yml` directly to change it, or stop whatever else is bound to that port.
- **"No clusters" or connection errors when adding a cluster.** Confirm `zookeeper` is actually running (`docker compose ps zookeeper`) before adding the cluster, and that you used `zookeeper:2181`, not `kafka:9092`, as the connection string.
- **Topics/brokers don't show up.** Confirm `kafka` itself is up and has successfully registered with ZooKeeper; check `docker compose logs kafka` for startup errors.

---

Need the Kafka broker itself? See **[Apache Kafka](/docs/services/kafka)**. New to Laradock? Start at **[Getting Started](/docs/getting-started)**.
