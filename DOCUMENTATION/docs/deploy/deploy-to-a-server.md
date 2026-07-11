---
slug: /deploy-to-a-server
title: Deploy to a Single Server
description: Deploy any PHP app (Laravel, Symfony, WordPress) to a single server (VPS, EC2, droplet) with Laradock and Docker Compose. Build one image with ./laradock ship and run it with one command.
keywords:
  - deploy php to a server
  - deploy laravel to vps
  - docker compose php production
  - laravel vps deploy
  - laradock production server
  - php docker single server
  - deploy laravel ec2 droplet
---

Built your app with [Laradock](/docs/Intro)? Ship it to **one server** (a VPS, EC2 instance, or droplet) without changing your stack. `./laradock ship` builds one self-contained image (nginx + php-fpm), and a ready Compose file runs it.

## 1. Build the image

```bash
./laradock ship                     # or: ./laradock ship registry/you/app:1.0 --push
```

## 2. Run it on the server

Laradock ships a ready [`compose.yml`](https://github.com/laradock/laradock/blob/master/production/compose.yml). On the server:

```bash
cp laradock/production/.env.example laradock/production/.env   # fill real values
docker compose -f laradock/production/compose.yml up -d
```

Optional worker and scheduler are one flag away: `--profile worker --profile scheduler`.

## Notes

- **Managed database.** Point `DB_*` / `REDIS_*` at a managed service; the Compose file deliberately does **not** expose a database port.
- **HTTPS.** Put a reverse proxy in front (Caddy or Traefik give you automatic TLS).
- **Scaling past one box?** Move to [Kamal](/docs/deploy-to-kamal) or [Kubernetes](/docs/deploy-to-kubernetes), same image.

Deploying elsewhere? The [full deploy guide](/docs/production) covers every target, ECS, Cloud Run, Fly, Render, and more.
