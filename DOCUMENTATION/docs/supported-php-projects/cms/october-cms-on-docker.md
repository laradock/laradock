---
slug: /october-cms-on-docker
title: Run October CMS on Docker
description: Run October CMS on Docker in minutes with Laradock. What Docker gives an October CMS site, why Laradock is the fastest way to get NGINX, PHP, MySQL and Redis running, and the exact commands, with any PHP version, without installing anything on your machine.
keywords:
  - october cms on docker
  - run october cms on docker
  - october cms docker
  - october cms docker setup
  - dockerize october cms
  - october cms docker environment
  - october cms nginx mysql docker
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

## What is October CMS?

[October CMS](https://octobercms.com) is a self-hosted CMS built on top of the Laravel framework, aimed at developers who want a plugin-driven, drag-and-drop page builder without giving up Laravel's tooling underneath. An October CMS site is a PHP application that needs a web server, a PHP runtime, and a database (MySQL, MariaDB, PostgreSQL or SQLite are all supported), and it benefits from Redis for cache and queues on busier sites.

## Why run October CMS in Docker?

Docker packages each of those pieces (NGINX, PHP-FPM, MySQL, Redis) into isolated containers that run the same on every machine. Instead of installing PHP and MySQL onto your laptop, where versions collide between sites and "works on my machine" starts, you run disposable containers that mirror production and vanish cleanly when you delete them. One site can run PHP 8.3 while another October 2.x site pins to 8.0, on the same computer, with nothing installed globally.

The catch: wiring those containers together yourself (base images, PHP extensions, networking, permissions) is a week of fiddly Docker work. That is exactly what Laradock removes.

## Why Laradock is the best fit for October CMS

October CMS has no official Docker tool of its own, so a ready-made, no-lock-in environment matters even more. Here is why Laradock is the best fit:

- **You are never locked into one ecosystem.** Laradock is framework-agnostic. Run October CMS today, add a plain Laravel API, a WordPress site, or a Symfony service beside it tomorrow, all in the same environment with the same commands.
- **Far more flexibility.** 100+ ready services and any PHP version from 5.6 to 8.5, so an older October 2.x site and a current October 4.x site each get exactly the runtime they need.
- **Nothing is hidden and you own everything.** No generated files, no magic, no wrapper binary between you and Docker. Every Dockerfile and compose file is right there for you to read and edit.
- **Nothing new to learn.** What you use is plain `docker compose`, knowledge that transfers straight to production. Our [CLI](/docs/cli) is an optional nicety, never a requirement.

Concretely, for October CMS it gives you a production-style NGINX + PHP-FPM stack, MySQL/PostgreSQL ready to connect (and Redis one command away when you want cache and queues), and a `workspace` container with Composer, Node, npm and git installed, so `php artisan` commands work exactly like they would in any Laravel app.

## Run October CMS on Docker with Laradock

### 1. Add Laradock to your project

```bash
cd my-october-site
git clone https://github.com/laradock/laradock.git
cd laradock
```

(No October CMS project yet? Clone Laradock first, then create one from the workspace container in the next steps.)

### 2. Pick the services your site needs

October CMS needs a web server and a database. Start exactly those (the web server pulls in PHP-FPM automatically):

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock start nginx mysql workspace
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
cp .env.example .env
docker compose up -d nginx mysql workspace
```

</TabItem>
</Tabs>

Prefer PostgreSQL? Swap the name: `./laradock start nginx postgres workspace` (or `docker compose up -d nginx postgres workspace`). The full catalog is [here](/docs/Intro#supported-services).

Prefer to be asked? The optional [CLI](/docs/cli) walks you through the choices: `./laradock setup`, then `./laradock start`. It prints every real command it runs.

> **Do I need Redis?** Not to get running. Out of the box October CMS uses file-based cache and a synchronous queue, so a fresh site runs perfectly on `nginx mysql workspace`. Redis only helps once you switch the cache and queue drivers to it. See [Add Redis for cache and queues](#add-redis-for-cache-and-queues-optional) below when you actually want it.

### 3. Point October CMS at the containers

In your project's `.env`, use the service name as the database host:

```env
DB_HOST=mysql
```

The default database, user and password live in Laradock's `mysql/defaults.env`; override any of them by adding the line to Laradock's `.env` (it always wins).

### 4. Install and run your site

Enter the `workspace` container, where Composer, Node and git live, and run the installer:

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
composer create-project october/october my-october-site   # only if you have no project yet
php artisan october:install
```

`october:install` walks you through the database connection, application URL and admin account. Then open [http://localhost](http://localhost). That is a full October CMS site running on Docker.

## Add Redis for cache and queues (optional)

Redis is not required, but on a busier site it is a fast in-memory store for October's cache and queued jobs. Wiring it up is two steps:

1. Start the Redis container alongside the rest:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock start redis
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose up -d redis
```

</TabItem>
</Tabs>

2. Point October at it in your project's `.env`, using the service name as the host and switching the drivers over:

```env
REDIS_HOST=redis
CACHE_STORE=redis
QUEUE_CONNECTION=redis
```

October CMS is Laravel underneath, so the Redis client is already built in; no extension or plugin to install. Until you set those driver lines the Redis container just sits idle, which is why the required stack above leaves it out.

## Change the PHP version anytime

This is where a native install hurts and Laradock shines. Set the version in Laradock's `.env` and rebuild:

```env
PHP_VERSION=8.2
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

October CMS v4 requires PHP 8.2 or newer, and v3 supports PHP 8.0.3 and up; Laradock covers anything from PHP 5.6 to 8.5, so the same tool runs an older v2 site and a current v4 site side by side, each isolated, none of it installed on your machine.

## Take your site live

When your site is ready, the same Laradock stack becomes your deployment. You build one hardened image of your app and ship it to the host of your choice:

```bash
./laradock ship
```

Then pick a target and follow its short guide, a single server, a managed platform, or Kubernetes: **[Deploy to Production](/docs/production)** lists every provider (Fly.io, Render, Railway, DigitalOcean, AWS, Google Cloud, Azure, Kamal, Kubernetes) with a ready config file for each. There is no per-provider magic to learn; a Docker image runs the same everywhere.

## Frequently Asked Questions

### Do I need to install PHP or Composer to run October CMS with Laradock?

No. Everything lives inside the containers. Composer, Node, npm and git are all in the `workspace` container; you never install PHP on your host.

### Which services should I start for a typical October CMS site?

`nginx mysql workspace` is all October CMS requires: web server, database, and a shell. Swap `mysql` for `postgres` if you prefer. Add `redis` only when you switch the cache and queue drivers to it (see [Add Redis for cache and queues](#add-redis-for-cache-and-queues-optional)); a fresh site uses file cache and runs fine without it.

### Can I run multiple October CMS sites on different PHP versions?

Yes. Give each its own Laradock with a unique `COMPOSE_PROJECT_NAME` and `DATA_PATH_HOST`, set a different `PHP_VERSION` in each, and they run independently on the same machine.

### Does this work the same on macOS, Windows and Linux?

Yes. Laradock runs anywhere Docker runs. On macOS/Windows, file-sync speed depends on Docker Desktop (VirtioFS helps a lot for `vendor/`-heavy sites); it is a Docker Desktop trait, not specific to Laradock.

### Is this the same Docker setup I would use in production?

The containers are production-style (real NGINX + PHP-FPM), so it is far closer to production than `artisan serve` or a native install. See [Prepare Laradock for Production](/docs/production#prepare-laradock-for-production) for the hardening steps.

---

Comparing environments? See the full **[Laradock vs Others](/docs/laradock-alternatives)** breakdown. Ready to start? **[Getting Started](/docs/getting-started)** takes about five minutes.
