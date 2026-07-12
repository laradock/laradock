# Run OpenCart on Docker

Source: https://laradock.io/docs/opencart-on-docker

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

## What is OpenCart?

[OpenCart](https://www.opencart.com) is a lightweight, open-source PHP shopping cart platform known for being simple to install and extend compared to heavier e-commerce frameworks. It is a plain PHP application: no full framework underneath, just a web server, PHP-FPM, and a MySQL or MariaDB database (OpenCart also supports PostgreSQL via PDO in recent versions). To boot and run a store, that is all it needs. Everything else, an SMTP mail catcher, its cron handler, multi-store, extra caching, is opt-in and covered below.

## Why run OpenCart in Docker?

Docker packages each of those pieces (a web server, PHP-FPM, MySQL) into isolated containers that run the same on every machine. Instead of installing PHP and MySQL onto your laptop, where versions collide between projects and "works on my machine" starts, you run disposable containers that mirror production and vanish cleanly when you delete them. One store can run PHP 8.1 while another runs an older OpenCart 3.x install on PHP 7.4, on the same computer, with nothing installed globally.

The catch: wiring those containers together yourself (base images, PHP extensions, networking, permissions) is a week of fiddly Docker work. That is exactly what Laradock removes.

## Why Laradock is the best fit for OpenCart

OpenCart has no official Docker image of its own; the images you will find on Docker Hub (Bitnami's, for example) are third-party, not maintained by the OpenCart project. Here is why Laradock is the best fit:

- **You are never locked into one ecosystem.** Laradock is framework-agnostic. Run your OpenCart store today, add a Laravel API, a WordPress blog, or a plain PHP script beside it tomorrow, all in the same environment with the same commands.
- **Far more flexibility.** 100+ ready services and any PHP version from 5.6 to 8.5, so a legacy OpenCart 3 install and a current OpenCart 4 store each get exactly the runtime they need.
- **Nothing is hidden and you own everything.** No generated files, no magic, no wrapper binary between you and Docker. Every Dockerfile and compose file is right there for you to read and edit.
- **Nothing new to learn.** What you use is plain `docker compose`, knowledge that transfers straight to production. Our [CLI](https://laradock.io/docs/cli) is an optional nicety, never a requirement.

Concretely, for OpenCart it gives you a production-style NGINX or Apache + PHP-FPM stack, MySQL/MariaDB already wired, and a `workspace` container with Composer and git installed. Mail capture, its cron handler and multi-store are one command or one setting away when you want them.

## Run OpenCart on Docker with Laradock

### 1. Add Laradock to your project

```bash
cd my-opencart-store
git clone https://github.com/laradock/laradock.git
cd laradock
```

(No OpenCart files yet? Clone Laradock first, then download an OpenCart release from the `workspace` container in the next steps.)

### 2. Pick the services your store needs

OpenCart needs a web server and a database, nothing else is required to boot:

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

Prefer MariaDB instead of MySQL, or Apache instead of NGINX (OpenCart ships an `.htaccess.txt` for Apache rewrites)? Swap the name: `./laradock start apache2 mariadb workspace`. The full catalog is [here](https://laradock.io/docs/Intro#supported-services).

Prefer to be asked? The optional [CLI](https://laradock.io/docs/cli) walks you through the choices: `./laradock setup`, then `./laradock start`. It prints every real command it runs.

### 3. Point OpenCart at the containers

OpenCart's installer writes your database connection into `config.php` and `admin/config.php` for you. When you run the installer in the next step, give it the container's service name as the database host and Laradock's default MySQL credentials:

```text
DB host:     mysql        (or "mariadb" if you swapped it)
DB name:     default
DB user:     default
DB password: secret
```

Those defaults live in `mysql/defaults.env`; override any of them by adding the matching line to Laradock's `.env` (it always wins).

### 4. Install and run

Enter the `workspace` container, where Composer and git live:

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

Then download OpenCart and run its command-line installer:

```bash
composer create-project opencart/opencart .
mv upload/* . && mv upload/.htaccess . 2>/dev/null
php install/cli_install.php install \
  --db_hostname mysql --db_username default --db_password secret --db_database default \
  --username admin --password secret --email admin@example.com \
  --http_server http://localhost/
```

(File layout differs slightly by release; some downloads ship an `upload/` folder that becomes your webroot, others do not. Check the README of the version you pulled. You can use the browser-based installer at `http://localhost/install` instead if you prefer.) Then open [http://localhost](http://localhost). That is a full OpenCart store running on Docker.

## First admin login and securing the install

OpenCart's admin lives in its own folder. Log in at [http://localhost/admin](http://localhost/admin) with the username and password you passed to the installer above (`admin` / `secret` in the example).

Two things OpenCart insists on right after install:

1. **Delete the `install/` directory.** OpenCart refuses to run normally until it is gone. From the `workspace` container:

   ```bash
   rm -rf install
   ```

2. **(Recommended) rename the `admin/` folder** to something only you know, then update the `$admin` path inside `admin/config.php` and the `DIR_*` constants that point at it. This is optional locally but matters the moment the store is reachable from outside your machine.

## Set up email capture (optional)

OpenCart sends order confirmations, account and password-reset email through PHP mail or an SMTP server. In development you do not want that mail leaving your machine, so route it into a mail catcher and read every message in a web inbox.

1. Start the mail catcher alongside the rest:

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

2. In the OpenCart admin, go to **System, Settings**, edit your store, open the **Mail** tab, and set:

```text
Mail Engine:   SMTP
SMTP Hostname: mailpit
SMTP Username: (leave blank)
SMTP Password: (leave blank)
SMTP Port:     1025
SMTP Timeout:  5
```

Now every email OpenCart sends is captured instead of delivered. Open the inbox at [http://localhost:8025](http://localhost:8025) to read it. (Prefer MailHog? Start `mailhog` instead; the SMTP hostname becomes `mailhog` on the same port 1025, inbox at [http://localhost:8025](http://localhost:8025).)

## Automate OpenCart's cron tasks

OpenCart 4 centralizes recurring work (currency-rate refreshes, subscription renewals, newsletter sends, and any cron task an extension registers) behind a single cron handler at `index.php?route=cron/cron`. You register jobs under **Extension, Cron** in the admin, then have something hit that URL on a schedule.

Inside the container network, the `workspace` container reaches the store through the `nginx` (or `apache2`) service name, so you can fire the handler by hand to test it:

```bash
./laradock workspace
curl "http://nginx/index.php?route=cron/cron"
```

To run it automatically, add a line to the `workspace` container's crontab so it fires every five minutes:

```bash
# inside the workspace container
crontab -e
# then add:
*/5 * * * * curl -s "http://nginx/index.php?route=cron/cron" > /dev/null 2>&1
```

The `workspace` image ships with cron installed and running, so that is all it takes. In production you point a real system cron (or your host's scheduler) at the same URL over HTTPS.

## Run several storefronts from one install (multi-store)

One of OpenCart's headline features: a single install and admin can serve multiple storefronts, each on its own domain, with its own theme, catalog subset and settings. To try it locally with Laradock:

1. Give the second store a hostname that resolves to your machine. Add it to your host's `/etc/hosts` (outside the containers):

   ```text
   127.0.0.1 store2.localhost
   ```

2. In the OpenCart admin, go to **System, Settings**, click **New**, and set the new store's **URL** to `http://store2.localhost/`. Assign it a theme and layout.

Both hostnames hit the same Laradock `nginx` container and the same OpenCart code; OpenCart picks the right store by matching the request's hostname against the store URLs you configured. No second web server or second database is needed. For a real domain later, add it the same way and point DNS at your production host.

## Clear and tune OpenCart's cache

OpenCart caches its theme, model output and generated CSS/JS to speed up page loads. Two things you will do often:

- **Clear the cache after changing a theme or setting.** In the admin, use the refresh/clear buttons on the **Dashboard** and under **Design, Theme Editor**, or from the `workspace` container remove the on-disk cache files:

  ```bash
  ./laradock workspace
  rm -rf system/storage/cache/*
  ```

- **Regenerate the modification cache** after installing an extension (OCMOD): admin **Extensions, Modifications**, then click **Refresh**.

OpenCart's core cache writes to the filesystem, which is fine for a single container. If you later want a shared in-memory cache across multiple app containers, that is done with a third-party OpenCart cache extension (Redis or Memcached); start the `redis` service with `./laradock start redis`, point the extension at host `redis` port `6379`, and follow the extension's steps. Core OpenCart has no built-in Redis driver, which is why it is not part of the required stack.

## Import an existing OpenCart database

Moving a store from another host into Laradock is a plain MySQL import. Drop your `.sql` dump into the Laradock folder (so it is visible inside the container), then from the `workspace` container:

```bash
./laradock workspace
mysql -h mysql -u default -psecret default < store-dump.sql
```

Then copy your store's files into the project webroot, and update the store URL, database host (`mysql`) and any absolute paths in `config.php` and `admin/config.php` to match the container layout. Open [http://localhost](http://localhost) and your existing catalog, orders and customers are there.

## Change the PHP version anytime

This is where a native install hurts and Laradock shines. Set the version in Laradock's `.env` and rebuild:

```env
PHP_VERSION=8.1
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

OpenCart 4 requires PHP 8.0 or newer, while OpenCart 3.x stores commonly still run on PHP 7.4, so the same tool runs a legacy 3.x shop and a current OpenCart 4 store side by side, each isolated, none of it installed on your machine.

## Take your store live

When your store is ready, the same Laradock stack becomes your deployment. You build one hardened image of your app and ship it to the host of your choice:

```bash
./laradock ship
```

Then pick a target and follow its short guide, a single server, a managed platform, or Kubernetes: **[Deploy to Production](https://laradock.io/docs/production)** lists every provider (Fly.io, Render, Railway, DigitalOcean, AWS, Google Cloud, Azure, Kamal, Kubernetes) with a ready config file for each. There is no per-provider magic to learn; a Docker image runs the same everywhere.

## Frequently Asked Questions

### Do I need to install PHP or MySQL to run OpenCart with Laradock?

No. Everything lives inside the containers. Composer and git are in the `workspace` container; you never install PHP or the database on your host.

### Which services should I start for a typical OpenCart store?

`nginx mysql workspace` is all OpenCart requires: web server, database, and a shell. Swap `mysql` for `mariadb`, or `nginx` for `apache2`, if you prefer. Add `mailpit` only when you want to catch outgoing email, and `redis` only if you install a cache extension; neither is needed to boot the store.

### Can I run multiple OpenCart stores on different PHP versions?

Yes. Give each its own Laradock with a unique `COMPOSE_PROJECT_NAME` and `DATA_PATH_HOST`, set a different `PHP_VERSION` in each, and they run independently on the same machine. (This is different from OpenCart's built-in multi-store, which serves several storefronts from one install; see [Run several storefronts from one install](#run-several-storefronts-from-one-install-multi-store) above.)

### Does this work the same on macOS, Windows and Linux?

Yes. Laradock runs anywhere Docker runs. On macOS/Windows, file-sync speed depends on Docker Desktop (VirtioFS helps a lot); it is a Docker Desktop trait, not specific to Laradock.

### Is this the same Docker setup I would use in production?

The containers are production-style (real web server + PHP-FPM), so it is far closer to production than a native install. See [Prepare Laradock for Production](https://laradock.io/docs/production#prepare-laradock-for-production) for the hardening steps.

---

Comparing environments? See the full **[Laradock vs Others](https://laradock.io/docs/laradock-alternatives)** breakdown. Ready to start? **[Getting Started](https://laradock.io/docs/getting-started)** takes about five minutes.
