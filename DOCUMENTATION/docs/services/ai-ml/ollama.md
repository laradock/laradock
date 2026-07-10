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

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

## What is Ollama?

[Ollama](https://ollama.com) runs open LLMs locally and exposes an OpenAI-compatible HTTP API, giving PHP apps local inference with no external calls or per-token cost. Point [Prism](https://prism.echolabs.dev), [Neuron AI](https://github.com/inspector-apm/neuron-ai), [LLPhant](https://github.com/theodo-group/LLPhant), or [openai-php](https://github.com/openai-php/client) at it, and pair it with `pgvector` for fully local RAG.

## Start Ollama

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock start ollama
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose up -d ollama
```

</TabItem>
</Tabs>

## Stop Ollama

Stopping just pauses the container; downloaded models are safe (they live in the `ollama` Docker volume, not in the container itself):

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock stop ollama
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose stop ollama
```

</TabItem>
</Tabs>

To delete the container entirely (the `ollama` volume, and every model in it, is still untouched):

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock remove ollama
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose rm -sf ollama
```

</TabItem>
</Tabs>

## Configuration

All settings live in `ollama/defaults.env` and can be overridden by adding the same line to your own `.env`:

| Variable | Default | What it does |
|---|---|---|
| `OLLAMA_VERSION` | `latest` | Image tag from the [`ollama/ollama`](https://hub.docker.com/r/ollama/ollama) Docker Hub image. |
| `OLLAMA_HOST_PORT` | `11434` | Host-side port Ollama is published on (container port `11434`). |

Models are stored in the `ollama` named Docker volume at `/root/.ollama`, not under `DATA_PATH_HOST`, so they persist across container restarts but aren't visible directly on your host filesystem.

## Pull, list, and remove models

No model is downloaded by default, pull one before your first request:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock exec ollama ollama pull llama3.2
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose exec ollama ollama pull llama3.2
```

</TabItem>
</Tabs>

See everything you've already downloaded:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock exec ollama ollama list
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose exec ollama ollama list
```

</TabItem>
</Tabs>

See which models are currently loaded into memory and answering requests:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock exec ollama ollama ps
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose exec ollama ollama ps
```

</TabItem>
</Tabs>

Free up disk space by removing a model you no longer need:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock exec ollama ollama rm llama3.2
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose exec ollama ollama rm llama3.2
```

</TabItem>
</Tabs>

## Use the API

The API is at `http://localhost:11434` from your host, or `http://ollama:11434` from other containers. It's OpenAI-compatible under `http://ollama:11434/v1`, so most OpenAI PHP SDKs work by just pointing the base URL there.

## Enable GPU acceleration

Ollama's `compose.yml` runs CPU-only by default, no GPU is reserved for it. If your host has an NVIDIA GPU with the [NVIDIA Container Toolkit](https://docs.nvidia.com/datacenter/cloud-native/container-toolkit/latest/install-guide.html) installed, add a device reservation to `ollama/compose.yml`:

```yaml
services:
  ollama:
    deploy:
      resources:
        reservations:
          devices:
            - driver: nvidia
              count: all
              capabilities: [gpu]
```

Apply it with `./laradock rebuild ollama` and `./laradock restart ollama`. Without this, larger models fall back to CPU inference, which is noticeably slower.

## Start completely fresh (wipe all models)

To throw away every downloaded model and start from a clean volume (this **permanently deletes** everything in the `ollama` volume):

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock stop ollama
./laradock remove ollama
docker volume ls | grep ollama
docker volume rm <the-name-you-found-above>
./laradock start ollama
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose stop ollama
docker compose rm -sf ollama
docker volume ls | grep ollama
docker volume rm <the-name-you-found-above>
docker compose up -d ollama
```

</TabItem>
</Tabs>

The volume name is prefixed with your project name (`COMPOSE_PROJECT_NAME`), so it's usually something like `<project>_ollama`, `docker volume ls | grep ollama` shows the exact name on your machine. Removing individual models with `ollama rm` (above) is safer and usually all you need, only wipe the whole volume if you want a truly clean slate.

## Talk to Ollama from another Laradock project

Each Laradock project is its own isolated Docker network by default, so a second project's containers can't reach this Ollama by container name out of the box. Since the port is already published (`OLLAMA_HOST_PORT`), point the other project at your **host machine's** address instead of `ollama`, for example `http://host.docker.internal:11434` (Docker Desktop). Make sure the two projects use different `OLLAMA_HOST_PORT` values if they're both running at once, running one shared Ollama for multiple projects saves you from downloading the same multi-GB models twice.

## Common issues

- **First request after starting is slow or fails.** No model is pulled by default, run `./laradock exec ollama ollama pull <model>` first; the pull itself can take a while depending on model size and your connection.
- **Out of disk space.** Models are large (several GB each) and accumulate in the `ollama` volume. Remove unused ones with `./laradock exec ollama ollama rm <model>`.
- **CPU-only inference is slow.** Ollama uses GPU acceleration when available; see [Enable GPU acceleration](#enable-gpu-acceleration) above.
- **App can't connect but the container is running.** Use the container name `ollama`, not `localhost`, from inside another container.

---

Need a unified gateway across multiple LLM providers instead? See **[LiteLLM](/docs/services/litellm)**. Need an OpenAI-compatible server with more model formats? See **[LocalAI](/docs/services/localai)**. New to Laradock? Start with **[Getting Started](/docs/getting-started)**.
