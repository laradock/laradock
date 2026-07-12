# Deploy to DigitalOcean App Platform

Source: https://laradock.io/docs/deploy-to-digitalocean

Built your app with [Laradock](https://laradock.io/docs/Intro)? Ship it to **DigitalOcean App Platform** without changing your stack. `./laradock ship` builds one self-contained image (nginx + php-fpm) that App Platform runs on port 8080.

## 1. Build and push the image

Push to the DigitalOcean Container Registry (DOCR), Docker Hub, or GHCR:

```bash
./laradock ship registry.digitalocean.com/you/laradock-app:latest --push
```

## 2. Create the app

Laradock ships a ready [`digitalocean-app.yaml`](https://github.com/laradock/laradock/blob/master/production/providers/digitalocean-app.yaml) (App spec, `http_port: 8080`, health check). Fill in your image, then:

```bash
doctl apps create --spec laradock/production/providers/digitalocean-app.yaml
```

## Notes

- **Managed database.** Attach a **DigitalOcean Managed Database** (Postgres/MySQL) and **Managed Redis**.
- **Secrets** use `type: SECRET` env vars, never bake them into the image.

Deploying elsewhere? The [full deploy guide](https://laradock.io/docs/production) covers every target, Kubernetes, ECS, Cloud Run, Fly, and more.
