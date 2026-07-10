---
slug: /services/workspace
title: Workspace
description: The core Laradock dev shell container. Enter it to run Composer, Artisan, Node, and Git, and toggle WORKSPACE_INSTALL_* flags to add more tools.
keywords:
  - laradock workspace
  - workspace docker
  - workspace docker compose
  - laradock dev container
  - docker compose exec workspace
  - workspace install flags
---

## What is the Workspace container?

`workspace` is Laradock's general-purpose development shell, the container you `exec` into to run Composer, Artisan, Git, Node/npm, and most other CLI work against your mounted project code. It's built from the [`laradock/workspace`](https://hub.docker.com/r/laradock/workspace/tags/) base image (tagged by PHP version) and runs as a non-root `laradock` user matched to your host UID/GID, so files it creates aren't owned by root.

Unlike `php-fpm`, it's not what actually serves your app to a browser, `nginx`/`apache` talk to `php-fpm` for that. `workspace` is where you sit and type commands.

## Start the Workspace

```bash
docker compose up -d workspace
```

Most setups start it alongside a web server and database, for example:

```bash
docker compose up -d nginx mysql workspace
```

## Enter it

```bash
docker compose exec workspace bash
```

You land in `/var/www` (your project, mounted from `APP_CODE_PATH_HOST`) as the `laradock` user.

## Stop the Workspace

```bash
docker compose stop workspace
```

## What's installed by default

A handful of `WORKSPACE_INSTALL_*` / `WORKSPACE_*` flags in `workspace/defaults.env` default to `true` (everything else defaults to `false`):

| Variable | Default | What it does |
|---|---|---|
| `WORKSPACE_INSTALL_NODE` | `true` | Node.js via NVM (`WORKSPACE_NODE_VERSION=node` tracks latest). |
| `WORKSPACE_INSTALL_YARN` | `true` | Yarn package manager. |
| `WORKSPACE_INSTALL_NPM_GULP` | `true` | Gulp CLI, global npm install. |
| `WORKSPACE_INSTALL_NPM_VUE_CLI` | `true` | Vue CLI, global npm install. |
| `WORKSPACE_INSTALL_PHPREDIS` | `true` | PHP Redis extension (for CLI scripts, Artisan, etc.). |
| `WORKSPACE_INSTALL_AST` | `true` | PHP AST extension. |
| `WORKSPACE_INSTALL_MEMCACHED` | `true` | PHP Memcached extension. |
| `WORKSPACE_INSTALL_DNSUTILS` | `true` | `dig`/`nslookup` and friends. |
| `WORKSPACE_INSTALL_JDK` | `true` | Java Development Kit. |
| `WORKSPACE_COMPOSER_GLOBAL_INSTALL` | `true` | Runs `composer global install` at build time. |
| `WORKSPACE_COMPOSER_VERSION` | `2` | Composer major version (`1`, `2`, `2.2`, or a specific version string). |

## The `WORKSPACE_INSTALL_*` toggle pattern

Everything else, well over 60 tools and PHP extensions, follows the same on/off pattern in `workspace/defaults.env`: `WORKSPACE_INSTALL_<THING>=false`. Flip one to `true` in your `.env`, then rebuild:

```env
WORKSPACE_INSTALL_XDEBUG=true
WORKSPACE_INSTALL_DRUSH=true
WORKSPACE_INSTALL_WP_CLI=true
```

```bash
docker compose build workspace
docker compose up -d workspace
```

These flags cover things like Xdebug/pcov/phpdbg, database clients (MySQL, Postgres, MSSQL), extensions (LDAP, SOAP, XSL, IMAP, SMB, Mongo, AMQP, Cassandra, ZMQ, Gearman, Swoole, Phalcon), framework tooling (Drush, Drupal Console, WP-CLI, Laravel Envoy, Laravel Installer, Symfony), package managers (pnpm, Bower, Angular CLI, npm-check-updates), and misc utilities (ImageMagick, FFmpeg, wkhtmltopdf, Terraform, Docker CLI, GitHub CLI, MinIO client, GNU Parallel, Supervisor, Oh My Zsh).

See the sections below for setup instructions on individual tools, and the **[PHP-FPM guide](/docs/services/php-fpm)** for extension-specific install/config guides (Xdebug, pcov, phpdbg, YAML, rdkafka, ionCube, etc.) that apply to `workspace` as well as `php-fpm`.

## Published ports

`workspace/compose.yml` exposes several dev-server ports on the host, all overridable in `.env`:

| Variable | Default | Used for |
|---|---|---|
| `WORKSPACE_SSH_PORT` | `2222` | SSH into the container (if `WORKSPACE_INSTALL_WORKSPACE_SSH=true`). |
| `WORKSPACE_BROWSERSYNC_HOST_PORT` | `3000` | Browsersync. |
| `WORKSPACE_BROWSERSYNC_UI_HOST_PORT` | `3001` | Browsersync UI. |
| `WORKSPACE_VUE_CLI_SERVE_HOST_PORT` | `8080` | `vue-cli-service serve`. |
| `WORKSPACE_VUE_CLI_UI_HOST_PORT` | `8001` | Vue CLI UI. |
| `WORKSPACE_ANGULAR_CLI_SERVE_HOST_PORT` | `4200` | Angular CLI dev server. |
| `WORKSPACE_VITE_PORT` | `5173` | Vite dev server. |

## User and permissions

`WORKSPACE_PUID`/`WORKSPACE_PGID` (default `1000`/`1000`) set the UID/GID of the `laradock` user inside the container. Match these to your host user if you're on Linux and hitting file-ownership mismatches on files created inside the container.

## Change the PHP-CLI version

The PHP-CLI lives in the Workspace container and is used only for Artisan and Composer, it does not serve your application code (that's PHP-FPM's job), so changing it is usually optional.

1. In `.env`, set `PHP_VERSION` to the version you want:
   ```dotenv
   PHP_VERSION=8.1
   ```
2. Rebuild the Workspace:
   ```bash
   docker compose build workspace
   ```

## Install the rdkafka extension

Needed for `composer install` when your dependencies require Kafka.

1. In `.env`, set `WORKSPACE_INSTALL_RDKAFKA` to `true`.
2. Rebuild:
   ```bash
   docker compose build workspace
   ```

To install rdkafka for the PHP-FPM container instead (the one that actually serves your app), see [Install the rdkafka extension](/docs/services/php-fpm#install-the-rdkafka-extension) on the PHP-FPM guide.

## Install the AST extension

AST exposes the abstract syntax tree generated by PHP 7+. It's required by tools such as [Phan](https://github.com/phan/phan), a static analyzer. `WORKSPACE_INSTALL_AST` defaults to `true`, so it's already installed unless you've turned it off.

1. In `.env`, set `WORKSPACE_INSTALL_AST` to `true`.
2. Rebuild:
   ```bash
   docker compose build workspace
   ```

> To pin a specific version, set `WORKSPACE_AST_VERSION` before rebuilding.

## Node.js & NVM

1. In `.env`, set `WORKSPACE_INSTALL_NODE` to `true`.
2. Rebuild:
   ```bash
   docker compose build workspace
   ```

> A `.npmrc` is included in the `workspace` folder and is copied into the root and laradock users' home directories on build, in case you need global npm config.

## Package managers

### pnpm

pnpm stores a single copy of each package version on disk and hard-links it into each project's `node_modules`, saving large amounts of space and speeding up installs. More on the [pnpm motivation](https://pnpm.js.org/en/motivation).

1. In `.env`, set both `WORKSPACE_INSTALL_NODE` and `WORKSPACE_INSTALL_PNPM` to `true`.
2. Rebuild:
   ```bash
   docker compose build workspace
   ```

### Yarn

1. In `.env`, set both `WORKSPACE_INSTALL_NODE` and `WORKSPACE_INSTALL_YARN` to `true`.
2. Rebuild:
   ```bash
   docker compose build workspace
   ```

### npm-check-updates

[npm-check-updates](https://www.npmjs.com/package/npm-check-updates) upgrades your `package.json` dependencies to the latest versions.

1. In `.env`, make sure `WORKSPACE_INSTALL_NODE` is `true`.
2. Set `WORKSPACE_INSTALL_NPM_CHECK_UPDATES_CLI` to `true`.
3. Rebuild:
   ```bash
   docker compose build workspace
   ```

## Frontend build tool CLIs

### Gulp

1. In `.env`, set `WORKSPACE_INSTALL_NPM_GULP` to `true`.
2. Rebuild:
   ```bash
   docker compose build workspace
   ```

### Bower

> Legacy. Bower is deprecated, prefer npm, Yarn, or pnpm for new projects.

1. In `.env`, set `WORKSPACE_INSTALL_NPM_BOWER` to `true`.
2. Rebuild:
   ```bash
   docker compose build workspace
   ```

### Vue CLI

1. In `.env`, set `WORKSPACE_INSTALL_NPM_VUE_CLI` to `true`.
2. Optionally change the ports: `WORKSPACE_VUE_CLI_SERVE_HOST_PORT` (default `8080`) and `WORKSPACE_VUE_CLI_UI_HOST_PORT` (default `8001`).
3. Rebuild:
   ```bash
   docker compose build workspace
   ```

Run `vue serve` or `vue ui` from the Workspace, then browse to the matching port.

### Angular CLI

1. In `.env`, set `WORKSPACE_INSTALL_NPM_ANGULAR_CLI` to `true`.
2. Rebuild:
   ```bash
   docker compose build workspace
   ```

## Composer extras

### Global Composer install

Install your global Composer requirements at build time so they're available in the container afterward.

1. In `.env`, set `WORKSPACE_COMPOSER_GLOBAL_INSTALL` to `true`.
2. Add your dependencies to `workspace/composer.json`.
3. Rebuild:
   ```bash
   docker compose build workspace
   ```

### Prestissimo

> Legacy. [Prestissimo](https://github.com/hirak/prestissimo) parallelized downloads for **Composer 1 only** and is abandoned. Composer 2 (Laradock's default) already downloads in parallel, so you almost certainly don't need this.

1. Enable Global Composer install (steps 1-2 above).
2. Add `"hirak/prestissimo": "^0.3"` to `workspace/composer.json`.
3. Rebuild:
   ```bash
   docker compose build workspace
   ```

## Deployment & task runners

### Deployer

> A deployment tool for PHP.

1. In `.env`, set `WORKSPACE_INSTALL_DEPLOYER` to `true`.
2. Rebuild:
   ```bash
   docker compose build workspace
   ```

See the [Deployer documentation](https://deployer.org/docs/).

### Laravel Envoy

> A task runner.

1. In `.env`, set `WORKSPACE_INSTALL_LARAVEL_ENVOY` to `true`.
2. Rebuild:
   ```bash
   docker compose build workspace
   ```

See the [Laravel Envoy documentation](https://laravel.com/docs/envoy).

## System utilities

### Linuxbrew

[Linuxbrew](http://linuxbrew.sh) is the Linux port of Homebrew.

1. In `.env`, set `WORKSPACE_INSTALL_LINUXBREW` to `true`.
2. Rebuild:
   ```bash
   docker compose build workspace
   ```

### Supervisor

[Supervisor](http://supervisord.org/) monitors and controls long-running processes on UNIX-like systems.

1. In `.env`, set both `WORKSPACE_INSTALL_SUPERVISOR` and `WORKSPACE_INSTALL_PYTHON` to `true`.
2. Create a worker config in `php-worker/supervisord.d/` by copying `laravel-worker.conf.example`.
3. Rebuild:
   ```bash
   docker compose build workspace
   ```

### GNU Parallel

[GNU Parallel](https://www.gnu.org/software/parallel/parallel_tutorial.html) runs multiple processes concurrently from the command line.

1. In `.env`, set `WORKSPACE_INSTALL_GNU_PARALLEL` to `true`.
2. Rebuild:
   ```bash
   docker compose build workspace
   ```

### dnsutils

1. In `.env`, set both flags to `true`:
   - `WORKSPACE_INSTALL_DNSUTILS`
   - `PHP_FPM_INSTALL_DNSUTILS`
2. Rebuild:
   ```bash
   docker compose build workspace php-fpm
   ```

## Media & document tools

### FFmpeg

1. In `.env`, set `WORKSPACE_INSTALL_FFMPEG` to `true`.
2. Rebuild:
   ```bash
   docker compose build workspace
   ```

:::warning
If you queue conversions, also install FFmpeg in the `php-worker` and `php-fpm` containers (same flag pattern), otherwise the `php-ffmpeg` binary errors out.
:::

### BBC audiowaveform

[audiowaveform](https://github.com/bbc/audiowaveform) generates waveform data from MP3, WAV, FLAC, or Ogg Vorbis files, for rendering visual waveforms.

1. In `.env`, set `WORKSPACE_INSTALL_AUDIOWAVEFORM` to `true`.
2. Rebuild:
   ```bash
   docker compose build workspace
   ```

:::warning
If you queue processing, also install it in the `php-worker`, `laravel-horizon`, and `php-fpm` containers (same flag pattern), otherwise the `audiowaveform` binary errors out.
:::

### wkhtmltopdf

[wkhtmltopdf](https://wkhtmltopdf.org/) renders a PDF from HTML.

1. In `.env`, set `WORKSPACE_INSTALL_WKHTMLTOPDF` to `true`.
2. Rebuild:
   ```bash
   docker compose build workspace
   ```

:::warning
Also install it in the `php-fpm` container (same flag pattern), otherwise the `wkhtmltopdf` binary errors out.
:::

### poppler-utils & antiword

[poppler-utils](https://packages.debian.org/sid/poppler-utils) is a set of PDF command-line tools (info, text/image extraction, format conversion, signature verification, and more). It's commonly paired with `antiword`, so Laradock installs both together when the flag is set.

1. In `.env`, set the flag to `true` for each container you need it in: `WORKSPACE_INSTALL_POPPLER_UTILS`, `PHP_FPM_INSTALL_POPPLER_UTILS`, `PHP_WORKER_INSTALL_POPPLER_UTILS`, `LARAVEL_HORIZON_INSTALL_POPPLER_UTILS`.
2. Rebuild the affected containers:
   ```bash
   docker compose build workspace php-fpm php-worker laravel-horizon
   ```

### Graphviz

[Graphviz](https://graphviz.org/) renders graphs from text descriptions. Enable it in whichever container needs it:

| Container | Flag | Rebuild |
| --------- | ---- | ------- |
| Workspace | `WORKSPACE_INSTALL_GRAPHVIZ` | `docker compose build workspace` |
| PHP-FPM (most common) | `PHP_FPM_INSTALL_GRAPHVIZ` | `docker compose build php-fpm` |
| PHP-Worker | `PHP_WORKER_INSTALL_GRAPHVIZ` | `docker compose build php-worker` |

Set the flag to `true`, then rebuild.

## GitHub Copilot CLI

> Requires GitHub Copilot access.

1. In `.env`, set `WORKSPACE_INSTALL_GITHUB_CLI` to `true`.
2. Rebuild and start the Workspace:
   ```bash
   docker compose build workspace
   docker compose up -d workspace
   ```
3. Enter the Workspace:
   ```bash
   docker compose exec workspace bash
   ```
4. Authenticate, then install the Copilot extension:
   ```bash
   gh auth login
   gh extension install github/gh-copilot
   ```

## Shell & terminal

### Oh My Zsh

[Oh My Zsh](https://ohmyz.sh/) manages your [Zsh](https://en.wikipedia.org/wiki/Z_shell) configuration. Laradock wires it up with the [Laravel autocomplete plugin](https://github.com/ohmyzsh/ohmyzsh/tree/master/plugins/laravel).

1. In `.env`, set `SHELL_OH_MY_ZSH` to `true`.
2. Rebuild:
   ```bash
   docker compose build workspace
   ```
3. Use it:
   ```bash
   docker compose exec --user=laradock workspace zsh
   ```

> Configure it by editing `/home/laradock/.zshrc` in the running container.

**Optional plugins:**

- **Autosuggestions**: set `SHELL_OH_MY_ZSH_AUTOSUGESTIONS` to `true`, then rebuild. Suggests commands as you type, from history and completions ([zsh-autosuggestions](https://github.com/zsh-users/zsh-autosuggestions)).
- **Bash aliases**: set `SHELL_OH_MY_ZSH_ALIASES` to `true`, then rebuild, to load Laradock's `aliases.sh` into Zsh.

### Git Bash prompt

A bash prompt showing the current branch, diff with remote, and counts of staged/changed files.

1. In `.env`, set `WORKSPACE_INSTALL_GIT_PROMPT` to `true`.
2. Rebuild:
   ```bash
   docker compose build workspace
   ```

> Customize it by editing `workspace/gitprompt.sh` and rebuilding. See the [bash-git-prompt repo](https://github.com/magicmonty/bash-git-prompt).

### Terminal aliases

On startup, Laradock copies `workspace/aliases.sh` into the container and sources it from `~/.bashrc`. Edit that file to add your own aliases or function macros.

### Powerline

1. In `.env`, set both `WORKSPACE_INSTALL_POWERLINE` and `WORKSPACE_INSTALL_PYTHON` to `true` (Powerline requires Python).
2. Rebuild:
   ```bash
   docker compose build workspace
   ```

## Common issues

- **A tool you enabled isn't there.** `WORKSPACE_INSTALL_*` flags only take effect on build, not on a plain restart: `docker compose build workspace && docker compose up -d workspace`.
- **Files created in the container are owned by the wrong user on your host.** Set `WORKSPACE_PUID`/`WORKSPACE_PGID` to match your host user's `id -u`/`id -g`, then rebuild.
- **Composer/npm installs are painfully slow.** Set `WORKSPACE_COMPOSER_REPO_PACKAGIST` or `WORKSPACE_NPM_REGISTRY` to a closer mirror, or `CHANGE_SOURCE=true` if you're behind the Great Firewall (switches apt sources to a Tsinghua mirror).
- **Xdebug and Blackfire both enabled, neither works right.** They can't coexist in the same PHP process, the build skips the Blackfire probe entirely when `WORKSPACE_INSTALL_XDEBUG=true`.

---

Need the container that actually runs your PHP app? See the **[PHP-FPM guide](/docs/services/php-fpm)**. New to Laradock? Start at **[Getting Started](/docs/getting-started)**.
