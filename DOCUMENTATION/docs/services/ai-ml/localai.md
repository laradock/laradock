---
slug: /services/localai
title: LocalAI
description: Run LocalAI in Laradock, a free, self-hosted drop-in replacement for the OpenAI REST API on your own hardware.
keywords:
  - laradock localai
  - localai docker
  - localai docker compose
  - self hosted openai api
  - local llm docker
  - localai laravel
---

## What is LocalAI?

[LocalAI](https://localai.io) is a free, self-hosted drop-in replacement for the OpenAI REST API, covering LLMs, embeddings, and image generation on your own hardware. It's aimed at apps already coded against the OpenAI API that need to run entirely offline or on-prem.

## Start LocalAI

```bash
docker compose up -d localai
```

## Stop LocalAI

```bash
docker compose stop localai
```

This stops the container without deleting downloaded models (kept in the `localai` Docker volume). To remove the container: `docker compose rm -f localai`.

## Configuration

All settings live in `localai/defaults.env` and can be overridden by adding the same line to your own `.env`:

| Variable | Default | What it does |
|---|---|---|
| `LOCALAI_VERSION` | `latest` | Image tag from the [`localai/localai`](https://hub.docker.com/r/localai/localai) Docker Hub image. |
| `LOCALAI_HOST_PORT` | `8088` | Host-side port LocalAI is published on (container port `8080`). |

Models are stored in the `localai` named Docker volume at `/models`, not under `DATA_PATH_HOST`, so they persist across restarts but aren't visible directly on your host filesystem.

## Connect

The API is at `http://localhost:8088` from your host. Readiness check: `/readyz`; list loaded models: `/v1/models`. From another container, use `http://localai:8080/v1` as the OpenAI-compatible base URL, note the internal port is `8080`, different from the host-mapped `8088`.

## Common issues

- **`/v1/models` returns an empty list.** No models are bundled by default, you need to drop model config/weights into the `localai` volume before the API has anything to serve. See the [LocalAI model gallery docs](https://localai.io/models/) for supported formats.
- **Confusing host vs container port.** The container listens on `8080` internally; `LOCALAI_HOST_PORT` (`8088`) is only the host-side mapping. From other containers, always use port `8080`.
- **Slow responses on CPU-only hosts.** Like most local inference servers, LocalAI benefits heavily from GPU acceleration; expect slower throughput without it.
- **App can't connect but the container is running.** Use the container name `localai`, not `localhost`, from inside another container.

---

Prefer Ollama's simpler model-pull workflow? See **[Ollama](/docs/services/ollama)**. Need to route between multiple providers behind one endpoint? See **[LiteLLM](/docs/services/litellm)**. New to Laradock? Start with **[Getting Started](/docs/getting-started)**.
