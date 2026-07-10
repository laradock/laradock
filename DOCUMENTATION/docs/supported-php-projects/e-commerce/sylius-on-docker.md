---
slug: /sylius-on-docker
title: Run Sylius on Docker
description: Run Sylius on Docker in minutes with Laradock. What Docker gives a Sylius store, why Laradock is the fastest way to get NGINX, PHP, MySQL or PostgreSQL running, and the exact commands, with any PHP version, without installing anything on your machine.
keywords:
  - sylius on docker
  - run sylius on docker
  - sylius docker
  - sylius docker setup
  - dockerize sylius
  - sylius docker environment
  - sylius symfony docker
---

## What is Sylius?

[Sylius](https://sylius.com) is an open-source e-commerce platform built on the Symfony framework, aimed at developers who want a fully customizable, API-first store rather than a plugin-heavy monolith. As a Symfony application it needs a web server, PHP-FPM, and a MySQL or PostgreSQL database; Node.js is needed at build time for its front-end assets, and Redis is a common addition for cache and sessions on larger stores.

## Why run Sylius in Docker?

Docker packages each of those pieces (NGINX, PHP-FPM, MySQL/PostgreSQL, Redis) into isolated containers that run the same on every machine. Instead of installing PHP and a database onto your laptop, where versions collide between projects and "works on my machine" starts, you run disposable containers that mirror production and vanish cleanly when you delete them. One project can run PHP 8.3 while another runs a different Symfony/Sylius version, on the same computer, with nothing installed globally.

The catch: wiring those containers together yourself (base images, PHP extensions, networking, permissions) is a week of fiddly Docker work. That is exactly what Laradock removes.

## Why Laradock is the best fit for Sylius

Sylius has no official standalone Docker product; the Symfony Docker examples in its documentation are minimal starting points, not a maintained tool. Here is why Laradock is the best fit:

- **You are never locked into one ecosystem.** Laradock is framework-agnostic. The day you add a Laravel admin panel, a WordPress marketing site, or a plain PHP script beside your Sylius store, it runs in the same environment with the same commands.
- **Far more flexibility.** 100+ ready services and any PHP version from 5.6 to 8.5, so a legacy Sylius install and a current one each get exactly the runtime they need.
- **Nothing is hidden and you own everything.** No generated files, no magic, no wrapper binary between you and Docker. Every Dockerfile and compose file is right there for you to read and edit.
- **Nothing new to learn.** What you use is plain `docker compose`, knowledge that transfers straight to production and to every other Symfony or non-Symfony project. Our [CLI](/docs/cli) is an optional nicety, never a requirement.

Concretely, for Sylius it gives you a production-style NGINX + PHP-FPM stack, MySQL/MariaDB or PostgreSQL and Redis already wired, and a `workspace` container with Composer, Node and git already installed.

## Run Sylius on Docker with Laradock

### 1. Add Laradock to your project

```bash
cd my-sylius-store
git clone https://github.com/laradock/laradock.git
cd laradock && cp .env.example .env
```

(No Sylius app yet? Clone Laradock first, then scaffold one from the `workspace` container in the next steps.)

### 2. Pick the services your store needs

Sylius needs a web server and a database, either MySQL/MariaDB or PostgreSQL. Redis is optional for cache and sessions:

```bash
docker compose up -d nginx postgres redis workspace
```

Prefer MySQL instead of PostgreSQL? Swap the name: `docker compose up -d nginx mysql redis workspace`. The full catalog is [here](/docs/Intro#supported-services).

### 3. Point Sylius at the containers

Sylius (like any Symfony app) reads its database connection from the `DATABASE_URL` environment variable, normally set in your app's `.env` or `.env.local`:

```env
DATABASE_URL=postgresql://default:secret@postgres:5432/default?serverVersion=15&charset=utf8
```

Use `mysql://` in place of `postgresql://` if you started `mysql` instead. The default database, user and password live in `postgres/defaults.env` (or `mysql/defaults.env`); override any of them by adding the line to Laradock's `.env` (it always wins).

### 4. Install and run your store

Enter the `workspace` container, where Composer, Node and git live, scaffold the project and run the installer:

```bash
docker compose exec workspace bash
composer create-project sylius/sylius-standard .
bin/console sylius:install
```

`sylius:install` walks through database setup, fixtures and an admin user interactively. Then open [http://localhost](http://localhost) for the shop and `http://localhost/admin` for the back office. That is a full Sylius store running on Docker.

## Change the PHP version anytime

This is where a native install hurts and Laradock shines. Set the version in Laradock's `.env` and rebuild:

```env
PHP_VERSION=8.3
```

```bash
docker compose build php-fpm workspace
```

Sylius currently requires PHP 8.2 or newer, so keep `PHP_VERSION` at 8.2+ for a current Sylius install; the same tool can still run an older Symfony app on a lower PHP version in a separate Laradock instance, each isolated, none of it installed on your machine.

## Frequently Asked Questions

### Do I need to install PHP, Composer or Node to run Sylius with Laradock?

No. Everything lives inside the containers. Composer, Node, npm and git are all in the `workspace` container; you never install PHP on your host.

### Which services should I start for a typical Sylius store?

`nginx postgres redis workspace` (or `mysql` instead of `postgres`) covers most stores: web server, database, cache, and a shell.

### Can I run multiple Sylius projects on different PHP versions?

Yes. Give each its own Laradock with a unique `COMPOSE_PROJECT_NAME` and `DATA_PATH_HOST`, set a different `PHP_VERSION` in each, and they run independently on the same machine.

### Does this work the same on macOS, Windows and Linux?

Yes. Laradock runs anywhere Docker runs. On macOS/Windows, file-sync speed depends on Docker Desktop (VirtioFS helps a lot for `vendor/`-heavy apps); it is a Docker Desktop trait, not specific to Laradock.

### Is this the same Docker setup I would use in production?

The containers are production-style (real NGINX + PHP-FPM), so it is far closer to production than a native install. See [Prepare Laradock for Production](/docs/usage#prepare-laradock-for-production) for the hardening steps.

---

Comparing environments? See the full **[Laradock vs Others](/docs/laradock-alternatives)** breakdown. Ready to start? **[Getting Started](/docs/getting-started)** takes about five minutes.
