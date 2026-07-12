# Run Sylius on Docker

Source: https://laradock.io/docs/sylius-on-docker

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

## What is Sylius?

[Sylius](https://sylius.com) is an open-source e-commerce platform built on the Symfony framework, aimed at developers who want a fully customizable, API-first store rather than a plugin-heavy monolith. As a Symfony application it needs a web server, PHP-FPM (PHP 8.2 or newer, with the `intl`, `gd`, `exif`, `fileinfo` and `sodium` extensions), and a MySQL, MariaDB or PostgreSQL database. Node.js is needed at build time for its front-end assets, a Symfony Messenger worker handles asynchronous jobs like catalog promotions, and Redis is a common addition for cache and sessions on larger stores.

## Why run Sylius in Docker?

Docker packages each of those pieces (NGINX, PHP-FPM, MySQL/PostgreSQL, Redis) into isolated containers that run the same on every machine. Instead of installing PHP, Node and a database onto your laptop, where versions collide between projects and "works on my machine" starts, you run disposable containers that mirror production and vanish cleanly when you delete them. One project can run PHP 8.3 while another runs a different Symfony/Sylius version, on the same computer, with nothing installed globally.

The catch: wiring those containers together yourself (base images, PHP extensions, networking, permissions) is a week of fiddly Docker work. That is exactly what Laradock removes.

## Why Laradock is the best fit for Sylius

Sylius has no official standalone Docker product; the Symfony Docker examples in its documentation are minimal starting points, not a maintained tool. Here is why Laradock is the best fit:

- **You are never locked into one ecosystem.** Laradock is framework-agnostic. The day you add a Laravel admin panel, a WordPress marketing site, or a plain PHP script beside your Sylius store, it runs in the same environment with the same commands.
- **Far more flexibility.** 100+ ready services and any PHP version from 5.6 to 8.5, so a legacy Sylius install and a current one each get exactly the runtime they need.
- **Nothing is hidden and you own everything.** No generated files, no magic, no wrapper binary between you and Docker. Every Dockerfile and compose file is right there for you to read and edit.
- **Nothing new to learn.** What you use is plain `docker compose`, knowledge that transfers straight to production and to every other Symfony or non-Symfony project. Our [CLI](https://laradock.io/docs/cli) is an optional nicety, never a requirement.

Concretely, for Sylius it gives you a production-style NGINX + PHP-FPM stack, MySQL/MariaDB or PostgreSQL ready to connect, a `workspace` container with Composer, Node, Yarn and git already installed for building assets and running `bin/console`, and Redis, a Messenger worker and a mail catcher each one command away when you want them.

## Run Sylius on Docker with Laradock

### 1. Add Laradock to your project

```bash
cd my-sylius-store
git clone https://github.com/laradock/laradock.git
cd laradock
```

(No Sylius app yet? Clone Laradock first, then scaffold one from the `workspace` container in the next steps.)

### 2. Pick the services your store needs

Sylius needs exactly two things to boot: a **web server** and a **database**. The web server pulls in PHP-FPM automatically, so this is the whole required stack:

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

Prefer PostgreSQL or MariaDB? Swap the name: `./laradock start nginx postgres workspace` (or `docker compose up -d nginx postgres workspace`). The full catalog is [here](https://laradock.io/docs/Intro#supported-services).

Prefer to be asked? The optional [CLI](https://laradock.io/docs/cli) walks you through the choices: `./laradock setup`, then `./laradock start`. It prints every real command it runs.

> **Do I need Redis or a message queue to start?** No. A fresh Sylius store runs on `nginx mysql workspace`. Sylius defaults to filesystem caching and sessions, and routes its asynchronous jobs through the database, so nothing else is required to boot. Redis, a Messenger worker and search only matter once you opt into them, and each has its own section below.

### 3. Point Sylius at the containers

Sylius (like any Symfony app) reads its database connection from the `DATABASE_URL` environment variable, normally set in your app's `.env.local`:

```env
DATABASE_URL=mysql://default:secret@mysql:3306/default?serverVersion=8.0&charset=utf8mb4
```

Using PostgreSQL instead? Point it at that container:

```env
DATABASE_URL=postgresql://default:secret@postgres:5432/default?serverVersion=15&charset=utf8
```

The default database, user and password live in `mysql/defaults.env` (or `postgres/defaults.env`); override any of them by adding the line to Laradock's `.env` (it always wins).

### 4. Install and run your store

Enter the `workspace` container, where Composer, Node, Yarn and git live:

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

Then scaffold the project, build its assets, and run the installer:

```bash
composer create-project sylius/sylius-standard .   # only if you have no Sylius app yet
yarn install && yarn build                         # compile the front-end assets
bin/console sylius:install                          # interactive: DB, currency, locale, admin user
```

`sylius:install` sets up the database schema, asks for your store currency and locale, and creates the first administrator account. Want the demo catalog (products, taxons, customers) to click around? Load the sample fixtures:

```bash
bin/console sylius:fixtures:load
```

Then open [http://localhost](http://localhost) for the shop and [http://localhost/admin](http://localhost/admin) for the back office. That is a full Sylius store running on Docker.

## Log in to the admin for the first time

Sylius has no default admin password. The administrator you use at `http://localhost/admin` is the one you typed during `bin/console sylius:install`. If you skipped that prompt or need another admin later, create one from the `workspace` container:

```bash
bin/console sylius:user:create-admin
```

It asks for an email, username and password interactively, then that account can sign in at `/admin` right away.

## Build and watch front-end assets

Sylius ships its Shop and Admin UIs as [Webpack Encore](https://symfony.com/doc/current/frontend.html) bundles, which is why Node and Yarn live in the `workspace` container. Run these from inside `workspace`:

```bash
yarn install          # once, and after any package.json change
yarn build            # production build (minified)
yarn watch            # recompile automatically while you edit
```

If you install or build a custom [theme](https://docs.sylius.com/the-customization-guide/customizing-templates), copy its compiled assets into `public/` so NGINX can serve them:

```bash
bin/console sylius:theme:assets:install public
bin/console assets:install public
```

Nothing here touches your host machine: Node, Yarn and the whole `node_modules` tree stay inside the container.

## Run the background worker (catalog promotions and async jobs) (optional)

Sylius processes some jobs asynchronously through [Symfony Messenger](https://symfony.com/doc/current/messenger.html), most visibly catalog promotions: after you create or edit one, the recalculated prices only appear once a worker has processed the message. The store boots and sells without a running worker, so this is optional, but promotions and other queued jobs stay pending until you start one.

Run the consumer from the `workspace` container:

```bash
bin/console messenger:consume main -vvv
```

The transport names live in your app's `config/packages/messenger.yaml`; `main` is the default async transport in Sylius. Because Sylius routes messages through the database by default, no extra service is required to try this out.

For a worker that survives crashes and restarts, keep it under a supervisor rather than a terminal tab. Laradock ships a dedicated worker container for exactly this. Point its supervisor program at the Messenger command and start it:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock start php-worker
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose up -d php-worker
```

</TabItem>
</Tabs>

Edit `php-worker/supervisord.d/` so its command is `php /var/www/bin/console messenger:consume main`, matching the path where your app is mounted. The worker then restarts the consumer automatically.

## Run scheduled maintenance (optional)

Sylius has no core scheduler, but a couple of housekeeping commands are meant to run on a timer in a real store, chiefly clearing abandoned carts:

```bash
bin/console sylius:remove-expired-carts
```

Run it periodically. Two clean options:

- Add the command to `workspace/crontab/` (uncomment `INSTALL_CRON=true` for the `workspace` in Laradock's `.env`, rebuild, and drop a cron line in), so cron inside the container fires it on schedule.
- Or trigger it from your host's own cron / CI with `docker compose exec -T workspace bin/console sylius:remove-expired-carts`.

Both keep the schedule inside the same container stack, with nothing installed on your machine.

## Add Redis for cache and sessions (optional)

Redis is not required, Sylius runs fine on filesystem cache out of the box, but on a busier store moving the cache and sessions into memory speeds up both the shop and the admin. Wire it up in three steps:

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

2. Tell Symfony to use it. In your app's `.env.local`, point the cache and session DSNs at the container:

```env
REDIS_URL=redis://redis:6379
```

3. Wire those into `config/packages/framework.yaml` (cache pool and session handler):

```yaml
framework:
    cache:
        app: cache.adapter.redis
        default_redis_provider: '%env(REDIS_URL)%'
    session:
        handler_id: '%env(REDIS_URL)%'
```

Clear the cache once (`bin/console cache:clear`) and Sylius now stores its cache and sessions in Redis. Without those config lines the container just sits idle, which is why the required stack above leaves it out.

## Add a mail catcher for order emails (optional)

Sylius sends order confirmations, shipment notices and password resets through [Symfony Mailer](https://symfony.com/doc/current/mailer.html). In development you do not want those hitting real inboxes, so catch them locally. Start Laradock's Mailpit (or MailHog) container:

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

Point Sylius at it in your app's `.env.local`:

```env
MAILER_DSN=smtp://mailpit:1025
```

Every email Sylius sends now lands in the Mailpit inbox at [http://localhost:8025](http://localhost:8025) instead of a real mailbox. Swap `mailpit` for `mailhog` (port 1025, UI on 8025) if you prefer MailHog.

## Add search (optional)

Sylius's built-in product search runs against your database, so no search engine is required to launch. For faster faceted search on large catalogs, the community [BitBag SyliusElasticsearchPlugin](https://github.com/BitBagCommerce/SyliusElasticsearchPlugin) indexes products into Elasticsearch. Start the engine when you adopt such a plugin:

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

Then follow the plugin's setup and point its host at `elasticsearch:9200`. Until you install a search plugin, this container is not needed.

## Run multiple channels or stores

One of Sylius's signature features is native multi-channel: a single install can serve several storefronts (different domains, currencies, locales and product ranges) from one admin and one database. You do not run a second Laradock for this. Create the extra channels in the admin under **Configuration > Channels**, give each its hostname, then map those hostnames to the same NGINX container.

For local testing, add the extra hostnames to your machine's `hosts` file so they resolve to `127.0.0.1`:

```text
127.0.0.1 shop-us.localhost shop-eu.localhost
```

Both names hit the same NGINX + PHP-FPM stack, and Sylius picks the channel from the request host. Only when you want a genuinely separate codebase or database do you spin up a second Laradock with its own `COMPOSE_PROJECT_NAME` and `DATA_PATH_HOST`.

## Import an existing store database

Moving a store from another environment? Copy its SQL dump in through the database container. From your host, with the dump next to the `laradock` folder:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock mysql
# then, at the container shell:
mysql -u default -psecret default < /path/to/dump.sql
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose exec -T mysql mysql -u default -psecret default < dump.sql
```

</TabItem>
</Tabs>

For PostgreSQL, use `psql -U default default < dump.sql` against the `postgres` container instead. After importing, run `bin/console doctrine:migrations:migrate` from `workspace` to bring the schema up to your Sylius version, then `bin/console cache:clear`.

## Everyday CLI and admin tooling

Everything Sylius asks you to run at a shell happens inside `workspace`, where `bin/console`, Composer, Yarn and git already live. Common commands:

```bash
bin/console cache:clear                 # rebuild the cache after config changes
bin/console doctrine:migrations:migrate # apply new database migrations
bin/console sylius:fixtures:load        # (re)load demo/sample data
composer require vendor/some-plugin     # add a Sylius plugin
bin/console debug:router                # inspect routes when a page 404s
```

You never install PHP, Composer or Node on your host to run any of these; they execute against the same containers that serve the site.

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

Sylius 2.x requires PHP 8.2 or newer, so keep `PHP_VERSION` at 8.2+ for a current Sylius install; the same tool can still run an older Symfony app on a lower PHP version in a separate Laradock instance, each isolated, none of it installed on your machine.

## Take your store live

When your store is ready, the same Laradock stack becomes your deployment. You build one hardened image of your app and ship it to the host of your choice:

```bash
./laradock ship
```

Then pick a target and follow its short guide, a single server, a managed platform, or Kubernetes: **[Deploy to Production](https://laradock.io/docs/production)** lists every provider (Fly.io, Render, Railway, DigitalOcean, AWS, Google Cloud, Azure, Kamal, Kubernetes) with a ready config file for each. There is no per-provider magic to learn; a Docker image runs the same everywhere. Remember to run the Messenger worker (a `php-worker` process) alongside the web container in production so catalog promotions and other async jobs keep processing.

## Frequently Asked Questions

### Do I need to install PHP, Composer or Node to run Sylius with Laradock?

No. Everything lives inside the containers. Composer, Node, Yarn and git are all in the `workspace` container; you never install PHP on your host.

### Which services should I start for a typical Sylius store?

`nginx mysql workspace` is the whole required stack: web server, database, and a shell. Swap `mysql` for `postgres` or `mariadb` if you prefer. Add `redis` for cache and sessions, `php-worker` for the async Messenger queue, and `mailpit` to catch order emails, each covered in its own section above, only when you actually want them.

### How do catalog promotions get applied? They are not showing up.

Catalog promotions are processed asynchronously. Start the Messenger worker with `bin/console messenger:consume main` (see [the worker section](#run-the-background-worker-catalog-promotions-and-async-jobs-optional)); once it is running, promotion prices recalculate within moments.

### Can I run multiple Sylius projects on different PHP versions?

Yes. Give each its own Laradock with a unique `COMPOSE_PROJECT_NAME` and `DATA_PATH_HOST`, set a different `PHP_VERSION` in each, and they run independently on the same machine. (Multiple storefronts inside one store use Sylius channels instead, no second Laradock needed.)

### Does this work the same on macOS, Windows and Linux?

Yes. Laradock runs anywhere Docker runs. On macOS/Windows, file-sync speed depends on Docker Desktop (VirtioFS helps a lot for `vendor/`-heavy apps); it is a Docker Desktop trait, not specific to Laradock.

### Is this the same Docker setup I would use in production?

The containers are production-style (real NGINX + PHP-FPM), so it is far closer to production than a native install. See [Prepare Laradock for Production](https://laradock.io/docs/production#prepare-laradock-for-production) for the hardening steps.

---

Comparing environments? See the full **[Laradock vs Others](https://laradock.io/docs/laradock-alternatives)** breakdown. Ready to start? **[Getting Started](https://laradock.io/docs/getting-started)** takes about five minutes.
