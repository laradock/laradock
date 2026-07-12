# Chroma

Source: https://laradock.io/docs/services/chroma

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

## What is Chroma?

[Chroma](https://www.trychroma.com) is a lightweight open-source vector database with a simple HTTP API, handy for semantic-search and RAG (retrieval-augmented generation) prototypes where you want something simpler to operate than Weaviate or Qdrant.

## Start Chroma

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock start chroma
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose up -d chroma
```

</TabItem>
</Tabs>

Your data is created on first start and kept between restarts, in the `chroma` Docker volume.

## Stop Chroma

Stopping just pauses the container; **your data is safe**:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock stop chroma
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose stop chroma
```

</TabItem>
</Tabs>

To delete the container entirely (the data in the `chroma` volume is still untouched):

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock remove chroma
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose rm -sf chroma
```

</TabItem>
</Tabs>

## Configuration

All settings live in `chroma/defaults.env` and can be overridden by adding the same line to your own `.env`:

| Variable | Default | What it does |
|---|---|---|
| `CHROMA_VERSION` | `latest` | Image tag from the [`chromadb/chroma`](https://hub.docker.com/r/chromadb/chroma) Docker Hub image. |
| `CHROMA_HOST_PORT` | `8001` | Host-side port mapped to the Chroma HTTP API (container port `8000`). |

Data persists in the `chroma` named Docker volume at `/data` across restarts, it is not a `DATA_PATH_HOST` bind mount like the SQL databases, so you won't find it as a plain folder on your host.

## Change the Chroma version

Set the version in your `.env`:

```env
CHROMA_VERSION=0.5.20
```

Then apply the change:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock rebuild chroma
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose build chroma
```

</TabItem>
</Tabs>

Then start it again to pick up the new image: `./laradock start chroma`. Your collections live in the `chroma` volume, separate from the image, so a version bump doesn't touch them by itself, but Chroma has changed its on-disk storage format across major versions before. [Back up](#backup-and-restore) before jumping multiple major versions, just in case.

## Connect

The API is at `http://localhost:8001` from your host. Heartbeat check: `/api/v2/heartbeat`. From another container, use `http://chroma:8000`, note the internal port is `8000`, different from the host-mapped `8001`.

## Backup and restore

Chroma's data lives in the `chroma` Docker-managed volume, not a `DATA_PATH_HOST` folder, so back it up by mounting that volume into a throwaway helper container instead of copying files directly off your host.

**Export (back up)** everything to a `.tar.gz` on your host (Chroma must be running so its container can be found):

```bash
docker run --rm --volumes-from "$(docker compose ps -q chroma)" -v "$(pwd):/backup" alpine tar czf /backup/chroma-backup.tar.gz -C /data .
```

**Restore (import)** into a Chroma container whose `/data` is empty (for example right after [starting completely fresh](#start-completely-fresh-wipe-all-data)):

```bash
docker run --rm --volumes-from "$(docker compose ps -q chroma)" -v "$(pwd):/backup" alpine sh -c "cd /data && tar xzf /backup/chroma-backup.tar.gz"
```

For a perfectly consistent snapshot under active writes, stop Chroma first (`./laradock stop chroma`), back up, then start it again; for casual prototype use it's fine to back up while it's running.

## Reset all collections (wipe data, keep the container)

Chroma has a built-in reset endpoint that deletes every collection without recreating the container, but it's disabled by default. Enable it in `chroma/defaults.env` or override it in your own `.env`:

```env
ALLOW_RESET=TRUE
```

Apply the setting:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock restart chroma
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose restart chroma
```

</TabItem>
</Tabs>

Then call the reset endpoint:

```bash
curl -X POST http://localhost:8001/api/v2/reset
```

This deletes every collection immediately, with no confirmation prompt. Set `ALLOW_RESET` back to `FALSE` (or remove the override) afterward if you don't want the endpoint reachable.

## Start completely fresh (wipe all data)

To throw away every collection and start Chroma from a clean, empty volume (⚠️ this **permanently deletes** everything in the `chroma` volume, [back up](#backup-and-restore) first if you need anything):

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock stop chroma
./laradock remove chroma
docker volume rm $(docker volume ls -q --filter label=com.docker.compose.volume=chroma)
./laradock start chroma
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose stop chroma
docker compose rm -sf chroma
docker volume rm $(docker volume ls -q --filter label=com.docker.compose.volume=chroma)
docker compose up -d chroma
```

</TabItem>
</Tabs>

If you run more than one Laradock project on the same machine, also filter by `--filter label=com.docker.compose.project=<your-project-name>` so you don't delete a different project's `chroma` volume by mistake.

## Talk to this Chroma from another Laradock project

Each Laradock project is its own isolated Docker network by default, so a second project's containers can't reach this Chroma by container name out of the box. Easiest fix: use the published port (`CHROMA_HOST_PORT`) and have the other project connect to your **host machine's** address instead of `chroma`, for example `http://host.docker.internal:8001` (Docker Desktop). Make sure the two projects use different `CHROMA_HOST_PORT` values if they're both running at once.

## Common issues

- **Confusing host vs container port.** The container listens on `8000` internally; `CHROMA_HOST_PORT` (`8001`) is only the host-side mapping. From other containers, always use port `8000`.
- **Data disappeared after recreating the container.** Data lives in the `chroma` named volume; running `docker compose down -v` (which removes named volumes) rather than `./laradock remove chroma` wipes it.
- **Port already in use on your host.** Change `CHROMA_HOST_PORT` in `.env` and restart: `./laradock start chroma`.
- **App can't connect but the container is running.** Use the container name `chroma`, not `localhost`, from inside another container.
- **`/api/v2/reset` returns an error.** The reset endpoint is disabled unless `ALLOW_RESET=TRUE` is set (see [Reset all collections](#reset-all-collections-wipe-data-keep-the-container) above), and requires a restart after changing it.

---

Comparing vector databases? See **[Qdrant](https://laradock.io/docs/services/qdrant)** and **[Weaviate](https://laradock.io/docs/services/weaviate)**. New to Laradock? Start with **[Getting Started](https://laradock.io/docs/getting-started)**.
