---
slug: /services/confluence
title: Confluence
description: Run Atlassian Confluence in Laradock. Start the container, license it, and optionally front it with NGINX and SSL.
keywords:
  - laradock confluence
  - confluence docker
  - confluence docker compose
  - atlassian confluence docker
  - confluence postgres
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

## What is Confluence?

[Confluence](https://www.atlassian.com/software/confluence) is Atlassian's team wiki and documentation platform. Laradock runs it via the official `atlassian/confluence-server` image, backed by the `postgres` container.

> Confluence is a licensed Atlassian product. You'll need an evaluation or paid license from Atlassian to get past initial setup.

## Start Confluence

Confluence depends on `postgres` (its `compose.yml` declares it), so start both together:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock start postgres confluence
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose up -d postgres confluence
```

</TabItem>
</Tabs>

## Stop Confluence

Stopping just pauses the container; **your data is safe**:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock stop confluence
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose stop confluence
```

</TabItem>
</Tabs>

To delete the container entirely (the data on disk is still untouched, it lives under `DATA_PATH_HOST/Confluence`):

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock remove confluence
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose rm -sf confluence
```

</TabItem>
</Tabs>

## Configuration

Settings live in `confluence/defaults.env` and can be overridden in your own `.env`:

| Variable | Default | What it does |
|---|---|---|
| `CONFLUENCE_VERSION` | `6.13-ubuntu-18.04-adoptopenjdk8` | Image tag from the [`atlassian/confluence-server` Docker Hub page](https://hub.docker.com/r/atlassian/confluence-server/). Pin this to control which Confluence version you run. |
| `CONFLUENCE_HOST_HTTP_PORT` | `8090` | Host port Confluence is published on (container always listens on `8090` internally). |

Confluence's database name, user, and password (`CONFLUENCE_POSTGRES_DB`, `CONFLUENCE_POSTGRES_USER`, `CONFLUENCE_POSTGRES_PASSWORD`) live in `postgres/defaults.env` (default `laradock_confluence` for all three), which also sets `CONFLUENCE_POSTGRES_INIT=true` so the database and role are created automatically the first time `postgres` initializes its data folder. Application data (attachments, indexes, config) persists under `DATA_PATH_HOST/Confluence`.

## First-time setup

Start Confluence and `postgres` together (see [Start Confluence](#start-confluence) above), then open [http://localhost:8090](http://localhost:8090) and walk through Confluence's own setup wizard: license entry, database connection (point it at the `postgres` container using the `CONFLUENCE_POSTGRES_*` credentials above), and initial admin account.

## Serve it through NGINX with SSL

1. Copy `nginx/sites/confluence.conf.example` to a new file in the same folder and replace the sample domain with yours.
2. Configure SSL keys for your domain (see the [NGINX guide](/docs/services/nginx) for certificate setup).

Confluence stays reachable directly on `8090` regardless, NGINX just adds a proper domain and TLS in front of it.

## Backup and restore

Confluence's state is split across two places: application data (attachments, indexes, config) on disk, and content/permissions in its `postgres` database. Back up both.

**Back up the application data** to a `.tar.gz` on your host:

```bash
tar -czf confluence-data-backup.tar.gz -C "${DATA_PATH_HOST:-~/.laradock/data}/Confluence" .
```

**Back up the database**:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock exec -T postgres pg_dump -U laradock_confluence laradock_confluence > confluence-db-backup.sql
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose exec -T postgres pg_dump -U laradock_confluence laradock_confluence > confluence-db-backup.sql
```

</TabItem>
</Tabs>

Replace the database/user names if you changed `CONFLUENCE_POSTGRES_DB`/`CONFLUENCE_POSTGRES_USER`. The `-T` disables the container's pseudo-terminal so the dump isn't corrupted when redirected to a file.

**Restore** is the reverse: stop Confluence, extract the `.tar.gz` back into `DATA_PATH_HOST/Confluence`, restore the database, then start Confluence again:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock exec -T postgres psql -U laradock_confluence -d laradock_confluence -f - < confluence-db-backup.sql
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose exec -T postgres psql -U laradock_confluence -d laradock_confluence -f - < confluence-db-backup.sql
```

</TabItem>
</Tabs>

## Start completely fresh (wipe all data)

To throw away everything and re-run Confluence's setup wizard from scratch (⚠️ this **permanently deletes** all pages, attachments, and the Confluence database, back up first if you need anything):

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock stop confluence
./laradock remove confluence
rm -rf "${DATA_PATH_HOST:-~/.laradock/data}/Confluence"
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose stop confluence
docker compose rm -sf confluence
rm -rf "${DATA_PATH_HOST:-~/.laradock/data}/Confluence"
```

</TabItem>
</Tabs>

Wiping the application data folder alone leaves the old content sitting in the `postgres` database, so the setup wizard will find an existing schema instead of starting fresh. Drop and recreate the database too (using the `postgres` root credentials, `default`/`secret` by default):

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock enter postgres
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose exec postgres bash
```

</TabItem>
</Tabs>

```bash
dropdb -U default laradock_confluence
createdb -U default -O laradock_confluence laradock_confluence
exit
```

Then start Confluence again (see [Start Confluence](#start-confluence)) and go through the setup wizard once more.

## Change the Confluence version

Set the version in your `.env`:

```env
CONFLUENCE_VERSION=7.19.24-jdk11
```

Then recreate the container, which pulls the new image tag automatically:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock start confluence
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose up -d confluence
```

</TabItem>
</Tabs>

Confluence runs its own database migration on first boot after a version bump, so [back up both the application data and the database](#backup-and-restore) before changing major versions, the same way you would for any upgrade with irreversible schema changes.

## Common issues

- **Setup wizard asks for a license every restart.** That means `DATA_PATH_HOST/Confluence` isn't persisting between restarts, check your `DATA_PATH_HOST` value and that the volume actually mounted.
- **Confluence can't connect to its database.** Confirm `postgres` is running and that `CONFLUENCE_POSTGRES_INIT=true` was set the first time `postgres` initialized, that flag only creates the database/role on first boot.
- **Container takes a long time to become reachable.** This is normal for Confluence, it's a JVM application with a real startup sequence; check `./laradock logs confluence` before assuming it's stuck.
- **Port already in use on your host.** Change `CONFLUENCE_HOST_HTTP_PORT` in `.env` and restart: `./laradock restart confluence`.

---

Fronting it with a domain and TLS? See the **[NGINX guide](/docs/services/nginx)**. New to Laradock? Start at **[Getting Started](/docs/getting-started)**.
