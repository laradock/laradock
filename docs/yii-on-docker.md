# Run Yii on Docker

Source: https://laradock.io/docs/yii-on-docker

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

## What is Yii?

[Yii](https://www.yiiframework.com) is a performance-focused PHP framework built around code generation (Gii), a full ActiveRecord ORM, and a "basic" or "advanced" application template to start from. It is popular for admin panels and data-heavy backends. A Yii app needs a web server, a PHP runtime, and a database; MySQL is the default in the official application templates, with PostgreSQL, SQLite and others also supported. Extras like caching, background queues, mail and full-text search are opt-in extensions you add when you need them, not core requirements.

## Why run Yii in Docker?

Docker packages each of those pieces (NGINX, PHP-FPM, MySQL) into isolated containers that run the same on every machine. Instead of installing PHP and MySQL onto your laptop, where versions collide between projects and "works on my machine" starts, you run disposable containers that mirror production and vanish cleanly when you delete them. One project can run PHP 8.3 while an older Yii 1 codebase runs 7.2, on the same computer, with nothing installed globally.

The catch: wiring those containers together yourself (base images, PHP extensions, networking, permissions) is a week of fiddly Docker work. That is exactly what Laradock removes.

## Why Laradock is the best fit for Yii

Yii has no official Docker tool or first-party runtime of its own, so a ready-made, no-lock-in environment matters even more. Here is why Laradock is the best fit:

- **You are never locked into one ecosystem.** Laradock is framework-agnostic. Run Yii today, add a Laravel API, a WordPress site, or a plain PHP script beside it tomorrow, all in the same environment with the same commands.
- **Far more flexibility.** 100+ ready services and any PHP version from 5.6 to 8.5, so an old Yii 1 admin panel and a modern Yii 2 app each get exactly the runtime they need.
- **Nothing is hidden and you own everything.** No generated files, no magic, no wrapper binary between you and Docker. Every Dockerfile and compose file is right there for you to read and edit.
- **Nothing new to learn.** What you use is plain `docker compose`, knowledge that transfers straight to production. Our [CLI](https://laradock.io/docs/cli) is an optional nicety, never a requirement.

Concretely, for Yii it gives you a production-style NGINX + PHP-FPM stack, MySQL/PostgreSQL ready to connect, a `workspace` container with Composer, git and the `php yii` console on hand, and any PHP version behind a single line of config. Caching (Redis), background queues, a mail catcher and Elasticsearch are each one command away when you want them.

## Run Yii on Docker with Laradock

### 1. Add Laradock to your project

```bash
cd my-yii-app
git clone https://github.com/laradock/laradock.git
cd laradock
```

(No Yii app yet? Clone Laradock first, then create one from the workspace container in the next steps.)

### 2. Pick the services your app needs

Yii needs exactly two things to boot: a **web server** and a **database**. The web server pulls in PHP-FPM automatically, so this is the whole required stack:

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

Prefer to be asked? The optional [CLI](https://laradock.io/docs/cli) detects Yii and pre-selects nginx/mysql for you: `./laradock setup`, then `./laradock start`. It prints every real command it runs.

> **Do I need Redis, a queue or Elasticsearch?** Not to get running. A fresh Yii app runs perfectly on `nginx mysql workspace`. Caching, background jobs and search are extensions you add deliberately, each with its own `## Add ...` section below. Start with the two services above and grow into the rest.

### 3. Point Yii at the containers

In `config/db.php`, use the service name as the hostname in the DSN:

```php
return [
    'class' => 'yii\db\Connection',
    'dsn' => 'mysql:host=mysql;dbname=default',
    'username' => 'default',
    'password' => 'secret',
    'charset' => 'utf8',
];
```

The default database, user and password live in Laradock's `mysql/defaults.env`; override any of them by adding the line to Laradock's `.env` (it always wins). Yii will not create the database for you; run `./laradock exec mysql mysql -udefault -psecret -e "CREATE DATABASE IF NOT EXISTS default"` (or `docker compose exec mysql mysql -udefault -psecret -e "CREATE DATABASE IF NOT EXISTS default"`), or use a database tool such as `phpmyadmin`/`adminer` from the catalog, before migrating.

### 4. Run your app from the workspace

Enter the shell where Composer, git and the `php yii` console live, and run the usual commands:

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

Once inside, run:

```bash
composer create-project --prefer-dist yiisoft/yii2-app-basic .   # only if you have no Yii app yet
php yii migrate
```

Then open [http://localhost](http://localhost). That is a full Yii app running on Docker.

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

Yii 2 supports PHP 7.3 and newer, and Laradock covers anything from PHP 5.6 to 8.5, so the same tool runs a legacy Yii 1 project pinned to an old PHP version and a current Yii 2 app side by side, each isolated, none of it installed on your machine.

## Start a brand-new Yii app (basic or advanced template)

Yii ships two official starting points. Create either one from inside the `workspace` container:

```bash
# Basic template: one app, ideal for admin panels and small sites
composer create-project --prefer-dist yiisoft/yii2-app-basic .

# Advanced template: separate frontend, backend and console apps sharing one codebase
composer create-project --prefer-dist yiisoft/yii2-app-advanced .
php init --env=Development --overwrite=All
```

The advanced template gives you three entry points (`frontend`, `backend`, `console`) that share models and config. Point one NGINX server block at `frontend/web` and another at `backend/web` (edit `nginx/sites/` and add a second host such as `admin.localhost`), then run `php yii migrate` once from the console app to build the shared schema. This is the closest Yii gets to a "multi-store" layout: one project, one database, two public sites.

## Everyday console, migrations and Gii

Everything runs through the `php yii` console inside the `workspace` container. The most common commands:

```bash
php yii migrate                       # apply pending database migrations
php yii migrate/create create_post    # generate a new migration file
php yii migrate/down 1                # roll back the last migration
php yii cache/flush-all               # clear every configured cache
php yii                               # list every available command
```

**Gii, the code generator,** is web-based. It is enabled only in the Development environment and, by default, only for requests from `127.0.0.1`. Because you reach the app through the NGINX container, add Docker's gateway to the allowed list in `config/web.php` so your browser is trusted:

```php
if (YII_ENV_DEV) {
    $config['bootstrap'][] = 'gii';
    $config['modules']['gii'] = [
        'class' => 'yii\gii\Module',
        'allowedIPs' => ['127.0.0.1', '::1', '172.16.0.0/12', '192.168.0.0/16'],
    ];
}
```

Then open [http://localhost/gii](http://localhost/gii) to scaffold models, CRUD controllers and forms.

## Log in for the first time

The basic template ships a demo user hardcoded in `models/User.php`: username `admin`, password `admin` (and `demo` / `demo`). Log in at [http://localhost/index.php?r=site/login](http://localhost/index.php?r=site/login) to confirm the app works, then replace that class with a real ActiveRecord user backed by your database before doing anything else.

The advanced template has no demo account. It provides a full signup and login flow out of the box: run `php yii migrate` to create the `user` table, then register through the frontend signup page and log into the backend with those credentials.

## Run background jobs with a queue worker

Yii processes background jobs through the official [yii2-queue](https://github.com/yiisoft/yii2-queue) extension. Install it from the `workspace` container:

```bash
composer require yiisoft/yii2-queue
```

The simplest driver needs no extra service: it stores jobs in the database you already run. Configure it in `config/console.php` (and `config/web.php` so controllers can push jobs):

```php
'bootstrap' => ['queue'],
'components' => [
    'queue' => [
        'class' => \yii\queue\db\Queue::class,
        'db' => 'db',
        'tableName' => '{{%queue}}',
        'channel' => 'default',
        'mutex' => \yii\mutex\MysqlMutex::class,
    ],
],
```

Create the queue table, then start a worker that runs continuously:

```bash
php yii migrate --migrationPath=@yii/queue/drivers/db/migrations
php yii queue/listen --verbose
```

`queue/listen` is a long-running daemon that picks up jobs the instant they are pushed. Keep the `workspace` shell open for it during development, or run it detached with `./laradock exec workspace php yii queue/listen --verbose`. For heavier setups, point the queue at Redis, RabbitMQ or Beanstalk instead of the database; each is one Laradock service away (`./laradock start redis`, `rabbitmq`, or `beanstalkd`) and swaps only the `queue` component's `class`.

## Schedule recurring tasks (cron)

Yii has no built-in scheduler; you register console commands and let cron call them. Any command under `commands/` is runnable as `php yii <controller>/<action>`. From inside the `workspace` container, edit its crontab:

```bash
crontab -e
```

Add lines that shell into the app on a schedule, for example every night at 2am:

```cron
0 2 * * * cd /var/www && php yii maintenance/prune >> runtime/logs/cron.log 2>&1
```

Laradock's `workspace` runs cron when `WORKSPACE_INSTALL_CRON=true` is set in `.env` (rebuild the workspace after changing it). For production-style, always-on job runners, the dedicated `php-worker` container is the better home; see [Prepare Laradock for Production](https://laradock.io/docs/production#prepare-laradock-for-production).

## Compile and publish assets

Yii manages CSS/JS through asset bundles. In development it publishes them automatically to `web/assets` on each request, so there is nothing to build to see changes. For production you can combine and compress bundles from the `workspace` container:

```bash
php yii asset/template assets.php     # generate a config once
php yii asset assets.php web/assets-prod/assets-prod.php
```

If a bundle pulls front-end packages through npm or a bundler, the `workspace` container already has Node and npm available (enable the versions you want in `.env`), so `npm install && npm run build` works in the same shell. Nothing extra is installed on your host.

## Import an existing database

Moving an app you already run? Drop the SQL dump next to your project and pipe it into the `mysql` container:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock exec mysql mysql -udefault -psecret default < dump.sql
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose exec -T mysql mysql -udefault -psecret default < dump.sql
```

</TabItem>
</Tabs>

Then run `php yii migrate` from the `workspace` container to apply any newer migrations on top. For PostgreSQL, swap in `psql -U default default < dump.sql` against the `postgres` service.

## Add Redis for caching and sessions (optional)

Yii core does nothing with Redis on its own; the [yii2-redis](https://github.com/yiisoft/yii2-redis) extension wires it in. It is worth it once your app does real work: it caches query results, fragments and full pages, and can hold sessions so they survive across containers. Three steps:

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

2. Install the extension from the `workspace` container:

```bash
composer require yiisoft/yii2-redis
```

3. Point Yii at the container in `config/web.php`, using the service name as the host:

```php
'components' => [
    'redis' => [
        'class' => \yii\redis\Connection::class,
        'hostname' => 'redis',
        'port' => 6379,
        'database' => 0,
    ],
    'cache' => [
        'class' => \yii\redis\Cache::class,
    ],
],
```

Now `Yii::$app->cache` stores data in Redis. Without those steps the container just sits idle, which is why the required stack above leaves it out.

## Add a mail catcher (optional)

To send mail from Yii and see it without a real SMTP account, run the `mailpit` container and point the mailer at it. Yii sends mail through the [yii2-symfonymailer](https://github.com/yiisoft/yii2-symfonymailer) extension, which ships with the official templates.

1. Start the catcher:

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

2. In `config/web.php`, set the mailer transport to the container (`useFileTransport` must be `false` to actually send):

```php
'mailer' => [
    'class' => \yii\symfonymailer\Mailer::class,
    'useFileTransport' => false,
    'transport' => [
        'dsn' => 'smtp://mailpit:1025',
    ],
],
```

Every message your app sends now lands in Mailpit's web inbox at [http://localhost:8025](http://localhost:8025), nothing leaves your machine.

## Add Elasticsearch for search (optional)

Yii has no built-in full-text search engine. When simple `LIKE` queries stop scaling, the [yii2-elasticsearch](https://github.com/yiisoft/yii2-elasticsearch) extension connects Yii's ActiveRecord API to an Elasticsearch cluster.

1. Start the search container:

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

2. Install the extension and point it at the container in `config/web.php`:

```bash
composer require yiisoft/yii2-elasticsearch
```

```php
'components' => [
    'elasticsearch' => [
        'class' => \yii\elasticsearch\Connection::class,
        'nodes' => [
            ['http_address' => 'elasticsearch:9200'],
        ],
    ],
],
```

Your search-backed models now extend `yii\elasticsearch\ActiveRecord` and index into the cluster. Leave it out until you need it; plain MySQL queries cover most apps.

## Take your app live

When your app is ready, the same Laradock stack becomes your deployment. You build one hardened image of your app and ship it to the host of your choice:

```bash
./laradock ship
```

Then pick a target and follow its short guide, a single server, a managed platform, or Kubernetes: **[Deploy to Production](https://laradock.io/docs/production)** lists every provider (Fly.io, Render, Railway, DigitalOcean, AWS, Google Cloud, Azure, Kamal, Kubernetes) with a ready config file for each. There is no per-provider magic to learn; a Docker image runs the same everywhere.

## Frequently Asked Questions

### Do I need to install PHP or Composer to run Yii with Laradock?

No. Everything lives inside the containers. Composer, git and the `php yii` console are all in the `workspace` container; you never install PHP on your host.

### Which services should I start for a typical Yii app?

`nginx mysql workspace` is all Yii requires: web server, database, and a shell. Swap `mysql` for `postgres` if you prefer. Add `redis`, `mailpit`, `elasticsearch`, `rabbitmq` or `beanstalkd` only when you wire up the matching feature (caching, mail, search, or a queue), each in its own section above; without that wiring they do nothing for Yii.

### How do I run background jobs or a scheduler?

Install [yii2-queue](https://github.com/yiisoft/yii2-queue) and run `php yii queue/listen` from the `workspace` container for background jobs; register console commands and call them from the workspace crontab for scheduled tasks. See [Run background jobs](#run-background-jobs-with-a-queue-worker) and [Schedule recurring tasks](#schedule-recurring-tasks-cron) above.

### Can I run multiple Yii apps on different PHP versions?

Yes. Give each its own Laradock with a unique `COMPOSE_PROJECT_NAME` and `DATA_PATH_HOST`, set a different `PHP_VERSION` in each, and they run independently on the same machine.

### Does this work the same on macOS, Windows and Linux?

Yes. Laradock runs anywhere Docker runs. On macOS/Windows, file-sync speed depends on Docker Desktop (VirtioFS helps a lot); it is a Docker Desktop trait, not specific to Laradock.

### Is this the same Docker setup I would use in production?

The containers are production-style (real NGINX + PHP-FPM), so it is far closer to production than the built-in PHP development server. See [Prepare Laradock for Production](https://laradock.io/docs/production#prepare-laradock-for-production) for the hardening steps.

---

Comparing environments? See the full **[Laradock vs Others](https://laradock.io/docs/laradock-alternatives)** breakdown. Ready to start? **[Getting Started](https://laradock.io/docs/getting-started)** takes about five minutes.
