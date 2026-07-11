---
slug: /drupal-on-docker
title: Run Drupal on Docker
description: Run Drupal on Docker in minutes with Laradock. What Docker gives a Drupal site, why Laradock is the fastest way to get NGINX, PHP, MySQL and Redis running, and the exact commands, with any PHP version, without installing anything on your machine.
keywords:
  - drupal on docker
  - run drupal on docker
  - drupal docker
  - drupal docker setup
  - dockerize drupal
  - drupal docker environment
  - drupal nginx mysql docker
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

## What is Drupal?

[Drupal](https://www.drupal.org) is an enterprise-grade open source CMS known for modeling complex, structured content: multiple content types, taxonomies, multilingual sites, and fine-grained permissions, all through modules and a large ecosystem. A Drupal site is a PHP application backed by a database (MySQL, MariaDB, PostgreSQL or SQLite are all supported), served through a web server. To boot and run, that is all it needs. On busier installs it also benefits from Redis for caching, Solr for search, and a real cron runner, each of which you add when you actually want it.

## Why run Drupal in Docker?

Docker packages each of those pieces (NGINX, PHP-FPM, MySQL, Redis) into isolated containers that run the same on every machine. Instead of installing PHP and MySQL onto your laptop, where versions collide between sites and "works on my machine" starts, you run disposable containers that mirror production and vanish cleanly when you delete them. One site can run PHP 8.3 while another, older Drupal 9 install runs 8.1, on the same computer, with nothing installed globally.

The catch: wiring those containers together yourself (base images, PHP extensions, networking, permissions) is a week of fiddly Docker work. That is exactly what Laradock removes.

## Why Laradock is the best fit for Drupal

Drupal ships its own official Docker image on Docker Hub, so, unlike most PHP projects, it does not strictly need Laradock. It is still the best fit, and here is why:

- **You are never locked into one ecosystem.** Laradock is framework-agnostic. The day you add a Laravel API, a WordPress marketing site, or a plain PHP script beside your Drupal site, it runs in the same environment with the same commands. A single-purpose image cannot do that.
- **Far more flexibility.** 100+ ready services and any PHP version from 5.6 to 8.5, versus the narrower set of tags the official image maintains.
- **Nothing is hidden and you own everything.** No generated files, no magic, no wrapper binary between you and Docker. Every Dockerfile and compose file is right there for you to read and edit.
- **Nothing new to learn.** What you use is plain `docker compose`, knowledge that transfers straight to production and to every other project. Our [CLI](/docs/cli) is an optional nicety, never a requirement.

For Drupal specifically, Laradock wires a production-style NGINX + PHP-FPM stack, MySQL/MariaDB/PostgreSQL ready to connect (with Redis, Solr and a mail catcher each one command away), and a `workspace` container with Composer, Node, npm and git already installed, ready to add Drush.

## Run Drupal on Docker with Laradock

### 1. Add Laradock to your project

```bash
cd my-drupal-site
git clone https://github.com/laradock/laradock.git
cd laradock
```

(No Drupal codebase yet? Clone Laradock first, then build one from the workspace container in the next steps.)

### 2. Pick the services your site needs

Drupal needs exactly two things to boot: a **web server** and a **database**. The web server pulls in PHP-FPM automatically, so this is the whole required stack:

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

> **Do I need Redis or Solr?** Not to get running. A fresh Drupal site runs perfectly on `nginx mysql workspace`. Redis and Solr only help once you install and configure their Drupal modules, so they live in their own sections below: add them when a site actually needs them.

### 3. Point Drupal at the containers

In `sites/default/settings.php`, use the service name as the database host:

```php
$databases['default']['default'] = [
  'database' => 'default',
  'username' => 'default',
  'password' => 'secret',
  'host' => 'mysql',
  'driver' => 'mysql',
];
```

The default database, user and password live in Laradock's `mysql/defaults.env`; override any of them by adding the line to Laradock's `.env` (it always wins).

### 4. Install and run your site

Enter the `workspace` container, where Composer, Node and git live, and set the site up:

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

Once inside, create the codebase (skip if you already have one) and add Drush, Drupal's command-line companion:

```bash
composer create-project drupal/recommended-project .   # only if you have no Drupal codebase yet
composer require drush/drush                            # Drush is not bundled; add it once
```

Now finish the install either in the browser or from the command line:

```bash
# Command line (fastest): creates the DB tables and the admin account in one go
vendor/bin/drush site:install standard \
  --db-url=mysql://default:secret@mysql/default \
  --site-name="My Site" \
  --account-name=admin --account-pass=secret -y
```

Then open [http://localhost](http://localhost). That is a full Drupal site running on Docker. Prefer clicking through? Skip the command above, open the URL, and the install wizard asks for the database host (`mysql`), name, user and password from the step before, then creates the admin account for you.

## Add Redis caching (optional)

Redis is not required, but on a busy site it holds Drupal's cache and lock data in memory and takes that load off the database. Wiring it up is three steps:

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

2. From the `workspace` container, add and enable the [Redis module](https://www.drupal.org/project/redis):

```bash
composer require drupal/redis
vendor/bin/drush en redis -y
```

3. Point Drupal at the container by adding these lines to the end of `sites/default/settings.php`:

```php
$settings['redis.connection']['interface'] = 'PhpRedis';
$settings['redis.connection']['host']      = 'redis';
$settings['cache']['default']              = 'cache.backend.redis';
```

Rebuild the cache with `vendor/bin/drush cache:rebuild` and Drupal now stores its cache in Redis. The `phpredis` extension is already baked into Laradock's PHP-FPM and workspace images, so there is nothing to install on your host. Without those steps the Redis container just sits idle, which is why the required stack above leaves it out.

## Add Solr search (optional)

Drupal's built-in search works out of the box, but for large content sets or faceted search most sites move to [Apache Solr](https://www.drupal.org/project/search_api_solr) through the Search API. Laradock ships a Solr container:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock start solr
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose up -d solr
```

</TabItem>
</Tabs>

From the `workspace` container, add the modules:

```bash
composer require drupal/search_api drupal/search_api_solr
vendor/bin/drush en search_api search_api_solr -y
```

Then in the admin at **Configuration > Search and metadata > Search API**, add a server backed by Solr and point it at host `solr`, port `8983`. Attach an index, add your content types, and Drupal hands queries to Solr instead of the database. The Solr admin UI is at [http://localhost:8983](http://localhost:8983) if you want to inspect cores.

## Add a mail catcher (optional)

During development you rarely want Drupal to send real email (password resets, notifications). Laradock's Mailpit container catches every outgoing message and shows it in a web inbox instead:

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

Add the [SMTP module](https://www.drupal.org/project/smtp) and route mail through the container:

```bash
composer require drupal/smtp
vendor/bin/drush en smtp -y
vendor/bin/drush config:set smtp.settings smtp_on 1 -y
vendor/bin/drush config:set smtp.settings smtp_host mailpit -y
vendor/bin/drush config:set smtp.settings smtp_port 1025 -y
```

Every email Drupal sends now lands in the Mailpit inbox at [http://localhost:8025](http://localhost:8025) instead of a real address.

## Run cron and background queues

Drupal relies on cron for search indexing, cache clears, update checks, and queue processing. By default it runs automated cron on visitor page loads, which is fine for a quick local site but unreliable. Run it explicitly from the `workspace` container whenever you need it:

```bash
vendor/bin/drush cron          # run all scheduled tasks now
vendor/bin/drush queue:list    # see queued work
vendor/bin/drush queue:run <queue_name>   # drain one queue immediately
```

To run cron on a real schedule without keeping the workspace open, add one line to your host machine's crontab that calls into the container:

```bash
* * * * * cd /path/to/laradock && docker compose exec -T workspace vendor/bin/drush cron
```

If your site uses [Advanced Queue](https://www.drupal.org/project/advancedqueue) or another worker module, run its processor the same way (`drush advancedqueue:queue:process <queue>`) so long-running jobs never block a web request.

## Build your theme's assets

Custom Drupal themes usually compile CSS and JavaScript with Node tooling. Node, npm and Yarn are already inside the `workspace` container, so you never install them on your host. From the workspace, `cd` into your theme and run its build:

```bash
cd web/themes/custom/my_theme
npm install
npm run build        # or: npm run watch  while you work
```

Because the workspace shares your project files, the compiled assets appear straight back in your codebase and the running site picks them up. Set the Node version with `NODE_VERSION` in Laradock's `.env` if a theme needs a specific one.

## Import an existing Drupal database

Moving a site from a server or a teammate? Drop the SQL dump anywhere in your project (it is mounted into the workspace) and import it from there:

```bash
vendor/bin/drush sql:cli < dump.sql
# or, without Drush:
mysql -h mysql -u default -psecret default < dump.sql
```

Copy the site's `sites/default/files` directory into your codebase for uploaded media, then run `vendor/bin/drush cache:rebuild`. To pull a database and files directly from another Drush-enabled environment, `vendor/bin/drush sql:sync` and `drush rsync` do it in one step.

## First admin login and everyday Drush tooling

Drush is how you drive the site from the command line inside the `workspace` container. The most common tasks:

```bash
vendor/bin/drush user:login              # print a one-time login link for user 1
vendor/bin/drush user:password admin 'new-pass'   # reset a forgotten admin password
vendor/bin/drush cache:rebuild           # clear all caches after config or code changes
vendor/bin/drush updatedb                # apply pending database updates after an upgrade
vendor/bin/drush config:export           # export configuration to sync files
```

`drush user:login` gives you a one-time link that logs you straight into the admin, which is the quickest way in if you skipped setting a password during install.

## Run several sites at once (multisite)

Drupal can serve many sites from one codebase. Add a `sites/sites.php` mapping each hostname to a folder, give each its own `settings.php` with its own database, and target one with Drush using `--uri`:

```bash
vendor/bin/drush --uri=http://site-two.localhost cache:rebuild
```

For entirely separate projects on different PHP versions, run a second Laradock instead: give it a unique `COMPOSE_PROJECT_NAME` and `DATA_PATH_HOST` so the two stacks never collide.

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

Drupal 10 needs PHP 8.1 or newer, and Drupal 11 needs PHP 8.3 or newer; Laradock covers anything from PHP 5.6 to 8.5, so the same tool runs a legacy Drupal 9 site and a brand-new Drupal 11 site side by side, each isolated, none of it installed on your machine.

## Take your site live

When your site is ready, the same Laradock stack becomes your deployment. You build one hardened image of your app and ship it to the host of your choice:

```bash
./laradock ship
```

Then pick a target and follow its short guide, a single server, a managed platform, or Kubernetes: **[Deploy to Production](/docs/production)** lists every provider (Fly.io, Render, Railway, DigitalOcean, AWS, Google Cloud, Azure, Kamal, Kubernetes) with a ready config file for each. There is no per-provider magic to learn; a Docker image runs the same everywhere.

## Frequently Asked Questions

### Do I need to install PHP, Composer or Drush to run Drupal with Laradock?

No. Everything lives inside the containers. Composer, Node, npm and git are in the `workspace` container, and you add Drush to your project with one `composer require drush/drush`; you never install PHP on your host.

### Which services should I start for a typical Drupal site?

`nginx mysql workspace` is all Drupal requires: web server, database, and a shell. Swap `mysql` for `postgres` or `mariadb` if you prefer. Add `redis` (caching), `solr` (search) or `mailpit` (catching outgoing mail) only when you install and configure their Drupal modules, as shown in the sections above.

### Can I run multiple Drupal sites on different PHP versions?

Yes. Give each its own Laradock with a unique `COMPOSE_PROJECT_NAME` and `DATA_PATH_HOST`, set a different `PHP_VERSION` in each, and they run independently on the same machine.

### Does this work the same on macOS, Windows and Linux?

Yes. Laradock runs anywhere Docker runs. On macOS/Windows, file-sync speed depends on Docker Desktop (VirtioFS helps a lot for `vendor/`-heavy sites); it is a Docker Desktop trait, not specific to Laradock.

### Is this the same Docker setup I would use in production?

The containers are production-style (real NGINX + PHP-FPM), so it is far closer to production than a native install. See [Prepare Laradock for Production](/docs/production#prepare-laradock-for-production) for the hardening steps.

---

Comparing environments? See **[Laradock vs Drupal Docker](/docs/laradock-vs-drupal-docker)** (DDEV & the official image) and the full **[Laradock vs Others](/docs/laradock-alternatives)** breakdown. Ready to start? **[Getting Started](/docs/getting-started)** takes about five minutes.
