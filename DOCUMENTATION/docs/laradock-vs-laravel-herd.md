---
slug: /laradock-vs-laravel-herd
title: Laradock vs Laravel Herd
description: Laravel Herd vs Laradock compared honestly. Native speed vs production parity, macOS/Windows vs everywhere, free containers vs paid Pro services. Which local PHP environment fits your work?
keywords:
  - laradock vs laravel herd
  - laravel herd vs docker
  - laravel herd alternative
  - laravel herd linux
  - herd vs sail
  - php development environment mac
---

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
cd laradock && cp .env.example .env
docker compose up -d nginx mysql redis workspace
docker compose exec workspace bash   # artisan, composer, node, all inside
```

No app installed, no native PHP, no menu bar icon: your machine stays clean, and `docker compose down` leaves zero traces. Every service is free and unlimited: databases, queues, search, mail catchers, monitoring, local LLMs; 100+ of them, one command each.

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
4. **Start your stack:** `docker compose up -d nginx mysql redis workspace`
5. **Import the database:** `docker compose exec -T mysql mysql -uroot -proot default < ../backup.sql`
6. **Update your app's `.env`:** `DB_HOST=mysql`, `REDIS_HOST=redis`, credentials from `mysql/defaults.env`.
7. Your site now answers at `http://localhost` instead of `my-app.test`, and `artisan`/`composer` run inside `docker compose exec workspace bash`.

See the full landscape, including DDEV, Sail, Lando and XAMPP: **[Laradock vs Others](/docs/laradock-alternatives)**. Ready to try it? **[Getting Started](/docs/getting-started)** takes about five minutes.
