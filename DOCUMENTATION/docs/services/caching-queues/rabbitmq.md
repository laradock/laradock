---
slug: /services/rabbitmq
title: RabbitMQ
description: Run RabbitMQ in Laradock. Start and stop the container, configure ports and credentials, and reach the management UI and Web STOMP.
keywords:
  - laradock rabbitmq
  - rabbitmq docker
  - rabbitmq docker compose
  - rabbitmq management ui
  - rabbitmq laravel queue
---

## What is RabbitMQ?

[RabbitMQ](https://www.rabbitmq.com) is a mature, widely-used message broker implementing AMQP, commonly used as a Laravel queue backend or for service-to-service messaging. Laradock builds it with the management plugin enabled, so you get the web dashboard out of the box.

## Start RabbitMQ

```bash
docker compose up -d rabbitmq
```

The container `depends_on` `php-fpm` in `compose.yml`, so Compose starts `php-fpm` first automatically.

## Stop RabbitMQ

```bash
docker compose stop rabbitmq
```

This stops the container without deleting its data. To remove the container (data on disk is untouched, it lives under `DATA_PATH_HOST/rabbitmq`): `docker compose rm -f rabbitmq`.

## Configuration

All settings live in `rabbitmq/defaults.env` and can be overridden by adding the same line to your own `.env`:

| Variable | Default | What it does |
|---|---|---|
| `RABBITMQ_NODE_HOST_PORT` | `5672` | Host-side port for the AMQP protocol (`host:5672`). |
| `RABBITMQ_MANAGEMENT_HTTP_HOST_PORT` | `15672` | Host-side port for the management web UI over HTTP. |
| `RABBITMQ_MANAGEMENT_HTTPS_HOST_PORT` | `15671` | Host-side port for the management web UI over HTTPS. |
| `RABBITMQ_WEB_STOMP_HOST_PORT` | `15674` | Host-side port for Web STOMP (STOMP-over-WebSockets). |

Default login credentials are set in `rabbitmq/rabbitmq.conf`: `default_user = guest`, `default_pass = guest`. Edit that file and rebuild to change them.

## Open the management UI

```bash
docker compose up -d rabbitmq
```

Open [http://localhost:15672](http://localhost:15672) (or your custom `RABBITMQ_MANAGEMENT_HTTP_HOST_PORT`) and log in with `guest` / `guest`. The `rabbitmq_management` plugin is enabled at build time in `rabbitmq/Dockerfile`, so the dashboard is available without any extra setup.

## Connect from Laravel

Inside Laradock, other containers reach RabbitMQ by container name: use host `rabbitmq`, port `5672`, with the credentials from `rabbitmq.conf`. Install a client such as `vladimir-yuldashev/laravel-queue-rabbitmq` in your app to wire it up as a queue driver.

## Common issues

- **Can't log in to the management UI.** Credentials come from `rabbitmq/rabbitmq.conf` (`guest`/`guest` by default), not from `.env`. If you changed that file, rebuild: `docker compose build rabbitmq`.
- **Port already in use on your host.** Another local RabbitMQ (or another Laradock project) is bound to one of the default ports. Change the relevant `RABBITMQ_*_HOST_PORT` variable in `.env` and restart.
- **App can't connect but the container is running.** Confirm the app's config uses host `rabbitmq` (the container name), not `localhost` or `127.0.0.1`, those only work from your host machine, not from inside another container.
- **Two Laradock projects overwrite each other's data.** Running more than one Laradock on the same machine? Set both `COMPOSE_PROJECT_NAME` and `DATA_PATH_HOST` to unique values per project, otherwise they share the same RabbitMQ data on disk.

---

Need something lighter for pub/sub? See **[Mosquitto](/docs/services/mosquitto)** or **[NATS](/docs/services/nats)**. New to Laradock? Start at **[Getting Started](/docs/getting-started)**.
