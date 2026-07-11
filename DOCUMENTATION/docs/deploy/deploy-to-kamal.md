---
slug: /deploy-to-kamal
title: Deploy with Kamal (your own servers)
description: Deploy any PHP app (Laravel, Symfony, WordPress) to your own servers with Kamal and Laradock. Build one image with ./laradock ship and get zero-downtime deploys with a ready-made config.
keywords:
  - deploy php with kamal
  - deploy laravel with kamal
  - kamal php
  - kamal laravel
  - laradock kamal
  - php docker vps deploy
  - zero downtime php deploy
---

Built your app with [Laradock](/docs/Intro)? Ship it to **your own servers** (a VPS, bare metal, anywhere) with [Kamal](https://kamal-deploy.org), no Kubernetes needed. Kamal builds the self-contained image (nginx + php-fpm) and rolls it out with zero downtime, its proxy handles TLS.

## 1. Add the config

Copy the ready [`kamal-deploy.yml`](https://github.com/laradock/laradock/blob/master/production/providers/kamal-deploy.yml) to `config/deploy.yml`. It builds from `laradock/production/Dockerfile`, serves port 8080, and terminates TLS at the proxy.

## 2. Deploy

```bash
# put secrets in .kamal/secrets, then:
kamal setup      # first time
kamal deploy     # every release
```

## Notes

- **Managed database.** Point `DB_*` at a managed provider, or run a database as a Kamal accessory.
- **Secrets** live in `.kamal/secrets`, never in the image.
- **Zero downtime.** Kamal boots the new container, health-checks it, then swaps traffic.

Deploying elsewhere? The [full deploy guide](/docs/production) covers every target, Kubernetes, ECS, Cloud Run, Fly, and more.
