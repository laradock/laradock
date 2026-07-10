---
slug: /joomla-on-docker
title: Run Joomla on Docker
description: Run Joomla on Docker in minutes with Laradock. What Docker gives a Joomla site, why Laradock is the fastest way to get NGINX, PHP, MySQL and Redis running, and the exact commands, with any PHP version, without installing anything on your machine.
keywords:
  - joomla on docker
  - run joomla on docker
  - joomla docker
  - joomla docker setup
  - dockerize joomla
  - joomla docker environment
  - joomla nginx mysql docker
---

## What is Joomla?

[Joomla](https://www.joomla.org) is one of the most widely used open source CMSs, known for multilingual support built into core and for powering everything from community portals to corporate sites and online stores. It is a PHP application backed by a database, typically MySQL or MariaDB (PostgreSQL is also supported), served through a web server, and it benefits from Redis for caching on busier sites.

## Why run Joomla in Docker?

Docker packages each of those pieces (NGINX, PHP-FPM, MySQL, Redis) into isolated containers that run the same on every machine. Instead of installing PHP and MySQL onto your laptop, where versions collide between sites and "works on my machine" starts, you run disposable containers that mirror production and vanish cleanly when you delete them. One site can run PHP 8.3 while an older Joomla 4 install runs 8.0, on the same computer, with nothing installed globally.

The catch: wiring those containers together yourself (base images, PHP extensions, networking, permissions) is a week of fiddly Docker work. That is exactly what Laradock removes.

## Why Laradock is the best fit for Joomla

Joomla ships its own official Docker image on Docker Hub, so, unlike most PHP projects, it does not strictly need Laradock. It is still the best fit, and here is why:

- **You are never locked into one ecosystem.** Laradock is framework-agnostic. The day you add a Laravel API, a WordPress site, or a plain PHP script beside your Joomla install, it runs in the same environment with the same commands. A single-purpose image cannot do that.
- **Far more flexibility.** 100+ ready services and any PHP version from 5.6 to 8.5, versus the narrower set of tags the official image maintains.
- **Nothing is hidden and you own everything.** No generated files, no magic, no wrapper binary between you and Docker. Every Dockerfile and compose file is right there for you to read and edit.
- **Nothing new to learn.** What you use is plain `docker compose`, knowledge that transfers straight to production and to every other project. Our [CLI](/docs/cli) is an optional nicety, never a requirement.

For Joomla specifically, Laradock wires a production-style NGINX + PHP-FPM stack, MySQL/MariaDB/PostgreSQL and Redis, and a `workspace` container with git and Composer already installed.

## Run Joomla on Docker with Laradock

### 1. Add Laradock to your project

```bash
cd my-joomla-site
git clone https://github.com/laradock/laradock.git
cd laradock && cp .env.example .env
```

(No Joomla files yet? Clone Laradock first, then download Joomla from the workspace container in the next steps.)

### 2. Pick the services your site needs

Joomla needs a web server and a database; add Redis for caching. The web server pulls in PHP-FPM automatically:

```bash
docker compose up -d nginx mysql redis workspace
```

Prefer MariaDB or PostgreSQL? Swap the name: `docker compose up -d nginx mariadb redis workspace`. The full catalog is [here](/docs/Intro#supported-services).

Prefer to be asked? The optional [CLI](/docs/cli) walks you through the choices: `./laradock setup`, then `./laradock up`. It prints every real command it runs.

### 3. Point Joomla at the containers

Joomla's installer asks for the database connection in the browser wizard; use the service name as the host:

```
Database Type: MySQLi
Host Name: mysql
Username: default
Password: secret
Database Name: default
```

The default database, user and password live in Laradock's `mysql/defaults.env`; override any of them by adding the line to Laradock's `.env` (it always wins).

### 4. Install and run your site

Enter the `workspace` container, where git and Composer live, and fetch Joomla:

```bash
docker compose exec workspace bash
curl -LO https://downloads.joomla.org/latest   # only if you have no Joomla files yet
```

Extract the archive into your project's public folder, then open [http://localhost](http://localhost) and finish the installer in the browser using the database details from the step above.

## Change the PHP version anytime

This is where a native install hurts and Laradock shines. Set the version in Laradock's `.env` and rebuild:

```env
PHP_VERSION=8.3
```

```bash
docker compose build php-fpm workspace
```

Joomla 5 requires PHP 8.1 or newer, and Laradock covers anything from PHP 5.6 to 8.5, so the same tool runs an older Joomla 4 site and a current Joomla 5 site side by side, each isolated, none of it installed on your machine.

## Frequently Asked Questions

### Do I need to install PHP or MySQL to run Joomla with Laradock?

No. Everything lives inside the containers. git and Composer are in the `workspace` container; you never install PHP or MySQL on your host.

### Which services should I start for a typical Joomla site?

`nginx mysql redis workspace` covers most sites: web server, database, cache, and a shell. Swap `mysql` for `mariadb` or `postgres` if you prefer.

### Can I run multiple Joomla sites on different PHP versions?

Yes. Give each its own Laradock with a unique `COMPOSE_PROJECT_NAME` and `DATA_PATH_HOST`, set a different `PHP_VERSION` in each, and they run independently on the same machine.

### Does this work the same on macOS, Windows and Linux?

Yes. Laradock runs anywhere Docker runs. On macOS/Windows, file-sync speed depends on Docker Desktop (VirtioFS helps a lot); it is a Docker Desktop trait, not specific to Laradock.

### Is this the same Docker setup I would use in production?

The containers are production-style (real NGINX + PHP-FPM), so it is far closer to production than a native install. See [Prepare Laradock for Production](/docs/usage#prepare-laradock-for-production) for the hardening steps.

---

Comparing environments? See the full **[Laradock vs Others](/docs/laradock-alternatives)** breakdown. Ready to start? **[Getting Started](/docs/getting-started)** takes about five minutes.
