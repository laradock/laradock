---
slug: /laradock-vs-symfony-docker
title: Laradock vs Symfony Docker
description: Symfony Docker (dunglas/symfony-docker) and the Symfony CLI vs Laradock, side by side. When the FrankenPHP-based official template is the right call, and when Laradock's 100+ services and multi-project scope win.
keywords:
  - symfony docker
  - symfony docker compose
  - dunglas symfony docker
  - symfony docker alternative
  - symfony cli
  - frankenphp symfony
  - run symfony on docker
  - dockerize symfony
  - symfony local development
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

## What is Symfony Docker?

[Symfony Docker](https://github.com/dunglas/symfony-docker) is a project template by Kévin Dunglas (a Symfony core member and the author of FrankenPHP). It ships a `Dockerfile` and `compose.yaml` built around [FrankenPHP](https://frankenphp.dev/), giving a new Symfony app a modern, production-capable runtime with HTTP/2, HTTPS, and a built-in worker mode. Separately, the [Symfony CLI](https://symfony.com/download) provides a fast local web server (`symfony server:start`) that runs on your host PHP and can read environment variables from Docker services.

This page compares both with Laradock: where Symfony Docker is a single, excellent, Symfony-shaped template, Laradock is a framework-agnostic catalog of 100+ pre-wired services.

*Symfony Docker is a lean, FrankenPHP-based template for one Symfony app, and it is genuinely good. Laradock is the broad, pre-wired environment: 100+ services, any PHP project, and a path to production. This page sets Symfony up on both.*

**TL;DR:** pick [Symfony Docker](https://github.com/dunglas/symfony-docker) for a single modern Symfony app when its FrankenPHP-based stack fits, it is clean and official-adjacent. Pick Laradock when you need services it does not include, you work across multiple frameworks or projects, or you want a legacy PHP version. (Laradock also ships FrankenPHP as a service, so you keep that option either way.)

## Setting up with Symfony Docker

```bash
git clone https://github.com/dunglas/symfony-docker.git my-app
cd my-app
docker compose build --no-cache
docker compose up -d
```

Your app runs on FrankenPHP at `https://localhost` with a trusted local certificate. Add a database via the template's documented Compose overrides, and use `docker compose exec php ...` for Composer and the Symfony console. It is tuned for one Symfony application; a second database, a search cluster, a message broker, or a queue worker are additions you make and maintain in the compose file.

## Setting up with the Symfony CLI

```bash
symfony new my-app
cd my-app
symfony server:start
```

Fast and lightweight, but it runs on **your host's** PHP (not Docker), so PHP versions and extensions are your machine's, and any database/Redis/search service is something you install or run separately.

## The same thing with Laradock

```bash
cd my-app
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

Inside the workspace, `composer create-project symfony/skeleton .` (or `symfony console ...`) just works. Want FrankenPHP instead of NGINX + PHP-FPM? It is a Laradock service too: `./laradock start frankenphp`. Need Messenger backed by RabbitMQ, or Meilisearch/Typesense for search? Each is one word. Full walkthrough: **[Run Symfony on Docker](/docs/symfony-on-docker)**.

## Side by side

| | **Symfony Docker** | **Symfony CLI** | **Laradock** |
|---|---|---|---|
| What it is | FrankenPHP-based project template | Native local web server | Pre-wired Docker environment |
| Runtime | FrankenPHP (in Docker) | Your host PHP | PHP-FPM + NGINX/Apache/Caddy, or FrankenPHP/RoadRunner |
| Services included | PHP + you add the rest | None (host) | 100+ (databases, caches, queues, search, mail, monitoring) |
| Frameworks | Symfony-shaped | Symfony | Any PHP project |
| PHP versions | Recent (image-based) | Whatever is on your host | 5.6 - 8.5 |
| HTTPS | ✅ automatic (FrankenPHP) | ✅ (`symfony server:ca:install`) | Via Caddy/Traefik/certbot services |
| Adding a service later | Edit `compose.yaml` yourself | Install/run it separately | `docker compose up -d {service}` |
| Production path | ✅ FrankenPHP image | ❌ dev server | `./laradock ship` → server / Kubernetes / cloud |

## Choose Symfony Docker if...

- You are building a single Symfony app and its FrankenPHP-based stack is what you want.
- You value a small, Symfony-official-adjacent template maintained by a core contributor.
- Your service needs are modest and you are comfortable extending the compose file.

## Choose the Symfony CLI if...

- You want the fastest possible local loop and are happy managing PHP and services on your host.

## Choose Laradock if...

- You need services beyond the template: multiple databases, RabbitMQ/Kafka, Elasticsearch/Meilisearch, monitoring, local LLMs, each one `up` command away.
- You work on more than one framework or project and want a single environment for all of them.
- You need a specific or legacy PHP version.
- You want the same stack to go to production with `./laradock ship`, and you can still choose FrankenPHP as the runtime.

## Frequently Asked Questions

### Is Symfony Docker official?

It is maintained by Kévin Dunglas, a Symfony core team member, and is the setup the Symfony documentation points to for Docker. It is best described as official-adjacent rather than a first-party Symfony product.

### Can I use FrankenPHP with Laradock?

Yes. FrankenPHP is one of Laradock's built-in services (`./laradock start frankenphp`), alongside RoadRunner and the classic NGINX/Apache/Caddy + PHP-FPM options, so choosing Laradock does not mean giving up FrankenPHP.

### Does Symfony Docker handle databases and search?

It focuses on the PHP runtime; a database, search engine, or message broker are additions you wire into its `compose.yaml`. Laradock ships those as ready-to-start services.

See the full landscape: **[Laradock vs Laravel Sail](/docs/laradock-vs-laravel-sail)** and **[Laradock vs Others](/docs/laradock-alternatives)**. Ready to try it? **[Run Symfony on Docker](/docs/symfony-on-docker)** takes about five minutes.
