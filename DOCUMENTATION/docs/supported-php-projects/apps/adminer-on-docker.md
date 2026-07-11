---
slug: /adminer-on-docker
title: Run Adminer on Docker
description: Run Adminer on Docker in seconds with Laradock, a built-in service you turn on with one command to browse and manage MySQL, PostgreSQL and other databases without installing anything on your machine.
keywords:
  - adminer on docker
  - run adminer on docker
  - adminer docker
  - adminer docker setup
  - dockerize adminer
  - adminer docker environment
  - adminer mysql docker
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

## What is Adminer?

[Adminer](https://www.adminer.org) is a lightweight, single-file database administration tool that supports MySQL, MariaDB, PostgreSQL, SQLite, MS SQL and more from one simple interface. It is not an application with its own database; it is a PHP frontend that connects to a database server you already have running, prized for being far smaller and simpler than heavier admin UIs.

## Why run Adminer in Docker?

Docker packages Adminer (a small PHP application under the hood) into an isolated container that runs the same on every machine. Instead of installing PHP onto your laptop just to run a database GUI, or downloading a single PHP file and figuring out how to serve it, you run a disposable container that connects straight to whichever database container is already part of your stack, and vanishes cleanly when you delete it.

The catch: wiring a database admin UI to the right container, network and credentials yourself is fiddly enough that most people skip it. That is exactly what Laradock removes, because it is already done.

## Why Laradock is the best fit for Adminer

Unlike most of the other projects in this guide, Adminer is not something you add to Laradock: Laradock already ships it as a ready-to-use built-in service (see [Use Adminer](/docs/services/adminer)). There is no install step, no codebase to clone, no config file to write, just a service to switch on:

- **One line to turn on.** `./laradock start adminer` (or `docker compose up -d adminer`) and it is ready to point at any database container in your stack.
- **Works with more than MySQL.** Adminer's single interface talks to MySQL, MariaDB, PostgreSQL and others, matching whatever database service you already picked in Laradock.
- **Nothing is hidden and you own everything.** No generated files, no magic. The `adminer/compose.yml` and its Dockerfile are right there for you to read and edit.
- **Fits whatever else you are running.** Laradock is framework-agnostic, so the same Adminer service works whether the app behind that database is Laravel, WordPress, or plain PHP.

Concretely, Laradock's Adminer service is pre-wired to talk to your database containers over the internal Docker network, with its port, default server, theme and plugins all controlled from `.env`.

## Run Adminer on Docker with Laradock

### 1. Add Laradock to your project

```bash
cd my-project
git clone https://github.com/laradock/laradock.git
cd laradock
```

### 2. Start your database and Adminer

Adminer needs a database to point at. Start both together:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI" default>

```bash
./laradock start mysql adminer
```

</TabItem>
<TabItem value="compose" label="Docker Compose">

```bash
cp .env.example .env
docker compose up -d mysql adminer
```

</TabItem>
</Tabs>

Using PostgreSQL or MariaDB instead? Start that service and point Adminer's login screen at it by default:

```env
ADM_DEFAULT_SERVER=postgres
```

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI" default>

```bash
./laradock start postgres adminer
```

</TabItem>
<TabItem value="compose" label="Docker Compose">

```bash
docker compose up -d postgres adminer
```

</TabItem>
</Tabs>

The full catalog of other services is [here](/docs/Intro#supported-services).

### 3. Point Adminer at the containers

There is nothing to configure by hand: Adminer's login screen asks for a server, and `ADM_DEFAULT_SERVER` in `.env` pre-fills it with the container name (`mysql` by default). Use the same credentials as the database container itself, `default` / `secret` for the stock `mysql` service from `mysql/defaults.env`, unless you overrode them in Laradock's `.env` (it always wins).

### 4. Open and log in

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI" default>

```bash
./laradock start mysql adminer
```

</TabItem>
<TabItem value="compose" label="Docker Compose">

```bash
docker compose up -d mysql adminer
```

</TabItem>
</Tabs>

Then open [http://localhost:8081](http://localhost:8081) (the default `ADM_PORT`) and log in with system `MySQL`, server `mysql`, user `default`, password `secret`, or whatever you overrode those to. If you are running Adminer alongside phpMyAdmin, note they share the same default port; set `ADM_PORT` to something else in `.env` so both can run at once.

## Change the PHP version anytime

Adminer's own container is built and versioned by Laradock independently of the `PHP_VERSION` your application uses, so there is nothing to change here for a typical setup. If you do need to rebuild the service after editing `adminer/Dockerfile`, the same pattern applies to it as to every other Laradock service: `./laradock rebuild adminer` (or `docker compose build adminer`).

## Frequently Asked Questions

### Do I need to install Adminer or PHP to use it with Laradock?

No. It is already a built-in Laradock service; `docker compose up -d adminer` is the entire install step.

### Which services should I start to use Adminer?

The database you want to browse, plus `adminer`, for example `mysql adminer` or `postgres adminer`. No web server or workspace container is required just to browse the database.

### Can Adminer connect to more than one database at a time?

Yes. Adminer's login screen lets you pick the server, system and credentials each time you sign in, so one running Adminer container can browse any database container it can reach on the Docker network, not just the one in `ADM_DEFAULT_SERVER`.

### Is phpMyAdmin a better fit than Adminer?

Both ship as built-in Laradock services and both connect to the same database containers. Adminer is a single lightweight file that also speaks PostgreSQL and other engines; phpMyAdmin has a deeper feature set focused specifically on MySQL/MariaDB. See [Run phpMyAdmin on Docker](/docs/phpmyadmin-on-docker) for the same walkthrough with phpMyAdmin.

### Is this the same setup I would use in production?

Most teams do not expose Adminer in production at all, since it is a convenience tool for local and staging work. If you do run it somewhere reachable, put it behind authentication and network restrictions; see [Prepare Laradock for Production](/docs/production#prepare-laradock-for-production) for the general hardening steps.

---

Comparing environments? See the full **[Laradock vs Others](/docs/laradock-alternatives)** breakdown. Ready to start? **[Getting Started](/docs/getting-started)** takes about five minutes.
