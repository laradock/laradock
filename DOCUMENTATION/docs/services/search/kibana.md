---
slug: /services/kibana
title: Kibana
description: Run Kibana in Laradock to visualize and explore data stored in Elasticsearch.
keywords:
  - laradock kibana
  - kibana docker
  - kibana docker compose
  - elasticsearch dashboard docker
  - elk stack docker
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

## What is Kibana?

[Kibana](https://www.elastic.co/kibana) is the official visualization and dashboard UI for Elasticsearch. It lets you explore indices, build charts, and query data through a web interface instead of the raw REST API. Laradock builds it from the official image, version-matched to Elasticsearch.

## Start Kibana

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock start kibana
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose up -d kibana
```

</TabItem>
</Tabs>

`kibana/compose.yml` lists `elasticsearch` as a `depends_on`, so it starts automatically alongside Kibana, it has nothing to visualize without it.

## Stop Kibana

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock stop kibana
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose stop kibana
```

</TabItem>
</Tabs>

To delete the container:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock remove kibana
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose rm -sf kibana
```

</TabItem>
</Tabs>

## Configuration

Laradock builds the image from `kibana/Dockerfile` using the shared `ELK_VERSION` variable in the root `.env` (the same version used for `elasticsearch`), plus this setting in `kibana/defaults.env`:

| Variable | Default | What it does |
|---|---|---|
| `KIBANA_HTTP_PORT` | `5601` | Host-side port Kibana is published on (container port `5601`). |

## Change the Kibana version

Kibana has no version variable of its own, it always builds against the shared `ELK_VERSION` in the root `.env` (Elastic requires matching major/minor versions across the stack):

```env
ELK_VERSION=8.15.0
```

Then rebuild both, since a mismatch between them causes Kibana to refuse to start:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock rebuild kibana elasticsearch
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose build kibana elasticsearch
```

</TabItem>
</Tabs>

## Connect

Open [http://localhost:5601](http://localhost:5601) in your browser. Kibana auto-detects the `elasticsearch` container over the internal `backend` network, no manual host configuration needed for the bundled setup.

There's no login screen. Laradock's `elasticsearch/compose.yml` sets `xpack.security.enabled=false`, so Kibana connects to Elasticsearch anonymously and drops you straight into the app, this is meant for local development, not a setup you'd expose publicly as-is.

## Kibana has no data of its own

Kibana itself is stateless: it has no data volume in `kibana/compose.yml`. Everything you build in it, index patterns, saved searches, dashboards, visualizations, is stored by Elasticsearch itself, inside its own `.kibana` system index, on the `elasticsearch` volume. There's nothing to back up or wipe on the Kibana side specifically: to back up or reset your dashboards, back up or reset the underlying Elasticsearch data (see the **[Elasticsearch](/docs/services/elasticsearch)** page). Removing or rebuilding the `kibana` container never touches your saved objects, only removing the `elasticsearch` container's data volume does.

## Common issues

- **Kibana shows "Kibana server is not ready yet".** It waits on Elasticsearch to be reachable and healthy first; confirm `elasticsearch` is actually up with `docker compose ps` and check `./laradock logs elasticsearch`.
- **Version mismatch errors.** Kibana and Elasticsearch both read `ELK_VERSION` from the root `.env`, so they build to the same version automatically. If you changed one manually, rebuild both: `./laradock rebuild kibana elasticsearch`.
- **Port already in use on your host.** Change `KIBANA_HTTP_PORT` in `.env` and restart: `./laradock restart kibana`.
- **Dashboards/saved objects disappeared.** They live in Elasticsearch, not Kibana, check that you didn't wipe the `elasticsearch` data volume or point at a different `DATA_PATH_HOST`.

---

Need a lighter-weight index browser instead? See **[Dejavu](/docs/services/dejavu)**. Need the underlying engine? See **[Elasticsearch](/docs/services/elasticsearch)**. New to Laradock? Start with **[Getting Started](/docs/getting-started)**.
