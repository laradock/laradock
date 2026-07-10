---
slug: /services/gitlab
title: GitLab
description: Run a self-hosted GitLab instance in Laradock. Start the container, set your domain, and connect it to Postgres and Redis.
keywords:
  - laradock gitlab
  - gitlab docker
  - gitlab docker compose
  - self hosted gitlab
  - gitlab omnibus docker
---

## What is GitLab?

[GitLab](https://about.gitlab.com) is a self-hosted Git server with built-in issue tracking, code review, and CI/CD pipelines. Laradock runs the Omnibus image as its own container, wired to the `postgres` and `redis` services that are already part of the stack.

## Start GitLab

```bash
docker compose up -d gitlab
```

GitLab depends on `redis` and `postgres` (declared in `gitlab/compose.yml`), Compose starts both automatically. First boot takes a while, GitLab is a large application; watch progress with `docker compose logs -f gitlab`.

## Stop GitLab

```bash
docker compose stop gitlab
```

This stops the container without deleting its data. GitLab's config, repositories, and logs live under `DATA_PATH_HOST` and `GITLAB_HOST_LOG_PATH` on your host.

## Configuration

All settings live in `gitlab/defaults.env` and can be overridden by adding the same line to your own `.env` (your `.env` always wins):

| Variable | Default | What it does |
|---|---|---|
| `GITLAB_HOST_HTTP_PORT` | `8989` | Host-side port for the GitLab web UI (HTTP). |
| `GITLAB_HOST_HTTPS_PORT` | `9898` | Host-side port for the GitLab web UI (HTTPS). |
| `GITLAB_HOST_SSH_PORT` | `2289` | Host-side port for Git-over-SSH. |
| `GITLAB_DOMAIN_NAME` | `http://localhost` | External URL GitLab advertises itself as; set this to your real domain in production. |
| `GITLAB_ROOT_PASSWORD` | `laradock` | Initial password for the `root` user. |
| `GITLAB_HOST_LOG_PATH` | `./logs/gitlab` | Host folder mounted to `/var/log/gitlab`. |
| `GITLAB_POSTGRES_HOST` | `postgres` | Hostname of the Postgres container GitLab connects to. |

GitLab also needs `GITLAB_POSTGRES_USER`, `GITLAB_POSTGRES_PASSWORD`, and `GITLAB_POSTGRES_DB` to create its database in Postgres. These aren't in `gitlab/defaults.env`, they ship as top-level defaults in `.env.example` (`laradock_gitlab` for all three). The `postgres` service also needs `GITLAB_POSTGRES_INIT=true` (set by default in `postgres/defaults.env`) to auto-create that database and user on its first boot.

## Set your domain

```env
GITLAB_DOMAIN_NAME=http://localhost
```

Change this to your real domain (or `https://` URL) before exposing GitLab beyond local dev, GitLab uses it to generate links, clone URLs, and webhooks.

## Common issues

- **First page load times out or 502s.** GitLab's Omnibus stack takes several minutes to fully initialize on first boot. Check `docker compose logs -f gitlab` until it reports it's ready.
- **Can't log in as root.** Use `GITLAB_ROOT_PASSWORD` (default `laradock`). If you changed it after the data volume was already initialized, the change won't retroactively apply, reset the password from inside the container instead.
- **Database connection errors on first boot.** Confirm `postgres` is running and that `GITLAB_POSTGRES_INIT=true` in `postgres/defaults.env` so the `laradock_gitlab` database and user get created automatically.
- **Wrong clone URLs or broken webhooks.** `GITLAB_DOMAIN_NAME` is still `http://localhost` or doesn't match how you actually access GitLab; update it and restart the container.
- **Port already in use on your host.** Change `GITLAB_HOST_HTTP_PORT`, `GITLAB_HOST_HTTPS_PORT`, or `GITLAB_HOST_SSH_PORT` in `.env` and restart: `docker compose up -d gitlab`.

---

Need CI runners to execute your `.gitlab-ci.yml` pipelines? See **[GitLab Runner](/docs/services/gitlab-runner)**. New to Laradock? Start at **[Getting Started](/docs/getting-started)**.
