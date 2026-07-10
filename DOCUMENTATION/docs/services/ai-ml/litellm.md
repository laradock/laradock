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

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

## What is LiteLLM?

[LiteLLM](https://litellm.ai) is an LLM proxy/gateway exposing one OpenAI-compatible endpoint that routes to any provider, the backbone of agentic apps needing a unified API and key management across OpenAI, Anthropic, Ollama, and dozens of other backends.

## Start LiteLLM

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock start litellm
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose up -d litellm
```

</TabItem>
</Tabs>

Before starting, edit `litellm/config.yaml` to add your models/providers. A commented-out Ollama example is included in that file to get you started.

## Stop LiteLLM

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock stop litellm
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose stop litellm
```

</TabItem>
</Tabs>

To remove the container:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock remove litellm
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose rm -sf litellm
```

</TabItem>
</Tabs>

LiteLLM keeps no data volume of its own (no database is wired up by default), so there's nothing to back up or wipe: removing the container just drops it, `litellm/config.yaml` on your host is untouched.

## Configuration

All settings live in `litellm/defaults.env` and can be overridden by adding the same line to your own `.env`:

| Variable | Default | What it does |
|---|---|---|
| `LITELLM_VERSION` | `main-latest` | Image tag from [`ghcr.io/berriai/litellm`](https://github.com/BerriAI/litellm/pkgs/container/litellm). |
| `LITELLM_HOST_PORT` | `4000` | Host-side port LiteLLM is published on (container port `4000`). |
| `LITELLM_MASTER_KEY` | `sk-laradock` | Auth key required on every request to the proxy. |

`litellm/config.yaml` is bind-mounted straight into the container at `/app/config.yaml`, so edits on your host take effect on the next container restart, no rebuild needed.

## Add a provider

`litellm/config.yaml` ships with a `mock-gpt` entry so the proxy works out of the box with no keys. To route to a real provider, add a block to `model_list`, referencing the provider's API key via an environment variable rather than hardcoding it in the file:

```yaml
model_list:
  - model_name: gpt-4o
    litellm_params:
      model: openai/gpt-4o
      api_key: os.environ/OPENAI_API_KEY
```

Set `OPENAI_API_KEY` (or whichever provider's key) in your `.env`, and pass it through to the container by adding it under `environment:` in `litellm/compose.yml`. Then restart to pick up the config change:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock restart litellm
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose restart litellm
```

</TabItem>
</Tabs>

The commented-out Ollama block already in `config.yaml` follows the same pattern (`ollama/llama3.2` with `api_base: http://ollama:11434`), uncomment it once the [Ollama](/docs/services/ollama) service has that model pulled.

## Change the LiteLLM version

Set the version in your `.env`:

```env
LITELLM_VERSION=v1.55.0
```

`litellm` runs a pulled image, not a local build, so pull the new tag first:

```bash
docker compose pull litellm
```

Then recreate the container on it:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock start litellm
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose up -d litellm
```

</TabItem>
</Tabs>

## Connect

The proxy is at `http://localhost:4000` from your host, or `http://litellm:4000` from other containers. Health check: `/health/liveliness`. Authenticate requests with `LITELLM_MASTER_KEY` (default `sk-laradock`) as a Bearer token, same as an OpenAI API key.

## Test the proxy

Send a chat completion request using the built-in `mock-gpt` model (works with no provider keys configured, good for confirming the proxy itself is up):

```bash
curl http://localhost:4000/v1/chat/completions \
  -H "Authorization: Bearer sk-laradock" \
  -H "Content-Type: application/json" \
  -d '{"model": "mock-gpt", "messages": [{"role": "user", "content": "hello"}]}'
```

Swap `mock-gpt` for any `model_name` you've added to `config.yaml`, and `sk-laradock` for your own `LITELLM_MASTER_KEY` if you've changed it.

## List available models

```bash
curl http://localhost:4000/v1/models \
  -H "Authorization: Bearer sk-laradock"
```

Returns every `model_name` currently defined in `litellm/config.yaml`, useful for confirming a config edit actually took effect after a restart.

## Talk to this gateway from another Laradock project

Each Laradock project is its own isolated Docker network by default, so a second project's containers can't reach this LiteLLM by container name out of the box. Easiest fix: publish the port (already done, `LITELLM_HOST_PORT`) and have the other project's app call your **host machine's** address instead of `litellm`, for example `http://host.docker.internal:4000` (Docker Desktop) with the same `LITELLM_MASTER_KEY`. This is a reasonable way to run one shared gateway (with your real provider keys configured once) for multiple local projects, instead of duplicating provider credentials per project. Make sure the two projects use different `LITELLM_HOST_PORT` values if they're both running at once.

## Common issues

- **401 on every request.** Missing or wrong `Authorization: Bearer <LITELLM_MASTER_KEY>` header.
- **Config changes don't take effect.** `litellm/config.yaml` is read at container start; run `./laradock restart litellm` after editing.
- **Requests to a provider fail even though the proxy is up.** LiteLLM only routes to what's configured in `config.yaml`, if a model/provider isn't listed there (with its own API key, where required), requests for it will fail. Uncomment and adapt the included Ollama example, or add your own provider block.
- **App can't connect but the container is running.** Use the container name `litellm`, not `localhost`, from inside another container.

---

Only need one local model backend, not a multi-provider gateway? See **[Ollama](/docs/services/ollama)** or **[LocalAI](/docs/services/localai)**. New to Laradock? Start with **[Getting Started](/docs/getting-started)**.
