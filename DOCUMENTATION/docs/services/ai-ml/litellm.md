---
slug: /services/litellm
title: LiteLLM
description: Run LiteLLM in Laradock, an LLM proxy/gateway exposing one OpenAI-compatible endpoint that routes to any provider.
keywords:
  - laradock litellm
  - litellm docker
  - litellm docker compose
  - llm gateway docker
  - openai compatible proxy
  - litellm master key
---

## What is LiteLLM?

[LiteLLM](https://litellm.ai) is an LLM proxy/gateway exposing one OpenAI-compatible endpoint that routes to any provider, the backbone of agentic apps needing a unified API and key management across OpenAI, Anthropic, Ollama, and dozens of other backends.

## Start LiteLLM

```bash
docker compose up -d litellm
```

Before starting, edit `litellm/config.yaml` to add your models/providers. A commented-out Ollama example is included in that file to get you started.

## Stop LiteLLM

```bash
docker compose stop litellm
```

To remove the container: `docker compose rm -f litellm`.

## Configuration

All settings live in `litellm/defaults.env` and can be overridden by adding the same line to your own `.env`:

| Variable | Default | What it does |
|---|---|---|
| `LITELLM_VERSION` | `main-latest` | Image tag from [`ghcr.io/berriai/litellm`](https://github.com/BerriAI/litellm/pkgs/container/litellm). |
| `LITELLM_HOST_PORT` | `4000` | Host-side port LiteLLM is published on (container port `4000`). |
| `LITELLM_MASTER_KEY` | `sk-laradock` | Auth key required on every request to the proxy. |

`litellm/config.yaml` is bind-mounted straight into the container at `/app/config.yaml`, so edits on your host take effect on the next container restart, no rebuild needed.

## Connect

The proxy is at `http://localhost:4000` from your host, or `http://litellm:4000` from other containers. Health check: `/health/liveliness`. Authenticate requests with `LITELLM_MASTER_KEY` (default `sk-laradock`) as a Bearer token, same as an OpenAI API key.

## Common issues

- **401 on every request.** Missing or wrong `Authorization: Bearer <LITELLM_MASTER_KEY>` header.
- **Config changes don't take effect.** `litellm/config.yaml` is read at container start; restart after editing: `docker compose restart litellm`.
- **Requests to a provider fail even though the proxy is up.** LiteLLM only routes to what's configured in `config.yaml`, if a model/provider isn't listed there (with its own API key, where required), requests for it will fail. Uncomment and adapt the included Ollama example, or add your own provider block.
- **App can't connect but the container is running.** Use the container name `litellm`, not `localhost`, from inside another container.

---

Only need one local model backend, not a multi-provider gateway? See **[Ollama](/docs/services/ollama)** or **[LocalAI](/docs/services/localai)**. New to Laradock? Start with **[Getting Started](/docs/getting-started)**.
