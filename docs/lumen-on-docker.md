# Run Lumen on Docker

Source: https://laradock.io/docs/lumen-on-docker

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

## What is Lumen?

[Lumen](https://lumen.laravel.com) is Laravel's micro-framework: built by the same team, on the same Illuminate components (Eloquent, the container, routing), stripped down for fast, small API services. It shares Artisan-style console commands and Laravel's `.env`-driven config. One thing worth knowing up front: Laravel's team has said Lumen only receives bug fixes now and recommends the full Laravel framework (optionally with Octane) for new projects; Lumen still works and is fine for maintaining an existing service, this page assumes you already have one or are intentionally choosing it. A Lumen app needs only a web server, a PHP runtime, and usually a database (MySQL, PostgreSQL, SQLite or SQL Server via Eloquent). It ships lean: out of the box it uses the `file` cache driver and the `sync` queue driver, and it does not bundle Redis or the mail component, so those are opt-in extras you wire when a feature needs them (each has its own section below).

## Why run Lumen in Docker?

Docker packages each of those pieces (NGINX, PHP-FPM, MySQL, Redis) into isolated containers that run the same on every machine. Instead of installing PHP and MySQL onto your laptop, where versions collide between projects and "works on my machine" starts, you run disposable containers that mirror production and vanish cleanly when you delete them. One project can run PHP 8.2 while another runs 7.4, on the same computer, with nothing installed globally.

The catch: wiring those containers together yourself (base images, PHP extensions, networking, permissions) is a week of fiddly Docker work. That is exactly what Laradock removes.

## Why Laradock is the best fit for Lumen

Laravel Sail exists for Laravel, but it does not target Lumen; Lumen has no official Docker tool or first-party runtime of its own. Here is why Laradock is the best fit:

- **You are never locked into one ecosystem.** Laradock is framework-agnostic. Run a Lumen service today, add a full Laravel app, a WordPress site, or a plain PHP script beside it tomorrow, all in the same environment with the same commands.
- **Far more flexibility.** 100+ ready services and any PHP version from 5.6 to 8.5, so an older Lumen 8 service and a newer Lumen 10 one each get exactly the runtime they need.
- **Nothing is hidden and you own everything.** No generated files, no magic, no wrapper binary between you and Docker. Every Dockerfile and compose file is right there for you to read and edit.
- **Nothing new to learn.** What you use is plain `docker compose`, knowledge that transfers straight to production and to every other project, including a future migration to full Laravel. Our [CLI](https://laradock.io/docs/cli) is an optional nicety, never a requirement.

For Lumen specifically, Laradock wires a production-style NGINX + PHP-FPM stack, MySQL or PostgreSQL ready to connect, a `workspace` container with Composer, Node, git and Artisan already installed (the same shell you would use for a Laravel app), and Redis, a queue worker, a cron scheduler and a mail catcher all one command away when a feature calls for them.

## Run Lumen on Docker with Laradock

### 1. Add Laradock to your project

```bash
cd my-lumen-service
git clone https://github.com/laradock/laradock.git
cd laradock
```

(No Lumen app yet? Clone Laradock first, then create one from the workspace container in the next steps.)

### 2. Pick the services your app needs

A Lumen API needs exactly two things to boot: a **web server** and a **database**. The web server pulls in PHP-FPM automatically, so this is the whole required stack:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock start nginx mysql workspace
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
cp .env.example .env
docker compose up -d nginx mysql workspace
```

</TabItem>
</Tabs>

Prefer PostgreSQL over MySQL? Swap the name: `./laradock start nginx postgres workspace` (or `docker compose up -d nginx postgres workspace`). Building a stateless service with no database at all? Drop it: `./laradock start nginx workspace`. The full catalog is [here](https://laradock.io/docs/Intro#supported-services).

Prefer to be asked? The optional [CLI](https://laradock.io/docs/cli) detects Lumen and pre-selects nginx/mysql for you: `./laradock setup`, then `./laradock start`. It prints every real command it runs.

> **Do I need Redis?** Not to get running. A fresh Lumen app uses the `file` cache and `sync` queue drivers and runs perfectly on `nginx mysql workspace`. Redis only helps once you add it for caching or background queues, and that takes a couple of extra steps in Lumen. See [Add Redis for cache and queues](#add-redis-for-cache-and-queues-optional) below when you actually want it.

### 3. Point Lumen at the containers

In your app's `.env`, use the service names as hostnames:

```env
DB_HOST=mysql
DB_DATABASE=default
DB_USERNAME=default
DB_PASSWORD=secret
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
composer create-project --prefer-dist laravel/lumen .   # only if you have no Lumen app yet
php artisan migrate
```

Then open [http://localhost](http://localhost). That is a full Lumen service running on Docker.

## Add Redis for cache and queues (optional)

Redis is not required, but it is the usual choice once you want a fast cache or a real queue driver. Unlike full Laravel, Lumen does not bundle Redis, so wiring it up is four small steps:

1. Start the Redis container alongside the rest:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock start redis
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose up -d redis
```

</TabItem>
</Tabs>

2. From the `workspace` container, pull in the Redis package:

```bash
composer require illuminate/redis
```

3. Register the provider in `bootstrap/app.php` (and enable the config if you are not using Eloquent):

```php
$app->configure('database');
$app->register(Illuminate\Redis\RedisServiceProvider::class);
```

4. Point Lumen at the container in your app's `.env`:

```env
CACHE_DRIVER=redis
QUEUE_CONNECTION=redis
REDIS_HOST=redis
REDIS_PORT=6379
```

Now `Cache::get()`, `Cache::put()` and queued jobs all run through the `redis` container. Without those steps the container just sits idle, which is why the required stack above leaves it out.

## Run background queue workers (optional)

Lumen ships with the `sync` queue driver, which runs a job the moment it is dispatched (fine for local testing). For real background processing you point `QUEUE_CONNECTION` at a persistent driver and run a worker.

Pick a queue backend:

- **Database queue:** no extra container. From the `workspace`, create the tables and set the driver:

  ```bash
  php artisan queue:table
  php artisan queue:failed-table
  php artisan migrate
  ```

  ```env
  QUEUE_CONNECTION=database
  ```

- **Redis queue:** wire Redis first (see the section above), then set `QUEUE_CONNECTION=redis`.

To process jobs, run a worker from the `workspace` container:

```bash
php artisan queue:work --sleep=3 --tries=3
```

For a worker that stays up on its own (and restarts jobs that die), start Laradock's dedicated `php-worker` container instead of leaving a terminal open. It runs your worker under Supervisor:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock start php-worker
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose up -d php-worker
```

</TabItem>
</Tabs>

Its worker program lives in `php-worker/supervisord.d/laravel-worker.conf.example` (copy it to `laravel-worker.conf`), which already runs `php /var/www/artisan queue:work --sleep=3 --tries=3`. The same worker driver works for a Lumen app.

## Schedule recurring tasks with cron (optional)

Lumen supports Laravel's scheduler: you define recurring jobs in the `schedule()` method of `app/Console/Kernel.php`, and a single cron entry runs them.

```php
protected function schedule(Schedule $schedule)
{
    $schedule->command('emails:send')->daily();
}
```

Laradock's `workspace` container already ships the one cron entry the scheduler needs, in `workspace/crontab/laradock`:

```cron
* * * * * laradock /usr/bin/php /var/www/artisan schedule:run >> /dev/null 2>&1
```

That fires `schedule:run` every minute, which then runs whichever tasks are due. For a one-off check while developing, run it by hand from the `workspace`:

```bash
php artisan schedule:run
```

## Send mail in local development (optional)

Lumen does not bundle the mail component, so mail is two parts: catch outgoing messages with a local mail server, and add the mailer to your app.

1. Start [Mailpit](https://github.com/axllent/mailpit), Laradock's mail catcher (it grabs every message your app sends and shows them in a web inbox):

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock start mailpit
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose up -d mailpit
```

</TabItem>
</Tabs>

2. From the `workspace`, add the mail component and register it in `bootstrap/app.php`:

```bash
composer require illuminate/mail
```

```php
$app->configure('mail');
$app->register(Illuminate\Mail\MailServiceProvider::class);
```

3. Point your app's `.env` at the Mailpit container (SMTP is on port `1025` inside the Docker network):

```env
MAIL_MAILER=smtp
MAIL_HOST=mailpit
MAIL_PORT=1025
MAIL_USERNAME=null
MAIL_PASSWORD=null
MAIL_ENCRYPTION=null
```

Every email your Lumen app sends now lands in the Mailpit inbox at [http://localhost:8125](http://localhost:8125) instead of a real address.

## Import an existing database

Moving an existing Lumen service onto Docker? Drop your SQL dump into the running database container from the host. The default database is `default`:

```bash
docker compose exec -T mysql mysql -u default -psecret default < dump.sql
```

For PostgreSQL, use the `postgres` container instead:

```bash
docker compose exec -T postgres psql -U default -d default < dump.sql
```

Your data path persists in `DATA_PATH_HOST` (a folder under your home directory by default), so it survives container restarts and rebuilds.

## Everyday Artisan and Composer tooling

Everything you would run on a native install runs the same way inside the `workspace` container, where Artisan, Composer, Node, npm and git are already installed. Enter it with `./laradock workspace` (or `docker compose exec workspace bash`), then:

```bash
composer install                # install dependencies
composer require vendor/package # add a package
php artisan migrate             # run migrations
php artisan list                # see the commands your app exposes
php artisan make:command SyncOrders   # requires illuminate/console generators
```

Lumen exposes a smaller Artisan command set than full Laravel, but `migrate`, `queue:work`, `schedule:run` and your own console commands all work exactly as they do on the host.

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

The latest Lumen release targets PHP 8.1+, and Laradock covers anything from PHP 5.6 to 8.5, so the same tool runs an older Lumen 7 service pinned to an old PHP version and a current Lumen 10 API side by side, each isolated, none of it installed on your machine.

## Take your app live

When your service is ready, the same Laradock stack becomes your deployment. You build one hardened image of your app and ship it to the host of your choice:

```bash
./laradock ship
```

Then pick a target and follow its short guide, a single server, a managed platform, or Kubernetes: **[Deploy to Production](https://laradock.io/docs/production)** lists every provider (Fly.io, Render, Railway, DigitalOcean, AWS, Google Cloud, Azure, Kamal, Kubernetes) with a ready config file for each. There is no per-provider magic to learn; a Docker image runs the same everywhere.

## Frequently Asked Questions

### Do I need to install PHP or Composer to run Lumen with Laradock?

No. Everything lives inside the containers. Composer, Node, npm, git and Artisan are all in the `workspace` container; you never install PHP on your host.

### Which services should I start for a typical Lumen app?

`nginx mysql workspace` is all a Lumen API requires: web server, database, and a shell. Swap `mysql` for `postgres` if you prefer, or drop the database entirely for a stateless service. Add `redis` (for cache/queues), `php-worker` (background jobs) or `mailpit` (local email) only when a feature needs them, each has its own section above with the exact wiring.

### Can I run multiple Lumen services on different PHP versions?

Yes. Give each its own Laradock with a unique `COMPOSE_PROJECT_NAME` and `DATA_PATH_HOST`, set a different `PHP_VERSION` in each, and they run independently on the same machine.

### Does this work the same on macOS, Windows and Linux?

Yes. Laradock runs anywhere Docker runs. On macOS/Windows, file-sync speed depends on Docker Desktop (VirtioFS helps a lot for `vendor/`-heavy apps); it is a Docker Desktop trait, not specific to Laradock.

### Is this the same Docker setup I would use in production?

The containers are production-style (real NGINX + PHP-FPM), so it is far closer to production than the built-in PHP development server. See [Prepare Laradock for Production](https://laradock.io/docs/production#prepare-laradock-for-production) for the hardening steps.

---

Comparing environments? See the full **[Laradock vs Others](https://laradock.io/docs/laradock-alternatives)** breakdown. Ready to start? **[Getting Started](https://laradock.io/docs/getting-started)** takes about five minutes.
