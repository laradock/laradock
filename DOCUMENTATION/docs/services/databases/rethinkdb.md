---
slug: /services/rethinkdb
title: RethinkDB
description: Run RethinkDB in Laradock. Start the container, open the admin console, and wire it up to Laravel via the Laravel RethinkDB package.
keywords:
  - laradock rethinkdb
  - rethinkdb docker
  - rethinkdb docker compose
  - laravel rethinkdb
  - realtime database docker
  - rethinkdb admin console
---

## What is RethinkDB?

[RethinkDB](https://rethinkdb.com/) is an open-source, document-oriented database built specifically for real-time apps: it can push live query results to clients as the underlying data changes. A community package, [Laravel RethinkDB](https://github.com/duxet/laravel-rethinkdb), provides Laravel integration.

## Start RethinkDB

```bash
docker compose up -d rethinkdb
```

## Stop RethinkDB

```bash
docker compose stop rethinkdb
```

This stops the container without deleting its data. Data persists under `DATA_PATH_HOST/rethinkdb`.

## Configuration

`rethinkdb/defaults.env` only exposes one setting:

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

See the RethinkDB docs on [backing up your data](https://www.rethinkdb.com/docs/backup/).

## Common issues

- **Can't connect from a host GUI client.** The client-driver port (`28015`) isn't published to your host by `compose.yml`, only the admin console (`RETHINKDB_PORT` → `8080`) is. Connect from inside a Laradock container instead, or add a port mapping yourself if you need host access.
- **App can't connect but the container is running.** Confirm the app's `.env` uses `DB_HOST=rethinkdb` (the container name), not `localhost`.
- **Admin console shows no tables.** You need to create the database/tables yourself the first time, RethinkDB doesn't auto-create anything on boot like MySQL's `MYSQL_DATABASE`.
- **Port already in use on your host.** Change `RETHINKDB_PORT` in `.env` and restart.

---

Need a document database instead? See **[MongoDB](/docs/services/mongo)**. For the full list of services, see **[Getting Started](/docs/getting-started)**.
