---
slug: /api-platform-on-docker
title: Run API Platform on Docker
description: Run any API Platform app on Docker in minutes with Laradock. What Docker gives an API Platform project, why Laradock is the fastest way to get NGINX (or Caddy), PHP and PostgreSQL running, and the exact commands, with any PHP version, without installing anything on your machine.
keywords:
  - api platform on docker
  - run api platform on docker
  - api platform docker
  - api platform docker setup
  - dockerize api platform
  - api platform symfony docker
  - api platform postgresql docker
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

## What is API Platform?

[API Platform](https://api-platform.com) is a framework for building REST and GraphQL APIs, built on top of Symfony and Doctrine ORM. It is known for generating OpenAPI/Hydra documentation, filtering, pagination and validation straight from your entity classes, with minimal boilerplate. A real API Platform app needs a web server, a PHP runtime, and a database; Doctrine supports PostgreSQL (the framework's default), MySQL, MariaDB, SQLite and SQL Server.

## Why run API Platform in Docker?

Docker packages each of those pieces (a web server, PHP-FPM, PostgreSQL, ...) into isolated containers that run the same on every machine. Instead of installing PHP and PostgreSQL onto your laptop, where versions collide between projects and "works on my machine" starts, you run disposable containers that mirror production and vanish cleanly when you delete them. One project can run PHP 8.4 while another runs 8.2, on the same computer, with nothing installed globally.

The catch: wiring those containers together yourself (base images, PHP extensions, networking, permissions) is a week of fiddly Docker work. That is exactly what Laradock removes.

## Why Laradock is the best fit for API Platform

API Platform has its own official Docker distribution (Caddy-based, built on the Symfony Docker project) and a CLI installer, so, unlike most PHP projects, it does not strictly need Laradock. It is still the best fit, and here is why:

- **You are never locked into one ecosystem.** Laradock is framework-agnostic. The day you add a Laravel service, a WordPress site, or a plain PHP script beside your API Platform backend, it runs in the same environment with the same commands. API Platform's own distribution cannot do that.
- **Far more flexibility.** 100+ ready services and any PHP version from 5.6 to 8.5, versus the short curated list the official distribution gives you.
- **Nothing is hidden and you own everything.** No generated files, no magic, no wrapper binary between you and Docker. Every Dockerfile and compose file is right there for you to read and edit.
- **Nothing new to learn.** What you use is plain `docker compose`, knowledge that transfers straight to production and to every other project. Our [CLI](/docs/cli) is an optional nicety, never a requirement.

For API Platform specifically, Laradock wires a production-style NGINX + PHP-FPM stack (or Caddy, also available as a service, if you want to mirror the official distribution exactly), PostgreSQL/MySQL, and a `workspace` container with Composer, git and, if you enable `WORKSPACE_INSTALL_SYMFONY`, the Symfony CLI.

## Run API Platform on Docker with Laradock

### 1. Add Laradock to your project

```bash
cd my-api-platform-app
git clone https://github.com/laradock/laradock.git
cd laradock
```

(No API Platform app yet? Clone Laradock first, then [create one from the workspace container](#4-install-and-run-your-app).)

### 2. Pick the services your app needs

Most API Platform apps need a web server and a database. Start exactly those (the web server pulls in PHP-FPM automatically):

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock start nginx postgres workspace
```

</TabItem>
<TabItem value="compose" label="Docker Compose">

```bash
cp .env.example .env
docker compose up -d nginx postgres workspace
```

</TabItem>
</Tabs>

Prefer MySQL instead of PostgreSQL? Swap the name: `./laradock start nginx mysql workspace` (or `docker compose up -d nginx mysql workspace`). Want Caddy instead of NGINX, to match API Platform's official distribution? `./laradock start caddy postgres workspace` (or `docker compose up -d caddy postgres workspace`). The full catalog is [here](/docs/Intro#supported-services).

Prefer to be asked? The optional [CLI](/docs/cli) walks you through the choices: `./laradock setup`, then `./laradock start`. It prints every real command it runs.

### 3. Point API Platform at the containers

In your app's `.env`, set `DATABASE_URL` to the service name as hostname:

```env
DATABASE_URL="postgresql://default:secret@postgres:5432/default?serverVersion=16&charset=utf8"
```

The default database, user and password live in `postgres/defaults.env`; override any of them by adding the line to Laradock's `.env` (it always wins).

### 4. Install and run your app

Enter the `workspace` container, where Composer, git and Symfony's console live:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

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

Once inside, install and run the app:

```bash
composer create-project api-platform/api-platform .   # only if you have no API Platform files yet
bin/console doctrine:database:create
bin/console doctrine:migrations:migrate
```

Then open [http://localhost](http://localhost). That is a full API Platform app running on Docker.

## Change the PHP version anytime

This is where a native install hurts and Laradock shines. Set the version in Laradock's `.env` and rebuild:

```env
PHP_VERSION=8.3
```

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

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

API Platform requires PHP 8.2 or newer, so pick a version at or above that; each project can pin its own, isolated, none of it installed on your machine.

## Take your app live

When your API is ready, the same Laradock stack becomes your deployment. You build one hardened image of your app and ship it to the host of your choice:

```bash
./laradock ship
```

Then pick a target and follow its short guide, a single server, a managed platform, or Kubernetes: **[Deploy to Production](/docs/production)** lists every provider (Fly.io, Render, Railway, DigitalOcean, AWS, Google Cloud, Azure, Kamal, Kubernetes) with a ready config file for each. There is no per-provider magic to learn; a Docker image runs the same everywhere.

## Frequently Asked Questions

### Do I need to install PHP or Composer to run API Platform with Laradock?

No. Everything lives inside the containers. Composer, git and (optionally) the Symfony CLI are all in the `workspace` container; you never install PHP on your host.

### Which services should I start for a typical API Platform app?

`nginx postgres workspace` covers most apps. Swap `postgres` for `mysql` if you prefer, and swap `nginx` for `caddy` if you want to match API Platform's official web server choice.

### Can I run multiple API Platform apps on different PHP versions?

Yes. Give each its own Laradock with a unique `COMPOSE_PROJECT_NAME` and `DATA_PATH_HOST`, set a different `PHP_VERSION` in each, and they run independently on the same machine.

### Does this work the same on macOS, Windows and Linux?

Yes. Laradock runs anywhere Docker runs. On macOS/Windows, file-sync speed depends on Docker Desktop (VirtioFS helps a lot for `vendor/`-heavy apps); it is a Docker Desktop trait, not specific to Laradock.

### Is this the same Docker setup I would use in production?

The containers are production-style (real NGINX/Caddy + PHP-FPM), so it is far closer to production than the built-in Symfony server. See [Prepare Laradock for Production](/docs/production#prepare-laradock-for-production) for the hardening steps.

---

Comparing environments? See the full **[Laradock vs Others](/docs/laradock-alternatives)** breakdown. Ready to start? **[Getting Started](/docs/getting-started)** takes about five minutes.
