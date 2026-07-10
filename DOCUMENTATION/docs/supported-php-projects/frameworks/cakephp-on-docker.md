---
slug: /cakephp-on-docker
title: Run CakePHP on Docker
description: Run any CakePHP app on Docker in minutes with Laradock. What Docker gives a CakePHP project, why Laradock is the fastest way to get NGINX, PHP and MySQL running, and the exact commands, with any PHP version, without installing anything on your machine.
keywords:
  - cakephp on docker
  - run cakephp on docker
  - cakephp docker
  - cakephp docker setup
  - dockerize cakephp
  - cakephp docker environment
  - cakephp nginx mysql docker
---

## What is CakePHP?

[CakePHP](https://cakephp.org) is a long-running, convention-over-configuration PHP framework with code generation (Bake), a built-in ORM, and scaffolding for CRUD apps. It is a common choice for admin tools and internal apps that need to be built fast. A CakePHP app needs a web server, a PHP runtime, and a database; MySQL is the default, with PostgreSQL, SQLite and SQL Server also supported out of the box.

## Why run CakePHP in Docker?

Docker packages each of those pieces (NGINX, PHP-FPM, MySQL) into isolated containers that run the same on every machine. Instead of installing PHP and MySQL onto your laptop, where versions collide between projects and "works on my machine" starts, you run disposable containers that mirror production and vanish cleanly when you delete them. One project can run PHP 8.3 while an older CakePHP 3 app runs 7.4, on the same computer, with nothing installed globally.

The catch: wiring those containers together yourself (base images, PHP extensions, networking, permissions) is a week of fiddly Docker work. That is exactly what Laradock removes.

## Why Laradock is the best fit for CakePHP

CakePHP has no official Docker tool or first-party runtime of its own, so a ready-made, no-lock-in environment matters even more. Here is why Laradock is the best fit:

- **You are never locked into one ecosystem.** Laradock is framework-agnostic. Run CakePHP today, add a Laravel API, a WordPress site, or a plain PHP script beside it tomorrow, all in the same environment with the same commands.
- **Far more flexibility.** 100+ ready services and any PHP version from 5.6 to 8.5, so a legacy CakePHP 3 app and a modern CakePHP 5 app each get exactly the runtime they need.
- **Nothing is hidden and you own everything.** No generated files, no magic, no wrapper binary between you and Docker. Every Dockerfile and compose file is right there for you to read and edit.
- **Nothing new to learn.** What you use is plain `docker compose`, knowledge that transfers straight to production. Our [CLI](/docs/cli) is an optional nicety, never a requirement.

Concretely, for CakePHP it gives you a production-style NGINX + PHP-FPM stack, MySQL/PostgreSQL already wired, a `workspace` container with Composer and git installed, and any PHP version behind a single line of config.

## Run CakePHP on Docker with Laradock

### 1. Add Laradock to your project

```bash
cd my-cakephp-app
git clone https://github.com/laradock/laradock.git
cd laradock && cp .env.example .env
```

(No CakePHP app yet? Clone Laradock first, then create one from the workspace container in the next steps.)

### 2. Pick the services your app needs

Most CakePHP apps need a web server and a database (the web server pulls in PHP-FPM automatically):

```bash
docker compose up -d nginx mysql workspace
```

Prefer PostgreSQL? Swap the name: `docker compose up -d nginx postgres workspace`. The full catalog is [here](/docs/Intro#supported-services).

Prefer to be asked? The optional [CLI](/docs/cli) detects CakePHP and pre-selects nginx/mysql for you: `./laradock setup`, then `./laradock up`. It prints every real command it runs.

### 3. Point CakePHP at the containers

In `config/app_local.php`, use the service name as the hostname under `Datasources.default`:

```php
'Datasources' => [
    'default' => [
        'host' => 'mysql',
        'username' => 'default',
        'password' => 'secret',
        'database' => 'default',
    ],
],
```

The default database, user and password live in Laradock's `mysql/defaults.env`; override any of them by adding the line to Laradock's `.env` (it always wins).

### 4. Run your app from the workspace

Enter the shell where Composer and git live, and run the usual commands:

```bash
docker compose exec workspace bash
composer create-project --prefer-dist cakephp/app .   # only if you have no CakePHP app yet
bin/cake migrations migrate
```

Then open [http://localhost](http://localhost). That is a full CakePHP app running on Docker.

## Change the PHP version anytime

This is where a native install hurts and Laradock shines. Set the version in Laradock's `.env` and rebuild:

```env
PHP_VERSION=8.2
```

```bash
docker compose build php-fpm workspace
```

CakePHP 5 requires PHP 8.1 or newer (CakePHP 4 supports 7.2+), and Laradock covers anything from PHP 5.6 to 8.5, so the same tool runs a legacy CakePHP 3 project and a current CakePHP 5 app side by side, each isolated, none of it installed on your machine.

## Frequently Asked Questions

### Do I need to install PHP or Composer to run CakePHP with Laradock?

No. Everything lives inside the containers. Composer and git are both in the `workspace` container; you never install PHP on your host.

### Which services should I start for a typical CakePHP app?

`nginx mysql workspace` covers most apps: web server, database, and a shell. Swap `mysql` for `postgres` if you prefer.

### Can I run multiple CakePHP apps on different PHP versions?

Yes. Give each its own Laradock with a unique `COMPOSE_PROJECT_NAME` and `DATA_PATH_HOST`, set a different `PHP_VERSION` in each, and they run independently on the same machine.

### Does this work the same on macOS, Windows and Linux?

Yes. Laradock runs anywhere Docker runs. On macOS/Windows, file-sync speed depends on Docker Desktop (VirtioFS helps a lot); it is a Docker Desktop trait, not specific to Laradock.

### Is this the same Docker setup I would use in production?

The containers are production-style (real NGINX + PHP-FPM), so it is far closer to production than the built-in PHP development server. See [Prepare Laradock for Production](/docs/usage#prepare-laradock-for-production) for the hardening steps.

---

Comparing environments? See the full **[Laradock vs Others](/docs/laradock-alternatives)** breakdown. Ready to start? **[Getting Started](/docs/getting-started)** takes about five minutes.
