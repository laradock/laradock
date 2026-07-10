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

## What is OpenResty?

[OpenResty](https://openresty.org) is Nginx bundled with LuaJIT and a set of Lua modules, letting you script request handling (auth, routing, rate limiting, API gateways) directly inside the web server instead of only through Nginx's native directives. Everything about its config format is Nginx-compatible: site files are plain Nginx server blocks, with Lua available where you need it.

## Start OpenResty

```bash
docker compose up -d openresty
```

OpenResty's `compose.yml` declares `depends_on: php-fpm`, so Compose starts it automatically. Add whatever else your app needs, for example:

```bash
docker compose up -d openresty mysql workspace
```

## Stop OpenResty

```bash
docker compose stop openresty
```

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

```bash
docker compose restart openresty
```

`fastcgi_pass php-upstream;` in these templates resolves to `OPENRESTY_PHP_UPSTREAM_CONTAINER:OPENRESTY_PHP_UPSTREAM_PORT`.

## Enable SSL

Uncomment the SSL lines in your site config (`listen 443 ssl;`, `ssl_certificate`, `ssl_certificate_key`), and place your certificate and key in the folder pointed to by `OPENRESTY_SSL_PATH` (`./openresty/ssl/` by default), then restart the container.

## Change the exposed port

```env
OPENRESTY_HOST_HTTP_PORT=8080
OPENRESTY_HOST_HTTPS_PORT=8443
```

```bash
docker compose up -d openresty
```

## Common issues

- **502 Bad Gateway.** OpenResty can't reach PHP-FPM. Confirm `php-fpm` is running and that `OPENRESTY_PHP_UPSTREAM_CONTAINER`/`OPENRESTY_PHP_UPSTREAM_PORT` match its real name and port.
- **New site file has no effect.** Config in `openresty/sites/` is read on container start, run `docker compose restart openresty` after adding or editing a file.
- **Not sure whether to reach for Lua or plain server-block config.** If you don't need scripted request handling, the vanilla **[Nginx](/docs/services/nginx)** service uses the same site config format and is a lighter-weight choice.
- **Port already in use on your host.** Another web server (or another Laradock project) is already bound to `80`/`443`. Change `OPENRESTY_HOST_HTTP_PORT`/`OPENRESTY_HOST_HTTPS_PORT` and restart.

---

Need a different web server? See **[Nginx](/docs/services/nginx)**, **[Apache](/docs/services/apache2)**, or **[Caddy](/docs/services/caddy)**. New to Laradock? Start with **[Getting Started](/docs/getting-started)**.
