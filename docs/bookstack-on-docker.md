# Run BookStack on Docker

Source: https://laradock.io/docs/bookstack-on-docker

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

## What is BookStack?

[BookStack](https://www.bookstackapp.com) is an open source platform for organizing documentation into a shelf, book, chapter, page hierarchy, popular as a self-hosted alternative to wiki and knowledge-base tools. It is built on the Laravel framework, so a BookStack instance is a PHP application backed by a MySQL or MariaDB database, served through a web server, with Artisan handling migrations and setup tasks just like any other Laravel app. Its search runs on the database itself, so there is no separate search engine to install, and it can optionally use Redis for cache, sessions and background queues.

## Why run BookStack in Docker?

Docker packages each of those pieces (NGINX, PHP-FPM, MySQL) into isolated containers that run the same on every machine. Instead of installing PHP and MySQL onto your laptop, where versions collide between projects and "works on my machine" starts, you run disposable containers that mirror production and vanish cleanly when you delete them. One BookStack instance can run on an older PHP version while another project runs the latest PHP, on the same computer, with nothing installed globally.

The catch: wiring those containers together yourself (base images, PHP extensions, networking, permissions) is a week of fiddly Docker work. That is exactly what Laradock removes.

## Why Laradock is the best fit for BookStack

BookStack has no official Docker image of its own beyond a few community-maintained ones, so a ready-made, no-lock-in environment matters even more. Here is why Laradock is the best fit:

- **You are never locked into one ecosystem.** Laradock is framework-agnostic. Run your BookStack instance today, add a WordPress marketing site, a plain Laravel API, or any other PHP project beside it tomorrow, all in the same environment with the same commands.
- **Far more flexibility.** 100+ ready services and any PHP version from 5.6 to 8.5, versus a single-purpose image with a narrow set of tags.
- **Nothing is hidden and you own everything.** No generated files, no magic, no wrapper binary between you and Docker. Every Dockerfile and compose file is right there for you to read and edit.
- **Nothing new to learn.** What you use is plain `docker compose`, knowledge that transfers straight to production and to every other Laravel-based project. Our [CLI](https://laradock.io/docs/cli) is an optional nicety, never a requirement.

Concretely, for BookStack it gives you a production-style NGINX + PHP-FPM stack, MySQL/MariaDB ready to connect, a `workspace` container with Composer, git and Artisan already installed, and Redis, a MailHog catcher and a queue worker each one command away when you want them.

## Run BookStack on Docker with Laradock

### 1. Add Laradock to your project

```bash
cd my-bookstack-instance
git clone https://github.com/laradock/laradock.git
cd laradock
```

(No BookStack codebase yet? Clone Laradock first, then pull one down from the workspace container in the next steps.)

### 2. Pick the services your instance needs

BookStack needs exactly two things: a **web server** and a **database**. The web server pulls in PHP-FPM automatically, and search runs on the database, so this is the whole required stack:

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

Prefer MariaDB instead? Swap the name: `./laradock start nginx mariadb workspace` (or `docker compose up -d nginx mariadb workspace`). The full catalog is [here](https://laradock.io/docs/Intro#supported-services).

Prefer to be asked? The optional [CLI](https://laradock.io/docs/cli) walks you through the choices: `./laradock setup`, then `./laradock start`. It prints every real command it runs.

> **Do I need Redis?** Not to get running. BookStack defaults to file cache, file sessions and a synchronous queue, so a fresh instance runs perfectly on `nginx mysql workspace`. Redis only helps once you switch those drivers over to it. See [Add Redis](#add-redis-for-cache-sessions-and-queues-optional) below when you want it.

### 3. Point BookStack at the containers

In BookStack's `.env`, use the service names as hostnames:

```env
APP_URL=http://localhost
DB_HOST=mysql
DB_DATABASE=default
DB_USERNAME=default
DB_PASSWORD=secret
```

The default database, user and password live in Laradock's `mysql/defaults.env`; override any of them by adding the line to Laradock's `.env` (it always wins). `APP_URL` matters in BookStack: every link it generates is built from that value.

### 4. Install and run your instance

Enter the `workspace` container, where Composer, git and Artisan live, place the BookStack codebase, then run its setup:

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

Then, inside the container:

```bash
git clone https://github.com/BookStackApp/BookStack.git --branch release --single-branch .   # only if you have no codebase yet
composer install --no-dev
cp .env.example .env
php artisan key:generate
php artisan migrate
```

The `release` branch ships with its front-end assets pre-built, so you do not need Node for a standard install (see [Build the front-end assets](#build-the-front-end-assets-development-branch) if you work from `development` instead).

Then open [http://localhost](http://localhost). BookStack seeds a default admin login of `admin@admin.com` / `password`. Sign in and change it immediately, or skip the default and create your own admin from the workspace:

```bash
php artisan bookstack:create-admin --email you@example.com --name "You" --password "a-strong-password"
```

## Add Redis for cache, sessions and queues (optional)

Redis is not required, but on a busier instance it takes cache and session storage off the database and lets background jobs run out of process. Wiring it up is two steps.

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

2. Point BookStack at it in its `.env`. BookStack uses a single `REDIS_SERVERS` line in `HOST:PORT:DATABASE` form, not the usual `REDIS_HOST`:

```env
CACHE_DRIVER=redis
SESSION_DRIVER=redis
REDIS_SERVERS=redis:6379:0
```

That switches cache and sessions to Redis. To also move background jobs onto it, set `QUEUE_CONNECTION=redis` and run a worker, covered next.

## Run a queue worker for async email (optional)

By default BookStack's `QUEUE_CONNECTION` is `sync`, so email and other jobs run inline during the web request and no worker is needed. On a real instance you usually want them off the request path: set the connection to `database` (no extra service) or `redis`, then run a worker.

1. In BookStack's `.env`:

```env
QUEUE_CONNECTION=database
```

Use `redis` here instead if you enabled Redis above. `database` needs no extra container; it queues jobs into a table.

2. Run the worker from the `workspace` container:

```bash
php artisan queue:work
```

For a supervised worker that restarts on its own, Laradock ships a dedicated `php-worker` container (Supervisor-managed), and `laravel-horizon` if you run the Redis queue and want its dashboard. Start either with `./laradock start php-worker`. BookStack has no required cron scheduler; its background work flows through this queue, not a `schedule:run` cron.

## Send email through MailHog (optional)

BookStack sends invitations, notifications and password resets by email. Laradock's `mailhog` container catches every outgoing message in a web inbox so you can read them without a real SMTP account.

1. Start MailHog:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI" default>

```bash
./laradock start mailhog
```

</TabItem>
<TabItem value="compose" label="Docker Compose">

```bash
docker compose up -d mailhog
```

</TabItem>
</Tabs>

2. Point BookStack's mail at the container in its `.env`:

```env
MAIL_DRIVER=smtp
MAIL_HOST=mailhog
MAIL_PORT=1025
MAIL_ENCRYPTION=null
MAIL_USERNAME=null
MAIL_PASSWORD=null
```

Open [http://localhost:8025](http://localhost:8025) to read anything BookStack sends. Swap in your real SMTP host, port and credentials when you go live.

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

Current BookStack releases need PHP 8.2 or newer; Laradock covers anything from PHP 5.6 to 8.5, so the same tool runs an older BookStack instance you have not upgraded yet and a brand-new one side by side, each isolated, none of it installed on your machine.

## Rebuild the search index

BookStack's search is a table it maintains inside your database, so there is no Elasticsearch or OpenSearch to run. After a bulk import, a restored database, or if results ever look stale, rebuild the index from the `workspace` container:

```bash
php artisan bookstack:regenerate-search
```

That is the whole search story: no extra container, no config, just this one command when the index needs a refresh.

## Admin and maintenance commands

BookStack ships a set of Artisan commands you run from inside the `workspace` container. The common ones:

```bash
php artisan bookstack:create-admin            # create an admin user (add --email, --name, --password to skip prompts)
php artisan bookstack:reset-mfa               # clear a user's multi-factor methods if they are locked out
php artisan bookstack:update-url OLD NEW      # rewrite stored links after changing domain, e.g. http://localhost https://docs.example.com
php artisan bookstack:regenerate-permissions  # rebuild access control after a bulk change
php artisan bookstack:regenerate-references   # rebuild cross-item links
php artisan bookstack:cleanup-images --force  # delete images no longer referenced by any page
```

Enter the container first with `./laradock workspace` (or `docker compose exec workspace bash`), then run any of these.

## Build the front-end assets (development branch)

If you cloned the `release` branch above, the CSS and JS are already built and you can skip this. If you work from the `development` branch instead, build the assets once (and after front-end changes) from the `workspace` container, which has Node and npm installed:

```bash
npm ci
npm run build
```

## Import an existing BookStack database

Moving an instance onto Laradock? Copy its SQL dump into the Laradock folder (so the `workspace` container can see it), then load it into the `mysql` container:

```bash
./laradock workspace
mysql -h mysql -u default -p default < /var/www/backup.sql
```

The password is `secret` unless you changed it. After importing, fix any hard-coded links to the old address and rebuild the search index:

```bash
php artisan bookstack:update-url https://old-host.example https://localhost
php artisan bookstack:regenerate-search
```

Uploaded files and images live under BookStack's `storage/` and `public/uploads/` directories, so copy those across too if the dump does not include them.

## Take your instance live

When your BookStack instance is ready, the same Laradock stack becomes your deployment. You build one hardened image of your app and ship it to the host of your choice:

```bash
./laradock ship
```

Then pick a target and follow its short guide, a single server, a managed platform, or Kubernetes: **[Deploy to Production](https://laradock.io/docs/production)** lists every provider (Fly.io, Render, Railway, DigitalOcean, AWS, Google Cloud, Azure, Kamal, Kubernetes) with a ready config file for each. There is no per-provider magic to learn; a Docker image runs the same everywhere.

## Frequently Asked Questions

### Do I need to install PHP or Composer to run BookStack with Laradock?

No. Everything lives inside the containers. Composer, git, Node and Artisan are all in the `workspace` container; you never install PHP on your host.

### Which services should I start for a typical BookStack instance?

`nginx mysql workspace` covers it: web server, database, and a shell. Swap `mysql` for `mariadb` if you prefer. BookStack's search runs on the database, so there is no separate search engine to add. Bring in `redis`, `mailhog` or `php-worker` only when you want Redis caching, an email inbox, or an out-of-process queue, each covered in its own section above.

### Does BookStack need Redis, a search engine, or a cron job?

No to all three by default. It ships with file cache and sessions, a synchronous queue, and database-backed search, so a fresh instance runs on just `nginx mysql workspace`. Redis and a queue worker are optional upgrades, and BookStack has no required scheduled/cron task.

### Can I run multiple BookStack instances on different PHP versions?

Yes. Give each its own Laradock with a unique `COMPOSE_PROJECT_NAME` and `DATA_PATH_HOST`, set a different `PHP_VERSION` in each, and they run independently on the same machine.

### Does this work the same on macOS, Windows and Linux?

Yes. Laradock runs anywhere Docker runs. On macOS/Windows, file-sync speed depends on Docker Desktop (VirtioFS helps a lot for `vendor/`-heavy apps); it is a Docker Desktop trait, not specific to Laradock.

### Is this the same Docker setup I would use in production?

The containers are production-style (real NGINX + PHP-FPM), so it is far closer to production than a native install. See [Prepare Laradock for Production](https://laradock.io/docs/production#prepare-laradock-for-production) for the hardening steps.

---

Comparing environments? See the full **[Laradock vs Others](https://laradock.io/docs/laradock-alternatives)** breakdown. Ready to start? **[Getting Started](https://laradock.io/docs/getting-started)** takes about five minutes.
