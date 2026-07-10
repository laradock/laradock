---
slug: /nextcloud-on-docker
title: Run Nextcloud on Docker
description: Run Nextcloud on Docker in minutes with Laradock. What Docker gives a Nextcloud instance, why Laradock is a solid alternative to the official image, and the exact commands, with any PHP version, without installing anything on your machine.
keywords:
  - nextcloud on docker
  - run nextcloud on docker
  - nextcloud docker
  - nextcloud docker setup
  - dockerize nextcloud
  - nextcloud docker environment
  - nextcloud nginx mysql docker
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

## What is Nextcloud?

[Nextcloud](https://nextcloud.com) is an open-source file sync, share and collaboration platform, a self-hosted alternative to Dropbox or Google Drive with calendar, contacts, and office-document apps built on top. It is known for giving individuals and organizations full control over where their data lives. A real Nextcloud instance needs a web server, a PHP runtime, a database (MySQL/MariaDB or PostgreSQL; SQLite is supported but only for tiny, non-production installs), and benefits heavily from Redis for caching and file locking once more than a handful of people use it.

## Why run Nextcloud in Docker?

Docker packages each of those pieces (NGINX, PHP-FPM, MySQL, Redis) into isolated containers that run the same on every machine. Instead of installing PHP and MySQL onto your server, where versions collide between projects and "works on my machine" starts, you run disposable containers that mirror production and vanish cleanly when you delete them. One instance can run PHP 8.3 while another PHP-dependent project on the same host runs a different version, with nothing installed globally.

The catch: wiring those containers together yourself (base images, PHP extensions, networking, permissions) is a week of fiddly Docker work. That is exactly what Laradock removes.

## Why Laradock is the best fit for Nextcloud

Nextcloud already ships an official, well-maintained [Docker image](https://hub.docker.com/_/nextcloud) with Docker Hub support, arguably the strongest official Docker story of any project in this comparison set. If all you need is a single Nextcloud instance running on its own, that image is a perfectly reasonable choice. Laradock is still worth considering:

- **You are never locked into one container.** The official image is an all-in-one box; Laradock is framework-agnostic. Run Nextcloud today, add a Laravel API, a WordPress site, or a plain PHP script beside it tomorrow, all in the same environment with the same commands.
- **Far more flexibility.** 100+ ready services and any PHP version from 5.6 to 8.5, useful when you need to pin an older PHP version to stay inside a specific Nextcloud release's compatibility window while other projects on the same machine run something newer.
- **Nothing is hidden and you own everything.** No opaque all-in-one container, no generated files, no magic. Every Dockerfile and compose file is right there for you to read and edit.
- **Nothing new to learn.** What you use is plain `docker compose`, knowledge that transfers straight to production and to every other project. Our [CLI](/docs/cli) is an optional nicety, never a requirement.

Concretely, for Nextcloud, Laradock wires a production-style NGINX + PHP-FPM stack, MySQL/MariaDB/PostgreSQL, Redis (Nextcloud uses it for transactional file locking and caching, not just as an add-on), and a `workspace` container with git, Composer and the PHP CLI already installed.

## Run Nextcloud on Docker with Laradock

### 1. Add Laradock to your project

```bash
cd my-nextcloud-install
git clone https://github.com/laradock/laradock.git
cd laradock && cp .env.example .env
```

(No Nextcloud files yet? Clone Laradock first, then download the Nextcloud server archive from the workspace container in the next steps.)

### 2. Pick the services Nextcloud needs

Nextcloud needs a web server and a database; add Redis for caching and file locking. The web server pulls in PHP-FPM automatically:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock start nginx mysql redis workspace
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose up -d nginx mysql redis workspace
```

</TabItem>
</Tabs>

Prefer PostgreSQL or MariaDB? Swap the name: `./laradock start nginx postgres redis workspace` (or `docker compose up -d nginx postgres redis workspace`). The full catalog is [here](/docs/Intro#supported-services).

Prefer to be asked? The optional [CLI](/docs/cli) walks you through the choices: `./laradock setup`, then `./laradock start`. It prints every real command it runs.

### 3. Point Nextcloud at the containers

Nextcloud's configuration lives in `config/config.php`. In a fresh install this file is normally generated for you by the installer (browser wizard or `occ`), not hand-edited beforehand. What you do need beforehand is the database connection info, which the installer will ask for, using the service names as hostnames:

- Database host: `mysql` (or `postgres`)
- Redis host: `redis`

The default database, user and password live in `mysql/defaults.env`; override any of them by adding the line to Laradock's `.env` (it always wins).

### 4. Install and run

Enter the `workspace` container and fetch the Nextcloud server archive into your web root (adjust the path to match your `nginx`/`APP_CODE_PATH_CONTAINER` setting):

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

Once inside, fetch the archive and unpack it:

```bash
curl -LO https://download.nextcloud.com/server/releases/latest.zip
unzip latest.zip -d /var/www
cd /var/www/nextcloud
```

From here, Nextcloud can be installed two ways: the browser-based setup wizard on first visit, or the `occ` command-line tool for a scripted, headless install:

```bash
php occ maintenance:install \
  --database "mysql" --database-name "default" \
  --database-host "mysql" --database-user "default" --database-pass "secret" \
  --admin-user "admin" --admin-pass "secret"
```

Or skip the CLI entirely and open [http://localhost](http://localhost), where the setup wizard walks you through the same steps.

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

Nextcloud's supported PHP range moves with every major release (Nextcloud 32 supports PHP 8.1-8.4, Nextcloud 34 supports PHP 8.2-8.5, for example), so pinning the exact version an install needs, and changing it later for an upgrade, is a one-line edit instead of a host-level PHP reinstall.

## Frequently Asked Questions

### Why use Laradock instead of the official Nextcloud Docker image?

The official image is the simplest path for a standalone Nextcloud instance. Laradock is worth it when Nextcloud is one of several PHP projects on the same machine, when you want every Dockerfile and compose file visible and editable rather than baked into one image, or when you need a specific PHP version pinned for a specific Nextcloud release.

### Do I need to install PHP or a database to run Nextcloud with Laradock?

No. Everything lives inside the containers. PHP, Composer and git are in the `workspace` container; you never install PHP on your host.

### Which services should I start for a typical Nextcloud instance?

`nginx mysql redis workspace` covers most instances: web server, database, cache and file locking, and a shell. Swap `mysql` for `postgres` or `mariadb` if you prefer.

### Can I run multiple Nextcloud instances on different PHP versions?

Yes. Give each its own Laradock with a unique `COMPOSE_PROJECT_NAME` and `DATA_PATH_HOST`, set a different `PHP_VERSION` in each, and they run independently on the same machine.

### Does this work the same on macOS, Windows and Linux?

Yes. Laradock runs anywhere Docker runs. On macOS/Windows, file-sync speed depends on Docker Desktop (VirtioFS helps a lot for large data directories); it is a Docker Desktop trait, not specific to Laradock.

---

Comparing environments? See the full **[Laradock vs Others](/docs/laradock-alternatives)** breakdown. Ready to start? **[Getting Started](/docs/getting-started)** takes about five minutes.
