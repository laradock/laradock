---
slug: /services/keycloak
title: Keycloak
description: Run Keycloak in Laradock for identity and access management. Start the container, log in as admin, back up and restore realms, and configure its Postgres-backed database.
keywords:
  - laradock keycloak
  - keycloak docker
  - keycloak docker compose
  - keycloak admin login
  - keycloak postgres
  - keycloak realm export
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

## What is Keycloak?

[Keycloak](https://www.keycloak.org) is an open-source identity and access management server: single sign-on, OAuth2/OpenID Connect, SAML, user federation, and admin consoles for managing realms and clients. Laradock runs it via the official [Bitnami Keycloak image](https://hub.docker.com/r/bitnami/keycloak), backed by the `postgres` container.

## Start Keycloak

Keycloak needs `postgres` to store its realms, users, and clients, so start both together:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock start postgres keycloak
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose up -d postgres keycloak
```

</TabItem>
</Tabs>

## Stop Keycloak

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock stop keycloak
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose stop keycloak
```

</TabItem>
</Tabs>

Keycloak itself keeps no data on disk, everything (realms, users, clients) lives in the `postgres` database, so stopping or removing the `keycloak` container never touches your data.

## Configuration

Settings live in `keycloak/defaults.env` and can be overridden in your own `.env`:

| Variable | Default | What it does |
|---|---|---|
| `KEYCLOAK_VERSION` | `latest` | Image tag from the [Bitnami Keycloak Docker Hub page](https://hub.docker.com/r/bitnami/keycloak/tags). |
| `KEYCLOAK_HTTP_PORT` | `8081` | Host and container port Keycloak is published on. |
| `KEYCLOAK_CREATE_ADMIN_USER` | `true` | Whether to auto-create the initial admin user on first boot. |
| `KEYCLOAK_ADMIN_USER` | `admin` | Initial admin username. |
| `KEYCLOAK_ADMIN_PASSWORD` | `secret` | Initial admin password. |
| `KEYCLOAK_POSTGRES_HOST` | `postgres` | Hostname of the Postgres container Keycloak connects to. |

The database name, user, and password (`KEYCLOAK_POSTGRES_DB`, `KEYCLOAK_POSTGRES_USER`, `KEYCLOAK_POSTGRES_PASSWORD`) aren't in `keycloak/defaults.env`, they live in the root `.env.example` (default `laradock_keycloak` for all three) and are passed into the `postgres` container, which auto-creates that database and role on first boot when `KEYCLOAK_POSTGRES_INIT=true` (set in `postgres/defaults.env`).

## Log in to the admin console

Once both containers are up, open [http://localhost:8081](http://localhost:8081) (or your own `KEYCLOAK_HTTP_PORT`) and sign in with `admin` / `secret` (or your own `KEYCLOAK_ADMIN_USER`/`KEYCLOAK_ADMIN_PASSWORD`).

## Backup and restore

Keycloak stores everything (realms, clients, users, credentials) in the `laradock_keycloak` database inside `postgres`, so backing it up means dumping that one database, the same way you would for any Postgres-backed app:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock exec -T postgres pg_dump -U laradock_keycloak laradock_keycloak > keycloak-backup.sql
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose exec -T postgres pg_dump -U laradock_keycloak laradock_keycloak > keycloak-backup.sql
```

</TabItem>
</Tabs>

Replace `laradock_keycloak` with your own `KEYCLOAK_POSTGRES_USER`/`KEYCLOAK_POSTGRES_DB` if you changed them. The `-T` disables the container's pseudo-terminal so the dump isn't corrupted when redirected to a file.

**Restore** into an existing (empty) `laradock_keycloak` database:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock exec -T postgres psql -U laradock_keycloak laradock_keycloak < keycloak-backup.sql
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose exec -T postgres psql -U laradock_keycloak laradock_keycloak < keycloak-backup.sql
```

</TabItem>
</Tabs>

Restart Keycloak afterwards (`./laradock restart keycloak`) so it doesn't hold a stale connection to the database it was just restored into.

## Export and import individual realms

For moving a single realm between environments (not a full database backup), Keycloak has its own realm export/import, independent of Postgres:

- **From the admin console:** open a realm, go to **Realm settings → Action → Partial export**, and choose whether to include groups/roles and clients. This downloads a realm JSON file you can hand to a teammate or re-import elsewhere via **Realm settings → Action → Partial import**.
- **From the command line** (full export including users, not available from the console): the image ships Keycloak's `kc.sh` script at `/opt/bitnami/keycloak/bin/kc.sh`. Exports and imports run in their own startup mode, so stop the server first:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock stop keycloak
./laradock exec keycloak /opt/bitnami/keycloak/bin/kc.sh export --dir /tmp/export --realm myrealm
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose stop keycloak
docker compose exec keycloak /opt/bitnami/keycloak/bin/kc.sh export --dir /tmp/export --realm myrealm
```

</TabItem>
</Tabs>

Copy the resulting JSON out of the container with `docker cp`, then import it the same way with `kc.sh import --dir /tmp/export` on the target environment before starting Keycloak again.

## Start completely fresh (wipe all data)

Since Keycloak keeps no data of its own, wiping it means dropping and recreating its Postgres database (⚠️ this **permanently deletes** every realm, client, and user, back up first if you need anything):

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock exec postgres psql -U laradock_keycloak -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;" laradock_keycloak
./laradock restart keycloak
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose exec postgres psql -U laradock_keycloak -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;" laradock_keycloak
docker compose restart keycloak
```

</TabItem>
</Tabs>

Keycloak re-runs its own first-boot database migrations and, if `KEYCLOAK_CREATE_ADMIN_USER=true`, re-seeds the initial admin user on the next start.

## Talk to this Keycloak from another Laradock project

Each Laradock project is its own isolated Docker network by default, so a second project can't reach this Keycloak by container name out of the box, useful if you want one shared SSO server for several local apps. Point the other project's OIDC/SAML client at your **host machine's** address instead of `keycloak`, for example `http://host.docker.internal:8081` (Docker Desktop) using this project's `KEYCLOAK_HTTP_PORT`. Make sure only one Laradock project publishes that port at a time, or give each a unique `KEYCLOAK_HTTP_PORT`.

## Common issues

- **Keycloak can't reach its database.** Confirm `postgres` is running (`docker compose ps postgres`) and that `KEYCLOAK_POSTGRES_INIT=true` was set the first time `postgres` initialized its data folder, that flag only creates the database/role on the very first boot.
- **Admin login fails after changing credentials.** `KEYCLOAK_ADMIN_USER`/`KEYCLOAK_ADMIN_PASSWORD` only seed the admin account on first boot. Changing them later in `.env` doesn't update the existing user, change the password from inside the admin console instead.
- **Port already in use.** Change `KEYCLOAK_HTTP_PORT` in `.env` and restart: `./laradock restart keycloak`.
- **Changes disappear after `./laradock remove keycloak`.** That's expected, Keycloak keeps no local data; as long as `postgres` and its `laradock_keycloak` database are untouched, everything comes back on the next `./laradock start keycloak`.

---

Need a general-purpose Postgres database instead? See the **[Databases guide](/docs/Intro#supported-services)**. New to Laradock? Start at **[Getting Started](/docs/getting-started)**.
