---
slug: /deploy-to-render
title: Deploy to Render
description: Deploy any PHP app (Laravel, Symfony, WordPress) to Render with Laradock. Build one image with ./laradock ship and go live with a ready-made render.yaml Blueprint.
keywords:
  - deploy php to render
  - deploy laravel to render
  - render php
  - laravel render.com
  - laradock render
  - php docker render
  - render blueprint php
---

Built your app with [Laradock](/docs/Intro)? Ship it to **Render** without changing your stack. `./laradock ship` builds one self-contained image (nginx + php-fpm) that listens on the `$PORT` Render injects.

## 1. Add the Blueprint

Copy the ready [`render.yaml`](https://github.com/laradock/laradock/blob/master/production/providers/render.yaml) to your project root. It defines a web service that runs your image (or builds from the production Dockerfile).

## 2. Deploy

In the Render dashboard: **New > Blueprint**, point it at your repo, and set secret env vars (`DB_PASSWORD`, `APP_KEY`). Render builds and deploys on every push.

## Notes

- **Managed database.** Use **Render Postgres** and **Render Redis**, or any managed provider.
- **Secrets** are set in the dashboard (`sync: false` in the Blueprint), never in git.
- **Health checks** hit `/` by default; point them at a real health route if you have one.

Deploying elsewhere? The [full deploy guide](/docs/production) covers every target, Kubernetes, ECS, Cloud Run, Fly, and more.
