---
slug: /services/redis-cluster
title: Redis Cluster
description: Run a Redis Cluster in Laradock. Start and stop the container, configure the cluster port range, and wire it up as a Laravel Redis cluster connection.
keywords:
  - laradock redis cluster
  - redis cluster docker
  - redis cluster docker compose
  - laravel redis cluster
  - phpredis cluster
  - sharded redis
---

## What is Redis Cluster?

[Redis Cluster](https://redis.io/docs/management/scaling/) is Redis's built-in sharding and high-availability mode, spreading keys across multiple nodes instead of running a single instance. Laradock's `redis-cluster` service runs it in a single container for local development and testing against cluster-mode client code, not for production-grade multi-node redundancy.

## Start Redis Cluster

```bash
docker compose up -d redis-cluster
```

## Stop Redis Cluster

```bash
docker compose stop redis-cluster
```

This stops the container without deleting its data. To remove the container: `docker compose rm -f redis-cluster`.

## Configuration

All settings live in `redis-cluster/defaults.env` and can be overridden by adding the same line to your own `.env`:

| Variable | Default | What it does |
|---|---|---|
| `REDIS_CLUSTER_PORT_RANGE` | `7000-7005` | Host-side port range published for cluster nodes (`host:container`), matches Redis Cluster's default bus/client port range. |

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
- **App can't connect but the container is running.** Confirm your app's config uses `redis-cluster` (the container name) as the host, not `localhost` or `127.0.0.1`, those only work from your host machine, not from inside another container.
- **Client library errors on cluster commands.** Not every Redis client supports cluster mode; phpredis (used above) and Predis (with cluster config) both do, but make sure you're not accidentally pointing a plain single-node client at it.

---

Just need a single Redis instance? See **[Redis](/docs/services/redis)**. New to Laradock? Start at **[Getting Started](/docs/getting-started)**.
