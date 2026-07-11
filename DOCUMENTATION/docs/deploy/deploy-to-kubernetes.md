---
slug: /deploy-to-kubernetes
title: Deploy to Kubernetes
description: Deploy any PHP app (Laravel, Symfony, WordPress) to Kubernetes with Laradock. Build one image with ./laradock ship, then kubectl apply ready-made manifests. Works on EKS, GKE, AKS, DOKS, or your own cluster.
keywords:
  - deploy php to kubernetes
  - deploy laravel to kubernetes
  - kubernetes php
  - laravel kubernetes
  - laradock kubernetes
  - php docker kubernetes
  - k8s php deployment
---

Built your app with [Laradock](/docs/Intro)? Ship it to **Kubernetes** without changing your stack. `./laradock ship` builds one self-contained image (nginx + php-fpm, serving `$PORT`); your cluster just runs it, whether that's your own, **EKS**, **GKE**, **AKS**, or **DOKS**.

## 1. Build and push the image

```bash
./laradock ship registry.example.com/you/app:1.0 --push
```

## 2. Apply the manifests

Laradock ships a ready [`kubernetes.yaml`](https://github.com/laradock/laradock/blob/master/production/kubernetes.yaml): a deployment (resource limits + probes), a service, a TLS-ready ingress (cert-manager), an uploads PVC, plus optional worker, scheduler CronJob, and migrate Job.

```bash
kubectl create secret generic app-env --from-env-file=laradock/production/.env
# set image: to your pushed image in kubernetes.yaml, then:
kubectl apply -f laradock/production/kubernetes.yaml
```

## Notes

- **Managed database.** Point `DB_*` / `REDIS_*` at RDS, Cloud SQL, or your provider's managed service, never a pod.
- **TLS.** Install [cert-manager](https://cert-manager.io) and set your issuer in the ingress annotations.
- **Uploads.** Multiple replicas need `ReadWriteMany` storage or S3 (see the PVC note in the manifest).

Deploying elsewhere? The [full deploy guide](/docs/production) covers every target, ECS, Cloud Run, Fly, Render, and more.
