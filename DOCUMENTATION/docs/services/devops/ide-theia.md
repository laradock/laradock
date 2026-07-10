---
slug: /services/ide-theia
title: Theia IDE
description: Run the Theia browser-based IDE in Laradock, edit your project code from any browser with a VS Code-like editor, no local install needed.
keywords:
  - laradock theia
  - browser based ide docker
  - theia ide docker compose
  - vs code in browser docker
  - remote development environment
---

## What is Theia?

[Theia](https://theia-ide.org) is an open-source, browser-based IDE with a VS Code-like editor, integrated terminal, and extension system. Running it in a container gives you a full development environment reachable from any browser, useful for remote work, pairing, or coding from a machine without your usual local setup. Laradock builds it from the official `theiaide/theia` image.

## Start Theia

```bash
docker compose up -d ide-theia
```

## Stop Theia

```bash
docker compose stop ide-theia
```

This stops the container. The editor state itself isn't stored in a Laradock-managed volume, only your project files (via the code mount below) persist independently of the container.

## Configuration

All settings live in `ide-theia/defaults.env` and can be overridden by adding the same line to your own `.env`:

| Variable | Default | What it does |
|---|---|---|
| `IDE_THEIA_PORT` | `987` | Host-side port Theia is published on (`host:3000`, Theia listens on `3000` inside the container). |

## Open the editor

```bash
docker compose up -d ide-theia
```

Open [http://localhost:987](http://localhost:987) (or your custom `IDE_THEIA_PORT`). `${APP_CODE_PATH_HOST}` is mounted into the container at `/home/project`, so Theia opens the same project code the rest of your Laradock containers work with.

`ide-theia/Dockerfile` also raises `fs.inotify.max_user_watches` to `524288` as root before switching back to the `theia` user, this avoids file-watcher errors ("ENOSPC") on projects with a large number of files.

## Common issues

- **Port already in use on your host.** Another service (or another Laradock project) is already bound to `987`. Change `IDE_THEIA_PORT` in `.env` and restart.
- **File-watcher / "too many open files" errors on large projects.** The Dockerfile already raises `fs.inotify.max_user_watches`, but this setting is applied inside the container's own namespace; on some Docker Desktop setups the host's inotify limit still applies. Raise the host limit too if you keep hitting it.
- **Editing files but no changes showing up in other containers.** Confirm `APP_CODE_PATH_HOST` in `.env` points at the same project folder that `php-fpm`/`nginx`/etc. use, Theia only sees whatever is mounted to `/home/project`.
- **Blank page or connection refused.** Give the container a few seconds after `docker compose up`; check `docker compose logs ide-theia` for startup errors before assuming it's a port issue.

---

Need an API spec editor instead of a full IDE? See **[Swagger Editor](/docs/services/swagger-editor)**. New to Laradock? Start at **[Getting Started](/docs/getting-started)**.
