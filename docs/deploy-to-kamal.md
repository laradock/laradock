# Deploy with Kamal (your own servers)

Source: https://laradock.io/docs/deploy-to-kamal

Built your app with [Laradock](https://laradock.io/docs/Intro)? Ship it to **your own servers** (a VPS, bare metal, anywhere) with [Kamal](https://kamal-deploy.org), no Kubernetes needed. Kamal builds the self-contained image (nginx + php-fpm) and rolls it out with zero downtime, its proxy handles TLS.

## 1. Add the config

Copy the ready [`kamal-deploy.yml`](https://github.com/laradock/laradock/blob/master/production/providers/kamal-deploy.yml) to `config/deploy.yml`. It builds from `laradock/production/Dockerfile`, serves port 8080, and terminates TLS at the proxy.

## 2. Deploy

```bash
# put secrets in .kamal/secrets, then:
kamal setup      # first time
kamal deploy     # every release
```

## Notes

- **Managed database.** Point `DB_*` at a managed provider, or run a database as a Kamal accessory.
- **Secrets** live in `.kamal/secrets`, never in the image.
- **Zero downtime.** Kamal boots the new container, health-checks it, then swaps traffic.

Deploying elsewhere? The [full deploy guide](https://laradock.io/docs/production) covers every target, Kubernetes, ECS, Cloud Run, Fly, and more.
