---
slug: /phpmyadmin-on-docker
title: Run phpMyAdmin on Docker
description: Run phpMyAdmin on Docker in seconds with Laradock, a built-in service you turn on with one command to browse and manage MySQL or MariaDB databases, import and export dumps, and manage users, without installing anything on your machine.
keywords:
  - phpmyadmin on docker
  - run phpmyadmin on docker
  - phpmyadmin docker
  - phpmyadmin docker setup
  - dockerize phpmyadmin
  - phpmyadmin docker environment
  - phpmyadmin mysql docker
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

## What is phpMyAdmin?

[phpMyAdmin](https://www.phpmyadmin.net) is a widely used web-based administration tool for MySQL and MariaDB: browse tables, run queries, manage users and permissions, and import or export data, all from the browser. It is not an application with its own database; it is a PHP frontend that connects to a database server you already have running. It speaks MySQL and MariaDB only, so if you are on PostgreSQL you want [Adminer](/docs/adminer-on-docker) instead.

## Why run phpMyAdmin in Docker?

Docker packages phpMyAdmin (NGINX, PHP-FPM under the hood) into an isolated container that runs the same on every machine. Instead of installing PHP onto your laptop just to run a database GUI, or reaching for a separate native app, you run a disposable container that connects straight to whichever database container is already part of your stack, and vanishes cleanly when you delete it.

The catch: wiring a database admin UI to the right container, network and credentials yourself is fiddly enough that most people skip it. That is exactly what Laradock removes, because it is already done.

## Why Laradock is the best fit for phpMyAdmin

Unlike the other projects in this guide, phpMyAdmin is not something you add to Laradock: Laradock already ships it as a ready-to-use built-in service (see [Use phpMyAdmin](/docs/services/phpmyadmin)). There is no install step, no codebase to clone, no config file to write, just a service to switch on:

- **One line to turn on.** `docker compose up -d phpmyadmin` and it is connected to your database container, nothing to wire up yourself.
- **Already pointed at your data.** It targets the `mysql` (or `mariadb`) service by name and uses the same credentials your app uses, so there is nothing to reconcile.
- **Nothing is hidden and you own everything.** No generated files, no magic. The `phpmyadmin/compose.yml` and its Dockerfile are right there for you to read and edit.
- **Fits whatever else you are running.** Laradock is framework-agnostic, so the same phpMyAdmin service works whether the app behind that database is Laravel, WordPress, or plain PHP.

Concretely, Laradock's phpMyAdmin service is pre-wired to the `mysql` or `mariadb` container over the internal Docker network, with its port, credentials, import size and execution limits all controlled from `.env`, and arbitrary-server login already enabled so it can also reach any other database your machine can see.

## Run phpMyAdmin on Docker with Laradock

### 1. Add Laradock to your project

```bash
cd my-project
git clone https://github.com/laradock/laradock.git
cd laradock
```

### 2. Pick the services you need

phpMyAdmin needs exactly one thing to be useful: a **database** to point at. It has its own web server built in, so there is no `nginx` or `workspace` to add just to browse data. The whole required stack is the engine plus phpMyAdmin:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock start mysql phpmyadmin
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
cp .env.example .env
docker compose up -d mysql phpmyadmin
```

</TabItem>
</Tabs>

Prefer MariaDB over MySQL? Swap the engine name and tell phpMyAdmin which one to target with `PMA_DB_ENGINE=mariadb` in `.env`, then start `mariadb phpmyadmin`. The full catalog of other services is [here](/docs/Intro#supported-services).

Prefer to be asked? The optional [CLI](/docs/cli) walks you through the choices: `./laradock setup`, then `./laradock start`. It prints every real command it runs.

### 3. Point phpMyAdmin at the containers

There is nothing to configure by hand: phpMyAdmin's compose service already targets `${PMA_DB_ENGINE}` (default `mysql`) using `PMA_USER`, `PMA_PASSWORD` and `PMA_ROOT_PASSWORD` from `.env`. Those default to the same `default` / `secret` credentials as the `mysql` service in `mysql/defaults.env`; override any of them in Laradock's `.env` if you changed the database password (it always wins).

### 4. Open and log in

phpMyAdmin is already running from step 2. Open [http://localhost:8081](http://localhost:8081) (the default `PMA_PORT`) and log in:

- **Server:** `mysql` (or `mariadb`)
- **Username:** `default`
- **Password:** `secret`

Use whatever you overrode those to in `.env`. To manage users or grant privileges you need an account that has them, so log in as **user `root`, password `root`** (the `MYSQL_ROOT_PASSWORD` from `mysql/defaults.env`) instead. That is a full phpMyAdmin, connected to your database, running on Docker.

## Import an existing database

This is the most common reason people reach for phpMyAdmin, and it works two ways.

**From the browser (small to medium dumps).** In the left sidebar, click the database you want to load into (or create one first with **New**), open the **Import** tab, choose your `.sql`, `.sql.gz`, `.csv` or `.zip` file, and click **Go**. Laradock ships a generous `PMA_UPLOAD_LIMIT` of `2G` and a `600`-second `PMA_MAX_EXECUTION_TIME`, so most dumps go through as-is. If a big one stalls, see [Raise the import size and timeout limits](#raise-the-import-size-and-timeout-limits) below.

**From the command line (large dumps, faster).** Very large files are quicker to pipe straight into the database container, which skips the upload and PHP limits entirely. Run this from your Laradock folder (the `< dump.sql` redirect reads the file from your host, so it does not need to be mounted anywhere):

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock exec -T mysql mysql -u root -proot default < dump.sql
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose exec -T mysql mysql -u root -proot default < dump.sql
```

</TabItem>
</Tabs>

Either way, refresh phpMyAdmin and the tables appear.

## Export or back up a database

**From the browser.** Select the database (or a single table) in the sidebar, open the **Export** tab, keep the **Quick** method and **SQL** format for a full dump, and click **Go** to download a `.sql` file. Use **Custom** if you want to pick specific tables, add `DROP TABLE` statements, or gzip the output.

**From the command line.** For scripted or scheduled backups, `mysqldump` from the database container is the reliable route. The `> backup.sql` redirect writes the dump onto your host:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock exec -T mysql mysqldump -u root -proot default > backup.sql
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose exec -T mysql mysqldump -u root -proot default > backup.sql
```

</TabItem>
</Tabs>

## Run SQL and manage users

Everything else you would do at a `mysql>` prompt is in the UI too:

- **Run queries.** Open the **SQL** tab (on the server or inside a database) to run any statement, then browse or export the result.
- **Create databases.** Click **New** in the left sidebar, name it, and choose a collation.
- **Manage users and permissions.** Log in as `root` / `root` (a plain `default` user cannot grant privileges), open **User accounts**, and add users, set passwords, or edit grants. The changes apply to the real database server, not to phpMyAdmin.

## Raise the import size and timeout limits

If a large import or a long-running query is cut off, three `.env` values control it. Add the ones you need to Laradock's `.env` (they override `phpmyadmin/defaults.env`):

```env
PMA_UPLOAD_LIMIT=4G
PMA_MAX_EXECUTION_TIME=1200
PMA_MEMORY_LIMIT=512M
```

Then restart the service so the new limits take effect:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock restart phpmyadmin
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose restart phpmyadmin
```

</TabItem>
</Tabs>

## Connect to another database server

Laradock builds phpMyAdmin with `PMA_ARBITRARY=1`, which turns the greyed-out **Server** box on the login screen into a free text field. Type any hostname the container can reach and log in with that server's own credentials. That lets one phpMyAdmin serve several databases:

- **Switch between `mysql` and `mariadb`** without touching `.env`, as long as both containers are running: just type the other engine's service name.
- **Reach a database in a different Laradock project** on the same machine, for example `host.docker.internal` with that project's `MYSQL_PORT`.
- **Reach any external MySQL/MariaDB server** your Laradock host can connect to.

Nothing to configure, arbitrary login is already on.

## Change the PHP version anytime

phpMyAdmin's own container is built and versioned by Laradock independently of the `PHP_VERSION` your application uses, so there is nothing to change here for a typical setup. If you do need to rebuild the service after editing `phpmyadmin/Dockerfile`, or to pull a newer phpMyAdmin image, the same pattern applies to it as to every other Laradock service:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock rebuild phpmyadmin --pull
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose build --pull phpmyadmin
```

</TabItem>
</Tabs>

## Take your app live

phpMyAdmin is a local and staging convenience, not something you expose on the public internet, so it does not ship to production itself. What does ship is the app whose database you have been managing: the same Laradock stack that runs it locally becomes its deployment. You build one hardened image and send it to the host of your choice:

```bash
./laradock ship
```

Then pick a target and follow its short guide, a single server, a managed platform, or Kubernetes: **[Deploy to Production](/docs/production)** lists every provider (Fly.io, Render, Railway, DigitalOcean, AWS, Google Cloud, Azure, Kamal, Kubernetes) with a ready config file for each. There is no per-provider magic to learn; a Docker image runs the same everywhere.

## Frequently Asked Questions

### Do I need to install phpMyAdmin or PHP to use it with Laradock?

No. It is already a built-in Laradock service; `docker compose up -d phpmyadmin` is the entire install step.

### Which services should I start to use phpMyAdmin?

`mysql phpmyadmin` (or `mariadb phpmyadmin` with `PMA_DB_ENGINE=mariadb` set). No web server or workspace container is required just to browse the database, phpMyAdmin serves its own UI.

### How do I import a large SQL dump that keeps failing?

Either pipe it straight into the database container from the command line (see [Import an existing database](#import-an-existing-database)), or raise `PMA_UPLOAD_LIMIT` and `PMA_MAX_EXECUTION_TIME` in `.env` and restart the service (see [Raise the import size and timeout limits](#raise-the-import-size-and-timeout-limits)).

### Can I use phpMyAdmin with PostgreSQL?

No. phpMyAdmin only supports MySQL and MariaDB. For PostgreSQL (or SQLite) use Laradock's [Adminer](/docs/adminer-on-docker) service instead, which speaks all of them.

### Can I use phpMyAdmin against a database on a different Laradock project?

Yes. Arbitrary-server login is already enabled (`PMA_ARBITRARY=1`), so type the other server's hostname on the login screen, for example `host.docker.internal` with that project's `MYSQL_PORT`. See [Connect to another database server](#connect-to-another-database-server).

### Is Adminer a better fit than phpMyAdmin?

Both ship as built-in Laradock services and both connect to the same database containers. Adminer is a single lightweight file with a simpler interface and also handles PostgreSQL and SQLite; phpMyAdmin has a deeper feature set for complex MySQL/MariaDB administration. See [Run Adminer on Docker](/docs/adminer-on-docker) for the same walkthrough with Adminer.

### Is this the same setup I would use in production?

Most teams do not expose phpMyAdmin in production at all, since it is a convenience tool for local and staging work. If you do run it somewhere reachable, put it behind authentication and network restrictions; see [Prepare Laradock for Production](/docs/production#prepare-laradock-for-production) for the general hardening steps.

---

Comparing environments? See the full **[Laradock vs Others](/docs/laradock-alternatives)** breakdown. Ready to start? **[Getting Started](/docs/getting-started)** takes about five minutes.
