---
slug: /monica-crm-on-docker
title: Run Monica CRM on Docker
description: Run Monica, the personal relationship manager, on Docker in minutes with Laradock. What Docker gives a Monica instance, why Laradock is the fastest way to get NGINX, PHP and MySQL running, and the exact commands, without installing anything on your machine.
keywords:
  - monica crm on docker
  - run monica on docker
  - monica docker
  - monica docker setup
  - dockerize monica crm
  - personal crm docker
  - monica nginx mysql docker
---

## What is Monica CRM?

[Monica](https://www.monicahq.com) is an open source personal relationship manager: a "CRM for your personal life" that tracks contacts, notes, reminders and important dates instead of sales pipelines. A Monica instance is a PHP application built on Laravel, backed by MySQL or MariaDB, served through a web server, with Artisan handling installation and setup.

## Why run Monica in Docker?

Docker packages each of those pieces (NGINX, PHP-FPM, MySQL) into isolated containers that run the same on every machine. Instead of installing PHP and MySQL onto your laptop, where versions collide between projects and "works on my machine" starts, you run disposable containers that mirror production and vanish cleanly when you delete them. One Monica instance can run on a specific PHP version while another project runs a different one, on the same computer, with nothing installed globally.

The catch: wiring those containers together yourself (base images, PHP extensions, networking, permissions) is a week of fiddly Docker work. That is exactly what Laradock removes.

## Why Laradock is the best fit for Monica

Monica does ship its own official Docker image (`monica` on Docker Hub, maintained by the Monica team, in `apache` and `fpm` variants), so, unlike most PHP projects, it does not strictly need Laradock. It is still worth considering, and here is why:

- **You are never locked into one ecosystem.** Laradock is framework-agnostic. The day you add a Laravel API, a WordPress blog, or a plain PHP script beside your Monica instance, it runs in the same environment with the same commands. A single-purpose image cannot do that.
- **Far more flexibility.** 100+ ready services and any PHP version from 5.6 to 8.5, versus the narrow set of tags the official image ships.
- **Nothing is hidden and you own everything.** No generated files, no magic, no wrapper binary between you and Docker. Every Dockerfile and compose file is right there for you to read and edit.
- **Nothing new to learn.** What you use is plain `docker compose`, knowledge that transfers straight to production and to every other project. Our [CLI](/docs/cli) is an optional nicety, never a requirement.

Concretely, for Monica it gives you a production-style NGINX + PHP-FPM stack, MySQL/MariaDB already wired, and a `workspace` container with Composer, Node, npm and Artisan already installed.

## Run Monica on Docker with Laradock

### 1. Add Laradock to your project

```bash
cd my-monica-instance
git clone https://github.com/laradock/laradock.git
cd laradock && cp .env.example .env
```

(No Monica codebase yet? Clone Laradock first, then pull one down from the workspace container in the next steps.)

### 2. Pick the services your instance needs

Monica needs a web server and a database. The web server pulls in PHP-FPM automatically:

```bash
docker compose up -d nginx mysql workspace
```

Prefer MariaDB instead? Swap the name: `docker compose up -d nginx mariadb workspace`. The full catalog is [here](/docs/Intro#supported-services).

Prefer to be asked? The optional [CLI](/docs/cli) walks you through the choices: `./laradock setup`, then `./laradock up`. It prints every real command it runs.

### 3. Point Monica at the containers

In Monica's `.env`, use the service names as hostnames:

```env
DB_HOST=mysql
DB_DATABASE=default
DB_USERNAME=default
DB_PASSWORD=secret
```

The default database, user and password live in Laradock's `mysql/defaults.env`; override any of them by adding the line to Laradock's `.env` (it always wins).

### 4. Install and run your instance

Enter the `workspace` container, where Composer, Node, npm and Artisan live, clone or place the Monica codebase, and run its setup:

```bash
docker compose exec workspace bash
git clone https://github.com/monicahq/monica.git --branch main --single-branch .   # only if you have no codebase yet
composer install
cp .env.example .env
php artisan key:generate
php artisan setup:production -v
```

Then open [http://localhost](http://localhost) and create your account. That is a full Monica instance running on Docker.

## Change the PHP version anytime

This is where a native install hurts and Laradock shines. Set the version in Laradock's `.env` and rebuild:

```env
PHP_VERSION=8.2
```

```bash
docker compose build php-fpm workspace
```

Current Monica releases target PHP 8.1 or newer; Laradock covers anything from PHP 5.6 to 8.5, so the same tool runs an older Monica instance you have not upgraded yet and a brand-new one side by side, each isolated, none of it installed on your machine.

## Frequently Asked Questions

### Do I need to install PHP or Composer to run Monica with Laradock?

No. Everything lives inside the containers. Composer, Node, npm and Artisan are all in the `workspace` container; you never install PHP on your host.

### Which services should I start for a typical Monica instance?

`nginx mysql workspace` covers it: web server, database, and a shell. Swap `mysql` for `mariadb` if you prefer.

### Can I run multiple Monica instances on different PHP versions?

Yes. Give each its own Laradock with a unique `COMPOSE_PROJECT_NAME` and `DATA_PATH_HOST`, set a different `PHP_VERSION` in each, and they run independently on the same machine.

### Does this work the same on macOS, Windows and Linux?

Yes. Laradock runs anywhere Docker runs. On macOS/Windows, file-sync speed depends on Docker Desktop (VirtioFS helps a lot for `vendor/`-heavy apps); it is a Docker Desktop trait, not specific to Laradock.

### Is this the same Docker setup I would use in production?

The containers are production-style (real NGINX + PHP-FPM), so it is far closer to production than a native install. See [Prepare Laradock for Production](/docs/usage#prepare-laradock-for-production) for the hardening steps.

---

Comparing environments? See the full **[Laradock vs Others](/docs/laradock-alternatives)** breakdown. Ready to start? **[Getting Started](/docs/getting-started)** takes about five minutes.
