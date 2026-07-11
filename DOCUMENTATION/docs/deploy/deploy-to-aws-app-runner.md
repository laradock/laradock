---
slug: /deploy-to-aws-app-runner
title: Deploy to AWS App Runner
description: Deploy any PHP app (Laravel, Symfony, WordPress) to AWS App Runner with Laradock. Build one image with ./laradock ship, push to ECR, and go live with a ready-made service config.
keywords:
  - deploy php to aws app runner
  - deploy laravel to app runner
  - aws app runner php
  - laravel app runner
  - laradock aws
  - php docker app runner
  - app runner laravel deployment
---

Built your app with [Laradock](/docs/Intro)? Ship it to **AWS App Runner** without changing your stack. `./laradock ship` builds one self-contained image (nginx + php-fpm); App Runner runs it on port 8080 with HTTPS and autoscaling built in, no load balancer to configure.

## 1. Build and push to ECR

```bash
aws ecr create-repository --repository-name laradock-app
./laradock ship <ACCOUNT>.dkr.ecr.<REGION>.amazonaws.com/laradock-app:latest --push
```

## 2. Create the service

Laradock ships a ready [`aws-app-runner.json`](https://github.com/laradock/laradock/blob/master/production/providers/aws-app-runner.json) (ECR image, `Port: 8080`, health check, auto-deploy). Fill in your image, then:

```bash
aws apprunner create-service --cli-input-json file://aws-app-runner.json
```

## Notes

- **Managed database.** Use **RDS**; connect via a VPC connector.
- **Secrets** come from App Runner runtime env / Secrets Manager, never the image.
- **Auto-deploy.** With `AutoDeploymentsEnabled`, App Runner redeploys when you push a new image tag.

Deploying elsewhere? The [full deploy guide](/docs/production) covers every target, Kubernetes, ECS, Cloud Run, Fly, and more.
