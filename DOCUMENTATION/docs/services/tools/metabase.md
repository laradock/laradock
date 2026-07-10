---
slug: /services/metabase
title: Metabase
description: Run Metabase in Laradock for BI dashboards and ad-hoc SQL exploration over your app's databases.
keywords:
  - laradock metabase
  - metabase docker
  - metabase docker compose
  - business intelligence docker
  - sql dashboard docker
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

## What is Metabase?

[Metabase](https://www.metabase.com) is an open-source business intelligence tool: connect it to a database, and non-technical users can build charts and dashboards without writing SQL (though you still can, if you want to). Laradock runs it from the official `metabase/metabase:latest` image.

## Start Metabase

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock start metabase
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose up -d metabase
```

</TabItem>
</Tabs>

Its own application data is created on first start and kept between restarts. Name any other services alongside it to start them together, for example `./laradock start metabase mysql`.

## Stop Metabase

Stopping just pauses the container; **your dashboards and questions are safe**:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock stop metabase
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose stop metabase
```

</TabItem>
</Tabs>

To delete the container entirely (the data on disk is still untouched, it lives under `DATA_PATH_HOST`):

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock remove metabase
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose rm -sf metabase
```

</TabItem>
</Tabs>

## Configuration

Settings live in `metabase/defaults.env` and can be overridden in your own `.env`:

| Variable | Default | What it does |
|---|---|---|
| `METABASE_PORT` | `3030` | Host port Metabase is published on (container always listens on `3000` internally). |
| `METABASE_DB_FILE` | `metabase.db` | Filename for Metabase's own application database (an embedded H2 file, stores dashboards/questions/users, not your app data). |

Metabase's application data persists under `DATA_PATH_HOST/metabase-data`, mounted into the container. Connecting Metabase to your actual app database (MySQL, Postgres, etc.) is done from Metabase's own admin UI after first boot, not via `.env`.

## First-time setup

Start Metabase (see above), then open [http://localhost:3030](http://localhost:3030) and follow the setup wizard to create an admin account, then add a database connection. Inside Laradock, other containers are reachable by name (`mysql`, `postgres`, etc.), use those as the host, not `localhost`.

See [Running Metabase on Docker](https://www.metabase.com/docs/latest/installation-and-operation/running-metabase-on-docker) for the full range of configuration options (email, SSO, embedding) beyond what Laradock wires up by default.

## Backup and restore

Metabase stores everything it knows, dashboards, saved questions, users, and your database connections, in its own embedded H2 file under `DATA_PATH_HOST/metabase-data`. It has no `mysqldump`-style export command; back it up by copying that folder while Metabase is stopped, so the file isn't being written to mid-copy.

**Back up:**

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock stop metabase
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose stop metabase
```

</TabItem>
</Tabs>

```bash
cp -r "${DATA_PATH_HOST:-~/.laradock/data}/metabase-data" ~/metabase-backup
```

**Restore** by copying a saved backup back into place before starting Metabase again:

```bash
rm -rf "${DATA_PATH_HOST:-~/.laradock/data}/metabase-data"
cp -r ~/metabase-backup "${DATA_PATH_HOST:-~/.laradock/data}/metabase-data"
```

Then start Metabase normally. This backs up Metabase's own configuration and saved dashboards only, it does **not** back up the app databases Metabase connects to, back those up separately (see the relevant database's own doc page).

## Start completely fresh (reset all dashboards, questions, and users)

To throw away Metabase's admin account, connections, dashboards, and questions and go through the setup wizard again (⚠️ this **permanently deletes** everything above, back up first if you need anything):

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock stop metabase
./laradock remove metabase
rm -rf "${DATA_PATH_HOST:-~/.laradock/data}/metabase-data"
./laradock start metabase
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose stop metabase
docker compose rm -sf metabase
rm -rf "${DATA_PATH_HOST:-~/.laradock/data}/metabase-data"
docker compose up -d metabase
```

</TabItem>
</Tabs>

This only resets Metabase itself, none of the app databases it was connected to are touched.

## Common issues

- **Setup wizard runs again after a restart.** Confirm `DATA_PATH_HOST/metabase-data` actually persisted, if that folder was deleted or `DATA_PATH_HOST` changed, Metabase starts with a fresh application database.
- **Can't connect to your app's database from Metabase.** Use the container name (`mysql`, `postgres`, ...) as the host in Metabase's connection form, `localhost` from inside the `metabase` container refers to the Metabase container itself.
- **Port already in use on your host.** Change `METABASE_PORT` in `.env` and restart: `./laradock restart metabase`.
- **Metabase feels slow on first load.** This is normal, Metabase's JVM-based backend takes a bit longer to start than most containers; check `./laradock logs metabase` for `Metabase Initialization COMPLETE` before assuming it's stuck.

---

Need the database Metabase is reporting on? See the **[Databases guide](/docs/Intro#supported-services)**. New to Laradock? Start at **[Getting Started](/docs/getting-started)**.
