---
slug: /firefly-iii-on-docker
title: Run Firefly III on Docker
description: Run Firefly III on Docker in minutes with Laradock. What Docker gives a Firefly III install, why Laradock is a solid alternative to the official image for running it alongside other apps, and the exact commands, without installing anything on your machine.
keywords:
  - firefly iii on docker
  - run firefly iii on docker
  - firefly iii docker
  - firefly iii docker setup
  - dockerize firefly iii
  - firefly iii docker environment
  - firefly iii nginx mysql docker
---

## What is Firefly III?

[Firefly III](https://www.firefly-iii.org) is a free, open-source personal finance manager: it tracks income and expenses, budgets, bills and multi-currency accounts, and gives you reports and charts over all of it. Under the hood it is a Laravel application, so like any Laravel app it needs a web server, a PHP runtime, and a database (MySQL/MariaDB, PostgreSQL or SQLite); Redis is optional for cache and queues.

## Why run Firefly III in Docker?

Docker packages each of those pieces (NGINX, PHP-FPM, a database) into isolated containers that run the same on every machine. Instead of installing PHP and MySQL onto your laptop, where versions collide between projects and "works on my machine" starts, you run disposable containers that mirror production and vanish cleanly when you delete them. Firefly III also has real PHP version requirements (the latest releases need PHP 8.5), so a container that already ships the right version saves you from upgrading your whole machine's PHP just for one app.

The catch: wiring those containers together yourself (base images, PHP extensions, networking, permissions) is a week of fiddly Docker work. That is exactly what Laradock removes.

## Why Laradock is the best fit for Firefly III

Firefly III has its own official Docker image and docker-compose setup, published and maintained by its author, and for a single, standalone install that is a perfectly good choice. Laradock is still worth considering, and here is why:

- **You are never locked into one ecosystem.** Laradock is framework-agnostic. Run Firefly III today, add a Laravel API, a WordPress site, or any other PHP app beside it tomorrow, all in the same environment with the same commands, instead of juggling a separate compose file per app.
- **Far more flexibility.** 100+ ready services and any PHP version from 5.6 to 8.5, so you are not tied to whatever version the official image happens to ship.
- **Nothing is hidden and you own everything.** No generated files, no magic, no wrapper binary between you and Docker. Every Dockerfile and compose file is right there for you to read and edit.
- **Nothing new to learn.** What you use is plain `docker compose`, knowledge that transfers straight to production and to every other project. Our [CLI](/docs/cli) is an optional nicety, never a requirement.

For Firefly III, Laradock wires a production-style NGINX + PHP-FPM stack, MySQL/MariaDB or PostgreSQL, and a `workspace` container with Composer, Node, npm, git and Artisan already installed, since Firefly III is built and installed like any other Laravel application.

## Run Firefly III on Docker with Laradock

### 1. Add Laradock to your project

```bash
git clone https://github.com/firefly-iii/firefly-iii.git my-firefly-iii
cd my-firefly-iii
git clone https://github.com/laradock/laradock.git
cd laradock && cp .env.example .env
```

### 2. Pick the services Firefly III needs

Firefly III needs a web server and a database. Redis is optional but recommended once you rely on queues or caching. The web server pulls in PHP-FPM automatically:

```bash
docker compose up -d nginx mysql redis workspace
```

Prefer PostgreSQL? Swap the name: `docker compose up -d nginx postgres redis workspace`. The full catalog is [here](/docs/Intro#supported-services).

Prefer to be asked? The optional [CLI](/docs/cli) walks you through the choices: `./laradock setup`, then `./laradock up`. It prints every real command it runs.

### 3. Point Firefly III at the containers

Copy `.env.example` to `.env` inside the Firefly III source and set the database connection to the service names as hostnames:

```env
APP_KEY=
DB_CONNECTION=mysql
DB_HOST=mysql
DB_PORT=3306
DB_DATABASE=default
DB_USERNAME=default
DB_PASSWORD=secret
```

`APP_KEY` must be a random 32-character string (Firefly III's own docs recommend avoiding `=` and `#` in it); generate one and paste it in. The default database, user and password live in Laradock's `mysql/defaults.env`; override any of them by adding the line to Laradock's `.env` (it always wins), and keep the two files in sync.

### 4. Install and run

Enter the `workspace` container, where Composer, Node and Artisan live, and run Firefly III's install steps:

```bash
docker compose exec workspace bash
composer install --no-dev
php artisan migrate --seed
php artisan firefly-iii:upgrade-database
php artisan firefly-iii:laravel-passport-keys
```

Then open [http://localhost](http://localhost) and register the first user, who becomes the site owner.

## Change the PHP version anytime

This is where a native install hurts and Laradock shines. Recent Firefly III releases require PHP 8.5; older releases run on earlier versions. Set whichever your Firefly III version needs in Laradock's `.env` and rebuild:

```env
PHP_VERSION=8.5
```

```bash
docker compose build php-fpm workspace
```

That means you can pin an older Firefly III release to an older PHP version, or move straight to what the latest release requires, without touching anything installed on your machine.

## Frequently Asked Questions

### Do I need to install PHP, Composer or a database engine to run Firefly III with Laradock?

No. Everything lives inside the containers. Composer, Node, npm, git and PHP are all in the `workspace` container; you never install them on your host.

### Should I use the official Firefly III Docker image instead?

If you only ever plan to run Firefly III alone, the official image is a fine, well-maintained choice. Reach for Laradock when you want Firefly III alongside other PHP apps in one consistent, fully inspectable environment, or when you need a PHP version the official image does not ship.

### Which services should I start for Firefly III?

`nginx mysql redis workspace` covers a typical install: web server, database, optional cache, and a shell. Swap `mysql` for `postgres` if you prefer PostgreSQL.

### Does this work the same on macOS, Windows and Linux?

Yes. Laradock runs anywhere Docker runs. On macOS/Windows, file-sync speed depends on Docker Desktop (VirtioFS helps a lot for `vendor/`-heavy apps); it is a Docker Desktop trait, not specific to Laradock.

### Is this the same Docker setup I would use in production?

The containers are production-style (real NGINX + PHP-FPM), so it is far closer to production than a native install. See [Prepare Laradock for Production](/docs/usage#prepare-laradock-for-production) for the hardening steps.

---

Comparing environments? See the full **[Laradock vs Others](/docs/laradock-alternatives)** breakdown. Ready to start? **[Getting Started](/docs/getting-started)** takes about five minutes.
