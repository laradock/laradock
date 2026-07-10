---
slug: /services/mongo-webui
title: Mongo WebUI
description: Run a browser-based MongoDB admin UI in Laradock. Start the container, point it at your Mongo instance, and browse collections from the browser.
keywords:
  - laradock mongo webui
  - mongodb admin ui docker
  - mongoclient docker
  - mongo web client
  - mongodb gui docker compose
  - browse mongodb docker
---

## What is Mongo WebUI?

Mongo WebUI is a browser-based admin interface for MongoDB (built on the [mongoclient](https://github.com/mongoclient/mongoclient) project), letting you browse databases, collections, and documents without installing a desktop GUI. In Laradock it's a thin companion container that talks to the `mongo` service over the internal Docker network.

## Start Mongo WebUI

```bash
docker compose up -d mongo-webui
```

`compose.yml` declares `depends_on: mongo`, so Docker Compose starts the `mongo` container automatically if it isn't already running.

## Stop Mongo WebUI

```bash
docker compose stop mongo-webui
```

## Configuration

All settings live in `mongo-webui/defaults.env`:

| Variable | Default | What it does |
|---|---|---|
| `MONGO_WEBUI_PORT` | `3000` | Host-side port the UI is published on (`host:container`). |
| `MONGO_WEBUI_ROOT_URL` | `http://localhost` | Root URL the UI reports itself as running at. |
| `MONGO_WEBUI_MONGO_URL` | `mongodb://mongo:27017/` | Connection string the UI uses to reach the `mongo` container by name. |
| `MONGO_WEBUI_INSTALL_MONGO` | `false` | Whether the image should bundle and manage its own embedded MongoDB instance instead of connecting to an external one. |

## Access the UI

With both `mongo` and `mongo-webui` running, open [http://localhost:3000](http://localhost:3000) (or your `MONGO_WEBUI_PORT`). Connect using the `mongo` container's credentials (`MONGO_USERNAME`/`MONGO_PASSWORD` from `mongo/defaults.env`) if authentication is enabled on that instance.

## Point it at a different Mongo instance

By default `MONGO_WEBUI_MONGO_URL` targets Laradock's own `mongo` service by container name. To browse a different MongoDB instance (a remote server, or one outside Laradock), override `MONGO_WEBUI_MONGO_URL` in `.env` with its full connection string and restart the container.

## Common issues

- **Blank page or connection error on load.** Make sure `mongo` is actually up (`docker compose ps mongo`), Mongo WebUI depends on it but a slow first boot of Mongo can still leave the UI briefly unable to connect.
- **Can't reach it from another machine.** `MONGO_WEBUI_ROOT_URL` defaults to `http://localhost`; if you're accessing it from another host, adjust accordingly.
- **Port already in use on your host.** Another local service is bound to `3000`. Change `MONGO_WEBUI_PORT` in `.env` and restart.
- **Wrong data shows up.** Double check `MONGO_WEBUI_MONGO_URL` isn't still pointing at a stale or unintended Mongo instance after switching projects.

---

Need the database itself, not just the UI? See **[MongoDB](/docs/services/mongo)**. For the full list of services, see **[Getting Started](/docs/getting-started)**.
