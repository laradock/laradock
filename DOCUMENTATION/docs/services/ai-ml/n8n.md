---
slug: /services/n8n
title: n8n
description: Run n8n in Laradock, a workflow-automation platform with first-class AI/agent nodes for building agentic flows visually.
keywords:
  - laradock n8n
  - n8n docker
  - n8n docker compose
  - workflow automation docker
  - n8n ai agents
  - n8n laravel webhook
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

## What is n8n?

[n8n](https://n8n.io) is a workflow-automation platform with first-class AI/agent nodes. Build agentic flows visually in its editor and call your app's webhooks from them, or trigger n8n workflows from your app.

## Start n8n

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock start n8n
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose up -d n8n
```

</TabItem>
</Tabs>

Workflows, credentials, and execution history persist in the `n8n` Docker volume across restarts. Name any other services alongside it to start them together, for example `./laradock start n8n redis`.

## Stop n8n

Stopping just pauses the container; **your workflows are safe**:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock stop n8n
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose stop n8n
```

</TabItem>
</Tabs>

To delete the container entirely (the `n8n` volume, and everything in it, is still untouched):

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock remove n8n
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose rm -sf n8n
```

</TabItem>
</Tabs>

## Configuration

All settings live in `n8n/defaults.env` and can be overridden by adding the same line to your own `.env` (your `.env` always wins):

| Variable | Default | What it does |
|---|---|---|
| `N8N_VERSION` | `latest` | Image tag from the [`n8nio/n8n`](https://hub.docker.com/r/n8nio/n8n) Docker Hub image. |
| `N8N_HOST_PORT` | `5678` | Host-side port the n8n editor/API is published on (container port `5678`). |

`n8n/compose.yml` also sets `N8N_SECURE_COOKIE=false` directly in the container environment, so the editor works over plain `http://localhost` without HTTPS, fine for local dev, not for a public deployment.

## Change the n8n version

Set the version in your `.env`:

```env
N8N_VERSION=1.60.0
```

Then apply the change:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock rebuild n8n
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose build n8n
```

</TabItem>
</Tabs>

## Connect

Open the editor at [http://localhost:5678](http://localhost:5678). On first visit n8n asks you to create the owner account (email/password), that account is stored in the `n8n` volume, not in an env var. Health check: `/healthz`.

## Backup and restore

Workflows and credentials live inside the `n8n` volume as a SQLite database, together with the encryption key n8n generated on first boot to encrypt saved credentials. **Keep that volume (or a backup of it) together with any exported credentials**, restoring credentials into a container with a different encryption key leaves them undecryptable.

**Export all workflows** to a JSON file, then copy it out to your host:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock exec -T n8n n8n export:workflow --all --output=/tmp/n8n-workflows.json
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose exec -T n8n n8n export:workflow --all --output=/tmp/n8n-workflows.json
```

</TabItem>
</Tabs>

```bash
docker compose cp n8n:/tmp/n8n-workflows.json ./n8n-workflows.json
```

**Export all credentials** the same way (add `--decrypted` only if you intend to import into a container with the *same* encryption key, otherwise leave them encrypted):

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock exec -T n8n n8n export:credentials --all --output=/tmp/n8n-credentials.json
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose exec -T n8n n8n export:credentials --all --output=/tmp/n8n-credentials.json
```

</TabItem>
</Tabs>

```bash
docker compose cp n8n:/tmp/n8n-credentials.json ./n8n-credentials.json
```

**Restore** by copying the file back in and importing it:

```bash
docker compose cp ./n8n-workflows.json n8n:/tmp/n8n-workflows.json
```

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock exec -T n8n n8n import:workflow --input=/tmp/n8n-workflows.json
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose exec -T n8n n8n import:workflow --input=/tmp/n8n-workflows.json
```

</TabItem>
</Tabs>

Use `import:credentials --input=...` the same way for the credentials file.

## Start completely fresh (wipe all data)

To throw away every workflow, credential, and execution and start n8n from a clean, empty state (⚠️ this **permanently deletes** everything in the `n8n` volume, [back up](#backup-and-restore) first if you need anything):

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock stop n8n
./laradock remove n8n
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose stop n8n
docker compose rm -sf n8n
```

</TabItem>
</Tabs>

Then remove the underlying volume (n8n's data is a named Docker volume, not a folder under `DATA_PATH_HOST`, so find its exact project-prefixed name first):

```bash
docker volume ls | grep n8n
docker volume rm <the-name-you-just-found>
```

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock start n8n
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose up -d n8n
```

</TabItem>
</Tabs>

Starting again re-creates the volume and re-runs first-boot setup, including the owner-account prompt in the editor.

## Common issues

- **Editor won't load or shows a cookie/session error.** Confirm you're accessing it over plain HTTP on `localhost`; `N8N_SECURE_COOKIE=false` is set for that case. Accessing it over HTTPS or a different host may need adjusting that setting.
- **Webhook from n8n to your Laravel app fails.** From inside the `n8n` container, reach your app by its Laradock container name (e.g. `http://nginx` or `http://php-fpm`), not `localhost`.
- **Webhook from your app to n8n fails.** From inside another container, reach n8n at `http://n8n:5678`, not `localhost:5678`.
- **Port already in use on your host.** Change `N8N_HOST_PORT` in `.env` and restart: `./laradock restart n8n`.
- **Imported credentials show as invalid.** The encryption key used to export them doesn't match the target container's key, see the note in [Backup and restore](#backup-and-restore).

---

Want a lower-code way to prototype LLM/agent flows instead? See **[Flowise](/docs/services/flowise)**. New to Laradock? Start with **[Getting Started](/docs/getting-started)**.
