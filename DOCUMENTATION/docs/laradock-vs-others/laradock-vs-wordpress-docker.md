---
slug: /laradock-vs-wordpress-docker
title: Laradock vs the Official WordPress Docker Setup
description: Laradock vs wp-env and the official WordPress Docker image, side by side. Run WordPress in Docker with real NGINX, MySQL, and Redis, on any PHP version, and see when the official minimal setup is enough and when Laradock wins.
keywords:
  - wordpress docker
  - wp-env
  - wp-env alternative
  - official wordpress docker image
  - wordpress docker compose
  - bitnami wordpress
  - run wordpress on docker
  - wordpress local development docker
  - dockerize wordpress
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

Unlike Laravel with Sail, WordPress has no single official Docker environment. Instead you have three common paths: the WordPress core team's [`wp-env`](https://developer.wordpress.org/block-editor/reference-guides/packages/packages-env/), the community-maintained [official `wordpress` Docker image](https://hub.docker.com/_/wordpress) wired up with a hand-written `docker-compose.yml`, and vendor images like [Bitnami WordPress](https://hub.docker.com/r/bitnami/wordpress). This page compares those with Laradock.

*`wp-env` is a zero-config, plugin/theme-development tool. The official image is a bare building block you wire yourself. Laradock is a full, pre-wired environment with real NGINX/MySQL/Redis and 100+ optional services. This page sets WordPress up on each.*

**TL;DR:** use [`wp-env`](https://developer.wordpress.org/block-editor/reference-guides/packages/packages-env/) if you build plugins or themes and want a throwaway WordPress in one command. Wire the [official image](https://hub.docker.com/_/wordpress) yourself if your stack is tiny and you enjoy writing compose files. Pick Laradock when you want a production-style stack (real web server, Redis object cache, any PHP version), run more than WordPress, or want the same environment to reach production.

## Setting up with wp-env

`wp-env` is a Node package that spins up WordPress + MySQL in Docker with no configuration:

```bash
npm -g install @wordpress/env
cd my-plugin
wp-env start
```

WordPress comes up at `http://localhost:8888`, with your plugin/theme folder mapped in. Configure via a `.wp-env.json` (PHP version, WordPress version, mapped plugins/themes). It is purpose-built for **development of** WordPress extensions, not for running a real site: no NGINX (PHP built-in server), no Redis, no mail catcher, and the service list is fixed.

## Setting up with the official WordPress image

You write the compose file yourself:

```yaml
services:
  db:
    image: mysql:8.0
    environment:
      MYSQL_DATABASE: wordpress
      MYSQL_ROOT_PASSWORD: secret
  wordpress:
    image: wordpress:php8.3-apache
    ports: ["8080:80"]
    environment:
      WORDPRESS_DB_HOST: db
      WORDPRESS_DB_PASSWORD: secret
    depends_on: [db]
```

`docker compose up -d` and you are live at `http://localhost:8080`. Full control, but everything beyond WordPress + one database (Redis, a real NGINX config, WP-CLI, a mail catcher, HTTPS) is yours to add and maintain.

## The same thing with Laradock

```bash
cd my-site
git clone https://github.com/laradock/laradock.git
cd laradock
```

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock start nginx mysql redis workspace
./laradock workspace
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
cp .env.example .env
docker compose up -d nginx mysql redis workspace
docker compose exec workspace bash
```

</TabItem>
</Tabs>

The `workspace` container ships WP-CLI, so `wp core download`, `wp config create`, and `wp core install` all work inside it. You get a real NGINX in front, Redis for object caching, and any PHP version from 5.6 to 8.5. Full walkthrough: **[Run WordPress on Docker](/docs/wordpress-on-docker)**.

## Side by side

| | **wp-env** | **Official image** | **Laradock** |
|---|---|---|---|
| Install | Node + `@wordpress/env` | Nothing (write compose) | Nothing (git clone) |
| Config | `.wp-env.json` | Your `docker-compose.yml` | per-service folders + one `.env` |
| Web server | PHP built-in server | Apache (image default) | Real NGINX / Apache / Caddy |
| Object cache (Redis) | ❌ | Add it yourself | ✅ one word |
| WP-CLI | ✅ (`wp-env run cli`) | Add a `wordpress:cli` service | ✅ in `workspace` |
| Other services | None (fixed) | Whatever you wire | 100+ (search, queues, mail, monitoring) |
| PHP versions | Recent only | Image tags | 5.6 - 8.5 |
| Runs non-WordPress projects | ❌ | You'd rewrite the compose | ✅ any PHP project |
| Production path | ❌ dev tool | Roll your own | `./laradock ship` → server / Kubernetes / cloud |

## Choose wp-env if...

- You develop WordPress plugins, themes, or contribute to core, and want a disposable instance in one command.
- You do not need a production-like stack, just WordPress running against your code.

## Choose the official image if...

- Your needs are minimal (WordPress + one database) and you like owning a short compose file.
- You do not mind wiring Redis, NGINX, WP-CLI, and mail yourself as the project grows.

## Choose Laradock if...

- You want a **production-style** local stack: real NGINX, Redis object caching, HTTPS via Caddy/Traefik.
- You run WordPress **and** other PHP projects and want one environment for all of them.
- You need a specific or legacy PHP version WordPress must run on.
- You want the same containers to reach production with `./laradock ship`, not just live on your laptop.

## Frequently Asked Questions

### Does WordPress have an official Docker setup?

Not one, but two building blocks: the WordPress core team publishes [`wp-env`](https://developer.wordpress.org/block-editor/reference-guides/packages/packages-env/) (aimed at extension/core development) and maintains the [official `wordpress` image](https://hub.docker.com/_/wordpress) on Docker Hub (a bare runtime you wire into a compose file). Neither is a full local-development environment the way Laradock is.

### Is wp-env good for running a real WordPress site?

No. `wp-env` is designed for developing plugins, themes, and WordPress core, so it deliberately omits a production-style web server, Redis, and mail. For a site that resembles production, use the official image with your own services, or Laradock.

### Can I add Redis object caching?

With `wp-env` and the official image you add it yourself. With Laradock, Redis is one word in the start command (`./laradock start redis`), and the `workspace` container has WP-CLI to install the object-cache drop-in.

See the full landscape, including native GUI tools: **[Laradock vs Local WP](/docs/laradock-vs-local-wp)** and **[Laradock vs Others](/docs/laradock-alternatives)**. Ready to try it? **[Run WordPress on Docker](/docs/wordpress-on-docker)** takes about five minutes.
