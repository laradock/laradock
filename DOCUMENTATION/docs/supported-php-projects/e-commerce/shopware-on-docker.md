---
slug: /shopware-on-docker
title: Run Shopware on Docker
description: Run Shopware 6 on Docker in minutes with Laradock. What Docker gives a Shopware storefront, why Laradock is the fastest way to get NGINX, PHP, MySQL and Redis running, and the exact commands, with any PHP version, without installing anything on your machine.
keywords:
  - shopware on docker
  - run shopware on docker
  - shopware docker
  - shopware 6 docker setup
  - dockerize shopware
  - shopware docker environment
  - shopware nginx mysql docker
---

## What is Shopware?

[Shopware](https://www.shopware.com) is a Symfony-based open-source ecommerce platform, with Shopware 6 built around Symfony on the backend and Vue.js for the storefront and administration UI. A Shopware installation is a PHP application backed by a MySQL/MariaDB database, served through a web server, and it relies on Redis for caching and session storage once you move past a bare-bones setup, plus Node for building storefront and admin assets.

## Why run Shopware in Docker?

Docker packages each of those pieces (NGINX, PHP-FPM, MySQL, Redis, Node) into isolated containers that run the same on every machine. Instead of installing PHP and MySQL onto your laptop, where versions collide between projects and "works on my machine" starts, you run disposable containers that mirror production and vanish cleanly when you delete them. One project can run the PHP version a current Shopware 6 release expects while another stays on an older one, on the same computer, with nothing installed globally.

The catch: wiring those containers together yourself (base images, PHP extensions, networking, permissions) is a week of fiddly Docker work. That is exactly what Laradock removes.

## Why Laradock is the best fit for Shopware

Shopware's own documentation points developers to [dockware](https://dockware.io), a widely used community-maintained Docker setup built specifically for local Shopware 6 development, so, unlike most PHP projects, Shopware does not strictly need Laradock. It is still the best fit, and here is why:

- **You are never locked into one ecosystem.** Laradock is framework-agnostic. The day you add a Laravel API, a WordPress marketing site, or a plain PHP script beside your Shopware store, it runs in the same environment with the same commands. A Shopware-only tool cannot do that.
- **Far more flexibility.** 100+ ready services and any PHP version from 5.6 to 8.5, versus the curated set of Shopware versions a Shopware-specific image ships.
- **Nothing is hidden and you own everything.** No generated files, no magic, no wrapper binary between you and Docker. Every Dockerfile and compose file is right there for you to read and edit.
- **Nothing new to learn.** What you use is plain `docker compose`, knowledge that transfers straight to production and to every other project. Our [CLI](/docs/cli) is an optional nicety, never a requirement.

For Shopware specifically, Laradock wires a production-style NGINX + PHP-FPM stack, MySQL/MariaDB and Redis, and a `workspace` container with Composer, Node and npm already installed for the Symfony console commands and asset builds Shopware needs.

## Run Shopware on Docker with Laradock

### 1. Add Laradock to your project

```bash
cd my-shopware-app
git clone https://github.com/laradock/laradock.git
cd laradock && cp .env.example .env
```

(No Shopware project yet? Clone Laradock first, then install one from the workspace container in the next steps.)

### 2. Pick the services your store needs

A typical Shopware 6 install needs a web server, a database, and Redis. Start exactly those (the web server pulls in PHP-FPM automatically):

```bash
docker compose up -d nginx mysql redis workspace
```

Prefer MariaDB over MySQL? Swap the name: `docker compose up -d nginx mariadb redis workspace`. The full catalog is [here](/docs/Intro#supported-services).

Prefer to be asked? The optional [CLI](/docs/cli) walks you through the choices: `./laradock setup`, then `./laradock up`. It prints every real command it runs.

### 3. Point Shopware at the containers

In your app's `.env`, set `DATABASE_URL` to the service name as hostname:

```env
DATABASE_URL="mysql://default:secret@mysql:3306/default"
```

The default database, user and password live in `mysql/defaults.env`; override any of them by adding the line to Laradock's `.env` (it always wins).

### 4. Install and run your store

Enter the `workspace` container, where Composer and Node live, and run the installer:

```bash
docker compose exec workspace bash
composer create-project shopware/production my-shopware-app   # only if you have no project yet
php bin/console system:install --basic-setup
```

`system:install` sets up the database schema, an admin sales channel and a default admin user. Then open [http://localhost](http://localhost). That is a full Shopware storefront running on Docker.

## Change the PHP version anytime

This is where a native install hurts and Laradock shines. Set the version in Laradock's `.env` and rebuild:

```env
PHP_VERSION=8.3
```

```bash
docker compose build php-fpm workspace
```

Current Shopware 6 releases require PHP 8.2 or newer, while an older Shopware 6 install pinned to an earlier minor version may need an earlier PHP release. Laradock covers anything from PHP 5.6 to 8.5, so the same tool runs an older Shopware store and a current one side by side, each isolated, none of it installed on your machine.

## Frequently Asked Questions

### Do I need to install PHP, Composer or Node to run Shopware with Laradock?

No. Everything lives inside the containers. Composer, Node and npm are all in the `workspace` container; you never install PHP on your host.

### Which services should I start for a typical Shopware store?

`nginx mysql redis workspace` covers most installs: web server, database, cache, and a shell with Composer and Node. Swap `mysql` for `mariadb` if you prefer.

### Can I run multiple Shopware stores on different PHP versions?

Yes. Give each its own Laradock with a unique `COMPOSE_PROJECT_NAME` and `DATA_PATH_HOST`, set a different `PHP_VERSION` in each, and they run independently on the same machine.

### Does this work the same on macOS, Windows and Linux?

Yes. Laradock runs anywhere Docker runs. On macOS/Windows, file-sync speed depends on Docker Desktop (VirtioFS helps a lot for a `vendor/`-heavy app like Shopware); it is a Docker Desktop trait, not specific to Laradock.

### Is this the same Docker setup I would use in production?

The containers are production-style (real NGINX + PHP-FPM), so it is far closer to production than a native install. See [Prepare Laradock for Production](/docs/usage#prepare-laradock-for-production) for the hardening steps.

---

Comparing environments? See the full **[Laradock vs Others](/docs/laradock-alternatives)** breakdown. Ready to start? **[Getting Started](/docs/getting-started)** takes about five minutes.
