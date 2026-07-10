---
slug: /pligg-on-docker
title: Run Pligg on Docker
description: Run Pligg on Docker in minutes with Laradock. What Docker gives an old, sensitive-to-PHP-version project like Pligg, why Laradock is the fastest way to get NGINX, PHP and MySQL running, and the exact commands, without installing anything on your machine.
keywords:
  - pligg on docker
  - run pligg on docker
  - pligg cms docker
  - pligg docker setup
  - dockerize pligg
  - pligg docker environment
  - pligg nginx mysql docker
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

## What is Pligg?

[Pligg](https://sourceforge.net/projects/pligg/) is an older, PHP-based CMS built for social bookmarking and Digg-style "submit and vote" content sites. It is a plain PHP application backed by a MySQL database, served through a web server, with no framework, no Composer, and no build step. It has seen no meaningful upstream activity in years; the project is effectively dormant, kept alive mostly through community forks on GitHub rather than an active core team.

## Why run Pligg in Docker?

Docker packages each of those pieces (NGINX, PHP-FPM, MySQL) into isolated containers that run the same on every machine. This matters more for Pligg than for a modern project: its codebase predates PHP 7 and leans on old-style APIs, so it genuinely needs an older PHP runtime that you almost certainly do not want installed globally on your laptop next to your other projects. Disposable containers let that old PHP version exist only for this one site, and vanish cleanly when you delete them.

The catch: wiring those containers together yourself (base images, PHP extensions, networking, permissions) is a week of fiddly Docker work. That is exactly what Laradock removes.

## Why Laradock is the best fit for Pligg

Pligg has no official Docker image and, given its dormant state, no first-party tooling of any kind. Here is why Laradock is the best fit:

- **You are never locked into one ecosystem.** Laradock is framework-agnostic. Run Pligg today, add a Laravel API, a WordPress site, or a plain PHP script beside it tomorrow, all in the same environment with the same commands.
- **Far more flexibility.** 100+ ready services and any PHP version from 5.6 to 8.5, which matters specifically here: Pligg needs an old PHP version that a modern project would never install.
- **Nothing is hidden and you own everything.** No generated files, no magic, no wrapper binary between you and Docker. Every Dockerfile and compose file is right there for you to read and edit.
- **Nothing new to learn.** What you use is plain `docker compose`, knowledge that transfers straight to production. Our [CLI](/docs/cli) is an optional nicety, never a requirement.

Concretely, for Pligg it gives you an NGINX + PHP-FPM stack pinned to an old PHP version, MySQL already wired, and a `workspace` container with git installed to pull the code down.

## Run Pligg on Docker with Laradock

### 1. Add Laradock to your project

```bash
cd my-pligg-site
git clone https://github.com/laradock/laradock.git
cd laradock && cp .env.example .env
```

(No Pligg files yet? Clone Laradock first, then download Pligg from the workspace container in the next steps.)

### 2. Pick the services your site needs

Pligg needs a web server and a database. The web server pulls in PHP-FPM automatically:

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

The full catalog is [here](/docs/Intro#supported-services).

Prefer to be asked? The optional [CLI](/docs/cli) walks you through the choices: `./laradock setup`, then `./laradock start`. It prints every real command it runs.

### 3. Point Pligg at the containers

Pligg's browser installer writes the database connection into its own config file for you. Fill the installer form with the container's service name as the host:

```
MySQL host: mysql
Database name: default
Database user: default
Database password: secret
```

The default database, user and password live in `mysql/defaults.env`; override any of them by adding the line to Laradock's `.env` (it always wins).

### 4. Install and run your site

Pull a maintained Pligg fork into the workspace container, then finish setup in your browser (check the fork's own instructions, since the original project is no longer actively developed):

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

Once inside the container:

```bash
git clone https://github.com/logbie/pligg.git .   # or another maintained fork
```

Open [http://localhost](http://localhost) and run the project's installer in your browser. That is a full Pligg site running on Docker.

## Change the PHP version anytime

This is where a native install hurts and Laradock shines, and Pligg is the clearest case for it: its codebase relies on `mysql_*`-era APIs that were removed in PHP 7, so it generally needs an old PHP version to run without patching. Set that version in Laradock's `.env` and rebuild:

```env
PHP_VERSION=5.6
```

Then rebuild with `./laradock rebuild php-fpm workspace` (or `docker compose build php-fpm workspace`).

Nothing forces that old PHP version onto your host or your other projects; it exists only inside this Laradock instance.

## Frequently Asked Questions

### Do I need to install an old PHP version on my machine to run Pligg?

No. Set `PHP_VERSION` to whatever Pligg (or the fork you use) needs, and it stays inside the container. Your host and every other project are unaffected.

### Which services should I start for a typical Pligg site?

`nginx mysql workspace` covers it: web server, database, and a shell to pull the code down.

### Is Pligg still actively maintained?

Not in any meaningful way upstream; the last significant activity is old, and what exists today is mostly community forks. If you are picking a CMS for a new project, weigh that before committing to it; Laradock only handles the runtime, not the project's maintenance status.

### Can I run Pligg alongside modern PHP projects on the same machine?

Yes. Give each its own Laradock with a unique `COMPOSE_PROJECT_NAME` and `DATA_PATH_HOST`, set the old `PHP_VERSION` only in Pligg's instance, and they run independently.

### Does this work the same on macOS, Windows and Linux?

Yes. Laradock runs anywhere Docker runs. On macOS/Windows, file-sync speed depends on Docker Desktop; it is a Docker Desktop trait, not specific to Laradock.

---

Comparing environments? See the full **[Laradock vs Others](/docs/laradock-alternatives)** breakdown. Ready to start? **[Getting Started](/docs/getting-started)** takes about five minutes.
