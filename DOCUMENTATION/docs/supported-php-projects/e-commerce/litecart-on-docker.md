---
slug: /litecart-on-docker
title: Run LiteCart on Docker
description: Run LiteCart on Docker in minutes with Laradock. What Docker gives a LiteCart store, why Laradock is the fastest way to get NGINX, PHP and MySQL running, and the exact commands, with any PHP version, without installing anything on your machine.
keywords:
  - litecart on docker
  - run litecart on docker
  - litecart docker
  - litecart docker setup
  - dockerize litecart
  - litecart docker environment
  - litecart nginx mysql docker
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

## What is LiteCart?

[LiteCart](https://www.litecart.net) is a small, free open-source PHP shopping cart built with jQuery and a minimal footprint in mind, aimed at merchants who want a lightweight store without a large framework underneath. It is a plain PHP application, with no Composer step in front of it, backed by a MySQL (or MariaDB) database and served through a web server via a browser-based installer.

## Why run LiteCart in Docker?

Docker packages each of those pieces (NGINX, PHP-FPM, MySQL) into isolated containers that run the same on every machine. Instead of installing PHP and MySQL onto your laptop, where versions collide between stores and "works on my machine" starts, you run disposable containers that mirror production and vanish cleanly when you delete them. One store can run a current PHP release while another older LiteCart install stays on an earlier version, on the same computer, with nothing installed globally.

The catch: wiring those containers together yourself (base images, PHP extensions, networking, permissions) is a week of fiddly Docker work. That is exactly what Laradock removes.

## Why Laradock is the best fit for LiteCart

LiteCart has no official Docker image or first-party runtime of its own, so a ready-made, no-lock-in environment matters even more. Here is why Laradock is the best fit:

- **You are never locked into one ecosystem.** Laradock is framework-agnostic. Run LiteCart today, add a Laravel API, a WordPress site, or a plain PHP script beside it tomorrow, all in the same environment with the same commands.
- **Far more flexibility.** 100+ ready services and any PHP version from 5.6 to 8.5, so an older LiteCart install and a store on the current release each get exactly the runtime they need.
- **Nothing is hidden and you own everything.** No generated files, no magic, no wrapper binary between you and Docker. Every Dockerfile and compose file is right there for you to read and edit.
- **Nothing new to learn.** What you use is plain `docker compose`, knowledge that transfers straight to production. Our [CLI](/docs/cli) is an optional nicety, never a requirement.

Concretely, for LiteCart it gives you a production-style NGINX + PHP-FPM stack, MySQL/MariaDB already wired, and a `workspace` container with git installed to pull the code down.

## Run LiteCart on Docker with Laradock

### 1. Add Laradock to your project

```bash
cd my-litecart-store
git clone https://github.com/laradock/laradock.git
cd laradock
```

(No LiteCart files yet? Clone Laradock first, then download LiteCart from the workspace container in the next steps.)

### 2. Pick the services your store needs

LiteCart needs a web server and a database. The web server pulls in PHP-FPM automatically:

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

Prefer MariaDB over MySQL? Swap the name: `./laradock start nginx mariadb workspace` (or `docker compose up -d nginx mariadb workspace`). The full catalog is [here](/docs/Intro#supported-services).

Prefer to be asked? The optional [CLI](/docs/cli) walks you through the choices: `./laradock setup`, then `./laradock start`. It prints every real command it runs.

### 3. Point LiteCart at the containers

LiteCart's browser installer writes the database connection into its own configuration file for you. Fill the installer form with the container's service name as the host:

```
MySQL Server: mysql
MySQL Username: default
MySQL Password: secret
MySQL Database: default
```

The default database, user and password live in `mysql/defaults.env`; override any of them by adding the line to Laradock's `.env` (it always wins).

### 4. Install and run your store

Pull the LiteCart source into the workspace container, then finish setup in your browser:

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

Once inside, clone LiteCart (only if you have no LiteCart files yet):

```bash
git clone https://github.com/litecart/litecart.git .
```

Open [http://localhost](http://localhost) and run the LiteCart installation wizard. That is a full LiteCart store running on Docker.

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

LiteCart's own requirements start at PHP 5.6 and go up through current PHP 8.x releases, with the latest stable PHP recommended for best performance; older installs with unmodified custom templates sometimes need to stay on an earlier version. Laradock covers anything from PHP 5.6 to 8.5, so the same tool runs an older LiteCart store and a current one side by side, each isolated, none of it installed on your machine.

## Frequently Asked Questions

### Do I need to install PHP or MySQL to run LiteCart with Laradock?

No. Everything lives inside the containers. PHP, the web server and MySQL are all provided; you never install them on your host.

### Which services should I start for a typical LiteCart store?

`nginx mysql workspace` covers most stores: web server, database, and a shell to pull the code down. Swap `mysql` for `mariadb` if you prefer.

### Can I run multiple LiteCart stores on different PHP versions?

Yes. Give each its own Laradock with a unique `COMPOSE_PROJECT_NAME` and `DATA_PATH_HOST`, set a different `PHP_VERSION` in each, and they run independently on the same machine.

### Does this work the same on macOS, Windows and Linux?

Yes. Laradock runs anywhere Docker runs. On macOS/Windows, file-sync speed depends on Docker Desktop; it is a Docker Desktop trait, not specific to Laradock.

### Is this the same Docker setup I would use in production?

The containers are production-style (real NGINX + PHP-FPM), so it is far closer to production than a native install. See [Prepare Laradock for Production](/docs/production#prepare-laradock-for-production) for the hardening steps.

---

Comparing environments? See the full **[Laradock vs Others](/docs/laradock-alternatives)** breakdown. Ready to start? **[Getting Started](/docs/getting-started)** takes about five minutes.
