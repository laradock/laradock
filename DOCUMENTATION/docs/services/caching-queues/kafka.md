---
slug: /services/kafka
title: Apache Kafka
description: Run Apache Kafka in Laradock. Start it alongside ZooKeeper, configure broker settings, manage topics, and control the cluster from a web UI.
keywords:
  - laradock kafka
  - kafka docker
  - kafka docker compose
  - kafka zookeeper docker
  - kafka broker port
  - kafka manager docker
  - kafka topics docker
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

## What is Apache Kafka?

[Apache Kafka](https://kafka.apache.org) is a distributed event-streaming platform for high-throughput publish/subscribe messaging, used for event pipelines, log aggregation, and decoupling services. Laradock's Kafka needs the `zookeeper` container running alongside it to manage broker coordination, that pairing is intrinsic to how Kafka works, not an arbitrary example.

## Start Kafka

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock start zookeeper kafka
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose up -d zookeeper kafka
```

</TabItem>
</Tabs>

ZooKeeper must be up before Kafka can register itself, always start (or restart) both together.

## Stop Kafka

Stopping just pauses the container; **your data is safe**:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock stop kafka
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose stop kafka
```

</TabItem>
</Tabs>

To also stop ZooKeeper:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock stop kafka zookeeper
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose stop kafka zookeeper
```

</TabItem>
</Tabs>

To delete the containers entirely (the data on disk is still untouched):

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock remove kafka zookeeper
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose rm -sf kafka zookeeper
```

</TabItem>
</Tabs>

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

ZooKeeper itself is configured through `zookeeper/defaults.env`:

| Variable | Default | What it does |
|---|---|---|
| `ZOOKEEPER_PORT` | `2181` | Host-side port ZooKeeper is published on. |

Its own state lives under `DATA_PATH_HOST/zookeeper/data` and `DATA_PATH_HOST/zookeeper/datalog`.

Editing anything in `kafka/compose.yml` or `zookeeper/defaults.env` requires a rebuild to take effect:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock rebuild kafka zookeeper
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose build kafka zookeeper
```

</TabItem>
</Tabs>

## Manage Kafka from a web UI

Start Kafka Manager alongside it:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock start kafka-manager
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose up -d kafka-manager
```

</TabItem>
</Tabs>

Open [http://localhost:9020](http://localhost:9020) and add a cluster pointing at the ZooKeeper host `zookeeper:2181`. See **[Kafka Manager](/docs/services/kafka-manager)** for details.

## Working with topics

The image ships Kafka's own CLI scripts inside the container under `/opt/kafka/bin`. Open a terminal in the container first:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock enter kafka
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose exec kafka bash
```

</TabItem>
</Tabs>

Then, from inside the container:

**List existing topics:**

```bash
kafka-topics.sh --list --zookeeper zookeeper:2181
```

**Create a topic:**

```bash
kafka-topics.sh --create --zookeeper zookeeper:2181 --replication-factor 1 --partitions 1 --topic my-topic
```

**Describe a topic** (partitions, replicas, leader):

```bash
kafka-topics.sh --describe --zookeeper zookeeper:2181 --topic my-topic
```

## Produce and consume messages from the CLI

Handy for a quick sanity check without wiring up a real client. Run these from inside the container (`./laradock enter kafka`):

**Produce** (type messages, one per line, `Ctrl+C` to stop):

```bash
kafka-console-producer.sh --broker-list localhost:9092 --topic my-topic
```

**Consume** (in a second terminal, also inside the container, prints new messages as they arrive):

```bash
kafka-console-consumer.sh --bootstrap-server localhost:9092 --topic my-topic
```

Add `--from-beginning` to the consumer command to replay everything already on the topic instead of only new messages.

## Connect from your host machine

Inside Laradock, other containers reach the broker at `kafka:9092`. From your own machine, it's published on `localhost:9092`. Note `KAFKA_ADVERTISED_HOST_NAME`/`KAFKA_ADVERTISED_LISTENERS` are hardcoded to `127.0.0.1` in `compose.yml`, if you need clients on other machines on your network to connect, you'll need to edit those values directly.

## Start completely fresh (wipe all data)

To throw away every topic and offset and start Kafka from a clean, empty state (⚠️ this **permanently deletes** all topics and their data, there is no built-in export/import for this, so only do it if you don't need the data):

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock stop kafka zookeeper
./laradock remove kafka zookeeper
rm -rf "${DATA_PATH_HOST:-~/.laradock/data}/kafka" "${DATA_PATH_HOST:-~/.laradock/data}/zookeeper"
./laradock start zookeeper kafka
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose stop kafka zookeeper
docker compose rm -sf kafka zookeeper
rm -rf "${DATA_PATH_HOST:-~/.laradock/data}/kafka" "${DATA_PATH_HOST:-~/.laradock/data}/zookeeper"
docker compose up -d zookeeper kafka
```

</TabItem>
</Tabs>

`DATA_PATH_HOST` is whatever you have set in `.env` (`~/.laradock/data` by default). Wipe both `kafka` and `zookeeper`'s folders together, a Kafka broker with no matching ZooKeeper state (or vice versa) won't come back up cleanly.

## Common issues

- **Kafka won't start.** It depends on ZooKeeper being up first; always start both together with `./laradock start zookeeper kafka`.
- **Client can't produce/consume even though the container is running.** Confirm your client is using `kafka:9092` from inside another container, or `localhost:9092` from your host, not a mix of the two.
- **Message rejected as too large.** Check `KAFKA_MESSAGE_MAX_BYTES` (fixed at `2000000` in `compose.yml`); anything bigger needs the compose file edited directly since it's not exposed via `.env`.
- **Nothing shows up in Kafka Manager.** Make sure `zookeeper` and `kafka` are both running before adding the cluster, and that you pointed the cluster form at `zookeeper:2181`, not `kafka:9092`.
- **Topic commands hang or time out.** They talk to ZooKeeper directly (`--zookeeper zookeeper:2181`), confirm the `zookeeper` container is up with `./laradock logs zookeeper`.

---

Need a web UI for the cluster? See **[Kafka Manager](/docs/services/kafka-manager)**. New to Laradock? Start at **[Getting Started](/docs/getting-started)**.
