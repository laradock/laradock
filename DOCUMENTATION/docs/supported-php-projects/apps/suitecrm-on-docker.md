---
slug: /suitecrm-on-docker
title: Run SuiteCRM on Docker
description: Run SuiteCRM on Docker in minutes with Laradock. What Docker gives a SuiteCRM instance, why Laradock is the fastest way to get NGINX, PHP and MySQL running, and the exact commands, with any PHP version, without installing anything on your machine.
keywords:
  - suitecrm on docker
  - run suitecrm on docker
  - suitecrm docker
  - suitecrm docker setup
  - dockerize suitecrm
  - suitecrm docker environment
  - suitecrm nginx mysql docker
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

## What is SuiteCRM?

[SuiteCRM](https://suitecrm.com) is an open source customer relationship management platform, forked from SugarCRM's community edition, covering sales, marketing and support workflows for teams that want a self-hosted CRM instead of a SaaS one. It is a PHP application backed by a MySQL or MariaDB database, served through a web server, installed through a browser-based setup wizard, and known for wanting a healthy amount of PHP memory to run comfortably.

## Why run SuiteCRM in Docker?

Docker packages each of those pieces (NGINX, PHP-FPM, MySQL) into isolated containers that run the same on every machine. Instead of installing PHP and MySQL onto your laptop, where versions collide between projects and "works on my machine" starts, you run disposable containers that mirror production and vanish cleanly when you delete them. One SuiteCRM instance can run on an older PHP version while another project runs the latest PHP, on the same computer, with nothing installed globally.

The catch: wiring those containers together yourself (base images, PHP extensions, networking, permissions, and the generous memory limits SuiteCRM expects) is a week of fiddly Docker work. That is exactly what Laradock removes.

## Why Laradock is the best fit for SuiteCRM

SuiteCRM has no official Docker image of its own beyond community-maintained ones, so a ready-made, no-lock-in environment matters even more. Here is why Laradock is the best fit:

- **You are never locked into one ecosystem.** Laradock is framework-agnostic. Run SuiteCRM today, add a Laravel API, a WordPress marketing site, or a plain PHP script beside it tomorrow, all in the same environment with the same commands.
- **Far more flexibility.** 100+ ready services and any PHP version from 5.6 to 8.5, versus a single-purpose image with a narrow set of tags.
- **Nothing is hidden and you own everything.** No generated files, no magic, no wrapper binary between you and Docker. Every Dockerfile and compose file is right there for you to read and edit, including the PHP memory and execution-time settings SuiteCRM needs.
- **Nothing new to learn.** What you use is plain `docker compose`, knowledge that transfers straight to production. Our [CLI](/docs/cli) is an optional nicety, never a requirement.

Concretely, for SuiteCRM it gives you a production-style NGINX + PHP-FPM stack, MySQL/MariaDB already wired, and a `workspace` container with Composer and git installed.

## Run SuiteCRM on Docker with Laradock

### 1. Add Laradock to your project

```bash
cd my-suitecrm-instance
git clone https://github.com/laradock/laradock.git
cd laradock
```

(No SuiteCRM files yet? Clone Laradock first, then download and extract the SuiteCRM package from the workspace container in the next steps.)

### 2. Pick the services your instance needs

SuiteCRM needs a web server and a database. The web server pulls in PHP-FPM automatically:

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

Prefer MariaDB instead? Swap the name: `./laradock start nginx mariadb workspace` (or `docker compose up -d nginx mariadb workspace`). The full catalog is [here](/docs/Intro#supported-services).

Prefer to be asked? The optional [CLI](/docs/cli) walks you through the choices: `./laradock setup`, then `./laradock start`. It prints every real command it runs.

### 3. Point SuiteCRM at the containers

SuiteCRM's installer asks for these values in the browser; use the service name as the database host:

```
Database Type: MySQL
Host Name: mysql
Database Name: default
User Name: default
Password: secret
```

The default database, user and password live in Laradock's `mysql/defaults.env`; override any of them by adding the line to Laradock's `.env` (it always wins). SuiteCRM also benefits from a raised PHP memory limit; edit `memory_limit` in the `php-fpm/php8.3.ini` file matching your `PHP_VERSION` to at least `256M` before installing.

### 4. Install and run your instance

Enter the `workspace` container, place the SuiteCRM files in your project's web root (download the archive from [suitecrm.com](https://suitecrm.com) and extract it if you have not already):

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

Once inside, install dependencies:

```bash
composer install
```

Then open [http://localhost](http://localhost) and follow SuiteCRM's install wizard: it checks PHP extensions and memory, asks for the database details from the step above, and creates the admin account.

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

Current SuiteCRM releases need PHP 8.2, 8.3 or 8.4; Laradock covers anything from PHP 5.6 to 8.5, so the same tool runs an older SuiteCRM instance you have not upgraded yet and a brand-new one side by side, each isolated, none of it installed on your machine.

## Frequently Asked Questions

### Do I need to install PHP or MySQL to run SuiteCRM with Laradock?

No. Everything lives inside the containers. PHP, its required extensions, and the database server are all provided; you never install them on your host.

### Which services should I start for a typical SuiteCRM instance?

`nginx mysql workspace` covers most instances: web server, database, and a shell. Swap `mysql` for `mariadb` if you prefer.

### Why does SuiteCRM need a raised PHP memory limit?

SuiteCRM's admin panel, module builder and import/export tools are memory-hungry compared to a typical PHP app; the project's own docs recommend at least 256MB, more for larger datasets. Laradock's PHP config is a plain `php.ini` you control, so raising it is a one-line change and a container rebuild.

### Can I run multiple SuiteCRM instances on different PHP versions?

Yes. Give each its own Laradock with a unique `COMPOSE_PROJECT_NAME` and `DATA_PATH_HOST`, set a different `PHP_VERSION` in each, and they run independently on the same machine.

### Is this the same Docker setup I would use in production?

The containers are production-style (real NGINX + PHP-FPM), so it is far closer to production than a native install. See [Prepare Laradock for Production](/docs/production#prepare-laradock-for-production) for the hardening steps.

---

Comparing environments? See the full **[Laradock vs Others](/docs/laradock-alternatives)** breakdown. Ready to start? **[Getting Started](/docs/getting-started)** takes about five minutes.
