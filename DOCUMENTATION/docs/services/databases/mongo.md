---
slug: /services/mongo
title: MongoDB
description: Run MongoDB in Laradock. Start the container, wire it up to Laravel via the mongodb/laravel-mongodb package, and connect from your host.
keywords:
  - laradock mongodb
  - mongodb docker
  - mongodb docker compose
  - laravel mongodb
  - jenssegers mongodb
  - mongodb laravel eloquent
---

## What is MongoDB?

[MongoDB](https://www.mongodb.com) is a document-oriented NoSQL database that stores data as flexible, JSON-like documents instead of rows and tables. It's a common choice for apps with unstructured or rapidly evolving schemas. Laradock runs it as its own container.

## Start MongoDB

```bash
docker compose up -d mongo
```

## Stop MongoDB

```bash
docker compose stop mongo
```

This stops the container without deleting its data. To remove the container (data on disk is untouched, it lives under `DATA_PATH_HOST`): `docker compose rm -f mongo`.

## Configuration

All settings live in `mongo/defaults.env` and can be overridden by adding the same line to your own `.env`:

| Variable | Default | What it does |
|---|---|---|
| `MONGODB_PORT` | `27017` | Host-side port MongoDB is published on (`host:container`). |
| `MONGO_USERNAME` | `root` | Root user created automatically on first boot (`MONGO_INITDB_ROOT_USERNAME`). |
| `MONGO_PASSWORD` | `example` | Password for the root user (`MONGO_INITDB_ROOT_PASSWORD`). |

Data persists under `DATA_PATH_HOST/mongo` (database files) and `DATA_PATH_HOST/mongo_config` (config db).

## Use MongoDB from Laravel

1. In `.env`, set both flags to `true`:
   - `WORKSPACE_INSTALL_MONGO`
   - `PHP_FPM_INSTALL_MONGO`
2. Rebuild the containers that need the PHP MongoDB driver:
   ```bash
   docker compose build workspace php-fpm
   ```
3. Start the database container:
   ```bash
   docker compose up -d mongo
   ```
4. Add a MongoDB connection to `config/database.php`:
   ```php
   'connections' => [

       'mongodb' => [
           'driver'   => 'mongodb',
           'host'     => env('DB_HOST', 'localhost'),
           'port'     => env('DB_PORT', 27017),
           'database' => env('DB_DATABASE', 'database'),
           'username' => '',
           'password' => '',
           'options'  => [
               'database' => '',
           ]
       ],

       // ...

   ],
   ```
5. In your Laravel `.env`, set `DB_HOST=mongo`, `DB_PORT=27017`, and `DB_DATABASE=database`.
6. Install the Laravel MongoDB package (formerly `jenssegers/mongodb`, now maintained as [`mongodb/laravel-mongodb`](https://github.com/mongodb/laravel-mongodb)):
   ```bash
   composer require mongodb/laravel-mongodb
   ```
7. Extend your models from the MongoDB Eloquent model, enter the Workspace, and run `php artisan migrate`.

## Connect from your host machine

Inside Laradock, other containers reach MongoDB by container name: `DB_HOST=mongo`. From your own machine, connect a GUI client (Compass, Studio 3T) to `localhost` on `MONGODB_PORT` (`27017` by default) using `MONGO_USERNAME`/`MONGO_PASSWORD`.

Want a browser-based admin UI instead of a desktop client? See **[Mongo WebUI](/docs/services/mongo-webui)**.

## Common issues

- **Auth fails right after first boot.** `MONGO_USERNAME`/`MONGO_PASSWORD` are only applied when the data folder is created for the first time. Change them afterward and either drop `DATA_PATH_HOST/mongo` (data loss) or create the new user manually via the Mongo shell.
- **App can't connect but the container is running.** Confirm the app's `.env` uses `DB_HOST=mongo` (the container name), not `localhost`, which only works from your host machine.
- **Driver not found in PHP.** The Mongo PHP extension isn't installed by default, you must set `WORKSPACE_INSTALL_MONGO` and `PHP_FPM_INSTALL_MONGO` to `true` and rebuild before `composer require mongodb/laravel-mongodb` will work.
- **Port already in use on your host.** Another local MongoDB (or another Laradock project) is already bound to `27017`. Change `MONGODB_PORT` in `.env` and restart.

---

Need a graph database instead? See **[Neo4j](/docs/services/neo4j)**. For the full list of services, see **[Getting Started](/docs/getting-started)**.
