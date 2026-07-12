# Run Mautic on Docker

Source: https://laradock.io/docs/mautic-on-docker

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

## What is Mautic?

[Mautic](https://www.mautic.org) is an open source marketing automation platform for email campaigns, landing pages, forms, lead scoring and segmentation, built on the Symfony framework. A Mautic instance is a PHP application backed by MySQL or MariaDB and served through a web server. What makes it different from a plain CRUD app is that most of its real work happens outside the web request: segment updates, campaign triggers and email sends are console commands that must run on a schedule (cron), and from Mautic 5 outbound email is processed through a Symfony Messenger queue. So the two things Mautic truly needs to function are a database and a scheduler, and that is exactly what the stack below sets up.

## Why run Mautic in Docker?

Docker packages each of those pieces (NGINX, PHP-FPM, MySQL) into isolated containers that run the same on every machine. Instead of installing PHP and MySQL onto your laptop, where versions collide between projects and "works on my machine" starts, you run disposable containers that mirror production and vanish cleanly when you delete them. One Mautic instance can run on a specific PHP version while another project runs a different one, on the same computer, with nothing installed globally.

The catch: wiring those containers together yourself (base images, PHP extensions, networking, permissions, cron) is a week of fiddly Docker work. That is exactly what Laradock removes.

## Why Laradock is the best fit for Mautic

Mautic has no official Docker image maintained by the Mautic project itself; the closest options are community-maintained images you still have to wire and trust. Here is why Laradock is the best fit:

- **You are never locked into one ecosystem.** Laradock is framework-agnostic. Run Mautic today, add a Laravel API or a WordPress marketing site beside it tomorrow, all in the same environment with the same commands.
- **Far more flexibility.** 100+ ready services and any PHP version from 5.6 to 8.5, so Mautic gets exactly the runtime and extensions its current release needs, plus RabbitMQ, a mail catcher and a worker container one command away when a campaign send grows.
- **Nothing is hidden and you own everything.** No generated files, no magic, no wrapper binary between you and Docker. Every Dockerfile and compose file is right there for you to read and edit, which matters when you need to tune PHP's `max_execution_time` or memory limit for a large campaign send.
- **Nothing new to learn.** What you use is plain `docker compose`, knowledge that transfers straight to production and to every other project. Our [CLI](https://laradock.io/docs/cli) is an optional nicety, never a requirement.

Concretely, for Mautic it gives you a production-style NGINX + PHP-FPM stack, MySQL/MariaDB already wired, and a `workspace` container with Composer, Node, git and the Symfony console, from which you run the installer and the cron commands campaign processing depends on. The scheduler and the email queue still need wiring, and the sections below show exactly how.

## Run Mautic on Docker with Laradock

### 1. Add Laradock to your project

```bash
cd my-mautic-instance
git clone https://github.com/laradock/laradock.git
cd laradock
```

(No Mautic codebase yet? Clone Laradock first, then pull one down from the workspace container in the next steps.)

### 2. Pick the services your instance needs

Mautic needs exactly two things to boot: a **web server** and a **database**. The web server pulls in PHP-FPM automatically, so this is the whole required stack:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock start nginx mysql workspace
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
cp .env.example .env
docker compose up -d nginx mysql workspace
```

</TabItem>
</Tabs>

Prefer MariaDB instead? Swap the name: `./laradock start nginx mariadb workspace` (or `docker compose up -d nginx mariadb workspace`). The full catalog is [here](https://laradock.io/docs/Intro#supported-services).

Prefer to be asked? The optional [CLI](https://laradock.io/docs/cli) walks you through the choices: `./laradock setup`, then `./laradock start`. It prints every real command it runs.

> **What about the queue and cron?** They do not need extra containers. Cron runs inside the `workspace` container you already started, and Mautic's email queue defaults to the database, so `nginx mysql workspace` is enough to run everything. Add [RabbitMQ](#move-the-email-queue-to-rabbitmq-optional) or a [mail catcher](#catch-outgoing-email-locally-optional) only when you specifically want them.

### 3. Point Mautic at the containers

Mautic's CLI installer takes the database connection as flags and writes them into its configuration file (`config/local.php` on Mautic 5, `app/config/local.php` on Mautic 4 and earlier). Use the service name as the host:

```bash
php bin/console mautic:install --force \
  https://localhost \
  --db_driver=pdo_mysql --db_host=mysql --db_port=3306 --db_name=default \
  --db_user=default --db_password=secret \
  --admin_email=you@example.com --admin_password=secret
```

The default database, user and password live in Laradock's `mysql/defaults.env`; override any of them by adding the line to Laradock's `.env` (it always wins).

### 4. Install and run your instance

Enter the `workspace` container, where Composer, Node and the Symfony console live, place or clone the Mautic codebase, then run the installer:

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

Once inside:

```bash
composer install
php bin/console mautic:install --force https://localhost \
  --db_driver=pdo_mysql --db_host=mysql --db_port=3306 --db_name=default \
  --db_user=default --db_password=secret \
  --admin_email=you@example.com --admin_password=secret
```

Then open [http://localhost](http://localhost) and log in with the admin email and password you passed above. That is a full Mautic instance running on Docker.

Before Mautic actually processes anything, wire up the scheduler in the next section: without it, segments never refresh and campaigns never fire.

## Keep Mautic running: cron and the scheduler

This is not optional for a working Mautic. Segment membership, campaign steps and scheduled sends are all console commands; nothing happens just because someone visits the site. Run these from inside the `workspace` container (paths are relative to your Mautic root):

```cron
*/15 * * * * php bin/console mautic:segments:update
*/15 * * * * php bin/console mautic:campaigns:update
*/15 * * * * php bin/console mautic:campaigns:trigger
*/15 * * * * php bin/console mautic:messages:send
```

Stagger them by a minute or two rather than firing all at once. On Mautic 5 the old `mautic:emails:send` command is gone: outbound email now flows through the queue described in the next section.

You have two ways to schedule them with Laradock:

1. **Inside the workspace container.** Enable the built-in cron by setting `WORKSPACE_INSTALL_CRON=true` in Laradock's `.env`, rebuild the workspace, then add the lines above to its crontab (`crontab -e` from inside the container).
2. **A dedicated scheduler service.** Start Laradock's `cron` container and put the same entries there, keeping scheduling out of the shell container.

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock rebuild workspace   # after setting WORKSPACE_INSTALL_CRON=true
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose build workspace   # after setting WORKSPACE_INSTALL_CRON=true
```

</TabItem>
</Tabs>

## Process outgoing email (the queue)

From Mautic 5, email is sent through a Symfony Messenger queue rather than a direct cron command. Out of the box Mautic uses the **database (Doctrine) transport**, so no extra container is required: the messages sit in a `messenger_messages` table and a consumer drains them. Turn on queued sending in **Settings > Configuration > Email Settings** (set the send method to *queue* / spool), then run the consumer on cron from the `workspace` container:

```cron
* * * * * php bin/console messenger:consume email --time-limit=60
```

Always pass at least one of `--time-limit`, `--memory-limit` or `--limit` so the consumer exits cleanly instead of running forever. For heavier sending, keep a long-lived worker running instead of a per-minute cron (see [Add a background worker](#add-a-background-worker-optional) below).

## Move the email queue to RabbitMQ (optional)

The database transport is fine for modest volumes. For high-throughput sending you can point the Messenger queue at RabbitMQ instead. Start the container:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock start rabbitmq
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose up -d rabbitmq
```

</TabItem>
</Tabs>

Then set the queue protocol in Mautic's `config/local.php`, using the service name as the host:

```php
'queue_protocol'  => 'rabbitmq',
'rabbitmq_host'   => 'rabbitmq',
'rabbitmq_port'   => 5672,
'rabbitmq_vhost'  => '/',
'rabbitmq_user'   => 'guest',
'rabbitmq_password' => 'guest',
```

Run the same `messenger:consume email` command as before; it now pulls from RabbitMQ. The RabbitMQ credentials and vhost live in Laradock's `.env` (`RABBITMQ_DEFAULT_USER`, `RABBITMQ_DEFAULT_PASS`, `RABBITMQ_DEFAULT_VHOST`); match them here. Without this wiring the RabbitMQ container just sits idle, which is why the required stack leaves it out.

## Add a background worker (optional)

Running `messenger:consume` from cron every minute is simple but bursty. For steady, high-volume sends, run a long-lived consumer instead. Laradock ships a `php-worker` container built exactly for this. Point its Supervisor config at the Mautic console command, for example:

```ini
[program:mautic-email]
command=php /var/www/my-mautic-instance/bin/console messenger:consume email --time-limit=3600 --memory-limit=256M
autorestart=true
numprocs=1
```

Then start it:

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

Supervisor restarts the consumer whenever the time or memory limit trips it, so email keeps draining without a per-minute cron. This is the same pattern you would use in production.

## Catch outgoing email locally (optional)

You do not want test campaigns hitting real inboxes. Start a mail catcher and point Mautic at it, and every message lands in a local web UI instead of the internet. Laradock includes several; `mailpit` is a good default:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock start mailpit
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose up -d mailpit
```

</TabItem>
</Tabs>

Then set the mailer in **Settings > Configuration > Email Settings**, or directly in `config/local.php`, using the service name as the host:

```php
'mailer_dsn' => 'smtp://mailpit:1025',
```

Open the catcher's web UI (Mailpit defaults to [http://localhost:8025](http://localhost:8025)) to read anything Mautic sends. Swap in your real SMTP or API transport when you go live.

## Build and refresh Mautic assets

Mautic ships compiled CSS and JS, and from Mautic 5 building them from source requires Node, which the `workspace` container already has. After changing themes, installing a plugin, or pulling a new release, regenerate the combined asset files from inside the workspace:

```bash
php bin/console mautic:assets:generate
php bin/console cache:clear
```

If a plugin ships its own front-end sources, run `npm install && npm run build` in that plugin's directory first; you never install Node on your host.

## Import an existing Mautic database

Moving an existing instance onto Laradock is a straight MySQL restore. Copy your dump into the `workspace` container (or place it in the mounted project folder), then load it into the `mysql` service:

```bash
mysql -h mysql -u default -psecret default < mautic-backup.sql
```

Copy the old `config/local.php` alongside your codebase but fix the connection lines to point at the containers (`db_host` = `mysql`), run `composer install`, then `php bin/console cache:clear`. Your contacts, campaigns and segments come across intact. To bulk-load contacts from a CSV instead of a full database, use `php bin/console mautic:import`.

## First admin login and CLI tooling

The `--admin_email` and `--admin_password` you passed to `mautic:install` are your first login at [http://localhost](http://localhost); change the password from the profile menu once you are in. Everything else is driven from the console inside `workspace`:

```bash
php bin/console cache:clear              # after config or plugin changes
php bin/console mautic:update:find       # check for a new Mautic release
php bin/console mautic:update:apply      # apply it, then run migrations
php bin/console doctrine:migrations:migrate
php bin/console mautic:reports:scheduler # send scheduled reports
```

Because the console lives in the container, you never need PHP or Composer on your host to run any of it.

## Change the PHP version anytime

This is where a native install hurts and Laradock shines. Set the version in Laradock's `.env` and rebuild:

```env
PHP_VERSION=8.3
```

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock rebuild php-fpm workspace
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose build php-fpm workspace
```

</TabItem>
</Tabs>

Current Mautic releases target PHP 8.1 or newer; Laradock covers anything from PHP 5.6 to 8.5, so the same tool runs an older Mautic instance you have not upgraded yet and a brand-new one side by side, each isolated, none of it installed on your machine.

## Take your Mautic instance live

When your instance is ready, the same Laradock stack becomes your deployment. You build one hardened image of your app and ship it to the host of your choice:

```bash
./laradock ship
```

Then pick a target and follow its short guide, a single server, a managed platform, or Kubernetes: **[Deploy to Production](https://laradock.io/docs/production)** lists every provider (Fly.io, Render, Railway, DigitalOcean, AWS, Google Cloud, Azure, Kamal, Kubernetes) with a ready config file for each. There is no per-provider magic to learn; a Docker image runs the same everywhere. Remember to carry the cron entries and a running email consumer into production too, since Mautic does nothing on a schedule without them.

## Frequently Asked Questions

### Do I need to install PHP or Composer to run Mautic with Laradock?

No. Everything lives inside the containers. Composer, Node, git and the Symfony console are all in the `workspace` container; you never install PHP on your host.

### Which services should I start for a typical Mautic instance?

`nginx mysql workspace` covers it: web server, database, and a shell to run the installer, updates, cron and the email consumer from. Swap `mysql` for `mariadb` if you prefer. The email queue uses the database by default, so no extra service is required until you choose to [add RabbitMQ](#move-the-email-queue-to-rabbitmq-optional) or a [mail catcher](#catch-outgoing-email-locally-optional).

### Does Mautic need cron to actually run campaigns?

Yes, and that is true regardless of how it is hosted. Segment updates, campaign triggers and message sends all run through console commands, so schedule them (via cron in the `workspace` container or Laradock's `cron` service) as shown in [Keep Mautic running](#keep-mautic-running-cron-and-the-scheduler). Nothing fires just because someone visits the site.

### How does email sending work in Mautic 5 on Docker?

Mautic 5 queues email through Symfony Messenger and drains it with `messenger:consume email`, run either on a per-minute cron or as a long-lived [background worker](#add-a-background-worker-optional). The default queue is the database, so it works on the base `nginx mysql workspace` stack with no extra service.

### Can I run multiple Mautic instances on different PHP versions?

Yes. Give each its own Laradock with a unique `COMPOSE_PROJECT_NAME` and `DATA_PATH_HOST`, set a different `PHP_VERSION` in each, and they run independently on the same machine.

### Is this the same Docker setup I would use in production?

The containers are production-style (real NGINX + PHP-FPM), so it is far closer to production than a native install. Mautic is heavier than a typical CRUD app, budget real memory and CPU for campaign processing, and carry the cron entries and email consumer over. See [Prepare Laradock for Production](https://laradock.io/docs/production#prepare-laradock-for-production) for the hardening steps.

---

Comparing environments? See the full **[Laradock vs Others](https://laradock.io/docs/laradock-alternatives)** breakdown. Ready to start? **[Getting Started](https://laradock.io/docs/getting-started)** takes about five minutes.
