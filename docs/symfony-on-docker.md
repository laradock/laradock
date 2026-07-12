# Run Symfony on Docker

Source: https://laradock.io/docs/symfony-on-docker

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

## What is Symfony?

[Symfony](https://symfony.com) is a mature PHP framework and a set of reusable components used both directly and as the foundation of other projects (Laravel, Drupal, and many more all borrow Symfony components). It ships routing, the Doctrine ORM, a service container, a console, Messenger for background jobs, Mailer, and an asset pipeline, and it powers everything from small APIs to large enterprise applications. A Symfony app needs a web server, a PHP runtime, and, once Doctrine is involved, a real database: PostgreSQL (the default in recent recipes), MySQL, MariaDB, or SQLite.

## Why run Symfony in Docker?

Docker packages each of those pieces (a web server, PHP-FPM, a database) into isolated containers that run the same on every machine. Instead of installing PHP and a database onto your laptop, where versions collide between projects and "works on my machine" starts, you run disposable containers that mirror production and vanish cleanly when you delete them. One project can run PHP 8.4 while another runs 8.1, on the same computer, with nothing installed globally.

The catch: wiring those containers together yourself (base images, PHP extensions, networking, permissions) is a week of fiddly Docker work. That is exactly what Laradock removes.

## Why Laradock is the best fit for Symfony

Symfony has its own official Docker setup, [symfony-docker](https://github.com/dunglas/symfony-docker), built around FrankenPHP, plus Symfony Flex recipes that can add compose files automatically when you require a package. So, unlike most PHP projects, Symfony does not strictly need Laradock. It is still the best fit, and here is why:

- **You are never locked into one ecosystem.** Laradock is framework-agnostic. The day you add a Laravel API, a WordPress site, or a plain PHP script beside your Symfony app, it runs in the same environment with the same commands. A Symfony-specific setup cannot do that.
- **Far more flexibility.** 100+ ready services and any PHP version from 5.6 to 8.5, versus the short curated list a Symfony-specific setup gives you.
- **Nothing is hidden and you own everything.** No generated files, no magic, no wrapper binary between you and Docker. Every Dockerfile and compose file is right there for you to read and edit.
- **Nothing new to learn.** What you use is plain `docker compose`, knowledge that transfers straight to production and to every other project. Our [CLI](https://laradock.io/docs/cli) is an optional nicety, never a requirement.

For Symfony specifically, Laradock wires a production-style NGINX + PHP-FPM stack (FrankenPHP is also available as a web server if you want it), PostgreSQL/MySQL/MariaDB, a `php-worker` container for Messenger consumers, and a `workspace` container with Composer, the Symfony console, Node, npm and git already installed.

## Run Symfony on Docker with Laradock

### 1. Add Laradock to your project

```bash
cd my-symfony-app
git clone https://github.com/laradock/laradock.git
cd laradock
```

(No Symfony app yet? Clone Laradock first, then create one from the workspace container in the next steps.)

### 2. Pick the services your app needs

A Symfony app needs a web server, a database, and PHP-FPM (the web server pulls PHP-FPM in automatically). Symfony's recent recipes default to PostgreSQL, so that is the required stack:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock start nginx postgres workspace
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
cp .env.example .env
docker compose up -d nginx postgres workspace
```

</TabItem>
</Tabs>

Prefer MySQL or MariaDB? Swap the name: `./laradock start nginx mysql workspace` (or `docker compose up -d nginx mysql workspace`). The full catalog is [here](https://laradock.io/docs/Intro#supported-services).

Prefer to be asked? The optional [CLI](https://laradock.io/docs/cli) detects Symfony and pre-selects nginx/postgres for you: `./laradock setup`, then `./laradock start`. It prints every real command it runs.

> **Do I need Redis, a queue worker, or a mail catcher to boot?** No. A fresh Symfony app runs on `nginx postgres workspace` alone. Redis (cache/sessions), the `php-worker` container (Messenger), Mailpit (email), and a search engine each need a config line to do anything, so they live in their own optional sections below. Add them when a feature actually calls for them.

### 3. Point Symfony at the containers

In your app's `.env` (or `.env.local`), set `DATABASE_URL` to the service name as the hostname:

```env
DATABASE_URL="postgresql://default:secret@postgres:5432/default?serverVersion=16&charset=utf8"
```

On MySQL instead, the URL is `mysql://default:secret@mysql:3306/default?serverVersion=8.4&charset=utf8mb4`.

The default database, user and password live in `.env` (`POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD`, all `default`/`secret`); change them there and they win.

### 4. Run your app from the workspace

Enter the shell where Composer, the Symfony console and Node live, and run the usual commands:

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

```bash
composer create-project symfony/skeleton .   # only if you have no Symfony app yet
composer require webapp                       # full-stack extras, skip for an API/microservice
php bin/console doctrine:database:create
php bin/console doctrine:migrations:migrate
```

Then open [http://localhost](http://localhost). That is a full Symfony app running on Docker.

## Add Redis for cache and sessions (optional)

Symfony can use Redis as a native cache and session backend, but it does nothing until you point Symfony at it. Three steps:

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

2. In your app's `.env`, add the Redis DSN with the service name as the host:

```env
REDIS_URL=redis://redis:6379
```

3. Wire it into `config/packages/cache.yaml` (and sessions in `framework.yaml`):

```yaml
framework:
    cache:
        app: cache.adapter.redis
        default_redis_provider: '%env(REDIS_URL)%'
    session:
        handler_id: '%env(REDIS_URL)%'
```

Clear the cache once (`php bin/console cache:clear`) and Symfony now stores its cache pools and sessions in Redis. Without those lines the container just sits idle, which is why the required stack above leaves it out.

## Run background jobs with Messenger (optional)

Symfony [Messenger](https://symfony.com/doc/current/messenger.html) dispatches work (emails, imports, webhooks) to a transport and processes it in a long-running worker. Laradock has a dedicated `php-worker` container for exactly this, so consumers survive restarts instead of dying with your terminal.

1. Configure an async transport in your app's `.env` (Doctrine needs no extra service; for higher throughput point it at Redis or `rabbitmq` instead):

```env
MESSENGER_TRANSPORT_DSN=doctrine://default?auto_setup=1
# or: redis://redis:6379/messages
# or: amqp://guest:guest@rabbitmq:5672/%2f/messages   (needs ./laradock start rabbitmq)
```

2. Tell the `php-worker` container to run the Symfony consumer. Copy the bundled Laravel example and edit it for Symfony:

```bash
cp php-worker/supervisord.d/laravel-worker.conf.example \
   php-worker/supervisord.d/symfony-worker.conf
```

Set the command inside that file to the Symfony console (the app is mounted at `/var/www`):

```ini
[program:symfony-worker]
command=php /var/www/bin/console messenger:consume async --time-limit=3600
autostart=true
autorestart=true
numprocs=2
user=laradock
redirect_stderr=true
```

3. Start the worker:

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

Supervisor keeps the consumer alive and restarts it hourly (a healthy habit for long-running PHP). After you deploy new message handlers, rebuild the worker: `./laradock rebuild php-worker`.

## Schedule recurring tasks (optional)

For periodic work (cleanups, digests, syncing), Symfony offers two paths, both of which fit Laradock:

- **Symfony Scheduler** (the modern approach) runs on top of Messenger. Define a schedule, then consume its transport with a worker exactly like the section above, pointing the command at `messenger:consume scheduler_default`. Add that as a second `[program:...]` block in your `php-worker` config.
- **Classic cron.** The `workspace` container runs `cron`. Add a crontab entry that shells into your app, for example a nightly command:

```cron
0 3 * * * cd /var/www && php bin/console app:send-digest >> /dev/null 2>&1
```

Drop that line in `workspace/crontab/laradock` and rebuild the workspace (`./laradock rebuild workspace`) so cron picks it up.

## Send and preview email with Mailpit (optional)

Symfony Mailer needs an SMTP server, and you never want dev email hitting real inboxes. Mailpit catches every message and shows it in a web inbox.

1. Start it:

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

2. Point Mailer at the container in your app's `.env` (use the internal SMTP port `1025`, not the host-mapped one):

```env
MAILER_DSN=smtp://mailpit:1025
```

3. Send anything from your app, then open the inbox at [http://localhost:8125](http://localhost:8125) to read it. Nothing leaves your machine.

## Add a search engine (optional)

For full-text search, Symfony pairs cleanly with Meilisearch (lightest to run) or Elasticsearch. Start the engine and point your app at it by service name:

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

Then, in the workspace, install the matching bundle and set the host in `.env`:

```bash
composer require meilisearch/search-bundle   # or: friendsofsymfony/elastica-bundle for Elasticsearch
```

```env
MEILISEARCH_URL=http://meilisearch:7700
# Elasticsearch instead: ELASTICSEARCH_URL=http://elasticsearch:9200  (./laradock start elasticsearch)
```

Index your entities per the bundle's docs, and search now runs against a real engine instead of `LIKE` queries.

## Add real-time updates with Mercure (optional)

Symfony's [Mercure](https://symfony.com/doc/current/mercure.html) integration pushes live updates to browsers over Server-Sent Events. Laradock ships a `mercure` hub:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock start mercure
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose up -d mercure
```

</TabItem>
</Tabs>

Install the bundle (`composer require mercure`) and set `MERCURE_URL`/`MERCURE_PUBLIC_URL` to the hub's address, then dispatch `Update` objects from your controllers.

## Build front-end assets

New Symfony apps use **AssetMapper** by default, which needs no build step and no Node: run `php bin/console importmap:install` in the workspace and you are done. If your project uses **Webpack Encore** instead, Node, npm and Yarn are already installed in the `workspace` container, so build from there:

```bash
npm install
npm run dev          # or: npm run watch   /   npm run build for production
```

Nothing is installed on your host; the whole toolchain lives in the container.

## Console and admin tooling

The `workspace` container is your Symfony command line. Every `bin/console` command runs there, so you never install PHP or Composer on your machine:

```bash
php bin/console list                       # every available command
php bin/console make:controller            # MakerBundle scaffolding (composer require --dev maker)
php bin/console make:entity
php bin/console debug:router
php bin/console debug:container
php bin/console cache:clear
```

Because the app is mounted into the container, edits on your host are visible instantly, no rebuild needed for code changes.

## Import an existing database

Moving a real Symfony project onto Laradock? Load its dump into the running database container. From your host, with the `.sql` file in the Laradock folder:

```bash
# PostgreSQL
docker compose exec -T postgres psql -U default -d default < dump.sql

# MySQL / MariaDB
docker compose exec -T mysql mysql -u default -psecret default < dump.sql
```

Then run `php bin/console doctrine:migrations:migrate` from the workspace to bring the schema up to date. Point `DATABASE_URL` at the same service name and your app is running on the imported data.

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

Symfony 7 requires PHP 8.2 or newer, and Laradock covers anything from PHP 5.6 to 8.5, so the same tool runs a legacy Symfony 4 project on an older PHP version and a brand-new Symfony 7 one side by side, each isolated, none of it installed on your machine.

## Install the Symfony CLI in the workspace

Laradock can also install the official Symfony CLI (the `symfony` binary) inside the workspace container, and ships a ready NGINX vhost template for Symfony:

1. In `.env`, set `WORKSPACE_INSTALL_SYMFONY` to `true`.
2. Rebuild the workspace: `./laradock rebuild workspace` (or `docker compose build workspace`).
3. The NGINX sites include a `symfony.conf.example`; edit it so `root` points to your project's `public` directory.
4. If the containers were already running, restart them: `./laradock restart` (or `docker compose restart`).
5. Visit `symfony.test`.

## Take your app live

When your app is ready, the same Laradock stack becomes your deployment. You build one hardened image of your app and ship it to the host of your choice:

```bash
./laradock ship
```

Then pick a target and follow its short guide, a single server, a managed platform, or Kubernetes: **[Deploy to Production](https://laradock.io/docs/production)** lists every provider (Fly.io, Render, Railway, DigitalOcean, AWS, Google Cloud, Azure, Kamal, Kubernetes) with a ready config file for each. There is no per-provider magic to learn; a Docker image runs the same everywhere.

## Frequently Asked Questions

### Do I need to install PHP or Composer to run Symfony with Laradock?

No. Everything lives inside the containers. Composer, the Symfony console, Node, npm and git are all in the `workspace` container; you never install PHP on your host.

### Which services should I start for a typical Symfony app?

`nginx postgres workspace` is all a fresh Symfony app requires: web server, database, and a shell. Swap `postgres` for `mysql` or `mariadb` if you prefer. Add `redis` (cache/sessions), `php-worker` (Messenger jobs), `mailpit` (email), `meilisearch` (search), or `mercure` (real-time) only when a feature needs them, each is wired in its own section above.

### How do I run Messenger workers so they survive a restart?

Use the `php-worker` container: copy the bundled worker config, set its command to `php /var/www/bin/console messenger:consume async`, and `./laradock start php-worker`. Supervisor keeps the consumer running and restarts it automatically. See [Run background jobs with Messenger](#run-background-jobs-with-messenger-optional).

### Can I run multiple Symfony apps on different PHP versions?

Yes. Give each its own Laradock with a unique `COMPOSE_PROJECT_NAME` and `DATA_PATH_HOST`, set a different `PHP_VERSION` in each, and they run independently on the same machine.

### Does this work the same on macOS, Windows and Linux?

Yes. Laradock runs anywhere Docker runs. On macOS/Windows, file-sync speed depends on Docker Desktop (VirtioFS helps a lot for `vendor/`-heavy apps); it is a Docker Desktop trait, not specific to Laradock.

### Is this the same Docker setup I would use in production?

The containers are production-style (real NGINX + PHP-FPM, or FrankenPHP if you choose it), so it is far closer to production than the built-in Symfony CLI server. See [Prepare Laradock for Production](https://laradock.io/docs/production#prepare-laradock-for-production) for the hardening steps.

---

Comparing environments? See **[Laradock vs Symfony Docker](https://laradock.io/docs/laradock-vs-symfony-docker)** (the FrankenPHP-based template and the Symfony CLI) and the full **[Laradock vs Others](https://laradock.io/docs/laradock-alternatives)** breakdown. Ready to start? **[Getting Started](https://laradock.io/docs/getting-started)** takes about five minutes.
