---
slug: /flarum-on-docker
title: Run Flarum on Docker
description: Run Flarum on Docker in minutes with Laradock. What Docker gives a Flarum forum, why Laradock is the fastest way to get NGINX, PHP and MySQL running, and the exact commands, with any PHP version, without installing anything on your machine.
keywords:
  - flarum on docker
  - run flarum on docker
  - flarum docker
  - flarum docker setup
  - dockerize flarum
  - flarum docker environment
  - flarum nginx mysql docker
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

## What is Flarum?

[Flarum](https://flarum.org) is a modern, fast forum platform built around a single extension system, everything from the core discussion view to third-party features is an extension, all installed and updated through Composer. It is a PHP application backed by a MySQL or MariaDB database, served through a web server, and it needs Composer available on the server for both the initial install and every extension you add later.

## Why run Flarum in Docker?

Docker packages each of those pieces (NGINX, PHP-FPM, MySQL) into isolated containers that run the same on every machine. Instead of installing PHP, Composer and MySQL onto your laptop, where versions collide between projects and "works on my machine" starts, you run disposable containers that mirror production and vanish cleanly when you delete them. One Flarum install can run the newer PHP its latest release requires while another project stays on an older version, on the same computer, with nothing installed globally.

The catch: wiring those containers together yourself (base images, PHP extensions, networking, permissions) is a week of fiddly Docker work. That is exactly what Laradock removes.

## Why Laradock is the best fit for Flarum

Flarum has no official Docker image of its own, only community-maintained ones, so a ready-made, no-lock-in environment matters even more. Here is why Laradock is the best fit:

- **You are never locked into one ecosystem.** Laradock is framework-agnostic. Run your Flarum forum today, add a Laravel API, a WordPress marketing site, or a plain PHP script beside it tomorrow, all in the same environment with the same commands.
- **Far more flexibility.** 100+ ready services and any PHP version from 5.6 to 8.5, so a Flarum 1.x install and the newer PHP-8.3-only Flarum 2.0 can each get exactly the runtime they need.
- **Nothing is hidden and you own everything.** No generated files, no magic, no wrapper binary between you and Docker. Every Dockerfile and compose file is right there for you to read and edit.
- **Nothing new to learn.** What you use is plain `docker compose`, knowledge that transfers straight to production. Our [CLI](/docs/cli) is an optional nicety, never a requirement.

Concretely, for Flarum it gives you a production-style NGINX + PHP-FPM stack, MySQL/MariaDB already wired, and a `workspace` container with Composer and git already installed, exactly what Flarum's own install docs assume you have.

## Run Flarum on Docker with Laradock

### 1. Add Laradock to your project

```bash
cd my-flarum-forum
git clone https://github.com/laradock/laradock.git
cd laradock && cp .env.example .env
```

(No Flarum files yet? Clone Laradock first, then create the Flarum project from the `workspace` container in the next steps.)

### 2. Pick the services your forum needs

Flarum needs a web server and a database. The web server pulls in PHP-FPM automatically:

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

Prefer MariaDB? Swap the name: `./laradock start nginx mariadb workspace` (or `docker compose up -d nginx mariadb workspace`). The full catalog is [here](/docs/Intro#supported-services).

Prefer to be asked? The optional [CLI](/docs/cli) walks you through the choices: `./laradock setup`, then `./laradock start`. It prints every real command it runs.

### 3. Point Flarum at the containers

Flarum's installer writes a `config.php` for you, but this is the shape of it once installed; use the service name as the database host:

```php
'database' => [
    'driver'   => 'mysql',
    'host'     => 'mysql',
    'database' => 'default',
    'username' => 'default',
    'password' => 'secret',
    'prefix'   => '',
],
```

The default database, user and password live in Laradock's `mysql/defaults.env`; override any of them by adding the line to Laradock's `.env` (it always wins).

### 4. Install and run your forum

Enter the `workspace` container, use Composer to fetch Flarum, then finish the setup in the browser:

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
composer create-project flarum/flarum . --stability=beta
```

Then open [http://localhost](http://localhost) and follow Flarum's install wizard: it validates your PHP extensions, asks for the database details from the step above, and creates the administrator account (some Flarum versions also expose this as `php flarum install` for a CLI-driven setup). That is a full Flarum forum running on Docker.

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

Flarum's 1.x line needs PHP 8.1 or newer, while Flarum 2.0 requires PHP 8.3+; Laradock covers anything from PHP 5.6 to 8.5, so the same tool runs an older Flarum 1.x forum and a Flarum 2.0 install side by side, each isolated, none of it installed on your machine.

## Frequently Asked Questions

### Do I need to install PHP, Composer or MySQL to run Flarum with Laradock?

No. Everything lives inside the containers. Composer, git and PHP are all provided; you never install them on your host.

### Which services should I start for a typical Flarum forum?

`nginx mysql workspace` covers most forums: web server, database, and a shell with Composer for installing and updating extensions. Swap `mysql` for `mariadb` if you prefer.

### Can I run multiple Flarum forums on different PHP versions?

Yes. Give each its own Laradock with a unique `COMPOSE_PROJECT_NAME` and `DATA_PATH_HOST`, set a different `PHP_VERSION` in each, and they run independently on the same machine.

### Does this work the same on macOS, Windows and Linux?

Yes. Laradock runs anywhere Docker runs. On macOS/Windows, file-sync speed depends on Docker Desktop (VirtioFS helps a lot); it is a Docker Desktop trait, not specific to Laradock.

### Is this the same Docker setup I would use in production?

The containers are production-style (real NGINX + PHP-FPM), so it is far closer to production than a native install. See [Prepare Laradock for Production](/docs/production#prepare-laradock-for-production) for the hardening steps.

---

Comparing environments? See the full **[Laradock vs Others](/docs/laradock-alternatives)** breakdown. Ready to start? **[Getting Started](/docs/getting-started)** takes about five minutes.
