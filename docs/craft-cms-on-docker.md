# Run Craft CMS on Docker

Source: https://laradock.io/docs/craft-cms-on-docker

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

## What is Craft CMS?

[Craft CMS](https://craftcms.com) is a professional CMS built on the Yii 2 PHP framework, known for a highly flexible content-modeling system (any structure of fields and blocks, not a fixed set of post types) aimed at agencies and custom builds. A Craft CMS site is a PHP application that needs a web server, a PHP runtime, and a real database; unlike a flat-file CMS, Craft requires MySQL or PostgreSQL to run at all. Everything else, background queues, Redis caching, mail, front-end asset builds, is optional and layered on when you want it.

## Why run Craft CMS in Docker?

Docker packages each of those pieces (NGINX, PHP-FPM, MySQL) into isolated containers that run the same on every machine. Instead of installing PHP and MySQL onto your laptop, where versions collide between sites and "works on my machine" starts, you run disposable containers that mirror production and vanish cleanly when you delete them. One site can run PHP 8.3 while another Craft 4 site pins to 8.2, on the same computer, with nothing installed globally.

The catch: wiring those containers together yourself (base images, PHP extensions, networking, permissions) is a week of fiddly Docker work. That is exactly what Laradock removes.

## Why Laradock is the best fit for Craft CMS

Craft CMS ships its own official Docker images (`craftcms/nginx`, `craftcms/php`, `craftcms/cli`), so, unlike most PHP projects, it does not strictly need Laradock. It is still the best fit, and here is why:

- **You are never locked into one ecosystem.** Laradock is framework-agnostic. The day you add a Laravel API, a WordPress site, or a plain PHP script beside your Craft install, it runs in the same environment with the same commands. Purpose-built images cannot do that.
- **Far more flexibility.** 100+ ready services and any PHP version from 5.6 to 8.5, versus the narrower set of tags the official images maintain.
- **Nothing is hidden and you own everything.** No generated files, no magic, no wrapper binary between you and Docker. Every Dockerfile and compose file is right there for you to read and edit.
- **Nothing new to learn.** What you use is plain `docker compose`, knowledge that transfers straight to production and to every other project. Our [CLI](https://laradock.io/docs/cli) is an optional nicety, never a requirement.

Concretely, for Craft CMS, Laradock wires a production-style NGINX + PHP-FPM stack, MySQL/PostgreSQL already available, and a `workspace` container with Composer, git and Node installed, so the `php craft` console and your front-end build tools work exactly like they would on a native install. Redis, a mail catcher and a queue worker are each one command away when you want them.

## Run Craft CMS on Docker with Laradock

### 1. Add Laradock to your project

```bash
cd my-craft-site
git clone https://github.com/laradock/laradock.git
cd laradock
```

(No Craft project yet? Clone Laradock first, then create one from the workspace container in the next steps.)

### 2. Pick the services your site needs

Craft CMS needs a web server and a database; there is no flat-file mode, so pick one now. The web server pulls in PHP-FPM automatically, so this is the whole required stack:

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

> **Do I need Redis?** Not to get running. Craft's cache, sessions and queue all work on the database out of the box, a fresh site runs perfectly on `nginx mysql workspace`. Redis only helps once you wire it up, see [Add Redis caching](#add-redis-caching-optional) below when you want it.

### 3. Point Craft CMS at the containers

In your project's `.env`, use the service name as the database connection host:

```env
CRAFT_DB_DRIVER=mysql
CRAFT_DB_SERVER=mysql
CRAFT_DB_PORT=3306
CRAFT_DB_DATABASE=default
CRAFT_DB_USER=default
CRAFT_DB_PASSWORD=secret
```

For PostgreSQL, set `CRAFT_DB_DRIVER=pgsql`, `CRAFT_DB_SERVER=postgres` and `CRAFT_DB_PORT=5432`. The default database, user and password live in Laradock's `mysql/defaults.env` (or `postgres/defaults.env`); override any of them by adding the line to Laradock's `.env` (it always wins).

### 4. Install and run your site

Enter the `workspace` container, where Composer, git and Node live, and run the installer:

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
composer create-project craftcms/craft my-craft-site   # only if you have no project yet
php craft install
```

`php craft install` walks you through the database connection, site name, URL and admin account (or pass `--email`, `--username`, `--password`, `--site-name` and `--site-url` for an unattended run). Then open [http://localhost](http://localhost). That is a full Craft CMS site running on Docker.

## First login and the control panel

Craft's admin area (the control panel) lives at [http://localhost/admin](http://localhost/admin). Log in with the admin account you created during `php craft install`.

Need another admin, or locked out of the first one? Create or fix a user from the `workspace` container:

```bash
php craft users/create --email=you@example.com --username=you --password=secret --admin=1
```

## Add Redis caching (optional)

Redis is not required, Craft caches to the database out of the box. On a busier site, moving the cache (and optionally sessions and the queue) to Redis takes the load off MySQL and speeds up the control panel. Wiring it up is three steps:

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

2. From the `workspace` container, add the Redis driver Craft builds on:

```bash
composer require yiisoft/yii2-redis
```

3. Point Craft at the `redis` container in your project `.env`, then swap the cache component in `config/app.php`:

```env
REDIS_HOSTNAME=redis
```

```php
<?php
use craft\helpers\App;

return [
    'components' => [
        'cache' => function() {
            return Craft::createObject([
                'class' => yii\redis\Cache::class,
                'keyPrefix' => Craft::$app->id,
                'redis' => [
                    'class' => yii\redis\Connection::class,
                    'hostname' => App::env('REDIS_HOSTNAME') ?: 'localhost',
                    'port' => 6379,
                    'password' => App::env('REDIS_PASSWORD') ?: null,
                    'database' => 0,
                ],
            ]);
        },
    ],
];
```

That is it, Craft now stores its data cache in Redis. You can reuse the same connection for `session` (`yii\redis\Session`) and the `queue` (`yii\queue\redis\Queue`); give each its own `database` number (0, 1, 2...) so one flush never wipes another. Without these steps the Redis container just sits idle, which is why the required stack above leaves it out.

## Run the background queue

Craft runs jobs (updating search indexes, generating image transforms, propagating content across sites) through a queue. By default it processes that queue during control-panel requests, which is fine for local work and low-traffic sites, so there is nothing to start for a basic setup.

When you want jobs to run continuously without waiting on a browser request, run a listener from the `workspace` container:

```bash
php craft queue/listen --verbose
```

It checks for new jobs every few seconds and runs them as they arrive. For an always-on worker that survives restarts, set `runQueueAutomatically` to `false` in `config/general.php` and run the listener under Laradock's Supervisor-based `php-worker` container (point its program command at `php /var/www/craft queue/listen --verbose`). Long-running workers must be restarted after each deploy so they pick up new code.

## Send and test mail

Craft sends transactional email (password resets, verification, notifications). To catch that mail locally instead of sending it out, start the built-in mail catcher:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock start mailhog
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose up -d mailhog
```

</TabItem>
</Tabs>

Then in the control panel go to **Settings, Email**, set the transport type to **SMTP**, host `mailhog`, and port `1025`. Every message Craft sends now lands in MailHog's web inbox at [http://localhost:8025](http://localhost:8025) instead of a real address. (Prefer the newer catcher? Swap `mailhog` for `mailpit`, host `mailpit`, same port 1025, inbox at [http://localhost:8025](http://localhost:8025).)

## Search

Craft's search is built into the CMS and runs on your existing database, so there is no search engine to install for the default experience. Content is indexed automatically as you save entries (large re-indexes run through the [queue](#run-the-background-queue)). If you outgrow native search, community plugins can offload it to Elasticsearch or Algolia; start the engine with `./laradock start elasticsearch` and follow the plugin's setup. For most Craft sites the built-in search is all you need.

## Run a multi-site install

Craft's multi-site feature serves several sites (different languages, brands or domains) from one install and one database, no extra services required. Add each site under **Settings, Sites** in the control panel, giving it a base URL such as `http://localhost` or `http://fr.localhost`.

To serve a second hostname locally, add it to your machine's `hosts` file and to Laradock's NGINX config (`nginx/sites/`), then reload:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock restart nginx
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose restart nginx
```

</TabItem>
</Tabs>

Because every site shares the same containers, PHP version and database, there is nothing extra to run for multi-site beyond the required stack.

## Build front-end assets

The `workspace` container ships Node, npm and Yarn, so your theme's build tooling runs right beside PHP, with nothing installed on your host. From inside the container, in your project root:

```bash
npm install
npm run dev      # start the dev server / watcher (Vite, Laravel Mix, webpack, etc.)
npm run build    # produce the production bundle
```

If you use a hot-reloading dev server (for example the [Vite plugin](https://nystudio107.com/plugins/vite) many Craft sites adopt), expose its port by adding it to the `workspace` service in `docker-compose.yml` so the browser can reach it. The control panel's own assets are prebuilt, this step is only for your site's front end.

## Console commands, migrations and project config

Everything you would run natively as `php craft ...` runs the same from the `workspace` container. The essentials:

```bash
php craft up                       # apply pending migrations + project config in one step
php craft project-config/apply     # sync config changes pulled from git
php craft clear-caches/all         # clear Craft's caches
php craft resave/entries           # re-save content after field or section changes
php craft gc                        # run garbage collection
php craft help                     # list every available command
```

Craft's [project config](https://craftcms.com/docs/5.x/system/project-config.html) is how settings travel between environments in git. After pulling changes, `php craft up` (or `project-config/apply`) brings the database in line with the committed config.

## Import an existing database

Moving a live Craft site onto Laradock is a database restore plus your project files. From the `workspace` container:

```bash
php craft db/restore path/to/backup.sql
```

Craft's own `db/restore` handles the driver details for you. You can also pipe a dump straight into the database container, for MySQL:

```bash
mysql -h mysql -u default -psecret default < path/to/backup.sql
```

After restoring, run `php craft up` to apply any pending migrations and project config, then `php craft clear-caches/all`. To go the other way and snapshot the current database, use `php craft db/backup`.

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

Craft CMS 5 requires PHP 8.2 or newer, and Laradock covers anything from PHP 5.6 to 8.5, so the same tool runs an older Craft 4 site and a current Craft 5 site side by side, each isolated, none of it installed on your machine.

## Take your site live

When your site is ready, the same Laradock stack becomes your deployment. You build one hardened image of your app and ship it to the host of your choice:

```bash
./laradock ship
```

Then pick a target and follow its short guide, a single server, a managed platform, or Kubernetes: **[Deploy to Production](https://laradock.io/docs/production)** lists every provider (Fly.io, Render, Railway, DigitalOcean, AWS, Google Cloud, Azure, Kamal, Kubernetes) with a ready config file for each. There is no per-provider magic to learn; a Docker image runs the same everywhere.

## Frequently Asked Questions

### Do I need to install PHP or Composer to run Craft CMS with Laradock?

No. Everything lives inside the containers. Composer, git and Node are in the `workspace` container; you never install PHP on your host.

### Which services should I start for a typical Craft CMS site?

`nginx mysql workspace` is all Craft requires: web server, database, and a shell. Swap `mysql` for `postgres` if you prefer. Add `redis` only after you wire it into `config/app.php`, and `mailhog` only when you want to catch outgoing email; without that wiring neither does anything for Craft.

### How do I run Craft's background queue?

For local work you do not have to, Craft runs jobs during control-panel requests by default. For a continuous worker, run `php craft queue/listen --verbose` from the `workspace` container, or drive it with Laradock's `php-worker` container for an always-on daemon. See [Run the background queue](#run-the-background-queue).

### Can I run multiple Craft CMS sites on different PHP versions?

Yes. Give each its own Laradock with a unique `COMPOSE_PROJECT_NAME` and `DATA_PATH_HOST`, set a different `PHP_VERSION` in each, and they run independently on the same machine. (This is separate from Craft's built-in multi-site, which serves several sites from one install.)

### Does this work the same on macOS, Windows and Linux?

Yes. Laradock runs anywhere Docker runs. On macOS/Windows, file-sync speed depends on Docker Desktop (VirtioFS helps a lot for `vendor/`-heavy sites); it is a Docker Desktop trait, not specific to Laradock.

### Is this the same Docker setup I would use in production?

The containers are production-style (real NGINX + PHP-FPM), so it is far closer to production than a native install. See [Prepare Laradock for Production](https://laradock.io/docs/production#prepare-laradock-for-production) for the hardening steps.

---

Comparing environments? See the full **[Laradock vs Others](https://laradock.io/docs/laradock-alternatives)** breakdown. Ready to start? **[Getting Started](https://laradock.io/docs/getting-started)** takes about five minutes.
