---
slug: /pimcore-on-docker
title: Run Pimcore on Docker
description: Run Pimcore on Docker in minutes with Laradock. What Docker gives a Symfony-based Pimcore PIM/CMS project, why Laradock is the fastest way to get NGINX, PHP, MySQL and Elasticsearch running, and the exact commands, without installing anything on your machine.
keywords:
  - pimcore on docker
  - run pimcore on docker
  - pimcore docker
  - pimcore docker setup
  - dockerize pimcore
  - pimcore docker environment
  - pimcore symfony mysql docker
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

## What is Pimcore?

[Pimcore](https://pimcore.com) is an enterprise platform combining a CMS, PIM (product information management), DAM (digital asset management) and commerce data model, built on Symfony. It is a full Symfony application, installed through Composer, backed by MySQL or MariaDB via Doctrine, and it commonly pairs with Elasticsearch or OpenSearch for search and large product catalogs. It needs a web server and a PHP runtime in front of all of that, plus a healthy amount of memory.

## Why run Pimcore in Docker?

Docker packages each of those pieces (NGINX, PHP-FPM, a database, Elasticsearch) into isolated containers that run the same on every machine. Instead of installing PHP, a database and a search engine onto your laptop, where versions collide between projects and "works on my machine" starts, you run disposable containers that mirror production and vanish cleanly when you delete them. One project can run PHP 8.3 while another runs 8.1, on the same computer, with nothing installed globally.

The catch: wiring those containers together yourself (base images, PHP extensions, networking, permissions) is a week of fiddly Docker work. That is exactly what Laradock removes.

## Why Laradock is the best fit for Pimcore

Pimcore ships its own official Docker-based installer and compose files in its skeleton and demo applications, so, like Symfony itself, it does not strictly need Laradock. It is still the best fit, and here is why:

- **You are never locked into one ecosystem.** Laradock is framework-agnostic. The day you add a Laravel API, a WordPress site, or a plain PHP script beside your Pimcore project, it runs in the same environment with the same commands. A Pimcore-only setup cannot do that.
- **Far more flexibility.** 100+ ready services and any PHP version from 5.6 to 8.5, versus the short curated list a project-specific compose file gives you.
- **Nothing is hidden and you own everything.** No generated files, no magic, no wrapper binary between you and Docker. Every Dockerfile and compose file is right there for you to read and edit.
- **Nothing new to learn.** What you use is plain `docker compose`, knowledge that transfers straight to production and to every other project. Our [CLI](/docs/cli) is an optional nicety, never a requirement.

For Pimcore specifically, Laradock wires a production-style NGINX + PHP-FPM stack, MySQL/MariaDB, Elasticsearch as an add-on service, and a `workspace` container with Composer, Node, npm and git already installed.

## Run Pimcore on Docker with Laradock

### 1. Add Laradock to your project

```bash
cd my-pimcore-app
git clone https://github.com/laradock/laradock.git
cd laradock && cp .env.example .env
```

(No Pimcore project yet? Clone Laradock first, then create one from the workspace container in the next steps.)

### 2. Pick the services your project needs

Every Pimcore project needs a web server, PHP-FPM and a database; add Elasticsearch if your project relies on Pimcore's search or large catalogs:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock start nginx mysql workspace
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose up -d nginx mysql workspace
```

</TabItem>
</Tabs>

Prefer MariaDB? Swap the name: `./laradock start nginx mariadb workspace` (or `docker compose up -d nginx mariadb workspace`). Need search later? Add it any time: `./laradock start elasticsearch` (or `docker compose up -d elasticsearch`). The full catalog is [here](/docs/Intro#supported-services).

Prefer to be asked? The optional [CLI](/docs/cli) walks you through the choices: `./laradock setup`, then `./laradock start`. It prints every real command it runs.

### 3. Point Pimcore at the containers

Pimcore reads its database connection from `config/packages/pimcore/*.yaml` or from a `DATABASE_URL` environment variable, using the service name as the hostname:

```env
DATABASE_URL="mysql://default:secret@mysql:3306/default?serverVersion=8.4&charset=utf8mb4"
```

The default database, user and password live in `mysql/defaults.env`; override any of them by adding the line to Laradock's `.env` (it always wins).

### 4. Install and run your project

Enter the shell where Composer, Node and the Pimcore console live, and run the usual commands:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock workspace
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose exec workspace bash
```

</TabItem>
</Tabs>

```bash
composer create-project pimcore/skeleton .   # only if you have no Pimcore project yet
php bin/console pimcore:install --admin-username=admin --admin-password=secret --no-interaction
```

Then open [http://localhost](http://localhost). That is a full Pimcore project running on Docker.

## Change the PHP version anytime

This is where a native install hurts and Laradock shines. Set the version in Laradock's `.env` and rebuild:

```env
PHP_VERSION=8.2
```

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock rebuild php-fpm workspace
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose build php-fpm workspace
```

</TabItem>
</Tabs>

Pimcore requires PHP 8.1 or newer, so a project pinned to an older supported release and a brand-new one can run side by side on different PHP versions, each isolated, none of it installed on your machine.

## Frequently Asked Questions

### Do I need to install PHP or Composer to run Pimcore with Laradock?

No. Everything lives inside the containers. Composer, Node, npm and git are all in the `workspace` container; you never install PHP on your host.

### Which services should I start for a typical Pimcore project?

`nginx mysql workspace` covers most projects. Swap `mysql` for `mariadb` if you prefer, and add `elasticsearch` once you rely on Pimcore's search or PIM catalog features.

### Can I run multiple Pimcore projects on different PHP versions?

Yes. Give each its own Laradock with a unique `COMPOSE_PROJECT_NAME` and `DATA_PATH_HOST`, set a different `PHP_VERSION` in each, and they run independently on the same machine.

### Does this work the same on macOS, Windows and Linux?

Yes. Laradock runs anywhere Docker runs. On macOS/Windows, file-sync speed depends on Docker Desktop (VirtioFS helps a lot for `vendor/`-heavy apps); it is a Docker Desktop trait, not specific to Laradock.

### Is this the same Docker setup I would use in production?

The containers are production-style (real NGINX + PHP-FPM), so it is far closer to production than a native install. Pimcore is memory-hungry, so check `memory_limit` in `php.ini` before going further. See [Prepare Laradock for Production](/docs/production#prepare-laradock-for-production) for the hardening steps.

---

Comparing environments? See the full **[Laradock vs Others](/docs/laradock-alternatives)** breakdown. Ready to start? **[Getting Started](/docs/getting-started)** takes about five minutes.
