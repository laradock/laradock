---
slug: /services/neo4j
title: Neo4j
description: Run Neo4j in Laradock. Start and stop the container, open the Neo4j Browser, enable authentication, back up and restore your graph, and fix common issues.
keywords:
  - laradock neo4j
  - neo4j docker
  - neo4j docker compose
  - graph database docker
  - neo4j browser docker
  - cypher docker
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

## What is Neo4j?

[Neo4j](https://neo4j.com) is a native graph database: data is stored as nodes and relationships rather than rows or documents, which makes it well-suited for highly connected data (social graphs, recommendation engines, fraud detection). Laradock runs it straight from the [official `neo4j` image](https://hub.docker.com/_/neo4j) with no custom Dockerfile.

## Start Neo4j

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock start neo4j
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose up -d neo4j
```

</TabItem>
</Tabs>

It runs as its own container with no `depends_on` in `compose.yml`. Your data is created on first start and kept between restarts.

## Stop Neo4j

Stopping just pauses the container; **your data is safe**:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock stop neo4j
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose stop neo4j
```

</TabItem>
</Tabs>

Data persists under `DATA_PATH_HOST/neo4j/data`, and logs under `DATA_PATH_HOST/neo4j/logs`.

To delete the container entirely (the data on disk is still untouched):

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock remove neo4j
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose rm -sf neo4j
```

</TabItem>
</Tabs>

## Configuration

There is no `neo4j/defaults.env` file for this service, everything is hardcoded directly in `neo4j/compose.yml`:

| Setting | Value | What it does |
|---|---|---|
| Image | `neo4j:latest` | Not version-pinned or overridable via `.env`; edit `compose.yml` directly to change it. |
| `NEO4J_AUTH` | `none` | Authentication is disabled entirely, no username/password is required to connect. |
| Host port `7401` | → container `7474` | Neo4j Browser (HTTP UI). |
| Host port `7402` | → container `7687` | Bolt protocol port, used by drivers/apps. |

If you need a pinned version, authentication enabled, or different ports, you'll need to edit `neo4j/compose.yml` yourself, there's currently no `.env`-driven way to change these.

## Open the Neo4j Browser

With the container running, open [http://localhost:7401](http://localhost:7401). Since `NEO4J_AUTH=none`, you can connect without entering credentials.

## Run Cypher from the command line

Open a terminal inside the container, then start `cypher-shell`:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock enter neo4j
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose exec neo4j bash
```

</TabItem>
</Tabs>

```bash
cypher-shell
```

With `NEO4J_AUTH=none` no username/password is needed. Once authentication is enabled (see below), connect with `cypher-shell -u neo4j -p yourpassword` instead.

## Enable authentication

The default `NEO4J_AUTH=none` means **anyone who can reach the port has full read/write access to your graph**, fine for local dev, not something to carry into anything less trusted. To turn it on, edit the `environment:` block in `neo4j/compose.yml`:

```yaml
environment:
    - NEO4J_AUTH=neo4j/yourpassword
```

Neo4j requires passwords to be at least 8 characters. Apply the change:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock restart neo4j
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose restart neo4j
```

</TabItem>
</Tabs>

This only takes effect on a **fresh** data folder; if `DATA_PATH_HOST/neo4j/data` already exists from a previous `NEO4J_AUTH=none` run, either [start completely fresh](#start-completely-fresh-wipe-all-data) or set the password for the existing `neo4j` user from inside `cypher-shell`:

```cypher
ALTER CURRENT USER SET PASSWORD FROM 'neo4j' TO 'yourpassword';
```

## Connect from your app

Use the Bolt protocol on the mapped port: `bolt://localhost:7402` from your host machine, or `bolt://neo4j:7687` from inside another Laradock container.

## Backup and restore

Neo4j's data lives entirely in the bind-mounted `DATA_PATH_HOST/neo4j/data` folder on your host, so the reliable way to back it up is a plain file copy while the container is stopped (avoids copying files mid-write):

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock stop neo4j
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose stop neo4j
```

</TabItem>
</Tabs>

```bash
cp -r "${DATA_PATH_HOST:-~/.laradock/data}/neo4j/data" ~/neo4j-backup-$(date +%Y%m%d)
```

Start it back up once the copy finishes:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock start neo4j
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose up -d neo4j
```

</TabItem>
</Tabs>

**To restore**, stop the container, replace the contents of `DATA_PATH_HOST/neo4j/data` with your backup, and start it again:

```bash
rm -rf "${DATA_PATH_HOST:-~/.laradock/data}/neo4j/data"
cp -r ~/neo4j-backup-YYYYMMDD "${DATA_PATH_HOST:-~/.laradock/data}/neo4j/data"
```

Then `./laradock start neo4j` (or the Docker Compose equivalent above).

## Start completely fresh (wipe all data)

To throw away your graph entirely and start Neo4j from a clean, empty state (⚠️ this **permanently deletes** every node, relationship, and index, back up first if you need anything):

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock stop neo4j
./laradock remove neo4j
rm -rf "${DATA_PATH_HOST:-~/.laradock/data}/neo4j/data" "${DATA_PATH_HOST:-~/.laradock/data}/neo4j/logs"
./laradock start neo4j
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose stop neo4j
docker compose rm -sf neo4j
rm -rf "${DATA_PATH_HOST:-~/.laradock/data}/neo4j/data" "${DATA_PATH_HOST:-~/.laradock/data}/neo4j/logs"
docker compose up -d neo4j
```

</TabItem>
</Tabs>

`DATA_PATH_HOST` is whatever you have set in `.env` (`~/.laradock/data` by default), so the folders above are where Neo4j's data and logs actually live on your machine.

## Talk to this database from another Laradock project

Each Laradock project is its own isolated Docker network by default, so a second project's containers can't reach this Neo4j by container name out of the box. Easiest fix: the ports are already published (`7401`/`7402`), so have the other project connect to your **host machine's** address instead of `neo4j`, for example `bolt://host.docker.internal:7402` (Docker Desktop). Make sure the two projects use different host ports if they're both running at once, there's no `.env` variable for these yet, edit the `ports:` mapping in `neo4j/compose.yml` directly.

## Common issues

- **No authentication by default.** `NEO4J_AUTH=none` means anyone who can reach the port has full access. See [Enable authentication](#enable-authentication) above before exposing it anywhere less trusted.
- **Can't change the version via `.env`.** Unlike most other Laradock services, the Neo4j image tag isn't parameterized, edit the `image:` line in `neo4j/compose.yml` directly and run `./laradock rebuild neo4j` afterward.
- **Port already in use on your host.** Another service is bound to `7401` or `7402`. Edit the port mapping in `neo4j/compose.yml` since there's no env var for it.
- **App can't connect but the container is running.** Confirm the app's config uses `neo4j` (the container name) and port `7687` from inside other Laradock containers, not `localhost`, which only works from your host machine.
- **`cypher-shell` asks for credentials after enabling auth.** Once you set `NEO4J_AUTH=neo4j/yourpassword`, every connection (Browser, `cypher-shell`, drivers) needs that username/password, there's no partial-auth mode.

---

Need a wide-column store instead? See **[Cassandra](/docs/services/cassandra)**. For the full list of services, see **[Getting Started](/docs/getting-started)**.
