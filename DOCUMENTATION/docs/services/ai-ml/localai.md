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

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

## What is LocalAI?

[LocalAI](https://localai.io) is a free, self-hosted drop-in replacement for the OpenAI REST API, covering LLMs, embeddings, and image generation on your own hardware. It's aimed at apps already coded against the OpenAI API that need to run entirely offline or on-prem.

## Start LocalAI

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock start localai
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose up -d localai
```

</TabItem>
</Tabs>

## Stop LocalAI

Stopping just pauses the container; downloaded models are safe (kept in the `localai` Docker volume):

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock stop localai
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose stop localai
```

</TabItem>
</Tabs>

To delete the container entirely (the `localai` volume, and any models in it, are still untouched):

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock remove localai
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose rm -sf localai
```

</TabItem>
</Tabs>

## Configuration

All settings live in `localai/defaults.env` and can be overridden by adding the same line to your own `.env`:

| Variable | Default | What it does |
|---|---|---|
| `LOCALAI_VERSION` | `latest` | Image tag from the [`localai/localai`](https://hub.docker.com/r/localai/localai) Docker Hub image. |
| `LOCALAI_HOST_PORT` | `8088` | Host-side port LocalAI is published on (container port `8080`). |

Models are stored in the `localai` named Docker volume at `/models`, not under `DATA_PATH_HOST`, so they persist across restarts but aren't visible directly on your host filesystem.

## Change the LocalAI version

Set the version in your `.env` (pick a tag from the Docker Hub page linked above, instead of the default `latest`):

```env
LOCALAI_VERSION=<tag>
```

Then apply the change:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock rebuild localai
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose build localai
```

</TabItem>
</Tabs>

## Load a model

No models are bundled with the image, so `/v1/models` returns an empty list until you add one. LocalAI reads models from `/models` inside the container, which is the `localai` volume. Copy a model file you've already downloaded straight into the running container:

```bash
docker cp ./your-model.gguf localai:/models/your-model.gguf
```

Then confirm it shows up:

```bash
curl http://localhost:8088/v1/models
```

For discovering and pulling preconfigured models by name instead of sourcing files yourself, see LocalAI's own [model gallery docs](https://localai.io/models/).

## Connect

The API is at `http://localhost:8088` from your host. Readiness check: `/readyz`; list loaded models: `/v1/models`. From another container, use `http://localai:8080/v1` as the OpenAI-compatible base URL, note the internal port is `8080`, different from the host-mapped `8088`.

## Backup and restore

Models live in the `localai` named Docker volume rather than a `DATA_PATH_HOST` folder, so backing them up means archiving the volume itself. Find its full name first (Docker prefixes it with your project name):

```bash
docker volume ls | grep localai
```

**Back up** the volume to a `.tar.gz` on your host (replace `<volume-name>` with what you found above):

```bash
docker run --rm -v <volume-name>:/models -v "$(pwd)":/backup alpine tar czf /backup/localai-models-backup.tar.gz -C /models .
```

**Restore** it into a volume of the same name:

```bash
docker run --rm -v <volume-name>:/models -v "$(pwd)":/backup alpine tar xzf /backup/localai-models-backup.tar.gz -C /models
```

This uses a throwaway `alpine` container just to reach the volume; LocalAI itself doesn't need to be running for either step. Worth doing before wiping the volume or moving to a new machine, since large models can take a long time to re-download.

## Start completely fresh (wipe all data)

To throw away every downloaded model and start LocalAI from a clean, empty volume (⚠️ this **permanently deletes** everything in it, back up first if you need anything):

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock stop localai
./laradock remove localai
docker volume rm <volume-name>
./laradock start localai
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose stop localai
docker compose rm -sf localai
docker volume rm <volume-name>
docker compose up -d localai
```

</TabItem>
</Tabs>

Use `docker volume ls | grep localai` (as above) to get the exact `<volume-name>` for your project first.

## Common issues

- **`/v1/models` returns an empty list.** No models are bundled by default, [load one](#load-a-model) into the `localai` volume before the API has anything to serve.
- **Confusing host vs container port.** The container listens on `8080` internally; `LOCALAI_HOST_PORT` (`8088`) is only the host-side mapping. From other containers, always use port `8080`.
- **Slow responses on CPU-only hosts.** Like most local inference servers, LocalAI benefits heavily from GPU acceleration; expect slower throughput without it.
- **App can't connect but the container is running.** Use the container name `localai`, not `localhost`, from inside another container.

---

Prefer Ollama's simpler model-pull workflow? See **[Ollama](/docs/services/ollama)**. Need to route between multiple providers behind one endpoint? See **[LiteLLM](/docs/services/litellm)**. New to Laradock? Start with **[Getting Started](/docs/getting-started)**.
