---
slug: /services/onedev
title: OneDev
description: Run OneDev in Laradock, a self-hosted Git server with built-in CI/CD pipelines and issue tracking.
keywords:
  - laradock onedev
  - onedev docker
  - onedev docker compose
  - self hosted git server
  - onedev ci cd
---

## What is OneDev?

[OneDev](https://onedev.io) is a self-hosted Git server with built-in CI/CD pipelines and issue tracking, packaged as a single container with no external database dependency. Laradock runs it standalone, unlike GitLab it doesn't need `postgres` or `redis`.

## Start OneDev

```bash
docker compose up -d onedev
```

## Stop OneDev

```bash
docker compose stop onedev
```

This stops the container without deleting its data. OneDev's state lives under `DATA_PATH_HOST/onedev` on your host.

## Configuration

All settings live in `onedev/defaults.env` and can be overridden by adding the same line to your own `.env` (your `.env` always wins):

| Variable | Default | What it does |
|---|---|---|
| `ONEDEV_HTTP_PORT` | `6610` | Host-side port for the OneDev web UI. |
| `ONEDEV_SSH_PORT` | `6611` | Host-side port for Git-over-SSH. |

## Complete the setup wizard

1. Start the container, then open [http://localhost:6610](http://localhost:6610).
2. Follow the setup wizard to create your admin account.

Git over SSH is available on port `6611` by default; clone with `ssh://git@localhost:6611/<repo-path>`.

## Common issues

- **Port `6610` or `6611` already in use.** Change `ONEDEV_HTTP_PORT` or `ONEDEV_SSH_PORT` in `.env` and restart: `docker compose up -d onedev`.
- **First page load is slow.** OneDev initializes its embedded database and search index on first boot; give it a minute and check `docker compose logs -f onedev`.
- **SSH clone fails.** Confirm you're using the mapped host port (`ONEDEV_SSH_PORT`, `6611` by default), not the container-internal `6611` if you've remapped it, and that your SSH key is added in OneDev's user settings.

---

Need CI/CD without a bundled Git server instead? See **[Jenkins](/docs/services/jenkins)**. Prefer a fuller-featured self-hosted GitHub alternative? See **[GitLab](/docs/services/gitlab)**. New to Laradock? Start at **[Getting Started](/docs/getting-started)**.
