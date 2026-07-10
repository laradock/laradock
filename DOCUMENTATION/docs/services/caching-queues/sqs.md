---
slug: /services/sqs
title: SQS (local emulator)
description: Run a local AWS SQS-compatible queue in Laradock using alpine-sqs (ElasticMQ), so you can develop against SQS without a real AWS account.
keywords:
  - laradock sqs
  - sqs docker
  - elasticmq docker
  - local sqs emulator
  - aws sqs docker compose
  - laravel sqs queue
---

## What is this SQS service?

This container is **not** Amazon's real SQS, it's a local, API-compatible emulator so you can develop against SQS-shaped code without an AWS account or network access. Laradock builds it from [`roribio16/alpine-sqs`](https://github.com/roribio16/alpine-sqs), which bundles [ElasticMQ](https://github.com/softwaremill/elasticmq) (a Scala-based SQS-compatible server) with a small web management UI, run under `supervisord`.

## Start SQS

```bash
docker compose up -d sqs
```

## Stop SQS

```bash
docker compose stop sqs
```

This stops the container without deleting its data. To remove the container (data on disk is untouched, it lives under `DATA_PATH_HOST/sqs`): `docker compose rm -f sqs`.

## Configuration

All settings live in `sqs/defaults.env` and can be overridden by adding the same line to your own `.env`:

| Variable | Default | What it does |
|---|---|---|
| `SQS_NODE_HOST_PORT` | `9324` | Host-side port for the SQS-compatible API (`host:9324`). |
| `SQS_MANAGEMENT_HTTP_HOST_PORT` | `9325` | Host-side port for the web management UI (`host:9325`). |

`sqs/compose.yml` mounts `DATA_PATH_HOST/sqs` into the container at `/opt/custom`; that's where you can drop custom ElasticMQ config (queue definitions) if you need queues pre-created on boot. Check the [alpine-sqs README](https://github.com/roribio16/alpine-sqs) for the exact config format it expects there.

## Open the management UI

```bash
docker compose up -d sqs
```

Open [http://localhost:9325](http://localhost:9325) (or your custom `SQS_MANAGEMENT_HTTP_HOST_PORT`) to browse queues and messages.

## Connect from Laravel

Point Laravel's SQS queue driver at the container instead of AWS, using any placeholder key/secret (ElasticMQ doesn't validate them):

```env
QUEUE_CONNECTION=sqs
AWS_ACCESS_KEY_ID=local
AWS_SECRET_ACCESS_KEY=local
AWS_DEFAULT_REGION=elasticmq
SQS_PREFIX=http://sqs:9324/queue
SQS_QUEUE=default
```

Inside Laradock, other containers reach it by container name: `sqs:9324`. From your host machine, use `localhost:9324` (or your custom `SQS_NODE_HOST_PORT`).

## Common issues

- **Confusing this for real AWS SQS.** It's a local emulator (ElasticMQ under `alpine-sqs`); it has no relation to your actual AWS account, region, or billing, it's purely for local development.
- **Queue not found.** ElasticMQ needs queues to exist before you can send to them; either create the queue via the API/SDK first, or pre-define it in a config file mounted at `/opt/custom`.
- **Port already in use on your host.** Another local SQS emulator (or another Laradock project) is already bound to one of the default ports. Change `SQS_NODE_HOST_PORT` or `SQS_MANAGEMENT_HTTP_HOST_PORT` in `.env` and restart.
- **App can't connect but the container is running.** Confirm your app's SQS endpoint/prefix uses host `sqs` (the container name), not `localhost` or `127.0.0.1`, those only work from your host machine, not from inside another container.

---

Need a general-purpose queue instead? See **[RabbitMQ](/docs/services/rabbitmq)** or **[Beanstalkd](/docs/services/beanstalkd)**. New to Laradock? Start at **[Getting Started](/docs/getting-started)**.
