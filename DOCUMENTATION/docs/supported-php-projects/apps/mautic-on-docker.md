---
slug: /mautic-on-docker
title: Run Mautic on Docker
description: Run Mautic on Docker in minutes with Laradock. What Docker gives a Mautic instance, why Laradock is the fastest way to get NGINX, PHP, MySQL and cron running, and the exact commands, with any PHP version, without installing anything on your machine.
keywords:
  - mautic on docker
  - run mautic on docker
  - mautic docker
  - mautic docker setup
  - dockerize mautic
  - mautic docker environment
  - mautic nginx mysql docker
---

## What is Mautic?

[Mautic](https://www.mautic.org) is an open source marketing automation platform for email campaigns, landing pages, lead scoring and segmentation, built on the Symfony framework. A Mautic instance is a PHP application backed by MySQL or MariaDB, served through a web server, and it leans heavily on cron: campaign triggers, segment updates and scheduled email sends are all processed by console commands that need to run on a schedule, not just by the web request cycle.

## Why run Mautic in Docker?

Docker packages each of those pieces (NGINX, PHP-FPM, MySQL) into isolated containers that run the same on every machine. Instead of installing PHP and MySQL onto your laptop, where versions collide between projects and "works on my machine" starts, you run disposable containers that mirror production and vanish cleanly when you delete them. One Mautic instance can run on a specific PHP version while another project runs a different one, on the same computer, with nothing installed globally.

The catch: wiring those containers together yourself (base images, PHP extensions, networking, permissions, cron) is a week of fiddly Docker work. That is exactly what Laradock removes.

## Why Laradock is the best fit for Mautic

Mautic has no official Docker image maintained by the Mautic project itself; the closest things are community-maintained images. Here is why Laradock is the best fit:

- **You are never locked into one ecosystem.** Laradock is framework-agnostic. Run Mautic today, add a Laravel API or a WordPress marketing site beside it tomorrow, all in the same environment with the same commands.
- **Far more flexibility.** 100+ ready services and any PHP version from 5.6 to 8.5, so Mautic gets exactly the runtime and extensions its current release needs.
- **Nothing is hidden and you own everything.** No generated files, no magic, no wrapper binary between you and Docker. Every Dockerfile and compose file is right there for you to read and edit, which matters when you need to tune PHP's `max_execution_time` or memory limit for a large campaign send.
- **Nothing new to learn.** What you use is plain `docker compose`, knowledge that transfers straight to production and to every other project. Our [CLI](/docs/cli) is an optional nicety, never a requirement.

Concretely, for Mautic it gives you a production-style NGINX + PHP-FPM stack, MySQL/MariaDB already wired, and a `workspace` container with Composer, git and console access, from which you also run the cron commands campaign processing depends on.

## Run Mautic on Docker with Laradock

### 1. Add Laradock to your project

```bash
cd my-mautic-instance
git clone https://github.com/laradock/laradock.git
cd laradock && cp .env.example .env
```

(No Mautic codebase yet? Clone Laradock first, then pull one down from the workspace container in the next steps.)

### 2. Pick the services your instance needs

Mautic needs a web server and a database. The web server pulls in PHP-FPM automatically:

```bash
docker compose up -d nginx mysql workspace
```

Prefer MariaDB instead? Swap the name: `docker compose up -d nginx mariadb workspace`. The full catalog is [here](/docs/Intro#supported-services).

Prefer to be asked? The optional [CLI](/docs/cli) walks you through the choices: `./laradock setup`, then `./laradock up`. It prints every real command it runs.

### 3. Point Mautic at the containers

Mautic's CLI installer accepts the database connection as flags, which get written into its `app/config/local.php`. Use the service name as the host:

```bash
php bin/console mautic:install --force \
  https://localhost \
  --db_driver=pdo_mysql --db_host=mysql --db_name=default \
  --db_user=default --db_password=secret \
  --admin_email=you@example.com --admin_password=secret
```

The default database, user and password live in Laradock's `mysql/defaults.env`; override any of them by adding the line to Laradock's `.env` (it always wins).

### 4. Install and run your instance

Enter the `workspace` container, where Composer and the console live, place or clone the Mautic codebase, and run the installer above:

```bash
docker compose exec workspace bash
composer install
php bin/console mautic:install --force https://localhost \
  --db_driver=pdo_mysql --db_host=mysql --db_name=default \
  --db_user=default --db_password=secret \
  --admin_email=you@example.com --admin_password=secret
```

Mautic also needs its scheduled commands (`mautic:segments:update`, `mautic:campaigns:update`, `mautic:campaigns:trigger`, `mautic:emails:send`) running on a schedule; add them as cron entries inside the `workspace` container, or via Laradock's own cron/scheduler service if you use one.

Then open [http://localhost](http://localhost). That is a full Mautic instance running on Docker.

## Change the PHP version anytime

This is where a native install hurts and Laradock shines. Set the version in Laradock's `.env` and rebuild:

```env
PHP_VERSION=8.3
```

```bash
docker compose build php-fpm workspace
```

Current Mautic releases target PHP 8.1 or newer; Laradock covers anything from PHP 5.6 to 8.5, so the same tool runs an older Mautic instance you have not upgraded yet and a brand-new one side by side, each isolated, none of it installed on your machine.

## Frequently Asked Questions

### Do I need to install PHP or Composer to run Mautic with Laradock?

No. Everything lives inside the containers. Composer, git and the console are all in the `workspace` container; you never install PHP on your host.

### Which services should I start for a typical Mautic instance?

`nginx mysql workspace` covers it: web server, database, and a shell to run installs, updates and cron commands from. Swap `mysql` for `mariadb` if you prefer.

### Does Mautic need cron to actually run campaigns?

Yes, and that is true regardless of how it is hosted. Segment updates, campaign triggers and scheduled sends all run through console commands, so make sure they are scheduled (via cron in the `workspace` container or Laradock's scheduler service) rather than only relying on someone visiting the site.

### Can I run multiple Mautic instances on different PHP versions?

Yes. Give each its own Laradock with a unique `COMPOSE_PROJECT_NAME` and `DATA_PATH_HOST`, set a different `PHP_VERSION` in each, and they run independently on the same machine.

### Is this the same Docker setup I would use in production?

The containers are production-style (real NGINX + PHP-FPM), so it is far closer to production than a native install. Mautic is heavier than a typical CRUD app, budget real memory and CPU for campaign processing. See [Prepare Laradock for Production](/docs/production#prepare-laradock-for-production) for the hardening steps.

---

Comparing environments? See the full **[Laradock vs Others](/docs/laradock-alternatives)** breakdown. Ready to start? **[Getting Started](/docs/getting-started)** takes about five minutes.
