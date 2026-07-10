---
slug: /phpmyadmin-on-docker
title: Run phpMyAdmin on Docker
description: Run phpMyAdmin on Docker in seconds with Laradock, a built-in service you turn on with one command to browse and manage MySQL or MariaDB databases without installing anything on your machine.
keywords:
  - phpmyadmin on docker
  - run phpmyadmin on docker
  - phpmyadmin docker
  - phpmyadmin docker setup
  - dockerize phpmyadmin
  - phpmyadmin docker environment
  - phpmyadmin mysql docker
---

## What is phpMyAdmin?

[phpMyAdmin](https://www.phpmyadmin.net) is a widely used web-based administration tool for MySQL and MariaDB: browse tables, run queries, manage users and permissions, and import or export data, all from the browser. It is not an application with its own database; it is a PHP frontend that connects to a database server you already have running.

## Why run phpMyAdmin in Docker?

Docker packages phpMyAdmin (NGINX, PHP-FPM under the hood) into an isolated container that runs the same on every machine. Instead of installing PHP onto your laptop just to run a database GUI, or reaching for a separate native app, you run a disposable container that connects straight to whichever database container is already part of your stack, and vanishes cleanly when you delete it.

The catch: wiring a database admin UI to the right container, network and credentials yourself is fiddly enough that most people skip it. That is exactly what Laradock removes, because it is already done.

## Why Laradock is the best fit for phpMyAdmin

Unlike the other projects in this guide, phpMyAdmin is not something you add to Laradock: Laradock already ships it as a ready-to-use built-in service (see [Use phpMyAdmin](/docs/usage#phpmyadmin)). There is no install step, no codebase to clone, no config file to write, just a service to switch on:

- **One line to turn on.** `docker compose up -d phpmyadmin` and it is connected to your database container, nothing to wire up yourself.
- **Already pointed at your data.** It targets the `mysql` (or `mariadb`) service by name and uses the same credentials your app uses, so there is nothing to reconcile.
- **Nothing is hidden and you own everything.** No generated files, no magic. The `phpmyadmin/compose.yml` and its Dockerfile are right there for you to read and edit.
- **Fits whatever else you are running.** Laradock is framework-agnostic, so the same phpMyAdmin service works whether the app behind that database is Laravel, WordPress, or plain PHP.

Concretely, Laradock's phpMyAdmin service is pre-wired to the `mysql` or `mariadb` container over the internal Docker network, with its port, credentials and upload limits all controlled from `.env`.

## Run phpMyAdmin on Docker with Laradock

### 1. Add Laradock to your project

```bash
cd my-project
git clone https://github.com/laradock/laradock.git
cd laradock && cp .env.example .env
```

### 2. Start your database and phpMyAdmin

phpMyAdmin needs a database to point at. Start both together:

```bash
docker compose up -d mysql phpmyadmin
```

Using MariaDB instead? Start it and set the engine phpMyAdmin should target:

```env
PMA_DB_ENGINE=mariadb
```

```bash
docker compose up -d mariadb phpmyadmin
```

The full catalog of other services is [here](/docs/Intro#supported-services).

### 3. Point phpMyAdmin at the containers

There is nothing to configure by hand: phpMyAdmin's compose service already targets `${PMA_DB_ENGINE}` (default `mysql`) using `PMA_USER`, `PMA_PASSWORD` and `PMA_ROOT_PASSWORD` from `.env`. Those default to the same `default` / `secret` credentials as the `mysql` service in `mysql/defaults.env`; override any of them in Laradock's `.env` if you changed the database password (it always wins).

### 4. Open and log in

```bash
docker compose up -d mysql phpmyadmin
```

Then open [http://localhost:8081](http://localhost:8081) (the default `PMA_PORT`) and log in with server `mysql`, user `default`, password `secret`, or whatever you overrode those to.

## Change the PHP version anytime

phpMyAdmin's own container is built and versioned by Laradock independently of the `PHP_VERSION` your application uses, so there is nothing to change here for a typical setup. If you do need to rebuild the service after editing `phpmyadmin/Dockerfile`, the same pattern applies to it as to every other Laradock service:

```bash
docker compose build phpmyadmin
```

## Frequently Asked Questions

### Do I need to install phpMyAdmin or PHP to use it with Laradock?

No. It is already a built-in Laradock service; `docker compose up -d phpmyadmin` is the entire install step.

### Which services should I start to use phpMyAdmin?

`mysql phpmyadmin` (or `mariadb phpmyadmin` with `PMA_DB_ENGINE=mariadb` set). No web server or workspace container is required just to browse the database.

### Can I use phpMyAdmin against a database on a different Laradock project?

Yes, as long as the two projects share the same Docker network or you point `PMA_DB_ENGINE`'s target at a reachable host. For most setups it is simplest to run phpMyAdmin alongside the database it manages, within the same Laradock instance.

### Is Adminer a better fit than phpMyAdmin?

Both ship as built-in Laradock services and both connect to the same database containers. Adminer is a single lightweight file with a simpler interface; phpMyAdmin has a deeper feature set for complex administration. See [Run Adminer on Docker](/docs/adminer-on-docker) for the same walkthrough with Adminer.

### Is this the same setup I would use in production?

Most teams do not expose phpMyAdmin in production at all, since it is a convenience tool for local and staging work. If you do run it somewhere reachable, put it behind authentication and network restrictions; see [Prepare Laradock for Production](/docs/usage#prepare-laradock-for-production) for the general hardening steps.

---

Comparing environments? See the full **[Laradock vs Others](/docs/laradock-alternatives)** breakdown. Ready to start? **[Getting Started](/docs/getting-started)** takes about five minutes.
