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

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

## What is Caddy?

[Caddy](https://caddyserver.com) is a modern web server best known for automatic HTTPS: it can provision and renew TLS certificates with zero manual config. Laradock runs it as an alternative to Nginx or Apache, driven by a single `Caddyfile`.

## Start Caddy

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock start caddy
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose up -d caddy
```

</TabItem>
</Tabs>

Caddy's `compose.yml` declares `depends_on: php-fpm`, so Compose starts `php-fpm` automatically. Add whatever else your app needs, for example `./laradock start caddy mysql workspace`.

## Stop Caddy

Stopping just pauses the container; **your Caddyfile and TLS state are untouched**:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock stop caddy
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose stop caddy
```

</TabItem>
</Tabs>

To delete the container entirely (the `Caddyfile` and TLS state on disk are still untouched):

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock remove caddy
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose rm -sf caddy
```

</TabItem>
</Tabs>

## Configuration

All settings live in `caddy/defaults.env` and can be overridden by adding the same line to your own `.env`:

| Variable | Default | What it does |
|---|---|---|
| `CADDY_HOST_HTTP_PORT` | `80` | Host-side port mapped to container port 80. |
| `CADDY_HOST_HTTPS_PORT` | `443` | Host-side port mapped to container port 443. |
| `CADDY_HOST_LOG_PATH` | `./logs/caddy` | Host folder mounted to `/var/log/caddy`. |
| `CADDY_CONFIG_PATH` | `./caddy/caddy` | Host folder mounted to `/etc/caddy`, containing the `Caddyfile`. |

Caddy's automatic-HTTPS state (certificates, OCSP staples, account keys, normally kept under `/root/.caddy` inside the container) is stored under `DATA_PATH_HOST`. Unlike most other services, Caddy's `compose.yml` mounts `DATA_PATH_HOST` itself straight to `/root/.caddy`, not a `DATA_PATH_HOST/caddy` subfolder, so that path is shared with whatever other services' data also lives directly under `DATA_PATH_HOST`. Keep that in mind before deleting anything there, see [Common issues](#common-issues).

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

`php_fastcgi php-fpm:9000` proxies PHP requests straight to the `php-fpm` container, and `tls internal` tells Caddy to mint a locally trusted certificate rather than reaching out to Let's Encrypt, which is what you want for local development.

`CADDY_CONFIG_PATH` (`./caddy/caddy` by default) is bind-mounted straight to `/etc/caddy` inside the container, the same host folder the `Dockerfile` also bakes the `Caddyfile` from at build time. Because the bind mount wins at runtime, editing `caddy/caddy/Caddyfile` on your host takes effect without rebuilding the image, you only need to apply it:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock restart caddy
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose restart caddy
```

</TabItem>
</Tabs>

## Validate and reload without downtime

Restarting the container drops active connections for a moment. Caddy's own CLI can validate a config and hot-reload it in place instead, keeping existing connections and certificates alive. Open a terminal inside the container:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock enter caddy
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose exec caddy bash
```

</TabItem>
</Tabs>

Then, inside the container:

```bash
caddy validate --config /etc/caddy/Caddyfile
caddy reload --config /etc/caddy/Caddyfile
```

`caddy validate` catches syntax errors before you commit to a change, and `caddy reload` tells the already-running Caddy process (over its local admin API) to swap in the new config live, no dropped connections and no container restart.

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

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock start caddy
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose up -d caddy
```

</TabItem>
</Tabs>

## Common issues

- **Browser doesn't trust the certificate.** `tls internal` issues a certificate from Caddy's local CA, not a public one. Trust that CA locally, or use a public domain with Let's Encrypt as described above.
- **502 from Caddy.** Confirm `php-fpm` is running and reachable at `php-fpm:9000`, the address hardcoded in the shipped `Caddyfile`. Check `./laradock logs caddy` for the underlying error.
- **Changes to the Caddyfile don't take effect.** Edits to `caddy/caddy/Caddyfile` apply on the next `./laradock restart caddy` (or a live `caddy reload`, see above), no rebuild needed since the config folder is bind-mounted, not just baked into the image.
- **Port already in use on your host.** Another web server (or another Laradock project) is already bound to `80`/`443`. Change `CADDY_HOST_HTTP_PORT`/`CADDY_HOST_HTTPS_PORT` and restart.
- **Deleting `DATA_PATH_HOST` wipes more than Caddy.** Caddy's TLS state is mounted directly from `DATA_PATH_HOST` (not a `DATA_PATH_HOST/caddy` subfolder), so it's the same top-level folder other services may also store data in. Don't `rm -rf` it to "reset" Caddy, back up anything else under `DATA_PATH_HOST` first, or just delete Caddy's own state files inside it if you can identify them (`autosave.json`, the `certificates/`, `locks/`, and `ocsp/` folders it creates).

---

Need a different web server? See **[Nginx](/docs/services/nginx)** or **[Apache](/docs/services/apache2)**. New to Laradock? Start with **[Getting Started](/docs/getting-started)**.
