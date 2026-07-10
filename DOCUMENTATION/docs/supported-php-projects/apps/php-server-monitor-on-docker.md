---
slug: /php-server-monitor-on-docker
title: Run PHP Server Monitor on Docker
description: Run PHP Server Monitor on Docker in minutes with Laradock. What Docker gives a PHP Server Monitor instance, why Laradock is the fastest way to get NGINX, PHP and MySQL running, and the exact commands, without installing anything on your machine.
keywords:
  - php server monitor on docker
  - run php server monitor on docker
  - phpservermon docker
  - php server monitor docker setup
  - dockerize phpservermon
  - php server monitor docker environment
  - phpservermon nginx mysql docker
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

## What is PHP Server Monitor?

[PHP Server Monitor](https://www.phpservermonitor.org) is a small, self-hosted tool for keeping an eye on servers and websites: it checks hosts and URLs on a schedule and sends an alert by email or SMS when one goes down. A PHP Server Monitor instance is a lightweight PHP application backed by a MySQL database, served through a web server, with a browser-based `install.php` script handling first-time setup and cron handling the recurring checks afterward.

## Why run PHP Server Monitor in Docker?

Docker packages each of those pieces (NGINX, PHP-FPM, MySQL) into isolated containers that run the same on every machine. Instead of installing PHP and MySQL onto your laptop or a spare server, where versions collide between projects and "works on my machine" starts, you run disposable containers that mirror production and vanish cleanly when you delete them. Even a small tool like this benefits: one monitoring instance can sit on an older, pinned PHP version while everything else on the machine runs current.

The catch: wiring those containers together yourself (base images, PHP extensions, networking, permissions) is a week of fiddly Docker work, out of proportion for a tool this small. That is exactly what Laradock removes.

## Why Laradock is the best fit for PHP Server Monitor

PHP Server Monitor has no official Docker image maintained by the core project; a few small community images exist, but they see the same modest activity as the project itself. Here is why Laradock is the best fit:

- **You are never locked into one ecosystem.** Laradock is framework-agnostic. Run PHP Server Monitor next to a Laravel app or a WordPress site, all in the same environment with the same commands.
- **Far more flexibility.** 100+ ready services and any PHP version from 5.6 to 8.5, more than a tool this size will ever need, but it means one environment covers this and everything else you run.
- **Nothing is hidden and you own everything.** No generated files, no magic, no wrapper binary between you and Docker. Every Dockerfile and compose file is right there for you to read and edit.
- **Nothing new to learn.** What you use is plain `docker compose`, knowledge that transfers straight to production and to every other project. Our [CLI](/docs/cli) is an optional nicety, never a requirement.

Concretely, for PHP Server Monitor it gives you a production-style NGINX + PHP-FPM stack, MySQL already wired, and a `workspace` container to run the install script and cron job from.

## Run PHP Server Monitor on Docker with Laradock

### 1. Add Laradock to your project

```bash
cd my-phpservermon-instance
git clone https://github.com/laradock/laradock.git
cd laradock && cp .env.example .env
```

(No PHP Server Monitor codebase yet? Clone Laradock first, then pull one down from the workspace container in the next steps.)

### 2. Pick the services your instance needs

PHP Server Monitor needs a web server and a database. The web server pulls in PHP-FPM automatically:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock start nginx mysql workspace
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose up -d nginx mysql workspace
```

</TabItem>
</Tabs>

The full catalog is [here](/docs/Intro#supported-services).

Prefer to be asked? The optional [CLI](/docs/cli) walks you through the choices: `./laradock setup`, then `./laradock start`. It prints every real command it runs.

### 3. Point PHP Server Monitor at the containers

Copy `config.php.sample` to `config.php` (or let `install.php` write it for you) and use the service name as the host:

```php
$pdo_dsn = 'mysql:host=mysql;dbname=default';
$pdo_user = 'default';
$pdo_pass = 'secret';
```

The default database, user and password live in Laradock's `mysql/defaults.env`; override any of them by adding the line to Laradock's `.env` (it always wins).

### 4. Install and run your instance

Enter the `workspace` container, place the PHP Server Monitor codebase, and let the web installer create the config and database tables:

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
git clone https://github.com/phpservermon/phpservermon.git --single-branch .   # only if you have no codebase yet
```

Then open [http://localhost/install.php](http://localhost/install.php) and follow the wizard, which writes `config.php` and creates the database tables. Afterward, schedule the check script as a cron job (in the `workspace` container or on your host, hitting the container) so servers get checked on a schedule rather than only when someone opens the page.

## Change the PHP version anytime

This is where a native install hurts and Laradock shines. Set the version in Laradock's `.env`:

```env
PHP_VERSION=8.1
```

Then run `./laradock rebuild php-fpm workspace` (or `docker compose build php-fpm workspace`) to apply it.

PHP Server Monitor is undemanding and runs on a wide range of PHP versions; Laradock covers anything from PHP 5.6 to 8.5, so you can pin whatever version matches the release you are running without touching anything else on the machine.

## Frequently Asked Questions

### Do I need to install PHP or MySQL to run PHP Server Monitor with Laradock?

No. Everything lives inside the containers. PHP and git are reachable from the `workspace` container; you never install PHP on your host.

### Which services should I start for a typical PHP Server Monitor instance?

`nginx mysql workspace` covers it: web server, database, and a shell to run the installer and cron checks from.

### Does PHP Server Monitor need cron to actually check servers?

Yes, and that is true regardless of how it is hosted. The status checks run from a script that needs to be scheduled (cron, in the `workspace` container or wherever you prefer), not just triggered by someone visiting the page.

### Can I run multiple monitoring instances on different PHP versions?

Yes. Give each its own Laradock with a unique `COMPOSE_PROJECT_NAME` and `DATA_PATH_HOST`, set a different `PHP_VERSION` in each, and they run independently on the same machine.

### Is this the same Docker setup I would use in production?

The containers are production-style (real NGINX + PHP-FPM), so it is far closer to production than a native install. See [Prepare Laradock for Production](/docs/production#prepare-laradock-for-production) for the hardening steps.

---

Comparing environments? See the full **[Laradock vs Others](/docs/laradock-alternatives)** breakdown. Ready to start? **[Getting Started](/docs/getting-started)** takes about five minutes.
