# Open WebUI

Source: https://laradock.io/docs/services/open-webui

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

## What is Open WebUI?

[Open WebUI](https://openwebui.com) is a ChatGPT-style web interface for local models. [Ollama](https://laradock.io/docs/services/ollama) gives you an API; Open WebUI gives you the chat window in front of it: pick a model, hold a conversation, upload a document to ask questions about, all in the browser with no cloud account and no per-token bill.

## Start Open WebUI

Open WebUI is a front end, so it needs a model backend running behind it. By default that's Ollama:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock start open-webui ollama
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose up -d open-webui ollama
```

</TabItem>
</Tabs>

Then open [http://localhost:8322](http://localhost:8322).

On first visit you'll be asked to create an account. It's stored locally in the container's own volume, nothing is sent anywhere.

## Pull a model first

A fresh Ollama has no models, so the model dropdown will be empty until you pull one:

```bash
docker compose exec ollama ollama pull llama3.2
```

Refresh Open WebUI and `llama3.2` appears in the model picker. See [Ollama](https://laradock.io/docs/services/ollama) for more on managing models.

## Stop Open WebUI

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock stop open-webui
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose stop open-webui
```

</TabItem>
</Tabs>

To remove the container:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock remove open-webui
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose rm -sf open-webui
```

</TabItem>
</Tabs>

Your accounts, chat history, and settings live in the `open-webui` Docker volume, so removing the container keeps them: starting it again picks up where you left off.

## Configuration

All settings live in `open-webui/defaults.env` and can be overridden by adding the same line to your own `.env`:

| Variable | Default | What it does |
|---|---|---|
| `OPEN_WEBUI_VERSION` | `main` | Image tag from [`ghcr.io/open-webui/open-webui`](https://github.com/open-webui/open-webui/pkgs/container/open-webui). |
| `OPEN_WEBUI_PORT` | `8322` | Host-side port Open WebUI is published on (container port `8080`). |
| `OPEN_WEBUI_LLM_ENGINE` | `ollama` | Which Laradock model service to talk to. |
| `OPEN_WEBUI_LLM_PORT` | `11434` | Port that service listens on. |
| `OPEN_WEBUI_AUTH` | `true` | `false` skips the login screen entirely. |

## Point it at LocalAI instead

`OPEN_WEBUI_LLM_ENGINE` is the service name Open WebUI talks to, so it retargets without editing any compose file. To use [LocalAI](https://laradock.io/docs/services/localai) instead of Ollama, set both the engine and its port in your `.env`:

```env
OPEN_WEBUI_LLM_ENGINE=localai
OPEN_WEBUI_LLM_PORT=8080
```

Then start the pair:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock start open-webui localai
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose up -d open-webui localai
```

</TabItem>
</Tabs>

## Skip the login screen

Signing in on every fresh volume gets old on a dev machine. Setting `OPEN_WEBUI_AUTH=false` in your `.env` drops the account system entirely and opens straight into the chat:

```env
OPEN_WEBUI_AUTH=false
```

Only do this when nothing else can reach the port. With auth off, anyone who can open `http://localhost:8322` gets full access, including any machine on your network if the port isn't firewalled.

Decide before the first boot, because the switch sticks in both directions: once an account exists Open WebUI refuses to turn auth off, and once you've run without it, turning it back on locks you out of the account it created for you. Either way the way out is a fresh volume:

```bash
docker volume rm laradock_open-webui
```

## Change the Open WebUI version

Set the version in your `.env`:

```env
OPEN_WEBUI_VERSION=v0.5.20
```

`open-webui` runs a pulled image, not a local build, so pull the new tag first:

```bash
docker compose pull open-webui
```

Then recreate the container on it:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock start open-webui
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose up -d open-webui
```

</TabItem>
</Tabs>

## Common issues

- **Model dropdown is empty.** Ollama has no models until you pull one: `docker compose exec ollama ollama pull llama3.2`.
- **"Server connection failed".** The backend isn't running. Start it (`./laradock start ollama`) and confirm `OPEN_WEBUI_LLM_ENGINE` matches a real Laradock service name.
- **Blank page or slow first load.** The image is large and the first boot builds its local database. Watch progress with `./laradock logs open-webui`.
- **Replies are very slow.** The model runs on CPU unless a GPU is wired up, and larger models are slower. Try a smaller one (`llama3.2:1b`) or see [Ollama](https://laradock.io/docs/services/ollama) for GPU notes.
- **Port 8322 already taken.** Change `OPEN_WEBUI_PORT` in your `.env`.

---

Need the model engine itself? See **[Ollama](https://laradock.io/docs/services/ollama)** or **[LocalAI](https://laradock.io/docs/services/localai)**. Routing to cloud providers too? **[LiteLLM](https://laradock.io/docs/services/litellm)** puts one OpenAI-compatible endpoint in front of everything. New to Laradock? Start with **[Getting Started](https://laradock.io/docs/getting-started)**.
