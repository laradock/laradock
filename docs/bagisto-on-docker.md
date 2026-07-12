# Run Bagisto on Docker

Source: https://laradock.io/docs/bagisto-on-docker

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

## What is Bagisto?

[Bagisto](https://bagisto.com) is an open-source e-commerce platform built on Laravel, giving you a full store with catalog, cart, checkout, multi-channel and multi-currency support, plus the usual Laravel toolchain (Artisan, Eloquent, queues, scheduler) underneath. As a Laravel app it needs only a web server, PHP-FPM, and a MySQL or MariaDB database to boot. Redis (cache, sessions and queues) and Elasticsearch (fast catalog search) are performance add-ons you turn on when a store grows, not requirements to get running.

## Why run Bagisto in Docker?

Docker packages each of those pieces (NGINX, PHP-FPM, MySQL, Redis) into isolated containers that run the same on every machine. Instead of installing PHP and MySQL onto your laptop, where versions collide between projects and "works on my machine" starts, you run disposable containers that mirror production and vanish cleanly when you delete them. One store can run PHP 8.3 while another Laravel project runs a different version, on the same computer, with nothing installed globally.

The catch: wiring those containers together yourself (base images, PHP extensions, networking, permissions) is a week of fiddly Docker work. That is exactly what Laradock removes.

## Why Laradock is the best fit for Bagisto

Bagisto has no official Docker tool of its own; being Laravel-based it can use Laravel's own tooling, but nothing Bagisto-specific is shipped by the project. Here is why Laradock is the best fit:

- **You are never locked into one ecosystem.** Laradock is framework-agnostic. The day you add a plain Laravel API, a WordPress blog, or a PHP script beside your Bagisto store, it runs in the same environment with the same commands.
- **Far more flexibility.** 100+ ready services and any PHP version from 5.6 to 8.5, so a legacy Bagisto install and a current one each get exactly the runtime they need.
- **Nothing is hidden and you own everything.** No generated files, no magic, no wrapper binary between you and Docker. Every Dockerfile and compose file is right there for you to read and edit.
- **Nothing new to learn.** What you use is plain `docker compose`, knowledge that transfers straight to production and to every other Laravel project. Our [CLI](https://laradock.io/docs/cli) is an optional nicety, never a requirement.

Concretely, for Bagisto it gives you a production-style NGINX + PHP-FPM stack, MySQL/MariaDB ready to connect, Redis and Elasticsearch each one command away for when your store needs caching, queues or fast search, plus a `workspace` container with Composer, Node, npm, git and Artisan already installed.

## Run Bagisto on Docker with Laradock

### 1. Add Laradock to your project

```bash
cd my-bagisto-store
git clone https://github.com/laradock/laradock.git
cd laradock
```

(No Bagisto app yet? Clone Laradock first, then create one from the `workspace` container in the next steps.)

### 2. Pick the services your store needs

Bagisto needs exactly two things to boot: a **web server** and a **database**. The web server pulls in PHP-FPM automatically, so this is the whole required stack:

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

Prefer MariaDB over MySQL? Swap the name: `./laradock start nginx mariadb workspace` (or `docker compose up -d nginx mariadb workspace`). The full catalog is [here](https://laradock.io/docs/Intro#supported-services).

Prefer to be asked? The optional [CLI](https://laradock.io/docs/cli) walks you through the choices: `./laradock setup`, then `./laradock start`. It prints every real command it runs.

> **Do I need Redis or Elasticsearch to start?** No. A fresh Bagisto store runs perfectly on `nginx mysql workspace` using file cache and Laravel's default queue. Redis and Elasticsearch are optional speed-ups you wire in later. See [Add Redis](#add-redis-for-cache-sessions-and-queues-optional) and [Add Elasticsearch](#add-elasticsearch-for-catalog-search-optional) below when your store actually needs them.

### 3. Point Bagisto at the containers

In your app's `.env`, use the service names as hostnames, same as any Laravel app:

```env
APP_URL=http://localhost

DB_HOST=mysql
DB_PORT=3306
DB_DATABASE=default
DB_USERNAME=default
DB_PASSWORD=secret
```

The default database, user and password live in `mysql/defaults.env`; override any of them by adding the line to Laradock's `.env` (it always wins).

### 4. Install and run your store

Enter the `workspace` container, where Artisan, Composer, Node and npm live:

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

Then, inside the container, scaffold the project and run Bagisto's own installer:

```bash
composer create-project bagisto/bagisto .
php artisan bagisto:install
php artisan storage:link
```

`bagisto:install` reads your `.env`, runs the migrations and seeders, and walks you through creating the admin account interactively. `storage:link` exposes uploaded product images. Then open [http://localhost](http://localhost) for the storefront. That is a full Bagisto store running on Docker.

### First admin login

The back office lives at [http://localhost/admin](http://localhost/admin). If you accepted the defaults during `bagisto:install`, sign in with:

```text
Email:    admin@example.com
Password: admin123
```

Change that password immediately from **Settings > Users** once you are in. If you skipped the interactive prompts, you can (re)seed an admin with `php artisan bagisto:install` again on a fresh database.

## Add Redis for cache, sessions and queues (optional)

Redis is not required, but on a real store it holds the cache, sessions and queue in memory and takes that load off MySQL. Wiring it up is two steps.

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

2. Point Bagisto at it in your app's `.env`, then clear the config cache:

```env
REDIS_HOST=redis
REDIS_PORT=6379

CACHE_STORE=redis
SESSION_DRIVER=redis
QUEUE_CONNECTION=redis
```

```bash
php artisan config:clear
```

Until you set those drivers, the `redis` container just sits idle, which is why the required stack above leaves it out.

## Run background queues and the product indexer (worker)

Bagisto dispatches its price, inventory and search indexing as queued jobs. As soon as `QUEUE_CONNECTION` is anything other than `sync` (for example `redis` or `database`), those jobs will not run until a worker is processing the queue, and new or imported products will not appear until they do.

The quickest way is to run a worker in a second `workspace` shell:

```bash
php artisan queue:work --queue=default
```

For a worker that stays up on its own (and restarts with your stack), start Laradock's dedicated `php-worker` container instead, which runs the queue via Supervisor:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI" default>

```bash
./laradock start php-worker
```

</TabItem>
<TabItem value="compose" label="Docker Compose">

```bash
docker compose up -d php-worker
```

</TabItem>
</Tabs>

Adjust the commands it runs in `php-worker/supervisord.d/`. Prefer Horizon for a dashboard and metrics? Start `laravel-horizon` the same way and run `php artisan horizon` against your Redis connection.

## Schedule the indexers with cron

Bagisto registers scheduled commands (the price indexer, catalog rules and more run daily) via Laravel's scheduler. In Docker the simplest, crontab-free way to run them is the scheduler's own long-running process, in a `workspace` shell:

```bash
php artisan schedule:work
```

Leave that running and Laravel fires each due command on time. To rebuild every index by hand at any point:

```bash
php artisan indexer:index --mode=full
```

## Add Elasticsearch for catalog search (optional)

By default Bagisto searches the catalog through MySQL, which is fine for a small store. For fast full-text search across a large catalog, point it at Elasticsearch.

1. Start the Elasticsearch container:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI" default>

```bash
./laradock start elasticsearch
```

</TabItem>
<TabItem value="compose" label="Docker Compose">

```bash
docker compose up -d elasticsearch
```

</TabItem>
</Tabs>

2. Point Bagisto at it in your app's `.env` (leave user and pass empty for local dev):

```env
ELASTICSEARCH_HOST=http://elasticsearch:9200
ELASTICSEARCH_USER=
ELASTICSEARCH_PASS=
```

3. In the admin panel, open **Configure** and switch the store's search engine to **Elasticsearch**, then index your existing catalog from the `workspace`:

```bash
php artisan config:clear
php artisan indexer:index --mode=full
```

Make sure a [queue worker](#run-background-queues-and-the-product-indexer-worker) is running, because Elasticsearch indexing is dispatched as queued jobs. Without it, products will not make it into the index.

## Catch outgoing mail (optional)

Bagisto sends order confirmations, account emails and admin notifications. In development you do not want those hitting real inboxes, so route them to a mail catcher that shows every message in a web UI.

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

2. Point Bagisto's mailer at it in your app's `.env`:

```env
MAIL_MAILER=smtp
MAIL_HOST=mailhog
MAIL_PORT=1025
MAIL_USERNAME=null
MAIL_PASSWORD=null
MAIL_ENCRYPTION=null
```

Every email your store sends now lands in the MailHog inbox at [http://localhost:8025](http://localhost:8025) instead of a real recipient.

## Build and customize themes (asset pipeline)

Bagisto ships its storefront and admin assets already compiled, so a plain install needs no build step. When you start customizing themes, the `workspace` container already has Node and npm, so compile assets with Bagisto's Vite pipeline from inside it:

```bash
npm install
npm run dev      # watch and rebuild while you work
npm run build    # one optimized production build
```

Nothing is installed on your host; the toolchain lives in the container.

## Multiple stores, locales and currencies

Bagisto supports multiple channels (independent storefronts), locales and currencies out of the box, all from one install and one database, managed under **Settings > Channels**, **Settings > Locales** and **Settings > Currencies** in the admin. Because each channel is served by the same containers, you do not start anything extra: point additional domains at the same NGINX service and set each channel's base URL in the admin. For truly separate stores with their own database and PHP version, run a second Laradock with its own `COMPOSE_PROJECT_NAME` and `DATA_PATH_HOST` (see the FAQ below).

## Import an existing Bagisto database

Moving a store from another machine or from production? Skip `bagisto:install` and load your dump instead. Copy the SQL file into the Laradock folder so the container can see it, then from the `workspace`:

```bash
mysql -h mysql -u default -psecret default < backup.sql
```

Put your app files in place (or `composer install` in the project), match the `.env` above, then rebuild the caches and indexes:

```bash
php artisan config:clear
php artisan storage:link
php artisan indexer:index --mode=full
```

Your existing catalog, orders and customers come up on Docker exactly as they were.

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

Current Bagisto releases run on PHP 8.3 or 8.4 (8.5 is not supported yet), so keep `PHP_VERSION` at 8.3 or 8.4 for a current install. The same tool can still run an older Laravel app on a lower PHP version in a separate Laradock instance, each isolated, none of it installed on your machine.

## Take your store live

When your store is ready, the same Laradock stack becomes your deployment. You build one hardened image of your app and ship it to the host of your choice:

```bash
./laradock ship
```

Then pick a target and follow its short guide, a single server, a managed platform, or Kubernetes: **[Deploy to Production](https://laradock.io/docs/production)** lists every provider (Fly.io, Render, Railway, DigitalOcean, AWS, Google Cloud, Azure, Kamal, Kubernetes) with a ready config file for each. There is no per-provider magic to learn; a Docker image runs the same everywhere.

## Frequently Asked Questions

### Do I need to install PHP or Composer to run Bagisto with Laradock?

No. Everything lives inside the containers. Composer, Node, npm, git and Artisan are all in the `workspace` container; you never install PHP on your host.

### Which services should I start for a typical Bagisto store?

`nginx mysql workspace` is all Bagisto requires to boot: web server, database, and a shell. Swap `mysql` for `mariadb` if you prefer. Add `redis` when you want cache, sessions and queues in memory, `php-worker` to process queued indexing jobs, and `elasticsearch` for fast catalog search, each wired in its own section above.

### Can I run multiple Bagisto stores on different PHP versions?

Yes. Give each its own Laradock with a unique `COMPOSE_PROJECT_NAME` and `DATA_PATH_HOST`, set a different `PHP_VERSION` in each, and they run independently on the same machine.

### Does this work the same on macOS, Windows and Linux?

Yes. Laradock runs anywhere Docker runs. On macOS/Windows, file-sync speed depends on Docker Desktop (VirtioFS helps a lot for `vendor/`-heavy apps); it is a Docker Desktop trait, not specific to Laradock.

### Is this the same Docker setup I would use in production?

The containers are production-style (real NGINX + PHP-FPM), so it is far closer to production than a native install. See [Prepare Laradock for Production](https://laradock.io/docs/production#prepare-laradock-for-production) for the hardening steps.

---

Comparing environments? See the full **[Laradock vs Others](https://laradock.io/docs/laradock-alternatives)** breakdown. Ready to start? **[Getting Started](https://laradock.io/docs/getting-started)** takes about five minutes.
