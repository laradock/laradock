---
slug: /punbb-on-docker
title: Run PunBB on Docker
description: Run PunBB on Docker in minutes with Laradock. What Docker gives a PunBB forum, why Laradock is the fastest way to get NGINX, PHP and MySQL running, and the exact commands, without installing anything on your machine.
keywords:
  - punbb on docker
  - run punbb on docker
  - punbb docker
  - punbb docker setup
  - dockerize punbb
  - punbb docker environment
  - punbb nginx mysql docker
---

## What is PunBB?

[PunBB](https://punbb.informer.com) is a minimalist, fast PHP forum package from the mid-2000s, notable mainly as the project FluxBB was forked from in 2008. It is a PHP application backed by a database (MySQL, PostgreSQL or SQLite), served through a web server, and installed through a browser-based setup wizard. Be aware going in: PunBB has seen essentially no development in recent years, its most recent stable release (1.4.6) is well over a decade old, and it should be treated as effectively unmaintained for anything beyond a legacy site you already run; a modern forum platform or the FluxBB community fork are safer choices for a new project.

## Why run PunBB in Docker?

Docker packages each of those pieces (NGINX, PHP-FPM, MySQL) into isolated containers that run the same on every machine. Instead of installing PHP and MySQL onto your laptop, where versions collide between projects and "works on my machine" starts, you run disposable containers that mirror production and vanish cleanly when you delete them. This matters especially for an old codebase like PunBB, since it lets you pin the exact ancient PHP version it needs without polluting your machine with it, while other projects run current PHP right alongside it.

The catch: wiring those containers together yourself (base images, PHP extensions, networking, permissions) is a week of fiddly Docker work. That is exactly what Laradock removes.

## Why Laradock is the best fit for PunBB

PunBB has no official Docker image or first-party runtime of its own, so a ready-made, no-lock-in environment matters even more for a project this old. Here is why Laradock is the best fit:

- **You are never locked into one ecosystem.** Laradock is framework-agnostic. Run a legacy PunBB forum today, add a Laravel API, a WordPress marketing site, or a plain PHP script beside it tomorrow, all in the same environment with the same commands.
- **Far more flexibility.** 100+ ready services and any PHP version from 5.6 to 8.5, so you can pin the old PHP version PunBB's codebase actually expects without it touching anything else on your machine.
- **Nothing is hidden and you own everything.** No generated files, no magic, no wrapper binary between you and Docker. Every Dockerfile and compose file is right there for you to read and edit.
- **Nothing new to learn.** What you use is plain `docker compose`, knowledge that transfers straight to production. Our [CLI](/docs/cli) is an optional nicety, never a requirement.

Concretely, for PunBB it gives you a production-style NGINX + PHP-FPM stack, MySQL/PostgreSQL already wired, and a `workspace` container with git and the file tools you need to unpack the PunBB package.

## Run PunBB on Docker with Laradock

### 1. Add Laradock to your project

```bash
cd my-punbb-forum
git clone https://github.com/laradock/laradock.git
cd laradock && cp .env.example .env
```

(No PunBB files yet? Clone Laradock first, then download and extract the PunBB package from the `workspace` container in the next steps.)

### 2. Pick the services your forum needs

PunBB needs a web server and a database. The web server pulls in PHP-FPM automatically:

```bash
docker compose up -d nginx mysql workspace
```

Prefer PostgreSQL? Swap the name: `docker compose up -d nginx postgres workspace`. The full catalog is [here](/docs/Intro#supported-services).

Prefer to be asked? The optional [CLI](/docs/cli) walks you through the choices: `./laradock setup`, then `./laradock up`. It prints every real command it runs.

### 3. Point PunBB at the containers

PunBB's installer asks for these values in the browser and writes them into `config.php`; use the service name as the database host:

```
Database type: MySQL
Database server hostname: mysql
Database username: default
Database password: secret
Database name: default
```

The default database, user and password live in Laradock's `mysql/defaults.env`; override any of them by adding the line to Laradock's `.env` (it always wins).

### 4. Install and run your forum

Enter the `workspace` container, place the PunBB files in your project's web root (download the package from [punbb.informer.com](https://punbb.informer.com/downloads.php) and extract it if you have not already), then finish the setup in the browser:

```bash
docker compose exec workspace bash
```

Then open `http://localhost/install.php` and follow PunBB's install wizard: it checks your PHP setup, asks for the database details from the step above, and creates the admin account. Delete `install.php` once it is done, as PunBB's own docs recommend.

## Change the PHP version anytime

This is where a native install hurts and Laradock shines. Set the version in Laradock's `.env` and rebuild:

```env
PHP_VERSION=5.6
```

```bash
docker compose build php-fpm workspace
```

PunBB 1.4's codebase predates PHP 7, so expect compatibility issues on anything newer without patches; Laradock covers anything from PHP 5.6 to 8.5, so you can give a legacy PunBB install the exact old PHP version it needs while every other project on the same machine runs current PHP, none of it installed on your host.

## Frequently Asked Questions

### Do I need to install PHP or MySQL to run PunBB with Laradock?

No. Everything lives inside the containers. PHP and the database server are all provided; you never install them on your host.

### Which services should I start for a typical PunBB forum?

`nginx mysql workspace` covers most forums: web server, database, and a shell. Swap `mysql` for `postgres` if you prefer.

### Can I run multiple PunBB forums on different PHP versions?

Yes. Give each its own Laradock with a unique `COMPOSE_PROJECT_NAME` and `DATA_PATH_HOST`, set a different `PHP_VERSION` in each, and they run independently on the same machine.

### Does this work the same on macOS, Windows and Linux?

Yes. Laradock runs anywhere Docker runs. On macOS/Windows, file-sync speed depends on Docker Desktop (VirtioFS helps a lot); it is a Docker Desktop trait, not specific to Laradock.

### Is this the same Docker setup I would use in production?

The containers are production-style (real NGINX + PHP-FPM), so it is far closer to production than a native install. See [Prepare Laradock for Production](/docs/usage#prepare-laradock-for-production) for the hardening steps, though given PunBB's maintenance status you should weigh whether it belongs in production at all.

---

Comparing environments? See the full **[Laradock vs Others](/docs/laradock-alternatives)** breakdown. Ready to start? **[Getting Started](/docs/getting-started)** takes about five minutes.
