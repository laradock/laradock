# Manual Setup (without the CLI)

Source: https://laradock.io/docs/manual-setup

Prefer to skip the CLI? Everything it does, you can do by hand with plain `docker compose`, same files, same result. This path is meant for advanced users who want full control over exactly which containers run and how they're configured. For the fast path, see [Getting Started](https://laradock.io/docs/getting-started).

1 - Copy the shared settings template:

```bash
cp .env.example .env
```

Set `APP_CODE_PATH_HOST` to your project path (for example `../project-z/`, or `../` to serve [multiple projects](https://laradock.io/docs/multiple-projects)). See [How Laradock configuration works](https://laradock.io/docs/getting-started#how-laradock-configuration-works) for the full model.

2 - Start the containers you need, for example NGINX (web server) and MySQL (database):

```bash
docker compose up -d nginx mysql
```

Web-server containers (`nginx`, `apache2`, ...) depend on `php-fpm` and start it automatically, so you don't list it explicitly. Pick any combination from the [available services](https://laradock.io/docs/Intro#supported-services).

3 - Enter the workspace to run Artisan, Composer, PHPUnit, and friends:

```bash
docker compose exec --user=laradock workspace bash
```

`--user=laradock` makes files come out owned by you, not root. On Windows PowerShell you can also enter any running container with `docker exec -it {workspace-container-id} bash`. Change the user with `WORKSPACE_PUID` / `WORKSPACE_PGID` in your `.env` (defaults in `workspace/defaults.env`).

4 - Point your app at the database. In your PHP project's `.env`, set the host to the service name:

```env
DB_HOST=mysql
```

Use Laradock's default DB credentials from `mysql/defaults.env`, or override them in your `.env` and rebuild. Installing Laravel? See [How to Install Laravel in a Docker Container](https://laradock.io/docs/laravel-on-docker).

5 - Open [http://localhost](http://localhost) (or `http://project-1.test/` etc. if you set up [multiple projects](https://laradock.io/docs/multiple-projects)).

:::warning Upgrading from an older Laradock?
Rebuild the containers you use to avoid errors, [see how to rebuild a container](https://laradock.io/docs/containers#build-or-rebuild-containers).
:::
