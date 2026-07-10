---
slug: /fat-free-framework-on-docker
title: Run Fat-Free Framework (F3) on Docker
description: Run any Fat-Free Framework (F3) app on Docker in minutes with Laradock. What Docker gives an F3 project, why Laradock is the fastest way to get NGINX, PHP and a database running, and the exact commands, with any PHP version, without installing anything on your machine.
keywords:
  - fat-free framework on docker
  - f3 php on docker
  - fat free framework docker
  - fat-free docker setup
  - dockerize fat-free framework
  - f3 framework docker environment
  - fat free framework nginx docker
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

## What is Fat-Free Framework?

[Fat-Free Framework](https://fatfreeframework.com) (commonly called F3) is an extremely lightweight PHP micro-framework, a single-file core packing a router, templating engine, caching layer, and its own database abstraction (the `DB\SQL` and `DB\Jig` classes). It is known for its tiny footprint and for supporting a wide range of storage engines out of the box: MySQL, PostgreSQL, SQLite, MSSQL/Sybase, MongoDB, and its own flat-file "Jig" database. A real F3 app needs a web server, PHP, and whichever of those engines you choose.

## Why run Fat-Free Framework in Docker?

Docker packages each of those pieces (NGINX, PHP-FPM, MySQL, ...) into isolated containers that run the same on every machine. Instead of installing PHP and a database onto your laptop, where versions collide between projects and "works on my machine" starts, you run disposable containers that mirror production and vanish cleanly when you delete them. One project can run PHP 8.3 while an older F3 script runs 7.4, on the same computer, with nothing installed globally.

The catch: wiring those containers together yourself (base images, PHP extensions, networking, permissions) is a week of fiddly Docker work. That is exactly what Laradock removes.

## Why Laradock is the best fit for Fat-Free Framework

Unlike Laravel, Fat-Free Framework has no official Docker tool or first-party runtime of its own, so a ready-made, no-lock-in environment matters even more. Here is why Laradock is the best fit:

- **You are never locked into one ecosystem.** Laradock is framework-agnostic. Run an F3 app today, add a Laravel service, a WordPress site, or another plain PHP script beside it tomorrow, all in the same environment with the same commands.
- **Far more flexibility.** 100+ ready services and any PHP version from 5.6 to 8.5, so a small legacy F3 script and a bigger app each get exactly the runtime they need.
- **Nothing is hidden and you own everything.** No generated files, no magic, no wrapper binary between you and Docker. Every Dockerfile and compose file is right there for you to read and edit.
- **Nothing new to learn.** What you use is plain `docker compose`, knowledge that transfers straight to production. Our [CLI](/docs/cli) is an optional nicety, never a requirement.

Concretely, for Fat-Free Framework it gives you a production-style NGINX + PHP-FPM stack, MySQL/PostgreSQL already wired, and a `workspace` container with Composer and git installed.

## Run Fat-Free Framework on Docker with Laradock

### 1. Add Laradock to your project

```bash
cd my-f3-app
git clone https://github.com/laradock/laradock.git
cd laradock && cp .env.example .env
```

(No F3 files yet? Clone Laradock first, then install the framework from the workspace container in the next steps.)

### 2. Pick the services your app needs

Most F3 apps need a web server and a database. Start exactly those (the web server pulls in PHP-FPM automatically):

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

Prefer PostgreSQL instead? Swap the name: `./laradock start nginx postgres workspace` (or `docker compose up -d nginx postgres workspace`). The full catalog is [here](/docs/Intro#supported-services).

Prefer to be asked? The optional [CLI](/docs/cli) walks you through the choices: `./laradock setup`, then `./laradock start`. It prints every real command it runs.

### 3. Point F3 at the containers

F3 has no fixed config file convention; most apps load settings from a `config.ini` via `$f3->config('config.ini')`, then open a `DB\SQL` connection with a DSN string pointing at the service name:

```php
$f3->set('DB', new DB\SQL('mysql:host=mysql;port=3306;dbname=default', 'default', 'secret'));
```

The default database, user and password live in `mysql/defaults.env`; override any of them by adding the line to Laradock's `.env` (it always wins).

### 4. Install and run your app

Enter the `workspace` container, where Composer and git live:

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

Then, inside the container:

```bash
composer require bcosca/fatfree   # only if you have no F3 files yet
```

F3 has no official `create-project` skeleton; `composer require` pulls the framework into `vendor/`, and you write your own `index.php` bootstrap (or start from one of the community skeletons on Packagist). Then open [http://localhost](http://localhost). That is a full Fat-Free Framework app running on Docker.

## Change the PHP version anytime

This is where a native install hurts and Laradock shines. Set the version in Laradock's `.env` and rebuild:

```env
PHP_VERSION=7.4
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

F3 requires PHP 7.2 or newer, so an old F3 script and a newer PHP 8 project each run on the version they need, isolated, none of it installed on your machine.

## Frequently Asked Questions

### Do I need to install PHP or Composer to run Fat-Free Framework with Laradock?

No. Everything lives inside the containers. Composer and git are in the `workspace` container; you never install PHP on your host.

### Which services should I start for a typical F3 app?

`nginx mysql workspace` covers most apps. Swap `mysql` for `postgres` if you prefer, or skip the database container if your app uses F3's flat-file Jig storage instead.

### Can I run multiple F3 apps on different PHP versions?

Yes. Give each its own Laradock with a unique `COMPOSE_PROJECT_NAME` and `DATA_PATH_HOST`, set a different `PHP_VERSION` in each, and they run independently on the same machine.

### Does this work the same on macOS, Windows and Linux?

Yes. Laradock runs anywhere Docker runs. On macOS/Windows, file-sync speed depends on Docker Desktop (VirtioFS helps a lot); it is a Docker Desktop trait, not specific to Laradock.

### Is this the same Docker setup I would use in production?

The containers are production-style (real NGINX + PHP-FPM), so it is far closer to production than PHP's built-in server. See [Prepare Laradock for Production](/docs/production#prepare-laradock-for-production) for the hardening steps.

---

Comparing environments? See the full **[Laradock vs Others](/docs/laradock-alternatives)** breakdown. Ready to start? **[Getting Started](/docs/getting-started)** takes about five minutes.
