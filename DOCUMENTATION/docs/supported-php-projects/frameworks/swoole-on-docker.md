---
slug: /swoole-on-docker
title: Run Swoole on Docker
description: Run a Swoole coroutine server on Docker in minutes with Laradock. What Docker gives a Swoole app, why Laradock picks the right Swoole build for your PHP version automatically, and the exact commands, without installing anything on your machine.
keywords:
  - swoole on docker
  - run swoole on docker
  - swoole php docker
  - swoole docker setup
  - dockerize swoole
  - swoole coroutine server docker
  - swoole nginx docker
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

## What is Swoole?

[Swoole](https://www.swoole.com) is a C extension that gives PHP asynchronous I/O, coroutines, and built-in TCP/UDP/HTTP/WebSocket server classes. Unlike a traditional PHP framework, a Swoole app is not served by NGINX and PHP-FPM; it is its own long-running process that opens a socket and listens on a port itself, handling many requests concurrently inside one PHP process. Frameworks like Hyperf and Swoft, and tools like Laravel Octane, are all built on top of it. Swoole itself needs nothing but the extension and a PHP runtime; a database or Redis is only needed if the app you build on top of it uses one.

## Why run Swoole in Docker?

Docker packages the PHP runtime with the exact Swoole build it needs into an isolated container that runs the same on every machine. Swoole's C extension is compiled against a specific PHP version, so matching versions correctly is normally a manual, fiddly step; a container that already has the right combination baked in removes that entirely. Instead of compiling the extension on your laptop, where it can conflict with whatever else needs that PHP version, you run a disposable container that mirrors production and vanishes cleanly when you delete it.

The catch: getting the PHP version and the Swoole build to actually match, plus wiring up networking so you can reach the port from your host, is a week of fiddly Docker work. That is exactly what Laradock removes.

## Why Laradock is the best fit for Swoole

There is an official `phpswoole/swoole` Docker image from the Swoole team, but it is a bare runtime, not a development environment with a database, a shell, or any of the other services a real app needs. Here is why Laradock is the best fit:

- **You are never locked into one ecosystem.** Laradock is framework-agnostic. Run your Swoole server today, and put a Laravel API or a plain PHP script beside it tomorrow, all in the same environment with the same commands.
- **Far more flexibility.** 100+ ready services and any PHP version from 5.6 to 8.5, with Laradock automatically installing a Swoole release known to work with the PHP version you pick, from `swoole-2.0.10` for PHP 5.6 up through the current release for PHP 8.1+.
- **Nothing is hidden and you own everything.** No generated files, no magic, no wrapper binary between you and Docker. Every Dockerfile and compose file is right there for you to read and edit.
- **Nothing new to learn.** What you use is plain `docker compose`, knowledge that transfers straight to production. Our [CLI](/docs/cli) is an optional nicety, never a requirement.

For Swoole specifically, Laradock gives you the extension pre-matched to your PHP version in the `workspace` and `php-worker` containers, a ready-to-adapt NGINX reverse-proxy config (`nginx/sites/octane.conf.example` proxies to a long-running app the same way a Swoole server needs), and Composer and git in the `workspace` container.

## Run Swoole on Docker with Laradock

### 1. Add Laradock to your project

```bash
cd my-swoole-app
git clone https://github.com/laradock/laradock.git
cd laradock && cp .env.example .env
```

### 2. Enable the Swoole extension

Set the install flag before building, for whichever container you'll run the server from:

```env
WORKSPACE_INSTALL_SWOOLE=true
```

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock start workspace
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose up -d workspace
```

</TabItem>
</Tabs>

Need MySQL or Redis for the app built on top of Swoole? Add them the same way as any other project: `./laradock start mysql redis` (or `docker compose up -d mysql redis`). The full catalog is [here](/docs/Intro#supported-services).

### 3. Bind the server to the container, not localhost

Inside a container, a Swoole server must bind to `0.0.0.0`, not `127.0.0.1`, or nothing outside the container can reach it:

```php
$server = new Swoole\Http\Server("0.0.0.0", 9501);
$server->on("request", function ($request, $response) {
    $response->end("Hello from Swoole\n");
});
$server->start();
```

To reach it from your host, add a port mapping for the container running it, or reverse-proxy through NGINX the way `nginx/sites/octane.conf.example` already does for a long-running PHP process on the `workspace` container.

### 4. Run the server from the workspace

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock workspace
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose exec workspace bash
```

</TabItem>
</Tabs>

```bash
php -m | grep swoole   # confirms the extension loaded
php server.php
```

That process keeps running in the foreground; for a persistent, auto-restarting service, run it from the `php-worker` container instead, which already runs `supervisord` for exactly this job (drop a `.conf` file into `php-worker/supervisord.d/`).

## Change the PHP version anytime

This is where a native install hurts and Laradock shines, especially for an extension as version-sensitive as Swoole. Set the version in Laradock's `.env` and rebuild:

```env
PHP_VERSION=8.3
```

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock rebuild php-fpm workspace
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose build php-fpm workspace
```

</TabItem>
</Tabs>

Laradock re-resolves the matching Swoole release for the PHP version you pick, so you are never stuck manually hunting for a compatible build. Modern Swoole features (fibers, full coroutine support) want PHP 8.1 or newer; older apps can still run on the 4.x branch back to PHP 7.x.

## Frequently Asked Questions

### Do I need PHP-FPM or NGINX to run Swoole?

No, not for Swoole itself. It replaces PHP-FPM with its own long-running server process. NGINX is optional, useful only if you want it in front as a reverse proxy or static file server.

### Do I need to install PHP or the Swoole extension to use Laradock?

No. Set `WORKSPACE_INSTALL_SWOOLE=true` (or `PHP_WORKER_INSTALL_SWOOLE=true`) in `.env`, rebuild, and the extension is compiled inside the container; nothing is installed on your host.

### Which container should actually run the Swoole server?

The `workspace` container works fine for development. For something that should stay up and restart on crash, use `php-worker`, which runs `supervisord` and is built for exactly this kind of long-lived process.

### Can I run a Swoole app and a normal PHP-FPM app on different PHP versions at once?

Yes. Give each its own Laradock with a unique `COMPOSE_PROJECT_NAME` and `DATA_PATH_HOST`, set a different `PHP_VERSION` in each, and they run independently on the same machine.

### Does this work the same on macOS, Windows and Linux?

Yes. Laradock runs anywhere Docker runs. On macOS/Windows, file-sync speed depends on Docker Desktop; it is a Docker Desktop trait, not specific to Laradock.

---

Comparing environments? See the full **[Laradock vs Others](/docs/laradock-alternatives)** breakdown. Ready to start? **[Getting Started](/docs/getting-started)** takes about five minutes.
