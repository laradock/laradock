---
slug: /bolt-cms-on-docker
title: Run Bolt CMS on Docker
description: Run Bolt CMS on Docker in minutes with Laradock. What Docker gives a Bolt site, why Laradock is the fastest way to get NGINX and PHP running, and the exact commands, with any PHP version, without installing anything on your machine.
keywords:
  - bolt cms on docker
  - run bolt cms on docker
  - bolt cms docker
  - bolt cms docker setup
  - dockerize bolt cms
  - bolt cms docker environment
  - bolt cms sqlite mysql docker
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

## What is Bolt CMS?

[Bolt CMS](https://boltcms.io) is an open-source CMS built on Symfony and Twig. It is worth knowing there are two lineages: the original Bolt (2.x/3.x, built on Silex) is discontinued and its repository is archived, while the current Bolt (5.x/6.x, rebuilt on Symfony) is the actively maintained line and what this guide covers. A Bolt site needs a web server, PHP, and a database: it defaults to SQLite (a single file, no server process required) but also supports MySQL/MariaDB and PostgreSQL through Doctrine.

## Why run Bolt CMS in Docker?

Docker packages the web server and PHP runtime into isolated containers that run the same on every machine. Instead of installing PHP onto your laptop, where versions collide between projects and "works on my machine" starts, you run disposable containers that mirror production and vanish cleanly when you delete them. One Bolt site can run PHP 8.3 while another project runs a different version, on the same computer, with nothing installed globally.

The catch: wiring those containers together yourself (base images, PHP extensions, networking, permissions) is a week of fiddly Docker work. That is exactly what Laradock removes.

## Why Laradock is the best fit for Bolt CMS

Bolt has no official Docker image of its own, so a ready-made, no-lock-in environment matters even more. Here is why Laradock is the best fit:

- **You are never locked into one ecosystem.** Laradock is framework-agnostic. Run Bolt today, add a Laravel API, a WordPress site, or a plain PHP script beside it tomorrow, all in the same environment with the same commands.
- **Far more flexibility.** 100+ ready services and any PHP version from 5.6 to 8.5, plus MySQL, MariaDB and PostgreSQL if you outgrow Bolt's default SQLite file.
- **Nothing is hidden and you own everything.** No generated files, no magic, no wrapper binary between you and Docker. Every Dockerfile and compose file is right there for you to read and edit.
- **Nothing new to learn.** What you use is plain `docker compose`, knowledge that transfers straight to production. Our [CLI](/docs/cli) is an optional nicety, never a requirement.

Concretely, for Bolt it gives you a production-style NGINX + PHP-FPM stack, a `workspace` container with Composer and git installed, and MySQL or PostgreSQL ready to wire in the moment you decide SQLite is not enough.

## Run Bolt CMS on Docker with Laradock

### 1. Add Laradock to your project

```bash
cd my-bolt-site
git clone https://github.com/laradock/laradock.git
cd laradock && cp .env.example .env
```

(No Bolt project yet? Clone Laradock first, then create one from the workspace container in the next steps.)

### 2. Pick the services your site needs

Bolt defaults to SQLite, which is just a file, so a fresh install only needs a web server (it pulls in PHP-FPM automatically) and the workspace shell:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock start nginx workspace
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose up -d nginx workspace
```

</TabItem>
</Tabs>

Prefer MySQL or PostgreSQL instead? Add the service: `./laradock start nginx mysql workspace` or `./laradock start nginx postgres workspace`. The full catalog is [here](/docs/Intro#supported-services).

Prefer to be asked? The optional [CLI](/docs/cli) walks you through the choices: `./laradock setup`, then `./laradock start`. It prints every real command it runs.

### 3. Point Bolt at the containers

Bolt reads its database connection from `DATABASE_URL` in the project's `.env`. For the SQLite default, no hostname is needed:

```env
DATABASE_URL=sqlite:///%kernel.project_dir%/var/data/bolt.sqlite
```

Switching to MySQL, point it at the service name as the host, using the default database, user and password from `mysql/defaults.env` (override any of them by adding the line to Laradock's `.env`, which always wins):

```env
DATABASE_URL=mysql://default:secret@mysql:3306/default?serverVersion=8.0
```

### 4. Install and run your site

Enter the `workspace` container, create the project, and run the setup command:

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
composer create-project bolt/project my-bolt-site
cd my-bolt-site
bin/console bolt:setup
```

`bolt:setup` creates the database schema and walks you through creating the first admin user. Then open [http://localhost](http://localhost). That is a full Bolt site running on Docker.

## Change the PHP version anytime

This is where a native install hurts and Laradock shines. Set the version in Laradock's `.env` and rebuild:

```env
PHP_VERSION=8.3
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

Current Bolt requires PHP 8.2 or newer, so the same tool runs it alongside older projects pinned to earlier PHP versions, each isolated, none of it installed on your machine.

## Frequently Asked Questions

### Do I need to install PHP or a database server to run Bolt with Laradock?

No. PHP and Composer live in the containers. Bolt's default SQLite database is just a file inside your project, so you do not even need a database container unless you choose MySQL or PostgreSQL.

### Which services should I start for a typical Bolt site?

`nginx workspace` covers a default SQLite-backed install. Add `mysql` or `postgres` only if you point Bolt's `DATABASE_URL` at one of them.

### Can I run multiple Bolt sites on different PHP versions?

Yes. Give each its own Laradock with a unique `COMPOSE_PROJECT_NAME` and `DATA_PATH_HOST`, set a different `PHP_VERSION` in each, and they run independently on the same machine.

### Does this work the same on macOS, Windows and Linux?

Yes. Laradock runs anywhere Docker runs. On macOS/Windows, file-sync speed depends on Docker Desktop (VirtioFS helps a lot); it is a Docker Desktop trait, not specific to Laradock.

### Is this the same Docker setup I would use in production?

The containers are production-style (real NGINX + PHP-FPM), so it is far closer to production than a native install. For production, swap the default SQLite file for MySQL or PostgreSQL and see [Prepare Laradock for Production](/docs/production#prepare-laradock-for-production) for the hardening steps.

---

Comparing environments? See the full **[Laradock vs Others](/docs/laradock-alternatives)** breakdown. Ready to start? **[Getting Started](/docs/getting-started)** takes about five minutes.
