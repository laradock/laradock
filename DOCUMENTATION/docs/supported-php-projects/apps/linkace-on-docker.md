---
slug: /linkace-on-docker
title: Run LinkAce on Docker
description: Run LinkAce, the self-hosted bookmark manager, on Docker in minutes with Laradock. What Docker gives a LinkAce install, why Laradock is the fastest way to get NGINX, PHP and MySQL running, and the exact commands, with any PHP version, without installing anything on your machine.
keywords:
  - linkace on docker
  - run linkace on docker
  - linkace docker
  - linkace docker setup
  - dockerize linkace
  - linkace docker environment
  - linkace nginx mysql docker
---

## What is LinkAce?

[LinkAce](https://www.linkace.org) is a self-hosted bookmark manager for archiving and organizing links, tags, lists and notes instead of relying on a browser's bookmark bar. It is a Laravel application, so a real LinkAce install needs a web server, a PHP runtime, a MySQL or MariaDB database, and a `queue`/scheduler process for background jobs like link archiving.

## Why run LinkAce in Docker?

Docker packages each of those pieces (NGINX, PHP-FPM, MySQL) into isolated containers that run the same on every machine. Instead of installing PHP and MySQL onto your laptop, where versions collide between projects and "works on my machine" starts, you run disposable containers that mirror production and vanish cleanly when you delete them. One project can run PHP 8.4 while another runs 8.2, on the same computer, with nothing installed globally.

The catch: wiring those containers together yourself (base images, PHP extensions, networking, permissions) is a week of fiddly Docker work. That is exactly what Laradock removes.

## Why Laradock is the best fit for LinkAce

LinkAce ships its own official Docker image (`linkace/linkace` on Docker Hub, maintained by its creator), so, like Laravel, it does not strictly need Laradock. It is still the best fit, and here is why:

- **You are never locked into one ecosystem.** Laradock is framework-agnostic. The day you add a WordPress site, a plain PHP script, or another Laravel app beside your LinkAce instance, it runs in the same environment with the same commands. A single-purpose image cannot do that.
- **Far more flexibility.** 100+ ready services and any PHP version from 5.6 to 8.5, versus the one PHP version baked into LinkAce's own image.
- **Nothing is hidden and you own everything.** No generated files, no magic, no wrapper binary between you and Docker. Every Dockerfile and compose file is right there for you to read and edit.
- **Nothing new to learn.** What you use is plain `docker compose`, knowledge that transfers straight to production and to every other project. Our [CLI](/docs/cli) is an optional nicety, never a requirement.

For LinkAce specifically, Laradock wires a production-style NGINX + PHP-FPM stack, MySQL/MariaDB, and a `workspace` container with Composer, Node, npm, git and Artisan already installed.

## Run LinkAce on Docker with Laradock

### 1. Add Laradock to your project

```bash
cd my-linkace-app
git clone https://github.com/laradock/laradock.git
cd laradock && cp .env.example .env
```

(No LinkAce files yet? Clone Laradock first, then clone LinkAce from [its GitHub repo](https://github.com/Kovah/LinkAce) into your project directory.)

### 2. Pick the services your bookmarks need

LinkAce needs a web server, PHP and a database. Start exactly those (the web server pulls in PHP-FPM automatically):

```bash
docker compose up -d nginx mysql workspace
```

Prefer MariaDB over MySQL? Swap the name: `docker compose up -d nginx mariadb workspace`. The full catalog is [here](/docs/Intro#supported-services).

Prefer to be asked? The optional [CLI](/docs/cli) walks you through the choices: `./laradock setup`, then `./laradock up`. It prints every real command it runs.

### 3. Point LinkAce at the containers

In your app's `.env`, use the service names as hostnames:

```env
DB_HOST=mysql
DB_DATABASE=default
DB_USERNAME=default
DB_PASSWORD=secret
```

The default database, user and password live in `mysql/defaults.env`; override any of them by adding the line to Laradock's `.env` (it always wins).

### 4. Install and run your bookmarks

Enter the shell where Composer, npm and Artisan live, and run LinkAce's own setup commands:

```bash
docker compose exec workspace bash
composer install
php artisan key:generate
php artisan migrate
php artisan setup:complete
php artisan registeruser --admin
```

Then open [http://localhost](http://localhost). That is a full LinkAce install running on Docker.

## Change the PHP version anytime

This is where a native install hurts and Laradock shines. Set the version in Laradock's `.env` and rebuild:

```env
PHP_VERSION=8.4
```

```bash
docker compose build php-fpm workspace
```

Current LinkAce releases require PHP 8.2 or newer, and anything up to 8.5 works, so the same tool runs an older LinkAce install pinned to 8.2 and a freshly upgraded one side by side, each isolated, none of it installed on your machine.

## Frequently Asked Questions

### Do I need to install PHP or Composer to run LinkAce with Laradock?

No. Everything lives inside the containers. Composer, Node, npm, git and Artisan are all in the `workspace` container; you never install PHP on your host.

### Which services should I start for a typical LinkAce install?

`nginx mysql workspace` covers most installs: web server, database, and a shell for Artisan. Swap `mysql` for `mariadb` if you prefer.

### Can I run multiple LinkAce instances on different PHP versions?

Yes. Give each its own Laradock with a unique `COMPOSE_PROJECT_NAME` and `DATA_PATH_HOST`, set a different `PHP_VERSION` in each, and they run independently on the same machine.

### Does this work the same on macOS, Windows and Linux?

Yes. Laradock runs anywhere Docker runs. On macOS/Windows, file-sync speed depends on Docker Desktop; it is a Docker Desktop trait, not specific to Laradock.

### Is this the same Docker setup I would use in production?

The containers are production-style (real NGINX + PHP-FPM), so it is far closer to production than a native install. See [Prepare Laradock for Production](/docs/production#prepare-laradock-for-production) for the hardening steps.

---

Comparing environments? See the full **[Laradock vs Others](/docs/laradock-alternatives)** breakdown. Ready to start? **[Getting Started](/docs/getting-started)** takes about five minutes.
