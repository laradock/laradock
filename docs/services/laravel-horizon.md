# Laravel Horizon

Source: https://laradock.io/docs/services/laravel-horizon

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

## What is Laravel Horizon?

[Laravel Horizon](https://laravel.com/docs/horizon) is Laravel's official dashboard and configuration layer for Redis-backed queues, it doesn't replace the queue worker process, it supervises and reports on it. This container isn't a standalone daemon in the usual sense: it's a dedicated PHP/Alpine image (built via `supervisord`, extending Laradock's usual PHP extension-install pattern) whose job is to run `php artisan horizon` against your mounted Laravel application, under `depends_on: workspace`.

## First-run setup (required)

The container ships with only an **example** supervisord program file, `laravel-horizon/supervisord.d/laravel-horizon.conf.example`. Supervisord only loads files matching `*.conf`, so on a fresh checkout it loads nothing and the container starts but never actually runs `php artisan horizon`. Copy the example once before your first start:

```bash
cp laravel-horizon/supervisord.d/laravel-horizon.conf.example laravel-horizon/supervisord.d/laravel-horizon.conf
```

`*.conf` is gitignored on purpose (`laravel-horizon/supervisord.d/.gitignore`) so your local copy is never committed. Do this before [starting the container](#start-laravel-horizon), or [restart it](#supervise-queue-workers) afterward if you already started it without the file.

## Start Laravel Horizon

Your app must already have Horizon installed (`composer require laravel/horizon`) and configured to use the `redis` queue connection. Then:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock start laravel-horizon
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose up -d laravel-horizon
```

</TabItem>
</Tabs>

The container `depends_on` `workspace` in `compose.yml`, so Compose starts it first automatically. It also needs `redis` running and reachable, since that's what `php artisan horizon` actually connects to.

## Stop Laravel Horizon

Stopping just pauses the container; horizon simply stops processing until you start it again:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock stop laravel-horizon
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose stop laravel-horizon
```

</TabItem>
</Tabs>

This stops the container, which stops the supervised `horizon` process along with it. To remove the container:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock remove laravel-horizon
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose rm -sf laravel-horizon
```

</TabItem>
</Tabs>

## Configuration

Laravel Horizon's own dashboard and queue settings live in your Laravel app (`config/horizon.php`), not in this container. What this container's `laravel-horizon/defaults.env` controls is which optional PHP extensions get compiled into its image at build time, all `false` by default:

| Variable | Default | What it does |
|---|---|---|
| `LARAVEL_HORIZON_INSTALL_BZ2` | `false` | Install the `bz2` extension. |
| `LARAVEL_HORIZON_INSTALL_GD` | `false` | Install the `gd` extension. |
| `LARAVEL_HORIZON_INSTALL_GMP` | `false` | Install the `gmp` extension. |
| `LARAVEL_HORIZON_INSTALL_GNUPG` | `false` | Install the `gnupg` extension. |
| `LARAVEL_HORIZON_INSTALL_LDAP` | `false` | Install the `ldap` extension. |
| `LARAVEL_HORIZON_INSTALL_IMAGEMAGICK` | `false` | Install `imagick`, version controlled by `LARAVEL_HORIZON_IMAGEMAGICK_VERSION`. |
| `LARAVEL_HORIZON_INSTALL_INTL` | `false` | Install the `intl` extension. |
| `LARAVEL_HORIZON_IMAGEMAGICK_VERSION` | `latest` | Git ref of the `imagick` PECL/source build, used only when ImageMagick is installed. |
| `LARAVEL_HORIZON_INSTALL_SOCKETS` | `false` | Install the `sockets` extension. |
| `LARAVEL_HORIZON_INSTALL_YAML` | `false` | Install the `yaml` extension. |
| `LARAVEL_HORIZON_INSTALL_ZIP_ARCHIVE` | `false` | Install the `zip` extension. |
| `LARAVEL_HORIZON_INSTALL_PHPREDIS` | `false` | Install the `redis` PECL extension (in addition to `predis`, if your app uses it). |
| `LARAVEL_HORIZON_INSTALL_MONGO` | `false` | Install the `mongodb` extension. |
| `LARAVEL_HORIZON_INSTALL_CASSANDRA` | `false` | Install the Cassandra PHP driver. |
| `LARAVEL_HORIZON_INSTALL_FFMPEG` | `false` | Install the `ffmpeg` binary for jobs that process media. |
| `LARAVEL_HORIZON_INSTALL_AUDIOWAVEFORM` | `false` | Install the BBC `audiowaveform` binary. |
| `LARAVEL_HORIZON_INSTALL_POPPLER_UTILS` | `false` | Install `poppler-utils` and `antiword` for PDF/document jobs. |
| `LARAVEL_HORIZON_PUID` | `1000` | UID for the container's `laradock` user. |
| `LARAVEL_HORIZON_PGID` | `1000` | GID for the container's `laradock` user. |

This container also inherits `PHP_FPM_INSTALL_PGSQL`, `PHP_FPM_INSTALL_BCMATH`, and `PHP_FPM_INSTALL_MEMCACHED` from the shared PHP-FPM build args, so those extensions follow whatever you've already set for `php-fpm`.

## Supervise queue workers

The actual worker process(es) Horizon supervises are configured on the Laravel side, in `config/horizon.php` (queues, balance strategy, max processes, and so on), same as any Horizon setup. This container just needs Redis and your app code reachable to run `php artisan horizon`:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock start redis workspace laravel-horizon
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose up -d redis workspace laravel-horizon
```

</TabItem>
</Tabs>

Supervisord config for the container itself lives in `laravel-horizon/supervisord.d` (see [First-run setup](#first-run-setup-required) if you haven't created `laravel-horizon.conf` yet), mounted straight into `/etc/supervisord.d`, edit it if you need to change how the `horizon` process is launched or restarted inside the container. It's a volume mount, not baked into the image, so a restart picks up your edit, no rebuild needed:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock restart laravel-horizon
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose restart laravel-horizon
```

</TabItem>
</Tabs>

## Manage Horizon from the CLI

Open a terminal inside the container, the same way as any other Laradock service:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock enter laravel-horizon
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose exec laravel-horizon bash
```

</TabItem>
</Tabs>

Then use Horizon's own Artisan commands, the same ones you'd use outside Docker:

| Command | What it does |
|---|---|
| `php artisan horizon:status` | Print whether Horizon is currently running or paused. |
| `php artisan horizon:pause` | Pause processing without stopping the container. |
| `php artisan horizon:continue` | Resume after a pause. |
| `php artisan horizon:terminate` | Gracefully stop after current jobs finish; supervisord (`autorestart=true`) restarts the process immediately, this is the standard way to pick up freshly deployed code without dropping in-flight jobs. |
| `php artisan horizon:clear` | Remove all pending jobs from the queues Horizon is watching. |

## Common issues

- **Horizon container is running but nothing shows in the dashboard.** You most likely skipped [First-run setup](#first-run-setup-required): without `laravel-horizon.conf`, supervisord has no program to run, so `php artisan horizon` never starts even though the container itself is healthy.
- **Horizon container starts but no jobs process.** Confirm your Laravel app's `QUEUE_CONNECTION=redis` and that `redis` is running and reachable; Horizon only supervises Redis-backed queues.
- **Missing PHP extension errors from your app's jobs.** The extension flags above are all `false` by default; if a job needs `gd`, `imagick`, `mongodb`, and so on, set the matching `LARAVEL_HORIZON_INSTALL_*` variable and rebuild: `./laradock rebuild laravel-horizon`.
- **Extension build args changed but the container still lacks them.** These are Dockerfile build args, not runtime env vars; a plain restart won't apply them, rebuild the image after changing `.env`.
- **Horizon dashboard (`/horizon`) shows no metrics.** That dashboard is served by your app itself (through `php-fpm`/`nginx`), not by this container; this container only needs to be running so the underlying queue actually gets worked.
- **Edited `supervisord.d/laravel-horizon.conf` but nothing changed.** Supervisord only reads that file at process start; restart the container (`./laradock restart laravel-horizon`), don't just wait.

---

Need the queue backend itself? See **[Redis](https://laradock.io/docs/services/redis)**. New to Laradock? Start at **[Getting Started](https://laradock.io/docs/getting-started)**.
