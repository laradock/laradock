---
slug: /services/beanstalkd-console
title: Beanstalkd Console
description: Run the Beanstalkd Console web UI in Laradock to inspect tubes, jobs, and workers on your Beanstalkd server.
keywords:
  - laradock beanstalkd console
  - beanstalkd web ui
  - beanstalkd docker
  - inspect beanstalkd tubes
  - beanstalk_console docker
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

## What is Beanstalkd Console?

[Beanstalk Console](https://github.com/ptrofimov/beanstalk_console) is a small PHP web UI for inspecting a running Beanstalkd server: tubes, queued/reserved/buried jobs, and worker connections. Laradock builds it from source and serves it with PHP's built-in server. It's a companion to the `beanstalkd` service, not a queue server itself.

## Start Beanstalkd Console

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

The container `depends_on` the `beanstalkd` service in `compose.yml` (which in turn `depends_on` `php-fpm`), so Compose starts both automatically. A single command brings up the whole chain.

## Stop Beanstalkd Console

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock stop beanstalkd-console
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose stop beanstalkd-console
```

</TabItem>
</Tabs>

It holds no data of its own (it only reads from `beanstalkd`), so there's nothing to lose. To delete the container entirely:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock remove beanstalkd-console
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose rm -sf beanstalkd-console
```

</TabItem>
</Tabs>

## Configuration

All settings live in `beanstalkd-console/defaults.env` and can be overridden by adding the same line to your own `.env`:

| Variable | Default | What it does |
|---|---|---|
| `BEANSTALKD_CONSOLE_HOST_PORT` | `2080` | Host-side port the console UI is published on (`host:2080`). |

## Connect the console to Beanstalkd

1. Make sure the `beanstalkd` service is running (Compose starts it automatically via `depends_on`, but it needs to be reachable).
2. Open [http://localhost:2080](http://localhost:2080) (or your custom `BEANSTALKD_CONSOLE_HOST_PORT`).
3. Add a server in the UI with host `beanstalkd` and port `11300`, the container name and internal port Beanstalkd listens on inside the Laradock network.

The console doesn't auto-discover Beanstalkd on modern Docker networks, so this manual step is required every time you start from a fresh container (the added server isn't persisted anywhere on disk).

## Update the console

The Dockerfile pulls the `master` branch of [`ptrofimov/beanstalk_console`](https://github.com/ptrofimov/beanstalk_console) fresh at build time rather than pinning a version. To pick up upstream fixes/changes, rebuild with no cache:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock rebuild beanstalkd-console
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose build --no-cache beanstalkd-console
```

</TabItem>
</Tabs>

`--no-cache` matters here: without it, Docker may reuse a cached layer from the last time the source was fetched instead of downloading the current `master`.

## View logs

Useful when the page won't load or shows a blank screen:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock logs beanstalkd-console
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose logs --tail=100 beanstalkd-console
```

</TabItem>
</Tabs>

## Common issues

- **No server configured on first load.** The console doesn't auto-discover Beanstalkd; add the server manually (host `beanstalkd`, port `11300`) as described above.
- **Can't reach `beanstalkd` from the console.** Both containers must be on the same Compose network (they are, by default, on `backend`) and `beanstalkd` must actually be running: `docker compose ps beanstalkd`.
- **Port already in use on your host.** Another service is bound to `2080`. Change `BEANSTALKD_CONSOLE_HOST_PORT` in `.env` and restart: `./laradock restart beanstalkd-console`.
- **Blank page or 502 after starting.** The container needs `beanstalkd` up first; if you started `beanstalkd-console` alone before Compose finished bringing up `beanstalkd`, give it a few seconds and refresh.

---

Need the queue server itself? See **[Beanstalkd](/docs/services/beanstalkd)**. New to Laradock? Start at **[Getting Started](/docs/getting-started)**.
