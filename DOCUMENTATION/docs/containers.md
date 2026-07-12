---
slug: /containers
title: Managing Containers
description: "The core Docker Compose commands for running Laradock day to day: list, enter, stop, delete, and rebuild containers, view logs, edit a service's config, and add new services."
keywords:
  - laradock containers
  - docker compose commands
  - enter docker container
  - rebuild docker container
  - docker compose logs
  - add docker service
  - edit docker compose config
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

The core commands you use every day to start, stop, inspect, and rebuild your stack.

**Configuring one specific service?** The commands here work on any container, but each service also has its own page with its `.env` flags, ports, and default credentials:

<div className="install-grid">
  <a href="/docs/services/mysql">MySQL</a>
  <a href="/docs/services/postgres">PostgreSQL</a>
  <a href="/docs/services/mariadb">MariaDB</a>
  <a href="/docs/services/redis">Redis</a>
  <a href="/docs/services/mongo">MongoDB</a>
  <a href="/docs/services/nginx">NGINX</a>
  <a href="/docs/services/apache2">Apache</a>
  <a href="/docs/services/elasticsearch">Elasticsearch</a>
  <a href="/docs/services/meilisearch">Meilisearch</a>
  <a href="/docs/services/mailpit">Mailpit</a>
  <a href="/docs/services/php-fpm">PHP-FPM</a>
  <a href="/docs/services/workspace">Workspace</a>
</div>

Not listed? Browse the [full catalog of 100+ services](/docs/Intro#supported-services).

## List running containers

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock info
```

Shows what's running, plus the URLs, ports, and passwords to reach each service.

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose ps

# Or use Docker directly (all containers, not just this project):
docker ps
```

</TabItem>
</Tabs>

## Enter a container

Open a shell inside a running container to run commands in it.

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock enter mysql
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose exec mysql bash
```

</TabItem>
</Tabs>

Swap `mysql` for any container name. To open the MySQL prompt directly instead of a shell:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock exec mysql mysql -udefault -psecret
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose exec mysql mysql -udefault -psecret
```

</TabItem>
</Tabs>

Type `exit` to leave.

:::tip
`./laradock enter` always uses the `laradock` user in the `workspace` container, so files it creates are owned by your host user (not root). Need root instead? `./laradock enter workspace --root`, or manually: `docker compose exec --user=laradock workspace bash`.
:::

## Stop containers

Stop everything:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock stop
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose stop
```

</TabItem>
</Tabs>

Stop a single container:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock stop mysql
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose stop mysql
```

</TabItem>
</Tabs>

## Delete containers

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

Your data on disk is untouched either way, it lives under `DATA_PATH_HOST`, outside the containers (see [Data & Volumes](/docs/volumes)). `docker compose down` additionally tears down the project's network, rarely something you need to think about for local dev.

## View logs

NGINX writes its logs to the `logs/nginx` directory. For any other container, use:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock logs mysql
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose logs mysql
```

</TabItem>
</Tabs>

Follow the log live with `-f`:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock logs mysql -f
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose logs -f mysql
```

</TabItem>
</Tabs>

See the [Docker Compose logs options](https://docs.docker.com/compose/reference/logs/) for more.

## Build or rebuild containers

After editing any `Dockerfile`, rebuild for the change to take effect:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock rebuild
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose build
```

</TabItem>
</Tabs>

Rebuild a single container instead of all of them:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock rebuild mysql
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose build mysql
```

</TabItem>
</Tabs>

Use `--no-cache` to force a full, clean rebuild:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock rebuild --no-cache mysql
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose build --no-cache mysql
```

</TabItem>
</Tabs>

## Edit a container's Compose config

Everything about a service lives in its folder: its container definition in `<service>/compose.yml` and its settings in `<service>/defaults.env`. For plain value changes (ports, versions, credentials), don't edit files at all, just override the variable in your `.env`. Edit `<service>/compose.yml` only for structural changes.

*Change the MySQL database name (in `mysql/compose.yml`):*

```yml
    environment:
        MYSQL_DATABASE: laradock
    ...
```

*Map Redis to a different host port (`1111`), no file editing needed, just add to your `.env`:*

```env
REDIS_PORT=1111
```

## Edit a Docker image

1. Find the image's `Dockerfile`, for `mysql` it's `mysql/Dockerfile`.
2. Edit it as you like.
3. Rebuild the container: `./laradock rebuild mysql` (or `docker compose build mysql`).

For the common cases, toggling a bundled feature, installing a PHP extension, or adding a system package, see [Customizing Images](/docs/customizing-images).

## Add more services

Chances are the service you want already ships with Laradock, browse the [full catalog of 100+ services](/docs/Intro#supported-services) first. To add a genuinely new one, create a folder for it containing a `compose.yml` with your container definition (plus a `defaults.env` for its settings, if any), then register it in the root `docker-compose.yml` by adding an `include` entry like the existing ones. You'll want to be familiar with the [Docker Compose file syntax](https://docs.docker.com/compose/compose-file/).
