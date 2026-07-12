# RethinkDB

Source: https://laradock.io/docs/services/rethinkdb

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

## What is RethinkDB?

[RethinkDB](https://rethinkdb.com/) is an open-source, document-oriented database built specifically for real-time apps: it can push live query results to clients as the underlying data changes. A community package, [Laravel RethinkDB](https://github.com/duxet/laravel-rethinkdb), provides Laravel integration.

## Start RethinkDB

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock start rethinkdb
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose up -d rethinkdb
```

</TabItem>
</Tabs>

Your data is created on first start and kept between restarts under `DATA_PATH_HOST/rethinkdb`.

## Stop RethinkDB

Stopping just pauses the container; **your data is safe**:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock stop rethinkdb
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose stop rethinkdb
```

</TabItem>
</Tabs>

To delete the container entirely (the data on disk is still untouched, it lives under `DATA_PATH_HOST/rethinkdb`):

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock remove rethinkdb
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose rm -sf rethinkdb
```

</TabItem>
</Tabs>

## Configuration

`rethinkdb/defaults.env` only exposes one setting, and can be overridden by adding the same line to your own `.env` (your `.env` always wins):

| Variable | Default | What it does |
|---|---|---|
| `RETHINKDB_PORT` | `8090` | Host-side port mapped to the container's admin console port (`8080` inside the container). |

The RethinkDB client driver port (`28015` inside the container) is **not** published to your host, only reachable from other containers on Laradock's internal network via `rethinkdb:28015`.

## Open the admin console

With the container running, open [http://localhost:8090/#tables](http://localhost:8090/#tables) (or your `RETHINKDB_PORT`) and create a database named `database` (or whatever you plan to reference from Laravel).

## Use RethinkDB from Laravel

1. Add a RethinkDB connection to `config/database.php`:
   ```php
   'connections' => [

       'rethinkdb' => [
           'name'      => 'rethinkdb',
           'driver'    => 'rethinkdb',
           'host'      => env('DB_HOST', 'rethinkdb'),
           'port'      => env('DB_PORT', 28015),
           'database'  => env('DB_DATABASE', 'test'),
       ]

       // ...

   ],
   ```
2. In your Laravel `.env`, set `DB_CONNECTION=rethinkdb`, `DB_HOST=rethinkdb`, `DB_PORT=28015`, and `DB_DATABASE=database`.

`DB_HOST=rethinkdb` and `DB_PORT=28015` only resolve from inside another Laradock container (like `workspace` or `php-fpm`); they aren't reachable from your host machine since that port isn't published.

## Backup and restore

The `rethinkdb` image is built with RethinkDB's official Python driver, which bundles the `rethinkdb-dump` and `rethinkdb-restore` command-line tools. They only exist inside the RethinkDB container, so open a terminal there first, then dump straight into the mounted data folder so the archive lands on your host too:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock enter rethinkdb
rethinkdb-dump -f /data/rethinkdb_data/backup.tar.gz
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose exec rethinkdb bash
rethinkdb-dump -f /data/rethinkdb_data/backup.tar.gz
```

</TabItem>
</Tabs>

With no `-e` flag, `rethinkdb-dump` exports every database on the server. The resulting archive is written to `DATA_PATH_HOST/rethinkdb/backup.tar.gz` on your host machine, since `/data/rethinkdb_data` is the volume mount.

**Restore** the same archive later (into this container or a fresh one):

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock enter rethinkdb
rethinkdb-restore /data/rethinkdb_data/backup.tar.gz
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose exec rethinkdb bash
rethinkdb-restore /data/rethinkdb_data/backup.tar.gz
```

</TabItem>
</Tabs>

See RethinkDB's own docs on [backing up your data](https://www.rethinkdb.com/docs/backup/) for filtering to specific databases/tables with `-e`.

## Start completely fresh (wipe all data)

To throw away everything and start RethinkDB from a clean, empty state (⚠️ this **permanently deletes** every database in this container, back up first if you need anything):

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock stop rethinkdb
./laradock remove rethinkdb
rm -rf "${DATA_PATH_HOST:-~/.laradock/data}/rethinkdb"
./laradock start rethinkdb
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose stop rethinkdb
docker compose rm -sf rethinkdb
rm -rf "${DATA_PATH_HOST:-~/.laradock/data}/rethinkdb"
docker compose up -d rethinkdb
```

</TabItem>
</Tabs>

`DATA_PATH_HOST` is whatever you have set in `.env` (`~/.laradock/data` by default), so the folder above is where RethinkDB's data actually lives on your machine. Unlike MySQL, RethinkDB doesn't auto-create any database on boot, you'll need to recreate it from the admin console or your backup afterward.

## Common issues

- **Can't connect from a host GUI client.** The client-driver port (`28015`) isn't published to your host by `compose.yml`, only the admin console (`RETHINKDB_PORT` → `8080`) is. Connect from inside a Laradock container instead, or add a port mapping yourself if you need host access.
- **App can't connect but the container is running.** Confirm the app's `.env` uses `DB_HOST=rethinkdb` (the container name), not `localhost`.
- **Admin console shows no tables.** You need to create the database/tables yourself the first time, RethinkDB doesn't auto-create anything on boot like MySQL's `MYSQL_DATABASE`.
- **Port already in use on your host.** Change `RETHINKDB_PORT` in `.env` and restart with `./laradock restart rethinkdb`.

---

Need a document database instead? See **[MongoDB](https://laradock.io/docs/services/mongo)**. For the full list of services, see **[Getting Started](https://laradock.io/docs/getting-started)**.
