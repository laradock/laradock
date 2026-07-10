---
slug: /statamic-on-docker
title: Run Statamic on Docker
description: Run Statamic on Docker in minutes with Laradock. What Docker gives a Statamic site, why Laradock is the fastest way to get NGINX and PHP running, and the exact commands, with any PHP version, without installing anything on your machine.
keywords:
  - statamic on docker
  - run statamic on docker
  - statamic docker
  - statamic docker setup
  - dockerize statamic
  - statamic docker environment
  - statamic nginx php docker
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

## What is Statamic?

[Statamic](https://statamic.com) is a CMS built on the Laravel framework, known for storing content as flat files (Markdown and YAML) instead of a database by default, while still giving developers a Laravel app to work in. A Statamic site needs a web server and a PHP runtime; no database is required out of the box, though Statamic can optionally use one (via Laravel's Eloquent) for things like users or high-volume form submissions.

## Why run Statamic in Docker?

Docker packages the pieces a PHP app needs (NGINX, PHP-FPM, and a database if you opt into one) into isolated containers that run the same on every machine. Instead of installing PHP onto your laptop, where versions collide between projects and "works on my machine" starts, you run disposable containers that mirror production and vanish cleanly when you delete them. One site can run PHP 8.3 while another runs 8.1, on the same computer, with nothing installed globally.

The catch: wiring those containers together yourself (base images, PHP extensions, networking, permissions) is a week of fiddly Docker work. That is exactly what Laradock removes.

## Why Laradock is the best fit for Statamic

Statamic has no official Docker tool of its own, so a ready-made, no-lock-in environment matters even more. Here is why Laradock is the best fit:

- **You are never locked into one ecosystem.** Laradock is framework-agnostic. Run Statamic today, add a plain Laravel API, a WordPress site, or a Symfony service beside it tomorrow, all in the same environment with the same commands.
- **Far more flexibility.** 100+ ready services and any PHP version from 5.6 to 8.5, plus every database Statamic can optionally plug into, ready the moment a project needs one.
- **Nothing is hidden and you own everything.** No generated files, no magic, no wrapper binary between you and Docker. Every Dockerfile and compose file is right there for you to read and edit.
- **Nothing new to learn.** What you use is plain `docker compose`, knowledge that transfers straight to production. Our [CLI](/docs/cli) is an optional nicety, never a requirement.

Concretely, for Statamic it gives you a production-style NGINX + PHP-FPM stack, MySQL/PostgreSQL/Redis on standby for when a project needs them, and a `workspace` container with Composer, Node, npm and git installed, so `php please` and `php artisan` commands work exactly like they would in any Laravel app.

## Run Statamic on Docker with Laradock

### 1. Add Laradock to your project

```bash
cd my-statamic-site
git clone https://github.com/laradock/laradock.git
cd laradock && cp .env.example .env
```

(No Statamic project yet? Clone Laradock first, then create one from the workspace container in the next steps.)

### 2. Pick the services your site needs

Statamic's default flat-file mode needs nothing but a web server; PHP-FPM comes with it automatically:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI" default>

```bash
./laradock start nginx workspace
```

</TabItem>
<TabItem value="compose" label="Docker Compose">

```bash
docker compose up -d nginx workspace
```

</TabItem>
</Tabs>

Opting into a database for users or forms? Add it any time: `./laradock start mysql` (or `docker compose up -d mysql`; swap in `postgres` for Postgres). The full catalog is [here](/docs/Intro#supported-services).

Prefer to be asked? The optional [CLI](/docs/cli) walks you through the choices: `./laradock setup`, then `./laradock up`. It prints every real command it runs.

### 3. Where Statamic's content lives

There is no database host to configure for a flat-file site. Your content, collections and globals live as Markdown and YAML files under `content/` in your project, which is mounted straight from your host into the `workspace` and `nginx` containers, so edits show up immediately either way. If you later add a database, point it at the containers the same way any Laravel app would, using the service name (`mysql` or `postgres`) as the host in your project's `.env`.

### 4. Install and run your site

Enter the `workspace` container, where Composer, Node and git live, and create the project:

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
composer create-project statamic/statamic my-statamic-site   # only if you have no project yet
php please make:user
```

Then open [http://localhost](http://localhost). That is a full Statamic site running on Docker.

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

Statamic requires PHP 8.1 or newer (8.2 recommended), and Laradock covers anything from PHP 5.6 to 8.5, so the same tool runs an older site and a brand-new one side by side, each isolated, none of it installed on your machine.

## Frequently Asked Questions

### Do I need to install PHP or Composer to run Statamic with Laradock?

No. Everything lives inside the containers. Composer, Node, npm and git are all in the `workspace` container; you never install PHP on your host.

### Which services should I start for a typical Statamic site?

`nginx workspace` is enough for the default flat-file mode. Add `mysql` or `postgres` only if your site opts into a database.

### Can I run multiple Statamic sites on different PHP versions?

Yes. Give each its own Laradock with a unique `COMPOSE_PROJECT_NAME` and `DATA_PATH_HOST`, set a different `PHP_VERSION` in each, and they run independently on the same machine.

### Does this work the same on macOS, Windows and Linux?

Yes. Laradock runs anywhere Docker runs. On macOS/Windows, file-sync speed depends on Docker Desktop (VirtioFS helps a lot for `vendor/`-heavy sites); it is a Docker Desktop trait, not specific to Laradock.

### Is this the same Docker setup I would use in production?

The containers are production-style (real NGINX + PHP-FPM), so it is far closer to production than `artisan serve` or a native install. See [Prepare Laradock for Production](/docs/production#prepare-laradock-for-production) for the hardening steps.

---

Comparing environments? See the full **[Laradock vs Others](/docs/laradock-alternatives)** breakdown. Ready to start? **[Getting Started](/docs/getting-started)** takes about five minutes.
