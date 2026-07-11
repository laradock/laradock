---
slug: /grav-on-docker
title: Run Grav on Docker
description: Run Grav on Docker in minutes with Laradock. What Docker gives a Grav site, why Laradock is the fastest way to get NGINX and PHP running, and the exact commands, with any PHP version, without installing anything on your machine.
keywords:
  - grav on docker
  - run grav on docker
  - grav docker
  - grav docker setup
  - dockerize grav
  - grav docker environment
  - grav flat-file cms docker
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

## What is Grav?

[Grav](https://getgrav.org) is a flat-file CMS built on PHP, Symfony components and Twig, known for being fast to set up and run: content lives as Markdown files with YAML frontmatter, and there is no database at all. A Grav site needs nothing but a web server and a PHP runtime; that is the entire infrastructure requirement. Redis or Memcached can speed up its cache on a busy site, but only if you turn them on.

## Why run Grav in Docker?

Docker packages the pieces a PHP app needs (NGINX, PHP-FPM) into isolated containers that run the same on every machine. Instead of installing PHP onto your laptop, where versions collide between sites and "works on my machine" starts, you run disposable containers that mirror production and vanish cleanly when you delete them. One site can run PHP 8.3 while another runs 8.0, on the same computer, with nothing installed globally.

The catch: wiring those containers together yourself (base images, PHP extensions, networking, permissions) is a week of fiddly Docker work. That is exactly what Laradock removes.

## Why Laradock is the best fit for Grav

Grav ships its own official Docker image on Docker Hub, so, unlike most PHP projects, it does not strictly need Laradock. It is still the best fit, and here is why:

- **You are never locked into one ecosystem.** Laradock is framework-agnostic. The day you add a Laravel API, a database-backed WordPress site, or a plain PHP script beside your Grav site, it runs in the same environment with the same commands. A single-purpose image cannot do that.
- **Far more flexibility.** 100+ ready services and any PHP version from 5.6 to 8.5, versus the narrower set of tags the official image maintains, ready the moment a project next to Grav needs a database or cache.
- **Nothing is hidden and you own everything.** No generated files, no magic, no wrapper binary between you and Docker. Every Dockerfile and compose file is right there for you to read and edit.
- **Nothing new to learn.** What you use is plain `docker compose`, knowledge that transfers straight to production and to every other project. Our [CLI](/docs/cli) is an optional nicety, never a requirement.

Concretely, for Grav it gives you a production-style NGINX + PHP-FPM stack, a `workspace` container with Composer, git and the `bin/grav` and `bin/gpm` tools ready to run, and every other service (Redis for caching, MailHog for mail, and more) one command away when a page or plugin actually wants it.

## Run Grav on Docker with Laradock

### 1. Add Laradock to your project

```bash
cd my-grav-site
git clone https://github.com/laradock/laradock.git
cd laradock
```

(No Grav files yet? Clone Laradock first, then create the site from the workspace container in the next steps.)

### 2. Pick the services your site needs

Grav has no database, so a web server is the whole required stack; PHP-FPM comes with it automatically:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock start nginx workspace
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
cp .env.example .env
docker compose up -d nginx workspace
```

</TabItem>
</Tabs>

That is genuinely all a Grav site needs to boot. The full catalog of everything else available is [here](/docs/Intro#supported-services); Redis and mail are covered as optional add-ons below.

Prefer to be asked? The optional [CLI](/docs/cli) walks you through the choices: `./laradock setup`, then `./laradock start`. It prints every real command it runs.

### 3. Where Grav's content lives

There is no database host to configure. Grav's pages, config, accounts, plugins and themes live as files under `user/` in your project, which is mounted straight from your host into the `nginx` and `workspace` containers, so edits made on your machine or through the admin panel show up immediately either way.

### 4. Install and run your site

Enter the `workspace` container, where Composer, git and the Grav CLI live, and create the project:

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

Once inside, run:

```bash
composer create-project getgrav/grav .   # only if you have no Grav files yet
bin/grav install                          # pulls in Grav's dependencies
```

Then open [http://localhost](http://localhost). That is a full Grav site running on Docker.

## Install the admin panel and create your first user

A bare Grav install has no admin UI: you edit Markdown files directly. Most people want the web admin. From the `workspace` container, install it with Grav's package manager, which also pulls in the plugins the admin needs (login, forms, email):

```bash
bin/gpm install admin
```

Now open [http://localhost/admin](http://localhost/admin). On first visit Grav asks you to create the initial administrator account right in the browser.

Prefer the command line? Create the account without touching the browser:

```bash
bin/plugin login newuser
```

It prompts for a username, password, email and permission level (`a` admin, `s` site, `b` both). The accounts are stored as YAML under `user/accounts/`, so they live in your project like everything else.

## Manage plugins and themes with GPM

`bin/gpm` is Grav's Package Manager. It runs inside the `workspace` container and installs, updates and removes plugins and themes from the official repository:

```bash
bin/gpm index                 # browse everything available
bin/gpm install tntsearch     # install a plugin (or a theme) by slug
bin/gpm install quark         # install a theme
bin/gpm update                # update all installed plugins and themes
bin/gpm selfupgrade           # update Grav core itself
```

Everything it installs lands under `user/plugins/` and `user/themes/` in your project, so it is versioned and backed up along with your content.

## Add Redis caching (optional)

Redis is not required. Grav caches to the filesystem by default, which is fine for most sites. On a busy site, moving that cache into Redis is faster. Two steps wire it up.

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

2. Point Grav's cache at it in `user/config/system.yaml`, using the service name `redis` as the host:

```yaml
cache:
  enabled: true
  driver: redis
  redis:
    server: redis
    port: 6379
```

Clear the cache once (`bin/grav cache`) and Grav now stores its cache in Redis. Without those steps the container just sits idle, which is why the required stack above leaves it out. (Grav supports Memcached the same way with `driver: memcached`.)

## Add mail with MailHog (optional)

Grav sends mail through its [Email plugin](https://github.com/getgrav/grav-plugin-email), used by contact forms and admin notifications. In development you do not want real mail going out, so point it at MailHog, which catches every message in a web inbox.

1. Start MailHog:

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

2. Install the Email plugin and point it at the `mailhog` container in `user/config/plugins/email.yaml`:

```bash
bin/gpm install email
```

```yaml
mailer:
  engine: smtp
  smtp:
    server: mailhog
    port: 1025
    encryption: none
```

Every email your site sends now appears at [http://localhost:8025](http://localhost:8025) instead of a real inbox.

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

Grav requires PHP 7.3.6 or newer, with 8.1 or newer recommended for current releases, and Laradock covers anything from PHP 5.6 to 8.5, so the same tool runs an older Grav site and a brand-new one side by side, each isolated, none of it installed on your machine.

## Run Grav's scheduler on cron

Grav has a built-in scheduler for tasks like backups, cache purges and scheduled plugin jobs. It only fires when something calls it once a minute. See what is queued from the `workspace` container:

```bash
bin/grav scheduler -j     # list the jobs Grav would run
```

To make it fire automatically, add one cron line to the workspace container. Laradock keeps the container's crontab at `workspace/crontab/laradock`; add the Grav entry there:

```cron
* * * * * laradock cd /var/www && /usr/bin/php bin/grav scheduler 1>> /dev/null 2>&1
```

Then rebuild the workspace so the new crontab is baked in:

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

Your project mounts at `/var/www` inside the container, so `bin/grav` resolves to your site. That single line is all Grav's scheduler needs, on your machine and in production alike.

## Build and pipeline your assets

Grav has an asset pipeline built in: it can concatenate and minify your CSS and JavaScript with no external tool. Turn it on in `user/config/system.yaml`:

```yaml
assets:
  css_pipeline: true
  js_pipeline: true
```

If a theme you are developing uses npm (many Grav themes ship a `package.json` for Tailwind, Sass or webpack), the `workspace` container already has Node and npm. From inside it:

```bash
cd user/themes/your-theme
npm install
npm run build
```

No Node install on your host, and the same toolchain everyone on the project shares.

## Add search

Grav is flat-file, so search does not need a separate search engine or service. The common choice is the [TNTSearch plugin](https://github.com/trilbymedia/grav-plugin-tntsearch), which builds a full-text index from your Markdown pages, entirely inside the PHP app:

```bash
bin/gpm install tntsearch
bin/grav tntsearch:index      # build the search index
```

For a smaller site the lightweight `simplesearch` plugin needs no index at all. Either way there is nothing extra to start in Laradock; it is pure PHP.

## Run multiple Grav sites (multisite)

Grav can serve several sites from one install, each with its own pages, config and themes, mapped by hostname. Create a `setup.php` at your project root that points each host at an environment folder:

```php
<?php
return [
    'environments' => [
        'site-one.localhost' => 'user/env/site-one',
        'site-two.localhost' => 'user/env/site-two',
    ],
];
```

Each `user/env/<name>/` folder holds that site's `config/` and `pages/`. Because the whole project is one mounted volume, all of them run behind the single `nginx workspace` stack you already started; add the hostnames to your machine's hosts file (or Laradock's nginx config) and you are done. Prefer full isolation instead? Run a second copy of Laradock with its own `COMPOSE_PROJECT_NAME`.

## Import an existing Grav site

Moving a live Grav site onto Docker is a file copy, because there is no database to dump. Copy the site's `user/` folder (pages, config, accounts, plugins, themes) into your project, then from the `workspace` container:

```bash
bin/grav install     # ensure Grav's dependencies match
bin/gpm update       # bring plugins and themes up to date
bin/grav cache       # clear the old cache
```

Open [http://localhost](http://localhost) and the imported site is running. That is the whole migration.

## Take your site live

When your site is ready, the same Laradock stack becomes your deployment. You build one hardened image of your app and ship it to the host of your choice:

```bash
./laradock ship
```

Then pick a target and follow its short guide, a single server, a managed platform, or Kubernetes: **[Deploy to Production](/docs/production)** lists every provider (Fly.io, Render, Railway, DigitalOcean, AWS, Google Cloud, Azure, Kamal, Kubernetes) with a ready config file for each. There is no per-provider magic to learn; a Docker image runs the same everywhere.

## Frequently Asked Questions

### Do I need to install PHP or Composer to run Grav with Laradock?

No. Everything lives inside the containers. Composer, git and Grav's own `bin/grav` and `bin/gpm` tools are in the `workspace` container; you never install PHP on your host.

### Which services should I start for a typical Grav site?

`nginx workspace` is the whole required stack: Grav has no database, so those two containers are all a typical site needs. Add `redis` only if you switch Grav's cache to the [Redis driver](#add-redis-caching-optional), and `mailhog` only if your forms send mail; neither is required to run.

### Can I run multiple Grav sites on different PHP versions?

Yes. Give each its own Laradock with a unique `COMPOSE_PROJECT_NAME` and `DATA_PATH_HOST`, set a different `PHP_VERSION` in each, and they run independently on the same machine. For several sites on the same PHP version, Grav's [built-in multisite](#run-multiple-grav-sites-multisite) is simpler.

### Does this work the same on macOS, Windows and Linux?

Yes. Laradock runs anywhere Docker runs. On macOS/Windows, file-sync speed depends on Docker Desktop (VirtioFS helps a lot); it is a Docker Desktop trait, not specific to Laradock.

### Is this the same Docker setup I would use in production?

The containers are production-style (real NGINX + PHP-FPM), so it is far closer to production than PHP's built-in development server. See [Prepare Laradock for Production](/docs/production#prepare-laradock-for-production) for the hardening steps.

---

Comparing environments? See the full **[Laradock vs Others](/docs/laradock-alternatives)** breakdown. Ready to start? **[Getting Started](/docs/getting-started)** takes about five minutes.
