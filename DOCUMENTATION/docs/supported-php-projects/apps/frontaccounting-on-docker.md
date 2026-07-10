---
slug: /frontaccounting-on-docker
title: Run FrontAccounting on Docker
description: Run FrontAccounting on Docker in minutes with Laradock. What Docker gives a FrontAccounting install, why Laradock is the fastest way to get NGINX, PHP and MySQL running, and the exact commands, without installing anything on your machine.
keywords:
  - frontaccounting on docker
  - run frontaccounting on docker
  - frontaccounting docker
  - frontaccounting docker setup
  - dockerize frontaccounting
  - frontaccounting docker environment
  - frontaccounting nginx mysql docker
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

## What is FrontAccounting?

[FrontAccounting](https://frontaccounting.com) is an open-source, browser-based accounting and ERP application for small and medium businesses: general ledger, invoicing, inventory, banking and multi-company, multi-currency support, all in a single PHP codebase. It is a classic LAMP-style app with no build step or Node toolchain: PHP rendering pages behind a web server, backed by a MySQL database whose accounting tables need InnoDB for transactions.

## Why run FrontAccounting in Docker?

Docker packages the pieces FrontAccounting needs (NGINX, PHP-FPM, MySQL) into isolated containers that run the same on every machine. Instead of installing PHP and MySQL onto your laptop, where versions collide between projects and "works on my machine" starts, you run disposable containers that mirror production and vanish cleanly when you delete them. One project can run the PHP version FrontAccounting was tested against while another runs something entirely different, on the same computer, with nothing installed globally.

The catch: wiring those containers together yourself (base images, PHP extensions, InnoDB, networking, permissions) is a week of fiddly Docker work. That is exactly what Laradock removes.

## Why Laradock is the best fit for FrontAccounting

FrontAccounting has no official Docker image or compose file from its core team; what exists are a handful of unofficial, community-maintained images, none of them the default way to run it. That makes a ready-made, no-lock-in environment matter even more. Here is why Laradock is the best fit:

- **You are never locked into one ecosystem.** Laradock is framework-agnostic. Run FrontAccounting today, add a Laravel API, a WordPress site, or a plain PHP script beside it tomorrow, all in the same environment with the same commands.
- **Far more flexibility.** 100+ ready services and any PHP version from 5.6 to 8.5, so an older FrontAccounting install and a freshly upgraded one each get exactly the runtime they need.
- **Nothing is hidden and you own everything.** No generated files, no magic, no wrapper binary between you and Docker. Every Dockerfile and compose file is right there for you to read and edit.
- **Nothing new to learn.** What you use is plain `docker compose`, knowledge that transfers straight to production. Our [CLI](/docs/cli) is an optional nicety, never a requirement.

Concretely, for FrontAccounting it gives you a production-style NGINX + PHP-FPM stack, a MySQL container with InnoDB available out of the box, and a `workspace` container with git and Composer installed to fetch and unpack the source.

## Run FrontAccounting on Docker with Laradock

### 1. Add Laradock to your project

```bash
cd my-frontaccounting-app
git clone https://github.com/laradock/laradock.git
cd laradock && cp .env.example .env
```

(No FrontAccounting files yet? Clone Laradock first, then download the FrontAccounting release from the workspace container in the next steps.)

### 2. Pick the services FrontAccounting needs

FrontAccounting needs a web server and a MySQL database; the web server pulls in PHP-FPM automatically:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

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

The full catalog of services, if you later need a mail catcher for outgoing invoices or anything else, is [here](/docs/Intro#supported-services).

Prefer to be asked? The optional [CLI](/docs/cli) walks you through the choices: `./laradock setup`, then `./laradock up`. It prints every real command it runs.

### 3. Point FrontAccounting at the containers

FrontAccounting does not read a `.env` file; its browser-based install wizard writes the database connection into `config_db.php` for you. When the wizard asks for the database server, use the service name as the host:

```text
Host: mysql
Database: default
User: default
Password: secret
```

The default database, user and password live in `mysql/defaults.env`; override any of them by adding the line to Laradock's `.env` (it always wins).

### 4. Install and run

Enter the `workspace` container, where git and Composer live, fetch a FrontAccounting release, and make the app directory writable for the installer:

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

```bash
cd www/my-frontaccounting-app   # wherever nginx serves this project from
# download and extract a FrontAccounting release here, then:
chmod -R 777 .
```

Then open [http://localhost](http://localhost) and follow the install wizard: it creates the database schema and writes `config_db.php` and `config.php`. FrontAccounting is officially implemented and tested against MySQL, with InnoDB required for its transactional tables; the wizard will not offer PostgreSQL. Once installation finishes, tighten the permissions back down as the installer instructs. That is a full FrontAccounting install running on Docker.

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

The current FrontAccounting 2.4.x series is tested against PHP 8.0 through 8.5, and older instances still running on a legacy PHP build can be reproduced the same way, each isolated, none of it installed on your machine.

## Frequently Asked Questions

### Do I need to install PHP or MySQL to run FrontAccounting with Laradock?

No. Everything lives inside the containers. PHP, the web server and MySQL (with InnoDB) are all provided; you never install them on your host.

### Which services should I start for FrontAccounting?

`nginx mysql workspace` covers a typical install: web server, database, and a shell to fetch the source with git or Composer.

### Does FrontAccounting support PostgreSQL instead of MySQL?

Officially, no. FrontAccounting is implemented and tested against MySQL, and InnoDB is required for its transactional accounting tables; other databases are not a supported configuration, so Laradock's `mysql` service is the right choice here.

### Can I run multiple FrontAccounting instances on different PHP versions?

Yes. Give each its own Laradock with a unique `COMPOSE_PROJECT_NAME` and `DATA_PATH_HOST`, set a different `PHP_VERSION` in each, and they run independently on the same machine.

### Does this work the same on macOS, Windows and Linux?

Yes. Laradock runs anywhere Docker runs. On macOS/Windows, file-sync speed depends on Docker Desktop (VirtioFS helps a lot); it is a Docker Desktop trait, not specific to Laradock.

---

Comparing environments? See the full **[Laradock vs Others](/docs/laradock-alternatives)** breakdown. Ready to start? **[Getting Started](/docs/getting-started)** takes about five minutes.
