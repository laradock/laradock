---
slug: /matomo-on-docker
title: Run Matomo on Docker
description: Run Matomo on Docker in minutes with Laradock. What Docker gives a self-hosted Matomo analytics install, why Laradock is the fastest way to get NGINX, PHP and MySQL running, and the exact commands, with any PHP version, without installing anything on your machine.
keywords:
  - matomo on docker
  - run matomo on docker
  - matomo docker
  - matomo docker setup
  - dockerize matomo
  - matomo docker environment
  - matomo nginx mysql docker
---

## What is Matomo?

[Matomo](https://matomo.org) (formerly Piwik) is a self-hosted, privacy-focused web analytics platform, an open-source alternative to Google Analytics that keeps all visitor data on your own server. It is a PHP application backed by a MySQL or MariaDB database, served through a web server, and it needs a recurring cron job to archive report data plus a comfortable `memory_limit` once you are tracking sites with real traffic.

## Why run Matomo in Docker?

Docker packages each of those pieces (NGINX, PHP-FPM, MySQL) into isolated containers that run the same on every machine. Instead of installing PHP and MySQL onto your laptop, where versions collide between projects and "works on my machine" starts, you run disposable containers that mirror production and vanish cleanly when you delete them. One Matomo install can run the latest PHP recommended for performance while another project runs an older version it still depends on, on the same computer, with nothing installed globally.

The catch: wiring those containers together yourself (base images, PHP extensions, networking, permissions) is a week of fiddly Docker work. That is exactly what Laradock removes.

## Why Laradock is the best fit for Matomo

Matomo does maintain its own official Docker images ([matomo-org/docker](https://github.com/matomo-org/docker), also published as a [Docker Official Image](https://hub.docker.com/_/matomo)), so, unlike most self-hosted PHP apps, it does not strictly need Laradock. It is still the best fit for anyone running more than just Matomo, and here is why:

- **You are never locked into one ecosystem.** Laradock is framework-agnostic. The day you add a Laravel API, a WordPress marketing site, or a plain PHP script beside your analytics install, it runs in the same environment with the same commands. A single-purpose Matomo image cannot do that.
- **Far more flexibility.** 100+ ready services and any PHP version from 5.6 to 8.5, versus the fixed image variants a purpose-built container gives you.
- **Nothing is hidden and you own everything.** No generated files, no magic, no wrapper binary between you and Docker. Every Dockerfile and compose file is right there for you to read and edit.
- **Nothing new to learn.** What you use is plain `docker compose`, knowledge that transfers straight to production and to every other project. Our [CLI](/docs/cli) is an optional nicety, never a requirement.

Concretely, for Matomo it gives you a production-style NGINX + PHP-FPM stack, MySQL/MariaDB already wired, and a `workspace` container with git and PHP's CLI (for the update and archiving commands) installed.

## Run Matomo on Docker with Laradock

### 1. Add Laradock to your project

```bash
cd my-matomo-install
git clone https://github.com/laradock/laradock.git
cd laradock && cp .env.example .env
```

(No Matomo files yet? Clone Laradock first, then download the Matomo package from the `workspace` container in the next steps.)

### 2. Pick the services your install needs

Matomo needs a web server and a database. The web server pulls in PHP-FPM automatically:

```bash
docker compose up -d nginx mysql workspace
```

Prefer MariaDB? Swap the name: `docker compose up -d nginx mariadb workspace`. The full catalog is [here](/docs/Intro#supported-services).

Prefer to be asked? The optional [CLI](/docs/cli) walks you through the choices: `./laradock setup`, then `./laradock up`. It prints every real command it runs.

### 3. Point Matomo at the containers

Matomo's installer asks for these values in the browser and writes them into `config/config.ini.php`; use the service name as the database host:

```
Database Server: mysql
Login: default
Password: secret
Database Name: default
```

The default database, user and password live in Laradock's `mysql/defaults.env`; override any of them by adding the line to Laradock's `.env` (it always wins).

### 4. Install and run your instance

Enter the `workspace` container, place the Matomo files in your project's web root (download the package from [matomo.org](https://matomo.org/download/) and extract it if you have not already), then finish the setup in the browser:

```bash
docker compose exec workspace bash
```

Then open [http://localhost](http://localhost) and follow Matomo's install wizard: system check, database connection (the values above), table creation, Super User account, and your first website/tracking code. There is no built-in, fully headless CLI equivalent to this wizard; if you need an unattended install, either pre-fill `config/config.ini.php` with your database details before the first request (Matomo then skips the database step), or use the community [ExtraTools plugin](https://plugins.matomo.org/ExtraTools), which adds a `matomo:install` console command.

## Change the PHP version anytime

This is where a native install hurts and Laradock shines. Set the version in Laradock's `.env` and rebuild:

```env
PHP_VERSION=8.3
```

```bash
docker compose build php-fpm workspace
```

Matomo works down to PHP 7.2.5 but is markedly faster on current PHP 8.x, which is what the project recommends; Laradock covers anything from PHP 5.6 to 8.5, so the same tool runs an older Matomo install and a brand-new one side by side, each isolated, none of it installed on your machine.

## Frequently Asked Questions

### Do I need to install PHP or MySQL to run Matomo with Laradock?

No. Everything lives inside the containers. PHP, its required extensions (curl, gd, mbstring, xml among them), and the database server are all provided; you never install them on your host.

### Which services should I start for a typical Matomo install?

`nginx mysql workspace` covers most installs: web server, database, and a shell. Swap `mysql` for `mariadb` if you prefer.

### Can I run multiple Matomo instances on different PHP versions?

Yes. Give each its own Laradock with a unique `COMPOSE_PROJECT_NAME` and `DATA_PATH_HOST`, set a different `PHP_VERSION` in each, and they run independently on the same machine.

### Does this work the same on macOS, Windows and Linux?

Yes. Laradock runs anywhere Docker runs. On macOS/Windows, file-sync speed depends on Docker Desktop (VirtioFS helps a lot); it is a Docker Desktop trait, not specific to Laradock.

### Is this the same Docker setup I would use in production?

The containers are production-style (real NGINX + PHP-FPM), so it is far closer to production than a native install. See [Prepare Laradock for Production](/docs/production#prepare-laradock-for-production) for the hardening steps, and remember to schedule Matomo's archiving cron the same way you would in production.

---

Comparing environments? See the full **[Laradock vs Others](/docs/laradock-alternatives)** breakdown. Ready to start? **[Getting Started](/docs/getting-started)** takes about five minutes.
