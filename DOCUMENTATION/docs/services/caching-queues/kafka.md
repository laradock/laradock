---
slug: /services/kafka
title: Apache Kafka
description: Run Apache Kafka in Laradock. Start it alongside ZooKeeper, configure broker settings, and manage the cluster from a web UI.
keywords:
  - laradock kafka
  - kafka docker
  - kafka docker compose
  - kafka zookeeper docker
  - kafka broker port
  - kafka manager docker
---

## What is Apache Kafka?

[Apache Kafka](https://kafka.apache.org) is a distributed event-streaming platform for high-throughput publish/subscribe messaging, used for event pipelines, log aggregation, and decoupling services. Laradock's Kafka needs the `zookeeper` container running alongside it to manage broker coordination.

## Start Kafka

```bash
docker compose up -d zookeeper kafka
```

## Stop Kafka

```bash
docker compose stop kafka
```

This stops the container. To also stop ZooKeeper: `docker compose stop kafka zookeeper`.

## Configuration

`kafka/defaults.env` is empty, all Kafka configuration is fixed directly in `kafka/compose.yml` rather than exposed as `.env` overrides:

| Setting | Value | What it does |
|---|---|---|
| `KAFKA_BROKER_ID` | `1` | Unique ID for this broker in the cluster. |
| `KAFKA_ADVERTISED_HOST_NAME` | `127.0.0.1` | Hostname advertised to clients for connecting back. |
| `KAFKA_ADVERTISED_LISTENERS` | `PLAINTEXT://127.0.0.1:9092` | Listener address advertised to clients. |
| `KAFKA_MESSAGE_MAX_BYTES` | `2000000` | Maximum message size the broker accepts. |
| `KAFKA_ZOOKEEPER_CONNECT` | `zookeeper:2181` | ZooKeeper connection string. |

The broker listens on port `9092` (mapped `host:container` in `compose.yml`, not driven by an env var). Kafka data is stored under `DATA_PATH_HOST/kafka`, and the container also mounts `/var/run/docker.sock`.

## Manage Kafka from a web UI

Start Kafka Manager alongside it:

```bash
docker compose up -d kafka-manager
```

Open [http://localhost:9020](http://localhost:9020) and add a cluster pointing at the ZooKeeper host `zookeeper:2181`. See **[Kafka Manager](/docs/services/kafka-manager)** for details.

## Connect from your host machine

Inside Laradock, other containers reach the broker at `kafka:9092`. From your own machine, it's published on `localhost:9092`. Note `KAFKA_ADVERTISED_HOST_NAME`/`KAFKA_ADVERTISED_LISTENERS` are hardcoded to `127.0.0.1` in `compose.yml`, if you need clients on other machines on your network to connect, you'll need to edit those values directly.

## Common issues

- **Kafka won't start.** It depends on ZooKeeper being up first; always start both together with `docker compose up -d zookeeper kafka`.
- **Client can't produce/consume even though the container is running.** Confirm your client is using `kafka:9092` from inside another container, or `localhost:9092` from your host, not a mix of the two.
- **Message rejected as too large.** Check `KAFKA_MESSAGE_MAX_BYTES` (fixed at `2000000` in `compose.yml`); anything bigger needs the compose file edited directly since it's not exposed via `.env`.
- **Nothing shows up in Kafka Manager.** Make sure `zookeeper` and `kafka` are both running before adding the cluster, and that you pointed the cluster form at `zookeeper:2181`, not `kafka:9092`.

---

Need a web UI for the cluster? See **[Kafka Manager](/docs/services/kafka-manager)**. New to Laradock? Start at **[Getting Started](/docs/getting-started)**.
