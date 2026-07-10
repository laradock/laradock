---
slug: /sulu-cms-on-docker
title: Run Sulu CMS on Docker
description: Run Sulu CMS on Docker in minutes with Laradock. What Docker gives a Symfony-based Sulu project, why Laradock is the fastest way to get NGINX, PHP, MySQL and Elasticsearch running, and the exact commands, without installing anything on your machine.
keywords:
  - sulu cms on docker
  - run sulu on docker
  - sulu docker
  - sulu docker setup
  - dockerize sulu cms
  - sulu docker environment
  - sulu symfony docker
---

## What is Sulu CMS?

[Sulu](https://sulu.io) is an enterprise-grade, Symfony-based CMS aimed at editors and developers who need structured content, multi-site and multilingual setups. It is a full Symfony application, installed through Composer, backed by MySQL or PostgreSQL via Doctrine, and it commonly uses Elasticsearch for its content search. It needs a web server and a PHP runtime in front of all of that.

## Why run Sulu in Docker?

Docker packages each of those pieces (NGINX, PHP-FPM, a database, Elasticsearch) into isolated containers that run the same on every machine. Instead of installing PHP, a database and a search engine onto your laptop, where versions collide between projects and "works on my machine" starts, you run disposable containers that mirror production and vanish cleanly when you delete them. One project can run PHP 8.3 while another runs 8.1, on the same computer, with nothing installed globally.

The catch: wiring those containers together yourself (base images, PHP extensions, networking, permissions) is a week of fiddly Docker work. That is exactly what Laradock removes.

## Why Laradock is the best fit for Sulu

Sulu publishes its own `sulu-docker` setup with a `docker-compose.yml` for MySQL and Elasticsearch, so, like Symfony itself, it does not strictly need Laradock. It is still the best fit, and here is why:

- **You are never locked into one ecosystem.** Laradock is framework-agnostic. The day you add a Laravel API, a WordPress site, or a plain PHP script beside your Sulu project, it runs in the same environment with the same commands. A Sulu-only setup cannot do that.
- **Far more flexibility.** 100+ ready services and any PHP version from 5.6 to 8.5, versus the short curated list a project-specific compose file gives you.
- **Nothing is hidden and you own everything.** No generated files, no magic, no wrapper binary between you and Docker. Every Dockerfile and compose file is right there for you to read and edit.
- **Nothing new to learn.** What you use is plain `docker compose`, knowledge that transfers straight to production and to every other project. Our [CLI](/docs/cli) is an optional nicety, never a requirement.

For Sulu specifically, Laradock wires a production-style NGINX + PHP-FPM stack, MySQL/PostgreSQL, Elasticsearch as an add-on, and a `workspace` container with Composer, Node, npm and git already installed.

## Run Sulu CMS on Docker with Laradock

### 1. Add Laradock to your project

```bash
cd my-sulu-app
git clone https://github.com/laradock/laradock.git
cd laradock && cp .env.example .env
```

(No Sulu project yet? Clone Laradock first, then create one from the workspace container in the next steps.)

### 2. Pick the services your project needs

Every Sulu project needs a web server, PHP-FPM and a database; add Elasticsearch if you use Sulu's content search:

```bash
docker compose up -d nginx mysql workspace
```

Prefer PostgreSQL? Swap the name: `docker compose up -d nginx postgres workspace`. Need search later? Add it any time: `docker compose up -d elasticsearch`. The full catalog is [here](/docs/Intro#supported-services).

Prefer to be asked? The optional [CLI](/docs/cli) walks you through the choices: `./laradock setup`, then `./laradock up`. It prints every real command it runs.

### 3. Point Sulu at the containers

In your app's `.env`, set `DATABASE_URL` to the service name as the hostname:

```env
DATABASE_URL="mysql://default:secret@mysql:3306/default?serverVersion=8.4&charset=utf8mb4"
```

The default database, user and password live in `mysql/defaults.env`; override any of them by adding the line to Laradock's `.env` (it always wins).

### 4. Install and run your project

Enter the shell where Composer, Node and the Symfony console live, and run the usual commands:

```bash
docker compose exec workspace bash
composer create-project sulu/skeleton .   # only if you have no Sulu project yet
composer require doctrine
php bin/adminconsole doctrine:database:create
php bin/adminconsole doctrine:migrations:migrate
```

Then open [http://localhost](http://localhost). That is a full Sulu project running on Docker.

## Change the PHP version anytime

This is where a native install hurts and Laradock shines. Set the version in Laradock's `.env` and rebuild:

```env
PHP_VERSION=8.2
```

```bash
docker compose build php-fpm workspace
```

Sulu requires PHP 7.2 or newer and tracks Symfony's supported versions, so an older Sulu project and a brand-new one can run side by side on different PHP versions, each isolated, none of it installed on your machine.

## Frequently Asked Questions

### Do I need to install PHP or Composer to run Sulu with Laradock?

No. Everything lives inside the containers. Composer, Node, npm and git are all in the `workspace` container; you never install PHP on your host.

### Which services should I start for a typical Sulu project?

`nginx mysql workspace` covers most projects. Swap `mysql` for `postgres` if you prefer, and add `elasticsearch` once you rely on Sulu's content search.

### Can I run multiple Sulu projects on different PHP versions?

Yes. Give each its own Laradock with a unique `COMPOSE_PROJECT_NAME` and `DATA_PATH_HOST`, set a different `PHP_VERSION` in each, and they run independently on the same machine.

### Does this work the same on macOS, Windows and Linux?

Yes. Laradock runs anywhere Docker runs. On macOS/Windows, file-sync speed depends on Docker Desktop (VirtioFS helps a lot for `vendor/`-heavy apps); it is a Docker Desktop trait, not specific to Laradock.

### Is this the same Docker setup I would use in production?

The containers are production-style (real NGINX + PHP-FPM), so it is far closer to production than the Symfony CLI server. See [Prepare Laradock for Production](/docs/usage#prepare-laradock-for-production) for the hardening steps.

---

Comparing environments? See the full **[Laradock vs Others](/docs/laradock-alternatives)** breakdown. Ready to start? **[Getting Started](/docs/getting-started)** takes about five minutes.
