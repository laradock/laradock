---
slug: /mybb-on-docker
title: Run MyBB on Docker
description: Run MyBB on Docker in minutes with Laradock. What Docker gives a MyBB forum, why Laradock is the fastest way to get NGINX, PHP and MySQL running, and the exact commands, with any PHP version, without installing anything on your machine.
keywords:
  - mybb on docker
  - run mybb on docker
  - mybb docker
  - mybb docker setup
  - dockerize mybb
  - mybb docker environment
  - mybb nginx mysql docker
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

## What is MyBB?

[MyBB](https://mybb.com) is a free, open-source forum software known for its plugin and theme ecosystem and its straightforward admin panel. It is a PHP application backed by a database (MySQL/MariaDB is the common choice; PostgreSQL and SQLite are also supported), served through a web server, and installed through a browser-based setup wizard.

## Why run MyBB in Docker?

Docker packages each of those pieces (NGINX, PHP-FPM, MySQL) into isolated containers that run the same on every machine. Instead of installing PHP and MySQL onto your laptop, where versions collide between projects and "works on my machine" starts, you run disposable containers that mirror production and vanish cleanly when you delete them. One forum can run an older PHP version to keep a legacy MyBB install and its plugins working, while another project runs the latest PHP, on the same computer, with nothing installed globally.

The catch: wiring those containers together yourself (base images, PHP extensions, networking, permissions) is a week of fiddly Docker work. That is exactly what Laradock removes.

## Why Laradock is the best fit for MyBB

MyBB has no official Docker image or first-party runtime of its own, so a ready-made, no-lock-in environment matters even more. Here is why Laradock is the best fit:

- **You are never locked into one ecosystem.** Laradock is framework-agnostic. Run your MyBB forum today, add a Laravel API, a WordPress marketing site, or a plain PHP script beside it tomorrow, all in the same environment with the same commands.
- **Far more flexibility.** 100+ ready services and any PHP version from 5.6 to 8.5, so an older forum with legacy plugins and a fresh install each get exactly the runtime they need.
- **Nothing is hidden and you own everything.** No generated files, no magic, no wrapper binary between you and Docker. Every Dockerfile and compose file is right there for you to read and edit.
- **Nothing new to learn.** What you use is plain `docker compose`, knowledge that transfers straight to production. Our [CLI](/docs/cli) is an optional nicety, never a requirement.

Concretely, for MyBB it gives you a production-style NGINX + PHP-FPM stack, MySQL/MariaDB already wired, and a `workspace` container with git and the file tools you need to unpack the MyBB package.

## Run MyBB on Docker with Laradock

### 1. Add Laradock to your project

```bash
cd my-mybb-forum
git clone https://github.com/laradock/laradock.git
cd laradock
```

(No MyBB files yet? Clone Laradock first, then download and extract the MyBB package from the `workspace` container in the next steps.)

### 2. Pick the services your forum needs

MyBB needs a web server and a database. The web server pulls in PHP-FPM automatically:

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

### 3. Point MyBB at the containers

MyBB's installer asks for these values in the browser and writes them into `inc/config.php`; use the service name as the database host:

```
Database Type: MySQLi
Database Server: mysql
Username: default
Password: secret
Database Name: default
```

The default database, user and password live in Laradock's `mysql/defaults.env`; override any of them by adding the line to Laradock's `.env` (it always wins).

### 4. Install and run your forum

Enter the `workspace` container, place the MyBB files in your project's web root (download the package from [mybb.com](https://mybb.com/download/) and extract it if you have not already), then finish the setup in the browser:

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

Then open `http://localhost/install/` and follow MyBB's install wizard: it checks your PHP version and extensions (mbstring, GD and SimpleXML among them), asks for the database details from the step above, and creates the admin account. Delete the `install/` directory once it is done, as MyBB's own docs require.

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

MyBB's official minimum is still PHP 5.2, which is long obsolete; current releases fixed compatibility with PHP 8, so run modern PHP for security and performance. Laradock covers anything from PHP 5.6 to 8.5, so the same tool runs an older MyBB install with legacy plugins and a brand-new one side by side, each isolated, none of it installed on your machine.

## Take your forum live

When your forum is ready, the same Laradock stack becomes your deployment. You build one hardened image of your app and ship it to the host of your choice:

```bash
./laradock ship
```

Then pick a target and follow its short guide, a single server, a managed platform, or Kubernetes: **[Deploy to Production](/docs/production)** lists every provider (Fly.io, Render, Railway, DigitalOcean, AWS, Google Cloud, Azure, Kamal, Kubernetes) with a ready config file for each. There is no per-provider magic to learn; a Docker image runs the same everywhere.

## Frequently Asked Questions

### Do I need to install PHP or MySQL to run MyBB with Laradock?

No. Everything lives inside the containers. PHP, its required extensions, and the database server are all provided; you never install them on your host.

### Which services should I start for a typical MyBB forum?

`nginx mysql workspace` covers most forums: web server, database, and a shell. Swap `mysql` for `mariadb` if you prefer.

### Can I run multiple MyBB forums on different PHP versions?

Yes. Give each its own Laradock with a unique `COMPOSE_PROJECT_NAME` and `DATA_PATH_HOST`, set a different `PHP_VERSION` in each, and they run independently on the same machine.

### Does this work the same on macOS, Windows and Linux?

Yes. Laradock runs anywhere Docker runs. On macOS/Windows, file-sync speed depends on Docker Desktop (VirtioFS helps a lot); it is a Docker Desktop trait, not specific to Laradock.

### Is this the same Docker setup I would use in production?

The containers are production-style (real NGINX + PHP-FPM), so it is far closer to production than a native install. See [Prepare Laradock for Production](/docs/production#prepare-laradock-for-production) for the hardening steps.

---

Comparing environments? See the full **[Laradock vs Others](/docs/laradock-alternatives)** breakdown. Ready to start? **[Getting Started](/docs/getting-started)** takes about five minutes.
