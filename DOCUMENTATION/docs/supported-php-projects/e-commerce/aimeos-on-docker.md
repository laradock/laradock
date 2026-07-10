---
slug: /aimeos-on-docker
title: Run Aimeos on Docker
description: Run Aimeos on Docker in minutes with Laradock. What Docker gives an Aimeos-powered Laravel app, why Laradock is the fastest way to get NGINX, PHP, MySQL and Redis running, and the exact commands, with any PHP version, without installing anything on your machine.
keywords:
  - aimeos on docker
  - run aimeos on docker
  - aimeos docker
  - aimeos docker setup
  - dockerize aimeos
  - aimeos docker environment
  - aimeos laravel mysql docker
---

## What is Aimeos?

[Aimeos](https://aimeos.org) is an e-commerce package, not a standalone application: it is installed via Composer into an existing Laravel, Symfony or TYPO3 project (the Laravel integration, `aimeos/aimeos-laravel`, is by far the most common path) to add a full storefront, catalog and order system on top. It needs whatever its host framework needs: a web server, PHP-FPM, and a MySQL, MariaDB or PostgreSQL database; Redis is a common addition for cache and sessions.

## Why run Aimeos in Docker?

Docker packages each of those pieces (NGINX, PHP-FPM, MySQL, Redis) into isolated containers that run the same on every machine. Instead of installing PHP and MySQL onto your laptop, where versions collide between projects and "works on my machine" starts, you run disposable containers that mirror production and vanish cleanly when you delete them. One Aimeos project can run PHP 8.2 while another Laravel app runs a different version, on the same computer, with nothing installed globally.

The catch: wiring those containers together yourself (base images, PHP extensions, networking, permissions) is a week of fiddly Docker work. That is exactly what Laradock removes.

## Why Laradock is the best fit for Aimeos

Since Aimeos is a package you add to a host framework rather than a standalone product, it has no Docker tool of its own; whatever you use has to serve the host app (usually Laravel), not just Aimeos. Here is why Laradock is the best fit:

- **You are never locked into one ecosystem.** Laradock is framework-agnostic. The Laravel app that hosts Aimeos can sit beside a Symfony service, a WordPress site, or a plain PHP script, all in the same environment with the same commands.
- **Far more flexibility.** 100+ ready services and any PHP version from 5.6 to 8.5, so an older Aimeos/Laravel combination and a current one each get exactly the runtime they need.
- **Nothing is hidden and you own everything.** No generated files, no magic, no wrapper binary between you and Docker. Every Dockerfile and compose file is right there for you to read and edit.
- **Nothing new to learn.** What you use is plain `docker compose`, knowledge that transfers straight to production and to every other Laravel project. Our [CLI](/docs/cli) is an optional nicety, never a requirement.

Concretely, for an Aimeos-powered app it gives you a production-style NGINX + PHP-FPM stack, MySQL/MariaDB/PostgreSQL and Redis already wired, and a `workspace` container with Composer, Node, npm, git and Artisan already installed.

## Run Aimeos on Docker with Laradock

### 1. Add Laradock to your project

```bash
cd my-aimeos-app
git clone https://github.com/laradock/laradock.git
cd laradock && cp .env.example .env
```

(No Laravel app yet? Clone Laradock first, then [create one from the workspace container](/docs/usage#install-laravel); Aimeos is added into it in the steps below.)

### 2. Pick the services your app needs

Aimeos needs whatever your host Laravel app needs: a web server, a database, and usually Redis. Start exactly those:

```bash
docker compose up -d nginx mysql redis workspace
```

Prefer PostgreSQL or MariaDB? Swap the name: `docker compose up -d nginx postgres redis workspace`. The full catalog is [here](/docs/Intro#supported-services).

### 3. Point Laravel at the containers

In your app's `.env`, use the service names as hostnames:

```env
DB_HOST=mysql
REDIS_HOST=redis
```

The default database, user and password live in `mysql/defaults.env`; override any of them by adding the line to Laradock's `.env` (it always wins).

### 4. Install Aimeos into your app and run it

Enter the `workspace` container, where Artisan, Composer and npm live, add Aimeos to your existing Laravel app and set it up:

```bash
docker compose exec workspace bash
composer require aimeos/aimeos-laravel
php artisan vendor:publish --tag=config --tag=public
php artisan migrate
php artisan aimeos:setup --option=setup/default/demo:1
```

Create an admin account through the artisan command Aimeos ships for that, then open [http://localhost](http://localhost) for the storefront and [http://localhost/admin](http://localhost/admin) for the back office. That is a full Aimeos-powered store running on Docker.

## Change the PHP version anytime

This is where a native install hurts and Laradock shines. Set the version in Laradock's `.env` and rebuild:

```env
PHP_VERSION=8.2
```

```bash
docker compose build php-fpm workspace
```

Current Aimeos releases target current Laravel LTS versions and need a modern PHP (8.2 or newer is a safe baseline; check `aimeos/aimeos-laravel`'s `composer.json` for the exact floor of the release you install), so the same tool can still run an older Laravel app on a lower PHP version in a separate Laradock instance, each isolated, none of it installed on your machine.

## Frequently Asked Questions

### Do I need to install PHP or Composer to run Aimeos with Laradock?

No. Everything lives inside the containers. Composer, Node, npm, git and Artisan are all in the `workspace` container; you never install PHP on your host.

### Do I need a Laravel app before I can add Aimeos?

Yes. Aimeos is a package, not a standalone platform; it is installed into an existing Laravel (or Symfony/TYPO3) project. If you don't have one yet, create it from the `workspace` container first.

### Which services should I start for a typical Aimeos project?

`nginx mysql redis workspace` covers most Laravel + Aimeos apps. Swap `mysql` for `postgres` or `mariadb` if you prefer.

### Can I run multiple Aimeos projects on different PHP versions?

Yes. Give each its own Laradock with a unique `COMPOSE_PROJECT_NAME` and `DATA_PATH_HOST`, set a different `PHP_VERSION` in each, and they run independently on the same machine.

### Is this the same Docker setup I would use in production?

The containers are production-style (real NGINX + PHP-FPM), so it is far closer to production than a native install. See [Prepare Laradock for Production](/docs/usage#prepare-laradock-for-production) for the hardening steps.

---

Comparing environments? See the full **[Laradock vs Others](/docs/laradock-alternatives)** breakdown. Ready to start? **[Getting Started](/docs/getting-started)** takes about five minutes.
