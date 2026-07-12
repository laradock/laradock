# Gearman

Source: https://laradock.io/docs/services/gearman

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

## What is Gearman?

[Gearman](http://gearman.org) is a job/task distribution system: applications submit units of work to a Gearman job server, which farms them out to registered workers. It's an older, language-agnostic alternative to Laravel's queue drivers, still common in polyglot or legacy PHP stacks. Laradock builds it from the `artefactual/gearmand` image.

## Start Gearman

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock start gearman
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose up -d gearman
```

</TabItem>
</Tabs>

The container `depends_on` `php-fpm` in `compose.yml`, so Compose starts `php-fpm` first automatically.

## Stop Gearman

Stopping just pauses the container:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock stop gearman
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose stop gearman
```

</TabItem>
</Tabs>

To remove the container entirely:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock remove gearman
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose rm -sf gearman
```

</TabItem>
</Tabs>

Gearman itself keeps no data on disk (no volume is mounted for it in `compose.yml`): with the default in-memory queue, removing or recreating the container simply drops whatever was still queued. If you've switched to the MySQL-backed queue (see below), the jobs live in MySQL instead and survive the Gearman container being removed.

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

## Change the Gearman version

Set the version in your `.env`:

```env
GEARMAN_VERSION=1.1.19.4
```

Then apply the change:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock rebuild gearman
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose build gearman
```

</TabItem>
</Tabs>

Since Gearman keeps no data of its own on disk, there's no data-format compatibility to worry about across versions, just rebuild and restart.

## Persist the queue in MySQL

By default Gearman keeps queued jobs in memory only (`GEARMAN_QUEUE_TYPE=builtin`), so they're lost on restart. To persist them, point Gearman at your **[MySQL](https://laradock.io/docs/services/mysql)** container:

```env
GEARMAN_QUEUE_TYPE=mysql
GEARMAN_MYSQL_HOST=mysql
GEARMAN_MYSQL_USER=default
GEARMAN_MYSQL_PASSWORD=secret
GEARMAN_MYSQL_DB=default
```

Then apply the change:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock start gearman
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose up -d gearman
```

</TabItem>
</Tabs>

Gearman doesn't create the target database or table for you, `GEARMAN_MYSQL_DB` (`default` above) must already exist and be reachable from the Gearman container before you switch `GEARMAN_QUEUE_TYPE` to `mysql`.

## Check queue status and connected workers

Gearman exposes a plain-text admin protocol on the same port as the job protocol (`GEARMAN_PORT`, `4730` by default). From your host machine, with `nc` (netcat) installed:

```bash
echo "status" | nc localhost 4730
```

This lists every registered function with its total jobs queued, jobs running, and connected worker count, one per line, terminated by a line containing only `.`. To see the connected workers themselves instead:

```bash
echo "workers" | nc localhost 4730
```

Useful when jobs seem stuck: an empty `workers` list, or a function in `status` with queued jobs but no workers, means nothing is registered to actually process that function name.

## Connect from your app

Inside Laradock, other containers reach Gearman by container name: host `gearman`, port `4730`. Use a Gearman PHP client library (such as the `gearman` PECL extension or a Composer package) to submit and process jobs.

## Talk to Gearman from another Laradock project

Each Laradock project is its own isolated Docker network by default, so a second project's containers can't reach this Gearman by container name out of the box. Easiest fix: publish the port (already done, `GEARMAN_PORT`) and have the other project's workers/clients connect to your **host machine's** address instead of `gearman`, for example `host.docker.internal` (Docker Desktop) on this project's `GEARMAN_PORT`. Make sure the two projects use different `GEARMAN_PORT` values if they're both running at once.

## Common issues

- **Jobs disappear after a restart.** The default `builtin` queue type is in-memory only; switch to `GEARMAN_QUEUE_TYPE=mysql` if you need jobs to survive a container restart.
- **`GEARMAN_QUEUE_TYPE=mysql` but jobs still aren't persisted.** Confirm the `GEARMAN_MYSQL_*` variables point at a reachable MySQL container and that the target database/table exist; Gearman doesn't create the database for you.
- **Jobs are queued but never processed.** Check `status` and `workers` on the admin port (see [Check queue status and connected workers](#check-queue-status-and-connected-workers) above): if no worker is registered for a function, nothing will ever pick its jobs up.
- **Port already in use on your host.** Another local Gearman (or another Laradock project) is already bound to `4730`. Change `GEARMAN_PORT` in `.env` and restart: `./laradock restart gearman`.
- **App can't connect but the container is running.** Confirm your app connects to host `gearman` (the container name), not `localhost` or `127.0.0.1`, those only work from your host machine, not from inside another container.

---

Need a Redis-backed alternative for Laravel queues? See **[Redis](https://laradock.io/docs/services/redis)**. New to Laradock? Start at **[Getting Started](https://laradock.io/docs/getting-started)**.
