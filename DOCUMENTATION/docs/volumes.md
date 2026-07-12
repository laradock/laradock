---
slug: /volumes
title: Data & Volumes
description: Where Laradock stores your databases and files, why data survives rebuilds, and how to back up, move, or wipe a single service's data.
keywords:
  - laradock data path
  - DATA_PATH_HOST
  - docker volume backup
  - reset mysql data docker
  - laradock persist data
  - docker bind mount
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

Where Laradock keeps your data, why it survives rebuilds, and how to back it up or wipe it.

## The two kinds of storage

Laradock mounts exactly two things from your host into the containers:

- **Your code**, bind-mounted live. `APP_CODE_PATH_HOST` (default `../`, the folder that holds Laradock) is mounted at `APP_CODE_PATH_CONTAINER` (`/var/www`). Edit a file on your host and the container sees it instantly, which is why there's no "copy into the container" step.
- **Service data** (databases, caches, uploads), stored under `DATA_PATH_HOST` (default `~/.laradock/data`). Each service gets its own sub-folder: MySQL in `~/.laradock/data/mysql`, PostgreSQL in `~/.laradock/data/postgres`, Redis in `~/.laradock/data/redis`, and so on.

Because both live on your **host**, not inside the containers, your data is safe when you stop, delete, or rebuild containers.

## Your data survives rebuilds

Stopping or deleting containers never touches your data:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock remove
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose down
```

</TabItem>
</Tabs>

Both remove the running containers but leave everything under `DATA_PATH_HOST` on disk. Start the services again and your databases are exactly where you left them. The only things that erase data are deleting its folder yourself (below) or a `--no-cache` rebuild that reinitializes a volume.

## Back up a service's data

Since data is just files on your host, a backup is a copy of the folder. Stop the service first so the files are consistent:

```bash
./laradock stop mysql          # or: docker compose stop mysql
cp -r ~/.laradock/data/mysql ~/mysql-backup
```

For databases, a logical dump is more portable across versions than copying raw files. Run it from inside the container:

```bash
./laradock exec mysql mysqldump -udefault -psecret mydatabase > backup.sql
```

## Reset or wipe one service

To start a service from a clean slate, for example to apply a new database password (credentials are only baked in on the **first** boot) or to clear a corrupted database, delete that service's data folder:

```bash
./laradock stop mysql          # or: docker compose stop mysql
rm -rf ~/.laradock/data/mysql
./laradock start mysql         # or: docker compose up -d mysql
```

The service reinitializes fresh on the next start. This affects only the service you delete; the rest are untouched.

:::warning
Deleting a data folder is permanent. Back it up first if there's any chance you'll want it.
:::

## Separate data per project

Running more than one Laradock at once? Give each project its own `DATA_PATH_HOST` (and `COMPOSE_PROJECT_NAME`) in its `.env` so their databases never mix:

```env
COMPOSE_PROJECT_NAME=myproject
DATA_PATH_HOST=~/.laradock/data-myproject
```

See [Running multiple projects](/docs/getting-started#running-multiple-projects) for the full setup.
