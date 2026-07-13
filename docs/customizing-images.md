# Customizing Images

Source: https://laradock.io/docs/customizing-images

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

Every container is built from a plain, readable `Dockerfile` in that service's folder (`php-fpm/Dockerfile`, `workspace/Dockerfile`, and so on), and you own all of them. So you can change what goes inside any image. There are three levels, from "no file editing" to "edit the Dockerfile"; pick the lowest one that does the job.

## Level 1: toggle a bundled feature from `.env`

Most of what you'd want is already in the image, behind an off switch. Each container's `defaults.env` lists its build flags; flip one in your `.env` and rebuild. Nothing about the mechanism is hidden: that flag is passed into the Dockerfile as a **build argument** (`PHP_FPM_INSTALL_GMP` in your `.env` becomes the `INSTALL_GMP` arg in `php-fpm/compose.yml`), and the Dockerfile installs the feature when it's `true`.

```env
PHP_FPM_INSTALL_GMP=true
```

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock rebuild php-fpm
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose build php-fpm
```

</TabItem>
</Tabs>

## Level 2: install a PHP extension

PHP extensions are just Level-1 flags, one per extension, in `php-fpm/defaults.env`, `workspace/defaults.env`, and `php-worker/defaults.env`. Set the flag in your `.env` and rebuild that container. The [PHP-FPM page](https://laradock.io/docs/services/php-fpm#install-php-extensions) has the full list and the per-extension notes (some need extra settings).

## Level 3: add your own system package

For something Laradock has no flag for, edit that service's `Dockerfile` directly. To add a system package to the Workspace, add an `apt-get install` line to `workspace/Dockerfile`:

```dockerfile
RUN apt-get update && apt-get install -yqq \
    your-package \
    && apt-get clean
```

Then rebuild the container so the change is baked in:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock rebuild workspace
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose build workspace
```

</TabItem>
</Tabs>

:::tip
A `Dockerfile` change only takes effect after a rebuild. If a change seems stuck (a cached layer), force a clean build with `./laradock rebuild --no-cache workspace` (or `docker compose build --no-cache workspace`).
:::

## Run more than one PHP version

Changing `PHP_VERSION` switches the version for the whole stack. To run **two versions at the same time** (for example a legacy app on PHP 7.4 next to a new project on PHP 8.3), Laradock ships an opt-in overlay, see [Multiple PHP Versions](https://laradock.io/docs/multiple-php-versions).

## Keep your changes upstream-safe

Editing files inside Laradock means your changes live in the Laradock repo, not your app. To keep them under version control while still pulling updates, track Laradock as your own fork, see [Track your own changes](https://laradock.io/docs/maintenance#track-your-own-changes).
