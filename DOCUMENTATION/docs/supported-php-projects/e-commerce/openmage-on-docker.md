---
slug: /openmage-on-docker
title: Run OpenMage on Docker
description: Run OpenMage LTS on Docker in minutes with Laradock. What Docker gives an OpenMage (Magento 1) store, why Laradock is the fastest way to get NGINX, PHP and MySQL running, and the exact commands, with any PHP version, without installing anything on your machine.
keywords:
  - openmage on docker
  - run openmage on docker
  - openmage docker
  - openmage lts docker setup
  - dockerize openmage
  - magento 1 docker
  - openmage nginx mysql docker
---

## What is OpenMage?

[OpenMage LTS](https://www.openmage.org) is the actively maintained, community-driven continuation of Magento 1 (it forked from Magento Community Edition 1.9.4.5), kept alive as a long-term-support, PCI-compliant option for merchants who still run Magento 1-era code. It is distinct from Magento 2 and its successors: it is a plain PHP application backed by a MySQL or MariaDB database, served through a web server, and, unlike Magento 2, it does not require Elasticsearch, since Elasticsearch only became a core requirement starting with Magento 2.

## Why run OpenMage in Docker?

Docker packages each of those pieces (NGINX, PHP-FPM, MySQL) into isolated containers that run the same on every machine. This matters more for OpenMage than for a modern project: it is Magento 1-lineage code that expects a specific PHP range, and running that next to a project that needs a current PHP version on the same host is exactly the kind of version collision Docker exists to avoid. Disposable containers let OpenMage keep the PHP version its codebase actually needs, mirror production, and vanish cleanly when you delete them.

The catch: wiring those containers together yourself (base images, PHP extensions, networking, permissions) is a week of fiddly Docker work. That is exactly what Laradock removes.

## Why Laradock is the best fit for OpenMage

The OpenMage project itself maintains official Docker tooling (a `Docker-Setups` repository and a bundled installer script in the main `magento-lts` repo), so, unlike most PHP projects, OpenMage does not strictly need Laradock. It is still the best fit, and here is why:

- **You are never locked into one ecosystem.** Laradock is framework-agnostic. The day you add a Laravel API, a WordPress site, or a plain PHP script beside your OpenMage store, it runs in the same environment with the same commands. A single-purpose OpenMage setup cannot do that.
- **Far more flexibility.** 100+ ready services and any PHP version from 5.6 to 8.5, versus the narrower, version-pinned images an OpenMage-specific setup targets.
- **Nothing is hidden and you own everything.** No generated files, no magic, no wrapper binary between you and Docker. Every Dockerfile and compose file is right there for you to read and edit.
- **Nothing new to learn.** What you use is plain `docker compose`, knowledge that transfers straight to production and to every other project. Our [CLI](/docs/cli) is an optional nicety, never a requirement.

For OpenMage specifically, Laradock wires an NGINX + PHP-FPM stack pinned to the PHP range OpenMage supports, MySQL/MariaDB already wired, and a `workspace` container with Composer and git installed.

## Run OpenMage on Docker with Laradock

### 1. Add Laradock to your project

```bash
cd my-openmage-store
git clone https://github.com/laradock/laradock.git
cd laradock && cp .env.example .env
```

(No OpenMage files yet? Clone Laradock first, then download OpenMage from the workspace container in the next steps.)

### 2. Pick the services your store needs

OpenMage needs a web server and a database; it does not require Elasticsearch or Redis to run. The web server pulls in PHP-FPM automatically:

```bash
docker compose up -d nginx mysql workspace
```

Prefer MariaDB over MySQL? Swap the name: `docker compose up -d nginx mariadb workspace`. The full catalog is [here](/docs/Intro#supported-services).

Prefer to be asked? The optional [CLI](/docs/cli) walks you through the choices: `./laradock setup`, then `./laradock up`. It prints every real command it runs.

### 3. Point OpenMage at the containers

OpenMage's browser installer writes the database connection into `app/etc/local.xml` for you. Fill the installer form with the container's service name as the host:

```
Database Host: mysql
Database Username: default
Database Password: secret
Database Name: default
```

The default database, user and password live in `mysql/defaults.env`; override any of them by adding the line to Laradock's `.env` (it always wins).

### 4. Install and run your store

Enter the `workspace` container, where Composer and git live, and fetch OpenMage:

```bash
docker compose exec workspace bash
git clone https://github.com/OpenMage/magento-lts.git .   # only if you have no project yet
```

OpenMage also supports a Composer-based install (it uses a Magento-root-dir installer rather than a plain `create-project`; see the [OpenMage install docs](https://docs.openmage.org/users/install/use-composer/) for the exact `composer.json` setup). Either way, open [http://localhost](http://localhost) and run the OpenMage installation wizard, which writes `app/etc/local.xml` and sets up the admin account. That is a full OpenMage store running on Docker.

## Change the PHP version anytime

This is where a native install hurts and Laradock shines. Set the version in Laradock's `.env` and rebuild:

```env
PHP_VERSION=8.2
```

```bash
docker compose build php-fpm workspace
```

OpenMage LTS targets PHP 8.1 through 8.5, and dropped support for older PHP versions as the project modernized past its Magento 1 origins. Laradock covers anything from PHP 5.6 to 8.5, so the same tool can run OpenMage alongside older Magento 1-era code that still needs a legacy PHP version, each isolated, none of it installed on your machine.

## Frequently Asked Questions

### Do I need to install PHP or MySQL to run OpenMage with Laradock?

No. Everything lives inside the containers. PHP, the web server, Composer and MySQL are all provided; you never install them on your host.

### Which services should I start for a typical OpenMage store?

`nginx mysql workspace` covers it: web server, database, and a shell with Composer and git. OpenMage does not need Elasticsearch or Redis to run, unlike Magento 2.

### Is OpenMage the same as Magento 2?

No. OpenMage is a continuation of Magento 1's codebase, not Magento 2. If you need a Magento 2-compatible Docker setup, that is a different stack with different requirements (including Elasticsearch/OpenSearch).

### Can I run multiple OpenMage stores on different PHP versions?

Yes. Give each its own Laradock with a unique `COMPOSE_PROJECT_NAME` and `DATA_PATH_HOST`, set a different `PHP_VERSION` in each, and they run independently on the same machine.

### Does this work the same on macOS, Windows and Linux?

Yes. Laradock runs anywhere Docker runs. On macOS/Windows, file-sync speed depends on Docker Desktop; it is a Docker Desktop trait, not specific to Laradock.

---

Comparing environments? See the full **[Laradock vs Others](/docs/laradock-alternatives)** breakdown. Ready to start? **[Getting Started](/docs/getting-started)** takes about five minutes.
