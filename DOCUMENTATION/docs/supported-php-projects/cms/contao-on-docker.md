---
slug: /contao-on-docker
title: Run Contao on Docker
description: Run Contao on Docker in minutes with Laradock. What Docker gives a Contao site, why Laradock is the fastest way to get NGINX, PHP and MySQL running, and the exact commands, with any PHP version, without installing anything on your machine.
keywords:
  - contao on docker
  - run contao on docker
  - contao docker
  - contao docker setup
  - dockerize contao
  - contao docker environment
  - contao nginx mysql docker
---

## What is Contao?

[Contao](https://contao.org) is an open-source CMS built on Symfony, aimed at editors and agencies that need a structured, accessibility-focused site builder rather than a blogging tool. A Contao site is a PHP application backed by a MySQL (or MariaDB) database, served through a web server, installed either via the Contao Manager (a web-based graphical installer) or via Composer from the command line.

## Why run Contao in Docker?

Docker packages each of those pieces (NGINX, PHP-FPM, MySQL) into isolated containers that run the same on every machine. Instead of installing PHP and MySQL onto your laptop, where versions collide between projects and "works on my machine" starts, you run disposable containers that mirror production and vanish cleanly when you delete them. One site can run the PHP version the current Contao release needs while another project stays on an older one, on the same computer, with nothing installed globally.

The catch: wiring those containers together yourself (base images, PHP extensions, networking, permissions) is a week of fiddly Docker work. That is exactly what Laradock removes.

## Why Laradock is the best fit for Contao

Contao ships the Contao Manager, a self-contained PHP file that drives Composer for you, but it is not a Docker tool and does not solve the underlying web server, PHP or database setup. A ready-made, no-lock-in environment still matters. Here is why Laradock is the best fit:

- **You are never locked into one ecosystem.** Laradock is framework-agnostic. Run Contao today, add a Laravel API, a WordPress site, or a plain PHP script beside it tomorrow, all in the same environment with the same commands.
- **Far more flexibility.** 100+ ready services and any PHP version from 5.6 to 8.5, so an older Contao 4 install and a current Contao 5 build each get exactly the runtime they need.
- **Nothing is hidden and you own everything.** No generated files, no magic, no wrapper binary between you and Docker. Every Dockerfile and compose file is right there for you to read and edit.
- **Nothing new to learn.** What you use is plain `docker compose`, knowledge that transfers straight to production. Our [CLI](/docs/cli) is an optional nicety, never a requirement.

Concretely, for Contao it gives you a production-style NGINX + PHP-FPM stack, MySQL/MariaDB already wired, a `workspace` container with Composer and git installed, and any PHP version behind a single line of config.

## Run Contao on Docker with Laradock

### 1. Add Laradock to your project

```bash
cd my-contao-site
git clone https://github.com/laradock/laradock.git
cd laradock && cp .env.example .env
```

(No Contao project yet? Clone Laradock first, then create one from the workspace container in the next steps.)

### 2. Pick the services your site needs

Contao needs a web server and a database. Start exactly those (the web server pulls in PHP-FPM automatically):

```bash
docker compose up -d nginx mysql workspace
```

Prefer MariaDB over MySQL? Swap the name: `docker compose up -d nginx mariadb workspace`. The full catalog is [here](/docs/Intro#supported-services).

Prefer to be asked? The optional [CLI](/docs/cli) walks you through the choices: `./laradock setup`, then `./laradock up`. It prints every real command it runs.

### 3. Point Contao at the containers

Contao reads its database connection from `DATABASE_URL` in the project's `.env`. Use the service name as the host, and the default database, user and password from `mysql/defaults.env`:

```env
DATABASE_URL=mysql://default:secret@mysql:3306/default?serverVersion=8.0
```

Override any of those values by adding the line to Laradock's `.env` instead (it always wins).

### 4. Install and run your site

Enter the `workspace` container, create the project with Composer, and install it from the command line:

```bash
docker compose exec workspace bash
composer create-project contao/managed-edition my-contao-site
cd my-contao-site
vendor/bin/contao-console contao:migrate
vendor/bin/contao-console contao:user:create
```

`contao:migrate` sets up the database schema and `contao:user:create` creates your first back end administrator. Then open [http://localhost](http://localhost) for the front end and `http://localhost/contao` for the back end. That is a full Contao site running on Docker.

## Change the PHP version anytime

This is where a native install hurts and Laradock shines. Set the version in Laradock's `.env` and rebuild:

```env
PHP_VERSION=8.3
```

```bash
docker compose build php-fpm workspace
```

Current Contao (5.7) requires PHP 8.3 or newer, so the same tool runs it alongside an older Contao 4 project pinned to PHP 7.4, each isolated, none of it installed on your machine.

## Frequently Asked Questions

### Do I need to install PHP, Composer or MySQL to run Contao with Laradock?

No. Everything lives inside the containers. Composer, git and MySQL are all provided; you never install them on your host.

### Which services should I start for a typical Contao site?

`nginx mysql workspace` covers most sites: web server, database, and a shell. Swap `mysql` for `mariadb` if you prefer.

### Can I run multiple Contao sites on different PHP versions?

Yes. Give each its own Laradock with a unique `COMPOSE_PROJECT_NAME` and `DATA_PATH_HOST`, set a different `PHP_VERSION` in each, and they run independently on the same machine.

### Does this work the same on macOS, Windows and Linux?

Yes. Laradock runs anywhere Docker runs. On macOS/Windows, file-sync speed depends on Docker Desktop (VirtioFS helps a lot); it is a Docker Desktop trait, not specific to Laradock.

### Is this the same Docker setup I would use in production?

The containers are production-style (real NGINX + PHP-FPM), so it is far closer to production than a native install. See [Prepare Laradock for Production](/docs/production#prepare-laradock-for-production) for the hardening steps.

---

Comparing environments? See the full **[Laradock vs Others](/docs/laradock-alternatives)** breakdown. Ready to start? **[Getting Started](/docs/getting-started)** takes about five minutes.
