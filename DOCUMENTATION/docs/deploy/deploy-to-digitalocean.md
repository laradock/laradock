---
slug: /deploy-to-digitalocean
title: Deploy to DigitalOcean App Platform
description: Deploy any PHP app (Laravel, Symfony, WordPress) to DigitalOcean App Platform with Laradock. Build one image with ./laradock ship and go live with a ready-made app spec.
keywords:
  - deploy php to digitalocean
  - deploy laravel to digitalocean
  - digitalocean app platform php
  - laravel digitalocean
  - laradock digitalocean
  - php docker digitalocean
  - do app platform laravel
---

Built your app with [Laradock](/docs/Intro)? Ship it to **DigitalOcean App Platform** without changing your stack. `./laradock ship` builds one self-contained image (nginx + php-fpm) that App Platform runs on port 8080.

## 1. Build and push the image

Push to the DigitalOcean Container Registry (DOCR), Docker Hub, or GHCR:

```bash
./laradock ship registry.digitalocean.com/you/laradock-app:latest --push
```

## 2. Create the app

Laradock ships a ready [`digitalocean-app.yaml`](https://github.com/laradock/laradock/blob/master/production/providers/digitalocean-app.yaml) (App spec, `http_port: 8080`, health check). Fill in your image, then:

```bash
doctl apps create --spec laradock/production/providers/digitalocean-app.yaml
```

## Notes

- **Managed database.** Attach a **DigitalOcean Managed Database** (Postgres/MySQL) and **Managed Redis**.
- **Secrets** use `type: SECRET` env vars, never bake them into the image.

Deploying elsewhere? The [full deploy guide](/docs/production) covers every target, Kubernetes, ECS, Cloud Run, Fly, and more.
