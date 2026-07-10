---
slug: /yii-on-docker
title: Run Yii on Docker
description: Run any Yii app on Docker in minutes with Laradock. What Docker gives a Yii project, why Laradock is the fastest way to get NGINX, PHP and MySQL running, and the exact commands, with any PHP version, without installing anything on your machine.
keywords:
  - yii on docker
  - run yii on docker
  - yii docker
  - yii docker setup
  - dockerize yii
  - yii docker environment
  - yii nginx mysql docker
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

## What is Yii?

[Yii](https://www.yiiframework.com) is a performance-focused PHP framework built around code generation (Gii), a full ActiveRecord ORM, and a "basic" or "advanced" application template to start from. It is popular for admin panels and data-heavy backends. A Yii app needs a web server, a PHP runtime, and a database; MySQL is the default in the official application templates, with PostgreSQL, SQLite and others also supported.

## Why run Yii in Docker?

Docker packages each of those pieces (NGINX, PHP-FPM, MySQL) into isolated containers that run the same on every machine. Instead of installing PHP and MySQL onto your laptop, where versions collide between projects and "works on my machine" starts, you run disposable containers that mirror production and vanish cleanly when you delete them. One project can run PHP 8.3 while an older Yii 1 codebase runs 7.2, on the same computer, with nothing installed globally.

The catch: wiring those containers together yourself (base images, PHP extensions, networking, permissions) is a week of fiddly Docker work. That is exactly what Laradock removes.

## Why Laradock is the best fit for Yii

Yii has no official Docker tool or first-party runtime of its own, so a ready-made, no-lock-in environment matters even more. Here is why Laradock is the best fit:

- **You are never locked into one ecosystem.** Laradock is framework-agnostic. Run Yii today, add a Laravel API, a WordPress site, or a plain PHP script beside it tomorrow, all in the same environment with the same commands.
- **Far more flexibility.** 100+ ready services and any PHP version from 5.6 to 8.5, so an old Yii 1 admin panel and a modern Yii 2 app each get exactly the runtime they need.
- **Nothing is hidden and you own everything.** No generated files, no magic, no wrapper binary between you and Docker. Every Dockerfile and compose file is right there for you to read and edit.
- **Nothing new to learn.** What you use is plain `docker compose`, knowledge that transfers straight to production. Our [CLI](/docs/cli) is an optional nicety, never a requirement.

Concretely, for Yii it gives you a production-style NGINX + PHP-FPM stack, MySQL/PostgreSQL already wired, a `workspace` container with Composer and git installed, and any PHP version behind a single line of config.

## Run Yii on Docker with Laradock

### 1. Add Laradock to your project

```bash
cd my-yii-app
git clone https://github.com/laradock/laradock.git
cd laradock && cp .env.example .env
```

(No Yii app yet? Clone Laradock first, then create one from the workspace container in the next steps.)

### 2. Pick the services your app needs

Most Yii apps need a web server and a database (the web server pulls in PHP-FPM automatically):

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock start nginx mysql workspace
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose up -d nginx mysql workspace
```

</TabItem>
</Tabs>

Prefer PostgreSQL? Swap the name: `./laradock start nginx postgres workspace` (or `docker compose up -d nginx postgres workspace`). The full catalog is [here](/docs/Intro#supported-services).

Prefer to be asked? The optional [CLI](/docs/cli) detects Yii and pre-selects nginx/mysql for you: `./laradock setup`, then `./laradock start`. It prints every real command it runs.

### 3. Point Yii at the containers

In `config/db.php`, use the service name as the hostname in the DSN:

```php
return [
    'class' => 'yii\db\Connection',
    'dsn' => 'mysql:host=mysql;dbname=default',
    'username' => 'default',
    'password' => 'secret',
    'charset' => 'utf8',
];
```

The default database, user and password live in Laradock's `mysql/defaults.env`; override any of them by adding the line to Laradock's `.env` (it always wins). Yii will not create the database for you; run `./laradock exec mysql mysql -udefault -psecret -e "CREATE DATABASE IF NOT EXISTS default"` (or `docker compose exec mysql mysql -udefault -psecret -e "CREATE DATABASE IF NOT EXISTS default"`) (or use a database tool such as `phpmyadmin`/`adminer` from the catalog) before migrating.

### 4. Run your app from the workspace

Enter the shell where Composer and git live, and run the usual commands:

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
composer create-project --prefer-dist yiisoft/yii2-app-basic .   # only if you have no Yii app yet
php yii migrate
```

Then open [http://localhost](http://localhost). That is a full Yii app running on Docker.

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

Yii 2 supports PHP 7.3 and newer, and Laradock covers anything from PHP 5.6 to 8.5, so the same tool runs a legacy Yii 1 project pinned to an old PHP version and a current Yii 2 app side by side, each isolated, none of it installed on your machine.

## Frequently Asked Questions

### Do I need to install PHP or Composer to run Yii with Laradock?

No. Everything lives inside the containers. Composer and git are both in the `workspace` container; you never install PHP on your host.

### Which services should I start for a typical Yii app?

`nginx mysql workspace` covers most apps: web server, database, and a shell. Swap `mysql` for `postgres` if you prefer.

### Can I run multiple Yii apps on different PHP versions?

Yes. Give each its own Laradock with a unique `COMPOSE_PROJECT_NAME` and `DATA_PATH_HOST`, set a different `PHP_VERSION` in each, and they run independently on the same machine.

### Does this work the same on macOS, Windows and Linux?

Yes. Laradock runs anywhere Docker runs. On macOS/Windows, file-sync speed depends on Docker Desktop (VirtioFS helps a lot); it is a Docker Desktop trait, not specific to Laradock.

### Is this the same Docker setup I would use in production?

The containers are production-style (real NGINX + PHP-FPM), so it is far closer to production than the built-in PHP development server. See [Prepare Laradock for Production](/docs/production#prepare-laradock-for-production) for the hardening steps.

---

Comparing environments? See the full **[Laradock vs Others](/docs/laradock-alternatives)** breakdown. Ready to start? **[Getting Started](/docs/getting-started)** takes about five minutes.
