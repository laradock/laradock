# Run Dolibarr on Docker

Source: https://laradock.io/docs/dolibarr-on-docker

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

## What is Dolibarr?

[Dolibarr](https://www.dolibarr.org) is an open-source ERP and CRM: a single PHP application covering invoicing, orders, stock, CRM, HR and accounting for small and mid-size businesses. It is known for being modular, you enable only the features you need, and for shipping as a self-contained PHP codebase with a browser-based install wizard rather than a build step. What it genuinely needs is a web server, a PHP runtime, and a database (MySQL, MariaDB or PostgreSQL); Redis is optional but helps on busier installs.

## Why run Dolibarr in Docker?

Docker packages each of those pieces (a web server, PHP-FPM, MySQL/MariaDB/PostgreSQL, Redis) into isolated containers that run the same on every machine. Instead of installing PHP and a database onto your laptop, where versions collide between projects and "works on my machine" starts, you run disposable containers that mirror production and vanish cleanly when you delete them. One Dolibarr install can run PHP 8.3 while another project on the same computer runs a completely different stack, with nothing installed globally.

The catch: wiring those containers together yourself (base images, PHP extensions, networking, permissions) is a week of fiddly Docker work. That is exactly what Laradock removes.

## Why Laradock is the best fit for Dolibarr

Dolibarr does publish an official Docker image (`dolibarr/dolibarr`, maintained at [Dolibarr/dolibarr-docker](https://github.com/Dolibarr/dolibarr-docker)), but it is a single all-in-one container: PHP, Apache and Dolibarr baked together, with no database included and no workspace, cache or multi-service orchestration around it. You still have to hand-wire a database container and everything else yourself. Here is why Laradock is the better fit for a real dev environment:

- **You are never locked into one ecosystem.** Laradock is framework-agnostic. Run Dolibarr today, add a Laravel API, a WordPress site, or a plain PHP script beside it tomorrow, all in the same environment with the same commands.
- **Far more flexibility.** 100+ ready services and any PHP version from 5.6 to 8.5, versus a single fixed image with one PHP version baked in.
- **Nothing is hidden and you own everything.** No generated files, no magic, no wrapper binary between you and Docker. Every Dockerfile and compose file is right there for you to read and edit.
- **Nothing new to learn.** What you use is plain `docker compose`, knowledge that transfers straight to production and to every other project. Our [CLI](https://laradock.io/docs/cli) is an optional nicety, never a requirement.

Concretely, for Dolibarr it gives you a production-style NGINX (or Apache) + PHP-FPM stack, MySQL/MariaDB/PostgreSQL ready to connect (and Redis one command away when you want caching), and a `workspace` container with Composer, git and PHP CLI installed for any maintenance scripts.

## Run Dolibarr on Docker with Laradock

### 1. Add Laradock to your project

```bash
cd my-dolibarr-app
git clone https://github.com/laradock/laradock.git
cd laradock
```

(No Dolibarr files yet? Clone Laradock first, then download Dolibarr from the [official releases](https://www.dolibarr.org/downloads) or via the workspace container in the next steps.)

### 2. Pick the services your Dolibarr install needs

Dolibarr needs exactly two things: a web server and a database. The web server pulls in PHP-FPM automatically, so this is the whole required stack:

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

Prefer MariaDB or PostgreSQL? Swap the name: `./laradock start nginx mariadb workspace` (or `docker compose up -d nginx mariadb workspace`) or `./laradock start nginx postgres workspace` (or `docker compose up -d nginx postgres workspace`). The full catalog is [here](https://laradock.io/docs/Intro#supported-services).

Prefer to be asked? The optional [CLI](https://laradock.io/docs/cli) walks you through the choices: `./laradock setup`, then `./laradock start`. It prints every real command it runs.

> **Do I need Redis?** Not to get running. A fresh Dolibarr install runs perfectly on `nginx mysql workspace`. Redis only helps on busier installs, and only once you enable and point Dolibarr's cache at it. See [Add Redis caching](#add-redis-caching-optional) below when you actually want it.

### 3. Point Dolibarr at the containers

Dolibarr does not use a `.env` file for its own configuration; the install wizard writes the database connection into `htdocs/conf/conf.php` for you. When the wizard asks for the database host, user and password, use the service names and credentials from Laradock:

```
Database host: mysql
Database name / user / password: from mysql/defaults.env
```

The default database, user and password live in `mysql/defaults.env`; override any of them by adding the line to Laradock's `.env` (it always wins).

### 4. Install and run your app

Open [http://localhost](http://localhost). Dolibarr has no Artisan- or WP-CLI-style installer; instead its browser-based setup wizard walks you through the license, a set of environment checks, and the database connection form from step 3, then creates `conf/conf.php` and the admin account for you.

If you need a shell for Composer, git or a maintenance script, it lives in the workspace container:

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

That is a full Dolibarr install running on Docker.

## Change the PHP version anytime

This is where a native install hurts and Laradock shines. Dolibarr requires PHP 8.1 or newer, with 8.2/8.3 recommended for the best compatibility and performance. Set the version in Laradock's `.env` and rebuild:

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

So a Dolibarr install pinned to an older PHP release and a brand-new one run side by side, each isolated, none of it installed on your machine.

## Add Redis caching (optional)

Redis is not required, but on a busier install it can hold Dolibarr's cache in memory instead of on disk. Wiring it up is two steps:

1. Start the Redis container alongside the rest:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock start redis
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose up -d redis
```

</TabItem>
</Tabs>

2. Point Dolibarr's cache at it. In `htdocs/conf/conf.php`, set the memcached-compatible cache host to the service name:

```php
$dolibarr_main_prod = 1;
$dolibarr_main_force_https = 0;
$dolibarr_nocsrfcheck = 0;
// Cache backend
$dolibarr_main_memcached_host = 'redis';
```

Without those steps the Redis container just sits idle, which is why the required stack above leaves it out.

## Take your app live

When your Dolibarr install is ready, the same Laradock stack becomes your deployment. You build one hardened image of your app and ship it to the host of your choice:

```bash
./laradock ship
```

Then pick a target and follow its short guide, a single server, a managed platform, or Kubernetes: **[Deploy to Production](https://laradock.io/docs/production)** lists every provider (Fly.io, Render, Railway, DigitalOcean, AWS, Google Cloud, Azure, Kamal, Kubernetes) with a ready config file for each. There is no per-provider magic to learn; a Docker image runs the same everywhere.

## Frequently Asked Questions

### Do I need to install PHP or a database to run Dolibarr with Laradock?

No. Everything lives inside the containers. PHP, Composer and git are all available in the `workspace` container; you never install them on your host.

### Which services should I start for a typical Dolibarr install?

`nginx mysql workspace` is all Dolibarr requires: web server, database, and a shell. Swap `mysql` for `mariadb` or `postgres` if you prefer. Add `redis` only if you wire up Dolibarr's [cache](#add-redis-caching-optional); without it, Redis does nothing for Dolibarr.

### Can I run multiple Dolibarr installs on different PHP versions?

Yes. Give each its own Laradock with a unique `COMPOSE_PROJECT_NAME` and `DATA_PATH_HOST`, set a different `PHP_VERSION` in each, and they run independently on the same machine.

### Does this work the same on macOS, Windows and Linux?

Yes. Laradock runs anywhere Docker runs. On macOS/Windows, file-sync speed depends on Docker Desktop (VirtioFS helps a lot); it is a Docker Desktop trait, not specific to Laradock.

### Is this the same Docker setup I would use in production?

The containers are production-style (real NGINX + PHP-FPM), so it is far closer to production than a native install. See [Prepare Laradock for Production](https://laradock.io/docs/production#prepare-laradock-for-production) for the hardening steps.

---

Comparing environments? See the full **[Laradock vs Others](https://laradock.io/docs/laradock-alternatives)** breakdown. Ready to start? **[Getting Started](https://laradock.io/docs/getting-started)** takes about five minutes.
