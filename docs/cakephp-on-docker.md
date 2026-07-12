# Run CakePHP on Docker

Source: https://laradock.io/docs/cakephp-on-docker

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

## What is CakePHP?

[CakePHP](https://cakephp.org) is a long-running, convention-over-configuration PHP framework with code generation (Bake), a built-in ORM, migrations, and scaffolding for CRUD apps. It is a common choice for admin tools and internal apps that need to be built fast. A CakePHP app needs a web server, a PHP runtime, and a database; MySQL is the default, with PostgreSQL, SQLite and SQL Server also supported out of the box. Everything else (Redis caching, background queues, a search engine, a mail catcher) is opt-in and layers on only when you want it.

## Why run CakePHP in Docker?

Docker packages each of those pieces (NGINX, PHP-FPM, MySQL) into isolated containers that run the same on every machine. Instead of installing PHP and MySQL onto your laptop, where versions collide between projects and "works on my machine" starts, you run disposable containers that mirror production and vanish cleanly when you delete them. One project can run PHP 8.3 while an older CakePHP 3 app runs 7.4, on the same computer, with nothing installed globally.

The catch: wiring those containers together yourself (base images, PHP extensions, networking, permissions) is a week of fiddly Docker work. That is exactly what Laradock removes.

## Why Laradock is the best fit for CakePHP

CakePHP has no official Docker tool or first-party runtime of its own, so a ready-made, no-lock-in environment matters even more. Here is why Laradock is the best fit:

- **You are never locked into one ecosystem.** Laradock is framework-agnostic. Run CakePHP today, add a Laravel API, a WordPress site, or a plain PHP script beside it tomorrow, all in the same environment with the same commands.
- **Far more flexibility.** 100+ ready services and any PHP version from 5.6 to 8.5, so a legacy CakePHP 3 app and a modern CakePHP 5 app each get exactly the runtime they need.
- **Nothing is hidden and you own everything.** No generated files, no magic, no wrapper binary between you and Docker. Every Dockerfile and compose file is right there for you to read and edit.
- **Nothing new to learn.** What you use is plain `docker compose`, knowledge that transfers straight to production. Our [CLI](https://laradock.io/docs/cli) is an optional nicety, never a requirement.

Concretely, for CakePHP it gives you a production-style NGINX + PHP-FPM stack, MySQL or PostgreSQL ready to connect, and a `workspace` container with Composer, git and the `bin/cake` console (Bake, migrations, the queue worker) all ready to run, behind any PHP version you set in one line of config.

## Run CakePHP on Docker with Laradock

### 1. Add Laradock to your project

```bash
cd my-cakephp-app
git clone https://github.com/laradock/laradock.git
cd laradock
```

(No CakePHP app yet? Clone Laradock first, then create one from the workspace container in the next steps.)

### 2. Pick the services your app needs

CakePHP needs exactly two things: a **web server** and a **database**. The web server pulls in PHP-FPM automatically, so this is the whole required stack:

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

Prefer to be asked? The optional [CLI](https://laradock.io/docs/cli) detects CakePHP and pre-selects nginx/mysql for you: `./laradock setup`, then `./laradock start`. It prints every real command it runs.

> **Do I need Redis, a queue, or a search engine?** Not to get running. A fresh CakePHP app runs perfectly on `nginx mysql workspace`. Caching, background jobs, mail and search are all opt-in; each has its own section below with the exact wiring. Add them when you actually need them.

### 3. Point CakePHP at the containers

In `config/app_local.php`, use the service name as the hostname under `Datasources.default`:

```php
'Datasources' => [
    'default' => [
        'host' => 'mysql',
        'username' => 'default',
        'password' => 'secret',
        'database' => 'default',
    ],
],
```

The default database, user and password live in Laradock's `mysql/defaults.env`; override any of them by adding the line to Laradock's `.env` (it always wins).

### 4. Run your app from the workspace

Enter the shell where Composer, git and the `bin/cake` console live:

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

Once inside, run the usual commands:

```bash
composer create-project --prefer-dist cakephp/app .   # only if you have no CakePHP app yet
bin/cake migrations migrate
```

Then open [http://localhost](http://localhost). That is a full CakePHP app running on Docker.

## Add Redis caching (optional)

CakePHP caches its ORM metadata, query results and anything you store with `Cache::write()`. In production that cache should live in Redis, not on disk. Wiring it up is three steps:

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

2. Point your cache configs at it in `config/app.php`, using `redis` as the host:

```php
'Cache' => [
    'default' => [
        'className' => \Cake\Cache\Engine\RedisEngine::class,
        'host' => 'redis',
        'port' => 6379,
        'duration' => '+1 hours',
    ],
],
```

3. The `redis` PHP extension is already compiled into the workspace and PHP-FPM images, so nothing else to install. Reload and CakePHP now reads and writes its cache in Redis. Without this config CakePHP just uses the on-disk `File` engine, which is why the required stack above leaves Redis out.

## Run background jobs with a queue (optional)

For work that should not block a web request (sending email, generating reports, calling slow APIs), CakePHP has the official [Queue plugin](https://github.com/cakephp/queue), which can use Redis as its backend.

1. Start Redis and the always-on worker container:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock start redis php-worker
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose up -d redis php-worker
```

</TabItem>
</Tabs>

2. From the `workspace` container, install the plugin and its Redis transport:

```bash
composer require cakephp/queue enqueue/redis "predis/predis:^3"
bin/cake plugin load Cake/Queue
```

3. Add the queue config in `config/app.php`, pointing the DSN at the `redis` container:

```php
'Queue' => [
    'default' => [
        'url' => 'redis://redis',
        'queue' => 'default',
    ],
],
```

4. In development you can run a worker by hand from the `workspace` shell:

```bash
bin/cake queue worker
```

To keep it running automatically, copy `php-worker/supervisord.d/laravel-worker.conf.example` to a new `.conf` file and change the command to `php /var/www/bin/cake queue worker`, then `./laradock rebuild php-worker`. The `php-worker` container keeps the process alive and restarts it if it dies. Queue a job from anywhere in your code with `QueueManager::push(SendEmailJob::class, $data)`.

## Catch outgoing email with Mailpit (optional)

While building, you rarely want real email to leave your machine. [Mailpit](https://github.com/axllent/mailpit) captures every message your app sends and shows it in a web inbox, so nothing reaches real inboxes.

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

2. Point CakePHP's SMTP transport at the `mailpit` container in `config/app_local.php`:

```php
'EmailTransport' => [
    'default' => [
        'className' => \Cake\Mailer\Transport\SmtpTransport::class,
        'host' => 'mailpit',
        'port' => 1025,
        'tls' => false,
    ],
],
```

3. Send mail as usual, then open the inbox at [http://localhost:8025](http://localhost:8025) to read it. Prefer MailHog? It works the same way: `./laradock start mailhog`, same host/port `1025`, UI on `8025`.

## Add Elasticsearch for full-text search (optional)

CakePHP's ORM covers most queries, but for large, faceted full-text search there is the official [Elasticsearch datasource](https://github.com/cakephp/elastic-search).

1. Start the search container (it is memory-hungry, so start it only when you need it):

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock start elasticsearch
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose up -d elasticsearch
```

</TabItem>
</Tabs>

2. Install the plugin from the `workspace` shell:

```bash
composer require cakephp/elastic-search
bin/cake plugin load Cake/ElasticSearch
```

3. Add an Elasticsearch datasource in `config/app.php`, using `elasticsearch` as the host:

```php
'Datasources' => [
    'elastic' => [
        'className' => \Cake\ElasticSearch\Datasource\Connection::class,
        'driver' => \Cake\ElasticSearch\Datasource\Connection::class,
        'host' => 'elasticsearch',
        'port' => 9200,
    ],
],
```

Now `Cake\ElasticSearch\IndexRegistry` can read and write indexes on the container.

## Run migrations and seed data

CakePHP ships the [Migrations plugin](https://book.cakephp.org/migrations/) in the default app skeleton, so schema changes are code you run inside the `workspace` container:

```bash
bin/cake bake migration CreateArticles title:string body:text created modified
bin/cake migrations migrate          # apply pending migrations
bin/cake migrations rollback         # undo the last batch
bin/cake migrations seed             # run seeders in config/Seeds
```

Because the database is the `mysql` (or `postgres`) container, these commands hit the same database your app uses. Nothing is installed on your host.

## Generate code with Bake

Bake is CakePHP's scaffolding generator, and it lives in the `workspace` container ready to use. From the shell:

```bash
bin/cake bake model Articles
bin/cake bake controller Articles
bin/cake bake template Articles
bin/cake bake all Articles           # model + controller + templates in one go
```

Run `bin/cake bake --help` to list every generator. This is the fastest way to stand up CRUD around a new table.

## Schedule recurring tasks with cron

CakePHP has no built-in scheduler; recurring work is a [console command](https://book.cakephp.org/5/en/console-commands.html) (`bin/cake bake command`) that you run on a schedule. Two ways to do it in Laradock:

- **Simple:** trigger it from your host's crontab with `docker compose exec -T workspace bin/cake my_command`.
- **Self-contained:** copy `php-worker/supervisord.d/laravel-scheduler.conf.example`, point its command at your `php /var/www/bin/cake my_command` (wrapped in a loop or paired with the container's cron), and rebuild `php-worker`. The container then owns the schedule, so it travels with your stack to production.

## Build front-end assets

The `workspace` container already has Node.js, npm and yarn, so if your CakePHP app uses a JavaScript build step (via a plugin such as [ViteHelper](https://github.com/passchn/cakephp-vite) or AssetMix), run it there, not on your host:

```bash
npm install
npm run dev      # or: npm run build for a production bundle
```

Nothing about the toolchain touches your machine, and a teammate on a different OS gets the exact same Node version.

## Import an existing database

Moving an existing CakePHP app onto Laradock? Drop your SQL dump into the Laradock folder and pipe it into the running `mysql` container from your host:

```bash
docker compose exec -T mysql mysql -u default -psecret default < dump.sql
```

For PostgreSQL: `docker compose exec -T postgres psql -U default -d default < dump.sql`. Then point `config/app_local.php` at `host => 'mysql'` (or `postgres`) as shown above and your data is live.

## Set up your first admin login

CakePHP does not ship an admin panel or a default user; you build authentication with the official [Authentication plugin](https://book.cakephp.org/authentication/). From the `workspace` shell:

```bash
composer require cakephp/authentication
bin/cake bake migration CreateUsers email:string password:string
bin/cake migrations migrate
bin/cake bake model Users
bin/cake bake controller Users
```

Wire the `AuthenticationMiddleware` into `src/Application.php` as the plugin's docs show, then create your first user. The cleanest way is a seeder that hashes the password with CakePHP's `DefaultPasswordHasher`, run via `bin/cake migrations seed`. After that you can log in at your app's `/users/login` route.

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

CakePHP 5 requires PHP 8.1 or newer (CakePHP 4 supports 7.2+), and Laradock covers anything from PHP 5.6 to 8.5, so the same tool runs a legacy CakePHP 3 project and a current CakePHP 5 app side by side, each isolated, none of it installed on your machine.

## Take your app live

When your app is ready, the same Laradock stack becomes your deployment. You build one hardened image of your app and ship it to the host of your choice:

```bash
./laradock ship
```

Then pick a target and follow its short guide, a single server, a managed platform, or Kubernetes: **[Deploy to Production](https://laradock.io/docs/production)** lists every provider (Fly.io, Render, Railway, DigitalOcean, AWS, Google Cloud, Azure, Kamal, Kubernetes) with a ready config file for each. There is no per-provider magic to learn; a Docker image runs the same everywhere.

## Frequently Asked Questions

### Do I need to install PHP or Composer to run CakePHP with Laradock?

No. Everything lives inside the containers. Composer, git and the `bin/cake` console are all in the `workspace` container; you never install PHP on your host.

### Which services should I start for a typical CakePHP app?

`nginx mysql workspace` is all CakePHP requires: web server, database, and a shell. Swap `mysql` for `postgres` if you prefer. Add `redis`, `php-worker`, `mailpit` or `elasticsearch` only when you set up the matching feature; each has its own section above with the exact wiring.

### How do I run background jobs and the queue worker?

Start `redis php-worker`, install `cakephp/queue`, and run `bin/cake queue worker`. See [Run background jobs with a queue](#run-background-jobs-with-a-queue-optional) for the full wiring, including keeping the worker alive with the `php-worker` container.

### Can I run multiple CakePHP apps on different PHP versions?

Yes. Give each its own Laradock with a unique `COMPOSE_PROJECT_NAME` and `DATA_PATH_HOST`, set a different `PHP_VERSION` in each, and they run independently on the same machine.

### Does this work the same on macOS, Windows and Linux?

Yes. Laradock runs anywhere Docker runs. On macOS/Windows, file-sync speed depends on Docker Desktop (VirtioFS helps a lot); it is a Docker Desktop trait, not specific to Laradock.

### Is this the same Docker setup I would use in production?

The containers are production-style (real NGINX + PHP-FPM), so it is far closer to production than the built-in PHP development server. See [Prepare Laradock for Production](https://laradock.io/docs/production#prepare-laradock-for-production) for the hardening steps.

---

Comparing environments? See the full **[Laradock vs Others](https://laradock.io/docs/laradock-alternatives)** breakdown. Ready to start? **[Getting Started](https://laradock.io/docs/getting-started)** takes about five minutes.
