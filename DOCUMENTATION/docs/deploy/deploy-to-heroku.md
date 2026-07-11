---
slug: /deploy-to-heroku
title: Deploy to Heroku
description: Deploy any PHP app (Laravel, Symfony, WordPress) to Heroku with Laradock using the container stack. Build one image with ./laradock ship and go live with a ready-made heroku.yml.
keywords:
  - deploy php to heroku
  - deploy laravel to heroku
  - heroku php docker
  - laravel heroku
  - laradock heroku
  - heroku container php
  - heroku.yml laravel
---

Built your app with [Laradock](/docs/Intro)? Ship it to **Heroku** (container stack) without changing your stack. The self-contained image (nginx + php-fpm) listens on the `$PORT` Heroku assigns.

## 1. Add the config

Copy the ready [`heroku.yml`](https://github.com/laradock/laradock/blob/master/production/providers/heroku.yml) to your project root. It builds the web process from `laradock/production/Dockerfile`.

## 2. Deploy

```bash
heroku create && heroku stack:set container
heroku config:set APP_ENV=production DB_HOST=… DB_PASSWORD=…
git push heroku main
```

## Notes

- **Managed database.** Add **Heroku Postgres** and **Heroku Data for Redis**.
- **Config vars** are injected as env, never bake secrets into the image.
- **Worker.** Uncomment the `worker` process in `heroku.yml`, then `heroku ps:scale worker=1`.

Deploying elsewhere? The [full deploy guide](/docs/production) covers every target, Kubernetes, ECS, Cloud Run, Fly, and more.
