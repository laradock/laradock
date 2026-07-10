---
slug: /services/gearman
title: Gearman
description: Run Gearman in Laradock. Start and stop the container, configure the port, persistent queue, threading, and MySQL-backed persistence.
keywords:
  - laradock gearman
  - gearman docker
  - gearman docker compose
  - gearman job server
  - gearman php
---

## What is Gearman?

[Gearman](http://gearman.org) is a job/task distribution system: applications submit units of work to a Gearman job server, which farms them out to registered workers. It's an older, language-agnostic alternative to Laravel's queue drivers, still common in polyglot or legacy PHP stacks. Laradock builds it from the `artefactual/gearmand` image.

## Start Gearman

```bash
docker compose up -d gearman
```

The container `depends_on` `php-fpm` in `compose.yml`, so Compose starts `php-fpm` first automatically.

## Stop Gearman

```bash
docker compose stop gearman
```

This stops the container. To remove it entirely: `docker compose rm -f gearman`.

## Configuration

All settings live in `gearman/defaults.env` and can be overridden by adding the same line to your own `.env`:

| Variable | Default | What it does |
|---|---|---|
| `GEARMAN_VERSION` | `latest` | Image tag from [artefactual/gearmand](https://hub.docker.com/r/artefactual/gearmand) on Docker Hub. |
| `GEARMAN_PORT` | `4730` | Host-side port Gearman is published on (`host:4730`). |
| `GEARMAN_VERBOSE` | `INFO` | Logging level. |
| `GEARMAN_QUEUE_TYPE` | `builtin` | Persistent queue backend: `builtin` (in-memory) or `mysql`. |
| `GEARMAN_THREADS` | `4` | Number of I/O threads. |
| `GEARMAN_BACKLOG` | `32` | Listen backlog size for incoming connections. |
| `GEARMAN_FILE_DESCRIPTORS` | *(empty)* | Max file descriptors for the process; empty uses the user's max. |
| `GEARMAN_JOB_RETRIES` | `0` | Attempts before the server drops a job; `0` means no limit. |
| `GEARMAN_ROUND_ROBIN` | `0` | Assign work round-robin across worker connections. |
| `GEARMAN_WORKER_WAKEUP` | `0` | Number of workers woken per received job. |
| `GEARMAN_KEEPALIVE` | `0` | Enable TCP keepalive on sockets. |
| `GEARMAN_KEEPALIVE_IDLE` | `30` | Seconds idle before sending keepalive probes. |
| `GEARMAN_KEEPALIVE_INTERVAL` | `10` | Seconds between keepalive retransmissions. |
| `GEARMAN_KEEPALIVE_COUNT` | `5` | Retransmissions before declaring the peer unreachable. |
| `GEARMAN_MYSQL_HOST` | `localhost` | MySQL host, used only when `GEARMAN_QUEUE_TYPE=mysql`. |
| `GEARMAN_MYSQL_PORT` | `3306` | MySQL port for persistent queue storage. |
| `GEARMAN_MYSQL_USER` | `root` | MySQL user for persistent queue storage. |
| `GEARMAN_MYSQL_PASSWORD` | *(empty)* | MySQL password for persistent queue storage. |
| `GEARMAN_MYSQL_PASSWORD_FILE` | *(empty)* | Path to a file holding the MySQL password (Docker secrets). |
| `GEARMAN_MYSQL_DB` | `Gearmand` | Database used for the MySQL-backed persistent queue. |
| `GEARMAN_MYSQL_TABLE` | `gearman_queue` | Table used for the MySQL-backed persistent queue. |

## Persist the queue in MySQL

By default Gearman keeps queued jobs in memory only (`GEARMAN_QUEUE_TYPE=builtin`), so they're lost on restart. To persist them, point Gearman at your **[MySQL](/docs/services/mysql)** container:

```env
GEARMAN_QUEUE_TYPE=mysql
GEARMAN_MYSQL_HOST=mysql
GEARMAN_MYSQL_USER=default
GEARMAN_MYSQL_PASSWORD=secret
GEARMAN_MYSQL_DB=default
```

```bash
docker compose up -d gearman
```

## Connect from your app

Inside Laradock, other containers reach Gearman by container name: host `gearman`, port `4730`. Use a Gearman PHP client library (such as the `gearman` PECL extension or a Composer package) to submit and process jobs.

## Common issues

- **Jobs disappear after a restart.** The default `builtin` queue type is in-memory only; switch to `GEARMAN_QUEUE_TYPE=mysql` if you need jobs to survive a container restart.
- **`GEARMAN_QUEUE_TYPE=mysql` but jobs still aren't persisted.** Confirm the `GEARMAN_MYSQL_*` variables point at a reachable MySQL container and that the target database/table exist; Gearman doesn't create the database for you.
- **Port already in use on your host.** Another local Gearman (or another Laradock project) is already bound to `4730`. Change `GEARMAN_PORT` in `.env` and restart: `docker compose up -d gearman`.
- **App can't connect but the container is running.** Confirm your app connects to host `gearman` (the container name), not `localhost` or `127.0.0.1`, those only work from your host machine, not from inside another container.

---

Need a Redis-backed alternative for Laravel queues? See **[Redis](/docs/services/redis)**. New to Laradock? Start at **[Getting Started](/docs/getting-started)**.
