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

[PrestaShop](https://www.prestashop.com) is an open-source PHP e-commerce platform popular in Europe and Latin America, covering everything from a small catalog to a multi-store, multi-language shop. It is a PHP application that needs a web server, PHP-FPM, and a MySQL or MariaDB database; Redis is not required but is commonly added for cache and session storage on busier stores.

## Why run PrestaShop in Docker?

Docker packages each of those pieces (a web server, PHP-FPM, MySQL, Redis) into isolated containers that run the same on every machine. Instead of installing PHP and MySQL onto your laptop, where versions collide between projects and "works on my machine" starts, you run disposable containers that mirror production and vanish cleanly when you delete them. One store can run PHP 8.1 while another runs PrestaShop 1.6 on an older PHP release, on the same computer, with nothing installed globally.

The catch: wiring those containers together yourself (base images, PHP extensions, networking, permissions) is a week of fiddly Docker work. That is exactly what Laradock removes.

## Why Laradock is the best fit for PrestaShop

PrestaShop publishes an official [`prestashop/prestashop`](https://hub.docker.com/r/prestashop/prestashop) image on Docker Hub, a single Apache+PHP container with PrestaShop pre-installed, so it does not strictly need Laradock. It is still the best fit for a real project, and here is why:

- **You are never locked into one ecosystem.** Laradock is framework-agnostic. The day you add a Symfony back-office tool, a Laravel API, or a plain PHP script beside your PrestaShop store, it runs in the same environment with the same commands. A single bundled image cannot do that.
- **Far more flexibility.** 100+ ready services and any PHP version from 5.6 to 8.5, versus the one bundled runtime the official image gives you.
- **Nothing is hidden and you own everything.** No generated files, no magic, no wrapper binary between you and Docker. Every Dockerfile and compose file is right there for you to read and edit, and your web server and PHP-FPM are separate containers you can tune independently.
- **Nothing new to learn.** What you use is plain `docker compose`, knowledge that transfers straight to production and to every other project. Our [CLI](/docs/cli) is an optional nicety, never a requirement.

Concretely, for PrestaShop it gives you a production-style NGINX or Apache + PHP-FPM stack, MySQL/MariaDB and Redis already wired, and a `workspace` container with Composer and git installed.

## Run PrestaShop on Docker with Laradock

### 1. Add Laradock to your project

```bash
cd my-prestashop-store
git clone https://github.com/laradock/laradock.git
cd laradock
```

(No PrestaShop files yet? Clone Laradock first, then download PrestaShop from the `workspace` container in the next steps.)

### 2. Pick the services your store needs

PrestaShop needs a web server and a database. Redis is optional; add it when you enable object caching:

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

Want Redis too, or MariaDB instead of MySQL? `./laradock start nginx mariadb redis workspace` (or `docker compose up -d nginx mariadb redis workspace`). PrestaShop ships Apache-oriented `.htaccess` rules, so if you use `nginx` you may need to port a few of its rewrite rules; Apache is available as a service too. The full catalog is [here](/docs/Intro#supported-services).

### 3. Point PrestaShop at the containers

PrestaShop's installer writes its connection details to `app/config/parameters.php` (PrestaShop 1.7/8/9) during setup. Point it at the containers by giving it these values when you run the installer in the next step: database server `mysql`, database name, user and password of your choice.

### 4. Install and run

Enter the `workspace` container, where Composer and git live, download PrestaShop and run its installer:

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
composer create-project prestashop/prestashop .
php install-dev/index_cli.php --domain=localhost --db_server=mysql \
  --db_name=prestashop --db_user=root --db_password=secret \
  --firstname=Admin --lastname=User --email=admin@example.com --password=Admin123!
```

(The exact installer script name has moved between PrestaShop major versions; check `install-dev/` or `install/` in the version you downloaded, or use the browser-based installer at `http://localhost/install` instead.) Then open [http://localhost](http://localhost). That is a full PrestaShop store running on Docker.

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

## Frequently Asked Questions

### Do I need to install PHP or MySQL to run PrestaShop with Laradock?

No. Everything lives inside the containers. Composer and git are in the `workspace` container; you never install PHP or the database on your host.

### Which services should I start for a typical PrestaShop store?

`nginx mysql workspace` covers most stores. Add `redis` once you turn on object caching, and swap `mysql` for `mariadb` if you prefer.

### Can I run multiple PrestaShop stores on different PHP versions?

Yes. Give each its own Laradock with a unique `COMPOSE_PROJECT_NAME` and `DATA_PATH_HOST`, set a different `PHP_VERSION` in each, and they run independently on the same machine.

### Does this work the same on macOS, Windows and Linux?

Yes. Laradock runs anywhere Docker runs. On macOS/Windows, file-sync speed depends on Docker Desktop (VirtioFS helps a lot); it is a Docker Desktop trait, not specific to Laradock.

### Is this the same Docker setup I would use in production?

The containers are production-style (real web server + PHP-FPM), so it is far closer to production than a native install. See [Prepare Laradock for Production](/docs/production#prepare-laradock-for-production) for the hardening steps.

---

Comparing environments? See the full **[Laradock vs Others](/docs/laradock-alternatives)** breakdown. Ready to start? **[Getting Started](/docs/getting-started)** takes about five minutes.
