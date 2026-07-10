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

## What is n8n?

[n8n](https://n8n.io) is a workflow-automation platform with first-class AI/agent nodes. Build agentic flows visually in its editor and call your app's webhooks from them, or trigger n8n workflows from your app.

## Start n8n

```bash
docker compose up -d n8n
```

## Stop n8n

```bash
docker compose stop n8n
```

This stops the container without deleting your workflows (kept in the `n8n` Docker volume). To remove the container: `docker compose rm -f n8n`.

## Configuration

All settings live in `n8n/defaults.env` and can be overridden by adding the same line to your own `.env`:

| Variable | Default | What it does |
|---|---|---|
| `N8N_VERSION` | `latest` | Image tag from the [`n8nio/n8n`](https://hub.docker.com/r/n8nio/n8n) Docker Hub image. |
| `N8N_HOST_PORT` | `5678` | Host-side port the n8n editor/API is published on (container port `5678`). |

`n8n/compose.yml` also sets `N8N_SECURE_COOKIE=false` directly in the container environment, so the editor works over plain `http://localhost` without HTTPS, fine for local dev, not for a public deployment.

## Connect

Open the editor at [http://localhost:5678](http://localhost:5678). Health check: `/healthz`. Workflows, credentials, and execution history persist in the `n8n` volume across restarts.

## Common issues

- **Editor won't load or shows a cookie/session error.** Confirm you're accessing it over plain HTTP on `localhost`; `N8N_SECURE_COOKIE=false` is set for that case. Accessing it over HTTPS or a different host may need adjusting that setting.
- **Webhook from n8n to your Laravel app fails.** From inside the `n8n` container, reach your app by its Laradock container name (e.g. `http://nginx` or `http://php-fpm`), not `localhost`.
- **Webhook from your app to n8n fails.** From inside another container, reach n8n at `http://n8n:5678`, not `localhost:5678`.
- **Port already in use on your host.** Change `N8N_HOST_PORT` in `.env` and restart: `docker compose up -d n8n`.

---

Want a lower-code way to prototype LLM/agent flows instead? See **[Flowise](/docs/services/flowise)**. New to Laradock? Start with **[Getting Started](/docs/getting-started)**.
