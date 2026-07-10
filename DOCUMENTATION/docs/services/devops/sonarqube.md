---
slug: /services/sonarqube
title: SonarQube
description: Run SonarQube in Laradock for automatic code review. Start the container, set your hostname, and fix common Postgres and log-permission errors.
keywords:
  - laradock sonarqube
  - sonarqube docker
  - sonarqube docker compose
  - static code analysis docker
  - code quality docker
---

## What is SonarQube?

[SonarQube](https://docs.sonarqube.org/latest/) is an automatic code-review tool that scans your codebase for bugs, vulnerabilities, and code smells across branches and pull requests. Laradock runs it as its own container, backed by the `postgres` service already in the stack.

## Start SonarQube

```bash
docker compose up -d sonarqube
```

SonarQube depends on `postgres` (declared in `sonarqube/compose.yml`), Compose starts it automatically.

## Stop SonarQube

```bash
docker compose stop sonarqube
```

## Configuration

All settings live in `sonarqube/defaults.env` and can be overridden by adding the same line to your own `.env` (your `.env` always wins):

| Variable | Default | What it does |
|---|---|---|
| `SONARQUBE_HOSTNAME` | `sonar.example.com` | Hostname the container identifies itself as; set it to your real domain. |
| `SONARQUBE_PORT` | `9000` | Host-side port SonarQube is published on. |
| `SONARQUBE_POSTGRES_HOST` | `postgres` | Hostname of the Postgres container SonarQube connects to. |

SonarQube also needs `SONARQUBE_POSTGRES_USER`, `SONARQUBE_POSTGRES_PASSWORD`, and `SONARQUBE_POSTGRES_DB` to create its database in Postgres. These aren't in `sonarqube/defaults.env`, they ship as top-level defaults in `.env.example` (`sonar` / `sonarPass` / `sonar`). The `postgres` service also needs `SONARQUBE_POSTGRES_INIT=true` (set by default in `postgres/defaults.env`) to auto-create that database and user on its first boot.

## Set your hostname

```env
SONARQUBE_HOSTNAME=sonar.example.com
```

Set this to your actual domain before exposing SonarQube beyond local dev, then start (or rebuild) the container and open [http://localhost:9000/](http://localhost:9000/).

## Common issues

- **Database connection error.** Postgres wasn't initialized with the SonarQube database, or its init script needs a manual re-run:
  ```bash
  docker compose exec --user=root postgres
  source docker-entrypoint-initdb.d/init_sonarqube_db.sh
  ```
- **SonarQube fails to start with a logs permission error.** Fix ownership on the mounted logs folder:
  ```bash
  docker compose run --user=root --rm sonarqube chown sonarqube:sonarqube /opt/sonarqube/logs
  ```
- **Port `9000` already in use.** Another local service is bound to it (this also collides with Minio's default port if you run both). Change `SONARQUBE_PORT` in `.env` and restart: `docker compose up -d sonarqube`.
- **Changing `SONARQUBE_HOSTNAME` has no effect.** Rebuild the container after changing it: `docker compose up -d --build sonarqube`.

---

Need CI to run SonarQube scans automatically? See **[Jenkins](/docs/services/jenkins)** or **[GitLab Runner](/docs/services/gitlab-runner)**. New to Laradock? Start at **[Getting Started](/docs/getting-started)**.
