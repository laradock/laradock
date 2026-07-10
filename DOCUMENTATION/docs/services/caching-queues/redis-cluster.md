---
slug: /services/redis-cluster
title: Redis Cluster
description: Run a Redis Cluster in Laradock. Start and stop the container, configure the cluster port range, connect with redis-cli in cluster mode, and wire it up as a Laravel Redis cluster connection.
keywords:
  - laradock redis cluster
  - redis cluster docker
  - redis cluster docker compose
  - laravel redis cluster
  - phpredis cluster
  - sharded redis
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

## What is Redis Cluster?

[Redis Cluster](https://redis.io/docs/management/scaling/) is Redis's built-in sharding and high-availability mode, spreading keys across multiple nodes instead of running a single instance. Laradock's `redis-cluster` service runs six cluster nodes (three masters, three replicas) inside a single container, for local development and testing against cluster-mode client code, not for production-grade multi-node redundancy.

## Start Redis Cluster

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock start redis-cluster
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose up -d redis-cluster
```

</TabItem>
</Tabs>

The container builds and bootstraps a fresh six-node cluster every time it starts (see [No persistent data](#no-persistent-data) below), so give it a few seconds after start before connecting.

## Stop Redis Cluster

Stopping just pauses the container; the cluster's in-memory state is preserved as long as the container itself isn't removed:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock stop redis-cluster
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose stop redis-cluster
```

</TabItem>
</Tabs>

To delete the container:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock remove redis-cluster
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose rm -sf redis-cluster
```

</TabItem>
</Tabs>

Unlike most other stateful Laradock services, **this permanently deletes all cluster data**, see the next section.

## No persistent data

`redis-cluster/compose.yml` mounts no volume for this service (unlike `redis`, which binds `DATA_PATH_HOST/redis`). Everything the cluster holds lives only in the container's own writable layer, so it survives a `stop`/`start` cycle but is gone for good after `remove`/`rm`. Treat this service as scratch space for exercising cluster-mode client code, not as a place to keep data you care about.

## Configuration

All settings live in `redis-cluster/defaults.env` and can be overridden by adding the same line to your own `.env`:

| Variable | Default | What it does |
|---|---|---|
| `REDIS_CLUSTER_PORT_RANGE` | `7000-7005` | Host-side port range published for the six cluster nodes (`host:container`), matches Redis Cluster's default bus/client port range. |

There's no `REDIS_CLUSTER_PASSWORD` variable: unlike the plain `redis` service, this container is started with no `--requirepass`, so it has no authentication by default.

## Connect with redis-cli

Cluster mode needs the `-c` flag so the client follows `MOVED`/`ASK` redirects between nodes, plus a `-p` pointing at any one of the six node ports:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock enter redis-cluster
redis-cli -c -p 7000
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose exec redis-cluster bash
redis-cli -c -p 7000
```

</TabItem>
</Tabs>

## Check cluster health

From inside the `redis-cli -c -p 7000` prompt above:

```
CLUSTER INFO
CLUSTER NODES
```

`CLUSTER INFO` should report `cluster_state:ok` and `cluster_known_nodes:6` once the container has finished bootstrapping. `CLUSTER NODES` lists each node's ID, address, role (`master`/`slave`), and the hash slot range it owns.

## Flush all keys

Cluster mode doesn't support a single `FLUSHALL` that reaches every node from one connection; run it against each master:

```
redis-cli -c -p 7000 flushall
redis-cli -c -p 7001 flushall
redis-cli -c -p 7002 flushall
```

Ports 7000-7002 are the three masters by default; check `CLUSTER NODES` if you need to confirm which ports currently hold that role on your machine.

## Use Redis Cluster from Laravel

Configure the cluster in `config/database.php` (example uses phpredis, see the [Laravel Redis docs](https://laravel.com/docs/redis#configuration)):

```php
'redis' => [
    'client' => 'phpredis',
    'options' => [
        'cluster' => 'redis',
    ],
    'clusters' => [
        'default' => [
            [
                'host' => 'redis-cluster',
                'password' => null,
                'port' => 7000,
                'database' => 0,
            ],
        ],
    ],
],
```

## Common issues

- **Port conflicts with the plain `redis` service.** Both services default to Redis's standard ports; if you run both at once, make sure `REDIS_CLUSTER_PORT_RANGE` doesn't overlap with `REDIS_PORT`.
- **`CLUSTER INFO` shows `cluster_state:fail` right after start.** The container needs a moment to assign hash slots across all six nodes on boot. Run `./laradock logs redis-cluster` and retry once it settles.
- **App can't connect but the container is running.** Confirm your app's config uses `redis-cluster` (the container name) as the host, not `localhost` or `127.0.0.1`, those only work from your host machine, not from inside another container.
- **Client library errors on cluster commands.** Not every Redis client supports cluster mode; phpredis (used above) and Predis (with cluster config) both do, but make sure you're not accidentally pointing a plain single-node client at it.
- **Data vanished after restarting Laradock.** Expected, see [No persistent data](#no-persistent-data): this service has no data volume, so removing the container (`./laradock remove redis-cluster`, or any full `docker compose down`) wipes it.

---

Just need a single Redis instance? See **[Redis](/docs/services/redis)**. New to Laradock? Start at **[Getting Started](/docs/getting-started)**.
