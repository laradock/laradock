---
slug: /mediawiki-on-docker
title: Run MediaWiki on Docker
description: Run MediaWiki on Docker in minutes with Laradock. What Docker gives a MediaWiki install, why Laradock is the fastest way to get NGINX, PHP and MySQL running, and the exact commands, with any PHP version, without installing anything on your machine.
keywords:
  - mediawiki on docker
  - run mediawiki on docker
  - mediawiki docker
  - mediawiki docker setup
  - dockerize mediawiki
  - mediawiki docker environment
  - mediawiki nginx mysql docker
---

## What is MediaWiki?

[MediaWiki](https://www.mediawiki.org) is the open-source wiki software that powers Wikipedia and thousands of other wikis, known for its extension and skin ecosystem and its ability to handle very large, heavily-edited content collections. It is a PHP application backed by a database (MySQL/MariaDB is recommended; PostgreSQL and SQLite are also supported), served through a web server, and it benefits from Redis or Memcached for object caching once a wiki gets real traffic.

## Why run MediaWiki in Docker?

Docker packages each of those pieces (NGINX, PHP-FPM, MySQL) into isolated containers that run the same on every machine. Instead of installing PHP and MySQL onto your laptop, where versions collide between sites and "works on my machine" starts, you run disposable containers that mirror production and vanish cleanly when you delete them. One wiki can run the newer PHP MediaWiki now requires while another project stays on an older version, on the same computer, with nothing installed globally.

The catch: wiring those containers together yourself (base images, PHP extensions, networking, permissions) is a week of fiddly Docker work. That is exactly what Laradock removes.

## Why Laradock is the best fit for MediaWiki

Docker Hub does host a `mediawiki` image, but it is a generic Docker Official Image maintained by Docker, not a production tool endorsed by the MediaWiki project; it intentionally ships the bare minimum and is meant to be extended from, not run as-is. There is no first-party MediaWiki tool that wires up a web server, database and caching the way a project-specific setup would. Here is why Laradock is the best fit instead:

- **You are never locked into one ecosystem.** Laradock is framework-agnostic. Run your MediaWiki instance today, add a Laravel API, a WordPress site, or a plain PHP script beside it tomorrow, all in the same environment with the same commands.
- **Far more flexibility.** 100+ ready services and any PHP version from 5.6 to 8.5, so an older wiki install and a fresh one each get exactly the runtime they need.
- **Nothing is hidden and you own everything.** No generated files, no magic, no wrapper binary between you and Docker. Every Dockerfile and compose file is right there for you to read and edit.
- **Nothing new to learn.** What you use is plain `docker compose`, knowledge that transfers straight to production. Our [CLI](/docs/cli) is an optional nicety, never a requirement.

Concretely, for MediaWiki it gives you a production-style NGINX + PHP-FPM stack, MySQL/MariaDB/PostgreSQL already wired, and a `workspace` container with git, Composer and PHP's CLI (for the installer, cron jobs and maintenance scripts) installed.

## Run MediaWiki on Docker with Laradock

### 1. Add Laradock to your project

```bash
cd my-wiki
git clone https://github.com/laradock/laradock.git
cd laradock && cp .env.example .env
```

(No MediaWiki files yet? Clone Laradock first, then download the MediaWiki tarball from the `workspace` container in the next steps.)

### 2. Pick the services your wiki needs

MediaWiki needs a web server and a database. The web server pulls in PHP-FPM automatically:

```bash
docker compose up -d nginx mysql workspace
```

Prefer PostgreSQL? Swap the name: `docker compose up -d nginx postgres workspace`. The full catalog is [here](/docs/Intro#supported-services).

Prefer to be asked? The optional [CLI](/docs/cli) walks you through the choices: `./laradock setup`, then `./laradock up`. It prints every real command it runs.

### 3. Point MediaWiki at the containers

In your `LocalSettings.php`, use the service names as hostnames:

```php
$wgDBtype     = 'mysql';
$wgDBserver   = 'mysql';
$wgDBname     = 'default';
$wgDBuser     = 'default';
$wgDBpassword = 'secret';
```

The default database, user and password live in `mysql/defaults.env`; override any of them by adding the line to Laradock's `.env` (it always wins).

### 4. Install and run your wiki

Enter the `workspace` container and either finish the setup in the browser, or run the CLI installer (the maintenance script that writes `LocalSettings.php` for you):

```bash
docker compose exec workspace bash
php maintenance/install.php --dbserver=mysql --dbname=default \
  --dbuser=default --dbpass=secret --pass=adminpassword \
  "My Wiki" Admin
```

(On newer MediaWiki versions this same script is invoked via `php maintenance/run.php install`, and the exact flags can vary by release; run it with `--help` to confirm.) Then open [http://localhost](http://localhost). That is a full MediaWiki install running on Docker.

## Change the PHP version anytime

This is where a native install hurts and Laradock shines. Set the version in Laradock's `.env` and rebuild:

```env
PHP_VERSION=8.3
```

```bash
docker compose build php-fpm workspace
```

MediaWiki's current stable release requires PHP 8.1 or newer, with the newest release requiring PHP 8.3+; Laradock covers anything from PHP 5.6 to 8.5, so the same tool runs an older wiki pinned to an older PHP version and a brand-new install side by side, each isolated, none of it installed on your machine.

## Frequently Asked Questions

### Do I need to install PHP or MySQL to run MediaWiki with Laradock?

No. Everything lives inside the containers. PHP, its required extensions, and the database server are all provided; you never install them on your host.

### Which services should I start for a typical MediaWiki install?

`nginx mysql workspace` covers most wikis: web server, database, and a shell. Swap `mysql` for `postgres` if you prefer.

### Can I run multiple MediaWiki instances on different PHP versions?

Yes. Give each its own Laradock with a unique `COMPOSE_PROJECT_NAME` and `DATA_PATH_HOST`, set a different `PHP_VERSION` in each, and they run independently on the same machine.

### Does this work the same on macOS, Windows and Linux?

Yes. Laradock runs anywhere Docker runs. On macOS/Windows, file-sync speed depends on Docker Desktop (VirtioFS helps a lot); it is a Docker Desktop trait, not specific to Laradock.

### Is this the same Docker setup I would use in production?

The containers are production-style (real NGINX + PHP-FPM), so it is far closer to production than a native install. See [Prepare Laradock for Production](/docs/usage#prepare-laradock-for-production) for the hardening steps.

---

Comparing environments? See the full **[Laradock vs Others](/docs/laradock-alternatives)** breakdown. Ready to start? **[Getting Started](/docs/getting-started)** takes about five minutes.
