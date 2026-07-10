---
slug: /services/mosquitto
title: Mosquitto
description: Run the Eclipse Mosquitto MQTT broker in Laradock. Start and stop the container, configure the port, and connect with an MQTT client over WebSockets.
keywords:
  - laradock mosquitto
  - mosquitto docker
  - mqtt docker compose
  - mqtt broker docker
  - mqtt websockets
---

## What is Mosquitto?

[Eclipse Mosquitto](https://mosquitto.org) is a lightweight open-source message broker implementing the MQTT protocol, widely used for IoT and lightweight pub/sub messaging. Laradock runs it as its own container so you can develop against a real MQTT broker without installing one on your host.

## Start Mosquitto

```bash
docker compose up -d mosquitto
```

## Stop Mosquitto

```bash
docker compose stop mosquitto
```

This stops the container without deleting its data. To remove the container (data on disk is untouched, it lives under `DATA_PATH_HOST`): `docker compose rm -f mosquitto`.

## Configuration

`mosquitto/defaults.env` holds the port, overridable by adding the same line to your own `.env`:

| Variable | Default | What it does |
|---|---|---|
| `MOSQUITTO_PORT` | `9001` | Host-side port Mosquitto is published on (`host:9001`). |

The broker's listener itself is configured in `mosquitto/mosquitto.conf`, which is baked into the image at build time. It binds the default listener to port `9001` using the `websockets` protocol, not raw MQTT/TCP on `1883`. `allow_anonymous` isn't set in that file, so it falls back to Mosquitto's own compiled-in default.

## Publish and subscribe

Use an MQTT client that supports MQTT-over-WebSockets, for example [MQTT.js](https://github.com/mqttjs/MQTT.js):

```bash
mqtt sub -t 'test' -h localhost -p 9001 -C 'ws' -v
mqtt pub -t 'test' -h localhost -p 9001 -C 'ws' -m 'Hello!'
```

The `-C ws` flag matters: since the container's default listener speaks `websockets`, a plain TCP MQTT client pointed at port `9001` won't connect.

## Common issues

- **Client can't connect on port `9001`.** Confirm your client is configured for MQTT over WebSockets, not raw MQTT/TCP; the container's listener protocol is `websockets`, per `mosquitto/mosquitto.conf`.
- **Need raw MQTT/TCP (port `1883`) instead.** Add an extra `listener` block to `mosquitto/mosquitto.conf` and expose the matching port in `mosquitto/compose.yml`, then rebuild: `docker compose build mosquitto`.
- **Port already in use on your host.** Another local MQTT broker (or another Laradock project) is already bound to `9001`. Change `MOSQUITTO_PORT` in `.env` and restart: `docker compose up -d mosquitto`.
- **Config changes to `mosquitto.conf` don't take effect.** The file is copied into the image at build time, so a plain restart won't pick up edits: `docker compose build mosquitto && docker compose up -d mosquitto`.

---

Need a queue instead of pub/sub messaging? See **[Beanstalkd](/docs/services/beanstalkd)** or **[RabbitMQ](/docs/services/rabbitmq)**. New to Laradock? Start at **[Getting Started](/docs/getting-started)**.
