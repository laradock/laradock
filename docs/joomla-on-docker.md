# Run Joomla on Docker

Source: https://laradock.io/docs/joomla-on-docker

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

## What is Joomla?

[Joomla](https://www.joomla.org) is one of the most widely used open source CMSs, known for multilingual support built into core and for powering everything from community portals to corporate sites and online stores. It is a PHP application backed by a database, typically MySQL or MariaDB (PostgreSQL is also supported), served through a web server. To boot and run, Joomla needs only PHP, a web server, and a database. Everything else (Redis caching, an SMTP mail catcher, the built-in task scheduler) is opt-in and covered below.

## Why run Joomla in Docker?

Docker packages each of those pieces (NGINX, PHP-FPM, MySQL) into isolated containers that run the same on every machine. Instead of installing PHP and MySQL onto your laptop, where versions collide between sites and "works on my machine" starts, you run disposable containers that mirror production and vanish cleanly when you delete them. One site can run PHP 8.3 while an older Joomla 4 install runs 8.0, on the same computer, with nothing installed globally.

The catch: wiring those containers together yourself (base images, PHP extensions, networking, permissions) is a week of fiddly Docker work. That is exactly what Laradock removes.

## Why Laradock is the best fit for Joomla

Joomla ships its own official Docker image on Docker Hub, so, unlike most PHP projects, it does not strictly need Laradock. It is still the best fit, and here is why:

- **You are never locked into one ecosystem.** Laradock is framework-agnostic. The day you add a Laravel API, a WordPress site, or a plain PHP script beside your Joomla install, it runs in the same environment with the same commands. A single-purpose image cannot do that.
- **Far more flexibility.** 100+ ready services and any PHP version from 5.6 to 8.5, versus the narrower set of tags the official image maintains.
- **Nothing is hidden and you own everything.** No generated files, no magic, no wrapper binary between you and Docker. Every Dockerfile and compose file is right there for you to read and edit.
- **Nothing new to learn.** What you use is plain `docker compose`, knowledge that transfers straight to production and to every other project. Our [CLI](https://laradock.io/docs/cli) is an optional nicety, never a requirement.

Concretely, for Joomla it gives you a production-style NGINX + PHP-FPM stack, MySQL/MariaDB/PostgreSQL ready to connect (and Redis one command away when you want caching), a `workspace` container with the Joomla CLI, Composer and git ready to use, and any PHP version behind a single line of config.

## Run Joomla on Docker with Laradock

### 1. Add Laradock to your project

```bash
cd my-joomla-site
git clone https://github.com/laradock/laradock.git
cd laradock
```

(No Joomla files yet? Clone Laradock first, then download Joomla from the workspace container in the next steps.)

### 2. Pick the services your site needs

Joomla needs exactly two things: a **web server** and a **database**. The web server pulls in PHP-FPM automatically, so this is the whole required stack:

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

Prefer MariaDB or PostgreSQL? Swap the name: `./laradock start nginx mariadb workspace` (or `docker compose up -d nginx mariadb workspace`). Joomla also runs on Apache if your theme relies on `.htaccess`: use `apache2` in place of `nginx`. The full catalog is [here](https://laradock.io/docs/Intro#supported-services).

Prefer to be asked? The optional [CLI](https://laradock.io/docs/cli) walks you through the choices: `./laradock setup`, then `./laradock start`. It prints every real command it runs.

> **Do I need Redis?** Not to get running. Joomla defaults to file-based caching and a fresh site runs perfectly on `nginx mysql workspace`. Redis only helps on busier sites, and only once you switch the cache handler over. See [Add Redis caching](#add-redis-caching-optional) below when you actually want it.

### 3. Point Joomla at the containers

Joomla's installer asks for the database connection in the browser wizard; use the service name as the host:

```
Database Type: MySQLi
Host Name: mysql
Username: default
Password: secret
Database Name: default
```

The default database, user and password live in Laradock's `mysql/defaults.env`; override any of them by adding the line to Laradock's `.env` (it always wins).

### 4. Install and run your site

Enter the `workspace` container, where the Joomla CLI, git and Composer live, and fetch Joomla:

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

Once inside, download and unpack Joomla into your project's public folder (skip this if you already have Joomla files):

```bash
curl -LO https://downloads.joomla.org/latest    # latest full package .zip
unzip Joomla_*-Stable-Full_Package.zip -d /var/www
```

Then open [http://localhost](http://localhost) and finish the installer in the browser using the database details from the step above. Joomla asks you to create the first Super User account here; note the username and password, that is your admin login.

Prefer a scripted, no-browser install? Joomla ships a headless installer you can run from the `workspace` container:

```bash
php installation/joomla.php install \
  --site-name="My Site" --admin-user="Admin" --admin-username=admin \
  --admin-password=secret1234 --admin-email=you@example.com \
  --db-type=mysqli --db-host=mysql --db-user=default \
  --db-pass=secret --db-name=default --db-prefix=jos_
```

After either path, delete the `installation/` folder (the browser wizard offers a button; from the CLI just `rm -rf installation`) and open [http://localhost](http://localhost). That is a full Joomla site running on Docker.

## First admin login

Your Joomla admin (the Super User) is created during install, from the credentials you typed into the wizard or passed to the headless installer. Sign in at [http://localhost/administrator](http://localhost/administrator).

Locked out or forgot the password? Reset it from the `workspace` container with the Joomla CLI, no database surgery needed:

```bash
php cli/joomla.php user:reset-password --username=admin
```

## Working with Joomla from the command line

Joomla 4 and 5 ship a full console application at `cli/joomla.php`. Run everything from inside the `workspace` container (`./laradock workspace`). List every command with:

```bash
php cli/joomla.php list
```

The ones you will reach for most:

```bash
php cli/joomla.php extension:install --path=/var/www/my-extension.zip  # install an extension
php cli/joomla.php extension:list                                      # list installed extensions
php cli/joomla.php core:check-updates                                 # check for a Joomla update
php cli/joomla.php core:update                                         # update Joomla core
php cli/joomla.php cache:clean                                         # clear all caches
php cli/joomla.php config:get db.host                                 # read a config value
php cli/joomla.php user:add                                            # create a user interactively
```

Because the CLI runs inside the container, it always uses the same PHP version and extensions as the site itself, no host PHP required.

## Add Redis caching (optional)

Joomla has caching built into core and defaults to storing it as files. On a busy site, pointing that cache at Redis keeps it in memory and noticeably speeds up the front end and admin. No extension or plugin is needed, Joomla talks to Redis natively; you just start the container and flip the cache handler.

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

2. In the Joomla admin, go to **System, Global Configuration, System tab, Cache Settings** and set:

```
Cache Handler: Redis
Cache: ON - Conservative caching
Redis Server Host: redis
Redis Server Port: 6379
```

(The equivalent lines in `configuration.php` are `$caching = 2;`, `$cache_handler = 'redis';`, `$redis_server_host = 'redis';` and `$redis_server_port = 6379;`.)

That is it, Joomla now stores its cache in Redis. Until you change the handler, the container just sits idle, which is why the required stack above leaves it out.

## Catch outgoing mail (optional)

Joomla sends registration, password-reset and contact-form email through PHP mail or SMTP. In development you do not want that leaving your machine, so route it into a mail catcher and read every message in a web inbox.

1. Start the mail catcher:

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

2. In the Joomla admin, go to **System, Global Configuration, Server tab, Mail Settings** and set:

```
Mailer: SMTP
SMTP Host: mailpit
SMTP Port: 1025
SMTP Authentication: No
```

Now every email Joomla sends is captured. Open the inbox at [http://localhost:8025](http://localhost:8025) to read it. (Prefer MailHog? Start `mailhog` instead; the SMTP host becomes `mailhog` on the same port 1025, inbox at [http://localhost:8025](http://localhost:8025).)

## Run scheduled tasks (cron)

Joomla 4 introduced a built-in **Scheduled Tasks** manager (System, Manage, Scheduled Tasks) for jobs like session cleanup, cache purging, update checks and Smart Search indexing. Those tasks need a heartbeat. In production you point a cron at them; locally you do the same from the `workspace` container, which has cron built in.

Run all due tasks once to confirm it works:

```bash
php cli/joomla.php scheduler:run --all
```

To fire them on a schedule, add a line to the workspace crontab (`crontab -e` inside the container) so it runs every minute:

```
* * * * * cd /var/www && php cli/joomla.php scheduler:run --all >/dev/null 2>&1
```

List and inspect the configured tasks with `php cli/joomla.php scheduler:list`.

## Smart Search indexing

Joomla's built-in **Smart Search** (com_finder) provides site search with no external search engine required; it indexes your content straight into the database. Enable the "Smart Search - Content" plugin, then build the index. You can do it from the admin, or from the `workspace` container:

```bash
php cli/joomla.php finder:index
```

To keep the index fresh automatically, add Smart Search indexing as a Scheduled Task (see the cron section above) so `scheduler:run` refreshes it, or add the finder command to the crontab directly.

## Import an existing database

Moving a live Joomla site into Laradock is just a database restore. Copy your SQL dump next to the `laradock` folder so it is visible inside the container, then load it from the `workspace` container:

```bash
mysql -h mysql -u default -psecret default < /var/www/backup.sql
```

Then edit `configuration.php` so the connection points at the containers: `$host = 'mysql';`, `$user = 'default';`, `$password = 'secret';`, `$db = 'default';`. Also blank out `$log_path` and `$tmp_path` or set them to the container paths (`/var/www/administrator/logs` and `/var/www/tmp`) if the old absolute paths do not exist here. Reload [http://localhost](http://localhost) and your site is running on Docker.

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

Joomla 5 requires PHP 8.1 or newer, and Laradock covers anything from PHP 5.6 to 8.5, so the same tool runs an older Joomla 4 site and a current Joomla 5 site side by side, each isolated, none of it installed on your machine.

## Take your site live

When your site is ready, the same Laradock stack becomes your deployment. You build one hardened image of your app and ship it to the host of your choice:

```bash
./laradock ship
```

Then pick a target and follow its short guide, a single server, a managed platform, or Kubernetes: **[Deploy to Production](https://laradock.io/docs/production)** lists every provider (Fly.io, Render, Railway, DigitalOcean, AWS, Google Cloud, Azure, Kamal, Kubernetes) with a ready config file for each. There is no per-provider magic to learn; a Docker image runs the same everywhere.

## Frequently Asked Questions

### Do I need to install PHP or MySQL to run Joomla with Laradock?

No. Everything lives inside the containers. The Joomla CLI, git and Composer are in the `workspace` container; you never install PHP or MySQL on your host.

### Which services should I start for a typical Joomla site?

`nginx mysql workspace` is all Joomla requires: web server, database, and a shell. Swap `mysql` for `mariadb` or `postgres`, or `nginx` for `apache2`, if you prefer. Add `redis` only when you switch Joomla's cache handler to Redis, and `mailpit` only when you want to catch outgoing email; neither is needed to boot the site.

### Can I run multiple Joomla sites on different PHP versions?

Yes. Give each its own Laradock with a unique `COMPOSE_PROJECT_NAME` and `DATA_PATH_HOST`, set a different `PHP_VERSION` in each, and they run independently on the same machine.

### Does this work the same on macOS, Windows and Linux?

Yes. Laradock runs anywhere Docker runs. On macOS/Windows, file-sync speed depends on Docker Desktop (VirtioFS helps a lot); it is a Docker Desktop trait, not specific to Laradock.

### Is this the same Docker setup I would use in production?

The containers are production-style (real NGINX + PHP-FPM), so it is far closer to production than a native install. See [Prepare Laradock for Production](https://laradock.io/docs/production#prepare-laradock-for-production) for the hardening steps.

---

Comparing environments? See the full **[Laradock vs Others](https://laradock.io/docs/laradock-alternatives)** breakdown. Ready to start? **[Getting Started](https://laradock.io/docs/getting-started)** takes about five minutes.
