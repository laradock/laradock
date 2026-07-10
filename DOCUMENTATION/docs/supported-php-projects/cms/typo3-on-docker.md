---
slug: /typo3-on-docker
title: Run TYPO3 on Docker
description: Run TYPO3 on Docker in minutes with Laradock. What Docker gives a TYPO3 site, why Laradock is the fastest way to get NGINX, PHP, MySQL and Redis running, and the exact commands, with any PHP version, without installing anything on your machine.
keywords:
  - typo3 on docker
  - run typo3 on docker
  - typo3 docker
  - typo3 docker setup
  - dockerize typo3
  - typo3 docker environment
  - typo3 nginx mysql docker
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

## What is TYPO3?

[TYPO3](https://typo3.org) is an enterprise-grade open source CMS, common at large organizations and government sites, built around a strict content structure (TCA), multi-site and multi-language management from a single install, and a large extension ecosystem. A TYPO3 site is a PHP application backed by a database (MySQL, MariaDB, PostgreSQL and SQLite are all supported), served through a web server, and it benefits from Redis for caching on busier installs.

## Why run TYPO3 in Docker?

Docker packages each of those pieces (NGINX, PHP-FPM, MySQL, Redis) into isolated containers that run the same on every machine. Instead of installing PHP and MySQL onto your laptop, where versions collide between sites and "works on my machine" starts, you run disposable containers that mirror production and vanish cleanly when you delete them. One site can run PHP 8.3 while an older TYPO3 v11 install runs 8.1, on the same computer, with nothing installed globally.

The catch: wiring those containers together yourself (base images, PHP extensions, networking, permissions) is a week of fiddly Docker work. That is exactly what Laradock removes.

## Why Laradock is the best fit for TYPO3

TYPO3 has no official Docker tool of its own (only third-party images maintained outside the core project), so a ready-made, no-lock-in environment matters even more. Here is why Laradock is the best fit:

- **You are never locked into one ecosystem.** Laradock is framework-agnostic. Run TYPO3 today, add a Laravel API, a WordPress marketing site, or a plain PHP script beside it tomorrow, all in the same environment with the same commands.
- **Far more flexibility.** 100+ ready services and any PHP version from 5.6 to 8.5, so an older TYPO3 v11 site and a current v13 LTS site each get exactly the runtime they need.
- **Nothing is hidden and you own everything.** No generated files, no magic, no wrapper binary between you and Docker. Every Dockerfile and compose file is right there for you to read and edit.
- **Nothing new to learn.** What you use is plain `docker compose`, knowledge that transfers straight to production. Our [CLI](/docs/cli) is an optional nicety, never a requirement.

Concretely, for TYPO3 it gives you a production-style NGINX + PHP-FPM stack, MySQL/MariaDB/PostgreSQL and Redis already wired, and a `workspace` container with Composer and git installed, so `vendor/bin/typo3` commands work exactly like they would on a native install.

## Run TYPO3 on Docker with Laradock

### 1. Add Laradock to your project

```bash
cd my-typo3-site
git clone https://github.com/laradock/laradock.git
cd laradock && cp .env.example .env
```

(No TYPO3 project yet? Clone Laradock first, then create one from the workspace container in the next steps.)

### 2. Pick the services your site needs

Most TYPO3 sites need a web server, a database, and Redis for caching. Start exactly those (the web server pulls in PHP-FPM automatically):

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

Prefer PostgreSQL or MariaDB? Swap the name: `./laradock start nginx postgres redis workspace` (or `docker compose up -d nginx postgres redis workspace`). The full catalog is [here](/docs/Intro#supported-services).

Prefer to be asked? The optional [CLI](/docs/cli) walks you through the choices: `./laradock setup`, then `./laradock start`. It prints every real command it runs.

### 3. Point TYPO3 at the containers

TYPO3's install tool asks for the database connection in the browser (or via `vendor/bin/typo3 setup` on the command line); use the service name as the host:

```
Driver: mysqli
Host: mysql
Username: default
Password: secret
Database: default
```

The default database, user and password live in Laradock's `mysql/defaults.env`; override any of them by adding the line to Laradock's `.env` (it always wins).

### 4. Install and run your site

Enter the `workspace` container, where Composer and git live, and create the project:

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

Then, inside the container:

```bash
composer create-project typo3/cms-base-distribution . ^13   # only if you have no project yet
composer exec typo3 setup
```

`composer exec typo3 setup` walks you through the database connection and admin account on the command line (the browser-based install tool works the same way if you open [http://localhost/typo3/install.php](http://localhost/typo3/install.php)). Then open [http://localhost](http://localhost). That is a full TYPO3 site running on Docker.

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

TYPO3 v13 requires PHP 8.2 or newer, and v12 requires PHP 8.1 or newer; Laradock covers anything from PHP 5.6 to 8.5, so the same tool runs an older v11 site and a current v13 LTS site side by side, each isolated, none of it installed on your machine.

## Frequently Asked Questions

### Do I need to install PHP or Composer to run TYPO3 with Laradock?

No. Everything lives inside the containers. Composer and git are in the `workspace` container; you never install PHP on your host.

### Which services should I start for a typical TYPO3 site?

`nginx mysql redis workspace` covers most sites: web server, database, cache, and a shell. Swap `mysql` for `postgres` or `mariadb` if you prefer.

### Can I run multiple TYPO3 sites on different PHP versions?

Yes. Give each its own Laradock with a unique `COMPOSE_PROJECT_NAME` and `DATA_PATH_HOST`, set a different `PHP_VERSION` in each, and they run independently on the same machine.

### Does this work the same on macOS, Windows and Linux?

Yes. Laradock runs anywhere Docker runs. On macOS/Windows, file-sync speed depends on Docker Desktop (VirtioFS helps a lot for `vendor/`-heavy sites); it is a Docker Desktop trait, not specific to Laradock.

### Is this the same Docker setup I would use in production?

The containers are production-style (real NGINX + PHP-FPM), so it is far closer to production than a native install. See [Prepare Laradock for Production](/docs/production#prepare-laradock-for-production) for the hardening steps.

---

Comparing environments? See the full **[Laradock vs Others](/docs/laradock-alternatives)** breakdown. Ready to start? **[Getting Started](/docs/getting-started)** takes about five minutes.
