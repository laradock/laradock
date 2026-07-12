# Run Matomo on Docker

Source: https://laradock.io/docs/matomo-on-docker

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

## What is Matomo?

[Matomo](https://matomo.org) (formerly Piwik) is a self-hosted, privacy-focused web analytics platform, an open-source alternative to Google Analytics that keeps all visitor data on your own server. It is a PHP application backed by a MySQL or MariaDB database, served through a web server. Two things make it different from a plain CMS: it wants a recurring cron job that archives report data (so dashboards load fast), and it wants a comfortable PHP `memory_limit` once you are tracking sites with real traffic. Everything else, high-traffic request queuing, scheduled email reports, log import, is optional and layered on when you need it.

## Why run Matomo in Docker?

Docker packages each of those pieces (NGINX, PHP-FPM, MySQL) into isolated containers that run the same on every machine. Instead of installing PHP and MySQL onto your laptop, where versions collide between projects and "works on my machine" starts, you run disposable containers that mirror production and vanish cleanly when you delete them. One Matomo install can run the latest PHP recommended for performance while another project runs an older version it still depends on, on the same computer, with nothing installed globally.

The catch: wiring those containers together yourself (base images, PHP extensions, networking, permissions) is a week of fiddly Docker work. That is exactly what Laradock removes.

## Why Laradock is the best fit for Matomo

Matomo does maintain its own official Docker images ([matomo-org/docker](https://github.com/matomo-org/docker), also published as a [Docker Official Image](https://hub.docker.com/_/matomo)), so, unlike most self-hosted PHP apps, it does not strictly need Laradock. It is still the best fit for anyone running more than just Matomo, and here is why:

- **You are never locked into one ecosystem.** Laradock is framework-agnostic. The day you add a Laravel API, a WordPress marketing site, or a plain PHP script beside your analytics install, it runs in the same environment with the same commands. A single-purpose Matomo image cannot do that.
- **Far more flexibility.** 100+ ready services and any PHP version from 5.6 to 8.5, versus the fixed image variants a purpose-built container gives you. Redis for high-traffic tracking and a mail catcher for scheduled reports are each one command away.
- **Nothing is hidden and you own everything.** No generated files, no magic, no wrapper binary between you and Docker. Every Dockerfile and compose file is right there for you to read and edit.
- **Nothing new to learn.** What you use is plain `docker compose`, knowledge that transfers straight to production and to every other project. Our [CLI](https://laradock.io/docs/cli) is an optional nicety, never a requirement.

Concretely, for Matomo it gives you a production-style NGINX + PHP-FPM stack, MySQL/MariaDB already wired, and a `workspace` container with git and PHP's CLI (for the install, update, and archiving commands) installed.

## Run Matomo on Docker with Laradock

### 1. Add Laradock to your project

```bash
cd my-matomo-install
git clone https://github.com/laradock/laradock.git
cd laradock
```

(No Matomo files yet? Clone Laradock first, then download the Matomo package from the `workspace` container in the next steps.)

### 2. Pick the services your install needs

Matomo needs exactly two things: a **web server** and a **database**. The web server pulls in PHP-FPM automatically, so this is the whole required stack:

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

Prefer MariaDB? Swap the name: `./laradock start nginx mariadb workspace` (or `docker compose up -d nginx mariadb workspace`). The full catalog is [here](https://laradock.io/docs/Intro#supported-services).

Prefer to be asked? The optional [CLI](https://laradock.io/docs/cli) walks you through the choices: `./laradock setup`, then `./laradock start`. It prints every real command it runs.

> **Do I need Redis?** Not to get running. A normal Matomo install writes tracking requests straight to MySQL and needs nothing else. Redis only helps once you are ingesting very high traffic and add the QueuedTracking plugin. See [Add Redis for high-traffic tracking](#add-redis-for-high-traffic-tracking-optional) below when you actually need it.

### 3. Point Matomo at the containers

Matomo's installer asks for these values in the browser and writes them into `config/config.ini.php`; use the service name as the database host:

```
Database Server: mysql
Login: default
Password: secret
Database Name: default
```

The default database, user and password live in Laradock's `mysql/defaults.env`; override any of them by adding the line to Laradock's `.env` (it always wins).

### 4. Install and run your instance

Enter the `workspace` container, where git and PHP's CLI live, place the Matomo files in your project's web root (download the package from [matomo.org](https://matomo.org/download/) and extract it if you have not already), then finish the setup in the browser:

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

Then open [http://localhost](http://localhost) and follow Matomo's install wizard: system check, database connection (the values above), table creation, Super User account, and your first website plus its tracking code. There is no built-in, fully headless CLI equivalent to this wizard; if you need an unattended install, either pre-fill `config/config.ini.php` with your database details before the first request (Matomo then skips the database step), or use the community [ExtraTools plugin](https://plugins.matomo.org/ExtraTools), which adds a `matomo:install` console command.

The account you create in that wizard is your **Super User** (Matomo's admin). If you ever lose the password, use the "Lost your password?" link on the login screen once a mail service is wired up (see [Add a mail catcher](#add-a-mail-catcher-for-scheduled-reports-and-alerts-optional) for local mail, or your real SMTP host in production).

## Set up report archiving (the one cron Matomo needs)

This is the step people miss. By default Matomo archives reports on the fly when someone opens a dashboard, which gets slow fast. The project's strong recommendation is to **turn browser archiving off and run the archiver on a schedule** instead.

First, in Matomo go to **Administration -> System -> General Settings** and set "Archive reports when viewed from the browser" to **No**.

Then run the archiver from the `workspace` container. The console is a script named `console` in your Matomo root (adjust the path to wherever your Matomo files live, `/var/www` is the mounted project root):

```bash
php /var/www/console core:archive --url=http://localhost/
```

To run it automatically every hour, add a single line to your host machine's crontab (`crontab -e`) that calls into the running `workspace` container:

```cron
5 * * * * cd /path/to/laradock && docker compose exec -T workspace php /var/www/console core:archive --url=http://localhost/ > /dev/null 2>&1
```

The `-T` disables the pseudo-TTY so cron can run it non-interactively. In production you point `--url` at your real domain and schedule the same command; see [Prepare Laradock for Production](https://laradock.io/docs/production#prepare-laradock-for-production).

## Add Redis for high-traffic tracking (optional)

A normal install writes every tracking request directly to MySQL, which is fine for most sites. Once you are handling hundreds of requests per second, that write becomes the bottleneck. Matomo's [QueuedTracking](https://plugins.matomo.org/QueuedTracking) plugin fixes this by pushing raw tracking requests into **Redis** (a write of a few milliseconds) and draining the queue into MySQL in the background. Wiring it up:

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

2. From the `workspace` container, install and enable the plugin:

```bash
php /var/www/console plugin:activate QueuedTracking
```

3. In the Matomo admin, go to **Administration -> System -> General Settings -> Queued Tracking** and set the backend to **Redis** with host `redis` and port `6379` (the Laradock service name and default port). Choose the number of workers based on your traffic.

4. Drain the queue on a schedule. Add another host crontab line so it runs every minute:

```cron
* * * * * cd /path/to/laradock && docker compose exec -T workspace php /var/www/console queuedtracking:process --no-ansi > /dev/null 2>&1
```

Check queue depth any time with `php /var/www/console queuedtracking:monitor`. Without those steps the Redis container just sits idle, which is why the required stack above leaves it out.

## Add a mail catcher for scheduled reports and alerts (optional)

Matomo can email scheduled PDF/HTML reports, custom alerts, and password-reset links, all of which need an SMTP server. For local development, Laradock ships a mail catcher that traps every outgoing message in a web inbox so nothing leaves your machine:

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

Then in Matomo go to **Administration -> System -> General Settings -> Email server settings**, choose SMTP, and enter:

```
SMTP server: mailhog
Port: 1025
Authentication: none
Encryption: none
```

Open [http://localhost:8025](http://localhost:8025) to read whatever Matomo sends. Now "Email Reports", alert notifications, and the "Lost your password?" flow all work locally. In production you swap these for your real mail provider's SMTP credentials.

## Import existing server logs (optional)

Matomo can build reports from raw web-server access logs instead of (or in addition to) the JavaScript tracker, which is handy for back-filling history or tracking things JavaScript cannot see. The importer is a Python script shipped inside Matomo at `misc/log-analytics/import_logs.py`, and the `workspace` container already has Python. From inside `workspace`:

```bash
python3 /var/www/misc/log-analytics/import_logs.py \
  --url=http://localhost/ \
  --idsite=1 \
  /path/to/access.log
```

Point `/path/to/access.log` at a log file you have mounted into the project, set `--idsite` to the website ID you are importing into, and Matomo parses each line into visits. Combine it with the archiving cron above so the imported data shows up in your reports.

## Everyday admin from the console

Matomo's `console` command is the CLI for almost every maintenance task. Run these from inside the `workspace` container (`./laradock workspace`), pointing at your Matomo root:

```bash
php /var/www/console list                              # every available command
php /var/www/console core:update                       # apply DB migrations after updating files
php /var/www/console core:clear-caches                 # clear Matomo's caches
php /var/www/console core:invalidate-report-data       # force specific reports to re-archive
php /var/www/console plugin:list                        # see installed plugins
```

After you replace the Matomo files with a newer release, always run `core:update` (or click through the updater in the browser) so the database schema catches up.

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

Matomo works down to PHP 7.2.5 but is markedly faster on current PHP 8.x, which is what the project recommends; Laradock covers anything from PHP 5.6 to 8.5, so the same tool runs an older Matomo install and a brand-new one side by side, each isolated, none of it installed on your machine.

Tracking a busy site? Give PHP more headroom by raising `PHP_FPM_INSTALL_...` limits or the `memory_limit` in `php-fpm/php.ini` and `workspace`, then rebuild the same way. Archiving large sites is the main reason Matomo wants a generous `memory_limit`.

## Import an existing Matomo database

Moving an install from another host is just a database restore plus the files. Copy your existing Matomo directory into the project web root, drop your SQL dump into the project (Laradock mounts it into `workspace`), then from inside `workspace`:

```bash
mysql -u default -psecret -h mysql default < backup.sql
```

Update `config/config.ini.php` so the `[database]` `host` is `mysql` (and the `login`/`password`/`dbname` match the values in step 3), open the site, and run `php /var/www/console core:update` if the dump came from an older Matomo version. Your dashboards, websites, and users come across intact.

## Track multiple websites

A single Matomo install already tracks any number of separate websites, each with its own tracking code and its own `idsite`. You do not run one container per site: add each site under **Administration -> Websites -> Manage**, drop the generated snippet on that site, and they all report into the same dashboard. Only spin up a second Laradock (see the FAQ) when you want a fully independent Matomo instance on a different PHP version.

## Take your install live

When your Matomo install is ready, the same Laradock stack becomes your deployment. You build one hardened image of the app and ship it to the host of your choice:

```bash
./laradock ship
```

Then pick a target and follow its short guide, a single server, a managed platform, or Kubernetes: **[Deploy to Production](https://laradock.io/docs/production)** lists every provider (Fly.io, Render, Railway, DigitalOcean, AWS, Google Cloud, Azure, Kamal, Kubernetes) with a ready config file for each. There is no per-provider magic to learn; a Docker image runs the same everywhere. Remember to schedule the archiving cron on the live host exactly as shown above.

## Frequently Asked Questions

### Do I need to install PHP or MySQL to run Matomo with Laradock?

No. Everything lives inside the containers. PHP, its required extensions (curl, gd, mbstring, xml among them), and the database server are all provided; you never install them on your host.

### Which services should I start for a typical Matomo install?

`nginx mysql workspace` is all Matomo requires: web server, database, and a shell. Swap `mysql` for `mariadb` if you prefer. Add `redis` only for the high-traffic [QueuedTracking](#add-redis-for-high-traffic-tracking-optional) setup, and `mailhog` only when you want [scheduled email reports](#add-a-mail-catcher-for-scheduled-reports-and-alerts-optional); neither is needed for a normal install.

### How do I keep report dashboards fast?

Turn off browser-triggered archiving and run `core:archive` on a schedule. See [Set up report archiving](#set-up-report-archiving-the-one-cron-matomo-needs) above; it is the single most important step for a responsive Matomo.

### Can I run multiple Matomo instances on different PHP versions?

Yes. One Matomo already tracks many websites, but for a fully separate instance give each its own Laradock with a unique `COMPOSE_PROJECT_NAME` and `DATA_PATH_HOST`, set a different `PHP_VERSION` in each, and they run independently on the same machine.

### Does this work the same on macOS, Windows and Linux?

Yes. Laradock runs anywhere Docker runs. On macOS/Windows, file-sync speed depends on Docker Desktop (VirtioFS helps a lot); it is a Docker Desktop trait, not specific to Laradock.

### Is this the same Docker setup I would use in production?

The containers are production-style (real NGINX + PHP-FPM), so it is far closer to production than a native install. See [Prepare Laradock for Production](https://laradock.io/docs/production#prepare-laradock-for-production) for the hardening steps, and remember to schedule Matomo's archiving cron the same way you would locally.

---

Comparing environments? See the full **[Laradock vs Others](https://laradock.io/docs/laradock-alternatives)** breakdown. Ready to start? **[Getting Started](https://laradock.io/docs/getting-started)** takes about five minutes.
