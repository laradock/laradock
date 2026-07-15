# Langflow

Source: https://laradock.io/docs/services/langflow

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

## What is Langflow?

[Langflow](https://langflow.org) is a visual builder for LLM apps and AI agents. You wire components together on a canvas, then call the finished flow from Laravel over HTTP. Its components are plain Python, so you can drop into code for a custom step instead of being limited to the built-in nodes.

Langflow and **[Flowise](https://laradock.io/docs/services/flowise)** solve the same problem in different ecosystems, the same way Laradock ships both MySQL and PostgreSQL. Pick whichever fits: Langflow if you want Python-native components, Flowise if you want a Node-based builder.

## Start Langflow

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock start langflow
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose up -d langflow
```

</TabItem>
</Tabs>

First boot takes a minute or two while Langflow initializes its database.

## Stop Langflow

Stopping just pauses the container; **your flows are safe** (kept in the `langflow` Docker volume):

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock stop langflow
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose stop langflow
```

</TabItem>
</Tabs>

To delete the container entirely (the `langflow` volume, and everything in it, is still untouched):

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock remove langflow
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose rm -sf langflow
```

</TabItem>
</Tabs>

## Configuration

All settings live in `langflow/defaults.env` and can be overridden by adding the same line to your own `.env`:

| Variable | Default | What it does |
|---|---|---|
| `LANGFLOW_VERSION` | `latest` | Image tag from the [`langflowai/langflow`](https://hub.docker.com/r/langflowai/langflow) Docker Hub image. |
| `LANGFLOW_HOST_PORT` | `3021` | Host-side port the Langflow builder/API is published on (container port `7860`). |
| `LANGFLOW_SUPERUSER` | `admin` | Username for the Langflow admin account. |
| `LANGFLOW_SUPERUSER_PASSWORD` | `secret` | Password for the Langflow admin account. **Change this if the port is reachable by anyone but you.** |

Langflow refuses to boot without a superuser set, so Laradock ships `admin` / `secret` by default to keep first run zero-config. Those defaults are for local development only, override both in your `.env` before exposing Langflow beyond localhost.

The account is created from these values on **first boot only**, when the database in the `langflow` volume is initialized. Changing them later won't update an existing account; change the password from inside the Langflow UI, or wipe the volume (see [Start completely fresh](#start-completely-fresh-wipe-all-data)) to re-seed.

Flows, credentials, and run history persist in the `langflow` volume at `/app/langflow` across restarts.

## Change the Langflow version

Set the version in your `.env`:

```env
LANGFLOW_VERSION=latest
```

Then apply the change:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock rebuild langflow
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose build langflow
```

</TabItem>
</Tabs>

Flows and credentials live in the `langflow` volume, separate from the image, so changing versions doesn't touch your data. Restart the container after rebuilding: `./laradock restart langflow`.

## Connect

Open the builder at [http://localhost:3021](http://localhost:3021) and log in with `admin` / `secret` (or whatever you set `LANGFLOW_SUPERUSER` and `LANGFLOW_SUPERUSER_PASSWORD` to). Health check: `/health` returns `{"status":"ok"}`. Once you've built a flow, call it from your app at `/api/v1/run/{flow_id}` (the Langflow UI shows the exact endpoint and payload for each flow under its API panel); from inside another container that's reachable at `http://langflow:7860`.

## Use it with the rest of your stack

Langflow talks to the other Laradock AI services over the `backend` network, so point its components at container names rather than `localhost`:

- **[Ollama](https://laradock.io/docs/services/ollama)** for local models: `http://ollama:11434`
- **[Qdrant](https://laradock.io/docs/services/qdrant)** for vector storage: `http://qdrant:6333`
- **[LiteLLM](https://laradock.io/docs/services/litellm)** as one OpenAI-compatible endpoint in front of every provider: `http://litellm:4000`

## Backup and restore

Langflow stores flows, credentials, and run history in a named Docker volume (not a bind-mounted host folder), so back it up by copying the container's data directory out to your host while the container is running:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock cp langflow:/app/langflow ./langflow-backup
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose cp langflow:/app/langflow ./langflow-backup
```

</TabItem>
</Tabs>

To restore, copy a backup folder back in (the container must already exist), then restart:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock cp ./langflow-backup/. langflow:/app/langflow
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose cp ./langflow-backup/. langflow:/app/langflow
```

</TabItem>
</Tabs>

Restart afterward: `./laradock restart langflow`.

## Start completely fresh (wipe all data)

To throw away every flow, credential, and run history and start Langflow from a clean, empty state (⚠️ this **permanently deletes** everything in the `langflow` volume, back up first if you need anything):

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock stop langflow
./laradock remove langflow
docker volume rm $(docker volume ls -q --filter name=langflow)
./laradock start langflow
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose stop langflow
docker compose rm -sf langflow
docker volume rm $(docker volume ls -q --filter name=langflow)
docker compose up -d langflow
```

</TabItem>
</Tabs>

Langflow's data lives in a named Docker volume, not a `DATA_PATH_HOST` folder, so removing the container alone doesn't touch it, you have to remove the volume too. The filter matches on the volume name containing `langflow`, if you run multiple Laradock projects on the same machine, check `docker volume ls | grep langflow` first and remove the exact one for this project.

## Common issues

- **Builder is blank or errors on first load.** Langflow initializes its database on first boot and the UI can be reachable before that finishes. Give it a minute, then reload; check progress with `./laradock logs langflow`.
- **Container keeps restarting with `ValueError: Username and password must be set`.** Langflow won't boot without a superuser. Laradock sets one in `langflow/defaults.env`, so this means both values resolved to empty, usually from an override in your own `.env`. Set `LANGFLOW_SUPERUSER` and `LANGFLOW_SUPERUSER_PASSWORD` to non-empty values. Note Langflow also rejects its own legacy default password (`langflow`), pick anything else.
- **Login fails with the credentials in your `.env`.** The account is seeded on first boot only. If you changed the values after the volume already existed, the old account is still in force. Change the password in the UI, or wipe the volume to re-seed.
- **Can't reach the API from your Laravel app.** From inside another container, use `http://langflow:7860`, not `localhost:3021`, the host port only applies from outside Docker.
- **A flow can't reach Ollama or a vector DB.** Use the container name (`http://ollama:11434`), not `localhost`. Inside the Langflow container, `localhost` is Langflow itself.
- **Port already in use on your host.** Change `LANGFLOW_HOST_PORT` in `.env` and restart: `./laradock restart langflow`.
- **Flows disappeared after recreating the container.** Data lives in the `langflow` named volume, not the container itself, so `./laradock remove langflow` followed by `./laradock start langflow` is safe. It's only gone if the volume itself was removed (see [Start completely fresh](#start-completely-fresh-wipe-all-data) above), or if you ran raw `docker compose down -v` for the whole project, which removes volumes for every service.

---

Prefer a Node-based builder for the same job? See **[Flowise](https://laradock.io/docs/services/flowise)**. Want general-purpose automation with AI nodes attached? See **[n8n](https://laradock.io/docs/services/n8n)**. New to Laradock? Start with **[Getting Started](https://laradock.io/docs/getting-started)**.
