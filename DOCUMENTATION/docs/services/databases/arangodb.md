---
slug: /services/arangodb
title: ArangoDB
description: Run ArangoDB in Laradock. Start and stop the container, configure the root password and port, open the web UI, back up and restore data, and fix common issues.
keywords:
  - laradock arangodb
  - arangodb docker
  - arangodb docker compose
  - multi-model database docker
  - aql query language docker
  - graph database docker
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

## What is ArangoDB?

[ArangoDB](https://arangodb.com) is a multi-model database that combines document, graph, and key/value storage behind one query language, AQL. It's a graph-capable alternative to running Neo4j alongside a separate document store. Laradock runs it straight from the official `arangodb` image.

## Start ArangoDB

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock start arangodb
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose up -d arangodb
```

</TabItem>
</Tabs>

Your data is created on first start and kept between restarts. Name any other services alongside it to start them together, for example `./laradock start arangodb workspace`.

## Stop ArangoDB

Stopping just pauses the container; **your data is safe**:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock stop arangodb
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose stop arangodb
```

</TabItem>
</Tabs>

Data is kept in the named `arangodb` Docker volume, not under `DATA_PATH_HOST`.

To delete the container entirely (the volume, and everything in it, is still untouched):

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock remove arangodb
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose rm -sf arangodb
```

</TabItem>
</Tabs>

## Configuration

All settings live in `arangodb/defaults.env` and can be overridden by adding the same line to your own `.env`:

| Variable | Default | What it does |
|---|---|---|
| `ARANGODB_VERSION` | `3.12` | Image tag from the [official ArangoDB image](https://hub.docker.com/_/arangodb). |
| `ARANGODB_PORT` | `8529` | Host-side port for the web UI and API (container port `8529`). |
| `ARANGODB_ROOT_PASSWORD` | `secret` | Password for the `root` user. |

## Change the ArangoDB version

Set the version in your `.env`:

```env
ARANGODB_VERSION=3.11
```

Then apply the change (ArangoDB is pulled by tag, not built locally, so starting it again is enough to pull the new tag):

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock start arangodb
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose up -d arangodb
```

</TabItem>
</Tabs>

Crossing a major version against existing data can require ArangoDB's own upgrade procedure, check [ArangoDB's upgrade docs](https://docs.arangodb.com) before jumping versions on a real dataset, or [back up first](#backup-and-restore).

## Open the web UI

```
http://localhost:8529
```

Log in as `root` with `ARANGODB_ROOT_PASSWORD`.

## Check the API from the command line

```bash
curl http://localhost:8529/_api/version
```

## Use the arangosh shell

Default root credentials are `root` / `secret` (`ARANGODB_ROOT_PASSWORD`). Open a terminal inside the ArangoDB container, then start the interactive shell:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock enter arangodb
arangosh --server.password secret
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose exec arangodb bash
arangosh --server.password secret
```

</TabItem>
</Tabs>

```js
db._databases();
db._collections();
```

## Backup and restore

**Export (back up) your data** to a folder inside the container, using ArangoDB's own `arangodump` tool:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock exec arangodb arangodump --server.username root --server.password secret --output-directory /tmp/dump --overwrite true
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose exec arangodb arangodump --server.username root --server.password secret --output-directory /tmp/dump --overwrite true
```

</TabItem>
</Tabs>

Then copy the dump out to your host (no CLI shortcut for this one, it's a plain `docker compose cp`):

```bash
docker compose cp arangodb:/tmp/dump ./arangodb-backup
```

**Restore (import) your data** from a dump folder: copy it into the container, then run `arangorestore`.

```bash
docker compose cp ./arangodb-backup arangodb:/tmp/dump
```

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock exec arangodb arangorestore --server.username root --server.password secret --input-directory /tmp/dump
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose exec arangodb arangorestore --server.username root --server.password secret --input-directory /tmp/dump
```

</TabItem>
</Tabs>

This dumps/restores the database `arangodump`/`arangorestore` default to (`_system`). Pass `--server.database <name>` to target a different one.

## Start completely fresh (wipe all data)

To throw away everything and start ArangoDB from a clean, empty state (⚠️ this **permanently deletes** all databases, collections, and graphs, back up first if you need anything):

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock stop arangodb
./laradock remove arangodb
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose stop arangodb
docker compose rm -sf arangodb
```

</TabItem>
</Tabs>

Unlike most Laradock database services, ArangoDB persists to a named Docker volume, not `DATA_PATH_HOST`, so removing the container alone doesn't wipe the data. Drop the volume too:

```bash
docker volume rm ${COMPOSE_PROJECT_NAME:-laradock}_arangodb
```

Then start it again:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock start arangodb
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose up -d arangodb
```

</TabItem>
</Tabs>

Not sure of the exact volume name on your machine? Run `docker volume ls | grep arangodb` to find it first.

## Talk to this database from another Laradock project

Each Laradock project is its own isolated Docker network by default, so a second project's containers can't reach this ArangoDB by container name out of the box. Easiest fix: publish the port (already done, `ARANGODB_PORT`) and have the other project connect to your **host machine's** address instead of `arangodb`, for example `host.docker.internal` (Docker Desktop) on this project's `ARANGODB_PORT`. Make sure the two projects use different `ARANGODB_PORT` values if they're both running at once.

## Common issues

- **Changing `ARANGODB_VERSION` doesn't take effect.** ArangoDB is pulled by image tag, not built locally, restart after changing it: `./laradock start arangodb`. Crossing a major version against existing data can require ArangoDB's own upgrade procedure, check their docs before jumping versions on a real dataset.
- **Data isn't where you expect.** Unlike most Laradock database services, ArangoDB persists to a named Docker volume (`arangodb`), not `DATA_PATH_HOST`. Use `docker volume inspect <project>_arangodb` to find it on disk, or see [Start completely fresh](#start-completely-fresh-wipe-all-data) to wipe just that volume.
- **Port already in use on your host.** Change `ARANGODB_PORT` in `.env` and restart: `./laradock restart arangodb`.
- **Forgot the root password.** It's only applied on first boot into a fresh volume. If you changed `ARANGODB_ROOT_PASSWORD` after that, either reset it from inside `arangosh` or [start completely fresh](#start-completely-fresh-wipe-all-data) (data loss).

---

Need a different multi-model option? See **[SurrealDB](/docs/services/surrealdb)**. Back to the **[Getting Started guide](/docs/getting-started)**.
