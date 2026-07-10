---
slug: /services/logstash
title: Logstash
description: Run Logstash in Laradock to ingest, transform, and ship logs into Elasticsearch as part of the ELK stack.
keywords:
  - laradock logstash
  - logstash docker
  - logstash docker compose
  - elk stack docker
  - log pipeline docker
  - logstash beats input
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

## What is Logstash?

[Logstash](https://www.elastic.co/logstash) is the "L" in the ELK stack: a server-side data processing pipeline that ingests logs and events from multiple sources, transforms them, and ships them to a destination like Elasticsearch. Laradock builds it version-matched to **[Elasticsearch](/docs/services/elasticsearch)** and **[Kibana](/docs/services/kibana)** via the shared `ELK_VERSION` variable in the root `.env`.

## Start Logstash

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock start logstash
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose up -d logstash
```

</TabItem>
</Tabs>

`logstash/compose.yml` lists `elasticsearch` as a dependency, so it starts automatically alongside Logstash. Logstash has nowhere to ship data without it.

## Stop Logstash

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock stop logstash
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose stop logstash
```

</TabItem>
</Tabs>

To remove the container:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock remove logstash
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose rm -sf logstash
```

</TabItem>
</Tabs>

## Configuration

Logstash has no `logstash/defaults.env`. It's built from `logstash/Dockerfile` using the shared `ELK_VERSION` variable in the root `.env` (the same version used for `elasticsearch` and `kibana`). The port and JVM heap size are fixed directly in `logstash/compose.yml`, not exposed as `.env` variables:

| Setting | Value | Where it's set |
|---|---|---|
| Port | `5001:5001` | `logstash/compose.yml` |
| `LS_JAVA_OPTS` | `-Xmx1g -Xms1g` | `logstash/compose.yml` |

## Configure the pipeline

`logstash/compose.yml` mounts `logstash/config/logstash.yml` (server config: binds to `0.0.0.0`, disables X-Pack monitoring, auto-reloads config) and `logstash/pipeline/` (your `.conf` pipeline files) into the container. Drop your input/filter/output pipeline files into `logstash/pipeline/`, config reload is automatic (`config.reload.automatic: true`), so changes apply without a restart.

The image also has the `logstash-input-beats` plugin pre-installed and a MySQL JDBC driver (`mysql-connector-java-5.1.47.jar`) baked in via `logstash/Dockerfile`, useful if you're piping data from Filebeat/Metricbeat or querying MySQL directly from a pipeline.

### Example pipeline

`logstash/pipeline/` ships empty (just a `.gitkeep`), so nothing is processed until you add a `.conf` file. A minimal one that takes Beats input and ships straight to Elasticsearch:

```conf
input {
  beats {
    port => 5044
  }
}

output {
  elasticsearch {
    hosts => ["elasticsearch:9200"]
    index => "logs-%{+YYYY.MM.dd}"
  }
}
```

Save it as `logstash/pipeline/logstash.conf` and Logstash picks it up automatically, no restart needed. Use the container name `elasticsearch` as the output host, not `localhost`, Logstash and Elasticsearch talk to each other over the `frontend`/`backend` networks.

### Test a pipeline before it goes live

Config reload is automatic, but a syntax error in a live pipeline file just makes Logstash fail to reload silently. Check a pipeline file's syntax before relying on it:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock exec -T logstash bin/logstash --config.test_and_exit
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose exec -T logstash bin/logstash --config.test_and_exit
```

</TabItem>
</Tabs>

This validates everything under `path.config` (`/usr/share/logstash/pipeline`, set in `logstash/config/logstash.yml`) and exits without starting the pipeline, so it's safe to run against a container that's already processing data.

### Check installed plugins

Confirm the pre-installed `logstash-input-beats` plugin (or anything else you've added) is actually there:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock exec -T logstash bin/logstash-plugin list
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose exec -T logstash bin/logstash-plugin list
```

</TabItem>
</Tabs>

## Common issues

- **No pipeline is running.** The `logstash/pipeline/` folder ships empty (just a `.gitkeep`). Logstash needs at least one `.conf` file with an `input`/`output` block before it processes anything, see [Example pipeline](#example-pipeline) above.
- **Can't reach Elasticsearch.** Use the container name `elasticsearch` as the output host in your pipeline config, not `localhost`, Logstash runs in its own container on the `frontend`/`backend` networks.
- **Version mismatch with Elasticsearch/Kibana.** All three read `ELK_VERSION` from the root `.env`. If you changed it for one manually, rebuild all three: `./laradock rebuild logstash elasticsearch kibana`.
- **Out of memory under load.** Heap is fixed at `-Xmx1g -Xms1g` via `LS_JAVA_OPTS` in `logstash/compose.yml`. Raise it there if you're processing large volumes locally.
- **Port `5001` already in use on your host.** This port is hardcoded in `logstash/compose.yml`, there's no env var to override it; free the port or edit the compose file directly.

---

Need the search/storage backend? See **[Elasticsearch](/docs/services/elasticsearch)**. Need to visualize the ingested data? See **[Kibana](/docs/services/kibana)**. New to Laradock? Start with **[Getting Started](/docs/getting-started)**.
