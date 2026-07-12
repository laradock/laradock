# Mosquitto

Source: https://laradock.io/docs/services/mosquitto

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

## What is Mosquitto?

[Eclipse Mosquitto](https://mosquitto.org) is a lightweight open-source message broker implementing the MQTT protocol, widely used for IoT and lightweight pub/sub messaging. Laradock runs it as its own container so you can develop against a real MQTT broker without installing one on your host.

## Start Mosquitto

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock start mosquitto
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose up -d mosquitto
```

</TabItem>
</Tabs>

Retained messages and subscriptions are persisted to disk under `DATA_PATH_HOST/mosquitto/data` and survive restarts. Name any other services alongside it to start them together, for example `./laradock start mosquitto workspace`.

## Stop Mosquitto

Stopping just pauses the container; **your persisted data is safe**:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock stop mosquitto
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose stop mosquitto
```

</TabItem>
</Tabs>

To delete the container entirely (the data on disk is still untouched, it lives under `DATA_PATH_HOST`):

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock remove mosquitto
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose rm -sf mosquitto
```

</TabItem>
</Tabs>

## Configuration

`mosquitto/defaults.env` holds the port, overridable by adding the same line to your own `.env`:

| Variable | Default | What it does |
|---|---|---|
| `MOSQUITTO_PORT` | `9001` | Host-side port Mosquitto is published on (`host:9001`). |

The broker's listener itself is configured in `mosquitto/mosquitto.conf`, which is baked into the image at build time. It binds the default listener to port `9001` using the `websockets` protocol, not raw MQTT/TCP on `1883`. `allow_anonymous` isn't set in that file, so it falls back to Mosquitto's own compiled-in default.

## Apply a config change

`mosquitto.conf` is copied into the image by `mosquitto/Dockerfile` at build time, so editing it locally has no effect until you rebuild and recreate the container:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock rebuild mosquitto
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose build mosquitto
```

</TabItem>
</Tabs>

Then recreate the container on the new image:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock start mosquitto
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose up -d mosquitto
```

</TabItem>
</Tabs>

## Publish and subscribe

Use an MQTT client that supports MQTT-over-WebSockets, for example [MQTT.js](https://github.com/mqttjs/MQTT.js):

```bash
mqtt sub -t 'test' -h localhost -p 9001 -C 'ws' -v
mqtt pub -t 'test' -h localhost -p 9001 -C 'ws' -m 'Hello!'
```

The `-C ws` flag matters: since the container's default listener speaks `websockets`, a plain TCP MQTT client pointed at port `9001` won't connect.

## Check broker stats

Mosquitto publishes live broker stats (connected clients, message counts, uptime) to the `$SYS` topic tree. Subscribe to it with any WebSocket-capable client:

```bash
mqtt sub -t '$SYS/#' -h localhost -p 9001 -C 'ws' -v
```

## Require authentication

By default the broker accepts anonymous connections. To require a username/password:

1. Create the password file inside the running container with Mosquitto's own tool:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock enter mosquitto
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose exec mosquitto sh
```

</TabItem>
</Tabs>

```bash
mosquitto_passwd -c /mosquitto/config/passwd your_username
```

2. Copy the generated file out to the `mosquitto/` folder on your host so it survives future rebuilds, then commit it alongside `mosquitto.conf`:

```bash
docker compose cp mosquitto:/mosquitto/config/passwd ./mosquitto/passwd
```

3. Add a `COPY passwd /mosquitto/config/` line to `mosquitto/Dockerfile` (right after the existing `COPY mosquitto.conf` line), and add these two lines to `mosquitto/mosquitto.conf`:

```conf
allow_anonymous false
password_file /mosquitto/config/passwd
```

4. [Apply the config change](#apply-a-config-change) to rebuild and recreate the container. Clients now need `-u your_username -P yourpassword` to connect.

## View broker logs

Mosquitto's own log file (`log_dest file /mosquitto/log/mosquitto.log` in `mosquitto.conf`) isn't on a mounted volume, only `/mosquitto/data` is, so it's lost whenever the container is removed. To read it while the container is still running:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock enter mosquitto
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose exec mosquitto sh
```

</TabItem>
</Tabs>

```bash
cat /mosquitto/log/mosquitto.log
```

## Backup and restore

The broker persists retained messages and subscriptions to a single database file (`mosquitto.db` by default) under `DATA_PATH_HOST/mosquitto/data`. Stop the broker first so the file isn't being written to mid-copy:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock stop mosquitto
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose stop mosquitto
```

</TabItem>
</Tabs>

```bash
cp -r "${DATA_PATH_HOST:-~/.laradock/data}/mosquitto/data" ./mosquitto-backup
```

Restore by stopping the broker, replacing the data folder with your backup, then starting it again:

```bash
rm -rf "${DATA_PATH_HOST:-~/.laradock/data}/mosquitto/data"
cp -r ./mosquitto-backup "${DATA_PATH_HOST:-~/.laradock/data}/mosquitto/data"
```

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock start mosquitto
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose up -d mosquitto
```

</TabItem>
</Tabs>

## Start completely fresh (wipe all data)

To throw away every retained message and subscription and start Mosquitto from a clean, empty state (⚠️ this **permanently deletes** the persisted database, back up first if you need anything):

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock stop mosquitto
./laradock remove mosquitto
rm -rf "${DATA_PATH_HOST:-~/.laradock/data}/mosquitto"
./laradock start mosquitto
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose stop mosquitto
docker compose rm -sf mosquitto
rm -rf "${DATA_PATH_HOST:-~/.laradock/data}/mosquitto"
docker compose up -d mosquitto
```

</TabItem>
</Tabs>

## Talk to this broker from another Laradock project

Each Laradock project is its own isolated Docker network by default, so a second project's containers can't reach this Mosquitto by container name out of the box. Easiest fix: publish the port (already done, `MOSQUITTO_PORT`) and have the other project's client connect to your **host machine's** address instead of `mosquitto`, for example `host.docker.internal` (Docker Desktop) on this project's `MOSQUITTO_PORT`, still over WebSockets (`-C ws`). Make sure the two projects use different `MOSQUITTO_PORT` values if they're both running at once.

## Common issues

- **Client can't connect on port `9001`.** Confirm your client is configured for MQTT over WebSockets, not raw MQTT/TCP; the container's listener protocol is `websockets`, per `mosquitto/mosquitto.conf`.
- **Need raw MQTT/TCP (port `1883`) instead.** Add an extra `listener` block to `mosquitto/mosquitto.conf` and expose the matching port in `mosquitto/compose.yml`, then [apply the config change](#apply-a-config-change).
- **Port already in use on your host.** Another local MQTT broker (or another Laradock project) is already bound to `9001`. Change `MOSQUITTO_PORT` in `.env` and restart: `./laradock restart mosquitto`.
- **Config changes to `mosquitto.conf` don't take effect.** The file is copied into the image at build time, so a plain restart won't pick up edits, you need to [apply the config change](#apply-a-config-change) (rebuild, then recreate the container).
- **Logs look empty from `./laradock logs mosquitto`.** Mosquitto writes its own log to a file inside the container, not to stdout, so container logs stay mostly quiet. See [View broker logs](#view-broker-logs) instead.

---

Need a queue instead of pub/sub messaging? See **[Beanstalkd](https://laradock.io/docs/services/beanstalkd)** or **[RabbitMQ](https://laradock.io/docs/services/rabbitmq)**. New to Laradock? Start at **[Getting Started](https://laradock.io/docs/getting-started)**.
