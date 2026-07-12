# MongoDB

Source: https://laradock.io/docs/services/mongo

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

## What is MongoDB?

[MongoDB](https://www.mongodb.com) is a document-oriented NoSQL database that stores data as flexible, JSON-like documents instead of rows and tables. It's a common choice for apps with unstructured or rapidly evolving schemas. Laradock runs it as its own container.

## Start MongoDB

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock start mongo
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose up -d mongo
```

</TabItem>
</Tabs>

Your data is created on first start and kept between restarts. Name any other services alongside it to start them together, for example `./laradock start mongo redis`.

## Stop MongoDB

Stopping just pauses the container; **your data is safe**:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock stop mongo
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose stop mongo
```

</TabItem>
</Tabs>

To delete the container entirely (the data on disk is still untouched, it lives under `DATA_PATH_HOST`), run `./laradock remove mongo`.

## Configuration

All settings live in `mongo/defaults.env` and can be overridden by adding the same line to your own `.env` (your `.env` always wins):

| Variable | Default | What it does |
|---|---|---|
| `MONGODB_PORT` | `27017` | Host-side port MongoDB is published on (`host:container`). |
| `MONGO_USERNAME` | `root` | Root user created automatically on first boot (`MONGO_INITDB_ROOT_USERNAME`). |
| `MONGO_PASSWORD` | `example` | Password for the root user (`MONGO_INITDB_ROOT_PASSWORD`). |

Data persists under `DATA_PATH_HOST/mongo` (database files) and `DATA_PATH_HOST/mongo_config` (config db).

## Change the MongoDB version

Unlike most databases in Laradock, MongoDB has no `MONGO_VERSION` env var, the image tag is fixed in `mongo/Dockerfile` (`FROM mongo:latest`). To pin a specific version, edit that line yourself, for example:

```dockerfile
FROM mongo:7.0
```

Then apply the change:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock rebuild mongo
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose build mongo
```

</TabItem>
</Tabs>

As with any database, jumping major versions against an existing data folder can be risky. Back up first (see [Backup and restore](#backup-and-restore)) before changing versions on a database you care about.

## Root access

Open a terminal inside the MongoDB container, then start the Mongo shell as the root user:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock enter mongo
mongosh -u root -p example --authenticationDatabase admin
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose exec mongo bash
mongosh -u root -p example --authenticationDatabase admin
```

</TabItem>
</Tabs>

Swap `root` / `example` for your own `MONGO_USERNAME` / `MONGO_PASSWORD` if you changed them.

```js
show dbs
use database
show collections
```

## Backup and restore

**Export (back up) all databases** to an archive file on your host:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock exec -T mongo mongodump --username root --password example --authenticationDatabase admin --archive > backup.archive
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose exec -T mongo mongodump --username root --password example --authenticationDatabase admin --archive > backup.archive
```

</TabItem>
</Tabs>

Replace the username/password with your own `MONGO_USERNAME`/`MONGO_PASSWORD`. The `-T` disables the container's pseudo-terminal so the archive isn't corrupted when redirected to a file, always include it when piping output to or from a file. Add `--db=your_database` to dump just one database instead of all of them.

**Restore (import) an archive** back into the container:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock exec -T mongo mongorestore --username root --password example --authenticationDatabase admin --archive < backup.archive
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose exec -T mongo mongorestore --username root --password example --authenticationDatabase admin --archive < backup.archive
```

</TabItem>
</Tabs>

This works anytime, the container just has to already be running. It's also how you bring in a dump from a client's production cluster or your previous local MongoDB install.

## Start completely fresh (wipe all data)

To throw away everything and start MongoDB from a clean, empty state (⚠️ this **permanently deletes** every database in this container, back up first if you need anything):

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock stop mongo
./laradock remove mongo
rm -rf "${DATA_PATH_HOST:-~/.laradock/data}/mongo" "${DATA_PATH_HOST:-~/.laradock/data}/mongo_config"
./laradock start mongo
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose stop mongo
docker compose rm -sf mongo
rm -rf "${DATA_PATH_HOST:-~/.laradock/data}/mongo" "${DATA_PATH_HOST:-~/.laradock/data}/mongo_config"
docker compose up -d mongo
```

</TabItem>
</Tabs>

`DATA_PATH_HOST` is whatever you have set in `.env` (`~/.laradock/data` by default), so the two folders above are where MongoDB's data files and config db actually live on your machine. Deleting them and starting again re-runs first-boot initialization: `MONGO_USERNAME` and `MONGO_PASSWORD` apply fresh, exactly like a brand-new install.

## Use MongoDB from Laravel

1. In `.env`, set both flags to `true`:
   - `WORKSPACE_INSTALL_MONGO`
   - `PHP_FPM_INSTALL_MONGO`
2. Rebuild the containers that need the PHP MongoDB driver:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock rebuild workspace php-fpm
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose build workspace php-fpm
```

</TabItem>
</Tabs>

3. Start the database container (if it isn't already running):

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock start mongo
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose up -d mongo
```

</TabItem>
</Tabs>

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

## Talk to this database from another Laradock project

Each Laradock project is its own isolated Docker network by default, so a second project's containers can't reach this MongoDB by container name out of the box. Easiest fix: publish the port (already done, `MONGODB_PORT`) and have the other project connect to your **host machine's** address instead of `mongo`, for example `DB_HOST=host.docker.internal` (Docker Desktop) with `DB_PORT` set to this project's `MONGODB_PORT`. Make sure the two projects use different `MONGODB_PORT` values if they're both running at once.

## Connect from your host machine

Inside Laradock, other containers reach MongoDB by container name: `DB_HOST=mongo`. From your own machine, connect a GUI client (Compass, Studio 3T) to `localhost` on `MONGODB_PORT` (`27017` by default) using `MONGO_USERNAME`/`MONGO_PASSWORD`.

Want a browser-based admin UI instead of a desktop client? See **[Mongo WebUI](https://laradock.io/docs/services/mongo-webui)**.

## Common issues

- **Auth fails right after first boot.** `MONGO_USERNAME`/`MONGO_PASSWORD` are only applied when the data folder is created for the first time. If you change them afterward, either [start completely fresh](#start-completely-fresh-wipe-all-data) (data loss, back up first) or create the new user manually via the Mongo shell.
- **App can't connect but the container is running.** Confirm the app's `.env` uses `DB_HOST=mongo` (the container name), not `localhost`, which only works from your host machine.
- **Driver not found in PHP.** The Mongo PHP extension isn't installed by default, you must set `WORKSPACE_INSTALL_MONGO` and `PHP_FPM_INSTALL_MONGO` to `true` and rebuild before `composer require mongodb/laravel-mongodb` will work.
- **Two Laradock projects overwrite each other's data.** Running more than one Laradock on the same machine? Set both `COMPOSE_PROJECT_NAME` and `DATA_PATH_HOST` to unique values per project, otherwise they share the same MongoDB data on disk.
- **Port already in use on your host.** Another local MongoDB (or another Laradock project) is already bound to `27017`. Change `MONGODB_PORT` in `.env` and restart: `./laradock restart mongo`.

---

Need a graph database instead? See **[Neo4j](https://laradock.io/docs/services/neo4j)**. For the full list of services, see **[Getting Started](https://laradock.io/docs/getting-started)**.
