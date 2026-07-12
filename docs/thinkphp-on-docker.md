# Run ThinkPHP on Docker

Source: https://laradock.io/docs/thinkphp-on-docker

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

## What is ThinkPHP?

[ThinkPHP](https://www.thinkphp.cn) is one of the most widely used PHP frameworks in China, a full-stack MVC framework with routing, a built-in ORM, and two decades of production use behind it. A real ThinkPHP app needs a web server, a PHP runtime, and a database; its ORM ships MySQL support by default and can be extended to other drivers through PDO.

## Why run ThinkPHP in Docker?

Docker packages each of those pieces (NGINX, PHP-FPM, MySQL, ...) into isolated containers that run the same on every machine. Instead of installing PHP and MySQL onto your laptop, where versions collide between projects and "works on my machine" starts, you run disposable containers that mirror production and vanish cleanly when you delete them. One project can run PHP 8.4 on the current ThinkPHP 8 branch while another runs an older ThinkPHP 6 app on PHP 7.4, on the same computer, with nothing installed globally.

The catch: wiring those containers together yourself (base images, PHP extensions, networking, permissions) is a week of fiddly Docker work. That is exactly what Laradock removes.

## Why Laradock is the best fit for ThinkPHP

Unlike Laravel, ThinkPHP has no official Docker tool or first-party runtime of its own, so a ready-made, no-lock-in environment matters even more. Here is why Laradock is the best fit:

- **You are never locked into one ecosystem.** Laradock is framework-agnostic. Run ThinkPHP today, add a Laravel service, a WordPress site, or a plain PHP script beside it tomorrow, all in the same environment with the same commands.
- **Far more flexibility.** 100+ ready services and any PHP version from 5.6 to 8.5, so an older ThinkPHP 5 app and a brand-new ThinkPHP 8 one each get exactly the runtime they need.
- **Nothing is hidden and you own everything.** No generated files, no magic, no wrapper binary between you and Docker. Every Dockerfile and compose file is right there for you to read and edit.
- **Nothing new to learn.** What you use is plain `docker compose`, knowledge that transfers straight to production. Our [CLI](https://laradock.io/docs/cli) is an optional nicety, never a requirement.

Concretely, for ThinkPHP it gives you a production-style NGINX + PHP-FPM stack, MySQL already wired, and a `workspace` container with Composer and git installed.

## Run ThinkPHP on Docker with Laradock

### 1. Add Laradock to your project

```bash
cd my-thinkphp-app
git clone https://github.com/laradock/laradock.git
cd laradock
```

(No ThinkPHP app yet? Clone Laradock first, then create one from the workspace container in the next steps.)

### 2. Pick the services your app needs

Most ThinkPHP apps need a web server and a database. Start exactly those (the web server pulls in PHP-FPM automatically):

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

The full catalog is [here](https://laradock.io/docs/Intro#supported-services).

Prefer to be asked? The optional [CLI](https://laradock.io/docs/cli) walks you through the choices: `./laradock setup`, then `./laradock start`. It prints every real command it runs.

### 3. Point ThinkPHP at the containers

ThinkPHP 6+ reads `config/database.php`, which pulls from a `.env` file at your project root using an `env()` helper. Add:

```env
DATABASE_HOSTNAME = mysql
DATABASE_DATABASE = default
DATABASE_USERNAME = default
DATABASE_PASSWORD = secret
```

The default database, user and password live in `mysql/defaults.env`; override any of them by adding the line to Laradock's `.env` (it always wins). Older ThinkPHP 5 apps configure the same values directly in `application/database.php` instead.

### 4. Install and run your app

Enter the `workspace` container, where Composer and git live:

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
composer create-project topthink/think .   # only if you have no ThinkPHP files yet
```

Then open [http://localhost](http://localhost). That is a full ThinkPHP app running on Docker.

## Change the PHP version anytime

This is where a native install hurts and Laradock shines. Set the version in Laradock's `.env` and rebuild:

```env
PHP_VERSION=8.0
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

The current ThinkPHP 8 branch requires PHP 8.0 or newer; ThinkPHP 6 runs on PHP 7.1+. Either way, a legacy project and a modern one each run on the version they need, isolated, none of it installed on your machine.

## Take your app live

When your app is ready, the same Laradock stack becomes your deployment. You build one hardened image of your app and ship it to the host of your choice:

```bash
./laradock ship
```

Then pick a target and follow its short guide, a single server, a managed platform, or Kubernetes: **[Deploy to Production](https://laradock.io/docs/production)** lists every provider (Fly.io, Render, Railway, DigitalOcean, AWS, Google Cloud, Azure, Kamal, Kubernetes) with a ready config file for each. There is no per-provider magic to learn; a Docker image runs the same everywhere.

## Frequently Asked Questions

### Do I need to install PHP or Composer to run ThinkPHP with Laradock?

No. Everything lives inside the containers. Composer and git are in the `workspace` container; you never install PHP on your host.

### Which services should I start for a typical ThinkPHP app?

`nginx mysql workspace` covers most apps: web server, database, and a shell.

### Can I run multiple ThinkPHP apps on different PHP versions?

Yes. Give each its own Laradock with a unique `COMPOSE_PROJECT_NAME` and `DATA_PATH_HOST`, set a different `PHP_VERSION` in each, and they run independently on the same machine. This is especially useful for ThinkPHP, where 5.x, 6.x and 8.x projects often coexist with different PHP requirements.

### Does this work the same on macOS, Windows and Linux?

Yes. Laradock runs anywhere Docker runs. On macOS/Windows, file-sync speed depends on Docker Desktop (VirtioFS helps a lot); it is a Docker Desktop trait, not specific to Laradock.

### Is this the same Docker setup I would use in production?

The containers are production-style (real NGINX + PHP-FPM), so it is far closer to production than the built-in development server. See [Prepare Laradock for Production](https://laradock.io/docs/production#prepare-laradock-for-production) for the hardening steps.

---

Comparing environments? See the full **[Laradock vs Others](https://laradock.io/docs/laradock-alternatives)** breakdown. Ready to start? **[Getting Started](https://laradock.io/docs/getting-started)** takes about five minutes.
