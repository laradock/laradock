# Multiple PHP Versions

Source: https://laradock.io/docs/multiple-php-versions

Laradock builds **one** PHP version by default, `PHP_VERSION` in your `.env`, shared by every PHP container (`php-fpm`, `workspace`, `php-worker`, `laravel-horizon`). There are two very different "multiple versions" needs, and they have different answers.

## Different projects, different versions

If each version belongs to a **separate project**, don't run them in one stack. Give each project its own Laradock copy and its own `.env`, then set `PHP_VERSION` per project. Switching a project's version is one line plus a rebuild:

```env
PHP_VERSION=7.4
```

```bash
./laradock rebuild        # or: docker compose build
```

This is the normal, fully-supported setup. See [Running Multiple Projects](https://laradock.io/docs/multiple-projects) for how to keep several Laradock instances (or several sites in one instance) side by side without them clashing.

## Two versions at once, in one stack

Sometimes a **single** setup genuinely needs two versions running at the same time, a legacy app on PHP 7.4 next to a new project on PHP 8.3, or one project whose services (microservices) target different versions. For that, use the opt-in `docker-compose.multi-php.yml` overlay. It adds `php-fpm-83` and `workspace-83` alongside your primary services and **changes nothing** about the default single-version setup: if you never load it, it doesn't exist.

```bash
docker compose -f docker-compose.yml -f docker-compose.multi-php.yml up -d \
    nginx php-fpm workspace php-fpm-83 workspace-83
```

To avoid repeating the `-f` flags, set this once in your `.env` so every `docker compose` command (and the Laradock CLI) picks up both files:

```env
COMPOSE_FILE=docker-compose.yml:docker-compose.multi-php.yml
```

### Route each site to a version

Point a site at a specific version by editing its Nginx config (`nginx/sites/your-site.conf`):

```nginx
fastcgi_pass php-fpm-83:9000;
```

Sites left on the default `php-upstream` keep using your primary `php-fpm`. On Apache2, set the matching `SetHandler "proxy:fcgi://php-fpm-83:9000"` in that site's vhost.

### Run CLI on the alternate version

```bash
docker compose -f docker-compose.yml -f docker-compose.multi-php.yml exec workspace-83 bash
```

You now have `composer`, `artisan`, and `php` on 8.3 in `workspace-83`, and your primary version in `workspace`.

### Add a third (or fourth) version

The alternate services inherit the real `php-fpm` / `workspace` build args via Compose [`extends`](https://docs.docker.com/reference/compose-file/services/#extends), so there is **no duplicated config to maintain**, the only thing overridden is the PHP version. To add another version, copy a pair of blocks in `multi-php/compose.yml` and change `83` to the version you want in both the service name and `LARADOCK_PHP_VERSION`:

```yaml
    php-fpm-74:
      extends:
        file: ../php-fpm/compose.yml
        service: php-fpm
      build:
        context: ../php-fpm
        args:
          - LARADOCK_PHP_VERSION=7.4
```

Queue workers and Horizon on an alternate version follow the identical pattern, extend `php-worker` / `laravel-horizon` the same way.

:::tip
Each extra version is a full PHP image. Two or three side by side is fine; if you find yourself wanting many, that's a sign the versions belong to separate projects, use one Laradock per project instead (see above).
:::
