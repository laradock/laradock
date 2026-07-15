# vLLM

Source: https://laradock.io/docs/services/vllm

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

## What is vLLM?

[vLLM](https://docs.vllm.ai) is a high-throughput inference server for open LLMs, exposing an OpenAI-compatible HTTP API. Like [Ollama](https://laradock.io/docs/services/ollama), it keeps inference local, no external calls, no per-token cost. Unlike Ollama, it's built for serving many concurrent requests efficiently, which is what you want once an LLM feature is in production rather than on your laptop.

Point [Prism](https://prism.echolabs.dev), [Neuron AI](https://github.com/inspector-apm/neuron-ai), [LLPhant](https://github.com/theodo-group/LLPhant), or [openai-php](https://github.com/openai-php/client) at it, and pair it with `pgvector` for fully local RAG.

## Ollama or vLLM?

They solve the same problem at different ends. Pick one:

| | **Ollama** | **vLLM** |
|---|---|---|
| **Hardware** | CPU or GPU | **NVIDIA GPU required** |
| **Models** | Pulled on demand, swap anytime | One model, chosen at startup |
| **Best at** | Local development, trying models out | Serving concurrent traffic |
| **Setup cost** | Start it, pull a model | Needs a GPU host and the NVIDIA Container Toolkit |

If you're on a laptop, or you don't know which you want, use **Ollama**. Reach for vLLM when throughput on a real GPU is the point.

## Requirements

vLLM has **no usable CPU path**, the container will not start without a GPU. You need:

- An NVIDIA GPU with enough VRAM for your chosen model.
- The [NVIDIA Container Toolkit](https://docs.nvidia.com/datacenter/cloud-native/container-toolkit/latest/install-guide.html) installed on the host.

Verify Docker can see the GPU before you start:

```bash
docker run --rm --gpus all nvidia/cuda:12.4.0-base-ubuntu22.04 nvidia-smi
```

If that prints your GPU, you're ready. If it doesn't, fix that first, vLLM won't work until it does.

## Start vLLM

Unlike Ollama, vLLM loads its model **at startup**, so the first boot downloads the model before the API answers. Watch the logs to know when it's ready.

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock start vllm
./laradock logs vllm
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose up -d vllm
docker compose logs -f vllm
```

</TabItem>
</Tabs>

The default model (`Qwen/Qwen2.5-1.5B-Instruct`) is small and ungated, so it starts with no token and no extra configuration.

## Stop vLLM

Stopping just pauses the container; downloaded model weights are safe (they live in the `vllm` Docker volume, not in the container itself):

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock stop vllm
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose stop vllm
```

</TabItem>
</Tabs>

To delete the container entirely (the `vllm` volume, and every weight in it, is still untouched):

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock remove vllm
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose rm -sf vllm
```

</TabItem>
</Tabs>

## Configuration

All settings live in `vllm/defaults.env` and can be overridden by adding the same line to your own `.env`:

| Variable | Default | What it does |
|---|---|---|
| `VLLM_VERSION` | `latest` | Image tag from the [`vllm/vllm-openai`](https://hub.docker.com/r/vllm/vllm-openai) Docker Hub image. |
| `VLLM_HOST_PORT` | `8000` | Host-side port vLLM is published on (container port `8000`). |
| `VLLM_MODEL` | `Qwen/Qwen2.5-1.5B-Instruct` | Hugging Face model loaded at startup. |
| `VLLM_HUGGING_FACE_HUB_TOKEN` | *(empty)* | Required only for gated models (Llama, Gemma, ...). |
| `VLLM_SHM_SIZE` | `8gb` | Shared memory for the container. Raise it for large or multi-GPU models. |

Weights are cached in the `vllm` named Docker volume at `/root/.cache/huggingface`, not under `DATA_PATH_HOST`, so they persist across container restarts but aren't visible directly on your host filesystem.

:::note Port 8000 is also FrankenPHP's default
If you run `frankenphp` and `vllm` at the same time, change one of them, for example `VLLM_HOST_PORT=8001` in your `.env`.
:::

## Change the model

vLLM serves **one model per container**, set at startup. To switch, change the setting and restart:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock set VLLM_MODEL=mistralai/Mistral-7B-Instruct-v0.3
./laradock restart vllm
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
# add VLLM_MODEL=mistralai/Mistral-7B-Instruct-v0.3 to your .env
docker compose up -d --force-recreate vllm
```

</TabItem>
</Tabs>

For a **gated** model (most Llama and Gemma releases), accept the licence on its Hugging Face page, then set a [token](https://huggingface.co/settings/tokens):

```bash
./laradock set VLLM_HUGGING_FACE_HUB_TOKEN=hf_xxxxxxxxxxxx
./laradock restart vllm
```

## Use the API

The API is at `http://localhost:8000` from your host, or `http://vllm:8000` from other containers. It's OpenAI-compatible under `http://vllm:8000/v1`, so most OpenAI PHP SDKs work by just pointing the base URL there.

Check it's up and see which model is loaded:

```bash
curl http://localhost:8000/v1/models
```

The model name in your API calls must match `VLLM_MODEL` exactly, including the org prefix (`Qwen/Qwen2.5-1.5B-Instruct`, not `qwen`).

## Start completely fresh (wipe all weights)

To throw away every downloaded model and start from a clean volume (this **permanently deletes** everything in the `vllm` volume):

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock stop vllm
./laradock remove vllm
docker volume ls | grep vllm
docker volume rm <the-name-you-found-above>
./laradock start vllm
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose stop vllm
docker compose rm -sf vllm
docker volume ls | grep vllm
docker volume rm <the-name-you-found-above>
docker compose up -d vllm
```

</TabItem>
</Tabs>

The volume name is prefixed with your project name (`COMPOSE_PROJECT_NAME`), so it's usually something like `<project>_vllm`, `docker volume ls | grep vllm` shows the exact name on your machine.

## Common issues

- **Container exits immediately.** Almost always no GPU visible to Docker. Run the `nvidia-smi` check in [Requirements](#requirements) above.
- **First start takes a long time.** The model downloads before the API answers. Follow `./laradock logs vllm` and wait for the startup line; subsequent starts reuse the cached weights.
- **`401` or "gated repo" in the logs.** The model needs a licence acceptance plus `VLLM_HUGGING_FACE_HUB_TOKEN`. See [Change the model](#change-the-model).
- **Out of memory / CUDA OOM.** The model is too large for your VRAM. Use a smaller model or a quantised build.
- **Port 8000 already in use.** FrankenPHP publishes the same port, set `VLLM_HOST_PORT=8001`.
- **App can't connect but the container is running.** Use the container name `vllm`, not `localhost`, from inside another container.

## Run vLLM on a non-NVIDIA host

The `deploy.resources` block in `vllm/compose.yml` reserves an NVIDIA device. For AMD ROCm, swap the image tag for a ROCm build and replace that block per the [vLLM installation docs](https://docs.vllm.ai/en/latest/getting_started/installation.html). On a machine with no GPU at all, use **[Ollama](https://laradock.io/docs/services/ollama)** instead, it's the CPU-friendly option.

---

Want to pull models on demand, or don't have a GPU? See **[Ollama](https://laradock.io/docs/services/ollama)**. Need a unified gateway across multiple LLM providers? See **[LiteLLM](https://laradock.io/docs/services/litellm)**. New to Laradock? Start with **[Getting Started](https://laradock.io/docs/getting-started)**.
