---
slug: /fuelphp-on-docker
title: Run FuelPHP on Docker
description: Run any FuelPHP app on Docker in minutes with Laradock. What Docker gives a FuelPHP project, why Laradock is the fastest way to get NGINX, PHP and MySQL running, and the exact commands, with any PHP version, without installing anything on your machine.
keywords:
  - fuelphp on docker
  - run fuelphp on docker
  - fuelphp docker
  - fuelphp docker setup
  - dockerize fuelphp
  - fuelphp docker environment
  - fuelphp nginx mysql docker
---

## What is FuelPHP?

[FuelPHP](https://fuelphp.com) is a community-driven, full-stack PHP framework built around an HMVC (Hierarchical Model-View-Controller) architecture, along with routing, an ORM, a CLI (Oil), and a modular package system. A FuelPHP app needs a web server, a PHP runtime, and a database; it ships drivers for MySQL, MySQLi and PDO out of the box.

## Why run FuelPHP in Docker?

Docker packages each of those pieces (NGINX, PHP-FPM, MySQL) into isolated containers that run the same on every machine. Instead of installing PHP and MySQL onto your laptop, where versions collide between projects and "works on my machine" starts, you run disposable containers that mirror production and vanish cleanly when you delete them. FuelPHP is an older framework still running in production on plenty of teams; a container can pin it to the exact PHP version it was built against while a newer project on the same machine runs PHP 8.4.

The catch: wiring those containers together yourself (base images, PHP extensions, networking, permissions) is a week of fiddly Docker work. That is exactly what Laradock removes.

## Why Laradock is the best fit for FuelPHP

FuelPHP has no official Docker image or first-party local-dev tool of its own, so a ready-made, no-lock-in environment matters even more. Here is why Laradock is the best fit:

- **You are never locked into one ecosystem.** Laradock is framework-agnostic. Run FuelPHP today, add a Laravel API or a plain PHP script beside it tomorrow, all in the same environment with the same commands.
- **Far more flexibility.** 100+ ready services and any PHP version from 5.6 to 8.5, so an older FuelPHP 1.x codebase and a newer one each get exactly the runtime they need.
- **Nothing is hidden and you own everything.** No generated files, no magic, no wrapper binary between you and Docker. Every Dockerfile and compose file is right there for you to read and edit.
- **Nothing new to learn.** What you use is plain `docker compose`, knowledge that transfers straight to production. Our [CLI](/docs/cli) is an optional nicety, never a requirement.

Concretely, for FuelPHP it gives you a production-style NGINX + PHP-FPM stack, MySQL already wired, a `workspace` container with Composer and git installed, and any PHP version behind a single line of config.

## Run FuelPHP on Docker with Laradock

### 1. Add Laradock to your project

```bash
cd my-fuelphp-app
git clone https://github.com/laradock/laradock.git
cd laradock && cp .env.example .env
```

(No FuelPHP app yet? Clone Laradock first, then create one from the workspace container in the next steps.)

### 2. Pick the services your app needs

FuelPHP needs a web server and a database. The web server pulls in PHP-FPM automatically:

```bash
docker compose up -d nginx mysql workspace
```

The full catalog of services is [here](/docs/Intro#supported-services).

Prefer to be asked? The optional [CLI](/docs/cli) walks you through the choices: `./laradock setup`, then `./laradock up`. It prints every real command it runs.

### 3. Point FuelPHP at the containers

FuelPHP's database settings live in `fuel/app/config/development/db.php` (copy it from the bundled `db.sample.php` if it does not exist yet). Set the hostname to the service name:

```php
'connection' => array(
    'hostname'   => 'mysql',
    'database'   => 'default',
    'username'   => 'default',
    'password'   => 'secret',
),
```

The default database, user and password live in `mysql/defaults.env`; override any of them by adding the line to Laradock's `.env` (it always wins). FuelPHP's migration tool creates tables, not the database itself, so create the database first.

### 4. Install and run your app

Enter the `workspace` container, where Composer and git live:

```bash
docker compose exec workspace bash
composer create-project fuel/fuel . --prefer-dist   # only if you have no FuelPHP files yet
php oil refine migrate
```

Then open [http://localhost](http://localhost). That is a full FuelPHP app running on Docker.

## Change the PHP version anytime

This is where a native install hurts and Laradock shines. Set the version in Laradock's `.env` and rebuild:

```env
PHP_VERSION=8.1
```

```bash
docker compose build php-fpm workspace
```

FuelPHP's actively maintained 1.9 branch runs cleanly up to PHP 8.1; older FuelPHP 1.x code written against PHP 5.4-5.6 can keep running on its original version in its own Laradock, isolated on the same machine, none of it installed on your host.

## Frequently Asked Questions

### Do I need to install PHP, Composer or MySQL to run FuelPHP with Laradock?

No. Everything lives inside the containers. Composer and git are in the `workspace` container; you never install PHP or MySQL on your host.

### Which services should I start for a typical FuelPHP app?

`nginx mysql workspace` covers most apps: web server, database, and a shell. Add extras like `redis` if your app uses caching.

### Can I run multiple FuelPHP apps on different PHP versions?

Yes. Give each its own Laradock with a unique `COMPOSE_PROJECT_NAME` and `DATA_PATH_HOST`, set a different `PHP_VERSION` in each, and they run independently on the same machine.

### Does this work the same on macOS, Windows and Linux?

Yes. Laradock runs anywhere Docker runs. On macOS/Windows, file-sync speed depends on Docker Desktop (VirtioFS helps a lot); it is a Docker Desktop trait, not specific to Laradock.

### Is this the same Docker setup I would use in production?

The containers are production-style (real NGINX + PHP-FPM), so it is far closer to production than a native install. See [Prepare Laradock for Production](/docs/production#prepare-laradock-for-production) for the hardening steps.

---

Comparing environments? See the full **[Laradock vs Others](/docs/laradock-alternatives)** breakdown. Ready to start? **[Getting Started](/docs/getting-started)** takes about five minutes.
