---
slug: /drupal-on-docker
title: Run Drupal on Docker
description: Run Drupal on Docker in minutes with Laradock. What Docker gives a Drupal site, why Laradock is the fastest way to get NGINX, PHP, MySQL and Redis running, and the exact commands, with any PHP version, without installing anything on your machine.
keywords:
  - drupal on docker
  - run drupal on docker
  - drupal docker
  - drupal docker setup
  - dockerize drupal
  - drupal docker environment
  - drupal nginx mysql docker
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

## What is Drupal?

[Drupal](https://www.drupal.org) is an enterprise-grade open source CMS known for modeling complex, structured content: multiple content types, taxonomies, multilingual sites, and fine-grained permissions, all through modules and a large ecosystem. A Drupal site is a PHP application backed by a database (MySQL, MariaDB, PostgreSQL or SQLite are all supported), served through a web server, and it benefits from Redis for caching on busier installs.

## Why run Drupal in Docker?

Docker packages each of those pieces (NGINX, PHP-FPM, MySQL, Redis) into isolated containers that run the same on every machine. Instead of installing PHP and MySQL onto your laptop, where versions collide between sites and "works on my machine" starts, you run disposable containers that mirror production and vanish cleanly when you delete them. One site can run PHP 8.3 while another, older Drupal 9 install runs 8.1, on the same computer, with nothing installed globally.

The catch: wiring those containers together yourself (base images, PHP extensions, networking, permissions) is a week of fiddly Docker work. That is exactly what Laradock removes.

## Why Laradock is the best fit for Drupal

Drupal ships its own official Docker image on Docker Hub, so, unlike most PHP projects, it does not strictly need Laradock. It is still the best fit, and here is why:

- **You are never locked into one ecosystem.** Laradock is framework-agnostic. The day you add a Laravel API, a WordPress marketing site, or a plain PHP script beside your Drupal site, it runs in the same environment with the same commands. A single-purpose image cannot do that.
- **Far more flexibility.** 100+ ready services and any PHP version from 5.6 to 8.5, versus the narrower set of tags the official image maintains.
- **Nothing is hidden and you own everything.** No generated files, no magic, no wrapper binary between you and Docker. Every Dockerfile and compose file is right there for you to read and edit.
- **Nothing new to learn.** What you use is plain `docker compose`, knowledge that transfers straight to production and to every other project. Our [CLI](/docs/cli) is an optional nicety, never a requirement.

For Drupal specifically, Laradock wires a production-style NGINX + PHP-FPM stack, MySQL/MariaDB/PostgreSQL and Redis, and a `workspace` container with Composer, Node, npm and git already installed.

## Run Drupal on Docker with Laradock

### 1. Add Laradock to your project

```bash
cd my-drupal-site
git clone https://github.com/laradock/laradock.git
cd laradock
```

(No Drupal codebase yet? Clone Laradock first, then build one from the workspace container in the next steps.)

### 2. Pick the services your site needs

Most Drupal sites need a web server, a database, and Redis for caching. Start exactly those (the web server pulls in PHP-FPM automatically):

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock start nginx mysql redis workspace
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
cp .env.example .env
docker compose up -d nginx mysql redis workspace
```

</TabItem>
</Tabs>

Prefer PostgreSQL or MariaDB? Swap the name: `./laradock start nginx postgres redis workspace` (or `docker compose up -d nginx postgres redis workspace`). The full catalog is [here](/docs/Intro#supported-services).

Prefer to be asked? The optional [CLI](/docs/cli) walks you through the choices: `./laradock setup`, then `./laradock start`. It prints every real command it runs.

### 3. Point Drupal at the containers

In `sites/default/settings.php`, use the service name as the database host:

```php
$databases['default']['default'] = [
  'database' => 'default',
  'username' => 'default',
  'password' => 'secret',
  'host' => 'mysql',
  'driver' => 'mysql',
];
```

The default database, user and password live in Laradock's `mysql/defaults.env`; override any of them by adding the line to Laradock's `.env` (it always wins).

### 4. Install and run your site

Enter the `workspace` container, where Composer and git live, and set the site up:

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
composer create-project drupal/recommended-project .   # only if you have no Drupal codebase yet
```

Then open [http://localhost](http://localhost) and finish the install wizard in the browser: it asks for the database host (`mysql`), name, user and password from the step above, then creates the admin account.

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

Drupal 10 needs PHP 8.1 or newer, and Drupal 11 needs PHP 8.3 or newer; Laradock covers anything from PHP 5.6 to 8.5, so the same tool runs a legacy Drupal 9 site and a brand-new Drupal 11 site side by side, each isolated, none of it installed on your machine.

## Frequently Asked Questions

### Do I need to install PHP or Composer to run Drupal with Laradock?

No. Everything lives inside the containers. Composer, Node, npm and git are all in the `workspace` container; you never install PHP on your host.

### Which services should I start for a typical Drupal site?

`nginx mysql redis workspace` covers most sites: web server, database, cache, and a shell. Swap `mysql` for `postgres` or `mariadb` if you prefer.

### Can I run multiple Drupal sites on different PHP versions?

Yes. Give each its own Laradock with a unique `COMPOSE_PROJECT_NAME` and `DATA_PATH_HOST`, set a different `PHP_VERSION` in each, and they run independently on the same machine.

### Does this work the same on macOS, Windows and Linux?

Yes. Laradock runs anywhere Docker runs. On macOS/Windows, file-sync speed depends on Docker Desktop (VirtioFS helps a lot for `vendor/`-heavy sites); it is a Docker Desktop trait, not specific to Laradock.

### Is this the same Docker setup I would use in production?

The containers are production-style (real NGINX + PHP-FPM), so it is far closer to production than a native install. See [Prepare Laradock for Production](/docs/production#prepare-laradock-for-production) for the hardening steps.

---

Comparing environments? See **[Laradock vs Drupal Docker](/docs/laradock-vs-drupal-docker)** (DDEV & the official image) and the full **[Laradock vs Others](/docs/laradock-alternatives)** breakdown. Ready to start? **[Getting Started](/docs/getting-started)** takes about five minutes.
