---
slug: /kanboard-on-docker
title: Run Kanboard on Docker
description: Run Kanboard on Docker in minutes with Laradock. What Docker gives a Kanboard instance, why Laradock is the fastest way to get NGINX, PHP and a database running, and the exact commands, with any PHP version, without installing anything on your machine.
keywords:
  - kanboard on docker
  - run kanboard on docker
  - kanboard docker
  - kanboard docker setup
  - dockerize kanboard
  - kanboard docker environment
  - kanboard nginx php docker
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

## What is Kanboard?

[Kanboard](https://kanboard.org) is an open-source kanban project management tool, known for staying deliberately simple and minimalist rather than chasing every feature a heavier tool like Jira ships. It is a PHP application served through a web server, and unlike most self-hosted PHP apps on this list, it needs almost no infrastructure to run: out of the box it stores everything in a single SQLite database file, with MySQL/MariaDB and PostgreSQL available as opt-in alternatives once a team outgrows a single file.

## Why run Kanboard in Docker?

Docker packages the pieces a self-hosted app like this needs (NGINX, PHP-FPM, and a database if you add one) into isolated containers that run the same on every machine. Instead of installing PHP onto your laptop, where versions collide between projects and "works on my machine" starts, you run disposable containers that mirror production and vanish cleanly when you delete them. One Kanboard instance can run on an older PHP version while another project runs the latest PHP, on the same computer, with nothing installed globally.

The catch: wiring those containers together yourself (base images, PHP extensions, networking, permissions) is a week of fiddly Docker work. That is exactly what Laradock removes.

## Why Laradock is the best fit for Kanboard

Kanboard does ship its own official Docker image (`kanboard/kanboard` on Docker Hub), so, unlike most PHP projects, it does not strictly need Laradock. It is still the best fit, and here is why:

- **You are never locked into one ecosystem.** Laradock is framework-agnostic. The day you add a Laravel API, a WordPress site, or a plain PHP script beside your Kanboard instance, it runs in the same environment with the same commands. A single-purpose image cannot do that.
- **Far more flexibility.** 100+ ready services and any PHP version from 5.6 to 8.5, versus the narrow, pinned version the official image ships.
- **Nothing is hidden and you own everything.** No generated files, no magic, no wrapper binary between you and Docker. Every Dockerfile and compose file is right there for you to read and edit.
- **Nothing new to learn.** What you use is plain `docker compose`, knowledge that transfers straight to production and to every other project. Our [CLI](/docs/cli) is an optional nicety, never a requirement.

Concretely, for Kanboard it gives you a production-style NGINX + PHP-FPM stack, MySQL/MariaDB/PostgreSQL wired in for whenever you need them, and a `workspace` container with git and the PHP CLI to run Kanboard's maintenance commands.

## Run Kanboard on Docker with Laradock

### 1. Add Laradock to your project

```bash
cd my-kanboard-instance
git clone https://github.com/laradock/laradock.git
cd laradock
```

(No Kanboard codebase yet? Clone Laradock first, then pull one down from the workspace container in the next steps.)

### 2. Pick the services Kanboard needs

Kanboard's biggest difference from the rest of this list: it needs no database service at all to start. By default it writes to a SQLite file inside its own `data/` folder, so a web server is genuinely enough:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock start nginx workspace
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
cp .env.example .env
docker compose up -d nginx workspace
```

</TabItem>
</Tabs>

Outgrowing a single SQLite file, or setting up Kanboard for a team that needs real concurrency? Add MySQL or PostgreSQL the same way you would for any other app:

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

### 3. Point Kanboard at the containers

Kanboard reads its settings from a `config.php` file at the project root (copy `config.default.php` to get started), and every setting in that file is also readable as an environment variable of the same name. Leave `DB_DRIVER` unset and Kanboard just uses SQLite, no further config needed. To switch to MySQL/MariaDB or PostgreSQL instead, set the connection constants and point them at the service name:

```php
define('DB_DRIVER', 'mysql');
define('DB_USERNAME', 'default');
define('DB_PASSWORD', 'secret');
define('DB_HOSTNAME', 'mysql');
define('DB_NAME', 'default');
```

The default database, user and password live in `mysql/defaults.env`; override any of them by adding the line to Laradock's `.env` (it always wins).

### 4. Install and run your instance

Enter the `workspace` container, place the Kanboard codebase, and let the first request run the setup:

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

Once inside, place or clone the Kanboard codebase into the current directory.

Then open [http://localhost](http://localhost) and log in with the default admin account (`admin` / `admin`), which Kanboard prompts you to change on first login.

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

Kanboard requires PHP 8.1 or newer since version 1.2.46; Laradock covers anything from PHP 5.6 to 8.5, so the same tool runs a Kanboard instance pinned to an older release you have not upgraded yet and a brand-new one side by side, each isolated, none of it installed on your machine.

## Take your instance live

When your Kanboard instance is ready, the same Laradock stack becomes your deployment. You build one hardened image and ship it to the host of your choice:

```bash
./laradock ship
```

Then pick a target and follow its short guide, a single server, a managed platform, or Kubernetes: **[Deploy to Production](/docs/production)** lists every provider (Fly.io, Render, Railway, DigitalOcean, AWS, Google Cloud, Azure, Kamal, Kubernetes) with a ready config file for each. There is no per-provider magic to learn; a Docker image runs the same everywhere.

## Frequently Asked Questions

### Do I need to install PHP to run Kanboard with Laradock?

No. Everything lives inside the containers. PHP and git are reachable from the `workspace` container; you never install PHP on your host.

### Which services should I start for a typical Kanboard instance?

`nginx workspace` is enough on its own, since Kanboard defaults to SQLite. Add `mysql` or `postgres` only once you need a shared, concurrent database.

### Should I use SQLite or MySQL/PostgreSQL for Kanboard?

SQLite is the zero-config default and fine for a single user or a small team on a local machine. Kanboard's own docs recommend MySQL/MariaDB or PostgreSQL for larger or multi-user deployments, and specifically caution against SQLite on network filesystems; keep the `data/` folder on a local bind mount (Laradock's default) or move to MySQL/PostgreSQL once several people hit the instance at once.

### Can I run multiple Kanboard instances on different PHP versions?

Yes. Give each its own Laradock with a unique `COMPOSE_PROJECT_NAME` and `DATA_PATH_HOST`, set a different `PHP_VERSION` in each, and they run independently on the same machine.

### Does this work the same on macOS, Windows and Linux?

Yes. Laradock runs anywhere Docker runs. On macOS/Windows, file-sync speed depends on Docker Desktop (VirtioFS helps a lot); it is a Docker Desktop trait, not specific to Laradock.

---

Comparing environments? See the full **[Laradock vs Others](/docs/laradock-alternatives)** breakdown. Ready to start? **[Getting Started](/docs/getting-started)** takes about five minutes.
