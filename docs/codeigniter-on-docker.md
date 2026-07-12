# Run CodeIgniter on Docker

Source: https://laradock.io/docs/codeigniter-on-docker

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

## What is CodeIgniter?

[CodeIgniter](https://codeigniter.com) is a lightweight PHP framework known for a small footprint and a gentle learning curve compared to heavier frameworks. It ships routing, an active-record-style query builder, database migrations, and a `spark` command-line tool, all around a straightforward MVC structure. A CodeIgniter app needs just a web server, a PHP runtime, and a database to run; MySQL and MariaDB are the most common choices, with PostgreSQL and SQLite also supported out of the box. Extras like a Redis cache, a background queue, or a task scheduler are optional and come from separate official packages when you want them.

## Why run CodeIgniter in Docker?

Docker packages each of those pieces (NGINX, PHP-FPM, MySQL) into isolated containers that run the same on every machine. Instead of installing PHP and MySQL onto your laptop, where versions collide between projects and "works on my machine" starts, you run disposable containers that mirror production and vanish cleanly when you delete them. One project can run PHP 8.3 while a legacy CodeIgniter 3 app runs 7.4, on the same computer, with nothing installed globally.

The catch: wiring those containers together yourself (base images, PHP extensions, networking, permissions) is a week of fiddly Docker work. That is exactly what Laradock removes.

## Why Laradock is the best fit for CodeIgniter

CodeIgniter has no official Docker tool or first-party runtime of its own, so a ready-made, no-lock-in environment matters even more. Here is why Laradock is the best fit:

- **You are never locked into one ecosystem.** Laradock is framework-agnostic. Run CodeIgniter today, add a Laravel API, a WordPress site, or a plain PHP script beside it tomorrow, all in the same environment with the same commands.
- **Far more flexibility.** 100+ ready services and any PHP version from 5.6 to 8.5, so a legacy CodeIgniter 3 project and a modern CodeIgniter 4 app each get exactly the runtime they need.
- **Nothing is hidden and you own everything.** No generated files, no magic, no wrapper binary between you and Docker. Every Dockerfile and compose file is right there for you to read and edit.
- **Nothing new to learn.** What you use is plain `docker compose`, knowledge that transfers straight to production. Our [CLI](https://laradock.io/docs/cli) is an optional nicety, never a requirement.

Concretely, for CodeIgniter it gives you a production-style NGINX + PHP-FPM stack, MySQL/MariaDB ready to connect, a `workspace` container with Composer, git and the `spark` CLI at hand, and any PHP version behind a single line of config. When you later want a Redis cache, a background queue, or a mail catcher, each is one command away.

## Run CodeIgniter on Docker with Laradock

### 1. Add Laradock to your project

```bash
cd my-codeigniter-app
git clone https://github.com/laradock/laradock.git
cd laradock
```

(No CodeIgniter app yet? Clone Laradock first, then create one from the workspace container in the next steps.)

### 2. Pick the services your app needs

CodeIgniter needs exactly two things: a **web server** and a **database**. The web server pulls in PHP-FPM automatically, so this is the whole required stack:

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

Prefer MariaDB or PostgreSQL? Swap the name: `./laradock start nginx mariadb workspace` (or `docker compose up -d nginx mariadb workspace`). The full catalog is [here](https://laradock.io/docs/Intro#supported-services).

Prefer to be asked? The optional [CLI](https://laradock.io/docs/cli) detects CodeIgniter and pre-selects nginx/mysql for you: `./laradock setup`, then `./laradock start`. It prints every real command it runs.

> **Do I need Redis?** Not to get running. CodeIgniter uses file-based caching by default and does nothing with Redis on its own, a fresh app runs perfectly on `nginx mysql workspace`. Add Redis only when you want a faster cache, a queue, or sessions in memory. See [Add Redis caching](#add-redis-caching-optional) below when you actually want it.

### 3. Point CodeIgniter at the containers

CodeIgniter 4 reads database settings from `.env`, but each key must already exist as a property in `app/Config/Database.php` before your `.env` value can override it. Set:

```env
database.default.hostname = mysql
database.default.database = default
database.default.username = default
database.default.password = secret
database.default.DBDriver = MySQLi
```

The default database, user and password live in Laradock's `mysql/defaults.env`; override any of them by adding the line to Laradock's `.env` (it always wins).

### 4. Install and run your app

Enter the `workspace` container, where Composer, git and `spark` live, and set the app up:

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

Once inside, run:

```bash
composer create-project codeigniter4/appstarter .   # only if you have no CodeIgniter app yet
php spark migrate                                     # run your database migrations
```

Then open [http://localhost](http://localhost). That is a full CodeIgniter app running on Docker.

### Point the web server at the public folder

CodeIgniter is plain PHP, so it needs no special flag. Point your web server's site config at the project's `public` folder (CodeIgniter 4) or its root folder (CodeIgniter 3), exactly like the general PHP setup in [Getting Started](https://laradock.io/docs/getting-started). NGINX in Laradock already serves `/var/www/public` by default, which is where CodeIgniter 4's front controller lives.

## Work with spark, migrations and seeders

`spark` is CodeIgniter's command-line tool, and it lives in the `workspace` container. Enter the shell once, then run everything from there:

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

From inside, the day-to-day commands all work as documented:

```bash
php spark list                    # see every available command
php spark migrate                 # apply pending database migrations
php spark migrate:rollback        # undo the last batch
php spark db:seed DatabaseSeeder  # seed data
php spark make:controller Blog    # scaffold a controller (also make:model, make:migration, ...)
```

You do not need `php spark serve`: NGINX + PHP-FPM already serve the app at [http://localhost](http://localhost), which is closer to production than the built-in dev server.

## Import an existing database

Moving an app you already have? Start the stack, then load your SQL dump into the `mysql` container. From the `workspace` shell the database is reachable at host `mysql`:

```bash
mysql -h mysql -u default -psecret default < /var/www/dump.sql
```

Your project folder is mounted at `/var/www` inside every container, so a `dump.sql` sitting next to your code is already there. Prefer a GUI? Start [phpMyAdmin](https://laradock.io/docs/phpmyadmin-on-docker) with `./laradock start phpmyadmin` and import through the browser. Point `database.default` at `mysql` as shown above and CodeIgniter picks the data up immediately.

## Add Redis caching (optional)

CodeIgniter caches to the filesystem by default, which is fine to start. On a busier app, moving the cache into Redis keeps it in memory and out of your disk. Wiring it up is three steps:

1. Start the Redis container alongside the rest:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock start redis
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose up -d redis
```

</TabItem>
</Tabs>

2. Point CodeIgniter's cache at it in `app/Config/Cache.php`:

```php
public string $handler = 'redis';

public array $redis = [
    'host'     => 'redis',
    'password' => null,
    'port'     => 6379,
    'timeout'  => 0,
    'database' => 0,
];
```

3. The `redis` PHP extension is already built into Laradock's PHP-FPM and workspace images, so there is nothing else to install. CodeIgniter now stores cached items in Redis instead of files.

Without those steps the container just sits idle, which is why the required stack above leaves it out.

## Add background queues (optional)

For work you do not want to block a web request (sending email, image processing, calling slow APIs), CodeIgniter has an official [Queue package](https://queue.codeigniter.com/). Set it up entirely from the `workspace` shell:

1. Install and publish the package, then create a job:

```bash
composer require codeigniter4/queue
php spark migrate --all
php spark queue:publish
php spark queue:job Example
```

2. The queue defaults to the `database` handler, which needs nothing extra. To run jobs through Redis instead, start the `redis` service (see above) and edit `app/Config/Queue.php`:

```php
public string $defaultHandler = 'redis';

public array $redis = [
    'host'     => 'redis',
    'port'     => 6379,
    'database' => 0,
];
```

3. Run a worker to process the queue. Keep the `workspace` shell open and start it there:

```bash
php spark queue:work default
```

For a worker that stays up on its own, enable Supervisor in the workspace (`WORKSPACE_INSTALL_SUPERVISOR=true` in Laradock's `.env`, then rebuild) and add a program that runs `php spark queue:work`, the same pattern you would use in production.

## Schedule tasks with cron (optional)

To run recurring jobs, CodeIgniter's official [Tasks package](https://tasks.codeigniter.com/) lets you define every schedule in code behind a single cron entry.

1. Install and publish it from the `workspace` shell:

```bash
composer require codeigniter4/tasks
php spark migrate -n CodeIgniter\\Settings
php spark tasks:publish
```

2. Define your schedule in `app/Config/Tasks.php`, for example:

```php
$schedule->command('demo:refresh --all')->mondays('11:00 pm');
```

3. The Tasks system runs from one cron line that fires `php spark tasks:run` every minute. Laradock's workspace ships a crontab at `workspace/crontab/laradock`; point it at CodeIgniter:

```cron
* * * * * laradock /usr/bin/php /var/www/spark tasks:run >> /dev/null 2>&1
```

Rebuild the workspace (`./laradock rebuild workspace`) so the new crontab is picked up. From then on, `tasks:run` checks your schedule each minute and runs whatever is due. Confirm what is registered with `php spark tasks:list`.

## Catch outgoing mail in development (optional)

So test emails never reach real inboxes, route CodeIgniter's mail through **Mailpit**, a fake SMTP server with a web inbox.

1. Start it:

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

2. Point CodeIgniter's email at it in `app/Config/Email.php`:

```php
public string $protocol = 'smtp';
public string $SMTPHost = 'mailpit';
public int    $SMTPPort = 1025;
```

3. Every message your app sends now lands in the Mailpit inbox at [http://localhost:8125](http://localhost:8125) instead of a real mailbox. Prefer MailHog? Swap `mailpit` for `mailhog` and use its port.

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

CodeIgniter 4.6 and newer require PHP 8.1 or later, with 8.2 or 8.3 recommended, and Laradock covers anything from PHP 5.6 to 8.5, so the same tool runs an old CodeIgniter 3 codebase and a current CodeIgniter 4 app side by side, each isolated, none of it installed on your machine.

## Take your app live

When your app is ready, the same Laradock stack becomes your deployment. You build one hardened image of your app and ship it to the host of your choice:

```bash
./laradock ship
```

Then pick a target and follow its short guide, a single server, a managed platform, or Kubernetes: **[Deploy to Production](https://laradock.io/docs/production)** lists every provider (Fly.io, Render, Railway, DigitalOcean, AWS, Google Cloud, Azure, Kamal, Kubernetes) with a ready config file for each. There is no per-provider magic to learn; a Docker image runs the same everywhere.

## Frequently Asked Questions

### Do I need to install PHP or Composer to run CodeIgniter with Laradock?

No. Everything lives inside the containers. Composer, git and the `spark` CLI are all in the `workspace` container; you never install PHP on your host.

### Which services should I start for a typical CodeIgniter app?

`nginx mysql workspace` is all CodeIgniter requires: web server, database, and a shell. Swap `mysql` for `mariadb` or `postgres` if you prefer. Add `redis` only when you set up a cache or queue (see [Add Redis caching](#add-redis-caching-optional)); without that, Redis does nothing for CodeIgniter.

### How do I run migrations, seeders and other spark commands?

From inside the `workspace` container (`./laradock workspace`), run `php spark migrate`, `php spark db:seed`, `php spark make:controller`, and so on. See [Work with spark, migrations and seeders](#work-with-spark-migrations-and-seeders).

### Can I run multiple CodeIgniter apps on different PHP versions?

Yes. Give each its own Laradock with a unique `COMPOSE_PROJECT_NAME` and `DATA_PATH_HOST`, set a different `PHP_VERSION` in each, and they run independently on the same machine.

### Does this work the same on macOS, Windows and Linux?

Yes. Laradock runs anywhere Docker runs. On macOS/Windows, file-sync speed depends on Docker Desktop (VirtioFS helps a lot); it is a Docker Desktop trait, not specific to Laradock.

### Is this the same Docker setup I would use in production?

The containers are production-style (real NGINX + PHP-FPM), so it is far closer to production than the built-in CodeIgniter development server. See [Prepare Laradock for Production](https://laradock.io/docs/production#prepare-laradock-for-production) for the hardening steps.

---

Comparing environments? See the full **[Laradock vs Others](https://laradock.io/docs/laradock-alternatives)** breakdown. Ready to start? **[Getting Started](https://laradock.io/docs/getting-started)** takes about five minutes.
