---
slug: /maintenance
title: Maintenance & Upgrades
description: Keep your Laradock customizations under version control while still pulling upstream updates, and how to upgrade an older Laradock (Docker Toolbox, v3) to the current version.
keywords:
  - laradock upgrade
  - laradock fork submodule
  - laradock version control
  - docker toolbox to docker desktop
  - laradock v4
  - docker compose build no-cache
---

Keeping Laradock current, and keeping your own customizations tracked alongside it.

## Update Laradock

A Laradock update is just newer commits on `master`: new services, version bumps, and fixes. To pull them into your project:

1. Pull the latest: `git pull origin master` (or `git submodule update --remote` if you run Laradock as a submodule).
2. Rebuild so image changes take effect: `./laradock rebuild` (or `docker compose build`).
3. Start again: `./laradock start` (or `docker compose up -d`).

:::tip
After a big update, skim your `.env` against the refreshed `.env.example`, new services occasionally add new variables. Your `.env` always wins, so nothing is overwritten; you're only checking for options worth turning on.
:::

## Track your own changes

To keep your Laradock customizations under version control while still pulling upstream updates:

1. Fork the Laradock repository.
2. Use your fork as a submodule inside your project.
3. Commit your changes to your fork.
4. Pull from the upstream repository periodically to stay current.

## Upgrading from a very old Laradock

Only relevant if you're coming from a pre-Docker-Desktop setup (Docker Toolbox / VirtualBox) or Laradock v3:

1. Stop the old Docker VM: `docker-machine stop {default}`.
2. Install [Docker Desktop for Mac](https://docs.docker.com/docker-for-mac/) or [Windows](https://docs.docker.com/docker-for-windows/).
3. Update Laradock: `git pull origin master`.
4. Use Laradock as usual: `./laradock start nginx mysql` (or `docker compose up -d nginx mysql`).

:::warning
If the last step fails, rebuild everything with `./laradock rebuild --no-cache` (or `docker compose build --no-cache`). **Warning:** container data might be lost, [back it up first](/docs/volumes#back-up-a-services-data).
:::
