---
slug: /services/rabbitmq
title: RabbitMQ
description: Run RabbitMQ in Laradock. Start and stop the container, configure ports and credentials, back up and restore definitions, inspect queues, and reach the management UI and Web STOMP.
keywords:
  - laradock rabbitmq
  - rabbitmq docker
  - rabbitmq docker compose
  - rabbitmq management ui
  - rabbitmq laravel queue
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

## What is RabbitMQ?

[RabbitMQ](https://www.rabbitmq.com) is a mature, widely-used message broker implementing AMQP, commonly used as a Laravel queue backend or for service-to-service messaging. Laradock builds it with the management plugin enabled, so you get the web dashboard out of the box.

## Start RabbitMQ

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock start rabbitmq
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose up -d rabbitmq
```

</TabItem>
</Tabs>

The container `depends_on` `php-fpm` in `compose.yml`, so Compose starts `php-fpm` first automatically. Your data (queues, exchanges, users) is created on first start and kept between restarts.

## Stop RabbitMQ

Stopping just pauses the container; **your data is safe**:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock stop rabbitmq
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose stop rabbitmq
```

</TabItem>
</Tabs>

To delete the container entirely (the data on disk is still untouched, it lives under `DATA_PATH_HOST/rabbitmq`):

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock remove rabbitmq
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose rm -sf rabbitmq
```

</TabItem>
</Tabs>

## Configuration

All settings live in `rabbitmq/defaults.env` and can be overridden by adding the same line to your own `.env`:

| Variable | Default | What it does |
|---|---|---|
| `RABBITMQ_NODE_HOST_PORT` | `5672` | Host-side port for the AMQP protocol (`host:5672`). |
| `RABBITMQ_MANAGEMENT_HTTP_HOST_PORT` | `15672` | Host-side port for the management web UI over HTTP. |
| `RABBITMQ_MANAGEMENT_HTTPS_HOST_PORT` | `15671` | Host-side port for the management web UI over HTTPS. |
| `RABBITMQ_WEB_STOMP_HOST_PORT` | `15674` | Host-side port for Web STOMP (STOMP-over-WebSockets). |

Default login credentials are set in `rabbitmq/rabbitmq.conf`: `default_user = guest`, `default_pass = guest`.

## Open the management UI

Once the container is running, open [http://localhost:15672](http://localhost:15672) (or your custom `RABBITMQ_MANAGEMENT_HTTP_HOST_PORT`) and log in with `guest` / `guest`. The `rabbitmq_management` plugin is enabled at build time in `rabbitmq/Dockerfile`, so the dashboard is available without any extra setup.

## Connect from Laravel

Inside Laradock, other containers reach RabbitMQ by container name: use host `rabbitmq`, port `5672`, with the credentials from `rabbitmq.conf`. Install a client such as `vladimir-yuldashev/laravel-queue-rabbitmq` in your app to wire it up as a queue driver.

## Change the default credentials

Edit `rabbitmq/rabbitmq.conf`:

```conf
default_user = your_user
default_pass = your_password
```

That file is bind-mounted into the container (not baked into the image), so a restart is enough, no rebuild needed:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock restart rabbitmq
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose restart rabbitmq
```

</TabItem>
</Tabs>

This only changes the credentials used for **new** installs (an empty `DATA_PATH_HOST/rabbitmq`). If the broker already has users provisioned from a previous boot, manage them from the management UI instead (`Admin` tab), or with `rabbitmqctl add_user`/`rabbitmqctl delete_user` after `./laradock enter rabbitmq`.

## Inspect queues

Open a terminal inside the container and use `rabbitmqctl`:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock enter rabbitmq
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose exec rabbitmq bash
```

</TabItem>
</Tabs>

Then, inside the container:

```bash
rabbitmqctl list_queues name messages consumers
```

This lists every queue with its current depth (messages waiting) and consumer count, useful for spotting a stuck or backed-up queue without opening the management UI. The same UI shows this under **Queues and Streams**.

## Backup and restore

RabbitMQ's own backup mechanism exports **definitions** (queues, exchanges, bindings, users, vhosts, policies), not the messages currently sitting in queues, since queues are meant to drain, not archive:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock exec -T rabbitmq rabbitmqctl export_definitions - > definitions.json
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose exec -T rabbitmq rabbitmqctl export_definitions - > definitions.json
```

</TabItem>
</Tabs>

The `-` path tells `rabbitmqctl` to write to stdout instead of a file inside the container; the `-T` disables the container's pseudo-terminal so the JSON isn't corrupted when redirected to a file, always include it when piping output to or from a file.

**Restore (import) definitions** from that file:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock exec -T rabbitmq rabbitmqctl import_definitions - < definitions.json
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose exec -T rabbitmq rabbitmqctl import_definitions - < definitions.json
```

</TabItem>
</Tabs>

If you need the in-flight messages themselves preserved (not just topology), stop the broker and copy the whole data folder instead, see [Start completely fresh](#start-completely-fresh-wipe-all-data) for where it lives.

## Start completely fresh (wipe all data)

To throw away everything and start RabbitMQ from a clean, empty state (⚠️ this **permanently deletes** every queue, exchange, and user in this container, export your definitions first if you need them):

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock stop rabbitmq
./laradock remove rabbitmq
rm -rf "${DATA_PATH_HOST:-~/.laradock/data}/rabbitmq"
./laradock start rabbitmq
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose stop rabbitmq
docker compose rm -sf rabbitmq
rm -rf "${DATA_PATH_HOST:-~/.laradock/data}/rabbitmq"
docker compose up -d rabbitmq
```

</TabItem>
</Tabs>

`DATA_PATH_HOST` is whatever you have set in `.env` (`~/.laradock/data` by default), so the folder above (mounted to `/var/lib/rabbitmq` in the container) is where RabbitMQ's node data actually lives on your machine. Deleting it and starting again re-creates the default `guest`/`guest` user and an empty broker, exactly like a brand-new install.

## Talk to this broker from another Laradock project

Each Laradock project is its own isolated Docker network by default, so a second project's containers can't reach this RabbitMQ by container name out of the box. Easiest fix: publish the port (already done, `RABBITMQ_NODE_HOST_PORT`) and have the other project connect to your **host machine's** address instead of `rabbitmq`, for example `host.docker.internal` (Docker Desktop) on this project's `RABBITMQ_NODE_HOST_PORT`. Make sure the two projects use different `RABBITMQ_*_HOST_PORT` values if they're both running at once.

## Common issues

- **Can't log in to the management UI.** Credentials come from `rabbitmq/rabbitmq.conf` (`guest`/`guest` by default), not from `.env`. If you changed that file, restart: `./laradock restart rabbitmq`.
- **Port already in use on your host.** Another local RabbitMQ (or another Laradock project) is bound to one of the default ports. Change the relevant `RABBITMQ_*_HOST_PORT` variable in `.env` and restart.
- **App can't connect but the container is running.** Confirm the app's config uses host `rabbitmq` (the container name), not `localhost` or `127.0.0.1`, those only work from your host machine, not from inside another container.
- **Queue keeps growing / nothing is consuming it.** Check `rabbitmqctl list_queues name messages consumers` (see [Inspect queues](#inspect-queues)) — a consumer count of `0` means no worker is listening on that queue.
- **Two Laradock projects overwrite each other's data.** Running more than one Laradock on the same machine? Set both `COMPOSE_PROJECT_NAME` and `DATA_PATH_HOST` to unique values per project, otherwise they share the same RabbitMQ data on disk.

---

Need something lighter for pub/sub? See **[Mosquitto](/docs/services/mosquitto)** or **[NATS](/docs/services/nats)**. New to Laradock? Start at **[Getting Started](/docs/getting-started)**.
