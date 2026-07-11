---
slug: /deploy-to-aws-ecs
title: Deploy to AWS ECS / Fargate
description: Deploy any PHP app (Laravel, Symfony, WordPress) to AWS ECS Fargate with Laradock. Build one image with ./laradock ship, push to ECR, and run it with a ready-made task definition.
keywords:
  - deploy php to aws ecs
  - deploy laravel to aws
  - aws fargate php
  - ecs laravel
  - laradock aws
  - php docker aws ecs
  - fargate laravel deployment
---

Built your app with [Laradock](/docs/Intro)? Ship it to **AWS ECS on Fargate** without changing your stack. `./laradock ship` builds one self-contained image (nginx + php-fpm, serving `$PORT`); ECS runs it as a task, no servers to manage.

## 1. Build and push to ECR

```bash
aws ecr create-repository --repository-name laradock-app
./laradock ship <ACCOUNT>.dkr.ecr.<REGION>.amazonaws.com/laradock-app:latest --push
```

## 2. Register the task and run it

Laradock ships a ready [`aws-ecs-task-definition.json`](https://github.com/laradock/laradock/blob/master/production/providers/aws-ecs-task-definition.json) (Fargate, awsvpc, port 8080, CloudWatch logs, Secrets Manager). Fill in your account, region, and image, then:

```bash
aws ecs register-task-definition --cli-input-json file://aws-ecs-task-definition.json
aws ecs create-service --cluster my-cluster --service-name laradock-app \
  --task-definition laradock-app --desired-count 1 --launch-type FARGATE
```

## Notes

- **Managed database.** Use **RDS**; put the password in **Secrets Manager** and reference it in the task (already wired in the template).
- **HTTPS + routing.** Put an **Application Load Balancer** in front, targeting container port 8080.
- **Secrets** never go in the image, they come from Secrets Manager / task env at runtime.

Deploying elsewhere? The [full deploy guide](/docs/production) covers every target, Kubernetes, Cloud Run, Fly, Render, and more.
