# Elasticsearch

Source: https://laradock.io/docs/services/elasticsearch

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

## What is Elasticsearch?

[Elasticsearch](https://www.elastic.co/elasticsearch) is a distributed search and analytics engine built on Apache Lucene. It's the "ES" in the ELK stack and a common backend for full-text search, log analytics, and Laravel Scout's Elasticsearch driver. Laradock builds it as its own container from the official image.

## Start Elasticsearch

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock start elasticsearch
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose up -d elasticsearch
```

</TabItem>
</Tabs>

The `elasticsearch/compose.yml` lists `php-fpm` as a dependency, so `php-fpm` starts automatically alongside it. Your indices are created as you write to them and persist between restarts in a named Docker volume.

## Stop Elasticsearch

Stopping just pauses the container; **your data is safe**:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock stop elasticsearch
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose stop elasticsearch
```

</TabItem>
</Tabs>

To delete the container entirely (the data volume is untouched):

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock remove elasticsearch
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose rm -sf elasticsearch
```

</TabItem>
</Tabs>

## Configuration

Laradock builds the image from `elasticsearch/Dockerfile` using the shared `ELK_VERSION` variable in the root `.env` (also used by `kibana`), plus these settings in `elasticsearch/defaults.env`:

| Variable | Default | What it does |
|---|---|---|
| `ELASTICSEARCH_HOST_HTTP_PORT` | `9200` | Host-side port for the REST API (container port `9200`). |
| `ELASTICSEARCH_HOST_TRANSPORT_PORT` | `9300` | Host-side port for the transport/cluster protocol (container port `9300`). |

The container also runs single-node with security disabled by default (`xpack.security.enabled=false`), and JVM heap capped at `-Xms512m -Xmx512m` via `ES_JAVA_OPTS`, both set directly in `elasticsearch/compose.yml`.

## Connect

Open [http://localhost:9200](http://localhost:9200) from your host, or `http://elasticsearch:9200` from another container. There's no authentication by default since the security plugin is disabled, unlike the hosted Elastic Cloud default of user `elastic` / a generated password.

## Check cluster and index health

A quick sanity check that the node is up and see the overall cluster status (`green`/`yellow`/`red`):

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock exec -T elasticsearch curl -s "localhost:9200/_cluster/health?pretty"
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose exec -T elasticsearch curl -s "localhost:9200/_cluster/health?pretty"
```

</TabItem>
</Tabs>

`yellow` is normal and expected for Laradock's single-node setup (replica shards can never be assigned with only one node), it only becomes a real concern if you see `red`. To list every index with its doc count and size:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock exec -T elasticsearch curl -s "localhost:9200/_cat/indices?v"
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose exec -T elasticsearch curl -s "localhost:9200/_cat/indices?v"
```

</TabItem>
</Tabs>

## Install a plugin

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock exec elasticsearch /usr/share/elasticsearch/bin/plugin install <plugin-name>
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose exec elasticsearch /usr/share/elasticsearch/bin/plugin install <plugin-name>
```

</TabItem>
</Tabs>

Then apply it:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock restart elasticsearch
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose restart elasticsearch
```

</TabItem>
</Tabs>

## Backup and restore

Elasticsearch doesn't export to a single file the way a SQL database does, it uses **snapshots** written to a repository directory that must first be registered with the cluster and mounted into the container. Add a shared folder for it in `elasticsearch/compose.yml` under `volumes`, for example `- ./elasticsearch/snapshots:/usr/share/elasticsearch/snapshots`, then register the repository:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock exec -T elasticsearch curl -X PUT "localhost:9200/_snapshot/backup" -H "Content-Type: application/json" -d '{"type":"fs","settings":{"location":"/usr/share/elasticsearch/snapshots"}}'
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose exec -T elasticsearch curl -X PUT "localhost:9200/_snapshot/backup" -H "Content-Type: application/json" -d '{"type":"fs","settings":{"location":"/usr/share/elasticsearch/snapshots"}}'
```

</TabItem>
</Tabs>

**Take a snapshot** of every index:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock exec -T elasticsearch curl -X PUT "localhost:9200/_snapshot/backup/snapshot_1?wait_for_completion=true"
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose exec -T elasticsearch curl -X PUT "localhost:9200/_snapshot/backup/snapshot_1?wait_for_completion=true"
```

</TabItem>
</Tabs>

**Restore** it later (into an empty cluster, or after closing the indices you're overwriting):

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock exec -T elasticsearch curl -X POST "localhost:9200/_snapshot/backup/snapshot_1/_restore?wait_for_completion=true"
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose exec -T elasticsearch curl -X POST "localhost:9200/_snapshot/backup/snapshot_1/_restore?wait_for_completion=true"
```

</TabItem>
</Tabs>

For most local dev workflows, a full re-index from your app's own source of truth (the database driving Laravel Scout, for example) is simpler than snapshot/restore, reach for snapshots when you specifically need to preserve indices that can't be cheaply rebuilt.

## Start completely fresh (wipe all data)

Elasticsearch's data lives in a named Docker volume, not a `DATA_PATH_HOST` folder, so wiping it means removing that volume (⚠️ this **permanently deletes** every index, back up first if you need anything):

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock stop elasticsearch
./laradock remove elasticsearch
docker volume rm ${COMPOSE_PROJECT_NAME:-laradock}_elasticsearch
./laradock start elasticsearch
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose stop elasticsearch
docker compose rm -sf elasticsearch
docker volume rm ${COMPOSE_PROJECT_NAME:-laradock}_elasticsearch
docker compose up -d elasticsearch
```

</TabItem>
</Tabs>

`COMPOSE_PROJECT_NAME` is whatever you have set in `.env` (`laradock` by default); Docker prefixes named volumes with it, so the volume above is the actual one backing this container. Not sure of the exact name? List it first with `docker volume ls | grep elasticsearch`.

## Reindex or delete a single index

To rebuild one index without touching the rest of the cluster, delete it and let your app's indexer (Laravel Scout's `scout:import`, for example) recreate it:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock exec -T elasticsearch curl -X DELETE "localhost:9200/your_index_name"
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose exec -T elasticsearch curl -X DELETE "localhost:9200/your_index_name"
```

</TabItem>
</Tabs>

## Memory and heap tuning

`ES_JAVA_OPTS=-Xms512m -Xmx512m` in `elasticsearch/compose.yml` caps the JVM heap at 512MB, fine for local dev with a handful of small indices but tight once you're indexing real datasets. Raise both values (keep them equal to avoid heap resizing pauses) and rebuild:

```yaml
- "ES_JAVA_OPTS=-Xms2g -Xmx2g"
```

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock rebuild elasticsearch
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose build elasticsearch
```

</TabItem>
</Tabs>

As a rule of thumb, never set the heap above 50% of the Docker host's available RAM, and never above roughly 32GB even on a large machine (the JVM loses compressed-pointer optimizations past that point).

## Common issues

- **Container exits immediately or fails healthcheck.** Elasticsearch needs `vm.max_map_count` to be at least `262144` on the Docker host. On Linux, set it with `sysctl -w vm.max_map_count=262144`; Docker Desktop on macOS/Windows usually handles this for you.
- **`bootstrap.memory_lock` warnings.** The compose file sets `memlock` ulimits to unlimited already; if your Docker daemon still refuses to lock memory, check your host's own ulimits.
- **Out-of-memory kills under load.** Heap is fixed at 512MB via `ES_JAVA_OPTS` in `elasticsearch/compose.yml`. Raise it (see [Memory and heap tuning](#memory-and-heap-tuning) above) if you're indexing large datasets locally.
- **Cluster health stuck on `yellow`.** Expected on a single-node cluster, replica shards can never be assigned with only one node. Only `red` means an actual problem (a missing primary shard).
- **Can't reach it from another container.** Use the container name `elasticsearch` as the host, not `localhost`, from inside `workspace` or `php-fpm`.

---

Need a UI to browse indices? See **[Dejavu](https://laradock.io/docs/services/dejavu)**. Need dashboards? See **[Kibana](https://laradock.io/docs/services/kibana)**. New to Laradock? Start with **[Getting Started](https://laradock.io/docs/getting-started)**.
