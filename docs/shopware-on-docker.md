# Run Shopware on Docker

Source: https://laradock.io/docs/shopware-on-docker

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

## What is Shopware?

[Shopware](https://www.shopware.com) is a Symfony-based open-source ecommerce platform, with Shopware 6 built around Symfony on the backend and Vue.js for the storefront and administration UI. A Shopware installation is a PHP application backed by a MySQL or MariaDB database and served through a web server. That is all it needs to boot. On top of that it can use a background worker for its message queue, a scheduler for recurring tasks, Redis for caching and sessions, and OpenSearch or Elasticsearch for storefront search once your catalog grows. Building the storefront and admin assets needs Node.

## Why run Shopware in Docker?

Docker packages each of those pieces (NGINX, PHP-FPM, MySQL, and optionally Redis, OpenSearch, Node) into isolated containers that run the same on every machine. Instead of installing PHP and MySQL onto your laptop, where versions collide between projects and "works on my machine" starts, you run disposable containers that mirror production and vanish cleanly when you delete them. One project can run the PHP version a current Shopware 6 release expects while another stays on an older one, on the same computer, with nothing installed globally.

The catch: wiring those containers together yourself (base images, PHP extensions, networking, permissions) is a week of fiddly Docker work. That is exactly what Laradock removes.

## Why Laradock is the best fit for Shopware

Shopware's own documentation points developers to [dockware](https://dockware.io), a widely used community-maintained Docker setup built specifically for local Shopware 6 development, so, unlike most PHP projects, Shopware does not strictly need Laradock. It is still the best fit, and here is why:

- **You are never locked into one ecosystem.** Laradock is framework-agnostic. The day you add a Laravel API, a WordPress marketing site, or a plain PHP script beside your Shopware store, it runs in the same environment with the same commands. A Shopware-only tool cannot do that.
- **Far more flexibility.** 100+ ready services and any PHP version from 5.6 to 8.5, versus the curated set of Shopware versions a Shopware-specific image ships.
- **Nothing is hidden and you own everything.** No generated files, no magic, no wrapper binary between you and Docker. Every Dockerfile and compose file is right there for you to read and edit.
- **Nothing new to learn.** What you use is plain `docker compose`, knowledge that transfers straight to production and to every other project. Our [CLI](https://laradock.io/docs/cli) is an optional nicety, never a requirement.

Concretely, for Shopware it gives you a production-style NGINX + PHP-FPM stack, MySQL/MariaDB ready to connect, a `workspace` container with Composer, Node and npm already installed for the Symfony console commands and asset builds Shopware needs, and Redis, OpenSearch or a mail catcher each one command away when you want them.

## Run Shopware on Docker with Laradock

### 1. Add Laradock to your project

```bash
cd my-shopware-app
git clone https://github.com/laradock/laradock.git
cd laradock
```

(No Shopware project yet? Clone Laradock first, then install one from the workspace container in the next steps.)

### 2. Pick the services your store needs

Shopware needs exactly two things to boot: a **web server** and a **database**. The web server pulls in PHP-FPM automatically, so this is the whole required stack:

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

Prefer MariaDB over MySQL? Swap the name: `./laradock start nginx mariadb workspace` (or `docker compose up -d nginx mariadb workspace`). The full catalog is [here](https://laradock.io/docs/Intro#supported-services).

Prefer to be asked? The optional [CLI](https://laradock.io/docs/cli) walks you through the choices: `./laradock setup`, then `./laradock start`. It prints every real command it runs.

> **Do I need Redis or OpenSearch to start?** No. A fresh Shopware store runs perfectly on `nginx mysql workspace`. Out of the box Shopware processes its message queue with the built-in admin worker and caches to the filesystem, so nothing else is required to develop. Redis and OpenSearch are performance add-ons for busier stores. See [Add Redis](#add-redis-caching-and-sessions-optional) and [Add OpenSearch search](#add-opensearch-search-optional) below when you actually want them.

### 3. Point Shopware at the containers

In your app's `.env`, use the service names as hostnames:

```env
DATABASE_URL="mysql://default:secret@mysql:3306/default"
APP_URL="http://localhost"
```

The default database, user and password live in `mysql/defaults.env`; override any of them by adding the line to Laradock's `.env` (it always wins).

### 4. Install and run your store

Enter the `workspace` container, where Composer and Node live, and run the installer:

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

Once inside the container:

```bash
composer create-project shopware/production my-shopware-app   # only if you have no project yet
php bin/console system:install --basic-setup                  # creates schema, storefront sales channel, admin user
./bin/build-storefront.sh                                     # compiles the storefront assets with Node
```

`system:install --basic-setup` sets up the database schema, a Storefront sales channel bound to `APP_URL`, and a default admin user (**admin** / **shopware**). Then open [http://localhost](http://localhost) for the storefront and [http://localhost/admin](http://localhost/admin) for the administration. That is a full Shopware store running on Docker.

## Add Redis (caching and sessions, optional)

Redis is not required to run, but on a busy store it takes the pressure off MySQL by holding the cache, HTTP cache, and PHP sessions in memory, and it gives the message queue a durable transport. Wiring it up is three steps:

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

2. Point Shopware at it. In your app's `.env`, use the `redis` service name as the host:

```env
REDIS_URL="redis://redis:6379"
MESSENGER_TRANSPORT_DSN="redis://redis:6379/messages"
```

3. Then enable the Redis adapters in `config/packages/shopware.yaml` (cache, increment, and number range storage) as shown in the [Shopware caching guide](https://developer.shopware.com/docs/guides/hosting/performance/caches.html), and clear the cache from the workspace:

```bash
php bin/console cache:clear
```

Without those steps the container just sits idle, which is why the required stack above leaves it out.

## Add OpenSearch search (optional)

Shopware searches MySQL directly by default, which is fine until your catalog grows. For large catalogs and fast storefront/admin search, point Shopware at OpenSearch (a drop-in Elasticsearch replacement Laradock ships as a service).

1. Start OpenSearch:

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

2. Enable it in your app's `.env`, using the `opensearch` service name as the host:

```env
OPENSEARCH_URL="opensearch:9200"
SHOPWARE_ES_ENABLED="1"
SHOPWARE_ES_INDEXING_ENABLED="1"
SHOPWARE_ES_INDEX_PREFIX="sw"
```

3. Build the indices from the workspace:

```bash
php bin/console es:index
```

Shopware will use OpenSearch for storefront search from then on. (Prefer Elasticsearch or Meilisearch? Laradock ships those services too; start `elasticsearch` or `meilisearch` instead and point the same variables at it.)

## Add a mail catcher (optional)

Shopware sends order confirmations, password resets and newsletters over SMTP. In development you do not want those leaving your machine, so route them to a catcher that shows every message in a web inbox.

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

2. Point Shopware's mailer at it in your app's `.env`:

```env
MAILER_DSN="smtp://mailhog:1025"
```

Every mail Shopware sends now lands in the MailHog inbox at [http://localhost:8025](http://localhost:8025) instead of a real inbox.

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

Current Shopware 6 releases require PHP 8.2 or newer (6.7 adds 8.4), while an older Shopware 6 install pinned to an earlier minor version may need an earlier PHP release. Laradock covers anything from PHP 5.6 to 8.5, so the same tool runs an older Shopware store and a current one side by side, each isolated, none of it installed on your machine.

## Run the background queue worker

Shopware pushes slow work (indexing, mail sending, imports) onto a message queue. In development the built-in **admin worker** drains that queue as long as an admin tab is open, so a fresh install needs nothing extra. For anything production-like you disable the admin worker and run a real CLI worker instead, which is faster and does not depend on a browser being open.

1. Disable the admin worker in `config/packages/shopware.yaml`:

```yaml
shopware:
    admin_worker:
        enable_admin_worker: false
```

2. From the `workspace` container, run the consumer (add `--time-limit` and `--memory-limit` so it recycles cleanly):

```bash
php bin/console messenger:consume async low_priority --time-limit=60 --memory-limit=512M
```

For a durable queue, back it with Redis (see [Add Redis](#add-redis-caching-and-sessions-optional) and set `MESSENGER_TRANSPORT_DSN`) rather than the default MySQL transport. To keep the worker running unattended, loop the command from a cron entry or a supervisor process inside the container.

## Run scheduled tasks (cron)

Shopware has its own scheduler for recurring jobs (cleanup, product exports, cache warmup). It piggybacks on the message queue: one command dispatches due tasks, the worker above runs them. From the `workspace` container:

```bash
php bin/console scheduled-task:run
```

`scheduled-task:run` blocks and dispatches each task as it comes due, so run it as a long-lived process alongside `messenger:consume`. If you prefer discrete cron ticks instead of a resident process, use `scheduled-task:run --no-wait` from a system cron entry on your host that execs into the container.

## Build storefront and admin assets

Shopware ships two Node build scripts in the project root. Run them from the `workspace` container (Node and npm are already installed) whenever you change theme SCSS/JS or a plugin's admin module:

```bash
./bin/build-storefront.sh        # compiles storefront theme assets
./bin/build-administration.sh    # compiles the administration UI
php bin/console theme:compile     # recompiles active themes after config changes
```

For an active editing loop with hot reload, use the watchers instead of a full build: `php bin/console watch:storefront` or `php bin/console watch:administration`. They start a dev server inside the container; expose the port they print by adding it to the `workspace` service in `docker-compose.yml`.

## CLI and admin tooling

Everything Shopware ships as a Symfony console command runs from the `workspace` container. A few you will reach for daily:

```bash
php bin/console cache:clear                 # clear the app cache
php bin/console dal:refresh:index           # rebuild search + SEO indexes
php bin/console plugin:refresh              # detect newly added plugins
php bin/console plugin:install --activate MyPlugin
php bin/console user:create admin --admin   # add another admin user
php bin/console system:config:set ...       # read/write store config
```

Composer, Node, npm and git all live in the same container, so plugin installs (`composer require store.shopware.com/...`) and version control happen right there, never on your host.

## First admin login

After `system:install --basic-setup`, open [http://localhost/admin](http://localhost/admin) and sign in with the default credentials it created:

- **Username:** `admin`
- **Password:** `shopware`

Change the password immediately from the admin user menu. To add more administrators later, run `php bin/console user:create <name> --admin` from the workspace.

## Import an existing store database

Moving a store from another environment? Drop its SQL dump into the Laradock folder (it is mounted into the `workspace` container) and import it with the MySQL client that already lives there:

```bash
mysql -h mysql -u default -psecret default < my-store-dump.sql
```

Point your app's `.env` `DATABASE_URL` at the same `default` database, then rebuild the derived indexes and warm the cache:

```bash
php bin/console dal:refresh:index
php bin/console cache:clear
```

If the dump expects a different database name, create it first (`mysql -h mysql -u root -proot -e "CREATE DATABASE mystore"`) and adjust `DATABASE_URL` to match.

## Take your store live

When your store is ready, the same Laradock stack becomes your deployment. You build one hardened image of your app and ship it to the host of your choice:

```bash
./laradock ship
```

Then pick a target and follow its short guide, a single server, a managed platform, or Kubernetes: **[Deploy to Production](https://laradock.io/docs/production)** lists every provider (Fly.io, Render, Railway, DigitalOcean, AWS, Google Cloud, Azure, Kamal, Kubernetes) with a ready config file for each. There is no per-provider magic to learn; a Docker image runs the same everywhere. Remember to run the message queue worker and scheduler as their own long-lived processes in production, as shown above.

## Frequently Asked Questions

### Do I need to install PHP, Composer or Node to run Shopware with Laradock?

No. Everything lives inside the containers. Composer, Node and npm are all in the `workspace` container; you never install PHP on your host.

### Which services should I start for a typical Shopware store?

`nginx mysql workspace` is all Shopware requires to boot: web server, database, and a shell with Composer and Node. Swap `mysql` for `mariadb` if you prefer. Add `redis`, `opensearch` or `mailhog` only when you wire them up (see the optional sections above); a fresh store runs fine without them.

### Can I run multiple Shopware stores on different PHP versions?

Yes. Give each its own Laradock with a unique `COMPOSE_PROJECT_NAME` and `DATA_PATH_HOST`, set a different `PHP_VERSION` in each, and they run independently on the same machine.

### Does this work the same on macOS, Windows and Linux?

Yes. Laradock runs anywhere Docker runs. On macOS/Windows, file-sync speed depends on Docker Desktop (VirtioFS helps a lot for a `vendor/`-heavy app like Shopware); it is a Docker Desktop trait, not specific to Laradock.

### Is this the same Docker setup I would use in production?

The containers are production-style (real NGINX + PHP-FPM), so it is far closer to production than a native install. See [Prepare Laradock for Production](https://laradock.io/docs/production#prepare-laradock-for-production) for the hardening steps.

---

Comparing environments? See the full **[Laradock vs Others](https://laradock.io/docs/laradock-alternatives)** breakdown. Ready to start? **[Getting Started](https://laradock.io/docs/getting-started)** takes about five minutes.
