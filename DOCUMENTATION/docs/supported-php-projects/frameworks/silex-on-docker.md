---
slug: /silex-on-docker
title: Run Silex on Docker
description: Run a legacy Silex app on Docker in minutes with Laradock. What Docker gives an old Silex codebase, why Laradock is the easiest way to pin the exact PHP version it needs, and the exact commands, without installing anything on your machine.
keywords:
  - silex on docker
  - run silex on docker
  - silex php docker
  - silex docker setup
  - dockerize silex
  - legacy silex app docker
  - silex nginx mysql docker
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

## What is Silex?

[Silex](https://github.com/silexphp/Silex) was a micro-framework built on top of Symfony components and the Pimple dependency injection container, created by Fabien Potencier as a lightweight alternative to full Symfony. It reached its planned end of life in June 2018; the project is archived, and its own README says "DEPRECATED, use Symfony instead." It is not actively developed, but plenty of production apps built on it in the mid-2010s are still running and still need maintenance. A Silex app needs a web server and a PHP runtime, and, if it uses the Doctrine DBAL provider, a real database: usually MySQL or PostgreSQL.

## Why run Silex in Docker?

Docker packages a web server, PHP-FPM and a database into isolated containers that run the same on every machine. Instead of installing an old PHP version onto your laptop just to keep one legacy app alive, where it collides with the newer PHP every other project on your machine needs, you run disposable containers that hold exactly what that one app requires and vanish cleanly when you delete them. One project can run the ancient PHP 5.6 or 7.x a Silex app is stuck on, while every other project on the same computer runs PHP 8.x, with nothing installed globally.

The catch: wiring those containers together yourself (base images, PHP extensions, networking, permissions) is a week of fiddly Docker work. That is exactly what Laradock removes.

## Why Laradock is the best fit for Silex

Silex never had an official Docker tool of its own, and since the framework is unmaintained, none is coming. Here is why Laradock is the best fit for keeping a legacy Silex app alive:

- **You are never locked into one ecosystem.** Laradock is framework-agnostic. Run the old Silex app today, and put a Symfony rewrite or a new API beside it tomorrow, all in the same environment with the same commands.
- **Far more flexibility.** 100+ ready services and any PHP version from 5.6 to 8.5, so a Silex app pinned to PHP 7.x and a brand-new project on PHP 8.4 run side by side without either touching your host machine.
- **Nothing is hidden and you own everything.** No generated files, no magic, no wrapper binary between you and Docker. Every Dockerfile and compose file is right there for you to read and edit, useful when a legacy app needs a Dockerfile tweak of its own.
- **Nothing new to learn.** What you use is plain `docker compose`, knowledge that transfers straight to production and to every other project. Our [CLI](/docs/cli) is an optional nicety, never a requirement.

For Silex specifically, Laradock wires a production-style NGINX + PHP-FPM stack, MySQL/PostgreSQL, and a `workspace` container with Composer and git already installed, pinned to whatever PHP version the app was actually written for.

## Run Silex on Docker with Laradock

### 1. Add Laradock to your project

```bash
cd my-silex-app
git clone https://github.com/laradock/laradock.git
cd laradock
```

### 2. Pick the services your app needs

Most Silex apps need a web server and a database (the web server pulls in PHP-FPM automatically):

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

Need PostgreSQL instead? Swap the name: `./laradock start nginx postgres workspace` (or `docker compose up -d nginx postgres workspace`). The full catalog is [here](/docs/Intro#supported-services).

### 3. Point Silex at the containers

If the app uses the Doctrine DBAL service provider, set the host to the service name in wherever `db.options` is registered (commonly `app/config/prod.php` or `index.php`):

```php
$app->register(new Silex\Provider\DoctrineServiceProvider(), array(
    'db.options' => array(
        'driver'   => 'pdo_mysql',
        'host'     => 'mysql',
        'dbname'   => 'default',
        'user'     => 'default',
        'password' => 'secret',
    ),
));
```

The default database, user and password live in `mysql/defaults.env`; override any of them by adding the line to Laradock's `.env` (it always wins).

### 4. Run your app from the workspace

Enter the shell where Composer and git live, and install dependencies:

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
composer install
```

Older Silex apps sometimes need `composer install --ignore-platform-reqs` if their `composer.json` never had its platform constraints updated. Then open [http://localhost](http://localhost). That is a legacy Silex app running on Docker.

## Change the PHP version anytime

This is where a native install hurts and Laradock shines, especially for a framework this old. Set the version in Laradock's `.env` and rebuild:

```env
PHP_VERSION=7.4
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

Silex 2.x was never updated for PHP 8; it targets the PHP 5.5 to 7.x era it was built in. Laradock covers PHP 5.6 all the way to 8.5, so you can run the Silex app on the old PHP version it actually needs while every other project on the same machine stays on a current one, none of it installed on your host.

## Frequently Asked Questions

### Is Silex still safe to run in production?

Silex itself has not received updates since 2018. Running it is a maintenance decision, not Laradock's call; Laradock just gives you an isolated, disposable environment to run it in without polluting your machine with an old PHP version.

### Do I need to install PHP or Composer to run Silex with Laradock?

No. Everything lives inside the containers. Composer and git are in the `workspace` container; you never install PHP on your host.

### Which services should I start for a typical Silex app?

`nginx mysql workspace` covers most apps. Swap `mysql` for `postgres` if the app uses PostgreSQL instead.

### Can I run a legacy Silex app and a modern app side by side?

Yes. Give each its own Laradock with a unique `COMPOSE_PROJECT_NAME` and `DATA_PATH_HOST`, set a different `PHP_VERSION` in each, and they run independently on the same machine.

### Does this work the same on macOS, Windows and Linux?

Yes. Laradock runs anywhere Docker runs. On macOS/Windows, file-sync speed depends on Docker Desktop (VirtioFS helps a lot); it is a Docker Desktop trait, not specific to Laradock.

---

Comparing environments? See the full **[Laradock vs Others](/docs/laradock-alternatives)** breakdown. Ready to start? **[Getting Started](/docs/getting-started)** takes about five minutes.
