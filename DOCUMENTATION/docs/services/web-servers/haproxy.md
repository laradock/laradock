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

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

## What is HAProxy?

[HAProxy](https://www.haproxy.org) is a high-performance TCP/HTTP load balancer widely used to distribute traffic across multiple backend servers. In Laradock it runs as a self-configuring load balancer container, built from the `dockercloud/haproxy` image, which watches the Docker socket and automatically balances traffic across whatever containers it's linked to.

## Start HAProxy

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock start haproxy
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose up -d haproxy
```

</TabItem>
</Tabs>

`haproxy/compose.yml` links to `proxy` and `proxy2`, the two containers created by the **[Varnish](/docs/services/varnish)** service. Start those first (or alongside it) if you're load-balancing across them:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock start proxy proxy2 haproxy
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose up -d proxy proxy2 haproxy
```

</TabItem>
</Tabs>

## Stop HAProxy

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock stop haproxy
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose stop haproxy
```

</TabItem>
</Tabs>

## Configuration

The only setting is in `haproxy/defaults.env`, overridable by adding the same line to your own `.env`:

| Variable | Default | What it does |
|---|---|---|
| `HAPROXY_HOST_HTTP_PORT` | `8085` | Host-side port mapped to container port 8085. |

There's no site or backend config file to edit directly: the `dockercloud/haproxy` base image builds its balancing rules automatically from the containers it's linked to (`proxy` and `proxy2` in the shipped `compose.yml`), by watching `/var/run/docker.sock`.

## How it balances traffic

HAProxy mounts the Docker socket (`/var/run/docker.sock`) so it can detect its linked containers' ports at startup and load-balance across them without a static config file. To balance across different containers than the defaults, edit the `links:` list in `haproxy/compose.yml`.

## Balance across different containers

Edit the `links:` list in `haproxy/compose.yml` to point at whatever containers you want balanced instead of (or alongside) `proxy`/`proxy2`, then recreate the container so it picks up the new links:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock start haproxy
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose up -d haproxy
```

</TabItem>
</Tabs>

A `restart` isn't enough here, `links:` is read when the container is created, not on every restart. Recreating (`up -d`, which is what `start` does) is required.

## View the built-in stats page

The `dockercloud/haproxy` base image ships with a live stats dashboard, enabled by default on container port `1936` with the credentials `stats` / `stats`. It isn't published to your host by default, add a port mapping in `haproxy/compose.yml` to reach it:

```yaml
ports:
  - "${HAPROXY_HOST_HTTP_PORT}:8085"
  - "1936:1936"
```

Recreate the container after editing, then open `http://localhost:1936` in your browser and log in with `stats` / `stats`. You can change the port and credentials the image listens on via its own `STATS_PORT` and `STATS_AUTH` environment variables if you add them to `haproxy/compose.yml`.

## Change the exposed port

```env
HAPROXY_HOST_HTTP_PORT=8090
```

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock start haproxy
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose up -d haproxy
```

</TabItem>
</Tabs>

## Common issues

- **HAProxy starts but has nothing to balance.** It only load-balances containers listed under `links:` in `haproxy/compose.yml` (`proxy` and `proxy2` by default). Make sure those containers are actually running: `./laradock start proxy proxy2`.
- **Port already in use on your host.** Another service is already bound to `8085`. Change `HAPROXY_HOST_HTTP_PORT` and restart with `./laradock start haproxy`.
- **Changes to `links:` don't seem to apply.** `dockercloud/haproxy` reads its linked containers when the container is created, not on every restart, so after editing `links:` you need to recreate it with `./laradock start haproxy`, not just `./laradock restart haproxy`.
- **Can't reach the stats page.** It's not published to your host out of the box, see [View the built-in stats page](#view-the-built-in-stats-page) above.

---

Looking for the containers HAProxy balances by default? See **[Varnish](/docs/services/varnish)**. New to Laradock? Start with **[Getting Started](/docs/getting-started)**.
