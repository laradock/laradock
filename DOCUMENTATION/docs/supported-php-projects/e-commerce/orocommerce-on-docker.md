---
slug: /orocommerce-on-docker
title: Run OroCommerce on Docker
description: Run OroCommerce on Docker in minutes with Laradock. What Docker gives an OroCommerce B2B storefront, why Laradock is the fastest way to get NGINX, PHP, PostgreSQL/MySQL and Redis running, and the exact commands, with any PHP version, without installing anything on your machine.
keywords:
  - orocommerce on docker
  - run orocommerce on docker
  - orocommerce docker
  - orocommerce docker setup
  - dockerize orocommerce
  - orocommerce docker environment
  - orocommerce symfony postgresql docker
---

## What is OroCommerce?

[OroCommerce](https://oroinc.com/orocommerce) is an open-source B2B ecommerce platform built on the Symfony framework, aimed at wholesale, multi-organization and complex-catalog storefronts rather than a simple shop front. It is a PHP application backed by a real database (MySQL or PostgreSQL), served through a web server, and it leans on Redis for caching and, for larger catalogs, Elasticsearch for product search. It is noticeably heavier than a typical PHP app: Oro's own documentation calls for a `memory_limit` of at least 512M, and a comfortable local setup wants more CPU and RAM than a small CMS would.

## Why run OroCommerce in Docker?

Docker packages each of those pieces (NGINX, PHP-FPM, PostgreSQL/MySQL, Redis, Elasticsearch) into isolated containers that run the same on every machine. Instead of installing PHP and a database onto your laptop, where versions collide between projects and "works on my machine" starts, you run disposable containers that mirror production and vanish cleanly when you delete them. Given how resource-hungry OroCommerce is, that isolation also means its PHP process, database and search engine only consume what you allocate to their containers, without leaking configuration or memory pressure into the rest of your machine.

The catch: wiring those containers together yourself (base images, PHP extensions, networking, permissions) is a week of fiddly Docker work. That is exactly what Laradock removes.

## Why Laradock is the best fit for OroCommerce

Oro Inc. publishes official Docker images and a `docker-compose` demo setup for OroCommerce, so, unlike most PHP projects, it does not strictly need Laradock. It is still the best fit, and here is why:

- **You are never locked into one ecosystem.** Laradock is framework-agnostic. The day you add a Laravel API, a WordPress marketing site, or a plain PHP script beside your OroCommerce instance, it runs in the same environment with the same commands. A single-purpose demo image cannot do that.
- **Far more flexibility.** 100+ ready services and any PHP version from 5.6 to 8.5, versus the narrow, version-pinned set the official demo images target.
- **Nothing is hidden and you own everything.** No generated files, no magic, no wrapper binary between you and Docker. Every Dockerfile and compose file is right there for you to read and edit, which matters on a codebase as large as OroCommerce's.
- **Nothing new to learn.** What you use is plain `docker compose`, knowledge that transfers straight to production and to every other project. Our [CLI](/docs/cli) is an optional nicety, never a requirement.

For OroCommerce specifically, Laradock wires a production-style NGINX + PHP-FPM stack, PostgreSQL or MySQL, Redis for caching, optional Elasticsearch for search, and a `workspace` container with Composer already installed for the long dependency install OroCommerce needs.

## Run OroCommerce on Docker with Laradock

### 1. Add Laradock to your project

```bash
cd my-orocommerce-app
git clone https://github.com/laradock/laradock.git
cd laradock && cp .env.example .env
```

(No OroCommerce project yet? Clone Laradock first, then create one from the workspace container in the next steps.)

### 2. Pick the services your app needs

A typical OroCommerce install needs a web server, a database, and Redis; add Elasticsearch if you want full product search. The web server pulls in PHP-FPM automatically:

```bash
docker compose up -d nginx postgres redis workspace
```

Prefer MySQL over PostgreSQL? Swap the name: `docker compose up -d nginx mysql redis workspace`. Need search? `docker compose up -d elasticsearch`. The full catalog is [here](/docs/Intro#supported-services).

Prefer to be asked? The optional [CLI](/docs/cli) walks you through the choices: `./laradock setup`, then `./laradock up`. It prints every real command it runs.

### 3. Point OroCommerce at the containers

OroCommerce's installer writes your database connection into `config/parameters.yml`; use the service names as hostnames:

```yaml
database_driver: pdo_pgsql
database_host: postgres
database_port: 5432
database_name: default
database_user: default
database_password: secret
```

Use `pdo_mysql` and port `3306` instead if you started `mysql`. The default database, user and password live in `postgres/defaults.env` (or `mysql/defaults.env`); override any of them by adding the line to Laradock's `.env` (it always wins).

### 4. Install and run your app

Enter the `workspace` container, where Composer lives, and run the installer:

```bash
docker compose exec workspace bash
composer create-project oro/commerce-crm-application my-orocommerce-app   # only if you have no project yet
php bin/console oro:install --env=prod --timeout=2000
```

`oro:install` walks you through the database connection, organization name and admin account (it can also take those as command-line options). Then open [http://localhost](http://localhost). That is a full OroCommerce storefront running on Docker.

## Change the PHP version anytime

This is where a native install hurts and Laradock shines. Set the version in Laradock's `.env` and rebuild:

```env
PHP_VERSION=8.3
```

```bash
docker compose build php-fpm workspace
```

Current OroCommerce releases (6.x) run on PHP 8.3 and 8.4; Laradock covers anything from PHP 5.6 to 8.5, so the same tool can run an older Oro instance pinned to an earlier PHP version alongside a current one, each isolated, none of it installed on your machine.

## Frequently Asked Questions

### Do I need to install PHP or Composer to run OroCommerce with Laradock?

No. Everything lives inside the containers. Composer and PHP are provided in the `workspace` and `php-fpm` containers; you never install them on your host.

### Which services should I start for a typical OroCommerce app?

`nginx postgres redis workspace` covers most installs. Swap `postgres` for `mysql` if you prefer, and add `elasticsearch` once you need full product search.

### Can I run multiple OroCommerce projects on different PHP versions?

Yes. Give each its own Laradock with a unique `COMPOSE_PROJECT_NAME` and `DATA_PATH_HOST`, set a different `PHP_VERSION` in each, and they run independently on the same machine.

### Does this work the same on macOS, Windows and Linux?

Yes. Laradock runs anywhere Docker runs. On macOS/Windows, file-sync speed depends on Docker Desktop (VirtioFS helps a lot for a `vendor/`-heavy app like OroCommerce); it is a Docker Desktop trait, not specific to Laradock.

### Is this the same Docker setup I would use in production?

The containers are production-style (real NGINX + PHP-FPM), so it is far closer to production than a native install. Given how resource-sensitive OroCommerce is, also review Oro's own system requirements before sizing a production host. See [Prepare Laradock for Production](/docs/usage#prepare-laradock-for-production) for the hardening steps.

---

Comparing environments? See the full **[Laradock vs Others](/docs/laradock-alternatives)** breakdown. Ready to start? **[Getting Started](/docs/getting-started)** takes about five minutes.
