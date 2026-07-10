---
slug: /services/sonarqube
title: SonarQube
description: Run SonarQube in Laradock for automatic code review. Start the container, set your hostname, run your first scan, back up your data, and fix common Postgres and log-permission errors.
keywords:
  - laradock sonarqube
  - sonarqube docker
  - sonarqube docker compose
  - static code analysis docker
  - code quality docker
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

## What is SonarQube?

[SonarQube](https://docs.sonarqube.org/latest/) is an automatic code-review tool that scans your codebase for bugs, vulnerabilities, and code smells across branches and pull requests. Laradock runs it as its own container, backed by the `postgres` service already in the stack.

## Start SonarQube

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock start sonarqube
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose up -d sonarqube
```

</TabItem>
</Tabs>

SonarQube depends on `postgres` (declared in `sonarqube/compose.yml`), Compose starts it automatically. First boot takes a minute or two while SonarQube's embedded Elasticsearch index initializes, watch `./laradock logs sonarqube` for `SonarQube is operational` before opening the UI.

## Stop SonarQube

Stopping just pauses the container; **your data is safe**:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock stop sonarqube
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose stop sonarqube
```

</TabItem>
</Tabs>

To delete the container entirely (the data on disk is still untouched, it lives under `DATA_PATH_HOST/sonarqube`):

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock remove sonarqube
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose rm -sf sonarqube
```

</TabItem>
</Tabs>

## Configuration

All settings live in `sonarqube/defaults.env` and can be overridden by adding the same line to your own `.env` (your `.env` always wins):

| Variable | Default | What it does |
|---|---|---|
| `SONARQUBE_HOSTNAME` | `sonar.example.com` | Hostname the container identifies itself as; set it to your real domain. |
| `SONARQUBE_PORT` | `9000` | Host-side port SonarQube is published on. |
| `SONARQUBE_POSTGRES_HOST` | `postgres` | Hostname of the Postgres container SonarQube connects to. |

SonarQube also needs `SONARQUBE_POSTGRES_USER`, `SONARQUBE_POSTGRES_PASSWORD`, and `SONARQUBE_POSTGRES_DB` to create its database in Postgres. These aren't in `sonarqube/defaults.env`, they ship as top-level defaults in `.env.example` (`sonar` / `sonarPass` / `sonar`). The `postgres` service also needs `SONARQUBE_POSTGRES_INIT=true` (set by default in `postgres/defaults.env`) to auto-create that database and user on its first boot.

## Initial admin setup

The first-run confusion point with SonarQube: it ships with a default login of **`admin` / `admin`**, and the UI forces you to set a new password the first time you sign in at [http://localhost:9000/](http://localhost:9000/) (`SONARQUBE_PORT`). There's no separate "unlock" file to hunt down like Jenkins, just log in once with the defaults and follow the prompt.

## Run your first scan

SonarQube only reviews code you actively send it. From your project's root:

1. Log in to the UI, then go to **My Account → Security → Generate Tokens** to create an analysis token.
2. Run [`sonar-scanner`](https://docs.sonarqube.org/latest/analyzing-source-code/scanners/sonarscanner/) against this instance (install it on your host or inside `./laradock workspace` if your project doesn't already ship one via a build tool plugin):

```bash
sonar-scanner \
  -Dsonar.projectKey=my-project \
  -Dsonar.sources=. \
  -Dsonar.host.url=http://localhost:9000 \
  -Dsonar.login=<your-token>
```

Swap `http://localhost:9000` for `SONARQUBE_HOSTNAME`'s address if you changed it, and `<your-token>` for the token from step 1. Results show up under the project's dashboard in the UI once the scan finishes.

## Set your hostname

```env
SONARQUBE_HOSTNAME=sonar.example.com
```

Set this to your actual domain before exposing SonarQube beyond local dev. `SONARQUBE_HOSTNAME` is baked into the container at creation time (it's the Compose `hostname:` field), so a plain restart won't pick it up, rebuild and recreate the container:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock rebuild sonarqube
./laradock start sonarqube
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose build sonarqube
docker compose up -d sonarqube
```

</TabItem>
</Tabs>

Then open [http://localhost:9000/](http://localhost:9000/).

## Backup and restore

SonarQube's real state (projects, analysis history, quality gates, users) lives in its Postgres database, not in the container itself. Back that up with `pg_dump` against the `postgres` service:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock exec -T postgres pg_dump -U sonar sonar > sonarqube-backup.sql
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose exec -T postgres pg_dump -U sonar sonar > sonarqube-backup.sql
```

</TabItem>
</Tabs>

Swap `sonar`/`sonar` for your own `SONARQUBE_POSTGRES_USER`/`SONARQUBE_POSTGRES_DB` if you changed them. The `-T` disables the container's pseudo-terminal so the dump isn't corrupted when redirected to a file, always include it when piping output to or from a file.

Restore it into an existing SonarQube database:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock exec -T postgres psql -U sonar sonar < sonarqube-backup.sql
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose exec -T postgres psql -U sonar sonar < sonarqube-backup.sql
```

</TabItem>
</Tabs>

Plugins, custom quality profiles stored on disk, and logs live under `DATA_PATH_HOST/sonarqube/{extensions,plugins,conf,logs}`, copy that folder alongside the database dump if you rely on custom plugins.

## Start completely fresh (wipe all data)

`postgres` is shared with other services (Confluence, GitLab, Keycloak), so wiping its whole data folder would take those down too. To reset **only** SonarQube, drop its database and its own data folders instead:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock stop sonarqube
./laradock remove sonarqube
rm -rf "${DATA_PATH_HOST:-~/.laradock/data}/sonarqube"
./laradock exec postgres psql -U postgres -c "DROP DATABASE sonar;"
./laradock exec postgres psql -U postgres -c "CREATE DATABASE sonar OWNER sonar;"
./laradock start sonarqube
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose stop sonarqube
docker compose rm -sf sonarqube
rm -rf "${DATA_PATH_HOST:-~/.laradock/data}/sonarqube"
docker compose exec postgres psql -U postgres -c "DROP DATABASE sonar;"
docker compose exec postgres psql -U postgres -c "CREATE DATABASE sonar OWNER sonar;"
docker compose up -d sonarqube
```

</TabItem>
</Tabs>

⚠️ This **permanently deletes** every project, analysis history, and user in this SonarQube instance, back up first if you need anything. `postgres -U postgres` assumes the default superuser from `postgres/defaults.env`, swap it for your own `POSTGRES_USER` if you changed it. SonarQube re-runs its first-boot database migration on the next start, exactly like a brand-new install.

## Talk to this SonarQube from another Laradock project

Since `SONARQUBE_PORT` is published to your host, another project's CI tooling (a second Laradock's Jenkins or GitLab Runner, or a native CI pipeline) can point at this same instance instead of spinning up its own. From outside this project, target your **host machine's** address on `SONARQUBE_PORT`, for example `sonar.host.url=http://host.docker.internal:9000` from another container (Docker Desktop), or `http://localhost:9000` from the host itself. Give each project a distinct `sonar.projectKey` so their scans don't overwrite each other's dashboards.

## Common issues

- **Elasticsearch fails to start / container exits on boot.** SonarQube's embedded Elasticsearch needs `vm.max_map_count` set to at least `262144` on the Docker **host**, not just the container. On Linux, run `sudo sysctl -w vm.max_map_count=262144` (add it to `/etc/sysctl.conf` to persist); on Docker Desktop (macOS/Windows) this is usually already high enough, but if you still see `max virtual memory areas vm.max_map_count` in `./laradock logs sonarqube`, increase it in Docker Desktop's resources settings.
- **Database connection error.** Postgres wasn't initialized with the SonarQube database, or its init script needs a manual re-run as root inside the `postgres` container:
  ```bash
  docker compose exec --user=root postgres bash
  source docker-entrypoint-initdb.d/init_sonarqube_db.sh
  ```
- **SonarQube fails to start with a logs permission error.** Fix ownership on the mounted logs folder:
  ```bash
  docker compose run --user=root --rm sonarqube chown sonarqube:sonarqube /opt/sonarqube/logs
  ```
- **Port `9000` already in use.** Another local service is bound to it (this also collides with Minio's default port if you run both). Change `SONARQUBE_PORT` in `.env` and restart: `./laradock restart sonarqube`.
- **Changing `SONARQUBE_HOSTNAME` has no effect.** It's baked in at container creation, see [Set your hostname](#set-your-hostname) above, a plain restart isn't enough.

---

Need CI to run SonarQube scans automatically? See **[Jenkins](/docs/services/jenkins)** or **[GitLab Runner](/docs/services/gitlab-runner)**. New to Laradock? Start at **[Getting Started](/docs/getting-started)**.
