---
slug: /azuracast-on-docker
title: Run AzuraCast on Docker
description: What AzuraCast's own Docker setup does, why it does not fit inside Laradock's containers, and where to go for the official installation instead.
keywords:
  - azuracast on docker
  - run azuracast on docker
  - azuracast docker
  - azuracast docker setup
  - dockerize azuracast
  - azuracast docker environment
---

## What is AzuraCast?

[AzuraCast](https://www.azuracast.com) is a self-hosted platform for running internet radio stations: it manages streaming (via Icecast/Liquidsoap), playlists, scheduling, a web-based DJ/admin panel and listener analytics. It is a full station management system, not a small app you drop a web server in front of.

## Why run AzuraCast in Docker?

Docker packages a stack this size (web panel, database, cache, streaming daemons, background workers) into isolated containers that run the same on every machine, instead of installing all of that natively and managing version drift and service conflicts by hand. For a platform with this many moving parts, that isolation matters even more than for a typical PHP app.

## Why Laradock is not the natural fit here

Unlike every other project in this series, AzuraCast is not a good match for "add it as an app inside Laradock's containers", and it would be dishonest to pretend otherwise.

AzuraCast ships and requires its own complete, self-managed Docker Compose stack. Its official installer (`docker.sh`) downloads and manages its own `docker-compose.yml`, provisioning its own internal NGINX, MariaDB, Redis, and the streaming/worker containers it needs, and it owns their lifecycle (updates, backups, service restarts) through that same script. This is not an optional convenience; it is effectively the only supported way to run AzuraCast.

Running AzuraCast's application code inside Laradock's `nginx`/`php-fpm`/`mysql` containers would mean fighting that internal orchestration: AzuraCast's own compose file expects to own its database and cache, its own container names and networking, and its own update path. You would be maintaining a fork of AzuraCast's deployment model instead of using it, with no real benefit over just running AzuraCast's installer.

**If you want to run AzuraCast, use its own official installer** on a host with Docker installed:

```bash
mkdir -p /var/azuracast
cd /var/azuracast
curl -fsSL https://raw.githubusercontent.com/AzuraCast/AzuraCast/main/docker.sh > docker.sh
chmod a+x docker.sh
./docker.sh install
```

That script sets up AzuraCast's full stack correctly and keeps it updatable. Full instructions are in [AzuraCast's own Docker documentation](https://www.azuracast.com/docs/getting-started/installation/docker/).

### If you want to experiment anyway

If you already run other PHP projects behind Laradock and just want to poke at AzuraCast's codebase (development, not a real station), run AzuraCast's own compose stack as a separate, independent set of containers alongside Laradock, on different ports. Do not try to point Laradock's `nginx`/`mysql`/`php-fpm` at AzuraCast's application code; it is not built to run that way, and its installer assumes full ownership of its own containers.

---

Comparing environments? See the full **[Laradock vs Others](/docs/laradock-alternatives)** breakdown. Looking for a PHP project that does fit Laradock's pattern? **[Getting Started](/docs/getting-started)** takes about five minutes.
