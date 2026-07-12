# Run MediaWiki on Docker

Source: https://laradock.io/docs/mediawiki-on-docker

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

## What is MediaWiki?

[MediaWiki](https://www.mediawiki.org) is the open-source wiki software that powers Wikipedia and thousands of other wikis, known for its extension and skin ecosystem and its ability to handle very large, heavily-edited content collections. It is a PHP application backed by a database (MySQL/MariaDB is recommended; PostgreSQL and SQLite are also supported), served through a web server. To boot and edit a wiki it needs only those two pieces. Everything else, full-text search, object caching, a background job runner, and outgoing email, is optional and added when a wiki gets real traffic.

## Why run MediaWiki in Docker?

Docker packages each of those pieces (Apache, PHP-FPM, MySQL) into isolated containers that run the same on every machine. Instead of installing PHP and MySQL onto your laptop, where versions collide between sites and "works on my machine" starts, you run disposable containers that mirror production and vanish cleanly when you delete them. One wiki can run the newer PHP MediaWiki now requires while another project stays on an older version, on the same computer, with nothing installed globally.

The catch: wiring those containers together yourself (base images, PHP extensions, networking, permissions) is a week of fiddly Docker work. That is exactly what Laradock removes.

## Why Laradock is the best fit for MediaWiki

Docker Hub does host a `mediawiki` image, but it is a generic Docker Official Image maintained by Docker, not a production tool endorsed by the MediaWiki project; it intentionally ships the bare minimum and is meant to be extended from, not run as-is. There is no first-party MediaWiki tool that wires up a web server, database, search and caching the way a project-specific setup would. Here is why Laradock is the best fit instead:

- **You are never locked into one ecosystem.** Laradock is framework-agnostic. Run your MediaWiki instance today, add a Laravel API, a WordPress site, or a plain PHP script beside it tomorrow, all in the same environment with the same commands.
- **Far more flexibility.** 100+ ready services and any PHP version from 5.6 to 8.5, so an older wiki install and a fresh one each get exactly the runtime they need.
- **Nothing is hidden and you own everything.** No generated files, no magic, no wrapper binary between you and Docker. Every Dockerfile and compose file is right there for you to read and edit.
- **Nothing new to learn.** What you use is plain `docker compose`, knowledge that transfers straight to production. Our [CLI](https://laradock.io/docs/cli) is an optional nicety, never a requirement.

Concretely, for MediaWiki it gives you a production-style Apache + PHP-FPM stack, MySQL/MariaDB/PostgreSQL ready to connect, a `workspace` container with git, Composer and PHP's CLI (for the installer, maintenance scripts and the job queue), and Elasticsearch, Redis and a mail catcher each one command away when you want them.

## Run MediaWiki on Docker with Laradock

### 1. Add Laradock to your project

```bash
cd my-wiki
git clone https://github.com/laradock/laradock.git
cd laradock
```

(No MediaWiki files yet? Clone Laradock first, then download the MediaWiki tarball from the `workspace` container in the next steps.)

### 2. Pick the services your wiki needs

MediaWiki needs exactly two things: a **web server** and a **database**. The web server pulls in PHP-FPM automatically, so this is the whole required stack:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock start apache2 mysql workspace
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
cp .env.example .env
docker compose up -d apache2 mysql workspace
```

</TabItem>
</Tabs>

Apache is the smoothest default for MediaWiki because its short-URL rewrites and the security `.htaccess` files in `images/` and `cache/` work with no extra config. Prefer NGINX? Swap the name (`./laradock start nginx mysql workspace`) and add MediaWiki's [NGINX rewrite rules](https://www.mediawiki.org/wiki/Manual:Short_URL/Nginx) by hand. Prefer PostgreSQL or MariaDB over MySQL? Swap that name too. The full catalog is [here](https://laradock.io/docs/Intro#supported-services).

Prefer to be asked? The optional [CLI](https://laradock.io/docs/cli) walks you through the choices: `./laradock setup`, then `./laradock start`. It prints every real command it runs.

> **Do I need Redis or a search server?** Not to get running. A fresh wiki runs perfectly on `apache2 mysql workspace`. Search falls back to a built-in database search, and caching falls back to the database. You add [Redis](#add-redis-object-caching-optional) and [CirrusSearch](#add-full-text-search-with-cirrussearch-optional) only when a busy wiki needs them, each covered below.

### 3. Point MediaWiki at the containers

In your `LocalSettings.php`, use the service names as hostnames:

```php
$wgDBtype     = 'mysql';
$wgDBserver   = 'mysql';
$wgDBname     = 'default';
$wgDBuser     = 'default';
$wgDBpassword = 'secret';
```

The default database, user and password live in `mysql/defaults.env`; override any of them by adding the line to Laradock's `.env` (it always wins).

### 4. Install and run your wiki

Enter the `workspace` container, where git, Composer and PHP's CLI live:

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

If you have no MediaWiki files yet, download and unpack a release tarball into your project (the tarball already includes its `vendor/` dependencies):

```bash
curl -LO https://releases.wikimedia.org/mediawiki/1.43/mediawiki-1.43.1.tar.gz
tar -xzf mediawiki-1.43.1.tar.gz --strip-components=1
```

Then finish setup in the browser at [http://localhost](http://localhost), or run the CLI installer (the maintenance script that writes `LocalSettings.php` and creates your first admin for you):

```bash
php maintenance/install.php --dbserver=mysql --dbname=default \
  --dbuser=default --dbpass=secret --pass=adminpassword \
  "My Wiki" Admin
```

That command creates a sysop account named `Admin` with the password you pass in `--pass`. On MediaWiki 1.40 and newer the same script is also reachable as `php maintenance/run.php install`, and the exact flags can vary by release, so run it with `--help` to confirm. Then open [http://localhost](http://localhost) and log in at **Special:UserLogin** with `Admin` and your password. That is a full MediaWiki install running on Docker.

## Add Redis object caching (optional)

Out of the box MediaWiki caches to the database, which is fine for a small wiki. On a busier one, Redis holds the object and session cache in memory and takes noticeable load off MySQL. Wiring it up is two steps:

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

2. Point MediaWiki at it in `LocalSettings.php`:

```php
$wgObjectCaches['redis'] = [
    'class'   => 'RedisBagOStuff',
    'servers' => [ 'redis:6379' ],
];
$wgMainCacheType    = 'redis';
$wgSessionCacheType = 'redis';
```

That is it, MediaWiki now stores its object and session cache in Redis. Prefer Memcached? Start `memcached` instead, then set `$wgMainCacheType = CACHE_MEMCACHED;` and `$wgMemCachedServers = [ 'memcached:11211' ];`. Without either step the container just sits idle, which is why the required stack above leaves it out.

## Add full-text search with CirrusSearch (optional)

MediaWiki's default search reads straight from the database and is fine for a small wiki. For fast, relevant full-text search (what Wikipedia uses) you add the **CirrusSearch** extension backed by Elasticsearch or OpenSearch.

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

(MediaWiki 1.44+ can also run against `opensearch`; start that container instead if you prefer it.)

2. From the `workspace` container, add the `Elastica` and `CirrusSearch` extensions into your `extensions/` folder (both ship with the tarball, or clone the matching `REL` branch), then enable them in `LocalSettings.php` and point CirrusSearch at the container:

```php
wfLoadExtension( 'Elastica' );
wfLoadExtension( 'CirrusSearch' );
$wgCirrusSearchClusters = [ 'default' => [ 'elasticsearch:9200' ] ];
$wgSearchType = 'CirrusSearch';
```

3. Still in the `workspace`, build the index and backfill your existing pages:

```bash
php extensions/CirrusSearch/maintenance/UpdateSearchIndexConfig.php
php extensions/CirrusSearch/maintenance/ForceSearchIndex.php --skipLinks --indexOnSkip
php extensions/CirrusSearch/maintenance/ForceSearchIndex.php --skipParse
```

New edits stay indexed automatically through the [job queue](#run-the-job-queue-in-the-background), so turn that on next.

## Catch outgoing email in development (optional)

Password resets, watchlist notifications and account confirmations all send mail. In development you do not want real email leaving your machine, so route it to **Mailpit**, which catches every message in a web inbox.

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

2. Point MediaWiki's SMTP at it in `LocalSettings.php`:

```php
$wgEnableEmail = true;
$wgSMTP = [
    'host'     => 'mailpit',
    'IDHost'   => 'localhost',
    'port'     => 1025,
    'auth'     => false,
];
$wgEmergencyContact = 'admin@localhost';
$wgPasswordSender   = 'admin@localhost';
```

Every message MediaWiki sends now lands in the Mailpit inbox at [http://localhost:8025](http://localhost:8025) instead of a real mailbox. Swap `mailpit` for `mailhog` (port 1025, inbox on 8025) if you prefer that catcher.

## Run the job queue in the background

MediaWiki defers slow work, link updates, search re-indexing, HTML cache purges, email, onto a **job queue**. By default it runs a few of those jobs on each web request, which makes some page loads slower. On any real wiki you turn that off and run a dedicated worker instead.

In `LocalSettings.php`, stop jobs from piggybacking on requests:

```php
$wgJobRunRate = 0;
```

Then, from the `workspace` container, drain the queue continuously:

```bash
php maintenance/run.php runJobs --wait
```

`--wait` keeps the process alive and picks up new jobs as they appear, so leave that shell open (or run it as a background worker) while you develop. On older MediaWiki the script is `php maintenance/runJobs.php`. For a Redis-backed queue that survives restarts, add `$wgJobTypeConf['default'] = [ 'class' => 'JobQueueRedis', 'redisServer' => 'redis:6379', 'redisConfig' => [] ];` after starting the `redis` container.

## Schedule maintenance with cron

A production wiki runs a handful of maintenance scripts on a schedule: draining the job queue, refreshing stale links, and expiring old data. From inside the `workspace` container you can add them to cron so they run unattended:

```cron
# drain the job queue every minute
* * * * * cd /var/www/my-wiki && php maintenance/run.php runJobs --maxtime=50 >> /dev/null 2>&1
# rebuild link tables nightly
0 2 * * * cd /var/www/my-wiki && php maintenance/run.php refreshLinks >> /dev/null 2>&1
```

Any maintenance script can be scheduled the same way. If you would rather not keep a shell open, this replaces the long-running `runJobs --wait` worker from the previous section.

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

MediaWiki's current stable release requires PHP 8.1 or newer, with the newest release requiring PHP 8.3+; Laradock covers anything from PHP 5.6 to 8.5, so the same tool runs an older wiki pinned to an older PHP version and a brand-new install side by side, each isolated, none of it installed on your machine.

## Install extensions and skins

MediaWiki's front-end assets are served at runtime by its built-in ResourceLoader, so there is no separate build step to run for the core software: install an extension or skin and it just works. From the `workspace` container:

1. Drop the extension into `extensions/` (or a skin into `skins/`), either from the tarball's bundle or by cloning the matching release branch:

```bash
git clone -b REL1_43 https://github.com/wikimedia/mediawiki-extensions-VisualEditor.git extensions/VisualEditor
```

2. If the extension ships a `composer.json`, install its PHP dependencies from inside that folder:

```bash
composer update --no-dev --working-dir=extensions/VisualEditor
```

3. Enable it in `LocalSettings.php` and apply any database changes it needs:

```php
wfLoadExtension( 'VisualEditor' );
```

```bash
php maintenance/run.php update --quick
```

`update.php` is the script you run after adding any extension, updating one, or upgrading MediaWiki itself; it applies schema changes safely and is idempotent.

## Run maintenance scripts from the workspace

Everything MediaWiki does from the command line lives in `maintenance/` and runs from the `workspace` container with `php maintenance/run.php <script>`. The ones you will reach for most:

```bash
php maintenance/run.php createAndPromote --sysop Admin newpassword  # create/promote an admin
php maintenance/run.php update                                      # apply DB changes after any change
php maintenance/run.php rebuildall                                  # rebuild caches and link tables
php maintenance/run.php importImages ./photos png jpg               # bulk-upload media
php maintenance/run.php resetUserEmail Admin you@example.com        # fix an account's email
```

No script needs anything installed on your host; PHP and every extension are already inside the container.

## Import an existing wiki

Moving a wiki onto Laradock is two parts: the database, then the files.

1. **Database.** Drop your SQL dump into the Laradock folder (it is mounted into the container) and load it from the `workspace`:

```bash
mysql -h mysql -u default -psecret default < dump.sql
```

2. **Content or a page export.** If instead you have a MediaWiki XML export (from `Special:Export` or `dumpBackup.php`), import it and rebuild the derived tables:

```bash
php maintenance/run.php importDump < pages.xml
php maintenance/run.php rebuildrecentchanges
php maintenance/run.php initSiteStats --update
```

3. **Finish up.** Copy the old `images/` directory into your project, then run `php maintenance/run.php update` so the schema matches your MediaWiki version. If you use [CirrusSearch](#add-full-text-search-with-cirrussearch-optional), reindex with `ForceSearchIndex.php` afterward.

## Run a wiki farm (multiple wikis)

MediaWiki can serve many wikis from one codebase (a "wiki family"). Point every wiki at the same MediaWiki files and let a shared `LocalSettings.php` branch on the requested host using MediaWiki's `$wgConf`, giving each wiki its own `$wgDBname` on the same `mysql` container. Because all of it runs inside the one Laradock stack, you add a wiki by creating its database and adding a case to that config, with no new containers to start. See MediaWiki's [wiki family manual](https://www.mediawiki.org/wiki/Manual:Wiki_family) for the config pattern; the Laradock side stays exactly the stack above.

## Take your wiki live

When your wiki is ready, the same Laradock stack becomes your deployment. You build one hardened image of your app and ship it to the host of your choice:

```bash
./laradock ship
```

Then pick a target and follow its short guide, a single server, a managed platform, or Kubernetes: **[Deploy to Production](https://laradock.io/docs/production)** lists every provider (Fly.io, Render, Railway, DigitalOcean, AWS, Google Cloud, Azure, Kamal, Kubernetes) with a ready config file for each. There is no per-provider magic to learn; a Docker image runs the same everywhere.

## Frequently Asked Questions

### Do I need to install PHP or MySQL to run MediaWiki with Laradock?

No. Everything lives inside the containers. PHP, its required extensions, and the database server are all provided; you never install them on your host.

### Which services should I start for a typical MediaWiki install?

`apache2 mysql workspace` is all MediaWiki requires: web server, database, and a shell. Swap `apache2` for `nginx`, or `mysql` for `mariadb` or `postgres`, if you prefer. Add `redis`, `elasticsearch` or `mailpit` only when you wire up [caching](#add-redis-object-caching-optional), [CirrusSearch](#add-full-text-search-with-cirrussearch-optional) or [dev email](#catch-outgoing-email-in-development-optional); without that config they do nothing for a wiki.

### How do I run the background job queue?

Set `$wgJobRunRate = 0` in `LocalSettings.php`, then run `php maintenance/run.php runJobs --wait` in the `workspace` container, or schedule it with [cron](#schedule-maintenance-with-cron). See [Run the job queue in the background](#run-the-job-queue-in-the-background).

### Can I run multiple MediaWiki instances on different PHP versions?

Yes. Give each its own Laradock with a unique `COMPOSE_PROJECT_NAME` and `DATA_PATH_HOST`, set a different `PHP_VERSION` in each, and they run independently on the same machine. To serve many wikis from one codebase instead, see [Run a wiki farm](#run-a-wiki-farm-multiple-wikis).

### Does this work the same on macOS, Windows and Linux?

Yes. Laradock runs anywhere Docker runs. On macOS/Windows, file-sync speed depends on Docker Desktop (VirtioFS helps a lot); it is a Docker Desktop trait, not specific to Laradock.

### Is this the same Docker setup I would use in production?

The containers are production-style (real Apache + PHP-FPM), so it is far closer to production than a native install. See [Prepare Laradock for Production](https://laradock.io/docs/production#prepare-laradock-for-production) for the hardening steps.

---

Comparing environments? See the full **[Laradock vs Others](https://laradock.io/docs/laradock-alternatives)** breakdown. Ready to start? **[Getting Started](https://laradock.io/docs/getting-started)** takes about five minutes.
