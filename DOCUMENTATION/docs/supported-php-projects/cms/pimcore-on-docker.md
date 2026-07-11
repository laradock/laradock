---
slug: /pimcore-on-docker
title: Run Pimcore on Docker
description: Run Pimcore on Docker in minutes with Laradock. What Docker gives a Symfony-based Pimcore PIM/CMS project, why Laradock is the fastest way to get NGINX, PHP, MySQL and Elasticsearch running, and the exact commands, without installing anything on your machine.
keywords:
  - pimcore on docker
  - run pimcore on docker
  - pimcore docker
  - pimcore docker setup
  - dockerize pimcore
  - pimcore docker environment
  - pimcore symfony mysql docker
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

## What is Pimcore?

[Pimcore](https://pimcore.com) is an enterprise platform combining a CMS, PIM (product information management), DAM (digital asset management) and commerce data model, built on Symfony. It is a full Symfony application, installed through Composer and backed by MySQL or MariaDB via Doctrine. To boot and run, it needs only a web server, a PHP 8.3+ runtime and a database. Everything else is an add-on you turn on when a feature needs it: Redis for caching, OpenSearch or Elasticsearch for large product catalogs, and a Symfony Messenger worker for its background jobs. It also likes a generous `memory_limit`.

## Why run Pimcore in Docker?

Docker packages each of those pieces (NGINX, PHP-FPM, a database, and any search or cache service) into isolated containers that run the same on every machine. Instead of installing PHP, a database and a search engine onto your laptop, where versions collide between projects and "works on my machine" starts, you run disposable containers that mirror production and vanish cleanly when you delete them. One project can run PHP 8.3 while another runs 8.4, on the same computer, with nothing installed globally.

The catch: wiring those containers together yourself (base images, PHP extensions, networking, permissions) is a week of fiddly Docker work. That is exactly what Laradock removes.

## Why Laradock is the best fit for Pimcore

Pimcore ships its own official Docker-based installer and compose files in its skeleton and demo applications, so, like Symfony itself, it does not strictly need Laradock. It is still the best fit, and here is why:

- **You are never locked into one ecosystem.** Laradock is framework-agnostic. The day you add a Laravel API, a WordPress site, or a plain PHP script beside your Pimcore project, it runs in the same environment with the same commands. A Pimcore-only setup cannot do that.
- **Far more flexibility.** 100+ ready services and any PHP version from 5.6 to 8.5, versus the short curated list a project-specific compose file gives you.
- **Nothing is hidden and you own everything.** No generated files, no magic, no wrapper binary between you and Docker. Every Dockerfile and compose file is right there for you to read and edit.
- **Nothing new to learn.** What you use is plain `docker compose`, knowledge that transfers straight to production and to every other project. Our [CLI](/docs/cli) is an optional nicety, never a requirement.

For Pimcore specifically, Laradock wires a production-style NGINX + PHP-FPM stack and MySQL/MariaDB to boot the app, with Redis, OpenSearch/Elasticsearch, a mail catcher and a Messenger worker each one command away, and a `workspace` container with Composer, Node, npm and git already installed.

## Run Pimcore on Docker with Laradock

### 1. Add Laradock to your project

```bash
cd my-pimcore-app
git clone https://github.com/laradock/laradock.git
cd laradock
```

(No Pimcore project yet? Clone Laradock first, then create one from the workspace container in the next steps.)

### 2. Pick the services your project needs

To boot and run, Pimcore needs exactly two things: a **web server** and a **database**. The web server pulls in PHP-FPM automatically, so this is the whole required stack:

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

Prefer MariaDB? Swap the name: `./laradock start nginx mariadb workspace` (or `docker compose up -d nginx mariadb workspace`). The full catalog is [here](/docs/Intro#supported-services).

Prefer to be asked? The optional [CLI](/docs/cli) walks you through the choices: `./laradock setup`, then `./laradock start`. It prints every real command it runs.

> **What about search, Redis and the queue worker?** None of them are needed to boot Pimcore. Redis caching, OpenSearch/Elasticsearch and the Symfony Messenger worker each become useful once you turn on the matching feature, and each has its own section below with the exact wiring. A fresh install runs perfectly on `nginx mysql workspace`.

### 3. Point Pimcore at the containers

Pimcore reads its database connection from `config/packages/pimcore/*.yaml` or from a `DATABASE_URL` environment variable, using the service name as the hostname:

```env
DATABASE_URL="mysql://default:secret@mysql:3306/default?serverVersion=8.4&charset=utf8mb4"
```

The default database, user and password live in `mysql/defaults.env`; override any of them by adding the line to Laradock's `.env` (it always wins).

### 4. Install and run your project

Enter the shell where Composer, Node and the Pimcore console live, and run the usual commands:

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

```bash
composer create-project pimcore/skeleton .   # only if you have no Pimcore project yet
./vendor/bin/pimcore-install \
  --admin-username=admin --admin-password=secret --no-interaction
```

The installer creates the schema and your first admin account in one step. When it finishes, open [http://localhost/admin](http://localhost/admin), sign in with `admin` / `secret`, and you are in the backend. That is a full Pimcore project running on Docker.

## Add Redis caching (optional)

Pimcore runs fine on the default file cache, but on a real project Redis holds the cache and Doctrine metadata in memory and takes noticeable load off MySQL. Two steps wire it up.

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

2. Point Pimcore's cache at it in `config/packages/prod/pimcore.yaml` (or your environment's config), using the service name as the host:

```yaml
pimcore:
    cache:
        pool:
            connection:
                host: redis
                port: 6379
                database: 0
```

After a `./vendor/bin/pimcore-cache clear`, Pimcore stores its cache in Redis. Without that config the container just sits idle, which is why the required stack above leaves it out.

## Add OpenSearch for search and product catalogs (optional)

Pimcore's core backend search runs on MySQL, so you do not need a search engine to browse and edit objects. You add one when you use the **e-commerce framework**, large PIM catalogs, or Data Hub, which index into OpenSearch (or Elasticsearch). Wire it in three steps.

1. Start the search container. OpenSearch is the current default; Elasticsearch works the same way:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock start opensearch
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose up -d opensearch
```

</TabItem>
</Tabs>

2. Point your product index config at the container hostname in `config/packages/pimcore_ecommerce_framework.yaml` (or the relevant bundle config):

```yaml
pimcore_ecommerce_framework:
    index_service:
        elasticsearch:
            client_config:
                hosts:
                    - 'opensearch:9200'
```

3. Build the index from the workspace:

```bash
./vendor/bin/ecommerce-framework-bootstrap-tenants
./bin/console ecommerce:indexservice:update-index
```

Swap `opensearch` for `elasticsearch` in both the start command and the host if you prefer Elasticsearch. Leave the service off entirely until a catalog feature needs it.

## Catch outgoing mail with MailHog (optional)

Pimcore sends mail through Symfony Mailer, so any email the admin or your document mails trigger goes out over SMTP. In development you do not want real delivery; MailHog captures every message in a web inbox instead.

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

2. Point Symfony Mailer at the container in your `.env` (or `.env.local`):

```env
MAILER_DSN=smtp://mailhog:1025
```

Now every message Pimcore sends lands in the MailHog inbox at [http://localhost:8025](http://localhost:8025) instead of a real mailbox. Nothing leaves your machine.

## Run Pimcore's background workers

Pimcore offloads heavy work (asset thumbnails and metadata, image optimization, backend-search indexing, scheduled tasks and maintenance) onto the [Symfony Messenger](https://pimcore.com/docs/platform/Pimcore/Extending_Pimcore/Maintenance_Tasks/) queues. Nothing appears broken without a worker, but those jobs never finish: thumbnails stay unprocessed and search results go stale. In development you run a worker inside the `workspace` container.

From inside `./laradock workspace`, consume the Pimcore queues:

```bash
./bin/console messenger:consume \
  pimcore_core pimcore_maintenance pimcore_scheduled_tasks \
  pimcore_asset_update pimcore_image_optimize \
  --time-limit=3600 -vv
```

The `--time-limit` makes the worker exit hourly so a long-running PHP process does not leak memory; a supervisor restarts it. For local work you can just rerun the command. In production, run one or more of these under Supervisor, exactly as the [Symfony Messenger docs](https://symfony.com/doc/current/messenger.html#deploying-to-production) describe. Splitting `pimcore_image_optimize` into its own worker keeps slow image jobs from blocking the rest.

By default Pimcore uses the Doctrine transport (the messages live in your MySQL database), so no extra service is required. High-volume projects can move the transport to RabbitMQ, which Laradock also provides (`./laradock start rabbitmq`).

## Schedule maintenance (cron)

Pimcore has a single maintenance command that queues housekeeping jobs (cache cleanup, version pruning, scheduled object publishing, tmp-file cleanup). It is meant to run every few minutes:

```bash
./bin/console pimcore:maintenance
```

`pimcore:maintenance` only enqueues the work; the Messenger worker above (the `pimcore_maintenance` and `pimcore_scheduled_tasks` queues) actually runs it, so keep a worker consuming. In development, run the command by hand when you want housekeeping to happen. For an always-on setup, add it to the `workspace` container's crontab: set `WORKSPACE_INSTALL_CRON=true` in Laradock's `.env`, rebuild `workspace`, then add a line that runs `pimcore:maintenance` every five minutes as the web user.

## Build front-end assets

The Pimcore admin UI ships prebuilt, so a stock install needs no asset step. You only build when your project has a **custom theme, bundle or front-end** (Webpack Encore, Vite, or plain npm scripts). The `workspace` container already has Node and npm, so build from there:

```bash
npm install
npm run build      # or: npm run dev / npm run watch while developing
```

Because this runs in the container, your host never needs a matching Node version, and two projects on different Node toolchains stay isolated.

## Everyday CLI and admin tooling

Everything you would run natively lives in the `workspace` container. Enter it with `./laradock workspace` and use Pimcore's console and helpers:

```bash
./bin/console                       # list every available command
./bin/console pimcore:deployment:classes-rebuild   # rebuild class definitions
./bin/console pimcore:bundle:list                  # manage bundles
./vendor/bin/pimcore-cache clear    # clear the Pimcore cache
./bin/console cache:clear           # clear the Symfony cache
composer require some/bundle        # add a dependency
```

Composer, Node, npm and git are all present, so you never install PHP tooling on your host.

## Import an existing Pimcore database

Moving an existing project onto Docker is a database restore plus a config point. With the `mysql` container running, load your dump from the workspace (the containers share the same network, so `mysql` is the host):

```bash
mysql -h mysql -u default -psecret default < /var/www/backup.sql
```

Copy your data files (`public/var/assets`, `var/config`) into the project, set `DATABASE_URL` to point at `mysql` as in step 3, then rebuild caches and class definitions:

```bash
./vendor/bin/pimcore-cache clear
./bin/console pimcore:deployment:classes-rebuild -n
```

Open [http://localhost/admin](http://localhost/admin) and your existing content is there.

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

Current Pimcore requires PHP 8.3 or newer, so a project pinned to an older supported release and a brand-new one can run side by side on different PHP versions, each isolated, none of it installed on your machine.

## Take your project live

When your project is ready, the same Laradock stack becomes your deployment. You build one hardened image of your app and ship it to the host of your choice:

```bash
./laradock ship
```

Then pick a target and follow its short guide, a single server, a managed platform, or Kubernetes: **[Deploy to Production](/docs/production)** lists every provider (Fly.io, Render, Railway, DigitalOcean, AWS, Google Cloud, Azure, Kamal, Kubernetes) with a ready config file for each. There is no per-provider magic to learn; a Docker image runs the same everywhere. Remember to run a Messenger worker and the `pimcore:maintenance` cron on the live host as described above.

## Frequently Asked Questions

### Do I need to install PHP or Composer to run Pimcore with Laradock?

No. Everything lives inside the containers. Composer, Node, npm and git are all in the `workspace` container; you never install PHP on your host.

### Which services should I start for a typical Pimcore project?

`nginx mysql workspace` is all Pimcore needs to boot and run: web server, database, and a shell. Swap `mysql` for `mariadb` if you prefer. Add `redis` for caching, `opensearch` (or `elasticsearch`) once you use the e-commerce or PIM catalog features, and `mailhog` to catch mail, each with the wiring shown above. Run a `messenger:consume` worker so background jobs actually process.

### Do I have to run a queue worker?

For basic content editing, no. But asset thumbnails, image optimization, backend-search indexing and scheduled tasks all run through Symfony Messenger, so start a `messenger:consume` worker (see [Run Pimcore's background workers](#run-pimcores-background-workers)) whenever those need to complete.

### Can I run multiple Pimcore projects on different PHP versions?

Yes. Give each its own Laradock with a unique `COMPOSE_PROJECT_NAME` and `DATA_PATH_HOST`, set a different `PHP_VERSION` in each, and they run independently on the same machine.

### Does this work the same on macOS, Windows and Linux?

Yes. Laradock runs anywhere Docker runs. On macOS/Windows, file-sync speed depends on Docker Desktop (VirtioFS helps a lot for `vendor/`-heavy apps); it is a Docker Desktop trait, not specific to Laradock.

### Is this the same Docker setup I would use in production?

The containers are production-style (real NGINX + PHP-FPM), so it is far closer to production than a native install. Pimcore is memory-hungry, so raise `memory_limit` to at least 512M in `php.ini` before importing large catalogs. See [Prepare Laradock for Production](/docs/production#prepare-laradock-for-production) for the hardening steps.

---

Comparing environments? See the full **[Laradock vs Others](/docs/laradock-alternatives)** breakdown. Ready to start? **[Getting Started](/docs/getting-started)** takes about five minutes.
