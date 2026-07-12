# Run Backdrop CMS on Docker

Source: https://laradock.io/docs/backdrop-cms-on-docker

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

## What is Backdrop CMS?

[Backdrop CMS](https://backdropcms.org) is a fork of Drupal 7, built for small-to-medium sites and organizations that want Drupal 7's familiar module and theme system with modern updates like built-in configuration management, without the larger learning curve of Drupal 8 and later. A Backdrop CMS site is a PHP application backed by a MySQL or MariaDB database, served through a web server.

## Why run Backdrop CMS in Docker?

Docker packages each of those pieces (NGINX, PHP-FPM, MySQL) into isolated containers that run the same on every machine. Instead of installing PHP and MySQL onto your laptop, where versions collide between sites and "works on my machine" starts, you run disposable containers that mirror production and vanish cleanly when you delete them. One site can run PHP 8.2 while an older Backdrop install runs 7.4, on the same computer, with nothing installed globally.

The catch: wiring those containers together yourself (base images, PHP extensions, networking, permissions) is a week of fiddly Docker work. That is exactly what Laradock removes.

## Why Laradock is the best fit for Backdrop CMS

Backdrop CMS ships its own official Docker image on Docker Hub, so, unlike most PHP projects, it does not strictly need Laradock. It is still the best fit, and here is why:

- **You are never locked into one ecosystem.** Laradock is framework-agnostic. The day you add a Laravel API, a WordPress site, or a plain PHP script beside your Backdrop install, it runs in the same environment with the same commands. A single-purpose image cannot do that.
- **Far more flexibility.** 100+ ready services and any PHP version from 5.6 to 8.5, versus the narrower set of tags the official image maintains.
- **Nothing is hidden and you own everything.** No generated files, no magic, no wrapper binary between you and Docker. Every Dockerfile and compose file is right there for you to read and edit.
- **Nothing new to learn.** What you use is plain `docker compose`, knowledge that transfers straight to production and to every other project. Our [CLI](https://laradock.io/docs/cli) is an optional nicety, never a requirement.

For Backdrop CMS specifically, Laradock wires a production-style NGINX + PHP-FPM stack and MySQL/MariaDB already available, plus a `workspace` container with git installed for anything you need to script around the site.

## Run Backdrop CMS on Docker with Laradock

### 1. Add Laradock to your project

```bash
cd my-backdrop-site
git clone https://github.com/laradock/laradock.git
cd laradock
```

(No Backdrop files yet? Clone Laradock first, then download Backdrop from the workspace container in the next steps.)

### 2. Pick the services your site needs

Backdrop CMS needs a web server and a database. The web server pulls in PHP-FPM automatically:

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

Prefer MariaDB? Swap the name: `./laradock start nginx mariadb workspace` (or `docker compose up -d nginx mariadb workspace`). The full catalog is [here](https://laradock.io/docs/Intro#supported-services).

Prefer to be asked? The optional [CLI](https://laradock.io/docs/cli) walks you through the choices: `./laradock setup`, then `./laradock start`. It prints every real command it runs.

### 3. Point Backdrop CMS at the containers

Backdrop's installer asks for the database connection in the browser wizard; use the service name as the host:

```
Database host: mysql
Database username: default
Database password: secret
Database name: default
```

The default database, user and password live in Laradock's `mysql/defaults.env`; override any of them by adding the line to Laradock's `.env` (it always wins).

### 4. Install and run your site

Enter the `workspace` container, where git lives, and fetch Backdrop:

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
curl -LO https://backdropcms.org/download-latest   # only if you have no Backdrop files yet
```

Extract the archive into your project's public folder, then open [http://localhost](http://localhost) and finish the installer in the browser using the database details from the step above.

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

Backdrop CMS requires PHP 7.1 or newer and is compatible up through PHP 8.3, and Laradock covers anything from PHP 5.6 to 8.5, so the same tool runs an older Backdrop site and a current one side by side, each isolated, none of it installed on your machine.

## Take your site live

When your site is ready, the same Laradock stack becomes your deployment. You build one hardened image of your site and ship it to the host of your choice:

```bash
./laradock ship
```

Then pick a target and follow its short guide, a single server, a managed platform, or Kubernetes: **[Deploy to Production](https://laradock.io/docs/production)** lists every provider (Fly.io, Render, Railway, DigitalOcean, AWS, Google Cloud, Azure, Kamal, Kubernetes) with a ready config file for each. There is no per-provider magic to learn; a Docker image runs the same everywhere.

## Frequently Asked Questions

### Do I need to install PHP or MySQL to run Backdrop CMS with Laradock?

No. Everything lives inside the containers. git is in the `workspace` container; you never install PHP or MySQL on your host.

### Which services should I start for a typical Backdrop CMS site?

`nginx mysql workspace` covers most sites: web server, database, and a shell. Swap `mysql` for `mariadb` if you prefer.

### Can I run multiple Backdrop CMS sites on different PHP versions?

Yes. Give each its own Laradock with a unique `COMPOSE_PROJECT_NAME` and `DATA_PATH_HOST`, set a different `PHP_VERSION` in each, and they run independently on the same machine.

### Does this work the same on macOS, Windows and Linux?

Yes. Laradock runs anywhere Docker runs. On macOS/Windows, file-sync speed depends on Docker Desktop; it is a Docker Desktop trait, not specific to Laradock.

### Is this the same Docker setup I would use in production?

The containers are production-style (real NGINX + PHP-FPM), so it is far closer to production than a native install. See [Prepare Laradock for Production](https://laradock.io/docs/production#prepare-laradock-for-production) for the hardening steps.

---

Comparing environments? See the full **[Laradock vs Others](https://laradock.io/docs/laradock-alternatives)** breakdown. Ready to start? **[Getting Started](https://laradock.io/docs/getting-started)** takes about five minutes.
