---
slug: /serendipity-on-docker
title: Run Serendipity on Docker
description: Run Serendipity on Docker in minutes with Laradock. What Docker gives a Serendipity blog, why Laradock is the fastest way to get NGINX, PHP and MySQL running, and the exact commands, with any PHP version, without installing anything on your machine.
keywords:
  - serendipity on docker
  - run serendipity on docker
  - serendipity docker
  - serendipity docker setup
  - dockerize serendipity
  - serendipity docker environment
  - serendipity nginx mysql docker
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

## What is Serendipity?

[Serendipity](https://s9y.org) (also known as s9y) is a PHP blogging platform that has been around since the early 2000s and is still actively maintained: the current stable release added PHP 8.4 compatibility. A Serendipity site is a PHP application backed by a database, served through a web server. It is flexible about the database: MySQL/MariaDB, PostgreSQL and SQLite are all supported.

## Why run Serendipity in Docker?

Docker packages each of those pieces (NGINX, PHP-FPM, and a database) into isolated containers that run the same on every machine. Instead of installing PHP and a database engine onto your laptop, where versions collide between projects and "works on my machine" starts, you run disposable containers that mirror production and vanish cleanly when you delete them. One blog can run PHP 8.4 while another older project runs 7.4, on the same computer, with nothing installed globally.

The catch: wiring those containers together yourself (base images, PHP extensions, networking, permissions) is a week of fiddly Docker work. That is exactly what Laradock removes.

## Why Laradock is the best fit for Serendipity

Serendipity has no official Docker image of its own, so a ready-made, no-lock-in environment matters even more. Here is why Laradock is the best fit:

- **You are never locked into one ecosystem.** Laradock is framework-agnostic. Run Serendipity today, add a Laravel API, a WordPress site, or a plain PHP script beside it tomorrow, all in the same environment with the same commands.
- **Far more flexibility.** 100+ ready services and any PHP version from 5.6 to 8.5, plus a choice of MySQL, MariaDB or PostgreSQL to match whatever Serendipity is already configured for.
- **Nothing is hidden and you own everything.** No generated files, no magic, no wrapper binary between you and Docker. Every Dockerfile and compose file is right there for you to read and edit.
- **Nothing new to learn.** What you use is plain `docker compose`, knowledge that transfers straight to production. Our [CLI](/docs/cli) is an optional nicety, never a requirement.

Concretely, for Serendipity it gives you a production-style NGINX + PHP-FPM stack, MySQL/MariaDB or PostgreSQL already wired, a `workspace` container with git installed, and any PHP version behind a single line of config.

## Run Serendipity on Docker with Laradock

### 1. Add Laradock to your project

```bash
cd my-serendipity-blog
git clone https://github.com/laradock/laradock.git
cd laradock
```

(No Serendipity files yet? Clone Laradock first, then download Serendipity from the [releases page](https://github.com/s9y/Serendipity/releases) into your project root.)

### 2. Pick the services your blog needs

Serendipity needs a web server and a database. Start exactly those (the web server pulls in PHP-FPM automatically):

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI" default>

```bash
./laradock start nginx mysql workspace
```

</TabItem>
<TabItem value="compose" label="Docker Compose">

```bash
cp .env.example .env
docker compose up -d nginx mysql workspace
```

</TabItem>
</Tabs>

Prefer PostgreSQL instead? Swap the name: `./laradock start nginx postgres workspace` (or `docker compose up -d nginx postgres workspace`). The full catalog is [here](/docs/Intro#supported-services).

Prefer to be asked? The optional [CLI](/docs/cli) walks you through the choices: `./laradock setup`, then `./laradock start`. It prints every real command it runs.

### 3. Point Serendipity at the containers

The install wizard writes your database connection into `serendipity_config_local.inc.php`. Use the service name as the host, and the default database, user and password from `mysql/defaults.env`:

```
Database Host: mysql
Database Name: default
Database User: default
Database Password: secret
```

Override any of them by adding the line to Laradock's `.env` (it always wins).

### 4. Install and run your blog

Open the installer in your browser and follow its steps to create the database tables and the first admin account:

```
http://localhost/
```

Serendipity detects there is no config file yet and starts the installer automatically. Then open [http://localhost](http://localhost). That is a full Serendipity blog running on Docker.

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

Current Serendipity (2.6) needs PHP 8.0 or newer and is tested up to PHP 8.4, so the same tool runs it alongside older projects on earlier PHP versions, each isolated, none of it installed on your machine.

## Frequently Asked Questions

### Do I need to install PHP or a database to run Serendipity with Laradock?

No. Everything lives inside the containers. PHP and your chosen database are both provided; you never install them on your host.

### Which services should I start for a typical Serendipity blog?

`nginx mysql workspace` covers most blogs: web server, database, and a shell. Swap `mysql` for `postgres` if you prefer.

### Can I run multiple Serendipity blogs on different PHP versions?

Yes. Give each its own Laradock with a unique `COMPOSE_PROJECT_NAME` and `DATA_PATH_HOST`, set a different `PHP_VERSION` in each, and they run independently on the same machine.

### Does this work the same on macOS, Windows and Linux?

Yes. Laradock runs anywhere Docker runs. On macOS/Windows, file-sync speed depends on Docker Desktop (VirtioFS helps a lot); it is a Docker Desktop trait, not specific to Laradock.

### Is this the same Docker setup I would use in production?

The containers are production-style (real NGINX + PHP-FPM), so it is far closer to production than a native install. See [Prepare Laradock for Production](/docs/production#prepare-laradock-for-production) for the hardening steps.

---

Comparing environments? See the full **[Laradock vs Others](/docs/laradock-alternatives)** breakdown. Ready to start? **[Getting Started](/docs/getting-started)** takes about five minutes.
