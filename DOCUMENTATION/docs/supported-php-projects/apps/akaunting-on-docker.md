---
slug: /akaunting-on-docker
title: Run Akaunting on Docker
description: Run Akaunting on Docker in minutes with Laradock. What Docker gives an Akaunting instance, why Laradock is the fastest way to get NGINX, PHP, MySQL and Redis running, and the exact commands, with any PHP version, without installing anything on your machine.
keywords:
  - akaunting on docker
  - run akaunting on docker
  - akaunting docker
  - akaunting docker setup
  - dockerize akaunting
  - akaunting docker environment
  - akaunting nginx mysql docker
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

## What is Akaunting?

[Akaunting](https://akaunting.com) is an open source online accounting platform for invoicing, expense tracking and double-entry bookkeeping, built on Laravel with a modular "apps" system for extending it. An Akaunting instance is a PHP application backed by MySQL, MariaDB, PostgreSQL or SQLite, served through a web server, with Artisan handling installation, migrations and sample data.

## Why run Akaunting in Docker?

Docker packages each of those pieces (NGINX, PHP-FPM, MySQL, Redis) into isolated containers that run the same on every machine. Instead of installing PHP and MySQL onto your laptop, where versions collide between projects and "works on my machine" starts, you run disposable containers that mirror production and vanish cleanly when you delete them. One Akaunting instance can run PHP 8.3 while another project runs an older version, on the same computer, with nothing installed globally.

The catch: wiring those containers together yourself (base images, PHP extensions, networking, permissions) is a week of fiddly Docker work. That is exactly what Laradock removes.

## Why Laradock is the best fit for Akaunting

Akaunting has no official Docker image maintained by the core project; self-hosters typically build their own image or use a community one. Here is why Laradock is the best fit:

- **You are never locked into one ecosystem.** Laradock is framework-agnostic. Run Akaunting today, add a WordPress site or a plain Laravel API beside it tomorrow, all in the same environment with the same commands.
- **Far more flexibility.** 100+ ready services and any PHP version from 5.6 to 8.5, so Akaunting gets exactly the runtime its current release needs.
- **Nothing is hidden and you own everything.** No generated files, no magic, no wrapper binary between you and Docker. Every Dockerfile and compose file is right there for you to read and edit, useful when you add or build a custom Akaunting app/module.
- **Nothing new to learn.** What you use is plain `docker compose`, knowledge that transfers straight to production and to every other Laravel-based project. Our [CLI](/docs/cli) is an optional nicety, never a requirement.

Concretely, for Akaunting it gives you a production-style NGINX + PHP-FPM stack, MySQL/MariaDB/PostgreSQL ready to connect (and Redis one command away when you want caching), and a `workspace` container with Composer, Node, npm and Artisan already installed.

## Run Akaunting on Docker with Laradock

### 1. Add Laradock to your project

```bash
cd my-akaunting-instance
git clone https://github.com/laradock/laradock.git
cd laradock
```

(No Akaunting codebase yet? Clone Laradock first, then pull one down from the workspace container in the next steps.)

### 2. Pick the services your instance needs

Akaunting needs exactly two things: a **web server** and a **database**. The web server pulls in PHP-FPM automatically, so this is the whole required stack:

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

Prefer PostgreSQL instead? Swap the name: `./laradock start nginx postgres workspace` (or `docker compose up -d nginx postgres workspace`). The full catalog is [here](/docs/Intro#supported-services).

Redis is not required to boot Akaunting; it defaults to file-based cache. Add it later for a speed-up: see [Add Redis caching](#add-redis-caching-optional) below.

Prefer to be asked? The optional [CLI](/docs/cli) walks you through the choices: `./laradock setup`, then `./laradock start`. It prints every real command it runs.

### 3. Point Akaunting at the containers

In Akaunting's `.env`, use the service names as hostnames:

```env
DB_HOST=mysql
```

The default database, user and password live in Laradock's `mysql/defaults.env`; override any of them by adding the line to Laradock's `.env` (it always wins).

### 4. Install and run your instance

Enter the `workspace` container, where Composer, Node, npm and Artisan live, and run Akaunting's CLI installer:

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
composer install
php artisan install --db-name="default" --db-username="default" --db-password="secret" \
  --admin-email="you@example.com" --admin-password="secret"
```

Add `php artisan sample-data:seed` afterwards if you want demo data. Then open [http://localhost](http://localhost). That is a full Akaunting instance running on Docker.

## Add Redis caching (optional)

Redis is not required, but because Akaunting is a Laravel app it can use Redis for cache and sessions with no plugin, just config. Two steps:

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

2. Point Akaunting at it in its `.env` (the service name is the host):

```env
CACHE_DRIVER=redis
SESSION_DRIVER=redis
REDIS_HOST=redis
```

That is it. Without those lines the Redis container just sits idle, which is why the required stack above leaves it out.

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

Akaunting requires PHP 8.1 or newer; Laradock covers anything from PHP 5.6 to 8.5, so the same tool runs an older Akaunting instance you have not upgraded yet and a brand-new one side by side, each isolated, none of it installed on your machine.

## Take your instance live

When your Akaunting instance is ready, the same Laradock stack becomes your deployment. You build one hardened image of your app and ship it to the host of your choice:

```bash
./laradock ship
```

Then pick a target and follow its short guide, a single server, a managed platform, or Kubernetes: **[Deploy to Production](/docs/production)** lists every provider (Fly.io, Render, Railway, DigitalOcean, AWS, Google Cloud, Azure, Kamal, Kubernetes) with a ready config file for each. There is no per-provider magic to learn; a Docker image runs the same everywhere.

## Frequently Asked Questions

### Do I need to install PHP or Composer to run Akaunting with Laradock?

No. Everything lives inside the containers. Composer, Node, npm and Artisan are all in the `workspace` container; you never install PHP on your host.

### Which services should I start for a typical Akaunting instance?

`nginx mysql workspace` is all Akaunting requires: web server, database, and a shell. Swap `mysql` for `postgres` if you prefer. Add `redis` only when you want caching, see [Add Redis caching](#add-redis-caching-optional).

### Can I run multiple Akaunting instances on different PHP versions?

Yes. Give each its own Laradock with a unique `COMPOSE_PROJECT_NAME` and `DATA_PATH_HOST`, set a different `PHP_VERSION` in each, and they run independently on the same machine.

### Does this work the same on macOS, Windows and Linux?

Yes. Laradock runs anywhere Docker runs. On macOS/Windows, file-sync speed depends on Docker Desktop (VirtioFS helps a lot for `vendor/`-heavy apps); it is a Docker Desktop trait, not specific to Laradock.

### Is this the same Docker setup I would use in production?

The containers are production-style (real NGINX + PHP-FPM), so it is far closer to production than a native install. See [Prepare Laradock for Production](/docs/production#prepare-laradock-for-production) for the hardening steps.

---

Comparing environments? See the full **[Laradock vs Others](/docs/laradock-alternatives)** breakdown. Ready to start? **[Getting Started](/docs/getting-started)** takes about five minutes.
