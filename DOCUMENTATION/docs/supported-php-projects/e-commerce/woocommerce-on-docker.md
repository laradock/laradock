---
slug: /woocommerce-on-docker
title: Run WooCommerce on Docker
description: Run WooCommerce on Docker in minutes with Laradock. What Docker gives a WooCommerce store, why Laradock is the fastest way to get WordPress, NGINX, PHP, MySQL and Redis running, and the exact commands, with any PHP version, without installing anything on your machine.
keywords:
  - woocommerce on docker
  - run woocommerce on docker
  - woocommerce docker
  - woocommerce docker setup
  - dockerize woocommerce
  - woocommerce docker environment
  - woocommerce wordpress mysql docker
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

## What is WooCommerce?

[WooCommerce](https://woocommerce.com) is the most widely used e-commerce plugin for WordPress, turning a regular WordPress site into a full online store: products, cart, checkout, payments and shipping. It is not a standalone application; it requires a working WordPress install first, which means the same underlying stack as any WordPress site: a web server, PHP-FPM, a MySQL or MariaDB database, and Redis for object caching once a store has real traffic.

## Why run WooCommerce in Docker?

Docker packages each of those pieces (NGINX, PHP-FPM, MySQL, Redis) into isolated containers that run the same on every machine. Instead of installing PHP and MySQL onto your laptop, where versions collide between sites and "works on my machine" starts, you run disposable containers that mirror production and vanish cleanly when you delete them. One store can run PHP 8.3 while another runs an older 7.4 plugin stack, on the same computer, with nothing installed globally.

The catch: wiring those containers together yourself (base images, PHP extensions, networking, permissions) is a week of fiddly Docker work. That is exactly what Laradock removes.

## Why Laradock is the best fit for WooCommerce

WooCommerce has no Docker tooling of its own, and neither does WordPress, so a ready-made, no-lock-in environment matters even more. Here is why Laradock is the best fit:

- **You are never locked into one ecosystem.** Laradock is framework-agnostic. Run your WooCommerce store today, add a Laravel API, a headless storefront, or a plain PHP script beside it tomorrow, all in the same environment with the same commands.
- **Far more flexibility.** 100+ ready services and any PHP version from 5.6 to 8.5, so a legacy theme and a modern store each get exactly the runtime they need.
- **Nothing is hidden and you own everything.** No generated files, no magic, no wrapper binary between you and Docker. Every Dockerfile and compose file is right there for you to read and edit.
- **Nothing new to learn.** What you use is plain `docker compose`, knowledge that transfers straight to production. Our [CLI](/docs/cli) is an optional nicety, never a requirement.

Concretely, for WooCommerce it gives you a production-style NGINX + PHP-FPM stack, MySQL/MariaDB and Redis already wired, a `workspace` container with WP-CLI, Composer and git installed, and any PHP version behind a single line of config.

## Run WooCommerce on Docker with Laradock

### 1. Add Laradock to your project

```bash
cd my-woocommerce-store
git clone https://github.com/laradock/laradock.git
cd laradock && cp .env.example .env
```

(No WordPress files yet? Clone Laradock first, then download WordPress from the `workspace` container in the next steps; WooCommerce is installed on top of it as a plugin.)

### 2. Pick the services your store needs

WooCommerce needs everything WordPress needs, plus Redis for object caching once product/order volume grows. The web server pulls in PHP-FPM automatically:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock start nginx mysql redis workspace
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose up -d nginx mysql redis workspace
```

</TabItem>
</Tabs>

Prefer MariaDB over MySQL? Swap the name: `./laradock start nginx mariadb redis workspace` (or `docker compose up -d nginx mariadb redis workspace`). The full catalog is [here](/docs/Intro#supported-services).

Prefer to be asked? The optional [CLI](/docs/cli) walks you through the choices: `./laradock setup`, then `./laradock start`. It prints every real command it runs.

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

Enter the `workspace` container, where WP-CLI, Composer and git live, set WordPress up, then add WooCommerce on top:

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

Then open [http://localhost/wp-admin](http://localhost/wp-admin) and finish the WooCommerce setup wizard (store address, currency, payment methods, shipping zones). That is a full WooCommerce store running on Docker.

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

## Frequently Asked Questions

### Do I need to install PHP, MySQL or WP-CLI to run WooCommerce with Laradock?

No. Everything lives inside the containers. WP-CLI, Composer, git and PHP are all provided; you never install them on your host.

### Which services should I start for a typical WooCommerce store?

`nginx mysql redis workspace` covers most stores: web server, database, object cache, and a shell. Swap `mysql` for `mariadb` if you prefer.

### Can I run multiple WooCommerce stores on different PHP versions?

Yes. Give each its own Laradock with a unique `COMPOSE_PROJECT_NAME` and `DATA_PATH_HOST`, set a different `PHP_VERSION` in each, and they run independently on the same machine.

### Does this work the same on macOS, Windows and Linux?

Yes. Laradock runs anywhere Docker runs. On macOS/Windows, file-sync speed depends on Docker Desktop (VirtioFS helps a lot); it is a Docker Desktop trait, not specific to Laradock.

### Is this the same Docker setup I would use in production?

The containers are production-style (real NGINX + PHP-FPM), so it is far closer to production than a native install. See [Prepare Laradock for Production](/docs/production#prepare-laradock-for-production) for the hardening steps.

---

Comparing environments? See the full **[Laradock vs Others](/docs/laradock-alternatives)** breakdown. Ready to start? **[Getting Started](/docs/getting-started)** takes about five minutes.
