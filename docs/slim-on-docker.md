# Run Slim on Docker

Source: https://laradock.io/docs/slim-on-docker

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

## What is Slim?

[Slim](https://www.slimframework.com) is a PHP micro-framework for building APIs and small web apps: routing, PSR-15 middleware, and a PSR-7 request/response layer, with none of the batteries a full-stack framework bundles. By design Slim ships no ORM, no queue, no scheduler, no mailer, no cache layer, and no CLI console. A Slim app needs only a web server and a PHP runtime to boot; everything else (a database, Redis, a queue, a mailer) is a library you pull in through Composer and wire yourself when the app actually needs it.

## Why run Slim in Docker?

Docker packages each of those pieces (NGINX, PHP-FPM, and whatever database or queue you add) into isolated containers that run the same on every machine. Instead of installing PHP onto your laptop, where versions collide between projects and "works on my machine" starts, you run disposable containers that mirror production and vanish cleanly when you delete them. One project can run PHP 8.3 while another runs 7.4, on the same computer, with nothing installed globally.

The catch: wiring those containers together yourself (base images, PHP extensions, networking, permissions) is a week of fiddly Docker work. That is exactly what Laradock removes.

## Why Laradock is the best fit for Slim

Slim has no official Docker tool or first-party runtime of its own, so a ready-made, no-lock-in environment matters even more. Here is why Laradock is the best fit:

- **You are never locked into one ecosystem.** Laradock is framework-agnostic. Run a Slim API today, add a Laravel app, a WordPress site, or a plain PHP script beside it tomorrow, all in the same environment with the same commands.
- **Far more flexibility.** 100+ ready services and any PHP version from 5.6 to 8.5, so a lightweight Slim API and a heavier full-stack app on the same machine each get exactly the runtime they need.
- **Nothing is hidden and you own everything.** No generated files, no magic, no wrapper binary between you and Docker. Every Dockerfile and compose file is right there for you to read and edit.
- **Nothing new to learn.** What you use is plain `docker compose`, knowledge that transfers straight to production. Our [CLI](https://laradock.io/docs/cli) is an optional nicety, never a requirement.

Concretely, for Slim it gives you a production-style NGINX + PHP-FPM stack, a `workspace` container with Composer, git and Node already installed, and every service Slim might reach for (MySQL, PostgreSQL, Redis, RabbitMQ, a mail catcher, a dedicated worker container) one command away when, and only when, your app calls for it.

## Run Slim on Docker with Laradock

### 1. Add Laradock to your project

```bash
cd my-slim-app
git clone https://github.com/laradock/laradock.git
cd laradock
```

(No Slim app yet? Clone Laradock first, then create one from the workspace container in the next steps.)

### 2. Pick the services your app needs

Slim needs exactly one thing to boot: a **web server** (it pulls in PHP-FPM automatically). A bare Slim API runs on nothing more than this:

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

That is the whole required stack. Slim keeps no database of its own, so nothing else is mandatory. Add a database, cache, queue, or mailer only when your app uses one; each has its own section below with the exact wiring. The full catalog is [here](https://laradock.io/docs/Intro#supported-services).

Prefer to be asked? The optional [CLI](https://laradock.io/docs/cli) walks you through the choices: `./laradock setup`, then `./laradock start`. It prints every real command it runs.

### 3. Point Slim at the containers

A database-free Slim API needs no host configuration at all; NGINX already points at PHP-FPM for you. The one rule to remember for everything you add later: **inside Docker, a service's hostname is its container name.** So a MySQL connection uses `mysql` as the host, Redis uses `redis`, RabbitMQ uses `rabbitmq`. Wherever your app reads config (commonly `.env` or `config/settings.php`), you will use those names, for example:

```env
DB_HOST=mysql
DB_DATABASE=default
DB_USERNAME=default
DB_PASSWORD=secret
```

See [Add a database](#add-a-database-optional) below for the full step.

### 4. Install and run your app

Enter the `workspace` container, where Composer, git and Node live:

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

Once inside, create a new app from the official skeleton (or skip this if you already have one):

```bash
composer create-project slim/slim-skeleton .   # only if you have no Slim app yet
```

Then open [http://localhost](http://localhost). That is a full Slim app running on Docker.

## Add a database (optional)

Slim has no database layer, so nothing is connected until you add one. When your app needs to persist data, start the database and point your PDO connection (or Doctrine/Eloquent config) at it.

1. Start the database alongside the rest. MySQL is the common default; swap in `postgres`, `mariadb`, or another engine if you prefer:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock start mysql
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose up -d mysql
```

</TabItem>
</Tabs>

2. Point your app at it using the service name as the host:

```env
DB_HOST=mysql
DB_DATABASE=default
DB_USERNAME=default
DB_PASSWORD=secret
```

The default database, user and password live in Laradock's `mysql/defaults.env`; override any of them by adding the line to Laradock's `.env` (it always wins). For a Postgres app, start `postgres` instead and set `DB_HOST=postgres`.

## Add Redis caching (optional)

Slim does no caching on its own. If your app builds a PSR-16 or PSR-6 cache (via a library such as `symfony/cache` or `predis/predis`), point it at the Redis container:

1. Start Redis:

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

2. Install a client and point it at the container in your app config:

```bash
composer require predis/predis
```

```env
REDIS_HOST=redis
REDIS_PORT=6379
```

Use the same `redis` host for anything else that speaks Redis (rate limiting, sessions, a lock store). Without a client library and this config the container just sits idle, which is why the required stack above leaves it out.

## Run background jobs and queue workers (optional)

Slim has no queue system built in. The common pattern is to push slow work (sending mail, processing an upload) onto a message queue and consume it in a separate long-running process, so web requests stay fast. Laradock gives you both halves: a broker and a dedicated worker container.

1. Start a broker. RabbitMQ (via `php-amqplib/php-amqplib`) and Redis (via a lightweight queue library) are the usual choices:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock start rabbitmq php-worker
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose up -d rabbitmq php-worker
```

</TabItem>
</Tabs>

2. Connect your app to the broker with the service name as the host:

```env
RABBITMQ_HOST=rabbitmq
RABBITMQ_PORT=5672
```

3. Tell the `php-worker` container to run your consumer. Laradock keeps supervisor programs in `php-worker/supervisord.d/`; copy the example and point it at your own script:

```ini
[program:slim-worker]
process_name=%(program_name)s_%(process_num)02d
command=php /var/www/bin/worker.php
autostart=true
autorestart=true
numprocs=2
user=laradock
redirect_stderr=true
```

Rebuild `php-worker` after editing (`./laradock rebuild php-worker`, or `docker compose build php-worker`). Supervisor keeps your consumers running and restarts them if they die, which is exactly what a queue worker needs.

## Schedule recurring tasks with cron (optional)

Slim has no scheduler. To run something on a schedule (a nightly cleanup, a report), use the cron built into the `workspace` container. Laradock loads its crontab from `workspace/crontab/laradock`; edit that file and point it at your script:

```cron
* * * * * laradock /usr/bin/php /var/www/bin/cron.php >> /dev/null 2>&1
```

Each line is standard cron syntax followed by the `laradock` user and the command. Rebuild the workspace so the new schedule is installed (`./laradock rebuild workspace`, or `docker compose build workspace`). A common trick is one cron entry that runs a single dispatcher script, so you can add new scheduled jobs in PHP without touching the crontab again.

## Catch outgoing mail in development (optional)

If your app sends email (via `symfony/mailer`, PHPMailer, or similar), route it to Mailpit instead of a real SMTP server so nothing leaves your machine and you can read every message in a web inbox.

1. Start the mail catcher:

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

2. Point your mailer at the container (SMTP host `mailpit`, port `1025`, no auth):

```env
MAIL_HOST=mailpit
MAIL_PORT=1025
```

3. Open the Mailpit web inbox at [http://localhost:8125](http://localhost:8125) to read anything your app sends. Prefer the classic MailHog UI? Start `mailhog` instead and use its port.

## Build front-end assets (optional)

If your Slim app serves a UI (Twig templates plus JavaScript or CSS), the `workspace` container already has Node and npm, so there is nothing to install on your host. From inside the workspace:

```bash
npm install
npm run build     # or: npm run dev / npx vite
```

Run these in the same shell you use for Composer. Because Node lives in the container, a project pinned to an old Node version and a modern one never collide on your machine.

## Run console commands and one-off scripts

Slim ships no `artisan`-style console, but any CLI script you write (a migration runner, a data import, `composer` tasks) runs from the `workspace` container, where PHP, Composer and git already live:

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

Once inside, run whatever your project needs, for example `php bin/console.php migrate` or `composer test`. This is also where you import an existing database (next section).

## Import an existing database

Moving a real dataset into your dockerized app is one command. With the database container running (see [Add a database](#add-a-database-optional)), pipe a dump straight in from your host:

```bash
docker compose exec -T mysql mysql -u default -psecret default < dump.sql
```

For PostgreSQL the equivalent is `docker compose exec -T postgres psql -U default default < dump.sql`. The database files persist in Laradock's `DATA_PATH_HOST` volume, so your data survives `docker compose down` and container rebuilds.

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

Slim 4 supports PHP 7.4 and newer, and Laradock covers anything from PHP 5.6 to 8.5, so the same tool runs an older Slim 3 service and a current Slim 4 API side by side, each isolated, none of it installed on your machine.

## Take your app live

When your app is ready, the same Laradock stack becomes your deployment. You build one hardened image of your app and ship it to the host of your choice:

```bash
./laradock ship
```

Then pick a target and follow its short guide, a single server, a managed platform, or Kubernetes: **[Deploy to Production](https://laradock.io/docs/production)** lists every provider (Fly.io, Render, Railway, DigitalOcean, AWS, Google Cloud, Azure, Kamal, Kubernetes) with a ready config file for each. There is no per-provider magic to learn; a Docker image runs the same everywhere.

## Frequently Asked Questions

### Do I need to install PHP or Composer to run Slim with Laradock?

No. Everything lives inside the containers. PHP, Composer, git and Node are all in the `workspace` container; you never install them on your host.

### Which services should I start for a typical Slim app?

`nginx workspace` is all a bare Slim API requires: a web server and a shell. Slim keeps no database of its own, so add `mysql` (or `postgres`) the moment your app persists data, and any other service (`redis` for caching, `rabbitmq` plus `php-worker` for background jobs, `mailpit` for email) only as a feature calls for it. Each has a section above with the exact wiring.

### Can I run multiple Slim apps on different PHP versions?

Yes. Give each its own Laradock with a unique `COMPOSE_PROJECT_NAME` and `DATA_PATH_HOST`, set a different `PHP_VERSION` in each, and they run independently on the same machine.

### Does this work the same on macOS, Windows and Linux?

Yes. Laradock runs anywhere Docker runs. On macOS/Windows, file-sync speed depends on Docker Desktop (VirtioFS helps a lot); it is a Docker Desktop trait, not specific to Laradock.

### Is this the same Docker setup I would use in production?

The containers are production-style (real NGINX + PHP-FPM), so it is far closer to production than the built-in PHP development server. See [Prepare Laradock for Production](https://laradock.io/docs/production#prepare-laradock-for-production) for the hardening steps.

---

Comparing environments? See the full **[Laradock vs Others](https://laradock.io/docs/laradock-alternatives)** breakdown. Ready to start? **[Getting Started](https://laradock.io/docs/getting-started)** takes about five minutes.
