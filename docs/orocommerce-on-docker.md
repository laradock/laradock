# Run OroCommerce on Docker

Source: https://laradock.io/docs/orocommerce-on-docker

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

## What is OroCommerce?

[OroCommerce](https://oroinc.com/orocommerce) is an open-source B2B ecommerce platform built on the Symfony framework, aimed at wholesale, multi-organization and complex-catalog storefronts rather than a simple shop front. It is a PHP application backed by a real database (MySQL or PostgreSQL), served through a web server, and it leans on Redis for caching and, for larger catalogs, Elasticsearch for product search. It is noticeably heavier than a typical PHP app: Oro's own documentation calls for a `memory_limit` of at least 512M, and a comfortable local setup wants more CPU and RAM than a small CMS would.

## Why run OroCommerce in Docker?

Docker packages each of those pieces (NGINX, PHP-FPM, PostgreSQL/MySQL, Redis, Elasticsearch) into isolated containers that run the same on every machine. Instead of installing PHP and a database onto your laptop, where versions collide between projects and "works on my machine" starts, you run disposable containers that mirror production and vanish cleanly when you delete them. Given how resource-hungry OroCommerce is, that isolation also means its PHP process, database and search engine only consume what you allocate to their containers, without leaking configuration or memory pressure into the rest of your machine.

The catch: wiring those containers together yourself (base images, PHP extensions, networking, permissions) is a week of fiddly Docker work. That is exactly what Laradock removes.

## Why Laradock is the best fit for OroCommerce

Oro Inc. publishes official Docker images and a `docker-compose` demo setup for OroCommerce, so, unlike most PHP projects, it does not strictly need Laradock. It is still the best fit, and here is why:

- **You are never locked into one ecosystem.** Laradock is framework-agnostic. The day you add a Laravel API, a WordPress marketing site, or a plain PHP script beside your OroCommerce instance, it runs in the same environment with the same commands. A single-purpose demo image cannot do that.
- **Far more flexibility.** 100+ ready services and any PHP version from 5.6 to 8.5, versus the narrow, version-pinned set the official demo images target.
- **Nothing is hidden and you own everything.** No generated files, no magic, no wrapper binary between you and Docker. Every Dockerfile and compose file is right there for you to read and edit, which matters on a codebase as large as OroCommerce's.
- **Nothing new to learn.** What you use is plain `docker compose`, knowledge that transfers straight to production and to every other project. Our [CLI](https://laradock.io/docs/cli) is an optional nicety, never a requirement.

For OroCommerce specifically, Laradock wires a production-style NGINX + PHP-FPM stack, PostgreSQL or MySQL, Elasticsearch for product search, RabbitMQ for the message queue, and a `workspace` container with Composer already installed for the long dependency install OroCommerce needs. Redis is one command away when you want it for caching.

## Run OroCommerce on Docker with Laradock

### 1. Add Laradock to your project

```bash
cd my-orocommerce-app
git clone https://github.com/laradock/laradock.git
cd laradock
```

(No OroCommerce project yet? Clone Laradock first, then create one from the workspace container in the next steps.)

### 2. Pick the services your app needs

OroCommerce is genuinely heavier than most PHP apps: it needs a web server, a database, a search engine, and a message queue to boot and function. Elasticsearch powers website and product search, and RabbitMQ runs the asynchronous message queue OroCommerce relies on for imports, indexing and jobs. The web server pulls in PHP-FPM automatically, so this is the required stack:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock start nginx postgres elasticsearch rabbitmq workspace
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
cp .env.example .env
docker compose up -d nginx postgres elasticsearch rabbitmq workspace
```

</TabItem>
</Tabs>

Prefer MySQL over PostgreSQL? Swap the name: `./laradock start nginx mysql elasticsearch rabbitmq workspace`. The full catalog is [here](https://laradock.io/docs/Intro#supported-services).

Prefer to be asked? The optional [CLI](https://laradock.io/docs/cli) walks you through the choices: `./laradock setup`, then `./laradock start`. It prints every real command it runs.

### 3. Point OroCommerce at the containers

OroCommerce's installer writes your database connection into `config/parameters.yml`; use the service names as hostnames:

```yaml
database_driver: pdo_pgsql
database_host: postgres
database_port: 5432
database_name: default
database_user: default
database_password: secret
```

Use `pdo_mysql` and port `3306` instead if you started `mysql`. The default database, user and password live in `postgres/defaults.env` (or `mysql/defaults.env`); override any of them by adding the line to Laradock's `.env` (it always wins).

### 4. Install and run your app

Enter the `workspace` container, where Composer lives, and run the installer:

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
composer create-project oro/commerce-crm-application my-orocommerce-app   # only if you have no project yet
php bin/console oro:install --env=prod --timeout=2000
```

`oro:install` walks you through the database connection, organization name and admin account (it can also take those as command-line options). Then open [http://localhost](http://localhost). That is a full OroCommerce storefront running on Docker.

## Add Redis caching (optional)

OroCommerce runs fine on its default file-based cache, but on a busy catalog Redis holds the data, config and doctrine caches in memory and takes pressure off disk. Wiring it up is two steps:

1. Start the Redis container alongside the rest:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock start redis
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose up -d redis
```

</TabItem>
</Tabs>

2. Point OroCommerce's cache at it in `config/parameters.yml`, using the service name as the host:

```yaml
redis_dsn_cache: redis://redis:6379/1
redis_dsn_doctrine: redis://redis:6379/2
```

Re-run `php bin/console cache:clear` from the `workspace` container and OroCommerce now caches in Redis. Without those lines the container just sits idle, which is why the required stack above leaves it out.

## Change the PHP version anytime

This is where a native install hurts and Laradock shines. Set the version in Laradock's `.env` and rebuild:

```env
PHP_VERSION=8.3
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

Current OroCommerce releases (6.x) run on PHP 8.3 and 8.4; Laradock covers anything from PHP 5.6 to 8.5, so the same tool can run an older Oro instance pinned to an earlier PHP version alongside a current one, each isolated, none of it installed on your machine.

## Take your store live

When your store is ready, the same Laradock stack becomes your deployment. You build one hardened image of your app and ship it to the host of your choice:

```bash
./laradock ship
```

Then pick a target and follow its short guide, a single server, a managed platform, or Kubernetes: **[Deploy to Production](https://laradock.io/docs/production)** lists every provider (Fly.io, Render, Railway, DigitalOcean, AWS, Google Cloud, Azure, Kamal, Kubernetes) with a ready config file for each. There is no per-provider magic to learn; a Docker image runs the same everywhere.

## Frequently Asked Questions

### Do I need to install PHP or Composer to run OroCommerce with Laradock?

No. Everything lives inside the containers. Composer and PHP are provided in the `workspace` and `php-fpm` containers; you never install them on your host.

### Which services should I start for a typical OroCommerce app?

`nginx postgres elasticsearch rabbitmq workspace` is the required stack: web server, database, search engine, and the message queue OroCommerce needs to boot and function. Swap `postgres` for `mysql` if you prefer, and add `redis` when you want in-memory caching (see [Add Redis caching](#add-redis-caching-optional)).

### Can I run multiple OroCommerce projects on different PHP versions?

Yes. Give each its own Laradock with a unique `COMPOSE_PROJECT_NAME` and `DATA_PATH_HOST`, set a different `PHP_VERSION` in each, and they run independently on the same machine.

### Does this work the same on macOS, Windows and Linux?

Yes. Laradock runs anywhere Docker runs. On macOS/Windows, file-sync speed depends on Docker Desktop (VirtioFS helps a lot for a `vendor/`-heavy app like OroCommerce); it is a Docker Desktop trait, not specific to Laradock.

### Is this the same Docker setup I would use in production?

The containers are production-style (real NGINX + PHP-FPM), so it is far closer to production than a native install. Given how resource-sensitive OroCommerce is, also review Oro's own system requirements before sizing a production host. See [Prepare Laradock for Production](https://laradock.io/docs/production#prepare-laradock-for-production) for the hardening steps.

---

Comparing environments? See the full **[Laradock vs Others](https://laradock.io/docs/laradock-alternatives)** breakdown. Ready to start? **[Getting Started](https://laradock.io/docs/getting-started)** takes about five minutes.
