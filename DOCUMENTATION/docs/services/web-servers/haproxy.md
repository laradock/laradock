---
slug: /services/haproxy
title: HAProxy
description: Run HAProxy in Laradock as a high-performance TCP/HTTP load balancer in front of your proxy containers.
keywords:
  - laradock haproxy
  - haproxy docker
  - haproxy docker compose
  - haproxy load balancer
  - haproxy docker cloud
---

## What is HAProxy?

[HAProxy](https://www.haproxy.org) is a high-performance TCP/HTTP load balancer widely used to distribute traffic across multiple backend servers. In Laradock it runs as a self-configuring load balancer container, built from the `dockercloud/haproxy` image, which watches the Docker socket and automatically balances traffic across whatever containers it's linked to.

## Start HAProxy

```bash
docker compose up -d haproxy
```

`haproxy/compose.yml` links to `proxy` and `proxy2`, the two containers created by the **[Varnish](/docs/services/varnish)** service. Start those first (or alongside it) if you're load-balancing across them:

```bash
docker compose up -d proxy proxy2 haproxy
```

## Stop HAProxy

```bash
docker compose stop haproxy
```

## Configuration

The only setting is in `haproxy/defaults.env`, overridable by adding the same line to your own `.env`:

| Variable | Default | What it does |
|---|---|---|
| `HAPROXY_HOST_HTTP_PORT` | `8085` | Host-side port mapped to container port 8085. |

There's no site or backend config file to edit directly: the `dockercloud/haproxy` base image builds its balancing rules automatically from the containers it's linked to (`proxy` and `proxy2` in the shipped `compose.yml`), by watching `/var/run/docker.sock`.

## How it balances traffic

HAProxy mounts the Docker socket (`/var/run/docker.sock`) so it can detect its linked containers' ports at startup and load-balance across them without a static config file. To balance across different containers than the defaults, edit the `links:` list in `haproxy/compose.yml`.

## Change the exposed port

```env
HAPROXY_HOST_HTTP_PORT=8090
```

```bash
docker compose up -d haproxy
```

## Common issues

- **HAProxy starts but has nothing to balance.** It only load-balances containers listed under `links:` in `haproxy/compose.yml` (`proxy` and `proxy2` by default). Make sure those containers are actually running.
- **Port already in use on your host.** Another service is already bound to `8085`. Change `HAPROXY_HOST_HTTP_PORT` and restart.
- **Changes to `links:` don't seem to apply.** `dockercloud/haproxy` reconfigures on container start by inspecting Docker, so after editing `links:` you need to recreate the container: `docker compose up -d haproxy`, not just restart it.

---

Looking for the containers HAProxy balances by default? See **[Varnish](/docs/services/varnish)**. New to Laradock? Start with **[Getting Started](/docs/getting-started)**.
