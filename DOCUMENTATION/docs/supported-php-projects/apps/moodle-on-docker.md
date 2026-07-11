---
slug: /moodle-on-docker
title: Run Moodle on Docker
description: Run Moodle on Docker in minutes with Laradock. What Docker gives a Moodle LMS, why Laradock is the fastest way to get NGINX, PHP and MySQL running, plus the exact commands for cron, Redis caching, Solr search and mail, with any PHP version, without installing anything on your machine.
keywords:
  - moodle on docker
  - run moodle on docker
  - moodle docker
  - moodle docker setup
  - dockerize moodle
  - moodle docker environment
  - moodle nginx mysql docker
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

## What is Moodle?

[Moodle](https://moodle.org) is the most widely used open-source learning management system (LMS), running courses, quizzes, grading and certification for schools, universities and companies worldwide. It is a PHP application backed by a database (MySQL/MariaDB or PostgreSQL), served through a web server, and it needs two things beyond that to be a real site: a writable `moodledata` directory outside the web root, and a cron job that runs every minute to process notifications, backups, quiz grading and every other scheduled task. Redis (caching), Solr (global search) and an SMTP server (mail) are optional add-ons you turn on when you need them.

## Why run Moodle in Docker?

Docker packages each of those pieces (NGINX, PHP-FPM, MySQL) into isolated containers that run the same on every machine. Instead of installing PHP and MySQL onto your laptop, where versions collide between sites and "works on my machine" starts, you run disposable containers that mirror production and vanish cleanly when you delete them. One Moodle site can run the latest PHP required by Moodle 5.x while another stays on an older PHP version for a Moodle 4.x install with legacy plugins, on the same computer, with nothing installed globally.

The catch: wiring those containers together yourself (base images, PHP extensions, networking, permissions) is a week of fiddly Docker work. That is exactly what Laradock removes.

## Why Laradock is the best fit for Moodle

Moodle HQ maintains [moodle-docker](https://github.com/moodlehq/moodle-docker), but it is explicitly built for Moodle core developers and automated testing (Behat, CI), not for running a real site; the third-party Bitnami image many guides point to is no longer freely available either. That leaves a gap for anyone who just wants to run a Moodle site locally, which is exactly where Laradock fits:

- **You are never locked into one ecosystem.** Laradock is framework-agnostic. Run Moodle today, add a Laravel API, a WordPress marketing site, or a plain PHP script beside it tomorrow, all in the same environment with the same commands.
- **Far more flexibility.** 100+ ready services and any PHP version from 5.6 to 8.5, so an older Moodle 4.x course platform and a fresh Moodle 5.x install each get exactly the runtime they need.
- **Nothing is hidden and you own everything.** No generated files, no magic, no wrapper binary between you and Docker. Every Dockerfile and compose file is right there for you to read and edit.
- **Nothing new to learn.** What you use is plain `docker compose`, knowledge that transfers straight to production. Our [CLI](/docs/cli) is an optional nicety, never a requirement.

Concretely, for Moodle it gives you a production-style NGINX + PHP-FPM stack with the extensions Moodle needs (including `sodium`), MySQL/MariaDB/PostgreSQL ready to connect, a `workspace` container with git, Composer, Node and PHP's CLI (for the installer, cron and Grunt) installed, and Redis, Solr and a mail catcher each one command away when you want them.

## Run Moodle on Docker with Laradock

### 1. Add Laradock to your project

```bash
cd my-moodle-site
git clone https://github.com/laradock/laradock.git
cd laradock
```

(No Moodle files yet? Clone Laradock first, then download the Moodle package from the `workspace` container in the next steps.)

### 2. Pick the services your site needs

Moodle needs exactly two things to boot: a **web server** and a **database**. The web server pulls in PHP-FPM automatically, so this is the whole required stack:

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

Prefer MariaDB or PostgreSQL? Swap the name: `./laradock start nginx mariadb workspace` or `./laradock start nginx postgres workspace` (or the `docker compose up -d ...` equivalent). The full catalog is [here](/docs/Intro#supported-services).

Prefer to be asked? The optional [CLI](/docs/cli) walks you through the choices: `./laradock setup`, then `./laradock start`. It prints every real command it runs.

> **Do I need Redis or Solr?** Not to get running. A fresh Moodle site runs perfectly on `nginx mysql workspace`. Redis (caching) and Solr (global search) are both add-ons that need a config step inside Moodle to do anything, so they are their own sections below: [Add Redis caching](#add-redis-caching-optional) and [Add Solr global search](#add-solr-global-search-optional). The one thing every real site does need is [cron](#keep-moodle-running-cron-and-scheduled-tasks), and that is a job, not a service.

### 3. Point Moodle at the containers

In your `config.php`, use the service names as hostnames:

```php
$CFG->dbtype    = 'mysqli';
$CFG->dbhost    = 'mysql';
$CFG->dbname    = 'default';
$CFG->dbuser    = 'default';
$CFG->dbpass    = 'secret';
$CFG->wwwroot   = 'http://localhost';
$CFG->dataroot  = '/var/www/moodledata';
```

The default database, user and password live in `mysql/defaults.env`; override any of them by adding the line to Laradock's `.env` (it always wins). Make sure `moodledata` lives outside your web root (the path above is beside the site, not inside it) and is writable by the container.

### 4. Install and run your site

Enter the `workspace` container and run the CLI installer (or open the browser wizard instead, once the files are in place):

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

Once inside, download Moodle (skip if you already have the files) and run the installer:

```bash
# only if you have no Moodle files yet:
git clone --branch MOODLE_500_STABLE --depth 1 https://github.com/moodle/moodle.git .

php admin/cli/install.php --wwwroot=http://localhost --dbtype=mysqli \
  --dbhost=mysql --dbname=default --dbuser=default --dbpass=secret \
  --fullname="My Site" --shortname="mysite" --adminuser=admin --adminpass=Secretpass1! \
  --adminemail=you@example.com --agree-license --non-interactive
```

Flag names can change between Moodle versions; run `php admin/cli/install.php --help` to confirm the current list. Then open [http://localhost](http://localhost) and log in as `admin` with the password you set. That is a full Moodle LMS running on Docker.

## Keep Moodle running: cron and scheduled tasks

This is the one background job every real Moodle site needs. Moodle runs quiz grading, email digests, backups, search indexing, plugin tasks and cleanup as **scheduled tasks** processed by `admin/cli/cron.php`, which Moodle expects to run **every minute**. Without it the site loads but notifications never send and nothing scheduled ever happens.

Run it once by hand to confirm it works:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock exec workspace php admin/cli/cron.php
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose exec -T workspace php admin/cli/cron.php
```

</TabItem>
</Tabs>

For a site you keep running, add one line to your **host machine's** crontab (`crontab -e`) so it fires every minute, pointing at the Laradock folder:

```cron
* * * * * cd /path/to/laradock && docker compose exec -T workspace php admin/cli/cron.php >/dev/null 2>&1
```

Heavy sites can also drain the ad-hoc task queue (bulk operations like course restores or large emails) in parallel with `php admin/cli/adhoc_task.php --execute`, and run a single scheduled task on demand with `php admin/cli/scheduled_task.php --execute='\core\task\send_new_user_passwords_task'`.

## Add Redis caching (optional)

Moodle uses the Moodle Universal Cache (MUC). Out of the box it caches to disk and the database; on a busy course platform, pointing the **application** and **session** caches at Redis is a big speedup. Wiring it up is three steps:

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

2. For the **session** cache, add these lines to `config.php` (host is the service name, `redis`):

```php
$CFG->session_handler_class = '\core\session\redis';
$CFG->session_redis_host    = 'redis';
$CFG->session_redis_port    = 6379;
```

3. For the **application** cache, define a Redis store in Moodle's admin UI, then map the caches to it: log in as admin, go to **Site administration > Plugins > Caching > Configuration**, add a store instance of type **Redis** with server `redis:6379`, then set it as the store used for the Application and Session definitions.

That is it, Moodle now keeps its caches in memory. Without those steps the Redis container just sits idle, which is why the required stack above leaves it out.

## Add Solr global search (optional)

Moodle's built-in search is limited to a simple database query. For real global search (indexing course content, forum posts, and even the text inside uploaded PDFs and Office files), Moodle uses a search engine backend, and Solr is the officially documented one. The `php-fpm` and `workspace` images already ship the `solr` PHP extension. Three steps:

1. Start the Solr container:

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

2. In Moodle, go to **Site administration > Plugins > Search > Manage global search**, set the search engine to **Solr**, and point it at the container: host `solr`, port `8983`, with your index (core) name. Then set the active search engine.

3. Build and keep the index fresh from the `workspace` container:

```bash
php admin/cli/cron.php                 # cron indexes new and changed content
php search/cli/indexer.php --reindex   # force a full rebuild after first setup
```

Prefer Elasticsearch instead? Laradock ships `elasticsearch` too (`./laradock start elasticsearch`); it works with Moodle through the community `search_elastic` plugin.

## Add Mailpit for outgoing mail (optional)

Moodle sends a lot of email (course notifications, forum digests, password resets). In development you do not want it hitting real inboxes, so route it to Mailpit, which captures every message in a web UI and never delivers anything.

1. Start the mail catcher:

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

2. In Moodle, go to **Site administration > Server > Email > Outgoing mail configuration** and set the SMTP hosts to `mailpit:1025` (leave the username, password and security fields blank).

3. Open the Mailpit inbox at [http://localhost:8125](http://localhost:8125) to read everything Moodle sends. Trigger a test with a forced cron run so a queued notification goes out.

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

Moodle 5.x requires PHP 8.2 or newer (8.3 and 8.4 are also supported), while older Moodle 4.x sites can run on PHP 7.4+; Laradock covers anything from PHP 5.6 to 8.5, so the same tool runs a legacy course platform and a brand-new install side by side, each isolated, none of it installed on your machine.

## Build theme and plugin assets with Grunt

If you develop themes or plugins, Moodle's JavaScript (AMD modules), SCSS and language strings are compiled with Grunt, and the `workspace` container already has Node and npm. From the Moodle root inside `workspace`:

```bash
npm install          # first time only, installs Moodle's build toolchain
npx grunt            # compile everything
npx grunt watch      # rebuild automatically as you edit
```

Use `npx grunt amd` for just JavaScript modules or `npx grunt scss` for just styles. Because Node lives in the container, your host stays clean and every developer builds against the same toolchain.

## Everyday admin from the command line

Moodle ships dozens of CLI scripts under `admin/cli/`, all runnable from `workspace` (`./laradock workspace`, then run them). The ones you will reach for most:

```bash
php admin/cli/upgrade.php --non-interactive    # apply core/plugin upgrades after pulling new code
php admin/cli/purge_caches.php                 # clear all caches (do this after config or code changes)
php admin/cli/maintenance.php --enable         # put the site into maintenance mode (and --disable)
php admin/cli/cfg.php --name=debug --set=32767 # read or change any admin setting
php admin/cli/reset_password.php               # reset a user's password without email
```

Run any script with `--help` to see its options.

## Import an existing Moodle site

Moving a live site onto Laradock is a database import plus the `moodledata` folder:

1. Copy your SQL dump and `moodledata` backup into the project, then from `workspace`:

```bash
mysql -u default -psecret default < /var/www/backup.sql   # import the database
```

2. Restore your `moodledata` contents to the path in `$CFG->dataroot` (for example `/var/www/moodledata`), keeping it writable by the container.

3. Edit `config.php` so `$CFG->dbhost` is `mysql`, `$CFG->dataroot` matches step 2, and `$CFG->wwwroot` is `http://localhost`.

4. Clear caches so the new host and paths take effect:

```bash
php admin/cli/purge_caches.php
```

Open [http://localhost](http://localhost) and your existing courses, users and grades are there. (PostgreSQL dumps import the same way with `psql -h postgres -U default default < backup.sql`.)

## Run several Moodle sites at once

Moodle core has no built-in multisite (unlike WordPress); each site is its own install. To run more than one, give each its own copy of Laradock with a unique `COMPOSE_PROJECT_NAME` and `DATA_PATH_HOST` in `.env`, and its own `$CFG->wwwroot`. They run independently on the same machine, each free to use a different `PHP_VERSION`, so a production-mirror on PHP 8.2 and a plugin sandbox on PHP 8.4 coexist without touching each other.

## Take your site live

When your site is ready, the same Laradock stack becomes your deployment. You build one hardened image of your app and ship it to the host of your choice:

```bash
./laradock ship
```

Then pick a target and follow its short guide, a single server, a managed platform, or Kubernetes: **[Deploy to Production](/docs/production)** lists every provider (Fly.io, Render, Railway, DigitalOcean, AWS, Google Cloud, Azure, Kamal, Kubernetes) with a ready config file for each. There is no per-provider magic to learn; a Docker image runs the same everywhere. Remember to keep the cron line running on the production host too.

## Frequently Asked Questions

### Do I need to install PHP or MySQL to run Moodle with Laradock?

No. Everything lives inside the containers. PHP, its required extensions (including `sodium`, which recent Moodle versions need), Node for Grunt, and the database server are all provided; you never install them on your host.

### Which services should I start for a typical Moodle site?

`nginx mysql workspace` is all Moodle requires: web server, database, and a shell. Swap `mysql` for `mariadb` or `postgres` if you prefer. Then set up [cron](#keep-moodle-running-cron-and-scheduled-tasks) (a job, not a service), and add [Redis](#add-redis-caching-optional), [Solr](#add-solr-global-search-optional) or [Mailpit](#add-mailpit-for-outgoing-mail-optional) only when you want caching, global search or captured email.

### Can I run multiple Moodle sites on different PHP versions?

Yes. Give each its own Laradock with a unique `COMPOSE_PROJECT_NAME` and `DATA_PATH_HOST`, set a different `PHP_VERSION` in each, and they run independently on the same machine.

### Does this work the same on macOS, Windows and Linux?

Yes. Laradock runs anywhere Docker runs. On macOS/Windows, file-sync speed depends on Docker Desktop (VirtioFS helps a lot for Moodle's large codebase); it is a Docker Desktop trait, not specific to Laradock.

### Is this the same Docker setup I would use in production?

The containers are production-style (real NGINX + PHP-FPM), so it is far closer to production than a native install. See [Prepare Laradock for Production](/docs/production#prepare-laradock-for-production) for the hardening steps.

---

Comparing environments? See the full **[Laradock vs Others](/docs/laradock-alternatives)** breakdown. Ready to start? **[Getting Started](/docs/getting-started)** takes about five minutes.
