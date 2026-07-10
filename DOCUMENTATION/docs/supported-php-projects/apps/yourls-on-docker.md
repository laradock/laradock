---
slug: /yourls-on-docker
title: Run YOURLS on Docker
description: Run YOURLS, the self-hosted URL shortener, on Docker in minutes with Laradock. What Docker gives a YOURLS install, why Laradock is the fastest way to get a web server, PHP and MySQL running, and the exact commands, with any PHP version, without installing anything on your machine.
keywords:
  - yourls on docker
  - run yourls on docker
  - yourls docker
  - yourls docker setup
  - dockerize yourls
  - yourls docker environment
  - yourls nginx mysql docker
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

## What is YOURLS?

[YOURLS](https://yourls.org) (Your Own URL Shortener) is a small, self-hosted set of PHP scripts that turns any domain into a private link shortener, complete with click stats, a plugin system and a simple API. It is deliberately minimal: no framework, no build step, just PHP files backed by a MySQL (or MariaDB) database and a web server in front of them.

## Why run YOURLS in Docker?

Docker packages the web server, PHP and MySQL into isolated containers that run the same on every machine. Instead of installing PHP and MySQL onto your laptop, where versions collide between projects and "works on my machine" starts, you run disposable containers that mirror production and vanish cleanly when you delete them. A tiny shortener like YOURLS can sit on an old PHP version next to a modern app on a completely different one, on the same computer, with nothing installed globally.

The catch: wiring those containers together yourself (base images, PHP extensions, networking, permissions) is a week of fiddly Docker work for what is otherwise a five-minute app. That is exactly what Laradock removes.

## Why Laradock is the best fit for YOURLS

YOURLS does not ship its own Docker Compose stack. A generic YOURLS image exists as a Docker Official Image on Docker Hub, but it is a single PHP+Apache container; it does not give you the database, Redis, or a shell with the tooling to manage it alongside anything else you run. Here is why Laradock is the better fit:

- **You are never locked into one ecosystem.** Laradock is framework-agnostic. Run YOURLS today, add a Laravel API or a WordPress blog beside it tomorrow, all in the same environment with the same commands.
- **Far more flexibility.** 100+ ready services and any PHP version from 5.6 to 8.5, so a legacy YOURLS install and a fresh one each get exactly the runtime they need.
- **Nothing is hidden and you own everything.** No generated files, no magic, no wrapper binary between you and Docker. Every Dockerfile and compose file is right there for you to read and edit.
- **Nothing new to learn.** What you use is plain `docker compose`, knowledge that transfers straight to production. Our [CLI](/docs/cli) is an optional nicety, never a requirement.

Concretely, for YOURLS it gives you a production-style NGINX (or Apache) + PHP-FPM stack, MySQL/MariaDB already wired, and a `workspace` container with git and a shell for editing config files, behind any PHP version you choose.

## Run YOURLS on Docker with Laradock

### 1. Add Laradock to your project

```bash
cd my-yourls-shortener
git clone https://github.com/laradock/laradock.git
cd laradock && cp .env.example .env
```

(No YOURLS files yet? Clone Laradock first, then download YOURLS into your project directory from the [YOURLS releases page](https://github.com/YOURLS/YOURLS/releases) or via `git clone`.)

### 2. Pick the services your shortener needs

YOURLS needs a web server, PHP, and a database. Start exactly those (the web server pulls in PHP-FPM automatically):

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

Prefer Apache or MariaDB instead? Swap the names: `./laradock start apache2 mariadb workspace`. The full catalog is [here](/docs/Intro#supported-services).

Prefer to be asked? The optional [CLI](/docs/cli) walks you through the choices: `./laradock setup`, then `./laradock up`. It prints every real command it runs.

### 3. Point YOURLS at the containers

Copy the sample config and edit the database settings to use the container hostnames:

```bash
cp user/config-sample.php user/config.php
```

```php
define( 'YOURLS_DB_USER', 'default' );
define( 'YOURLS_DB_PASS', 'secret' );
define( 'YOURLS_DB_NAME', 'default' );
define( 'YOURLS_DB_HOST', 'mysql' );
```

The default database, user and password live in `mysql/defaults.env`; override any of them by adding the line to Laradock's `.env` (it always wins).

### 4. Install and run your shortener

Open your site's `/admin/` path in the browser; YOURLS detects the missing install and walks you through the setup wizard, which creates the database tables for you. No CLI installer is required.

Then open [http://localhost](http://localhost). That is a full YOURLS install running on Docker.

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

Current YOURLS releases require PHP 8.1 or newer, but anything from 5.6 to 8.5 is available, so an older YOURLS fork pinned to a legacy PHP version and a current install can run side by side, each isolated, none of it installed on your machine.

## Frequently Asked Questions

### Do I need to install PHP or MySQL to run YOURLS with Laradock?

No. Everything lives inside the containers. PHP, the web server and MySQL are all provided; you never install them on your host.

### Which services should I start for a typical YOURLS install?

`nginx mysql workspace` covers it: a web server, a database, and a shell to edit `user/config.php`. Swap `mysql` for `mariadb` if you prefer.

### Can I run multiple YOURLS instances on different PHP versions?

Yes. Give each its own Laradock with a unique `COMPOSE_PROJECT_NAME` and `DATA_PATH_HOST`, set a different `PHP_VERSION` in each, and they run independently on the same machine.

### Does this work the same on macOS, Windows and Linux?

Yes. Laradock runs anywhere Docker runs. On macOS/Windows, file-sync speed depends on Docker Desktop; it is a Docker Desktop trait, not specific to Laradock.

### Is this the same Docker setup I would use in production?

The containers are production-style (real NGINX/Apache + PHP-FPM), so it is far closer to production than a bare native install. See [Prepare Laradock for Production](/docs/production#prepare-laradock-for-production) for the hardening steps.

---

Comparing environments? See the full **[Laradock vs Others](/docs/laradock-alternatives)** breakdown. Ready to start? **[Getting Started](/docs/getting-started)** takes about five minutes.
