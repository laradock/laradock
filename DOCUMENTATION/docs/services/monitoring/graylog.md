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

## What is Graylog?

[Graylog](https://www.graylog.org) is an open-source log management platform: it centralizes, indexes, and lets you search logs from your application and infrastructure through a web UI. It stores metadata in MongoDB and log data in Elasticsearch. Laradock builds it as its own container, wired to Laradock's `mongo` and `elasticsearch` containers.

## Start Graylog

```bash
docker compose up -d graylog
```

`graylog/compose.yml` lists `mongo` and `elasticsearch` as dependencies, so both start automatically alongside it.

## Stop Graylog

```bash
docker compose stop graylog
```

This stops the container without deleting its data (kept under `DATA_PATH_HOST/graylog`). To remove the container: `docker compose rm -f graylog`.

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

## Common issues

- **Login fails even with the right password.** Graylog authenticates against `GRAYLOG_SHA256_PASSWORD`, not `GRAYLOG_PASSWORD`. If you changed the plain-text value but forgot to regenerate and update the hash, login will fail.
- **Graylog won't start or logs errors about Elasticsearch/MongoDB.** Confirm both dependencies are actually up: `docker compose ps mongo elasticsearch`.
- **Port `514` conflicts on your host.** Port 514 is a privileged port often reserved by system syslog daemons. Change `GRAYLOG_SYSLOG_TCP_PORT`/`GRAYLOG_SYSLOG_UDP_PORT` in `.env` and restart.
- **Logs aren't showing up.** You need to create an input first under **System → Inputs**, Graylog doesn't listen on any protocol by default until one is configured.

---

Want infrastructure/host metrics instead of application logs? See **[NetData](/docs/services/netdata)** or **[Prometheus](/docs/services/prometheus)**. New to Laradock? Start with **[Getting Started](/docs/getting-started)**.
