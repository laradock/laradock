# Run Statamic on Docker

Source: https://laradock.io/docs/statamic-on-docker

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

## What is Statamic?

[Statamic](https://statamic.com) is a CMS built on the Laravel framework, known for storing content as flat files (Markdown and YAML) instead of a database by default, while still giving developers a full Laravel app to work in. A Statamic site needs only a web server and a PHP runtime to boot. No database is required out of the box, though Statamic can optionally use one (via Laravel's Eloquent) for users, form submissions, or even the content itself. Everything else you may want later, queues, a scheduler, full-text search, mail and Redis caching, is standard Laravel plumbing, so it all wires up the same familiar way.

## Why run Statamic in Docker?

Docker packages the pieces a PHP app needs (NGINX, PHP-FPM, and a database or cache if you opt into one) into isolated containers that run the same on every machine. Instead of installing PHP onto your laptop, where versions collide between projects and "works on my machine" starts, you run disposable containers that mirror production and vanish cleanly when you delete them. One site can run PHP 8.4 while another runs 8.1, on the same computer, with nothing installed globally.

The catch: wiring those containers together yourself (base images, PHP extensions, networking, permissions) is a week of fiddly Docker work. That is exactly what Laradock removes.

## Why Laradock is the best fit for Statamic

Statamic has no official Docker tool of its own, so a ready-made, no-lock-in environment matters even more. Here is why Laradock is the best fit:

- **You are never locked into one ecosystem.** Laradock is framework-agnostic. Run Statamic today, add a plain Laravel API, a WordPress site, or a Symfony service beside it tomorrow, all in the same environment with the same commands.
- **Far more flexibility.** 100+ ready services and any PHP version from 5.6 to 8.5, plus every database, cache and search engine Statamic can optionally plug into, ready the moment a project needs one.
- **Nothing is hidden and you own everything.** No generated files, no magic, no wrapper binary between you and Docker. Every Dockerfile and compose file is right there for you to read and edit.
- **Nothing new to learn.** What you use is plain `docker compose`, knowledge that transfers straight to production. Our [CLI](https://laradock.io/docs/cli) is an optional nicety, never a requirement.

Concretely, for Statamic it gives you a production-style NGINX + PHP-FPM stack, a `workspace` container with Composer, Node, npm and git installed so `php please` and `php artisan` work exactly as they do in any Laravel app, and MySQL, PostgreSQL, Redis, Typesense, Meilisearch and a mail catcher all one command away for when a project grows into them.

## Run Statamic on Docker with Laradock

### 1. Add Laradock to your project

```bash
cd my-statamic-site
git clone https://github.com/laradock/laradock.git
cd laradock
```

(No Statamic project yet? Clone Laradock first, then create one from the workspace container in the next steps.)

### 2. Pick the services your site needs

Statamic's default flat-file mode needs nothing but a web server; PHP-FPM comes with it automatically, so this is the whole required stack:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock start nginx workspace
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
cp .env.example .env
docker compose up -d nginx workspace
```

</TabItem>
</Tabs>

That is genuinely all a fresh Statamic site requires. Everything below (a database, Redis, queues, the scheduler, search, mail) is an optional add-on with its own short section, so start only what your site actually uses. The full catalog is [here](https://laradock.io/docs/Intro#supported-services).

Prefer to be asked? The optional [CLI](https://laradock.io/docs/cli) walks you through the choices: `./laradock setup`, then `./laradock start`. It prints every real command it runs.

### 3. Where Statamic's content lives

There is no database host to configure for a flat-file site. Your content, collections and globals live as Markdown and YAML files under `content/` in your project, which is mounted straight from your host into the `workspace` and `nginx` containers, so edits show up immediately either way. If you later add a database, point it at the containers the same way any Laravel app would, using the service name (`mysql` or `postgres`) as the host in your project's `.env`. See [Add a database](#add-a-database-optional) below.

### 4. Install and run your site

Enter the `workspace` container, where Composer, Node and git live, and create the project:

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
composer create-project statamic/statamic my-statamic-site   # only if you have no project yet
php please make:user                                         # create your first admin
```

Then open [http://localhost](http://localhost). That is a full Statamic site running on Docker. The Statamic control panel is at [http://localhost/cp](http://localhost/cp).

## Log in to the control panel for the first time

Statamic's admin area (the "control panel") lives at `/cp`. To get in you need a user, which the `php please make:user` command above creates. Run it from the `workspace` container and answer the prompts for email, name and password:

```bash
php please make:user
```

The first user you create is a super admin with full access. Open [http://localhost/cp](http://localhost/cp), sign in with those credentials, and you are in. Need another account later? Run `php please make:user` again, or invite users from **Users** inside the control panel once mail is set up (see [Catch outgoing mail](#catch-outgoing-mail-with-mailpit-optional)).

## Work with the `php please` CLI

`please` is Statamic's command-line tool, a thin wrapper over Laravel's `artisan`, and it already lives in the `workspace` container. Open a shell there (`./laradock workspace` or `docker compose exec workspace bash`) and everything runs against the same PHP and extensions your site uses:

```bash
php please make:user            # create a control-panel user
php please make:collection blog # scaffold a collection
php please make:blueprint post  # scaffold a blueprint
php please stache:refresh       # rebuild Statamic's content index (the "Stache")
php please static:clear         # clear the static page cache
php please search:update        # (re)build search indexes
php please list                 # see every available command
```

Regular Laravel commands (`php artisan ...`) work here too, since Statamic is a Laravel app. You never install PHP, Composer or Node on your host; they are all inside `workspace`.

## Build front-end assets with Vite

Statamic's own control panel ships pre-compiled, so nothing is needed for the admin to work. Your site's front end, on the other hand (a starter kit's CSS/JS, or Tailwind), is built with Vite through Node and npm, both already in the `workspace` container. From inside `workspace`, in your project directory:

```bash
npm install
npm run dev     # watch and hot-reload while you develop
npm run build   # one-off production build
```

If you run `npm run dev` and want the hot-reload server reachable from your browser, expose Vite's port by adding it to the `workspace` service in `docker-compose.yml` (for example `- "5173:5173"`) and start Vite with `--host`. For day-to-day work, `npm run build` and a normal page refresh is simplest.

## Add a database (optional)

Statamic runs on flat files by default, so you only need a database for one of these:

- storing **users** or **form submissions** in a database instead of files, or
- moving your **content itself** into the database with the official [Eloquent driver](https://statamic.dev/tips/storing-data-in-a-database) (useful for very large sites, or to import an existing database).

First start the database:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock start mysql
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose up -d mysql
```

</TabItem>
</Tabs>

Prefer PostgreSQL? Use `postgres` in place of `mysql` everywhere. Then point your project's `.env` at the container by its service name:

```env
DB_CONNECTION=mysql
DB_HOST=mysql
DB_PORT=3306
DB_DATABASE=default
DB_USERNAME=default
DB_PASSWORD=secret
```

The default database, user and password live in `mysql/defaults.env`; override any of them by adding the line to Laradock's `.env` (it always wins). Run your migrations from the `workspace` container with `php artisan migrate`.

**To move content into the database** (or to import an existing Statamic database), install the Eloquent driver from `workspace`:

```bash
composer require statamic/eloquent-driver
php please install:eloquent-driver   # choose what to store in the DB
php artisan migrate
php please eloquent:import-entries    # import existing flat content, per content type
```

**To restore an existing SQL dump**, drop the file into your project (it is mounted into `workspace`) and load it:

```bash
mysql -h mysql -u default -psecret default < dump.sql
```

## Add Redis caching (optional)

Redis is not required, but it gives Statamic a fast, shared store for Laravel's application cache and sessions, and it backs the "half measure" of static caching (below). Two steps:

1. Start the Redis container:

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

2. Point your project's `.env` at it, using the service name as the host:

```env
CACHE_STORE=redis
SESSION_DRIVER=redis
REDIS_HOST=redis
REDIS_PORT=6379
```

Redis is a plain Laravel driver here, so no plugin or extension is needed. Without these lines Statamic simply uses the file cache and the container sits idle, which is why the required stack above leaves it out.

## Turn on static caching (optional)

For a mostly-static content site, static caching is the single biggest speed win: Statamic serves pre-rendered HTML instead of booting PHP on every request. Enable it in your project's `.env`:

```env
STATAMIC_STATIC_CACHING_STRATEGY=half
```

The `half` strategy (PHP serves a cached response, skipping the render) works with the required `nginx workspace` stack as-is, and pairs nicely with [Redis](#add-redis-caching-optional) as the cache store. Warm and clear the cache from the `workspace` container:

```bash
php please static:warm    # pre-render every page
php please static:clear   # flush it after content changes
```

The `full` strategy lets NGINX serve the cached HTML files directly (even faster, but it needs matching rewrite rules in your web-server config). Details and the exact rules are in the [static caching docs](https://statamic.dev/static-caching). Warming can be pushed to a queue with `php please static:warm --queue` once you set up a worker (below).

## Run background queues (optional)

Statamic uses Laravel's queue for slower jobs: sending form emails, updating search indexes, warming the static cache and Git automation. By default the queue connection is `sync` (jobs run inline), which is fine to start. To run them in the background, use Redis as the queue backend and a worker.

1. Start Redis (see [Add Redis caching](#add-redis-caching-optional)) and set the queue connection in your project's `.env`:

```env
QUEUE_CONNECTION=redis
REDIS_HOST=redis
```

2. Run a worker. The simplest way while developing is from the `workspace` container:

```bash
php artisan queue:work
```

For a worker that stays up on its own, start Laradock's dedicated `php-worker` container instead (point its command at `php artisan queue:work` in `php-worker/supervisord.d/`):

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

## Run the scheduler for scheduled and expiring entries

Statamic can publish an entry at a future date and unpublish one when it expires, but that only happens if Laravel's scheduler is running once a minute. The scheduler also drives recurring housekeeping. During development, run it in the foreground from the `workspace` container:

```bash
php artisan schedule:work
```

For an always-on setup, add a cron entry that calls the scheduler every minute (Laradock's `workspace` supports cron; enable it via `WORKSPACE_INSTALL_CRON=true` in Laradock's `.env` and rebuild):

```cron
* * * * * cd /var/www && php artisan schedule:run >> /dev/null 2>&1
```

Without the scheduler, everything still works except time-based publishing and expiry.

## Add full-text search (optional)

Statamic ships with search built in. The default **local** driver (Comb) stores indexes as JSON files and needs zero extra services, just build the index from the `workspace` container:

```bash
php please search:update
```

That is enough for most sites. For large catalogs or typo-tolerant instant search, plug in a real search engine. Laradock ships [Typesense](https://statamic.dev), Meilisearch and Elasticsearch; here is Typesense via the community driver:

1. Start Typesense:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock start typesense
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose up -d typesense
```

</TabItem>
</Tabs>

2. Install the driver and point it at the container in your project's `.env`:

```bash
composer require statamic-rad-pack/typesense
```

```env
TYPESENSE_HOST=typesense
TYPESENSE_PORT=8108
TYPESENSE_API_KEY=xyz
```

3. Set the index's driver to `typesense` in `config/statamic/search.php`, then build it:

```bash
php please search:update
```

Prefer a hosted service instead? Statamic's built-in **Algolia** driver needs no local container at all, just set `ALGOLIA_APP_ID` and `ALGOLIA_SECRET` in `.env` and choose the `algolia` driver. Full options are in the [search docs](https://statamic.dev/search).

## Catch outgoing mail with Mailpit (optional)

Statamic forms can send email notifications, and the control panel emails user invitations. In development you do not want those going to real inboxes. Laradock's Mailpit container captures every message and shows it in a web UI. Start it:

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

Point your project's `.env` at it by service name:

```env
MAIL_MAILER=smtp
MAIL_HOST=mailpit
MAIL_PORT=1025
```

Every email Statamic sends now lands in the Mailpit inbox at [http://localhost:8025](http://localhost:8025) instead of a real address.

## Run a multi-site install (optional)

Statamic Pro can serve several sites (languages or brands) from one install. Enable Pro and turn on multi-site in your project's `.env`:

```env
STATAMIC_PRO_ENABLED=true
```

Then scaffold the extra sites from the `workspace` container and edit `config/statamic/sites.php` to set each site's URL and locale:

```bash
php please multisite
```

Because every site shares the one Laradock stack (one NGINX, one PHP-FPM), you point each site's domain or path at the same containers. No extra services are needed for multi-site itself.

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

Statamic requires PHP 8.3 or newer, and Laradock covers anything from PHP 5.6 to 8.5, so the same tool runs an older Laravel project and a brand-new Statamic site side by side, each isolated, none of it installed on your machine.

## Take your site live

When your site is ready, the same Laradock stack becomes your deployment. You build one hardened image of your app and ship it to the host of your choice:

```bash
./laradock ship
```

Then pick a target and follow its short guide, a single server, a managed platform, or Kubernetes: **[Deploy to Production](https://laradock.io/docs/production)** lists every provider (Fly.io, Render, Railway, DigitalOcean, AWS, Google Cloud, Azure, Kamal, Kubernetes) with a ready config file for each. There is no per-provider magic to learn; a Docker image runs the same everywhere.

## Frequently Asked Questions

### Do I need to install PHP or Composer to run Statamic with Laradock?

No. Everything lives inside the containers. Composer, Node, npm, git and the `php please` CLI are all in the `workspace` container; you never install PHP on your host.

### Which services should I start for a typical Statamic site?

`nginx workspace` is enough for the default flat-file mode. Add `mysql` (or `postgres`) only if you opt into a database, `redis` for caching or queues, `mailpit` to catch form emails, and a search engine like `typesense` only at scale. Each has its own section above with the exact wiring.

### Can I run multiple Statamic sites on different PHP versions?

Yes. Give each its own Laradock with a unique `COMPOSE_PROJECT_NAME` and `DATA_PATH_HOST`, set a different `PHP_VERSION` in each, and they run independently on the same machine.

### Does this work the same on macOS, Windows and Linux?

Yes. Laradock runs anywhere Docker runs. On macOS/Windows, file-sync speed depends on Docker Desktop (VirtioFS helps a lot for `vendor/`-heavy sites); it is a Docker Desktop trait, not specific to Laradock.

### Is this the same Docker setup I would use in production?

The containers are production-style (real NGINX + PHP-FPM), so it is far closer to production than `artisan serve` or a native install. See [Prepare Laradock for Production](https://laradock.io/docs/production#prepare-laradock-for-production) for the hardening steps.

---

Comparing environments? See the full **[Laradock vs Others](https://laradock.io/docs/laradock-alternatives)** breakdown. Ready to start? **[Getting Started](https://laradock.io/docs/getting-started)** takes about five minutes.
