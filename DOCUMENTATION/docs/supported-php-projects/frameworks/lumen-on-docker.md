---
slug: /lumen-on-docker
title: Run Lumen on Docker
description: Run any Lumen app on Docker in minutes with Laradock. What Docker gives a Lumen micro-service, why Laradock is the fastest way to get NGINX, PHP, MySQL and Redis running, and the exact commands, with any PHP version, without installing anything on your machine.
keywords:
  - lumen on docker
  - run lumen on docker
  - lumen docker
  - lumen docker setup
  - dockerize lumen
  - lumen docker environment
  - lumen nginx mysql docker
---

## What is Lumen?

[Lumen](https://lumen.laravel.com) is Laravel's micro-framework: built by the same team, on the same Illuminate components (Eloquent, the container, routing), stripped down for fast, small API services. It shares Artisan-style console commands and Laravel's `.env`-driven config. One thing worth knowing up front: Laravel's team has said Lumen only receives bug fixes now and recommends the full Laravel framework (optionally with Octane) for new projects; Lumen still works and is fine for maintaining an existing service, this page assumes you already have one or are intentionally choosing it. A Lumen app needs a web server, a PHP runtime, and typically a database (MySQL, PostgreSQL, SQLite or SQL Server via Eloquent) plus Redis if it uses caching or queues.

## Why run Lumen in Docker?

Docker packages each of those pieces (NGINX, PHP-FPM, MySQL, Redis) into isolated containers that run the same on every machine. Instead of installing PHP and MySQL onto your laptop, where versions collide between projects and "works on my machine" starts, you run disposable containers that mirror production and vanish cleanly when you delete them. One project can run PHP 8.2 while another runs 7.4, on the same computer, with nothing installed globally.

The catch: wiring those containers together yourself (base images, PHP extensions, networking, permissions) is a week of fiddly Docker work. That is exactly what Laradock removes.

## Why Laradock is the best fit for Lumen

Laravel Sail exists for Laravel, but it does not target Lumen; Lumen has no official Docker tool or first-party runtime of its own. Here is why Laradock is the best fit:

- **You are never locked into one ecosystem.** Laradock is framework-agnostic. Run a Lumen service today, add a full Laravel app, a WordPress site, or a plain PHP script beside it tomorrow, all in the same environment with the same commands.
- **Far more flexibility.** 100+ ready services and any PHP version from 5.6 to 8.5, so an older Lumen 8 service and a newer Lumen 10 one each get exactly the runtime they need.
- **Nothing is hidden and you own everything.** No generated files, no magic, no wrapper binary between you and Docker. Every Dockerfile and compose file is right there for you to read and edit.
- **Nothing new to learn.** What you use is plain `docker compose`, knowledge that transfers straight to production and to every other project, including a future migration to full Laravel. Our [CLI](/docs/cli) is an optional nicety, never a requirement.

For Lumen specifically, Laradock wires a production-style NGINX + PHP-FPM stack, MySQL/PostgreSQL and Redis, and a `workspace` container with Composer, Node, git and Artisan already installed, the same shell you would use for a Laravel app.

## Run Lumen on Docker with Laradock

### 1. Add Laradock to your project

```bash
cd my-lumen-service
git clone https://github.com/laradock/laradock.git
cd laradock && cp .env.example .env
```

(No Lumen app yet? Clone Laradock first, then create one from the workspace container in the next steps.)

### 2. Pick the services your app needs

Most Lumen APIs need a web server, a database, and Redis for cache and queues. Start exactly those (the web server pulls in PHP-FPM automatically):

```bash
docker compose up -d nginx mysql redis workspace
```

Need Postgres instead of MySQL? Swap the name: `docker compose up -d nginx postgres redis workspace`. No database at all for a stateless service? Drop it: `docker compose up -d nginx workspace`. The full catalog is [here](/docs/Intro#supported-services).

Prefer to be asked? The optional [CLI](/docs/cli) detects Lumen and pre-selects nginx/mysql/redis for you: `./laradock setup`, then `./laradock up`. It prints every real command it runs.

### 3. Point Lumen at the containers

In your app's `.env`, use the service names as hostnames:

```env
DB_HOST=mysql
REDIS_HOST=redis
```

The default database, user and password live in `mysql/defaults.env`; override any of them by adding the line to Laradock's `.env` (it always wins).

### 4. Run your app from the workspace

Enter the shell where Artisan, Composer and npm live, and run the usual commands:

```bash
docker compose exec workspace bash
composer create-project --prefer-dist laravel/lumen .   # only if you have no Lumen app yet
php artisan migrate
```

Then open [http://localhost](http://localhost). That is a full Lumen service running on Docker.

## Change the PHP version anytime

This is where a native install hurts and Laradock shines. Set the version in Laradock's `.env` and rebuild:

```env
PHP_VERSION=8.2
```

```bash
docker compose build php-fpm workspace
```

The latest Lumen release targets PHP 8.1+, and Laradock covers anything from PHP 5.6 to 8.5, so the same tool runs an older Lumen 7 service pinned to an old PHP version and a current Lumen 10 API side by side, each isolated, none of it installed on your machine.

## Frequently Asked Questions

### Do I need to install PHP or Composer to run Lumen with Laradock?

No. Everything lives inside the containers. Composer, Node, npm, git and Artisan are all in the `workspace` container; you never install PHP on your host.

### Which services should I start for a typical Lumen app?

`nginx mysql redis workspace` covers most API services. Drop the database entirely for a stateless service, swap `mysql` for `postgres` if you prefer, and add extras like `rabbitmq` whenever a feature needs them.

### Can I run multiple Lumen services on different PHP versions?

Yes. Give each its own Laradock with a unique `COMPOSE_PROJECT_NAME` and `DATA_PATH_HOST`, set a different `PHP_VERSION` in each, and they run independently on the same machine.

### Does this work the same on macOS, Windows and Linux?

Yes. Laradock runs anywhere Docker runs. On macOS/Windows, file-sync speed depends on Docker Desktop (VirtioFS helps a lot for `vendor/`-heavy apps); it is a Docker Desktop trait, not specific to Laradock.

### Is this the same Docker setup I would use in production?

The containers are production-style (real NGINX + PHP-FPM), so it is far closer to production than the built-in PHP development server. See [Prepare Laradock for Production](/docs/production#prepare-laradock-for-production) for the hardening steps.

---

Comparing environments? See the full **[Laradock vs Others](/docs/laradock-alternatives)** breakdown. Ready to start? **[Getting Started](/docs/getting-started)** takes about five minutes.
