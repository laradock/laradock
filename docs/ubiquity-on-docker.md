# Run Ubiquity on Docker

Source: https://laradock.io/docs/ubiquity-on-docker

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

## What is Ubiquity?

[Ubiquity](https://github.com/phpMv/ubiquity) is a PHP MVC framework built around speed and a heavy code-generation devtools CLI: it can scaffold controllers, models, views and CRUD screens for you, and ships a browser-based admin ("webtools") alongside it. It supports several database engines through its ORM, most commonly MySQL and PostgreSQL over PDO, but also Mysqli, MongoDB and others. A Ubiquity app needs a web server, a PHP runtime, and a real database.

## Why run Ubiquity in Docker?

Docker packages a web server, PHP-FPM and a database into isolated containers that run the same on every machine. Instead of installing PHP and a database onto your laptop, where versions collide between projects and "works on my machine" starts, you run disposable containers that mirror production and vanish cleanly when you delete them. One project can run PHP 8.3 while another runs 7.4, on the same computer, with nothing installed globally.

The catch: wiring those containers together yourself (base images, PHP extensions, networking, permissions) is a week of fiddly Docker work. That is exactly what Laradock removes.

## Why Laradock is the best fit for Ubiquity

Ubiquity has no official Docker image or first-party dev environment of its own, so a ready-made, no-lock-in environment matters even more. Here is why Laradock is the best fit:

- **You are never locked into one ecosystem.** Laradock is framework-agnostic. Run Ubiquity today, and put a Laravel API or a WordPress site beside it tomorrow, all in the same environment with the same commands.
- **Far more flexibility.** 100+ ready services and any PHP version from 5.6 to 8.5, versus configuring a database and web server by hand for every new Ubiquity project.
- **Nothing is hidden and you own everything.** No generated files, no magic, no wrapper binary between you and Docker. Every Dockerfile and compose file is right there for you to read and edit.
- **Nothing new to learn.** What you use is plain `docker compose`, knowledge that transfers straight to production. Our [CLI](https://laradock.io/docs/cli) is an optional nicety, never a requirement.

For Ubiquity specifically, Laradock gives you a production-style NGINX + PHP-FPM stack, MySQL/PostgreSQL already wired, and a `workspace` container with Composer and git installed so its devtools CLI works the same as it would natively.

## Run Ubiquity on Docker with Laradock

### 1. Add Laradock to your project

```bash
cd my-ubiquity-app
git clone https://github.com/laradock/laradock.git
cd laradock
```

(No Ubiquity project yet? Clone Laradock first, then create one from the workspace container in the next steps.)

### 2. Pick the services your app needs

A Ubiquity app needs a web server and a database (the web server pulls in PHP-FPM automatically):

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

Prefer PostgreSQL? Swap the name: `./laradock start nginx postgres workspace` (or `docker compose up -d nginx postgres workspace`). The full catalog is [here](https://laradock.io/docs/Intro#supported-services).

### 3. Point Ubiquity at the containers

Ubiquity's database connection lives in `app/config/config.php`; point `serverName` at the service name:

```php
"database" => [
    "type"       => "mysql",
    "dbName"     => "default",
    "serverName" => "mysql",
    "port"       => 3306,
    "user"       => "default",
    "password"   => "secret",
    "cache"      => false,
],
```

The default database, user and password live in Laradock's `mysql/defaults.env`; override any of them by adding the line to Laradock's `.env` (it always wins).

### 4. Run your app from the workspace

Enter the shell where Composer, git and the Ubiquity devtools live:

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

Once inside:

```bash
composer create-project phpmv/ubiquity-project .   # only if you have no project yet
composer install
```

Then open [http://localhost](http://localhost). That is a full Ubiquity app running on Docker.

## Change the PHP version anytime

This is where a native install hurts and Laradock shines. Set the version in Laradock's `.env` and rebuild:

```env
PHP_VERSION=8.2
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

Ubiquity requires PHP 7.4 or newer, and Laradock covers anything from PHP 5.6 to 8.5, so an older Ubiquity project and a brand-new one run side by side, each isolated, none of it installed on your machine.

## Take your app live

When your app is ready, the same Laradock stack becomes your deployment. You build one hardened image of your app and ship it to the host of your choice:

```bash
./laradock ship
```

Then pick a target and follow its short guide, a single server, a managed platform, or Kubernetes: **[Deploy to Production](https://laradock.io/docs/production)** lists every provider (Fly.io, Render, Railway, DigitalOcean, AWS, Google Cloud, Azure, Kamal, Kubernetes) with a ready config file for each. There is no per-provider magic to learn; a Docker image runs the same everywhere.

## Frequently Asked Questions

### Do I need to install PHP or Composer to run Ubiquity with Laradock?

No. Everything lives inside the containers. Composer and git are in the `workspace` container; you never install PHP on your host.

### Which services should I start for a typical Ubiquity app?

`nginx mysql workspace` covers most apps. Swap `mysql` for `postgres` if the project uses PostgreSQL instead.

### Can I run multiple Ubiquity apps on different PHP versions?

Yes. Give each its own Laradock with a unique `COMPOSE_PROJECT_NAME` and `DATA_PATH_HOST`, set a different `PHP_VERSION` in each, and they run independently on the same machine.

### Does this work the same on macOS, Windows and Linux?

Yes. Laradock runs anywhere Docker runs. On macOS/Windows, file-sync speed depends on Docker Desktop (VirtioFS helps a lot); it is a Docker Desktop trait, not specific to Laradock.

### Is this the same Docker setup I would use in production?

The containers are production-style (real NGINX + PHP-FPM), so it is far closer to production than a native install. See [Prepare Laradock for Production](https://laradock.io/docs/production#prepare-laradock-for-production) for the hardening steps.

---

Comparing environments? See the full **[Laradock vs Others](https://laradock.io/docs/laradock-alternatives)** breakdown. Ready to start? **[Getting Started](https://laradock.io/docs/getting-started)** takes about five minutes.
