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

## What is Confluence?

[Confluence](https://www.atlassian.com/software/confluence) is Atlassian's team wiki and documentation platform. Laradock runs it via the official `atlassian/confluence-server` image, backed by the `postgres` container.

> Confluence is a licensed Atlassian product. You'll need an evaluation or paid license from Atlassian to get past initial setup.

## Start Confluence

Confluence depends on `postgres`, so make sure it's running too:

```bash
docker compose up -d postgres confluence
```

## Stop Confluence

```bash
docker compose stop confluence
```

## Configuration

Settings live in `confluence/defaults.env` and can be overridden in your own `.env`:

| Variable | Default | What it does |
|---|---|---|
| `CONFLUENCE_VERSION` | `6.13-ubuntu-18.04-adoptopenjdk8` | Image tag from the [`atlassian/confluence-server` Docker Hub page](https://hub.docker.com/r/atlassian/confluence-server/). Pin this to control which Confluence version you run. |
| `CONFLUENCE_HOST_HTTP_PORT` | `8090` | Host port Confluence is published on (container always listens on `8090` internally). |

Confluence's database name, user, and password (`CONFLUENCE_POSTGRES_DB`, `CONFLUENCE_POSTGRES_USER`, `CONFLUENCE_POSTGRES_PASSWORD`) live in `postgres/defaults.env` (default `laradock_confluence` for all three), which also sets `CONFLUENCE_POSTGRES_INIT=true` so the database and role are created automatically the first time `postgres` initializes its data folder. Application data (attachments, indexes, config) persists under `DATA_PATH_HOST/Confluence`.

## First-time setup

```bash
docker compose up -d postgres confluence
```

Open [http://localhost:8090](http://localhost:8090) and walk through Confluence's own setup wizard: license entry, database connection (point it at the `postgres` container using the `CONFLUENCE_POSTGRES_*` credentials above), and initial admin account.

## Serve it through NGINX with SSL

1. Copy `nginx/sites/confluence.conf.example` to a new file in the same folder and replace the sample domain with yours.
2. Configure SSL keys for your domain (see the [NGINX guide](/docs/services/nginx) for certificate setup).

Confluence stays reachable directly on `8090` regardless, NGINX just adds a proper domain and TLS in front of it.

## Common issues

- **Setup wizard asks for a license every restart.** That means `DATA_PATH_HOST/Confluence` isn't persisting between restarts, check your `DATA_PATH_HOST` value and that the volume actually mounted.
- **Confluence can't connect to its database.** Confirm `postgres` is running and that `CONFLUENCE_POSTGRES_INIT=true` was set the first time `postgres` initialized, that flag only creates the database/role on first boot.
- **Container takes a long time to become reachable.** This is normal for Confluence, it's a JVM application with a real startup sequence; check `docker compose logs confluence` before assuming it's stuck.
- **Port already in use on your host.** Change `CONFLUENCE_HOST_HTTP_PORT` in `.env` and restart: `docker compose up -d confluence`.

---

Fronting it with a domain and TLS? See the **[NGINX guide](/docs/services/nginx)**. New to Laradock? Start at **[Getting Started](/docs/getting-started)**.
