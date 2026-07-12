# Run Flarum on Docker

Source: https://laradock.io/docs/flarum-on-docker

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

## What is Flarum?

[Flarum](https://flarum.org) is a modern, fast forum platform built around a single extension system: everything from the core discussion view to third-party features is an extension, installed and updated through Composer. It is a PHP application backed by a MySQL or MariaDB database, served through a web server, and it needs Composer available on the server for both the initial install and every extension you add later. Bigger communities also lean on a queue worker, the task scheduler, and an external search engine, all of which Flarum supports through extensions.

## Why run Flarum in Docker?

Docker packages each of those pieces (NGINX, PHP-FPM, MySQL) into isolated containers that run the same on every machine. Instead of installing PHP, Composer and MySQL onto your laptop, where versions collide between projects and "works on my machine" starts, you run disposable containers that mirror production and vanish cleanly when you delete them. One Flarum install can run the newer PHP its latest release requires while another project stays on an older version, on the same computer, with nothing installed globally.

The catch: wiring those containers together yourself (base images, PHP extensions, networking, permissions) is a week of fiddly Docker work. That is exactly what Laradock removes.

## Why Laradock is the best fit for Flarum

Flarum has no official Docker image of its own, only community-maintained ones, so a ready-made, no-lock-in environment matters even more. Here is why Laradock is the best fit:

- **You are never locked into one ecosystem.** Laradock is framework-agnostic. Run your Flarum forum today, add a Laravel API, a WordPress marketing site, or a plain PHP script beside it tomorrow, all in the same environment with the same commands.
- **Far more flexibility.** 100+ ready services and any PHP version from 5.6 to 8.5, so a Flarum 1.x install and the newer PHP-8.3-only Flarum 2.0 can each get exactly the runtime they need.
- **Nothing is hidden and you own everything.** No generated files, no magic, no wrapper binary between you and Docker. Every Dockerfile and compose file is right there for you to read and edit.
- **Nothing new to learn.** What you use is plain `docker compose`, knowledge that transfers straight to production. Our [CLI](https://laradock.io/docs/cli) is an optional nicety, never a requirement.

Concretely, for Flarum it gives you a production-style NGINX + PHP-FPM stack, MySQL/MariaDB already wired, and a `workspace` container with Composer and git already installed, exactly what Flarum's own install docs assume you have. When your forum grows, Redis, Meilisearch, a mail catcher and a queue worker are each one command away.

## Run Flarum on Docker with Laradock

### 1. Add Laradock to your project

```bash
cd my-flarum-forum
git clone https://github.com/laradock/laradock.git
cd laradock
```

(No Flarum files yet? Clone Laradock first, then create the Flarum project from the `workspace` container in the next steps.)

### 2. Pick the services your forum needs

Flarum needs exactly two things: a **web server** and a **database**. The web server pulls in PHP-FPM automatically, so this is the whole required stack:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI" default>

```bash
./laradock start nginx mysql workspace
```

</TabItem>
<TabItem value="compose" label="Docker Compose">

```bash
cp .env.example .env
docker compose up -d nginx mysql workspace
```

</TabItem>
</Tabs>

Prefer MariaDB? Swap the name: `./laradock start nginx mariadb workspace` (or `docker compose up -d nginx mariadb workspace`). The full catalog is [here](https://laradock.io/docs/Intro#supported-services).

Prefer to be asked? The optional [CLI](https://laradock.io/docs/cli) walks you through the choices: `./laradock setup`, then `./laradock start`. It prints every real command it runs.

> **Do I need Redis or a search server to get running?** No. A fresh Flarum forum runs perfectly on `nginx mysql workspace`, using its built-in database search and running jobs synchronously. Redis, Meilisearch and a queue worker are opt-in upgrades for busier communities, wired up in their own sections below.

### 3. Point Flarum at the containers

Flarum's installer writes a `config.php` for you, but this is the shape of it once installed; use the service name as the database host:

```php
'database' => [
    'driver'   => 'mysql',
    'host'     => 'mysql',
    'database' => 'default',
    'username' => 'default',
    'password' => 'secret',
    'prefix'   => '',
],
```

The default database, user and password live in Laradock's `mysql/defaults.env`; override any of them by adding the line to Laradock's `.env` (it always wins).

### 4. Install and run your forum

Enter the `workspace` container, use Composer to fetch Flarum, then finish the setup in the browser:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI" default>

```bash
./laradock workspace
```

</TabItem>
<TabItem value="compose" label="Docker Compose">

```bash
docker compose exec workspace bash
```

</TabItem>
</Tabs>

```bash
composer create-project flarum/flarum . --stability=beta
```

Then open [http://localhost](http://localhost) and follow Flarum's install wizard: it validates your PHP extensions, asks for the database details from the step above, and creates the administrator account. That is a full Flarum forum running on Docker.

## Create the first admin account

You have two ways to create that first administrator:

- **Browser wizard.** The default. Open [http://localhost](http://localhost) after `composer create-project`, fill in the forum title, the database details from step 3, and your admin username, email and password. Submit, then log in at [http://localhost/login](http://localhost/login) and open **Administration** from your profile menu.
- **CLI install.** From the `workspace` container, `php flarum install` runs the same setup as a series of prompts (or unattended from a config file), which is handy for scripting a fresh environment. It writes `config.php` and seeds the admin account without touching the browser.

If you ever lock yourself out, `php flarum` has no built-in password reset, but you can promote any user to admin directly, or create a fresh admin, with the [FoF console commands](https://github.com/FriendsOfFlarum/console) extension or a quick SQL update on the `users` and `group_user` tables in the `mysql` container.

## Manage Flarum from the workspace

Everything Flarum does on the command line runs from inside the `workspace` container, where PHP and Composer live. Enter it once:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI" default>

```bash
./laradock workspace
```

</TabItem>
<TabItem value="compose" label="Docker Compose">

```bash
docker compose exec workspace bash
```

</TabItem>
</Tabs>

Then the `flarum` console tool handles the common jobs:

```bash
php flarum info                 # version, PHP, enabled extensions, drivers in use
php flarum cache:clear          # clear the cache after any config or extension change
php flarum migrate              # apply pending database migrations
php flarum schedule:run         # run any due scheduled tasks once
php flarum queue:work           # process queued jobs
php flarum assets:publish       # re-publish core and extension assets
```

`php flarum cache:clear` is the one you will reach for most: run it after editing `config.php`, after enabling or updating an extension, or any time the forum looks stale.

## Install and update extensions

Flarum is almost entirely extensions, and every one is a Composer package, so the `workspace` container is where you add them. To install an extension, require it, clear the cache, then enable it in **Administration → Extensions** (or from the CLI):

```bash
composer require fof/upload      # example extension
php flarum cache:clear
php flarum migrate               # only extensions that add tables need this
```

To update everything to the latest compatible versions later:

```bash
composer update
php flarum migrate
php flarum cache:clear
```

Because Composer runs inside the container, you never install PHP or Composer on your host, and the exact same commands work on macOS, Windows and Linux.

## Add Redis for caching and queues (optional)

Redis is not required, but on a busy forum it speeds up the cache and, together with a queue worker, moves slow work (emails, search indexing, notifications) off the web request. Flarum wires Redis through a local extender, so it is three steps.

1. Start the Redis container alongside the rest:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI" default>

```bash
./laradock start redis
```

</TabItem>
<TabItem value="compose" label="Docker Compose">

```bash
docker compose up -d redis
```

</TabItem>
</Tabs>

2. Install the [Blomstra Redis](https://github.com/blomstra/flarum-redis) package and register it in a local extender. From the `workspace` container:

```bash
composer require blomstra/redis
```

Then create or edit `extend.php` in your Flarum project root, using the Laradock service name `redis` as the host:

```php
<?php

use Blomstra\Redis\Extend\Redis;

return [
    (new Redis([
        'host'     => 'redis',
        'password' => null,
        'port'     => 6379,
        'database' => 1,
    ]))->cache()->session()->queue(),
];
```

3. Clear the cache so Flarum picks up the new drivers:

```bash
php flarum cache:clear
```

That's it: Flarum now stores its cache and session in Redis and pushes jobs onto a Redis queue. Without those steps the container just sits idle, which is why the required stack above leaves it out. On smaller sites that want a queue without running Redis, the [database queue](https://github.com/blomstra/flarum-ext-database-queue) extension is a drop-in alternative that uses your existing MySQL container.

## Run a background queue worker

Once a queue driver is enabled (Redis or the database queue above), a worker process actually drains the jobs. Start it from the `workspace` container:

```bash
php flarum queue:work
```

That command runs in the foreground and keeps processing jobs until you stop it. For day-to-day development, leaving it open in a second `workspace` shell is fine. To keep it alive unattended, run it under a process manager, Laradock ships a `php-worker` container backed by Supervisor for exactly this; point a program entry at `php /var/www/flarum queue:work` and it restarts the worker automatically. Remember to restart the worker after deploying code, since a long-running PHP process holds the old code in memory.

## Schedule recurring tasks with cron

Many extensions rely on Flarum's scheduler for things like posting scheduled drafts, cleaning up data, or generating sitemaps. The scheduler is driven by one command that must run every minute:

```bash
php flarum schedule:run
```

Laradock's `workspace` container already has cron installed and reads job files from `workspace/crontab/`. Edit `workspace/crontab/laradock` and point the entry at Flarum (the project is mounted at `/var/www`):

```cron
* * * * * laradock /usr/bin/php /var/www/flarum schedule:run >> /dev/null 2>&1
```

Rebuild the workspace so the new crontab is baked in:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI" default>

```bash
./laradock rebuild workspace
```

</TabItem>
<TabItem value="compose" label="Docker Compose">

```bash
docker compose build workspace
```

</TabItem>
</Tabs>

If none of your extensions use scheduled jobs, you can skip this entirely; core Flarum runs fine without it.

## Add full-text search with Meilisearch (optional)

Flarum ships with database-backed search that is fine for small and medium forums. When your community grows and you want fast, typo-tolerant full-text search, swap in a real search engine. The [Scout Search](https://github.com/clarkwinkelmann/flarum-ext-scout) extension drives [Meilisearch](https://www.meilisearch.com/), which Laradock includes.

1. Start Meilisearch:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI" default>

```bash
./laradock start meilisearch
```

</TabItem>
<TabItem value="compose" label="Docker Compose">

```bash
docker compose up -d meilisearch
```

</TabItem>
</Tabs>

2. From the `workspace` container, install the extension:

```bash
composer require clarkwinkelmann/flarum-ext-scout
php flarum cache:clear
```

3. Enable **Scout Search** in **Administration → Extensions**, choose the Meilisearch driver, and set the host to the container: `http://meilisearch:7700`. Then build the initial index from the `workspace` container:

```bash
php flarum scout:import
```

New posts and discussions are indexed automatically from then on. Prefer Elasticsearch? Laradock also ships `elasticsearch`, paired with the [Blomstra Search](https://github.com/blomstra/flarum-ext-search) extension instead.

## Catch outgoing email with Mailpit (optional)

Flarum sends email for signup confirmation, password resets and notifications, so you want to see those messages without delivering real mail during development. Mailpit captures everything in a web inbox.

1. Start Mailpit:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI" default>

```bash
./laradock start mailpit
```

</TabItem>
<TabItem value="compose" label="Docker Compose">

```bash
docker compose up -d mailpit
```

</TabItem>
</Tabs>

2. In **Administration → Email**, choose the **SMTP** driver and set:

```text
Host: mailpit
Port: 1025
Encryption: (leave blank)
```

Save, then use **Send Test Mail** to confirm. Every message Flarum sends now lands in the Mailpit inbox at [http://localhost:8025](http://localhost:8025). (Prefer MailHog? Start `mailhog` instead; the SMTP host becomes `mailhog` on the same port 1025, inbox also at [http://localhost:8025](http://localhost:8025).)

## Import an existing Flarum database

Moving a live forum onto Laradock is a database restore plus the uploaded files. Put your SQL dump somewhere under your project (so it is visible inside the container), enter the `workspace` container, and load it into the `mysql` service:

```bash
mysql -h mysql -u default -psecret default < backup.sql
```

Copy your old `storage/` (avatars, logs) and any upload folders into the new project, point `config.php` at the containers as in step 3, then finish with:

```bash
php flarum migrate
php flarum cache:clear
```

`migrate` brings the schema up to your installed Flarum version, and `cache:clear` drops any stale cached config. Your forum is now running on Docker with all its data intact.

## Change the PHP version anytime

This is where a native install hurts and Laradock shines. Set the version in Laradock's `.env` and rebuild:

```env
PHP_VERSION=8.3
```

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI" default>

```bash
./laradock rebuild php-fpm workspace
```

</TabItem>
<TabItem value="compose" label="Docker Compose">

```bash
docker compose build php-fpm workspace
```

</TabItem>
</Tabs>

Flarum 1.x runs on PHP 7.4 through 8.3, while Flarum 2.0 requires PHP 8.3 or newer; Laradock covers anything from PHP 5.6 to 8.5, so the same tool runs an older Flarum 1.x forum and a Flarum 2.0 install side by side, each isolated, none of it installed on your machine.

## Take your forum live

When your forum is ready, the same Laradock stack becomes your deployment. You build one hardened image of your app and ship it to the host of your choice:

```bash
./laradock ship
```

Then pick a target and follow its short guide, a single server, a managed platform, or Kubernetes: **[Deploy to Production](https://laradock.io/docs/production)** lists every provider (Fly.io, Render, Railway, DigitalOcean, AWS, Google Cloud, Azure, Kamal, Kubernetes) with a ready config file for each. There is no per-provider magic to learn; a Docker image runs the same everywhere.

## Frequently Asked Questions

### Do I need to install PHP, Composer or MySQL to run Flarum with Laradock?

No. Everything lives inside the containers. Composer, git and PHP are all provided; you never install them on your host.

### Which services should I start for a typical Flarum forum?

`nginx mysql workspace` is all Flarum requires: web server, database, and a shell with Composer for installing and updating extensions. Swap `mysql` for `mariadb` if you prefer. Add `redis`, `meilisearch` or `mailpit` only when you set up the matching feature below; a fresh forum needs none of them.

### How do I run the queue worker and scheduler?

Enable a queue driver (see [Add Redis](#add-redis-for-caching-and-queues-optional)) and run `php flarum queue:work` from the `workspace` container, kept alive by the `php-worker` container in production. For the scheduler, add the one-line cron entry to `workspace/crontab/laradock` and rebuild the workspace. Both are optional and only matter once an extension uses them.

### Can I run multiple Flarum forums on different PHP versions?

Yes. Give each its own Laradock with a unique `COMPOSE_PROJECT_NAME` and `DATA_PATH_HOST`, set a different `PHP_VERSION` in each, and they run independently on the same machine.

### Does this work the same on macOS, Windows and Linux?

Yes. Laradock runs anywhere Docker runs. On macOS/Windows, file-sync speed depends on Docker Desktop (VirtioFS helps a lot); it is a Docker Desktop trait, not specific to Laradock.

### Is this the same Docker setup I would use in production?

The containers are production-style (real NGINX + PHP-FPM), so it is far closer to production than a native install. See [Prepare Laradock for Production](https://laradock.io/docs/production#prepare-laradock-for-production) for the hardening steps.

---

Comparing environments? See the full **[Laradock vs Others](https://laradock.io/docs/laradock-alternatives)** breakdown. Ready to start? **[Getting Started](https://laradock.io/docs/getting-started)** takes about five minutes.
