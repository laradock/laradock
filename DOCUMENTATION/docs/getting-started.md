---
sidebar_position: 2
title: Getting Started
description: Install Laradock and get a full Dockerized PHP stack running in minutes. Step-by-step setup for new and existing projects, single or multiple apps, on Linux, macOS, and Windows.
keywords:
  - laradock installation
  - laradock setup
  - install laradock
  - docker php setup
  - laravel docker install
---

This guide gets Laradock running for your project. The fastest path is the **Laradock CLI**, a short wizard that sets everything up for you, so start there. If you would rather wire things up by hand with plain `docker compose`, jump to [Manual setup](#manual-setup) at the bottom, it is meant for advanced users who want full control.

:::tip[Let AI use it]
This repo ships agent instructions ([`AGENTS.md`](https://github.com/laradock/laradock/blob/master/AGENTS.md), plus matching rule files for [Claude Code](https://claude.com/claude-code), [Gemini CLI](https://github.com/google-gemini/gemini-cli), [Cursor](https://cursor.com), [Cline](https://cline.bot), and [Windsurf](https://windsurf.com)), so any of them can read the layout and run the whole setup for you. Clone Laradock into your project, open it in your agent, and ask: *"Set up Laradock for this project."*
:::

**Building something specific?** Jump straight to a guide tailored to the most popular platforms:

<div className="install-grid">
  <a href="/docs/laravel-on-docker">Laravel</a>
  <a href="/docs/wordpress-on-docker">WordPress</a>
  <a href="/docs/symfony-on-docker">Symfony</a>
  <a href="/docs/drupal-on-docker">Drupal</a>
  <a href="/docs/magento-on-docker">Magento</a>
  <a href="/docs/joomla-on-docker">Joomla</a>
  <a href="/docs/woocommerce-on-docker">WooCommerce</a>
  <a href="/docs/moodle-on-docker">Moodle</a>
  <a href="/docs/codeigniter-on-docker">CodeIgniter</a>
  <a href="/docs/nextcloud-on-docker">Nextcloud</a>
  <a href="/docs/prestashop-on-docker">PrestaShop</a>
  <a href="/docs/yii-on-docker">Yii</a>
</div>

Not one of these? Browse the [full list of 100+ supported projects](/docs/Intro#supported-php-projects), then follow its guide. Otherwise the generic steps below work for any PHP app.

## Requirements

- [Git](https://git-scm.com/downloads)
- [Docker](https://www.docker.com/products/docker-desktop/) (with Docker Compose v2.20 or newer)

## Get started

1 - Clone Laradock inside your PHP project (or anywhere, if you don't have one yet):

```bash
git clone https://github.com/laradock/laradock.git
cd laradock
```

2 - Start your stack:

```bash
./laradock start
```

On the **first run**, `start` walks you through a short setup wizard: it detects your framework and lets you pick your project, PHP version, and services (web server, database, cache), everything pre-answered, then points your app's `.env` at those services and starts the stack. After that, `./laradock start` just starts. Re-run the wizard any time with `./laradock setup`.

3 - Enter the workspace, a dev shell with `php`, `composer`, `node`, and `git` inside:

```bash
./laradock workspace
```

4 - Open [http://localhost](http://localhost). Done.

:::tip[Where do I run `artisan`, `composer`, `npm`?]
Inside the workspace container, not on your machine. Enter it once with `./laradock workspace` and run commands from there, or prefix a single one: `./laradock exec workspace php artisan migrate`.
:::

The CLI hides nothing: it prints every real `docker compose` command it runs, keeps no state, and only ever writes your `.env`. Unknown commands pass straight through (`./laradock logs -f nginx` runs `docker compose logs -f nginx`). Full reference: [The Laradock CLI](/docs/cli).

## How it works

### How Laradock configuration works

- Your `.env` (created on first run, or `cp .env.example .env` by hand) holds the **shared settings**: paths, PHP version, project name.
- Each service keeps its **own settings** pre-filled in its folder: `mysql/defaults.env`, `nginx/defaults.env`, and so on. You never need to copy or edit those files, they work out of the box.
- To change **any** setting, shared or per-service, add that line to your `.env` with your value. **Your `.env` always wins over every `defaults.env`.** For example, to run MySQL on another port, add `MYSQL_PORT=3307` to your `.env`.
- To discover what a service lets you configure, open its folder's `defaults.env`, it's a short, readable list.
- **Upgrading from an older Laradock?** Your existing full `.env` keeps working exactly as before, no changes needed.

:::warning One exception: database passwords are set on first run only
`MYSQL_PASSWORD`, `POSTGRES_PASSWORD`, and the other database credentials are applied the **first time** that database starts, when it creates its data files on disk. Changing them in `.env` later (even with `./laradock rebuild`) does **not** update an existing database; the old password keeps working. To change a database password for real, either run the change inside the database itself (for example `ALTER USER`), or delete that service's data folder under `DATA_PATH_HOST` so it initializes fresh (this erases that database's data).
:::

### How the repository is organized

One folder per service, and everything about a service lives in its folder:

```
laradock/
├── docker-compose.yml      # the service catalog: shared networks/volumes + include list
├── .env.example            # shared settings template (copy to .env)
├── mysql/
│   ├── compose.yml         # mysql's container definition
│   ├── defaults.env        # mysql's settings, pre-filled
│   └── Dockerfile          # mysql's image
├── nginx/
│   ├── compose.yml
│   ├── defaults.env
│   ├── Dockerfile
│   └── sites/              # your site configs
└── ...                     # ~100 more services, same pattern
```

So when you want to:

| You want to... | Edit... |
|---|---|
| Change any setting (port, version, password, flag) | your `.env` (add one line, it wins) |
| See what a service lets you configure | `<service>/defaults.env` (read-only for you) |
| Change a container's structure (mounts, links, ...) | `<service>/compose.yml` |
| Change how an image is built | `<service>/Dockerfile`, then rebuild |

The root `docker-compose.yml` pulls every service in via Compose `include`, which requires Docker Compose v2.20 or newer. Every top-level folder in the repo is a runnable container, so the folder list is always the up-to-date list of [available services](/docs/Intro#supported-services).

## Running multiple projects

By default each container is named after the current folder (e.g. `laradock_workspace_1`), so one Laradock serves one project. To run more than one Laradock on the same machine, set **both** of these per project in your `.env`, or the projects will share the same databases on disk:

```env
COMPOSE_PROJECT_NAME=myproject               # separates the containers
DATA_PATH_HOST=~/.laradock/data-myproject    # separates the stored data
```

To serve several sites from a **single** Laradock instead, point `APP_CODE_PATH_HOST` at the parent folder and add one web-server config per site:

```env
APP_CODE_PATH_HOST=../
```

For **Nginx** add configs under `nginx/sites`, for **Apache2** under `apache2/sites` (each ships `*.conf.example` samples to copy). Then map the domains in your `hosts` file:

```
127.0.0.1  project-1.test
127.0.0.1  project-2.test
```

Don't use `.dev` for local domains (browsers force HTTPS on it). Use `.localhost`, `.invalid`, `.test`, or `.example` instead.

## Manual setup (advanced, full control) {#manual-setup}

Prefer to skip the CLI? Everything it does, you can do by hand with plain `docker compose`, same files, same result.

1 - Copy the shared settings template:

```bash
cp .env.example .env
```

Set `APP_CODE_PATH_HOST` to your project path (for example `../project-z/`, or `../` to serve [multiple projects](#running-multiple-projects)). See [How Laradock configuration works](#how-laradock-configuration-works) for the full model.

2 - Start the containers you need, for example NGINX (web server) and MySQL (database):

```bash
docker compose up -d nginx mysql
```

Web-server containers (`nginx`, `apache2`, ...) depend on `php-fpm` and start it automatically, so you don't list it explicitly. Pick any combination from the [available services](/docs/Intro#supported-services).

3 - Enter the workspace to run Artisan, Composer, PHPUnit, and friends:

```bash
docker compose exec --user=laradock workspace bash
```

`--user=laradock` makes files come out owned by you, not root. On Windows PowerShell you can also enter any running container with `docker exec -it {workspace-container-id} bash`. Change the user with `WORKSPACE_PUID` / `WORKSPACE_PGID` in your `.env` (defaults in `workspace/defaults.env`).

4 - Point your app at the database. In your PHP project's `.env`, set the host to the service name:

```env
DB_HOST=mysql
```

Use Laradock's default DB credentials from `mysql/defaults.env`, or override them in your `.env` and rebuild. Installing Laravel? See [How to Install Laravel in a Docker Container](/docs/laravel-on-docker).

5 - Open [http://localhost](http://localhost) (or `http://project-1.test/` etc. if you set up multiple projects).

:::warning Upgrading from an older Laradock?
Rebuild the containers you use to avoid errors, [see how to rebuild a container](/docs/containers#build-or-rebuild-containers).
:::
