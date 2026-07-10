---
slug: /laradock-vs-manual-install
title: Laradock vs Installing PHP Manually
description: Installing PHP, MySQL and Nginx with brew or apt vs running them in containers with Laradock. The honest trade-offs of a bare-metal PHP setup, and a clean migration path.
keywords:
  - install php locally vs docker
  - brew php mysql setup
  - php local development environment
  - docker vs local php install
  - php version manager alternative
  - clean php development setup
---

*The no-tools path: `brew install` (or `apt install`) PHP, MySQL, Nginx straight onto your machine and wire them yourself. Plenty of seniors work this way and it is genuinely fast. This page is the honest ledger of what it costs, against running the same stack in containers.*

**TL;DR:** stay bare-metal if you run one project on one machine and know your OS well. Pick Laradock the moment a second project, a second PHP version, a second machine, or a second teammate enters the picture.

## The manual way

```bash
# macOS flavor; apt/dnf equivalents on Linux
brew install php@8.4 mysql redis nginx composer node
brew services start mysql
brew services start redis
brew services start nginx
# then: nginx server block, php-fpm pool config, hosts entry, per-project tweaks...
```

It boots fast and runs at native speed. The recurring costs: **one global PHP** unless you add version managers on top, config scattered across `/opt/homebrew/etc` or `/etc`, `brew upgrade` occasionally breaking every project at once, each teammate hand-building a slightly different machine, an environment that does not resemble your Linux server, and no clean way back; uninstalls leave traces everywhere.

## The same thing with Laradock

```bash
cd my-project
git clone https://github.com/laradock/laradock.git
cd laradock && cp .env.example .env
docker compose up -d nginx mysql redis workspace
docker compose exec workspace bash   # php, composer, node, git, all inside
```

Same stack, containerized: per-project PHP versions (5.6 to 8.5) side by side, configs in one visible folder tree instead of across your OS, teammates get identical environments from the same files, and `docker compose down` returns your machine to exactly how it was.

## Side by side

| | **Manual install (brew/apt)** | **Laradock** |
|---|---|---|
| Raw speed | Native (fastest) | Container overhead (small; VirtioFS on Mac) |
| PHP versions | One global (or juggle version managers) | Per project, `.env` one-liner |
| Config location | Scattered across the OS | One folder tree, all visible |
| Breakage risk | `brew upgrade` can break everything at once | Rebuild one container at a time |
| Team consistency | Every machine hand-built | Same files = same stack |
| Extra services | Install each one globally | 100+, one command each, disposable |
| Production parity | None (macOS/Windows native) | High (Linux containers) |
| Uninstall | Leftovers forever | `down` + delete folder, zero traces |

## Stay manual if...

- One project, one machine, and native performance genuinely matters to your workflow.
- You administer your OS confidently and enjoy owning the config.
- Docker is not allowed or not available in your environment.

## Choose Laradock if...

- You juggle multiple projects or PHP versions; this is where bare-metal collapses first.
- You want your local stack to behave like your Linux production server.
- You onboard teammates and want "clone and run" instead of a setup document.
- You want experiments (a queue, a search engine, an LLM) to be disposable, not installed.

## Already bare-metal? Migrating takes minutes

1. **Export your databases** from the local MySQL: `mysqldump -h 127.0.0.1 -u root my_db > backup.sql`
2. **Stop the native services** so ports 80/3306/6379 free up: `brew services stop nginx mysql redis` (uninstall later, once you are confident).
3. **Add Laradock** next to your code: `git clone https://github.com/laradock/laradock.git && cd laradock && cp .env.example .env`
4. **Start your stack:** `docker compose up -d nginx mysql redis workspace`
5. **Import the database:** `docker compose exec -T mysql mysql -uroot -proot default < ../backup.sql`
6. **Update your app's config:** `DB_HOST=127.0.0.1` becomes `DB_HOST=mysql`; credentials in `mysql/defaults.env`.
7. Your CLI life moves inside: `docker compose exec workspace bash` has PHP, Composer and Node matching the container versions, not whatever brew last upgraded to.

See the full landscape, including DDEV, Sail, Herd and XAMPP: **[Laradock vs Others](/docs/laradock-alternatives)**. Ready to try it? **[Getting Started](/docs/getting-started)** takes about five minutes.
