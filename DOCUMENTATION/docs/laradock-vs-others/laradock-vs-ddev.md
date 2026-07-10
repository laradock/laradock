---
slug: /laradock-vs-ddev
title: Laradock vs DDEV
description: DDEV vs Laradock side by side. Set up the same Laravel project with both tools, compare the commands, services, PHP version switching, and find out which local PHP environment fits you.
keywords:
  - laradock vs ddev
  - ddev vs laradock
  - ddev alternative
  - ddev laravel setup
  - ddev tutorial
  - php docker development environment
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

## What is DDEV?

[DDEV](https://ddev.com/) is a free, open-source command-line tool for running local PHP development environments in Docker. You install one binary, run `ddev config` and `ddev start`, and it generates and manages all the Docker containers for you behind the scenes, database, web server, PHP, the works, without you writing or seeing a Dockerfile.

It is popular in the Drupal, WordPress, and TYPO3 communities, and works with Laravel too. This page compares it to Laradock, which takes the opposite approach: instead of a tool that generates Docker for you, Laradock gives you the Docker files themselves, already written.

*Same goal, two philosophies: DDEV generates and hides the Docker machinery behind a CLI; Laradock hands you the Docker machinery pre-wired and gets out of the way. This page sets up the same Laravel project with both, honestly.*

**TL;DR:** pick [DDEV](https://ddev.com/) if you run many similar CMS projects and never want to see a Dockerfile. Pick Laradock if you want to see (and own) everything, need services DDEV has no add-on for, or want your Docker knowledge to transfer beyond the tool.

## Setting up a Laravel app with DDEV

DDEV is a Go binary you install first (Homebrew, installer script, or package manager). Then:

```bash
mkdir my-app && cd my-app
ddev config --project-type=laravel --docroot=public
ddev start -y
ddev composer create-project laravel/laravel
ddev launch
```

Your site is live at `https://my-app.ddev.site` with trusted HTTPS. Need Redis?

```bash
ddev add-on get ddev/ddev-redis
ddev restart
```

Change PHP version:

```bash
ddev config --php-version=8.4 && ddev restart
```

Day to day you talk to the tool: `ddev ssh`, `ddev artisan`, `ddev composer`, `ddev import-db`. The actual compose files are generated into `.ddev/` and regenerated on every start; they are not yours to edit directly.

## The same thing with Laradock

Laradock is a git clone; there is nothing to install:

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

Then, inside the workspace: `composer create-project laravel/laravel .`

Your site is live at `http://localhost`. Redis was one word in the `start` command; the same is true for 100+ other services (`./laradock start ollama`, `rabbitmq`, `elasticsearch`, ...).

Change PHP version: set `PHP_VERSION=8.4` in `.env`, then `./laradock rebuild php-fpm workspace` (or `docker compose build php-fpm workspace`).

Prefer a guided start? `./laradock setup` (the optional, zero-install [CLI](/docs/cli)) asks the same three-questions-style wizard, then prints every real command it runs.

Day to day you talk to Docker itself: `./laradock enter workspace`, `./laradock logs mysql`, plain `artisan` and `composer` inside the workspace. Every file involved (`nginx/compose.yml`, `php-fpm/Dockerfile`, ...) is readable and permanently editable.

## Side by side

| | **DDEV** | **Laradock** |
|---|---|---|
| Install | ddev binary | nothing (git clone) |
| First run | `ddev config` + `ddev start` | `./laradock setup` + `./laradock up` (or plain `docker compose`) |
| URLs | `https://my-app.ddev.site` automatic | `http://localhost` (or wire Traefik/Caddy yourself) |
| HTTPS | Automatic, trusted | Manual (Caddy/Traefik/certbot services included) |
| Services | ~50 curated add-ons | 100+ shipped folders (incl. Kafka, ClickHouse, Ollama, GitLab) |
| Docker files | Generated, hidden, regenerated | Plain files you own and edit |
| Commands | `ddev *` vocabulary | standard `docker compose *` |
| Multi-project isolation | Automatic per project | Manual (`COMPOSE_PROJECT_NAME` + `DATA_PATH_HOST` per project) |
| Frameworks | CMS-focused presets (Drupal, TYPO3, WordPress, Laravel) | Any PHP project, framework-agnostic |
| Skills you build | DDEV-specific | Transferable Docker |

## Choose DDEV if...

- You juggle many similar CMS sites (Drupal, TYPO3, WordPress agency work) and want identical, isolated environments with zero Docker exposure.
- Automatic HTTPS and per-project domains matter more to you than seeing how they work.
- You are happy inside a curated add-on ecosystem.

## Choose Laradock if...

- You want full control: every Dockerfile, every config, yours to read and change.
- Your stack goes beyond the add-on registry (message brokers, search clusters, local LLMs, monitoring).
- You want to learn real Docker while you work, and keep those skills in production.
- You do not want to install or trust another binary between you and your containers.

## Already on DDEV? Migrating takes minutes

1. **Export your database** while DDEV still runs: `ddev export-db --file=backup.sql.gz && gunzip backup.sql.gz`
2. **Stop DDEV:** `ddev stop` (keep the `.ddev/` folder until you are confident; nothing conflicts).
3. **Add Laradock** next to your code: `git clone https://github.com/laradock/laradock.git && cd laradock && cp .env.example .env`
4. **Start your stack:** `./laradock start nginx mysql redis workspace` (or `docker compose up -d nginx mysql redis workspace`)
5. **Import the database:** `./laradock exec -T mysql mysql -uroot -proot default < ../backup.sql` (or use phpMyAdmin: `./laradock start phpmyadmin`, then `localhost:8081`).
6. **Update your app's `.env`:** DDEV's `DB_HOST=db` becomes `DB_HOST=mysql`, credentials are in `mysql/defaults.env` (user `default`, password `secret` by default).
7. Your site now answers at `http://localhost` instead of `https://my-app.ddev.site`.

## Frequently Asked Questions

### Is DDEV free?

Yes, DDEV is free and open-source (BSD-3 license). There is no paid tier; hosting, if you use DDEV's optional add-ons for it, is billed separately by whichever provider you choose.

### Does DDEV require Docker?

Yes. DDEV is a CLI that generates and drives Docker Compose configurations behind the scenes; you still need Docker Desktop (or Colima/OrbStack) installed and running.

### Can I use DDEV with Laravel?

Yes, `laravel` is one of DDEV's built-in project types (`ddev config --project-type=laravel`), alongside CMS-focused types like WordPress, Drupal, and TYPO3.

### Can I edit DDEV's generated Docker files?

Not directly and expect it to stick: files under `.ddev/` are regenerated by DDEV and files it manages in your app (like `wp-config-ddev.php`) carry a `#ddev-generated` marker; DDEV rewrites anything still carrying that marker on every start. Delete the marker line to make a file permanently yours.

### Is DDEV better than Laradock?

Neither is strictly better; they optimize for different things. DDEV optimizes for zero-Docker-exposure convenience with automatic HTTPS and curated add-ons. Laradock optimizes for full transparency and the largest ready-made service catalog. See the [full comparison](/docs/laradock-alternatives) for a breakdown by use case.

See the full landscape, including Sail, Herd, Lando and XAMPP: **[Laradock vs Others](/docs/laradock-alternatives)**. Ready to try it? **[Getting Started](/docs/getting-started)** takes about five minutes.
