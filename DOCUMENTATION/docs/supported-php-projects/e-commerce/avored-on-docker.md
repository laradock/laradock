---
slug: /avored-on-docker
title: Run AvoRed on Docker
description: Run AvoRed (Laravel e-commerce) on Docker in minutes with Laradock. What Docker gives an AvoRed store, why Laradock is the fastest way to get NGINX, PHP, MySQL and Redis running, and the exact commands, with any PHP version, without installing anything on your machine.
keywords:
  - avored on docker
  - run avored on docker
  - avored docker
  - avored docker setup
  - dockerize avored
  - avored docker environment
  - avored laravel mysql docker
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

## What is AvoRed?

[AvoRed](https://github.com/avored/laravel-ecommerce) is an open-source Laravel e-commerce package that adds a GraphQL-first shopping cart and admin to a Laravel app, aimed at teams that want a headless catalog/checkout API rather than a bundled front end. As a Laravel package it needs whatever Laravel needs: a web server, PHP-FPM, and a MySQL or MariaDB database; Redis is a common addition for cache and sessions once traffic grows.

## Why run AvoRed in Docker?

Docker packages each of those pieces (NGINX, PHP-FPM, MySQL, Redis) into isolated containers that run the same on every machine. Instead of installing PHP and MySQL onto your laptop, where versions collide between projects and "works on my machine" starts, you run disposable containers that mirror production and vanish cleanly when you delete them. One project can run PHP 8.2 while another Laravel app runs a different version, on the same computer, with nothing installed globally.

The catch: wiring those containers together yourself (base images, PHP extensions, networking, permissions) is a week of fiddly Docker work. That is exactly what Laradock removes.

## Why Laradock is the best fit for AvoRed

AvoRed has no Docker tool of its own; being a Laravel package it can lean on Laravel's own tooling, but nothing AvoRed-specific is shipped by the project. Here is why Laradock is the best fit:

- **You are never locked into one ecosystem.** Laradock is framework-agnostic. The day you add a plain Laravel API, a WordPress site, or a separate PHP script beside your AvoRed store, it runs in the same environment with the same commands.
- **Far more flexibility.** 100+ ready services and any PHP version from 5.6 to 8.5, so an older AvoRed install and a current one each get exactly the runtime they need.
- **Nothing is hidden and you own everything.** No generated files, no magic, no wrapper binary between you and Docker. Every Dockerfile and compose file is right there for you to read and edit.
- **Nothing new to learn.** What you use is plain `docker compose`, knowledge that transfers straight to production and to every other Laravel project. Our [CLI](/docs/cli) is an optional nicety, never a requirement.

Concretely, for AvoRed it gives you a production-style NGINX + PHP-FPM stack, MySQL/MariaDB and Redis already wired, and a `workspace` container with Composer, Node, npm, git and Artisan already installed.

## Run AvoRed on Docker with Laradock

### 1. Add Laradock to your project

```bash
cd my-avored-app
git clone https://github.com/laradock/laradock.git
cd laradock
```

(No Laravel app yet? Clone Laradock first, then create one from the `workspace` container in the next steps; AvoRed is added into it as a Composer package.)

### 2. Pick the services your app needs

AvoRed needs whatever a Laravel app needs: a web server and a database. Redis is optional but recommended for cache and sessions:

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

Prefer MariaDB over MySQL? Swap the name: `./laradock start nginx mariadb redis workspace`. The full catalog is [here](/docs/Intro#supported-services).

### 3. Point Laravel at the containers

In your app's `.env`, use the service names as hostnames:

```env
DB_HOST=mysql
REDIS_HOST=redis
```

The default database, user and password live in `mysql/defaults.env`; override any of them by adding the line to Laradock's `.env` (it always wins).

### 4. Install and run your store

Enter the `workspace` container, where Artisan, Composer and npm live, scaffold a fresh Laravel app and add AvoRed to it:

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

Once inside the container:

```bash
composer create-project laravel/laravel .
composer require avored/framework
php artisan avored:install
php artisan vendor:publish --provider="AvoRed\Framework\AvoRedServiceProvider"
```

`avored:install` runs the migrations and walks you through the initial setup. Then open [http://localhost](http://localhost); the GraphQL API is exposed at `/graphiql`. That is a full AvoRed store running on Docker.

## Change the PHP version anytime

This is where a native install hurts and Laradock shines. Set the version in Laradock's `.env` and rebuild:

```env
PHP_VERSION=8.2
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

AvoRed tracks Laravel's own PHP requirements, so match `PHP_VERSION` to the Laravel release you scaffold (check `avored/framework`'s `composer.json` for the exact floor if you are pinning an older Laravel version); the same tool can still run an older Laravel app on a lower PHP version in a separate Laradock instance, each isolated, none of it installed on your machine.

## Frequently Asked Questions

### Do I need to install PHP or Composer to run AvoRed with Laradock?

No. Everything lives inside the containers. Composer, Node, npm, git and Artisan are all in the `workspace` container; you never install PHP on your host.

### Do I need a Laravel app before I can add AvoRed?

Yes. AvoRed is installed as a Composer package into a Laravel project (`composer require avored/framework`), it is not a standalone download.

### Which services should I start for a typical AvoRed store?

`nginx mysql redis workspace` covers most projects: web server, database, cache, and a shell. Swap `mysql` for `mariadb` if you prefer.

### Can I run multiple AvoRed projects on different PHP versions?

Yes. Give each its own Laradock with a unique `COMPOSE_PROJECT_NAME` and `DATA_PATH_HOST`, set a different `PHP_VERSION` in each, and they run independently on the same machine.

### Is this the same Docker setup I would use in production?

The containers are production-style (real NGINX + PHP-FPM), so it is far closer to production than a native install. See [Prepare Laradock for Production](/docs/production#prepare-laradock-for-production) for the hardening steps.

---

Comparing environments? See the full **[Laradock vs Others](/docs/laradock-alternatives)** breakdown. Ready to start? **[Getting Started](/docs/getting-started)** takes about five minutes.
