---
slug: /phalcon-on-docker
title: Run Phalcon on Docker
description: Run any Phalcon app on Docker in minutes with Laradock, extension included. What Docker gives a Phalcon project, why Laradock is the fastest way to get the Phalcon PHP extension, NGINX, PHP and MySQL running, without installing anything on your machine.
keywords:
  - phalcon on docker
  - run phalcon on docker
  - phalcon docker
  - phalcon docker setup
  - dockerize phalcon
  - phalcon php extension docker
  - phalcon nginx mysql docker
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

## What is Phalcon?

[Phalcon](https://phalcon.io) is a full-stack PHP framework delivered as a C extension rather than a set of PHP files. It is loaded directly into the PHP runtime (`phalcon.so`), which is what makes it unusually fast and low-overhead, at the cost of needing a matching compiled extension for whatever PHP version you run. A Phalcon app needs a web server, a PHP runtime with the Phalcon extension enabled, and a database; MySQL and PostgreSQL are both supported through Phalcon's own PDO-based abstraction.

## Why run Phalcon in Docker?

Docker packages each of those pieces (NGINX, PHP-FPM with the Phalcon extension, MySQL) into isolated containers that run the same on every machine. Instead of compiling the Phalcon extension against a PHP version installed on your laptop, where versions collide between projects and "works on my machine" starts, you run disposable containers that mirror production and vanish cleanly when you delete them. One project can run PHP 8.3 with Phalcon 5 while another runs PHP 7.4 with an older Phalcon build, on the same computer, with nothing installed globally.

The catch: wiring those containers together yourself, and compiling the right Phalcon build for the right PHP version, is a week of fiddly Docker (and C extension) work. That is exactly what Laradock removes.

## Why Laradock is the best fit for Phalcon

Phalcon has no official multi-service Docker environment of its own, and because it is a compiled extension rather than a Composer package, getting it installed correctly is usually the hardest part of any Phalcon setup. Laradock builds the extension for you. Here is why it's the best fit:

- **The extension is a flag, not a compile step.** Set `PHP_FPM_INSTALL_PHALCON=true` and `WORKSPACE_INSTALL_PHALCON=true` in your `.env`, rebuild, and `phalcon.so` is compiled and loaded for the exact PHP version you're running. No manual PECL/PIE build, no matching versions by hand.
- **You are never locked into one ecosystem.** Laradock is framework-agnostic. Run Phalcon today, add a Laravel API, a WordPress site, or a plain PHP script beside it tomorrow, all in the same environment with the same commands.
- **Far more flexibility.** 100+ ready services and any PHP version from 5.6 to 8.5, so you are not stuck on whichever PHP version your OS happens to package Phalcon for.
- **Nothing is hidden and you own everything.** No generated files, no magic. The exact extension build steps live in `php-fpm/Dockerfile` and `workspace/Dockerfile` for you to read and edit.

Concretely, for Phalcon it gives you a production-style NGINX + PHP-FPM stack with the Phalcon extension pre-wired, MySQL/PostgreSQL, and a `workspace` container with Composer and git installed.

## Run Phalcon on Docker with Laradock

### 1. Add Laradock to your project

```bash
cd my-phalcon-app
git clone https://github.com/laradock/laradock.git
cd laradock
```

### 2. Turn on the Phalcon extension and pick your services

In Laradock's `.env`, enable the extension for both PHP-FPM and the workspace shell:

```env
PHP_FPM_INSTALL_PHALCON=true
WORKSPACE_INSTALL_PHALCON=true
```

Then start a web server, a database, and the workspace (the web server pulls in PHP-FPM automatically):

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock start --build nginx mysql workspace
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
cp .env.example .env
docker compose up -d --build nginx mysql workspace
```

</TabItem>
</Tabs>

The `--build` matters here: the Phalcon extension is compiled at image build time, so any time you flip these flags you need to rebuild. Prefer PostgreSQL? Swap the name: `./laradock start --build nginx postgres workspace` (or `docker compose up -d --build nginx postgres workspace`). The full catalog is [here](/docs/Intro#supported-services).

Prefer to be asked? The optional [CLI](/docs/cli) detects Phalcon and can pre-select these flags for you: `./laradock setup`, then `./laradock start`. It prints every real command it runs.

### 3. Point Phalcon at the containers

In your app's database config (typically `app/config/config.php`), use the service name as the hostname:

```php
'database' => [
    'adapter'  => 'Mysql',
    'host'     => 'mysql',
    'username' => 'default',
    'password' => 'secret',
    'dbname'   => 'default',
],
```

The default database, user and password live in Laradock's `mysql/defaults.env`; override any of them by adding the line to Laradock's `.env` (it always wins).

### 4. Run your app from the workspace

Enter the shell and confirm the extension loaded, then run your app's usual commands:

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

Once inside, confirm the extension loaded:

```bash
php -m | grep -i phalcon
```

Phalcon has no single official project generator the way Laravel or CakePHP does; most teams start from [Phalcon Devtools](https://github.com/phalcon/phalcon-devtools) or one of the official [sample applications](https://github.com/phalcon), pulled in from the workspace shell with `git clone` or `composer create-project`. Then open [http://localhost](http://localhost). That is a full Phalcon app running on Docker.

## Change the PHP version anytime

This is where a native install hurts most and Laradock shines: normally, changing PHP versions means recompiling Phalcon by hand. In Laradock it's still a one-line change and a rebuild:

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

Check that your installed Phalcon major version supports the PHP version you set (Phalcon's compatibility matrix maps specific Phalcon releases to specific PHP releases); Laradock rebuilds the extension against whatever `PHP_VERSION` you choose.

## Frequently Asked Questions

### Do I need to compile the Phalcon extension myself to use it with Laradock?

No. Set `PHP_FPM_INSTALL_PHALCON=true` and `WORKSPACE_INSTALL_PHALCON=true` in `.env` and rebuild; Laradock compiles and loads `phalcon.so` for you, matched to your chosen `PHP_VERSION`.

### Which services should I start for a typical Phalcon app?

`nginx mysql workspace` covers most apps: web server, database, and a shell, with the Phalcon extension flags turned on. Swap `mysql` for `postgres` if you prefer.

### Can I run multiple Phalcon apps on different PHP versions?

Yes. Give each its own Laradock with a unique `COMPOSE_PROJECT_NAME` and `DATA_PATH_HOST`, set a different `PHP_VERSION` in each (and rebuild), and they run independently on the same machine, each with its own matching Phalcon build.

### Does this work the same on macOS, Windows and Linux?

Yes. Laradock runs anywhere Docker runs. On macOS/Windows, file-sync speed depends on Docker Desktop (VirtioFS helps a lot); it is a Docker Desktop trait, not specific to Laradock.

### Is this the same Docker setup I would use in production?

The containers are production-style (real NGINX + PHP-FPM with the extension compiled in), so it is far closer to production than a manually compiled local Phalcon install. See [Prepare Laradock for Production](/docs/production#prepare-laradock-for-production) for the hardening steps.

---

Comparing environments? See the full **[Laradock vs Others](/docs/laradock-alternatives)** breakdown. Ready to start? **[Getting Started](/docs/getting-started)** takes about five minutes.
