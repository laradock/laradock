---
slug: /services/portainer
title: Portainer
description: Run Portainer in Laradock for a web UI to manage your Docker containers, images, volumes, and networks.
keywords:
  - laradock portainer
  - portainer docker
  - portainer docker compose
  - docker management ui
  - docker web dashboard
---

## What is Portainer?

[Portainer](https://www.portainer.io) is a web-based UI for managing Docker: containers, images, volumes, networks, and logs, all from a browser instead of the CLI. Laradock runs it with access to the host's Docker socket so it can manage the whole stack, including containers outside Laradock itself.

## Start Portainer

```bash
docker compose up -d portainer
```

## Stop Portainer

```bash
docker compose stop portainer
```

This stops the container without deleting its data. Portainer's own state (users, settings) lives under `DATA_PATH_HOST/portainer_data` on your host.

## Configuration

Portainer has no `defaults.env` file of its own, it isn't parameterized per-service in Laradock. It uses the shared top-level settings from the root `.env`:

| Variable | Default | What it does |
|---|---|---|
| `DATA_PATH_HOST` | `~/.laradock/data` | Host folder for all Laradock data volumes; Portainer's state lives at `DATA_PATH_HOST/portainer_data`. |
| `DOCKER_HOST_IP` | `10.0.75.1` | Added as an `extra_hosts` entry (`dockerhost`) so the container can reach services running directly on your host. |

The published port (`9010` on the host, mapping to `9000` in the container) is hardcoded in `portainer/compose.yml`, not driven by an env var. To change it, edit the `ports:` line in that file directly.

## Open the dashboard

Start the container, then open [http://localhost:9010](http://localhost:9010) and create your admin account on first visit.

## Common issues

- **Port `9010` already in use.** Since the port isn't controlled by an env var, edit the `ports:` mapping in `portainer/compose.yml` directly, then `docker compose up -d portainer`.
- **Portainer can't see other containers.** It needs `/var/run/docker.sock` mounted (this is the default in `portainer/compose.yml`); confirm that mount wasn't removed.
- **Can't reach services running on your host machine from inside Portainer.** Confirm `DOCKER_HOST_IP` in `.env` matches your actual host IP for your OS/Docker setup (defaults assume Docker Desktop's typical gateway).
- **Lost dashboard settings after recreating the container.** Data persists in `DATA_PATH_HOST/portainer_data`; if you changed `DATA_PATH_HOST` or wiped that folder, Portainer starts fresh and asks you to create a new admin account.

---

Prefer managing containers straight from the terminal? See the **[Getting Started](/docs/getting-started)** guide for core `docker compose` commands.
