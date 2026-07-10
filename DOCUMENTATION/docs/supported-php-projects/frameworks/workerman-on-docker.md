---
slug: /workerman-on-docker
title: Run Workerman on Docker
description: Run a Workerman server on Docker in minutes with Laradock. What Docker gives a Workerman app, why Laradock's supervisord-based worker container is a natural fit, and the exact commands, without installing anything on your machine.
keywords:
  - workerman on docker
  - run workerman on docker
  - workerman php docker
  - workerman docker setup
  - dockerize workerman
  - workerman socket server docker
  - workerman nginx docker
---

## What is Workerman?

[Workerman](https://www.workerman.net) is a pure-PHP, event-driven library for building long-running TCP, HTTP and WebSocket servers, no C extension required (though it can use `ext-event` for higher throughput). Like Swoole, a Workerman app is not served by NGINX and PHP-FPM; it forks its own worker processes and listens on a port itself, staying alive between requests instead of bootstrapping PHP fresh on every one. It is the base of frameworks like Webman and GatewayWorker. Workerman needs the `pcntl` extension to fork multiple worker processes on Linux; beyond that, a database or Redis is only needed if the app built on top of it uses one.

## Why run Workerman in Docker?

Docker packages the PHP runtime and the extensions Workerman needs into an isolated container that runs the same on every machine. Instead of installing `pcntl` and the right PHP version onto your laptop, where it can conflict with whatever else needs that PHP version, you run a disposable container that mirrors production and vanishes cleanly when you delete it. A process that is meant to stay running and restart on crash also wants a supervisor around it, which is another piece to wire up by hand.

The catch: getting the extensions right and keeping the process alive and restarting is a week of fiddly Docker work. That is exactly what Laradock removes.

## Why Laradock is the best fit for Workerman

Workerman has no official Docker image or first-party dev environment of its own, so a ready-made, no-lock-in setup matters even more. Here is why Laradock is the best fit:

- **You are never locked into one ecosystem.** Laradock is framework-agnostic. Run your Workerman server today, and put a Laravel API or a plain PHP script beside it tomorrow, all in the same environment with the same commands.
- **Far more flexibility.** 100+ ready services and any PHP version from 5.6 to 8.5, so an older Workerman 4.x app and a modern Workerman 5.x app (which requires PHP 8.1+) each get exactly the runtime they need.
- **Nothing is hidden and you own everything.** No generated files, no magic, no wrapper binary between you and Docker. Every Dockerfile and compose file is right there for you to read and edit.
- **Nothing new to learn.** What you use is plain `docker compose`, knowledge that transfers straight to production. Our [CLI](/docs/cli) is an optional nicety, never a requirement.

For Workerman specifically, Laradock's `php-worker` container already compiles `pcntl` in by default and runs `supervisord`, which is exactly the "keep this process alive and restart it on crash" job a Workerman server needs; the `workspace` container gives you Composer and git for development.

## Run Workerman on Docker with Laradock

### 1. Add Laradock to your project

```bash
cd my-workerman-app
git clone https://github.com/laradock/laradock.git
cd laradock && cp .env.example .env
```

### 2. Pick the services your app needs

For development, the `workspace` container is enough; add a database only if your app uses one:

```bash
docker compose up -d workspace mysql
```

The full catalog is [here](/docs/Intro#supported-services).

### 3. Bind the server to the container, not localhost

Inside a container, a Workerman server must bind to `0.0.0.0`, not `127.0.0.1`, or nothing outside the container can reach it:

```php
use Workerman\Worker;

$worker = new Worker('http://0.0.0.0:8080');
$worker->onMessage = function ($connection, $request) {
    $connection->send('Hello from Workerman');
};
Worker::runAll();
```

To reach it from your host, add a port mapping for the container running it, or reverse-proxy through NGINX (adapt `nginx/sites/octane.conf.example`, which already proxies to a long-running PHP process the same way).

### 4. Run the server

```bash
docker compose exec workspace bash
composer require workerman/workerman
php start.php start
```

`php start.php start` runs in the foreground for development. For a persistent, auto-restarting service, run it from the `php-worker` container instead: drop a `.conf` file into `php-worker/supervisord.d/` with `command=php /var/www/start.php start`, and `supervisord` keeps it running.

## Change the PHP version anytime

Set the version in Laradock's `.env` and rebuild:

```env
PHP_VERSION=8.2
```

```bash
docker compose build workspace php-worker
```

Current Workerman releases require PHP 8.1 or newer; older Workerman 4.x apps run on PHP 5.4 and up. Laradock covers PHP 5.6 all the way to 8.5, so an old and a new Workerman app can run side by side, each isolated, none of it installed on your machine.

## Frequently Asked Questions

### Do I need PHP-FPM or NGINX to run Workerman?

No, not for Workerman itself. It replaces PHP-FPM with its own long-running process. NGINX is optional, useful only as a reverse proxy or for static files.

### Do I need to install PHP or pcntl to run Workerman with Laradock?

No. The `php-worker` container already compiles `pcntl` in; if you develop from `workspace` instead, install the extensions your app needs through Laradock's `.env` build flags. You never install PHP on your host.

### Which container should actually run the Workerman server?

`workspace` is fine for development. For something that should stay up and restart on crash, use `php-worker`, which runs `supervisord` and is built for exactly this kind of long-lived process.

### Can I run a Workerman app and a normal PHP-FPM app on different PHP versions at once?

Yes. Give each its own Laradock with a unique `COMPOSE_PROJECT_NAME` and `DATA_PATH_HOST`, set a different `PHP_VERSION` in each, and they run independently on the same machine.

### Does this work the same on macOS, Windows and Linux?

Yes. Laradock runs anywhere Docker runs. On macOS/Windows, file-sync speed depends on Docker Desktop; it is a Docker Desktop trait, not specific to Laradock.

---

Comparing environments? See the full **[Laradock vs Others](/docs/laradock-alternatives)** breakdown. Ready to start? **[Getting Started](/docs/getting-started)** takes about five minutes.
