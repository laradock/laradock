---
slug: /services/flowise
title: Flowise
description: Run Flowise in Laradock, a visual, low-code builder for LLM apps and AI agents.
keywords:
  - laradock flowise
  - flowise docker
  - flowise docker compose
  - low code llm builder
  - flowise laravel
  - ai agent builder docker
---

## What is Flowise?

[Flowise](https://flowiseai.com) is a visual, low-code builder for LLM apps and AI agents. Prototype agent and RAG flows by dragging nodes together in its editor, then call the resulting flow from Laravel over HTTP.

## Start Flowise

```bash
docker compose up -d flowise
```

## Stop Flowise

```bash
docker compose stop flowise
```

This stops the container without deleting your flows (kept in the `flowise` Docker volume). To remove the container: `docker compose rm -f flowise`.

## Configuration

All settings live in `flowise/defaults.env` and can be overridden by adding the same line to your own `.env`:

| Variable | Default | What it does |
|---|---|---|
| `FLOWISE_VERSION` | `latest` | Image tag from the [`flowiseai/flowise`](https://hub.docker.com/r/flowiseai/flowise) Docker Hub image. |
| `FLOWISE_HOST_PORT` | `3020` | Host-side port the Flowise builder/API is published on (container port `3000`). |

Flows, credentials, and chat history persist in the `flowise` volume at `/root/.flowise` across restarts.

## Connect

Open the builder at [http://localhost:3020](http://localhost:3020). Health check: `/api/v1/ping` returns `pong`. Once you've built a flow, call it from your app via its prediction API endpoint (shown in the Flowise UI for that flow); from inside another container that's reachable at `http://flowise:3000`.

## Common issues

- **Builder loads but a flow's API calls fail.** Confirm the flow is saved and, if it uses an external provider (OpenAI, Anthropic, etc.), that the corresponding credentials are configured in Flowise's credential store, not just typed into a node.
- **Can't reach the API from your Laravel app.** From inside another container, use `http://flowise:3000`, not `localhost:3020`, the host port only applies from outside Docker.
- **Port already in use on your host.** Change `FLOWISE_HOST_PORT` in `.env` and restart: `docker compose up -d flowise`.
- **Flows disappeared after recreating the container.** Data lives in the `flowise` named volume; if you ran `docker compose down -v` (which removes volumes) rather than `docker compose down`, that data is gone.

---

Want a more general-purpose automation/workflow tool alongside AI nodes? See **[n8n](/docs/services/n8n)**. New to Laradock? Start with **[Getting Started](/docs/getting-started)**.
