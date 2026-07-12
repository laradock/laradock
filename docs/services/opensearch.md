# OpenSearch

Source: https://laradock.io/docs/services/opensearch

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

## What is OpenSearch?

[OpenSearch](https://opensearch.org) is the Apache-2.0 open-source fork of Elasticsearch, created and maintained by AWS after Elastic changed Elasticsearch's license. It provides the same search-and-analytics engine feature set with a REST API that's largely compatible with Elasticsearch clients. Laradock runs it as a single-node container with the security plugin disabled for local development.

## Start OpenSearch

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock start opensearch
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose up -d opensearch
```

</TabItem>
</Tabs>

Your indices are created as you use OpenSearch and kept between restarts. Name any other services alongside it to start them together, for example `./laradock start opensearch workspace`.

## Stop OpenSearch

Stopping just pauses the container; **your data is safe**:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock stop opensearch
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose stop opensearch
```

</TabItem>
</Tabs>

To delete the container entirely (the data on disk is still untouched, it lives under `DATA_PATH_HOST`):

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock remove opensearch
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose rm -sf opensearch
```

</TabItem>
</Tabs>

## Configuration

All settings live in `opensearch/defaults.env` and can be overridden by adding the same line to your own `.env`:

| Variable | Default | What it does |
|---|---|---|
| `OPENSEARCH_VERSION` | `2` | Image tag from the [`opensearchproject/opensearch`](https://hub.docker.com/r/opensearchproject/opensearch) Docker Hub image. |
| `OPENSEARCH_HOST_PORT` | `9202` | Host-side port for the REST API (container port `9200`). |
| `OPENSEARCH_MONITORING_PORT` | `9600` | Host-side port for the monitoring/performance-analyzer endpoint (container port `9600`). |

`opensearch/compose.yml` also runs it single-node (`discovery.type=single-node`), with `DISABLE_SECURITY_PLUGIN=true` and JVM heap capped at `-Xms512m -Xmx512m` via `OPENSEARCH_JAVA_OPTS`.

## Connect

```bash
curl http://localhost:9202
```

That returns the cluster/version info if it's up. From another container (e.g. `workspace`), use `http://opensearch:9200`, note the container listens on `9200` internally regardless of the host-side `OPENSEARCH_HOST_PORT` mapping.

## Check cluster and index health

Cluster status (`green`/`yellow`/`red`):

```bash
curl http://localhost:9202/_cluster/health?pretty
```

List every index with its size and document count:

```bash
curl http://localhost:9202/_cat/indices?v
```

On a single-node cluster (Laradock's default), status usually sits at `yellow` rather than `green`, that's expected: `yellow` means replica shards are unassigned, which is normal when there's only one node to hold them.

## Raise the JVM heap size

The default heap (`-Xms512m -Xmx512m`, set via `OPENSEARCH_JAVA_OPTS`) is fine for small local indices but gets tight once you're indexing real datasets. It's set directly in `opensearch/compose.yml`, not exposed as a `.env` variable, so edit it there:

```yaml
- "OPENSEARCH_JAVA_OPTS=-Xms1g -Xmx1g"
```

Keep `Xms` and `Xmx` equal (avoids the JVM resizing the heap at runtime), and stay under half your Docker host's available RAM, OpenSearch's own guidance for the JVM heap. Apply the change:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock restart opensearch
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose restart opensearch
```

</TabItem>
</Tabs>

## Backup and restore

OpenSearch's snapshot API needs a filesystem repository path registered up front (`path.repo`), which isn't configured in Laradock's default `compose.yml`. The simplest reliable backup for a local single-node setup is to copy the data folder directly while the container is stopped, since indices are just files under `DATA_PATH_HOST/opensearch`.

**Back up:**

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock stop opensearch
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose stop opensearch
```

</TabItem>
</Tabs>

```bash
tar -czf opensearch-backup.tar.gz -C "${DATA_PATH_HOST:-~/.laradock/data}" opensearch
```

**Restore** into a fresh container (⚠️ this overwrites whatever is currently in the data folder):

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock stop opensearch
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose stop opensearch
```

</TabItem>
</Tabs>

```bash
rm -rf "${DATA_PATH_HOST:-~/.laradock/data}/opensearch"
tar -xzf opensearch-backup.tar.gz -C "${DATA_PATH_HOST:-~/.laradock/data}"
```

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock start opensearch
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose up -d opensearch
```

</TabItem>
</Tabs>

## Start completely fresh (wipe all data)

To throw away every index and start OpenSearch from a clean, empty state (⚠️ this **permanently deletes** all data in this container, back up first if you need anything):

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock stop opensearch
./laradock remove opensearch
rm -rf "${DATA_PATH_HOST:-~/.laradock/data}/opensearch"
./laradock start opensearch
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose stop opensearch
docker compose rm -sf opensearch
rm -rf "${DATA_PATH_HOST:-~/.laradock/data}/opensearch"
docker compose up -d opensearch
```

</TabItem>
</Tabs>

`DATA_PATH_HOST` is whatever you have set in `.env` (`~/.laradock/data` by default), so the folder above is where OpenSearch's indices actually live on your machine.

## Talk to this OpenSearch from another Laradock project

Each Laradock project is its own isolated Docker network by default, so a second project's containers can't reach this OpenSearch by container name out of the box. Easiest fix: publish the port (already done, `OPENSEARCH_HOST_PORT`) and have the other project connect to your **host machine's** address instead of `opensearch`, for example `host.docker.internal:9202` (Docker Desktop). Make sure the two projects use different `OPENSEARCH_HOST_PORT` values if they're both running at once.

## Common issues

- **Port clash with `elasticsearch`.** If you're running both search engines side by side, `OPENSEARCH_HOST_PORT` (`9202`) is intentionally different from Elasticsearch's `9200` so they don't collide.
- **Container exits or fails to start.** Like Elasticsearch, OpenSearch needs `vm.max_map_count >= 262144` on the Docker host (`sysctl -w vm.max_map_count=262144` on Linux).
- **Security plugin is off.** `DISABLE_SECURITY_PLUGIN=true` means no authentication on the REST API by default, fine for local dev, not something to carry into production.
- **Cluster status stuck at `yellow`.** Expected on a single-node cluster, see [Check cluster and index health](#check-cluster-and-index-health) above, it's not a sign anything is broken.
- **App can't connect but the container is running.** Use the container name `opensearch`, not `localhost`, from inside another container.

---

Looking for the original Elasticsearch instead? See **[Elasticsearch](https://laradock.io/docs/services/elasticsearch)**. New to Laradock? Start with **[Getting Started](https://laradock.io/docs/getting-started)**.
