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

Concretely, for October CMS it gives you a production-style NGINX + PHP-FPM stack, MySQL/PostgreSQL and Redis already wired, and a `workspace` container with Composer, Node, npm and git installed, so `php artisan` commands work exactly like they would in any Laravel app.

## Run October CMS on Docker with Laradock

### 1. Add Laradock to your project

```bash
cd my-october-site
git clone https://github.com/laradock/laradock.git
cd laradock && cp .env.example .env
```

(No October CMS project yet? Clone Laradock first, then create one from the workspace container in the next steps.)

### 2. Pick the services your site needs

Most October CMS sites need a web server, a database, and Redis for cache and queues. Start exactly those (the web server pulls in PHP-FPM automatically):

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock start nginx mysql redis workspace
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose up -d nginx mysql redis workspace
```

</TabItem>
</Tabs>

Prefer PostgreSQL? Swap the name: `./laradock start nginx postgres redis workspace` (or `docker compose up -d nginx postgres redis workspace`). The full catalog is [here](/docs/Intro#supported-services).

Prefer to be asked? The optional [CLI](/docs/cli) walks you through the choices: `./laradock setup`, then `./laradock up`. It prints every real command it runs.

### 3. Point October CMS at the containers

In your project's `.env`, use the service names as hostnames:

```env
DB_HOST=mysql
REDIS_HOST=redis
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

## Frequently Asked Questions

### Do I need to install PHP or Composer to run October CMS with Laradock?

No. Everything lives inside the containers. Composer, Node, npm and git are all in the `workspace` container; you never install PHP on your host.

### Which services should I start for a typical October CMS site?

`nginx mysql redis workspace` covers most sites: web server, database, cache/queues, and a shell. Swap `mysql` for `postgres` if you prefer.

### Can I run multiple October CMS sites on different PHP versions?

Yes. Give each its own Laradock with a unique `COMPOSE_PROJECT_NAME` and `DATA_PATH_HOST`, set a different `PHP_VERSION` in each, and they run independently on the same machine.

### Does this work the same on macOS, Windows and Linux?

Yes. Laradock runs anywhere Docker runs. On macOS/Windows, file-sync speed depends on Docker Desktop (VirtioFS helps a lot for `vendor/`-heavy sites); it is a Docker Desktop trait, not specific to Laradock.

### Is this the same Docker setup I would use in production?

The containers are production-style (real NGINX + PHP-FPM), so it is far closer to production than `artisan serve` or a native install. See [Prepare Laradock for Production](/docs/production#prepare-laradock-for-production) for the hardening steps.

---

Comparing environments? See the full **[Laradock vs Others](/docs/laradock-alternatives)** breakdown. Ready to start? **[Getting Started](/docs/getting-started)** takes about five minutes.
