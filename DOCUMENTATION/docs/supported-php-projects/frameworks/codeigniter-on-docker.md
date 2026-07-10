---
slug: /codeigniter-on-docker
title: Run CodeIgniter on Docker
description: Run any CodeIgniter app on Docker in minutes with Laradock. What Docker gives a CodeIgniter project, why Laradock is the fastest way to get NGINX, PHP and MySQL running, and the exact commands, with any PHP version, without installing anything on your machine.
keywords:
  - codeigniter on docker
  - run codeigniter on docker
  - codeigniter docker
  - codeigniter docker setup
  - dockerize codeigniter
  - codeigniter docker environment
  - codeigniter nginx mysql docker
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

## What is CodeIgniter?

[CodeIgniter](https://codeigniter.com) is a lightweight PHP framework known for a small footprint and a gentle learning curve compared to heavier frameworks. It ships routing, an active-record-style query builder, and a straightforward MVC structure. A CodeIgniter app needs a web server, a PHP runtime, and a database; MySQL and MariaDB are the most common choices, with PostgreSQL and SQLite also supported out of the box.

## Why run CodeIgniter in Docker?

Docker packages each of those pieces (NGINX, PHP-FPM, MySQL) into isolated containers that run the same on every machine. Instead of installing PHP and MySQL onto your laptop, where versions collide between projects and "works on my machine" starts, you run disposable containers that mirror production and vanish cleanly when you delete them. One project can run PHP 8.3 while a legacy CodeIgniter 3 app runs 7.4, on the same computer, with nothing installed globally.

The catch: wiring those containers together yourself (base images, PHP extensions, networking, permissions) is a week of fiddly Docker work. That is exactly what Laradock removes.

## Why Laradock is the best fit for CodeIgniter

CodeIgniter has no official Docker tool or first-party runtime of its own, so a ready-made, no-lock-in environment matters even more. Here is why Laradock is the best fit:

- **You are never locked into one ecosystem.** Laradock is framework-agnostic. Run CodeIgniter today, add a Laravel API, a WordPress site, or a plain PHP script beside it tomorrow, all in the same environment with the same commands.
- **Far more flexibility.** 100+ ready services and any PHP version from 5.6 to 8.5, so a legacy CodeIgniter 3 project and a modern CodeIgniter 4 app each get exactly the runtime they need.
- **Nothing is hidden and you own everything.** No generated files, no magic, no wrapper binary between you and Docker. Every Dockerfile and compose file is right there for you to read and edit.
- **Nothing new to learn.** What you use is plain `docker compose`, knowledge that transfers straight to production. Our [CLI](/docs/cli) is an optional nicety, never a requirement.

Concretely, for CodeIgniter it gives you a production-style NGINX + PHP-FPM stack, MySQL/MariaDB already wired, a `workspace` container with Composer and git installed, and any PHP version behind a single line of config.

## Run CodeIgniter on Docker with Laradock

### 1. Add Laradock to your project

```bash
cd my-codeigniter-app
git clone https://github.com/laradock/laradock.git
cd laradock && cp .env.example .env
```

(No CodeIgniter app yet? Clone Laradock first, then create one from the workspace container in the next steps.)

### 2. Pick the services your app needs

Most CodeIgniter apps need a web server and a database (the web server pulls in PHP-FPM automatically):

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock start nginx mysql workspace
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose up -d nginx mysql workspace
```

</TabItem>
</Tabs>

Prefer MariaDB or PostgreSQL? Swap the name: `./laradock start nginx mariadb workspace` (or `docker compose up -d nginx mariadb workspace`). The full catalog is [here](/docs/Intro#supported-services).

Prefer to be asked? The optional [CLI](/docs/cli) detects CodeIgniter and pre-selects nginx/mysql for you: `./laradock setup`, then `./laradock start`. It prints every real command it runs.

### 3. Point CodeIgniter at the containers

CodeIgniter 4 reads database settings from `.env`, but each key must already exist as a property in `app/Config/Database.php` before your `.env` value can override it. Set:

```env
database.default.hostname = mysql
database.default.database = default
database.default.username = default
database.default.password = secret
```

The default database, user and password live in Laradock's `mysql/defaults.env`; override any of them by adding the line to Laradock's `.env` (it always wins).

### 4. Run your app from the workspace

Enter the shell where Composer and git live, and run the usual commands:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock workspace
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose exec workspace bash
```

</TabItem>
</Tabs>

```bash
composer create-project codeigniter4/appstarter .   # only if you have no CodeIgniter app yet
```

Then open [http://localhost](http://localhost). That is a full CodeIgniter app running on Docker.

## Change the PHP version anytime

This is where a native install hurts and Laradock shines. Set the version in Laradock's `.env` and rebuild:

```env
PHP_VERSION=8.1
```

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock rebuild php-fpm workspace
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose build php-fpm workspace
```

</TabItem>
</Tabs>

CodeIgniter 4 supports PHP 7.4 and newer, with 8.1+ recommended for the latest release, and Laradock covers anything from PHP 5.6 to 8.5, so the same tool runs an old CodeIgniter 3 codebase and a current CodeIgniter 4 app side by side, each isolated, none of it installed on your machine.

## No special install flag needed

CodeIgniter is plain PHP, so it needs no special flag: point your web server's site config at the project's `public` folder (CodeIgniter 4) or its root folder (CodeIgniter 3), exactly like the general PHP setup in [Getting Started](/docs/getting-started).

## Frequently Asked Questions

### Do I need to install PHP or Composer to run CodeIgniter with Laradock?

No. Everything lives inside the containers. Composer and git are both in the `workspace` container; you never install PHP on your host.

### Which services should I start for a typical CodeIgniter app?

`nginx mysql workspace` covers most apps: web server, database, and a shell. Swap `mysql` for `mariadb` or `postgres` if you prefer.

### Can I run multiple CodeIgniter apps on different PHP versions?

Yes. Give each its own Laradock with a unique `COMPOSE_PROJECT_NAME` and `DATA_PATH_HOST`, set a different `PHP_VERSION` in each, and they run independently on the same machine.

### Does this work the same on macOS, Windows and Linux?

Yes. Laradock runs anywhere Docker runs. On macOS/Windows, file-sync speed depends on Docker Desktop (VirtioFS helps a lot); it is a Docker Desktop trait, not specific to Laradock.

### Is this the same Docker setup I would use in production?

The containers are production-style (real NGINX + PHP-FPM), so it is far closer to production than the built-in CodeIgniter development server. See [Prepare Laradock for Production](/docs/production#prepare-laradock-for-production) for the hardening steps.

---

Comparing environments? See the full **[Laradock vs Others](/docs/laradock-alternatives)** breakdown. Ready to start? **[Getting Started](/docs/getting-started)** takes about five minutes.
