---
sidebar_position: 3
slug: /cli
title: The Laradock CLI
description: The optional Laradock CLI. One command setup wizard, start your stack, enter the workspace, diagnose problems. A thin, transparent layer over plain Docker Compose with zero installation.
keywords:
  - laradock cli
  - laradock setup
  - laravel docker cli
  - docker compose wrapper
  - php development environment cli
---

The Laradock CLI is a single script that ships **inside the repo**: nothing to install, nothing to update separately. It removes the first-five-minutes friction and stays out of your way afterwards.

```bash
git clone https://github.com/laradock/laradock.git
cd laradock
./laradock setup     # interactive wizard, all defaults pre-selected
./laradock up        # start your stack
./laradock workspace # the Laradock Workspace: php, composer, node, git
```

**The contract:** the CLI is optional sugar, not a new layer of magic.

- It keeps **no state** and generates **no hidden files**; its only output is the same `.env` you would write by hand.
- Every command **prints the real `docker compose` command** before running it, so you always know what is happening and you learn Docker as you go.
- Any command it doesn't recognize is **passed straight to `docker compose`**: `./laradock logs -f nginx`, `./laradock ps`, `./laradock down` all just work.
- Plain `docker compose` remains a first-class way to use Laradock, forever. See [Two ways to use Laradock](#two-ways-to-use-laradock) below.

## Commands

| Command | What it does |
|---|---|
| `./laradock setup` | Interactive wizard: detects your framework, lets you pick your project and services from the full catalog, writes `.env`, optionally points your app's `.env` at the services. |
| `./laradock up [services]` | Starts your chosen services (stored as `LARADOCK_SERVICES` in `.env`), or exactly the ones you name. Ends with the info block. |
| `./laradock workspace` | Enters the Laradock Workspace (dev shell with php, composer, node, git) as the `laradock` user (`--root` for root). Offers to start it if stopped. |
| `./laradock info` | Shows running services, URLs, host ports, and database credentials. |
| `./laradock doctor` | Diagnoses the usual suspects: Docker running, Compose version, missing `.env`, port conflicts, shared data paths. |
| `./laradock <anything>` | Passed through to `docker compose <anything>`, unchanged. |

Flags: `--yes` (`-y`) accepts every default, for CI and scripts. `NO_COLOR` is honored. Windows: run it from WSL or Git Bash (the same environments Docker Desktop uses).

## The setup wizard

Every question is pre-answered with a sensible default; pressing Enter through all of them gives you a working stack. It detects your framework (Laravel via `artisan`, WordPress via `wp-settings.php`, Symfony, Drupal) and pre-selects it. Every question first PRINTS the full catalog (all options, grouped, in columns so you see everything that's supported at a glance), then gives you a dropdown below it to pick from (arrows to move, type to filter, enter to select). The flow: project (the whole 110-item catalog), then PHP; then the essentials as their own dropdowns (web server, database, cache - each listing every option plus a 'none' choice); then an optional multi-select to add any of the ~90 other services (search, queues, AI, mail, monitoring, admin tools, ...); then a review screen where you can change any answer before anything is written. Pure bash, no dependencies, identical on every machine.

```
  Laradock setup
  ─────────────────────────────────────────────
  ✓ Docker running · Compose v2.39 (needs 2.20+)
  ✓ Detected: laravel  (at ../)

  Which project?  (type to filter — 100+ supported, grouped by type)
  search: shop
  E-commerce
    → prestashop
      shopware
  PHP version    [8.4]
  Web server     [nginx]      (arrow keys or j/k)
  Database       [mysql]
  Cache          [redis]
  Extras         [ ] phpmyadmin  [ ] mailpit  ...   (space toggles)
  Project name   [my-app]
  App path       [../]

  Review your choices:
    1) Project type   laravel
    2) PHP version    8.4
    ...
  Enter = apply · 1-8 = change that answer · q = quit
```

Nothing is written until you confirm the review screen. When it finishes, it offers to point your app's `.env` at the services and to **start your stack right there**, so a first run can be just `./laradock setup`.

What it writes into `.env` (and nothing else):

- `COMPOSE_PROJECT_NAME` and `DATA_PATH_HOST`, **unique per project**, so running several Laradock projects on one machine never mixes containers or database files.
- `PHP_VERSION`, `APP_CODE_PATH_HOST`, and `LARADOCK_SERVICES` (your default service set for `./laradock up`).
- Everything else keeps its shipped default from each service's [`defaults.env`](/docs/getting-started#how-laradock-configuration-works).

### Pointing your app at the services

The most common first-run failure in any Docker setup is the app's own `.env` still saying `DB_HOST=127.0.0.1`. The wizard offers to fix that: it shows you the exact changes first, backs up your file to `.env.bak.laradock`, and tags every line it writes with `# set by laradock`:

```
  Point your app's .env at these services?
    DB_CONNECTION=sqlite  →  DB_CONNECTION=mysql
    + DB_HOST=mysql
    REDIS_HOST=127.0.0.1  →  REDIS_HOST=redis
  Apply (original backed up to .env.bak.laradock)? [Y/n]
```

If you later edit a tagged line yourself, the wizard **never touches it again**; your value wins permanently. Decline the prompt and nothing in your app is ever modified.

## Day-2: changing things

- **Change any setting:** add or edit the line in `.env` (it beats every default), then rebuild if it is a build-time setting: `./laradock build php-fpm`. Or simply re-run `./laradock setup`; it reads your current values as the new defaults.
- **Add a service later:** `./laradock up mailpit` (100+ available; the folder name is the service name).
- **See what's running and how to connect:** `./laradock info`.
- **Something's wrong:** `./laradock doctor`, then `./laradock logs <service>`.

## Two ways to use Laradock

Both are first-class, both use the exact same files, and you can switch between them any time (even mid-project):

| | **Convenient: the CLI** | **Full control: plain Docker Compose** |
|---|---|---|
| Setup | `./laradock setup` | `cp .env.example .env`, edit as needed |
| Start | `./laradock up` | `docker compose up -d nginx mysql redis workspace` |
| Enter workspace | `./laradock workspace` | `docker compose exec workspace bash` |
| Best for | Getting productive in 2 minutes | Knowing and owning every detail |

The CLI is a few hundred lines of readable bash sitting in the repo root; open it and see exactly what it does. That transparency is the point: unlike other tools' wrappers, there is nothing underneath except the Docker Compose files you already have full access to.
