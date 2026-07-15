# The Laradock CLI

Source: https://laradock.io/docs/cli

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# The Laradock CLI

The Laradock CLI is the **easy, fast way to get your whole PHP environment running**, without touching Docker or learning any of its commands and flags.

You clone Laradock, run one command, answer a couple of simple questions, and your stack (web server, PHP, database, and anything else you need) is up and ready. From then on you manage everything in plain English: `start`, `stop`, `restart`, `logs`. That's it. No `docker`, no `-d`, no `-f`, nothing to memorize.

For most people, this is all you'll ever need.

## Get started in one command

```bash
git clone https://github.com/laradock/laradock.git
cd laradock
```

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock start
```

The first time, `start` walks you through a quick setup (it even detects your project and pre-fills every answer, so you can just press Enter), then launches your stack. After that, `./laradock start` simply starts what you chose.

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
cp .env.example .env
docker compose up -d nginx mysql redis workspace
```

No wizard, no detection, just plain Compose: copy the env file, then start whichever services your project needs (swap the list for what applies to you).

</TabItem>
</Tabs>

Open `http://localhost` and you're running.

## The commands you'll actually use

Everything is a normal English word. `[services]` is optional, name one or more (like `mysql` or `nginx mysql`), or leave it off to act on your whole stack.

| Command | What it does |
|---|---|
| `./laradock start [services]` | Start your stack (or just the services you name). First run: sets you up first. |
| `./laradock stop [services]` | Stop it. Your data is kept. |
| `./laradock restart [services]` | Restart it. |
| `./laradock remove [services]` | Delete the containers. Your data on disk is kept. |
| `./laradock rebuild [services]` | Apply a version or config change you made. |
| `./laradock logs [services]` | Show recent logs (handy when something misbehaves). |
| `./laradock set KEY=VALUE` | Change a setting without opening an editor, e.g. `./laradock set REDIS_PORT=16379`. Writes it to your `.env`, then tells you (or offers) how to apply it. |
| `./laradock settings [service]` | See every setting a service accepts with its current value (`./laradock settings mysql`), or run it bare to list everything you've customized. |
| `./laradock unset KEY` | Undo a change, back to the shipped default. |
| `./laradock edit [service] [file]` | Open your `.env` in your editor. Name a service to open its `Dockerfile` (`./laradock edit mysql`), or any of its files (`./laradock edit mysql my.cnf`); it then tells you the command that applies your change. |
| `./laradock enter <service>` | Open a terminal inside a container, e.g. `./laradock enter mysql`. |
| `./laradock exec <service> <command>` | Run one command inside a container without entering it, e.g. `./laradock exec workspace php artisan migrate`. |
| `./laradock workspace` | Open the dev shell: `php`, `composer`, `node`, `git`, all preinstalled. |
| `./laradock test [args]` | Run your test suite inside the workspace. Auto-detects the runner (`artisan test`, then Pest, then PHPUnit); extra args pass through, e.g. `./laradock test --filter=Orders`. |
| `./laradock db` | Open a SQL shell in your running database, credentials handled for you. Auto-detects MySQL, MariaDB, or PostgreSQL. |
| `./laradock open [ui]` | Open your app in the browser. Name a UI to open that instead: `./laradock open mailpit` (also `phpmyadmin`, `adminer`), or pass a full URL. |
| `./laradock share` | Get a temporary public URL for your local site, handy for previews and webhook testing. Uses `cloudflared` or `ngrok` if installed. |
| `./laradock info` | What's running: URLs, ports, and passwords. |
| `./laradock doctor` | Check for common problems and tell you how to fix them. |
| `./laradock ship [tag] [--push]` | Build a hardened production image of your app to deploy anywhere (server, Kubernetes, any cloud). On Apple Silicon it builds `linux/amd64` by default. See [Deploy to Production](https://laradock.io/docs/production). |
| `./laradock setup` | Re-run the setup questions any time. |

Flags: `--yes` (`-y`) accepts every default (handy for scripts/CI). `NO_COLOR` is honored. On Windows, run it from WSL or Git Bash (the same environments Docker Desktop uses).

## The setup wizard

Setup asks a few simple questions, and **every one is pre-answered with a sensible default**, so pressing Enter straight through gives you a working stack. Each question also shows a short plain-English note explaining what it is and why the default is a safe choice.

It first detects your project (Laravel, WordPress, Symfony, Drupal, or plain PHP) and pre-selects it. Each of the ten steps gets its own screen: a header telling you where you are, a plain-English note on what you're choosing and why the default is safe, the full list of what's available (grouped), then a picker. Arrow keys to move, type to filter, Enter to choose.

1. **Project** (search the full 100+ catalog),
2. **PHP version**,
3. **PHP runtime** (defaults to `php-fpm`, the standard choice),
4. **Web server**, 5. **Database**, 6. **Cache** (each with a "none" option),
7. **Extra services** (optional, add any of the ~90 others: search, queues, AI, mail, monitoring, admin tools),
8. **Workspace tools** (the ~87 tools inside your dev shell: Xdebug, database clients, WP-CLI, see the [Workspace guide](https://laradock.io/docs/services/workspace)),
9. **Project name**, 10. **App path**,

then a **review screen** where you can change any answer before anything is saved.

```
  ──────────────────────────────────────────────────────────────
  Step 8 of 10  Workspace tools
  ──────────────────────────────────────────────────────────────
  The workspace is your dev shell: the container you run php, composer,
  artisan, npm and git inside (./laradock workspace). These are the tools
  baked into it.

  Debug & testing
    xdebug     pcov       phpdbg     dusk-deps  taint
  ...
  type to filter · ↑↓ move · space toggles on/off · enter when done
```

The review screen groups your answers and shows the stack they add up to, before anything is written:

```
  ──────────────────────────────────────────────────────────────
  Review your choices  nothing is written yet
  ──────────────────────────────────────────────────────────────

  ▸ Your app
    1) Project          laravel

  ▸ PHP
    2) Version          8.4
    3) Runtime          php-fpm

  ▸ Services to run
    4) Web server       nginx
    5) Database         mysql
    6) Cache            redis
    7) Extras           none

  ▸ Dev shell
    8) Workspace tools  9 tools  (node, yarn, npm-gulp +6 more)

  ▸ Naming & location
    9) Project name     my-app
   10) App path         ../

  ──────────────────────────────────────────────────────────────
  Starts 5 containers: nginx php-fpm mysql redis workspace
  ──────────────────────────────────────────────────────────────
  Enter = apply · 1-10 = change that answer · q = quit
```

Nothing is written until you confirm. When it finishes, it offers to point your app at the services and to **start your stack right there**, so a first run really can be just `./laradock start`.

**Run it again any time you change your mind.** `./laradock setup` is not just a first-run wizard: it pre-fills every answer with the stack you already have, so the review screen shows what you're actually running. Press `7` to add or drop extra services, `5` to switch database, `8` to add a tool like Xdebug, `2` to switch PHP version, and Enter to apply. Anything you don't touch stays exactly as it was. If you already know the name of what you want, `./laradock start <service>` skips the wizard entirely.

What it writes into `.env` (and nothing else):

- `COMPOSE_PROJECT_NAME` and `DATA_PATH_HOST`, **unique per project**, so running several Laradock projects on one machine never mixes containers or database files.
- `PHP_VERSION`, `APP_CODE_PATH_HOST`, and `LARADOCK_SERVICES` (your default service set for `./laradock start`).
- Everything else keeps its shipped default from each service's [`defaults.env`](https://laradock.io/docs/getting-started#how-laradock-configuration-works).

### Pointing your app at the services

The most common first-run snag in any Docker setup is your app's own `.env` still saying `DB_HOST=127.0.0.1`. The wizard offers to fix that: it shows you the exact changes first, backs up your file to `.env.bak.laradock`, and tags every line it writes with `# set by laradock`:

```
  Point your app's .env at these services?
    DB_CONNECTION=sqlite  →  DB_CONNECTION=mysql
    + DB_HOST=mysql
    REDIS_HOST=127.0.0.1  →  REDIS_HOST=redis
  Apply (original backed up to .env.bak.laradock)? [Y/n]
```

If you later edit a tagged line yourself, the wizard **never touches it again**, your value wins permanently. Decline the prompt and nothing in your app is ever modified.

## Changing things later

- **See what a service lets you change:** `./laradock settings mysql` (every variable with its current value; your overrides highlighted). Bare `./laradock settings` lists everything you've customized.
- **Change a setting:** `./laradock set KEY=VALUE` (or edit the line in `.env` yourself; it beats every default). The CLI then offers the restart, or points you at `./laradock rebuild <service>` for build-time settings, and even warns you when a database password can't apply to existing data.
- **Undo a change:** `./laradock unset KEY`, back to the shipped default.
- **A port is taken:** the error tells you exactly which variable to change, suggests a free port, and offers to fix it and start again for you. One keypress.
- **Add a service:** `./laradock start mailpit` (100+ available; the folder name is the service name).
- **See how to connect:** `./laradock info`.
- **Something's wrong:** `./laradock doctor`, then `./laradock logs <service>`.

## Advanced: nothing is hidden

The CLI is **not** a black box or a new system to learn. It's a small, readable bash script sitting in the repo root that just runs the same Docker commands you could run yourself, and it's optional. Two things are worth knowing once you're comfortable:

- **It's a friendly wrapper, not a replacement.** Every command it runs is plain `docker compose` under the hood, and it prints that real command before running it, so you can see (and learn) exactly what's happening. Anything it doesn't recognize is passed straight through: `./laradock ps`, `./laradock config`, `./laradock down` all just work.
- **You never lose full control.** The only file it writes is the same `.env` you'd write by hand. The moment you need advanced customization, you can drop down to plain `docker compose` and the raw config files, everything is yours to inspect and edit.

That's why, throughout these docs, most tasks show **two ways** to do them: the easy CLI command first, and the manual `docker compose` equivalent right below it. Use whichever you like, they do the exact same thing, and you can mix and switch any time.

Here's the full map: every CLI command and the exact `docker compose` it runs underneath (`[services]` is optional, `<service>` is required):

| Task | Easy: the CLI | Full control: Docker Compose |
|---|---|---|
| Set up | `./laradock setup` | `cp .env.example .env`, then edit (the wizard only writes `.env`) |
| Start | `./laradock start [services]` | `docker compose up -d [services]` |
| Stop | `./laradock stop [services]` | `docker compose stop [services]` |
| Restart | `./laradock restart [services]` | `docker compose restart [services]` |
| Delete containers | `./laradock remove [services]` | `docker compose rm -sf [services]` |
| Rebuild | `./laradock rebuild [services]` | `docker compose build [services]` |
| View logs | `./laradock logs [services]` | `docker compose logs --tail=100 [services]` |
| What's running | `./laradock info` | `docker compose ps` (plus URLs, ports, passwords) |
| Enter a container | `./laradock enter <service>` | `docker compose exec <service> bash` |
| Run one command | `./laradock exec <service> <cmd>` | `docker compose exec <service> <cmd>` |
| Enter the dev shell | `./laradock workspace` | `docker compose exec workspace bash` |
| Open a SQL shell | `./laradock db` | `docker compose exec mysql mysql …` (auto-detects MySQL / MariaDB / PostgreSQL) |
| Run your tests | `./laradock test` | `docker compose exec -u laradock workspace php artisan test` (auto-detects Artisan / Pest / PHPUnit) |
| Change a setting | `./laradock set KEY=VALUE` | Writes the line to your `.env` (no container command; you'd edit `.env` by hand) |
| Undo a setting | `./laradock unset KEY` | Removes the line from your `.env` |
| See settings | `./laradock settings [service]` | Reads each `defaults.env` + your `.env` (nothing to run) |
| Edit a file | `./laradock edit [service]` | Opens `.env` (or a service's `Dockerfile`) in your editor |
| Open in browser | `./laradock open [ui]` | Opens the URL, e.g. `http://localhost` (no container command) |
| Public preview URL | `./laradock share` | Runs `cloudflared` or `ngrok` against your local port |
| Health check | `./laradock doctor` | Runs local checks and suggests fixes |
| Build a prod image | `./laradock ship [tag]` | `docker build` a deployable image, see [Deploy to Production](https://laradock.io/docs/production) |
| Anything else | `./laradock <cmd> …` | `docker compose <cmd> …` (pass-through: `ps`, `config`, `top`, …) |

The CLI prints the real `docker compose` line before it runs it, so you can watch (and learn) exactly what each command does.
