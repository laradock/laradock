# Run Magento on Docker

Source: https://laradock.io/docs/magento-on-docker

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

## What is Magento?

[Magento](https://business.adobe.com/products/magento/magento-commerce.html) (now sold by Adobe as Adobe Commerce, with Magento Open Source as the free edition) is a large, extensible PHP e-commerce platform known for handling complex catalogs, multi-store setups and B2B pricing. It is genuinely demanding infrastructure: a web server, PHP-FPM with a high memory limit, a MySQL or MariaDB database, and a search engine (OpenSearch or Elasticsearch, mandatory for catalog and layered-navigation search since Magento 2.4). It also relies on a real cron process to reindex, send emails and process queues, and it can offload caching to Redis or Valkey and message queues to RabbitMQ once you go past a bare install.

## Why run Magento in Docker?

Docker packages each of those pieces (NGINX, PHP-FPM, MySQL, OpenSearch) into isolated containers that run the same on every machine. Instead of installing PHP, a full search engine and a database onto your laptop, where versions collide between projects and "works on my machine" starts, you run disposable containers that mirror production and vanish cleanly when you delete them. One project can run PHP 8.4 while another runs an older Magento 2.3 install on PHP 7.4, on the same computer, with nothing installed globally.

The catch: wiring those containers together yourself (base images, PHP extensions, the search engine, networking, permissions) is a week of fiddly Docker work, more so for Magento than for most PHP apps given how many services it needs at once. That is exactly what Laradock removes.

## Why Laradock is the best fit for Magento

Adobe does not ship an official Docker setup for Magento the way Laravel ships Sail; the closest thing is the well-known community project [markshust/docker-magento](https://github.com/markshust/docker-magento), which is actively maintained but purpose-built for Magento only. Here is why Laradock is the best fit for a real project:

- **You are never locked into one ecosystem.** Laradock is framework-agnostic. The day you add a Symfony admin tool, a headless PWA storefront, or a plain PHP script beside your Magento install, it runs in the same environment with the same commands. A Magento-only tool cannot do that.
- **Far more flexibility.** 100+ ready services and any PHP version from 5.6 to 8.5, so a legacy Magento 2.3 install and a current 2.4 store can each get the exact runtime and search engine version they need.
- **Nothing is hidden and you own everything.** No generated files, no magic, no wrapper binary between you and Docker. Every Dockerfile and compose file is right there for you to read and edit, which matters when you need to tune PHP's memory limit or add a custom OpenSearch plugin.
- **Nothing new to learn.** What you use is plain `docker compose`, knowledge that transfers straight to production and to every other project. Our [CLI](https://laradock.io/docs/cli) is an optional nicety, never a requirement.

Concretely, for Magento it gives you a production-style NGINX + PHP-FPM stack, MySQL/MariaDB, OpenSearch or Elasticsearch for catalog search, a `workspace` container with Composer, git and a cron daemon already installed, and Redis, Valkey or RabbitMQ one command away when you want to add caching or message queues.

## Run Magento on Docker with Laradock

### 1. Add Laradock to your project

```bash
cd my-magento-store
git clone https://github.com/laradock/laradock.git
cd laradock
```

(No Magento files yet? Clone Laradock first, then pull Magento via Composer from the `workspace` container in the next steps; you will need your Adobe Commerce Marketplace authentication keys for the private repo.)

### 2. Pick the services your store needs

Magento requires a web server, a database, and a search engine (OpenSearch is what Adobe currently recommends; Elasticsearch still works on older 2.4.x releases). That is the whole required stack to install and boot a store:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock start nginx mysql opensearch workspace
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
cp .env.example .env
docker compose up -d nginx mysql opensearch workspace
```

</TabItem>
</Tabs>

Prefer MariaDB or Elasticsearch instead? Swap the name: `./laradock start nginx mariadb elasticsearch workspace` (or `docker compose up -d nginx mariadb elasticsearch workspace`). The full catalog is [here](https://laradock.io/docs/Intro#supported-services).

Prefer to be asked? The optional [CLI](https://laradock.io/docs/cli) walks you through the choices: `./laradock setup`, then `./laradock start`. It prints every real command it runs.

> **Do I need Redis or RabbitMQ to start?** No. A fresh Magento install runs on `nginx mysql opensearch workspace` alone. Redis/Valkey caching and RabbitMQ message queues are real speed-ups on a busy store, but each needs a config step to do anything, so they live in their own sections below: [Add Redis or Valkey caching](#add-redis-or-valkey-caching-optional) and [Add RabbitMQ message queues](#add-rabbitmq-message-queues-optional). What you must not skip is [Magento cron](#run-magento-cron-required-for-a-working-store), which is required for a working store.

### 3. Point Magento at the containers

Unlike Laravel or WordPress, Magento does not need a config file hand-edited before install; its installer writes `app/etc/env.php` for you. Pass the container names as hostnames when you run it in the next step: database host `mysql`, search engine host `opensearch`. The default database name, user and password live in `mysql/defaults.env`; override any of them by adding the line to Laradock's `.env` (it always wins).

### 4. Install and run

Enter the `workspace` container, where Composer, git and cron live, pull Magento and run the installer:

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

Once inside the container, pull Magento and run the installer. The `php -d memory_limit=-1` prefix lifts the CLI memory cap for these heavy steps so Composer and the installer do not run out:

```bash
php -d memory_limit=-1 /usr/local/bin/composer create-project \
  --repository-url=https://mirror.mage-os.org/ magento/project-community-edition .

php -d memory_limit=-1 bin/magento setup:install \
  --base-url=http://localhost \
  --db-host=mysql --db-name=magento --db-user=magento --db-password=secret \
  --search-engine=opensearch --opensearch-host=opensearch --opensearch-port=9200 \
  --admin-firstname=Admin --admin-lastname=User \
  --admin-email=admin@example.com --admin-user=admin --admin-password=Admin123! \
  --backend-frontname=admin
```

Then put the store in developer mode so you see real errors and un-cached templates while you work, and open it:

```bash
bin/magento deploy:mode:set developer
```

Now open [http://localhost](http://localhost). That is a full Magento store running on Docker. (If you are on Adobe Commerce rather than Magento Open Source or Mage-OS, swap the Composer repository for your Adobe Marketplace credentials, see [Add Magento Composer authentication](#add-magento-composer-authentication) below.)

Two things every fresh store still needs before it behaves: set up [cron](#run-magento-cron-required-for-a-working-store) and know how to [log into the admin](#log-into-the-admin-for-the-first-time). Both are covered below.

## Run Magento cron (required for a working store)

Cron is not optional for Magento the way it is for most apps. Reindexing, catalog price rules, transactional emails, sitemaps, cache flushing and (if you add it) message-queue processing all run from Magento's cron. Without it the store looks fine on day one and then silently stops updating.

The `workspace` container already runs a cron daemon. Point it at Magento by editing `workspace/crontab/laradock` (it ships with a Laravel line) to call Magento instead:

```cron
* * * * * laradock /usr/bin/php /var/www/bin/magento cron:run >> /var/www/var/log/magento.cron.log 2>&1
```

`/var/www` is where your project mounts inside the container; adjust the path if your `APP_CODE_PATH_CONTAINER` differs. Then rebuild the workspace so the new crontab is baked in:

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

To confirm it is running, watch the log from inside the workspace: `tail -f var/log/magento.cron.log`. Prefer Magento to manage its own crontab entries? Run `bin/magento cron:install` inside the workspace instead, though editing `workspace/crontab/laradock` is the version-controlled, rebuild-safe option.

## Reindex and manage indexers

Magento serves the storefront from flat index tables, not live queries. After importing products, changing attributes or bulk edits you reindex from the `workspace` container:

```bash
bin/magento indexer:reindex          # rebuild every index now
bin/magento indexer:status           # see which indexes are stale
bin/magento indexer:set-mode schedule   # let cron reindex on a schedule instead of on save
```

On a working store with [cron](#run-magento-cron-required-for-a-working-store) running, `schedule` mode is what you want: edits queue up and cron reindexes them, instead of blocking every save.

## Add Redis or Valkey caching (optional)

A fresh store caches to the filesystem, which is fine to get going but slow under load. Redis (or its drop-in fork Valkey, recommended for new Magento 2.4.8+ installs) moves the cache and PHP sessions into memory and noticeably speeds up the admin and front end. Wiring it up is two steps.

1. Start the container alongside the rest:

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

(For Valkey, use `valkey` in place of `redis`; the config below is identical since Valkey speaks the Redis protocol.)

2. Point Magento's cache and sessions at it from the `workspace` container:

```bash
bin/magento setup:config:set --cache-backend=redis \
  --cache-backend-redis-server=redis --cache-backend-redis-port=6379 --cache-backend-redis-db=0

bin/magento setup:config:set --session-save=redis \
  --session-save-redis-host=redis --session-save-redis-port=6379 --session-save-redis-db=2
```

Flush once with `bin/magento cache:flush` and Magento now stores cache and sessions in memory. Without those commands the container just sits idle, which is why the required stack above leaves it out.

## Add RabbitMQ message queues (optional)

Magento pushes slow work (async order placement, bulk actions, B2B operations, custom consumers) onto a message queue. With no broker configured it falls back to database queues, which work but do not scale. RabbitMQ is the supported broker.

1. Start it:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock start rabbitmq
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose up -d rabbitmq
```

</TabItem>
</Tabs>

2. Connect Magento to it from the `workspace` container (defaults match Laradock's `rabbitmq/docker-compose` credentials):

```bash
bin/magento setup:config:set \
  --amqp-host=rabbitmq --amqp-port=5672 \
  --amqp-user=guest --amqp-password=guest --amqp-virtualhost=/
```

3. Run the consumers that drain the queues. In development you can start them by hand:

```bash
bin/magento queue:consumers:list                    # see every consumer
bin/magento queue:consumers:start async.operations.all --max-messages=1000
```

For a store that stays up, let cron keep consumers running instead of starting them by hand: set `cron_run` to `true` under `queue` in `app/etc/env.php`, and Magento's [cron](#run-magento-cron-required-for-a-working-store) will spawn them.

## Add a mail catcher (optional)

Magento sends order confirmations, invoices and admin notifications. In development you do not want those hitting real inboxes. Start a mail catcher and every outgoing email is trapped in a local web UI instead:

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

Point Magento's SMTP at the container. Core Magento has no SMTP config screen, so install a transport module (for example [mageplaza/module-smtp](https://github.com/mageplaza/magento-2-smtp)) via Composer, then set host `mailpit` and port `1025` in its **Stores > Configuration > Mageplaza > SMTP** screen. Open [http://localhost:8025](http://localhost:8025) to read every message the store tries to send.

## Change the PHP version anytime

This is where a native install hurts and Laradock shines. Set the version in Laradock's `.env` and rebuild:

```env
PHP_VERSION=8.4
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

Magento 2.4.8 targets PHP 8.3 and 8.4, while older 2.4.x releases run on 8.1 or 8.2, so check which PHP range your specific Magento version supports before you pick one. Either way, the same tool can run a legacy 2.3 store on PHP 7.4 and a current 2.4 store on 8.4 side by side, each isolated, none of it installed on your machine.

Magento also needs a generous PHP memory limit. The `php -d memory_limit=-1` prefix in the install step covers the CLI; for the web-facing PHP-FPM, raise the `memory_limit` line in `php-fpm/php8.4.ini` (or whichever `php-fpm/phpX.Y.ini` matches your `PHP_VERSION`) to at least `2G`, then rebuild `php-fpm`.

## Build the storefront assets

While you develop in `developer` mode, Magento generates CSS and JS on the fly, no build step needed. When you want to test the store the way production serves it, compile dependency injection and deploy static content from the `workspace` container:

```bash
bin/magento setup:di:compile
bin/magento setup:static-content:deploy -f          # add locale codes, e.g. en_US de_DE, for a multi-language store
bin/magento deploy:mode:set production
```

To iterate on a custom theme with LESS, Magento's [Grunt](https://developer.adobe.com/commerce/frontend-core/guide/css/less-preprocess/) workflow lives in the `workspace` container too, which already has Node and npm: `npm install`, then `npx grunt exec:<theme> watch`. Switch back with `bin/magento deploy:mode:set developer` when you are done.

## Log into the admin for the first time

The admin lives at the path you passed as `--backend-frontname` during install (`http://localhost/admin` in the steps above). Log in with the `--admin-user` / `--admin-password` you set.

Magento 2.4 enables two-factor authentication by default, which expects a public URL to enroll an authenticator. On a local `http://localhost` store that is a dead end, so disable the 2FA modules for development from the `workspace` container:

```bash
bin/magento module:disable Magento_TwoFactorAuth Magento_AdminAdobeImsTwoFactorAuth
bin/magento setup:upgrade
bin/magento cache:flush
```

Forgot the admin path or need another admin user? `bin/magento info:adminuri` prints the admin URL, and `bin/magento admin:user:create` makes a new account.

## Import an existing Magento database

Moving a store from another environment is a database import plus a base-URL rewrite. Copy the dump into the project so the `workspace` container can see it, then from inside the container:

```bash
mysql -h mysql -u magento -psecret magento < dump.sql

bin/magento setup:store-config:set --base-url=http://localhost/ --base-url-secure=https://localhost/
bin/magento setup:upgrade          # apply any schema changes from your code version
bin/magento indexer:reindex
bin/magento cache:flush
```

If the source store hard-coded absolute URLs in `core_config_data`, clear them so Magento falls back to the base URL: `DELETE FROM core_config_data WHERE path LIKE 'web/%base_url';` then `bin/magento cache:flush`. Keep the same OpenSearch index prefix, or reindex, and the imported catalog is searchable again.

## Run a multi-store or multi-website setup

Magento's multi-store is one of the reasons teams pick it: one install, many websites and store views sharing a catalog. Create the websites and stores under **Stores > All Stores** in the admin, then tell NGINX which one to serve by setting the run code and type. Laradock's NGINX vhost is yours to edit; add the Magento variables to the site's `server` block in `nginx/sites/`:

```nginx
fastcgi_param MAGE_RUN_CODE base;      # the store or website code
fastcgi_param MAGE_RUN_TYPE store;     # "store" or "website"
```

Add a second `server` block with a different `server_name` (for example `de.localhost`) and its own `MAGE_RUN_CODE` to serve a second storefront from the same containers, then restart NGINX with `./laradock restart nginx` (or `docker compose restart nginx`).

## Everyday CLI and admin tooling

Everything you administer runs through `bin/magento` inside the `workspace` container. The commands you will reach for most:

```bash
bin/magento cache:flush                 # after config changes
bin/magento setup:upgrade               # after installing or updating a module
bin/magento module:status               # list enabled/disabled modules
bin/magento maintenance:enable          # take the store offline for deploys
bin/magento app:config:dump             # export config to shared, version-controlled files
```

Composer and git live there too, so `composer require vendor/module` followed by `bin/magento setup:upgrade` is the full install-a-module loop, no host tooling involved.

## Add Magento Composer authentication

Adding Composer authentication credentials for Magento 2 (needed for Adobe Commerce's private Marketplace repository, or any other private Composer repository your store depends on):

1. In `.env`, set `WORKSPACE_COMPOSER_AUTH` to `true`.
2. Add your credentials to `workspace/auth.json`.
3. Rebuild the workspace: `./laradock rebuild workspace` (or `docker compose build workspace`).

## Take your store live

When your store is ready, the same Laradock stack becomes your deployment. You build one hardened image of your app and ship it to the host of your choice:

```bash
./laradock ship
```

Then pick a target and follow its short guide, a single server, a managed platform, or Kubernetes: **[Deploy to Production](https://laradock.io/docs/production)** lists every provider (Fly.io, Render, Railway, DigitalOcean, AWS, Google Cloud, Azure, Kamal, Kubernetes) with a ready config file for each. There is no per-provider magic to learn; a Docker image runs the same everywhere. A production Magento cluster typically also splits OpenSearch, Redis/Valkey and the database onto dedicated infrastructure, which the same service names make straightforward to point at.

## Frequently Asked Questions

### Do I need to install PHP, MySQL or OpenSearch to run Magento with Laradock?

No. Everything lives inside the containers. Composer, git and cron are in the `workspace` container; you never install PHP, the database or the search engine on your host.

### Which services should I start for a typical Magento store?

`nginx mysql opensearch workspace` is everything Magento requires to install and boot: web server, database, search engine, and a shell that also runs cron. Swap `opensearch` for `elasticsearch` on an older Magento version that still expects it, or `mysql` for `mariadb`. Add `redis`/`valkey` and `rabbitmq` only when you wire them up ([caching](#add-redis-or-valkey-caching-optional), [message queues](#add-rabbitmq-message-queues-optional)); they do nothing until you do. Do set up [cron](#run-magento-cron-required-for-a-working-store), which every working store needs.

### Can I run multiple Magento stores on different PHP versions?

Yes. Give each its own Laradock with a unique `COMPOSE_PROJECT_NAME` and `DATA_PATH_HOST`, set a different `PHP_VERSION` in each, and they run independently on the same machine. (That is separate from Magento's built-in multi-store, which serves many storefronts from one install, see [above](#run-a-multi-store-or-multi-website-setup).)

### Does this work the same on macOS, Windows and Linux?

Yes. Laradock runs anywhere Docker runs. On macOS/Windows, file-sync speed depends on Docker Desktop (VirtioFS helps a lot for `vendor/`-heavy apps like Magento); it is a Docker Desktop trait, not specific to Laradock.

### Is this the same Docker setup I would use in production?

The containers are production-style (real NGINX + PHP-FPM), so it is far closer to production than a native install, though a production Magento cluster typically splits the search engine, cache and database onto dedicated infrastructure. See [Prepare Laradock for Production](https://laradock.io/docs/production#prepare-laradock-for-production) for the hardening steps.

---

Comparing environments? See **[Laradock vs docker-magento and Warden](https://laradock.io/docs/laradock-vs-docker-magento)** and the full **[Laradock vs Others](https://laradock.io/docs/laradock-alternatives)** breakdown. Ready to start? **[Getting Started](https://laradock.io/docs/getting-started)** takes about five minutes.
