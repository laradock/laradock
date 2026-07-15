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

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

## What is the Workspace container?

`workspace` is Laradock's general-purpose development shell, the container you `exec` into to run Composer, Artisan, Git, Node/npm, and most other CLI work against your mounted project code. It's built from the [`laradock/workspace`](https://hub.docker.com/r/laradock/workspace/tags/) base image (tagged by PHP version) and runs as a non-root `laradock` user matched to your host UID/GID, so files it creates aren't owned by root.

Unlike `php-fpm`, it's not what actually serves your app to a browser, `nginx`/`apache` talk to `php-fpm` for that. `workspace` is where you sit and type commands.

## Enter the Workspace

The fastest path in is the dedicated shortcut, it starts `workspace` for you if it isn't running yet (equivalent to the [Start the Workspace](#start-the-workspace) command below), then drops you in as the non-root `laradock` user:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock workspace
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose exec -u laradock workspace bash
```

</TabItem>
</Tabs>

You land in `/var/www` (your project, mounted from `APP_CODE_PATH_HOST`) as the `laradock` user. Pass `--root` (CLI only: `./laradock workspace --root`) to land as `root` instead, useful for one-off `apt-get` installs.

`ws` and `shell` also work as shorthands for `./laradock workspace`.

## Start the Workspace

If you'd rather start it explicitly, without entering a shell, for example alongside other services:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock start workspace
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose up -d workspace
```

</TabItem>
</Tabs>

Name any other services alongside it to start them together, for example `./laradock start nginx mysql workspace`.

## Stop the Workspace

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock stop workspace
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose stop workspace
```

</TabItem>
</Tabs>

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

## Pick your tools with the CLI

The wizard asks about workspace tools directly, so you don't have to know a flag name to find a tool. Step 8 of `./laradock setup` is a searchable, grouped picker over every tool below, with what you already have pre-ticked:

```bash
./laradock setup
```

```
  ----------------------------------------------------------------------
  Step 8 of 10  Workspace tools
  ----------------------------------------------------------------------
  The workspace is your dev shell: the container you run php, composer, artisan,
  npm and git inside (./laradock workspace). These are the tools baked into it.

  Debug & testing
    [ ] xdebug
    [x] pcov
  Node & frontend
    [x] node
  ...
  type to filter · arrows move · space toggles on/off · enter when done
```

Type to filter (`xde` finds `xdebug`), space to toggle, enter to accept. Only the tools you actually change are written to your `.env`, so it stays a short diff of your choices rather than a copy of all ~87 flags. When you change something, the CLI reminds you to rebuild.

It's safe to re-run `./laradock setup` any time to add or remove tools later; your current answers are pre-filled.

## The `WORKSPACE_INSTALL_*` toggle pattern

If you'd rather not use the wizard, every tool is just an on/off flag in `workspace/defaults.env`: `WORKSPACE_INSTALL_<THING>=false`. Flip one to `true` in your `.env`, then rebuild:

```env
WORKSPACE_INSTALL_XDEBUG=true
WORKSPACE_INSTALL_DRUSH=true
WORKSPACE_INSTALL_WP_CLI=true
```

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock rebuild workspace
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose build workspace
```

</TabItem>
</Tabs>

Then restart it to pick up the new build:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock restart workspace
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose up -d workspace
```

</TabItem>
</Tabs>

To turn one back off, either untick it in `./laradock setup`, or:

```bash
./laradock unset WORKSPACE_INSTALL_XDEBUG   # back to the shipped default
./laradock rebuild workspace
```

Removing a tool rebuilds the image without it. Your code and database are untouched: the workspace holds no data of its own, only tools.

## Every tool you can install

The complete list, grouped the same way the `./laradock setup` picker groups them. **On** = installed unless you turn it off. Names in the first column are what you type in the picker; the flag is what you'd set by hand.

### Debug & testing

| Tool | Flag | Default | What it does |
|---|---|---|---|
| `xdebug` | `WORKSPACE_INSTALL_XDEBUG` | off | Step debugger and profiler. See the [Xdebug + IDE guide](/docs/xdebug-ide). |
| `pcov` | `WORKSPACE_INSTALL_PCOV` | off | Fast code-coverage driver for PHPUnit (much quicker than Xdebug's). |
| `phpdbg` | `WORKSPACE_INSTALL_PHPDBG` | off | PHP's built-in interactive debugger, also usable for coverage. |
| `dusk-deps` | `WORKSPACE_INSTALL_DUSK_DEPS` | off | Chrome and the libraries Laravel Dusk needs for browser tests (amd64 only). |
| `taint` | `WORKSPACE_INSTALL_TAINT` | off | Static analysis extension that flags possible XSS in strings. |

### Node & frontend

| Tool | Flag | Default | What it does |
|---|---|---|---|
| `node` | `WORKSPACE_INSTALL_NODE` | **on** | Node.js via NVM. Version set by `WORKSPACE_NODE_VERSION`. |
| `yarn` | `WORKSPACE_INSTALL_YARN` | **on** | Yarn package manager. |
| `pnpm` | `WORKSPACE_INSTALL_PNPM` | off | pnpm package manager. |
| `npm-gulp` | `WORKSPACE_INSTALL_NPM_GULP` | **on** | Gulp task runner CLI, installed globally. |
| `npm-vue-cli` | `WORKSPACE_INSTALL_NPM_VUE_CLI` | **on** | Vue CLI, installed globally. |
| `npm-angular-cli` | `WORKSPACE_INSTALL_NPM_ANGULAR_CLI` | off | Angular CLI, installed globally. |
| `npm-bower` | `WORKSPACE_INSTALL_NPM_BOWER` | off | Bower, the legacy frontend package manager. |
| `npm-check-updates-cli` | `WORKSPACE_INSTALL_NPM_CHECK_UPDATES_CLI` | off | `ncu`, checks your `package.json` for newer versions. |

### Database clients & drivers

| Tool | Flag | Default | What it does |
|---|---|---|---|
| `mysql-client` | `WORKSPACE_INSTALL_MYSQL_CLIENT` | off | The `mysql` command, for a SQL shell or `mysqldump` from the workspace. |
| `pg-client` | `WORKSPACE_INSTALL_PG_CLIENT` | off | The `psql` command and Postgres client tools. |
| `mongo` | `WORKSPACE_INSTALL_MONGO` | off | PHP MongoDB driver. |
| `mssql` | `WORKSPACE_INSTALL_MSSQL` | off | PHP SQL Server driver (`sqlsrv`/`pdo_sqlsrv`). |
| `oci8` | `WORKSPACE_INSTALL_OCI8` | off | PHP Oracle driver. Needs the Instant Client files. |
| `cassandra` | `WORKSPACE_INSTALL_CASSANDRA` | off | PHP Cassandra driver. |
| `aerospike` | `WORKSPACE_INSTALL_AEROSPIKE` | off | PHP Aerospike driver. |
| `ssdb` | `WORKSPACE_INSTALL_SSDB` | off | PHP SSDB client. |
| `rdkafka` | `WORKSPACE_INSTALL_RDKAFKA` | off | PHP Kafka client. See [the section below](#install-the-rdkafka-extension). |
| `zookeeper` | `WORKSPACE_INSTALL_ZOOKEEPER` | off | PHP ZooKeeper client. |

### PHP extensions

| Tool | Flag | Default | What it does |
|---|---|---|---|
| `phpredis` | `WORKSPACE_INSTALL_PHPREDIS` | **on** | Redis extension, so Artisan and CLI scripts can talk to Redis. |
| `memcached` | `WORKSPACE_INSTALL_MEMCACHED` | **on** | Memcached extension. |
| `apcu` | `WORKSPACE_INSTALL_APCU` | off | In-memory user cache (APCu). |
| `amqp` | `WORKSPACE_INSTALL_AMQP` | off | AMQP extension, for RabbitMQ. |
| `gearman` | `WORKSPACE_INSTALL_GEARMAN` | off | Gearman job-queue client. |
| `event` | `WORKSPACE_INSTALL_EVENT` | off | libevent bindings for async PHP. |
| `swoole` | `WORKSPACE_INSTALL_SWOOLE` | off | Coroutine/async runtime used by Octane, Hyperf. |
| `soap` | `WORKSPACE_INSTALL_SOAP` | off | SOAP client/server. |
| `gnupg` | `WORKSPACE_INSTALL_GNUPG` | off | GnuPG encryption bindings. |
| `gmp` | `WORKSPACE_INSTALL_GMP` | off | Arbitrary-precision maths. |
| `bz2` | `WORKSPACE_INSTALL_BZ2` | off | bzip2 compression. |
| `imap` | `WORKSPACE_INSTALL_IMAP` | off | IMAP mailbox access. |
| `ldap` | `WORKSPACE_INSTALL_LDAP` | off | LDAP / Active Directory auth. |
| `mailparse` | `WORKSPACE_INSTALL_MAILPARSE` | off | Parse raw email messages. |
| `phpdecimal` | `WORKSPACE_INSTALL_PHPDECIMAL` | off | Correctly-rounded decimal maths, for money. |
| `ssh2` | `WORKSPACE_INSTALL_SSH2` | off | SSH/SFTP from PHP. |
| `xmlrpc` | `WORKSPACE_INSTALL_XMLRPC` | off | XML-RPC client/server. |
| `xsl` | `WORKSPACE_INSTALL_XSL` | off | XSLT transforms. |
| `yaml` | `WORKSPACE_INSTALL_YAML` | off | Fast YAML parsing. |
| `zmq` | `WORKSPACE_INSTALL_ZMQ` | off | ZeroMQ messaging. |
| `trader` | `WORKSPACE_INSTALL_TRADER` | off | Technical-analysis functions. |
| `xlswriter` | `WORKSPACE_INSTALL_XLSWRITER` | off | Write large Excel files quickly. |
| `v8js` | `WORKSPACE_INSTALL_V8JS` | off | Run JavaScript from PHP via V8. |
| `phalcon` | `WORKSPACE_INSTALL_PHALCON` | off | The Phalcon framework extension. |
| `ast` | `WORKSPACE_INSTALL_AST` | **on** | Exposes PHP's syntax tree. Needed by Phan and other static analysers. |
| `ioncube` | `WORKSPACE_INSTALL_IONCUBE` | off | ionCube loader for encoded PHP. Not available on PHP 8.0 or 8.4+. |

### Framework CLIs

| Tool | Flag | Default | What it does |
|---|---|---|---|
| `laravel-installer` | `WORKSPACE_INSTALL_LARAVEL_INSTALLER` | off | The `laravel new` command. |
| `laravel-envoy` | `WORKSPACE_INSTALL_LARAVEL_ENVOY` | off | Envoy task runner for remote deploys. |
| `symfony` | `WORKSPACE_INSTALL_SYMFONY` | off | The Symfony CLI. |
| `deployer` | `WORKSPACE_INSTALL_DEPLOYER` | off | Deployer, the PHP deployment tool. |
| `drush` | `WORKSPACE_INSTALL_DRUSH` | off | Drupal's command line. |
| `drupal-console` | `WORKSPACE_INSTALL_DRUPAL_CONSOLE` | off | Drupal Console. |
| `wp-cli` | `WORKSPACE_INSTALL_WP_CLI` | off | The `wp` command, for WordPress. |
| `prestissimo` | `WORKSPACE_INSTALL_PRESTISSIMO` | off | Parallel downloads for Composer 1. Pointless on Composer 2. |

### Media & documents

| Tool | Flag | Default | What it does |
|---|---|---|---|
| `imagemagick` | `WORKSPACE_INSTALL_IMAGEMAGICK` | off | Image manipulation, plus the PHP `imagick` extension. |
| `libpng` | `WORKSPACE_INSTALL_LIBPNG` | off | PNG libraries some image tools need. |
| `ffmpeg` | `WORKSPACE_INSTALL_FFMPEG` | off | Audio/video transcoding. |
| `audiowaveform` | `WORKSPACE_INSTALL_AUDIOWAVEFORM` | off | BBC waveform data generator. |
| `image-optimizers` | `WORKSPACE_INSTALL_IMAGE_OPTIMIZERS` | off | jpegoptim, optipng, pngquant, svgo and friends. |
| `wkhtmltopdf` | `WORKSPACE_INSTALL_WKHTMLTOPDF` | off | Render HTML to PDF. |
| `poppler-utils` | `WORKSPACE_INSTALL_POPPLER_UTILS` | off | `pdftotext` and other PDF tools. |
| `graphviz` | `WORKSPACE_INSTALL_GRAPHVIZ` | off | Render `.dot` graphs to images. |

### Shell & tools

| Tool | Flag | Default | What it does |
|---|---|---|---|
| `git-prompt` | `WORKSPACE_INSTALL_GIT_PROMPT` | off | Show the current branch in your shell prompt. |
| `powerline` | `WORKSPACE_INSTALL_POWERLINE` | off | Powerline status line for the prompt. |
| `mc` | `WORKSPACE_INSTALL_MC` | off | Midnight Commander, a terminal file manager. |
| `lnav` | `WORKSPACE_INSTALL_LNAV` | off | Log file navigator. |
| `linuxbrew` | `WORKSPACE_INSTALL_LINUXBREW` | off | Homebrew for Linux, for anything not listed here. |
| `gnu-parallel` | `WORKSPACE_INSTALL_GNU_PARALLEL` | off | Run shell jobs in parallel. |
| `fswatch` | `WORKSPACE_INSTALL_FSWATCH` | off | Watch files and react to changes. |
| `inotify` | `WORKSPACE_INSTALL_INOTIFY` | off | PHP inotify bindings for file watching. |
| `ping` | `WORKSPACE_INSTALL_PING` | off | The `ping` command. |
| `dnsutils` | `WORKSPACE_INSTALL_DNSUTILS` | **on** | `dig`, `nslookup`, for debugging container DNS. |
| `sshpass` | `WORKSPACE_INSTALL_SSHPASS` | off | Non-interactive SSH passwords, for scripts. |
| `subversion` | `WORKSPACE_INSTALL_SUBVERSION` | off | The `svn` client. |
| `smb` | `WORKSPACE_INSTALL_SMB` | off | SMB/CIFS client, for Windows shares. |
| `supervisor` | `WORKSPACE_INSTALL_SUPERVISOR` | off | Keep queue workers and daemons running. |

### DevOps

| Tool | Flag | Default | What it does |
|---|---|---|---|
| `docker-client` | `WORKSPACE_INSTALL_DOCKER_CLIENT` | off | The `docker` command inside the workspace. See [Docker-in-Docker](#docker-cli-inside-the-workspace-docker-in-docker). |
| `terraform` | `WORKSPACE_INSTALL_TERRAFORM` | off | The Terraform CLI. |
| `github-cli` | `WORKSPACE_INSTALL_GITHUB_CLI` | off | The `gh` command. |
| `protoc` | `WORKSPACE_INSTALL_PROTOC` | off | Protocol Buffers compiler. |
| `workspace-ssh` | `WORKSPACE_INSTALL_WORKSPACE_SSH` | off | Run an SSH server in the workspace. See [SSH into the Workspace](#ssh-into-the-workspace). |

### Other languages

| Tool | Flag | Default | What it does |
|---|---|---|---|
| `python` | `WORKSPACE_INSTALL_PYTHON` | off | Python 2 and pip. |
| `python3` | `WORKSPACE_INSTALL_PYTHON3` | off | Python 3 and pip3. |
| `jdk` | `WORKSPACE_INSTALL_JDK` | **on** | Java Development Kit. Only needed for tools that run on Java. |

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

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock rebuild workspace
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose build workspace
```

</TabItem>
</Tabs>

## Install the rdkafka extension

Needed for `composer install` when your dependencies require Kafka.

1. In `.env`, set `WORKSPACE_INSTALL_RDKAFKA` to `true`.
2. Rebuild:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock rebuild workspace
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose build workspace
```

</TabItem>
</Tabs>

To install rdkafka for the PHP-FPM container instead (the one that actually serves your app), see [Install the rdkafka extension](/docs/services/php-fpm#install-the-rdkafka-extension) on the PHP-FPM guide.

## Install the AST extension

AST exposes the abstract syntax tree generated by PHP 7+. It's required by tools such as [Phan](https://github.com/phan/phan), a static analyzer. `WORKSPACE_INSTALL_AST` defaults to `true`, so it's already installed unless you've turned it off.

1. In `.env`, set `WORKSPACE_INSTALL_AST` to `true`.
2. Rebuild:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock rebuild workspace
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose build workspace
```

</TabItem>
</Tabs>

> To pin a specific version, set `WORKSPACE_AST_VERSION` before rebuilding.

## Node.js & NVM

1. In `.env`, set `WORKSPACE_INSTALL_NODE` to `true`.
2. Rebuild:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock rebuild workspace
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose build workspace
```

</TabItem>
</Tabs>

> A `.npmrc` is included in the `workspace` folder and is copied into the root and laradock users' home directories on build, in case you need global npm config.

## Package managers

### pnpm

pnpm stores a single copy of each package version on disk and hard-links it into each project's `node_modules`, saving large amounts of space and speeding up installs. More on the [pnpm motivation](https://pnpm.js.org/en/motivation).

1. In `.env`, set both `WORKSPACE_INSTALL_NODE` and `WORKSPACE_INSTALL_PNPM` to `true`.
2. Rebuild:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock rebuild workspace
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose build workspace
```

</TabItem>
</Tabs>

### Yarn

1. In `.env`, set both `WORKSPACE_INSTALL_NODE` and `WORKSPACE_INSTALL_YARN` to `true`.
2. Rebuild:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock rebuild workspace
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose build workspace
```

</TabItem>
</Tabs>

### npm-check-updates

[npm-check-updates](https://www.npmjs.com/package/npm-check-updates) upgrades your `package.json` dependencies to the latest versions.

1. In `.env`, make sure `WORKSPACE_INSTALL_NODE` is `true`.
2. Set `WORKSPACE_INSTALL_NPM_CHECK_UPDATES_CLI` to `true`.
3. Rebuild:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock rebuild workspace
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose build workspace
```

</TabItem>
</Tabs>

## Frontend build tool CLIs

### Gulp

1. In `.env`, set `WORKSPACE_INSTALL_NPM_GULP` to `true`.
2. Rebuild:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock rebuild workspace
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose build workspace
```

</TabItem>
</Tabs>

### Bower

> Legacy. Bower is deprecated, prefer npm, Yarn, or pnpm for new projects.

1. In `.env`, set `WORKSPACE_INSTALL_NPM_BOWER` to `true`.
2. Rebuild:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock rebuild workspace
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose build workspace
```

</TabItem>
</Tabs>

### Vue CLI

1. In `.env`, set `WORKSPACE_INSTALL_NPM_VUE_CLI` to `true`.
2. Optionally change the ports: `WORKSPACE_VUE_CLI_SERVE_HOST_PORT` (default `8080`) and `WORKSPACE_VUE_CLI_UI_HOST_PORT` (default `8001`).
3. Rebuild:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock rebuild workspace
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose build workspace
```

</TabItem>
</Tabs>

Run `vue serve` or `vue ui` from the Workspace, then browse to the matching port.

### Angular CLI

1. In `.env`, set `WORKSPACE_INSTALL_NPM_ANGULAR_CLI` to `true`.
2. Rebuild:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock rebuild workspace
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose build workspace
```

</TabItem>
</Tabs>

## Composer extras

### Global Composer install

Install your global Composer requirements at build time so they're available in the container afterward.

1. In `.env`, set `WORKSPACE_COMPOSER_GLOBAL_INSTALL` to `true`.
2. Add your dependencies to `workspace/composer.json`.
3. Rebuild:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock rebuild workspace
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose build workspace
```

</TabItem>
</Tabs>

### Prestissimo

> Legacy. [Prestissimo](https://github.com/hirak/prestissimo) parallelized downloads for **Composer 1 only** and is abandoned. Composer 2 (Laradock's default) already downloads in parallel, so you almost certainly don't need this.

1. Enable Global Composer install (steps 1-2 above).
2. Add `"hirak/prestissimo": "^0.3"` to `workspace/composer.json`.
3. Rebuild:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock rebuild workspace
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose build workspace
```

</TabItem>
</Tabs>

## Deployment & task runners

### Deployer

> A deployment tool for PHP.

1. In `.env`, set `WORKSPACE_INSTALL_DEPLOYER` to `true`.
2. Rebuild:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock rebuild workspace
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose build workspace
```

</TabItem>
</Tabs>

See the [Deployer documentation](https://deployer.org/docs/).

### Laravel Envoy

> A task runner.

1. In `.env`, set `WORKSPACE_INSTALL_LARAVEL_ENVOY` to `true`.
2. Rebuild:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock rebuild workspace
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose build workspace
```

</TabItem>
</Tabs>

See the [Laravel Envoy documentation](https://laravel.com/docs/envoy).

## System utilities

### Linuxbrew

[Linuxbrew](http://linuxbrew.sh) is the Linux port of Homebrew.

1. In `.env`, set `WORKSPACE_INSTALL_LINUXBREW` to `true`.
2. Rebuild:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock rebuild workspace
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose build workspace
```

</TabItem>
</Tabs>

### Supervisor

[Supervisor](http://supervisord.org/) monitors and controls long-running processes on UNIX-like systems.

1. In `.env`, set both `WORKSPACE_INSTALL_SUPERVISOR` and `WORKSPACE_INSTALL_PYTHON` to `true`.
2. Create a worker config in `php-worker/supervisord.d/` by copying `laravel-worker.conf.example`.
3. Rebuild:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock rebuild workspace
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose build workspace
```

</TabItem>
</Tabs>

### GNU Parallel

[GNU Parallel](https://www.gnu.org/software/parallel/parallel_tutorial.html) runs multiple processes concurrently from the command line.

1. In `.env`, set `WORKSPACE_INSTALL_GNU_PARALLEL` to `true`.
2. Rebuild:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock rebuild workspace
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose build workspace
```

</TabItem>
</Tabs>

### dnsutils

1. In `.env`, set both flags to `true`:
   - `WORKSPACE_INSTALL_DNSUTILS`
   - `PHP_FPM_INSTALL_DNSUTILS`
2. Rebuild:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock rebuild workspace php-fpm
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose build workspace php-fpm
```

</TabItem>
</Tabs>

## Media & document tools

### FFmpeg

1. In `.env`, set `WORKSPACE_INSTALL_FFMPEG` to `true`.
2. Rebuild:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock rebuild workspace
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose build workspace
```

</TabItem>
</Tabs>

:::warning
If you queue conversions, also install FFmpeg in the `php-worker` and `php-fpm` containers (same flag pattern), otherwise the `php-ffmpeg` binary errors out.
:::

### BBC audiowaveform

[audiowaveform](https://github.com/bbc/audiowaveform) generates waveform data from MP3, WAV, FLAC, or Ogg Vorbis files, for rendering visual waveforms.

1. In `.env`, set `WORKSPACE_INSTALL_AUDIOWAVEFORM` to `true`.
2. Rebuild:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock rebuild workspace
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose build workspace
```

</TabItem>
</Tabs>

:::warning
If you queue processing, also install it in the `php-worker`, `laravel-horizon`, and `php-fpm` containers (same flag pattern), otherwise the `audiowaveform` binary errors out.
:::

### wkhtmltopdf

[wkhtmltopdf](https://wkhtmltopdf.org/) renders a PDF from HTML.

1. In `.env`, set `WORKSPACE_INSTALL_WKHTMLTOPDF` to `true`.
2. Rebuild:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock rebuild workspace
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose build workspace
```

</TabItem>
</Tabs>

:::warning
Also install it in the `php-fpm` container (same flag pattern), otherwise the `wkhtmltopdf` binary errors out.
:::

### poppler-utils & antiword

[poppler-utils](https://packages.debian.org/sid/poppler-utils) is a set of PDF command-line tools (info, text/image extraction, format conversion, signature verification, and more). It's commonly paired with `antiword`, so Laradock installs both together when the flag is set.

1. In `.env`, set the flag to `true` for each container you need it in: `WORKSPACE_INSTALL_POPPLER_UTILS`, `PHP_FPM_INSTALL_POPPLER_UTILS`, `PHP_WORKER_INSTALL_POPPLER_UTILS`, `LARAVEL_HORIZON_INSTALL_POPPLER_UTILS`.
2. Rebuild the affected containers:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock rebuild workspace php-fpm php-worker laravel-horizon
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose build workspace php-fpm php-worker laravel-horizon
```

</TabItem>
</Tabs>

### Graphviz

[Graphviz](https://graphviz.org/) renders graphs from text descriptions. Enable it in whichever container needs it:

| Container | Flag | Rebuild |
| --------- | ---- | ------- |
| Workspace | `WORKSPACE_INSTALL_GRAPHVIZ` | `./laradock rebuild workspace` |
| PHP-FPM (most common) | `PHP_FPM_INSTALL_GRAPHVIZ` | `./laradock rebuild php-fpm` |
| PHP-Worker | `PHP_WORKER_INSTALL_GRAPHVIZ` | `./laradock rebuild php-worker` |

Set the flag to `true`, then rebuild.

## GitHub Copilot CLI

> Requires GitHub Copilot access.

1. In `.env`, set `WORKSPACE_INSTALL_GITHUB_CLI` to `true`.
2. Rebuild the Workspace:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock rebuild workspace
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose build workspace
```

</TabItem>
</Tabs>

3. Enter the Workspace:

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

(The CLI shortcut starts `workspace` for you first if it isn't already running; with plain Docker Compose, run `docker compose up -d workspace` first if needed.)

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

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock rebuild workspace
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose build workspace
```

</TabItem>
</Tabs>

3. Use it: enter the Workspace (`./laradock workspace`, or `docker compose exec --user=laradock workspace bash`), then run `zsh`.

> Configure it by editing `/home/laradock/.zshrc` in the running container.

**Optional plugins:**

- **Autosuggestions**: set `SHELL_OH_MY_ZSH_AUTOSUGESTIONS` to `true`, then rebuild. Suggests commands as you type, from history and completions ([zsh-autosuggestions](https://github.com/zsh-users/zsh-autosuggestions)).
- **Bash aliases**: set `SHELL_OH_MY_ZSH_ALIASES` to `true`, then rebuild, to load Laradock's `aliases.sh` into Zsh.

### Git Bash prompt

A bash prompt showing the current branch, diff with remote, and counts of staged/changed files.

1. In `.env`, set `WORKSPACE_INSTALL_GIT_PROMPT` to `true`.
2. Rebuild:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock rebuild workspace
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose build workspace
```

</TabItem>
</Tabs>

> Customize it by editing `workspace/gitprompt.sh` and rebuilding. See the [bash-git-prompt repo](https://github.com/magicmonty/bash-git-prompt).

### Terminal aliases

On startup, Laradock copies `workspace/aliases.sh` into the container and sources it from `~/.bashrc`. Edit that file to add your own aliases or function macros.

### Powerline

1. In `.env`, set both `WORKSPACE_INSTALL_POWERLINE` and `WORKSPACE_INSTALL_PYTHON` to `true` (Powerline requires Python).
2. Rebuild:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock rebuild workspace
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose build workspace
```

</TabItem>
</Tabs>

## Run a one-off command without entering the shell

For a single command (a CI-style `composer install`, an Artisan call from a script, etc.) you don't need an interactive session at all:

```bash
docker compose exec workspace composer install
docker compose exec -u laradock workspace php artisan migrate
```

There's no dedicated `./laradock` shortcut for this (only for opening an interactive shell), plain `docker compose exec` is already the simplest form.

## SSH into the Workspace

Useful for pointing an IDE's remote interpreter (PhpStorm, VS Code Remote-SSH) or a deploy tool at the container over SSH instead of Docker's own exec.

1. In `.env`, set `WORKSPACE_INSTALL_WORKSPACE_SSH` to `true`.
2. Rebuild:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock rebuild workspace
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose build workspace
```

</TabItem>
</Tabs>

3. Connect to `localhost` on `WORKSPACE_SSH_PORT` (`2222` by default) as `root`, using the bundled `workspace/insecure_id_rsa` key:

```bash
ssh -p 2222 -i workspace/insecure_id_rsa root@localhost
```

That key is called "insecure" for a reason, it ships in the repo and is the same for every Laradock install. Fine for a purely local dev container reachable only from your own machine; if the port is ever exposed beyond `localhost` (a shared dev server, a cloud sandbox), replace `workspace/insecure_id_rsa`/`.pub` with your own key pair before rebuilding, or don't enable SSH access at all and use `./laradock workspace`/`docker compose exec` instead.

## Docker CLI inside the Workspace (Docker-in-Docker)

`workspace` can run `docker`/`docker compose` commands of its own, wired to a sibling `docker-in-docker` container (`docker:29-dind`) rather than your host's Docker socket. This is what lets tools like Testcontainers or Sail-style build scripts work from inside the Workspace.

1. In `.env`, set `WORKSPACE_INSTALL_DOCKER_CLIENT` to `true`.
2. Rebuild:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock rebuild workspace
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose build workspace
```

</TabItem>
</Tabs>

`DOCKER_HOST`, `DOCKER_TLS_VERIFY`, and `DOCKER_CERT_PATH` are already set on the container's environment (see `workspace/compose.yml`), so once you're inside (`./laradock workspace`), `docker ps`/`docker build`/`docker compose ...` just work against the `docker-in-docker` sibling, completely isolated from your host's Docker.

## Private Composer packages (auth.json)

If `composer install` needs credentials for a private registry (private Packagist, a private Satis, Magento's `repo.magento.com`, etc.):

1. Set `WORKSPACE_COMPOSER_AUTH_JSON` to `true` in `.env`.
2. Put your real credentials in `workspace/auth.json` (Composer's [standard `auth.json` format](https://getcomposer.org/doc/articles/http-basic-authentication.md)), the file already exists as a placeholder in that folder.
3. Rebuild:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock rebuild workspace
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose build workspace
```

</TabItem>
</Tabs>

`workspace/auth.json` holds real credentials once you fill it in, don't commit it to your app's repo.

## Common issues

- **A tool you enabled isn't there.** `WORKSPACE_INSTALL_*` flags only take effect on build, not on a plain restart: `./laradock rebuild workspace` then `./laradock start workspace`.
- **Files created in the container are owned by the wrong user on your host.** Set `WORKSPACE_PUID`/`WORKSPACE_PGID` to match your host user's `id -u`/`id -g`, then rebuild.
- **Composer/npm installs are painfully slow.** Set `WORKSPACE_COMPOSER_REPO_PACKAGIST` or `WORKSPACE_NPM_REGISTRY` to a closer mirror, or `CHANGE_SOURCE=true` if you're behind the Great Firewall (switches apt sources to a Tsinghua mirror).
- **Xdebug and Blackfire both enabled, neither works right.** They can't coexist in the same PHP process, the build skips the Blackfire probe entirely when `WORKSPACE_INSTALL_XDEBUG=true`.

---

Need the container that actually runs your PHP app? See the **[PHP-FPM guide](/docs/services/php-fpm)**. New to Laradock? Start at **[Getting Started](/docs/getting-started)**.
