---
slug: /grav-on-docker
title: Run Grav on Docker
description: Run Grav on Docker in minutes with Laradock. What Docker gives a Grav site, why Laradock is the fastest way to get NGINX and PHP running, and the exact commands, with any PHP version, without installing anything on your machine.
keywords:
  - grav on docker
  - run grav on docker
  - grav docker
  - grav docker setup
  - dockerize grav
  - grav docker environment
  - grav flat-file cms docker
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

## What is Grav?

[Grav](https://getgrav.org) is a flat-file CMS built on PHP, Symfony components and Twig, known for being fast to set up and run: content lives as Markdown files with YAML frontmatter, and there is no database at all. A Grav site needs nothing but a web server and a PHP runtime; that is the entire infrastructure requirement.

## Why run Grav in Docker?

Docker packages the pieces a PHP app needs (NGINX, PHP-FPM) into isolated containers that run the same on every machine. Instead of installing PHP onto your laptop, where versions collide between sites and "works on my machine" starts, you run disposable containers that mirror production and vanish cleanly when you delete them. One site can run PHP 8.3 while another runs 8.0, on the same computer, with nothing installed globally.

The catch: wiring those containers together yourself (base images, PHP extensions, networking, permissions) is a week of fiddly Docker work. That is exactly what Laradock removes.

## Why Laradock is the best fit for Grav

Grav ships its own official Docker image on Docker Hub, so, unlike most PHP projects, it does not strictly need Laradock. It is still the best fit, and here is why:

- **You are never locked into one ecosystem.** Laradock is framework-agnostic. The day you add a Laravel API, a database-backed WordPress site, or a plain PHP script beside your Grav site, it runs in the same environment with the same commands. A single-purpose image cannot do that.
- **Far more flexibility.** 100+ ready services and any PHP version from 5.6 to 8.5, versus the narrower set of tags the official image maintains, ready the moment a project next to Grav needs a database or cache.
- **Nothing is hidden and you own everything.** No generated files, no magic, no wrapper binary between you and Docker. Every Dockerfile and compose file is right there for you to read and edit.
- **Nothing new to learn.** What you use is plain `docker compose`, knowledge that transfers straight to production and to every other project. Our [CLI](/docs/cli) is an optional nicety, never a requirement.

For Grav specifically, Laradock wires a production-style NGINX + PHP-FPM stack and a `workspace` container with Composer and git already installed, and every other service (MySQL, Redis, search, ...) sits ready if a neighboring project needs it.

## Run Grav on Docker with Laradock

### 1. Add Laradock to your project

```bash
cd my-grav-site
git clone https://github.com/laradock/laradock.git
cd laradock
```

(No Grav files yet? Clone Laradock first, then create the site from the workspace container in the next steps.)

### 2. Pick the services your site needs

Grav has no database, so a web server is the whole stack; PHP-FPM comes with it automatically:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock start nginx workspace
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
cp .env.example .env
docker compose up -d nginx workspace
```

</TabItem>
</Tabs>

The full catalog of everything else available is [here](/docs/Intro#supported-services).

Prefer to be asked? The optional [CLI](/docs/cli) walks you through the choices: `./laradock setup`, then `./laradock start`. It prints every real command it runs.

### 3. Where Grav's content lives

There is no database host to configure. Grav's pages, config and users live as files under `user/` in your project, which is mounted straight from your host into the `nginx` and `workspace` containers, so edits made on your machine or through the admin panel show up immediately either way.

### 4. Install and run your site

Enter the `workspace` container, where Composer and git live, and create the project:

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
composer create-project getgrav/grav .   # only if you have no Grav files yet
bin/grav install
```

Then open [http://localhost](http://localhost). That is a full Grav site running on Docker.

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

Grav requires PHP 7.3.6 or newer, with 8.1 or newer recommended for current releases, and Laradock covers anything from PHP 5.6 to 8.5, so the same tool runs an older Grav site and a brand-new one side by side, each isolated, none of it installed on your machine.

## Frequently Asked Questions

### Do I need to install PHP or Composer to run Grav with Laradock?

No. Everything lives inside the containers. Composer and git are in the `workspace` container; you never install PHP on your host.

### Which services should I start for a typical Grav site?

`nginx workspace` is the whole stack: Grav has no database, so those two containers are all a typical site needs.

### Can I run multiple Grav sites on different PHP versions?

Yes. Give each its own Laradock with a unique `COMPOSE_PROJECT_NAME` and `DATA_PATH_HOST`, set a different `PHP_VERSION` in each, and they run independently on the same machine.

### Does this work the same on macOS, Windows and Linux?

Yes. Laradock runs anywhere Docker runs. On macOS/Windows, file-sync speed depends on Docker Desktop; it is a Docker Desktop trait, not specific to Laradock.

### Is this the same Docker setup I would use in production?

The containers are production-style (real NGINX + PHP-FPM), so it is far closer to production than PHP's built-in development server. See [Prepare Laradock for Production](/docs/production#prepare-laradock-for-production) for the hardening steps.

---

Comparing environments? See the full **[Laradock vs Others](/docs/laradock-alternatives)** breakdown. Ready to start? **[Getting Started](/docs/getting-started)** takes about five minutes.
