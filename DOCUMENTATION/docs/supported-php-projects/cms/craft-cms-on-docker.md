---
slug: /craft-cms-on-docker
title: Run Craft CMS on Docker
description: Run Craft CMS on Docker in minutes with Laradock. What Docker gives a Craft CMS site, why Laradock is the fastest way to get NGINX, PHP and MySQL running, and the exact commands, with any PHP version, without installing anything on your machine.
keywords:
  - craft cms on docker
  - run craft cms on docker
  - craft cms docker
  - craft cms docker setup
  - dockerize craft cms
  - craft cms docker environment
  - craft cms nginx mysql docker
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

## What is Craft CMS?

[Craft CMS](https://craftcms.com) is a professional CMS built on the Yii 2 PHP framework, known for a highly flexible content-modeling system (any structure of fields and blocks, not a fixed set of post types) aimed at agencies and custom builds. A Craft CMS site is a PHP application that needs a web server, a PHP runtime, and a real database; unlike a flat-file CMS, Craft requires MySQL or PostgreSQL to run at all.

## Why run Craft CMS in Docker?

Docker packages each of those pieces (NGINX, PHP-FPM, MySQL) into isolated containers that run the same on every machine. Instead of installing PHP and MySQL onto your laptop, where versions collide between sites and "works on my machine" starts, you run disposable containers that mirror production and vanish cleanly when you delete them. One site can run PHP 8.3 while another Craft 4 site pins to 8.2, on the same computer, with nothing installed globally.

The catch: wiring those containers together yourself (base images, PHP extensions, networking, permissions) is a week of fiddly Docker work. That is exactly what Laradock removes.

## Why Laradock is the best fit for Craft CMS

Craft CMS ships its own official Docker images (`craftcms/nginx`, `craftcms/php`, `craftcms/cli`), so, unlike most PHP projects, it does not strictly need Laradock. It is still the best fit, and here is why:

- **You are never locked into one ecosystem.** Laradock is framework-agnostic. The day you add a Laravel API, a WordPress site, or a plain PHP script beside your Craft install, it runs in the same environment with the same commands. Purpose-built images cannot do that.
- **Far more flexibility.** 100+ ready services and any PHP version from 5.6 to 8.5, versus the narrower set of tags the official images maintain.
- **Nothing is hidden and you own everything.** No generated files, no magic, no wrapper binary between you and Docker. Every Dockerfile and compose file is right there for you to read and edit.
- **Nothing new to learn.** What you use is plain `docker compose`, knowledge that transfers straight to production and to every other project. Our [CLI](/docs/cli) is an optional nicety, never a requirement.

For Craft CMS specifically, Laradock wires a production-style NGINX + PHP-FPM stack, MySQL/PostgreSQL already available, and a `workspace` container with Composer and git installed, so the `php craft` console works exactly like it would on a native install.

## Run Craft CMS on Docker with Laradock

### 1. Add Laradock to your project

```bash
cd my-craft-site
git clone https://github.com/laradock/laradock.git
cd laradock && cp .env.example .env
```

(No Craft project yet? Clone Laradock first, then create one from the workspace container in the next steps.)

### 2. Pick the services your site needs

Craft CMS needs a web server and a database; there is no flat-file mode, so pick one now. The web server pulls in PHP-FPM automatically:

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

Prefer PostgreSQL? Swap the name: `./laradock start nginx postgres workspace` (or `docker compose up -d nginx postgres workspace`). The full catalog is [here](/docs/Intro#supported-services).

Prefer to be asked? The optional [CLI](/docs/cli) walks you through the choices: `./laradock setup`, then `./laradock up`. It prints every real command it runs.

### 3. Point Craft CMS at the containers

In your project's `.env`, use the service name as the database connection host:

```env
CRAFT_DB_DRIVER=mysql
CRAFT_DB_SERVER=mysql
CRAFT_DB_USER=default
CRAFT_DB_PASSWORD=secret
CRAFT_DB_DATABASE=default
```

The default database, user and password live in Laradock's `mysql/defaults.env`; override any of them by adding the line to Laradock's `.env` (it always wins).

### 4. Install and run your site

Enter the `workspace` container, where Composer and git live, and run the installer:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI" default>

```bash
./laradock workspace
```

</TabItem>
<TabItem value="compose" label="Docker Compose">

```bash
docker compose exec workspace bash
```

</TabItem>
</Tabs>

Then, inside the container:

```bash
composer create-project craftcms/craft my-craft-site   # only if you have no project yet
php craft install
```

`php craft install` walks you through the database connection, site name, URL and admin account (or pass `--email`, `--username`, `--password`, `--site-name` and `--site-url` for an unattended run). Then open [http://localhost](http://localhost). That is a full Craft CMS site running on Docker.

## Change the PHP version anytime

This is where a native install hurts and Laradock shines. Set the version in Laradock's `.env` and rebuild:

```env
PHP_VERSION=8.2
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

Craft CMS 5 requires PHP 8.2 or newer, and Laradock covers anything from PHP 5.6 to 8.5, so the same tool runs an older Craft 4 site and a current Craft 5 site side by side, each isolated, none of it installed on your machine.

## Frequently Asked Questions

### Do I need to install PHP or Composer to run Craft CMS with Laradock?

No. Everything lives inside the containers. Composer and git are in the `workspace` container; you never install PHP on your host.

### Which services should I start for a typical Craft CMS site?

`nginx mysql workspace` covers most sites: web server, database, and a shell. Swap `mysql` for `postgres` if you prefer.

### Can I run multiple Craft CMS sites on different PHP versions?

Yes. Give each its own Laradock with a unique `COMPOSE_PROJECT_NAME` and `DATA_PATH_HOST`, set a different `PHP_VERSION` in each, and they run independently on the same machine.

### Does this work the same on macOS, Windows and Linux?

Yes. Laradock runs anywhere Docker runs. On macOS/Windows, file-sync speed depends on Docker Desktop (VirtioFS helps a lot for `vendor/`-heavy sites); it is a Docker Desktop trait, not specific to Laradock.

### Is this the same Docker setup I would use in production?

The containers are production-style (real NGINX + PHP-FPM), so it is far closer to production than a native install. See [Prepare Laradock for Production](/docs/production#prepare-laradock-for-production) for the hardening steps.

---

Comparing environments? See the full **[Laradock vs Others](/docs/laradock-alternatives)** breakdown. Ready to start? **[Getting Started](/docs/getting-started)** takes about five minutes.
