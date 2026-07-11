---
slug: /cachet-on-docker
title: Run Cachet on Docker
description: Run Cachet, the self-hosted status page system, on Docker in minutes with Laradock. What Docker gives a Cachet instance, why Laradock is the fastest way to get NGINX, PHP and MySQL running, and the exact commands, without installing anything on your machine.
keywords:
  - cachet on docker
  - run cachet on docker
  - cachet docker
  - cachet docker setup
  - dockerize cachet
  - cachet status page docker
  - cachet nginx mysql docker
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

## What is Cachet?

[Cachet](https://cachethq.io) is an open source, self-hosted status page system for publishing incident history and component uptime, built on Laravel. A Cachet instance is a PHP application backed by MySQL, MariaDB, PostgreSQL or SQLite, served through a web server, with Artisan handling installation and migrations. Worth knowing before you commit to it: the last stable v2 release shipped in November 2023, and a v3 rewrite (Laravel, Inertia, Vue) has been in public progress since 2023 without a committed release date, so treat the project's pace as slow rather than dead, and check its GitHub activity for the current state before depending on it.

## Why run Cachet in Docker?

Docker packages each of those pieces (NGINX, PHP-FPM, MySQL) into isolated containers that run the same on every machine. Instead of installing PHP and MySQL onto your laptop, where versions collide between projects and "works on my machine" starts, you run disposable containers that mirror production and vanish cleanly when you delete them. One Cachet instance can run on a specific PHP version while another project runs a different one, on the same computer, with nothing installed globally.

The catch: wiring those containers together yourself (base images, PHP extensions, networking, permissions) is a week of fiddly Docker work. That is exactly what Laradock removes.

## Why Laradock is the best fit for Cachet

Cachet has no actively maintained official Docker image of its own; older community images exist but track the project's own slow pace. Here is why Laradock is the best fit:

- **You are never locked into one ecosystem.** Laradock is framework-agnostic. Run Cachet today, add a Laravel API or a WordPress site beside it tomorrow, all in the same environment with the same commands.
- **Far more flexibility.** 100+ ready services and any PHP version from 5.6 to 8.5, useful given how long a slow-moving project like this can sit on an older PHP version.
- **Nothing is hidden and you own everything.** No generated files, no magic, no wrapper binary between you and Docker. Every Dockerfile and compose file is right there for you to read and edit, which matters when a project's own tooling has stalled.
- **Nothing new to learn.** What you use is plain `docker compose`, knowledge that transfers straight to production and to every other Laravel-based project. Our [CLI](/docs/cli) is an optional nicety, never a requirement.

Concretely, for Cachet it gives you a production-style NGINX + PHP-FPM stack, MySQL/MariaDB/PostgreSQL already wired, and a `workspace` container with Composer, git and Artisan already installed.

## Run Cachet on Docker with Laradock

### 1. Add Laradock to your project

```bash
cd my-cachet-instance
git clone https://github.com/laradock/laradock.git
cd laradock
```

(No Cachet codebase yet? Clone Laradock first, then pull one down from the workspace container in the next steps.)

### 2. Pick the services your instance needs

Cachet needs a web server and a database. The web server pulls in PHP-FPM automatically:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI" default>

```bash
./laradock start nginx mysql workspace
```

</TabItem>
<TabItem value="compose" label="Docker Compose">

```bash
cp .env.example .env
docker compose up -d nginx mysql workspace
```

</TabItem>
</Tabs>

Prefer PostgreSQL instead? Swap the name: `./laradock start nginx postgres workspace` (or `docker compose up -d nginx postgres workspace`). The full catalog is [here](/docs/Intro#supported-services).

Prefer to be asked? The optional [CLI](/docs/cli) walks you through the choices: `./laradock setup`, then `./laradock start`. It prints every real command it runs.

### 3. Point Cachet at the containers

In Cachet's `.env`, use the service names as hostnames:

```env
DB_CONNECTION=mysql
DB_HOST=mysql
DB_DATABASE=default
DB_USERNAME=default
DB_PASSWORD=secret
```

The default database, user and password live in Laradock's `mysql/defaults.env`; override any of them by adding the line to Laradock's `.env` (it always wins).

### 4. Install and run your instance

Enter the `workspace` container, where Composer, git and Artisan live, clone or place the Cachet codebase, and run its setup:

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
git clone https://github.com/cachethq/cachet.git --branch 2.4 --single-branch .   # only if you have no codebase yet
composer install --no-dev -o
cp .env.example .env
php artisan key:generate
php artisan cachet:install
```

Then open [http://localhost](http://localhost). That is a full Cachet instance running on Docker.

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

Cachet's current stable release targets PHP 8.2 or newer; Laradock covers anything from PHP 5.6 to 8.5, so the same tool runs an older Cachet instance you have not upgraded yet and a brand-new one side by side, each isolated, none of it installed on your machine.

## Take your status page live

When your Cachet instance is ready, the same Laradock stack becomes your deployment. You build one hardened image of your app and ship it to the host of your choice:

```bash
./laradock ship
```

Then pick a target and follow its short guide, a single server, a managed platform, or Kubernetes: **[Deploy to Production](/docs/production)** lists every provider (Fly.io, Render, Railway, DigitalOcean, AWS, Google Cloud, Azure, Kamal, Kubernetes) with a ready config file for each. There is no per-provider magic to learn; a Docker image runs the same everywhere.

## Frequently Asked Questions

### Do I need to install PHP or Composer to run Cachet with Laradock?

No. Everything lives inside the containers. Composer, git and Artisan are all in the `workspace` container; you never install PHP on your host.

### Which services should I start for a typical Cachet instance?

`nginx mysql workspace` covers it: web server, database, and a shell. Swap `mysql` for `postgres` if you prefer.

### Is Cachet still being actively developed?

The pace is slow: the last stable v2 release was November 2023, and a v3 rewrite has been publicly in progress since 2023 without a committed date. It still installs and runs; check the project's GitHub activity before depending on it for anything critical.

### Can I run multiple Cachet instances on different PHP versions?

Yes. Give each its own Laradock with a unique `COMPOSE_PROJECT_NAME` and `DATA_PATH_HOST`, set a different `PHP_VERSION` in each, and they run independently on the same machine.

### Is this the same Docker setup I would use in production?

The containers are production-style (real NGINX + PHP-FPM), so it is far closer to production than a native install. See [Prepare Laradock for Production](/docs/production#prepare-laradock-for-production) for the hardening steps.

---

Comparing environments? See the full **[Laradock vs Others](/docs/laradock-alternatives)** breakdown. Ready to start? **[Getting Started](/docs/getting-started)** takes about five minutes.
