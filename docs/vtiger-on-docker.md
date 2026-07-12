# Run Vtiger on Docker

Source: https://laradock.io/docs/vtiger-on-docker

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

## What is Vtiger?

[Vtiger CRM](https://www.vtiger.com/open-source-crm) is an open source customer relationship management platform covering sales, support and inventory in one self-hosted application, with a large module ecosystem built up over close to two decades. It is a PHP application backed by a MySQL database with the InnoDB storage engine, served through a web server, installed through a browser-based setup wizard, and known like other full-featured PHP CRMs for wanting a healthy amount of PHP memory to run comfortably.

## Why run Vtiger in Docker?

Docker packages each of those pieces (NGINX, PHP-FPM, MySQL) into isolated containers that run the same on every machine. Instead of installing PHP and MySQL onto your laptop, where versions collide between projects and "works on my machine" starts, you run disposable containers that mirror production and vanish cleanly when you delete them. One Vtiger instance can run on an older PHP version to match an older module, while another project runs the latest PHP, on the same computer, with nothing installed globally.

The catch: wiring those containers together yourself (base images, PHP extensions, networking, permissions, and the generous memory and upload limits Vtiger expects) is a week of fiddly Docker work. That is exactly what Laradock removes.

## Why Laradock is the best fit for Vtiger

Vtiger has no official Docker image of its own beyond community-maintained ones, so a ready-made, no-lock-in environment matters even more. Here is why Laradock is the best fit:

- **You are never locked into one ecosystem.** Laradock is framework-agnostic. Run Vtiger today, add a Laravel API, a WordPress marketing site, or a plain PHP script beside it tomorrow, all in the same environment with the same commands.
- **Far more flexibility.** 100+ ready services and any PHP version from 5.6 to 8.5, versus a single-purpose image with a narrow set of tags, useful given how many Vtiger modules still assume older PHP.
- **Nothing is hidden and you own everything.** No generated files, no magic, no wrapper binary between you and Docker. Every Dockerfile and compose file is right there for you to read and edit, including the PHP memory and execution-time settings Vtiger needs.
- **Nothing new to learn.** What you use is plain `docker compose`, knowledge that transfers straight to production. Our [CLI](https://laradock.io/docs/cli) is an optional nicety, never a requirement.

Concretely, for Vtiger it gives you a production-style NGINX + PHP-FPM stack, MySQL already wired, and a `workspace` container with the file tools you need to unpack the Vtiger archive.

## Run Vtiger on Docker with Laradock

### 1. Add Laradock to your project

```bash
cd my-vtiger-instance
git clone https://github.com/laradock/laradock.git
cd laradock
```

(No Vtiger files yet? Clone Laradock first, then download and extract the Vtiger package from the workspace container in the next steps.)

### 2. Pick the services your instance needs

Vtiger needs a web server and a MySQL database. The web server pulls in PHP-FPM automatically:

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

The full catalog of other services is [here](https://laradock.io/docs/Intro#supported-services).

Prefer to be asked? The optional [CLI](https://laradock.io/docs/cli) walks you through the choices: `./laradock setup`, then `./laradock start`. It prints every real command it runs.

### 3. Point Vtiger at the containers

Vtiger's installer asks for these values in the browser; use the service name as the database host:

```
Database Server: mysql
Database Name: default
Database Username: default
Database Password: secret
```

The default database, user and password live in Laradock's `mysql/defaults.env`; override any of them by adding the line to Laradock's `.env` (it always wins). Vtiger also expects a raised PHP memory limit and upload size for imports and PDF generation; edit `memory_limit` (at least `256M`, `512M` is more comfortable) and `upload_max_filesize` in the `php-fpm/php8.2.ini` file matching your `PHP_VERSION` before installing.

### 4. Install and run your instance

Enter the `workspace` container, place the Vtiger files in your project's web root (download the archive from [vtiger.com](https://www.vtiger.com/open-source-crm) and extract it if you have not already):

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

Then open [http://localhost](http://localhost) and follow Vtiger's install wizard: it checks PHP extensions (GD, IMAP, cURL, OpenSSL among them) and memory settings, asks for the database details from the step above, and creates the admin account.

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

Current Vtiger releases are built and tested against PHP 8.2 and 8.3, while a number of older installs and modules still run on PHP 7.x; Laradock covers anything from PHP 5.6 to 8.5, so the same tool runs a legacy Vtiger instance and a brand-new one side by side, each isolated, none of it installed on your machine.

## Take your CRM live

When your Vtiger instance is ready, the same Laradock stack becomes your deployment. You build one hardened image of your app and ship it to the host of your choice:

```bash
./laradock ship
```

Then pick a target and follow its short guide, a single server, a managed platform, or Kubernetes: **[Deploy to Production](https://laradock.io/docs/production)** lists every provider (Fly.io, Render, Railway, DigitalOcean, AWS, Google Cloud, Azure, Kamal, Kubernetes) with a ready config file for each. There is no per-provider magic to learn; a Docker image runs the same everywhere.

## Frequently Asked Questions

### Do I need to install PHP or MySQL to run Vtiger with Laradock?

No. Everything lives inside the containers. PHP, its required extensions, and MySQL are all provided; you never install them on your host.

### Which services should I start for a typical Vtiger instance?

`nginx mysql workspace` covers it: web server, database, and a shell.

### Why does Vtiger need a raised PHP memory limit?

Vtiger's module builder, imports, exports and PDF generation are memory-hungry compared to a typical PHP app; the project's own docs call for at least 256MB, with 512MB recommended for smooth day-to-day use. Laradock's PHP config is a plain `php.ini` per version, so raising it is a one-line change and a container rebuild.

### Can I run multiple Vtiger instances on different PHP versions?

Yes. Give each its own Laradock with a unique `COMPOSE_PROJECT_NAME` and `DATA_PATH_HOST`, set a different `PHP_VERSION` in each, and they run independently on the same machine, which is useful given how many older Vtiger installs are still pinned to legacy PHP.

### Is this the same Docker setup I would use in production?

The containers are production-style (real NGINX + PHP-FPM), so it is far closer to production than a native install. See [Prepare Laradock for Production](https://laradock.io/docs/production#prepare-laradock-for-production) for the hardening steps.

---

Comparing environments? See the full **[Laradock vs Others](https://laradock.io/docs/laradock-alternatives)** breakdown. Ready to start? **[Getting Started](https://laradock.io/docs/getting-started)** takes about five minutes.
