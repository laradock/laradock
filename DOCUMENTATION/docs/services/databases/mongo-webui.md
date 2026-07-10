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

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

## What is Mongo WebUI?

Mongo WebUI is a browser-based admin interface for MongoDB (built on the [mongoclient](https://github.com/mongoclient/mongoclient) project), letting you browse databases, collections, and documents without installing a desktop GUI. In Laradock it's a thin companion container that talks to the `mongo` service over the internal Docker network.

## Start Mongo WebUI

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock start mongo-webui
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose up -d mongo-webui
```

</TabItem>
</Tabs>

`compose.yml` declares `depends_on: mongo`, so Docker Compose starts the `mongo` container automatically if it isn't already running.

## Stop Mongo WebUI

Stopping just pauses the container; its own settings are safe:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock stop mongo-webui
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose stop mongo-webui
```

</TabItem>
</Tabs>

To delete the container entirely (its data on disk is still untouched, it lives under `DATA_PATH_HOST`):

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock remove mongo-webui
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose rm -sf mongo-webui
```

</TabItem>
</Tabs>

## Configuration

All settings live in `mongo-webui/defaults.env`:

| Variable | Default | What it does |
|---|---|---|
| `MONGO_WEBUI_PORT` | `3000` | Host-side port the UI is published on (`host:container`). |
| `MONGO_WEBUI_ROOT_URL` | `http://localhost` | Root URL the UI reports itself as running at. |
| `MONGO_WEBUI_MONGO_URL` | `mongodb://mongo:27017/` | Connection string the UI uses to reach the `mongo` container by name. |
| `MONGO_WEBUI_INSTALL_MONGO` | `false` | Whether the image should bundle and manage its own embedded MongoDB instance instead of connecting to an external one. |

## Access the UI

With both `mongo` and `mongo-webui` running, open [http://localhost:3000](http://localhost:3000) (or your `MONGO_WEBUI_PORT`). The first time you open it you'll be asked to create an account for the UI itself, this login is separate from any MongoDB credentials and is stored in Mongo WebUI's own data (see [Configuration](#configuration) and the volume below), not in the `mongo` container. If authentication is enabled on the `mongo` instance you're connecting to, you'll also need its `MONGO_USERNAME`/`MONGO_PASSWORD` (from `mongo/defaults.env`) once inside.

## Point it at a different Mongo instance

By default `MONGO_WEBUI_MONGO_URL` targets Laradock's own `mongo` service by container name. To browse a different MongoDB instance (a remote server, or one outside Laradock), override `MONGO_WEBUI_MONGO_URL` in `.env` with its full connection string, then restart:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock restart mongo-webui
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose restart mongo-webui
```

</TabItem>
</Tabs>

## Reset Mongo WebUI's own data

`compose.yml` mounts `${DATA_PATH_HOST}/mongo-webui` to `/data/db`, that's where Mongo WebUI keeps its **own** app state (your login account, saved connections), separate from any actual MongoDB data (which lives in the `mongo` service's own volume, untouched by any of this). If you're locked out of the UI or just want a clean slate for it:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock stop mongo-webui
./laradock remove mongo-webui
rm -rf "${DATA_PATH_HOST:-~/.laradock/data}/mongo-webui"
./laradock start mongo-webui
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose stop mongo-webui
docker compose rm -sf mongo-webui
rm -rf "${DATA_PATH_HOST:-~/.laradock/data}/mongo-webui"
docker compose up -d mongo-webui
```

</TabItem>
</Tabs>

This re-runs first-boot setup, so you'll be prompted to create the UI login again on next visit. Your actual MongoDB databases and collections are unaffected either way.

## Common issues

- **Blank page or connection error on load.** Make sure `mongo` is actually up (`docker compose ps mongo`), Mongo WebUI depends on it but a slow first boot of Mongo can still leave the UI briefly unable to connect.
- **Can't reach it from another machine.** `MONGO_WEBUI_ROOT_URL` defaults to `http://localhost`; if you're accessing it from another host, adjust accordingly and `./laradock restart mongo-webui`.
- **Port already in use on your host.** Another local service is bound to `3000`. Change `MONGO_WEBUI_PORT` in `.env` and `./laradock restart mongo-webui`.
- **Wrong data shows up.** Double check `MONGO_WEBUI_MONGO_URL` isn't still pointing at a stale or unintended Mongo instance after switching projects.
- **Locked out of the UI itself.** That's the UI's own login, not a MongoDB credential, see [Reset Mongo WebUI's own data](#reset-mongo-webuis-own-data) above.

---

Need the database itself, not just the UI? See **[MongoDB](/docs/services/mongo)**. For the full list of services, see **[Getting Started](/docs/getting-started)**.
