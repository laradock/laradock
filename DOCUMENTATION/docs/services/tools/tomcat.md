---
slug: /services/tomcat
title: Tomcat
description: Run Apache Tomcat in Laradock to deploy and serve Java web applications (WAR files).
keywords:
  - laradock tomcat
  - tomcat docker
  - tomcat docker compose
  - deploy war file docker
  - java web app docker
---

## What is Tomcat?

[Apache Tomcat](https://tomcat.apache.org) is a Java Servlet container that runs Java web applications packaged as WAR files. Laradock runs it from the official `tomcat` Docker image.

## Start Tomcat

```bash
docker compose up -d tomcat
```

## Stop Tomcat

```bash
docker compose stop tomcat
```

## Configuration

Settings live in `tomcat/defaults.env` and can be overridden in your own `.env`:

| Variable | Default | What it does |
|---|---|---|
| `TOMCAT_VERSION` | `9.0` | Image tag from the [official `tomcat` Docker Hub page](https://hub.docker.com/_/tomcat). |
| `TOMCAT_HOST_HTTP_PORT` | `8080` | Host port Tomcat is published on (container always listens on `8080` internally). |

## Deploy a WAR file

Drop a `.war` file into `DATA_PATH_HOST/tomcat/webapps`, it's mounted straight into Tomcat's own `webapps` directory, so Tomcat picks it up and auto-deploys it without a rebuild:

```bash
cp your-app.war "${DATA_PATH_HOST}/tomcat/webapps/"
```

Open [http://localhost:8080](http://localhost:8080) to reach the Tomcat welcome page, or `http://localhost:8080/your-app` once your WAR has deployed. Logs are written to `DATA_PATH_HOST/tomcat/logs`, also mounted from the host.

## Common issues

- **WAR file doesn't deploy.** Check `DATA_PATH_HOST/tomcat/logs` for deployment errors, malformed WAR files or Java errors surface there, not in `docker compose logs tomcat`.
- **Changing `TOMCAT_VERSION` doesn't take effect.** Tomcat runs from a prebuilt image (no local Dockerfile to rebuild), so a plain restart after changing `.env` is enough: `docker compose up -d tomcat`.
- **Port already in use on your host.** Change `TOMCAT_HOST_HTTP_PORT` in `.env` and restart: `docker compose up -d tomcat`.

---

New to Laradock? Start at **[Getting Started](/docs/getting-started)**.
