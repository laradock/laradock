# Run Nextcloud on Docker

Source: https://laradock.io/docs/nextcloud-on-docker

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

## What is Nextcloud?

[Nextcloud](https://nextcloud.com) is an open-source file sync, share and collaboration platform, a self-hosted alternative to Dropbox or Google Drive with calendar, contacts, and office-document apps built on top. It is known for giving individuals and organizations full control over where their data lives. A real Nextcloud instance needs a web server, a PHP runtime, and a database (MariaDB or MySQL is recommended; PostgreSQL is supported; SQLite is fine only for tiny, non-production installs). It also relies on scheduled background jobs, and benefits heavily from Redis for memory caching and transactional file locking once more than a handful of people use it.

## Why run Nextcloud in Docker?

Docker packages each of those pieces (NGINX, PHP-FPM, MariaDB, Redis) into isolated containers that run the same on every machine. Instead of installing PHP and a database onto your server, where versions collide between projects and "works on my machine" starts, you run disposable containers that mirror production and vanish cleanly when you delete them. One instance can run PHP 8.3 while another PHP-dependent project on the same host runs a different version, with nothing installed globally.

The catch: wiring those containers together yourself (base images, PHP extensions, networking, permissions) is a week of fiddly Docker work. That is exactly what Laradock removes.

## Why Laradock is the best fit for Nextcloud

Nextcloud already ships an official, well-maintained [Docker image](https://hub.docker.com/_/nextcloud) with Docker Hub support, arguably the strongest official Docker story of any project in this comparison set. If all you need is a single Nextcloud instance running on its own, that image is a perfectly reasonable choice. Laradock is still worth considering:

- **You are never locked into one container.** The official image is an all-in-one box; Laradock is framework-agnostic. Run Nextcloud today, add a Laravel API, a WordPress site, or a plain PHP script beside it tomorrow, all in the same environment with the same commands.
- **Far more flexibility.** 100+ ready services and any PHP version from 5.6 to 8.5, useful when you need to pin an older PHP version to stay inside a specific Nextcloud release's compatibility window while other projects on the same machine run something newer.
- **Nothing is hidden and you own everything.** No opaque all-in-one container, no generated files, no magic. Every Dockerfile and compose file is right there for you to read and edit.
- **Nothing new to learn.** What you use is plain `docker compose`, knowledge that transfers straight to production and to every other project. Our [CLI](https://laradock.io/docs/cli) is an optional nicety, never a requirement.

Concretely, for Nextcloud, Laradock wires a production-style NGINX + PHP-FPM stack, MariaDB/MySQL/PostgreSQL ready to connect, a Redis container one command away for caching and file locking, a mail catcher and Elasticsearch when you want them, and a `workspace` container with git, Composer and the PHP CLI already installed so you can run `occ` right away.

## Run Nextcloud on Docker with Laradock

### 1. Add Laradock to your project

```bash
cd my-nextcloud-install
git clone https://github.com/laradock/laradock.git
cd laradock
```

(No Nextcloud files yet? Clone Laradock first, then download the Nextcloud server archive from the workspace container in the next steps.)

### 2. Pick the services Nextcloud needs

Nextcloud needs exactly two things to boot: a **web server** and a **database**. The web server pulls in PHP-FPM automatically, so this is the whole required stack:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock start nginx mariadb workspace
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
cp .env.example .env
docker compose up -d nginx mariadb workspace
```

</TabItem>
</Tabs>

Prefer MySQL or PostgreSQL? Swap the name: `./laradock start nginx mysql workspace` (or `docker compose up -d nginx postgres workspace`). The full catalog is [here](https://laradock.io/docs/Intro#supported-services).

Prefer to be asked? The optional [CLI](https://laradock.io/docs/cli) walks you through the choices: `./laradock setup`, then `./laradock start`. It prints every real command it runs.

> **Do I need Redis?** Not to boot. A fresh Nextcloud runs on `nginx mariadb workspace` alone. But once real people use it, Redis is strongly recommended for transactional file locking and memory caching, and Nextcloud will not use it until you add the connection to `config.php`. See [Add Redis caching and file locking](#add-redis-caching-and-file-locking-recommended) below.

### 3. Point Nextcloud at the containers

Nextcloud's configuration lives in `config/config.php`. In a fresh install this file is generated for you by the installer (the browser wizard or `occ`), not hand-edited beforehand. What you need beforehand is the database connection info, which the installer will ask for, using the service names as hostnames:

- Database host: `mariadb` (or `mysql` / `postgres`)
- Database name / user / password: `default` / `default` / `secret`

The defaults live in `mariadb/defaults.env` (or `mysql/defaults.env`); override any of them by adding the line to Laradock's `.env` (it always wins).

### 4. Install and run

Enter the `workspace` container and fetch the Nextcloud server archive into your web root (adjust the path to match your `nginx` / `APP_CODE_PATH_CONTAINER` setting):

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

Once inside, fetch the archive and unpack it:

```bash
curl -LO https://download.nextcloud.com/server/releases/latest.zip
unzip latest.zip -d /var/www
cd /var/www/nextcloud
```

From here, Nextcloud can be installed two ways. The `occ` command-line tool does a scripted, headless install:

```bash
php occ maintenance:install \
  --database "mysql" --database-name "default" \
  --database-host "mariadb" --database-user "default" --database-pass "secret" \
  --admin-user "admin" --admin-pass "secret"
```

(The `--database "mysql"` driver value is the same for both MySQL and MariaDB; use `"pgsql"` for PostgreSQL.)

Or skip the CLI and open [http://localhost](http://localhost), where the setup wizard asks for the same admin account and database details. Either way, the admin user you name here is your **first login**: sign in at `http://localhost` with `admin` / `secret` and you land on the Files app. That is a full Nextcloud instance running on Docker.

## Add Redis caching and file locking (recommended)

Redis is not required to boot, but for any real use Nextcloud strongly recommends it: it holds the distributed cache and the transactional file lock (a plain database lock is slower and less reliable under concurrency). Nextcloud will not touch the Redis container until you wire it in `config/config.php`. Three steps:

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

2. Add the cache and locking backends to `config/config.php`. `APCu` is a fast local (per-server) cache and is already available in the PHP containers; Redis handles the distributed cache and the lock:

```php
'memcache.local'       => '\OC\Memcache\APCu',
'memcache.distributed' => '\OC\Memcache\Redis',
'memcache.locking'     => '\OC\Memcache\Redis',
'redis' => [
  'host' => 'redis',
  'port' => 6379,
],
```

3. Confirm Nextcloud picked it up:

```bash
php occ config:list system | grep -A6 memcache
```

That is it. Without those lines the Redis container just sits idle, which is why the required stack above leaves it out.

## Set up background jobs (cron)

Nextcloud runs housekeeping tasks (cleaning temp files, sending notifications, updating previews) as background jobs. A brand-new install uses **AJAX** mode, which fires jobs on page loads. That needs zero setup and is fine while you are only clicking around locally, but it is unreliable and Nextcloud will warn you about it.

For proper behavior, switch to **Cron** mode and call `cron.php` on a schedule. Set the mode once from the workspace container:

```bash
php occ background:cron
```

Then run `cron.php` every 5 minutes. For a quick local instance you can run it by hand or in a loop:

```bash
php -f /var/www/nextcloud/cron.php
```

To make it automatic, the `workspace` container ships with cron. Add a line to Laradock's `workspace/crontab/laradock` file and rebuild the workspace:

```cron
*/5 * * * * laradock php -f /var/www/nextcloud/cron.php
```

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock rebuild workspace
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose build workspace && docker compose up -d workspace
```

</TabItem>
</Tabs>

Check the result under **Administration settings > Basic settings**: the background-jobs indicator should show "Cron" with a recent "Last job execution".

## Add full-text search with Elasticsearch (optional)

Nextcloud's built-in search matches file and folder names. To search *inside* documents (PDFs, office files, text), add the Full text search app and point it at an Elasticsearch container.

1. Start Elasticsearch:

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

2. From the workspace container, install the three apps (the framework, the platform connector, and the files provider):

```bash
php occ app:install fulltextsearch
php occ app:install fulltextsearch_elasticsearch
php occ app:install files_fulltextsearch
```

3. Point the connector at the container and confirm it, then build the index:

```bash
php occ config:app:set fulltextsearch search_platform \
  --value "OCA\FullTextSearch_Elasticsearch\Platform\ElasticSearchPlatform"
php occ config:app:set fulltextsearch_elasticsearch elastic_host --value "http://elasticsearch:9200"
php occ config:app:set fulltextsearch_elasticsearch elastic_index --value "nextcloud"
php occ fulltextsearch:test
php occ fulltextsearch:index
```

Make sure the Elasticsearch version Laradock runs is one the connector app supports; a mismatch is the most common cause of a failing `fulltextsearch:test`. After the first index, new and changed files are picked up by the background cron job.

## Catch outgoing mail with Mailpit (optional)

Nextcloud sends email for password resets, share notifications and activity digests. In local development you do not want those going to real inboxes, so point Nextcloud at Laradock's [Mailpit](https://github.com/axllent/mailpit) container, which captures every message in a web UI instead of delivering it.

1. Start Mailpit:

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

2. Set the SMTP details from the workspace container (or fill the same values under **Administration settings > Basic settings > Email server**):

```bash
php occ config:system:set mail_smtpmode --value "smtp"
php occ config:system:set mail_smtphost --value "mailpit"
php occ config:system:set mail_smtpport --value "1025"
php occ config:system:set mail_from_address --value "admin"
php occ config:system:set mail_domain --value "example.com"
```

Trigger any email (invite a user, share a file) and open the Mailpit web UI at [http://localhost:8025](http://localhost:8025) to read it. Nothing leaves your machine.

## Run occ admin commands

`occ` (short for "ownCloud Console", Nextcloud's ancestor) is the admin CLI for everything the web UI does and more. It lives in the Nextcloud root and always runs from the `workspace` container:

```bash
php occ status                       # version and install state
php occ app:list                     # enabled and disabled apps
php occ user:add jane                # create a user
php occ user:resetpassword jane      # reset a password
php occ maintenance:mode --on        # take the instance offline for maintenance
php occ maintenance:repair           # run repair steps
php occ config:list system           # dump the effective config.php
```

Because everything is a container, you never prefix these with `sudo -u www-data`; the workspace shell already runs as the right user.

## Import an existing Nextcloud instance

Moving an install onto Laradock is three parts: the code (or a fresh download of the same version), the data directory, and the database.

1. Copy your `config/config.php`, your `data/` directory, and the app code into the web root, then start the stack with a matching database (`mariadb`, `mysql` or `postgres`).
2. Restore the database dump from the workspace container:

```bash
mysql -h mariadb -u default -psecret default < backup.sql
# PostgreSQL: psql -h postgres -U default default < backup.sql
```

3. Fix the host names in `config/config.php` so they point at the containers (`dbhost` becomes `mariadb`, the `redis` host becomes `redis`), then let Nextcloud re-scan the files it now sees on disk:

```bash
php occ maintenance:mode --off
php occ files:scan --all
php occ maintenance:repair
```

`files:scan` reconciles the database with whatever is actually in the data directory, which is exactly what you need after copying files in from outside Nextcloud.

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

Nextcloud's supported PHP range moves with every major release (Nextcloud 32 supports PHP 8.1-8.4, Nextcloud 34 supports PHP 8.2-8.5, for example), so pinning the exact version an install needs, and changing it later for an upgrade, is a one-line edit instead of a host-level PHP reinstall.

## Take your instance live

When your Nextcloud is ready, the same Laradock stack becomes your deployment. You build one hardened image of your app and ship it to the host of your choice:

```bash
./laradock ship
```

Then pick a target and follow its short guide, a single server, a managed platform, or Kubernetes: **[Deploy to Production](https://laradock.io/docs/production)** lists every provider (Fly.io, Render, Railway, DigitalOcean, AWS, Google Cloud, Azure, Kamal, Kubernetes) with a ready config file for each. There is no per-provider magic to learn; a Docker image runs the same everywhere.

## Frequently Asked Questions

### Why use Laradock instead of the official Nextcloud Docker image?

The official image is the simplest path for a standalone Nextcloud instance. Laradock is worth it when Nextcloud is one of several PHP projects on the same machine, when you want every Dockerfile and compose file visible and editable rather than baked into one image, or when you need a specific PHP version pinned for a specific Nextcloud release.

### Do I need to install PHP or a database to run Nextcloud with Laradock?

No. Everything lives inside the containers. PHP, Composer, git and the `occ` CLI are in the `workspace` container; you never install PHP on your host.

### Which services should I start for a typical Nextcloud instance?

`nginx mariadb workspace` is all Nextcloud requires to boot: web server, database, and a shell. Swap `mariadb` for `mysql` or `postgres` if you prefer. For real use, add `redis` and wire it in `config.php` (see [Add Redis caching and file locking](#add-redis-caching-and-file-locking-recommended)); add `elasticsearch` only if you set up [full-text search](#add-full-text-search-with-elasticsearch-optional).

### Why does Nextcloud warn me about background jobs and file locking?

Both are Nextcloud admin warnings, not Laradock problems. The background-jobs warning goes away once you switch from AJAX to [Cron mode](#set-up-background-jobs-cron); the locking notice goes away once you point [transactional file locking at Redis](#add-redis-caching-and-file-locking-recommended).

### Can I run multiple Nextcloud instances on different PHP versions?

Yes. Give each its own Laradock with a unique `COMPOSE_PROJECT_NAME` and `DATA_PATH_HOST`, set a different `PHP_VERSION` in each, and they run independently on the same machine.

### Does this work the same on macOS, Windows and Linux?

Yes. Laradock runs anywhere Docker runs. On macOS/Windows, file-sync speed depends on Docker Desktop (VirtioFS helps a lot for large data directories); it is a Docker Desktop trait, not specific to Laradock.

### Is this the same Docker setup I would use in production?

The containers are production-style (real NGINX + PHP-FPM), so it is far closer to production than a native install. See [Prepare Laradock for Production](https://laradock.io/docs/production#prepare-laradock-for-production) for the hardening steps.

---

Comparing environments? See the full **[Laradock vs Others](https://laradock.io/docs/laradock-alternatives)** breakdown. Ready to start? **[Getting Started](https://laradock.io/docs/getting-started)** takes about five minutes.
