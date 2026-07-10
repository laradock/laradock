---
slug: /b2evolution-on-docker
title: Run b2evolution on Docker
description: Run b2evolution on Docker in minutes with Laradock. What Docker gives a b2evolution site, why Laradock is the fastest way to get NGINX, PHP and MySQL running, and the exact commands, without installing anything on your machine.
keywords:
  - b2evolution on docker
  - run b2evolution on docker
  - b2evolution docker
  - b2evolution docker setup
  - dockerize b2evolution
  - b2evolution docker environment
  - b2evolution nginx mysql docker
---

## What is b2evolution?

[b2evolution](https://b2evolution.net) is an older, feature-heavy CMS for running multiple blogs, forums and a small social network from one install. It predates most of the modern PHP CMS landscape and its release pace has slowed considerably in recent years (the last stable tag is from 2022), so it is best treated as a legacy platform: fine for maintaining an existing site, worth evaluating carefully before starting something new on it. A b2evolution site is a PHP application backed by a MySQL database, served through a web server.

## Why run b2evolution in Docker?

Docker packages each of those pieces (NGINX, PHP-FPM, MySQL) into isolated containers that run the same on every machine. This matters even more for an older codebase like b2evolution: instead of hunting down a legacy PHP version on your host and hoping it does not break your other projects, you run it in a disposable container pinned to exactly the PHP release it needs, alongside modern projects on modern PHP, with nothing installed globally.

The catch: wiring those containers together yourself (base images, PHP extensions, networking, permissions) is a week of fiddly Docker work. That is exactly what Laradock removes.

## Why Laradock is the best fit for b2evolution

b2evolution has no official Docker image of its own, so a ready-made, no-lock-in environment matters even more, especially for pinning an old PHP version safely. Here is why Laradock is the best fit:

- **You are never locked into one ecosystem.** Laradock is framework-agnostic. Keep a legacy b2evolution site running while a Laravel API, a WordPress site, or anything else runs beside it in the same environment with the same commands.
- **Far more flexibility.** 100+ ready services and any PHP version from 5.6 to 8.5, so an old b2evolution install gets the exact older PHP it needs without touching your host.
- **Nothing is hidden and you own everything.** No generated files, no magic, no wrapper binary between you and Docker. Every Dockerfile and compose file is right there for you to read and edit.
- **Nothing new to learn.** What you use is plain `docker compose`, knowledge that transfers straight to production. Our [CLI](/docs/cli) is an optional nicety, never a requirement.

Concretely, for b2evolution it gives you a production-style NGINX + PHP-FPM stack, MySQL already wired, a `workspace` container with git installed, and older PHP versions kept alive behind a single line of config.

## Run b2evolution on Docker with Laradock

### 1. Add Laradock to your project

```bash
cd my-b2evolution-site
git clone https://github.com/laradock/laradock.git
cd laradock && cp .env.example .env
```

(No b2evolution files yet? Clone Laradock first, then download b2evolution from the [releases page](https://github.com/b2evolution/b2evolution/releases) into your project root.)

### 2. Pick the services your site needs

b2evolution needs a web server and a database. Start exactly those (the web server pulls in PHP-FPM automatically):

```bash
docker compose up -d nginx mysql workspace
```

The full catalog of every other available service is [here](/docs/Intro#supported-services).

Prefer to be asked? The optional [CLI](/docs/cli) walks you through the choices: `./laradock setup`, then `./laradock up`. It prints every real command it runs.

### 3. Point b2evolution at the containers

The install wizard writes your database connection into `conf/_basic_config.php`. Use the service name as the host, and the default database, user and password from `mysql/defaults.env`:

```
DB Host: mysql
DB Name: default
DB User: default
DB Pass: secret
```

Override any of them by adding the line to Laradock's `.env` (it always wins).

### 4. Install and run your site

Open the installer in your browser and follow its steps to create the database tables and the first admin account:

```
http://localhost/install/
```

Then open [http://localhost](http://localhost). That is a full b2evolution site running on Docker.

## Change the PHP version anytime

This is where a native install hurts and Laradock shines, particularly for an older codebase like this one. Set the version in Laradock's `.env` and rebuild:

```env
PHP_VERSION=7.4
```

```bash
docker compose build php-fpm workspace
```

b2evolution's official support tops out at PHP 7.4; newer PHP versions are not officially supported by the project. Laradock lets you pin exactly that version for this site while every other project on the same machine runs whatever PHP it needs, none of it installed on your host.

## Frequently Asked Questions

### Do I need to install PHP or MySQL to run b2evolution with Laradock?

No. Everything lives inside the containers. PHP and MySQL are both provided; you never install them on your host, which is especially useful for a platform that needs an older PHP version.

### Which services should I start for a typical b2evolution site?

`nginx mysql workspace` covers a standard install: web server, database, and a shell.

### Can I run b2evolution alongside modern projects on newer PHP?

Yes. Give each its own Laradock with a unique `COMPOSE_PROJECT_NAME` and `DATA_PATH_HOST`, pin b2evolution to `PHP_VERSION=7.4`, and run everything else on a current PHP version, all independently on the same machine.

### Does this work the same on macOS, Windows and Linux?

Yes. Laradock runs anywhere Docker runs. On macOS/Windows, file-sync speed depends on Docker Desktop (VirtioFS helps a lot); it is a Docker Desktop trait, not specific to Laradock.

### Is this the same Docker setup I would use in production?

The containers are production-style (real NGINX + PHP-FPM), so it is far closer to production than a native install. See [Prepare Laradock for Production](/docs/production#prepare-laradock-for-production) for the hardening steps.

---

Comparing environments? See the full **[Laradock vs Others](/docs/laradock-alternatives)** breakdown. Ready to start? **[Getting Started](/docs/getting-started)** takes about five minutes.
