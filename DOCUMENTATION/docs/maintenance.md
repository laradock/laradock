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

Two recurring maintenance tasks: keeping your own customizations tracked against upstream, and moving an older Laradock install onto the current tooling.

## Track your Laradock changes

To keep your Laradock customizations under version control while staying able to pull upstream updates:

1. Fork the Laradock repository.
2. Use your fork as a submodule.
3. Commit your changes to your fork.
4. Pull from the main repository periodically.

## Upgrade Laradock

Moving from Docker Toolbox (VirtualBox) to Docker Desktop, and Laradock v3 to v4:

1. Stop the docker VM: `docker-machine stop {default}`.
2. Install [Docker Desktop for Mac](https://docs.docker.com/docker-for-mac/) or [Windows](https://docs.docker.com/docker-for-windows/).
3. Upgrade Laradock to `v4.*.*`: `git pull origin master`.
4. Use Laradock as usual: `./laradock start nginx mysql` (or `docker compose up -d nginx mysql`).

:::warning
If the last step fails, rebuild everything with `./laradock rebuild --no-cache` (or `docker compose build --no-cache`). **Warning:** container data might be lost.
:::
