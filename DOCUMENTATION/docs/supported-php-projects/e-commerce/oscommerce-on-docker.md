---
slug: /oscommerce-on-docker
title: Run osCommerce on Docker
description: Run osCommerce on Docker in minutes with Laradock. What Docker gives an osCommerce store, why Laradock is the fastest way to get NGINX, PHP and MySQL running, and the exact commands, with any PHP version, without installing anything on your machine.
keywords:
  - oscommerce on docker
  - run oscommerce on docker
  - oscommerce docker
  - oscommerce docker setup
  - dockerize oscommerce
  - oscommerce docker environment
  - oscommerce nginx mysql docker
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

## What is osCommerce?

[osCommerce](https://www.oscommerce.com) is one of the oldest open-source PHP shopping carts still in use, originally released in 2000, and the ancestor several other carts (including Zen Cart) forked from. It is a plain PHP application backed by a MySQL or MariaDB database, served through a web server via a browser-based installer, with no framework or Composer step in front of it.

## Why run osCommerce in Docker?

Docker packages each of those pieces (NGINX, PHP-FPM, MySQL) into isolated containers that run the same on every machine. This matters more for osCommerce than for a modern project: its current osCommerce 4 line targets recent PHP versions, but the older 2.3.x/2.4.x legacy branches only run cleanly on PHP 5.x through 7.1, and mixing that with a modern PHP 8 project on the same host is exactly the kind of version collision Docker exists to avoid. Disposable containers let each store keep the PHP version its codebase actually needs, and vanish cleanly when you delete them.

The catch: wiring those containers together yourself (base images, PHP extensions, networking, permissions) is a week of fiddly Docker work. That is exactly what Laradock removes.

## Why Laradock is the best fit for osCommerce

osCommerce has no official Docker image or first-party runtime of its own, so a ready-made, no-lock-in environment matters even more. Here is why Laradock is the best fit:

- **You are never locked into one ecosystem.** Laradock is framework-agnostic. Run osCommerce today, add a Laravel API, a WordPress site, or a plain PHP script beside it tomorrow, all in the same environment with the same commands.
- **Far more flexibility.** 100+ ready services and any PHP version from 5.6 to 8.5, which matters specifically here: a legacy osCommerce 2.3.x/2.4.x install and a current osCommerce 4 store want very different PHP versions, and Laradock gives each exactly what it needs.
- **Nothing is hidden and you own everything.** No generated files, no magic, no wrapper binary between you and Docker. Every Dockerfile and compose file is right there for you to read and edit.
- **Nothing new to learn.** What you use is plain `docker compose`, knowledge that transfers straight to production. Our [CLI](/docs/cli) is an optional nicety, never a requirement.

Concretely, for osCommerce it gives you an NGINX + PHP-FPM stack pinned to whichever PHP version your store's codebase needs, MySQL/MariaDB already wired, and a `workspace` container with git installed to pull the code down.

## Run osCommerce on Docker with Laradock

### 1. Add Laradock to your project

```bash
cd my-oscommerce-store
git clone https://github.com/laradock/laradock.git
cd laradock
```

(No osCommerce files yet? Clone Laradock first, then download osCommerce from the workspace container in the next steps.)

### 2. Pick the services your store needs

osCommerce needs a web server and a database. The web server pulls in PHP-FPM automatically:

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

Prefer MariaDB over MySQL? Swap the name: `./laradock start nginx mariadb workspace`. The full catalog is [here](/docs/Intro#supported-services).

Prefer to be asked? The optional [CLI](/docs/cli) walks you through the choices: `./laradock setup`, then `./laradock start`. It prints every real command it runs.

### 3. Point osCommerce at the containers

osCommerce's browser installer writes the database connection into its own configuration files for you. Fill the installer form with the container's service name as the host:

```
Database Server: mysql
Database Username: default
Database Password: secret
Database Name: default
```

The default database, user and password live in `mysql/defaults.env`; override any of them by adding the line to Laradock's `.env` (it always wins).

### 4. Install and run your store

Pull the osCommerce source into the workspace container, then finish setup in your browser:

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

Once inside, pull the osCommerce source:

```bash
git clone https://github.com/osCommerce/osCommerce-V4.git .   # only if you have no osCommerce files yet
```

Open [http://localhost](http://localhost) and run the osCommerce installation wizard. That is a full osCommerce store running on Docker.

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

osCommerce 4 works with PHP 7.2 and up (through current 8.x releases), while the older 2.3.x/2.4.x legacy branches are only reliable on PHP 5.x through 7.1 and generally need an older `PHP_VERSION` to avoid deprecation and removed-function errors. Laradock covers anything from PHP 5.6 to 8.5, so the same tool runs a legacy 2.x store and a current osCommerce 4 store side by side, each isolated, none of it installed on your machine.

## Take your store live

When your store is ready, the same Laradock stack becomes your deployment. You build one hardened image of your app and ship it to the host of your choice:

```bash
./laradock ship
```

Then pick a target and follow its short guide, a single server, a managed platform, or Kubernetes: **[Deploy to Production](/docs/production)** lists every provider (Fly.io, Render, Railway, DigitalOcean, AWS, Google Cloud, Azure, Kamal, Kubernetes) with a ready config file for each. There is no per-provider magic to learn; a Docker image runs the same everywhere.

## Frequently Asked Questions

### Do I need to install PHP or MySQL to run osCommerce with Laradock?

No. Everything lives inside the containers. PHP, the web server and MySQL are all provided; you never install them on your host.

### Which services should I start for a typical osCommerce store?

`nginx mysql workspace` covers most stores: web server, database, and a shell to pull the code down. Swap `mysql` for `mariadb` if you prefer.

### My store is on the legacy osCommerce 2.3.x/2.4.x line. Does Laradock still work?

Yes, and this is where it helps most. Set `PHP_VERSION` to `7.1` or lower in that store's own Laradock `.env`, rebuild, and the old PHP version stays isolated to that one project without touching your other work.

### Can I run multiple osCommerce stores on different PHP versions?

Yes. Give each its own Laradock with a unique `COMPOSE_PROJECT_NAME` and `DATA_PATH_HOST`, set a different `PHP_VERSION` in each, and they run independently on the same machine.

### Does this work the same on macOS, Windows and Linux?

Yes. Laradock runs anywhere Docker runs. On macOS/Windows, file-sync speed depends on Docker Desktop; it is a Docker Desktop trait, not specific to Laradock.

---

Comparing environments? See the full **[Laradock vs Others](/docs/laradock-alternatives)** breakdown. Ready to start? **[Getting Started](/docs/getting-started)** takes about five minutes.
