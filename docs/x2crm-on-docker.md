# Run X2CRM on Docker

Source: https://laradock.io/docs/x2crm-on-docker

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

## What is X2CRM?

[X2CRM](https://github.com/X2Engine/X2CRM) is an open-source CRM written in PHP on top of the Yii framework, known for marketing automation, workflow editing and a blog-style activity feed. It is an older project: its GitHub repository has seen no meaningful commits since around 2021, so treat it as a stable-but-dormant codebase rather than an actively developed one. It needs a web server, a PHP runtime, and a MySQL database, and because of its age it is picky about the PHP version it runs on.

## Why run X2CRM in Docker?

Docker packages the web server, PHP and MySQL into isolated containers that run the same on every machine. Instead of installing an old PHP version onto your laptop, where it collides with every modern project you also work on, you run disposable containers that vanish cleanly when you delete them. This matters more for X2CRM than for most projects: it was built and last patched against PHP 7, not PHP 8, so you almost certainly do not want that version sitting natively on your machine, fighting with everything else you run.

The catch: wiring those containers together yourself (base images, PHP extensions, networking, permissions) is a week of fiddly Docker work. That is exactly what Laradock removes.

## Why Laradock is the best fit for X2CRM

X2CRM has no official Docker tooling of its own, only a handful of small, unmaintained community images, so a ready-made, no-lock-in environment matters even more here. Here is why Laradock is the best fit:

- **You are never locked into one ecosystem.** Laradock is framework-agnostic. Run X2CRM today, add a Laravel API, a modern PHP tool, or a plain script beside it tomorrow, all in the same environment with the same commands.
- **Far more flexibility.** 100+ ready services and any PHP version from 5.6 to 8.5, so you can pin X2CRM to the old PHP 7 line it needs while every other project on the same machine runs current PHP.
- **Nothing is hidden and you own everything.** No generated files, no magic, no wrapper binary between you and Docker. Every Dockerfile and compose file is right there for you to read and edit, which matters for a stack this old.
- **Nothing new to learn.** What you use is plain `docker compose`, knowledge that transfers to every other project. Our [CLI](https://laradock.io/docs/cli) is an optional nicety, never a requirement.

Concretely, for X2CRM it gives you a web server (NGINX or Apache) paired with PHP-FPM, a MySQL database, and a `workspace` container with git and Composer, all wired together and none of it installed on your host.

## Run X2CRM on Docker with Laradock

### 1. Add Laradock to your project

```bash
cd my-x2crm-site
git clone https://github.com/laradock/laradock.git
cd laradock
```

(No X2CRM files yet? Clone the [X2CRM repository](https://github.com/X2Engine/X2CRM) into your project root first, then continue below.)

### 2. Pick the services X2CRM needs

X2CRM needs a web server and a MySQL database. The web server pulls in PHP-FPM automatically:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI" default>

```bash
./laradock start nginx mysql workspace
```

</TabItem>
<TabItem value="compose" label="Docker Compose">

```bash
cp .env.example .env
docker compose up -d nginx mysql workspace
```

</TabItem>
</Tabs>

Prefer Apache instead? Swap the name: `./laradock start apache2 mysql workspace` (or `docker compose up -d apache2 mysql workspace`). The full catalog is [here](https://laradock.io/docs/Intro#supported-services).

Prefer to be asked? The optional [CLI](https://laradock.io/docs/cli) walks you through the choices: `./laradock setup`, then `./laradock start`. It prints every real command it runs.

### 3. Point X2CRM at the containers

X2CRM does not use a `.env` file; it is configured through its browser-based installer, which writes the database connection into its own config under `protected/config/` once you submit the install form. When the installer asks for a database host, user and password, use the service name and the credentials from `mysql/defaults.env`:

```
Database host: mysql
Database name / user / password: as set in mysql/defaults.env (or your override in Laradock's .env)
```

Anything you add to Laradock's `.env` always overrides the defaults file.

### 4. Install and run your site

Enter the `workspace` container to place the X2CRM files under the web root if you have not already, then finish the setup from your browser:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI" default>

```bash
./laradock workspace
```

</TabItem>
<TabItem value="compose" label="Docker Compose">

```bash
docker compose exec workspace bash
```

</TabItem>
</Tabs>

Open [http://localhost](http://localhost) and follow the install wizard: it checks server requirements, collects the MySQL connection details from step 3, and asks for the application name, time zone and base URL. Once it completes, that is a full X2CRM install running on Docker.

## Change the PHP version anytime

This is where a native install hurts and Laradock shines. X2CRM's last stable release line was built and tested against PHP 7, with no confirmed PHP 8 support, so pin an older version in Laradock's `.env` and rebuild:

```env
PHP_VERSION=7.4
```

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI" default>

```bash
./laradock rebuild php-fpm workspace
```

</TabItem>
<TabItem value="compose" label="Docker Compose">

```bash
docker compose build php-fpm workspace
```

</TabItem>
</Tabs>

Run the installer's built-in requirements check after switching versions to confirm every extension X2CRM expects is present. Because the version lives in one config line, you can keep a legacy PHP 7 stack for X2CRM and a current PHP 8.x stack for every other project on the same machine, each isolated.

## Take your X2CRM install live

When your X2CRM install is ready, the same Laradock stack becomes your deployment. You build one hardened image and ship it to the host of your choice:

```bash
./laradock ship
```

Then pick a target and follow its short guide, a single server, a managed platform, or Kubernetes: **[Deploy to Production](https://laradock.io/docs/production)** lists every provider (Fly.io, Render, Railway, DigitalOcean, AWS, Google Cloud, Azure, Kamal, Kubernetes) with a ready config file for each. There is no per-provider magic to learn; a Docker image runs the same everywhere.

## Frequently Asked Questions

### Do I need to install PHP or MySQL to run X2CRM with Laradock?

No. Everything lives inside the containers. PHP, its extensions and MySQL are all provided; you never install them on your host.

### Which services should I start for a typical X2CRM install?

`nginx mysql workspace` covers it: web server, database, and a shell to place the files and run Composer if needed.

### Is X2CRM still actively maintained?

Not really. Its GitHub repository has had no meaningful activity since around 2021. It still runs and is usable for testing, evaluation, or maintaining an existing install, but do not expect new releases, security patches, or PHP 8 support to land upstream. Weigh that before building anything new on it.

### What PHP version should I use for X2CRM?

Its last supported line is PHP 7.x; earlier releases worked back to PHP 5.3. There is no confirmed PHP 8 compatibility, so pin `PHP_VERSION=7.4` (or whatever your specific X2CRM release documents) and rely on the installer's requirements checker to confirm.

### Does this work the same on macOS, Windows and Linux?

Yes. Laradock runs anywhere Docker runs. On macOS/Windows, file-sync speed depends on Docker Desktop; it is a Docker Desktop trait, not specific to Laradock.

---

Comparing environments? See the full **[Laradock vs Others](https://laradock.io/docs/laradock-alternatives)** breakdown. Ready to start? **[Getting Started](https://laradock.io/docs/getting-started)** takes about five minutes.
