---
slug: /owncloud-on-docker
title: Run ownCloud on Docker
description: Run ownCloud on Docker in minutes with Laradock. What Docker gives an ownCloud instance, why Laradock is the fastest way to get NGINX, PHP and MySQL running, and the exact commands, with any PHP version, without installing anything on your machine.
keywords:
  - owncloud on docker
  - run owncloud on docker
  - owncloud docker
  - owncloud docker setup
  - dockerize owncloud
  - owncloud docker environment
  - owncloud nginx mysql docker
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

## What is ownCloud?

[ownCloud](https://owncloud.com) is a self-hosted file sync and share platform, the project Nextcloud was forked from, known for letting teams keep control of their own storage instead of relying on a third-party cloud. The classic edition, ownCloud 10, is a PHP application backed by MySQL, MariaDB, PostgreSQL or SQLite, served through a web server, with an `occ` command-line tool handling installation and maintenance tasks. ownCloud's newer flagship, Infinite Scale, is a separate product rewritten in Go; this page covers the PHP-based ownCloud 10 line, which remains a maintained option for existing LAMP-style deployments.

## Why run ownCloud in Docker?

Docker packages each of those pieces (NGINX, PHP-FPM, MySQL) into isolated containers that run the same on every machine. Instead of installing PHP and MySQL onto your laptop, where versions collide between projects and "works on my machine" starts, you run disposable containers that mirror production and vanish cleanly when you delete them. One ownCloud instance can run on an older PHP version while another project runs the latest PHP, on the same computer, with nothing installed globally.

The catch: wiring those containers together yourself (base images, PHP extensions, networking, permissions) is a week of fiddly Docker work. That is exactly what Laradock removes.

## Why Laradock is the best fit for ownCloud

ownCloud does ship its own official Docker images (`owncloud/server` and related images maintained by the ownCloud team), so, unlike most PHP projects, it does not strictly need Laradock. It is still worth considering, and here is why:

- **You are never locked into one ecosystem.** Laradock is framework-agnostic. The day you add a Laravel API, a WordPress site, or a plain PHP script beside your ownCloud instance, it runs in the same environment with the same commands. A single-purpose image cannot do that.
- **Far more flexibility.** 100+ ready services and any PHP version from 5.6 to 8.5, versus the narrow, pinned set of versions the official image ships.
- **Nothing is hidden and you own everything.** No generated files, no magic, no wrapper binary between you and Docker. Every Dockerfile and compose file is right there for you to read and edit.
- **Nothing new to learn.** What you use is plain `docker compose`, knowledge that transfers straight to production and to every other project. Our [CLI](/docs/cli) is an optional nicety, never a requirement.

Concretely, for ownCloud it gives you a production-style NGINX + PHP-FPM stack, MySQL/MariaDB/PostgreSQL already wired, and a `workspace` container with git and the PHP CLI needed to run `occ`.

## Run ownCloud on Docker with Laradock

### 1. Add Laradock to your project

```bash
cd my-owncloud-instance
git clone https://github.com/laradock/laradock.git
cd laradock && cp .env.example .env
```

(No ownCloud codebase yet? Clone Laradock first, then pull one down from the workspace container in the next steps.)

### 2. Pick the services your instance needs

ownCloud needs a web server and a database. The web server pulls in PHP-FPM automatically:

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

Prefer MariaDB or PostgreSQL instead? Swap the name: `./laradock start nginx postgres workspace` (or `docker compose up -d nginx postgres workspace`). The full catalog is [here](/docs/Intro#supported-services).

Prefer to be asked? The optional [CLI](/docs/cli) walks you through the choices: `./laradock setup`, then `./laradock up`. It prints every real command it runs.

### 3. Point ownCloud at the containers

ownCloud does not read a `.env` file the way a typical Laravel app does; you pass the database connection when you run the install command, and it gets written into `config/config.php`. Use the service name as the host:

```bash
./occ maintenance:install \
  --database "mysql" --database-host "mysql" \
  --database-name "default" --database-user "default" --database-pass "secret" \
  --admin-user "admin" --admin-pass "secret"
```

The default database, user and password live in Laradock's `mysql/defaults.env`; override any of them by adding the line to Laradock's `.env` (it always wins).

### 4. Install and run your instance

Enter the `workspace` container, place the ownCloud codebase, and run the install command above:

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
# place or clone the ownCloud codebase into the current directory first
./occ maintenance:install --database "mysql" --database-host "mysql" \
  --database-name "default" --database-user "default" --database-pass "secret" \
  --admin-user "admin" --admin-pass "secret"
```

Then open [http://localhost](http://localhost) and sign in with the admin user you set above.

## Change the PHP version anytime

This is where a native install hurts and Laradock shines. Set the version in Laradock's `.env` and rebuild:

```env
PHP_VERSION=8.1
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

ownCloud 10 targets PHP 7.4 through 8.1 depending on the release; Laradock covers anything from PHP 5.6 to 8.5, so the same tool runs an older ownCloud instance you have not upgraded yet and a brand-new one side by side, each isolated, none of it installed on your machine.

## Frequently Asked Questions

### Do I need to install PHP or MySQL to run ownCloud with Laradock?

No. Everything lives inside the containers. PHP, the `occ` CLI and git are reachable from the `workspace` container; you never install PHP on your host.

### Which services should I start for a typical ownCloud instance?

`nginx mysql workspace` covers it: web server, database, and a shell. Swap `mysql` for `mariadb` or `postgres` if you prefer.

### Can I run multiple ownCloud instances on different PHP versions?

Yes. Give each its own Laradock with a unique `COMPOSE_PROJECT_NAME` and `DATA_PATH_HOST`, set a different `PHP_VERSION` in each, and they run independently on the same machine.

### Does this work the same on macOS, Windows and Linux?

Yes. Laradock runs anywhere Docker runs. On macOS/Windows, file-sync speed depends on Docker Desktop (VirtioFS helps a lot for large file libraries); it is a Docker Desktop trait, not specific to Laradock.

### Is this the same Docker setup I would use in production?

The containers are production-style (real NGINX + PHP-FPM), so it is far closer to production than a native install. See [Prepare Laradock for Production](/docs/production#prepare-laradock-for-production) for the hardening steps.

---

Comparing environments? See the full **[Laradock vs Others](/docs/laradock-alternatives)** breakdown. Ready to start? **[Getting Started](/docs/getting-started)** takes about five minutes.
