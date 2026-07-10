---
slug: /htmly-on-docker
title: Run HTMLy on Docker
description: Run HTMLy on Docker in minutes with Laradock. What Docker gives a HTMLy blog, why Laradock is the fastest way to get NGINX and PHP running, and the exact commands, with any PHP version, without installing anything on your machine.
keywords:
  - htmly on docker
  - run htmly on docker
  - htmly docker
  - htmly docker setup
  - dockerize htmly
  - htmly docker environment
  - htmly flat file cms docker
---

## What is HTMLy?

[HTMLy](https://www.htmly.com) is a flat-file blogging platform written in PHP. Instead of a database, every post and page is stored as a plain text file on disk, which keeps the whole stack down to a web server and a PHP runtime. It is aimed at people who want a fast, simple blog without the overhead (and the extra moving part) of running MySQL.

## Why run HTMLy in Docker?

Docker packages the web server and PHP runtime into isolated containers that run the same on every machine. Instead of installing PHP onto your laptop, where versions collide between projects and "works on my machine" starts, you run disposable containers that mirror production and vanish cleanly when you delete them. One blog can run PHP 8.3 while another runs an older 7.4 setup, on the same computer, with nothing installed globally.

The catch: wiring those containers together yourself (base images, PHP extensions, permissions) is a week of fiddly Docker work. That is exactly what Laradock removes.

## Why Laradock is the best fit for HTMLy

HTMLy has no official Docker image or first-party runtime of its own, so a ready-made, no-lock-in environment matters even more. Here is why Laradock is the best fit:

- **You are never locked into one ecosystem.** Laradock is framework-agnostic. Run HTMLy today, add a Laravel API, a WordPress site, or a plain PHP script beside it tomorrow, all in the same environment with the same commands.
- **Far more flexibility.** 100+ ready services and any PHP version from 5.6 to 8.5, so an older HTMLy install and a brand-new one each get exactly the runtime they need.
- **Nothing is hidden and you own everything.** No generated files, no magic, no wrapper binary between you and Docker. Every Dockerfile and compose file is right there for you to read and edit.
- **Nothing new to learn.** What you use is plain `docker compose`, knowledge that transfers straight to production. Our [CLI](/docs/cli) is an optional nicety, never a requirement.

Concretely, for HTMLy it gives you a production-style NGINX + PHP-FPM stack, no database container to babysit, a `workspace` container with git and Composer installed, and any PHP version behind a single line of config.

## Run HTMLy on Docker with Laradock

### 1. Add Laradock to your project

```bash
cd my-htmly-blog
git clone https://github.com/laradock/laradock.git
cd laradock && cp .env.example .env
```

(No HTMLy files yet? Clone Laradock first, then download HTMLy from the [releases page](https://github.com/danpros/htmly/releases) into your project root.)

### 2. Pick the services your blog needs

HTMLy has no database, so it only needs a web server. Start that (it pulls in PHP-FPM automatically) and the workspace shell:

```bash
docker compose up -d nginx workspace
```

The full catalog of every other available service is [here](/docs/Intro#supported-services).

Prefer to be asked? The optional [CLI](/docs/cli) walks you through the choices: `./laradock setup`, then `./laradock up`. It prints every real command it runs.

### 3. Point HTMLy at the containers

There is no hostname to configure, since there is no database. HTMLy reads its settings from `config.ini` in the project root; rename `config.ini.example` to `config.ini` and set your site URL, timezone and title there. Posts and pages live as plain files under `content/posts` and `content/pages`, which sit on your host through Laradock's normal volume mount, so you can edit them with any editor while the containers run.

### 4. Install and run your blog

Open the installer in your browser to generate the admin account and finish the config, then remove it:

```
http://localhost/install.php
```

Follow the on-screen steps, then delete `install.php` from the project root. (If you do not need a login at all, skip the installer, rename `config.ini.example` to `config.ini` yourself, and delete `install.php`.)

Then open [http://localhost](http://localhost). That is a full HTMLy blog running on Docker.

## Change the PHP version anytime

This is where a native install hurts and Laradock shines. Set the version in Laradock's `.env` and rebuild:

```env
PHP_VERSION=8.3
```

```bash
docker compose build php-fpm workspace
```

HTMLy needs PHP 7.2 or newer; current releases run cleanly on PHP 8.x. The same tool runs an old blog pinned to an older PHP release and a brand-new install side by side, each isolated, none of it installed on your machine.

## Frequently Asked Questions

### Do I need to install PHP or a database to run HTMLy with Laradock?

No. There is no database at all: HTMLy stores posts as flat files. PHP lives entirely inside the containers; you never install it on your host.

### Which services should I start for a typical HTMLy blog?

`nginx workspace` is all a HTMLy blog needs; the web server pulls in PHP-FPM automatically. There is no database service to add.

### Can I run multiple HTMLy blogs on different PHP versions?

Yes. Give each its own Laradock with a unique `COMPOSE_PROJECT_NAME` and `DATA_PATH_HOST`, set a different `PHP_VERSION` in each, and they run independently on the same machine.

### Does this work the same on macOS, Windows and Linux?

Yes. Laradock runs anywhere Docker runs. On macOS/Windows, file-sync speed depends on Docker Desktop (VirtioFS helps a lot); it is a Docker Desktop trait, not specific to Laradock.

### Is this the same Docker setup I would use in production?

The containers are production-style (real NGINX + PHP-FPM), so it is far closer to production than a native install. See [Prepare Laradock for Production](/docs/production#prepare-laradock-for-production) for the hardening steps.

---

Comparing environments? See the full **[Laradock vs Others](/docs/laradock-alternatives)** breakdown. Ready to start? **[Getting Started](/docs/getting-started)** takes about five minutes.
