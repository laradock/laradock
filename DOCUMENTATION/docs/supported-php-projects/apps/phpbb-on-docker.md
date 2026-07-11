---
slug: /phpbb-on-docker
title: Run phpBB on Docker
description: Run phpBB on Docker in minutes with Laradock. What Docker gives a phpBB forum, why Laradock is the fastest way to get NGINX, PHP and MySQL running, and the exact commands, with any PHP version, without installing anything on your machine.
keywords:
  - phpbb on docker
  - run phpbb on docker
  - phpbb docker
  - phpbb docker setup
  - dockerize phpbb
  - phpbb docker environment
  - phpbb nginx mysql docker
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

## What is phpBB?

[phpBB](https://www.phpbb.com) is one of the longest-running free and open-source forum packages, known for its large library of styles and extensions and its wide localization support. It is a PHP application backed by a database (MySQL/MariaDB, PostgreSQL or SQLite are all supported), served through a web server, and installed through a browser-based setup wizard. Its only recurring background work is a lightweight cron (email queue, pruning, digests) that either runs on page views or, on a real site, from the system cron.

## Why run phpBB in Docker?

Docker packages each of those pieces (NGINX, PHP-FPM, MySQL) into isolated containers that run the same on every machine. Instead of installing PHP and MySQL onto your laptop, where versions collide between projects and "works on my machine" starts, you run disposable containers that mirror production and vanish cleanly when you delete them. One forum can run an older PHP version to keep a legacy phpBB install and its extensions working, while another project runs the latest PHP, on the same computer, with nothing installed globally.

The catch: wiring those containers together yourself (base images, PHP extensions, networking, permissions) is a week of fiddly Docker work. That is exactly what Laradock removes.

## Why Laradock is the best fit for phpBB

The phpBB project maintains [phpbb/docker](https://github.com/phpbb/docker), but that repository is explicitly built for the project's own CI and quick development testing, not for running a production forum; phpBB's own documentation still points site owners toward a manual install. That leaves no ready-made production Docker tool, which is exactly where Laradock fits:

- **You are never locked into one ecosystem.** Laradock is framework-agnostic. Run your phpBB forum today, add a Laravel API, a WordPress marketing site, or a plain PHP script beside it tomorrow, all in the same environment with the same commands.
- **Far more flexibility.** 100+ ready services and any PHP version from 5.6 to 8.5, so an older forum with legacy extensions and a fresh install each get exactly the runtime they need.
- **Nothing is hidden and you own everything.** No generated files, no magic, no wrapper binary between you and Docker. Every Dockerfile and compose file is right there for you to read and edit.
- **Nothing new to learn.** What you use is plain `docker compose`, knowledge that transfers straight to production. Our [CLI](/docs/cli) is an optional nicety, never a requirement.

Concretely, for phpBB it gives you a production-style NGINX + PHP-FPM stack, MySQL/MariaDB/PostgreSQL ready to connect, and a `workspace` container with git, Composer and phpBB's own `phpbbcli.php` command line all on `PATH` for unpacking the package, running upgrades and driving cron.

## Run phpBB on Docker with Laradock

### 1. Add Laradock to your project

```bash
cd my-phpbb-forum
git clone https://github.com/laradock/laradock.git
cd laradock
```

(No phpBB files yet? Clone Laradock first, then download and extract the phpBB package from the `workspace` container in the next steps.)

### 2. Pick the services your forum needs

phpBB needs exactly two things: a **web server** and a **database**. The web server pulls in PHP-FPM automatically, so this is the whole required stack:

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

Prefer PostgreSQL or MariaDB? Swap the name: `./laradock start nginx postgres workspace` (or `docker compose up -d nginx mariadb workspace`). The full catalog is [here](/docs/Intro#supported-services).

Prefer to be asked? The optional [CLI](/docs/cli) walks you through the choices: `./laradock setup`, then `./laradock start`. It prints every real command it runs.

> **Do I need Redis or a search server?** Not to get running. phpBB ships its own native full-text search that works on the database you already started, and it caches to disk out of the box. A fresh forum runs perfectly on `nginx mysql workspace`. Redis caching is one command away when you want it (see [Add Redis caching](#add-redis-caching-optional) below).

### 3. Point phpBB at the containers

phpBB's installer asks for these values in the browser; use the service name as the database host:

```
Database Server: MySQL
Database Server Hostname: mysql
Database Name: default
Database Username: default
Database Password: secret
```

The default database, user and password live in Laradock's `mysql/defaults.env`; override any of them by adding the line to Laradock's `.env` (it always wins).

### 4. Install and run your forum

Enter the `workspace` container, place the phpBB files in your project's web root (download the package from [phpbb.com](https://www.phpbb.com/downloads/) and extract it if you have not already), then finish the setup in the browser:

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

Then open `http://localhost/install/` and follow phpBB's install wizard: it checks your PHP version and extensions, asks for the database details from the step above, and creates the admin account. Delete or lock down the `install/` directory once it is done, as phpBB's own docs recommend, then open [http://localhost](http://localhost) to see your forum.

## First admin login and the ACP

The install wizard creates your first administrator account from the username, password and email you enter on its final steps. There is no separate setup: those credentials are the admin. Once install is finished:

- Your forum is at [http://localhost](http://localhost).
- The **Administration Control Panel (ACP)**, where every setting below lives, is at `http://localhost/adm/`. Log in there with the admin account you just created; phpBB asks for the password again before it opens the panel.
- The **Moderation Control Panel (MCP)** for day-to-day moderation is linked from any topic.

If you ever lock yourself out, phpBB ships a `bin/phpbbcli.php user:add` and password-reset flow you can run from the `workspace` container (see [CLI tooling](#manage-extensions-and-upgrades-from-the-cli) below).

## Import an existing forum database

Moving a live forum onto Laradock is a file copy plus a database import, no phpBB reinstall:

1. Copy your existing forum files into the project web root (the folder next to `laradock`), including its `config.php`.
2. Put your SQL dump somewhere the `workspace` container can see it (anywhere in the project works, it is mounted) and import it into the `mysql` container:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock workspace
mysql -h mysql -u default -psecret default < forum-backup.sql
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose exec workspace bash
mysql -h mysql -u default -psecret default < forum-backup.sql
```

</TabItem>
</Tabs>

3. Edit the forum's `config.php` so it points at the containers, not the old server:

```php
$dbhost = 'mysql';
$dbname = 'default';
$dbuser = 'default';
$dbpasswd = 'secret';
```

4. Clear phpBB's cache so it forgets the old settings:

```bash
php bin/phpbbcli.php cache:purge
```

Open [http://localhost](http://localhost) and your forum is running against the container database. If it came from an older phpBB, run the upgrade in the [CLI section](#manage-extensions-and-upgrades-from-the-cli) first.

## Run phpBB's cron from the host (scheduler)

phpBB has a small amount of scheduled work: sending queued emails, pruning old topics, refreshing digests and search housekeeping. By default it piggybacks on page views, which is fine while you develop. On a real forum you switch it to the system cron so the work happens on a fixed schedule instead of slowing down a visitor's page load.

1. In the ACP, open **General -> Server settings** and set **Run periodic tasks from system cron** to **Yes**.
2. Have the host run phpBB's cron command against the `workspace` container on a schedule. Add this to your machine's crontab (`crontab -e`) to fire every five minutes:

```cron
*/5 * * * * cd /path/to/laradock && docker compose exec -T workspace php bin/phpbbcli.php cron:run >/dev/null 2>&1
```

The `-T` disables the TTY so cron can run it non-interactively. You can run the same command by hand from inside the `workspace` container any time you want to flush the queue immediately:

```bash
php bin/phpbbcli.php cron:run
```

## Add a mail catcher (optional)

phpBB sends email for registrations, notifications and admin messages. You do not want those going to real inboxes while testing, and most machines have no local mail server anyway. Laradock's MailHog captures every message in a web inbox instead. Two steps:

1. Start MailHog alongside the rest:

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

2. In the ACP, open **General -> Client communication -> Email settings** and set:

```
Use SMTP server for email: Yes
SMTP server address: mailhog
SMTP server port: 1025
Authentication method for SMTP: No authentication
```

Leave the SMTP username and password blank. Now every email phpBB sends lands in the MailHog inbox at [http://localhost:8025](http://localhost:8025), including the **Send a test email** button on that same settings page. Nothing leaves your machine.

## Add Redis caching (optional)

phpBB caches to disk by default, which is fine for one machine. On a busier forum you can point its cache (the ACM layer) at Redis to keep it in memory and off the filesystem. phpBB has a built-in Redis driver, so no extension install is needed inside phpBB itself, and Laradock's PHP image already bundles the `redis` PHP extension. Two steps:

1. Start the Redis container:

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

2. Add these lines to your forum's `config.php`, using the service name as the host:

```php
$acm_type = 'redis';
@define('PHPBB_ACM_REDIS_HOST', 'redis');
@define('PHPBB_ACM_REDIS_PORT', 6379);
```

Purge the cache once with `php bin/phpbbcli.php cache:purge` from the `workspace` container and phpBB now stores its cache in Redis. Without those lines the container just sits idle, which is why the required stack above leaves it out.

## Search: native full text vs a larger index

phpBB includes its own **native full-text search**, which works immediately on the database you already started, no extra service. For most forums that is all you need. If you want to change the backend, open **General -> Search settings** in the ACP; phpBB lists the backends your database supports:

- **phpBB native full text** (default): richest results, indexes short words, uses more disk.
- **MySQL/PostgreSQL full text**: a smaller database-level index, lighter but coarser (MySQL only indexes words of four or more letters).

After switching backend, click **Create index** on that page to build it. Very large boards can also run phpBB against an external Sphinx server, but that is a scaling step well beyond a normal Laradock forum; the two built-in backends above cover almost everyone.

## Manage extensions and upgrades from the CLI

The `workspace` container has phpBB's own command line tool, `bin/phpbbcli.php`, on hand. Enter the container (`./laradock workspace`), `cd` into your forum's web root, and you can drive phpBB without the browser:

```bash
php bin/phpbbcli.php list                     # every available command
php bin/phpbbcli.php cache:purge              # clear the cache
php bin/phpbbcli.php cron:run                 # run scheduled tasks now
php bin/phpbbcli.php db:migrate               # apply DB migrations (used on upgrades)
php bin/phpbbcli.php extension:enable vendor/name
php bin/phpbbcli.php extension:disable vendor/name
```

**Installing an extension:** drop it under `ext/vendor/name` in your forum, then enable it from the ACP (**Customise -> Manage extensions**) or with `extension:enable` above. Styles work the same way, dropped under `styles/` and enabled in the ACP.

**Upgrading phpBB:** replace the package files with the newer release, then run `php bin/phpbbcli.php db:migrate` to bring the database up to date, and `cache:purge` afterwards. Because the runtime is a container, you can bump `PHP_VERSION` for the new release in the same step (next section).

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

phpBB 3.3 needs PHP 7.2 or newer and is tested against current PHP 8.x releases; Laradock covers anything from PHP 5.6 to 8.5, so the same tool runs an older phpBB install with legacy extensions and a brand-new one side by side, each isolated, none of it installed on your machine.

## Take your forum live

When your forum is ready, the same Laradock stack becomes your deployment. You build one hardened image of your app and ship it to the host of your choice:

```bash
./laradock ship
```

Then pick a target and follow its short guide, a single server, a managed platform, or Kubernetes: **[Deploy to Production](/docs/production)** lists every provider (Fly.io, Render, Railway, DigitalOcean, AWS, Google Cloud, Azure, Kamal, Kubernetes) with a ready config file for each. There is no per-provider magic to learn; a Docker image runs the same everywhere. Remember to switch phpBB to the [system cron](#run-phpbbs-cron-from-the-host-scheduler) and point [email at a real SMTP server](#add-a-mail-catcher-optional) instead of MailHog when you go live.

## Frequently Asked Questions

### Do I need to install PHP or MySQL to run phpBB with Laradock?

No. Everything lives inside the containers. PHP, its required extensions, the database server and phpBB's own `phpbbcli.php` tool are all provided; you never install them on your host.

### Which services should I start for a typical phpBB forum?

`nginx mysql workspace` is all phpBB requires: web server, database, and a shell. Swap `mysql` for `postgres` or `mariadb` if you prefer. Search works out of the box with no extra service. Add `mailhog` to catch outgoing email and `redis` only if you switch phpBB's cache to Redis; neither is needed to boot.

### How do I run phpBB's scheduled tasks (cron)?

Set **Run periodic tasks from system cron** to Yes in the ACP, then have your host run `docker compose exec -T workspace php bin/phpbbcli.php cron:run` every few minutes. See [Run phpBB's cron from the host](#run-phpbbs-cron-from-the-host-scheduler).

### Can I run multiple phpBB forums on different PHP versions?

Yes. Give each its own Laradock with a unique `COMPOSE_PROJECT_NAME` and `DATA_PATH_HOST`, set a different `PHP_VERSION` in each, and they run independently on the same machine.

### Does this work the same on macOS, Windows and Linux?

Yes. Laradock runs anywhere Docker runs. On macOS/Windows, file-sync speed depends on Docker Desktop (VirtioFS helps a lot); it is a Docker Desktop trait, not specific to Laradock.

### Is this the same Docker setup I would use in production?

The containers are production-style (real NGINX + PHP-FPM), so it is far closer to production than a native install. See [Prepare Laradock for Production](/docs/production#prepare-laradock-for-production) for the hardening steps.

---

Comparing environments? See the full **[Laradock vs Others](/docs/laradock-alternatives)** breakdown. Ready to start? **[Getting Started](/docs/getting-started)** takes about five minutes.
