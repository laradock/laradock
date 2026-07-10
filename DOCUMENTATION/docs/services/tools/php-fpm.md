---
slug: /services/php-fpm
title: PHP-FPM
description: The core PHP runtime container in Laradock. How it's built, which extensions ship enabled by default, and how web servers depend on it.
keywords:
  - laradock php-fpm
  - php-fpm docker
  - php-fpm docker compose
  - php version docker
  - php extensions docker
  - php-fpm xdebug
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

## What is PHP-FPM?

[PHP-FPM](https://www.php.net/manual/en/install.fpm.php) (FastCGI Process Manager) is the process manager that runs your PHP application code and talks FastCGI to a web server. In Laradock, `php-fpm` is the container that actually executes your app, `nginx`/`apache` proxy requests to it rather than running PHP themselves.

This page covers the container itself: how it's started, what it reads from `.env`, how other services depend on it, and how to switch PHP versions and install extensions and debuggers.

## Start PHP-FPM

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock start php-fpm
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose up -d php-fpm
```

</TabItem>
</Tabs>

Web servers depend on `php-fpm` to serve dynamic requests, so bring it up alongside one:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock start nginx php-fpm
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose up -d nginx php-fpm
```

</TabItem>
</Tabs>

`php-fpm` itself `depends_on: workspace` in `compose.yml`, both containers build from the same PHP version and share build logic.

## Stop PHP-FPM

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock stop php-fpm
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose stop php-fpm
```

</TabItem>
</Tabs>

To delete the container entirely (your app code, which lives under `APP_CODE_PATH_HOST` and isn't owned by this container, is untouched):

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock remove php-fpm
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose rm -sf php-fpm
```

</TabItem>
</Tabs>

## Configuration

The PHP version is controlled by the shared `PHP_VERSION` variable in the root `.env` (default `8.4`), not by a `php-fpm`-specific variable, it's passed into the build as `LARADOCK_PHP_VERSION`. Everything else lives in `php-fpm/defaults.env` as `PHP_FPM_INSTALL_*` build-time toggles. A few default to `true`:

| Variable | Default | What it does |
|---|---|---|
| `PHP_FPM_INSTALL_MYSQLI` | `true` | MySQLi extension. |
| `PHP_FPM_INSTALL_INTL` | `true` | Internationalization extension. |
| `PHP_FPM_INSTALL_IMAGEMAGICK` | `true` | ImageMagick (Imagick) extension. |
| `PHP_FPM_INSTALL_OPCACHE` | `true` | Zend OPcache. |
| `PHP_FPM_INSTALL_IMAGE_OPTIMIZERS` | `true` | `jpegoptim`, `optipng`, `pngquant`, `gifsicle`. |
| `PHP_FPM_INSTALL_PHPREDIS` | `true` | PHP Redis extension. |
| `PHP_FPM_INSTALL_DNSUTILS` | `true` | `dig`/`nslookup` and friends. |

Everything else (Xdebug, pcov, phpdbg, xhprof, BCMath, PostgreSQL, MongoDB, AMQP, LDAP, SOAP, XSL, SSH2, Swoole, Phalcon, OCI8, MSSQL, ionCube, APCu, YAML, rdkafka, New Relic, and dozens more) defaults to `false` and follows the same `PHP_FPM_INSTALL_<THING>=true` + rebuild pattern:

```env
PHP_FPM_INSTALL_XDEBUG=true
PHP_FPM_XDEBUG_PORT=9003
```

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock rebuild php-fpm
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose build php-fpm
```

</TabItem>
</Tabs>

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock start php-fpm
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose up -d php-fpm
```

</TabItem>
</Tabs>

A few other notable variables: `PHP_FPM_PUID`/`PHP_FPM_PGID` (default `1000`/`1000`, match the `www-data` user's UID/GID to your host user), `PHP_FPM_DEFAULT_LOCALE` (default `POSIX`), and `PHP_FPM_BASE_IMAGE_TAG_PREFIX` (default `latest`, the [`laradock/php-fpm`](https://hub.docker.com/r/laradock/php-fpm/tags/) base image tag prefix).

## Change the PHP-FPM version

By default the latest stable PHP version runs. PHP-FPM serves your application code.

1. In `.env`, set `PHP_VERSION` to the version you want (any from `5.6` to `8.5`):
   ```dotenv
   PHP_VERSION=8.1
   ```
2. Rebuild the image:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock rebuild php-fpm
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose build php-fpm
```

</TabItem>
</Tabs>

> For details on the underlying base image, see the [official PHP Docker images](https://hub.docker.com/_/php/).

## Check the installed PHP version and extensions

Open a terminal inside the container to see what's actually loaded, useful after a rebuild or when an extension doesn't seem to be working:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock enter php-fpm
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose exec php-fpm bash
```

</TabItem>
</Tabs>

```bash
php -v
php -m
php --ini
```

`php -m` lists every compiled-in extension, `php --ini` shows which `.ini` files PHP actually loaded (useful for confirming `laravel.ini` and any extension `.ini` files are in effect).

## Tune PHP settings (memory limit, upload size, timeouts)

Laradock ships two layers of PHP config for `php-fpm`, and which one to edit depends on whether you want a quick restart to pick it up or need a full rebuild:

- **`php-fpm/php{PHP_VERSION}.ini`** (for example `php-fpm/php8.4.ini`) is bind-mounted straight into the container as the main `php.ini`. Edit it and restart, no rebuild needed.
- **`php-fpm/laravel.ini`** is baked into the image at build time (`memory_limit`, `upload_max_filesize`, `post_max_size`, `max_execution_time`, and a few others tuned for a typical Laravel app). Edit it and you need a rebuild for the change to apply.

To bump the upload size or memory limit, edit whichever file matches, then apply it:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock restart php-fpm
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose restart php-fpm
```

</TabItem>
</Tabs>

...or, if you edited `laravel.ini` instead:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock rebuild php-fpm
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose build php-fpm
```

</TabItem>
</Tabs>

**Process manager limits** (how many PHP processes can run at once) live in `php-fpm/xlaravel.pool.conf`: `pm.max_children`, `pm.start_servers`, `pm.min_spare_servers`, `pm.max_spare_servers`. This file is baked into the image, so changes here need a rebuild too, same command as above.

**OPcache** is enabled by default (`PHP_FPM_INSTALL_OPCACHE=true`, configured in `php-fpm/opcache.ini`) with `opcache.validate_timestamps=1`, so PHP-FPM already detects changed files on its own, you don't normally need to clear it manually after deploying new code. If you ever do want to force a clean slate (compiled bytecode is per-process and lives in memory), restarting the container clears it since every worker process restarts fresh.

## Install PHP extensions

PHP extensions are toggled per container. Each PHP container lists a flag for every extension in its `defaults.env`: `php-fpm/defaults.env`, `workspace/defaults.env`, and `php-worker/defaults.env`.

1. Find the extension's flag in the relevant container's `defaults.env`, then set it to `true` in your `.env` (for example `PHP_FPM_INSTALL_GMP=true`).
2. Rebuild that container with `--no-cache`:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock rebuild --no-cache {container-name}
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose build --no-cache {container-name}
```

</TabItem>
</Tabs>

The sections below cover the debuggers and the individual extensions Laradock ships with.

## Install Xdebug

1. In `.env`, set both flags to `true`:
   - `WORKSPACE_INSTALL_XDEBUG`
   - `PHP_FPM_INSTALL_XDEBUG`
2. Rebuild:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock rebuild workspace php-fpm
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose build workspace php-fpm
```

</TabItem>
</Tabs>

To configure Xdebug with your IDE, see this [Laravel + Laradock + PhpStorm guide](https://github.com/LarryEitel/laravel-laradock-phpstorm).

## Start or stop Xdebug

Once installed, Xdebug runs on startup by default. Control it in the `php-fpm` container by running these from the Laradock root:

- Stop it starting by default: `./php-fpm/xdebug stop`
- Start it: `./php-fpm/xdebug start`
- Check status: `./php-fpm/xdebug status`

> If `./php-fpm/xdebug` reports `Permission Denied`, give it execute access with `chmod`.

## Install pcov

A fast code-coverage driver for PHP 7.1+.

1. In `.env`, set both flags to `true`:
   - `WORKSPACE_INSTALL_PCOV`
   - `PHP_FPM_INSTALL_PCOV`
2. Rebuild:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock rebuild workspace php-fpm
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose build workspace php-fpm
```

</TabItem>
</Tabs>

For tuning tips, see the [pcov README](https://github.com/krakjoe/pcov).

## Install phpdbg

The interactive PHP debugger.

1. In `.env`, set both flags to `true`:
   - `WORKSPACE_INSTALL_PHPDBG`
   - `PHP_FPM_INSTALL_PHPDBG`
2. Rebuild:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock rebuild workspace php-fpm
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose build workspace php-fpm
```

</TabItem>
</Tabs>

## Install ionCube Loader

1. In `.env`, set both flags to `true`:
   - `WORKSPACE_INSTALL_IONCUBE`
   - `PHP_FPM_INSTALL_IONCUBE`
2. Rebuild:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock rebuild workspace php-fpm
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose build workspace php-fpm
```

</TabItem>
</Tabs>

The latest loaders are always downloaded from [ionCube](http://www.ioncube.com/loaders.php).

## Install the Aerospike extension

1. In `.env`, set both flags to `true`:
   - `WORKSPACE_INSTALL_AEROSPIKE`
   - `PHP_FPM_INSTALL_AEROSPIKE`
2. Rebuild:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock rebuild workspace php-fpm
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose build workspace php-fpm
```

</TabItem>
</Tabs>

## Install the Calendar extension

1. In `.env`, set `PHP_FPM_INSTALL_CALENDAR` to `true`.
2. Rebuild:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock rebuild php-fpm
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose build php-fpm
```

</TabItem>
</Tabs>

## Install libfaketime

Libfaketime lets you control the date and time the OS reports, set via the `PHP_FPM_FAKETIME` variable. For example, `PHP_FPM_FAKETIME=-1d` moves the clock back one day. See [libfaketime](https://github.com/wolfcw/libfaketime) for the syntax.

1. In `.env`, set `PHP_FPM_INSTALL_FAKETIME` to `true`.
2. Set `PHP_FPM_FAKETIME` to your desired offset.
3. Rebuild:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock rebuild php-fpm
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose build php-fpm
```

</TabItem>
</Tabs>

## Install the YAML extension

Parse and emit YAML from PHP. See the [PHP YAML reference](http://php.net/manual/en/ref.yaml.php).

1. In `.env`, set `PHP_FPM_INSTALL_YAML` to `true`.
2. Rebuild:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock rebuild php-fpm
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose build php-fpm
```

</TabItem>
</Tabs>

## Install the rdkafka extension

1. In `.env`, set `PHP_FPM_INSTALL_RDKAFKA` to `true`.
2. Rebuild:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock rebuild php-fpm
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose build php-fpm
```

</TabItem>
</Tabs>

Composer installs that require Kafka run from the Workspace container instead, see [Install the rdkafka extension](/docs/services/workspace#install-the-rdkafka-extension) on the Workspace guide.

## Install the Decimal extension

The [Decimal extension](https://php-decimal.io) adds correctly-rounded, arbitrary-precision decimal arithmetic, useful for money, measurements, and anything where float rounding is unacceptable.

1. In `.env`, set both flags to `true`:
   - `WORKSPACE_INSTALL_PHPDECIMAL`
   - `PHP_FPM_INSTALL_PHPDECIMAL`
2. Rebuild:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock rebuild workspace php-fpm
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose build workspace php-fpm
```

</TabItem>
</Tabs>

## Common issues

- **Enabled an extension but it's not loaded.** `PHP_FPM_INSTALL_*` flags only take effect on build: `./laradock rebuild php-fpm` then `./laradock start php-fpm`.
- **502 Bad Gateway from your web server.** Confirm `php-fpm` is actually running (`docker compose ps php-fpm`) and that the web server's upstream config points at the right container/port (`php-fpm:9000` by default, container-internal, not published to the host).
- **Xdebug and Blackfire both enabled, neither works.** They can't coexist in the same PHP process, the build skips the Blackfire probe when `PHP_FPM_INSTALL_XDEBUG=true`.
- **File permission mismatches on Linux.** Set `PHP_FPM_PUID`/`PHP_FPM_PGID` to your host user's `id -u`/`id -g`, then rebuild.
- **"PHP Fatal error: Allowed memory size exhausted" or uploads silently failing.** Bump `memory_limit`/`upload_max_filesize`/`post_max_size`, see [Tune PHP settings](#tune-php-settings-memory-limit-upload-size-timeouts) above.

---

Need the container you actually work inside (Composer, Artisan, Git)? See the **[Workspace guide](/docs/services/workspace)**. New to Laradock? Start at **[Getting Started](/docs/getting-started)**.
