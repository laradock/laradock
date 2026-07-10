---
slug: /crater-on-docker
title: Run Crater on Docker
description: Run Crater invoicing on Docker in minutes with Laradock. What Docker gives a Crater instance, why Laradock is the fastest way to get NGINX, PHP and MySQL running, and the exact commands, with any PHP version, without installing anything on your machine.
keywords:
  - crater on docker
  - run crater on docker
  - crater docker
  - crater docker setup
  - dockerize crater
  - crater docker environment
  - crater nginx mysql docker
---

## What is Crater?

[Crater](https://craterapp.com) is an open source invoicing and expense-tracking app for freelancers and small businesses, built on Laravel with a Vue frontend. A Crater instance is a PHP application backed by a MySQL or MariaDB database, served through a web server, with Composer and a browser-based setup wizard handling installation. Release activity has slowed noticeably in the last couple of years; the codebase still works and is worth self-hosting, but check the project's GitHub activity before relying on it for anything mission-critical.

## Why run Crater in Docker?

Docker packages each of those pieces (NGINX, PHP-FPM, MySQL) into isolated containers that run the same on every machine. Instead of installing PHP and MySQL onto your laptop, where versions collide between projects and "works on my machine" starts, you run disposable containers that mirror production and vanish cleanly when you delete them. One Crater instance can run on an older, pinned PHP version while another project runs the latest PHP, on the same computer, with nothing installed globally.

The catch: wiring those containers together yourself (base images, PHP extensions, networking, permissions) is a week of fiddly Docker work. That is exactly what Laradock removes.

## Why Laradock is the best fit for Crater

Crater has no official Docker image from the core project itself, only a handful of community-maintained ones. Here is why Laradock is the best fit:

- **You are never locked into one ecosystem.** Laradock is framework-agnostic. Run Crater today, add a WordPress site or a plain Laravel API beside it tomorrow, all in the same environment with the same commands.
- **Far more flexibility.** 100+ ready services and any PHP version from 5.6 to 8.5, useful given how long an install like Crater can sit on an older PHP version between updates.
- **Nothing is hidden and you own everything.** No generated files, no magic, no wrapper binary between you and Docker. Every Dockerfile and compose file is right there for you to read and edit, which matters for a project whose upstream activity you may need to patch around yourself.
- **Nothing new to learn.** What you use is plain `docker compose`, knowledge that transfers straight to production and to every other Laravel-based project. Our [CLI](/docs/cli) is an optional nicety, never a requirement.

Concretely, for Crater it gives you a production-style NGINX + PHP-FPM stack, MySQL/MariaDB already wired, and a `workspace` container with Composer, Node, npm and git already installed.

## Run Crater on Docker with Laradock

### 1. Add Laradock to your project

```bash
cd my-crater-instance
git clone https://github.com/laradock/laradock.git
cd laradock && cp .env.example .env
```

(No Crater codebase yet? Clone Laradock first, then pull one down from the workspace container in the next steps.)

### 2. Pick the services your instance needs

Crater needs a web server and a database. The web server pulls in PHP-FPM automatically:

```bash
docker compose up -d nginx mysql workspace
```

Prefer MariaDB instead? Swap the name: `docker compose up -d nginx mariadb workspace`. The full catalog is [here](/docs/Intro#supported-services).

Prefer to be asked? The optional [CLI](/docs/cli) walks you through the choices: `./laradock setup`, then `./laradock up`. It prints every real command it runs.

### 3. Point Crater at the containers

In Crater's `.env`, use the service names as hostnames:

```env
DB_HOST=mysql
DB_DATABASE=default
DB_USERNAME=default
DB_PASSWORD=secret
```

The default database, user and password live in Laradock's `mysql/defaults.env`; override any of them by adding the line to Laradock's `.env` (it always wins).

### 4. Install and run your instance

Enter the `workspace` container, where Composer, Node and npm live, clone or place the Crater codebase, and prepare it:

```bash
docker compose exec workspace bash
git clone https://github.com/crater-invoice-inc/crater.git --single-branch .   # only if you have no codebase yet
composer install
cp .env.example .env
php artisan key:generate
```

Then open [http://localhost](http://localhost) and complete Crater's browser-based install wizard, which writes the rest of the configuration and runs the migrations for you.

## Change the PHP version anytime

This is where a native install hurts and Laradock shines. Set the version in Laradock's `.env` and rebuild:

```env
PHP_VERSION=8.2
```

```bash
docker compose build php-fpm workspace
```

Crater targets PHP 7.4 and newer; Laradock covers anything from PHP 5.6 to 8.5, so the same tool runs an older Crater instance you have not upgraded yet and a brand-new one side by side, each isolated, none of it installed on your machine.

## Frequently Asked Questions

### Do I need to install PHP or Composer to run Crater with Laradock?

No. Everything lives inside the containers. Composer, Node, npm and git are all in the `workspace` container; you never install PHP on your host.

### Which services should I start for a typical Crater instance?

`nginx mysql workspace` covers it: web server, database, and a shell. Swap `mysql` for `mariadb` if you prefer.

### Is Crater still actively maintained?

Release activity has slowed compared to its early years; check the project's GitHub repository for the current pace before depending on it for production invoicing. It still installs and runs fine on a supported PHP version either way.

### Can I run multiple Crater instances on different PHP versions?

Yes. Give each its own Laradock with a unique `COMPOSE_PROJECT_NAME` and `DATA_PATH_HOST`, set a different `PHP_VERSION` in each, and they run independently on the same machine.

### Is this the same Docker setup I would use in production?

The containers are production-style (real NGINX + PHP-FPM), so it is far closer to production than a native install. See [Prepare Laradock for Production](/docs/usage#prepare-laradock-for-production) for the hardening steps.

---

Comparing environments? See the full **[Laradock vs Others](/docs/laradock-alternatives)** breakdown. Ready to start? **[Getting Started](/docs/getting-started)** takes about five minutes.
