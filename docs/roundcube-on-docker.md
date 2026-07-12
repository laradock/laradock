# Run Roundcube on Docker

Source: https://laradock.io/docs/roundcube-on-docker

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

## What is Roundcube?

[Roundcube](https://roundcube.net) is a widely used open source webmail client with a browser-based interface for reading and sending email, including contacts, folders and filters. It is a PHP application backed by a database (MySQL, PostgreSQL or SQLite) for its own data such as address books, settings and cached messages, served through a web server. That database is only half the picture: Roundcube is a client, not a mail server, so it also needs to connect to a real IMAP server (and an SMTP server to send) where the actual mailboxes live.

## Why run Roundcube in Docker?

Docker packages the pieces Roundcube itself needs (NGINX, PHP-FPM, MySQL) into isolated containers that run the same on every machine. Instead of installing PHP and MySQL onto your laptop, where versions collide between projects and "works on my machine" starts, you run disposable containers that mirror production and vanish cleanly when you delete them. One Roundcube instance can run on an older PHP version while another project runs the latest PHP, on the same computer, with nothing installed globally.

The catch: wiring those containers together yourself (base images, PHP extensions, networking, permissions) is a week of fiddly Docker work. That is exactly what Laradock removes.

## Why Laradock is the best fit for Roundcube

Roundcube has no official Docker image of its own beyond community-maintained ones, so a ready-made, no-lock-in environment matters even more. Here is why Laradock is the best fit:

- **You are never locked into one ecosystem.** Laradock is framework-agnostic. Run Roundcube today, add a Laravel API, a WordPress marketing site, or a plain PHP script beside it tomorrow, all in the same environment with the same commands.
- **Far more flexibility.** 100+ ready services and any PHP version from 5.6 to 8.5, versus a single-purpose image with a narrow set of tags.
- **Nothing is hidden and you own everything.** No generated files, no magic, no wrapper binary between you and Docker. Every Dockerfile and compose file is right there for you to read and edit.
- **Nothing new to learn.** What you use is plain `docker compose`, knowledge that transfers straight to production. Our [CLI](https://laradock.io/docs/cli) is an optional nicety, never a requirement.

Concretely, for Roundcube's own layer, Laradock gives you a production-style NGINX + PHP-FPM stack and MySQL/PostgreSQL already wired, plus a `workspace` container with Composer and git installed. Laradock's [Mailpit](https://laradock.io/docs/services/mailpit) service is an outgoing-mail catcher for local development (it captures mail your apps send, so nothing leaks to real inboxes); it is not a full IMAP server and cannot substitute for the mail server Roundcube needs to actually list and read mailboxes.

## Run Roundcube on Docker with Laradock

### 1. Add Laradock to your project

```bash
cd my-roundcube-instance
git clone https://github.com/laradock/laradock.git
cd laradock
```

(No Roundcube files yet? Clone Laradock first, then download and extract the Roundcube package from the workspace container in the next steps.)

### 2. Pick the services your instance needs

Roundcube needs a web server and a database for its own data. The web server pulls in PHP-FPM automatically:

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

Prefer PostgreSQL instead? Swap the name: `./laradock start nginx postgres workspace`. The full catalog is [here](https://laradock.io/docs/Intro#supported-services).

Prefer to be asked? The optional [CLI](https://laradock.io/docs/cli) walks you through the choices: `./laradock setup`, then `./laradock start`. It prints every real command it runs.

### 3. Point Roundcube at the containers, and at a real mail server

In `config/config.inc.php`, point the database at Laradock's container:

```php
$config['db_dsnw'] = 'mysql://default:secret@mysql/default';
```

The default database, user and password live in Laradock's `mysql/defaults.env`; override any of them by adding the line to Laradock's `.env` (it always wins). Separately, point Roundcube at the IMAP and SMTP server that actually holds the mailboxes, an existing mail account or a mail server you run elsewhere:

```php
$config['imap_host'] = 'ssl://imap.example.com:993';
$config['smtp_host'] = 'tls://smtp.example.com:587';
```

### 4. Install and run your instance

Enter the `workspace` container, where Composer and git live, place the Roundcube files in your project's web root (download the archive from [roundcube.net](https://roundcube.net) and extract it if you have not already), and finish the database setup:

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

Then, inside the container:

```bash
composer install
bin/initdb.sh --dir=SQL
```

Then open [http://localhost](http://localhost) and log in with the credentials for the real mail account you pointed `imap_host` at in the step above.

## Change the PHP version anytime

This is where a native install hurts and Laradock shines. Set the version in Laradock's `.env` and rebuild:

```env
PHP_VERSION=8.2
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

Current Roundcube releases need PHP 7.4 or newer (8.1+ recommended); Laradock covers anything from PHP 5.6 to 8.5, so the same tool runs an older Roundcube instance and a brand-new one side by side, each isolated, none of it installed on your machine.

## Take your instance live

When your Roundcube instance is ready, the same Laradock stack becomes your deployment. You build one hardened image and ship it to the host of your choice:

```bash
./laradock ship
```

Then pick a target and follow its short guide, a single server, a managed platform, or Kubernetes: **[Deploy to Production](https://laradock.io/docs/production)** lists every provider (Fly.io, Render, Railway, DigitalOcean, AWS, Google Cloud, Azure, Kamal, Kubernetes) with a ready config file for each. There is no per-provider magic to learn; a Docker image runs the same everywhere. Remember that the deployed instance still needs to reach a real IMAP/SMTP server, so point `imap_host` and `smtp_host` at your production mail server.

## Frequently Asked Questions

### Do I need to install PHP or MySQL to run Roundcube with Laradock?

No. Everything lives inside the containers. PHP, its required extensions, and the database server are all provided; you never install them on your host. You do still need a real IMAP/SMTP server to connect to, since Roundcube is a webmail client, not a mail server.

### Which services should I start for a typical Roundcube instance?

`nginx mysql workspace` covers Roundcube's own layer: web server, database, and a shell. Swap `mysql` for `postgres` if you prefer.

### Can Laradock's Mailpit service replace the IMAP server Roundcube needs?

No. Mailpit only catches outgoing mail sent during development, useful for testing that an app sends mail correctly. It does not store or serve inboxes over IMAP, so it cannot be the mail server behind a working Roundcube login.

### Can I run multiple Roundcube instances on different PHP versions?

Yes. Give each its own Laradock with a unique `COMPOSE_PROJECT_NAME` and `DATA_PATH_HOST`, set a different `PHP_VERSION` in each, and they run independently on the same machine.

### Is this the same Docker setup I would use in production?

The containers are production-style (real NGINX + PHP-FPM), so it is far closer to production than a native install. See [Prepare Laradock for Production](https://laradock.io/docs/production#prepare-laradock-for-production) for the hardening steps.

---

Comparing environments? See the full **[Laradock vs Others](https://laradock.io/docs/laradock-alternatives)** breakdown. Ready to start? **[Getting Started](https://laradock.io/docs/getting-started)** takes about five minutes.
