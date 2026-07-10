---
slug: /environment
title: Environment & Platform
description: Workspace access, host-specific tuning, and scheduling. SSH into the workspace, change the timezone, add PHP-FPM locales, add cron jobs, and speed up file sharing on macOS.
keywords:
  - laradock workspace ssh
  - laradock timezone
  - php-fpm locales
  - laradock cron jobs
  - docker macOS performance
  - virtiofs laradock
---

Workspace access, host-specific tuning, and scheduling.

## Access the workspace over SSH

Reach the Workspace at `localhost:2222` by setting `WORKSPACE_INSTALL_WORKSPACE_SSH=true` in your `.env` and rebuilding the workspace.

To change the forwarded port, add it to your `.env` (the default lives in `workspace/defaults.env`):

```env
WORKSPACE_SSH_PORT=2222
```

Then connect:

```bash
ssh -o PasswordAuthentication=no    \
    -o StrictHostKeyChecking=no     \
    -o UserKnownHostsFile=/dev/null \
    -p 2222                         \
    -i workspace/insecure_id_rsa    \
    laradock@localhost
```

> Replace `laradock@localhost` with `root@localhost` to log in as root.

## Change the timezone

Set `WORKSPACE_TIMEZONE` in your `.env` to any value from the [TZ database](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones), then rebuild. For example, New York:

```env
WORKSPACE_TIMEZONE=America/New_York
```

We also recommend [setting the timezone in Laravel](http://www.camroncade.com/managing-timezones-with-laravel/).

## Add locales to PHP-FPM

#### Add locales

1. In `.env`, set `PHP_FPM_INSTALL_ADDITIONAL_LOCALES` to `true`.
2. Add the locale codes to `PHP_FPM_ADDITIONAL_LOCALES`.
3. Rebuild: `./laradock rebuild php-fpm` (or `docker compose build php-fpm`).
4. Check them: `./laradock enter php-fpm` then `locale -a` (or `docker compose exec php-fpm locale -a`).

**Change the default locale** (default is `POSIX`):

1. In `.env`, set `PHP_FPM_DEFAULT_LOCALE` to your locale, for example `en_US.UTF8`.
2. Rebuild: `./laradock rebuild php-fpm` (or `docker compose build php-fpm`).
3. Check it: `./laradock enter php-fpm` then `locale` (or `docker compose exec php-fpm locale`).

## Add cron jobs

Add your cron jobs to `workspace/crontab/laradock`, after the `php artisan` line:

```
* * * * * laradock /usr/bin/php /var/www/artisan schedule:run >> /dev/null 2>&1

# Custom cron
* * * * * root echo "Every Minute" > /var/log/cron.log 2>&1
```

:::note
[Change the timezone](#change-the-timezone) if you don't want UTC. On Windows, make sure this file uses LF line endings, or the cron jobs silently fail.
:::

## Improve speed on macOS

Sharing your code from macOS into containers is slower than on Linux because every file read crosses the host/VM boundary. Recent Docker Desktop fixes most of this on its own, so the steps below go from "do this first" to "only if you still need it."

**1. Enable VirtioFS (fixes most cases).** In Docker Desktop, open **Settings → General → Choose file sharing implementation for your containers** and pick **VirtioFS**, then **Apply & Restart**. It is the default on recent Docker Desktop and is dramatically faster than the older osxfs / gRPC FUSE backends. For most projects this alone is enough.

**2. Tune the mount flag.** Laradock mounts your code using the `APP_CODE_CONTAINER_FLAG` value in your `.env` (default `:cached`). Keep `:cached` for most apps. If your app writes heavily to the mounted volume, `:delegated` can be faster, at the cost of the container's view lagging the host by a moment:

```dotenv
APP_CODE_CONTAINER_FLAG=:delegated
```

**3. Keep large directories out of the bind mount.** The real cost is bind-mounting tens of thousands of files. Directories your host doesn't need to read, such as `vendor/` and `node_modules/`, are best kept in a Docker volume instead of the host mount so they never cross the file-sharing boundary.

**4. Still too slow? Use Mutagen.** For very large codebases, [Mutagen](https://mutagen.io) syncs your files into a native container volume in the background, giving near-Linux speed. It is the maintained successor to the old `docker-sync` approach.
