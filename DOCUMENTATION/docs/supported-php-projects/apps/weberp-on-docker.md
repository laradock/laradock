---
slug: /weberp-on-docker
title: Run webERP on Docker
description: Run webERP on Docker in minutes with Laradock. What Docker gives a webERP install, why Laradock is the fastest way to get NGINX, PHP and MySQL running, and the exact commands, with the right PHP version, without installing anything on your machine.
keywords:
  - weberp on docker
  - run weberp on docker
  - weberp docker
  - weberp docker setup
  - dockerize weberp
  - weberp docker environment
  - weberp nginx mysql docker
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

## What is webERP?

[webERP](https://weberp.org) is an open-source, browser-based accounting and business administration ERP written in plain PHP: general ledger, inventory, sales and purchase orders, and more, all served as regular web pages with no separate desktop client. The project started life on SourceForge as a Subversion repository and has since moved to GitHub, where a small maintainer team still ships it; the current stable line is 5.0, released in January 2026. It is a PHP application backed by a MySQL (or MariaDB) database, served through a web server, nothing more exotic than that.

## Why run webERP in Docker?

Docker packages the pieces webERP needs (a web server, PHP-FPM, MySQL) into isolated containers that run the same on every machine. Instead of installing PHP and MySQL onto your laptop, where versions collide between projects and "works on my machine" starts, you run disposable containers that mirror production and vanish cleanly when you delete them. This matters more than usual for webERP: current 5.0 requires PHP 8.1+, but plenty of real installs still run the older 4.x line against PHP 7.x, and you probably don't want either version, let alone both, installed natively on your host.

The catch: wiring those containers together yourself (base images, PHP extensions, networking, permissions) is a week of fiddly Docker work. That is exactly what Laradock removes.

## Why Laradock is the best fit for webERP

webERP has no official Docker image or first-party container tooling of its own (only a handful of unofficial, infrequently updated images exist on Docker Hub), so a ready-made, no-lock-in environment matters even more. Here is why Laradock is the best fit:

- **You are never locked into one ecosystem.** Laradock is framework-agnostic. Run webERP today, add a Laravel or WordPress site beside it tomorrow, all in the same environment with the same commands.
- **Far more flexibility.** 100+ ready services and any PHP version from 5.6 to 8.5, so you can run webERP's current PHP 8.1+ requirement or an older 4.x install pinned to PHP 7.x, side by side if needed.
- **Nothing is hidden and you own everything.** No generated files, no magic, no wrapper binary between you and Docker. Every Dockerfile and compose file is right there for you to read and edit.
- **Nothing new to learn.** What you use is plain `docker compose`, knowledge that transfers straight to production. Our [CLI](/docs/cli) is an optional nicety, never a requirement.

Concretely, for webERP it gives you a production-style NGINX + PHP-FPM stack, MySQL/MariaDB already wired, and a `workspace` container with Composer and git installed, plus any PHP version behind a single line of config.

## Run webERP on Docker with Laradock

### 1. Add Laradock to your project

```bash
cd my-weberp-install
git clone https://github.com/laradock/laradock.git
cd laradock && cp .env.example .env
```

(No webERP files yet? Clone Laradock first, then download webERP from the [official GitHub repository](https://github.com/timschofield/webERP) into your project root in the next steps.)

### 2. Pick the services webERP needs

webERP needs a web server and a database; the web server pulls in PHP-FPM automatically:

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

Prefer MariaDB over MySQL? Swap the name: `./laradock start nginx mariadb workspace`. The full catalog is [here](/docs/Intro#supported-services).

Prefer to be asked? The optional [CLI](/docs/cli) walks you through the choices: `./laradock setup`, then `./laradock up`. It prints every real command it runs.

### 3. Point webERP at the containers

webERP does not use a hand-edited `.env`; it writes its own `config.php` in the project root through its web installer, using the service name as the database hostname:

```
Host: mysql
```

The default database, user and password live in `mysql/defaults.env`; override any of them by adding the line to Laradock's `.env` (it always wins).

### 4. Install and run

Open [http://localhost](http://localhost) and the webERP installer takes over: it checks file and folder permissions, walks you through database connection details (host `mysql`, the credentials above), creates the database, and writes `config.php` for you. webERP creates one database per company, so plan the company name accordingly.

If you need a shell for anything else (git, Composer), it's in the `workspace` container:

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

Once the installer finishes, log back in through the browser. That is a full webERP install running on Docker.

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

Current webERP 5.0 requires PHP 8.1 or newer; older 4.x installs generally expect PHP 7.x. Laradock covers both ends (PHP 5.6 through 8.5), so a legacy 4.x instance and a fresh 5.0 install can run side by side, each isolated, none of it installed on your machine.

## Frequently Asked Questions

### Do I need to install PHP or MySQL to run webERP with Laradock?

No. Everything lives inside the containers. PHP, its extensions, and MySQL/MariaDB are all provided; you never install them on your host.

### Which services should I start for a typical webERP install?

`nginx mysql workspace` covers it: web server, database, and a shell. Swap `mysql` for `mariadb` if you prefer.

### Is webERP still actively maintained?

Yes, though at a slower pace than mainstream frameworks. Development moved from SourceForge/Subversion to GitHub, and a small maintainer team shipped a major modernization (v5.0, requiring PHP 8.1+ and dropping the old `mysql` extension) in January 2026. Expect a small-team release cadence, not a large-project one, but it is not abandoned.

### Can I run multiple webERP instances, or different versions, at once?

Yes. Give each its own Laradock with a unique `COMPOSE_PROJECT_NAME` and `DATA_PATH_HOST`, set a different `PHP_VERSION` in each, and they run independently on the same machine.

### Is this the same Docker setup I would use in production?

The containers are production-style (real NGINX + PHP-FPM), so it is far closer to production than a native install. See [Prepare Laradock for Production](/docs/production#prepare-laradock-for-production) for the hardening steps.

---

Comparing environments? See the full **[Laradock vs Others](/docs/laradock-alternatives)** breakdown. Ready to start? **[Getting Started](/docs/getting-started)** takes about five minutes.
