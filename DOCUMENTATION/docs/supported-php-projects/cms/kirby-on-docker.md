---
slug: /kirby-on-docker
title: Run Kirby on Docker
description: Run Kirby CMS on Docker in minutes with Laradock. What Docker gives a Kirby site, why Laradock is the fastest way to get NGINX and PHP running, and the exact commands, with any PHP version, without installing anything on your machine.
keywords:
  - kirby on docker
  - run kirby on docker
  - kirby cms docker
  - kirby docker setup
  - dockerize kirby
  - kirby docker environment
  - kirby flat file cms docker
---

## What is Kirby?

[Kirby](https://getkirby.com) is a flat-file CMS built for developers who want full control over templates and content structure. Content is stored as plain text files on disk instead of database rows, so there is no database to run: just a web server and PHP. Kirby is commercially licensed for production use (a one-time per-project fee), while running it locally for development and testing is free, which matters when you decide how to set it up.

## Why run Kirby in Docker?

Docker packages the web server and PHP runtime into isolated containers that run the same on every machine. Instead of installing PHP onto your laptop, where versions collide between projects and "works on my machine" starts, you run disposable containers that mirror production and vanish cleanly when you delete them. One Kirby site can run PHP 8.4 while another client project runs 8.2, on the same computer, with nothing installed globally.

The catch: wiring those containers together yourself (base images, PHP extensions, permissions) is a week of fiddly Docker work. That is exactly what Laradock removes.

## Why Laradock is the best fit for Kirby

Kirby has no official Docker image of its own (its docs point to Apache, nginx or the PHP built-in server run however you like), so a ready-made, no-lock-in environment matters even more. Here is why Laradock is the best fit:

- **You are never locked into one ecosystem.** Laradock is framework-agnostic. Run Kirby today, add a Laravel API, a WordPress site, or a plain PHP script beside it tomorrow, all in the same environment with the same commands.
- **Far more flexibility.** 100+ ready services and any PHP version from 5.6 to 8.5, so an older Kirby project and a brand-new one each get exactly the runtime they need.
- **Nothing is hidden and you own everything.** No generated files, no magic, no wrapper binary between you and Docker. Every Dockerfile and compose file is right there for you to read and edit.
- **Nothing new to learn.** What you use is plain `docker compose`, knowledge that transfers straight to production. Our [CLI](/docs/cli) is an optional nicety, never a requirement.

Concretely, for Kirby it gives you a production-style NGINX + PHP-FPM stack, no database container to babysit, a `workspace` container with Composer and git installed, and any PHP version behind a single line of config.

## Run Kirby on Docker with Laradock

### 1. Add Laradock to your project

```bash
cd my-kirby-site
git clone https://github.com/laradock/laradock.git
cd laradock && cp .env.example .env
```

(No Kirby files yet? Clone Laradock first, then pull in Kirby from the workspace container in the next steps.)

### 2. Pick the services your site needs

Kirby has no database, so it only needs a web server. Start that (it pulls in PHP-FPM automatically) and the workspace shell:

```bash
docker compose up -d nginx workspace
```

The full catalog of every other available service is [here](/docs/Intro#supported-services).

Prefer to be asked? The optional [CLI](/docs/cli) walks you through the choices: `./laradock setup`, then `./laradock up`. It prints every real command it runs.

### 3. Point Kirby at the containers

There is no hostname to configure, since there is no database. General settings (site URL, debug mode, custom options) live in `site/config/config.php` in the project root. Content lives as plain `.txt` files under a `content` folder, one subfolder per page, which sits on your host through Laradock's normal volume mount, so you can edit it with any editor while the containers run.

### 4. Install and run your site

Enter the `workspace` container, where Composer and git live, and pull in the Starterkit (or your own Kirby project):

```bash
docker compose exec workspace bash
composer create-project getkirby/starterkit my-kirby-site
```

Then open the Panel in your browser to create your first admin account:

```
http://localhost/panel
```

Follow the on-screen prompts for username, email and password. That is a full Kirby site running on Docker, free to use as-is for local development; buy a license before you put it in front of real visitors.

## Change the PHP version anytime

This is where a native install hurts and Laradock shines. Set the version in Laradock's `.env` and rebuild:

```env
PHP_VERSION=8.3
```

```bash
docker compose build php-fpm workspace
```

Kirby supports PHP 8.2, 8.3 (recommended) and 8.4, so the same tool runs an older client project pinned to 8.2 and a brand-new build on 8.4 side by side, each isolated, none of it installed on your machine.

## Frequently Asked Questions

### Do I need to install PHP or Composer to run Kirby with Laradock?

No. Everything lives inside the containers. Composer and git are in the `workspace` container; you never install PHP on your host.

### Which services should I start for a typical Kirby site?

`nginx workspace` is all a Kirby site needs; the web server pulls in PHP-FPM automatically. There is no database service to add.

### Can I run multiple Kirby sites on different PHP versions?

Yes. Give each its own Laradock with a unique `COMPOSE_PROJECT_NAME` and `DATA_PATH_HOST`, set a different `PHP_VERSION` in each, and they run independently on the same machine.

### Does this work the same on macOS, Windows and Linux?

Yes. Laradock runs anywhere Docker runs. On macOS/Windows, file-sync speed depends on Docker Desktop (VirtioFS helps a lot); it is a Docker Desktop trait, not specific to Laradock.

### Is this the same Docker setup I would use in production?

The containers are production-style (real NGINX + PHP-FPM), so it is far closer to production than a native install. Remember that production use still requires a paid Kirby license regardless of how you host it; see [Prepare Laradock for Production](/docs/usage#prepare-laradock-for-production) for the hardening steps.

---

Comparing environments? See the full **[Laradock vs Others](/docs/laradock-alternatives)** breakdown. Ready to start? **[Getting Started](/docs/getting-started)** takes about five minutes.
