---
slug: /zen-cart-on-docker
title: Run Zen Cart on Docker
description: Run Zen Cart on Docker in minutes with Laradock. What Docker gives a Zen Cart store, why Laradock is the fastest way to get NGINX, PHP and MySQL running, and the exact commands, with any PHP version, without installing anything on your machine.
keywords:
  - zen cart on docker
  - run zen cart on docker
  - zen cart docker
  - zen cart docker setup
  - dockerize zen cart
  - zen cart docker environment
  - zen cart nginx mysql docker
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

## What is Zen Cart?

[Zen Cart](https://www.zen-cart.com) is one of the older open-source PHP shopping carts, first released in the early 2000s as a fork of osCommerce, and still maintained today by a small volunteer community. It is a plain PHP application, with no framework or Composer step in front of it, backed by a MySQL (or MariaDB) database and served through a web server via a browser-based installer.

## Why run Zen Cart in Docker?

Docker packages each of those pieces (NGINX, PHP-FPM, MySQL) into isolated containers that run the same on every machine. This matters more for Zen Cart than for a modern project: its current 2.x branch targets recent PHP releases, but plenty of stores still run the older 1.5.x line, which expects PHP 7.3/7.4, and mixing that with a modern PHP 8 project on the same host is exactly the kind of version collision Docker exists to avoid. Disposable containers let each store keep the PHP version its codebase actually needs, and vanish cleanly when you delete them.

The catch: wiring those containers together yourself (base images, PHP extensions, networking, permissions) is a week of fiddly Docker work. That is exactly what Laradock removes.

## Why Laradock is the best fit for Zen Cart

Zen Cart has no official Docker image or first-party runtime of its own, so a ready-made, no-lock-in environment matters even more. Here is why Laradock is the best fit:

- **You are never locked into one ecosystem.** Laradock is framework-agnostic. Run Zen Cart today, add a Laravel API, a WordPress site, or a plain PHP script beside it tomorrow, all in the same environment with the same commands.
- **Far more flexibility.** 100+ ready services and any PHP version from 5.6 to 8.5, which matters specifically here: an older Zen Cart 1.5.x store and a current 2.2.x store want different PHP versions, and Laradock gives each exactly what it needs.
- **Nothing is hidden and you own everything.** No generated files, no magic, no wrapper binary between you and Docker. Every Dockerfile and compose file is right there for you to read and edit.
- **Nothing new to learn.** What you use is plain `docker compose`, knowledge that transfers straight to production. Our [CLI](/docs/cli) is an optional nicety, never a requirement.

Concretely, for Zen Cart it gives you an NGINX + PHP-FPM stack pinned to whichever PHP version your store's codebase needs, MySQL/MariaDB already wired, and a `workspace` container with git installed to pull the code down.

## Run Zen Cart on Docker with Laradock

### 1. Add Laradock to your project

```bash
cd my-zen-cart-store
git clone https://github.com/laradock/laradock.git
cd laradock
```

(No Zen Cart files yet? Clone Laradock first, then download Zen Cart from the workspace container in the next steps.)

### 2. Pick the services your store needs

Zen Cart needs a web server and a database. The web server pulls in PHP-FPM automatically:

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

### 3. Point Zen Cart at the containers

Zen Cart's browser installer writes the database connection into its own configuration files for you. Fill the installer form with the container's service name as the host:

```
MySQL Server: mysql
Database Username: default
Database Password: secret
Database Name: default
```

The default database, user and password live in `mysql/defaults.env`; override any of them by adding the line to Laradock's `.env` (it always wins).

### 4. Install and run your store

Pull the Zen Cart source into the workspace container, then finish setup in your browser:

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
git clone https://github.com/zencart/zencart.git .   # only if you have no Zen Cart files yet
```

Open [http://localhost/zc_install](http://localhost/zc_install) and run the Zen Cart installation wizard, then delete the `zc_install` folder as it instructs. That is a full Zen Cart store running on Docker.

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

The current Zen Cart 2.x branch targets PHP 8.2 through 8.5, while older 1.5.x stores were built for PHP 7.3/7.4 and often need an older `PHP_VERSION` to run their unmodified add-ons cleanly. Laradock covers anything from PHP 5.6 to 8.5, so the same tool runs a legacy 1.5.x store and a current 2.x store side by side, each isolated, none of it installed on your machine.

## Frequently Asked Questions

### Do I need to install PHP or MySQL to run Zen Cart with Laradock?

No. Everything lives inside the containers. PHP, the web server and MySQL are all provided; you never install them on your host.

### Which services should I start for a typical Zen Cart store?

`nginx mysql workspace` covers most stores: web server, database, and a shell to pull the code down. Swap `mysql` for `mariadb` if you prefer.

### My Zen Cart store is on the older 1.5.x line. Does Laradock still work?

Yes, and this is where it helps most. Set `PHP_VERSION` to `7.4` (or whatever the store's add-ons need) in that store's own Laradock `.env`, rebuild, and the old PHP version stays isolated to that one project.

### Can I run multiple Zen Cart stores on different PHP versions?

Yes. Give each its own Laradock with a unique `COMPOSE_PROJECT_NAME` and `DATA_PATH_HOST`, set a different `PHP_VERSION` in each, and they run independently on the same machine.

### Does this work the same on macOS, Windows and Linux?

Yes. Laradock runs anywhere Docker runs. On macOS/Windows, file-sync speed depends on Docker Desktop; it is a Docker Desktop trait, not specific to Laradock.

---

Comparing environments? See the full **[Laradock vs Others](/docs/laradock-alternatives)** breakdown. Ready to start? **[Getting Started](/docs/getting-started)** takes about five minutes.
