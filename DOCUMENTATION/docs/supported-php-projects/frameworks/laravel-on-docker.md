---
slug: /laravel-on-docker
title: Run Laravel on Docker
description: Run any Laravel app on Docker in minutes with Laradock. What Docker gives a Laravel project, why Laradock is the fastest way to get NGINX, PHP, MySQL and Redis running, and the exact commands, with any PHP version, without installing anything on your machine.
keywords:
  - laravel on docker
  - run laravel on docker
  - laravel docker
  - laravel docker setup
  - dockerize laravel
  - laravel docker environment
  - laravel nginx mysql docker
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

## What is Laravel?

[Laravel](https://laravel.com) is the most popular PHP web framework: an expressive, full-stack toolkit for building everything from APIs to large applications, with routing, an ORM (Eloquent), queues, a scheduler, and a huge ecosystem. A real Laravel app rarely runs alone; it wants a web server, a PHP runtime, a database, usually Redis for cache and queues, and often a search engine or a mail catcher alongside it.

## Why run Laravel in Docker?

Docker packages each of those pieces (NGINX, PHP-FPM, MySQL, Redis, ...) into isolated containers that run the same on every machine. Instead of installing PHP and MySQL onto your laptop, where versions collide between projects and "works on my machine" starts, you run disposable containers that mirror production and vanish cleanly when you delete them. One project can run PHP 8.4 while another runs 7.4, on the same computer, with nothing installed globally.

The catch: wiring those containers together yourself (base images, PHP extensions, networking, permissions) is a week of fiddly Docker work. That is exactly what Laradock removes.

## Why Laradock is the best fit for Laravel

Laravel has its own official Docker tools (Sail) and native runtimes (Herd, Valet), so, unlike most PHP projects, it does not strictly need Laradock. It is still the best fit, and here is why:

- **You are never locked into one ecosystem.** Laradock is framework-agnostic. The day you add a Symfony service, a WordPress site, or a plain PHP script beside your Laravel app, it runs in the same environment with the same commands. Laravel-only tools cannot do that.
- **Far more flexibility.** 100+ ready services and any PHP version from 5.6 to 8.5, versus the short curated list a Laravel-specific tool gives you.
- **Nothing is hidden and you own everything.** No generated files, no magic, no wrapper binary between you and Docker. Every Dockerfile and compose file is right there for you to read and edit.
- **Nothing new to learn.** What you use is plain `docker compose`, knowledge that transfers straight to production and to every other project. Our [CLI](/docs/cli) is an optional nicety, never a requirement.

[Laradock](/docs/getting-started) is a ready-made Docker environment for PHP: 100+ pre-configured services you start with plain `docker compose`, no binary to install and no wrapper command to learn. For Laravel specifically it gives you:

- **A production-style stack out of the box** - real NGINX (or Apache/Caddy) in front of PHP-FPM, not `artisan serve`.
- **Every service Laravel touches, already wired** - MySQL/PostgreSQL, Redis, Meilisearch, Beanstalk, Mailpit, and dozens more, each a single `up` command away.
- **Any PHP version, per project** - switch between PHP 5.6 and 8.5 by changing one line, without touching your machine.
- **A `workspace` container** - a Linux shell with Composer, Node, npm, git and Artisan already installed, so you run every command there and keep your host clean.

## Run Laravel on Docker with Laradock

### 1. Add Laradock to your project

```bash
cd my-laravel-app
git clone https://github.com/laradock/laradock.git
cd laradock && cp .env.example .env
```

(No Laravel app yet? Clone Laradock first, then [create one from the workspace container](#starting-a-brand-new-laravel-app).)

### 2. Pick the services your app needs

Most Laravel apps need a web server, a database, and Redis. Start exactly those (the web server pulls in PHP-FPM automatically):

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock start nginx mysql redis workspace
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose up -d nginx mysql redis workspace
```

</TabItem>
</Tabs>

Need Postgres instead of MySQL? Swap the name: `./laradock start nginx postgres redis workspace` (or `docker compose up -d nginx postgres redis workspace`). Need search or a mail catcher later? Add it any time: `./laradock start meilisearch` (or `docker compose up -d meilisearch`) or `./laradock start mailpit` (or `docker compose up -d mailpit`). The full catalog is [here](/docs/Intro#supported-services).

Prefer to be asked? The optional [CLI](/docs/cli) detects Laravel and pre-selects nginx/mysql/redis for you: `./laradock setup`, then `./laradock up`. It prints every real command it runs.

### 3. Point Laravel at the containers

In your app's `.env`, use the service names as hostnames:

```env
DB_HOST=mysql
REDIS_HOST=redis
```

The default database, user and password live in `mysql/defaults.env`; override any of them by adding the line to Laradock's `.env` (it always wins).

### 4. Run your app from the workspace

Enter the shell where Artisan, Composer and npm live:

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

Then run the usual commands:

```bash
composer install
php artisan key:generate
php artisan migrate
```

Then open [http://localhost](http://localhost). That is a full Laravel app running on Docker.

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

Anything from PHP 5.6 to 8.5 works, so the same tool runs a legacy Laravel 5 project and a brand-new Laravel 11 one side by side, each isolated, none of it installed on your machine.

## Starting a brand-new Laravel app

If you don't have a Laravel app yet, create one from inside the workspace container instead of installing Composer on your host:

1. Start the workspace: `./laradock start workspace` (or `docker compose up -d workspace`).
2. Enter it (`./laradock workspace`, or `docker compose exec workspace bash`) and create the project with Composer (recommended over the Laravel installer):
   ```bash
   composer create-project laravel/laravel my-cool-app
   ```
   See the [Laravel installation docs](https://laravel.com/docs/installation) for details.
3. Point Laradock at the new app. By default Laradock expects your app in the parent directory of the `laradock` folder, so update `APP_CODE_PATH_HOST` in `.env`:
   ```dotenv
   APP_CODE_PATH_HOST=../my-cool-app/
   ```
4. `cd my-cool-app` and continue from [step 2](#2-pick-the-services-your-app-needs) above.

## Everyday Artisan, Composer and test commands

Run Artisan, Composer, tests and any other terminal command from the workspace container:

1. Make sure the workspace is running: `./laradock start workspace` (or `docker compose up -d workspace`).
2. Enter it: `./laradock workspace` (or `docker compose exec workspace bash`). Add `--user=laradock` so files it creates are owned by your host user instead of root: `docker compose exec --user=laradock workspace bash`.
3. Run anything you need:
   ```bash
   php artisan
   composer update
   phpunit
   ```

## Run the queue worker

1. Create a config for the worker in `php-worker/supervisord.d/` by copying `laravel-worker.conf.example` (for example, to `laravel-worker.conf`).
2. Start the worker: `./laradock start php-worker` (or `docker compose up -d php-worker`).

## Run the scheduler

Laradock can run the Laravel scheduler two ways:

1. **Cron in the workspace container (default).** When you start Laradock, the `workspace` container starts cron and runs `schedule:run` every minute.
2. **Supervisord in the php-worker container.** Preferred when you don't want to run the workspace in production.

To switch to the second option:

1. Comment out the cron line in `workspace/crontab/laradock`:
   ```bash
   # * * * * * laradock /usr/bin/php /var/www/artisan schedule:run >> /dev/null 2>&1
   ```
2. Copy `laravel-scheduler.conf.example` in `php-worker/supervisord.d/` to a new config (for example, `laravel-scheduler.conf`).
3. Start the worker: `./laradock start php-worker` (or `docker compose up -d php-worker`).

## Use Browsersync with Laravel Mix

1. Add Browsersync to your `webpack.mix.js` (see the [Browsersync options](https://browsersync.io/docs/options)):
   ```js
   const mix = require('laravel-mix')

   // ...

   mix.browserSync({
     open: false,
     proxy: 'nginx' // replace with your web server container
   })
   ```
2. Run `npm run watch` inside the workspace container.
3. Open `http://localhost:[WORKSPACE_BROWSERSYNC_HOST_PORT]`, it reloads automatically when you edit a source file.
4. The Browsersync UI is at `http://localhost:[WORKSPACE_BROWSERSYNC_UI_HOST_PORT]`.

## Frequently Asked Questions

### Do I need to install PHP or Composer to run Laravel with Laradock?

No. Everything lives inside the containers. Composer, Node, npm, git and Artisan are all in the `workspace` container; you never install PHP on your host.

### Which services should I start for a typical Laravel app?

`nginx mysql redis workspace` covers most apps. Swap `mysql` for `postgres` if you prefer, and add extras like `meilisearch` (search) or `mailpit` (catching outgoing mail) whenever a feature needs them.

### Can I run multiple Laravel apps on different PHP versions?

Yes. Give each its own Laradock with a unique `COMPOSE_PROJECT_NAME` and `DATA_PATH_HOST`, set a different `PHP_VERSION` in each, and they run independently on the same machine.

### Does this work the same on macOS, Windows and Linux?

Yes. Laradock runs anywhere Docker runs. On macOS/Windows, file-sync speed depends on Docker Desktop (VirtioFS helps a lot for `vendor/`-heavy apps); it is a Docker Desktop trait, not specific to Laradock.

### Is this the same Docker setup I would use in production?

The containers are production-style (real NGINX + PHP-FPM), so it is far closer to production than `artisan serve` or a native install. See [Prepare Laradock for Production](/docs/production#prepare-laradock-for-production) for the hardening steps.

---

Already using Laravel Sail and considering the switch? See the side-by-side with a migration guide: **[Laradock vs Laravel Sail](/docs/laradock-vs-laravel-sail)**. Ready to start? **[Getting Started](/docs/getting-started)** takes about five minutes.
