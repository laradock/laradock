---
slug: /lychee-on-docker
title: Run Lychee on Docker
description: Run Lychee, the self-hosted photo management app, on Docker in minutes with Laradock. What Docker gives a Lychee install, why Laradock is the fastest way to get NGINX, PHP and a database running, and the exact commands, with any PHP version, without installing anything on your machine.
keywords:
  - lychee on docker
  - run lychee on docker
  - lychee docker
  - lychee docker setup
  - dockerize lychee
  - lychee docker environment
  - lychee nginx mysql docker
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

## What is Lychee?

[Lychee](https://lycheeorg.dev) is a self-hosted photo management app: upload, organize into albums, and share your photos from your own server instead of a third-party cloud. It is a Laravel application, so a real Lychee install needs a web server, a PHP runtime, a database (MySQL, MariaDB, PostgreSQL or SQLite), and a persistent storage path for the uploaded photos themselves, kept separate from the database.

## Why run Lychee in Docker?

Docker packages the web server, PHP and the database into isolated containers that run the same on every machine. Instead of installing PHP and a database engine onto your laptop, where versions collide between projects and "works on my machine" starts, you run disposable containers that mirror production and vanish cleanly when you delete them. One project can run PHP 8.4 while another runs 8.2, on the same computer, with nothing installed globally.

The catch: wiring those containers together yourself (base images, PHP extensions, networking, permissions, and a volume for your photo library) is a week of fiddly Docker work. That is exactly what Laradock removes.

## Why Laradock is the best fit for Lychee

Lychee ships its own official Docker image (`lycheeorg/lychee`, maintained by the Lychee project), so, like Laravel, it does not strictly need Laradock. It is still the best fit, and here is why:

- **You are never locked into one ecosystem.** Laradock is framework-agnostic. The day you add a Laravel API, a WordPress blog, or a plain PHP script beside your Lychee gallery, it runs in the same environment with the same commands. A single-purpose image cannot do that.
- **Far more flexibility.** 100+ ready services and any PHP version from 5.6 to 8.5, versus the one PHP version baked into Lychee's own image.
- **Nothing is hidden and you own everything.** No generated files, no magic, no wrapper binary between you and Docker. Every Dockerfile and compose file is right there for you to read and edit.
- **Nothing new to learn.** What you use is plain `docker compose`, knowledge that transfers straight to production and to every other project. Our [CLI](/docs/cli) is an optional nicety, never a requirement.

For Lychee specifically, Laradock wires a production-style NGINX + PHP-FPM stack, MySQL/MariaDB, and a `workspace` container with Composer, Node, npm, git and Artisan already installed; you mount a photo storage folder as a volume so your library survives rebuilds.

## Run Lychee on Docker with Laradock

### 1. Add Laradock to your project

```bash
cd my-lychee-gallery
git clone https://github.com/laradock/laradock.git
cd laradock && cp .env.example .env
```

(No Lychee files yet? Clone Laradock first, then clone Lychee from [its GitHub repo](https://github.com/LycheeOrg/Lychee) into your project directory.)

### 2. Pick the services your gallery needs

Lychee needs a web server, PHP and a database. Start exactly those (the web server pulls in PHP-FPM automatically):

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

Prefer MariaDB or PostgreSQL? Swap the name: `./laradock start nginx mariadb workspace` (or `docker compose up -d nginx mariadb workspace`). The full catalog is [here](/docs/Intro#supported-services).

Prefer to be asked? The optional [CLI](/docs/cli) walks you through the choices: `./laradock setup`, then `./laradock start`. It prints every real command it runs.

### 3. Point Lychee at the containers and your photos

In your app's `.env`, use the service names as hostnames:

```env
DB_CONNECTION=mysql
DB_HOST=mysql
DB_DATABASE=default
DB_USERNAME=default
DB_PASSWORD=secret
```

The default database, user and password live in `mysql/defaults.env`; override any of them by adding the line to Laradock's `.env` (it always wins). Mount a dedicated folder into the `php-fpm` and `workspace` containers for `public/uploads` so your photos persist outside the container.

### 4. Install and run your gallery

Enter the shell where Composer, npm and Artisan live:

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

Then install dependencies and run the database migrations:

```bash
composer install --no-dev
php artisan key:generate
php artisan migrate
```

Then open [http://localhost](http://localhost) and finish setup (creating the first admin account) in the browser. That is a full Lychee install running on Docker.

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

Current Lychee releases require PHP 8.2 or newer, and anything up to 8.5 works, so an older Lychee install and a freshly upgraded one run side by side, each isolated, none of it installed on your machine.

## Frequently Asked Questions

### Do I need to install PHP or Composer to run Lychee with Laradock?

No. Everything lives inside the containers. Composer, Node, npm and Artisan are all in the `workspace` container; you never install PHP on your host.

### Which services should I start for a typical Lychee install?

`nginx mysql workspace` covers most installs: web server, database, and a shell for Artisan. Swap `mysql` for `mariadb` or `postgres` if you prefer.

### Where do my actual photos live?

Outside the database, on a volume mounted into the containers at Lychee's uploads path. Keep that volume across rebuilds so your library isn't lost.

### Can I run multiple Lychee instances on different PHP versions?

Yes. Give each its own Laradock with a unique `COMPOSE_PROJECT_NAME` and `DATA_PATH_HOST`, set a different `PHP_VERSION` in each, and they run independently on the same machine.

### Is this the same Docker setup I would use in production?

The containers are production-style (real NGINX + PHP-FPM), so it is far closer to production than a native install. See [Prepare Laradock for Production](/docs/production#prepare-laradock-for-production) for the hardening steps.

---

Comparing environments? See the full **[Laradock vs Others](/docs/laradock-alternatives)** breakdown. Ready to start? **[Getting Started](/docs/getting-started)** takes about five minutes.
