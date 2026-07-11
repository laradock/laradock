---
slug: /deploy-to-railway
title: Deploy to Railway
description: Deploy any PHP app (Laravel, Symfony, WordPress) to Railway with Laradock. Build one image with ./laradock ship and go live with a ready-made railway.json.
keywords:
  - deploy php to railway
  - deploy laravel to railway
  - railway php
  - laravel railway
  - laradock railway
  - php docker railway
  - railway app deployment
---

Built your app with [Laradock](/docs/Intro)? Ship it to **Railway** without changing your stack. Railway builds the self-contained image (nginx + php-fpm) from the production Dockerfile and injects `$PORT`, which the image honors.

## 1. Add the config

Copy the ready [`railway.json`](https://github.com/laradock/laradock/blob/master/production/providers/railway.json) to your project root. It tells Railway to build from `laradock/production/Dockerfile` and health-check `/`.

## 2. Deploy

```bash
railway init
railway up
```

Or connect the repo in the Railway dashboard, it deploys on every push. Set env vars (`DB_HOST`, `DB_PASSWORD`, `APP_KEY`) in the service settings.

## Notes

- **Managed database.** Add **Railway Postgres** and **Railway Redis** as plugins, or use a managed provider.
- **Secrets** are service variables, never in the image.

Deploying elsewhere? The [full deploy guide](/docs/production) covers every target, Kubernetes, ECS, Cloud Run, Fly, and more.
