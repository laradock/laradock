# Percona Server

Source: https://laradock.io/docs/services/percona

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

## What is Percona Server?

[Percona Server](https://www.percona.com/software/mysql-database/percona-server) is a free, open-source, performance-focused fork of MySQL, drop-in compatible with MySQL's protocol and SQL syntax but with additional enterprise-grade features (extra performance metrics, XtraDB storage engine improvements) built in. Laradock runs it pinned to Percona `8.0`.

## Start Percona

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock start percona
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose up -d percona
```

</TabItem>
</Tabs>

It runs as its own container with no `depends_on` in `compose.yml`. Your data is created on first start and kept between restarts. Name any other services alongside it to start them together, for example `./laradock start percona redis`.

## Stop Percona

Stopping just pauses the container; **your data is safe**:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock stop percona
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose stop percona
```

</TabItem>
</Tabs>

To delete the container entirely (the data on disk is still untouched, it lives under `DATA_PATH_HOST`):

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock remove percona
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose rm -sf percona
```

</TabItem>
</Tabs>

## Configuration

All settings live in `percona/defaults.env` and can be overridden by adding the same line to your own `.env` (your `.env` always wins):

| Variable | Default | What it does |
|---|---|---|
| `PERCONA_DATABASE` | `homestead` | Database created automatically on first boot. |
| `PERCONA_USER` | `homestead` | Non-root user created automatically. |
| `PERCONA_PASSWORD` | `secret` | Password for `PERCONA_USER`. |
| `PERCONA_ROOT_PASSWORD` | `root` | Password for the `root` user. |
| `PERCONA_PORT` | `3306` | Host-side port Percona is published on (`host:container`). |
| `PERCONA_ENTRYPOINT_INITDB` | `./percona/docker-entrypoint-initdb.d` | Folder of `.sql`/`.sh` files auto-run on first boot. |

Unlike Laradock's other MySQL-family services, `percona/Dockerfile` pins the image to `percona:8.0` directly rather than exposing a version build arg, so there's no `PERCONA_VERSION` variable to override. To move to a different Percona major version you'd need to edit `percona/Dockerfile` yourself, and the same data-compatibility caution as MySQL applies: back up first, then [start completely fresh](#start-completely-fresh-wipe-all-data) on the new image.

## Root access

Default root credentials are `root` / `root` (`PERCONA_ROOT_PASSWORD`). Open a terminal inside the Percona container, then start the MySQL-compatible prompt:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock enter percona
mysql -uroot -proot
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose exec percona bash
mysql -uroot -proot
```

</TabItem>
</Tabs>

For the non-root app user instead: `mysql -uhomestead -psecret` (or your own `PERCONA_USER`/`PERCONA_PASSWORD`).

```sql
SELECT User FROM mysql.user;
SHOW DATABASES;
```

## Create multiple databases

Copy `percona/docker-entrypoint-initdb.d/createdb.sql.example` to `createdb.sql` in the same folder, then uncomment/add your statements, following the same pattern MySQL uses:

```sql
CREATE DATABASE IF NOT EXISTS `your_db_1` COLLATE 'utf8mb4_general_ci';
GRANT ALL ON `your_db_1`.* TO 'homestead'@'%';
```

This file only auto-runs the **first time** the container initializes its data folder (when `DATA_PATH_HOST/percona` doesn't exist yet). If your data folder already exists, run it manually instead:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock enter percona
mysql -uroot -proot < /docker-entrypoint-initdb.d/createdb.sql
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose exec percona bash
mysql -uroot -proot < /docker-entrypoint-initdb.d/createdb.sql
```

</TabItem>
</Tabs>

## Backup and restore

**Export (back up) a database** to a `.sql` file on your host:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock exec -T percona mysqldump -uroot -proot homestead > backup.sql
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose exec -T percona mysqldump -uroot -proot homestead > backup.sql
```

</TabItem>
</Tabs>

Replace `homestead` with your database name (`PERCONA_DATABASE`). The `-T` disables the container's pseudo-terminal so the dump isn't corrupted when redirected to a file, always include it when piping output to or from a file.

**Restore (import) a database** from a `.sql` file:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock exec -T percona mysql -uroot -proot homestead < backup.sql
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose exec -T percona mysql -uroot -proot homestead < backup.sql
```

</TabItem>
</Tabs>

Unlike the `createdb.sql` first-boot init file above, this works anytime, the target database (`homestead` here) just has to already exist. This is also how you bring in a dump from MySQL or another Percona install, since the wire protocol and SQL dialect are compatible.

## Start completely fresh (wipe all data)

To throw away everything and start Percona from a clean, empty state (⚠️ this **permanently deletes** every database in this container, back up first if you need anything):

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock stop percona
./laradock remove percona
rm -rf "${DATA_PATH_HOST:-~/.laradock/data}/percona"
./laradock start percona
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose stop percona
docker compose rm -sf percona
rm -rf "${DATA_PATH_HOST:-~/.laradock/data}/percona"
docker compose up -d percona
```

</TabItem>
</Tabs>

`DATA_PATH_HOST` is whatever you have set in `.env` (`~/.laradock/data` by default), so the folder above is where Percona's data actually lives on your machine. Deleting it and starting again re-runs first-boot initialization: `PERCONA_DATABASE`, `PERCONA_USER`, `PERCONA_PASSWORD`, and any `docker-entrypoint-initdb.d` scripts all apply fresh, exactly like a brand-new install.

## Tune server settings

`percona/my.cnf` is copied into the image at build time (`/etc/mysql/conf.d/my.cnf` via the `Dockerfile`, not a live volume mount), so changes need a rebuild to take effect. It ships with a strict `sql-mode` (`STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION`); add any other `[mysqld]` directives there, then apply:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock rebuild percona
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose build percona
```

</TabItem>
</Tabs>

## Talk to this database from another Laradock project

Each Laradock project is its own isolated Docker network by default, so a second project's containers can't reach this Percona by container name out of the box. Easiest fix: publish the port (already done, `PERCONA_PORT`) and have the other project connect to your **host machine's** address instead of `percona`, for example `DB_HOST=host.docker.internal` (Docker Desktop) with `DB_PORT` set to this project's `PERCONA_PORT`. Make sure the two projects use different `PERCONA_PORT` values if they're both running at once.

## Connect from your host machine

Inside Laradock, other containers reach Percona by container name: `DB_HOST=percona`. From your own machine (a GUI client like TablePlus, DBeaver, or Sequel Ace), connect to `localhost` on `PERCONA_PORT` (`3306` by default) with the credentials above.

## Common issues

- **"Access denied" right after first boot.** The container needs a few seconds to initialize on a truly fresh `DATA_PATH_HOST`. Run `./laradock logs percona` and wait for a ready message before connecting.
- **Credential/database changes don't take effect.** `PERCONA_DATABASE`, `PERCONA_USER`, and `PERCONA_PASSWORD` are only applied when the data folder is created for the first time. If you change them afterward, either [start completely fresh](#start-completely-fresh-wipe-all-data) (data loss, back up first) or create the new user/database manually after `./laradock enter percona`.
- **`my.cnf` edits don't seem to apply.** `percona/my.cnf` is baked into the image at build time, not volume-mounted. `./laradock restart percona` alone won't pick up changes, you need `./laradock rebuild percona` first.
- **Running alongside `mysql` or `mariadb`.** They all default to host port `3306`; give each a distinct `PERCONA_PORT`/`MYSQL_PORT`/`MARIADB_PORT` if you need more than one up simultaneously.
- **Two Laradock projects overwrite each other's data.** Running more than one Laradock on the same machine? Set both `COMPOSE_PROJECT_NAME` and `DATA_PATH_HOST` to unique values per project, otherwise they share the same Percona data on disk.
- **App can't connect but the container is running.** Confirm the app's `.env` uses `DB_HOST=percona` (the container name), not `localhost` or `127.0.0.1`, those only work from your host machine, not from inside another container.

---

Need the community MySQL build instead? See **[MySQL](https://laradock.io/docs/services/mysql)**. For the full list of services, see **[Getting Started](https://laradock.io/docs/getting-started)**.
