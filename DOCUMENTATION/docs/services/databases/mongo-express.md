---
slug: /services/mongo-express
title: Mongo Express
description: Run a browser-based MongoDB admin UI in Laradock using mongo-express. Browse databases, collections, and documents; run ad-hoc queries; configure auth, TLS, OIDC; harden the UI for staging.
keywords:
  - laradock mongo express
  - mongodb admin ui docker
  - mongo-express docker
  - mongodb gui docker compose
  - browse mongodb docker
  - edit mongodb collections browser
  - mongodb gridfs browser
  - mongodb oidc admin ui
  - mongodb replica set admin
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

## What is Mongo Express?

[Mongo Express](https://github.com/mongo-express/mongo-express) is a web-based admin interface for MongoDB and MongoDB-compatible services (FerretDB, Amazon DocumentDB), written in Node.js, Express, and Bootstrap 5. It runs entirely in the browser and is aimed at the developer who needs to look at collections, fix a stuck document, or run an ad-hoc aggregation without leaving the keyboard. In Laradock it's a thin companion container that talks to the `mongo` service over the internal Docker network.

## Features

mongo-express is a full read/write admin UI, not just a viewer. Highlights from upstream:

- Browse, create, rename, and drop **databases** and **collections**.
- Browse, create, update, and delete **documents**, with full **BSON data type** support.
- **GridFS** support: add, get, and delete very large files (audio, video, images) from inside the UI.
- **Inline previews** for audio, video, and image assets in the collection view.
- Async, on-demand loading of document properties larger than 100 KB so the collection view stays fast on big documents.
- **Replica set** support.
- **Database blacklist/whitelist** to restrict which databases the UI can see.
- **Custom CA / TLS** for the MongoDB connection (with optional CA validation disable for self-signed dev certs).
- **HTTP basic auth**, **form-based auth**, and **OpenID Connect (OIDC)** for the UI itself.
- `ME_CONFIG_OPTIONS_*` flags for read-only mode, no-delete mode, full-width layout, and persisting the editor view after Save.

For the full list see the [upstream README](https://github.com/mongo-express/mongo-express#features).

## Start Mongo Express

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock start mongo-express
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose up -d mongo-express
```

</TabItem>
</Tabs>

`compose.yml` declares `depends_on: mongo`, so Docker Compose starts the `mongo` container automatically if it isn't already running.

## Stop Mongo Express

Stopping just pauses the container; its settings are safe:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock stop mongo-express
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose stop mongo-express
```

</TabItem>
</Tabs>

To delete the container entirely:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock remove mongo-express
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose rm -sf mongo-express
```

</TabItem>
</Tabs>

## Configuration

All settings live in `mongo-express/defaults.env`. Override any of them in your root `.env` (root `.env` always wins over `defaults.env`).

### Connection

| Variable | Default | What it does |
|---|---|---|
| `ME_VERSION` | `1.0.2` | Upstream `mongo-express` image tag passed as a build arg (pinned to the current stable release). |
| `ME_PORT` | `8087` | Host-side port the UI is published on (`host:container`, container port is fixed at `8081` upstream). Defaults to `8087` to avoid colliding with `phpmyadmin`'s `8081`; set `ME_PORT=8081` in your root `.env` if you don't run phpmyadmin. |
| `ME_CONFIG_MONGODB_SERVER` | `mongo` | Hostname the UI connects to. Defaults to the Laradock `mongo` service by container name. |
| `ME_CONFIG_MONGODB_PORT` | `27017` | Port on `ME_CONFIG_MONGODB_SERVER`. |
| `ME_CONFIG_MONGODB_URL` | _(unset)_ | Single-connection-string alternative to `MONGODB_SERVER`/`MONGODB_PORT`/`MONGODB_AUTH_*`. Useful for connecting to a remote MongoDB or to Amazon DocumentDB; should include credentials when auth is on (for example `mongodb://root:password@mongo:27017/?authSource=admin`). When set, it overrides the split vars. |
| `ME_CONFIG_MONGODB_ENABLE_ADMIN` | `false` | Whether to authenticate as an admin user (and therefore see every database plus server stats). Laradock's `mongo` service runs unauthenticated by default, so we leave this off; flip it on together with `ME_CONFIG_MONGODB_AUTH_*` to log in as admin. Note: upstream's own default is `true` and assumes auth is enabled. |
| `ME_CONFIG_MONGODB_AUTH_DATABASE` | _(unset)_ | Auth database for the MongoDB user (typically `admin`). |
| `ME_CONFIG_MONGODB_AUTH_USERNAME` | _(unset)_ | MongoDB username for connecting to the server. |
| `ME_CONFIG_MONGODB_AUTH_PASSWORD` | _(unset)_ | MongoDB password for connecting to the server. |
| `ME_CONFIG_MONGODB_ALLOW_DISK_USE` | `false` | Remove the 100 MB-per-stage RAM cap on aggregation pipelines so they can spill to disk. Enable for heavy analytics workloads. |
| `ME_CONFIG_MONGODB_AWS_DOCUMENTDB` | `false` | Switch on Amazon DocumentDB compatibility (experimental). |

### TLS to MongoDB

| Variable | Default | What it does |
|---|---|---|
| `ME_CONFIG_MONGODB_TLS` | `false` | Connect to MongoDB over TLS. |
| `ME_CONFIG_MONGODB_TLS_ALLOW_CERTS` | `true` | Validate the mongod server certificate against the configured CA. Set to `false` only for self-signed dev certs. |
| `ME_CONFIG_MONGODB_TLS_CA_FILE` | _(unset)_ | Path inside the container to a CA bundle (`.pem`). |
| `ME_CONFIG_MONGODB_TLS_CERT_KEY_FILE` | _(unset)_ | Path inside the container to a client certificate + key (`.pem`). |
| `ME_CONFIG_MONGODB_TLS_CERT_KEY_FILE_PASSWORD` | _(unset)_ | Password for the client key file. |
| `ME_CONFIG_MONGODB_TLS_CRL_FILE` | _(unset)_ | Path inside the container to a certificate revocation list (`.pem`). |

### UI site

| Variable | Default | What it does |
|---|---|---|
| `ME_CONFIG_SITE_BASEURL` | `/` | Express `baseUrl` for mounting at a subdirectory. Include leading and trailing slash. |
| `ME_CONFIG_SITE_HOST` | `0.0.0.0` | Hostname the UI advertises itself as running on (mostly cosmetic). |
| `ME_CONFIG_SITE_PORT` | `8081` | Port the UI advertises itself as running on (cosmetic; the real listen port is the upstream default of `8081` inside the container). |
| `ME_CONFIG_SITE_TITLE` | `Mongo Express` | Title shown in the browser tab and page header. |
| `ME_CONFIG_SITE_COOKIESECRET` | _(unset)_ | String used by `cookie-parser` to sign cookies. Set this in any environment you don't want session cookies to be forgeable in. |
| `ME_CONFIG_SITE_SESSIONSECRET` | _(unset)_ | String used to sign the session ID cookie. Set this in any environment you don't want session cookies to be forgeable in. |
| `ME_CONFIG_HEALTH_CHECK_PATH` | `/status` | HTTP endpoint mongo-express responds on for health checks (add it to a compose healthcheck or a reverse proxy). |

### UI authentication

| Variable | Default | What it does |
|---|---|---|
| `ME_CONFIG_BASICAUTH` | `false` | **Deprecated**, use `ME_CONFIG_BASICAUTH_ENABLED` instead. |
| `ME_CONFIG_BASICAUTH_ENABLED` | `false` | Enable HTTP basic auth on the UI. Accepts the strings `"true"` or `"false"`. |
| `ME_CONFIG_AUTH_STRATEGY` | _(unset)_ | How visitors sign in: `basic` (browser prompt), `form` (sign-in page; works with password managers), or `oidc`. Unset means mongo-express picks based on which flags below are on. |
| `ME_CONFIG_BASICAUTH_USERNAME` | `admin` | mongo-express web login name. |
| `ME_CONFIG_BASICAUTH_USERNAME_FILE` | _(unset)_ | File version of `ME_CONFIG_BASICAUTH_USERNAME` (read on container start). |
| `ME_CONFIG_BASICAUTH_PASSWORD` | `pass` | mongo-express web login password. |
| `ME_CONFIG_BASICAUTH_PASSWORD_FILE` | _(unset)_ | File version of `ME_CONFIG_BASICAUTH_PASSWORD`. |

### OpenID Connect (OIDC) auth

OIDC requires the image to be built with `ENABLE_OIDC=true` (Laradock's `Dockerfile` does **not** currently pass this, so OIDC is not available out of the box — see [Common issues](#common-issues) for the workaround).

| Variable | Default | What it does |
|---|---|---|
| `ME_CONFIG_OIDCAUTH_ENABLED` | `false` | Enable OIDC auth on the UI. |
| `ME_CONFIG_OIDCAUTH_ISSUER` | _(unset)_ | OIDC issuer URL (the root that serves `/.well-known/openid-configuration`). |
| `ME_CONFIG_OIDCAUTH_CLIENTID` | _(unset)_ | OAuth2 client ID (must be a private client allowed to perform the Authorization Code Flow). |
| `ME_CONFIG_OIDCAUTH_CLIENTSECRET` | _(unset)_ | OAuth2 client secret. |
| `ME_CONFIG_OIDCAUTH_SECRET` | _(unset)_ | Random secret used by the library to init the Authorization Code Flow (required). |
| `ME_CONFIG_OIDCAUTH_BASEURL` | _(unset)_ | Base URL used to build the redirect URL (for example `https://mongo.laradock.local/callback`). Falls back to `ME_CONFIG_SITE_BASEURL`. |
| `ME_CONFIG_OIDCAUTH_*_FILE` | _(unset)_ | File version of each of the OIDC vars above, read on container start. |

### Behavior toggles

These are the `ME_CONFIG_OPTIONS_*` flags; all default to `false`. Handy for staging or read-only mirrors of production.

| Variable | What it does when `true` |
|---|---|
| `ME_CONFIG_OPTIONS_READONLY` | Hides every "write" UI affordance; the UI becomes a pure viewer. |
| `ME_CONFIG_OPTIONS_NO_DELETE` | Hides delete affordances (drop database, drop collection, delete document) but keeps create/update. |
| `ME_CONFIG_OPTIONS_NO_RAW_COMMAND` | Hides the Raw tab in the collection view (which lets you run arbitrary MongoDB commands). |
| `ME_CONFIG_OPTIONS_FULLWIDTH_LAYOUT` | Switches to a wider page layout that uses the full window. |
| `ME_CONFIG_OPTIONS_PERSIST_EDIT_MODE` | Stays on the editor page after clicking Save instead of returning to the collection list. |

### Body / payload limits

| Variable | Default | What it does |
|---|---|---|
| `ME_CONFIG_REQUEST_SIZE` | `50` | Maximum Mongo update payload size in MB, enforced by `body-parser`. CRUD operations above this size fail. Bump it for very large GridFS uploads or bulk updates. |

## Access the UI

With both `mongo` and `mongo-express` running, open [http://localhost:8087](http://localhost:8087) (or your `ME_PORT`). You'll be prompted for the mongo-express basic-auth credentials (`ME_CONFIG_BASICAUTH_USERNAME` / `ME_CONFIG_BASICAUTH_PASSWORD`); that login is separate from any MongoDB credentials. The UI then talks to the `mongo` service anonymously, which is the Laradock default.

From inside the UI, you can:

- Click any database to see its collections.
- Click any collection to see documents (use the filter bar to narrow down with a Mongo query, and use the Raw tab to run arbitrary commands).
- Drag a file onto a GridFS bucket to upload, or click an existing file to download / delete.
- Switch theme / layout via the `ME_CONFIG_OPTIONS_*` flags if you want a tighter view.

## Enabling MongoDB auth

By default `ME_CONFIG_MONGODB_ENABLE_ADMIN=false` and mongo-express connects anonymously. If you've enabled auth on the `mongo` service (set `MONGO_USERNAME` / `MONGO_PASSWORD` in `mongo/defaults.env` or your root `.env`), add the following to your root `.env` to make the UI authenticate too, then rebuild (these are build args):

```dotenv
ME_CONFIG_MONGODB_ENABLE_ADMIN=true
ME_CONFIG_MONGODB_AUTH_DATABASE=admin
ME_CONFIG_MONGODB_AUTH_USERNAME=${MONGO_USERNAME}
ME_CONFIG_MONGODB_AUTH_PASSWORD=${MONGO_PASSWORD}
```

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock rebuild mongo-express
./laradock restart mongo-express
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose build mongo-express
docker compose up -d mongo-express
```

</TabItem>
</Tabs>

MongoDB users are scoped per auth database, so a user created in `admin` won't authenticate against `mydb` — set `ME_CONFIG_MONGODB_AUTH_DATABASE` to the one your user lives in.

The easier alternative for most teams is to set the full connection string in one var: `ME_CONFIG_MONGODB_URL=mongodb://${MONGO_USERNAME}:${MONGO_PASSWORD}@mongo:27017/?authSource=admin`, then rebuild. This is the form the upstream README recommends.

## Point it at a different Mongo instance

By default `ME_CONFIG_MONGODB_SERVER` targets Laradock's own `mongo` service by container name. To browse a different MongoDB instance (a remote server, Amazon DocumentDB, or one outside Laradock), set `ME_CONFIG_MONGODB_URL` (or the legacy `ME_CONFIG_MONGODB_SERVER` + `ME_CONFIG_MONGODB_PORT` + `ME_CONFIG_MONGODB_AUTH_*` trio) in `.env`, then rebuild and restart:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock rebuild mongo-express
./laradock restart mongo-express
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose build mongo-express
docker compose up -d mongo-express
```

</TabItem>
</Tabs>

For TLS or DocumentDB, also set the matching `ME_CONFIG_MONGODB_TLS_*` / `ME_CONFIG_MONGODB_AWS_DOCUMENTDB` vars.

## Hardening for shared / staging environments

When mongo-express is reachable by more than just you (a teammate, a staging URL, the public internet), tighten it up:

```dotenv
# Use a real password, not `pass`
ME_CONFIG_BASICAUTH_PASSWORD=<long-random-string>
# Sign cookies so sessions can't be forged
ME_CONFIG_SITE_COOKIESECRET=<openssl rand -hex 32>
ME_CONFIG_SITE_SESSIONSECRET=<openssl rand -hex 32>
# Disable the most dangerous surface
ME_CONFIG_OPTIONS_NO_DELETE=true
ME_CONFIG_OPTIONS_NO_RAW_COMMAND=true
# Or go fully read-only
ME_CONFIG_OPTIONS_READONLY=true
# Force OIDC if you've rebuilt with ENABLE_OIDC=true
ME_CONFIG_AUTH_STRATEGY=oidc
```

Then `./laradock rebuild mongo-express && ./laradock restart mongo-express`. The `ME_CONFIG_*_FILE` variants are also useful here: they let you keep the secrets out of `docker inspect` output.

## Common issues

- **Cannot connect to MongoDB.** Confirm `mongo` is actually up (`docker compose ps mongo`). `compose.yml` lists it as a dependency, but a slow first boot can still leave the UI briefly unable to connect. If `mongo` has auth on and mongo-express doesn't, you'll see repeated reconnect attempts in `docker compose logs mongo-express`.
- **401 Unauthorized on the UI.** The mongo-express basic-auth is independent of MongoDB auth; check `ME_CONFIG_BASICAUTH_USERNAME` / `ME_CONFIG_BASICAUTH_PASSWORD` (or `ME_CONFIG_BASICAUTH_ENABLED` to turn it off entirely). The default UI login is `admin` / `pass`.
- **Authentication failed even with the right MongoDB user.** `ME_CONFIG_MONGODB_AUTH_DATABASE`, `ME_CONFIG_MONGODB_AUTH_USERNAME`, and `ME_CONFIG_MONGODB_AUTH_PASSWORD` must match what `mongo` is configured with (see `mongo/defaults.env`). MongoDB users are scoped per auth database, so a user created in `admin` won't authenticate against `mydb`. Easiest fix: switch to `ME_CONFIG_MONGODB_URL=mongodb://${MONGO_USERNAME}:${MONGO_PASSWORD}@mongo:27017/?authSource=admin` and rebuild.
- **OIDC options don't work.** The Laradock `Dockerfile` builds the image without `ENABLE_OIDC=true`, so `ME_CONFIG_OIDCAUTH_*` vars are read but the OIDC code path is not installed. To enable OIDC, edit `mongo-express/Dockerfile` to add `ARG ENABLE_OIDC=true` (or change the existing line), rebuild, and set the `ME_CONFIG_OIDCAUTH_*` + `ME_CONFIG_AUTH_STRATEGY=oidc` vars.
- **Aggregation fails with `MongoServerError: exceeded memory limit`.** Raise `ME_CONFIG_MONGODB_ALLOW_DISK_USE=true`, or pre-aggregate the data outside the UI.
- **Large document edit fails with `PayloadTooLargeError`.** Raise `ME_CONFIG_REQUEST_SIZE` (in MB); default is `50`. Restart required.
- **GridFS file won't upload.** Same fix as above — the default 50 MB body limit applies to GridFS uploads too.
- **Port already in use on your host.** Laradock's `phpmyadmin` also defaults to `8081`; both can't bind that port. If you run both, either change `ME_PORT` in `.env` (and `./laradock restart mongo-express`) or stop the other. Default `ME_PORT=8087` is chosen to avoid this conflict.
- **Settings not picking up after a `.env` change.** Most `ME_CONFIG_*` values are baked into the image at build time. Run `./laradock rebuild mongo-express` after changing them. Pure runtime vars (`ME_PORT`) only need a restart.
- **Cookie / session warnings in the container log.** Set `ME_CONFIG_SITE_COOKIESECRET` and `ME_CONFIG_SITE_SESSIONSECRET` to random strings (`openssl rand -hex 32`); mongo-express warns on startup if either is empty in any non-Localhost environment.

---

Need the database itself, not just the UI? See **[MongoDB](/docs/services/mongo)**. For an alternative UI, see **[Mongo WebUI](/docs/services/mongo-webui)**. For the full list of services, see **[Getting Started](/docs/getting-started)**.
