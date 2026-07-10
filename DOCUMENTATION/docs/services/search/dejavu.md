---
slug: /services/dejavu
title: Dejavu
description: Run Dejavu in Laradock, a lightweight web UI for browsing and querying Elasticsearch indices.
keywords:
  - laradock dejavu
  - dejavu docker
  - dejavu docker compose
  - elasticsearch web ui docker
  - browse elasticsearch index
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

## What is Dejavu?

[Dejavu](https://github.com/appbaseio/dejavu) is a lightweight, open-source web UI for browsing and querying Elasticsearch indices, import/export data, inspect mappings, and build queries visually, without Kibana's full dashboarding weight. Laradock builds it from the `appbaseio/dejavu` image.

## Start Dejavu

`dejavu/compose.yml` lists `elasticsearch` as a dependency, so it starts automatically alongside Dejavu, there's nothing to browse without it:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock start dejavu
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose up -d dejavu
```

</TabItem>
</Tabs>

## Stop Dejavu

Dejavu itself keeps no data of its own (it's just a browser-side UI, your actual data lives in Elasticsearch), so there's nothing to back up here:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock stop dejavu
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose stop dejavu
```

</TabItem>
</Tabs>

To delete the container entirely:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock remove dejavu
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose rm -sf dejavu
```

</TabItem>
</Tabs>

## Configuration

The only Laradock-specific setting lives in `dejavu/defaults.env` and can be overridden by adding the same line to your own `.env`:

| Variable | Default | What it does |
|---|---|---|
| `DEJAVU_HTTP_PORT` | `1358` | Host-side port Dejavu is published on (container port `1358`). |

The Dejavu image itself isn't version-pinned, `dejavu/Dockerfile` builds from `appbaseio/dejavu` (latest).

## Connect

Open [http://localhost:1358](http://localhost:1358) in your browser. When prompted for a connection, point it at your Elasticsearch endpoint: use `http://localhost:9200` if you're browsing from the same machine (Dejavu runs client-side in your browser and talks to Elasticsearch directly over HTTP, not through the Dejavu container). Laradock's default `elasticsearch/compose.yml` sets `xpack.security.enabled=false`, so there's no login to enter, just the URL.

## Enable CORS on Elasticsearch

Dejavu's connection screen is the most common first-run blocker: browsers block cross-origin requests from `localhost:1358` to `localhost:9200` unless Elasticsearch explicitly allows it, and Laradock's default config doesn't. Add these lines to the `environment:` block in `elasticsearch/compose.yml`:

```yaml
- http.cors.enabled=true
- http.cors.allow-origin=http://localhost:1358
```

Then rebuild and restart Elasticsearch to pick up the change:

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

If you changed `DEJAVU_HTTP_PORT`, update `http.cors.allow-origin` to match.

## Update to the latest Dejavu version

The image is built fresh from `appbaseio/dejavu` with no version pin, so Laradock always uses whatever tag Docker last pulled locally. To force a newer image and rebuild:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock rebuild dejavu --pull
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose build --pull dejavu
```

</TabItem>
</Tabs>

Then restart it: `./laradock restart dejavu`.

## Browse an Elasticsearch cluster from another Laradock project

Dejavu isn't tied to the `elasticsearch` container it starts with, its connection screen accepts any reachable URL. To browse a different project's cluster (or a remote one), publish that cluster's HTTP port and enter its host address instead of `localhost:9200`, for example `http://host.docker.internal:9200` (Docker Desktop) if you're pointing at another Laradock project's Elasticsearch on the same machine. Make sure that project's `ELASTICSEARCH_HOST_HTTP_PORT` is unique if both are running at once, and that its Elasticsearch also has CORS enabled for Dejavu's origin (see [Enable CORS on Elasticsearch](#enable-cors-on-elasticsearch) above).

## Common issues

- **"Could not connect" when adding a connection.** Elasticsearch needs CORS enabled to accept cross-origin requests from Dejavu's browser UI, see [Enable CORS on Elasticsearch](#enable-cors-on-elasticsearch) above.
- **Blank page or connection refused.** Confirm `elasticsearch` is actually up first: `./laradock info` and `./laradock logs elasticsearch`.
- **Port already in use on your host.** Change `DEJAVU_HTTP_PORT` in `.env` and restart: `./laradock restart dejavu`.

---

Need full dashboards and visualizations instead? See **[Kibana](/docs/services/kibana)**. Need the underlying engine? See **[Elasticsearch](/docs/services/elasticsearch)**. New to Laradock? Start with **[Getting Started](/docs/getting-started)**.
