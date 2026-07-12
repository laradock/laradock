# Run Invoice Ninja on Docker

Source: https://laradock.io/docs/invoice-ninja-on-docker

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

## What is Invoice Ninja?

[Invoice Ninja](https://invoiceninja.com) is a source-available invoicing, quoting and payments platform built for freelancers and small businesses, on top of the Laravel framework. It is known for free self-hosting, client and vendor portals, recurring invoices, time tracking and a large list of payment gateway integrations. Being a Laravel app, it genuinely needs a web server, a PHP runtime with a fairly specific extension list, and a MySQL or PostgreSQL database.

## Why run Invoice Ninja in Docker?

Docker packages each of those pieces (NGINX, PHP-FPM, MySQL) into isolated containers that run the same on every machine. Instead of installing PHP and MySQL onto your laptop, where versions collide between projects and "works on my machine" starts, you run disposable containers that mirror production and vanish cleanly when you delete them. Invoice Ninja's PHP and extension requirements have shifted from release to release; a container lets you pin exactly the version a given release needs without touching anything else installed on your machine.

The catch: wiring those containers together yourself (base images, PHP extensions, networking, permissions) is a week of fiddly Docker work. That is exactly what Laradock removes.

## Why Laradock is the best fit for Invoice Ninja

Invoice Ninja publishes its own official Docker images and Dockerfiles ([invoiceninja/dockerfiles](https://github.com/invoiceninja/dockerfiles), also on [Docker Hub](https://hub.docker.com/r/invoiceninja/invoiceninja)), so, like Laravel, it does not strictly need Laradock. It is still the best fit if Invoice Ninja is not the only thing you run, and here is why:

- **You are never locked into one ecosystem.** Laradock is framework-agnostic. The day you add a Laravel API, a WordPress marketing site, or another PHP app beside Invoice Ninja, it runs in the same environment with the same commands. A single-purpose image cannot do that.
- **Far more flexibility.** 100+ ready services and any PHP version from 5.6 to 8.5, versus the one image and PHP version the official build ships.
- **Nothing is hidden and you own everything.** No generated files, no magic, no wrapper binary between you and Docker. Every Dockerfile and compose file is right there for you to read and edit.
- **Nothing new to learn.** What you use is plain `docker compose`, knowledge that transfers straight to production and to every other project. Our [CLI](https://laradock.io/docs/cli) is an optional nicety, never a requirement.

For Invoice Ninja specifically, Laradock wires a production-style NGINX + PHP-FPM stack, MySQL or PostgreSQL, and a `workspace` container with Composer, git and Artisan already installed, since Invoice Ninja is a Laravel app under the hood.

## Run Invoice Ninja on Docker with Laradock

### 1. Add Laradock to your project

```bash
cd my-invoiceninja-app
git clone https://github.com/laradock/laradock.git
cd laradock
```

(No Invoice Ninja source yet? Clone Laradock first, then pull the Invoice Ninja source into your project directory from the workspace container in the next steps.)

### 2. Pick the services Invoice Ninja needs

Invoice Ninja needs a web server and a database. The web server pulls in PHP-FPM automatically:

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

Prefer PostgreSQL instead? Swap the name: `./laradock start nginx postgres workspace` (or `docker compose up -d nginx postgres workspace`). The full catalog is [here](https://laradock.io/docs/Intro#supported-services).

Prefer to be asked? The optional [CLI](https://laradock.io/docs/cli) walks you through the choices: `./laradock setup`, then `./laradock start`. It prints every real command it runs.

### 3. Point Invoice Ninja at the containers

In your app's `.env`, use the service names as hostnames:

```env
DB_CONNECTION=mysql
DB_HOST=mysql
DB_DATABASE=default
DB_USERNAME=default
DB_PASSWORD=secret
```

The default database, user and password live in `mysql/defaults.env`; override any of them by adding the line to Laradock's `.env` (it always wins).

### 4. Install and run your app

Enter the shell where Composer, git and Artisan live, and run the usual Laravel install steps:

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
composer install
php artisan key:generate
php artisan migrate
```

Then open [http://localhost](http://localhost) and complete the web-based `/setup` wizard to create the first account, or run `php artisan migrate:fresh --seed` beforehand if you want sample data instead.

## Add a queue worker (optional)

Invoice Ninja pushes email, PDF generation and recurring-invoice jobs onto a Laravel queue. A fresh install runs fine on the synchronous default, but for anything realistic you want a background worker so those jobs do not block web requests. Two steps:

1. Point the queue at the database (or Redis, see below) in your app's `.env`:

```env
QUEUE_CONNECTION=database
```

2. Start the dedicated worker container, which runs `php artisan queue:work` for you:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

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

Without a worker running, queued emails and PDFs simply wait, which is why the required stack above leaves it out.

## Add Redis (optional)

Being a Laravel app, Invoice Ninja can use Redis as its cache and queue backend with no extra plugin, just config. Start the container and point the app at it:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

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

Then in your app's `.env`:

```env
CACHE_DRIVER=redis
QUEUE_CONNECTION=redis
REDIS_HOST=redis
```

## Change the PHP version anytime

This is where a native install hurts and Laradock shines. Set the version in Laradock's `.env` and rebuild:

```env
PHP_VERSION=8.2
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

Current Invoice Ninja releases require PHP 8.2 with extensions such as bcmath, gd, imagick, mbstring and zip already enabled in Laradock's PHP-FPM image; older self-hosted releases pinned to PHP 7.4 or 8.1 still run the same way, each isolated, none of it installed on your machine.

## Take your app live

When your Invoice Ninja install is ready, the same Laradock stack becomes your deployment. You build one hardened image of your app and ship it to the host of your choice:

```bash
./laradock ship
```

Then pick a target and follow its short guide, a single server, a managed platform, or Kubernetes: **[Deploy to Production](https://laradock.io/docs/production)** lists every provider (Fly.io, Render, Railway, DigitalOcean, AWS, Google Cloud, Azure, Kamal, Kubernetes) with a ready config file for each. There is no per-provider magic to learn; a Docker image runs the same everywhere.

## Frequently Asked Questions

### Do I need to install PHP, Composer or MySQL to run Invoice Ninja with Laradock?

No. Everything lives inside the containers. Composer, git and Artisan are all in the `workspace` container; you never install PHP on your host.

### Which services should I start for a typical Invoice Ninja install?

`nginx mysql workspace` covers most installs: web server, database, and a shell. Swap `mysql` for `postgres` if you prefer.

### Should I use Laradock or Invoice Ninja's official Docker image?

The official image is fine if Invoice Ninja is the only app on the box. Reach for Laradock when you want the same environment to also run other PHP apps, need a non-default PHP version, or want every Dockerfile visible and editable.

### Can I run multiple Invoice Ninja instances on different PHP versions?

Yes. Give each its own Laradock with a unique `COMPOSE_PROJECT_NAME` and `DATA_PATH_HOST`, set a different `PHP_VERSION` in each, and they run independently on the same machine.

### Does this work the same on macOS, Windows and Linux?

Yes. Laradock runs anywhere Docker runs. On macOS/Windows, file-sync speed depends on Docker Desktop (VirtioFS helps a lot); it is a Docker Desktop trait, not specific to Laradock.

---

Comparing environments? See the full **[Laradock vs Others](https://laradock.io/docs/laradock-alternatives)** breakdown. Ready to start? **[Getting Started](https://laradock.io/docs/getting-started)** takes about five minutes.
