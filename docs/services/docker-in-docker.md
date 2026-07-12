# Docker in Docker

Source: https://laradock.io/docs/services/docker-in-docker

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

## What is Docker in Docker?

Docker in Docker (dind) runs a full Docker daemon *inside* a container, so that container (or others pointed at it) can build images and run containers of their own. It's the standard way to give a CI runner (Jenkins, GitLab Runner, a custom pipeline) the ability to `docker build`/`docker run` without mounting the host's Docker socket. Laradock runs the official `docker:29-dind` image, unmodified.

## Start Docker in Docker

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock start docker-in-docker
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose up -d docker-in-docker
```

</TabItem>
</Tabs>

The container runs `privileged: true` (required for dind to manage its own cgroups and networking) and stays up via `restart: always`.

## Stop Docker in Docker

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock stop docker-in-docker
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose stop docker-in-docker
```

</TabItem>
</Tabs>

This stops the daemon container. Any images or containers built inside it are stored in the named `docker-in-docker` volume (mounted at `/certs/client`) and Docker's internal storage, both of which persist until the volume is removed.

To delete the container entirely (the named volume, and everything dind stored inside it, is still untouched):

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock remove docker-in-docker
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose rm -sf docker-in-docker
```

</TabItem>
</Tabs>

## Configuration

There is no `docker-in-docker/defaults.env` file, this service has no Laradock-specific environment variables. What is configured, directly in `docker-in-docker/compose.yml`:

| Setting | Value | What it does |
|---|---|---|
| `image` | `docker:29-dind` | The Docker-in-Docker image and version. |
| `DOCKER_TLS_SAN` | `DNS:docker-in-docker` | Adds the container name to the daemon's TLS certificate so clients can connect to it as `docker-in-docker` over TLS. |
| `privileged` | `true` | Required for the inner daemon to operate. |
| `expose` | `2375` | The Docker daemon port is exposed to other containers on the `backend` network only, it is not published to your host. |

To change the image tag (for example to pin a different Docker version), edit the `image:` line in `docker-in-docker/compose.yml` directly, then re-run the start command above, it will pull the new tag and recreate the container.

## Run Docker commands directly inside it

Useful for checking the daemon is healthy, or for testing a build manually before wiring up a CI runner:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock enter docker-in-docker
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose exec docker-in-docker sh
```

</TabItem>
</Tabs>

Then, inside the container, use the `docker` client that ships with the image against its own local daemon:

```sh
docker version
docker ps
```

## Connect to it from another container

Other containers on the `backend` network can point their Docker client at this daemon by setting `DOCKER_HOST=tcp://docker-in-docker:2375` (matching the exposed port). The `${APP_CODE_PATH_HOST}` folder is mounted into the container at `${APP_CODE_PATH_CONTAINER}`, so your project code is available if a build needs it, and TLS client certs are shared via the `docker-in-docker` named volume at `/certs/client`.

There is no host port mapping, so you cannot reach this daemon directly from your host machine, only from containers on the same Laradock network.

## Reset it (wipe everything dind has built or pulled)

To reclaim disk space or start the inner daemon from a completely clean state, remove the container and its named volume, then start again:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock stop docker-in-docker
./laradock remove docker-in-docker
docker volume rm $(docker volume ls -q --filter name=docker-in-docker)
./laradock start docker-in-docker
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose stop docker-in-docker
docker compose rm -sf docker-in-docker
docker volume rm $(docker volume ls -q --filter name=docker-in-docker)
docker compose up -d docker-in-docker
```

</TabItem>
</Tabs>

This deletes every image, container, and layer the inner daemon has ever built or pulled, along with its TLS client certs. There is nothing else to back up first, unlike a database this container holds no data your app depends on directly.

## Common issues

- **Can't connect from a CI runner container.** Make sure the runner container is on the same `backend` network and points `DOCKER_HOST` at `tcp://docker-in-docker:2375`, not `localhost`.
- **`Cannot connect to the Docker daemon`.** Give the dind container a few seconds to initialize after starting it; check `./laradock logs docker-in-docker` for the daemon's "API listen on" line.
- **Builds fail with permission or cgroup errors.** dind requires `privileged: true`, which is already set in `docker-in-docker/compose.yml`. If you've customized the compose file and removed it, the daemon won't start correctly.
- **Nested images vanish after `docker compose down -v`.** The `-v` flag removes named volumes, including the `docker-in-docker` volume backing this container's certs and layers. Use `./laradock stop docker-in-docker` (or plain `docker compose down` without `-v`) if you want to keep them.

---

Want your own place to push the images this builds? See **[Docker Registry](https://laradock.io/docs/services/docker-registry)**. New to Laradock? Start at **[Getting Started](https://laradock.io/docs/getting-started)**.
