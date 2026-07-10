---
slug: /services/docker-in-docker
title: Docker in Docker
description: Run Docker in Docker (dind) in Laradock so a container can build and run other containers, useful for self-hosted CI runners.
keywords:
  - laradock docker in docker
  - dind docker compose
  - docker in docker ci
  - self hosted ci runner docker
  - build docker images inside docker
---

## What is Docker in Docker?

Docker in Docker (dind) runs a full Docker daemon *inside* a container, so that container (or others pointed at it) can build images and run containers of their own. It's the standard way to give a CI runner (Jenkins, GitLab Runner, a custom pipeline) the ability to `docker build`/`docker run` without mounting the host's Docker socket. Laradock runs the official `docker:29-dind` image, unmodified.

## Start Docker in Docker

```bash
docker compose up -d docker-in-docker
```

The container runs `privileged: true` (required for dind to manage its own cgroups and networking) and stays up via `restart: always`.

## Stop Docker in Docker

```bash
docker compose stop docker-in-docker
```

This stops the daemon container. Any images or containers built inside it are stored in the named `docker-in-docker` volume (mounted at `/certs/client`) and Docker's internal storage, both of which persist until the volume is removed.

## Configuration

`docker-in-docker/defaults.env` is empty, there are no Laradock-specific environment variables for this service. What is configured, directly in `docker-in-docker/compose.yml`:

| Setting | Value | What it does |
|---|---|---|
| `image` | `docker:29-dind` | The Docker-in-Docker image and version. |
| `DOCKER_TLS_SAN` | `DNS:docker-in-docker` | Adds the container name to the daemon's TLS certificate so clients can connect to it as `docker-in-docker` over TLS. |
| `privileged` | `true` | Required for the inner daemon to operate. |
| `expose` | `2375` | The Docker daemon port is exposed to other containers on the `backend` network only, it is not published to your host. |

## Connect to it from another container

Other containers on the `backend` network can point their Docker client at this daemon by setting `DOCKER_HOST=tcp://docker-in-docker:2375` (matching the exposed port). The `${APP_CODE_PATH_HOST}` folder is mounted into the container at `${APP_CODE_PATH_CONTAINER}`, so your project code is available if a build needs it, and TLS client certs are shared via the `docker-in-docker` named volume at `/certs/client`.

There is no host port mapping, so you cannot reach this daemon directly from your host machine, only from containers on the same Laradock network.

## Common issues

- **Can't connect from a CI runner container.** Make sure the runner container is on the same `backend` network and points `DOCKER_HOST` at `tcp://docker-in-docker:2375`, not `localhost`.
- **`Cannot connect to the Docker daemon`.** Give the dind container a few seconds to initialize after `docker compose up`; check `docker compose logs docker-in-docker` for the daemon's "API listen on" line.
- **Builds fail with permission or cgroup errors.** dind requires `privileged: true`, which is already set in `docker-in-docker/compose.yml`. If you've customized the compose file and removed it, the daemon won't start correctly.
- **Nested images vanish after `docker compose down -v`.** The `-v` flag removes named volumes, including the `docker-in-docker` volume backing this container's certs and layers. Use `docker compose down` (without `-v`) if you want to keep them.

---

Want your own place to push the images this builds? See **[Docker Registry](/docs/services/docker-registry)**. New to Laradock? Start at **[Getting Started](/docs/getting-started)**.
