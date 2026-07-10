---
slug: /services/openresty
title: OpenResty
description: Run OpenResty in Laradock, Nginx bundled with LuaJIT for scriptable request handling. Configure sites, host ports, SSL, and connect it to PHP-FPM.
keywords:
  - laradock openresty
  - openresty docker
  - openresty docker compose
  - openresty lua nginx
  - openresty php-fpm docker
  - nginx lua docker
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

## What is OpenResty?

[OpenResty](https://openresty.org) is Nginx bundled with LuaJIT and a set of Lua modules, letting you script request handling (auth, routing, rate limiting, API gateways) directly inside the web server instead of only through Nginx's native directives. Everything about its config format is Nginx-compatible: site files are plain Nginx server blocks, with Lua available where you need it.

## Start OpenResty

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock start openresty
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose up -d openresty
```

</TabItem>
</Tabs>

OpenResty's `compose.yml` declares `depends_on: php-fpm`, so Compose starts it automatically. Name any other services alongside it to start them together, for example `./laradock start openresty mysql workspace`.

## Stop OpenResty

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock stop openresty
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose stop openresty
```

</TabItem>
</Tabs>

## Configuration

All settings live in `openresty/defaults.env` and can be overridden by adding the same line to your own `.env`:

| Variable | Default | What it does |
|---|---|---|
| `OPENRESTY_HOST_HTTP_PORT` | `80` | Host-side port mapped to container port 80. |
| `OPENRESTY_HOST_HTTPS_PORT` | `443` | Host-side port mapped to container port 443. |
| `OPENRESTY_HOST_LOG_PATH` | `./logs/openresty/` | Host folder mounted to `/var/log/nginx`. |
| `OPENRESTY_SITES_PATH` | `./openresty/sites/` | Host folder mounted to `/etc/nginx/sites-available`, one file per site. |
| `OPENRESTY_PHP_UPSTREAM_CONTAINER` | `php-fpm` | Container name OpenResty proxies PHP requests to (build arg). |
| `OPENRESTY_PHP_UPSTREAM_PORT` | `9000` | Port on the upstream PHP container (build arg). |
| `OPENRESTY_SSL_PATH` | `./openresty/ssl/` | Host folder mounted to `/etc/nginx/ssl`, for your certificates. |

The container also publishes `${VARNISH_BACKEND_PORT}:81`, the port Varnish uses to talk back when you run OpenResty behind Varnish as a cache, same as the Nginx service.

## Add a site config

Every file in `openresty/sites/` is loaded automatically, using the same server-block syntax as plain Nginx. There's a `default.conf` plus framework templates (`laravel.conf.example`, `symfony.conf.example`, `node.conf.example`, `confluence.conf.example`, `laravel_varnish.conf.example`):

```bash
cp openresty/sites/laravel.conf.example openresty/sites/laravel.conf
```

Edit `server_name` and `root` to match your app, then restart:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock restart openresty
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose restart openresty
```

</TabItem>
</Tabs>

`fastcgi_pass php-upstream;` in these templates resolves to `OPENRESTY_PHP_UPSTREAM_CONTAINER:OPENRESTY_PHP_UPSTREAM_PORT`.

## Test your config before reloading

Nginx-style config errors otherwise only surface as a failed reload or a container stuck in a restart loop. Check syntax **before** restarting, from inside the container:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock enter openresty
nginx -t
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose exec openresty bash
nginx -t
```

</TabItem>
</Tabs>

`nginx -t` reports `syntax is ok` / `test is successful`, or points at the exact file and line that's broken, without touching the running server. OpenResty ships the same `nginx` binary under the hood, so this works exactly like plain Nginx.

## Script requests with Lua

This is what sets OpenResty apart from plain Nginx: any directive that accepts a `*_by_lua_block` can run Lua inline, no separate app server needed. A minimal example in a site config:

```nginx
location /healthz {
    default_type text/plain;
    content_by_lua_block {
        ngx.say("ok")
    }
}
```

Common hooks: `access_by_lua_block` (auth/rate limiting before the request is proxied), `content_by_lua_block` (generate the response yourself, skip PHP-FPM entirely), `header_filter_by_lua_block` (rewrite response headers). None of the bundled `openresty/sites/*.conf.example` templates use Lua, they're plain Nginx server blocks, add `*_by_lua_block` directives to your own site file where you need scripting.

## Enable SSL

Uncomment the SSL lines in your site config (`listen 443 ssl;`, `ssl_certificate`, `ssl_certificate_key`), and place your certificate and key in the folder pointed to by `OPENRESTY_SSL_PATH` (`./openresty/ssl/` by default), then restart the container.

If you don't provide your own certificate, the container generates a self-signed one on first start (`default.key`/`default.crt` in `OPENRESTY_SSL_PATH`), good enough for local HTTPS testing but browsers will flag it as untrusted, replace it with a real certificate (or a [mkcert](https://github.com/FiloSottile/mkcert) local CA) for anything beyond a quick check.

## Change the exposed port

```env
OPENRESTY_HOST_HTTP_PORT=8080
OPENRESTY_HOST_HTTPS_PORT=8443
```

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock restart openresty
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose restart openresty
```

</TabItem>
</Tabs>

## Logs

Access and error logs are written to `OPENRESTY_HOST_LOG_PATH` on your host (`./logs/openresty/` by default), already rotated daily and kept for 32 days by the bundled `logrotate` config, so you don't need to prune them yourself. Tail them live:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock logs openresty
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose logs --tail=100 openresty
```

</TabItem>
</Tabs>

That's the container's stdout/stderr (startup and crond output). For the actual Nginx access/error logs, read the files directly from `OPENRESTY_HOST_LOG_PATH` on your host, or `tail -f` them from inside the container after `./laradock enter openresty`.

## Common issues

- **502 Bad Gateway.** OpenResty can't reach PHP-FPM. Confirm `php-fpm` is running and that `OPENRESTY_PHP_UPSTREAM_CONTAINER`/`OPENRESTY_PHP_UPSTREAM_PORT` match its real name and port.
- **New site file has no effect.** Config in `openresty/sites/` is read on container start, run `./laradock restart openresty` after adding or editing a file.
- **Container won't start after a config edit.** Run `nginx -t` (see [Test your config before reloading](#test-your-config-before-reloading)) to find the broken directive before restarting again.
- **Not sure whether to reach for Lua or plain server-block config.** If you don't need scripted request handling, the vanilla **[Nginx](/docs/services/nginx)** service uses the same site config format and is a lighter-weight choice.
- **Port already in use on your host.** Another web server (or another Laradock project) is already bound to `80`/`443`. Change `OPENRESTY_HOST_HTTP_PORT`/`OPENRESTY_HOST_HTTPS_PORT` and restart.

---

Need a different web server? See **[Nginx](/docs/services/nginx)**, **[Apache](/docs/services/apache2)**, or **[Caddy](/docs/services/caddy)**. New to Laradock? Start with **[Getting Started](/docs/getting-started)**.
