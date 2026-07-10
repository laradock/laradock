---
slug: /services/ollama
title: Ollama
description: Run Ollama in Laradock for local LLM inference with an OpenAI-compatible API, no external calls or per-token cost.
keywords:
  - laradock ollama
  - ollama docker
  - ollama docker compose
  - local llm docker
  - ollama laravel
  - openai compatible api docker
---

## What is Ollama?

[Ollama](https://ollama.com) runs open LLMs locally and exposes an OpenAI-compatible HTTP API, giving PHP apps local inference with no external calls or per-token cost. Point [Prism](https://prism.echolabs.dev), [Neuron AI](https://github.com/inspector-apm/neuron-ai), [LLPhant](https://github.com/theodo-group/LLPhant), or [openai-php](https://github.com/openai-php/client) at it, and pair it with `pgvector` for fully local RAG.

## Start Ollama

```bash
docker compose up -d ollama
```

## Stop Ollama

```bash
docker compose stop ollama
```

This stops the container without deleting downloaded models (kept in the `ollama` Docker volume). To remove the container: `docker compose rm -f ollama`.

## Configuration

All settings live in `ollama/defaults.env` and can be overridden by adding the same line to your own `.env`:

| Variable | Default | What it does |
|---|---|---|
| `OLLAMA_VERSION` | `latest` | Image tag from the [`ollama/ollama`](https://hub.docker.com/r/ollama/ollama) Docker Hub image. |
| `OLLAMA_HOST_PORT` | `11434` | Host-side port Ollama is published on (container port `11434`). |

Models are stored in the `ollama` named Docker volume at `/root/.ollama`, not under `DATA_PATH_HOST`, so they persist across container restarts but aren't visible directly on your host filesystem.

## Pull and use a model

```bash
docker compose exec ollama ollama pull llama3.2
```

The API is at `http://localhost:11434` from your host, or `http://ollama:11434` from other containers. It's OpenAI-compatible under `http://ollama:11434/v1`, so most OpenAI PHP SDKs work by just pointing the base URL there.

## Common issues

- **First request after `docker compose up` is slow or fails.** No model is pulled by default, run `ollama pull <model>` first; the pull itself can take a while depending on model size and your connection.
- **Out of disk space.** Models are large (several GB each) and accumulate in the `ollama` volume. Remove unused ones with `docker compose exec ollama ollama rm <model>`.
- **CPU-only inference is slow.** Ollama uses GPU acceleration when available; without GPU passthrough configured in your Docker setup, larger models will be noticeably slower.
- **App can't connect but the container is running.** Use the container name `ollama`, not `localhost`, from inside another container.

---

Need a unified gateway across multiple LLM providers instead? See **[LiteLLM](/docs/services/litellm)**. Need an OpenAI-compatible server with more model formats? See **[LocalAI](/docs/services/localai)**. New to Laradock? Start with **[Getting Started](/docs/getting-started)**.
