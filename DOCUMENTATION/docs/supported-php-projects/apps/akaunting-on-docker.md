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

Concretely, for Akaunting it gives you a production-style NGINX + PHP-FPM stack, MySQL/MariaDB/PostgreSQL already wired, Redis for cache, and a `workspace` container with Composer, Node, npm and Artisan already installed.

## Run Akaunting on Docker with Laradock

### 1. Add Laradock to your project

```bash
cd my-akaunting-instance
git clone https://github.com/laradock/laradock.git
cd laradock && cp .env.example .env
```

(No Akaunting codebase yet? Clone Laradock first, then pull one down from the workspace container in the next steps.)

### 2. Pick the services your instance needs

Akaunting needs a web server and a database; add Redis for cache. The web server pulls in PHP-FPM automatically:

```bash
docker compose up -d nginx mysql redis workspace
```

Prefer PostgreSQL instead? Swap the name: `docker compose up -d nginx postgres redis workspace`. The full catalog is [here](/docs/Intro#supported-services).

Prefer to be asked? The optional [CLI](/docs/cli) walks you through the choices: `./laradock setup`, then `./laradock up`. It prints every real command it runs.

### 3. Point Akaunting at the containers

In Akaunting's `.env`, use the service names as hostnames:

```env
DB_HOST=mysql
REDIS_HOST=redis
```

The default database, user and password live in Laradock's `mysql/defaults.env`; override any of them by adding the line to Laradock's `.env` (it always wins).

### 4. Install and run your instance

Enter the `workspace` container, where Composer, Node, npm and Artisan live, and run Akaunting's CLI installer:

```bash
docker compose exec workspace bash
composer install
php artisan install --db-name="default" --db-username="default" --db-password="secret" \
  --admin-email="you@example.com" --admin-password="secret"
```

Add `php artisan sample-data:seed` afterwards if you want demo data. Then open [http://localhost](http://localhost). That is a full Akaunting instance running on Docker.

## Change the PHP version anytime

This is where a native install hurts and Laradock shines. Set the version in Laradock's `.env` and rebuild:

```env
PHP_VERSION=8.2
```

```bash
docker compose build php-fpm workspace
```

Akaunting requires PHP 8.1 or newer; Laradock covers anything from PHP 5.6 to 8.5, so the same tool runs an older Akaunting instance you have not upgraded yet and a brand-new one side by side, each isolated, none of it installed on your machine.

## Frequently Asked Questions

### Do I need to install PHP or Composer to run Akaunting with Laradock?

No. Everything lives inside the containers. Composer, Node, npm and Artisan are all in the `workspace` container; you never install PHP on your host.

### Which services should I start for a typical Akaunting instance?

`nginx mysql redis workspace` covers most instances: web server, database, cache, and a shell. Swap `mysql` for `postgres` if you prefer.

### Can I run multiple Akaunting instances on different PHP versions?

Yes. Give each its own Laradock with a unique `COMPOSE_PROJECT_NAME` and `DATA_PATH_HOST`, set a different `PHP_VERSION` in each, and they run independently on the same machine.

### Does this work the same on macOS, Windows and Linux?

Yes. Laradock runs anywhere Docker runs. On macOS/Windows, file-sync speed depends on Docker Desktop (VirtioFS helps a lot for `vendor/`-heavy apps); it is a Docker Desktop trait, not specific to Laradock.

### Is this the same Docker setup I would use in production?

The containers are production-style (real NGINX + PHP-FPM), so it is far closer to production than a native install. See [Prepare Laradock for Production](/docs/usage#prepare-laradock-for-production) for the hardening steps.

---

Comparing environments? See the full **[Laradock vs Others](/docs/laradock-alternatives)** breakdown. Ready to start? **[Getting Started](/docs/getting-started)** takes about five minutes.
