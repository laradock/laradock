---
slug: /magento-on-docker
title: Run Magento on Docker
description: Run Magento (Adobe Commerce or Magento Open Source) on Docker in minutes with Laradock. What Docker gives a Magento store, why Laradock is the fastest way to get NGINX, PHP, MySQL, OpenSearch and Redis running, and the exact commands, with any PHP version, without installing anything on your machine.
keywords:
  - magento on docker
  - run magento on docker
  - magento docker
  - magento docker setup
  - dockerize magento
  - magento docker environment
  - magento nginx mysql opensearch docker
---

## What is Magento?

[Magento](https://business.adobe.com/products/magento/magento-commerce.html) (now sold by Adobe as Adobe Commerce, with Magento Open Source as the free edition) is a large, extensible PHP e-commerce platform known for handling complex catalogs, multi-store setups and B2B pricing. It is genuinely demanding infrastructure: a web server, PHP-FPM with a high memory limit, a MySQL or MariaDB database, a search engine (OpenSearch or Elasticsearch, mandatory for catalog and layered navigation search since Magento 2.4), and Redis for cache and session storage on anything beyond a toy install.

## Why run Magento in Docker?

Docker packages each of those pieces (NGINX, PHP-FPM, MySQL, OpenSearch, Redis) into isolated containers that run the same on every machine. Instead of installing PHP, a full search engine and a database onto your laptop, where versions collide between projects and "works on my machine" starts, you run disposable containers that mirror production and vanish cleanly when you delete them. One project can run PHP 8.3 while another runs an older Magento 2.3 install on PHP 7.4, on the same computer, with nothing installed globally.

The catch: wiring those containers together yourself (base images, PHP extensions, the search engine, networking, permissions) is a week of fiddly Docker work, more so for Magento than for most PHP apps given how many services it needs at once. That is exactly what Laradock removes.

## Why Laradock is the best fit for Magento

Adobe does not ship an official Docker setup for Magento the way Laravel ships Sail; the closest thing is the well-known community project [markshust/docker-magento](https://github.com/markshust/docker-magento), which is actively maintained but purpose-built for Magento only. Here is why Laradock is the best fit for a real project:

- **You are never locked into one ecosystem.** Laradock is framework-agnostic. The day you add a Symfony admin tool, a headless PWA storefront, or a plain PHP script beside your Magento install, it runs in the same environment with the same commands. A Magento-only tool cannot do that.
- **Far more flexibility.** 100+ ready services and any PHP version from 5.6 to 8.5, so a legacy Magento 2.3 install and a current 2.4 store can each get the exact runtime and search engine version they need.
- **Nothing is hidden and you own everything.** No generated files, no magic, no wrapper binary between you and Docker. Every Dockerfile and compose file is right there for you to read and edit, which matters when you need to tune PHP's memory limit or add a custom OpenSearch plugin.
- **Nothing new to learn.** What you use is plain `docker compose`, knowledge that transfers straight to production and to every other project. Our [CLI](/docs/cli) is an optional nicety, never a requirement.

Concretely, for Magento it gives you a production-style NGINX + PHP-FPM stack, MySQL/MariaDB, OpenSearch or Elasticsearch for catalog search, Redis for cache and sessions, and a `workspace` container with Composer and git already installed.

## Run Magento on Docker with Laradock

### 1. Add Laradock to your project

```bash
cd my-magento-store
git clone https://github.com/laradock/laradock.git
cd laradock && cp .env.example .env
```

(No Magento files yet? Clone Laradock first, then pull Magento via Composer from the `workspace` container in the next steps; you will need your Adobe Commerce Marketplace authentication keys for the private repo.)

### 2. Pick the services your store needs

Magento needs a web server, a database, and a search engine (OpenSearch is what Adobe currently recommends; Elasticsearch still works on older 2.4.x releases). Redis is optional but strongly recommended once you go past a bare install:

```bash
docker compose up -d nginx mysql opensearch redis workspace
```

Prefer MariaDB or Elasticsearch instead? Swap the name: `docker compose up -d nginx mariadb elasticsearch redis workspace`. The full catalog is [here](/docs/Intro#supported-services).

Before installing, raise PHP's memory limit for the Composer install and setup steps; Magento's own docs call for at least 2G. Edit the `memory_limit` line in `php-fpm/php8.3.ini` (or whichever `php-fpm/phpX.Y.ini` matches your `PHP_VERSION`) before you build.

### 3. Point Magento at the containers

Unlike Laravel or WordPress, Magento does not need a config file hand-edited before install; its installer writes `app/etc/env.php` for you. Pass the container names as hostnames when you run it in the next step: database host `mysql`, search engine host `opensearch`, cache backend host `redis`.

### 4. Install and run

Enter the `workspace` container, where Composer and git live, pull Magento and run the installer:

```bash
docker compose exec workspace bash
composer create-project --repository-url=https://mirror.mage-os.org/ magento/project-community-edition .
bin/magento setup:install \
  --base-url=http://localhost \
  --db-host=mysql --db-name=magento --db-user=magento --db-password=secret \
  --search-engine=opensearch --opensearch-host=opensearch --opensearch-port=9200 \
  --cache-backend=redis --cache-backend-redis-server=redis \
  --admin-firstname=Admin --admin-lastname=User \
  --admin-email=admin@example.com --admin-user=admin --admin-password=Admin123!
```

Then open [http://localhost](http://localhost). That is a full Magento store running on Docker. (If you are on Adobe Commerce rather than Magento Open Source or Mage-OS, swap the Composer repository for your Adobe Marketplace credentials, see [Add Magento authentication](#add-magento-composer-authentication) below.)

## Change the PHP version anytime

This is where a native install hurts and Laradock shines. Set the version in Laradock's `.env` and rebuild:

```env
PHP_VERSION=8.3
```

```bash
docker compose build php-fpm workspace
```

Magento 2.4.x currently targets PHP 8.3, with newer releases moving to 8.4/8.5, so check which PHP range your specific Magento version supports before you pick one; either way, the same tool can run a legacy 2.3 store on PHP 7.4 and a current 2.4 store on 8.3 side by side, each isolated, none of it installed on your machine.

## Add Magento Composer authentication

Adding Composer authentication credentials for Magento 2 (needed for Adobe Commerce's private Marketplace repository, or any other private Composer repository your store depends on):

1. In `.env`, set `WORKSPACE_COMPOSER_AUTH` to `true`.
2. Add your credentials to `workspace/auth.json`.
3. Rebuild the workspace:
   ```bash
   docker compose build workspace
   ```

## Frequently Asked Questions

### Do I need to install PHP, MySQL or OpenSearch to run Magento with Laradock?

No. Everything lives inside the containers. Composer and git are in the `workspace` container; you never install PHP, the database or the search engine on your host.

### Which services should I start for a typical Magento store?

`nginx mysql opensearch redis workspace` covers a modern Magento 2.4 install: web server, database, search engine, cache, and a shell. Swap `opensearch` for `elasticsearch` on an older Magento version that still expects it.

### Can I run multiple Magento stores on different PHP versions?

Yes. Give each its own Laradock with a unique `COMPOSE_PROJECT_NAME` and `DATA_PATH_HOST`, set a different `PHP_VERSION` in each, and they run independently on the same machine.

### Does this work the same on macOS, Windows and Linux?

Yes. Laradock runs anywhere Docker runs. On macOS/Windows, file-sync speed depends on Docker Desktop (VirtioFS helps a lot for `vendor/`-heavy apps like Magento); it is a Docker Desktop trait, not specific to Laradock.

### Is this the same Docker setup I would use in production?

The containers are production-style (real NGINX + PHP-FPM), so it is far closer to production than a native install, though a production Magento cluster typically splits the search engine, cache and database onto dedicated infrastructure. See [Prepare Laradock for Production](/docs/production#prepare-laradock-for-production) for the hardening steps.

---

Comparing environments? See the full **[Laradock vs Others](/docs/laradock-alternatives)** breakdown. Ready to start? **[Getting Started](/docs/getting-started)** takes about five minutes.
