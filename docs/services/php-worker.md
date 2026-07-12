# PHP Worker

Source: https://laradock.io/docs/services/php-worker

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

## What is PHP Worker?

`php-worker` is Laradock's dedicated background-processing container. It's built on `php:${PHP_VERSION}-alpine` with [Supervisor](http://supervisord.org) installed, and its Dockerfile sets Supervisor as the container's entrypoint (`ENTRYPOINT ["/usr/bin/supervisord", "-n", "-c", "/etc/supervisord.conf"]`). Supervisor keeps whatever processes you configure alive and restarts them if they crash, in practice, that means Laravel's `queue:work` (or any other long-running worker command) instead of one-off `queue:work` runs that die when a request-scoped process exits.

Unlike `php-fpm`, this container never serves HTTP requests, it just runs Supervisor-managed background processes against your mounted code.

## Start PHP Worker

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock start php-worker
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose up -d php-worker
```

</TabItem>
</Tabs>

It depends on `workspace` (shares PHP version and build context) and mounts `./php-worker/supervisord.d` into `/etc/supervisord.d` inside the container, that's where you define which commands Supervisor actually runs. Your app code is mounted read/write from `APP_CODE_PATH_HOST`, there's no separate data volume for this container, it holds no state of its own.

## Stop PHP Worker

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock stop php-worker
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose stop php-worker
```

</TabItem>
</Tabs>

To delete the container entirely (your app code and Supervisor configs live on disk outside the container, so nothing is lost):

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock remove php-worker
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose rm -sf php-worker
```

</TabItem>
</Tabs>

## Configure what it runs

Add a Supervisor program config to `php-worker/supervisord.d/` (mounted, not baked into the image), for example a Laravel queue worker:

```ini
[program:laravel-worker]
process_name=%(program_name)s_%(process_num)02d
command=php /var/www/artisan queue:work --sleep=3 --tries=3
autostart=true
autorestart=true
numprocs=1
user=laradock
redirect_stderr=true
```

`user=laradock` runs the process as the container's non-root user (matches `PHP_WORKER_PUID`/`PHP_WORKER_PGID`) instead of root, and `redirect_stderr=true` folds stderr into the same log stream as stdout so `docker compose logs php-worker` shows everything.

Restart the container to pick up new or changed Supervisor configs:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock restart php-worker
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose restart php-worker
```

</TabItem>
</Tabs>

## Run more worker processes in parallel

`numprocs` controls how many copies of the same program Supervisor runs side by side, this is how you scale queue throughput without adding another container. `php-worker/supervisord.d/laravel-worker.conf.example` ships with `numprocs=8` as a starting point:

```ini
[program:laravel-worker]
process_name=%(program_name)s_%(process_num)02d
command=php /var/www/artisan queue:work --sleep=3 --tries=3
autostart=true
autorestart=true
numprocs=8
user=laradock
redirect_stderr=true
```

`%(process_num)02d` in `process_name` is what keeps the 8 instances uniquely named (`laravel-worker_00` through `laravel-worker_07`); the `command` itself doesn't need to change, each instance independently pulls the next available job off the queue. Restart the container after changing `numprocs` for it to take effect.

## Run the Laravel scheduler

`php-worker/supervisord.d/laravel-scheduler.conf.example` is a second ready-made config, for `artisan schedule:run` instead of `queue:work`:

```ini
[program:laravel-scheduler]
process_name=%(program_name)s_%(process_num)02d
command=/bin/sh -c "while [ true ]; do (php /var/www/artisan schedule:run --verbose --no-interaction &); sleep 60; done"
autostart=true
autorestart=true
numprocs=1
user=laradock
redirect_stderr=true
```

It loops `schedule:run` every 60 seconds, the same effect as a host cron entry, without needing cron installed anywhere. Copy either `.example` file (drop the `.example` suffix) into `php-worker/supervisord.d/` and restart the container to enable it.

## Check worker status

Supervisor exposes an HTTP control interface on `127.0.0.1:9001` inside the container (see `php-worker/supervisord.conf`). From inside the container, `supervisorctl` reports what's running, restarting, or crashed:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock enter php-worker
supervisorctl -c /etc/supervisord.conf -s http://127.0.0.1:9001 status
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose exec php-worker bash
supervisorctl -c /etc/supervisord.conf -s http://127.0.0.1:9001 status
```

</TabItem>
</Tabs>

Each line shows one program (or one `numprocs` instance) and its state: `RUNNING`, `STARTING`, `BACKOFF` (crash-looping), `FATAL` (gave up restarting), or `STOPPED`.

## Restart a single worker without restarting the container

`docker compose restart php-worker` restarts every program Supervisor manages at once. To bounce just one, for example after deploying new code, without dropping jobs currently running in other workers, use `supervisorctl restart` with that program's name from the `status` output above:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock enter php-worker
supervisorctl -c /etc/supervisord.conf -s http://127.0.0.1:9001 restart laravel-worker:*
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose exec php-worker bash
supervisorctl -c /etc/supervisord.conf -s http://127.0.0.1:9001 restart laravel-worker:*
```

</TabItem>
</Tabs>

`laravel-worker:*` restarts every `numprocs` instance of that one program group; swap in the exact name from `status` (e.g. `laravel-worker:laravel-worker_00`) to restart a single instance.

## Configuration

The PHP version follows the shared `PHP_VERSION` variable in the root `.env` (same as `workspace`/`php-fpm`), passed in as `LARADOCK_PHP_VERSION`. Extension toggles live in `php-worker/defaults.env` as `PHP_WORKER_INSTALL_*` build-time flags, almost all default to `false`; the one exception:

| Variable | Default | What it does |
|---|---|---|
| `PHP_WORKER_INSTALL_INTL` | `true` | Internationalization extension. |
| `PHP_WORKER_PUID` / `PHP_WORKER_PGID` | `1000` / `1000` | UID/GID for the container's non-root `laradock` user. |

Everything else, BZ2, GD, ImageMagick, GMP, GnuPG, LDAP, PostgreSQL, MongoDB, BCMath, Memcached, OCI8, MSSQL, Phalcon, APCu, SOAP, ZipArchive, MySQL client, AMQP, Ghostscript, Swoole, Taint, FFmpeg, Cassandra, Gearman, Redis, IMAP, XML-RPC, SSDB, Event, poppler-utils, GraphViz, follows the same pattern:

```env
PHP_WORKER_INSTALL_REDIS=true
```

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock rebuild php-worker
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose build php-worker
```

</TabItem>
</Tabs>

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock start php-worker
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose up -d php-worker
```

</TabItem>
</Tabs>

## Common issues

- **Worker doesn't pick up code changes.** `artisan queue:work` caches your app in memory per worker process; Supervisor restarting the process (`autorestart=true`) handles crashes, but code changes still need an explicit restart: `./laradock restart php-worker`, or use `queue:listen` instead of `queue:work` if you want changes picked up per job (slower, more overhead).
- **Added a Supervisor config but nothing runs.** Config changes in `php-worker/supervisord.d/` need a container restart to be read: `./laradock restart php-worker`. Check [Check worker status](#check-worker-status) above to confirm the program shows up and is `RUNNING`.
- **Enabled an extension but it's not loaded.** `PHP_WORKER_INSTALL_*` flags only take effect on build: `./laradock rebuild php-worker` then `./laradock start php-worker`.
- **A worker keeps crash-looping (`BACKOFF`/`FATAL`).** Usually a bad `command=` path or a PHP fatal error on boot. Check `./laradock logs php-worker`, Supervisor logs each managed process's stdout/stderr there by default.
- **Jobs fail silently.** Check `./laradock logs php-worker`, Supervisor logs each managed process's stdout/stderr there by default.

---

Need the container that serves HTTP requests? See the **[PHP-FPM guide](https://laradock.io/docs/services/php-fpm)**. New to Laradock? Start at **[Getting Started](https://laradock.io/docs/getting-started)**.
