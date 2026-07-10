---
slug: /invoice-ninja-on-docker
title: Run Invoice Ninja on Docker
description: Run Invoice Ninja on Docker in minutes with Laradock. What Docker gives an Invoice Ninja install, why Laradock is the fastest way to get NGINX, PHP and MySQL running, and the exact commands, with any PHP version, without installing anything on your machine.
keywords:
  - invoice ninja on docker
  - run invoice ninja on docker
  - invoice ninja docker
  - invoice ninja docker setup
  - dockerize invoice ninja
  - invoice ninja docker environment
  - invoice ninja nginx mysql docker
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

## What is Invoice Ninja?

[Invoice Ninja](https://invoiceninja.com) is a source-available invoicing, quoting and payments platform built for freelancers and small businesses, on top of the Laravel framework. It is known for free self-hosting, client and vendor portals, recurring invoices, time tracking and a large list of payment gateway integrations. Being a Laravel app, it genuinely needs a web server, a PHP runtime with a fairly specific extension list, and a MySQL or PostgreSQL database.

## Why run Invoice Ninja in Docker?

Docker packages each of those pieces (NGINX, PHP-FPM, MySQL) into isolated containers that run the same on every machine. Instead of installing PHP and MySQL onto your laptop, where versions collide between projects and "works on my machine" starts, you run disposable containers that mirror production and vanish cleanly when you delete them. Invoice Ninja's PHP and extension requirements have shifted from release to release; a container lets you pin exactly the version a given release needs without touching anything else installed on your machine.

The catch: wiring those containers together yourself (base images, PHP extensions, networking, permissions) is a week of fiddly Docker work. That is exactly what Laradock removes.

## Why Laradock is the best fit for Invoice Ninja

Invoice Ninja publishes its own official Docker images and Dockerfiles ([invoiceninja/dockerfiles](https://github.com/invoiceninja/dockerfiles), also on [Docker Hub](https://hub.docker.com/r/invoiceninja/invoiceninja)), so, like Laravel, it does not strictly need Laradock. It is still the best fit if Invoice Ninja is not the only thing you run, and here is why:

- **You are never locked into one ecosystem.** Laradock is framework-agnostic. The day you add a Laravel API, a WordPress marketing site, or another PHP app beside Invoice Ninja, it runs in the same environment with the same commands. A single-purpose image cannot do that.
- **Far more flexibility.** 100+ ready services and any PHP version from 5.6 to 8.5, versus the one image and PHP version the official build ships.
- **Nothing is hidden and you own everything.** No generated files, no magic, no wrapper binary between you and Docker. Every Dockerfile and compose file is right there for you to read and edit.
- **Nothing new to learn.** What you use is plain `docker compose`, knowledge that transfers straight to production and to every other project. Our [CLI](/docs/cli) is an optional nicety, never a requirement.

For Invoice Ninja specifically, Laradock wires a production-style NGINX + PHP-FPM stack, MySQL or PostgreSQL, and a `workspace` container with Composer, git and Artisan already installed, since Invoice Ninja is a Laravel app under the hood.

## Run Invoice Ninja on Docker with Laradock

### 1. Add Laradock to your project

```bash
cd my-invoiceninja-app
git clone https://github.com/laradock/laradock.git
cd laradock && cp .env.example .env
```

(No Invoice Ninja source yet? Clone Laradock first, then pull the Invoice Ninja source into your project directory from the workspace container in the next steps.)

### 2. Pick the services Invoice Ninja needs

Invoice Ninja needs a web server and a database. The web server pulls in PHP-FPM automatically:

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

Prefer PostgreSQL instead? Swap the name: `./laradock start nginx postgres workspace` (or `docker compose up -d nginx postgres workspace`). The full catalog is [here](/docs/Intro#supported-services).

Prefer to be asked? The optional [CLI](/docs/cli) walks you through the choices: `./laradock setup`, then `./laradock up`. It prints every real command it runs.

### 3. Point Invoice Ninja at the containers

In your app's `.env`, use the service names as hostnames:

```env
DB_CONNECTION=mysql
DB_HOST=mysql
DB_DATABASE=default
DB_USERNAME=default
DB_PASSWORD=secret
```

The default database, user and password live in `mysql/defaults.env`; override any of them by adding the line to Laradock's `.env` (it always wins).

### 4. Install and run your app

Enter the shell where Composer, git and Artisan live, and run the usual Laravel install steps:

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

```bash
composer install
php artisan key:generate
php artisan migrate
```

Then open [http://localhost](http://localhost) and complete the web-based `/setup` wizard to create the first account, or run `php artisan migrate:fresh --seed` beforehand if you want sample data instead.

## Change the PHP version anytime

This is where a native install hurts and Laradock shines. Set the version in Laradock's `.env` and rebuild:

```env
PHP_VERSION=8.2
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

Current Invoice Ninja releases require PHP 8.2 with extensions such as bcmath, gd, imagick, mbstring and zip already enabled in Laradock's PHP-FPM image; older self-hosted releases pinned to PHP 7.4 or 8.1 still run the same way, each isolated, none of it installed on your machine.

## Frequently Asked Questions

### Do I need to install PHP, Composer or MySQL to run Invoice Ninja with Laradock?

No. Everything lives inside the containers. Composer, git and Artisan are all in the `workspace` container; you never install PHP on your host.

### Which services should I start for a typical Invoice Ninja install?

`nginx mysql workspace` covers most installs: web server, database, and a shell. Swap `mysql` for `postgres` if you prefer.

### Should I use Laradock or Invoice Ninja's official Docker image?

The official image is fine if Invoice Ninja is the only app on the box. Reach for Laradock when you want the same environment to also run other PHP apps, need a non-default PHP version, or want every Dockerfile visible and editable.

### Can I run multiple Invoice Ninja instances on different PHP versions?

Yes. Give each its own Laradock with a unique `COMPOSE_PROJECT_NAME` and `DATA_PATH_HOST`, set a different `PHP_VERSION` in each, and they run independently on the same machine.

### Does this work the same on macOS, Windows and Linux?

Yes. Laradock runs anywhere Docker runs. On macOS/Windows, file-sync speed depends on Docker Desktop (VirtioFS helps a lot); it is a Docker Desktop trait, not specific to Laradock.

---

Comparing environments? See the full **[Laradock vs Others](/docs/laradock-alternatives)** breakdown. Ready to start? **[Getting Started](/docs/getting-started)** takes about five minutes.
