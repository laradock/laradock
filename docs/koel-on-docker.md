# Run Koel on Docker

Source: https://laradock.io/docs/koel-on-docker

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

## What is Koel?

[Koel](https://koel.dev) is a self-hosted personal music streaming server: point it at a folder of audio files and it scans, catalogs and streams your library back through a Vue-based web player. It is a Laravel application under the hood, so a real Koel install needs a web server, a PHP runtime and a database (MySQL, PostgreSQL, MariaDB or SQLite), plus a persistent storage path for the actual music files, kept separate from the database.

## Why run Koel in Docker?

Docker packages the web server, PHP and the database into isolated containers that run the same on every machine. Instead of installing PHP and a database engine onto your laptop, where versions collide between projects and "works on my machine" starts, you run disposable containers that mirror production and vanish cleanly when you delete them. One project can run PHP 8.4 while another runs 8.2, on the same computer, with nothing installed globally.

The catch: wiring those containers together yourself (base images, PHP extensions, networking, permissions, and a volume for your media library) is a week of fiddly Docker work. That is exactly what Laradock removes.

## Why Laradock is the best fit for Koel

Koel ships its own official Docker Compose setup (maintained by the Koel project itself, under `koel/docker`), so, like Laravel, it does not strictly need Laradock. It is still the best fit, and here is why:

- **You are never locked into one ecosystem.** Laradock is framework-agnostic. The day you add a Laravel API, a WordPress blog, or a plain PHP script beside your Koel instance, it runs in the same environment with the same commands. A single-purpose compose file cannot do that.
- **Far more flexibility.** 100+ ready services and any PHP version from 5.6 to 8.5, versus the one PHP version baked into Koel's own image.
- **Nothing is hidden and you own everything.** No generated files, no magic, no wrapper binary between you and Docker. Every Dockerfile and compose file is right there for you to read and edit.
- **Nothing new to learn.** What you use is plain `docker compose`, knowledge that transfers straight to production and to every other project. Our [CLI](https://laradock.io/docs/cli) is an optional nicety, never a requirement.

For Koel specifically, Laradock wires a production-style NGINX + PHP-FPM stack, MySQL/PostgreSQL, and a `workspace` container with Composer, Node, npm, git and Artisan already installed; you mount your music folder as a volume and point `MEDIA_PATH` at it.

## Run Koel on Docker with Laradock

### 1. Add Laradock to your project

```bash
cd my-koel-server
git clone https://github.com/laradock/laradock.git
cd laradock
```

(No Koel files yet? Clone Laradock first, then clone Koel from [its GitHub repo](https://github.com/koel/koel) into your project directory.)

### 2. Pick the services your library needs

Koel needs a web server, PHP and a database. Start exactly those (the web server pulls in PHP-FPM automatically):

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

### 3. Point Koel at the containers and your music

In your app's `.env`, use the service names as hostnames, and point `MEDIA_PATH` at a mounted volume holding your audio files:

```env
DB_CONNECTION=mysql
DB_HOST=mysql
DB_DATABASE=default
DB_USERNAME=default
DB_PASSWORD=secret
MEDIA_PATH=/music
```

The default database, user and password live in `mysql/defaults.env`; override any of them by adding the line to Laradock's `.env` (it always wins). Mount your actual music folder into the `php-fpm` and `workspace` containers at the same path so both the scanner and the player can reach it.

### 4. Install and run your library

Enter the shell where Composer, npm and Artisan live:

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

Then run Koel's own setup wizard inside that shell:

```bash
composer install
php artisan koel:init
```

The wizard confirms your `.env`, migrates the database, sets the media path, and creates the first admin account. Then open [http://localhost](http://localhost). That is a full Koel server running on Docker.

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

Current Koel releases require PHP 8.2 or newer, and anything up to 8.5 works, so an older Koel install and a freshly upgraded one run side by side, each isolated, none of it installed on your machine.

## Add Redis for caching and queues (optional)

Koel is a Laravel app, so Redis needs no plugin or module, just switch the drivers on. On a larger library it caches metadata and moves the media scan into a background queue so the web player stays responsive. Two steps:

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

2. Point Koel at it in your app's `.env` (the service name is the host):

```env
REDIS_HOST=redis
CACHE_DRIVER=redis
QUEUE_CONNECTION=redis
```

To actually run queued scans, start a worker from the `workspace` container: `php artisan queue:work`. Without these lines Koel runs fine synchronously, which is why the required stack above leaves Redis out.

## Take your server live

When your Koel server is ready, the same Laradock stack becomes your deployment. You build one hardened image and ship it to the host of your choice:

```bash
./laradock ship
```

Then pick a target and follow its short guide: **[Deploy to Production](https://laradock.io/docs/production)** lists every provider (Fly.io, Render, Railway, DigitalOcean, AWS, Google Cloud, Azure, Kamal, Kubernetes) with a ready config file for each. There is no per-provider magic to learn; a Docker image runs the same everywhere.

## Frequently Asked Questions

### Do I need to install PHP, Composer or ffmpeg to run Koel with Laradock?

No. PHP, Composer, Node and npm all live inside the `workspace` container. If your library needs transcoding, you still need to make an `ffmpeg` binary available to the container and point `FFMPEG_PATH` at it.

### Which services should I start for a typical Koel server?

`nginx mysql workspace` covers most installs: web server, database, and a shell for Artisan. Swap `mysql` for `postgres` if you prefer.

### Where do my actual music files live?

Outside the database, on a volume you mount into the containers and point `MEDIA_PATH` at. Keep that path stable across restarts and rebuilds so Koel doesn't lose track of your library.

### Can I run multiple Koel instances on different PHP versions?

Yes. Give each its own Laradock with a unique `COMPOSE_PROJECT_NAME` and `DATA_PATH_HOST`, set a different `PHP_VERSION` in each, and they run independently on the same machine.

### Is this the same Docker setup I would use in production?

The containers are production-style (real NGINX + PHP-FPM), so it is far closer to production than a native install. See [Prepare Laradock for Production](https://laradock.io/docs/production#prepare-laradock-for-production) for the hardening steps.

---

Comparing environments? See the full **[Laradock vs Others](https://laradock.io/docs/laradock-alternatives)** breakdown. Ready to start? **[Getting Started](https://laradock.io/docs/getting-started)** takes about five minutes.
