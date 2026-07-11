---
slug: /leaf-php-on-docker
title: Run Leaf PHP on Docker
description: Run a Leaf PHP app on Docker in minutes with Laradock. What Docker gives a Leaf project, why Laradock is the fastest way to get NGINX, PHP and MySQL running, and the exact commands, with any PHP version, without installing anything on your machine.
keywords:
  - leaf php on docker
  - run leaf php on docker
  - leaf framework docker
  - leaf php docker setup
  - dockerize leaf php
  - leaf php docker environment
  - leaf php nginx mysql docker
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

## What is Leaf PHP?

[Leaf](https://leafphp.dev) is a modern, lightweight PHP framework built for simplicity and speed, in the same spirit as Slim or Express.js rather than a heavier full-stack framework. Its own CLI can scaffold a project, and the optional Leaf MVC skeleton adds routing, a query builder (Leaf DB) and a config-driven structure on top of the minimal core. A typical Leaf app needs a web server, a PHP runtime, and, once Leaf DB is involved, a real database: usually MySQL or PostgreSQL.

## Why run Leaf PHP in Docker?

Docker packages a web server, PHP-FPM and a database into isolated containers that run the same on every machine. Instead of installing PHP and MySQL onto your laptop, where versions collide between projects and "works on my machine" starts, you run disposable containers that mirror production and vanish cleanly when you delete them. One project can run PHP 8.4 while another runs 8.1, on the same computer, with nothing installed globally.

The catch: wiring those containers together yourself (base images, PHP extensions, networking, permissions) is a week of fiddly Docker work. That is exactly what Laradock removes.

## Why Laradock is the best fit for Leaf PHP

Leaf has its own CLI for scaffolding a new project, but it does not set up Docker or any database containers for you, so a ready-made, no-lock-in environment still matters. Here is why Laradock is the best fit:

- **You are never locked into one ecosystem.** Laradock is framework-agnostic. Run Leaf today, and put a Laravel API or a WordPress site beside it tomorrow, all in the same environment with the same commands.
- **Far more flexibility.** 100+ ready services and any PHP version from 5.6 to 8.5, versus setting up a database and web server by hand for every new Leaf project.
- **Nothing is hidden and you own everything.** No generated files, no magic, no wrapper binary between you and Docker. Every Dockerfile and compose file is right there for you to read and edit.
- **Nothing new to learn.** What you use is plain `docker compose`, knowledge that transfers straight to production. Our [CLI](/docs/cli) is an optional nicety, never a requirement.

For Leaf PHP specifically, Laradock wires a production-style NGINX + PHP-FPM stack, MySQL/PostgreSQL already set up, and a `workspace` container with Composer and git installed.

## Run Leaf PHP on Docker with Laradock

### 1. Add Laradock to your project

```bash
cd my-leaf-app
git clone https://github.com/laradock/laradock.git
cd laradock
```

(No Leaf app yet? Clone Laradock first, then create one from the workspace container in the next steps.)

### 2. Pick the services your app needs

Most Leaf MVC apps need a web server and a database (the web server pulls in PHP-FPM automatically):

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock start nginx mysql workspace
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
cp .env.example .env
docker compose up -d nginx mysql workspace
```

</TabItem>
</Tabs>

Prefer PostgreSQL? Swap the name: `./laradock start nginx postgres workspace` (or `docker compose up -d nginx postgres workspace`). The full catalog is [here](/docs/Intro#supported-services).

### 3. Point Leaf at the containers

In your app's `.env`, use the service name as the database host:

```env
DB_CONNECTION=mysql
DB_HOST=mysql
DB_PORT=3306
DB_DATABASE=default
DB_USERNAME=default
DB_PASSWORD=secret
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
composer create-project leafs/mvc .   # only if you have no app yet
composer install
```

Then open [http://localhost](http://localhost). That is a full Leaf app running on Docker.

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

Leaf currently supports PHP 7.4 and newer, with the project moving its minimum requirement to PHP 8.1. Laradock covers anything from PHP 5.6 to 8.5, so an older app and a brand-new one run side by side, each isolated, none of it installed on your machine.

## Frequently Asked Questions

### Do I need to install PHP or Composer to run Leaf with Laradock?

No. Everything lives inside the containers. Composer and git are in the `workspace` container; you never install PHP on your host.

### Which services should I start for a typical Leaf app?

`nginx mysql workspace` covers most apps. Swap `mysql` for `postgres` if you prefer.

### Can I run multiple Leaf apps on different PHP versions?

Yes. Give each its own Laradock with a unique `COMPOSE_PROJECT_NAME` and `DATA_PATH_HOST`, set a different `PHP_VERSION` in each, and they run independently on the same machine.

### Does this work the same on macOS, Windows and Linux?

Yes. Laradock runs anywhere Docker runs. On macOS/Windows, file-sync speed depends on Docker Desktop (VirtioFS helps a lot); it is a Docker Desktop trait, not specific to Laradock.

### Is this the same Docker setup I would use in production?

The containers are production-style (real NGINX + PHP-FPM), so it is far closer to production than the built-in PHP development server. See [Prepare Laradock for Production](/docs/production#prepare-laradock-for-production) for the hardening steps.

---

Comparing environments? See the full **[Laradock vs Others](/docs/laradock-alternatives)** breakdown. Ready to start? **[Getting Started](/docs/getting-started)** takes about five minutes.
