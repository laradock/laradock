---
slug: /spiral-on-docker
title: Run Spiral Framework on Docker
description: Run any Spiral Framework app on Docker in minutes with Laradock. What Docker gives a Spiral project, why Laradock is the fastest way to get RoadRunner, PostgreSQL and Redis running, and the exact commands, with any PHP version, without installing anything on your machine.
keywords:
  - spiral framework on docker
  - run spiral on docker
  - spiral php docker
  - spiral docker setup
  - dockerize spiral framework
  - spiral docker environment
  - roadrunner docker
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

## What is Spiral Framework?

[Spiral](https://spiral.dev) is a full-stack PHP framework built for medium to large enterprise applications, with routing, the Cycle ORM, queues, and a strong focus on long-running, high-performance execution. Spiral is designed and maintained by the same team behind [RoadRunner](https://roadrunner.dev), a high-performance application server written in Go, and it is built to run on top of it instead of the classic PHP-FPM request cycle. A real Spiral app needs RoadRunner (or, if you choose, a PHP-FPM bridge), a database (Cycle/DBAL supports MySQL, PostgreSQL, SQLite and SQL Server), and usually Redis for cache and queues.

## Why run Spiral in Docker?

Docker packages each of those pieces (RoadRunner, PostgreSQL, Redis, ...) into isolated containers that run the same on every machine. Instead of installing the `rr` binary and a database onto your laptop, where versions collide between projects and "works on my machine" starts, you run disposable containers that mirror production and vanish cleanly when you delete them. One project can run PHP 8.3 while another runs 8.1, on the same computer, with nothing installed globally.

The catch: wiring those containers together yourself (base images, PHP extensions, networking, permissions) is a week of fiddly Docker work. That is exactly what Laradock removes.

## Why Laradock is the best fit for Spiral

Spiral's own team also builds and ships official Docker images for RoadRunner, so, unlike most PHP projects, it does not strictly need Laradock. It is still the best fit, and here is why:

- **You are never locked into one ecosystem.** Laradock is framework-agnostic. The day you add a Laravel service, a WordPress site, or a plain PHP script beside your Spiral app, it runs in the same environment with the same commands. A RoadRunner-only image cannot do that.
- **Far more flexibility.** 100+ ready services and any PHP version from 5.6 to 8.5, versus the short list a single application-server image gives you.
- **Nothing is hidden and you own everything.** No generated files, no magic, no wrapper binary between you and Docker. Every Dockerfile and compose file is right there for you to read and edit.
- **Nothing new to learn.** What you use is plain `docker compose`, knowledge that transfers straight to production and to every other project. Our [CLI](/docs/cli) is an optional nicety, never a requirement.

For Spiral specifically, Laradock ships a dedicated `roadrunner` service (it runs `rr serve` against the RoadRunner binary), PostgreSQL/MySQL and Redis already wired, and a `workspace` container with Composer and git installed.

## Run Spiral on Docker with Laradock

### 1. Add Laradock to your project

```bash
cd my-spiral-app
git clone https://github.com/laradock/laradock.git
cd laradock
```

(No Spiral app yet? Clone Laradock first, then [create one from the workspace container](#4-install-and-run-your-app).)

### 2. Pick the services your app needs

Spiral apps run through the `roadrunner` service instead of NGINX + PHP-FPM; add a database and Redis:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock start roadrunner postgres redis workspace
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
cp .env.example .env
docker compose up -d roadrunner postgres redis workspace
```

</TabItem>
</Tabs>

Need MySQL instead? Swap the name: `./laradock start roadrunner mysql redis workspace`. The full catalog is [here](/docs/Intro#supported-services).

Prefer to be asked? The optional [CLI](/docs/cli) walks you through the choices: `./laradock setup`, then `./laradock start`. It prints every real command it runs.

### 3. Point Spiral at the containers

In your app's `.env`, use the service names as hostnames:

```env
DB_HOST=postgres
DB_DATABASE=default
DB_USERNAME=default
DB_PASSWORD=secret
```

The default database, user and password live in `postgres/defaults.env`; override any of them by adding the line to Laradock's `.env` (it always wins).

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

```bash
composer create-project spiral/app .   # only if you have no Spiral files yet
```

Your project ships a `.rr.yaml`; the `roadrunner` container mounts your code and runs `rr serve` against it automatically. Then open [http://localhost:8090](http://localhost:8090) (the port Laradock's `roadrunner` service listens on by default; change `ROADRUNNER_HTTP_PORT` in `.env` if you want a different one). That is a full Spiral app running on Docker.

## Change the PHP version anytime

This is where a native install hurts and Laradock shines. Set the version in Laradock's `.env` and rebuild:

```env
PHP_VERSION=8.3
```

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock rebuild roadrunner workspace
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose build roadrunner workspace
```

</TabItem>
</Tabs>

Spiral requires PHP 8.1 or newer, so this rebuilds the `roadrunner` worker image against the version you chose, isolated from anything installed on your machine.

## Frequently Asked Questions

### Do I need to install PHP, Composer or the RoadRunner binary to run Spiral with Laradock?

No. Everything lives inside the containers. Composer and git are in the `workspace` container; the `rr` binary is baked into the `roadrunner` container; you never install any of it on your host.

### Which services should I start for a typical Spiral app?

`roadrunner postgres redis workspace` covers most apps. Swap `postgres` for `mysql` if you prefer, and skip `redis` if you are not using cache or queues yet.

### Can I run multiple Spiral apps on different PHP versions?

Yes. Give each its own Laradock with a unique `COMPOSE_PROJECT_NAME` and `DATA_PATH_HOST`, set a different `PHP_VERSION` in each, and they run independently on the same machine.

### Does this work the same on macOS, Windows and Linux?

Yes. Laradock runs anywhere Docker runs. On macOS/Windows, file-sync speed depends on Docker Desktop (VirtioFS helps a lot); it is a Docker Desktop trait, not specific to Laradock.

### Is this the same Docker setup I would use in production?

Yes, closer than most: RoadRunner is Spiral's own recommended production application server, so the `roadrunner` container runs your app the same way it would in production. See [Prepare Laradock for Production](/docs/production#prepare-laradock-for-production) for the hardening steps.

---

Comparing environments? See the full **[Laradock vs Others](/docs/laradock-alternatives)** breakdown. Ready to start? **[Getting Started](/docs/getting-started)** takes about five minutes.
