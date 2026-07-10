---
slug: /opencart-on-docker
title: Run OpenCart on Docker
description: Run OpenCart on Docker in minutes with Laradock. What Docker gives an OpenCart store, why Laradock is the fastest way to get a web server, PHP and MySQL running, and the exact commands, with any PHP version, without installing anything on your machine.
keywords:
  - opencart on docker
  - run opencart on docker
  - opencart docker
  - opencart docker setup
  - dockerize opencart
  - opencart docker environment
  - opencart mysql docker
---

## What is OpenCart?

[OpenCart](https://www.opencart.com) is a lightweight, open-source PHP shopping cart platform known for being simple to install and extend compared to heavier e-commerce frameworks. It is a plain PHP application: no full framework underneath, just a web server, PHP-FPM, and a MySQL or MariaDB database (OpenCart also supports PostgreSQL via PDO in recent versions).

## Why run OpenCart in Docker?

Docker packages each of those pieces (a web server, PHP-FPM, MySQL) into isolated containers that run the same on every machine. Instead of installing PHP and MySQL onto your laptop, where versions collide between projects and "works on my machine" starts, you run disposable containers that mirror production and vanish cleanly when you delete them. One store can run PHP 8.1 while another runs an older OpenCart 3.x install on PHP 7.4, on the same computer, with nothing installed globally.

The catch: wiring those containers together yourself (base images, PHP extensions, networking, permissions) is a week of fiddly Docker work. That is exactly what Laradock removes.

## Why Laradock is the best fit for OpenCart

OpenCart has no official Docker image of its own; the images you will find on Docker Hub (Bitnami's, for example) are third-party, not maintained by the OpenCart project. Here is why Laradock is the best fit:

- **You are never locked into one ecosystem.** Laradock is framework-agnostic. Run your OpenCart store today, add a Laravel API, a WordPress blog, or a plain PHP script beside it tomorrow, all in the same environment with the same commands.
- **Far more flexibility.** 100+ ready services and any PHP version from 5.6 to 8.5, so a legacy OpenCart 3 install and a current OpenCart 4 store each get exactly the runtime they need.
- **Nothing is hidden and you own everything.** No generated files, no magic, no wrapper binary between you and Docker. Every Dockerfile and compose file is right there for you to read and edit.
- **Nothing new to learn.** What you use is plain `docker compose`, knowledge that transfers straight to production. Our [CLI](/docs/cli) is an optional nicety, never a requirement.

Concretely, for OpenCart it gives you a production-style NGINX or Apache + PHP-FPM stack, MySQL/MariaDB already wired, and a `workspace` container with Composer and git installed.

## Run OpenCart on Docker with Laradock

### 1. Add Laradock to your project

```bash
cd my-opencart-store
git clone https://github.com/laradock/laradock.git
cd laradock && cp .env.example .env
```

(No OpenCart files yet? Clone Laradock first, then download an OpenCart release from the `workspace` container in the next steps.)

### 2. Pick the services your store needs

OpenCart needs a web server and a database, nothing else is required out of the box:

```bash
docker compose up -d nginx mysql workspace
```

Prefer MariaDB instead of MySQL? Swap the name: `docker compose up -d nginx mariadb workspace`. The full catalog is [here](/docs/Intro#supported-services).

### 3. Point OpenCart at the containers

OpenCart's installer writes your database connection into `config.php` and `admin/config.php` for you. Point it at the containers by giving it the database host `mysql` (or `mariadb`), a database name, user and password of your choice, when you run the installer in the next step.

### 4. Install and run

Enter the `workspace` container, where Composer and git live, download OpenCart and run its command-line installer:

```bash
docker compose exec workspace bash
composer create-project opencart/opencart .
mv upload/* . && mv upload/.htaccess . 2>/dev/null
php install/cli_install.php install \
  --db_hostname mysql --db_username root --db_password secret --db_database opencart \
  --username admin --password secret --email admin@example.com \
  --http_server http://localhost/
```

(File layout differs slightly by release; some downloads ship an `upload/` folder that becomes your webroot, others do not. Check the README of the version you pulled. You can use the browser-based installer at `http://localhost/install` instead if you prefer.) Then open [http://localhost](http://localhost). That is a full OpenCart store running on Docker.

## Change the PHP version anytime

This is where a native install hurts and Laradock shines. Set the version in Laradock's `.env` and rebuild:

```env
PHP_VERSION=8.1
```

```bash
docker compose build php-fpm workspace
```

OpenCart 4 requires PHP 8.1 or newer, while OpenCart 3.x stores commonly still run on PHP 7.4, so the same tool runs a legacy 3.x shop and a current OpenCart 4 store side by side, each isolated, none of it installed on your machine.

## Frequently Asked Questions

### Do I need to install PHP or MySQL to run OpenCart with Laradock?

No. Everything lives inside the containers. Composer and git are in the `workspace` container; you never install PHP or the database on your host.

### Which services should I start for a typical OpenCart store?

`nginx mysql workspace` covers most stores: web server, database, and a shell. Swap `mysql` for `mariadb` if you prefer.

### Can I run multiple OpenCart stores on different PHP versions?

Yes. Give each its own Laradock with a unique `COMPOSE_PROJECT_NAME` and `DATA_PATH_HOST`, set a different `PHP_VERSION` in each, and they run independently on the same machine.

### Does this work the same on macOS, Windows and Linux?

Yes. Laradock runs anywhere Docker runs. On macOS/Windows, file-sync speed depends on Docker Desktop (VirtioFS helps a lot); it is a Docker Desktop trait, not specific to Laradock.

### Is this the same Docker setup I would use in production?

The containers are production-style (real web server + PHP-FPM), so it is far closer to production than a native install. See [Prepare Laradock for Production](/docs/usage#prepare-laradock-for-production) for the hardening steps.

---

Comparing environments? See the full **[Laradock vs Others](/docs/laradock-alternatives)** breakdown. Ready to start? **[Getting Started](/docs/getting-started)** takes about five minutes.
