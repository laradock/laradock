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

## What is Beanstalkd?

[Beanstalkd](https://beanstalkd.github.io) is a simple, fast work-queue service, a lightweight alternative to Redis or Kafka when all you need is a job queue. Laravel supports it as a first-class queue driver.

## Start Beanstalkd

```bash
docker compose up -d beanstalkd
```

The container's `compose.yml` declares `depends_on: php-fpm`, so `docker compose up -d beanstalkd` also starts `php-fpm` if it isn't running yet.

## Stop Beanstalkd

```bash
docker compose stop beanstalkd
```

## Configuration

All settings live in `beanstalkd/defaults.env` and can be overridden by adding the same line to your own `.env`:

| Variable | Default | What it does |
|---|---|---|
| `BEANSTALKD_HOST_PORT` | `11300` | Host-side port Beanstalkd is published on (`host:container`), Beanstalkd's standard port. |

The container also runs `privileged: true` (set in `compose.yml`, not `.env`-configurable).

## Use Beanstalkd from Laravel

1. In `config/queue.php`, set `beanstalkd` as the default driver and `QUEUE_HOST=beanstalkd` (the container name). It listens on port `11300`.
2. Install the client:
   ```bash
   composer require pda/pheanstalk
   ```

## Manage jobs from a web console

Laradock also ships a `beanstalkd-console` container for browsing tubes and jobs visually:

```bash
docker compose up -d beanstalkd-console
```

Open [http://localhost:2080](http://localhost:2080) (change the port with `BEANSTALKD_CONSOLE_HOST_PORT`), then add a server with host `beanstalkd` and port `11300`.

## Connect from your host machine

Inside Laradock, other containers reach it by container name: `beanstalkd:11300`. From your own machine, connect to `localhost:11300` (or your custom `BEANSTALKD_HOST_PORT`).

## Common issues

- **Queue worker can't connect but the container is running.** Confirm `QUEUE_HOST=beanstalkd` (the container name) in your app's `.env`, not `localhost` or `127.0.0.1`, those only work from your host machine, not from inside another container.
- **Jobs pile up and never process.** Beanstalkd only stores jobs, something still has to run `php artisan queue:work`. Check the queue worker is actually running against the `beanstalkd` connection.
- **Port already in use on your host.** Another local Beanstalkd (or another Laradock project) is already bound to `11300`. Change `BEANSTALKD_HOST_PORT` in `.env` and restart: `docker compose up -d beanstalkd`.
- **Console shows no tubes/jobs.** Confirm the console's server entry uses host `beanstalkd` and port `11300` (the container-internal port), not the host-mapped `BEANSTALKD_HOST_PORT`.

---

New to Laradock? Start at **[Getting Started](/docs/getting-started)**.
