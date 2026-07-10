---
slug: /e107-on-docker
title: Run e107 on Docker
description: Run e107 on Docker in minutes with Laradock. What Docker gives an e107 site, why Laradock is the fastest way to get NGINX, PHP and MySQL running, and the exact commands, with any PHP version, without installing anything on your machine.
keywords:
  - e107 on docker
  - run e107 on docker
  - e107 docker
  - e107 docker setup
  - dockerize e107
  - e107 docker environment
  - e107 nginx mysql docker
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

## What is e107?

[e107](https://e107.org) is a community-driven, open-source CMS written in PHP, built on Bootstrap for its front end. It has been around since the early 2000s and is still actively maintained, with a small but dedicated community around forums, news sites and small business sites. It is a plain PHP application backed by a MySQL (or MariaDB) database, served through a web server, with no framework layer or Composer step in front of it.

## Why run e107 in Docker?

Docker packages each of those pieces (NGINX, PHP-FPM, MySQL) into isolated containers that run the same on every machine. Instead of installing PHP and MySQL onto your laptop, where versions collide between sites and "works on my machine" starts, you run disposable containers that mirror production and vanish cleanly when you delete them. One site can run a current PHP version while an older e107 install stays on 7.4, on the same computer, with nothing installed globally.

The catch: wiring those containers together yourself (base images, PHP extensions, networking, permissions) is a week of fiddly Docker work. That is exactly what Laradock removes.

## Why Laradock is the best fit for e107

e107 has no official Docker image or first-party runtime of its own, so a ready-made, no-lock-in environment matters even more. Here is why Laradock is the best fit:

- **You are never locked into one ecosystem.** Laradock is framework-agnostic. Run e107 today, add a Laravel API, a WordPress site, or a plain PHP script beside it tomorrow, all in the same environment with the same commands.
- **Far more flexibility.** 100+ ready services and any PHP version from 5.6 to 8.5, so an older e107 install and a fresh one each get exactly the runtime they need.
- **Nothing is hidden and you own everything.** No generated files, no magic, no wrapper binary between you and Docker. Every Dockerfile and compose file is right there for you to read and edit.
- **Nothing new to learn.** What you use is plain `docker compose`, knowledge that transfers straight to production. Our [CLI](/docs/cli) is an optional nicety, never a requirement.

Concretely, for e107 it gives you a production-style NGINX + PHP-FPM stack, MySQL/MariaDB already wired, and a `workspace` container with git and Composer installed for any addons that need it.

## Run e107 on Docker with Laradock

### 1. Add Laradock to your project

```bash
cd my-e107-site
git clone https://github.com/laradock/laradock.git
cd laradock && cp .env.example .env
```

(No e107 files yet? Clone Laradock first, then download e107 from the workspace container in the next steps.)

### 2. Pick the services your site needs

e107 needs a web server and a database. The web server pulls in PHP-FPM automatically:

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

### 3. Point e107 at the containers

The e107 installer writes its database connection into `e107_config.php` for you, but the values you type into the installer's browser form should use the service names as hostnames:

```
MySQL host: mysql
Database name: default
Database user: default
Database password: secret
```

The default database, user and password live in `mysql/defaults.env`; override any of them by adding the line to Laradock's `.env` (it always wins).

### 4. Install and run your site

Download e107 into the workspace container, then finish the setup in your browser:

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

```bash
git clone https://github.com/e107inc/e107.git .   # only if you have no e107 files yet
```

Open [http://localhost](http://localhost), and the e107 installation wizard walks you through the database connection and admin account. That is a full e107 site running on Docker.

## Change the PHP version anytime

This is where a native install hurts and Laradock shines. Set the version in Laradock's `.env` and rebuild:

```env
PHP_VERSION=7.4
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

e107 v2 targets PHP 7.1+ (with PHP 8.x compatibility improving in recent releases), so pinning an older `PHP_VERSION` for a legacy install and running PHP 8.x for a fresh one, side by side on the same machine, is exactly what Laradock is for.

## Frequently Asked Questions

### Do I need to install PHP or MySQL to run e107 with Laradock?

No. Everything lives inside the containers. PHP, the web server and MySQL are all provided; you never install them on your host.

### Which services should I start for a typical e107 site?

`nginx mysql workspace` covers most sites: web server, database, and a shell. Swap `mysql` for `mariadb` if you prefer.

### Can I run multiple e107 sites on different PHP versions?

Yes. Give each its own Laradock with a unique `COMPOSE_PROJECT_NAME` and `DATA_PATH_HOST`, set a different `PHP_VERSION` in each, and they run independently on the same machine.

### Does this work the same on macOS, Windows and Linux?

Yes. Laradock runs anywhere Docker runs. On macOS/Windows, file-sync speed depends on Docker Desktop (VirtioFS helps a lot); it is a Docker Desktop trait, not specific to Laradock.

### Is this the same Docker setup I would use in production?

The containers are production-style (real NGINX + PHP-FPM), so it is far closer to production than a native install. See [Prepare Laradock for Production](/docs/production#prepare-laradock-for-production) for the hardening steps.

---

Comparing environments? See the full **[Laradock vs Others](/docs/laradock-alternatives)** breakdown. Ready to start? **[Getting Started](/docs/getting-started)** takes about five minutes.
