---
slug: /bookstack-on-docker
title: Run BookStack on Docker
description: Run BookStack on Docker in minutes with Laradock. What Docker gives a BookStack instance, why Laradock is the fastest way to get NGINX, PHP and MySQL running, and the exact commands, with any PHP version, without installing anything on your machine.
keywords:
  - bookstack on docker
  - run bookstack on docker
  - bookstack docker
  - bookstack docker setup
  - dockerize bookstack
  - bookstack docker environment
  - bookstack nginx mysql docker
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

## What is BookStack?

[BookStack](https://www.bookstackapp.com) is an open source platform for organizing documentation into a shelf, book, chapter, page hierarchy, popular as a self-hosted alternative to wiki and knowledge-base tools. It is built on the Laravel framework, so a BookStack instance is a PHP application backed by a MySQL or MariaDB database, served through a web server, with Artisan handling migrations and setup tasks just like any other Laravel app.

## Why run BookStack in Docker?

Docker packages each of those pieces (NGINX, PHP-FPM, MySQL) into isolated containers that run the same on every machine. Instead of installing PHP and MySQL onto your laptop, where versions collide between projects and "works on my machine" starts, you run disposable containers that mirror production and vanish cleanly when you delete them. One BookStack instance can run on an older PHP version while another project runs the latest PHP, on the same computer, with nothing installed globally.

The catch: wiring those containers together yourself (base images, PHP extensions, networking, permissions) is a week of fiddly Docker work. That is exactly what Laradock removes.

## Why Laradock is the best fit for BookStack

BookStack has no official Docker image of its own beyond a few community-maintained ones, so a ready-made, no-lock-in environment matters even more. Here is why Laradock is the best fit:

- **You are never locked into one ecosystem.** Laradock is framework-agnostic. Run your BookStack instance today, add a WordPress marketing site, a plain Laravel API, or any other PHP project beside it tomorrow, all in the same environment with the same commands.
- **Far more flexibility.** 100+ ready services and any PHP version from 5.6 to 8.5, versus a single-purpose image with a narrow set of tags.
- **Nothing is hidden and you own everything.** No generated files, no magic, no wrapper binary between you and Docker. Every Dockerfile and compose file is right there for you to read and edit.
- **Nothing new to learn.** What you use is plain `docker compose`, knowledge that transfers straight to production and to every other Laravel-based project. Our [CLI](/docs/cli) is an optional nicety, never a requirement.

Concretely, for BookStack it gives you a production-style NGINX + PHP-FPM stack, MySQL/MariaDB already wired, and a `workspace` container with Composer, git and Artisan already installed.

## Run BookStack on Docker with Laradock

### 1. Add Laradock to your project

```bash
cd my-bookstack-instance
git clone https://github.com/laradock/laradock.git
cd laradock && cp .env.example .env
```

(No BookStack codebase yet? Clone Laradock first, then pull one down from the workspace container in the next steps.)

### 2. Pick the services your instance needs

BookStack needs a web server and a database. The web server pulls in PHP-FPM automatically:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI" default>

```bash
./laradock start nginx mysql workspace
```

</TabItem>
<TabItem value="compose" label="Docker Compose">

```bash
docker compose up -d nginx mysql workspace
```

</TabItem>
</Tabs>

Prefer MariaDB instead? Swap the name: `./laradock start nginx mariadb workspace` (or `docker compose up -d nginx mariadb workspace`). The full catalog is [here](/docs/Intro#supported-services).

Prefer to be asked? The optional [CLI](/docs/cli) walks you through the choices: `./laradock setup`, then `./laradock up`. It prints every real command it runs.

### 3. Point BookStack at the containers

In BookStack's `.env`, use the service names as hostnames:

```env
DB_HOST=mysql
DB_DATABASE=default
DB_USERNAME=default
DB_PASSWORD=secret
```

The default database, user and password live in Laradock's `mysql/defaults.env`; override any of them by adding the line to Laradock's `.env` (it always wins).

### 4. Install and run your instance

Enter the `workspace` container, where Composer, git and Artisan live, clone or place the BookStack codebase, then run its setup:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI" default>

```bash
./laradock workspace
```

</TabItem>
<TabItem value="compose" label="Docker Compose">

```bash
docker compose exec workspace bash
```

</TabItem>
</Tabs>

Then, inside the container:

```bash
git clone https://github.com/BookStackApp/BookStack.git --branch release --single-branch .   # only if you have no codebase yet
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate
```

Then open [http://localhost](http://localhost). BookStack's default admin login is `admin@admin.com` / `password`; change it immediately after your first sign-in.

## Change the PHP version anytime

This is where a native install hurts and Laradock shines. Set the version in Laradock's `.env` and rebuild:

```env
PHP_VERSION=8.3
```

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI" default>

```bash
./laradock rebuild php-fpm workspace
```

</TabItem>
<TabItem value="compose" label="Docker Compose">

```bash
docker compose build php-fpm workspace
```

</TabItem>
</Tabs>

Current BookStack releases need PHP 8.2 or newer; Laradock covers anything from PHP 5.6 to 8.5, so the same tool runs an older BookStack instance you have not upgraded yet and a brand-new one side by side, each isolated, none of it installed on your machine.

## Frequently Asked Questions

### Do I need to install PHP or Composer to run BookStack with Laradock?

No. Everything lives inside the containers. Composer, git and Artisan are all in the `workspace` container; you never install PHP on your host.

### Which services should I start for a typical BookStack instance?

`nginx mysql workspace` covers it: web server, database, and a shell. Swap `mysql` for `mariadb` if you prefer.

### Can I run multiple BookStack instances on different PHP versions?

Yes. Give each its own Laradock with a unique `COMPOSE_PROJECT_NAME` and `DATA_PATH_HOST`, set a different `PHP_VERSION` in each, and they run independently on the same machine.

### Does this work the same on macOS, Windows and Linux?

Yes. Laradock runs anywhere Docker runs. On macOS/Windows, file-sync speed depends on Docker Desktop (VirtioFS helps a lot for `vendor/`-heavy apps); it is a Docker Desktop trait, not specific to Laradock.

### Is this the same Docker setup I would use in production?

The containers are production-style (real NGINX + PHP-FPM), so it is far closer to production than a native install. See [Prepare Laradock for Production](/docs/production#prepare-laradock-for-production) for the hardening steps.

---

Comparing environments? See the full **[Laradock vs Others](/docs/laradock-alternatives)** breakdown. Ready to start? **[Getting Started](/docs/getting-started)** takes about five minutes.
