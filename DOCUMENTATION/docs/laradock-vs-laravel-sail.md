---
slug: /laradock-vs-laravel-sail
title: Laradock vs Laravel Sail
description: Laravel Sail vs Laradock side by side. Same Laravel app set up with both, with real commands. When Sail's minimal official stack is enough and when Laradock's 100+ services win.
keywords:
  - laradock vs laravel sail
  - laravel sail vs laradock
  - laravel sail alternative
  - laravel sail setup
  - laravel docker environment
  - sail vs docker compose
---

*Sail is Laravel's official Docker scaffold: small, clean, Laravel-only. Laradock is the framework-agnostic catalog: 100+ services behind the same plain Docker workflow. This page runs the same app on both.*

**TL;DR:** pick [Sail](https://laravel.com/docs/sail) for a vanilla Laravel app with vanilla needs; it is official and it is enough. Pick Laradock the day your stack outgrows Sail's service list, you run more than Laravel, or you would rather use `docker compose` directly than through a wrapper script.

## Setting up with Sail

For a brand-new app, one command scaffolds everything:

```bash
curl -s "https://laravel.build/my-app?with=mysql,redis" | bash
cd my-app && ./vendor/bin/sail up -d
```

For an existing app: `composer require laravel/sail --dev`, then `php artisan sail:install` and pick your services from the menu (MySQL, Postgres, Redis, Meilisearch, Mailpit, Selenium, and a few more).

Day to day, everything goes through the wrapper: `sail up`, `sail artisan migrate`, `sail composer require`, `sail test`.

Change PHP version: edit `compose.yaml`, point the build context at another runtime (`./vendor/laravel/sail/runtimes/8.3`), change the `image` name to match, then `sail build --no-cache`.

## The same thing with Laradock

```bash
cd my-app
git clone https://github.com/laradock/laradock.git
cd laradock && cp .env.example .env
docker compose up -d nginx mysql redis workspace
docker compose exec workspace bash   # artisan, composer, npm all live here
```

Day to day you use Docker directly: `docker compose exec workspace php artisan migrate`, `docker compose logs -f nginx`, `docker compose stop`.

Change PHP version: `PHP_VERSION=8.3` in `.env`, then `docker compose build php-fpm workspace`. Runs anything from PHP 5.6 to 8.5, which Sail does not attempt (great for legacy projects).

## Side by side

| | **Laravel Sail** | **Laradock** |
|---|---|---|
| Ships with | Laravel itself (official) | git clone |
| Services | ~10 (chosen at install) | 100+ (start any, any time) |
| Frameworks | Laravel only | Any PHP project |
| Commands | `sail *` wrapper | standard `docker compose *` |
| Web server | Built-in PHP server (`artisan serve`) by default | Real NGINX / Apache / Caddy, production-style |
| PHP versions | 8.0 - 8.4 runtimes | 5.6 - 8.5 |
| Adding a service later | Only if Sail supports it (else hand-edit compose.yaml) | `docker compose up -d {service}` |
| Dev shell | none (commands via `sail`) | `workspace` container with Composer, Node, git, and dozens of tools |
| Config | one compose.yaml in your repo | per-service folders + one `.env` |

## Choose Sail if...

- Your app is pure Laravel and your stack is inside Sail's menu.
- You value "official" and minimal above everything else.
- Your team already knows the `sail` command by heart.

## Choose Laradock if...

- You need anything beyond Sail's list: RabbitMQ, Kafka, Elasticsearch clusters, ClickHouse, vector DBs, local LLMs, monitoring; with Laradock each one is a single `up` command away.
- You also work on non-Laravel projects and want one environment for all of them.
- You want a production-style web server (NGINX/Apache/Caddy) instead of `artisan serve` in a container.
- You maintain legacy apps on PHP 5.6/7.x that Sail cannot run.
- You prefer no wrapper: what you learn is plain Docker Compose.

## Already on Sail? The service names even match

Sail and Laradock both call the containers `mysql` and `redis`, so your app's `.env` barely changes.

1. **Export your database** while Sail still runs: `./vendor/bin/sail exec mysql mysqldump -uroot -ppassword laravel > backup.sql` (adjust db name/creds to your `.env`).
2. **Stop Sail:** `./vendor/bin/sail down`
3. **Add Laradock** inside your project: `git clone https://github.com/laradock/laradock.git && cd laradock && cp .env.example .env`
4. **Start your stack:** `docker compose up -d nginx mysql redis workspace`
5. **Import the database:** `docker compose exec -T mysql mysql -uroot -proot default < ../backup.sql`
6. **Update your app's `.env`:** `DB_HOST=mysql` and `REDIS_HOST=redis` stay the same; change `DB_DATABASE`/`DB_USERNAME`/`DB_PASSWORD` to Laradock's (in `mysql/defaults.env`) or set yours in Laradock's `.env`.
7. Optional cleanup once you are settled: `composer remove laravel/sail --dev` and delete Sail's `compose.yaml`.

See the full landscape, including DDEV, Herd, Lando and XAMPP: **[Laradock vs Others](/docs/laradock-alternatives)**. Ready to try it? **[Getting Started](/docs/getting-started)** takes about five minutes.
