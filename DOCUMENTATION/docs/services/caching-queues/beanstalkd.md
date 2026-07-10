---
slug: /services/beanstalkd
title: Beanstalkd
description: Run Beanstalkd in Laradock. Start and stop the container, configure the port, wire it up as a Laravel queue driver, and manage jobs from the web console.
keywords:
  - laradock beanstalkd
  - beanstalkd docker
  - beanstalkd docker compose
  - laravel queue beanstalkd
  - beanstalkd console docker
  - pheanstalk
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

## What is Beanstalkd?

[Beanstalkd](https://beanstalkd.github.io) is a simple, fast work-queue service, a lightweight alternative to Redis or Kafka when all you need is a job queue. Laravel supports it as a first-class queue driver.

## Start Beanstalkd

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock start beanstalkd
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose up -d beanstalkd
```

</TabItem>
</Tabs>

The container's `compose.yml` declares `depends_on: php-fpm`, so starting `beanstalkd` also starts `php-fpm` if it isn't running yet.

## Stop Beanstalkd

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock stop beanstalkd
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose stop beanstalkd
```

</TabItem>
</Tabs>

To delete the container entirely:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock remove beanstalkd
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose rm -sf beanstalkd
```

</TabItem>
</Tabs>

Unlike a database service, `beanstalkd`'s `compose.yml` mounts no data volume, so this isn't a "your data is safe" situation: any queued/reserved/buried jobs still sitting in the queue are gone as soon as the container is removed. See [Job data isn't persisted](#job-data-isnt-persisted) below.

## Configuration

All settings live in `beanstalkd/defaults.env` and can be overridden by adding the same line to your own `.env`:

| Variable | Default | What it does |
|---|---|---|
| `BEANSTALKD_HOST_PORT` | `11300` | Host-side port Beanstalkd is published on (`host:container`), Beanstalkd's standard port. |

The container also runs `privileged: true` (set in `compose.yml`, not `.env`-configurable).

## Job data isn't persisted

Laradock's `beanstalkd` image runs the daemon with no `-b` binlog flag and no volume mount, so it holds everything **in memory only**. This means:

- Restarting the container (`./laradock restart beanstalkd`) keeps jobs, the process inside the container isn't replaced.
- Removing the container (`./laradock remove beanstalkd`), rebuilding it, or restarting Docker itself **loses every queued, reserved, and buried job** with no way to recover them.

If you need jobs to survive a container recreation, don't rely on Beanstalkd for anything that isn't safe to lose. There's nothing to back up here, unlike a database.

## Use Beanstalkd from Laravel

1. In `config/queue.php`, set `beanstalkd` as the default driver and `QUEUE_HOST=beanstalkd` (the container name). It listens on port `11300`.
2. Install the client:
   ```bash
   composer require pda/pheanstalk
   ```

## Check queue stats from the CLI

Beanstalkd speaks a simple text protocol, so you can query global stats without any client library by talking to the published port directly from your host machine:

```bash
printf "stats\r\n" | nc localhost 11300
```

This returns a YAML block with counters like `current-jobs-ready`, `current-jobs-reserved`, `current-connections`, and `total-jobs`. Swap `stats` for `list-tubes` to see which tubes currently exist. For anything beyond a quick check, the web console below is easier to read.

## Manage jobs from a web console

Laradock also ships a `beanstalkd-console` container for browsing tubes and jobs visually:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock start beanstalkd-console
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose up -d beanstalkd-console
```

</TabItem>
</Tabs>

Open [http://localhost:2080](http://localhost:2080) (change the port with `BEANSTALKD_CONSOLE_HOST_PORT`), then add a server with host `beanstalkd` and port `11300`. Full setup, update, and troubleshooting details live on the **[Beanstalkd Console](/docs/services/beanstalkd-console)** page.

## Connect from your host machine

Inside Laradock, other containers reach it by container name: `beanstalkd:11300`. From your own machine, connect to `localhost:11300` (or your custom `BEANSTALKD_HOST_PORT`).

## Common issues

- **Queue worker can't connect but the container is running.** Confirm `QUEUE_HOST=beanstalkd` (the container name) in your app's `.env`, not `localhost` or `127.0.0.1`, those only work from your host machine, not from inside another container.
- **Jobs pile up and never process.** Beanstalkd only stores jobs, something still has to run `php artisan queue:work`. Check the queue worker is actually running against the `beanstalkd` connection.
- **Jobs vanished after a rebuild or `remove`.** Expected, see [Job data isn't persisted](#job-data-isnt-persisted). There's no volume to recover from.
- **Port already in use on your host.** Another local Beanstalkd (or another Laradock project) is already bound to `11300`. Change `BEANSTALKD_HOST_PORT` in `.env` and restart: `./laradock restart beanstalkd`.
- **Console shows no tubes/jobs.** Confirm the console's server entry uses host `beanstalkd` and port `11300` (the container-internal port), not the host-mapped `BEANSTALKD_HOST_PORT`.

---

New to Laradock? Start at **[Getting Started](/docs/getting-started)**.
