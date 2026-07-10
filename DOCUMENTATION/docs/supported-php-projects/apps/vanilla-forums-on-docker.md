---
slug: /vanilla-forums-on-docker
title: Run Vanilla Forums on Docker
description: Run Vanilla Forums on Docker in minutes with Laradock. What Docker gives a Vanilla Forums site, why Laradock is the fastest way to get NGINX, PHP and MySQL running, and the exact commands, with any PHP version, without installing anything on your machine.
keywords:
  - vanilla forums on docker
  - run vanilla forums on docker
  - vanilla forums docker
  - vanilla forums docker setup
  - dockerize vanilla forums
  - vanilla forums docker environment
  - vanilla forums nginx mysql docker
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

## What is Vanilla Forums?

[Vanilla Forums](https://open.vanillaforums.com) is established, widely used open-source discussion forum software: threaded discussions, categories, badges and a plugin/theme system, built on PHP's own Garden framework rather than Laravel or Symfony. A real Vanilla install needs a web server, a PHP runtime, and a MySQL or MariaDB database.

## Why run Vanilla Forums in Docker?

Docker packages the web server, PHP and MySQL into isolated containers that run the same on every machine. Instead of installing PHP and MySQL onto your laptop, where versions collide between projects and "works on my machine" starts, you run disposable containers that mirror production and vanish cleanly when you delete them. One project can run PHP 8.3 while an older Vanilla install runs on 7.4, on the same computer, with nothing installed globally.

The catch: wiring those containers together yourself (base images, PHP extensions, networking, permissions) is a week of fiddly Docker work. That is exactly what Laradock removes.

## Why Laradock is the best fit for Vanilla Forums

Vanilla Forums has no official production Docker image or first-party runtime of its own; the project's `vanilla-docker` repository is a development environment for contributors, not a supported way to deploy a real forum. Here is why Laradock is the best fit:

- **You are never locked into one ecosystem.** Laradock is framework-agnostic. Run your Vanilla forum today, add a Laravel API or a WordPress blog beside it tomorrow, all in the same environment with the same commands.
- **Far more flexibility.** 100+ ready services and any PHP version from 5.6 to 8.5, so a legacy Vanilla install and a fresh one each get exactly the runtime they need.
- **Nothing is hidden and you own everything.** No generated files, no magic, no wrapper binary between you and Docker. Every Dockerfile and compose file is right there for you to read and edit.
- **Nothing new to learn.** What you use is plain `docker compose`, knowledge that transfers straight to production. Our [CLI](/docs/cli) is an optional nicety, never a requirement.

Concretely, for Vanilla Forums it gives you a production-style NGINX + PHP-FPM stack, MySQL/MariaDB already wired, and a `workspace` container with git and a shell, behind any PHP version you choose.

## Run Vanilla Forums on Docker with Laradock

### 1. Add Laradock to your project

```bash
cd my-vanilla-forum
git clone https://github.com/laradock/laradock.git
cd laradock && cp .env.example .env
```

(No Vanilla files yet? Clone Laradock first, then download Vanilla Forums from [its GitHub repo](https://github.com/vanilla/vanilla) into your project directory.)

### 2. Pick the services your forum needs

Vanilla needs a web server, PHP and a database. Start exactly those (the web server pulls in PHP-FPM automatically):

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

Prefer MariaDB over MySQL? Swap the name: `./laradock start nginx mariadb workspace` (or `docker compose up -d nginx mariadb workspace`). The full catalog is [here](/docs/Intro#supported-services).

Prefer to be asked? The optional [CLI](/docs/cli) walks you through the choices: `./laradock setup`, then `./laradock up`. It prints every real command it runs.

### 3. Point Vanilla at the containers

Vanilla's browser installer writes its own `conf/config.php`, so there is nothing to hand-edit beforehand; you just need the database credentials ready. The default database, user and password live in Laradock's `mysql/defaults.env`; override any of them by adding the line to Laradock's `.env` (it always wins).

### 4. Install and run your forum

Open your site in the browser; Vanilla detects the missing config and starts its setup wizard. Enter the database host as the container name:

```
Database Host: mysql
Database Name: default
Database User: default
Database Password: secret
```

Follow the wizard to create the forum and the first admin account. Then open [http://localhost](http://localhost). That is a full Vanilla Forums site running on Docker.

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

Vanilla's current releases target PHP 7.2 and newer; anything from 5.6 to 8.5 is available in Laradock, so an older Vanilla install pinned to a legacy PHP version and a current one can run side by side, each isolated, none of it installed on your machine.

## Frequently Asked Questions

### Do I need to install PHP or MySQL to run Vanilla Forums with Laradock?

No. Everything lives inside the containers. PHP, the web server and MySQL are all provided; you never install them on your host.

### Which services should I start for a typical Vanilla install?

`nginx mysql workspace` covers most sites: web server, database, and a shell. Swap `mysql` for `mariadb` if you prefer.

### Can I run multiple Vanilla forums on different PHP versions?

Yes. Give each its own Laradock with a unique `COMPOSE_PROJECT_NAME` and `DATA_PATH_HOST`, set a different `PHP_VERSION` in each, and they run independently on the same machine.

### Does this work the same on macOS, Windows and Linux?

Yes. Laradock runs anywhere Docker runs. On macOS/Windows, file-sync speed depends on Docker Desktop; it is a Docker Desktop trait, not specific to Laradock.

### Is this the same Docker setup I would use in production?

The containers are production-style (real NGINX + PHP-FPM), so it is far closer to production than a native install. See [Prepare Laradock for Production](/docs/production#prepare-laradock-for-production) for the hardening steps.

---

Comparing environments? See the full **[Laradock vs Others](/docs/laradock-alternatives)** breakdown. Ready to start? **[Getting Started](/docs/getting-started)** takes about five minutes.
