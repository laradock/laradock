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

## What is pgbackups?

`pgbackups` is a companion sidecar container that takes scheduled, automatic backups of the [`postgres`](/docs/services/postgres) service, built on [prodrigestivill/postgres-backup-local](https://github.com/prodrigestivill/docker-postgres-backup-local). It doesn't run a database of its own, it connects to your existing `postgres` container and dumps it on a schedule.

## Start pgbackups

```bash
docker compose up -d pgbackups
```

Make sure `postgres` is running too, `pgbackups` links to it and has nothing to back up otherwise:

```bash
docker compose up -d postgres pgbackups
```

## Stop pgbackups

```bash
docker compose stop pgbackups
```

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

That's one level above your Laradock folder on the host (mounted to `/backups` in the container).

## Change the schedule or retention

The image supports its own environment variables for this (`SCHEDULE`, `BACKUP_KEEP_DAYS`, `BACKUP_KEEP_WEEKS`, `BACKUP_KEEP_MONTHS`, and more, see the [postgres-backup-local docs](https://github.com/prodrigestivill/docker-postgres-backup-local)). None are set by default in `pgbackups/compose.yml`, add them under its `environment:` block to change the schedule or pruning behavior.

## Common issues

- **No backups appear.** Confirm `postgres` is actually running, `pgbackups` links to it and will keep retrying/failing silently in its logs otherwise. Check with `docker compose logs pgbackups`.
- **Wrong credentials in backups.** `pgbackups` reuses `POSTGRES_DB`/`POSTGRES_USER`/`POSTGRES_PASSWORD` from the main `postgres` service. If you changed those for `postgres` after `pgbackups` was already running, restart `pgbackups` to pick up the new values.
- **`../backup` folder not found on host.** Docker creates it automatically on first run if it doesn't exist, but confirm you have write access to the parent directory of your Laradock folder.
- **Backups exist but you're not sure how fresh they are.** Filenames from `postgres-backup-local` are timestamped, list `../backup` on your host to check the latest one.

---

Need the database itself? See the **[Databases guide](/docs/Intro#supported-services)** for Postgres. Back to the **[Getting Started guide](/docs/getting-started)**.
