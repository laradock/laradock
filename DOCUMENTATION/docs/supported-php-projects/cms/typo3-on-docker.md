---
slug: /typo3-on-docker
title: Run TYPO3 on Docker
description: Run TYPO3 on Docker in minutes with Laradock. What Docker gives a TYPO3 site, why Laradock is the fastest way to get NGINX, PHP, MySQL and Redis running, and the exact commands, with any PHP version, without installing anything on your machine.
keywords:
  - typo3 on docker
  - run typo3 on docker
  - typo3 docker
  - typo3 docker setup
  - dockerize typo3
  - typo3 docker environment
  - typo3 nginx mysql docker
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

## What is TYPO3?

[TYPO3](https://typo3.org) is an enterprise-grade open source CMS, common at large organizations and government sites, built around a strict content structure (TCA), multi-site and multi-language management from a single install, a command-line tool (`vendor/bin/typo3`) and a scheduler for background jobs, plus a large extension ecosystem. A TYPO3 site is a PHP application backed by a database (MySQL, MariaDB, PostgreSQL and SQLite are all supported) and served through a web server. It runs on that alone; caching backends like Redis, a mail transport, and a search engine are things you add when you want them.

## Why run TYPO3 in Docker?

Docker packages each of those pieces (NGINX, PHP-FPM, MySQL) into isolated containers that run the same on every machine. Instead of installing PHP and MySQL onto your laptop, where versions collide between sites and "works on my machine" starts, you run disposable containers that mirror production and vanish cleanly when you delete them. One site can run PHP 8.3 while an older TYPO3 v11 install runs 8.1, on the same computer, with nothing installed globally.

The catch: wiring those containers together yourself (base images, PHP extensions, networking, permissions) is a week of fiddly Docker work. That is exactly what Laradock removes.

## Why Laradock is the best fit for TYPO3

TYPO3 has no official Docker tool of its own (only third-party images maintained outside the core project), so a ready-made, no-lock-in environment matters even more. Here is why Laradock is the best fit:

- **You are never locked into one ecosystem.** Laradock is framework-agnostic. Run TYPO3 today, add a Laravel API, a WordPress marketing site, or a plain PHP script beside it tomorrow, all in the same environment with the same commands.
- **Far more flexibility.** 100+ ready services and any PHP version from 5.6 to 8.5, so an older TYPO3 v11 site and a current v13 LTS site each get exactly the runtime they need.
- **Nothing is hidden and you own everything.** No generated files, no magic, no wrapper binary between you and Docker. Every Dockerfile and compose file is right there for you to read and edit.
- **Nothing new to learn.** What you use is plain `docker compose`, knowledge that transfers straight to production. Our [CLI](/docs/cli) is an optional nicety, never a requirement.

Concretely, for TYPO3 it gives you a production-style NGINX + PHP-FPM stack, MySQL/MariaDB/PostgreSQL ready to connect, and a `workspace` container with Composer, Node and git installed, so `vendor/bin/typo3` commands, the scheduler and Composer all work exactly like they would on a native install. Redis, a mail catcher and a search engine are each one command away when you want them.

## Run TYPO3 on Docker with Laradock

### 1. Add Laradock to your project

```bash
cd my-typo3-site
git clone https://github.com/laradock/laradock.git
cd laradock
```

(No TYPO3 project yet? Clone Laradock first, then create one from the workspace container in the next steps.)

### 2. Pick the services your site needs

TYPO3 needs exactly two things to boot: a **web server** and a **database**. The web server pulls in PHP-FPM automatically, so this is the whole required stack:

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

Prefer PostgreSQL or MariaDB? Swap the name: `./laradock start nginx postgres workspace` (or `docker compose up -d nginx postgres workspace`). The full catalog is [here](/docs/Intro#supported-services).

Prefer to be asked? The optional [CLI](/docs/cli) walks you through the choices: `./laradock setup`, then `./laradock start`. It prints every real command it runs.

> **Do I need Redis?** Not to get running. A fresh TYPO3 site runs perfectly on `nginx mysql workspace`; it stores its caches in the database by default. Redis only helps on busier installs, and only once you point TYPO3's caching framework at it. See [Add Redis caching](#add-redis-caching-optional) below when you actually want it.

### 3. Point TYPO3 at the containers

TYPO3's install tool asks for the database connection in the browser (or via `vendor/bin/typo3 setup` on the command line); use the service name as the host:

```
Driver: mysqli
Host: mysql
Username: default
Password: secret
Database: default
```

The default database, user and password live in Laradock's `mysql/defaults.env`; override any of them by adding the line to Laradock's `.env` (it always wins).

### 4. Install and run your site

Enter the `workspace` container, where Composer, Node and git live, and create the project:

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
composer create-project typo3/cms-base-distribution . ^13   # only if you have no project yet
composer exec typo3 setup
```

`composer exec typo3 setup` walks you through the database connection and the first admin account on the command line (the browser-based install tool works the same way if you open [http://localhost/typo3/install.php](http://localhost/typo3/install.php)). Then open [http://localhost](http://localhost). That is a full TYPO3 site running on Docker.

## Add Redis caching (optional)

Redis is not required, but on a busy site it moves TYPO3's page, hash and other caches out of the database and into memory, which noticeably speeds up the front end and the backend. Wiring it up is two steps:

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

2. Point TYPO3's caching framework at it in `config/system/additional.php` (the hostname is the Redis service name, `redis`):

```php
$GLOBALS['TYPO3_CONF_VARS']['SYS']['caching']['cacheConfigurations']['pages'] = [
    'backend' => \TYPO3\CMS\Core\Cache\Backend\RedisBackend::class,
    'options' => [
        'hostname' => 'redis',
        'port' => 6379,
        'database' => 0,
    ],
];

$GLOBALS['TYPO3_CONF_VARS']['SYS']['caching']['cacheConfigurations']['hash'] = [
    'backend' => \TYPO3\CMS\Core\Cache\Backend\RedisBackend::class,
    'options' => [
        'hostname' => 'redis',
        'port' => 6379,
        'database' => 1,
    ],
];
```

Give each cache its own `database` number so flushing one does not clear the others. Without this config the Redis container just sits idle, which is why the required stack above leaves it out.

## Send mail through MailHog (optional)

TYPO3 sends notifications, install-tool messages and form submissions through the Symfony mailer. In development you do not want those going to real inboxes. Start MailHog and every message lands in a web UI instead:

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

Point TYPO3 at it in `config/system/additional.php` (or under **Admin Tools > Settings > Configure Installation-Wide Options > MAIL** in the backend):

```php
$GLOBALS['TYPO3_CONF_VARS']['MAIL']['transport'] = 'smtp';
$GLOBALS['TYPO3_CONF_VARS']['MAIL']['transport_smtp_server'] = 'mailhog:1025';
```

Open [http://localhost:8025](http://localhost:8025) to read everything TYPO3 sends. Swap `mailhog` for `mailpit` if you prefer Mailpit (same idea, port `1025`).

## Add full-text search (optional)

TYPO3 ships a search engine in core: enable the **Indexed Search** system extension and it indexes your pages into the database you already run, no extra container needed:

```bash
composer require typo3/cms-indexed-search
vendor/bin/typo3 extension:setup
```

For large or high-traffic sites, the community **[EXT:solr](https://docs.typo3.org/p/apache-solr-for-typo3/solr/main/en-us/)** extension gives far richer faceted search on top of Apache Solr. Note that it needs a Solr instance pre-loaded with TYPO3's own cores and schema (the `typo3solr/ext-solr` image), so it is not a drop-in for a generic search container; follow that extension's Docker instructions and set its **Host** to the Solr service name in your site configuration.

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

TYPO3 v13 requires PHP 8.2 or newer, and v12 requires PHP 8.1 or newer; Laradock covers anything from PHP 5.6 to 8.5, so the same tool runs an older v11 site and a current v13 LTS site side by side, each isolated, none of it installed on your machine.

## Run the TYPO3 scheduler (cron)

TYPO3 runs indexing, cache warmups, newsletters and your own tasks through its **Scheduler**. On a server you trigger it with a cron entry; with Laradock you run the same command from the `workspace` container:

```bash
vendor/bin/typo3 scheduler:run
```

To have it fire automatically every few minutes, add one line to your host machine's crontab that execs into the container (adjust the path to your project):

```cron
*/15 * * * * cd /path/to/laradock && docker compose exec -T workspace vendor/bin/typo3 scheduler:run
```

`vendor/bin/typo3 scheduler:list` shows every registered task, and `scheduler:execute --task-id=<id>` fires one on demand regardless of whether it is due. You register and manage tasks in the backend under **System > Scheduler**.

## Everyday CLI and admin tasks

The `vendor/bin/typo3` binary in the `workspace` container is the same one you use in production. The commands you reach for most:

```bash
vendor/bin/typo3 cache:flush              # clear all caches after a config or template change
vendor/bin/typo3 cache:warmup             # rebuild caches ahead of the next request
vendor/bin/typo3 database:updateschema    # apply pending schema changes (run after installing extensions)
vendor/bin/typo3 extension:setup          # set up extensions after composer require
vendor/bin/typo3 upgrade:run              # run upgrade wizards after a major version bump
```

Install any extension with Composer and let TYPO3 wire it in:

```bash
composer require georgringer/news
vendor/bin/typo3 extension:setup
vendor/bin/typo3 database:updateschema
```

## Log in to the backend the first time

The admin account you created during `typo3 setup` is your backend login. Open [http://localhost/typo3](http://localhost/typo3), sign in, and you land in the TYPO3 backend. Need another admin later? Create one from the workspace:

```bash
vendor/bin/typo3 setup --no-interaction --create-site="" \
  --admin-username=editor --admin-user-password='Sup3r.Secret!' --admin-email=editor@example.com
```

If you ever lock yourself out, the same command resets or adds an admin without touching the browser.

## Run multiple sites and languages from one install

Multi-site and multi-language delivery is native TYPO3, not an add-on, and it works unchanged in Docker. In the backend under **Site Management > Sites** you define each site's domain, entry point and languages; the configuration is written to `config/sites/<identifier>/config.yaml` in your project, so it lives in git with the rest of your code. Every site is served by the single `nginx` + `php-fpm` stack you already started, so adding a second or third site needs no new containers. For local testing of multiple hostnames, add them to your machine's hosts file pointing at `127.0.0.1` and set the matching entry points in each site config.

## Build a sitepackage's CSS and JavaScript

TYPO3 renders pages server-side with Fluid templates, so a basic site needs no build step. When your theme (sitepackage) extension ships its own SCSS or JavaScript, the `workspace` container already has Node, npm and Yarn, so you build assets right where the code lives:

```bash
cd packages/my-sitepackage        # your sitepackage extension
npm install
npm run build                     # or: npm run watch while developing
```

No Node is installed on your host; it all runs in the container next to PHP.

## Import an existing TYPO3 database

Moving a site from another environment? Drop the SQL dump next to your project so it is visible inside the container, then import it from the `workspace` shell:

```bash
mysql -h mysql -u default -psecret default < dump.sql
```

Copy the site's `fileadmin/` and any uploaded files into place, then let TYPO3 reconcile the schema and caches:

```bash
vendor/bin/typo3 database:updateschema
vendor/bin/typo3 cache:flush
```

Using PostgreSQL instead? Import with `psql -h postgres -U default -d default -f dump.sql`. Either way the host is just the database service name.

## Take your site live

When your site is ready, the same Laradock stack becomes your deployment. You build one hardened image of your app and ship it to the host of your choice:

```bash
./laradock ship
```

Then pick a target and follow its short guide, a single server, a managed platform, or Kubernetes: **[Deploy to Production](/docs/production)** lists every provider (Fly.io, Render, Railway, DigitalOcean, AWS, Google Cloud, Azure, Kamal, Kubernetes) with a ready config file for each. There is no per-provider magic to learn; a Docker image runs the same everywhere.

## Frequently Asked Questions

### Do I need to install PHP or Composer to run TYPO3 with Laradock?

No. Everything lives inside the containers. Composer, Node, git and the `vendor/bin/typo3` command line are all in the `workspace` container; you never install PHP on your host.

### Which services should I start for a typical TYPO3 site?

`nginx mysql workspace` is all TYPO3 requires: web server, database, and a shell. Swap `mysql` for `postgres` or `mariadb` if you prefer. Add `redis` only once you point TYPO3's caching framework at it (see [Add Redis caching](#add-redis-caching-optional)), and `mailhog` when you want to catch outgoing email; without wiring, neither does anything for TYPO3.

### How do I run scheduled tasks and cron jobs?

Run `vendor/bin/typo3 scheduler:run` from the `workspace` container, and add a cron line on your host that execs it every 15 minutes. See [Run the TYPO3 scheduler](#run-the-typo3-scheduler-cron) above.

### Can I run multiple TYPO3 sites on different PHP versions?

Yes. Give each its own Laradock with a unique `COMPOSE_PROJECT_NAME` and `DATA_PATH_HOST`, set a different `PHP_VERSION` in each, and they run independently on the same machine. (Multiple sites that share one PHP version can also run from a single TYPO3 install via Site Management, no extra Laradock needed.)

### Does this work the same on macOS, Windows and Linux?

Yes. Laradock runs anywhere Docker runs. On macOS/Windows, file-sync speed depends on Docker Desktop (VirtioFS helps a lot for `vendor/`-heavy sites); it is a Docker Desktop trait, not specific to Laradock.

### Is this the same Docker setup I would use in production?

The containers are production-style (real NGINX + PHP-FPM), so it is far closer to production than a native install. See [Prepare Laradock for Production](/docs/production#prepare-laradock-for-production) for the hardening steps.

---

Comparing environments? See the full **[Laradock vs Others](/docs/laradock-alternatives)** breakdown. Ready to start? **[Getting Started](/docs/getting-started)** takes about five minutes.
