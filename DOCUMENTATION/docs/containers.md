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

The core commands you use every day to start, stop, inspect, and rebuild your stack.

## List running containers

```bash
docker ps
```

To see only the containers from this project:

```bash
docker compose ps
```

## Enter a container

Open a shell inside a running container to run commands in it.

1. List the running containers with `docker ps`.
2. Enter the one you want:
   ```bash
   docker compose exec {container-name} bash
   ```
   *Example, enter the MySQL container:*
   ```bash
   docker compose exec mysql bash
   ```
   *Example, open the MySQL prompt directly:*
   ```bash
   docker compose exec mysql mysql -udefault -psecret
   ```
3. Type `exit` to leave.

:::tip
add `--user=laradock` to run as the Laradock user so created files are owned by your host user: `docker compose exec --user=laradock workspace bash`.
:::

## Stop containers

Stop everything:

```bash
docker compose stop
```

Stop a single container:

```bash
docker compose stop {container-name}
```

## Delete containers

```bash
docker compose down
```

## View logs

NGINX writes its logs to the `logs/nginx` directory. For any other container, use:

```bash
docker compose logs {container-name}
```

Follow the log live with `-f`:

```bash
docker compose logs -f {container-name}
```

See the [Docker Compose logs options](https://docs.docker.com/compose/reference/logs/) for more.

## Build or rebuild containers

After editing any `Dockerfile`, rebuild for the change to take effect:

```bash
docker compose build
```

Rebuild a single container instead of all of them:

```bash
docker compose build {container-name}
```

Use `--no-cache` to force a full, clean rebuild:

```bash
docker compose build --no-cache {container-name}
```

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
3. Rebuild the container:
   ```bash
   docker compose build mysql
   ```

## Add more services

To add a new service (software), create a folder for it containing a `compose.yml` with your container definition (plus a `defaults.env` for its settings, if any), then register it in the root `docker-compose.yml` by adding an `include` entry like the existing ones. You'll want to be familiar with the [Docker Compose file syntax](https://docs.docker.com/compose/compose-file/).
