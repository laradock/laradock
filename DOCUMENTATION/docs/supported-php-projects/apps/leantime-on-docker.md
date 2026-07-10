---
slug: /leantime-on-docker
title: Run Leantime on Docker
description: Run Leantime on Docker in minutes with Laradock. What Docker gives a Leantime instance, why Laradock is the fastest way to get NGINX, PHP and MySQL running, and the exact commands, with any PHP version, without installing anything on your machine.
keywords:
  - leantime on docker
  - run leantime on docker
  - leantime docker
  - leantime docker setup
  - dockerize leantime
  - leantime docker environment
  - leantime nginx mysql docker
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

## What is Leantime?

[Leantime](https://leantime.io) is an open source project management system built for goal-driven teams rather than career project managers, with task boards, milestones, and goal tracking designed with ADHD, autism and dyslexia in mind. A Leantime instance is a PHP application (its own lightweight framework, not Laravel) backed by MySQL or MariaDB, served through a web server, with a browser-based `/install` wizard handling setup once the database connection is configured.

## Why run Leantime in Docker?

Docker packages each of those pieces (NGINX, PHP-FPM, MySQL) into isolated containers that run the same on every machine. Instead of installing PHP and MySQL onto your laptop, where versions collide between projects and "works on my machine" starts, you run disposable containers that mirror production and vanish cleanly when you delete them. One Leantime instance can run on a specific PHP version while another project runs a different one, on the same computer, with nothing installed globally.

The catch: wiring those containers together yourself (base images, PHP extensions, networking, permissions) is a week of fiddly Docker work. That is exactly what Laradock removes.

## Why Laradock is the best fit for Leantime

Leantime does ship its own official Docker image (`leantime/leantime` on Docker Hub, maintained by the Leantime team), and that image expects an external MySQL database anyway, so it does not strictly need Laradock. It is still worth considering, and here is why:

- **You are never locked into one ecosystem.** Laradock is framework-agnostic. The day you add a Laravel API, a WordPress site, or a plain PHP script beside your Leantime instance, it runs in the same environment with the same commands. A single-purpose image cannot do that.
- **Far more flexibility.** 100+ ready services and any PHP version from 5.6 to 8.5, versus the narrow set of tags the official image ships.
- **Nothing is hidden and you own everything.** No generated files, no magic, no wrapper binary between you and Docker. Every Dockerfile and compose file is right there for you to read and edit.
- **Nothing new to learn.** What you use is plain `docker compose`, knowledge that transfers straight to production and to every other project. Our [CLI](/docs/cli) is an optional nicety, never a requirement.

Concretely, for Leantime it gives you a production-style NGINX + PHP-FPM stack, MySQL/MariaDB already wired (Leantime needs the database to exist externally either way), and a `workspace` container with git and the PHP CLI available.

## Run Leantime on Docker with Laradock

### 1. Add Laradock to your project

```bash
cd my-leantime-instance
git clone https://github.com/laradock/laradock.git
cd laradock && cp .env.example .env
```

(No Leantime codebase yet? Clone Laradock first, then pull one down from the workspace container in the next steps.)

### 2. Pick the services your instance needs

Leantime needs a web server and a database (it will not run without one). The web server pulls in PHP-FPM automatically:

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

Prefer MariaDB instead? Swap the name: `./laradock start nginx mariadb workspace`. The full catalog is [here](/docs/Intro#supported-services).

Prefer to be asked? The optional [CLI](/docs/cli) walks you through the choices: `./laradock setup`, then `./laradock up`. It prints every real command it runs.

### 3. Point Leantime at the containers

Copy Leantime's `config/sample.env` to `config/.env` and use the service name as the host:

```env
LEAN_DB_HOST=mysql
LEAN_DB_DATABASE=default
LEAN_DB_USER=default
LEAN_DB_PASSWORD=secret
LEAN_DB_PORT=3306
```

The default database, user and password live in Laradock's `mysql/defaults.env`; override any of them by adding the line to Laradock's `.env` (it always wins).

### 4. Install and run your instance

Enter the `workspace` container, place or clone the Leantime codebase, and set the `.env` values above:

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

Once inside, run:

```bash
git clone https://github.com/Leantime/leantime.git --single-branch .   # only if you have no codebase yet
cp config/sample.env config/.env
# edit config/.env with the LEAN_DB_* values above
```

Then open [http://localhost/install](http://localhost/install) and complete Leantime's setup wizard, which finishes the database migration and creates your admin account.

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

Leantime requires PHP 8.2 or newer for current production releases; Laradock covers anything from PHP 5.6 to 8.5, so the same tool runs an older Leantime instance you have not upgraded yet and a brand-new one side by side, each isolated, none of it installed on your machine.

## Frequently Asked Questions

### Do I need to install PHP or MySQL to run Leantime with Laradock?

No. Everything lives inside the containers. PHP and git are reachable from the `workspace` container; you never install PHP on your host.

### Which services should I start for a typical Leantime instance?

`nginx mysql workspace` covers it: web server, database, and a shell. Swap `mysql` for `mariadb` if you prefer.

### Can I run multiple Leantime instances on different PHP versions?

Yes. Give each its own Laradock with a unique `COMPOSE_PROJECT_NAME` and `DATA_PATH_HOST`, set a different `PHP_VERSION` in each, and they run independently on the same machine.

### Does this work the same on macOS, Windows and Linux?

Yes. Laradock runs anywhere Docker runs. On macOS/Windows, file-sync speed depends on Docker Desktop (VirtioFS helps a lot for `vendor/`-heavy apps); it is a Docker Desktop trait, not specific to Laradock.

### Is this the same Docker setup I would use in production?

The containers are production-style (real NGINX + PHP-FPM), so it is far closer to production than a native install. See [Prepare Laradock for Production](/docs/production#prepare-laradock-for-production) for the hardening steps.

---

Comparing environments? See the full **[Laradock vs Others](/docs/laradock-alternatives)** breakdown. Ready to start? **[Getting Started](/docs/getting-started)** takes about five minutes.
