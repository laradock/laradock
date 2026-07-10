---
slug: /services/docker-registry
title: Docker Registry
description: Run a private Docker image registry in Laradock. Start and stop the container, configure the port, push/pull, browse, back up, and secure your own images.
keywords:
  - laradock docker registry
  - private docker registry
  - self hosted docker registry
  - docker registry docker compose
  - push pull docker images
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

## What is Docker Registry?

[Docker Registry](https://hub.docker.com/_/registry) (also called Distribution) is the official open-source server for storing and distributing Docker images. Running your own instance lets you push and pull images without relying on Docker Hub or a paid registry service, useful for private images, air-gapped environments, or CI pipelines that need a local cache. Laradock builds it from the official `registry:2` image.

## Start Docker Registry

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock start docker-registry
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose up -d docker-registry
```

</TabItem>
</Tabs>

## Stop Docker Registry

Stopping just pauses the container; your images on disk are safe:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock stop docker-registry
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose stop docker-registry
```

</TabItem>
</Tabs>

To delete the container entirely (the data on disk is untouched, it lives under `DATA_PATH_HOST/docker-registry`):

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock remove docker-registry
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose rm -sf docker-registry
```

</TabItem>
</Tabs>

## Configuration

All settings live in `docker-registry/defaults.env` and can be overridden by adding the same line to your own `.env`:

| Variable | Default | What it does |
|---|---|---|
| `DOCKER_REGISTRY_PORT` | `5000` | Host-side port the registry's HTTP API is published on (`host:5000`). |

That's the only variable Laradock exposes; everything else is the stock `registry:2` image behavior, tunable by adding an `environment:` block to `docker-registry/compose.yml` (see [Secure the registry with authentication](#secure-the-registry-with-authentication) and [Enable image deletion and garbage collection](#enable-image-deletion-and-garbage-collection) below).

## Push and pull images

The registry stores image data under `DATA_PATH_HOST/docker-registry` on your host (mounted to `/var/lib/registry` in the container), so images survive container restarts and rebuilds.

From your host machine (registry reachable on `localhost:5000` by default):

```bash
docker tag your-image:latest localhost:5000/your-image:latest
docker push localhost:5000/your-image:latest
docker pull localhost:5000/your-image:latest
```

From another container on Laradock's `backend` network, use the container name instead of `localhost`: `docker-registry:5000`.

## Browse what's stored (the catalog API)

The registry has no built-in web UI, but it exposes its contents over its own HTTP API. List every repository:

```bash
curl http://localhost:5000/v2/_catalog
```

List the tags pushed for one repository:

```bash
curl http://localhost:5000/v2/your-image/tags/list
```

## Backup and restore

**Back up** every image by archiving the data folder on your host (stop the container first so nothing is mid-write):

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock stop docker-registry
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose stop docker-registry
```

</TabItem>
</Tabs>

```bash
tar -czf docker-registry-backup.tar.gz -C "${DATA_PATH_HOST:-~/.laradock/data}/docker-registry" .
```

**Restore** by extracting that archive back into the data folder before starting the container again:

```bash
mkdir -p "${DATA_PATH_HOST:-~/.laradock/data}/docker-registry"
tar -xzf docker-registry-backup.tar.gz -C "${DATA_PATH_HOST:-~/.laradock/data}/docker-registry"
```

This is a plain filesystem copy, no special export/import tool is needed since the registry's storage driver is just files on disk.

## Start completely fresh (wipe all data)

To throw away every pushed image and start from a clean, empty registry (this **permanently deletes** everything in it, back up first if you need anything):

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock stop docker-registry
./laradock remove docker-registry
rm -rf "${DATA_PATH_HOST:-~/.laradock/data}/docker-registry"
./laradock start docker-registry
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose stop docker-registry
docker compose rm -sf docker-registry
rm -rf "${DATA_PATH_HOST:-~/.laradock/data}/docker-registry"
docker compose up -d docker-registry
```

</TabItem>
</Tabs>

`DATA_PATH_HOST` is whatever you have set in `.env` (`~/.laradock/data` by default), so the folder above is where every pushed image actually lives on your machine.

## Enable image deletion and garbage collection

By default the registry accepts pushes but refuses `DELETE` requests, so old tags pile up forever. To allow deleting image manifests, add an `environment:` block to the `docker-registry` service in `docker-registry/compose.yml`:

```yaml
environment:
  - REGISTRY_STORAGE_DELETE_ENABLED=true
```

Then rebuild:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock restart docker-registry
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose up -d docker-registry
```

</TabItem>
</Tabs>

Deleting a manifest only unlinks it, it doesn't reclaim disk space right away. Run the registry's own garbage collector afterward to actually free it up:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock enter docker-registry
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose exec docker-registry bash
```

</TabItem>
</Tabs>

```bash
registry garbage-collect /etc/docker/registry/config.yml
```

## Secure the registry with authentication

Out of the box the registry has **no authentication**, anyone who can reach `DOCKER_REGISTRY_PORT` can push and pull. That's fine on a machine only you can reach, but worth locking down if the port is ever exposed beyond your own host. The stock `registry:2` image supports HTTP Basic auth via an htpasswd file: generate one, mount it, and point the registry at it with an `environment:`/`volumes:` block in `docker-registry/compose.yml`:

```yaml
environment:
  - REGISTRY_AUTH=htpasswd
  - REGISTRY_AUTH_HTPASSWD_REALM=Registry Realm
  - REGISTRY_AUTH_HTPASSWD_PATH=/auth/htpasswd
volumes:
  - ./docker-registry/auth:/auth
```

Generate the htpasswd file with `htpasswd` (from the `apache2-utils`/`httpd-tools` package) before starting:

```bash
htpasswd -Bc docker-registry/auth/htpasswd your-username
```

After that, `docker login localhost:5000` is required before any push/pull against this registry.

## Common issues

- **`http: server gave HTTP response to HTTPS client`.** The stock registry image serves plain HTTP, not HTTPS. Docker's client refuses to push/pull over HTTP to a registry it doesn't consider `localhost` by default. If you're hitting it from another machine or a non-`localhost` hostname, add it to your Docker daemon's `insecure-registries` list.
- **Port already in use on your host.** Another local registry (or another Laradock project) is already bound to `5000`. Change `DOCKER_REGISTRY_PORT` in `.env` and restart: `./laradock restart docker-registry`.
- **Pushed images disappear after a rebuild.** Confirm `DATA_PATH_HOST` didn't change between runs. The registry's storage is bind-mounted from your host, so a different `DATA_PATH_HOST` means a different (empty) image store.
- **Two Laradock projects overwrite each other's images.** Running more than one Laradock on the same machine? Set both `COMPOSE_PROJECT_NAME` and `DATA_PATH_HOST` to unique values per project, otherwise they share the same registry data on disk.
- **`DELETE` requests return 405 Method Not Allowed.** Image deletion is off by default, see [Enable image deletion and garbage collection](#enable-image-deletion-and-garbage-collection) above.

---

Need to build and run Docker-in-Docker for CI-style workflows? See **[Docker in Docker](/docs/services/docker-in-docker)**. New to Laradock? Start at **[Getting Started](/docs/getting-started)**.
