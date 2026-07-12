# Run WordPress on Docker

Source: https://laradock.io/docs/wordpress-on-docker

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

## What is WordPress?

[WordPress](https://wordpress.org) is the most widely used CMS on the web, powering a large share of all websites, from blogs to full e-commerce stores via WooCommerce. It is a PHP application backed by a MySQL (or MariaDB) database, served through a web server, and it benefits from Redis for object caching on busier sites.

## Why run WordPress in Docker?

Docker packages each of those pieces (NGINX, PHP-FPM, MySQL, Redis) into isolated containers that run the same on every machine. Instead of installing PHP and MySQL onto your laptop, where versions collide between sites and "works on my machine" starts, you run disposable containers that mirror production and vanish cleanly when you delete them. One site can run PHP 8.3 while another runs an older 7.4 plugin stack, on the same computer, with nothing installed globally.

The catch: wiring those containers together yourself (base images, PHP extensions, networking, permissions) is a week of fiddly Docker work. That is exactly what Laradock removes.

## Why Laradock is the best fit for WordPress

Unlike Laravel with Sail, WordPress has no single official Docker environment: the core team's `wp-env` targets plugin/theme development, and the official `wordpress` image is a bare runtime you wire yourself ([full comparison](https://laradock.io/docs/laradock-vs-wordpress-docker)). So a ready-made, no-lock-in environment matters even more. Here is why Laradock is the best fit:

- **You are never locked into one ecosystem.** Laradock is framework-agnostic. Run WordPress today, add a Laravel API, a Symfony service, or a plain PHP script beside it tomorrow, all in the same environment with the same commands.
- **Far more flexibility.** 100+ ready services and any PHP version from 5.6 to 8.5, so a legacy theme and a modern site each get exactly the runtime they need.
- **Nothing is hidden and you own everything.** No generated files, no magic, no wrapper binary between you and Docker. Every Dockerfile and compose file is right there for you to read and edit.
- **Nothing new to learn.** What you use is plain `docker compose`, knowledge that transfers straight to production. Our [CLI](https://laradock.io/docs/cli) is an optional nicety, never a requirement.

Concretely, for WordPress it gives you a production-style NGINX + PHP-FPM stack, MySQL/MariaDB ready to connect (and Redis one command away when you want object caching), a `workspace` container with WP-CLI, Composer and git installed, and any PHP version behind a single line of config.

## Run WordPress on Docker with Laradock

### 1. Add Laradock to your project

```bash
cd my-wordpress-site
git clone https://github.com/laradock/laradock.git
cd laradock
```

(No WordPress files yet? Clone Laradock first, then download WordPress from the workspace container in the next steps.)

### 2. Pick the services your site needs

WordPress needs exactly two things: a **web server** and a **database**. The web server pulls in PHP-FPM automatically, so this is the whole required stack:

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

> **Do I need Redis?** Not to get running. WordPress core does nothing with Redis on its own, a fresh site runs perfectly on `nginx mysql workspace`. It only helps on busier sites, and only once you add the object-cache plugin. See [Add Redis object caching](#add-redis-object-caching-optional) below when you actually want it.

### 3. Point WordPress at the containers

In your `wp-config.php`, use the service names as hostnames:

```php
define( 'DB_HOST', 'mysql' );
define( 'DB_NAME', 'default' );
define( 'DB_USER', 'default' );
define( 'DB_PASSWORD', 'secret' );
```

The default database, user and password live in `mysql/defaults.env`; override any of them by adding the line to Laradock's `.env` (it always wins).

### 4. Install and run your site

Enter the `workspace` container, where WP-CLI, Composer and git live, and set the site up:

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
wp core install --url=http://localhost --title="My Site" \
  --admin_user=admin --admin_password=secret --admin_email=you@example.com
```

Then open [http://localhost](http://localhost). That is a full WordPress site running on Docker.

## Add Redis object caching (optional)

Redis is not required, but on a busy site it caches WordPress's database queries in memory and noticeably speeds up the admin and front end. Wiring it up is three steps:

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

That's it, WordPress now stores its object cache in Redis. Without those steps the container just sits idle, which is why the required stack above leaves it out.

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

Anything from PHP 5.6 to 8.5 works, so a legacy site pinned to an old plugin and a brand-new build run side by side, each isolated, none of it installed on your machine.

## Take your site live

When your site is ready, the same Laradock stack becomes your deployment. You build one hardened image of your app and ship it to the host of your choice:

```bash
./laradock ship
```

Then pick a target and follow its short guide, a single server, a managed platform, or Kubernetes: **[Deploy to Production](https://laradock.io/docs/production)** lists every provider (Fly.io, Render, Railway, DigitalOcean, AWS, Google Cloud, Azure, Kamal, Kubernetes) with a ready config file for each. There is no per-provider magic to learn; a Docker image runs the same everywhere.

## Frequently Asked Questions

### Do I need to install PHP, MySQL or WP-CLI to run WordPress with Laradock?

No. Everything lives inside the containers. WP-CLI, Composer, git and PHP are all provided; you never install them on your host.

### Which services should I start for a typical WordPress site?

`nginx mysql workspace` is all WordPress requires: web server, database, and a shell. Swap `mysql` for `mariadb` if you prefer. Add `redis` only if you set up the [object-cache plugin](#add-redis-object-caching-optional); without it, Redis does nothing for WordPress.

### Can I run multiple WordPress sites on different PHP versions?

Yes. Give each its own Laradock with a unique `COMPOSE_PROJECT_NAME` and `DATA_PATH_HOST`, set a different `PHP_VERSION` in each, and they run independently on the same machine.

### Does this work the same on macOS, Windows and Linux?

Yes. Laradock runs anywhere Docker runs. On macOS/Windows, file-sync speed depends on Docker Desktop (VirtioFS helps a lot); it is a Docker Desktop trait, not specific to Laradock.

### Is this the same Docker setup I would use in production?

The containers are production-style (real NGINX + PHP-FPM), so it is far closer to production than a native install. See [Prepare Laradock for Production](https://laradock.io/docs/production#prepare-laradock-for-production) for the hardening steps.

---

Comparing local WordPress environments? See **[Laradock vs the Official WordPress Docker Setup](https://laradock.io/docs/laradock-vs-wordpress-docker)** (wp-env & the official image), **[Laradock vs Local WP](https://laradock.io/docs/laradock-vs-local-wp)**, and the full **[Laradock vs Others](https://laradock.io/docs/laradock-alternatives)** breakdown. Ready to start? **[Getting Started](https://laradock.io/docs/getting-started)** takes about five minutes.
