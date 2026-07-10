---
slug: /processwire-on-docker
title: Run ProcessWire on Docker
description: Run ProcessWire on Docker in minutes with Laradock. What Docker gives a ProcessWire site, why Laradock is the fastest way to get NGINX, PHP and MySQL running, and the exact commands, with any PHP version, without installing anything on your machine.
keywords:
  - processwire on docker
  - run processwire on docker
  - processwire docker
  - processwire docker setup
  - dockerize processwire
  - processwire docker environment
  - processwire nginx mysql docker
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

## What is ProcessWire?

[ProcessWire](https://processwire.com) is an open-source CMS and web application framework built around a flexible, field-based content model and a powerful selector API for querying pages. Unlike most other CMS platforms in this series, it is not flat-file: a real ProcessWire site is a PHP application backed by a MySQL (or MariaDB) database, served through a web server, with a browser-based installer that does most of the setup for you.

## Why run ProcessWire in Docker?

Docker packages each of those pieces (NGINX, PHP-FPM, MySQL) into isolated containers that run the same on every machine. Instead of installing PHP and MySQL onto your laptop, where versions collide between projects and "works on my machine" starts, you run disposable containers that mirror production and vanish cleanly when you delete them. One site can run PHP 8.3 while another runs an older 7.4 module stack, on the same computer, with nothing installed globally.

The catch: wiring those containers together yourself (base images, PHP extensions, networking, permissions) is a week of fiddly Docker work. That is exactly what Laradock removes.

## Why Laradock is the best fit for ProcessWire

ProcessWire has no official Docker image or first-party runtime of its own, so a ready-made, no-lock-in environment matters even more. Here is why Laradock is the best fit:

- **You are never locked into one ecosystem.** Laradock is framework-agnostic. Run ProcessWire today, add a Laravel API, a WordPress site, or a plain PHP script beside it tomorrow, all in the same environment with the same commands.
- **Far more flexibility.** 100+ ready services and any PHP version from 5.6 to 8.5, so a legacy module and a modern site each get exactly the runtime they need.
- **Nothing is hidden and you own everything.** No generated files, no magic, no wrapper binary between you and Docker. Every Dockerfile and compose file is right there for you to read and edit.
- **Nothing new to learn.** What you use is plain `docker compose`, knowledge that transfers straight to production. Our [CLI](/docs/cli) is an optional nicety, never a requirement.

Concretely, for ProcessWire it gives you a production-style NGINX + PHP-FPM stack, MySQL/MariaDB already wired, a `workspace` container with Composer and git installed, and any PHP version behind a single line of config.

## Run ProcessWire on Docker with Laradock

### 1. Add Laradock to your project

```bash
cd my-processwire-site
git clone https://github.com/laradock/laradock.git
cd laradock && cp .env.example .env
```

(No ProcessWire files yet? Clone Laradock first, then download ProcessWire into your project root from the workspace container in the next steps.)

### 2. Pick the services your site needs

ProcessWire needs a web server and a database. Start exactly those (the web server pulls in PHP-FPM automatically):

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

Prefer MariaDB over MySQL? Swap the name: `./laradock start nginx mariadb workspace` (or `docker compose up -d nginx mariadb workspace`). The full catalog is [here](/docs/Intro#supported-services).

Prefer to be asked? The optional [CLI](/docs/cli) walks you through the choices: `./laradock setup`, then `./laradock up`. It prints every real command it runs.

### 3. Point ProcessWire at the containers

ProcessWire's browser installer writes `site/config.php` for you, asking for a database host, name, user and password along the way. Use the service name as the host, and the default database, user and password from `mysql/defaults.env`:

```
DB Host: mysql
DB Name: default
DB User: default
DB Pass: secret
```

Override any of them by adding the line to Laradock's `.env` (it always wins).

### 4. Install and run your site

Enter the `workspace` container to fetch ProcessWire, then run the installer from your browser:

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
composer create-project processwire/processwire my-processwire-site
```

```
http://localhost/
```

The installer checks requirements, creates the database tables, and walks you through setting the admin account. Then open [http://localhost](http://localhost). That is a full ProcessWire site running on Docker.

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

ProcessWire runs on PHP 7.2+, with PHP 8.x recommended for current releases, so the same tool runs a legacy site and a brand-new build side by side, each isolated, none of it installed on your machine.

## Frequently Asked Questions

### Do I need to install PHP or MySQL to run ProcessWire with Laradock?

No. Everything lives inside the containers. PHP, Composer and MySQL are all provided; you never install them on your host.

### Which services should I start for a typical ProcessWire site?

`nginx mysql workspace` covers most sites: web server, database, and a shell. Swap `mysql` for `mariadb` if you prefer.

### Can I run multiple ProcessWire sites on different PHP versions?

Yes. Give each its own Laradock with a unique `COMPOSE_PROJECT_NAME` and `DATA_PATH_HOST`, set a different `PHP_VERSION` in each, and they run independently on the same machine.

### Does this work the same on macOS, Windows and Linux?

Yes. Laradock runs anywhere Docker runs. On macOS/Windows, file-sync speed depends on Docker Desktop (VirtioFS helps a lot); it is a Docker Desktop trait, not specific to Laradock.

### Is this the same Docker setup I would use in production?

The containers are production-style (real NGINX + PHP-FPM), so it is far closer to production than a native install. See [Prepare Laradock for Production](/docs/production#prepare-laradock-for-production) for the hardening steps.

---

Comparing environments? See the full **[Laradock vs Others](/docs/laradock-alternatives)** breakdown. Ready to start? **[Getting Started](/docs/getting-started)** takes about five minutes.
