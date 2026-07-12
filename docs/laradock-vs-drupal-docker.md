# Laradock vs Drupal Docker (DDEV and the official image)

Source: https://laradock.io/docs/laradock-vs-drupal-docker

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

## How Drupal is usually run in Docker

Drupal has no single official Docker tool, but the community has clear defaults:

- [**DDEV**](https://ddev.com/) is the de-facto standard the Drupal community recommends: install one binary, run `ddev start`, and a Drupal-ready environment appears with automatic HTTPS and per-project domains. (Lando is a close cousin, popular for the same reason.)
- The [**official `drupal` Docker image**](https://hub.docker.com/_/drupal) is a bare runtime you pair with a database in a `docker-compose.yml` you write yourself.

This page compares those with Laradock. For the general, tool-level DDEV comparison see **[Laradock vs DDEV](https://laradock.io/docs/laradock-vs-ddev)**; here the focus is Drupal specifically.

*DDEV/Lando generate and hide the Docker machinery behind a CLI; the official image is a building block you wire yourself; Laradock hands you the machinery pre-wired and readable, for Drupal and every other PHP project. This page sets Drupal up on Laradock.*

**TL;DR:** pick [DDEV](https://ddev.com/) if you run many Drupal sites and never want to see a Dockerfile. Wire the [official image](https://hub.docker.com/_/drupal) yourself if your needs are tiny. Pick Laradock if you want full control over readable Docker files, services beyond DDEV's add-ons, one environment across frameworks, or a direct path to production.

## Setting up Drupal with DDEV

```bash
mkdir my-drupal && cd my-drupal
ddev config --project-type=drupal --docroot=web
ddev start
ddev composer create drupal/recommended-project
ddev drush site:install -y
ddev launch
```

Live at `https://my-drupal.ddev.site` with trusted HTTPS. The Docker files live in `.ddev/`, generated and regenerated on every start, so they are DDEV's to manage, not yours to edit directly.

## The same thing with Laradock

```bash
cd my-drupal
git clone https://github.com/laradock/laradock.git
cd laradock
```

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock start nginx postgres redis workspace
./laradock workspace
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
cp .env.example .env
docker compose up -d nginx postgres redis workspace
docker compose exec workspace bash
```

</TabItem>
</Tabs>

Inside the workspace, `composer create-project drupal/recommended-project .` and `drush site:install` just work (the workspace ships Composer, Drush, and Drupal Console). Every file involved (`nginx/compose.yml`, `php-fpm/Dockerfile`, ...) is readable and yours to edit. Full walkthrough: **[Run Drupal on Docker](https://laradock.io/docs/drupal-on-docker)**.

## Side by side

| | **DDEV** | **Official image** | **Laradock** |
|---|---|---|---|
| Install | `ddev` binary | Nothing (write compose) | Nothing (git clone) |
| Docker files | Generated & hidden in `.ddev/` | Yours (you wrote them) | Plain files you own and edit |
| Commands | `ddev *` vocabulary | Plain `docker compose` | Plain `docker compose` (+ optional `./laradock`) |
| HTTPS + `.site`/`.test` domains | ✅ automatic | Manual | Via Caddy/Traefik service |
| Drush / Drupal Console | ✅ | Add a service | ✅ in `workspace` |
| Services | ~50 curated add-ons | Only what you wire | 100+ shipped |
| Runs non-Drupal projects | ✅ (CMS-focused presets) | You'd rewrite the compose | ✅ any PHP project |
| Skills you build | DDEV-specific | Transferable Docker | Transferable Docker |
| Production path | Dev-focused | Roll your own | `./laradock ship` → server / Kubernetes / cloud |

## Choose DDEV (or Lando) if...

- You run many Drupal sites and want identical, isolated environments with zero Docker exposure.
- Automatic HTTPS and per-project domains matter more than seeing how they work.

## Choose the official image if...

- Your needs are minimal (Drupal + one database) and you like owning a short compose file.

## Choose Laradock if...

- You want full control: every Dockerfile and config readable and yours to change.
- Your stack goes beyond DDEV's add-ons (message brokers, search clusters, local LLMs, monitoring).
- You work across frameworks and want one environment for Drupal, Laravel, WordPress, and the rest.
- You want the same containers to reach production with `./laradock ship`.

## Frequently Asked Questions

### What is the recommended way to run Drupal in Docker?

The Drupal community most often points to DDEV. It is excellent if you want zero Docker exposure; Laradock is the alternative when you want transparent, editable Docker files, a larger service catalog, and one environment across multiple frameworks.

### Can Laradock run Drupal with PostgreSQL?

Yes. Start `postgres` instead of `mysql` (`./laradock start nginx postgres redis workspace`) and point Drupal's settings at host `postgres`. See **[Run Drupal on Docker](https://laradock.io/docs/drupal-on-docker)**.

### How is this different from the general DDEV comparison?

This page focuses on Drupal specifically. For the broader, tool-level breakdown of DDEV vs Laradock across any project, see **[Laradock vs DDEV](https://laradock.io/docs/laradock-vs-ddev)**.

See the full landscape: **[Laradock vs DDEV](https://laradock.io/docs/laradock-vs-ddev)** and **[Laradock vs Others](https://laradock.io/docs/laradock-alternatives)**. Ready to try it? **[Run Drupal on Docker](https://laradock.io/docs/drupal-on-docker)** takes about five minutes.
