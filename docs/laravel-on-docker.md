# Run Laravel on Docker

Source: https://laradock.io/docs/laravel-on-docker

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

## What is Laravel?

[Laravel](https://laravel.com) is the most popular PHP web framework: an expressive, full-stack toolkit for building everything from APIs to large applications, with routing, an ORM (Eloquent), queues, a scheduler, and a huge ecosystem. A real Laravel app rarely runs alone. It wants a web server, a PHP runtime, a database, and Redis for cache, sessions and queues. Laravel speaks to Redis natively (it ships `predis`/`phpredis` drivers), so unlike most PHP apps there is nothing to install to use it. Bigger apps then add a search engine, a mail catcher, or a queue worker alongside.

## Why run Laravel in Docker?

Docker packages each of those pieces (NGINX, PHP-FPM, MySQL, Redis, ...) into isolated containers that run the same on every machine. Instead of installing PHP and MySQL onto your laptop, where versions collide between projects and "works on my machine" starts, you run disposable containers that mirror production and vanish cleanly when you delete them. One project can run PHP 8.4 while another runs 7.4, on the same computer, with nothing installed globally.

The catch: wiring those containers together yourself (base images, PHP extensions, networking, permissions) is a week of fiddly Docker work. That is exactly what Laradock removes.

## Why Laradock is the best fit for Laravel

Laravel has its own official Docker tools (Sail) and native runtimes (Herd, Valet), so, unlike most PHP projects, it does not strictly need Laradock. It is still the best fit, and here is why:

- **You are never locked into one ecosystem.** Laradock is framework-agnostic. The day you add a Symfony service, a WordPress site, or a plain PHP script beside your Laravel app, it runs in the same environment with the same commands. Laravel-only tools cannot do that.
- **Far more flexibility.** 100+ ready services and any PHP version from 5.6 to 8.5, versus the short curated list a Laravel-specific tool gives you.
- **Nothing is hidden and you own everything.** No generated files, no magic, no wrapper binary between you and Docker. Every Dockerfile and compose file is right there for you to read and edit.
- **Nothing new to learn.** What you use is plain `docker compose`, knowledge that transfers straight to production and to every other project. Our [CLI](https://laradock.io/docs/cli) is an optional nicety, never a requirement.

Concretely, for Laravel it gives you a production-style NGINX (or Apache/Caddy) + PHP-FPM stack instead of `artisan serve`, MySQL/PostgreSQL and Redis ready to connect with zero extra setup, a `workspace` container with Composer, Node, npm, git and Artisan already installed, and any PHP version behind a single line of config. Search (Meilisearch), a mail catcher (Mailpit), and a queue worker are each one command away when a feature needs them.

## Run Laravel on Docker with Laradock

### 1. Add Laradock to your project

```bash
cd my-laravel-app
git clone https://github.com/laradock/laradock.git
cd laradock
```

(No Laravel app yet? Clone Laradock first, then [create one from the workspace container](#starting-a-brand-new-laravel-app).)

### 2. Pick the services your app needs

Laravel needs a **web server**, a **database**, and **Redis** (its default cache, session and queue driver). The web server pulls in PHP-FPM automatically, so this is the whole required stack:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock start nginx mysql redis workspace
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
cp .env.example .env
docker compose up -d nginx mysql redis workspace
```

</TabItem>
</Tabs>

Prefer PostgreSQL over MySQL? Swap the name: `./laradock start nginx postgres redis workspace` (or `docker compose up -d nginx postgres redis workspace`). The full catalog is [here](https://laradock.io/docs/Intro#supported-services).

Prefer to be asked? The optional [CLI](https://laradock.io/docs/cli) detects Laravel and pre-selects nginx/mysql/redis for you: `./laradock setup`, then `./laradock start`. It prints every real command it runs.

### 3. Point Laravel at the containers

In your app's `.env`, use the service names as hostnames:

```env
DB_HOST=mysql
DB_DATABASE=default
DB_USERNAME=default
DB_PASSWORD=secret

REDIS_HOST=redis
CACHE_STORE=redis
SESSION_DRIVER=redis
QUEUE_CONNECTION=redis
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
   php artisan test
   ```

## Import an existing database

Moving an app you already run somewhere else? Bring its database over once and every migration and query just works.

1. Start the database and copy your dump into the workspace: put the `.sql` file next to your app so it appears at `/var/www` inside the container.
2. Enter the workspace (`./laradock workspace`) and import it into the `default` database:
   ```bash
   mysql -h mysql -u default -psecret default < dump.sql
   ```
   For PostgreSQL: `psql -h postgres -U default -d default -f dump.sql`.
3. Point your app's `.env` at the container as in [step 3](#3-point-laravel-at-the-containers), then run `php artisan migrate` to apply any newer migrations.

You can also open the database in a browser with a GUI: `./laradock start phpmyadmin` (MySQL/MariaDB) or `./laradock start pgadmin` (PostgreSQL), then visit its port from [the catalog](https://laradock.io/docs/Intro#supported-services).

## Run the queue worker

Laravel's queues (`QUEUE_CONNECTION=redis`) need a long-running worker process. Laradock runs it in a dedicated `php-worker` container so it survives restarts:

1. Create a config for the worker in `php-worker/supervisord.d/` by copying `laravel-worker.conf.example` (for example, to `laravel-worker.conf`). It already runs `php artisan queue:work`.
2. Start the worker:

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

Supervisord keeps the worker alive and restarts it if it dies. Dispatch a job from your app and it is picked up by the container.

## Run the scheduler

Laradock can run the Laravel scheduler (`php artisan schedule:run`) two ways:

1. **Cron in the workspace container (default).** When you start Laradock, the `workspace` container starts cron and runs `schedule:run` every minute. Nothing to configure.
2. **Supervisord in the php-worker container.** Preferred when you don't want to run the workspace in production.

To switch to the second option:

1. Comment out the cron line in `workspace/crontab/laradock`:
   ```bash
   # * * * * * laradock /usr/bin/php /var/www/artisan schedule:run >> /dev/null 2>&1
   ```
2. Copy `laravel-scheduler.conf.example` in `php-worker/supervisord.d/` to a new config (for example, `laravel-scheduler.conf`).
3. Start the worker: `./laradock start php-worker` (or `docker compose up -d php-worker`).

## Run Laravel Horizon (optional)

If you use [Horizon](https://laravel.com/docs/horizon) to manage Redis queues with a dashboard, Laradock ships a dedicated container for it:

1. Install Horizon in your app from the workspace: `composer require laravel/horizon` then `php artisan horizon:install`.
2. Start the container:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock start laravel-horizon
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose up -d laravel-horizon
```

</TabItem>
</Tabs>

The container runs `php artisan horizon`. The dashboard is served by your app at `http://localhost/horizon`. Use Horizon instead of the plain `php-worker` queue worker above, not alongside it.

## Add Meilisearch full-text search (optional)

Laravel's [Scout](https://laravel.com/docs/scout) driver gives your Eloquent models instant full-text search, and Meilisearch is the fastest engine to run locally. Wiring it up is three steps:

1. Start the Meilisearch container:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock start meilisearch
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose up -d meilisearch
```

</TabItem>
</Tabs>

2. Point Scout at it in your app's `.env` (the container's key defaults to `masterkey` in `meilisearch/defaults.env`):
   ```env
   SCOUT_DRIVER=meilisearch
   MEILISEARCH_HOST=http://meilisearch:7700
   MEILISEARCH_KEY=masterkey
   ```
3. From the workspace, install Scout and the Meilisearch client, then index a model:
   ```bash
   composer require laravel/scout meilisearch/meilisearch-php
   php artisan scout:import "App\Models\Post"
   ```

The Meilisearch dashboard is at `http://localhost:7700`. Without those steps the container just sits idle, which is why the required stack above leaves it out.

## Catch outgoing mail with Mailpit (optional)

In development you never want real emails to send. Mailpit captures everything your app sends and shows it in a web inbox:

1. Start the Mailpit container:

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

2. Point Laravel's mailer at it in your app's `.env`:
   ```env
   MAIL_MAILER=smtp
   MAIL_HOST=mailpit
   MAIL_PORT=1025
   MAIL_USERNAME=null
   MAIL_PASSWORD=null
   MAIL_ENCRYPTION=null
   ```
3. Send any mail from your app, then open the inbox at `http://localhost:8125` to read it. Nothing leaves your machine.

## Build assets with Vite (or Laravel Mix)

Front-end assets compile inside the workspace, where Node and npm already live, so you never install them on your host.

1. Enter the workspace: `./laradock workspace` (or `docker compose exec workspace bash`).
2. Install and run the dev server:
   ```bash
   npm install
   npm run dev      # Vite dev server with hot reload (Laravel 9+)
   npm run build    # production build
   ```
3. Vite's dev server is exposed on the workspace container. If hot reload does not connect, set `server.hmr.host` to `localhost` in `vite.config.js` so the browser can reach it from your host.

Still on older **Laravel Mix**? Browsersync works the same way:

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
3. Open `http://localhost:[WORKSPACE_BROWSERSYNC_HOST_PORT]`, it reloads automatically when you edit a source file. The Browsersync UI is at `http://localhost:[WORKSPACE_BROWSERSYNC_UI_HOST_PORT]`.

## Take your app live

When your app is ready, the same Laradock stack becomes your deployment. You build one hardened image of your app and ship it to the host of your choice:

```bash
./laradock ship
```

Then pick a target and follow its short guide, a single server, a managed platform, or Kubernetes: **[Deploy to Production](https://laradock.io/docs/production)** lists every provider (Fly.io, Render, Railway, DigitalOcean, AWS, Google Cloud, Azure, Kamal, Kubernetes) with a ready config file for each. There is no per-provider magic to learn; a Docker image runs the same everywhere.

## Frequently Asked Questions

### Do I need to install PHP or Composer to run Laravel with Laradock?

No. Everything lives inside the containers. Composer, Node, npm, git and Artisan are all in the `workspace` container; you never install PHP on your host.

### Which services should I start for a typical Laravel app?

`nginx mysql redis workspace` covers most apps: web server, database, Redis (Laravel's default cache, session and queue driver), and a shell. Swap `mysql` for `postgres` if you prefer, and add extras like `meilisearch` (search), `mailpit` (catching outgoing mail), or `php-worker` (queue worker) whenever a feature needs them.

### Can I run multiple Laravel apps on different PHP versions?

Yes. Give each its own Laradock with a unique `COMPOSE_PROJECT_NAME` and `DATA_PATH_HOST`, set a different `PHP_VERSION` in each, and they run independently on the same machine.

### Does this work the same on macOS, Windows and Linux?

Yes. Laradock runs anywhere Docker runs. On macOS/Windows, file-sync speed depends on Docker Desktop (VirtioFS helps a lot for `vendor/`-heavy apps); it is a Docker Desktop trait, not specific to Laradock.

### Is this the same Docker setup I would use in production?

The containers are production-style (real NGINX + PHP-FPM), so it is far closer to production than `artisan serve` or a native install. See [Prepare Laradock for Production](https://laradock.io/docs/production#prepare-laradock-for-production) for the hardening steps.

---

Already using Laravel Sail and considering the switch? See the side-by-side with a migration guide: **[Laradock vs Laravel Sail](https://laradock.io/docs/laradock-vs-laravel-sail)**. Ready to start? **[Getting Started](https://laradock.io/docs/getting-started)** takes about five minutes.
