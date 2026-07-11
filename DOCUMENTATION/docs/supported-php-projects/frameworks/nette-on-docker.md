---
slug: /nette-on-docker
title: Run Nette on Docker
description: Run a Nette app on Docker in minutes with Laradock. What Docker gives a Nette project, why Laradock is the fastest way to get NGINX, PHP and MySQL running, and the exact commands, with any PHP version, without installing anything on your machine.
keywords:
  - nette on docker
  - run nette on docker
  - nette framework docker
  - nette docker setup
  - dockerize nette
  - nette docker environment
  - nette nginx mysql docker
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

## What is Nette?

[Nette](https://nette.org) is a mature Czech PHP framework known for its Latte templating engine, the Tracy debugger, and configuration written in the NEON format rather than YAML or PHP arrays. It has a long track record and a stable, tightly designed core. A Nette app needs a web server, a PHP runtime, and, once the Nette Database layer or Doctrine is involved, a real database: commonly MySQL or PostgreSQL.

## Why run Nette in Docker?

Docker packages a web server, PHP-FPM and a database into isolated containers that run the same on every machine. Instead of installing PHP and MySQL onto your laptop, where versions collide between projects and "works on my machine" starts, you run disposable containers that mirror production and vanish cleanly when you delete them. One project can run PHP 8.4 while another runs an older Nette 2.x app, on the same computer, with nothing installed globally.

The catch: wiring those containers together yourself (base images, PHP extensions, networking, permissions) is a week of fiddly Docker work. That is exactly what Laradock removes.

## Why Laradock is the best fit for Nette

Nette has no official Docker tool or first-party runtime of its own, so a ready-made, no-lock-in environment matters even more. Here is why Laradock is the best fit:

- **You are never locked into one ecosystem.** Laradock is framework-agnostic. Run Nette today, and put a Laravel API, a Symfony service, or a plain PHP script beside it tomorrow, all in the same environment with the same commands.
- **Far more flexibility.** 100+ ready services and any PHP version from 5.6 to 8.5, so a legacy Nette 2.x app and a current Nette 3.x app each get exactly the runtime they need.
- **Nothing is hidden and you own everything.** No generated files, no magic, no wrapper binary between you and Docker. Every Dockerfile and compose file is right there for you to read and edit.
- **Nothing new to learn.** What you use is plain `docker compose`, knowledge that transfers straight to production. Our [CLI](/docs/cli) is an optional nicety, never a requirement.

For Nette specifically, Laradock wires a production-style NGINX + PHP-FPM stack, MySQL/PostgreSQL already set up, and a `workspace` container with Composer and git installed.

## Run Nette on Docker with Laradock

### 1. Add Laradock to your project

```bash
cd my-nette-app
git clone https://github.com/laradock/laradock.git
cd laradock
```

(No Nette app yet? Clone Laradock first, then create one from the workspace container in the next steps.)

### 2. Pick the services your app needs

Most Nette apps need a web server and a database (the web server pulls in PHP-FPM automatically):

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

Prefer PostgreSQL? Swap the name: `./laradock start nginx postgres workspace` (or `docker compose up -d nginx postgres workspace`). The full catalog is [here](/docs/Intro#supported-services).

### 3. Point Nette at the containers

In `app/config/common.neon`, use the service name as the database host:

```neon
database:
    dsn: 'mysql:host=mysql;dbname=default;charset=utf8mb4'
    user: default
    password: secret
```

The default database, user and password live in Laradock's `mysql/defaults.env`; override any of them by adding the line to Laradock's `.env` (it always wins). Point NGINX's document root at Nette's `www/` folder, which is its equivalent of `public/`.

### 4. Run your app from the workspace

Enter the shell where Composer and git live, and install dependencies:

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
composer create-project nette/web-project .   # only if you have no app yet
composer install
```

Make sure the `temp/` and `log/` directories are writable by the web server user. Then open [http://localhost](http://localhost). That is a full Nette app running on Docker.

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

The current `nette/web-project` skeleton requires PHP 8.2 or newer, while older Nette 2.x apps run on PHP 7.1 and up. Laradock covers anything from PHP 5.6 to 8.5, so the same tool runs a legacy Nette app and a brand-new one side by side, each isolated, none of it installed on your machine.

## Take your app live

When your app is ready, the same Laradock stack becomes your deployment. You build one hardened image of your app and ship it to the host of your choice:

```bash
./laradock ship
```

Then pick a target and follow its short guide, a single server, a managed platform, or Kubernetes: **[Deploy to Production](/docs/production)** lists every provider (Fly.io, Render, Railway, DigitalOcean, AWS, Google Cloud, Azure, Kamal, Kubernetes) with a ready config file for each. There is no per-provider magic to learn; a Docker image runs the same everywhere.

## Frequently Asked Questions

### Do I need to install PHP or Composer to run Nette with Laradock?

No. Everything lives inside the containers. Composer and git are in the `workspace` container; you never install PHP on your host.

### Which services should I start for a typical Nette app?

`nginx mysql workspace` covers most apps. Swap `mysql` for `postgres` if you prefer.

### Can I run multiple Nette apps on different PHP versions?

Yes. Give each its own Laradock with a unique `COMPOSE_PROJECT_NAME` and `DATA_PATH_HOST`, set a different `PHP_VERSION` in each, and they run independently on the same machine.

### Does this work the same on macOS, Windows and Linux?

Yes. Laradock runs anywhere Docker runs. On macOS/Windows, file-sync speed depends on Docker Desktop (VirtioFS helps a lot); it is a Docker Desktop trait, not specific to Laradock.

### Is this the same Docker setup I would use in production?

The containers are production-style (real NGINX + PHP-FPM), so it is far closer to production than a native install. See [Prepare Laradock for Production](/docs/production#prepare-laradock-for-production) for the hardening steps.

---

Comparing environments? See the full **[Laradock vs Others](/docs/laradock-alternatives)** breakdown. Ready to start? **[Getting Started](/docs/getting-started)** takes about five minutes.
