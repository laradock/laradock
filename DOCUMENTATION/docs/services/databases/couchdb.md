---
slug: /services/couchdb
title: CouchDB
description: Run Apache CouchDB in Laradock. Start and stop the container, configure the port, and access Fauxton or the HTTP API.
keywords:
  - laradock couchdb
  - couchdb docker
  - couchdb docker compose
  - apache couchdb docker
  - fauxton docker
  - couchdb http api
---

## What is CouchDB?

[Apache CouchDB](https://couchdb.apache.org) is a document-oriented NoSQL database that stores JSON documents and exposes its entire API over plain HTTP, including a built-in web admin UI (Fauxton). It's built around multi-master replication, making it a common choice for offline-first and sync-heavy apps. Laradock runs it via the [official CouchDB image](https://hub.docker.com/_/couchdb).

## Start CouchDB

```bash
docker compose up -d couchdb
```

It runs as its own container with no `depends_on` in `compose.yml`.

## Stop CouchDB

```bash
docker compose stop couchdb
```

This stops the container without deleting its data. Data persists under `DATA_PATH_HOST/couchdb/data`.

## Configuration

`couchdb/defaults.env` only exposes one setting:

| Variable | Default | What it does |
|---|---|---|
| `COUCHDB_PORT` | `5984` | Host-side port CouchDB's HTTP API and Fauxton UI are published on (`host:container`). |

The Dockerfile doesn't set any admin username/password, so CouchDB starts in its default "admin party" mode with no authentication configured. Set that up yourself before exposing it beyond local development, see the [CouchDB Docker Hub page](https://hub.docker.com/_/couchdb) for the `COUCHDB_USER`/`COUCHDB_PASSWORD` environment variables supported by the base image if you need to add them.

## Access Fauxton and the HTTP API

With the container running, open [http://localhost:5984/_utils](http://localhost:5984/_utils) (or your `COUCHDB_PORT`) for the Fauxton admin UI. The raw HTTP API is available at the same host/port, for example:

```bash
curl http://localhost:5984/
```

## Common issues

- **No authentication by default.** Nothing in `couchdb/defaults.env` or the Dockerfile sets admin credentials, so the instance runs open. Fine for local dev; add `COUCHDB_USER`/`COUCHDB_PASSWORD` yourself if you need to lock it down.
- **App can't connect but the container is running.** Confirm the app's config uses `couchdb` (the container name) as the host from inside other Laradock containers, not `localhost`, which only works from your host machine.
- **Port already in use on your host.** Another local CouchDB (or another Laradock project) is already bound to `5984`. Change `COUCHDB_PORT` in `.env` and restart.
- **Data not persisting across rebuilds.** Confirm `DATA_PATH_HOST` in your root `.env` points somewhere stable; CouchDB's data lives under `DATA_PATH_HOST/couchdb/data`.

---

Need a document database with stronger schema tooling? See **[MongoDB](/docs/services/mongo)**. For the full list of services, see **[Getting Started](/docs/getting-started)**.
