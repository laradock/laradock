---
slug: /neos-cms-on-docker
title: Run Neos CMS on Docker
description: Run Neos CMS on Docker in minutes with Laradock. What Docker gives a Flow-framework-based Neos project, why Laradock is the fastest way to get NGINX, PHP and MySQL running, and the exact commands, without installing anything on your machine.
keywords:
  - neos cms on docker
  - run neos cms on docker
  - neos cms docker
  - neos cms docker setup
  - dockerize neos cms
  - neos cms docker environment
  - neos flow docker
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

## What is Neos CMS?

[Neos](https://www.neos.io) is an open-source CMS built on the Flow framework, from the same team behind TYPO3. It is aimed at content-heavy, structured editing workflows, with a distinct content repository model separate from the presentation layer. It is a full Flow application, installed through Composer, backed by MySQL, MariaDB or PostgreSQL via Doctrine, served through a web server and a PHP runtime.

## Why run Neos CMS in Docker?

Docker packages each of those pieces (NGINX, PHP-FPM, a database) into isolated containers that run the same on every machine. Instead of installing PHP and a database onto your laptop, where versions collide between projects and "works on my machine" starts, you run disposable containers that mirror production and vanish cleanly when you delete them. One project can run PHP 8.3 while another runs 8.1, on the same computer, with nothing installed globally.

The catch: wiring those containers together yourself (base images, PHP extensions, networking, permissions) is a week of fiddly Docker work. That is exactly what Laradock removes.

## Why Laradock is the best fit for Neos CMS

Neos and the underlying Flow framework have no official first-party Docker image; community compose files exist, but nothing ships with the project itself. Here is why Laradock is the best fit:

- **You are never locked into one ecosystem.** Laradock is framework-agnostic. Run Neos today, add a Laravel API, a WordPress site, or a Symfony service beside it tomorrow, all in the same environment with the same commands.
- **Far more flexibility.** 100+ ready services and any PHP version from 5.6 to 8.5, versus the short curated list a project-specific compose file gives you.
- **Nothing is hidden and you own everything.** No generated files, no magic, no wrapper binary between you and Docker. Every Dockerfile and compose file is right there for you to read and edit.
- **Nothing new to learn.** What you use is plain `docker compose`, knowledge that transfers straight to production. Our [CLI](/docs/cli) is an optional nicety, never a requirement.

Concretely, for Neos it gives you a production-style NGINX + PHP-FPM stack, MySQL/PostgreSQL/MariaDB already wired, and a `workspace` container with Composer, Node, npm and git already installed.

## Run Neos CMS on Docker with Laradock

### 1. Add Laradock to your project

```bash
cd my-neos-app
git clone https://github.com/laradock/laradock.git
cd laradock
```

(No Neos project yet? Clone Laradock first, then create one from the workspace container in the next steps.)

### 2. Pick the services your project needs

Every Neos project needs a web server, PHP-FPM and a database:

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

Prefer PostgreSQL or MariaDB? Swap the name: `./laradock start nginx postgres workspace` (or `docker compose up -d nginx postgres workspace`). The full catalog is [here](/docs/Intro#supported-services).

Prefer to be asked? The optional [CLI](/docs/cli) walks you through the choices: `./laradock setup`, then `./laradock start`. It prints every real command it runs.

### 3. Point Neos at the containers

Neos and Flow read database settings from `Configuration/Settings.yaml`, using the service name as the hostname:

```yaml
Neos:
  Flow:
    persistence:
      backendOptions:
        host: mysql
        dbname: default
        user: default
        password: secret
```

The default database, user and password live in `mysql/defaults.env`; override any of them by adding the line to Laradock's `.env` (it always wins).

### 4. Install and run your project

Enter the shell where Composer and the Flow console live, and run the usual commands:

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
composer create-project neos/neos-base-distribution .   # only if you have no Neos project yet
./flow setup
```

`./flow setup` runs Neos's own setup wizard, which walks you through the database connection and admin account. Then open [http://localhost](http://localhost). That is a full Neos project running on Docker.

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

Recent Neos and Flow releases require PHP 8.2 or newer, while older Neos versions run on PHP 7.1+, so a legacy project and a brand-new one can run side by side on different PHP versions, each isolated, none of it installed on your machine.

## Take your project live

When your project is ready, the same Laradock stack becomes your deployment. You build one hardened image of your app and ship it to the host of your choice:

```bash
./laradock ship
```

Then pick a target and follow its short guide, a single server, a managed platform, or Kubernetes: **[Deploy to Production](/docs/production)** lists every provider (Fly.io, Render, Railway, DigitalOcean, AWS, Google Cloud, Azure, Kamal, Kubernetes) with a ready config file for each. There is no per-provider magic to learn; a Docker image runs the same everywhere.

## Frequently Asked Questions

### Do I need to install PHP or Composer to run Neos with Laradock?

No. Everything lives inside the containers. Composer, Node, npm and git are all in the `workspace` container; you never install PHP on your host.

### Which services should I start for a typical Neos project?

`nginx mysql workspace` covers most projects. Swap `mysql` for `postgres` or `mariadb` if you prefer.

### Can I run multiple Neos projects on different PHP versions?

Yes. Give each its own Laradock with a unique `COMPOSE_PROJECT_NAME` and `DATA_PATH_HOST`, set a different `PHP_VERSION` in each, and they run independently on the same machine.

### Does this work the same on macOS, Windows and Linux?

Yes. Laradock runs anywhere Docker runs. On macOS/Windows, file-sync speed depends on Docker Desktop (VirtioFS helps a lot for `vendor/`-heavy projects); it is a Docker Desktop trait, not specific to Laradock.

### Is this the same Docker setup I would use in production?

The containers are production-style (real NGINX + PHP-FPM), so it is far closer to production than the Flow development server. See [Prepare Laradock for Production](/docs/production#prepare-laradock-for-production) for the hardening steps.

---

Comparing environments? See the full **[Laradock vs Others](/docs/laradock-alternatives)** breakdown. Ready to start? **[Getting Started](/docs/getting-started)** takes about five minutes.
