# FrankenPHP

Source: https://laradock.io/docs/services/frankenphp

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

## What is FrankenPHP?

[FrankenPHP](https://frankenphp.dev) is a modern PHP application server built on Caddy, an alternative to the classic Nginx + PHP-FPM split. It serves your app directly (no separate web server container needed) with automatic HTTPS, HTTP/3, and a worker mode, and is the recommended runtime for [Laravel Octane](https://laravel.com/docs/octane).

## Start FrankenPHP

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock start frankenphp
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose up -d frankenphp
```

</TabItem>
</Tabs>

FrankenPHP is self-contained: it doesn't declare a dependency on `php-fpm` or Nginx, it serves your app directly.

## Stop FrankenPHP

Stopping just pauses the container, your app code on disk is untouched:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock stop frankenphp
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose stop frankenphp
```

</TabItem>
</Tabs>

To delete the container entirely (your app code and the image are untouched):

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock remove frankenphp
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose rm -sf frankenphp
```

</TabItem>
</Tabs>

## Restart FrankenPHP

Useful after changing `.env` values like the ports below:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock restart frankenphp
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose restart frankenphp
```

</TabItem>
</Tabs>

## Configuration

All settings live in `frankenphp/defaults.env` and can be overridden by adding the same line to your own `.env`:

| Variable | Default | What it does |
|---|---|---|
| `FRANKENPHP_VERSION` | `1-php8` | FrankenPHP image tag (build arg). |
| `FRANKENPHP_HTTP_PORT` | `8000` | Host-side port mapped to container port 80. |
| `FRANKENPHP_HTTPS_PORT` | `8443` | Host-side port mapped to container port 443. |

Your app is mounted at `/app` inside the container (Laravel docroot `/app/public`), via `${APP_CODE_PATH_HOST}:/app`.

## Access your app

```
https://localhost:8443
```

HTTP on `FRANKENPHP_HTTP_PORT` (`8000` by default) auto-redirects to HTTPS.

## Add PHP extensions

Edit `frankenphp/Dockerfile` and add to its `install-php-extensions` call, then rebuild:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock rebuild frankenphp
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose build frankenphp
```

</TabItem>
</Tabs>

Then start it again with the rebuilt image:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock start frankenphp
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose up -d frankenphp
```

</TabItem>
</Tabs>

## View logs

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock logs frankenphp
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose logs --tail=100 frankenphp
```

</TabItem>
</Tabs>

Caddy's access/error log lines and any PHP errors your app writes to stderr both show up here, useful for diagnosing a blank page or a certificate problem without opening a shell.

## Open a shell inside the container

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock enter frankenphp
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose exec frankenphp bash
```

</TabItem>
</Tabs>

Since FrankenPHP *is* your app's PHP runtime (there's no separate `php-fpm` container in this stack), this is also where you'd run one-off `php` or `php artisan` commands if you want them to execute under the exact same PHP/extension set that serves requests, instead of the `workspace` container.

## Use with Laravel Octane worker mode

For Octane's worker mode (keeping your app booted in memory between requests instead of bootstrapping per request), follow the [Octane + FrankenPHP docs](https://laravel.com/docs/octane#frankenphp). The container already serves your mounted app; worker mode is configured on the Laravel side.

## Common issues

- **Browser doesn't trust the HTTPS certificate.** FrankenPHP, like Caddy, issues a locally trusted certificate automatically for development; trust it locally or configure a real domain for production use.
- **HTTP/3 doesn't seem to work.** HTTP/3 runs over QUIC, which needs a **UDP** port published, but `frankenphp/compose.yml` only maps `FRANKENPHP_HTTPS_PORT` as TCP. Browsers still work fine over HTTP/1.1 or HTTP/2, but to actually get HTTP/3 locally you'd need to add a matching `"${FRANKENPHP_HTTPS_PORT}:443/udp"` line to the `ports:` list yourself.
- **Extension changes don't apply.** PHP extensions are installed at build time via the `Dockerfile`, so after editing it you need `./laradock rebuild frankenphp`, not just a restart.
- **Port already in use on your host.** Another service is already bound to `8000`/`8443`. Change `FRANKENPHP_HTTP_PORT`/`FRANKENPHP_HTTPS_PORT` and restart with `./laradock restart frankenphp`.
- **App not found / blank page.** Confirm your Laravel docroot is `public/` under the mounted app folder, FrankenPHP expects `/app/public` inside the container.

---

Looking for the classic Nginx + PHP-FPM setup instead? See **[Nginx](https://laradock.io/docs/services/nginx)**. Want another Octane-compatible runtime? See **[RoadRunner](https://laradock.io/docs/services/roadrunner)**. New to Laradock? Start with **[Getting Started](https://laradock.io/docs/getting-started)**.
