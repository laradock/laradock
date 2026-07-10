---
slug: /services/caddy
title: Caddy
description: Run Caddy in Laradock. Configure the Caddyfile, host ports, and automatic HTTPS, and connect it to PHP-FPM.
keywords:
  - laradock caddy
  - caddy docker
  - caddy docker compose
  - caddyfile laravel
  - caddy automatic https
  - caddy php-fpm docker
---

## What is Caddy?

[Caddy](https://caddyserver.com) is a modern web server best known for automatic HTTPS: it can provision and renew TLS certificates with zero manual config. Laradock runs it as an alternative to Nginx or Apache, driven by a single `Caddyfile`.

## Start Caddy

```bash
docker compose up -d caddy
```

Caddy's `compose.yml` declares `depends_on: php-fpm`, so Compose starts it automatically. Add whatever else your app needs, for example:

```bash
docker compose up -d caddy mysql workspace
```

## Stop Caddy

```bash
docker compose stop caddy
```

## Configuration

All settings live in `caddy/defaults.env` and can be overridden by adding the same line to your own `.env`:

| Variable | Default | What it does |
|---|---|---|
| `CADDY_HOST_HTTP_PORT` | `80` | Host-side port mapped to container port 80. |
| `CADDY_HOST_HTTPS_PORT` | `443` | Host-side port mapped to container port 443. |
| `CADDY_HOST_LOG_PATH` | `./logs/caddy` | Host folder mounted to `/var/log/caddy`. |
| `CADDY_CONFIG_PATH` | `./caddy/caddy` | Host folder mounted to `/etc/caddy`, containing the `Caddyfile`. |

Caddy's certificate/state data (`/root/.caddy` inside the container) is stored under `DATA_PATH_HOST`, the same shared data folder used by other Laradock services.

## The Caddyfile

The shipped `caddy/caddy/Caddyfile` serves the app with automatic HTTPS out of the box:

```caddyfile
laradock.test {
    root * /var/www/public
    php_fastcgi php-fpm:9000
    file_server

    encode zstd gzip
    tls internal
}
```

`php_fastcgi php-fpm:9000` proxies PHP requests straight to the `php-fpm` container, and `tls internal` tells Caddy to mint a locally trusted certificate rather than reaching out to Let's Encrypt, which is what you want for local development. Edit the `server_name` (`laradock.test`) and `root` to match your app, then rebuild:

```bash
docker compose build caddy
docker compose up -d caddy
```

## Use a real domain with public HTTPS

For a publicly reachable domain, replace `tls internal` with your email (or remove the `tls` line entirely) so Caddy requests a certificate from Let's Encrypt instead:

```caddyfile
yourdomain.com {
    root * /var/www/public
    php_fastcgi php-fpm:9000
    file_server
}
```

Your domain needs to resolve to the host running Laradock, and `CADDY_HOST_HTTP_PORT`/`CADDY_HOST_HTTPS_PORT` need to be reachable on `80`/`443` for the ACME challenge to succeed.

## Change the exposed port

```env
CADDY_HOST_HTTP_PORT=8080
CADDY_HOST_HTTPS_PORT=8443
```

```bash
docker compose up -d caddy
```

## Common issues

- **Browser doesn't trust the certificate.** `tls internal` issues a certificate from Caddy's local CA, not a public one. Trust that CA locally, or use a public domain with Let's Encrypt as described above.
- **502 from Caddy.** Confirm `php-fpm` is running and reachable at `php-fpm:9000`, the address hardcoded in the shipped `Caddyfile`.
- **Changes to the Caddyfile don't take effect.** The `Caddyfile` is baked into the image by the `Dockerfile` (`COPY ./caddy/Caddyfile /etc/caddy/Caddyfile`), so after editing it you need to rebuild, not just restart: `docker compose build caddy && docker compose up -d caddy`.
- **Port already in use on your host.** Another web server (or another Laradock project) is already bound to `80`/`443`. Change `CADDY_HOST_HTTP_PORT`/`CADDY_HOST_HTTPS_PORT` and restart.

---

Need a different web server? See **[Nginx](/docs/services/nginx)** or **[Apache](/docs/services/apache2)**. New to Laradock? Start with **[Getting Started](/docs/getting-started)**.
