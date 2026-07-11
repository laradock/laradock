---
slug: /aureus-erp-on-docker
title: Run Aureus ERP on Docker
description: Run Aureus ERP on Docker in minutes with Laradock. What Docker gives an Aureus ERP install, why Laradock is the fastest way to get NGINX, PHP, MySQL and Redis running, and the exact commands, without installing anything on your machine.
keywords:
  - aureus erp on docker
  - run aureus erp on docker
  - aureus erp docker
  - aureus erp docker setup
  - dockerize aureus erp
  - aureus erp docker environment
  - aureus erp nginx mysql docker
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

## What is Aureus ERP?

[Aureus ERP](https://aureuserp.com) is an open-source ERP platform built on Laravel and FilamentPHP. It ships as a set of installable modules, accounting/finance, inventory, sales, CRM, HR and recruitment, and purchasing among them, so a business can start with only the modules it needs and add more later. Under the hood it is a Laravel application with a Filament admin panel, which means it needs the same infrastructure as any Laravel app: a web server, a PHP runtime, and a database, with Redis recommended once you move past a single-user trial.

## Why run Aureus ERP in Docker?

Docker packages each of those pieces (NGINX, PHP-FPM, MySQL, Redis) into isolated containers that run the same on every machine. Instead of installing PHP and MySQL onto your laptop, where versions collide between projects and "works on my machine" starts, you run disposable containers that mirror production and vanish cleanly when you delete them. Aureus ERP's own requirements are fairly specific too (PHP 8.2+, generous memory and execution-time limits, particular PHP extensions), and Docker means you never have to fight your host machine to match them.

The catch: wiring those containers together yourself (base images, PHP extensions, networking, permissions) is a week of fiddly Docker work. That is exactly what Laradock removes.

## Why Laradock is the best fit for Aureus ERP

The Aureus ERP repository does ship a `docker-compose.yml`, but it is the standard Laravel Sail file (a `laravel.test` app container plus MySQL, Redis and Mailpit), not a purpose-built ERP deployment tool. It is a fine quick trial, but it is still just Sail, so the same tradeoffs apply:

- **You are never locked into one ecosystem.** Laradock is framework-agnostic. Run Aureus ERP today, add a separate reporting service, a Symfony API, or a plain PHP script beside it tomorrow, all in the same environment with the same commands.
- **Far more flexibility.** 100+ ready services and any PHP version from 5.6 to 8.5, versus the short list Sail's default compose file gives you.
- **Nothing is hidden and you own everything.** No generated files, no magic, no wrapper binary between you and Docker. Every Dockerfile and compose file is right there for you to read and edit.
- **Nothing new to learn.** What you use is plain `docker compose`, knowledge that transfers straight to production and to every other project. Our [CLI](/docs/cli) is an optional nicety, never a requirement.

For Aureus ERP specifically, Laradock wires a production-style NGINX + PHP-FPM stack, MySQL and Redis, and a `workspace` container with Composer, Node and Artisan already installed, so the ERP's PHP-extension and memory requirements are handled by the image instead of your host.

## Run Aureus ERP on Docker with Laradock

### 1. Add Laradock to your project

```bash
cd my-aureus-erp-app
git clone https://github.com/laradock/laradock.git
cd laradock
```

(No Aureus ERP files yet? Clone Laradock first, then pull Aureus ERP from the workspace container in the next steps.)

### 2. Pick the services Aureus ERP needs

Aureus ERP needs a web server, a database, and Redis once you go beyond a single user. The web server pulls in PHP-FPM automatically:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock start nginx mysql redis workspace
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
cp .env.example .env
docker compose up -d nginx mysql redis workspace
```

</TabItem>
</Tabs>

MySQL 8.0+ is what Aureus ERP recommends; the full service catalog (including alternatives) is [here](/docs/Intro#supported-services).

Prefer to be asked? The optional [CLI](/docs/cli) walks you through the choices: `./laradock setup`, then `./laradock start`. It prints every real command it runs.

### 3. Point Aureus ERP at the containers

Aureus ERP is a standard Laravel app, so in its `.env`, use the service names as hostnames:

```env
DB_CONNECTION=mysql
DB_HOST=mysql
REDIS_HOST=redis
```

The default database, user and password live in `mysql/defaults.env`; override any of them by adding the line to Laradock's `.env` (it always wins).

### 4. Install and run Aureus ERP

Enter the `workspace` container, where Composer, Node and Artisan live, and run the project's own installer:

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
composer install
cp .env.example .env
php artisan key:generate
php artisan erp:install
```

`erp:install` runs the migrations and seeders, sets up Filament Shield roles and permissions, and walks you through creating an admin account. Then open [http://localhost](http://localhost). That is a full Aureus ERP install running on Docker.

## Change the PHP version anytime

This is where a native install hurts and Laradock shines. Aureus ERP asks for PHP 8.2 or higher; set it in Laradock's `.env` and rebuild:

```env
PHP_VERSION=8.3
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

Bump it later to track a new Aureus ERP release, all without touching anything installed on your host.

## Frequently Asked Questions

### Do I need to install PHP, Composer or MySQL to run Aureus ERP with Laradock?

No. Everything lives inside the containers. Composer, Node and Artisan are all in the `workspace` container; you never install PHP or MySQL on your host.

### Which services should I start for Aureus ERP?

`nginx mysql redis workspace` covers it: web server, database, cache, and a shell with the tooling you need. Aureus ERP recommends MySQL 8.0+; SQLite is an option for a minimal trial but is not recommended for real use.

### Does Aureus ERP need more resources than a typical Laravel app?

Its own documentation recommends generous PHP memory and execution-time limits and at least 4GB of RAM on the host, since it is running an admin panel and multiple business modules at once. Give the containers enough memory in your Docker settings accordingly.

### Can I run Aureus ERP alongside other PHP projects on different PHP versions?

Yes. Give each its own Laradock with a unique `COMPOSE_PROJECT_NAME` and `DATA_PATH_HOST`, set a different `PHP_VERSION` in each, and they run independently on the same machine.

### Is this the same Docker setup I would use in production?

The containers are production-style (real NGINX + PHP-FPM), so it is far closer to production than the default Sail compose file. See [Prepare Laradock for Production](/docs/production#prepare-laradock-for-production) for the hardening steps.

---

Comparing environments? See the full **[Laradock vs Others](/docs/laradock-alternatives)** breakdown. Ready to start? **[Getting Started](/docs/getting-started)** takes about five minutes.
