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

## What is Beanstalkd Console?

[Beanstalk Console](https://github.com/ptrofimov/beanstalk_console) is a small PHP web UI for inspecting a running Beanstalkd server: tubes, queued/reserved/buried jobs, and worker connections. Laradock builds it from source and serves it with PHP's built-in server. It's a companion to the `beanstalkd` service, not a queue server itself.

## Start Beanstalkd Console

```bash
docker compose up -d beanstalkd-console
```

The container `depends_on` the `beanstalkd` service in `compose.yml`, so Docker Compose starts `beanstalkd` first automatically. Both come up with a single command:

```bash
docker compose up -d beanstalkd-console
```

## Stop Beanstalkd Console

```bash
docker compose stop beanstalkd-console
```

This stops the container. It holds no data of its own (it only reads from `beanstalkd`), so there's nothing to lose: `docker compose rm -f beanstalkd-console` removes the container entirely.

## Configuration

All settings live in `beanstalkd-console/defaults.env` and can be overridden by adding the same line to your own `.env`:

| Variable | Default | What it does |
|---|---|---|
| `BEANSTALKD_CONSOLE_HOST_PORT` | `2080` | Host-side port the console UI is published on (`host:2080`). |

## Connect the console to Beanstalkd

1. Make sure the `beanstalkd` service is running (Compose starts it automatically via `depends_on`, but it needs to be reachable).
2. Open [http://localhost:2080](http://localhost:2080) (or your custom `BEANSTALKD_CONSOLE_HOST_PORT`).
3. Add a server in the UI with host `beanstalkd` and port `11300`, the container name and internal port Beanstalkd listens on inside the Laradock network.

## Common issues

- **No server configured on first load.** The console doesn't auto-discover Beanstalkd; add the server manually (host `beanstalkd`, port `11300`) as described above.
- **Can't reach `beanstalkd` from the console.** Both containers must be on the same Compose network (they are, by default, on `backend`) and `beanstalkd` must actually be running: `docker compose ps beanstalkd`.
- **Port already in use on your host.** Another service is bound to `2080`. Change `BEANSTALKD_CONSOLE_HOST_PORT` in `.env` and restart: `docker compose up -d beanstalkd-console`.
- **Blank page or 502 after `docker compose up`.** The container needs `beanstalkd` up first; if you started `beanstalkd-console` alone before Compose finished bringing up `beanstalkd`, give it a few seconds and refresh.

---

Need the queue server itself? See **[Beanstalkd](/docs/services/beanstalkd)**. New to Laradock? Start at **[Getting Started](/docs/getting-started)**.
