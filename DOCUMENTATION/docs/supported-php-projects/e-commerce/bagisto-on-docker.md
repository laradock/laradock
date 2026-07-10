---
slug: /bagisto-on-docker
title: Run Bagisto on Docker
description: Run Bagisto on Docker in minutes with Laradock. What Docker gives a Bagisto store, why Laradock is the fastest way to get NGINX, PHP, MySQL and Redis running, and the exact commands, with any PHP version, without installing anything on your machine.
keywords:
  - bagisto on docker
  - run bagisto on docker
  - bagisto docker
  - bagisto docker setup
  - dockerize bagisto
  - bagisto docker environment
  - bagisto laravel mysql docker
---

## What is Bagisto?

[Bagisto](https://bagisto.com) is an open-source e-commerce platform built on Laravel, giving you a multi-vendor-capable store with the usual Laravel toolchain (Artisan, Eloquent, queues) underneath. As a Laravel app it needs a web server, PHP-FPM, and a MySQL or MariaDB database; Redis is commonly added for cache, sessions and queues once a store is real.

## Why run Bagisto in Docker?

Docker packages each of those pieces (NGINX, PHP-FPM, MySQL, Redis) into isolated containers that run the same on every machine. Instead of installing PHP and MySQL onto your laptop, where versions collide between projects and "works on my machine" starts, you run disposable containers that mirror production and vanish cleanly when you delete them. One store can run PHP 8.2 while another Laravel project runs a different version, on the same computer, with nothing installed globally.

The catch: wiring those containers together yourself (base images, PHP extensions, networking, permissions) is a week of fiddly Docker work. That is exactly what Laradock removes.

## Why Laradock is the best fit for Bagisto

Bagisto has no official Docker tool of its own; being Laravel-based it can use Laravel's own tooling, but nothing Bagisto-specific is shipped by the project. Here is why Laradock is the best fit:

- **You are never locked into one ecosystem.** Laradock is framework-agnostic. The day you add a plain Laravel API, a WordPress blog, or a PHP script beside your Bagisto store, it runs in the same environment with the same commands.
- **Far more flexibility.** 100+ ready services and any PHP version from 5.6 to 8.5, so a legacy Bagisto install and a current one each get exactly the runtime they need.
- **Nothing is hidden and you own everything.** No generated files, no magic, no wrapper binary between you and Docker. Every Dockerfile and compose file is right there for you to read and edit.
- **Nothing new to learn.** What you use is plain `docker compose`, knowledge that transfers straight to production and to every other Laravel project. Our [CLI](/docs/cli) is an optional nicety, never a requirement.

Concretely, for Bagisto it gives you a production-style NGINX + PHP-FPM stack, MySQL/MariaDB and Redis already wired, and a `workspace` container with Composer, Node, npm, git and Artisan already installed.

## Run Bagisto on Docker with Laradock

### 1. Add Laradock to your project

```bash
cd my-bagisto-store
git clone https://github.com/laradock/laradock.git
cd laradock && cp .env.example .env
```

(No Bagisto app yet? Clone Laradock first, then create one from the `workspace` container in the next steps.)

### 2. Pick the services your store needs

Bagisto needs a web server and a database. Redis is optional but recommended for cache, sessions and queues:

```bash
docker compose up -d nginx mysql redis workspace
```

Prefer MariaDB over MySQL? Swap the name: `docker compose up -d nginx mariadb redis workspace`. The full catalog is [here](/docs/Intro#supported-services).

### 3. Point Bagisto at the containers

In your app's `.env`, use the service names as hostnames, same as any Laravel app:

```env
DB_HOST=mysql
REDIS_HOST=redis
```

The default database, user and password live in `mysql/defaults.env`; override any of them by adding the line to Laradock's `.env` (it always wins).

### 4. Install and run your store

Enter the `workspace` container, where Artisan, Composer and npm live, scaffold the project and run Bagisto's own installer:

```bash
docker compose exec workspace bash
composer create-project bagisto/bagisto .
php artisan bagisto:install
```

`bagisto:install` checks your `.env`, runs the migrations and seeders, and walks you through creating the admin account interactively. Then open [http://localhost](http://localhost) for the store and `http://localhost/admin` for the back office. That is a full Bagisto store running on Docker.

## Change the PHP version anytime

This is where a native install hurts and Laradock shines. Set the version in Laradock's `.env` and rebuild:

```env
PHP_VERSION=8.2
```

```bash
docker compose build php-fpm workspace
```

Current Bagisto releases require PHP 8.2 or newer, so keep `PHP_VERSION` at 8.2+ for a current install; the same tool can still run an older Laravel app on a lower PHP version in a separate Laradock instance, each isolated, none of it installed on your machine.

## Frequently Asked Questions

### Do I need to install PHP or Composer to run Bagisto with Laradock?

No. Everything lives inside the containers. Composer, Node, npm, git and Artisan are all in the `workspace` container; you never install PHP on your host.

### Which services should I start for a typical Bagisto store?

`nginx mysql redis workspace` covers most stores: web server, database, cache/queue, and a shell. Swap `mysql` for `mariadb` if you prefer.

### Can I run multiple Bagisto stores on different PHP versions?

Yes. Give each its own Laradock with a unique `COMPOSE_PROJECT_NAME` and `DATA_PATH_HOST`, set a different `PHP_VERSION` in each, and they run independently on the same machine.

### Does this work the same on macOS, Windows and Linux?

Yes. Laradock runs anywhere Docker runs. On macOS/Windows, file-sync speed depends on Docker Desktop (VirtioFS helps a lot for `vendor/`-heavy apps); it is a Docker Desktop trait, not specific to Laradock.

### Is this the same Docker setup I would use in production?

The containers are production-style (real NGINX + PHP-FPM), so it is far closer to production than a native install. See [Prepare Laradock for Production](/docs/production#prepare-laradock-for-production) for the hardening steps.

---

Comparing environments? See the full **[Laradock vs Others](/docs/laradock-alternatives)** breakdown. Ready to start? **[Getting Started](/docs/getting-started)** takes about five minutes.
