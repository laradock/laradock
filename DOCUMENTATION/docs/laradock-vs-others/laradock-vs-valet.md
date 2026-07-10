---
slug: /laradock-vs-valet
title: Laradock vs Laravel Valet
description: Laravel Valet vs Laradock. Valet's minimal native macOS setup vs Laradock's containerized, cross-platform stack, honestly compared, with a migration guide.
keywords:
  - laradock vs valet
  - laravel valet vs docker
  - valet alternative
  - valet linux
  - laravel valet vs laradock
  - php local development macos
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

## What is Laravel Valet?

[Laravel Valet](https://laravel.com/docs/valet) is a minimal, official Laravel tool for macOS that configures Nginx and DnsMasq to run natively in the background on your Mac, then proxies requests for any project folder you "park" or "link" to a `.test` domain. There is no virtual machine and no container: everything runs directly on your OS, using roughly 7MB of RAM.

It predates (and still underlies parts of) [Laravel Herd](/docs/laradock-vs-laravel-herd), which is a friendlier GUI wrapper around the same idea. This page compares Valet's native, command-line-only approach to Laradock's containerized one.

*Valet is the leanest possible native option: no GUI, no virtual machine, just Nginx and DnsMasq running quietly in the background. Laradock is the leanest possible containerized option: no host installs at all, everything disposable. Both value minimalism; they just draw the line in different places.*

**TL;DR:** pick [Valet](https://laravel.com/docs/valet) if you are on macOS, want the absolute lightest native footprint, and are comfortable installing services with Homebrew. Pick Laradock if you want Linux/Windows support, production-like containers, or services beyond what Homebrew conveniently offers.

## Setting up a Laravel app with Valet

```bash
composer global require laravel/valet
valet install
cd ~/Sites
valet park
laravel new my-app
```

Any project inside a "parked" directory is instantly served at `http://my-app.test`; a single project elsewhere can be exposed with `valet link my-app` instead. Need a database? Valet does not include one, install MySQL or PostgreSQL yourself via Homebrew, or add them through Herd Pro, DBngin, or a container.

Switch PHP version per site:

```bash
valet use php@8.3
# or drop a .valetphprc file in the project containing "8.3"
```

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

Your site answers at `http://localhost`; MySQL and Redis are one word in the `start` command instead of a separate Homebrew install, and 100+ other services (search, queues, local LLMs) are equally one command away. `./laradock remove` leaves nothing behind, whereas Valet's native services stay installed until you remove them by hand.

## Side by side

| | **Laravel Valet** | **Laradock** |
|---|---|---|
| Platform | macOS only | Linux, macOS, Windows |
| Runs as | Native Nginx + DnsMasq | Docker containers |
| Install | Composer + Homebrew | Nothing (git clone; only Docker itself) |
| Databases, Redis, etc. | Not included; install separately | 100+ services, one command each |
| Domains | Automatic `.test` via park/link | Manual, or wire Caddy/Traefik |
| PHP versions | Per site (`valet use`, `.valetphprc`) | Per project (`.env`) |
| Resource use | ~7MB RAM, always-on background services | Only while containers are running |
| Production parity | None (native macOS) | High (Linux containers) |
| GUI | None (CLI only); Herd offers one | None (CLI only) |

## Choose Valet if...

- You are on macOS and want the smallest possible native footprint with a `.test` domain out of the box.
- You are comfortable adding databases and other services yourself via Homebrew.
- You do not need Linux or Windows support, or production-like containers.

## Choose Laradock if...

- You need Linux or Windows support; Valet is macOS-only (the community [Valet Linux](https://cpriego.github.io/valet-linux/) fork exists but is not official).
- You want databases, caches, and 100+ other services pre-wired instead of installed by hand.
- You want your local stack to behave like a Linux production server.

## Already on Valet? Migrating takes minutes

1. **Export your database** (installed via Homebrew alongside Valet): `mysqldump -h 127.0.0.1 -u root my_db > backup.sql`
2. **Stop Valet's services** so port 80 frees up: `valet stop` (or `composer global remove laravel/valet` once you're confident).
3. **Add Laradock** next to your code: `git clone https://github.com/laradock/laradock.git && cd laradock && cp .env.example .env`
4. **Start your stack:** `./laradock start nginx mysql redis workspace` (or `docker compose up -d nginx mysql redis workspace`)
5. **Import the database:** `./laradock exec -T mysql mysql -uroot -proot default < ../backup.sql`
6. **Update your app's `.env`:** `DB_HOST=127.0.0.1` becomes `DB_HOST=mysql`; credentials in `mysql/defaults.env`.
7. Your site now answers at `http://localhost` instead of `my-app.test` (or wire an nginx site config to keep a custom domain).

## Frequently Asked Questions

### Is Laravel Valet free?

Yes, Valet is free and open-source, maintained by the Laravel team as part of the Laravel ecosystem.

### Does Valet work on Windows or Linux?

Officially, no, Valet is macOS-only. A community-maintained fork, [Valet Linux](https://cpriego.github.io/valet-linux/), brings similar functionality to Linux, but it is not part of the official Laravel project.

### Does Valet include a database?

No. Valet only handles PHP and the web server; you install MySQL, PostgreSQL, Redis, or anything else separately, typically via Homebrew.

### What is the difference between Valet and Herd?

[Laravel Herd](/docs/laradock-vs-laravel-herd) builds on the same native idea as Valet but adds a menu-bar GUI, easier PHP version switching, and (in the paid Pro tier) managed databases, Xdebug, and mail capture. Valet stays a lean, free, CLI-only tool.

### Can I run multiple PHP versions with Valet?

Yes, per site: use `valet use php@8.3` inside a project, or drop a `.valetphprc` file containing the version number so Valet picks it automatically.

See the full landscape, including DDEV, Sail, Lando and XAMPP: **[Laradock vs Others](/docs/laradock-alternatives)**. Ready to try it? **[Getting Started](/docs/getting-started)** takes about five minutes.
