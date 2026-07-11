---
slug: /deploy-to-google-cloud-run
title: Deploy to Google Cloud Run
description: Deploy any PHP app (Laravel, Symfony, WordPress) to Google Cloud Run with Laradock. Build one image with ./laradock ship, push to Artifact Registry, and go live with a ready-made service config.
keywords:
  - deploy php to cloud run
  - deploy laravel to google cloud run
  - cloud run php
  - laravel cloud run
  - laradock google cloud
  - php docker cloud run
  - serverless php
---

Built your app with [Laradock](/docs/Intro)? Ship it to **Google Cloud Run** without changing your stack. `./laradock ship` builds one self-contained image (nginx + php-fpm) that listens on the `$PORT` Cloud Run injects, so it just works, and scales to zero when idle.

## 1. Build and push to Artifact Registry

```bash
./laradock ship <REGION>-docker.pkg.dev/<PROJECT>/<REPO>/laradock-app:latest --push
```

## 2. Deploy the service

Laradock ships a ready [`google-cloud-run.yaml`](https://github.com/laradock/laradock/blob/master/production/providers/google-cloud-run.yaml) (Knative Service, containerPort 8080, Secret Manager env). Fill in your image, then:

```bash
gcloud run services replace laradock/production/providers/google-cloud-run.yaml --region=us-central1
```

Or the one-liner: `gcloud run deploy laradock-app --image=<IMAGE> --port=8080 --region=us-central1`.

## Notes

- **Managed database.** Use **Cloud SQL** (add the connector) and **Memorystore** for Redis.
- **Secrets.** Reference **Secret Manager** entries (already wired in the template).
- **Scale to zero.** Cloud Run stops instances when idle; set `min-instances` if you need one always warm.

Deploying elsewhere? The [full deploy guide](/docs/production) covers every target, Kubernetes, ECS, Fly, Render, and more.
