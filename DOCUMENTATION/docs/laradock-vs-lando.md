---
slug: /laradock-vs-lando
title: Laradock vs Lando
description: Lando vs Laradock side by side. Recipe-driven generated Docker vs pre-wired transparent Docker Compose. Real commands for both, and a migration guide from Lando to Laradock.
keywords:
  - laradock vs lando
  - lando vs laradock
  - lando alternative
  - lando laravel setup
  - lando vs ddev
  - php docker development environment
---

*Lando is DDEV's closest cousin: a recipe file and a CLI that generate Docker behind the scenes, popular in Drupal and WordPress agency work. Laradock is the opposite philosophy: the Docker files are the product, pre-wired and fully visible.*

**TL;DR:** pick [Lando](https://lando.dev/) if your team already standardized on its recipes. Pick Laradock for transparency, a far larger service catalog, and no tool between you and Docker.

## Setting up a Laravel app with Lando

Install the Lando binary first, then describe your stack in `.lando.yml` at the project root:

```yaml
name: my-app
recipe: laravel
config:
  webroot: public
  php: "8.3"
services:
  cache:
    type: redis
```

Then:

```bash
lando start
lando composer install
lando artisan migrate
```

Your site is served at `https://my-app.lndo.site`. Day to day you talk to the tool: `lando ssh`, `lando artisan`, `lando db-import`, `lando rebuild` after recipe changes. The compose files Lando generates live in `~/.lando/` and are regenerated; they are not meant to be edited.

## The same thing with Laradock

```bash
cd my-app
git clone https://github.com/laradock/laradock.git
cd laradock && cp .env.example .env
docker compose up -d nginx mysql redis workspace
docker compose exec workspace bash   # composer, artisan, node
```

No binary, no recipe format to learn, no regeneration: the service definitions are plain files in front of you, and the commands are standard Docker Compose. Change PHP with `PHP_VERSION=8.3` in `.env` + rebuild; add any of 100+ services with one `up` command.

## Side by side

| | **Lando** | **Laradock** |
|---|---|---|
| Install | lando binary (+ its own Docker setup) | nothing (git clone) |
| Config | `.lando.yml` recipe | `.env` + per-service folders |
| URLs | `https://my-app.lndo.site` automatic | `http://localhost` (or wire Traefik/Caddy) |
| Services | ~15 supported types | 100+ shipped folders |
| Docker files | Generated, hidden | Plain files you own and edit |
| Commands | `lando *` vocabulary | standard `docker compose *` |
| Frameworks | Recipe-based (Drupal, WordPress, Laravel, ...) | Any PHP project |
| Project pace | Slower releases, smaller team than DDEV | Community-maintained since 2015 |
| Skills you build | Lando-specific | Transferable Docker |

## Choose Lando if...

- Your agency already standardized on Lando recipes and the workflow fits.
- You want automatic per-project URLs and HTTPS without touching config.
- Your stack fits comfortably inside Lando's supported service types.

## Choose Laradock if...

- You want to see and own every Dockerfile and config.
- You need services outside Lando's recipe list (brokers, search clusters, LLMs, monitoring).
- You prefer plain `docker compose` over another CLI vocabulary.
- You want the environment defined by files in your repo tree, not generated state in `~/.lando/`.

## Already on Lando? Migrating takes minutes

1. **Export your database** while Lando still runs: `lando db-export backup.sql.gz && gunzip backup.sql.gz`
2. **Stop Lando:** `lando stop` (keep `.lando.yml` around until you are confident).
3. **Add Laradock** next to your code: `git clone https://github.com/laradock/laradock.git && cd laradock && cp .env.example .env`
4. **Start your stack:** `docker compose up -d nginx mysql redis workspace`
5. **Import the database:** `docker compose exec -T mysql mysql -uroot -proot default < ../backup.sql`
6. **Update your app's `.env`:** Lando's Laravel recipe uses `DB_HOST=database`; change it to `DB_HOST=mysql`. Credentials are in `mysql/defaults.env` (user `default`, password `secret`).
7. Your site now answers at `http://localhost` instead of `https://my-app.lndo.site`.

See the full landscape, including DDEV, Sail, Herd and XAMPP: **[Laradock vs Others](/docs/laradock-alternatives)**. Ready to try it? **[Getting Started](/docs/getting-started)** takes about five minutes.
