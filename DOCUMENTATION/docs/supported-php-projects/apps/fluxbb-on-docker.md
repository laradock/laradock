---
slug: /fluxbb-on-docker
title: Run FluxBB on Docker
description: Run FluxBB on Docker in minutes with Laradock. What Docker gives a FluxBB forum, why Laradock is the fastest way to get NGINX, PHP and MySQL running, and the exact commands, with any PHP version, without installing anything on your machine.
keywords:
  - fluxbb on docker
  - run fluxbb on docker
  - fluxbb docker
  - fluxbb docker setup
  - dockerize fluxbb
  - fluxbb docker environment
  - fluxbb nginx mysql docker
---

## What is FluxBB?

[FluxBB](https://fluxbb.org) is a lightweight, fast PHP forum package forked from PunBB in 2008, built around a small footprint and a simple admin panel rather than a large extension ecosystem. It is a PHP application backed by a database (MySQL, PostgreSQL or SQLite), served through a web server, and installed through a browser-based setup wizard. The official project has been dormant since around 2021 (its site went offline and the domain lapsed), though a community-maintained fork keeps it working on current PHP versions; if you pick FluxBB today, use that fork rather than the last official release.

## Why run FluxBB in Docker?

Docker packages each of those pieces (NGINX, PHP-FPM, MySQL) into isolated containers that run the same on every machine. Instead of installing PHP and MySQL onto your laptop, where versions collide between projects and "works on my machine" starts, you run disposable containers that mirror production and vanish cleanly when you delete them. One forum can run an older PHP version to match a legacy FluxBB install, while another project runs the latest PHP a maintained fork supports, on the same computer, with nothing installed globally.

The catch: wiring those containers together yourself (base images, PHP extensions, networking, permissions) is a week of fiddly Docker work. That is exactly what Laradock removes.

## Why Laradock is the best fit for FluxBB

FluxBB has no official Docker image or first-party runtime of its own, so a ready-made, no-lock-in environment matters even more, especially given the project's unclear maintenance status. Here is why Laradock is the best fit:

- **You are never locked into one ecosystem.** Laradock is framework-agnostic. Run your FluxBB forum today, add a Laravel API, a WordPress marketing site, or a plain PHP script beside it tomorrow, all in the same environment with the same commands.
- **Far more flexibility.** 100+ ready services and any PHP version from 5.6 to 8.5, so you can pin the exact PHP version an old FluxBB install or its community fork needs, without touching anything else on your machine.
- **Nothing is hidden and you own everything.** No generated files, no magic, no wrapper binary between you and Docker. Every Dockerfile and compose file is right there for you to read and edit.
- **Nothing new to learn.** What you use is plain `docker compose`, knowledge that transfers straight to production. Our [CLI](/docs/cli) is an optional nicety, never a requirement.

Concretely, for FluxBB it gives you a production-style NGINX + PHP-FPM stack, MySQL/PostgreSQL already wired, and a `workspace` container with git and the file tools you need to unpack the FluxBB package.

## Run FluxBB on Docker with Laradock

### 1. Add Laradock to your project

```bash
cd my-fluxbb-forum
git clone https://github.com/laradock/laradock.git
cd laradock && cp .env.example .env
```

(No FluxBB files yet? Clone Laradock first, then download and extract the FluxBB package from the `workspace` container in the next steps.)

### 2. Pick the services your forum needs

FluxBB needs a web server and a database. The web server pulls in PHP-FPM automatically:

```bash
docker compose up -d nginx mysql workspace
```

Prefer PostgreSQL? Swap the name: `docker compose up -d nginx postgres workspace`. The full catalog is [here](/docs/Intro#supported-services).

Prefer to be asked? The optional [CLI](/docs/cli) walks you through the choices: `./laradock setup`, then `./laradock up`. It prints every real command it runs.

### 3. Point FluxBB at the containers

FluxBB's installer asks for these values in the browser and writes them into `config.php`; use the service name as the database host:

```
Database type: MySQLi
Database server hostname: mysql
Database username: default
Database password: secret
Database name: default
```

The default database, user and password live in Laradock's `mysql/defaults.env`; override any of them by adding the line to Laradock's `.env` (it always wins).

### 4. Install and run your forum

Enter the `workspace` container, place the FluxBB files in your project's web root (download the package from the community-maintained fork if you want current PHP support, or from [fluxbb.org](https://fluxbb.org/downloads/) for the last official release), then finish the setup in the browser:

```bash
docker compose exec workspace bash
```

Then open `http://localhost/install.php` and follow FluxBB's install wizard: it checks your PHP version, asks for the database details from the step above, and creates the admin account. Delete `install.php` once it is done, as FluxBB's own docs recommend.

## Change the PHP version anytime

This is where a native install hurts and Laradock shines. Set the version in Laradock's `.env` and rebuild:

```env
PHP_VERSION=8.1
```

```bash
docker compose build php-fpm workspace
```

The last official FluxBB release predates PHP 7, while the community-maintained fork runs on PHP 7.2 through 8.2; Laradock covers anything from PHP 5.6 to 8.5, so the same tool runs a legacy install pinned to an old PHP version and a fork-based install on current PHP side by side, each isolated, none of it installed on your machine.

## Frequently Asked Questions

### Do I need to install PHP or MySQL to run FluxBB with Laradock?

No. Everything lives inside the containers. PHP and the database server are all provided; you never install them on your host.

### Which services should I start for a typical FluxBB forum?

`nginx mysql workspace` covers most forums: web server, database, and a shell. Swap `mysql` for `postgres` if you prefer.

### Can I run multiple FluxBB forums on different PHP versions?

Yes. Give each its own Laradock with a unique `COMPOSE_PROJECT_NAME` and `DATA_PATH_HOST`, set a different `PHP_VERSION` in each, and they run independently on the same machine.

### Does this work the same on macOS, Windows and Linux?

Yes. Laradock runs anywhere Docker runs. On macOS/Windows, file-sync speed depends on Docker Desktop (VirtioFS helps a lot); it is a Docker Desktop trait, not specific to Laradock.

### Is this the same Docker setup I would use in production?

The containers are production-style (real NGINX + PHP-FPM), so it is far closer to production than a native install. See [Prepare Laradock for Production](/docs/usage#prepare-laradock-for-production) for the hardening steps.

---

Comparing environments? See the full **[Laradock vs Others](/docs/laradock-alternatives)** breakdown. Ready to start? **[Getting Started](/docs/getting-started)** takes about five minutes.
