---
slug: /services/graylog
title: Graylog
description: Run Graylog in Laradock to centralize and search application logs, backed by MongoDB and Elasticsearch.
keywords:
  - laradock graylog
  - graylog docker
  - graylog docker compose
  - centralized logging docker
  - syslog docker
  - gelf docker
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

## What is Graylog?

[Graylog](https://www.graylog.org) is an open-source log management platform: it centralizes, indexes, and lets you search logs from your application and infrastructure through a web UI. It stores metadata in MongoDB and log data in Elasticsearch. Laradock builds it as its own container, wired to Laradock's `mongo` and `elasticsearch` containers.

## Start Graylog

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock start graylog
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose up -d graylog
```

</TabItem>
</Tabs>

`graylog/compose.yml` lists `mongo` and `elasticsearch` as `depends_on`, so both start automatically alongside it.

## Stop Graylog

Stopping just pauses the container; **its own working data is safe** (kept under `DATA_PATH_HOST/graylog`):

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock stop graylog
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose stop graylog
```

</TabItem>
</Tabs>

To delete the container entirely (the data on disk is still untouched):

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock remove graylog
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose rm -sf graylog
```

</TabItem>
</Tabs>

## Configuration

All settings live in `graylog/defaults.env` and can be overridden by adding the same line to your own `.env`:

| Variable | Default | What it does |
|---|---|---|
| `GRAYLOG_PASSWORD` | `somesupersecretpassword` | Plain-text reminder of the admin password; not read directly, see below. |
| `GRAYLOG_SHA256_PASSWORD` | `b1cb6e31e172577918c9e7806c572b5ed8477d3f57aa737bee4b5b1db3696f09` | SHA-256 hash of the admin password, this is what Graylog actually authenticates against. |
| `GRAYLOG_PORT` | `9000` | Host-side port for the web UI and REST API. |
| `GRAYLOG_SYSLOG_TCP_PORT` | `514` | Host-side port for Syslog over TCP. |
| `GRAYLOG_SYSLOG_UDP_PORT` | `514` | Host-side port for Syslog over UDP. |
| `GRAYLOG_GELF_TCP_PORT` | `12201` | Host-side port for GELF over TCP. |
| `GRAYLOG_GELF_UDP_PORT` | `12201` | Host-side port for GELF over UDP. |

## Set a real password

The password must be at least 16 characters. Set both the plain-text reminder and its hash in your `.env`:

```env
GRAYLOG_PASSWORD=somesupersecretpassword
GRAYLOG_SHA256_PASSWORD=b1cb6e31e172577918c9e7806c572b5ed8477d3f57aa737bee4b5b1db3696f09
```

Generate the hash with: `echo -n somesupersecretpassword | sha256sum`.

## Log in and create an input

Open [http://localhost:9000](http://localhost:9000) and sign in as `admin` with your password. Go to **System → Inputs** and launch a new input (GELF or Syslog, TCP or UDP) to start receiving logs on the corresponding port above.

## Send logs from your app

Once an input is running, point your app's logging driver at it instead of (or alongside) local log files:

- **GELF** (structured, recommended): send to `127.0.0.1` on `GRAYLOG_GELF_TCP_PORT`/`GRAYLOG_GELF_UDP_PORT` (`12201` by default). Laravel's Monolog stack supports a GELF handler; most other frameworks have an equivalent GELF logging library.
- **Syslog** (plain-text, for infra/system logs): send to `127.0.0.1` on `GRAYLOG_SYSLOG_TCP_PORT`/`GRAYLOG_SYSLOG_UDP_PORT` (`514` by default).

If your app runs in another Laradock container (not on your host), it can't reach Graylog by container name unless it's on the same `backend` network; the published host ports above work from anywhere, including from inside other containers via `host.docker.internal`.

## Where your data actually lives

The volume mounted into the container (`DATA_PATH_HOST/graylog`) only holds Graylog's **own** working state: its node ID and local message journal. The two things you probably care about for backups live elsewhere:

- **Log messages** are indexed and stored by **[Elasticsearch](/docs/services/elasticsearch)**, not by Graylog itself.
- **Everything you configure in the UI** (streams, dashboards, alerts, inputs, users) is metadata stored in **[MongoDB](/docs/services/mongo)**.

To actually back up your Graylog setup, back up the `mongo` and `elasticsearch` containers' data, not `graylog/`'s own folder.

## Start completely fresh (wipe all data)

To throw away Graylog's own working state and start it from a clean slate (⚠️ this does **not** touch your indexed logs in Elasticsearch or your dashboards/streams in MongoDB, wipe those separately if you want a fully clean logging stack):

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock stop graylog
./laradock remove graylog
rm -rf "${DATA_PATH_HOST:-~/.laradock/data}/graylog"
./laradock start graylog
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose stop graylog
docker compose rm -sf graylog
rm -rf "${DATA_PATH_HOST:-~/.laradock/data}/graylog"
docker compose up -d graylog
```

</TabItem>
</Tabs>

## Common issues

- **Login fails even with the right password.** Graylog authenticates against `GRAYLOG_SHA256_PASSWORD`, not `GRAYLOG_PASSWORD`. If you changed the plain-text value but forgot to regenerate and update the hash, login will fail.
- **Graylog won't start or logs errors about Elasticsearch/MongoDB.** Confirm both dependencies are actually up: `docker compose ps mongo elasticsearch`.
- **Port `514` conflicts on your host.** Port 514 is a privileged port often reserved by system syslog daemons. Change `GRAYLOG_SYSLOG_TCP_PORT`/`GRAYLOG_SYSLOG_UDP_PORT` in `.env` and restart with `./laradock restart graylog`.
- **Logs aren't showing up.** You need to create an input first under **System → Inputs**, Graylog doesn't listen on any protocol by default until one is configured.

---

Want infrastructure/host metrics instead of application logs? See **[NetData](/docs/services/netdata)** or **[Prometheus](/docs/services/prometheus)**. New to Laradock? Start with **[Getting Started](/docs/getting-started)**.
