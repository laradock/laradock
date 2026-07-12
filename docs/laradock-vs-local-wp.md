# Laradock vs Local WP

Source: https://laradock.io/docs/laradock-vs-local-wp

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

## What is Local WP?

[Local WP](https://localwp.com/) (formerly Local by Flywheel, now from WP Engine) is a free desktop application, for macOS, Windows, and Linux, built specifically for WordPress local development. You click "Create a new site," and within about two minutes you have a fully working WordPress install with SSL, WP-CLI, and one-click access to phpMyAdmin, Mailhog, and other add-ons, all through a graphical interface, no command line required.

It is the most widely used WordPress-specific local tool, and integrates tightly with WP Engine/Flywheel hosting for pushing and pulling sites. This page compares that GUI-first, WordPress-only tool to Laradock's framework-agnostic, file-based approach.

*Local WP is purpose-built for one thing and does it extremely well: WordPress, through a polished GUI, with zero configuration. Laradock is purpose-built for everything: any PHP project, through plain files and Docker Compose, with more setup but no ceiling on what it can run.*

**TL;DR:** pick [Local WP](https://localwp.com/) if you only build WordPress sites and want the smoothest possible GUI experience, especially if you host on WP Engine or Flywheel. Pick Laradock if you work across multiple frameworks, prefer file-based configuration over a GUI, or need services beyond WordPress's usual stack.

## Setting up a WordPress site with Local WP

1. Download and install the Local WP app.
2. Click **Create a new site**, name it, choose PHP/MySQL/web-server versions (or accept the defaults), and click through the wizard.
3. Local WP builds the environment and opens your new WordPress install, admin credentials included, at a local `.local` domain.

Sharing or deploying: right-click the site for **Export** (a zip with `wp-content` plus a database dump) to hand to a teammate, or use **Live Link** / WP Engine's **Local Connect** to push straight to a WP Engine or Flywheel hosting account.

## The same thing with Laradock

```bash
cd my-site
git clone https://github.com/laradock/laradock.git
cd laradock
```

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock start apache2 mysql phpmyadmin workspace
./laradock workspace
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
cp .env.example .env
docker compose up -d apache2 mysql phpmyadmin workspace
docker compose exec workspace bash
```

</TabItem>
</Tabs>

Inside the workspace: wp-cli, composer, php, all live here. WordPress itself is not bundled, you download it into your project folder (or install via `wp core download` inside the workspace) the same way you would on any host. In exchange, you get a stack that is not locked to WordPress: the identical `./laradock start <service>` command starts Redis, Elasticsearch, a queue, or any of Laradock's 100+ other services, and the whole setup is plain text files instead of app state.

## Side by side

| | **Local WP** | **Laradock** |
|---|---|---|
| Interface | Desktop GUI app | Command line, plain files |
| Scope | WordPress only | Any PHP project |
| Setup | Click "Create a new site" | `git clone` + `docker compose up` |
| WordPress install | Bundled, one click | You install WordPress yourself (standard `wp-cli`/download) |
| Site config | Stored in the app | Plain `.env` + compose files |
| Push to production | Live Link / Local Connect (WP Engine, Flywheel) | Any host; you own the deploy pipeline |
| Extra services | Curated add-ons (Mailhog, phpMyAdmin, ...) | 100+ services, one command each |
| Non-WordPress projects | Not supported | Fully supported |
| Price | Free (WP Migrate Pro paid add-on for advanced push/pull) | Free, MIT |

## Choose Local WP if...

- You build WordPress sites exclusively and want the smoothest, most GUI-driven workflow available.
- You host on WP Engine or Flywheel and want native one-click deploys.
- You would rather click through a wizard than edit configuration files.

## Choose Laradock if...

- You work across multiple frameworks or CMSs, not just WordPress.
- You prefer plain, version-controllable config files over app-managed state.
- You need services outside WordPress's usual stack (queues, search clusters, local LLMs) or a non-WP-Engine hosting target.

## Already on Local WP? Migrating takes minutes

1. **Export your site** in Local WP: right-click the site → **Export site**; you get a zip with `wp-content` and a database dump.
2. **Stop the site in Local WP** (or quit the app) so its ports free up.
3. **Add Laradock** next to a new project folder: `git clone https://github.com/laradock/laradock.git && cd laradock && cp .env.example .env`
4. **Start your stack:** `./laradock start apache2 mysql phpmyadmin workspace` (or `docker compose up -d apache2 mysql phpmyadmin workspace`)
5. **Unzip the export**, copy `wp-content` into your project's WordPress install, and import the database dump via phpMyAdmin (`localhost:8081`) or `./laradock exec -T mysql mysql -uroot -proot default < dump.sql`.
6. **Update `wp-config.php`:** set `DB_HOST` to `mysql` (not `localhost`), and the credentials from `mysql/defaults.env` (or your `.env` overrides).
7. Your site now answers at `http://localhost` instead of Local WP's `.local` domain.

## Frequently Asked Questions

### Is Local WP free?

Yes, Local WP is free. WP Migrate Pro, used for advanced push/pull syncing with a live site, is a separate paid add-on.

### Does Local WP work with frameworks other than WordPress?

No, Local WP is purpose-built exclusively for WordPress. For other PHP frameworks or a mixed-stack workflow, you need a framework-agnostic tool like Laradock.

### Does Local WP use Docker?

Local WP's newer default mode ("Lightning") uses lightweight native services for speed, with an optional container-based mode for older sites; either way, it is managed entirely through the app rather than files you edit directly, unlike Laradock's plain Docker Compose files.

### Can I deploy directly from Local WP to production?

Yes, if you host on WP Engine or Flywheel: Local WP's Live Link and Local Connect features push a local site straight to those hosting platforms. For other hosts, you export and deploy manually.

### How do I move a Local WP site to Docker?

Export the site from Local WP (zip with `wp-content` and a database dump), then follow the [migration steps](#already-on-local-wp-migrating-takes-minutes) above; expect about 10-15 minutes depending on site size.

See the full landscape, including DDEV, Sail, Herd and XAMPP: **[Laradock vs Others](https://laradock.io/docs/laradock-alternatives)**. Ready to try it? **[Getting Started](https://laradock.io/docs/getting-started)** takes about five minutes.
