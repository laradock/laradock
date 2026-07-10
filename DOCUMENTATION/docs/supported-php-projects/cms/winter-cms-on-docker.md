---
slug: /winter-cms-on-docker
title: Run Winter CMS on Docker
description: Run Winter CMS on Docker in minutes with Laradock. What Docker gives a Laravel-based Winter CMS project, why Laradock is the fastest way to get NGINX, PHP, MySQL and Redis running, and the exact commands, without installing anything on your machine.
keywords:
  - winter cms on docker
  - run winter cms on docker
  - winter cms docker
  - winter cms docker setup
  - dockerize winter cms
  - winter cms docker environment
  - winter cms laravel docker
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

## What is Winter CMS?

[Winter CMS](https://wintercms.com) is a free, self-hosted CMS built on the Laravel framework. It was forked from October CMS in 2021 and is community-maintained, keeping the same architecture: Laravel routing and the Eloquent ORM underneath, plus a plugin and theme system on top. It is a full Laravel-style application, installed through Composer, backed by MySQL, MariaDB, PostgreSQL or SQLite, served through a web server and a PHP runtime.

## Why run Winter CMS in Docker?

Docker packages each of those pieces (NGINX, PHP-FPM, MySQL, Redis) into isolated containers that run the same on every machine. Instead of installing PHP and MySQL onto your laptop, where versions collide between projects and "works on my machine" starts, you run disposable containers that mirror production and vanish cleanly when you delete them. One site can run PHP 8.3 while another runs 8.1, on the same computer, with nothing installed globally.

The catch: wiring those containers together yourself (base images, PHP extensions, networking, permissions) is a week of fiddly Docker work. That is exactly what Laradock removes.

## Why Laradock is the best fit for Winter CMS

Winter CMS has no official Docker image of its own; being Laravel-based, it can lean on Laravel-oriented tools like Sail, but nothing that ships with the project itself. Here is why Laradock is the best fit:

- **You are never locked into one ecosystem.** Laradock is framework-agnostic. Run Winter CMS today, add a plain Laravel API, a WordPress site, or a Symfony service beside it tomorrow, all in the same environment with the same commands.
- **Far more flexibility.** 100+ ready services and any PHP version from 5.6 to 8.5, versus the short curated list a Laravel-only tool gives you.
- **Nothing is hidden and you own everything.** No generated files, no magic, no wrapper binary between you and Docker. Every Dockerfile and compose file is right there for you to read and edit.
- **Nothing new to learn.** What you use is plain `docker compose`, knowledge that transfers straight to production. Our [CLI](/docs/cli) is an optional nicety, never a requirement.

Concretely, for Winter CMS it gives you a production-style NGINX + PHP-FPM stack, MySQL/PostgreSQL and Redis already wired, and a `workspace` container with Composer, Node, npm, git and Artisan already installed.

## Run Winter CMS on Docker with Laradock

### 1. Add Laradock to your project

```bash
cd my-winter-site
git clone https://github.com/laradock/laradock.git
cd laradock && cp .env.example .env
```

(No Winter CMS files yet? Clone Laradock first, then create the project from the workspace container in the next steps.)

### 2. Pick the services your site needs

Most Winter CMS sites need a web server, a database, and Redis for cache. The web server pulls in PHP-FPM automatically:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock start nginx mysql redis workspace
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose up -d nginx mysql redis workspace
```

</TabItem>
</Tabs>

Need Postgres instead of MySQL? Swap the name: `./laradock start nginx postgres redis workspace` (or `docker compose up -d nginx postgres redis workspace`). The full catalog is [here](/docs/Intro#supported-services).

Prefer to be asked? The optional [CLI](/docs/cli) walks you through the choices: `./laradock setup`, then `./laradock up`. It prints every real command it runs.

### 3. Point Winter CMS at the containers

In your project's `.env`, use the service names as hostnames:

```env
DB_HOST=mysql
REDIS_HOST=redis
```

The default database, user and password live in `mysql/defaults.env`; override any of them by adding the line to Laradock's `.env` (it always wins).

### 4. Install and run your site

Enter the shell where Composer, Node and Artisan live, and run the installer:

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
composer create-project wintercms/winter .   # only if you have no Winter CMS project yet
php artisan winter:up
```

`composer create-project` runs the interactive `winter:install` wizard for you, asking for the database connection, site URL and admin account. Then open [http://localhost](http://localhost). That is a full Winter CMS site running on Docker.

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
<TabItem value="docker" label="Docker Compose">

```bash
docker compose build php-fpm workspace
```

</TabItem>
</Tabs>

Winter CMS requires PHP 8.1 or newer (8.2+ recommended), so a project pinned to an older supported release and a brand-new one can run side by side on different PHP versions, each isolated, none of it installed on your machine.

## Frequently Asked Questions

### Do I need to install PHP or Composer to run Winter CMS with Laradock?

No. Everything lives inside the containers. Composer, Node, npm, git and Artisan are all in the `workspace` container; you never install PHP on your host.

### Which services should I start for a typical Winter CMS site?

`nginx mysql redis workspace` covers most sites. Swap `mysql` for `postgres` if you prefer.

### Can I run multiple Winter CMS sites on different PHP versions?

Yes. Give each its own Laradock with a unique `COMPOSE_PROJECT_NAME` and `DATA_PATH_HOST`, set a different `PHP_VERSION` in each, and they run independently on the same machine.

### Does this work the same on macOS, Windows and Linux?

Yes. Laradock runs anywhere Docker runs. On macOS/Windows, file-sync speed depends on Docker Desktop (VirtioFS helps a lot for `vendor/`-heavy sites); it is a Docker Desktop trait, not specific to Laradock.

### Is this the same Docker setup I would use in production?

The containers are production-style (real NGINX + PHP-FPM), so it is far closer to production than a native install. See [Prepare Laradock for Production](/docs/production#prepare-laradock-for-production) for the hardening steps.

---

Comparing environments? See the full **[Laradock vs Others](/docs/laradock-alternatives)** breakdown. Ready to start? **[Getting Started](/docs/getting-started)** takes about five minutes.
