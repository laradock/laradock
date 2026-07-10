---
slug: /services/apache2
title: Apache
description: Run Apache (httpd) in Laradock. Configure sites, host ports, SSL, HTTP/2, and connect it to PHP-FPM.
keywords:
  - laradock apache
  - apache docker
  - apache docker compose
  - apache virtualhost laravel
  - apache php-fpm docker
  - apache ssl docker
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

## What is Apache?

[Apache HTTP Server](https://httpd.apache.org) is one of the most widely used web servers, known for `.htaccess`-driven per-directory config and broad module support. Laradock runs it as an alternative to Nginx, proxying PHP requests to `php-fpm`.

## Start Apache

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock start apache2
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose up -d apache2
```

</TabItem>
</Tabs>

Apache's `compose.yml` declares `depends_on: php-fpm`, so Compose starts it automatically. Add whatever else your app needs, for example:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock start apache2 mysql workspace
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose up -d apache2 mysql workspace
```

</TabItem>
</Tabs>

## Stop Apache

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock stop apache2
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose stop apache2
```

</TabItem>
</Tabs>

## Configuration

All settings live in `apache2/defaults.env` and can be overridden by adding the same line to your own `.env`:

| Variable | Default | What it does |
|---|---|---|
| `APACHE_HOST_HTTP_PORT` | `80` | Host-side port mapped to container port 80. |
| `APACHE_HOST_HTTPS_PORT` | `443` | Host-side port mapped to container port 443. |
| `APACHE_HOST_LOG_PATH` | `./logs/apache2` | Host folder mounted to `/var/log/apache2`. |
| `APACHE_SITES_PATH` | `./apache2/sites` | Host folder mounted to `/etc/apache2/sites-available`. |
| `APACHE_PHP_UPSTREAM_CONTAINER` | `php-fpm` | Container name Apache proxies PHP requests to (build arg). |
| `APACHE_PHP_UPSTREAM_PORT` | `9000` | Port on the upstream PHP container (build arg). |
| `APACHE_PHP_UPSTREAM_TIMEOUT` | `60` | Proxy timeout (seconds) to the upstream PHP container (build arg). |
| `APACHE_DOCUMENT_ROOT` | `/var/www/` | Document root baked into the image at build time (build arg). |
| `APACHE_SSL_PATH` | `./apache2/ssl/` | Host folder mounted to `/etc/apache2/ssl`, for your certificates. |
| `APACHE_INSTALL_HTTP2` | `false` | Set `true` to enable the HTTP/2 module at build time. |
| `APACHE_FOR_MAC_M1` | `false` | Set `true` when building on Apple Silicon (build arg). |

## Add a site config

Files in `apache2/sites/` become available VirtualHosts. There's `default.apache.conf` (serves `APACHE_DOCUMENT_ROOT` on `laradock.test`), `default.apache.ssl.example` (SSL version), and `sample.conf.example` for a project with its own document root:

```bash
cp apache2/sites/sample.conf.example apache2/sites/myapp.conf
```

Edit `ServerName` and `DocumentRoot`, then restart:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock restart apache2
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose restart apache2
```

</TabItem>
</Tabs>

```apacheconf
<VirtualHost *:80>
  ServerName sample.test
  DocumentRoot /var/www/sample/public/
  Options Indexes FollowSymLinks

  <Directory "/var/www/sample/public/">
    AllowOverride All
    Require all granted
  </Directory>
</VirtualHost>
```

## Test a config change before restarting

A typo in a VirtualHost file can take the whole server down on restart. Check syntax first, inside the running container:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock enter apache2
apache2ctl configtest
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose exec apache2 bash
apache2ctl configtest
```

</TabItem>
</Tabs>

`Syntax OK` means it's safe to restart. Anything else names the file and line to fix.

## Enable SSL

Copy `apache2/sites/default.apache.ssl.example` alongside your site config, point it at your certificate files under the folder set by `APACHE_SSL_PATH` (`./apache2/ssl/` by default), and restart the container.

## Enable HTTP/2

```env
APACHE_INSTALL_HTTP2=true
```

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock rebuild apache2
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose build apache2
```

</TabItem>
</Tabs>

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock start apache2
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose up -d apache2
```

</TabItem>
</Tabs>

## Change the exposed port

```env
APACHE_HOST_HTTP_PORT=8080
APACHE_HOST_HTTPS_PORT=8443
```

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock start apache2
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose up -d apache2
```

</TabItem>
</Tabs>

## View logs

Apache writes `error.log` and `access.log` per VirtualHost (see `ErrorLog`/`CustomLog` in the shipped site configs) to `/var/log/apache2` inside the container, which is bind-mounted to `APACHE_HOST_LOG_PATH` (`./logs/apache2` by default) on your host. Read them straight from your host with any tool (`tail -f`, an editor, etc.), no container access needed:

```bash
tail -f logs/apache2/error.log
```

For the container's own stdout/stderr (startup messages, not per-request traffic):

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock logs apache2
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose logs --tail=100 apache2
```

</TabItem>
</Tabs>

## Common issues

- **502/503 from Apache.** Confirm `php-fpm` is running and that `APACHE_PHP_UPSTREAM_CONTAINER`/`APACHE_PHP_UPSTREAM_PORT` match its real name and port; also check `APACHE_PHP_UPSTREAM_TIMEOUT` if long-running requests are being cut off.
- **New site file has no effect.** VirtualHosts in `apache2/sites/` are read on container start, run `./laradock restart apache2` after adding or editing a file.
- **`.htaccess` rules ignored.** Confirm the VirtualHost has `AllowOverride All` in its `<Directory>` block, as shown in the shipped examples.
- **Building on Apple Silicon fails or behaves oddly.** Set `APACHE_FOR_MAC_M1=true` and rebuild.
- **Port already in use on your host.** Another web server (or another Laradock project) is already bound to `80`/`443`. Change `APACHE_HOST_HTTP_PORT`/`APACHE_HOST_HTTPS_PORT` and restart.
- **Restart succeeded but the site still 500s.** Check `logs/apache2/error.log` on your host (or `./laradock logs apache2` for startup-time errors) for the actual PHP or Apache error before guessing further.

---

Need a different web server? See **[Nginx](/docs/services/nginx)**, **[Caddy](/docs/services/caddy)**, or **[OpenResty](/docs/services/openresty)**. New to Laradock? Start with **[Getting Started](/docs/getting-started)**.
