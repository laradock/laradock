# Run Hyperf on Docker

Source: https://laradock.io/docs/hyperf-on-docker

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

## What is Hyperf?

[Hyperf](https://hyperf.wiki) is a coroutine-based PHP microservice framework built on [Swoole](https://www.swoole.co.uk), focused on high concurrency for APIs and middleware. Unlike most PHP frameworks, Hyperf does not run behind PHP-FPM in the usual request/response model: it boots as a long-lived process (`php bin/hyperf.php start`) that listens on its own port and handles requests inside Swoole coroutines, closer to how a Node.js or Go server behaves. A Hyperf app needs the Swoole PHP extension, and typically MySQL and Redis for storage and cache.

## Why run Hyperf in Docker?

Docker packages each of those pieces (the Swoole/PHP runtime, MySQL, Redis, ...) into isolated containers that run the same on every machine. Instead of compiling the Swoole extension and installing MySQL onto your laptop, where versions collide between projects and "works on my machine" starts, you run disposable containers that mirror production and vanish cleanly when you delete them. One project can run PHP 8.2 with Swoole while another traditional PHP-FPM project runs PHP 7.4, on the same computer, with nothing installed globally.

The catch: wiring those containers together yourself (base images, the Swoole extension build, networking, permissions) is a week of fiddly Docker work. That is exactly what Laradock removes.

## Why Laradock is the best fit for Hyperf

Hyperf ships its own official Docker images (`hyperf/hyperf`) and an official skeleton meant to be run in containers, so, unlike most PHP projects, it does not strictly need Laradock. It is still the best fit, and here is why:

- **You are never locked into one ecosystem.** Laradock is framework-agnostic. The day you add a Laravel API, a WordPress site, or a plain PHP script beside your Hyperf service, it runs in the same environment with the same commands. A Hyperf-only image cannot do that.
- **Far more flexibility.** 100+ ready services and any PHP version from 5.6 to 8.5, versus the short curated list a framework-specific image gives you.
- **Nothing is hidden and you own everything.** No generated files, no magic, no wrapper binary between you and Docker. Every Dockerfile and compose file is right there for you to read and edit.
- **Nothing new to learn.** What you use is plain `docker compose`, knowledge that transfers straight to production and to every other project. Our [CLI](https://laradock.io/docs/cli) is an optional nicety, never a requirement.

For Hyperf specifically, Laradock's `workspace` container has a `WORKSPACE_INSTALL_SWOOLE` flag that builds the Swoole extension for you, plus MySQL and Redis already wired and Composer/git installed, so the coroutine server runs from the same shell you use for everything else.

## Run Hyperf on Docker with Laradock

### 1. Add Laradock to your project

```bash
cd my-hyperf-app
git clone https://github.com/laradock/laradock.git
cd laradock
```

(No Hyperf app yet? Clone Laradock first, then [create one from the workspace container](#4-install-and-run-your-app).)

### 2. Enable Swoole and start the services your app needs

Hyperf does not use NGINX or PHP-FPM; it needs the `workspace` container with the Swoole extension, plus MySQL and Redis. Add this line to Laradock's `.env`:

```env
WORKSPACE_INSTALL_SWOOLE=true
```

Then build and start:

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

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock start mysql redis workspace
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
cp .env.example .env
docker compose up -d mysql redis workspace
```

</TabItem>
</Tabs>

The full catalog of services is [here](https://laradock.io/docs/Intro#supported-services).

### 3. Point Hyperf at the containers

Hyperf reads its database config from `config/autoload/databases.php`, which pulls from `.env`. In your app's `.env`, use the service names as hostnames:

```env
DB_HOST=mysql
DB_DATABASE=default
DB_USERNAME=default
DB_PASSWORD=secret
REDIS_HOST=redis
```

The default database, user and password live in `mysql/defaults.env`; override any of them by adding the line to Laradock's `.env` (it always wins).

### 4. Install and run your app

Enter the `workspace` container, where Composer, git and the Swoole extension live:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock workspace
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose exec workspace bash
```

</TabItem>
</Tabs>

Then, inside that shell:

```bash
composer create-project hyperf/hyperf-skeleton .   # only if you have no Hyperf files yet
php bin/hyperf.php start
```

This starts Hyperf's own HTTP server on port 9501 inside the container. Laradock does not map that port to your host by default; since `workspace/compose.yml` is a plain file you own, add one line to its `ports:` section:

```yaml
- "9501:9501"
```

Rebuild is not needed for a compose change, just recreate the container (`./laradock start workspace`, equivalent to `docker compose up -d workspace`), then open [http://localhost:9501](http://localhost:9501). That is a full Hyperf app running on Docker.

## Change the PHP version anytime

This is where a native install hurts and Laradock shines. Set the version in Laradock's `.env` and rebuild:

```env
PHP_VERSION=8.2
```

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

Hyperf requires PHP 8.1 or newer (recent 3.x releases require 8.2), so pick a version at or above that when you rebuild; the Swoole extension is rebuilt for the new version automatically since `WORKSPACE_INSTALL_SWOOLE` stays set.

## Take your app live

When your service is ready, the same Laradock stack becomes your deployment. You build one hardened image of your app and ship it to the host of your choice:

```bash
./laradock ship
```

Then pick a target and follow its short guide, a single server, a managed platform, or Kubernetes: **[Deploy to Production](https://laradock.io/docs/production)** lists every provider (Fly.io, Render, Railway, DigitalOcean, AWS, Google Cloud, Azure, Kamal, Kubernetes) with a ready config file for each. For a leaner runtime you can base the production image on Hyperf's own official `hyperf/hyperf` image; a Docker image runs the same everywhere.

## Frequently Asked Questions

### Do I need to install PHP, Composer or Swoole to run Hyperf with Laradock?

No. Everything lives inside the `workspace` container. Set `WORKSPACE_INSTALL_SWOOLE=true`, rebuild, and Composer, git and the Swoole extension are all there; you never install PHP on your host.

### Which services should I start for a typical Hyperf app?

`mysql redis workspace` (with Swoole enabled) covers most apps: database, cache/queue, and the coroutine server itself. There is no separate web server container, Hyperf's own server plays that role.

### Can I run multiple Hyperf apps on different PHP versions?

Yes. Give each its own Laradock with a unique `COMPOSE_PROJECT_NAME` and `DATA_PATH_HOST`, set a different `PHP_VERSION` in each, and they run independently on the same machine.

### Does this work the same on macOS, Windows and Linux?

Yes. Laradock runs anywhere Docker runs. On macOS/Windows, file-sync speed depends on Docker Desktop (VirtioFS helps a lot); it is a Docker Desktop trait, not specific to Laradock.

### Is this the same Docker setup I would use in production?

The `workspace` container runs the exact same `php bin/hyperf.php start` process you would run in production; for a hardened production image you would typically build a slimmer container from Hyperf's own official `hyperf/hyperf` base rather than the full dev-oriented `workspace`. See [Prepare Laradock for Production](https://laradock.io/docs/production#prepare-laradock-for-production) for the general hardening steps.

---

Comparing environments? See the full **[Laradock vs Others](https://laradock.io/docs/laradock-alternatives)** breakdown. Ready to start? **[Getting Started](https://laradock.io/docs/getting-started)** takes about five minutes.
