# Kafka Manager

Source: https://laradock.io/docs/services/kafka-manager

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

## What is Kafka Manager?

Kafka Manager is a web-based tool for managing and monitoring Apache Kafka clusters: view brokers, topics, partitions, and consumer group offsets from a browser instead of the Kafka CLI tools.

## Start Kafka Manager

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock start zookeeper kafka kafka-manager
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose up -d zookeeper kafka kafka-manager
```

</TabItem>
</Tabs>

Kafka Manager talks to ZooKeeper to discover the cluster, so both `zookeeper` and `kafka` need to be running for it to be useful.

## Stop Kafka Manager

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock stop kafka-manager
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose stop kafka-manager
```

</TabItem>
</Tabs>

To delete the container entirely:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock remove kafka-manager
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose rm -sf kafka-manager
```

</TabItem>
</Tabs>

## Configuration

`kafka-manager/defaults.env` doesn't exist, the container has no configurable `.env` variables. Its settings are fixed directly in `kafka-manager/compose.yml`:

| Setting | Value | What it does |
|---|---|---|
| Host port | `9020` | Fixed mapping to the container's port `9000` (not overridable via `.env`). |
| `ZK_HOSTS` | `zookeeper:2181` | ZooKeeper connection string the manager uses to discover the cluster. |

## Add your cluster

1. Open [http://localhost:9020](http://localhost:9020).
2. Add a cluster pointing at the ZooKeeper host `zookeeper:2181`.

There's no login screen, no built-in authentication, anyone who can reach port `9020` can add/remove clusters and browse topic data. Fine for local development, but don't expose this port beyond your own machine.

## Where cluster config is stored

Kafka Manager itself is stateless, it has no data volume of its own (check `kafka-manager/compose.yml`, there's no `volumes:` entry). Every cluster you add through the UI is actually persisted inside **ZooKeeper**, under its own znode, not inside the Kafka Manager container. That means:

- Removing/recreating the `kafka-manager` container is safe, your added clusters survive.
- Wiping ZooKeeper's data (`${DATA_PATH_HOST}/zookeeper`) removes the cluster list too, you'll need to re-add it via the UI afterward.

## Common issues

- **Port `9020` already in use on your host.** Since it's hardcoded in `compose.yml` (not an `.env` variable), you'll need to edit `kafka-manager/compose.yml` directly to change it, or stop whatever else is bound to that port.
- **"No clusters" or connection errors when adding a cluster.** Confirm `zookeeper` is actually running (`./laradock logs zookeeper`) before adding the cluster, and that you used `zookeeper:2181`, not `kafka:9092`, as the connection string.
- **Topics/brokers don't show up.** Confirm `kafka` itself is up and has successfully registered with ZooKeeper; check `./laradock logs kafka` for startup errors.
- **Cluster disappeared after a rebuild.** You likely wiped ZooKeeper's data folder rather than Kafka Manager's, see [Where cluster config is stored](#where-cluster-config-is-stored) above; re-add the cluster once ZooKeeper is back up.

---

Need the Kafka broker itself? See **[Apache Kafka](https://laradock.io/docs/services/kafka)**. New to Laradock? Start at **[Getting Started](https://laradock.io/docs/getting-started)**.
