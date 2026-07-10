---
slug: /moodle-on-docker
title: Run Moodle on Docker
description: Run Moodle on Docker in minutes with Laradock. What Docker gives a Moodle LMS, why Laradock is the fastest way to get NGINX, PHP, MySQL and Redis running, and the exact commands, with any PHP version, without installing anything on your machine.
keywords:
  - moodle on docker
  - run moodle on docker
  - moodle docker
  - moodle docker setup
  - dockerize moodle
  - moodle docker environment
  - moodle nginx mysql docker
---

## What is Moodle?

[Moodle](https://moodle.org) is the most widely used open-source learning management system (LMS), running courses, quizzes, grading and certification for schools, universities and companies worldwide. It is a PHP application backed by a database (MySQL/MariaDB or PostgreSQL), served through a web server, and it needs a writable `moodledata` directory outside the web root plus a recurring cron job to process notifications, backups and scheduled tasks.

## Why run Moodle in Docker?

Docker packages each of those pieces (NGINX, PHP-FPM, MySQL, Redis) into isolated containers that run the same on every machine. Instead of installing PHP and MySQL onto your laptop, where versions collide between sites and "works on my machine" starts, you run disposable containers that mirror production and vanish cleanly when you delete them. One Moodle site can run the latest PHP required by Moodle 5.x while another stays on an older PHP version for a Moodle 4.x install with legacy plugins, on the same computer, with nothing installed globally.

The catch: wiring those containers together yourself (base images, PHP extensions, networking, permissions) is a week of fiddly Docker work. That is exactly what Laradock removes.

## Why Laradock is the best fit for Moodle

Moodle HQ maintains [moodle-docker](https://github.com/moodlehq/moodle-docker), but it is explicitly built for Moodle core developers and automated testing (Behat, CI), not for running a real site; the third-party Bitnami image many guides point to is no longer freely available either. That leaves a gap for anyone who just wants to run a Moodle site locally, which is exactly where Laradock fits:

- **You are never locked into one ecosystem.** Laradock is framework-agnostic. Run Moodle today, add a Laravel API, a WordPress marketing site, or a plain PHP script beside it tomorrow, all in the same environment with the same commands.
- **Far more flexibility.** 100+ ready services and any PHP version from 5.6 to 8.5, so an older Moodle 4.x course platform and a fresh Moodle 5.x install each get exactly the runtime they need.
- **Nothing is hidden and you own everything.** No generated files, no magic, no wrapper binary between you and Docker. Every Dockerfile and compose file is right there for you to read and edit.
- **Nothing new to learn.** What you use is plain `docker compose`, knowledge that transfers straight to production. Our [CLI](/docs/cli) is an optional nicety, never a requirement.

Concretely, for Moodle it gives you a production-style NGINX + PHP-FPM stack, MySQL/MariaDB/PostgreSQL and Redis already wired, and a `workspace` container with git, Composer and PHP's CLI (for the installer and cron) installed.

## Run Moodle on Docker with Laradock

### 1. Add Laradock to your project

```bash
cd my-moodle-site
git clone https://github.com/laradock/laradock.git
cd laradock && cp .env.example .env
```

(No Moodle files yet? Clone Laradock first, then download the Moodle package from the `workspace` container in the next steps.)

### 2. Pick the services your site needs

Moodle needs a web server and a database; Redis is optional but recommended once a course platform has real traffic (session and application caching). The web server pulls in PHP-FPM automatically:

```bash
docker compose up -d nginx mysql redis workspace
```

Prefer PostgreSQL? Swap the name: `docker compose up -d nginx postgres redis workspace`. The full catalog is [here](/docs/Intro#supported-services).

Prefer to be asked? The optional [CLI](/docs/cli) walks you through the choices: `./laradock setup`, then `./laradock up`. It prints every real command it runs.

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

The default database, user and password live in `mysql/defaults.env`; override any of them by adding the line to Laradock's `.env` (it always wins). Make sure `moodledata` lives outside your web root and is writable by the container.

### 4. Install and run your site

Enter the `workspace` container and run the CLI installer (or open the browser wizard instead, once the files are in place):

```bash
docker compose exec workspace bash
php admin/cli/install.php --wwwroot=http://localhost --dbtype=mysqli \
  --dbhost=mysql --dbname=default --dbuser=default --dbpass=secret \
  --fullname="My Site" --shortname="mysite" --adminpass=secretpass \
  --adminemail=you@example.com --agree-license --non-interactive
```

Flag names can change between Moodle versions; run `php admin/cli/install.php --help` to confirm the current list. Then open [http://localhost](http://localhost). That is a full Moodle LMS running on Docker. Don't forget to schedule `php admin/cli/cron.php` to run every minute (via your host's cron calling `docker compose exec -T workspace ...`), the same way production Moodle sites do.

## Change the PHP version anytime

This is where a native install hurts and Laradock shines. Set the version in Laradock's `.env` and rebuild:

```env
PHP_VERSION=8.3
```

```bash
docker compose build php-fpm workspace
```

Moodle's current major release requires PHP 8.2 or newer (8.3 and 8.4 are also supported), while older Moodle 4.x sites can run on PHP 7.4+; Laradock covers anything from PHP 5.6 to 8.5, so the same tool runs a legacy course platform and a brand-new install side by side, each isolated, none of it installed on your machine.

## Frequently Asked Questions

### Do I need to install PHP or MySQL to run Moodle with Laradock?

No. Everything lives inside the containers. PHP, its required extensions (including `sodium`, which recent Moodle versions need), and the database server are all provided; you never install them on your host.

### Which services should I start for a typical Moodle site?

`nginx mysql redis workspace` covers most sites: web server, database, caching, and a shell. Swap `mysql` for `postgres` if you prefer.

### Can I run multiple Moodle sites on different PHP versions?

Yes. Give each its own Laradock with a unique `COMPOSE_PROJECT_NAME` and `DATA_PATH_HOST`, set a different `PHP_VERSION` in each, and they run independently on the same machine.

### Does this work the same on macOS, Windows and Linux?

Yes. Laradock runs anywhere Docker runs. On macOS/Windows, file-sync speed depends on Docker Desktop (VirtioFS helps a lot for Moodle's large codebase); it is a Docker Desktop trait, not specific to Laradock.

### Is this the same Docker setup I would use in production?

The containers are production-style (real NGINX + PHP-FPM), so it is far closer to production than a native install. See [Prepare Laradock for Production](/docs/usage#prepare-laradock-for-production) for the hardening steps.

---

Comparing environments? See the full **[Laradock vs Others](/docs/laradock-alternatives)** breakdown. Ready to start? **[Getting Started](/docs/getting-started)** takes about five minutes.
