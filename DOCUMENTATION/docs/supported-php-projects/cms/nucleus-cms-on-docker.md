---
slug: /nucleus-cms-on-docker
title: Run Nucleus CMS on Docker
description: Run Nucleus CMS on Docker in minutes with Laradock. What Docker gives a Nucleus CMS blog, why Laradock is the fastest way to get NGINX, PHP and MySQL running, and the exact commands, without installing anything on your machine.
keywords:
  - nucleus cms on docker
  - run nucleus cms on docker
  - nucleus cms docker
  - nucleus cms docker setup
  - dockerize nucleus cms
  - nucleus cms docker environment
  - nucleus cms nginx mysql docker
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

## What is Nucleus CMS?

Nucleus CMS is an early-2000s PHP blog management system with a MySQL backend. It is legacy software: development has been effectively dormant for years, the last meaningful commit to the project explicitly dropped support for PHP 8, and there is no realistic path to running current Nucleus code on a modern PHP version. This guide is for maintaining or archiving an existing Nucleus site, not for starting a new one. A Nucleus site is a PHP application backed by a MySQL database, served through a web server.

## Why run Nucleus CMS in Docker?

Docker packages each of those pieces (NGINX, PHP-FPM, MySQL) into isolated containers that run the same on every machine. This matters more for a codebase like Nucleus than for most: it needs an old PHP release that has no business being installed on your host machine, alongside your current projects that need current PHP. Docker keeps that old version fully isolated and disposable, and lets you delete it cleanly whenever you are done with it.

The catch: wiring those containers together yourself (base images, PHP extensions, networking, permissions) is a week of fiddly Docker work. That is exactly what Laradock removes.

## Why Laradock is the best fit for Nucleus CMS

Nucleus CMS has no official Docker image, and given its age it never will. A ready-made, no-lock-in environment matters even more for keeping an old codebase running safely. Here is why Laradock is the best fit:

- **You are never locked into one ecosystem.** Laradock is framework-agnostic. Keep a legacy Nucleus site running while a Laravel API, a WordPress site, or anything else runs beside it in the same environment with the same commands.
- **Far more flexibility.** 100+ ready services and any PHP version from 5.6 to 8.5, so an old Nucleus install gets the exact old PHP it needs without touching your host.
- **Nothing is hidden and you own everything.** No generated files, no magic, no wrapper binary between you and Docker. Every Dockerfile and compose file is right there for you to read and edit.
- **Nothing new to learn.** What you use is plain `docker compose`, knowledge that transfers straight to production. Our [CLI](/docs/cli) is an optional nicety, never a requirement.

Concretely, for Nucleus CMS it gives you a production-style NGINX + PHP-FPM stack, MySQL already wired, a `workspace` container with git installed, and an old PHP version kept alive behind a single line of config, isolated from everything else on your machine.

## Run Nucleus CMS on Docker with Laradock

### 1. Add Laradock to your project

```bash
cd my-nucleus-site
git clone https://github.com/laradock/laradock.git
cd laradock && cp .env.example .env
```

(No Nucleus files yet? Clone Laradock first, then pull your existing Nucleus files into your project root.)

### 2. Pick the services your site needs

Nucleus needs a web server and a database. Start exactly those (the web server pulls in PHP-FPM automatically):

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI" default>

```bash
./laradock start nginx mysql workspace
```

</TabItem>
<TabItem value="compose" label="Docker Compose">

```bash
docker compose up -d nginx mysql workspace
```

</TabItem>
</Tabs>

The full catalog of every other available service is [here](/docs/Intro#supported-services).

Prefer to be asked? The optional [CLI](/docs/cli) walks you through the choices: `./laradock setup`, then `./laradock start`. It prints every real command it runs.

### 3. Point Nucleus at the containers

The install wizard writes your database connection into `config.php`. Use the service name as the host, and the default database, user and password from `mysql/defaults.env`:

```
DB Host: mysql
DB Name: default
DB User: default
DB Pass: secret
```

Override any of them by adding the line to Laradock's `.env` (it always wins). `config.php` needs to be writable during install (Nucleus's own docs suggest `chmod 666`) and can be locked back down afterward.

### 4. Install and run your site

Open the installer in your browser and follow its steps to create the database tables and write `config.php`:

```
http://localhost/install/
```

Then open [http://localhost](http://localhost). That is a Nucleus CMS site running on Docker.

## Change the PHP version anytime

This is where a native install hurts and Laradock shines, particularly for a codebase this old. Set the version in Laradock's `.env` and rebuild:

```env
PHP_VERSION=7.4
```

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI" default>

```bash
./laradock rebuild php-fpm workspace
```

</TabItem>
<TabItem value="compose" label="Docker Compose">

```bash
docker compose build php-fpm workspace
```

</TabItem>
</Tabs>

Nucleus's last active development explicitly dropped PHP 8 support, so PHP 7.x is the safe choice. Laradock lets you pin exactly that version for this one site while every other project on the same machine runs whatever current PHP it needs, none of it installed on your host.

## Frequently Asked Questions

### Do I need to install PHP or MySQL to run Nucleus CMS with Laradock?

No. Everything lives inside the containers. PHP and MySQL are both provided; you never install them on your host, which matters most here since Nucleus needs an old PHP version you would not want on your machine directly.

### Which services should I start for a typical Nucleus site?

`nginx mysql workspace` covers a standard install: web server, database, and a shell.

### Can I run Nucleus CMS alongside modern projects on newer PHP?

Yes. Give each its own Laradock with a unique `COMPOSE_PROJECT_NAME` and `DATA_PATH_HOST`, pin Nucleus to `PHP_VERSION=7.4`, and run everything else on a current PHP version, all independently on the same machine.

### Does this work the same on macOS, Windows and Linux?

Yes. Laradock runs anywhere Docker runs. On macOS/Windows, file-sync speed depends on Docker Desktop (VirtioFS helps a lot); it is a Docker Desktop trait, not specific to Laradock.

### Is this the same Docker setup I would use in production?

The containers are production-style (real NGINX + PHP-FPM), so it is closer to production than a native install. Given how old and unmaintained Nucleus CMS is, treat any production use as a maintenance liability regardless of how it is hosted; see [Prepare Laradock for Production](/docs/production#prepare-laradock-for-production) for the general hardening steps.

---

Comparing environments? See the full **[Laradock vs Others](/docs/laradock-alternatives)** breakdown. Ready to start? **[Getting Started](/docs/getting-started)** takes about five minutes.
