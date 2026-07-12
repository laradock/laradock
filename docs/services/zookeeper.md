# ZooKeeper

Source: https://laradock.io/docs/services/zookeeper

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

## What is ZooKeeper?

[Apache ZooKeeper](https://zookeeper.apache.org) is a centralized coordination service for distributed systems: configuration, naming, and synchronization. In Laradock it exists almost exclusively as a dependency for **[Kafka](https://laradock.io/docs/services/kafka)**, which uses it for broker coordination. You generally won't run ZooKeeper on its own.

## Start ZooKeeper

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock start zookeeper
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose up -d zookeeper
```

</TabItem>
</Tabs>

If you're using it for Kafka (the common case), start both together:

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

## Stop ZooKeeper

Stopping just pauses the container; **your data is safe**:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock stop zookeeper
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose stop zookeeper
```

</TabItem>
</Tabs>

To delete the container entirely (the data on disk is still untouched, it lives under `DATA_PATH_HOST`):

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock remove zookeeper
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose rm -sf zookeeper
```

</TabItem>
</Tabs>

## Configuration

`zookeeper/defaults.env` holds the port, overridable by adding the same line to your own `.env`:

| Variable | Default | What it does |
|---|---|---|
| `ZOOKEEPER_PORT` | `2181` | Host-side port ZooKeeper is published on (`host:2181`). |

Data is persisted under `DATA_PATH_HOST/zookeeper/data` (snapshots) and `DATA_PATH_HOST/zookeeper/datalog` (transaction logs), mounted as volumes in `zookeeper/compose.yml`.

## Browse the data with the ZooKeeper CLI

ZooKeeper's whole job is storing a tree of znodes, so day-to-day work usually means poking at that tree with `zkCli.sh`, bundled in the image and pre-connected to `localhost:2181`:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock enter zookeeper
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose exec zookeeper bash
```

</TabItem>
</Tabs>

Then, inside the container:

```bash
zkCli.sh
```

Once connected, list and inspect znodes (Kafka creates its own tree here once it's running):

```
ls /
get /brokers/ids
```

## Back up and restore data

ZooKeeper's state is just the snapshot and transaction-log files under `DATA_PATH_HOST/zookeeper`, so backing it up is a plain file copy, no dump tool involved. Stop the container first so you don't copy files mid-write:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock stop zookeeper
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose stop zookeeper
```

</TabItem>
</Tabs>

Then copy both data folders to a backup location:

```bash
cp -r "${DATA_PATH_HOST:-~/.laradock/data}/zookeeper" ~/zookeeper-backup
```

Start it again when you're done:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock start zookeeper
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose up -d zookeeper
```

</TabItem>
</Tabs>

To restore, stop ZooKeeper, replace `DATA_PATH_HOST/zookeeper` with your backed-up copy, then start it again the same way.

## Start completely fresh (wipe all data)

To throw away ZooKeeper's entire tree and start from a clean, empty state (⚠️ this **permanently deletes** all znodes, including Kafka's broker/topic metadata if Kafka uses this instance, back up first if you need anything):

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock stop zookeeper
./laradock remove zookeeper
rm -rf "${DATA_PATH_HOST:-~/.laradock/data}/zookeeper"
./laradock start zookeeper
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose stop zookeeper
docker compose rm -sf zookeeper
rm -rf "${DATA_PATH_HOST:-~/.laradock/data}/zookeeper"
docker compose up -d zookeeper
```

</TabItem>
</Tabs>

If you also use Kafka against this ZooKeeper, wipe Kafka's data at the same time (see the [Common issues](#common-issues) note below on why leaving one stale breaks the other).

## Use it with Kafka

Kafka's own `compose.yml` points at ZooKeeper by container name and internal port: `KAFKA_ZOOKEEPER_CONNECT: zookeeper:2181`. As long as both containers are on the `backend` network (the default), no further wiring is needed, just start both as shown above.

## Common issues

- **Kafka won't start / can't find its broker metadata.** Confirm `zookeeper` is actually running before or alongside `kafka`: `docker compose ps zookeeper`.
- **Port already in use on your host.** Another local ZooKeeper (or another Laradock project) is already bound to `2181`. Change `ZOOKEEPER_PORT` in `.env` and restart: `./laradock restart zookeeper`.
- **Stale cluster state after a Kafka rebuild.** ZooKeeper's data at `DATA_PATH_HOST/zookeeper` persists across restarts; if Kafka and ZooKeeper get out of sync (for example after wiping Kafka's data but not ZooKeeper's, or vice versa), clear both data directories and start fresh.
- **Two Laradock projects overwrite each other's data.** Running more than one Laradock on the same machine? Set both `COMPOSE_PROJECT_NAME` and `DATA_PATH_HOST` to unique values per project, otherwise they share the same ZooKeeper data on disk.

---

Using this for event streaming? See **[Apache Kafka](https://laradock.io/docs/services/kafka)**. New to Laradock? Start at **[Getting Started](https://laradock.io/docs/getting-started)**.
