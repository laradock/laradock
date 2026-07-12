# Run Pydio 8 on Docker

Source: https://laradock.io/docs/pydio-on-docker

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

## What is Pydio?

[Pydio](https://pydio.com) started life as AjaXplorer in 2007 and became a self-hosted file sync and share platform. This page covers **Pydio 8**, the legacy PHP edition (the LAMP-stack line that grew out of AjaXplorer), which is a PHP application backed by MySQL, PostgreSQL or SQLite, served through a web server. Note the nuance up front: the actively developed edition today is **Pydio Cells**, a full rewrite in Go released in 2018 because the team hit the limits of what PHP could handle for large file collaboration. Pydio 8 itself reached end of life in December 2019 and receives no further updates. This setup is meant for maintaining an existing Pydio 8 install, not for starting a new deployment; for a new project, Pydio Cells (outside PHP, and outside the scope of Laradock) is the maintained choice.

## Why run Pydio 8 in Docker?

Docker packages the pieces an old Pydio 8 install still needs (NGINX, PHP-FPM, MySQL) into isolated containers that run the same on every machine. Instead of installing an aging PHP version onto your laptop or a real server, where it collides with every other project you run, you run a disposable container that mirrors the original environment and vanishes cleanly when you delete it. That matters especially here, since Pydio 8 needs an old, unsupported PHP branch that you do not want anywhere near your host.

The catch: wiring those containers together yourself (base images, PHP extensions, networking, permissions) is a week of fiddly Docker work. That is exactly what Laradock removes.

## Why Laradock is the best fit for Pydio 8

Pydio 8 has no official Docker image maintained by the Pydio team (the project's Docker efforts moved to Cells), so a ready-made, no-lock-in environment matters even more for keeping an old instance alive. Here is why Laradock is the best fit:

- **You are never locked into one ecosystem.** Laradock is framework-agnostic. Keep your legacy Pydio 8 install running while a Laravel or WordPress project runs beside it, all in the same environment with the same commands.
- **Far more flexibility.** 100+ ready services and any PHP version from 5.6 to 8.5, so you can pin the old PHP branch Pydio 8 needs without touching anything else on the machine.
- **Nothing is hidden and you own everything.** No generated files, no magic, no wrapper binary between you and Docker. Every Dockerfile and compose file is right there for you to read and edit, which matters when a package this old needs a manual patch.
- **Nothing new to learn.** What you use is plain `docker compose`, knowledge that transfers straight to production and to every other project. Our [CLI](https://laradock.io/docs/cli) is an optional nicety, never a requirement.

Concretely, for Pydio 8 it gives you an NGINX + PHP-FPM stack pinned to an older PHP branch, MySQL/PostgreSQL already wired, and a `workspace` container to run its web-based setup wizard from.

## Run Pydio 8 on Docker with Laradock

### 1. Add Laradock to your project

```bash
cd my-pydio-instance
git clone https://github.com/laradock/laradock.git
cd laradock
```

(No Pydio 8 codebase yet? Clone Laradock first, then place your existing install into the workspace container in the next steps. If you are starting fresh, use Pydio Cells instead, it is outside PHP and outside the scope of Laradock.)

### 2. Pick the services your instance needs

Pydio 8 needs a web server and a database. The web server pulls in PHP-FPM automatically:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI" default>

```bash
./laradock start nginx mysql workspace
```

</TabItem>
<TabItem value="compose" label="Docker Compose">

```bash
cp .env.example .env
docker compose up -d nginx mysql workspace
```

</TabItem>
</Tabs>

Prefer PostgreSQL instead? Swap the name: `./laradock start nginx postgres workspace` (or `docker compose up -d nginx postgres workspace`). The full catalog is [here](https://laradock.io/docs/Intro#supported-services).

Prefer to be asked? The optional [CLI](https://laradock.io/docs/cli) walks you through the choices: `./laradock setup`, then `./laradock start`. It prints every real command it runs.

### 3. Point Pydio 8 at the containers

Pydio 8's own setup wizard writes its database connection into `data/plugins/conf.serial.php` (or the equivalent config plugin) the first time you run it in a browser. Point it at the container by hostname when the wizard asks:

```text
Database host: mysql
Database name: default
Database user: default
Database password: secret
```

The default database, user and password live in Laradock's `mysql/defaults.env`; override any of them by adding the line to Laradock's `.env` (it always wins).

### 4. Install and run your instance

Enter the `workspace` container, place your existing Pydio 8 codebase, and finish setup from the browser:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI" default>

```bash
./laradock workspace
```

</TabItem>
<TabItem value="compose" label="Docker Compose">

```bash
docker compose exec workspace bash
```

</TabItem>
</Tabs>

Then, inside the container:

```bash
# place your Pydio 8 files into the current directory
```

Then open [http://localhost](http://localhost) and complete the web-based install wizard using the database settings above.

## Change the PHP version anytime

This is where a native install hurts and Laradock shines, particularly for a project pinned to an old runtime. Set the version in Laradock's `.env` and rebuild:

```env
PHP_VERSION=7.2
```

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI" default>

```bash
./laradock rebuild php-fpm workspace
```

</TabItem>
<TabItem value="compose" label="Docker Compose">

```bash
docker compose build php-fpm workspace
```

</TabItem>
</Tabs>

Pydio 8 was built for an older PHP branch (its support window ended before PHP 8 was common); Laradock covers anything from PHP 5.6 to 8.5, so you can keep the exact old runtime Pydio 8 needs isolated from every other project on the machine.

## Take your instance live

When your Pydio 8 instance is ready, the same Laradock stack becomes your deployment. You build one hardened image and ship it to the host of your choice:

```bash
./laradock ship
```

Then pick a target and follow its short guide, a single server, a managed platform, or Kubernetes: **[Deploy to Production](https://laradock.io/docs/production)** lists every provider (Fly.io, Render, Railway, DigitalOcean, AWS, Google Cloud, Azure, Kamal, Kubernetes) with a ready config file for each. There is no per-provider magic to learn; a Docker image runs the same everywhere. Keep in mind that Pydio 8 is unmaintained, so lock it behind your own network controls and treat any public exposure with caution.

## Frequently Asked Questions

### Do I need to install an old PHP version on my machine to run Pydio 8?

No. Everything lives inside the containers. You pin the old PHP branch in Laradock's `.env` and it never touches your host.

### Which services should I start for a typical Pydio 8 instance?

`nginx mysql workspace` covers it: web server, database, and a shell. Swap `mysql` for `postgres` if you prefer.

### Should I use Pydio 8 for a new project?

No. Pydio 8 reached end of life in December 2019 and is unmaintained. New projects should look at Pydio Cells, which is written in Go and outside the scope of this PHP-focused setup.

### Can I run Pydio 8 alongside modern PHP projects on the same machine?

Yes. Give each its own Laradock with a unique `COMPOSE_PROJECT_NAME` and `DATA_PATH_HOST`, set a different `PHP_VERSION` in each, and they run independently on the same machine.

### Is this the same Docker setup I would use in production?

The containers are production-style (real NGINX + PHP-FPM), so it is closer to production than a native install, but keep in mind Pydio 8 itself is unmaintained and carries unpatched security risk regardless of how it is hosted. See [Prepare Laradock for Production](https://laradock.io/docs/production#prepare-laradock-for-production) for the hardening steps that still apply.

---

Comparing environments? See the full **[Laradock vs Others](https://laradock.io/docs/laradock-alternatives)** breakdown. Ready to start? **[Getting Started](https://laradock.io/docs/getting-started)** takes about five minutes.
