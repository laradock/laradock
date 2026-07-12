# Deploy to Railway

Source: https://laradock.io/docs/deploy-to-railway

Built your app with [Laradock](https://laradock.io/docs/Intro)? Ship it to **Railway** without changing your stack. Railway builds the self-contained image (nginx + php-fpm) from the production Dockerfile and injects `$PORT`, which the image honors.

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

Deploying elsewhere? The [full deploy guide](https://laradock.io/docs/production) covers every target, Kubernetes, ECS, Cloud Run, Fly, and more.
