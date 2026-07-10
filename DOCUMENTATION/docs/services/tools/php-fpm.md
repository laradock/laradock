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

## What is PHP-FPM?

[PHP-FPM](https://www.php.net/manual/en/install.fpm.php) (FastCGI Process Manager) is the process manager that runs your PHP application code and talks FastCGI to a web server. In Laradock, `php-fpm` is the container that actually executes your app, `nginx`/`apache` proxy requests to it rather than running PHP themselves.

This page covers the container itself: how it's started, what it reads from `.env`, how other services depend on it, and how to switch PHP versions and install extensions and debuggers.

## Start PHP-FPM

```bash
docker compose up -d php-fpm
```

Web servers depend on `php-fpm` to serve dynamic requests, so bring it up alongside one:

```bash
docker compose up -d nginx php-fpm mysql
```

`php-fpm` itself `depends_on: workspace` in `compose.yml`, both containers build from the same PHP version and share build logic.

## Stop PHP-FPM

```bash
docker compose stop php-fpm
```

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

```bash
docker compose build php-fpm
docker compose up -d php-fpm
```

A few other notable variables: `PHP_FPM_PUID`/`PHP_FPM_PGID` (default `1000`/`1000`, match the `www-data` user's UID/GID to your host user), `PHP_FPM_DEFAULT_LOCALE` (default `POSIX`), and `PHP_FPM_BASE_IMAGE_TAG_PREFIX` (default `latest`, the [`laradock/php-fpm`](https://hub.docker.com/r/laradock/php-fpm/tags/) base image tag prefix).

## Change the PHP-FPM version

By default the latest stable PHP version runs. PHP-FPM serves your application code.

1. In `.env`, set `PHP_VERSION` to the version you want (any from `5.6` to `8.5`):
   ```dotenv
   PHP_VERSION=8.1
   ```
2. Rebuild the image:
   ```bash
   docker compose build php-fpm
   ```

> For details on the underlying base image, see the [official PHP Docker images](https://hub.docker.com/_/php/).

## Install PHP extensions

PHP extensions are toggled per container. Each PHP container lists a flag for every extension in its `defaults.env`: `php-fpm/defaults.env`, `workspace/defaults.env`, and `php-worker/defaults.env`.

1. Find the extension's flag in the relevant container's `defaults.env`, then set it to `true` in your `.env` (for example `PHP_FPM_INSTALL_GMP=true`).
2. Rebuild that container with `--no-cache`:
   ```bash
   docker compose build --no-cache {container-name}
   ```

The sections below cover the debuggers and the individual extensions Laradock ships with.

## Install Xdebug

1. In `.env`, set both flags to `true`:
   - `WORKSPACE_INSTALL_XDEBUG`
   - `PHP_FPM_INSTALL_XDEBUG`
2. Rebuild:
   ```bash
   docker compose build workspace php-fpm
   ```

To configure Xdebug with your IDE, see this [Laravel + Laradock + PhpStorm guide](https://github.com/LarryEitel/laravel-laradock-phpstorm).

## Start or stop Xdebug

Once installed, Xdebug runs on startup by default. Control it in the `php-fpm` container by running these from the Laradock root:

- Stop it starting by default: `.php-fpm/xdebug stop`
- Start it: `.php-fpm/xdebug start`
- Check status: `.php-fpm/xdebug status`

> If `.php-fpm/xdebug` reports `Permission Denied`, give it execute access with `chmod`.

## Install pcov

A fast code-coverage driver for PHP 7.1+.

1. In `.env`, set both flags to `true`:
   - `WORKSPACE_INSTALL_PCOV`
   - `PHP_FPM_INSTALL_PCOV`
2. Rebuild:
   ```bash
   docker compose build workspace php-fpm
   ```

For tuning tips, see the [pcov README](https://github.com/krakjoe/pcov).

## Install phpdbg

The interactive PHP debugger.

1. In `.env`, set both flags to `true`:
   - `WORKSPACE_INSTALL_PHPDBG`
   - `PHP_FPM_INSTALL_PHPDBG`
2. Rebuild:
   ```bash
   docker compose build workspace php-fpm
   ```

## Install ionCube Loader

1. In `.env`, set both flags to `true`:
   - `WORKSPACE_INSTALL_IONCUBE`
   - `PHP_FPM_INSTALL_IONCUBE`
2. Rebuild:
   ```bash
   docker compose build workspace php-fpm
   ```

The latest loaders are always downloaded from [ionCube](http://www.ioncube.com/loaders.php).

## Install the Aerospike extension

1. In `.env`, set both flags to `true`:
   - `WORKSPACE_INSTALL_AEROSPIKE`
   - `PHP_FPM_INSTALL_AEROSPIKE`
2. Rebuild:
   ```bash
   docker compose build workspace php-fpm
   ```

## Install the Calendar extension

1. In `.env`, set `PHP_FPM_INSTALL_CALENDAR` to `true`.
2. Rebuild:
   ```bash
   docker compose build php-fpm
   ```

## Install libfaketime

Libfaketime lets you control the date and time the OS reports, set via the `PHP_FPM_FAKETIME` variable. For example, `PHP_FPM_FAKETIME=-1d` moves the clock back one day. See [libfaketime](https://github.com/wolfcw/libfaketime) for the syntax.

1. In `.env`, set `PHP_FPM_INSTALL_FAKETIME` to `true`.
2. Set `PHP_FPM_FAKETIME` to your desired offset.
3. Rebuild:
   ```bash
   docker compose build php-fpm
   ```

## Install the YAML extension

Parse and emit YAML from PHP. See the [PHP YAML reference](http://php.net/manual/en/ref.yaml.php).

1. In `.env`, set `PHP_FPM_INSTALL_YAML` to `true`.
2. Rebuild:
   ```bash
   docker compose build php-fpm
   ```

## Install the rdkafka extension

1. In `.env`, set `PHP_FPM_INSTALL_RDKAFKA` to `true`.
2. Rebuild:
   ```bash
   docker compose build php-fpm
   ```

Composer installs that require Kafka run from the Workspace container instead, see [Install the rdkafka extension](/docs/services/workspace#install-the-rdkafka-extension) on the Workspace guide.

## Install the Decimal extension

The [Decimal extension](https://php-decimal.io) adds correctly-rounded, arbitrary-precision decimal arithmetic, useful for money, measurements, and anything where float rounding is unacceptable.

1. In `.env`, set both flags to `true`:
   - `WORKSPACE_INSTALL_PHPDECIMAL`
   - `PHP_FPM_INSTALL_PHPDECIMAL`
2. Rebuild:
   ```bash
   docker compose build workspace php-fpm
   ```

## Common issues

- **Enabled an extension but it's not loaded.** `PHP_FPM_INSTALL_*` flags only take effect on build: `docker compose build php-fpm && docker compose up -d php-fpm`.
- **502 Bad Gateway from your web server.** Confirm `php-fpm` is actually running (`docker compose ps php-fpm`) and that the web server's upstream config points at the right container/port (`php-fpm:9000` by default, container-internal, not published to the host).
- **Xdebug and Blackfire both enabled, neither works.** They can't coexist in the same PHP process, the build skips the Blackfire probe when `PHP_FPM_INSTALL_XDEBUG=true`.
- **File permission mismatches on Linux.** Set `PHP_FPM_PUID`/`PHP_FPM_PGID` to your host user's `id -u`/`id -g`, then rebuild.

---

Need the container you actually work inside (Composer, Artisan, Git)? See the **[Workspace guide](/docs/services/workspace)**. New to Laradock? Start at **[Getting Started](/docs/getting-started)**.
