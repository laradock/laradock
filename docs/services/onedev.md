# OneDev

Source: https://laradock.io/docs/services/onedev

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

## What is OneDev?

[OneDev](https://onedev.io) is a self-hosted Git server with built-in CI/CD pipelines and issue tracking, packaged as a single container with no external database dependency. Laradock runs it standalone, unlike GitLab it doesn't need `postgres` or `redis`.

## Start OneDev

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock start onedev
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose up -d onedev
```

</TabItem>
</Tabs>

## Stop OneDev

This stops the container without deleting its data. OneDev's state lives under `DATA_PATH_HOST/onedev` on your host.

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock stop onedev
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose stop onedev
```

</TabItem>
</Tabs>

To delete the container entirely (the data on disk is still untouched, it lives under `DATA_PATH_HOST/onedev`):

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock remove onedev
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose rm -sf onedev
```

</TabItem>
</Tabs>

## Configuration

All settings live in `onedev/defaults.env` and can be overridden by adding the same line to your own `.env` (your `.env` always wins):

| Variable | Default | What it does |
|---|---|---|
| `ONEDEV_HTTP_PORT` | `6610` | Host-side port for the OneDev web UI. |
| `ONEDEV_SSH_PORT` | `6611` | Host-side port for Git-over-SSH. |

The `onedev/compose.yml` image tag is unpinned (`1dev/server`, no version suffix), so `./laradock rebuild onedev` always pulls whatever is currently tagged `latest` on Docker Hub, there's no `ONEDEV_VERSION` variable to pin a specific release.

## Complete the setup wizard

1. Start the container, then open [http://localhost:6610](http://localhost:6610).
2. Follow the setup wizard to create your admin account.

Git over SSH is available on port `6611` by default; clone with `ssh://git@localhost:6611/<repo-path>`.

## Docker-based CI/CD jobs

`onedev/compose.yml` mounts `/var/run/docker.sock` from your host into the container, so OneDev's build agent can launch job containers directly on your **host's** Docker engine (the same pattern Jenkins and GitLab runners use). To use it, add a Docker executor under **Administration → Job Executors** in the OneDev UI, pointing it at the mounted socket. Because those job containers run on the host engine, they are **not** on Laradock's internal Docker network, a job can't reach another Laradock service by its container name (`mysql`, `redis`, etc.); use `host.docker.internal` and the service's published host port instead.

## Backup and restore

OneDev keeps everything, its embedded database, repositories, and search index, under a single directory: `DATA_PATH_HOST/onedev` (mounted to `/opt/onedev` in the container). The safest way to back it up is a filesystem copy while the container is stopped, so nothing is mid-write:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock stop onedev
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose stop onedev
```

</TabItem>
</Tabs>

```bash
tar -czf onedev-backup.tar.gz -C "${DATA_PATH_HOST:-~/.laradock/data}" onedev
```

**Restore** by stopping the container, clearing the target folder, extracting the archive back into place, then starting again:

```bash
rm -rf "${DATA_PATH_HOST:-~/.laradock/data}/onedev"
tar -xzf onedev-backup.tar.gz -C "${DATA_PATH_HOST:-~/.laradock/data}"
```

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock start onedev
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose up -d onedev
```

</TabItem>
</Tabs>

## Start completely fresh (wipe all data)

To throw away everything, repositories, issues, CI/CD configuration, the admin account, and start OneDev from a clean, empty state (⚠️ this **permanently deletes** all of it, back up first if you need anything):

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock stop onedev
./laradock remove onedev
rm -rf "${DATA_PATH_HOST:-~/.laradock/data}/onedev"
./laradock start onedev
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose stop onedev
docker compose rm -sf onedev
rm -rf "${DATA_PATH_HOST:-~/.laradock/data}/onedev"
docker compose up -d onedev
```

</TabItem>
</Tabs>

Starting again re-runs the setup wizard from scratch, including creating a new admin account.

## Common issues

- **Port `6610` or `6611` already in use.** Change `ONEDEV_HTTP_PORT` or `ONEDEV_SSH_PORT` in `.env` and restart: `./laradock restart onedev`.
- **First page load is slow.** OneDev initializes its embedded database and search index on first boot; give it a minute and check `./laradock logs onedev`.
- **SSH clone fails.** Confirm you're using the mapped host port (`ONEDEV_SSH_PORT`, `6611` by default), not the container-internal `6611` if you've remapped it, and that your SSH key is added in OneDev's user settings.
- **CI/CD jobs can't reach another Laradock service.** Docker-executor jobs run on your host's Docker engine, not Laradock's internal network, see [Docker-based CI/CD jobs](#docker-based-cicd-jobs) above.

---

Need CI/CD without a bundled Git server instead? See **[Jenkins](https://laradock.io/docs/services/jenkins)**. Prefer a fuller-featured self-hosted GitHub alternative? See **[GitLab](https://laradock.io/docs/services/gitlab)**. New to Laradock? Start at **[Getting Started](https://laradock.io/docs/getting-started)**.
