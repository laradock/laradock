---
slug: /koel-on-docker
title: Run Koel on Docker
description: Run Koel, the personal music streaming server, on Docker in minutes with Laradock. What Docker gives a Koel install, why Laradock is the fastest way to get NGINX, PHP and a database running, and the exact commands, with any PHP version, without installing anything on your machine.
keywords:
  - koel on docker
  - run koel on docker
  - koel docker
  - koel docker setup
  - dockerize koel
  - koel docker environment
  - koel nginx mysql docker
---

## What is Koel?

[Koel](https://koel.dev) is a self-hosted personal music streaming server: point it at a folder of audio files and it scans, catalogs and streams your library back through a Vue-based web player. It is a Laravel application under the hood, so a real Koel install needs a web server, a PHP runtime and a database (MySQL, PostgreSQL, MariaDB or SQLite), plus a persistent storage path for the actual music files, kept separate from the database.

## Why run Koel in Docker?

Docker packages the web server, PHP and the database into isolated containers that run the same on every machine. Instead of installing PHP and a database engine onto your laptop, where versions collide between projects and "works on my machine" starts, you run disposable containers that mirror production and vanish cleanly when you delete them. One project can run PHP 8.4 while another runs 8.2, on the same computer, with nothing installed globally.

The catch: wiring those containers together yourself (base images, PHP extensions, networking, permissions, and a volume for your media library) is a week of fiddly Docker work. That is exactly what Laradock removes.

## Why Laradock is the best fit for Koel

Koel ships its own official Docker Compose setup (maintained by the Koel project itself, under `koel/docker`), so, like Laravel, it does not strictly need Laradock. It is still the best fit, and here is why:

- **You are never locked into one ecosystem.** Laradock is framework-agnostic. The day you add a Laravel API, a WordPress blog, or a plain PHP script beside your Koel instance, it runs in the same environment with the same commands. A single-purpose compose file cannot do that.
- **Far more flexibility.** 100+ ready services and any PHP version from 5.6 to 8.5, versus the one PHP version baked into Koel's own image.
- **Nothing is hidden and you own everything.** No generated files, no magic, no wrapper binary between you and Docker. Every Dockerfile and compose file is right there for you to read and edit.
- **Nothing new to learn.** What you use is plain `docker compose`, knowledge that transfers straight to production and to every other project. Our [CLI](/docs/cli) is an optional nicety, never a requirement.

For Koel specifically, Laradock wires a production-style NGINX + PHP-FPM stack, MySQL/PostgreSQL, and a `workspace` container with Composer, Node, npm, git and Artisan already installed; you mount your music folder as a volume and point `MEDIA_PATH` at it.

## Run Koel on Docker with Laradock

### 1. Add Laradock to your project

```bash
cd my-koel-server
git clone https://github.com/laradock/laradock.git
cd laradock && cp .env.example .env
```

(No Koel files yet? Clone Laradock first, then clone Koel from [its GitHub repo](https://github.com/koel/koel) into your project directory.)

### 2. Pick the services your library needs

Koel needs a web server, PHP and a database. Start exactly those (the web server pulls in PHP-FPM automatically):

```bash
docker compose up -d nginx mysql workspace
```

Prefer PostgreSQL? Swap the name: `docker compose up -d nginx postgres workspace`. The full catalog is [here](/docs/Intro#supported-services).

Prefer to be asked? The optional [CLI](/docs/cli) walks you through the choices: `./laradock setup`, then `./laradock up`. It prints every real command it runs.

### 3. Point Koel at the containers and your music

In your app's `.env`, use the service names as hostnames, and point `MEDIA_PATH` at a mounted volume holding your audio files:

```env
DB_CONNECTION=mysql
DB_HOST=mysql
DB_DATABASE=default
DB_USERNAME=default
DB_PASSWORD=secret
MEDIA_PATH=/music
```

The default database, user and password live in `mysql/defaults.env`; override any of them by adding the line to Laradock's `.env` (it always wins). Mount your actual music folder into the `php-fpm` and `workspace` containers at the same path so both the scanner and the player can reach it.

### 4. Install and run your library

Enter the shell where Composer, npm and Artisan live, and run Koel's own setup wizard:

```bash
docker compose exec workspace bash
composer install
php artisan koel:init
```

The wizard confirms your `.env`, migrates the database, sets the media path, and creates the first admin account. Then open [http://localhost](http://localhost). That is a full Koel server running on Docker.

## Change the PHP version anytime

This is where a native install hurts and Laradock shines. Set the version in Laradock's `.env` and rebuild:

```env
PHP_VERSION=8.3
```

```bash
docker compose build php-fpm workspace
```

Current Koel releases require PHP 8.2 or newer, and anything up to 8.5 works, so an older Koel install and a freshly upgraded one run side by side, each isolated, none of it installed on your machine.

## Frequently Asked Questions

### Do I need to install PHP, Composer or ffmpeg to run Koel with Laradock?

No. PHP, Composer, Node and npm all live inside the `workspace` container. If your library needs transcoding, you still need to make an `ffmpeg` binary available to the container and point `FFMPEG_PATH` at it.

### Which services should I start for a typical Koel server?

`nginx mysql workspace` covers most installs: web server, database, and a shell for Artisan. Swap `mysql` for `postgres` if you prefer.

### Where do my actual music files live?

Outside the database, on a volume you mount into the containers and point `MEDIA_PATH` at. Keep that path stable across restarts and rebuilds so Koel doesn't lose track of your library.

### Can I run multiple Koel instances on different PHP versions?

Yes. Give each its own Laradock with a unique `COMPOSE_PROJECT_NAME` and `DATA_PATH_HOST`, set a different `PHP_VERSION` in each, and they run independently on the same machine.

### Is this the same Docker setup I would use in production?

The containers are production-style (real NGINX + PHP-FPM), so it is far closer to production than a native install. See [Prepare Laradock for Production](/docs/usage#prepare-laradock-for-production) for the hardening steps.

---

Comparing environments? See the full **[Laradock vs Others](/docs/laradock-alternatives)** breakdown. Ready to start? **[Getting Started](/docs/getting-started)** takes about five minutes.
