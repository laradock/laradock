# Laradock vs Laragon

Source: https://laradock.io/docs/laradock-vs-laragon

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

## What is Laragon?

[Laragon](https://laragon.org/) is a free, portable, Windows-native local development environment. It installs Apache or Nginx, PHP, MySQL/MariaDB, and more directly on Windows, automatically creates a virtual host and a pretty `.test` domain for every project you drop into its `www` folder (no manual hosts-file editing), and adds one-click "Quick App" installers for WordPress, Laravel, Symfony, and other stacks. It is widely considered the fastest and most polished of the classic Windows PHP bundles (XAMPP, WAMP, Laragon).

This page compares that Windows-native approach to Laradock's containerized one.

*Laragon is the best-in-class version of the "install everything on Windows" approach: fast, auto-configured, genuinely pleasant to use. Laradock is a different category entirely: instead of installing software on your OS, it runs the same stack in disposable, cross-platform Docker containers.*

**TL;DR:** pick [Laragon](https://laragon.org/) if you are on Windows and want the fastest, most polished native one-click setup. Pick Laradock if you need cross-platform consistency, more than a handful of services, or an environment that resembles a Linux production server.

## Setting up with Laragon

1. Download and run the Laragon installer (or the portable ZIP, no installer needed).
2. Open Laragon, click **Menu → Quick app → Laravel** (or WordPress, Symfony, and others), give it a name.
3. Click **Start All**; your project appears instantly at `http://my-app.test`, virtual host and pretty URL handled automatically.

Adding a plain project: drop its folder into `C:\laragon\www`, click **Reload**, and it gets its own `.test` URL. PHP versions, MySQL/MariaDB versions, and Node are swappable from the **Menu → PHP / MySQL** version pickers, which download the version if it is missing.

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

Your site is served at `http://localhost`. The trade: Laragon's one-click app installers become explicit `./laradock start <service>` commands, and virtual hosts are configured through nginx site files instead of being fully automatic, in exchange for the same setup working identically on Linux and macOS, plus 100+ services beyond Laragon's built-in set.

## Side by side

| | **Laragon** | **Laradock** |
|---|---|---|
| Platform | Windows only (portable or installed) | Linux, macOS, Windows |
| Runs as | Native Apache/Nginx, PHP, MySQL on Windows | Docker containers |
| Setup | Download, run, click "Start All" | `git clone` + `docker compose up` |
| Virtual hosts | Fully automatic, no hosts-file editing | Manual nginx site config (or automatic with Traefik/Caddy) |
| One-click app installs | Quick App menu (WordPress, Laravel, ...) | `docker compose up -d {service}`, 100+ options |
| PHP/DB version switching | GUI version picker, auto-downloads | `.env` variable + rebuild |
| Isolation between projects | Shared native services across all projects | Full (containers per project) |
| Production parity | None (native Windows) | High (Linux containers) |
| Price | Free (Laragon Pro paid tier for extras) | Free, MIT |

## Choose Laragon if...

- You are on Windows and want the fastest, most beginner-friendly native setup available.
- You like a GUI with one-click app installers and zero hosts-file fiddling.
- Your stack fits comfortably inside Laragon's built-in service list.

## Choose Laradock if...

- You need the same setup to also work on Linux or macOS, for you or your team.
- You want your local environment to resemble a real Linux production server.
- You need services beyond Laragon's built-in set (queues, search engines, local LLMs, monitoring), each just one `up` command away.

## Already on Laragon? Migrating takes minutes

1. **Export your database** via Laragon's bundled HeidiSQL or phpMyAdmin: right-click your database → Export → SQL file.
2. **Stop Laragon:** click **Stop All** in the Laragon window so ports 80/3306 free up.
3. **Add Laradock** next to your code (inside WSL or Git Bash, since Laradock's setup commands are Unix-shell based): `git clone https://github.com/laradock/laradock.git && cd laradock && cp .env.example .env`
4. **Start your stack:** `docker compose up -d nginx mysql redis workspace`
5. **Import the database:** `docker compose exec -T mysql mysql -uroot -proot default < ../backup.sql`
6. **Update your app's config:** database host becomes `mysql` (not `localhost`), user `default`, password `secret` (see `mysql/defaults.env`).
7. Your site now answers at `http://localhost` instead of `my-app.test` (wire an nginx site config if you want a custom domain back).

## Frequently Asked Questions

### Is Laragon free?

Yes, Laragon's core is free. Laragon Pro is an optional paid tier that adds extra tools and remote/cloud isolation features.

### Does Laragon work on macOS or Linux?

No, Laragon is Windows-only. For a cross-platform alternative with the same one-download simplicity, Laradock runs identically on Windows, macOS, and Linux via Docker.

### Does Laragon use Docker?

No, Laragon installs Apache/Nginx, PHP, and MySQL/MariaDB directly on Windows as native services; it does not use containers. That is the core difference this page compares.

### Can I run multiple PHP versions in Laragon?

Yes, Laragon's PHP version picker can download and switch between multiple PHP versions, but only one is active globally at a time across all projects, unlike Laradock's per-project container isolation.

### How do I move a Laragon project to Docker?

Export your database through Laragon's built-in HeidiSQL or phpMyAdmin, then follow the [migration steps](#already-on-laragon-migrating-takes-minutes) above; it takes about 10 minutes.

See the full landscape, including DDEV, Sail, Herd and XAMPP: **[Laradock vs Others](https://laradock.io/docs/laradock-alternatives)**. Ready to try it? **[Getting Started](https://laradock.io/docs/getting-started)** takes about five minutes.
