# Run WooCommerce on Docker

Source: https://laradock.io/docs/woocommerce-on-docker

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

## What is WooCommerce?

[WooCommerce](https://woocommerce.com) is the most widely used e-commerce plugin for WordPress, turning a regular WordPress site into a full online store: products, cart, checkout, payments and shipping. It is not a standalone application; it requires a working WordPress install first, which means the same underlying stack as any WordPress site: a web server, PHP-FPM, and a MySQL or MariaDB database. On top of that, WooCommerce leans on WordPress cron to run its background jobs (order emails, webhooks, stock sync) through a queue called Action Scheduler, and it benefits from Redis object caching and an Elasticsearch-backed search once a store carries real products and traffic.

## Why run WooCommerce in Docker?

Docker packages each of those pieces (NGINX, PHP-FPM, MySQL, Redis) into isolated containers that run the same on every machine. Instead of installing PHP and MySQL onto your laptop, where versions collide between sites and "works on my machine" starts, you run disposable containers that mirror production and vanish cleanly when you delete them. One store can run PHP 8.3 while another runs an older 7.4 plugin stack, on the same computer, with nothing installed globally.

The catch: wiring those containers together yourself (base images, PHP extensions, networking, permissions) is a week of fiddly Docker work. That is exactly what Laradock removes.

## Why Laradock is the best fit for WooCommerce

WooCommerce has no Docker tooling of its own, and neither does WordPress, so a ready-made, no-lock-in environment matters even more. Here is why Laradock is the best fit:

- **You are never locked into one ecosystem.** Laradock is framework-agnostic. Run your WooCommerce store today, add a Laravel API, a headless storefront, or a plain PHP script beside it tomorrow, all in the same environment with the same commands.
- **Far more flexibility.** 100+ ready services and any PHP version from 5.6 to 8.5, so a legacy theme and a modern store each get exactly the runtime they need.
- **Nothing is hidden and you own everything.** No generated files, no magic, no wrapper binary between you and Docker. Every Dockerfile and compose file is right there for you to read and edit.
- **Nothing new to learn.** What you use is plain `docker compose`, knowledge that transfers straight to production. Our [CLI](https://laradock.io/docs/cli) is an optional nicety, never a requirement.

Concretely, for WooCommerce it gives you a production-style NGINX + PHP-FPM stack, MySQL/MariaDB ready to connect (and Redis, Elasticsearch, a mail catcher and a real cron each one command away when you want them), a `workspace` container with WP-CLI, Composer, Node and git installed, and any PHP version behind a single line of config.

## Run WooCommerce on Docker with Laradock

### 1. Add Laradock to your project

```bash
cd my-woocommerce-store
git clone https://github.com/laradock/laradock.git
cd laradock
```

(No WordPress files yet? Clone Laradock first, then download WordPress from the `workspace` container in the next steps; WooCommerce is installed on top of it as a plugin.)

### 2. Pick the services your store needs

WooCommerce needs exactly what WordPress needs: a **web server** and a **database**. The web server pulls in PHP-FPM automatically, so this is the whole required stack:

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

> **Do I need Redis?** Not to get running. A fresh store runs perfectly on `nginx mysql workspace`. Redis only helps once product and order volume grows, and only after you add the object-cache plugin. Same for Elasticsearch: WooCommerce searches the database by default and only needs a search engine on large catalogs. Both live in their own sections below, [Add Redis object caching](#add-redis-object-caching-optional) and [Add Elasticsearch for product search](#add-elasticsearch-for-product-search-optional), for when you actually want them.

### 3. Point WordPress at the containers

In your `wp-config.php`, use the service names as hostnames, same as any WordPress install:

```php
define( 'DB_HOST', 'mysql' );
define( 'DB_NAME', 'default' );
define( 'DB_USER', 'default' );
define( 'DB_PASSWORD', 'secret' );
```

The default database, user and password live in `mysql/defaults.env`; override any of them by adding the line to Laradock's `.env` (it always wins).

### 4. Install WordPress, then install WooCommerce

Enter the `workspace` container, where WP-CLI, Composer, Node and git live, set WordPress up, then add WooCommerce on top:

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
wp core download          # only if you have no WordPress files yet
wp core install --url=http://localhost --title="My Store" \
  --admin_user=admin --admin_password=secret --admin_email=you@example.com
wp plugin install woocommerce --activate
```

Then open [http://localhost/wp-admin](http://localhost/wp-admin), log in with the admin user and password you just set, and finish the WooCommerce setup wizard (store address, currency, payment methods, shipping zones). That is a full WooCommerce store running on Docker.

## Add Redis object caching (optional)

Redis is not required, but on a real store it caches WordPress and WooCommerce database queries in memory and noticeably speeds up the admin, the cart and the catalog. Wiring it up is three steps:

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

2. Point WordPress at it in `wp-config.php`:

```php
define( 'WP_REDIS_HOST', 'redis' );
```

3. From the `workspace` container, install and enable the [Redis Object Cache](https://wordpress.org/plugins/redis-cache/) plugin:

```bash
wp plugin install redis-cache --activate
wp redis enable
```

That's it, WooCommerce now stores its object cache in Redis. Without those steps the container just sits idle, which is why the required stack above leaves it out.

## Run WooCommerce background jobs reliably (Action Scheduler and cron)

WooCommerce queues a lot of work in the background through **Action Scheduler**: sending order emails, retrying failed webhooks, syncing stock, regenerating product lookup tables, running subscription renewals. Those jobs are triggered by WordPress cron (WP-Cron), which by default only fires when someone visits the site. On a quiet dev store that means emails and orders can appear "stuck." The fix is to drive cron from a real, always-on scheduler instead of page visits.

1. Turn off the visitor-triggered cron in `wp-config.php`:

```php
define( 'DISABLE_WP_CRON', true );
```

2. Laradock's `workspace` container ships with cron running. Point it at WordPress by editing `workspace/crontab/laradock` so it runs the due WordPress events every minute:

```cron
* * * * * laradock cd /var/www && wp cron event run --due-now >> /dev/null 2>&1
```

3. Rebuild the workspace so the new schedule is baked in:

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

Now every scheduled task fires on time. To watch or push the queue by hand from inside `workspace`, use WooCommerce's own runner:

```bash
wp action-scheduler run          # process the pending Action Scheduler queue now
wp cron event list               # see what WordPress has scheduled
```

## Add Elasticsearch for product search (optional)

WooCommerce searches products with plain database `LIKE` queries, which is fine for a small catalog but slows down and misses relevant results as products grow into the thousands. [ElasticPress](https://wordpress.org/plugins/elasticpress/) offloads search to Elasticsearch for fast, typo-tolerant, faceted product search.

1. Start the Elasticsearch container:

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

2. From the `workspace` container, install ElasticPress and point it at the container by its service name:

```bash
wp plugin install elasticpress --activate
wp config set EP_HOST http://elasticsearch:9200
```

3. Build the index so your existing products are searchable:

```bash
wp elasticpress index --setup
```

New and edited products are indexed automatically after that. Skip this whole section for a small store; the default database search is enough.

## Catch store emails while developing (optional)

A store sends a lot of mail: new-order receipts, "your order is complete," password resets, admin alerts. In development you do not want that reaching real inboxes, and you do want to actually see it. [Mailpit](https://github.com/axllent/mailpit) is a fake SMTP server with a web inbox that catches every message.

1. Start the mail container:

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

2. Tell WordPress to send through it. Install a small SMTP plugin such as [WP Mail SMTP](https://wordpress.org/plugins/wp-mail-smtp/) from the `workspace` container and point it at the mail container:

```bash
wp plugin install wp-mail-smtp --activate
```

Then in the plugin settings (or via `wp option`), set the mailer to **SMTP**, host `mailpit`, port `1025`, no encryption, no authentication.

3. Open the Mailpit inbox at [http://localhost:8125](http://localhost:8125) and place a test order. Every WooCommerce email lands there instead of a customer's inbox.

## Build custom theme and block assets

If you are building a custom theme or WooCommerce Blocks, the `workspace` container already has Node and npm, so you never install them on your host. Work from your theme or plugin directory inside `workspace`:

```bash
cd /var/www/wp-content/themes/my-store-theme
npm install
npm run build        # or: npm run start  to watch and rebuild on save
```

WooCommerce's own block tooling and any `@wordpress/scripts` setup run the same way. Because the code is bind-mounted, edits on your host rebuild inside the container and show up in the browser immediately.

## Manage your store from the command line

WooCommerce adds `wp wc` commands to WP-CLI, so you can script the whole store from inside `workspace` without clicking through the admin. A few common ones:

```bash
wp wc product create --name="T-Shirt" --type=simple --regular_price=19.99 --user=admin
wp wc product list --user=admin
wp wc shop_order list --user=admin
wp wc tool run regenerate_product_lookup_tables --user=admin
```

The `--user` flag is required because these commands run as an authenticated store manager. Plain `wp plugin`, `wp theme`, `wp user` and `wp db` commands work here too, which makes bulk imports and maintenance a one-liner.

## Import an existing store

Moving a live store onto Laradock is a database import plus a URL rewrite. Copy your `.sql` dump and the `wp-content` folder into the project, then from `workspace`:

```bash
wp db import store-dump.sql
wp search-replace 'https://your-live-store.com' 'http://localhost' --all-tables
wp cache flush
```

`wp search-replace` safely rewrites the serialized data WooCommerce stores (product URLs, settings, order meta) that a blind find-and-replace would corrupt. If you use Redis, flush it after importing so stale cached queries do not linger.

## Run more than one store

Two ways, depending on what you need:

- **One WordPress, many storefronts:** enable [WordPress Multisite](https://wordpress.org/documentation/article/create-a-network/) and run a store per site. WooCommerce supports it, and everything shares one Laradock stack.
- **Fully separate stores:** give each its own copy of Laradock with a unique `COMPOSE_PROJECT_NAME` and `DATA_PATH_HOST` in `.env`. They run side by side on the same machine, each with its own database and even its own PHP version.

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

WooCommerce currently recommends PHP 8.3 and works down to PHP 7.4 on older stores, so a legacy site pinned to an old theme and a brand-new build run side by side, each isolated, none of it installed on your machine.

## Take your store live

When your store is ready, the same Laradock stack becomes your deployment. You build one hardened image of your store and ship it to the host of your choice:

```bash
./laradock ship
```

Then pick a target and follow its short guide, a single server, a managed platform, or Kubernetes: **[Deploy to Production](https://laradock.io/docs/production)** lists every provider (Fly.io, Render, Railway, DigitalOcean, AWS, Google Cloud, Azure, Kamal, Kubernetes) with a ready config file for each. There is no per-provider magic to learn; a Docker image runs the same everywhere.

## Frequently Asked Questions

### Do I need to install PHP, MySQL or WP-CLI to run WooCommerce with Laradock?

No. Everything lives inside the containers. WP-CLI, Composer, Node, git and PHP are all provided; you never install them on your host.

### Which services should I start for a typical WooCommerce store?

`nginx mysql workspace` is all WooCommerce requires: web server, database, and a shell. Swap `mysql` for `mariadb` if you prefer. Add `redis` once you set up the [object-cache plugin](#add-redis-object-caching-optional), `elasticsearch` for [large-catalog search](#add-elasticsearch-for-product-search-optional), and `mailpit` to [catch order emails](#catch-store-emails-while-developing-optional) in development. Each does nothing until you wire it up, which is why the required stack leaves them out.

### How do I make WooCommerce emails and scheduled jobs actually run?

Drive WordPress cron from the container's real scheduler instead of page visits. See [Run WooCommerce background jobs reliably](#run-woocommerce-background-jobs-reliably-action-scheduler-and-cron): disable WP-Cron, add one crontab line, and Action Scheduler processes emails, webhooks and stock sync on time.

### Can I run multiple WooCommerce stores on different PHP versions?

Yes. Give each its own Laradock with a unique `COMPOSE_PROJECT_NAME` and `DATA_PATH_HOST`, set a different `PHP_VERSION` in each, and they run independently on the same machine.

### Does this work the same on macOS, Windows and Linux?

Yes. Laradock runs anywhere Docker runs. On macOS/Windows, file-sync speed depends on Docker Desktop (VirtioFS helps a lot); it is a Docker Desktop trait, not specific to Laradock.

### Is this the same Docker setup I would use in production?

The containers are production-style (real NGINX + PHP-FPM), so it is far closer to production than a native install. See [Prepare Laradock for Production](https://laradock.io/docs/production#prepare-laradock-for-production) for the hardening steps.

---

Comparing environments? See the full **[Laradock vs Others](https://laradock.io/docs/laradock-alternatives)** breakdown. Ready to start? **[Getting Started](https://laradock.io/docs/getting-started)** takes about five minutes.
