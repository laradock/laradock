---
slug: /services/pgbackups
title: pgbackups
description: Scheduled, automatic PostgreSQL backups in Laradock via postgres-backup-local. Start the sidecar container, find your backups, and fix common issues.
keywords:
  - laradock pgbackups
  - postgres backup docker
  - postgres-backup-local docker
  - automatic postgres backups
  - scheduled database backup docker
  - laradock backup postgres
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

## What is pgbackups?

`pgbackups` is a companion sidecar container that takes scheduled, automatic backups of the [`postgres`](/docs/services/postgres) service, built on [prodrigestivill/postgres-backup-local](https://github.com/prodrigestivill/docker-postgres-backup-local). It doesn't run a database of its own, it connects to your existing `postgres` container and dumps it on a schedule.

## Start pgbackups

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock start pgbackups
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose up -d pgbackups
```

</TabItem>
</Tabs>

Make sure `postgres` is running too, `pgbackups` links to it and has nothing to back up otherwise:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock start postgres pgbackups
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose up -d postgres pgbackups
```

</TabItem>
</Tabs>

## Stop pgbackups

Stopping just pauses the scheduled backups, backups already written to `../backup` are untouched:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock stop pgbackups
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose stop pgbackups
```

</TabItem>
</Tabs>

To delete the container entirely (existing backups on disk are still untouched, they live under `../backup`):

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock remove pgbackups
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose rm -sf pgbackups
```

</TabItem>
</Tabs>

## Configuration

`pgbackups` has no `defaults.env` of its own. Its `environment:` block in `pgbackups/compose.yml` reuses the same variables as the `postgres` service, defined at the repo root in `.env.example`:

| Variable | Default | What it does |
|---|---|---|
| `POSTGRES_DB` | `default` | Database dumped on each backup run. |
| `POSTGRES_USER` | `default` | User used to connect and run the dump. |
| `POSTGRES_PASSWORD` | `secret` | Password for `POSTGRES_USER`. |

There's also a `POSTGRES_HOST` line in `pgbackups/compose.yml`, but as shipped it reads `POSTGRES_HOST={POSTGRES_HOST}` (missing the `$` for variable interpolation), so it's passed to the container literally as the string `{POSTGRES_HOST}` rather than being substituted from `.env`. In practice this doesn't break backups because the image's own entrypoint falls back to the linked `postgres` host, but don't rely on setting `POSTGRES_HOST` in `.env` to change it, edit `pgbackups/compose.yml` directly if you need a non-default host.

## Where backups are written

```
../backup
```

That's one level above your Laradock folder on the host (mounted to `/backups` in the container). Inside it, `postgres-backup-local` organizes dumps into `last/`, `daily/`, `weekly/`, and `monthly/` subfolders, each holding gzip-compressed `.sql.gz` files, so the same backup gets retained at different granularities as it ages.

## Change the schedule or retention

The image supports its own environment variables for this (`SCHEDULE`, `BACKUP_KEEP_DAYS`, `BACKUP_KEEP_WEEKS`, `BACKUP_KEEP_MONTHS`, and more, see the [postgres-backup-local docs](https://github.com/prodrigestivill/docker-postgres-backup-local)). None are set by default in `pgbackups/compose.yml`, so the image's own defaults apply (a daily backup, keeping the last 7 daily / 4 weekly / 6 monthly copies). Add the variables you want to override under its `environment:` block, then recreate the container so it picks them up:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock start pgbackups
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose up -d pgbackups
```

</TabItem>
</Tabs>

## Trigger a backup on demand

Don't want to wait for the schedule? Run the image's own backup script directly inside the running container:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock exec -T pgbackups /backup.sh
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose exec -T pgbackups /backup.sh
```

</TabItem>
</Tabs>

This runs a dump immediately using the container's current environment, on top of (not instead of) its regular schedule.

## Restore a backup into postgres

`pgbackups` only takes backups, it doesn't restore them, restoring is a two-step job that goes through `postgres` directly. First unzip the dump you want on your host:

```bash
gunzip -k ../backup/last/default-latest.sql.gz
```

Replace `default` with your `POSTGRES_DB` if you changed it. Then feed the unzipped `.sql` file into `postgres`:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock exec -T postgres psql -U default -d default < ../backup/last/default-latest.sql
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose exec -T postgres psql -U default -d default < ../backup/last/default-latest.sql
```

</TabItem>
</Tabs>

Replace `default`/`default` with your `POSTGRES_USER`/`POSTGRES_DB` if you changed them from the defaults. The target database has to already exist in `postgres`, this doesn't create it for you.

## Common issues

- **No backups appear.** Confirm `postgres` is actually running, `pgbackups` links to it and will keep retrying/failing silently in its logs otherwise. Check with `./laradock logs pgbackups`.
- **Wrong credentials in backups.** `pgbackups` reuses `POSTGRES_DB`/`POSTGRES_USER`/`POSTGRES_PASSWORD` from the main `postgres` service. If you changed those for `postgres` after `pgbackups` was already running, restart `pgbackups` to pick up the new values.
- **`../backup` folder not found on host.** Docker creates it automatically on first run if it doesn't exist, but confirm you have write access to the parent directory of your Laradock folder.
- **Backups exist but you're not sure how fresh they are.** Check `../backup/last/` on your host, it always holds a copy of the most recent successful backup.

---

Need the database itself? See the **[Databases guide](/docs/Intro#supported-services)** for Postgres. Back to the **[Getting Started guide](/docs/getting-started)**.
