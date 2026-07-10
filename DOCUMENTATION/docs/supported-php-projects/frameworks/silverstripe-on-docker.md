---
slug: /silverstripe-on-docker
title: Run SilverStripe on Docker
description: Run SilverStripe CMS on Docker in minutes with Laradock. What Docker gives a SilverStripe site, why Laradock is the fastest way to get NGINX, PHP and MySQL running, and the exact commands, with any PHP version, without installing anything on your machine.
keywords:
  - silverstripe on docker
  - run silverstripe on docker
  - silverstripe docker
  - silverstripe docker setup
  - dockerize silverstripe
  - silverstripe docker environment
  - silverstripe nginx mysql docker
---

## What is SilverStripe?

[SilverStripe CMS](https://www.silverstripe.org) (also written Silverstripe) is an open-source content management system and PHP framework, popular for government and enterprise sites that need a flexible content model rather than a plugin-driven CMS like WordPress. It ships its own ORM (`DataObject`), a templating layer, and an admin panel out of the box. A SilverStripe site needs a web server, PHP-FPM, and a database, most commonly MySQL or MariaDB; the current major version requires PHP 8.3 or newer.

## Why run SilverStripe in Docker?

Docker packages a web server, PHP-FPM and a database into isolated containers that run the same on every machine. Instead of installing PHP and MySQL onto your laptop, where versions collide between projects and "works on my machine" starts, you run disposable containers that mirror production and vanish cleanly when you delete them. One project can run PHP 8.4 while another runs an older SilverStripe site pinned to 8.1, on the same computer, with nothing installed globally.

The catch: wiring those containers together yourself (base images, PHP extensions, networking, permissions) is a week of fiddly Docker work. That is exactly what Laradock removes.

## Why Laradock is the best fit for SilverStripe

SilverStripe has no official first-party Docker tool; the community has written various Docker setups over the years, but nothing maintained by the SilverStripe team itself ships as the default path. Here is why Laradock is the best fit:

- **You are never locked into one ecosystem.** Laradock is framework-agnostic. Run SilverStripe today, and put a Laravel API or a WordPress site beside it tomorrow, all in the same environment with the same commands.
- **Far more flexibility.** 100+ ready services and any PHP version from 5.6 to 8.5, so an older SilverStripe 4 site and a current SilverStripe 6 site each get exactly the PHP version they need.
- **Nothing is hidden and you own everything.** No generated files, no magic, no wrapper binary between you and Docker. Every Dockerfile and compose file is right there for you to read and edit.
- **Nothing new to learn.** What you use is plain `docker compose`, knowledge that transfers straight to production. Our [CLI](/docs/cli) is an optional nicety, never a requirement.

For SilverStripe specifically, Laradock wires a production-style NGINX + PHP-FPM stack, MySQL/MariaDB already set up, and a `workspace` container with Composer and git installed.

## Run SilverStripe on Docker with Laradock

### 1. Add Laradock to your project

```bash
cd my-silverstripe-site
git clone https://github.com/laradock/laradock.git
cd laradock && cp .env.example .env
```

(No SilverStripe files yet? Clone Laradock first, then create the project from the workspace container in the next steps.)

### 2. Pick the services your site needs

SilverStripe needs a web server and a database (the web server pulls in PHP-FPM automatically):

```bash
docker compose up -d nginx mysql workspace
```

Prefer MariaDB? Swap the name: `docker compose up -d nginx mariadb workspace`. The full catalog is [here](/docs/Intro#supported-services).

### 3. Point SilverStripe at the containers

In your project's `.env` (in the project root, not `public/`), use the service name as the database host:

```env
SS_DATABASE_CLASS="MySQLDatabase"
SS_DATABASE_SERVER="mysql"
SS_DATABASE_NAME="default"
SS_DATABASE_USERNAME="default"
SS_DATABASE_PASSWORD="secret"
SS_DEFAULT_ADMIN_USERNAME="admin"
SS_DEFAULT_ADMIN_PASSWORD="secret"
SS_ENVIRONMENT_TYPE="dev"
```

The default database, user and password Laradock's MySQL container ships with live in `mysql/defaults.env`; override any of them by adding the line to Laradock's `.env` (it always wins).

### 4. Install and build your site from the workspace

Enter the `workspace` container, where Composer and git live, and set the site up:

```bash
docker compose exec workspace bash
composer create-project silverstripe/installer .   # only if you have no project yet
vendor/bin/sake dev/build
```

Point NGINX's document root at the project's `public/` folder, then open [http://localhost](http://localhost) and log in at `/admin` with the default admin credentials from your `.env`. That is a full SilverStripe site running on Docker.

## Change the PHP version anytime

This is where a native install hurts and Laradock shines. Set the version in Laradock's `.env` and rebuild:

```env
PHP_VERSION=8.4
```

```bash
docker compose build php-fpm workspace
```

The current SilverStripe CMS major version requires PHP 8.3, 8.4 or 8.5, while an older SilverStripe 4 site may need PHP 7.4 or 8.1. Laradock covers anything from PHP 5.6 to 8.5, so an old and a current site run side by side, each isolated, none of it installed on your machine.

## Frequently Asked Questions

### Do I need to install PHP or Composer to run SilverStripe with Laradock?

No. Everything lives inside the containers. Composer and git are in the `workspace` container; you never install PHP on your host.

### Which services should I start for a typical SilverStripe site?

`nginx mysql workspace` covers most sites. Swap `mysql` for `mariadb` if you prefer.

### Can I run multiple SilverStripe sites on different PHP versions?

Yes. Give each its own Laradock with a unique `COMPOSE_PROJECT_NAME` and `DATA_PATH_HOST`, set a different `PHP_VERSION` in each, and they run independently on the same machine.

### Does this work the same on macOS, Windows and Linux?

Yes. Laradock runs anywhere Docker runs. On macOS/Windows, file-sync speed depends on Docker Desktop (VirtioFS helps a lot); it is a Docker Desktop trait, not specific to Laradock.

### Is this the same Docker setup I would use in production?

The containers are production-style (real NGINX + PHP-FPM), so it is far closer to production than a native install. See [Prepare Laradock for Production](/docs/production#prepare-laradock-for-production) for the hardening steps.

---

Comparing environments? See the full **[Laradock vs Others](/docs/laradock-alternatives)** breakdown. Ready to start? **[Getting Started](/docs/getting-started)** takes about five minutes.
