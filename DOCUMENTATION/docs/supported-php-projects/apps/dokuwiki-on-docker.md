---
slug: /dokuwiki-on-docker
title: Run DokuWiki on Docker
description: Run DokuWiki on Docker in minutes with Laradock. What Docker gives a DokuWiki site, why Laradock is the fastest way to get NGINX and PHP running, and the exact commands, with any PHP version, without installing anything on your machine.
keywords:
  - dokuwiki on docker
  - run dokuwiki on docker
  - dokuwiki docker
  - dokuwiki docker setup
  - dockerize dokuwiki
  - dokuwiki docker environment
  - dokuwiki nginx php docker
---

## What is DokuWiki?

[DokuWiki](https://www.dokuwiki.org) is an open source wiki application known for one thing above all: it has no database. Pages, revisions and media are stored as plain text files on disk, in the `data/` directory, which makes backups a simple file copy and the whole thing easy to reason about. It is a PHP application served through a web server; that is the entire stack it needs.

## Why run DokuWiki in Docker?

Docker packages the pieces DokuWiki actually needs (NGINX, PHP-FPM) into isolated containers that run the same on every machine. Instead of installing PHP onto your laptop, where versions collide between projects and "works on my machine" starts, you run disposable containers that mirror production and vanish cleanly when you delete them. One wiki can run on an older PHP version to keep a legacy plugin working, while another project runs the latest PHP, on the same computer, with nothing installed globally.

The catch: wiring those containers together yourself (base images, PHP extensions, networking, permissions) is a week of fiddly Docker work. That is exactly what Laradock removes.

## Why Laradock is the best fit for DokuWiki

DokuWiki has no official Docker image or first-party runtime of its own, so a ready-made, no-lock-in environment matters even more. Here is why Laradock is the best fit:

- **You are never locked into one ecosystem.** Laradock is framework-agnostic. Run your DokuWiki site today, add a Laravel API, a WordPress marketing site, or a plain PHP script beside it tomorrow, all in the same environment with the same commands.
- **Far more flexibility.** 100+ ready services and any PHP version from 5.6 to 8.5, so a legacy plugin-heavy wiki and a fresh install each get exactly the runtime they need.
- **Nothing is hidden and you own everything.** No generated files, no magic, no wrapper binary between you and Docker. Every Dockerfile and compose file is right there for you to read and edit.
- **Nothing new to learn.** What you use is plain `docker compose`, knowledge that transfers straight to production. Our [CLI](/docs/cli) is an optional nicety, never a requirement.

Concretely, for DokuWiki it gives you a production-style NGINX + PHP-FPM stack and a `workspace` container with git and the file tools you need to unpack the DokuWiki archive; there is no database service to wire up at all.

## Run DokuWiki on Docker with Laradock

### 1. Add Laradock to your project

```bash
cd my-dokuwiki-site
git clone https://github.com/laradock/laradock.git
cd laradock && cp .env.example .env
```

(No DokuWiki files yet? Clone Laradock first, then download and extract the DokuWiki package from the workspace container in the next steps.)

### 2. Pick the services your wiki needs

DokuWiki only needs a web server; there is no database to start. The web server pulls in PHP-FPM automatically:

```bash
docker compose up -d nginx workspace
```

Prefer Apache or Caddy instead? Swap the name: `docker compose up -d apache2 workspace`. The full catalog is [here](/docs/Intro#supported-services).

Prefer to be asked? The optional [CLI](/docs/cli) walks you through the choices: `./laradock setup`, then `./laradock up`. It prints every real command it runs.

### 3. Point DokuWiki at your project

There is no database host to configure. Just make sure DokuWiki's `data/`, `conf/` and related directories are writable by the web server user inside the container, since that is where all content and configuration is stored as plain files.

### 4. Install and run your wiki

Enter the `workspace` container, place the DokuWiki files in your project's web root (download the archive from [dokuwiki.org](https://www.dokuwiki.org) and extract it if you have not already):

```bash
docker compose exec workspace bash
```

Then open [http://localhost/install.php](http://localhost/install.php) and finish DokuWiki's browser installer: it checks file permissions, asks for a wiki name and admin account, and writes the configuration to `conf/local.php`. Remove or lock down `install.php` once it is done, as DokuWiki's own docs recommend.

## Change the PHP version anytime

This is where a native install hurts and Laradock shines. Set the version in Laradock's `.env` and rebuild:

```env
PHP_VERSION=8.2
```

```bash
docker compose build php-fpm workspace
```

Current DokuWiki releases need PHP 8.0 or newer; Laradock covers anything from PHP 5.6 to 8.5, so the same tool runs an older wiki pinned to a legacy plugin and a brand-new install side by side, each isolated, none of it installed on your machine.

## Frequently Asked Questions

### Do I need to install PHP to run DokuWiki with Laradock?

No. Everything lives inside the containers. PHP and its required extensions are already there; you never install them on your host.

### Which services should I start for a typical DokuWiki site?

`nginx workspace` covers it: web server and a shell. There is no database service to add, since DokuWiki stores everything as flat files.

### Can I run multiple DokuWiki sites on different PHP versions?

Yes. Give each its own Laradock with a unique `COMPOSE_PROJECT_NAME` and `DATA_PATH_HOST`, set a different `PHP_VERSION` in each, and they run independently on the same machine.

### Does this work the same on macOS, Windows and Linux?

Yes. Laradock runs anywhere Docker runs. On macOS/Windows, file-sync speed depends on Docker Desktop (VirtioFS helps a lot); it is a Docker Desktop trait, not specific to Laradock.

### Is this the same Docker setup I would use in production?

The containers are production-style (real NGINX + PHP-FPM), so it is far closer to production than a native install. See [Prepare Laradock for Production](/docs/production#prepare-laradock-for-production) for the hardening steps.

---

Comparing environments? See the full **[Laradock vs Others](/docs/laradock-alternatives)** breakdown. Ready to start? **[Getting Started](/docs/getting-started)** takes about five minutes.
