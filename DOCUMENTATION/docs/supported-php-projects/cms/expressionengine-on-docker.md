---
slug: /expressionengine-on-docker
title: Run ExpressionEngine on Docker
description: Run ExpressionEngine on Docker in minutes with Laradock. What Docker gives an ExpressionEngine site, why Laradock is the fastest way to get NGINX, PHP and MySQL running, and the exact commands, with any PHP version, without installing anything on your machine.
keywords:
  - expressionengine on docker
  - run expressionengine on docker
  - expressionengine docker
  - expressionengine docker setup
  - dockerize expressionengine
  - expressionengine docker environment
  - expressionengine nginx mysql docker
---

## What is ExpressionEngine?

[ExpressionEngine](https://expressionengine.com) is a flexible, template-driven CMS originally built by EllisLab, popular for content-heavy sites that need highly custom data structures (its "channels" and custom fields go beyond a typical blog-post model). It went open source under the Apache 2.0 license in 2018 and its core is free; an optional paid "Pro" edition adds extra features on top. It is a plain PHP application backed by a MySQL (or MariaDB) database, served through a web server.

## Why run ExpressionEngine in Docker?

Docker packages each of those pieces (NGINX, PHP-FPM, MySQL) into isolated containers that run the same on every machine. Instead of installing PHP and MySQL onto your laptop, where versions collide between sites and "works on my machine" starts, you run disposable containers that mirror production and vanish cleanly when you delete them. One site can run PHP 8.3 while another stays on an older version, on the same computer, with nothing installed globally.

The catch: wiring those containers together yourself (base images, PHP extensions, networking, permissions) is a week of fiddly Docker work. That is exactly what Laradock removes.

## Why Laradock is the best fit for ExpressionEngine

ExpressionEngine has no official Docker image or first-party runtime of its own, so a ready-made, no-lock-in environment matters even more. Here is why Laradock is the best fit:

- **You are never locked into one ecosystem.** Laradock is framework-agnostic. Run ExpressionEngine today, add a Laravel API, a WordPress site, or a plain PHP script beside it tomorrow, all in the same environment with the same commands.
- **Far more flexibility.** 100+ ready services and any PHP version from 5.6 to 8.5, so an older ExpressionEngine install and a fresh one each get exactly the runtime they need.
- **Nothing is hidden and you own everything.** No generated files, no magic, no wrapper binary between you and Docker. Every Dockerfile and compose file is right there for you to read and edit.
- **Nothing new to learn.** What you use is plain `docker compose`, knowledge that transfers straight to production. Our [CLI](/docs/cli) is an optional nicety, never a requirement.

Concretely, for ExpressionEngine it gives you a production-style NGINX + PHP-FPM stack, MySQL/MariaDB already wired, and a `workspace` container with git and Composer installed for any add-ons that need it.

## Run ExpressionEngine on Docker with Laradock

### 1. Add Laradock to your project

```bash
cd my-expressionengine-site
git clone https://github.com/laradock/laradock.git
cd laradock && cp .env.example .env
```

(No ExpressionEngine files yet? Clone Laradock first, then download ExpressionEngine from the workspace container in the next steps.)

### 2. Pick the services your site needs

ExpressionEngine needs a web server and a database. The web server pulls in PHP-FPM automatically:

```bash
docker compose up -d nginx mysql workspace
```

Prefer MariaDB over MySQL? Swap the name: `docker compose up -d nginx mariadb workspace`. The full catalog is [here](/docs/Intro#supported-services).

Prefer to be asked? The optional [CLI](/docs/cli) walks you through the choices: `./laradock setup`, then `./laradock up`. It prints every real command it runs.

### 3. Point ExpressionEngine at the containers

ExpressionEngine's browser installer writes the database connection into `system/user/config/config.php` for you. Fill the installer form with the service name as the host:

```
Database hostname: mysql
Database name: default
Database username: default
Database password: secret
```

The default database, user and password live in `mysql/defaults.env`; override any of them by adding the line to Laradock's `.env` (it always wins).

### 4. Install and run your site

Download ExpressionEngine into the workspace container, then finish setup in your browser:

```bash
docker compose exec workspace bash
git clone https://github.com/ExpressionEngine/ExpressionEngine.git .   # only if you have no EE files yet
```

Open [http://localhost/admin.php](http://localhost/admin.php) and run the ExpressionEngine installer. That is a full ExpressionEngine site running on Docker.

## Change the PHP version anytime

This is where a native install hurts and Laradock shines. Set the version in Laradock's `.env` and rebuild:

```env
PHP_VERSION=8.1
```

```bash
docker compose build php-fpm workspace
```

ExpressionEngine supports PHP 7.2.5 and newer, with current releases fully supporting PHP 8.3, so a legacy install and a brand-new one can run side by side on different PHP versions, each isolated, none of it installed on your machine.

## Frequently Asked Questions

### Do I need to install PHP or MySQL to run ExpressionEngine with Laradock?

No. Everything lives inside the containers. PHP, the web server and MySQL are all provided; you never install them on your host.

### Which services should I start for a typical ExpressionEngine site?

`nginx mysql workspace` covers most sites: web server, database, and a shell. Swap `mysql` for `mariadb` if you prefer.

### Is ExpressionEngine free to use in production?

The core is free and open source (Apache 2.0) since 2018. An optional paid "Pro" edition exists for extra features; check ExpressionEngine's own licensing page for what it covers before you rely on it. Laradock only handles the runtime, not the licensing.

### Can I run multiple ExpressionEngine sites on different PHP versions?

Yes. Give each its own Laradock with a unique `COMPOSE_PROJECT_NAME` and `DATA_PATH_HOST`, set a different `PHP_VERSION` in each, and they run independently on the same machine.

### Is this the same Docker setup I would use in production?

The containers are production-style (real NGINX + PHP-FPM), so it is far closer to production than a native install. See [Prepare Laradock for Production](/docs/usage#prepare-laradock-for-production) for the hardening steps.

---

Comparing environments? See the full **[Laradock vs Others](/docs/laradock-alternatives)** breakdown. Ready to start? **[Getting Started](/docs/getting-started)** takes about five minutes.
