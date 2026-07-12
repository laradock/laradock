# Workspace

Source: https://laradock.io/docs/services/workspace

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

## The `WORKSPACE_INSTALL_*` toggle pattern

Everything else, well over 60 tools and PHP extensions, follows the same on/off pattern in `workspace/defaults.env`: `WORKSPACE_INSTALL_<THING>=false`. Flip one to `true` in your `.env`, then rebuild:

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

These flags cover things like Xdebug/pcov/phpdbg, database clients (MySQL, Postgres, MSSQL), extensions (LDAP, SOAP, XSL, IMAP, SMB, Mongo, AMQP, Cassandra, ZMQ, Gearman, Swoole, Phalcon), framework tooling (Drush, Drupal Console, WP-CLI, Laravel Envoy, Laravel Installer, Symfony), package managers (pnpm, Bower, Angular CLI, npm-check-updates), and misc utilities (ImageMagick, FFmpeg, wkhtmltopdf, Terraform, Docker CLI, GitHub CLI, MinIO client, GNU Parallel, Supervisor, Oh My Zsh).

See the sections below for setup instructions on individual tools, and the **[PHP-FPM guide](https://laradock.io/docs/services/php-fpm)** for extension-specific install/config guides (Xdebug, pcov, phpdbg, YAML, rdkafka, ionCube, etc.) that apply to `workspace` as well as `php-fpm`.

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

To install rdkafka for the PHP-FPM container instead (the one that actually serves your app), see [Install the rdkafka extension](https://laradock.io/docs/services/php-fpm#install-the-rdkafka-extension) on the PHP-FPM guide.

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

Need the container that actually runs your PHP app? See the **[PHP-FPM guide](https://laradock.io/docs/services/php-fpm)**. New to Laradock? Start at **[Getting Started](https://laradock.io/docs/getting-started)**.
