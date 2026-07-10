---
slug: /slim-on-docker
title: Run Slim on Docker
description: Run any Slim Framework app on Docker in minutes with Laradock. What Docker gives a Slim project, why Laradock is the fastest way to get NGINX and PHP running, and the exact commands, with any PHP version, without installing anything on your machine.
keywords:
  - slim on docker
  - run slim framework on docker
  - slim php docker
  - slim docker setup
  - dockerize slim framework
  - slim docker environment
  - slim nginx php docker
---

## What is Slim?

[Slim](https://www.slimframework.com) is a PHP micro-framework for building APIs and small web apps: routing, middleware, and a PSR-7 request/response layer, with none of the batteries a full-stack framework bundles. Slim has no built-in ORM or database layer by design; a typical Slim app needs a web server and a PHP runtime, and adds a database only if the app itself needs one, usually via plain PDO or a library like Doctrine or Eloquent pulled in through Composer.

## Why run Slim in Docker?

Docker packages each of those pieces (NGINX, PHP-FPM, and whatever database you add) into isolated containers that run the same on every machine. Instead of installing PHP onto your laptop, where versions collide between projects and "works on my machine" starts, you run disposable containers that mirror production and vanish cleanly when you delete them. One project can run PHP 8.3 while another runs 7.4, on the same computer, with nothing installed globally.

The catch: wiring those containers together yourself (base images, PHP extensions, networking, permissions) is a week of fiddly Docker work. That is exactly what Laradock removes.

## Why Laradock is the best fit for Slim

Slim has no official Docker tool or first-party runtime of its own, so a ready-made, no-lock-in environment matters even more. Here is why Laradock is the best fit:

- **You are never locked into one ecosystem.** Laradock is framework-agnostic. Run a Slim API today, add a Laravel app, a WordPress site, or a plain PHP script beside it tomorrow, all in the same environment with the same commands.
- **Far more flexibility.** 100+ ready services and any PHP version from 5.6 to 8.5, so a lightweight Slim API and a heavier full-stack app on the same machine each get exactly the runtime they need.
- **Nothing is hidden and you own everything.** No generated files, no magic, no wrapper binary between you and Docker. Every Dockerfile and compose file is right there for you to read and edit.
- **Nothing new to learn.** What you use is plain `docker compose`, knowledge that transfers straight to production. Our [CLI](/docs/cli) is an optional nicety, never a requirement.

Concretely, for Slim it gives you a production-style NGINX + PHP-FPM stack, any database you need (MySQL, PostgreSQL, or none at all) ready to switch on, and a `workspace` container with Composer and git installed.

## Run Slim on Docker with Laradock

### 1. Add Laradock to your project

```bash
cd my-slim-app
git clone https://github.com/laradock/laradock.git
cd laradock && cp .env.example .env
```

(No Slim app yet? Clone Laradock first, then create one from the workspace container in the next steps.)

### 2. Pick the services your app needs

A Slim API often needs nothing more than a web server (the web server pulls in PHP-FPM automatically):

```bash
docker compose up -d nginx workspace
```

Add a database only if your app uses one: `docker compose up -d mysql` or `docker compose up -d postgres`. The full catalog is [here](/docs/Intro#supported-services).

Prefer to be asked? The optional [CLI](/docs/cli) walks you through the choices: `./laradock setup`, then `./laradock up`. It prints every real command it runs.

### 3. Point Slim at the containers

Slim has no built-in database config file; wherever your app builds its PDO connection or ORM config (commonly `config/settings.php` or `.env`), use the service name as the hostname:

```env
DB_HOST=mysql
DB_DATABASE=default
DB_USERNAME=default
DB_PASSWORD=secret
```

The default database, user and password live in Laradock's `mysql/defaults.env`; override any of them by adding the line to Laradock's `.env` (it always wins).

### 4. Run your app from the workspace

Enter the shell where Composer and git live, and run the usual commands:

```bash
docker compose exec workspace bash
composer create-project slim/slim-skeleton .   # only if you have no Slim app yet
```

Then open [http://localhost](http://localhost). That is a full Slim app running on Docker.

## Change the PHP version anytime

This is where a native install hurts and Laradock shines. Set the version in Laradock's `.env` and rebuild:

```env
PHP_VERSION=8.1
```

```bash
docker compose build php-fpm workspace
```

Slim 4 supports PHP 7.4 and newer, and Laradock covers anything from PHP 5.6 to 8.5, so the same tool runs an older Slim 3 service and a current Slim 4 API side by side, each isolated, none of it installed on your machine.

## Frequently Asked Questions

### Do I need to install PHP or Composer to run Slim with Laradock?

No. Everything lives inside the containers. Composer and git are both in the `workspace` container; you never install PHP on your host.

### Which services should I start for a typical Slim app?

`nginx workspace` covers a database-free API. Add `mysql` or `postgres` the moment your app needs to persist data, and any other service (`redis`, `rabbitmq`, ...) as features require it.

### Can I run multiple Slim apps on different PHP versions?

Yes. Give each its own Laradock with a unique `COMPOSE_PROJECT_NAME` and `DATA_PATH_HOST`, set a different `PHP_VERSION` in each, and they run independently on the same machine.

### Does this work the same on macOS, Windows and Linux?

Yes. Laradock runs anywhere Docker runs. On macOS/Windows, file-sync speed depends on Docker Desktop (VirtioFS helps a lot); it is a Docker Desktop trait, not specific to Laradock.

### Is this the same Docker setup I would use in production?

The containers are production-style (real NGINX + PHP-FPM), so it is far closer to production than the built-in PHP development server. See [Prepare Laradock for Production](/docs/production#prepare-laradock-for-production) for the hardening steps.

---

Comparing environments? See the full **[Laradock vs Others](/docs/laradock-alternatives)** breakdown. Ready to start? **[Getting Started](/docs/getting-started)** takes about five minutes.
