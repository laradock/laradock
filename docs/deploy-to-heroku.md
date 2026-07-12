# Deploy to Heroku

Source: https://laradock.io/docs/deploy-to-heroku

Built your app with [Laradock](https://laradock.io/docs/Intro)? Ship it to **Heroku** (container stack) without changing your stack. The self-contained image (nginx + php-fpm) listens on the `$PORT` Heroku assigns.

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

Deploying elsewhere? The [full deploy guide](https://laradock.io/docs/production) covers every target, Kubernetes, ECS, Cloud Run, Fly, and more.
