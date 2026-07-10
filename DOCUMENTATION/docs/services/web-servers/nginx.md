---
slug: /services/nginx
title: Nginx
description: Run Nginx in Laradock as the default web server. Configure sites, host and container ports, SSL, and connect it to PHP-FPM.
keywords:
  - laradock nginx
  - nginx docker
  - nginx docker compose
  - nginx site config laravel
  - nginx php-fpm docker
  - nginx ssl docker
---

## What is Nginx?

[Nginx](https://nginx.org) is a fast, low-memory HTTP server and reverse proxy, the default web server in Laradock. It terminates HTTP/HTTPS requests and forwards PHP requests to `php-fpm` over FastCGI.

## Start Nginx

```bash
docker compose up -d nginx
```

Nginx's `compose.yml` declares `depends_on: php-fpm`, so Compose starts `php-fpm` automatically. You'll still want a database and any other services your app needs, for example:

```bash
docker compose up -d nginx mysql workspace
```

## Stop Nginx

```bash
docker compose stop nginx
```

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

```bash
docker compose restart nginx
```

The `laravel.conf.example` template already routes `.php` requests to `fastcgi_pass php-upstream;`, which resolves to `NGINX_PHP_UPSTREAM_CONTAINER:NGINX_PHP_UPSTREAM_PORT`, and denies access to `.ht*` files.

## Enable SSL

Uncomment the SSL lines in your site config:

```conf
listen 443 ssl;
listen [::]:443 ssl ipv6only=on;
ssl_certificate /etc/nginx/ssl/default.crt;
ssl_certificate_key /etc/nginx/ssl/default.key;
```

Place your certificate and key in the folder pointed to by `NGINX_SSL_PATH` (`./nginx/ssl/` by default), then restart the container.

## Change the exposed port

```env
NGINX_HOST_HTTP_PORT=8080
NGINX_HOST_HTTPS_PORT=8443
```

```bash
docker compose up -d nginx
```

## Common issues

- **502 Bad Gateway.** Nginx can't reach PHP-FPM. Confirm `php-fpm` is running (`docker compose ps php-fpm`) and that `NGINX_PHP_UPSTREAM_CONTAINER`/`NGINX_PHP_UPSTREAM_PORT` match its actual name and port.
- **New site file has no effect.** Config in `nginx/sites/` is picked up on container start, run `docker compose restart nginx` after adding or editing a file.
- **Port already in use on your host.** Another web server (or another Laradock project) is already bound to `80`/`443`. Change `NGINX_HOST_HTTP_PORT`/`NGINX_HOST_HTTPS_PORT` and restart.
- **Domain doesn't resolve.** Add it to `/etc/hosts` pointing at `127.0.0.1`, and set `server_name` in the site config to match.

---

Need a different web server? See **[Apache](/docs/services/apache2)**, **[Caddy](/docs/services/caddy)**, or **[OpenResty](/docs/services/openresty)**. New to Laradock? Start with **[Getting Started](/docs/getting-started)**.
