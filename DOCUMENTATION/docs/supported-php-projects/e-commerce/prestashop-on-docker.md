---
slug: /prestashop-on-docker
title: Run PrestaShop on Docker
description: Run PrestaShop on Docker in minutes with Laradock. What Docker gives a PrestaShop store, why Laradock is the fastest way to get a web server, PHP, MySQL and Redis running, and the exact commands, with any PHP version, without installing anything on your machine.
keywords:
  - prestashop on docker
  - run prestashop on docker
  - prestashop docker
  - prestashop docker setup
  - dockerize prestashop
  - prestashop docker environment
  - prestashop mysql docker
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

## What is PrestaShop?

[PrestaShop](https://www.prestashop.com) is an open-source PHP e-commerce platform popular in Europe and Latin America, covering everything from a small catalog to a multi-store, multi-language shop. Since version 9 it is built on Symfony 6.4. To boot, it needs just three things: a **web server**, **PHP-FPM**, and a **MySQL or MariaDB** database. Redis, a mail catcher, and Elasticsearch are optional extras you add only when a specific feature calls for them.

## Why run PrestaShop in Docker?

Docker packages each of those pieces (a web server, PHP-FPM, MySQL, Redis) into isolated containers that run the same on every machine. Instead of installing PHP and MySQL onto your laptop, where versions collide between projects and "works on my machine" starts, you run disposable containers that mirror production and vanish cleanly when you delete them. One store can run PHP 8.1 while another runs PrestaShop 1.6 on an older PHP release, on the same computer, with nothing installed globally.

The catch: wiring those containers together yourself (base images, PHP extensions, networking, permissions) is a week of fiddly Docker work. That is exactly what Laradock removes.

## Why Laradock is the best fit for PrestaShop

PrestaShop publishes an official [`prestashop/prestashop`](https://hub.docker.com/r/prestashop/prestashop) image on Docker Hub, a single Apache+PHP container with PrestaShop pre-installed, so it does not strictly need Laradock. It is still the best fit for a real project, and here is why:

- **You are never locked into one ecosystem.** Laradock is framework-agnostic. The day you add a Symfony back-office tool, a Laravel API, or a plain PHP script beside your PrestaShop store, it runs in the same environment with the same commands. A single bundled image cannot do that.
- **Far more flexibility.** 100+ ready services and any PHP version from 5.6 to 8.5, versus the one bundled runtime the official image gives you.
- **Nothing is hidden and you own everything.** No generated files, no magic, no wrapper binary between you and Docker. Every Dockerfile and compose file is right there for you to read and edit, and your web server and PHP-FPM are separate containers you can tune independently.
- **Nothing new to learn.** What you use is plain `docker compose`, knowledge that transfers straight to production and to every other project. Our [CLI](/docs/cli) is an optional nicety, never a requirement.

Concretely, for PrestaShop it gives you a production-style NGINX or Apache + PHP-FPM stack, MySQL/MariaDB ready to connect (with Redis, a mail catcher and Elasticsearch each one command away when you want them), a `workspace` container with Composer, the PrestaShop console, Node.js and git installed, and any PHP version behind a single line of config.

## Run PrestaShop on Docker with Laradock

### 1. Add Laradock to your project

```bash
cd my-prestashop-store
git clone https://github.com/laradock/laradock.git
cd laradock
```

(No PrestaShop files yet? Clone Laradock first, then download PrestaShop from the `workspace` container in the next steps.)

### 2. Pick the services your store needs

PrestaShop needs exactly two things: a **web server** and a **database**. The web server pulls in PHP-FPM automatically, so this is the whole required stack:

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

Prefer MariaDB over MySQL? Swap the name: `./laradock start nginx mariadb workspace` (or `docker compose up -d nginx mariadb workspace`). PrestaShop ships Apache-oriented `.htaccess` rules, so if you prefer Apache you can run `apache2` in place of `nginx`; on NGINX PrestaShop generates the equivalent rewrite rules for you at install time. The full catalog is [here](/docs/Intro#supported-services).

Prefer to be asked? The optional [CLI](/docs/cli) walks you through the choices: `./laradock setup`, then `./laradock start`. It prints every real command it runs.

> **Do I need Redis?** Not to get running. A fresh store runs perfectly on `nginx mysql workspace`; PrestaShop caches to the filesystem by default. Redis only helps on busier stores, and only once you switch the cache backend to it in the admin. See [Add Redis caching](#add-redis-caching-optional) below when you actually want it.

### 3. Point PrestaShop at the containers

PrestaShop asks for the database connection during installation and writes it to `app/config/parameters.php` (PrestaShop 1.7/8/9). Use the service names as hostnames when you run the installer in the next step:

```text
Database server:   mysql
Database name:     prestashop   (any name; the installer can create it)
Database user:     default
Database password: secret
```

The default database, user and password live in `mysql/defaults.env`; override any of them by adding the line to Laradock's `.env` (it always wins).

### 4. Install and run

Enter the `workspace` container, where Composer, the PrestaShop console, Node.js and git live:

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

Download PrestaShop and run its command-line installer:

```bash
composer create-project prestashop/prestashop .
php install-dev/index_cli.php --domain=localhost --db_server=mysql \
  --db_name=prestashop --db_user=default --db_password=secret \
  --firstname=Admin --lastname=User --email=admin@example.com --password=Admin123!
```

(The installer script has moved between PrestaShop major versions: it is `install-dev/index_cli.php` in the development repo and `install/index_cli.php` in a packaged release. Check the `install-dev/` or `install/` folder in the version you downloaded, or use the browser installer at `http://localhost/install` instead.) Then open [http://localhost](http://localhost). That is a full PrestaShop store running on Docker.

### First admin login

For security, PrestaShop refuses to run until the installer folder is gone, and it ships the back office behind an unguessable folder name:

```bash
rm -rf install-dev   # or install/ in a packaged release
```

Now open the admin folder in your browser (it is `admin-dev/` in the development repo). Log in with the email and password you passed the installer (`admin@example.com` / `Admin123!` above). Before you go live, rename that admin folder to something random and update the URL you bookmark; PrestaShop remembers the new path automatically.

## Add Redis caching (optional)

Redis is not required, but on a busy store it holds PrestaShop's object cache and sessions in memory and takes noticeable load off MySQL. PrestaShop supports it natively through the `CachePhpRedis` backend, so no third-party module is needed, just the container and a few clicks in the admin.

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

2. Make sure the `phpredis` extension is in your PHP-FPM and workspace images. Laradock installs it when this line is set in `.env`, then rebuild:

```env
PHP_FPM_INSTALL_PHPREDIS=true
WORKSPACE_INSTALL_PHPREDIS=true
```

3. In the admin, go to **Advanced Parameters -> Performance -> Caching**. Turn caching on, choose **CachePhpRedis**, click **Add server**, and enter host `redis`, port `6379`, database `0`. Save.

That is it, PrestaShop now stores its object cache in Redis. Without those steps the container just sits idle, which is why the required stack above leaves it out.

## Add a mail catcher (optional)

PrestaShop sends order confirmations, password resets and admin alerts by email. In development you do not want those hitting real inboxes, so route them to a mail catcher that shows every message in a web UI.

1. Start Mailpit (a lightweight SMTP trap with a web inbox):

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

2. In the admin, go to **Advanced Parameters -> E-mail**, choose **Set my own SMTP parameters**, and enter SMTP server `mailpit`, port `1025`, no encryption, no username or password. Send a test email.

3. Open the Mailpit inbox at [http://localhost:8025](http://localhost:8025) to read everything your store sends. (Prefer MailHog? Swap `mailpit` for `mailhog` and use its UI on port `8025` the same way.)

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

PrestaShop 9 targets PHP 8.1 and up (8.4 recommended), while PrestaShop 1.6 stores still run on much older PHP, so the same tool runs a legacy 1.6 shop and a current PrestaShop 9 store side by side, each isolated, none of it installed on your machine.

## Use the PrestaShop console and Composer (CLI tooling)

Everything you would run on a native install runs from the `workspace` container instead. Since PrestaShop 1.7 there is a Symfony-style console at `bin/console`. Enter the container (`./laradock workspace` or `docker compose exec workspace bash`) and use it from the store root:

```bash
php bin/console cache:clear                 # rebuild the cache after config or template changes
php bin/console list                        # every available command, including prestashop:* ones
php bin/console prestashop:module install <module>
php bin/console prestashop:module enable <module>
composer require <vendor/package>           # add a dependency
composer dump-autoload
```

Composer, git, Node.js and the PrestaShop console are all inside the container already; you never install any of them on your host.

## Run scheduled tasks (cron)

PrestaShop does not run a persistent background worker. Instead, recurring jobs (currency-rate updates, catalog re-indexing, module cron endpoints, cache clearing) are triggered on a schedule. Two common approaches, both fully inside Laradock:

**Console commands on a schedule.** From the `workspace` container you can run any `bin/console` task, for example a full search re-index:

```bash
php bin/console prestashop:search:index --full
```

Add a crontab entry inside the `workspace` container (it has `cron` installed) to run it nightly, or trigger it from your host's scheduler with `docker compose exec -T workspace php /var/www/bin/console prestashop:search:index --full`.

**The Cron Tasks module.** PrestaShop's official [Cron Tasks](https://help-center.prestashop.com/hc/en-us/articles/16271958357394-Manage-scheduled-tasks-cronjobs) module manages module cron URLs from the admin. It hands you a token URL; hit that URL on a schedule (from a container crontab or your host) to fire every registered job at once.

## Search your catalog

PrestaShop ships a built-in MySQL full-text search that works out of the box, no extra service required. When you bulk-import products or change search settings, rebuild the index from the `workspace` container:

```bash
php bin/console prestashop:search:index --full
```

For a large catalog where MySQL search gets slow, PrestaShop stores commonly move to Elasticsearch through a search module. Laradock has the service ready, start it and point your search module at host `elasticsearch`, port `9200`:

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

## Build and customize your theme

PrestaShop 9 themes use Node.js and Webpack for their front-end assets, and the back office assets build the same way. The `workspace` container has Node.js and npm installed, so you build without touching your host:

```bash
cd themes/classic/_dev     # your theme's source folder
npm install
npm run build              # one-off production build
npm run watch              # rebuild on every change while developing
```

Need a specific Node.js version? Set `WORKSPACE_NODE_VERSION` in Laradock's `.env` and rebuild the workspace container. PrestaShop 9 expects Node.js 20.

## Run a multi-store setup

Multi-store is a native PrestaShop feature, no extra services needed. In the admin go to **Advanced Parameters -> General** and turn **Enable multistore** on. A new **Shop Parameters -> Multistore** menu appears where you add shops and shop groups, each with its own domain, catalog subset, currencies and theme, all served by the same containers. To reach several shop domains locally, add them to your host's `hosts` file (all pointing at `127.0.0.1`) and list them in Laradock's `.env` under the NGINX or Apache virtual-host config.

## Import an existing PrestaShop database

Moving a store into Laradock is a database import plus a URL update. With the `mysql` container running, load your dump from the `workspace` container:

```bash
mysql -h mysql -u default -psecret prestashop < backup.sql
```

Then update the shop's domain so links resolve locally: in the admin go to **Advanced Parameters -> Preferences** (or edit the `ps_shop_url` table) and set the shop URL to `localhost`. Finally clear the cache so the new URLs take effect:

```bash
php bin/console cache:clear
```

Copy your store's `img/` and `themes/` folders alongside the code so product images and your theme come across too.

## Take your store live

When your store is ready, the same Laradock stack becomes your deployment. You build one hardened image of your app and ship it to the host of your choice:

```bash
./laradock ship
```

Then pick a target and follow its short guide, a single server, a managed platform, or Kubernetes: **[Deploy to Production](/docs/production)** lists every provider (Fly.io, Render, Railway, DigitalOcean, AWS, Google Cloud, Azure, Kamal, Kubernetes) with a ready config file for each. There is no per-provider magic to learn; a Docker image runs the same everywhere.

## Frequently Asked Questions

### Do I need to install PHP, MySQL or Composer to run PrestaShop with Laradock?

No. Everything lives inside the containers. Composer, the PrestaShop console, Node.js and git are in the `workspace` container; you never install PHP or the database on your host.

### Which services should I start for a typical PrestaShop store?

`nginx mysql workspace` is all PrestaShop requires: web server, database, and a shell. Swap `mysql` for `mariadb` if you prefer, or `nginx` for `apache2`. Add `redis` only after you switch the cache backend to it in the admin, and `mailpit` or `elasticsearch` when you actually want mail catching or scaled search; none of them are needed to boot.

### Can I run multiple PrestaShop stores on different PHP versions?

Yes. Give each its own Laradock with a unique `COMPOSE_PROJECT_NAME` and `DATA_PATH_HOST`, set a different `PHP_VERSION` in each, and they run independently on the same machine.

### Does this work the same on macOS, Windows and Linux?

Yes. Laradock runs anywhere Docker runs. On macOS/Windows, file-sync speed depends on Docker Desktop (VirtioFS helps a lot); it is a Docker Desktop trait, not specific to Laradock.

### Is this the same Docker setup I would use in production?

The containers are production-style (real web server + PHP-FPM), so it is far closer to production than a native install. See [Prepare Laradock for Production](/docs/production#prepare-laradock-for-production) for the hardening steps.

---

Comparing environments? See the full **[Laradock vs Others](/docs/laradock-alternatives)** breakdown. Ready to start? **[Getting Started](/docs/getting-started)** takes about five minutes.
