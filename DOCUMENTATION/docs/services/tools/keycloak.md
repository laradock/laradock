---
slug: /services/keycloak
title: Keycloak
description: Run Keycloak in Laradock for identity and access management. Start the container, log in as admin, and configure its Postgres-backed database.
keywords:
  - laradock keycloak
  - keycloak docker
  - keycloak docker compose
  - keycloak admin login
  - keycloak postgres
---

## What is Keycloak?

[Keycloak](https://www.keycloak.org) is an open-source identity and access management server: single sign-on, OAuth2/OpenID Connect, SAML, user federation, and admin consoles for managing realms and clients. Laradock runs it via the official [Bitnami Keycloak image](https://hub.docker.com/r/bitnami/keycloak), backed by the `postgres` container.

## Start Keycloak

Keycloak depends on `postgres`, so make sure it's running too:

```bash
docker compose up -d postgres keycloak
```

## Stop Keycloak

```bash
docker compose stop keycloak
```

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

```bash
docker compose up -d postgres keycloak
```

Open [http://localhost:8081](http://localhost:8081) and sign in with `admin` / `secret` (or your own `KEYCLOAK_ADMIN_USER`/`KEYCLOAK_ADMIN_PASSWORD`).

## Common issues

- **Keycloak can't reach its database.** Confirm `postgres` is running (`docker compose ps postgres`) and that `KEYCLOAK_POSTGRES_INIT=true` was set the first time `postgres` initialized its data folder, that flag only creates the database/role on the very first boot.
- **Admin login fails after changing credentials.** `KEYCLOAK_ADMIN_USER`/`KEYCLOAK_ADMIN_PASSWORD` only seed the admin account on first boot. Changing them later in `.env` doesn't update the existing user, change the password from inside the admin console instead.
- **Port already in use.** Change `KEYCLOAK_HTTP_PORT` in `.env` and restart: `docker compose up -d keycloak`.

---

Need a general-purpose Postgres database instead? See the **[Databases guide](/docs/Intro#supported-services)**. New to Laradock? Start at **[Getting Started](/docs/getting-started)**.
