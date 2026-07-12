# Flowise

Source: https://laradock.io/docs/services/flowise

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

## What is Flowise?

[Flowise](https://flowiseai.com) is a visual, low-code builder for LLM apps and AI agents. Prototype agent and RAG flows by dragging nodes together in its editor, then call the resulting flow from Laravel over HTTP.

## Start Flowise

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock start flowise
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose up -d flowise
```

</TabItem>
</Tabs>

## Stop Flowise

Stopping just pauses the container; **your flows are safe** (kept in the `flowise` Docker volume):

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock stop flowise
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose stop flowise
```

</TabItem>
</Tabs>

To delete the container entirely (the `flowise` volume, and everything in it, is still untouched):

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock remove flowise
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose rm -sf flowise
```

</TabItem>
</Tabs>

## Configuration

All settings live in `flowise/defaults.env` and can be overridden by adding the same line to your own `.env`:

| Variable | Default | What it does |
|---|---|---|
| `FLOWISE_VERSION` | `latest` | Image tag from the [`flowiseai/flowise`](https://hub.docker.com/r/flowiseai/flowise) Docker Hub image. |
| `FLOWISE_HOST_PORT` | `3020` | Host-side port the Flowise builder/API is published on (container port `3000`). |

Flows, credentials, and chat history persist in the `flowise` volume at `/root/.flowise` across restarts.

## Change the Flowise version

Set the version in your `.env`:

```env
FLOWISE_VERSION=latest
```

Then apply the change:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock rebuild flowise
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose build flowise
```

</TabItem>
</Tabs>

Flows and credentials live in the `flowise` volume, separate from the image, so changing versions doesn't touch your data. Restart the container after rebuilding: `./laradock restart flowise`.

## Connect

Open the builder at [http://localhost:3020](http://localhost:3020). Health check: `/api/v1/ping` returns `pong`. Once you've built a flow, call it from your app via its prediction API endpoint (shown in the Flowise UI for that flow); from inside another container that's reachable at `http://flowise:3000`.

## Backup and restore

Flowise stores flows, credentials, and chat history in a named Docker volume (not a bind-mounted host folder), so back it up by copying the container's data directory out to your host while the container is running:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock cp flowise:/root/.flowise ./flowise-backup
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose cp flowise:/root/.flowise ./flowise-backup
```

</TabItem>
</Tabs>

To restore, copy a backup folder back in (the container must already exist), then restart:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock cp ./flowise-backup/. flowise:/root/.flowise
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose cp ./flowise-backup/. flowise:/root/.flowise
```

</TabItem>
</Tabs>

Restart afterward: `./laradock restart flowise`.

## Start completely fresh (wipe all data)

To throw away every flow, credential, and chat history and start Flowise from a clean, empty state (⚠️ this **permanently deletes** everything in the `flowise` volume, back up first if you need anything):

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock stop flowise
./laradock remove flowise
docker volume rm $(docker volume ls -q --filter name=flowise)
./laradock start flowise
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose stop flowise
docker compose rm -sf flowise
docker volume rm $(docker volume ls -q --filter name=flowise)
docker compose up -d flowise
```

</TabItem>
</Tabs>

Flowise's data lives in a named Docker volume, not a `DATA_PATH_HOST` folder, so removing the container alone doesn't touch it, you have to remove the volume too. The filter matches on the volume name containing `flowise`, if you run multiple Laradock projects on the same machine, check `docker volume ls | grep flowise` first and remove the exact one for this project.

## Common issues

- **Builder loads but a flow's API calls fail.** Confirm the flow is saved and, if it uses an external provider (OpenAI, Anthropic, etc.), that the corresponding credentials are configured in Flowise's credential store, not just typed into a node.
- **Can't reach the API from your Laravel app.** From inside another container, use `http://flowise:3000`, not `localhost:3020`, the host port only applies from outside Docker.
- **Port already in use on your host.** Change `FLOWISE_HOST_PORT` in `.env` and restart: `./laradock restart flowise`.
- **Flows disappeared after recreating the container.** Data lives in the `flowise` named volume, not the container itself, so `./laradock remove flowise` followed by `./laradock start flowise` is safe. It's only gone if the volume itself was removed (see [Start completely fresh](#start-completely-fresh-wipe-all-data) above), or if you ran raw `docker compose down -v` for the whole project, which removes volumes for every service.

---

Want a more general-purpose automation/workflow tool alongside AI nodes? See **[n8n](https://laradock.io/docs/services/n8n)**. New to Laradock? Start with **[Getting Started](https://laradock.io/docs/getting-started)**.
