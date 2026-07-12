# Theia IDE

Source: https://laradock.io/docs/services/ide-theia

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

## What is Theia?

[Theia](https://theia-ide.org) is an open-source, browser-based IDE with a VS Code-like editor, integrated terminal, and extension system. Running it in a container gives you a full development environment reachable from any browser, useful for remote work, pairing, or coding from a machine without your usual local setup. Laradock builds it from the official `theiaide/theia` image.

## Start Theia

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock start ide-theia
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose up -d ide-theia
```

</TabItem>
</Tabs>

Open [http://localhost:987](http://localhost:987) (or your custom `IDE_THEIA_PORT`). `${APP_CODE_PATH_HOST}` is mounted into the container at `/home/project`, so Theia opens the same project code the rest of your Laradock containers work with.

`ide-theia/Dockerfile` also raises `fs.inotify.max_user_watches` to `524288` as root before switching back to the `theia` user, this avoids file-watcher errors ("ENOSPC") on projects with a large number of files.

## Stop Theia

Stopping just pauses the container:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock stop ide-theia
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose stop ide-theia
```

</TabItem>
</Tabs>

The editor state itself isn't stored in a Laradock-managed volume, only your project files (via `APP_CODE_PATH_HOST`) persist independently of the container, so there's nothing to lose by stopping or removing it.

To delete the container entirely:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock remove ide-theia
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose rm -sf ide-theia
```

</TabItem>
</Tabs>

## Configuration

All settings live in `ide-theia/defaults.env` and can be overridden by adding the same line to your own `.env`:

| Variable | Default | What it does |
|---|---|---|
| `IDE_THEIA_PORT` | `987` | Host-side port Theia is published on (`host:3000`, Theia listens on `3000` inside the container). |

## Rebuild after changing the Dockerfile

`ide-theia/Dockerfile` is a thin wrapper on top of `theiaide/theia`. If you edit it, for example to add a system package or a Theia extension, rebuild the image for the change to take effect:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock rebuild ide-theia
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose build ide-theia
```

</TabItem>
</Tabs>

There's no `IDE_THEIA_VERSION` variable, the image always builds from `theiaide/theia:latest` as pinned in the Dockerfile's `FROM` line. To pick up upstream Theia updates, rebuild with `--no-cache` (`docker compose build --no-cache ide-theia`) so Docker re-pulls the base image instead of reusing a cached layer.

## View logs

If the page won't load or the editor gets stuck, check the container's startup output:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock logs ide-theia
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose logs --tail=100 ide-theia
```

</TabItem>
</Tabs>

## Open a terminal inside the container

Theia ships its own in-browser terminal once it's loaded, but if the UI itself isn't coming up, get a shell directly to inspect the container:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock enter ide-theia
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose exec ide-theia bash
```

</TabItem>
</Tabs>

## Security: no built-in authentication

Theia, as run here, has **no login screen and no access control** of its own, whoever can reach `IDE_THEIA_PORT` gets a full editor and terminal on your mounted project code. That's fine on `localhost`, but if you ever expose this container beyond your own machine (a shared dev box, a port forwarded through a tunnel, a cloud VM), put it behind something that authenticates first, for example an nginx vhost with basic auth or a VPN, never publish `IDE_THEIA_PORT` directly to the open internet.

## Common issues

- **Port already in use on your host.** Another service (or another Laradock project) is already bound to `987`. Change `IDE_THEIA_PORT` in `.env` and run `./laradock restart ide-theia`.
- **File-watcher / "too many open files" errors on large projects.** The Dockerfile already raises `fs.inotify.max_user_watches`, but this setting is applied inside the container's own namespace; on some Docker Desktop setups the host's inotify limit still applies. Raise the host limit too if you keep hitting it.
- **Editing files but no changes showing up in other containers.** Confirm `APP_CODE_PATH_HOST` in `.env` points at the same project folder that `php-fpm`/`nginx`/etc. use, Theia only sees whatever is mounted to `/home/project`.
- **Blank page or connection refused.** Give the container a few seconds after `./laradock start ide-theia`; check `./laradock logs ide-theia` for startup errors before assuming it's a port issue.

---

Need an API spec editor instead of a full IDE? See **[Swagger Editor](https://laradock.io/docs/services/swagger-editor)**. New to Laradock? Start at **[Getting Started](https://laradock.io/docs/getting-started)**.
