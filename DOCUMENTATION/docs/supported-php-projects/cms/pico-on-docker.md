---
slug: /pico-on-docker
title: Run Pico on Docker
description: Run Pico CMS on Docker in minutes with Laradock. What Docker gives a Pico site, why Laradock is the fastest way to get NGINX and PHP running, and the exact commands, with any PHP version, without installing anything on your machine.
keywords:
  - pico on docker
  - run pico on docker
  - pico cms docker
  - pico docker setup
  - dockerize pico
  - pico docker environment
  - pico flat file cms docker
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

## What is Pico?

[Pico](https://picocms.org) describes itself as a stupidly simple, blazing fast, flat-file CMS. There is no database, no admin panel and no install wizard: a page is just a Markdown file dropped into a `content` folder, rendered through Twig templates. It needs nothing more than a web server and PHP.

## Why run Pico in Docker?

Docker packages the web server and PHP runtime into isolated containers that run the same on every machine. Instead of installing PHP onto your laptop, where versions collide between projects and "works on my machine" starts, you run disposable containers that mirror production and vanish cleanly when you delete them. One Pico site can run on PHP 8.3 while another small project runs on an older version, on the same computer, with nothing installed globally.

The catch: wiring those containers together yourself (base images, PHP extensions, permissions) is a week of fiddly Docker work. That is exactly what Laradock removes.

## Why Laradock is the best fit for Pico

Pico has no official Docker image of its own, so a ready-made, no-lock-in environment matters even more. Here is why Laradock is the best fit:

- **You are never locked into one ecosystem.** Laradock is framework-agnostic. Run Pico today, add a Laravel API, a WordPress site, or another flat-file project beside it tomorrow, all in the same environment with the same commands.
- **Far more flexibility.** 100+ ready services and any PHP version from 5.6 to 8.5, so an old Pico site and a brand-new one each get exactly the runtime they need.
- **Nothing is hidden and you own everything.** No generated files, no magic, no wrapper binary between you and Docker. Every Dockerfile and compose file is right there for you to read and edit.
- **Nothing new to learn.** What you use is plain `docker compose`, knowledge that transfers straight to production. Our [CLI](/docs/cli) is an optional nicety, never a requirement.

Concretely, for Pico it gives you a production-style NGINX + PHP-FPM stack, no database container to babysit, a `workspace` container with Composer and git installed, and any PHP version behind a single line of config.

## Run Pico on Docker with Laradock

### 1. Add Laradock to your project

```bash
cd my-pico-site
git clone https://github.com/laradock/laradock.git
cd laradock
```

(No Pico files yet? Clone Laradock first, then pull in Pico from the workspace container in the next steps.)

### 2. Pick the services your site needs

Pico has no database, so it only needs a web server. Start that (it pulls in PHP-FPM automatically) and the workspace shell:

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

The full catalog of every other available service is [here](/docs/Intro#supported-services).

Prefer to be asked? The optional [CLI](/docs/cli) walks you through the choices: `./laradock setup`, then `./laradock start`. It prints every real command it runs.

### 3. Point Pico at the containers

There is no hostname to configure, since there is no database. Site-wide settings (base URL, theme, timezone) live in `config/config.yml` in the project root, which sits on your host through Laradock's normal volume mount, so you can edit it with any editor while the containers run.

### 4. Add content and run your site

Enter the `workspace` container to pull in Pico:

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
composer create-project picocms/pico-composer my-pico-site
```

There is no install wizard and no admin panel to log into. A page is just a Markdown file: create `content/index.md` (and any other `content/*.md` files you want as pages) directly on your host, in your editor of choice. Pico picks them up on the next request.

Then open [http://localhost](http://localhost). That is a full Pico site running on Docker.

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

Pico's minimum is PHP 5.3.6 with the `dom` and `mbstring` extensions, though in practice any current PHP 7.x or 8.x works fine, so the same tool runs an old Pico site and a brand-new one side by side, each isolated, none of it installed on your machine.

## Frequently Asked Questions

### Do I need to install PHP or Composer to run Pico with Laradock?

No. Everything lives inside the containers. Composer and git are in the `workspace` container; you never install PHP on your host.

### Which services should I start for a typical Pico site?

`nginx workspace` is all a Pico site needs; the web server pulls in PHP-FPM automatically. There is no database service, no admin panel, and no install wizard to run.

### Can I run multiple Pico sites on different PHP versions?

Yes. Give each its own Laradock with a unique `COMPOSE_PROJECT_NAME` and `DATA_PATH_HOST`, set a different `PHP_VERSION` in each, and they run independently on the same machine.

### Does this work the same on macOS, Windows and Linux?

Yes. Laradock runs anywhere Docker runs. On macOS/Windows, file-sync speed depends on Docker Desktop (VirtioFS helps a lot); it is a Docker Desktop trait, not specific to Laradock.

### Is this the same Docker setup I would use in production?

The containers are production-style (real NGINX + PHP-FPM), so it is far closer to production than a native install. See [Prepare Laradock for Production](/docs/production#prepare-laradock-for-production) for the hardening steps.

---

Comparing environments? See the full **[Laradock vs Others](/docs/laradock-alternatives)** breakdown. Ready to start? **[Getting Started](/docs/getting-started)** takes about five minutes.
