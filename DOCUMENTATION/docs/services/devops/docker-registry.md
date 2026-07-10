---
slug: /services/docker-registry
title: Docker Registry
description: Run a private Docker image registry in Laradock. Start and stop the container, configure the port, and push/pull your own images.
keywords:
  - laradock docker registry
  - private docker registry
  - self hosted docker registry
  - docker registry docker compose
  - push pull docker images
---

## What is Docker Registry?

[Docker Registry](https://hub.docker.com/_/registry) (also called Distribution) is the official open-source server for storing and distributing Docker images. Running your own instance lets you push and pull images without relying on Docker Hub or a paid registry service, useful for private images, air-gapped environments, or CI pipelines that need a local cache. Laradock builds it from the official `registry:2` image.

## Start Docker Registry

```bash
docker compose up -d docker-registry
```

## Stop Docker Registry

```bash
docker compose stop docker-registry
```

This stops the container without deleting its data. To remove the container (data on disk is untouched, it lives under `DATA_PATH_HOST/docker-registry`): `docker compose rm -f docker-registry`.

## Configuration

All settings live in `docker-registry/defaults.env` and can be overridden by adding the same line to your own `.env`:

| Variable | Default | What it does |
|---|---|---|
| `DOCKER_REGISTRY_PORT` | `5000` | Host-side port the registry's HTTP API is published on (`host:5000`). |

That's the only variable Laradock exposes; everything else is the stock `registry:2` image behavior.

## Push and pull images

The registry stores image data under `DATA_PATH_HOST/docker-registry` on your host (mounted to `/var/lib/registry` in the container), so images survive container restarts and rebuilds.

From your host machine (registry reachable on `localhost:5000` by default):

```bash
docker tag your-image:latest localhost:5000/your-image:latest
docker push localhost:5000/your-image:latest
docker pull localhost:5000/your-image:latest
```

From another container on Laradock's `backend` network, use the container name instead of `localhost`: `docker-registry:5000`.

## Common issues

- **`http: server gave HTTP response to HTTPS client`.** The stock registry image serves plain HTTP, not HTTPS. Docker's client refuses to push/pull over HTTP to a registry it doesn't consider `localhost` by default. If you're hitting it from another machine or a non-`localhost` hostname, add it to your Docker daemon's `insecure-registries` list.
- **Port already in use on your host.** Another local registry (or another Laradock project) is already bound to `5000`. Change `DOCKER_REGISTRY_PORT` in `.env` and restart.
- **Pushed images disappear after a rebuild.** Confirm `DATA_PATH_HOST` didn't change between runs. The registry's storage is bind-mounted from your host, so a different `DATA_PATH_HOST` means a different (empty) image store.
- **Two Laradock projects overwrite each other's images.** Running more than one Laradock on the same machine? Set both `COMPOSE_PROJECT_NAME` and `DATA_PATH_HOST` to unique values per project, otherwise they share the same registry data on disk.

---

Need to build and run Docker-in-Docker for CI-style workflows? See **[Docker in Docker](/docs/services/docker-in-docker)**. New to Laradock? Start at **[Getting Started](/docs/getting-started)**.
