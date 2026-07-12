# Deploy to Fly.io

Source: https://laradock.io/docs/deploy-to-fly-io

Built your app with [Laradock](https://laradock.io/docs/Intro)? Ship it to **Fly.io** without changing your stack. Fly builds the self-contained image (nginx + php-fpm) straight from the production Dockerfile and runs it close to your users.

## 1. Add the config

Copy the ready [`fly.toml`](https://github.com/laradock/laradock/blob/master/production/providers/fly.toml) to your project root. It points Fly at `laradock/production/Dockerfile` and routes HTTPS to port 8080.

## 2. Launch and deploy

```bash
fly launch --no-deploy          # first time, creates the app
fly secrets set APP_KEY=… DB_PASSWORD=…
fly deploy
```

## Notes

- **Managed database.** Use **Fly Postgres** or a managed provider; **Upstash Redis** for cache/queue.
- **Secrets** live in `fly secrets`, never in the image.
- **Regions.** Add more with `fly regions add`, the same image runs everywhere.

Deploying elsewhere? The [full deploy guide](https://laradock.io/docs/production) covers every target, Kubernetes, ECS, Cloud Run, Render, and more.
