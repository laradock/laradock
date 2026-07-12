# Run Firefly III on Docker

Source: https://laradock.io/docs/firefly-iii-on-docker

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

## What is Firefly III?

[Firefly III](https://www.firefly-iii.org) is a free, open-source personal finance manager: it tracks income and expenses, budgets, bills and multi-currency accounts, and gives you reports and charts over all of it. Under the hood it is a Laravel application, so like any Laravel app it needs a web server, a PHP runtime, and a database (MySQL/MariaDB, PostgreSQL or SQLite); Redis is optional for cache and queues.

## Why run Firefly III in Docker?

Docker packages each of those pieces (NGINX, PHP-FPM, a database) into isolated containers that run the same on every machine. Instead of installing PHP and MySQL onto your laptop, where versions collide between projects and "works on my machine" starts, you run disposable containers that mirror production and vanish cleanly when you delete them. Firefly III also has real PHP version requirements (the latest releases need PHP 8.5), so a container that already ships the right version saves you from upgrading your whole machine's PHP just for one app.

The catch: wiring those containers together yourself (base images, PHP extensions, networking, permissions) is a week of fiddly Docker work. That is exactly what Laradock removes.

## Why Laradock is the best fit for Firefly III

Firefly III has its own official Docker image and docker-compose setup, published and maintained by its author, and for a single, standalone install that is a perfectly good choice. Laradock is still worth considering, and here is why:

- **You are never locked into one ecosystem.** Laradock is framework-agnostic. Run Firefly III today, add a Laravel API, a WordPress site, or any other PHP app beside it tomorrow, all in the same environment with the same commands, instead of juggling a separate compose file per app.
- **Far more flexibility.** 100+ ready services and any PHP version from 5.6 to 8.5, so you are not tied to whatever version the official image happens to ship.
- **Nothing is hidden and you own everything.** No generated files, no magic, no wrapper binary between you and Docker. Every Dockerfile and compose file is right there for you to read and edit.
- **Nothing new to learn.** What you use is plain `docker compose`, knowledge that transfers straight to production and to every other project. Our [CLI](https://laradock.io/docs/cli) is an optional nicety, never a requirement.

For Firefly III, Laradock wires a production-style NGINX + PHP-FPM stack, MySQL/MariaDB or PostgreSQL, and a `workspace` container with Composer, Node, npm, git and Artisan already installed, since Firefly III is built and installed like any other Laravel application.

## Run Firefly III on Docker with Laradock

### 1. Add Laradock to your project

```bash
git clone https://github.com/firefly-iii/firefly-iii.git my-firefly-iii
cd my-firefly-iii
git clone https://github.com/laradock/laradock.git
cd laradock
```

### 2. Pick the services Firefly III needs

Firefly III needs exactly two things: a web server and a database. Out of the box it uses the database for cache and runs jobs synchronously, so this is the whole required stack (Redis is an optional upgrade, wired below). The web server pulls in PHP-FPM automatically:

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

Prefer PostgreSQL? Swap the name: `./laradock start nginx postgres workspace` (or `docker compose up -d nginx postgres workspace`). The full catalog is [here](https://laradock.io/docs/Intro#supported-services).

Prefer to be asked? The optional [CLI](https://laradock.io/docs/cli) walks you through the choices: `./laradock setup`, then `./laradock start`. It prints every real command it runs.

### 3. Point Firefly III at the containers

Copy `.env.example` to `.env` inside the Firefly III source and set the database connection to the service names as hostnames:

```env
APP_KEY=
DB_CONNECTION=mysql
DB_HOST=mysql
DB_PORT=3306
DB_DATABASE=default
DB_USERNAME=default
DB_PASSWORD=secret
```

`APP_KEY` must be a random 32-character string (Firefly III's own docs recommend avoiding `=` and `#` in it); generate one and paste it in. The default database, user and password live in Laradock's `mysql/defaults.env`; override any of them by adding the line to Laradock's `.env` (it always wins), and keep the two files in sync.

### 4. Install and run

Enter the `workspace` container, where Composer, Node and Artisan live, and run Firefly III's install steps:

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
composer install --no-dev
php artisan migrate --seed
php artisan firefly-iii:upgrade-database
php artisan firefly-iii:laravel-passport-keys
```

Then open [http://localhost](http://localhost) and register the first user, who becomes the site owner.

## Add Redis for cache and queues (optional)

Firefly III runs fine on the database for cache and processes jobs inline, so Redis is not required to boot. On a heavily-used install it is faster to cache in memory and push slow work (like importing transactions) onto a background queue. Wiring it up is two steps:

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

2. Point Firefly III at it in the app's `.env`:

```env
CACHE_DRIVER=redis
QUEUE_CONNECTION=redis
REDIS_HOST=redis
REDIS_PORT=6379
```

If you set `QUEUE_CONNECTION=redis`, run a worker from the `workspace` container so queued jobs actually process: `php artisan queue:work`. Without those lines Firefly III ignores the Redis container entirely, which is why the required stack above leaves it out.

## Change the PHP version anytime

This is where a native install hurts and Laradock shines. Recent Firefly III releases require PHP 8.5; older releases run on earlier versions. Set whichever your Firefly III version needs in Laradock's `.env` and rebuild:

```env
PHP_VERSION=8.5
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

That means you can pin an older Firefly III release to an older PHP version, or move straight to what the latest release requires, without touching anything installed on your machine.

## Take your install live

When your Firefly III install is ready, the same Laradock stack becomes your deployment. You build one hardened image and ship it to the host of your choice:

```bash
./laradock ship
```

Then pick a target and follow its short guide, a single server, a managed platform, or Kubernetes: **[Deploy to Production](https://laradock.io/docs/production)** lists every provider (Fly.io, Render, Railway, DigitalOcean, AWS, Google Cloud, Azure, Kamal, Kubernetes) with a ready config file for each. There is no per-provider magic to learn; a Docker image runs the same everywhere.

## Frequently Asked Questions

### Do I need to install PHP, Composer or a database engine to run Firefly III with Laradock?

No. Everything lives inside the containers. Composer, Node, npm, git and PHP are all in the `workspace` container; you never install them on your host.

### Should I use the official Firefly III Docker image instead?

If you only ever plan to run Firefly III alone, the official image is a fine, well-maintained choice. Reach for Laradock when you want Firefly III alongside other PHP apps in one consistent, fully inspectable environment, or when you need a PHP version the official image does not ship.

### Which services should I start for Firefly III?

`nginx mysql workspace` is all Firefly III requires: web server, database, and a shell. Swap `mysql` for `postgres` if you prefer PostgreSQL. Add `redis` only if you wire it up for [cache and queues](#add-redis-for-cache-and-queues-optional); without that config Firefly III does not touch it.

### Does this work the same on macOS, Windows and Linux?

Yes. Laradock runs anywhere Docker runs. On macOS/Windows, file-sync speed depends on Docker Desktop (VirtioFS helps a lot for `vendor/`-heavy apps); it is a Docker Desktop trait, not specific to Laradock.

### Is this the same Docker setup I would use in production?

The containers are production-style (real NGINX + PHP-FPM), so it is far closer to production than a native install. See [Prepare Laradock for Production](https://laradock.io/docs/production#prepare-laradock-for-production) for the hardening steps.

---

Comparing environments? See the full **[Laradock vs Others](https://laradock.io/docs/laradock-alternatives)** breakdown. Ready to start? **[Getting Started](https://laradock.io/docs/getting-started)** takes about five minutes.
