---
slug: /espocrm-on-docker
title: Run EspoCRM on Docker
description: Run EspoCRM on Docker in minutes with Laradock. What Docker gives an EspoCRM instance, why Laradock is the fastest way to get NGINX, PHP and MySQL running, and the exact commands, with any PHP version, without installing anything on your machine.
keywords:
  - espocrm on docker
  - run espocrm on docker
  - espocrm docker
  - espocrm docker setup
  - dockerize espocrm
  - espocrm docker environment
  - espocrm nginx mysql docker
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

## What is EspoCRM?

[EspoCRM](https://www.espocrm.com) is an open source customer relationship management platform with a modern, extensible interface, built for sales, support and marketing teams that want to customize entities and workflows without forking the codebase. It is a PHP application backed by a MySQL, MariaDB or PostgreSQL database, served through a web server, and installed either through a browser-based wizard or a command-line installer.

## Why run EspoCRM in Docker?

Docker packages each of those pieces (NGINX, PHP-FPM, MySQL) into isolated containers that run the same on every machine. Instead of installing PHP and MySQL onto your laptop, where versions collide between projects and "works on my machine" starts, you run disposable containers that mirror production and vanish cleanly when you delete them. One EspoCRM instance can run on an older PHP version while another project runs the latest PHP, on the same computer, with nothing installed globally.

The catch: wiring those containers together yourself (base images, PHP extensions, networking, permissions) is a week of fiddly Docker work. That is exactly what Laradock removes.

## Why Laradock is the best fit for EspoCRM

EspoCRM has no official Docker image on Docker Hub maintained by the core team as its primary distribution channel, so a ready-made, no-lock-in environment matters even more. Here is why Laradock is the best fit:

- **You are never locked into one ecosystem.** Laradock is framework-agnostic. Run EspoCRM today, add a Laravel API, a WordPress marketing site, or a plain PHP script beside it tomorrow, all in the same environment with the same commands.
- **Far more flexibility.** 100+ ready services and any PHP version from 5.6 to 8.5, versus a single-purpose image with a narrow set of tags.
- **Nothing is hidden and you own everything.** No generated files, no magic, no wrapper binary between you and Docker. Every Dockerfile and compose file is right there for you to read and edit.
- **Nothing new to learn.** What you use is plain `docker compose`, knowledge that transfers straight to production. Our [CLI](/docs/cli) is an optional nicety, never a requirement.

Concretely, for EspoCRM it gives you a production-style NGINX + PHP-FPM stack, MySQL/MariaDB/PostgreSQL already wired, and a `workspace` container with Composer and git installed.

## Run EspoCRM on Docker with Laradock

### 1. Add Laradock to your project

```bash
cd my-espocrm-instance
git clone https://github.com/laradock/laradock.git
cd laradock && cp .env.example .env
```

(No EspoCRM files yet? Clone Laradock first, then download and extract the EspoCRM package from the workspace container in the next steps.)

### 2. Pick the services your instance needs

EspoCRM needs a web server and a database. The web server pulls in PHP-FPM automatically:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI" default>

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

Prefer MariaDB or PostgreSQL instead? Swap the name: `./laradock start nginx mariadb workspace` (or `docker compose up -d nginx mariadb workspace`). The full catalog is [here](/docs/Intro#supported-services).

Prefer to be asked? The optional [CLI](/docs/cli) walks you through the choices: `./laradock setup`, then `./laradock start`. It prints every real command it runs.

### 3. Point EspoCRM at the containers

EspoCRM's installer asks for these values in the browser (or as flags to its CLI installer); use the service name as the database host:

```
Host Name: mysql
Database Name: default
User Name: default
Password: secret
```

The default database, user and password live in Laradock's `mysql/defaults.env`; override any of them by adding the line to Laradock's `.env` (it always wins).

### 4. Install and run your instance

Enter the `workspace` container, place the EspoCRM files in your project's web root (download the archive from [espocrm.com](https://www.espocrm.com) and extract it if you have not already):

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
composer install --no-dev
```

Then open [http://localhost](http://localhost) and follow EspoCRM's install wizard: it checks PHP extensions, asks for the database details from the step above, and creates the admin account.

## Change the PHP version anytime

This is where a native install hurts and Laradock shines. Set the version in Laradock's `.env` and rebuild:

```env
PHP_VERSION=8.3
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

Current EspoCRM releases need PHP 8.3 or newer; Laradock covers anything from PHP 5.6 to 8.5, so the same tool runs an older EspoCRM instance you have not upgraded yet and a brand-new one side by side, each isolated, none of it installed on your machine.

## Frequently Asked Questions

### Do I need to install PHP or MySQL to run EspoCRM with Laradock?

No. Everything lives inside the containers. PHP, its required extensions, and the database server are all provided; you never install them on your host.

### Which services should I start for a typical EspoCRM instance?

`nginx mysql workspace` covers most instances: web server, database, and a shell. Swap `mysql` for `mariadb` or `postgres` if you prefer.

### Does EspoCRM need any special PHP settings?

EspoCRM's own docs recommend `memory_limit = 256M`, plus a generous `max_execution_time` and upload limits, similar to most PHP applications with an admin UI and file imports. Edit the `memory_limit` line in `php-fpm/php8.3.ini` (or whichever `php-fpm/phpX.Y.ini` matches your `PHP_VERSION`) before installing if the defaults feel tight.

### Can I run multiple EspoCRM instances on different PHP versions?

Yes. Give each its own Laradock with a unique `COMPOSE_PROJECT_NAME` and `DATA_PATH_HOST`, set a different `PHP_VERSION` in each, and they run independently on the same machine.

### Is this the same Docker setup I would use in production?

The containers are production-style (real NGINX + PHP-FPM), so it is far closer to production than a native install. See [Prepare Laradock for Production](/docs/production#prepare-laradock-for-production) for the hardening steps.

---

Comparing environments? See the full **[Laradock vs Others](/docs/laradock-alternatives)** breakdown. Ready to start? **[Getting Started](/docs/getting-started)** takes about five minutes.
