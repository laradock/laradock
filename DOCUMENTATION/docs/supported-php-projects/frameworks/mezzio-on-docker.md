---
slug: /mezzio-on-docker
title: Run Mezzio on Docker
description: Run any Mezzio (Laminas) app on Docker in minutes with Laradock. What Docker gives a Mezzio project, why Laradock is the fastest way to get NGINX, PHP and a database running, and the exact commands, with any PHP version, without installing anything on your machine.
keywords:
  - mezzio on docker
  - run mezzio on docker
  - mezzio docker
  - mezzio docker setup
  - dockerize mezzio
  - laminas mezzio docker
  - mezzio nginx docker
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

## What is Mezzio?

[Mezzio](https://docs.mezzio.dev) is a PSR-15 middleware microframework from the [Laminas Project](https://getlaminas.org) (the successor to Zend Framework). It is known for its minimal, middleware-first architecture: you pick your own router, dependency injection container, template renderer and error handler at install time. Mezzio itself has no built-in database layer; a real app pairs it with a web server, PHP, and whichever database library you add (laminas-db or Doctrine are common), typically against MySQL or PostgreSQL.

## Why run Mezzio in Docker?

Docker packages each of those pieces (NGINX, PHP-FPM, MySQL, ...) into isolated containers that run the same on every machine. Instead of installing PHP and a database onto your laptop, where versions collide between projects and "works on my machine" starts, you run disposable containers that mirror production and vanish cleanly when you delete them. One project can run PHP 8.3 while another runs 8.1, on the same computer, with nothing installed globally.

The catch: wiring those containers together yourself (base images, PHP extensions, networking, permissions) is a week of fiddly Docker work. That is exactly what Laradock removes.

## Why Laradock is the best fit for Mezzio

Unlike Laravel, Mezzio has no official Docker tool or first-party runtime of its own, so a ready-made, no-lock-in environment matters even more. Here is why Laradock is the best fit:

- **You are never locked into one ecosystem.** Laradock is framework-agnostic. Run Mezzio today, add a Laravel service, a WordPress site, or a plain PHP script beside it tomorrow, all in the same environment with the same commands.
- **Far more flexibility.** 100+ ready services and any PHP version from 5.6 to 8.5, so a lean Mezzio middleware service and a heavier app each get exactly the runtime they need.
- **Nothing is hidden and you own everything.** No generated files, no magic, no wrapper binary between you and Docker. Every Dockerfile and compose file is right there for you to read and edit.
- **Nothing new to learn.** What you use is plain `docker compose`, knowledge that transfers straight to production. Our [CLI](/docs/cli) is an optional nicety, never a requirement.

Concretely, for Mezzio it gives you a production-style NGINX + PHP-FPM stack, MySQL/PostgreSQL already wired, and a `workspace` container with Composer and git installed.

## Run Mezzio on Docker with Laradock

### 1. Add Laradock to your project

```bash
cd my-mezzio-app
git clone https://github.com/laradock/laradock.git
cd laradock && cp .env.example .env
```

(No Mezzio app yet? Clone Laradock first, then create one from the workspace container in the next steps.)

### 2. Pick the services your app needs

Most Mezzio apps need a web server and a database. Start exactly those (the web server pulls in PHP-FPM automatically):

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

Prefer PostgreSQL instead? Swap the name: `./laradock start nginx postgres workspace` (or `docker compose up -d nginx postgres workspace`). The full catalog is [here](/docs/Intro#supported-services).

Prefer to be asked? The optional [CLI](/docs/cli) walks you through the choices: `./laradock setup`, then `./laradock up`. It prints every real command it runs.

### 3. Point Mezzio at the containers

Mezzio does not use a `.env` file by default; environment-specific settings go in `config/autoload/local.php` (already gitignored by the skeleton). If you added `laminas-db`, that file looks like:

```php
return [
    'db' => [
        'driver'   => 'Pdo_Mysql',
        'hostname' => 'mysql',
        'database' => 'default',
        'username' => 'default',
        'password' => 'secret',
    ],
];
```

The default database, user and password live in `mysql/defaults.env`; override any of them by adding the line to Laradock's `.env` (it always wins).

### 4. Install and run your app

Enter the `workspace` container, where Composer and git live:

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

Then, inside the container:

```bash
composer create-project mezzio/mezzio-skeleton .   # only if you have no Mezzio files yet
```

The installer asks a few interactive questions (router, container, template renderer, error handler); the defaults work fine if you are not sure. Then open [http://localhost](http://localhost). That is a full Mezzio app running on Docker.

## Change the PHP version anytime

This is where a native install hurts and Laradock shines. Set the version in Laradock's `.env` and rebuild:

```env
PHP_VERSION=8.2
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

Mezzio requires PHP 8.1 or newer, so pick a version at or above that; each project can pin its own, isolated, none of it installed on your machine.

## Frequently Asked Questions

### Do I need to install PHP or Composer to run Mezzio with Laradock?

No. Everything lives inside the containers. Composer and git are in the `workspace` container; you never install PHP on your host.

### Which services should I start for a typical Mezzio app?

`nginx mysql workspace` covers most apps. Swap `mysql` for `postgres` if you prefer.

### Can I run multiple Mezzio apps on different PHP versions?

Yes. Give each its own Laradock with a unique `COMPOSE_PROJECT_NAME` and `DATA_PATH_HOST`, set a different `PHP_VERSION` in each, and they run independently on the same machine.

### Does this work the same on macOS, Windows and Linux?

Yes. Laradock runs anywhere Docker runs. On macOS/Windows, file-sync speed depends on Docker Desktop (VirtioFS helps a lot); it is a Docker Desktop trait, not specific to Laradock.

### Is this the same Docker setup I would use in production?

The containers are production-style (real NGINX + PHP-FPM), so it is far closer to production than a native install. See [Prepare Laradock for Production](/docs/production#prepare-laradock-for-production) for the hardening steps.

---

Comparing environments? See the full **[Laradock vs Others](/docs/laradock-alternatives)** breakdown. Ready to start? **[Getting Started](/docs/getting-started)** takes about five minutes.
