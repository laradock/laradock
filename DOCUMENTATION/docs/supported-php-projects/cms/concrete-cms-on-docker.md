---
slug: /concrete-cms-on-docker
title: Run Concrete CMS on Docker
description: Run Concrete CMS on Docker in minutes with Laradock. What Docker gives a Concrete CMS site, why Laradock is the fastest way to get NGINX, PHP and MySQL running, and the exact commands, with any PHP version, without installing anything on your machine.
keywords:
  - concrete cms on docker
  - run concrete cms on docker
  - concrete cms docker
  - concrete cms docker setup
  - dockerize concrete cms
  - concrete cms docker environment
  - concrete cms nginx mysql docker
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

## What is Concrete CMS?

[Concrete CMS](https://www.concretecms.com) (formerly concrete5) is an open source CMS best known for in-context editing: content editors work directly on the live page instead of a separate admin form. A Concrete CMS site is a PHP application backed by a MySQL or MariaDB database, served through a web server.

## Why run Concrete CMS in Docker?

Docker packages each of those pieces (NGINX, PHP-FPM, MySQL) into isolated containers that run the same on every machine. Instead of installing PHP and MySQL onto your laptop, where versions collide between sites and "works on my machine" starts, you run disposable containers that mirror production and vanish cleanly when you delete them. One site can run PHP 8.2 while an older Concrete install runs 7.4, on the same computer, with nothing installed globally.

The catch: wiring those containers together yourself (base images, PHP extensions, networking, permissions) is a week of fiddly Docker work. That is exactly what Laradock removes.

## Why Laradock is the best fit for Concrete CMS

Concrete CMS has no official Docker tool of its own, so a ready-made, no-lock-in environment matters even more. Here is why Laradock is the best fit:

- **You are never locked into one ecosystem.** Laradock is framework-agnostic. Run Concrete CMS today, add a Laravel API, a WordPress site, or a plain PHP script beside it tomorrow, all in the same environment with the same commands.
- **Far more flexibility.** 100+ ready services and any PHP version from 5.6 to 8.5, so an older Concrete install and a current one each get exactly the runtime they need.
- **Nothing is hidden and you own everything.** No generated files, no magic, no wrapper binary between you and Docker. Every Dockerfile and compose file is right there for you to read and edit.
- **Nothing new to learn.** What you use is plain `docker compose`, knowledge that transfers straight to production. Our [CLI](/docs/cli) is an optional nicety, never a requirement.

Concretely, for Concrete CMS it gives you a production-style NGINX + PHP-FPM stack, MySQL/MariaDB already wired, and a `workspace` container with git and Composer installed.

## Run Concrete CMS on Docker with Laradock

### 1. Add Laradock to your project

```bash
cd my-concrete-site
git clone https://github.com/laradock/laradock.git
cd laradock
```

(No Concrete CMS files yet? Clone Laradock first, then download Concrete CMS from the workspace container in the next steps.)

### 2. Pick the services your site needs

Concrete CMS needs a web server and a database. The web server pulls in PHP-FPM automatically:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock start nginx mysql workspace
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
cp .env.example .env
docker compose up -d nginx mysql workspace
```

</TabItem>
</Tabs>

Prefer MariaDB? Swap the name: `./laradock start nginx mariadb workspace` (or `docker compose up -d nginx mariadb workspace`). The full catalog is [here](/docs/Intro#supported-services).

Prefer to be asked? The optional [CLI](/docs/cli) walks you through the choices: `./laradock setup`, then `./laradock start`. It prints every real command it runs.

### 3. Point Concrete CMS at the containers

Concrete's installer asks for the database connection in the browser wizard; use the service name as the host:

```
Server: mysql
Username: default
Password: secret
Database: default
```

The default database, user and password live in Laradock's `mysql/defaults.env`; override any of them by adding the line to Laradock's `.env` (it always wins).

### 4. Install and run your site

Enter the `workspace` container, where git and Composer live, and fetch Concrete CMS:

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

Then, inside the container:

```bash
curl -LO https://www.concretecms.org/download_file/concrete5.zip   # only if you have no files yet
```

Extract the archive into your project's public folder, then open [http://localhost](http://localhost) and finish the installer in the browser using the database details from the step above.

## Change the PHP version anytime

This is where a native install hurts and Laradock shines. Set the version in Laradock's `.env` and rebuild:

```env
PHP_VERSION=8.1
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

Concrete CMS 9 supports PHP 7.4 through 8.x, with PHP 8.0 or newer recommended, and Laradock covers anything from PHP 5.6 to 8.5, so the same tool runs an older site and a current one side by side, each isolated, none of it installed on your machine.

## Take your site live

When your site is ready, the same Laradock stack becomes your deployment. You build one hardened image of your site and ship it to the host of your choice:

```bash
./laradock ship
```

Then pick a target and follow its short guide, a single server, a managed platform, or Kubernetes: **[Deploy to Production](/docs/production)** lists every provider (Fly.io, Render, Railway, DigitalOcean, AWS, Google Cloud, Azure, Kamal, Kubernetes) with a ready config file for each. There is no per-provider magic to learn; a Docker image runs the same everywhere.

## Frequently Asked Questions

### Do I need to install PHP or MySQL to run Concrete CMS with Laradock?

No. Everything lives inside the containers. git and Composer are in the `workspace` container; you never install PHP or MySQL on your host.

### Which services should I start for a typical Concrete CMS site?

`nginx mysql workspace` covers most sites: web server, database, and a shell. Swap `mysql` for `mariadb` if you prefer.

### Can I run multiple Concrete CMS sites on different PHP versions?

Yes. Give each its own Laradock with a unique `COMPOSE_PROJECT_NAME` and `DATA_PATH_HOST`, set a different `PHP_VERSION` in each, and they run independently on the same machine.

### Does this work the same on macOS, Windows and Linux?

Yes. Laradock runs anywhere Docker runs. On macOS/Windows, file-sync speed depends on Docker Desktop (VirtioFS helps a lot); it is a Docker Desktop trait, not specific to Laradock.

### Is this the same Docker setup I would use in production?

The containers are production-style (real NGINX + PHP-FPM), so it is far closer to production than a native install. See [Prepare Laradock for Production](/docs/production#prepare-laradock-for-production) for the hardening steps.

---

Comparing environments? See the full **[Laradock vs Others](/docs/laradock-alternatives)** breakdown. Ready to start? **[Getting Started](/docs/getting-started)** takes about five minutes.
