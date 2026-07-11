---
slug: /deploy-to-fly-io
title: Deploy to Fly.io
description: Deploy any PHP app (Laravel, Symfony, WordPress) to Fly.io with Laradock. Build one image with ./laradock ship and go live worldwide with a ready-made fly.toml.
keywords:
  - deploy php to fly.io
  - deploy laravel to fly
  - fly.io php
  - laravel fly.io
  - laradock fly
  - php docker fly.io
  - fly io laravel deployment
---

Built your app with [Laradock](/docs/Intro)? Ship it to **Fly.io** without changing your stack. Fly builds the self-contained image (nginx + php-fpm) straight from the production Dockerfile and runs it close to your users.

## 1. Add the config

Copy the ready [`fly.toml`](https://github.com/laradock/laradock/blob/master/production/providers/fly.toml) to your project root. It points Fly at `laradock/production/Dockerfile` and routes HTTPS to port 8080.

## 2. Launch and deploy

```bash
fly launch --no-deploy          # first time, creates the app
fly secrets set APP_KEY=… DB_PASSWORD=…
fly deploy
```

## Notes

- **Managed database.** Use **Fly Postgres** or a managed provider; **Upstash Redis** for cache/queue.
- **Secrets** live in `fly secrets`, never in the image.
- **Regions.** Add more with `fly regions add`, the same image runs everywhere.

Deploying elsewhere? The [full deploy guide](/docs/production) covers every target, Kubernetes, ECS, Cloud Run, Render, and more.
