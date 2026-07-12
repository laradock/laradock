# Laradock vs Laravel Herd

Source: https://laradock.io/docs/laradock-vs-laravel-herd

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

## What is Laravel Herd?

[Laravel Herd](https://herd.laravel.com/) is a native macOS and Windows application, built by the Laravel team, that installs PHP, a web server, and local `.test` domains directly onto your computer, no Docker, no containers, no virtual machine. You open the app, and your PHP projects are served instantly.

It trades container isolation for raw native speed and a one-click setup. This page compares it to Laradock, which runs everything in Docker containers instead: slightly more setup, but an environment that matches your Linux production server and works on Linux too, which Herd does not support.

*Herd and Laradock solve the same problem from opposite ends: Herd installs a native PHP toolchain on your Mac or Windows machine for maximum speed; Laradock keeps your machine untouched and runs everything in production-style containers.*

**TL;DR:** pick [Herd](https://herd.laravel.com/) if you are a solo Laravel developer on macOS/Windows and raw speed beats everything. Pick Laradock if you want containers that resemble production, work on Linux, need real services for free, or want nothing installed on your machine.

## Setting up with Herd

Download and run the Herd app (macOS or Windows; there is no Linux version). It installs PHP, Nginx and dnsmasq natively, then:

```bash
cd ~/Herd
laravel new my-app
```

That's it: `http://my-app.test` works immediately; any project inside the parked `~/Herd` folder is served automatically, and `herd link` serves a folder living elsewhere. PHP versions switch per site in seconds (PHP 7.4 to 8.5), pinnable per project.

The catch appears at the services layer: MySQL, Redis, queues, and mail capture are part of **Herd Pro** (paid), or you install and manage them yourself. And because everything is native, your local runtime looks nothing like your Linux production server.

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

Inside the workspace: artisan, composer, node, all ready to go. No app installed, no native PHP, no menu bar icon: your machine stays clean, and `./laradock remove` leaves zero traces. Every service is free and unlimited: databases, queues, search, mail catchers, monitoring, local LLMs; 100+ of them, one command each.

Change PHP version: `PHP_VERSION=8.3` in `.env` + rebuild. Different projects can run different versions side by side in their own containers.

## Side by side

| | **Laravel Herd** | **Laradock** |
|---|---|---|
| Runs as | Native app (PHP/Nginx on your OS) | Docker containers |
| Platforms | macOS, Windows | Linux, macOS, Windows |
| Raw speed | Fastest (no container overhead) | Fast (VirtioFS), but containerized |
| `.test` domains + HTTPS | Automatic | Manual (or wire the included Traefik/Caddy) |
| Databases, Redis, mail | Herd Pro (paid) or DIY | Included, free, 100+ services |
| Production parity | None (native macOS/Windows runtime) | High (same Linux containers as servers) |
| Machine footprint | PHP, Nginx, dnsmasq installed globally | Nothing installed; containers are disposable |
| Legacy PHP | 7.4+ | 5.6+ |
| Price | Free core, Pro is paid | Free, MIT |

## Choose Herd if...

- You are on macOS or Windows, mostly solo, mostly Laravel, and iteration speed is everything.
- Your services needs are light (SQLite, or you happily pay for Pro).
- Production parity is not a concern for your workflow.

## Choose Laradock if...

- You develop on (or deploy to) Linux; Herd simply does not run there.
- You want your local stack to behave like your production stack, container for container.
- You need real infrastructure locally (queues, search, brokers, LLMs) without a subscription.
- You want a spotless host machine: clone, run, delete, gone.

## Already on Herd? Migrating takes minutes

1. **Export your databases** from wherever they live today (Herd Pro's MySQL, DBngin, or a local install): `mysqldump -h 127.0.0.1 -u root mydb > backup.sql`
2. **Quit Herd** (its native Nginx holds port 80, which Laradock's web server needs).
3. **Add Laradock** next to your code: `git clone https://github.com/laradock/laradock.git && cd laradock && cp .env.example .env`
4. **Start your stack:** `./laradock start nginx mysql redis workspace` (or `docker compose up -d nginx mysql redis workspace`)
5. **Import the database:** `./laradock exec -T mysql mysql -uroot -proot default < ../backup.sql`
6. **Update your app's `.env`:** `DB_HOST=mysql`, `REDIS_HOST=redis`, credentials from `mysql/defaults.env`.
7. Your site now answers at `http://localhost` instead of `my-app.test`, and `artisan`/`composer` run inside `./laradock workspace`.

## Frequently Asked Questions

### Is Laravel Herd free?

Herd's core (PHP version switching, `.test` domains, basic services) is free. Herd Pro adds MySQL/Redis/PostgreSQL management, Xdebug, mail capture, and more, and is a paid subscription.

### Does Laravel Herd run on Linux?

No. Herd is available only for macOS and Windows; there is no Linux build. This is one of the main reasons Linux-based teams choose a Docker-based option like Laradock instead.

### Does Herd use Docker?

No, Herd installs PHP, Nginx, and DNS resolution natively on your machine rather than running containers. This makes it very fast but means your local environment does not match a containerized production server.

### Can Herd run non-Laravel PHP projects?

Yes, despite the name, Herd can serve any PHP project (WordPress, Symfony, plain PHP), not only Laravel apps; Laravel-specific features like Herd Pro's queue/log tooling are just the primary focus.

### How do I switch PHP versions in Herd?

Herd lets you switch the PHP version per site from its menu bar app or with `herd php:use 8.3`, and can pin a version per project so switching sites doesn't affect others.

See the full landscape, including DDEV, Sail, Lando and XAMPP: **[Laradock vs Others](https://laradock.io/docs/laradock-alternatives)**. Ready to try it? **[Getting Started](https://laradock.io/docs/getting-started)** takes about five minutes.
