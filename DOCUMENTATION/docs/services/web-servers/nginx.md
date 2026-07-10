---
slug: /services/nginx
title: Nginx
description: Run Nginx in Laradock as the default web server. Configure sites, host and container ports, SSL, upload limits, and connect it to PHP-FPM.
keywords:
  - laradock nginx
  - nginx docker
  - nginx docker compose
  - nginx site config laravel
  - nginx php-fpm docker
  - nginx ssl docker
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

## What is Nginx?

[Nginx](https://nginx.org) is a fast, low-memory HTTP server and reverse proxy, the default web server in Laradock. It terminates HTTP/HTTPS requests and forwards PHP requests to `php-fpm` over FastCGI.

## Start Nginx

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock start nginx
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose up -d nginx
```

</TabItem>
</Tabs>

Nginx's `compose.yml` declares `depends_on: php-fpm`, so Compose starts `php-fpm` automatically. You'll still want a database and any other services your app needs, for example:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock start nginx mysql workspace
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose up -d nginx mysql workspace
```

</TabItem>
</Tabs>

## Stop Nginx

Stopping just pauses the container:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock stop nginx
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose stop nginx
```

</TabItem>
</Tabs>

To delete the container entirely (your site configs, SSL certs, and logs on disk are untouched, they live under `NGINX_SITES_PATH`, `NGINX_SSL_PATH`, and `NGINX_HOST_LOG_PATH`):

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock remove nginx
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose rm -sf nginx
```

</TabItem>
</Tabs>

## Configuration

All settings live in `nginx/defaults.env` and can be overridden by adding the same line to your own `.env`:

| Variable | Default | What it does |
|---|---|---|
| `NGINX_HOST_HTTP_PORT` | `80` | Host-side port mapped to container port 80. |
| `NGINX_HOST_HTTPS_PORT` | `443` | Host-side port mapped to container port 443. |
| `NGINX_HOST_LOG_PATH` | `./logs/nginx/` | Host folder mounted to `/var/log/nginx` inside the container. |
| `NGINX_SITES_PATH` | `./nginx/sites/` | Host folder mounted to `/etc/nginx/sites-available`, one file per site. |
| `NGINX_PHP_UPSTREAM_CONTAINER` | `php-fpm` | Container name Nginx proxies PHP requests to (build arg). |
| `NGINX_PHP_UPSTREAM_PORT` | `9000` | Port on the upstream PHP container (build arg). |
| `NGINX_SSL_PATH` | `./nginx/ssl/` | Host folder mounted to `/etc/nginx/ssl`, for your certificates. |

The container also publishes `${VARNISH_BACKEND_PORT}:81`, the port Varnish uses to talk back to Nginx when you run it behind Varnish as a cache.

## Add a site config

Every file in `nginx/sites/` is loaded automatically. There's a `default.conf` that serves the app root on `localhost`, plus several `*.conf.example` templates for common frameworks (`laravel.conf.example`, `symfony.conf.example`, `node.conf.example`, `confluence.conf.example`, `laravel_varnish.conf.example`).

To add a site:

```bash
cp nginx/sites/laravel.conf.example nginx/sites/laravel.conf
```

Edit `server_name` and `root` to match your app, then restart:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock restart nginx
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose restart nginx
```

</TabItem>
</Tabs>

The `laravel.conf.example` template already routes `.php` requests to `fastcgi_pass php-upstream;`, which resolves to `NGINX_PHP_UPSTREAM_CONTAINER:NGINX_PHP_UPSTREAM_PORT`, and denies access to `.ht*` files.

## Test your config before reloading

A typo in a site file can take Nginx down entirely. Validate the config **before** restarting, so a bad file fails loudly instead of crashing the running container:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock exec nginx nginx -t
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose exec nginx nginx -t
```

</TabItem>
</Tabs>

`nginx -t` parses every file under `/etc/nginx/sites-available` (your `nginx/sites/*.conf`) and reports the exact file and line of any syntax error, without touching the running process. Only restart once it prints `syntax is ok` / `test is successful`.

## Enable SSL

Laradock generates a self-signed certificate automatically on first boot (`nginx/startup.sh`), so `NGINX_SSL_PATH` (`./nginx/ssl/` by default) already has a working `default.crt`/`default.key` pair you can use for local HTTPS testing right away.

To use it (or your own certificate placed in the same folder), uncomment the SSL lines in your site config:

```conf
listen 443 ssl;
listen [::]:443 ssl ipv6only=on;
ssl_certificate /etc/nginx/ssl/default.crt;
ssl_certificate_key /etc/nginx/ssl/default.key;
```

[Test the config](#test-your-config-before-reloading), then restart the container.

## Increase the upload size

Laravel/PHP file uploads larger than **20M** get rejected by Nginx itself with `413 Request Entity Too Large` before the request ever reaches PHP, since `nginx/nginx.conf` ships with:

```conf
client_max_body_size 20M;
```

Raise (or lower) it in `nginx/nginx.conf`, then rebuild, since that file is baked into the image at build time (not a mounted volume):

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock rebuild nginx
./laradock start nginx
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose build nginx
docker compose up -d nginx
```

</TabItem>
</Tabs>

Also raise your PHP-side limits (`upload_max_filesize`, `post_max_size` in `php-fpm`) and, if you're behind Varnish or another proxy in front of Nginx, its body-size limit too, all three have to agree or the smallest one wins.

## View logs

The main Nginx process logs to the container's stdout/stderr (`access_log /dev/stdout` and `error_log /dev/stderr` in `nginx/nginx.conf`), so the fastest way to see what's happening is:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock logs nginx
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose logs --tail=100 nginx
```

</TabItem>
</Tabs>

Site configs can also log to their own files instead, `laravel.conf.example` does this with `error_log /var/log/nginx/laravel_error.log;` and `access_log /var/log/nginx/laravel_access.log;`. Those land on your host under `NGINX_HOST_LOG_PATH` (`./logs/nginx/` by default), and `nginx/logrotate/nginx` rotates them daily and keeps 32 days.

## Change the exposed port

```env
NGINX_HOST_HTTP_PORT=8080
NGINX_HOST_HTTPS_PORT=8443
```

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock start nginx
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose up -d nginx
```

</TabItem>
</Tabs>

Port mappings are set when the container is created, so this needs `up -d` (recreates the container) rather than `restart`.

## Common issues

- **502 Bad Gateway.** Nginx can't reach PHP-FPM. Confirm `php-fpm` is running (`docker compose ps php-fpm`) and that `NGINX_PHP_UPSTREAM_CONTAINER`/`NGINX_PHP_UPSTREAM_PORT` match its actual name and port.
- **New site file has no effect.** Config in `nginx/sites/` is picked up on container start, run `./laradock restart nginx` after adding or editing a file, and [test it first](#test-your-config-before-reloading) if you're not sure it's valid.
- **413 Request Entity Too Large.** Your upload exceeds `client_max_body_size` (`20M` by default). See [Increase the upload size](#increase-the-upload-size).
- **Port already in use on your host.** Another web server (or another Laradock project) is already bound to `80`/`443`. Change `NGINX_HOST_HTTP_PORT`/`NGINX_HOST_HTTPS_PORT` and restart.
- **Domain doesn't resolve.** Add it to `/etc/hosts` pointing at `127.0.0.1`, and set `server_name` in the site config to match.

---

Need a different web server? See **[Apache](/docs/services/apache2)**, **[Caddy](/docs/services/caddy)**, or **[OpenResty](/docs/services/openresty)**. New to Laradock? Start with **[Getting Started](/docs/getting-started)**.
