# Portainer

Source: https://laradock.io/docs/services/portainer

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

## What is Portainer?

[Portainer](https://www.portainer.io) is a web-based UI for managing Docker: containers, images, volumes, networks, and logs, all from a browser instead of the CLI. Laradock runs it with access to the host's Docker socket so it can manage the whole stack, including containers outside Laradock itself.

## Start Portainer

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock start portainer
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose up -d portainer
```

</TabItem>
</Tabs>

## Create your admin account (first run)

Open [http://localhost:9010](http://localhost:9010) right after starting the container. Portainer makes you set the initial admin username and password on this very first visit, there's no default login to look up.

This window is time-limited: if you don't finish creating the admin account within a few minutes of the container's first boot, Portainer disables the setup endpoint for security and refuses to let you create one, showing an error instead of the setup form. If that happens, [start completely fresh](#start-completely-fresh-wipe-all-data) (or just recreate the container if you haven't put anything in it yet) and complete the setup form promptly this time.

## Stop Portainer

Stopping just pauses the container; **your data is safe**:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock stop portainer
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose stop portainer
```

</TabItem>
</Tabs>

To delete the container entirely (the data on disk is still untouched, it lives under `DATA_PATH_HOST`):

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock remove portainer
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose rm -sf portainer
```

</TabItem>
</Tabs>

Portainer's own state (admin account, users, settings, registered endpoints) lives under `DATA_PATH_HOST/portainer_data` on your host, so removing the container alone doesn't lose anything.

## Configuration

Portainer has no `defaults.env` file of its own, it isn't parameterized per-service in Laradock. It uses the shared top-level settings from the root `.env`:

| Variable | Default | What it does |
|---|---|---|
| `DATA_PATH_HOST` | `~/.laradock/data` | Host folder for all Laradock data volumes; Portainer's state lives at `DATA_PATH_HOST/portainer_data`. |
| `DOCKER_HOST_IP` | `10.0.75.1` | Added as an `extra_hosts` entry (`dockerhost`) so the container can reach services running directly on your host. |

The published port (`9010` on the host, mapping to `9000` in the container) is hardcoded in `portainer/compose.yml`, not driven by an env var. To change it, edit the `ports:` line in that file directly.

Portainer is mounted with `/var/run/docker.sock`, which gives it full control over your Docker daemon, effectively root-equivalent access to the host. That's what lets it manage every container, not just Laradock's, so treat the dashboard with the same care as root access to your machine.

## Backup and restore

Everything Portainer knows (admin account, users, endpoints, stack definitions saved in the UI) lives entirely in `DATA_PATH_HOST/portainer_data`, there's no database to dump. **Back it up** by copying that folder while the container is stopped, so nothing is mid-write:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock stop portainer
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose stop portainer
```

</TabItem>
</Tabs>

```bash
tar -czf portainer-backup.tar.gz -C "${DATA_PATH_HOST:-~/.laradock/data}" portainer_data
```

**Restore** by extracting that archive back into the same location (with the container stopped) before starting it again:

```bash
tar -xzf portainer-backup.tar.gz -C "${DATA_PATH_HOST:-~/.laradock/data}"
```

## Start completely fresh (wipe all data)

To throw away every Portainer setting and go back to a blank first-run state (⚠️ this **permanently deletes** your admin account, users, and any saved endpoints/stacks, back up first if you need anything):

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock stop portainer
./laradock remove portainer
rm -rf "${DATA_PATH_HOST:-~/.laradock/data}/portainer_data"
./laradock start portainer
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose stop portainer
docker compose rm -sf portainer
rm -rf "${DATA_PATH_HOST:-~/.laradock/data}/portainer_data"
docker compose up -d portainer
```

</TabItem>
</Tabs>

Starting it back up drops you into the [first-run admin setup](#create-your-admin-account-first-run) again.

## Pin a specific Portainer version

`portainer/Dockerfile` builds from `portainer/portainer` with no tag, which tracks whatever `latest` currently points to. To pin a version instead, edit the `FROM` line, for example:

```dockerfile
FROM portainer/portainer-ce:2.19.4
```

Then apply it:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock rebuild portainer
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose build portainer
```

</TabItem>
</Tabs>

## Common issues

- **Port `9010` already in use.** Since the port isn't controlled by an env var, edit the `ports:` mapping in `portainer/compose.yml` directly, then `./laradock start portainer`.
- **"Setup expired" / can't create the admin account.** You didn't finish the [first-run setup form](#create-your-admin-account-first-run) in time. [Start completely fresh](#start-completely-fresh-wipe-all-data) and complete it promptly.
- **Portainer can't see other containers.** It needs `/var/run/docker.sock` mounted (this is the default in `portainer/compose.yml`); confirm that mount wasn't removed.
- **Can't reach services running on your host machine from inside Portainer.** Confirm `DOCKER_HOST_IP` in `.env` matches your actual host IP for your OS/Docker setup (defaults assume Docker Desktop's typical gateway).
- **Lost dashboard settings after recreating the container.** Data persists in `DATA_PATH_HOST/portainer_data`; if you changed `DATA_PATH_HOST` or wiped that folder, Portainer starts fresh and asks you to create a new admin account.

---

Prefer managing containers straight from the terminal? See the **[Getting Started](https://laradock.io/docs/getting-started)** guide for core `docker compose` commands.
