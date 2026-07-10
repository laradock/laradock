---
slug: /symfony-on-docker
title: Run Symfony on Docker
description: Run any Symfony app on Docker in minutes with Laradock. What Docker gives a Symfony project, how Laradock compares to the official symfony-docker/FrankenPHP setup, and the exact commands, with any PHP version, without installing anything on your machine.
keywords:
  - symfony on docker
  - run symfony on docker
  - symfony docker
  - symfony docker setup
  - dockerize symfony
  - symfony docker environment
  - symfony nginx mysql docker
---

## What is Symfony?

[Symfony](https://symfony.com) is a mature PHP framework and a set of reusable components used both directly and as the foundation of other projects (Laravel, Drupal, and many more all borrow Symfony components). It ships routing, the Doctrine ORM, a service container, and a console, and it powers everything from small APIs to large enterprise applications. A Symfony app needs a web server, a PHP runtime, and, once Doctrine is involved, a real database: MySQL, MariaDB, PostgreSQL, or SQLite.

## Why run Symfony in Docker?

Docker packages each of those pieces (a web server, PHP-FPM, a database) into isolated containers that run the same on every machine. Instead of installing PHP and a database onto your laptop, where versions collide between projects and "works on my machine" starts, you run disposable containers that mirror production and vanish cleanly when you delete them. One project can run PHP 8.4 while another runs 8.1, on the same computer, with nothing installed globally.

The catch: wiring those containers together yourself (base images, PHP extensions, networking, permissions) is a week of fiddly Docker work. That is exactly what Laradock removes.

## Why Laradock is the best fit for Symfony

Symfony has its own official Docker setup, [symfony-docker](https://github.com/dunglas/symfony-docker), built around FrankenPHP, plus Symfony Flex recipes that can add compose files automatically when you require a package. So, unlike most PHP projects, Symfony does not strictly need Laradock. It is still the best fit, and here is why:

- **You are never locked into one ecosystem.** Laradock is framework-agnostic. The day you add a Laravel API, a WordPress site, or a plain PHP script beside your Symfony app, it runs in the same environment with the same commands. A Symfony-specific setup cannot do that.
- **Far more flexibility.** 100+ ready services and any PHP version from 5.6 to 8.5, versus the short curated list a Symfony-specific setup gives you.
- **Nothing is hidden and you own everything.** No generated files, no magic, no wrapper binary between you and Docker. Every Dockerfile and compose file is right there for you to read and edit.
- **Nothing new to learn.** What you use is plain `docker compose`, knowledge that transfers straight to production and to every other project. Our [CLI](/docs/cli) is an optional nicety, never a requirement.

For Symfony specifically, Laradock wires a production-style NGINX + PHP-FPM stack (FrankenPHP is also available as a web server if you want it), MySQL/PostgreSQL/MariaDB, and a `workspace` container with Composer, the Symfony console, Node, npm and git already installed.

## Run Symfony on Docker with Laradock

### 1. Add Laradock to your project

```bash
cd my-symfony-app
git clone https://github.com/laradock/laradock.git
cd laradock && cp .env.example .env
```

(No Symfony app yet? Clone Laradock first, then create one from the workspace container in the next steps.)

### 2. Pick the services your app needs

Most Symfony apps need a web server, a database, and PHP-FPM (the web server pulls PHP-FPM in automatically):

```bash
docker compose up -d nginx mysql workspace
```

Prefer PostgreSQL or MariaDB? Swap the name: `docker compose up -d nginx postgres workspace`. Need Redis for cache and sessions later, or Mercure for real-time updates? Add it any time: `docker compose up -d redis` or `docker compose up -d mercure`. The full catalog is [here](/docs/Intro#supported-services).

Prefer to be asked? The optional [CLI](/docs/cli) detects Symfony and pre-selects nginx/mysql for you: `./laradock setup`, then `./laradock up`. It prints every real command it runs.

### 3. Point Symfony at the containers

In your app's `.env`, set `DATABASE_URL` to the service name as the hostname:

```env
DATABASE_URL="mysql://default:secret@mysql:3306/default?serverVersion=8.4&charset=utf8mb4"
```

The default database, user and password live in `mysql/defaults.env`; override any of them by adding the line to Laradock's `.env` (it always wins).

### 4. Run your app from the workspace

Enter the shell where Composer, the Symfony console and Node live, and run the usual commands:

```bash
docker compose exec workspace bash
composer create-project symfony/skeleton .   # only if you have no Symfony app yet
composer require doctrine
php bin/console doctrine:database:create
php bin/console doctrine:migrations:migrate
```

Then open [http://localhost](http://localhost). That is a full Symfony app running on Docker.

## Change the PHP version anytime

This is where a native install hurts and Laradock shines. Set the version in Laradock's `.env` and rebuild:

```env
PHP_VERSION=8.3
```

```bash
docker compose build php-fpm workspace
```

Symfony 7 requires PHP 8.2 or newer, and Laradock covers anything from PHP 5.6 to 8.5, so the same tool runs a legacy Symfony 4 project on an older PHP version and a brand-new Symfony 7 one side by side, each isolated, none of it installed on your machine.

## Frequently Asked Questions

### Do I need to install PHP or Composer to run Symfony with Laradock?

No. Everything lives inside the containers. Composer, the Symfony console, Node, npm and git are all in the `workspace` container; you never install PHP on your host.

### Which services should I start for a typical Symfony app?

`nginx mysql workspace` covers most apps. Swap `mysql` for `postgres` or `mariadb` if you prefer, and add extras like `redis` (cache/sessions) or `mercure` (real-time) whenever a feature needs them.

### Can I run multiple Symfony apps on different PHP versions?

Yes. Give each its own Laradock with a unique `COMPOSE_PROJECT_NAME` and `DATA_PATH_HOST`, set a different `PHP_VERSION` in each, and they run independently on the same machine.

### Does this work the same on macOS, Windows and Linux?

Yes. Laradock runs anywhere Docker runs. On macOS/Windows, file-sync speed depends on Docker Desktop (VirtioFS helps a lot for `vendor/`-heavy apps); it is a Docker Desktop trait, not specific to Laradock.

### Is this the same Docker setup I would use in production?

The containers are production-style (real NGINX + PHP-FPM, or FrankenPHP if you choose it), so it is far closer to production than the built-in Symfony CLI server. See [Prepare Laradock for Production](/docs/usage#prepare-laradock-for-production) for the hardening steps.

---

Comparing environments? See the full **[Laradock vs Others](/docs/laradock-alternatives)** breakdown. Ready to start? **[Getting Started](/docs/getting-started)** takes about five minutes.
