---
slug: /production
title: Production & Deployment
description: Prepare a Laradock stack for production with a dedicated Compose file that avoids exposing database ports, plus how to authenticate Docker against Google Cloud.
keywords:
  - laradock production
  - docker compose production
  - laradock deployment
  - docker database port security
  - gcloud docker auth
  - google container registry
---

Laradock's default `docker-compose.yml` is tuned for local development. Production needs a leaner, locked-down setup, and if you're deploying to Google Cloud, Docker needs to be authenticated against its registry first.

## Prepare Laradock for production

For production, create a dedicated Compose file (for example `production-docker-compose.yml`) that includes only the containers you'll actually run:

```bash
docker compose -f production-docker-compose.yml up -d nginx mysql redis ...
```

:::danger[Security]
do not forward database ports in production. Docker publishes them on the host unless told otherwise, which is insecure. Remove lines like:

```yml
ports:
    - "3306:3306"
```

See [this post on Docker and iptables](https://fralef.me/docker-and-iptables.html) for why.
:::

## Set up Google Cloud

Configure Docker for the Google Container Registry, then authenticate:

```bash
gcloud auth configure-docker
gcloud auth login
```
