---
sidebar_position: 3
title: Usage
description: Day-to-day Laradock commands and recipes. Run and enter containers, switch PHP and database versions, set up Xdebug, queues, the scheduler, services like Redis and ElasticSearch, workspace tooling, and production prep.
keywords:
  - laradock usage
  - laradock commands
  - switch php version docker
  - laradock xdebug
  - laradock redis
  - laradock production
---

Once Laradock is installed, you drive it with a handful of Docker and Docker Compose commands. This page is the day-to-day reference: running and entering containers, switching versions, enabling services, installing tools, and preparing for production.

> **The golden rule:** whenever you change the `.env` file, `docker-compose.yml`, or any `Dockerfile`, rebuild the affected container for the change to take effect:
> ```bash
> docker-compose build {container-name}
> ```
> Most recipes below end with this step. Add `--no-cache` to force a clean rebuild.




## Containers

The core commands you use every day to start, stop, inspect, and rebuild your stack.

<a name="List-current-running-Containers"></a>
### List running containers

```bash
docker ps
```

To see only the containers from this project:

```bash
docker-compose ps
```


<a name="Enter-Container"></a>
### Enter a container

Open a shell inside a running container to run commands in it.

1. List the running containers with `docker ps`.
2. Enter the one you want:
   ```bash
   docker-compose exec {container-name} bash
   ```
   *Example — enter the MySQL container:*
   ```bash
   docker-compose exec mysql bash
   ```
   *Example — open the MySQL prompt directly:*
   ```bash
   docker-compose exec mysql mysql -udefault -psecret
   ```
3. Type `exit` to leave.

> **Tip:** add `--user=laradock` to run as the Laradock user so created files are owned by your host user: `docker-compose exec --user=laradock workspace bash`.


<a name="Close-all-running-Containers"></a>
### Stop containers

Stop everything:

```bash
docker-compose stop
```

Stop a single container:

```bash
docker-compose stop {container-name}
```


<a name="Delete-all-existing-Containers"></a>
### Delete containers

```bash
docker-compose down
```


<a name="View-the-Log-files"></a>
### View logs

NGINX writes its logs to the `logs/nginx` directory. For any other container, use:

```bash
docker-compose logs {container-name}
```

Follow the log live with `-f`:

```bash
docker-compose logs -f {container-name}
```

See the [Docker Compose logs options](https://docs.docker.com/compose/reference/logs/) for more.


<a name="Build-Re-build-Containers"></a>
### Build or rebuild containers

After editing any `Dockerfile`, rebuild for the change to take effect:

```bash
docker-compose build
```

Rebuild a single container instead of all of them:

```bash
docker-compose build {container-name}
```

Use `--no-cache` to force a full, clean rebuild:

```bash
docker-compose build --no-cache {container-name}
```


<a name="Edit-Container"></a>
### Edit a container's Compose config

Open `docker-compose.yml` and change whatever you need.

*Change the MySQL database name:*

```yml
    environment:
        MYSQL_DATABASE: laradock
    ...
```

*Map Redis to a different host port (`1111`):*

```yml
    ports:
        - "1111:6379"
    ...
```


<a name="Edit-a-Docker-Image"></a>
### Edit a Docker image

1. Find the image's `Dockerfile` — for `mysql` it's `mysql/Dockerfile`.
2. Edit it as you like.
3. Rebuild the container:
   ```bash
   docker-compose build mysql
   ```


<a name="Add-Docker-Images"></a>
### Add more services

To add a new service (software), edit `docker-compose.yml` and add your container definition. You'll want to be familiar with the [Docker Compose file syntax](https://docs.docker.com/compose/compose-file/).




<a name="PHP"></a>
## PHP

Switch PHP versions and install the extensions and debuggers your project needs. PHP-FPM serves your application; the PHP-CLI lives in the Workspace container and runs Artisan, Composer, and tests.

<a name="Change-the-PHP-FPM-Version"></a>
### Change the PHP-FPM version

By default the latest stable PHP version runs. PHP-FPM serves your application code.

1. In `.env`, set `PHP_VERSION` to the version you want (any from `5.6` to `8.5`):
   ```dotenv
   PHP_VERSION=8.1
   ```
2. Rebuild the image:
   ```bash
   docker-compose build php-fpm
   ```

> For details on the underlying base image, see the [official PHP Docker images](https://hub.docker.com/_/php/).


<a name="Change-the-PHP-CLI-Version"></a>
### Change the PHP-CLI version

The PHP-CLI lives in the Workspace container and is used only for Artisan and Composer — it does not serve your application code (that's PHP-FPM's job), so changing it is usually optional.

1. In `.env`, set `PHP_VERSION` to the version you want:
   ```dotenv
   PHP_VERSION=8.1
   ```
2. Rebuild the Workspace:
   ```bash
   docker-compose build workspace
   ```


<a name="Install-PHP-Extensions"></a>
### Install PHP extensions

PHP extensions are toggled per container in `.env`. Each container has its own section — `PHP_FPM`, `WORKSPACE`, and `PHP_WORKER` — with a matching flag for every extension.

1. In `.env`, find the extension's flag under the relevant container's section and set it to `true`.
2. Rebuild that container with `--no-cache`:
   ```bash
   docker-compose build --no-cache {container-name}
   ```

The sections below cover the debuggers and the individual extensions Laradock ships with.


<a name="Install-xDebug"></a>
### Install Xdebug

1. In `.env`, set both flags to `true`:
   - `WORKSPACE_INSTALL_XDEBUG`
   - `PHP_FPM_INSTALL_XDEBUG`
2. Rebuild:
   ```bash
   docker-compose build workspace php-fpm
   ```

To configure Xdebug with your IDE, see this [Laravel + Laradock + PhpStorm guide](https://github.com/LarryEitel/laravel-laradock-phpstorm).


<a name="Control-xDebug"></a>
### Start or stop Xdebug

Once installed, Xdebug runs on startup by default. Control it in the `php-fpm` container by running these from the Laradock root:

- Stop it starting by default: `.php-fpm/xdebug stop`
- Start it: `.php-fpm/xdebug start`
- Check status: `.php-fpm/xdebug status`

> If `.php-fpm/xdebug` reports `Permission Denied`, give it execute access with `chmod`.


<a name="Install-pcov"></a>
### Install pcov

A fast code-coverage driver for PHP 7.1+.

1. In `.env`, set both flags to `true`:
   - `WORKSPACE_INSTALL_PCOV`
   - `PHP_FPM_INSTALL_PCOV`
2. Rebuild:
   ```bash
   docker-compose build workspace php-fpm
   ```

For tuning tips, see the [pcov README](https://github.com/krakjoe/pcov).


<a name="Install-phpdbg"></a>
### Install phpdbg

The interactive PHP debugger.

1. In `.env`, set both flags to `true`:
   - `WORKSPACE_INSTALL_PHPDBG`
   - `PHP_FPM_INSTALL_PHPDBG`
2. Rebuild:
   ```bash
   docker-compose build workspace php-fpm
   ```


<a name="Install-ionCube-Loader"></a>
### Install ionCube Loader

1. In `.env`, set both flags to `true`:
   - `WORKSPACE_INSTALL_IONCUBE`
   - `PHP_FPM_INSTALL_IONCUBE`
2. Rebuild:
   ```bash
   docker-compose build workspace php-fpm
   ```

The latest loaders are always downloaded from [ionCube](http://www.ioncube.com/loaders.php).


<a name="Install-Aerospike-Extension"></a>
### Install the Aerospike extension

1. In `.env`, set both flags to `true`:
   - `WORKSPACE_INSTALL_AEROSPIKE`
   - `PHP_FPM_INSTALL_AEROSPIKE`
2. Rebuild:
   ```bash
   docker-compose build workspace php-fpm
   ```


<a name="Install php calendar extension"></a>
### Install the Calendar extension

1. In `.env`, set `PHP_FPM_INSTALL_CALENDAR` to `true`.
2. Rebuild:
   ```bash
   docker-compose build php-fpm
   ```


<a name="Install-Faketime"></a>
### Install libfaketime

Libfaketime lets you control the date and time the OS reports, set via the `PHP_FPM_FAKETIME` variable. For example, `PHP_FPM_FAKETIME=-1d` moves the clock back one day. See [libfaketime](https://github.com/wolfcw/libfaketime) for the syntax.

1. In `.env`, set `PHP_FPM_INSTALL_FAKETIME` to `true`.
2. Set `PHP_FPM_FAKETIME` to your desired offset.
3. Rebuild:
   ```bash
   docker-compose build php-fpm
   ```


<a name="Install-YAML"></a>
### Install the YAML extension

Parse and emit YAML from PHP. See the [PHP YAML reference](http://php.net/manual/en/ref.yaml.php).

1. In `.env`, set `PHP_FPM_INSTALL_YAML` to `true`.
2. Rebuild:
   ```bash
   docker-compose build php-fpm
   ```


<a name="Install-RDKAFKA-php"></a>
### Install the rdkafka extension (PHP-FPM)

1. In `.env`, set `PHP_FPM_INSTALL_RDKAFKA` to `true`.
2. Rebuild:
   ```bash
   docker-compose build php-fpm
   ```


<a name="Install-RDKAFKA-workspace"></a>
### Install the rdkafka extension (Workspace)

Needed for `composer install` when your dependencies require Kafka.

1. In `.env`, set `WORKSPACE_INSTALL_RDKAFKA` to `true`.
2. Rebuild:
   ```bash
   docker-compose build workspace
   ```


<a name="Install-AST"></a>
### Install the AST extension

AST exposes the abstract syntax tree generated by PHP 7+. It's required by tools such as [Phan](https://github.com/phan/phan), a static analyzer.

1. In `.env`, set `WORKSPACE_INSTALL_AST` to `true`.
2. Rebuild:
   ```bash
   docker-compose build workspace
   ```

> To pin a specific version, set `WORKSPACE_AST_VERSION` before rebuilding.


<a name="Install-PHP-Decimal"></a>
### Install the Decimal extension

The [Decimal extension](https://php-decimal.io) adds correctly-rounded, arbitrary-precision decimal arithmetic — useful for money, measurements, and anything where float rounding is unacceptable.

1. In `.env`, set both flags to `true`:
   - `WORKSPACE_INSTALL_PHPDECIMAL`
   - `PHP_FPM_INSTALL_PHPDECIMAL`
2. Rebuild:
   ```bash
   docker-compose build workspace php-fpm
   ```




## Databases

Switch database versions, manage access, and connect the document stores.

<a name="Change-the-MySQL-Version"></a>
### Change the MySQL version

By default **MySQL 8.4 (LTS)** runs. You can pin any tag published on the [MySQL Docker Hub image](https://hub.docker.com/_/mysql) — for example `5.7`, `8.0`, `8.4`, or `latest`.

1. In `.env`, set `MYSQL_VERSION`:
   ```dotenv
   MYSQL_VERSION=8.0
   ```
2. Rebuild:
   ```bash
   docker-compose build mysql
   ```


<a name="MySQL-root-access"></a>
### MySQL root access

The default root credentials are username `root`, password `root`.

1. Enter the MySQL container:
   ```bash
   docker-compose exec mysql bash
   ```
2. Open the MySQL prompt (use `mysql -udefault -psecret` for non-root access):
   ```bash
   mysql -uroot -proot
   ```
3. List users:
   ```sql
   SELECT User FROM mysql.user;
   ```
4. Run anything you need — `show databases;`, `show tables;`, `select ...`.


<a name="Create-Multiple-Databases"></a>
### Create multiple databases

> MySQL only.

Copy `mysql/docker-entrypoint-initdb.d/createdb.sql.example` to `createdb.sql` in the same folder, then add your statements:

```sql
CREATE DATABASE IF NOT EXISTS `your_db_1` COLLATE 'utf8mb4_general_ci' ;
GRANT ALL ON `your_db_1`.* TO 'mysql_user'@'%' ;
```


<a name="Change-MySQL-port"></a>
### Change the MySQL port

Set your port in `mysql/my.cnf` (here `1234`):

```conf
[mysqld]
port=1234
```

If you also need MySQL access from your host, change the internal port in `docker-compose.yml` accordingly (`"3306:3306"` → `"3306:1234"`).


<a name="Use-Mongo"></a>
### Use MongoDB

1. In `.env`, set both flags to `true`:
   - `WORKSPACE_INSTALL_MONGO`
   - `PHP_FPM_INSTALL_MONGO`
2. Rebuild:
   ```bash
   docker-compose build workspace php-fpm
   ```
3. Start the container:
   ```bash
   docker-compose up -d mongo
   ```
4. Add a MongoDB connection to `config/database.php`:
   ```php
   'connections' => [

       'mongodb' => [
           'driver'   => 'mongodb',
           'host'     => env('DB_HOST', 'localhost'),
           'port'     => env('DB_PORT', 27017),
           'database' => env('DB_DATABASE', 'database'),
           'username' => '',
           'password' => '',
           'options'  => [
               'database' => '',
           ]
       ],

       // ...

   ],
   ```
5. In your Laravel `.env`, set `DB_HOST=mongo`, `DB_PORT=27017`, and `DB_DATABASE=database`.
6. Install the Laravel MongoDB package (formerly `jenssegers/mongodb`, now maintained as [`mongodb/laravel-mongodb`](https://github.com/mongodb/laravel-mongodb)):
   ```bash
   composer require mongodb/laravel-mongodb
   ```
7. Extend your models from the MongoDB Eloquent model, enter the Workspace, and run `php artisan migrate`.


<a name="Use-RethinkDB"></a>
### Use RethinkDB

[RethinkDB](https://rethinkdb.com/) is an open-source database built for real-time apps. A community package, [Laravel RethinkDB](https://github.com/duxet/laravel-rethinkdb), provides Laravel integration.

1. Start the container:
   ```bash
   docker-compose up -d rethinkdb
   ```
2. Open the admin console at [http://localhost:8090/#tables](http://localhost:8090/#tables) and create a database named `database`.
3. Add a RethinkDB connection to `config/database.php`:
   ```php
   'connections' => [

       'rethinkdb' => [
           'name'      => 'rethinkdb',
           'driver'    => 'rethinkdb',
           'host'      => env('DB_HOST', 'rethinkdb'),
           'port'      => env('DB_PORT', 28015),
           'database'  => env('DB_DATABASE', 'test'),
       ]

       // ...

   ],
   ```
4. In your Laravel `.env`, set `DB_CONNECTION=rethinkdb`, `DB_HOST=rethinkdb`, `DB_PORT=28015`, and `DB_DATABASE=database`.

> See the RethinkDB docs on [backing up your data](https://www.rethinkdb.com/docs/backup/).




<a name="Backup-Postgres"></a>
### Back up PostgreSQL (pgbackups)

> Scheduled, automatic PostgreSQL backups via [postgres-backup-local](https://github.com/prodrigestivill/docker-postgres-backup-local).

1. Make sure the `postgres` container is running.
2. Start the backup container:
   ```bash
   docker-compose up -d pgbackups
   ```

Backups are written to the `../backup` folder on your host. The service reuses your Postgres container's `POSTGRES_DB`, `POSTGRES_USER`, and `POSTGRES_PASSWORD`; adjust the schedule and retention in the `pgbackups` block of `docker-compose.yml`.




<a name="Laravel"></a>
## Laravel

Install Laravel and run its everyday tooling — Artisan, queues, the scheduler, and Browsersync — from the Workspace container.

<a name="Install-Laravel"></a>
### Install Laravel

1. Enter the Workspace container.
2. Create the project with Composer (recommended over the Laravel installer):
   ```bash
   composer create-project laravel/laravel my-cool-app
   ```
   See the [Laravel installation docs](https://laravel.com/docs/installation) for details.
3. Point Laradock at the new app. By default Laradock expects your app in the parent directory of the `laradock` folder, so update `APP_CODE_PATH_HOST` in `.env`:
   ```dotenv
   APP_CODE_PATH_HOST=../my-cool-app/
   ```
4. `cd my-cool-app` and start working.


<a name="Run-Artisan-Commands"></a>
### Run Artisan commands

Run Artisan, Composer, tests, and other terminal commands from the Workspace container.

1. Make sure the Workspace is running:
   ```bash
   docker-compose up -d workspace
   ```
2. Enter it:
   ```bash
   docker-compose exec workspace bash
   ```
   > Add `--user=laradock` so created files are owned by your host user (avoids permission issues on rotated log files).
3. Run anything you need:
   ```bash
   php artisan
   composer update
   phpunit
   ```


<a name="Run-Laravel-Queue-Worker"></a>
### Run the queue worker

1. Create a config for the worker in `php-worker/supervisord.d/` by copying `laravel-worker.conf.example` (for example, to `laravel-worker.conf`).
2. Start the worker:
   ```bash
   docker-compose up -d php-worker
   ```


<a name="Run-Laravel-Scheduler"></a>
### Run the scheduler

Laradock can run the Laravel scheduler two ways:

**1. Cron in the Workspace container (default).** When you start Laradock, the Workspace container starts cron and runs `schedule:run` every minute.

**2. Supervisord in the php-worker container.** Preferred when you don't want to run the Workspace in production.

1. Comment out the cron line in `workspace/crontab/laradock`:
   ```bash
   # * * * * * laradock /usr/bin/php /var/www/artisan schedule:run >> /dev/null 2>&1
   ```
2. Copy `laravel-scheduler.conf.example` in `php-worker/supervisord.d/` to a new config (for example, `laravel-scheduler.conf`).
3. Start the worker:
   ```bash
   docker-compose up -d php-worker
   ```


<a name="Use-Browsersync-With-Laravel-Mix"></a>
### Use Browsersync

> With Laravel Mix.

1. Add Browsersync to your `webpack.mix.js` (see the [Browsersync options](https://browsersync.io/docs/options)):
   ```js
   const mix = require('laravel-mix')

   // ...

   mix.browserSync({
     open: false,
     proxy: 'nginx' // replace with your web server container
   })
   ```
2. Run `npm run watch` inside the Workspace container.
3. Open `http://localhost:[WORKSPACE_BROWSERSYNC_HOST_PORT]` — it reloads automatically when you edit a source file.
4. The Browsersync UI is at `http://localhost:[WORKSPACE_BROWSERSYNC_UI_HOST_PORT]`.




## Other Frameworks

Recipes for non-Laravel PHP projects.

<a name="Install-Symfony"></a>
### Install Symfony

1. In `.env`, set `WORKSPACE_INSTALL_SYMFONY` to `true`.
2. Rebuild the Workspace:
   ```bash
   docker-compose build workspace
   ```
3. The NGINX sites include a `symfony.conf.example` — edit it so `root` points to your project's `public` directory.
4. If the containers were already running, restart them: `docker-compose restart`.
5. Visit `symfony.test`.


<a name="CodeIgniter"></a>
<a name="Install-CodeIgniter"></a>
### Install CodeIgniter

To run CodeIgniter 3 on Laradock:

1. In `docker-compose.yml`, change `CODEIGNITER=false` to `CODEIGNITER=true`.
2. Rebuild PHP-FPM:
   ```bash
   docker-compose build php-fpm
   ```


<a name="Magento-2-authentication-credentials"></a>
### Add Magento authentication

> Adding Composer authentication credentials for Magento 2.

1. In `.env`, set `WORKSPACE_COMPOSER_AUTH` to `true`.
2. Add your credentials to `workspace/auth.json`.
3. Rebuild the Workspace:
   ```bash
   docker-compose build workspace
   ```




## Workspace Tools

The Workspace container is your command-line home. Toggle these tools in `.env` and rebuild the Workspace to add Node, package managers, CLIs, media binaries, and shell niceties.

<a name="Install-Node"></a>
### Node.js & NVM

1. In `.env`, set `WORKSPACE_INSTALL_NODE` to `true`.
2. Rebuild:
   ```bash
   docker-compose build workspace
   ```

> A `.npmrc` is included in the `workspace` folder and is copied into the root and laradock users' home directories on build, in case you need global npm config.


<a name="Install-PNPM"></a>
### pnpm

pnpm stores a single copy of each package version on disk and hard-links it into each project's `node_modules`, saving large amounts of space and speeding up installs. More on the [pnpm motivation](https://pnpm.js.org/en/motivation).

1. In `.env`, set both `WORKSPACE_INSTALL_NODE` and `WORKSPACE_INSTALL_PNPM` to `true`.
2. Rebuild:
   ```bash
   docker-compose build workspace
   ```


<a name="Install-Yarn"></a>
### Yarn

1. In `.env`, set both `WORKSPACE_INSTALL_NODE` and `WORKSPACE_INSTALL_YARN` to `true`.
2. Rebuild:
   ```bash
   docker-compose build workspace
   ```


<a name="Install-NPM-GULP"></a>
### Gulp

1. In `.env`, set `WORKSPACE_INSTALL_NPM_GULP` to `true`.
2. Rebuild:
   ```bash
   docker-compose build workspace
   ```


<a name="Install-NPM-BOWER"></a>
### Bower

> Legacy. Bower is deprecated; prefer npm, Yarn, or pnpm for new projects.

1. In `.env`, set `WORKSPACE_INSTALL_NPM_BOWER` to `true`.
2. Rebuild:
   ```bash
   docker-compose build workspace
   ```


<a name="Install-NPM-VUE-CLI"></a>
### Vue CLI

1. In `.env`, set `WORKSPACE_INSTALL_NPM_VUE_CLI` to `true`.
2. Optionally change the ports: `WORKSPACE_VUE_CLI_SERVE_HOST_PORT` (default `8080`) and `WORKSPACE_VUE_CLI_UI_HOST_PORT` (default `8001`).
3. Rebuild:
   ```bash
   docker-compose build workspace
   ```

Run `vue serve` or `vue ui` from the Workspace, then browse to the matching port.


<a name="Install-NPM-ANGULAR-CLI"></a>
### Angular CLI

1. In `.env`, set `WORKSPACE_INSTALL_NPM_ANGULAR_CLI` to `true`.
2. Rebuild:
   ```bash
   docker-compose build workspace
   ```


<a name="Install-npm-check-updates"></a>
### npm-check-updates

[npm-check-updates](https://www.npmjs.com/package/npm-check-updates) upgrades your `package.json` dependencies to the latest versions.

1. In `.env`, make sure `WORKSPACE_INSTALL_NODE` is `true`.
2. Set `WORKSPACE_INSTALL_NPM_CHECK_UPDATES_CLI` to `true`.
3. Rebuild:
   ```bash
   docker-compose build workspace
   ```


<a name="Enable-Global-Composer-Build-Install"></a>
### Global Composer install

Install your global Composer requirements at build time so they're available in the container afterward.

1. In `.env`, set `WORKSPACE_COMPOSER_GLOBAL_INSTALL` to `true`.
2. Add your dependencies to `workspace/composer.json`.
3. Rebuild:
   ```bash
   docker-compose build workspace
   ```


<a name="Install-Prestissimo"></a>
### Prestissimo

> Legacy. [Prestissimo](https://github.com/hirak/prestissimo) parallelized downloads for **Composer 1 only** and is abandoned. Composer 2 (Laradock's default) already downloads in parallel, so you almost certainly don't need this.

1. Enable [Global Composer install](#global-composer-install) (steps 1–2).
2. Add `"hirak/prestissimo": "^0.3"` to `workspace/composer.json`.
3. Rebuild:
   ```bash
   docker-compose build workspace
   ```


<a name="Install-Deployer"></a>
### Deployer

> A deployment tool for PHP.

1. In `.env`, set `WORKSPACE_INSTALL_DEPLOYER` to `true`.
2. Rebuild:
   ```bash
   docker-compose build workspace
   ```

See the [Deployer documentation](https://deployer.org/docs/).


<a name="Install-Laravel-Envoy"></a>
### Laravel Envoy

> A task runner.

1. In `.env`, set `WORKSPACE_INSTALL_LARAVEL_ENVOY` to `true`.
2. Rebuild:
   ```bash
   docker-compose build workspace
   ```

See the [Laravel Envoy documentation](https://laravel.com/docs/envoy).


<a name="Install-Linuxbrew"></a>
### Linuxbrew

[Linuxbrew](http://linuxbrew.sh) is the Linux port of Homebrew.

1. In `.env`, set `WORKSPACE_INSTALL_LINUXBREW` to `true`.
2. Rebuild:
   ```bash
   docker-compose build workspace
   ```


<a name="Install-Supervisor"></a>
### Supervisor

[Supervisor](http://supervisord.org/) monitors and controls long-running processes on UNIX-like systems.

1. In `.env`, set both `WORKSPACE_INSTALL_SUPERVISOR` and `WORKSPACE_INSTALL_PYTHON` to `true`.
2. Create a worker config in `php-worker/supervisord.d/` by copying `laravel-worker.conf.example`.
3. Rebuild:
   ```bash
   docker-compose build workspace
   ```


<a name="Install-GNU-Parallel"></a>
### GNU Parallel

[GNU Parallel](https://www.gnu.org/software/parallel/parallel_tutorial.html) runs multiple processes concurrently from the command line.

1. In `.env`, set `WORKSPACE_INSTALL_GNU_PARALLEL` to `true`.
2. Rebuild:
   ```bash
   docker-compose build workspace
   ```


<a name="Install-FFMPEG"></a>
### FFmpeg

1. In `.env`, set `WORKSPACE_INSTALL_FFMPEG` to `true`.
2. Rebuild:
   ```bash
   docker-compose build workspace
   ```

> If you queue conversions, also install FFmpeg in the `php-worker` and `php-fpm` containers (same flag pattern) — otherwise the `php-ffmpeg` binary errors out.


<a name="Install-audiowaveform"></a>
### BBC audiowaveform

[audiowaveform](https://github.com/bbc/audiowaveform) generates waveform data from MP3, WAV, FLAC, or Ogg Vorbis files, for rendering visual waveforms.

1. In `.env`, set `WORKSPACE_INSTALL_AUDIOWAVEFORM` to `true`.
2. Rebuild:
   ```bash
   docker-compose build workspace
   ```

> If you queue processing, also install it in the `php-worker`, `laravel-horizon`, and `php-fpm` containers (same flag pattern) — otherwise the `audiowaveform` binary errors out.


<a name="Install-wkhtmltopdf"></a>
### wkhtmltopdf

[wkhtmltopdf](https://wkhtmltopdf.org/) renders a PDF from HTML.

1. In `.env`, set `WORKSPACE_INSTALL_WKHTMLTOPDF` to `true`.
2. Rebuild:
   ```bash
   docker-compose build workspace
   ```

> Also install it in the `php-fpm` container (same flag pattern) — otherwise the `wkhtmltopdf` binary errors out.


<a name="Install-poppler-utils"></a>
### poppler-utils & antiword

[poppler-utils](https://packages.debian.org/sid/poppler-utils) is a set of PDF command-line tools (info, text/image extraction, format conversion, signature verification, and more). It's commonly paired with `antiword`, so Laradock installs both together when the flag is set.

1. In `.env`, set the flag to `true` for each container you need it in: `WORKSPACE_INSTALL_POPPLER_UTILS`, `PHP_FPM_INSTALL_POPPLER_UTILS`, `PHP_WORKER_INSTALL_POPPLER_UTILS`, `LARAVEL_HORIZON_INSTALL_POPPLER_UTILS`.
2. Rebuild the affected containers:
   ```bash
   docker-compose build workspace php-fpm php-worker laravel-horizon
   ```


<a name="Install-GRAPHVIZ"></a>
### Graphviz

[Graphviz](https://graphviz.org/) renders graphs from text descriptions. Enable it in whichever container needs it:

| Container | Flag | Rebuild |
| --------- | ---- | ------- |
| Workspace | `WORKSPACE_INSTALL_GRAPHVIZ` | `docker-compose build workspace` |
| PHP-FPM (most common) | `PHP_FPM_INSTALL_GRAPHVIZ` | `docker-compose build php-fpm` |
| PHP-Worker | `PHP_WORKER_INSTALL_GRAPHVIZ` | `docker-compose build php-worker` |

Set the flag to `true`, then rebuild.


<a name="Install-Dnsutils"></a>
### dnsutils

1. In `.env`, set both flags to `true`:
   - `WORKSPACE_INSTALL_DNSUTILS`
   - `PHP_FPM_INSTALL_DNSUTILS`
2. Rebuild:
   ```bash
   docker-compose build workspace php-fpm
   ```


<a name="Install-github-copilot-cli"></a>
### GitHub Copilot CLI

> Requires GitHub Copilot access.

1. In `.env`, set `WORKSPACE_INSTALL_GITHUB_CLI` to `true`.
2. Rebuild and start the Workspace:
   ```bash
   docker-compose build workspace
   docker-compose up -d workspace
   ```
3. Enter the Workspace:
   ```bash
   docker-compose exec workspace bash
   ```
4. Authenticate, then install the Copilot extension:
   ```bash
   gh auth login
   gh extension install github/gh-copilot
   ```


<a name="Install-Oh-My-Zsh"></a>
### Oh My Zsh

[Oh My Zsh](https://ohmyz.sh/) manages your [Zsh](https://en.wikipedia.org/wiki/Z_shell) configuration. Laradock wires it up with the [Laravel autocomplete plugin](https://github.com/ohmyzsh/ohmyzsh/tree/master/plugins/laravel).

1. In `.env`, set `SHELL_OH_MY_ZSH` to `true`.
2. Rebuild:
   ```bash
   docker-compose build workspace
   ```
3. Use it:
   ```bash
   docker-compose exec --user=laradock workspace zsh
   ```

> Configure it by editing `/home/laradock/.zshrc` in the running container.

**Optional plugins:**

- **Autosuggestions** — set `SHELL_OH_MY_ZSH_AUTOSUGESTIONS` to `true`, then rebuild. Suggests commands as you type, from history and completions ([zsh-autosuggestions](https://github.com/zsh-users/zsh-autosuggestions)).
- **Bash aliases** — set `SHELL_OH_MY_ZSH_ALIASES` to `true`, then rebuild, to load Laradock's `aliases.sh` into Zsh.


<a name="Install-Bash-Git-Prompt"></a>
### Git Bash prompt

A bash prompt showing the current branch, diff with remote, and counts of staged/changed files.

1. In `.env`, set `WORKSPACE_INSTALL_GIT_PROMPT` to `true`.
2. Rebuild:
   ```bash
   docker-compose build workspace
   ```

> Customize it by editing `workspace/gitprompt.sh` and rebuilding. See the [bash-git-prompt repo](https://github.com/magicmonty/bash-git-prompt).


<a name="Common-Aliases"></a>
### Terminal aliases

On startup, Laradock copies `workspace/aliases.sh` into the container and sources it from `~/.bashrc`. Edit that file to add your own aliases or function macros.


<a name="Install-Powerline"></a>
### Powerline

1. In `.env`, set both `WORKSPACE_INSTALL_POWERLINE` and `WORKSPACE_INSTALL_PYTHON` to `true` (Powerline requires Python).
2. Rebuild:
   ```bash
   docker-compose build workspace
   ```




<a name="Use-a-Service"></a>
## Use a Service

Each service runs in its own container. Start the ones you need with `docker-compose up -d {container-name}` and open the port listed below.

<a name="Use-Redis"></a>
### Redis

1. Start the container:
   ```bash
   docker-compose up -d redis
   ```
   > To run Redis commands, enter the container with `docker-compose exec redis bash`, then use `redis-cli`.
2. In your Laravel `.env`, set `REDIS_HOST=redis`. If that variable isn't there, set the host in `config/database.php` instead — replace the default `127.0.0.1` with `redis`:
   ```php
   'redis' => [
       'cluster' => false,
       'default' => [
           'host'     => 'redis',
           'port'     => 6379,
           'database' => 0,
       ],
   ],
   ```
3. To use Redis for cache and sessions, set `CACHE_DRIVER=redis` and `SESSION_DRIVER=redis` in `.env`.
4. Install the client:
   ```bash
   composer require predis/predis:^1.0
   ```
5. Test it from Laravel:
   ```php
   \Cache::store('redis')->put('Laradock', 'Awesome', 10);
   ```


<a name="Use-Redis-Cluster"></a>
### Redis Cluster

1. Start the container:
   ```bash
   docker-compose up -d redis-cluster
   ```
2. Configure the cluster in `config/database.php` (example uses phpredis — see the [Laravel Redis docs](https://laravel.com/docs/redis#configuration)):
   ```php
   'redis' => [
       'client' => 'phpredis',
       'options' => [
           'cluster' => 'redis',
       ],
       'clusters' => [
           'default' => [
               [
                   'host' => 'redis-cluster',
                   'password' => null,
                   'port' => 7000,
                   'database' => 0,
               ],
           ],
       ],
   ],
   ```


<a name="Use-Varnish"></a>
### Varnish

Varnish sits behind NGINX as a caching reverse proxy. NGINX listens on 80/443, forwards to Varnish, and Varnish forwards back to NGINX on port 81 (set by `VARNISH_BACKEND_PORT`). The shipped config was developed and tested for WordPress, but likely works with other systems. The approach is based on [this Linode guide](https://www.linode.com/docs/websites/varnish/use-varnish-and-nginx-to-serve-wordpress-over-ssl-and-http-on-debian-8/).

**Configure:**

1. Set the domain name in `VARNISH_PROXY1_BACKEND_HOST`.
2. To serve multiple domains, add a configuration section per domain in `.env`:
   ```
   VARNISH_PROXY1_CACHE_SIZE=128m
   VARNISH_PROXY1_BACKEND_HOST=replace_with_your_domain.name
   VARNISH_PROXY1_SERVER=SERVER1
   ```
3. Add a matching section to `docker-compose.yml`:
   ```yml
   custom_proxy_name:
         container_name: custom_proxy_name
         build: ./varnish
         expose:
           - ${VARNISH_PORT}
         environment:
           - VARNISH_CONFIG=${VARNISH_CONFIG}
           - CACHE_SIZE=${VARNISH_PROXY2_CACHE_SIZE}
           - VARNISHD_PARAMS=${VARNISHD_PARAMS}
           - VARNISH_PORT=${VARNISH_PORT}
           - BACKEND_HOST=${VARNISH_PROXY2_BACKEND_HOST}
           - BACKEND_PORT=${VARNISH_BACKEND_PORT}
           - VARNISH_SERVER=${VARNISH_PROXY2_SERVER}
         ports:
           - "${VARNISH_PORT}:${VARNISH_PORT}"
         links:
           - workspace
         networks:
           - frontend
   ```
4. Update your Varnish config and add the NGINX config (example: `nginx/sites/laravel_varnish.conf.example`). Use `default_wordpress.vcl` rather than the older `default.vcl`.

**Run:**

1. Rename `default_wordpress.vcl` to `default.vcl`.
2. `docker-compose up -d nginx`
3. `docker-compose up -d proxy`

> Varnish must be built after NGINX, because it checks the domain's availability.

**FAQ:**

- **Purge cache:** `curl -X PURGE https://yourwebsite.com/`
- **Reload Varnish:** `docker container exec proxy varnishreload`
- **Reload NGINX:** `docker exec Nginx nginx -t` then `docker exec Nginx nginx -s reload`
- **Allowed varnish commands:** `varnishadm`, `varnishd`, `varnishhist`, `varnishlog`, `varnishncsa`, `varnishreload`, `varnishstat`, `varnishtest`, `varnishtop`


<a name="Use-phpMyAdmin"></a>
### phpMyAdmin

1. Start it alongside your database:
   ```bash
   # with MySQL
   docker-compose up -d mysql phpmyadmin

   # with MariaDB
   docker-compose up -d mariadb phpmyadmin
   ```
   > For MariaDB, set `PMA_DB_ENGINE=mariadb` in `.env` (default is `mysql`).
2. Open [http://localhost:8081](http://localhost:8081). For the default MySQL setup, use server `mysql`, user `default`, password `secret`.


<a name="Use-Adminer"></a>
### Adminer

1. Start the container:
   ```bash
   docker-compose up -d adminer
   ```
2. Open [http://localhost:8080](http://localhost:8080).

**Notes:**

- Load plugins via `ADM_PLUGINS` in `.env`. Some plugins need parameters and a custom file in the container — see [Loading plugins](https://hub.docker.com/_/adminer).
- Choose a design via `ADM_DESIGN`.
- Set a default host via `ADM_DEFAULT_SERVER` — handy when connecting to an external server or a non-default container name.


<a name="Use-pgAdmin"></a>
### pgAdmin

1. Start it alongside Postgres:
   ```bash
   docker-compose up -d postgres pgadmin
   ```
2. Open [http://localhost:5050](http://localhost:5050).

**Default credentials** — email `pgadmin4@pgadmin.org`, password `admin`.


<a name="Use-ElasticSearch"></a>
### ElasticSearch

1. Start the container:
   ```bash
   docker-compose up -d elasticsearch
   ```
2. Open [http://localhost:9200](http://localhost:9200).

**Default credentials** — user `elastic`, password `changeme`.

**Install a plugin:**

1. Install it:
   ```bash
   docker-compose exec elasticsearch /usr/share/elasticsearch/bin/plugin install {plugin-name}
   ```
2. Restart the container:
   ```bash
   docker-compose restart elasticsearch
   ```


<a name="Use-MeiliSearch"></a>
### MeiliSearch

1. Start the container:
   ```bash
   docker-compose up -d meilisearch
   ```
2. Open [http://localhost:7700](http://localhost:7700).

**Master key** — `masterkey`.


<a name="Use-Typesense"></a>
### Typesense

[Typesense](https://typesense.org) is a fast, typo-tolerant open-source search engine and a drop-in [Laravel Scout](https://laravel.com/docs/scout) driver.

1. Configure it in your `.env` (defaults shown):
   ```dotenv
   TYPESENSE_VERSION=30.2
   TYPESENSE_HOST_PORT=8108
   TYPESENSE_API_KEY=typesense
   ```
2. Start the container:
   ```bash
   docker-compose up -d typesense
   ```
3. The API is available at [http://localhost:8108](http://localhost:8108); health check: `curl http://localhost:8108/health`.

**API key** — `typesense` (change `TYPESENSE_API_KEY` for anything beyond local dev).
<a name="Use-pgvector"></a>
### pgvector (PostgreSQL + vectors)

[pgvector](https://github.com/pgvector/pgvector) is the PostgreSQL extension for vector similarity search, commonly used for AI/RAG features. This service runs a Postgres image with pgvector preinstalled, on its own port and data folder so it can run alongside the regular `postgres` service.

1. Configure it in your `.env` (defaults shown):
   ```dotenv
   PGVECTOR_VERSION=pg17
   PGVECTOR_PORT=5433
   PGVECTOR_DB=default
   PGVECTOR_USER=default
   PGVECTOR_PASSWORD=secret
   ```
2. Start the container:
   ```bash
   docker-compose up -d pgvector
   ```
3. Connect on host port `5433`. The `vector` extension is enabled automatically in `PGVECTOR_DB` on first init (see `pgvector/docker-entrypoint-initdb.d/init.sql`).
<a name="Use-Laravel-Reverb"></a>
### Laravel Reverb

[Laravel Reverb](https://reverb.laravel.com) is Laravel's first-party WebSocket server (a modern replacement for the legacy `laravel-echo-server` / Soketi). This container runs `php artisan reverb:start` against your mounted application code.

1. Install Reverb in your Laravel app (once): `php artisan install:broadcasting` and set `BROADCAST_CONNECTION=reverb` in your app `.env`.
2. Point Reverb at `0.0.0.0` in your app `.env` so it is reachable from the host: `REVERB_HOST=0.0.0.0`, `REVERB_PORT=8080`.
3. Start the container:
   ```bash
   docker-compose up -d laravel-reverb
   ```
4. The WebSocket server is available on host port `8080` (configurable via `LARAVEL_REVERB_PORT`).
<a name="Use-FrankenPHP"></a>
### FrankenPHP

[FrankenPHP](https://frankenphp.dev) is a modern Caddy-based PHP application server and the recommended runtime for [Laravel Octane](https://laravel.com/docs/octane). It serves your app (mounted at `/app`, Laravel docroot `/app/public`) with automatic HTTPS, HTTP/3 and a worker mode.

1. Configure it in your `.env` (defaults shown):
   ```dotenv
   FRANKENPHP_VERSION=1-php8
   FRANKENPHP_HTTP_PORT=8000
   FRANKENPHP_HTTPS_PORT=8443
   ```
2. Start the container:
   ```bash
   docker-compose up -d frankenphp
   ```
3. Your app is served on [https://localhost:8443](https://localhost:8443) (HTTP on `8000` auto-redirects to HTTPS). Add PHP extensions by editing `frankenphp/Dockerfile` (`install-php-extensions ...`). For Octane worker mode, follow the [Octane + FrankenPHP docs](https://laravel.com/docs/octane#frankenphp).


<a name="Use-Beanstalkd"></a>
### Beanstalkd

1. Start the container:
   ```bash
   docker-compose up -d beanstalkd
   ```
2. In `config/queue.php`, set `beanstalkd` as the default driver and `QUEUE_HOST=beanstalkd`. It listens on port `11300`.
3. Install the client:
   ```bash
   composer require pda/pheanstalk
   ```

**Optional web console:**

1. Start it:
   ```bash
   docker-compose up -d beanstalkd-console
   ```
2. Open [http://localhost:2080](http://localhost:2080) (change the port with `BEANSTALKD_CONSOLE_HOST_PORT`).
3. Add the server — host `beanstalkd`, port `11300`.


<a name="Use-Mosquitto"></a>
### Mosquitto (MQTT)

1. Optionally change the port with `MOSQUITTO_PORT` (default `9001`).
2. Start the container:
   ```bash
   docker-compose up -d mosquitto
   ```
3. Use an MQTT client (for example, [MQTT.js](https://github.com/mqttjs/MQTT.js)) to subscribe and publish:
   ```bash
   mqtt sub -t 'test' -h localhost -p 9001 -C 'ws' -v
   mqtt pub -t 'test' -h localhost -p 9001 -C 'ws' -m 'Hello!'
   ```


<a name="Use-Kafka"></a>
### Apache Kafka

> A distributed event-streaming platform. Kafka needs the `zookeeper` container running.

1. Start ZooKeeper and Kafka together:
   ```bash
   docker-compose up -d zookeeper kafka
   ```
2. The broker listens on port `9092`.

To manage Kafka from a web UI, also start Kafka Manager:

```bash
docker-compose up -d kafka-manager
```

Open [http://localhost:9020](http://localhost:9020) and add a cluster pointing at the ZooKeeper host `zookeeper:2181`.


<a name="Use-Mailu"></a>
### Mailu

1. You'll need a registered domain and a [reCAPTCHA key pair](https://www.google.com/recaptcha/admin) for signup email.
2. Set these in `.env`:
   ```
   MAILU_RECAPTCHA_PUBLIC_KEY=<YOUR_RECAPTCHA_PUBLIC_KEY>
   MAILU_RECAPTCHA_PRIVATE_KEY=<YOUR_RECAPTCHA_PRIVATE_KEY>
   MAILU_DOMAIN=laradock.io
   MAILU_HOSTNAMES=mail.laradock.io
   ```
3. Open `http://YOUR_DOMAIN`.


<a name="use Mailpit"></a>
### Mailpit

1. Start the container:
   ```bash
   docker-compose up -d mailpit
   ```
2. Open [http://localhost:8125](http://localhost:8125).
3. Configure your Laravel `.env`:
   ```text
   MAIL_MAILER=smtp
   MAIL_HOST=mailpit
   MAIL_PORT=1125
   MAIL_USERNAME=null
   MAIL_PASSWORD=null
   ```


<a name="Use-Grafana"></a>
### Grafana

1. Optionally change the port with `GRAFANA_PORT` (default `3000`).
2. Start the container:
   ```bash
   docker-compose up -d grafana
   ```
3. Open [http://localhost:3000](http://localhost:3000).

**Default credentials** — user `admin`, password `admin`.


<a name="Use-Graylog"></a>
### Graylog

1. Set a password in your Laravel `.env`. `GRAYLOG_SHA256_PASSWORD` is what's used; `GRAYLOG_PASSWORD` is just a reminder of the plain text. The password must be at least 16 characters.
   ```env
   GRAYLOG_PASSWORD=somesupersecretpassword
   GRAYLOG_SHA256_PASSWORD=b1cb6e31e172577918c9e7806c572b5ed8477d3f57aa737bee4b5b1db3696f09
   ```
   > Generate the hash with: `echo -n somesupersecretpassword | sha256sum`
2. Start the container:
   ```bash
   docker-compose up -d graylog
   ```
3. Open [http://localhost:9000](http://localhost:9000) and sign in as `admin` with your password.
4. Go to **System → Inputs** and launch a new input.


<a name="Use-NetData"></a>
### NetData

1. Start the container:
   ```bash
   docker-compose up -d netdata
   ```
2. Open [http://localhost:19999](http://localhost:19999).


<a name="Use-Tarantool"></a>
### Tarantool

1. Optionally set `TARANTOOL_PORT` and `TARANTOOL_ADMIN_PORT` (defaults `3301` and `8002`).
2. Start both containers:
   ```bash
   docker-compose up -d tarantool tarantool-admin
   ```
3. Open the admin tool at [http://localhost:8002](http://localhost:8002) and set **Hostname** to `tarantool` — your data then appears in the panel.
4. To use the console:
   ```bash
   docker-compose exec tarantool console
   ```

See the [Tarantool documentation](https://www.tarantool.io/en/doc/latest/).


<a name="Use-Jenkins"></a>
### Jenkins

1. Start the container:
   ```bash
   docker-compose up -d jenkins
   ```
2. Open [http://localhost:8090/](http://localhost:8090/).
3. Sign in — default user `admin`, password from:
   ```bash
   docker-compose exec jenkins cat /var/jenkins_home/secrets/initialAdminPassword
   ```
4. Install plugins and create your admin user.

**Notes:**

- Enter as root with `docker-compose exec --user root jenkins bash`.
- Add a user at `http://localhost:8090/securityRealm/addUser`; restart at `http://localhost:8090/restart`.
- Review authorization at `http://localhost:8090/configureSecurity/`.


<a name="Use-Gitlab"></a>
### GitLab

1. Start the container:
   ```bash
   docker-compose up -d gitlab
   ```
2. Open [http://localhost:8989](http://localhost:8989).

> Set your own domain with `GITLAB_DOMAIN_NAME` (default `http://localhost`).


<a name="Use-Gitlab-Runner"></a>
### GitLab Runner

1. Get the registration token from your GitLab project (**Settings → CI/CD → Runners**).
2. Set these in `.env`:
   ```
   GITLAB_DOMAIN_NAME=http://gitlab
   GITLAB_RUNNER_REGISTRATION_TOKEN=<value-from-step-1>
   GITLAB_CI_SERVER_URL=http://gitlab
   ```
3. Add runner settings to `docker-compose.yml`:
   ```yml
   gitlab-runner:
     environment: # used during `gitlab-runner register`
       - RUNNER_EXECUTOR=docker # change from shell (default)
       - DOCKER_IMAGE=alpine
       - DOCKER_NETWORK_MODE=laradock_backend
     networks:
       - backend # connect to the network where gitlab runs
   ```
4. Start the runner:
   ```bash
   docker-compose up -d gitlab-runner
   ```
5. Register it:
   ```bash
   docker-compose exec gitlab-runner bash
   gitlab-runner register
   ```
6. Add a `.gitlab-ci.yml` to your project, push, and confirm the pipeline runs:
   ```yml
   before_script:
     - echo Hello!

   job1:
     scripts:
       - echo job1
   ```


<a name="Install-SonarQube"></a>
### SonarQube

> [SonarQube](https://docs.sonarqube.org/latest/) is an automatic code-review tool that detects bugs, vulnerabilities, and code smells across branches and pull requests.

1. In `.env`, set `SONARQUBE_HOSTNAME` to your domain (for example, `sonar.example.com`).
2. Start the container:
   ```bash
   docker-compose up -d sonarqube
   ```
3. Open [http://localhost:9000/](http://localhost:9000/).

**Troubleshooting:**

- Database error:
  ```bash
  docker-compose exec --user=root postgres
  source docker-entrypoint-initdb.d/init_sonarqube_db.sh
  ```
- Logs error:
  ```bash
  docker-compose run --user=root --rm sonarqube chown sonarqube:sonarqube /opt/sonarqube/logs
  ```


<a name="Use-OneDev"></a>
### OneDev

> A self-hosted Git server with built-in CI/CD pipelines and issue tracking.

1. Start the container:
   ```bash
   docker-compose up -d onedev
   ```
2. Open [http://localhost:6610](http://localhost:6610) and complete the setup wizard.

Git over SSH is available on port `6611`. Change either port with `ONEDEV_HTTP_PORT` and `ONEDEV_SSH_PORT` in `.env`.


<a name="Use-Portainer"></a>
### Portainer

1. Start the container:
   ```bash
   docker-compose up -d portainer
   ```
2. Open [http://localhost:9010](http://localhost:9010).


<a name="Use-Minio"></a>
### Minio

1. Configure it: tweak the `MINIO_*` settings in `.env`, and optionally install the Minio client in the Workspace with `WORKSPACE_INSTALL_MC=true`.
2. Start the container:
   ```bash
   docker-compose up -d minio
   ```
3. Open [http://localhost:9000](http://localhost:9000).
4. Create a bucket via the web UI or the client:
   ```bash
   mc mb minio/bucket
   ```
5. Point your clients at it:
   ```
   AWS_URL=http://minio:9000
   AWS_ACCESS_KEY_ID=access
   AWS_SECRET_ACCESS_KEY=secretkey
   AWS_DEFAULT_REGION=us-east-1
   AWS_BUCKET=test
   AWS_USE_PATH_STYLE_ENDPOINT=true
   ```
6. Configure the `s3` disk in `filesystems.php`:
   ```php
   's3' => [
       'driver' => 's3',
       'key' => env('AWS_ACCESS_KEY_ID'),
       'secret' => env('AWS_SECRET_ACCESS_KEY'),
       'region' => env('AWS_DEFAULT_REGION'),
       'bucket' => env('AWS_BUCKET'),
       'endpoint' => env('AWS_URL'),
       'use_path_style_endpoint' => env('AWS_USE_PATH_STYLE_ENDPOINT', false)
   ],
   ```

> Set `AWS_USE_PATH_STYLE_ENDPOINT=true` for local use only.


<a name="Use-Thumbor"></a>
### Thumbor

[Thumbor](https://github.com/thumbor/thumbor) is a smart imaging service for on-demand cropping, resizing, and flipping of images.

1. Review the Thumbor settings in `.env`.
2. Start the container:
   ```bash
   docker-compose up -d thumbor
   ```
3. Try an example: `http://localhost:8000/unsafe/300x300/i.imgur.com/bvjzPct.jpg`

See the [Thumbor documentation](http://thumbor.readthedocs.io/en/latest/index.html).


<a name="Use-AWS"></a>
### AWS EB CLI

1. Add your SSH keys to the `aws-eb-cli/ssh_keys` folder.
2. Start the container:
   ```bash
   docker-compose up -d aws
   ```
3. Enter it:
   ```bash
   docker-compose exec aws bash
   ```
4. Initialize your project with `eb init`. See the [EB CLI docs](http://docs.aws.amazon.com/elasticbeanstalk/latest/dg/eb-cli3-configuration.html).


<a name="use Keycloak"></a>
### Keycloak

1. Start the container:
   ```bash
   docker-compose up -d keycloak
   ```
2. Open [http://localhost:8081](http://localhost:8081).

**Default credentials** — user `admin`, password `secret`.


<a name="Use-Metabase"></a>
### Metabase

1. Start the container:
   ```bash
   docker-compose up -d metabase
   ```
2. Open [http://localhost:3030](http://localhost:3030).

See [Running Metabase on Docker](https://www.metabase.com/docs/latest/installation-and-operation/running-metabase-on-docker) for configuration.


<a name="Use-Confluence"></a>
### Confluence

> Confluence is a licensed Atlassian product — get an evaluation licence from Atlassian.

1. Start the container:
   ```bash
   docker-compose up -d confluence
   ```
2. Open [http://localhost:8090](http://localhost:8090).

> Pin a version with `CONFLUENCE_VERSION`. See [versioning](https://hub.docker.com/r/atlassian/confluence-server/).

**With NGINX and SSL:**

1. Copy `nginx/sites/confluence.conf.example` and replace the sample domain with yours.
2. Configure SSL keys for your domain.

> Confluence stays reachable on 8090 regardless.


<a name="Use-Selenium"></a>
### Selenium

1. Start the container:
   ```bash
   docker-compose up -d selenium
   ```
2. Open [http://localhost:4444/wd/hub](http://localhost:4444/wd/hub).


<a name="Use-Tomcat"></a>
### Tomcat

> Apache Tomcat for running Java web applications (WAR files).

1. Start the container:
   ```bash
   docker-compose up -d tomcat
   ```
2. Open [http://localhost:8080](http://localhost:8080).

Drop `.war` files into `${DATA_PATH_HOST}/tomcat/webapps` to deploy them. Set the version with `TOMCAT_VERSION` and the host port with `TOMCAT_HOST_HTTP_PORT` in `.env`.


<a name="Use-Traefik"></a>
### Traefik

Traefik is a reverse proxy that terminates TLS and routes to your containers via labels. To use it, don't expose each container's ports — define Traefik labels instead.

1. In `.env`, set `ACME_DOMAIN` to your domain and `ACME_EMAIL` to your email.
2. Update `docker-compose.yml` so the routed container uses labels rather than published ports. For example, NGINX becomes:
   ```bash
   nginx:
     build:
       context: ./nginx
       args:
         - PHP_UPSTREAM_CONTAINER=${NGINX_PHP_UPSTREAM_CONTAINER}
         - PHP_UPSTREAM_PORT=${NGINX_PHP_UPSTREAM_PORT}
         - CHANGE_SOURCE=${CHANGE_SOURCE}
     volumes:
       - ${APP_CODE_PATH_HOST}:${APP_CODE_PATH_CONTAINER}
       - ${NGINX_HOST_LOG_PATH}:/var/log/nginx
       - ${NGINX_SITES_PATH}:/etc/nginx/sites-available
     depends_on:
       - php-fpm
     networks:
       - frontend
       - backend
     labels:
       - "traefik.enable=true"
       - "traefik.http.services.nginx.loadbalancer.server.port=80"
       # https router
       - "traefik.http.routers.https.rule=Host(`${ACME_DOMAIN}`, `www.${ACME_DOMAIN}`)"
       - "traefik.http.routers.https.entrypoints=https"
       - "traefik.http.routers.https.middlewares=www-redirectregex"
       - "traefik.http.routers.https.service=nginx"
       - "traefik.http.routers.https.tls.certresolver=letsencrypt"
       # http router
       - "traefik.http.routers.http.rule=Host(`${ACME_DOMAIN}`, `www.${ACME_DOMAIN}`)"
       - "traefik.http.routers.http.entrypoints=http"
       - "traefik.http.routers.http.middlewares=http-redirectscheme"
       - "traefik.http.routers.http.service=nginx"
       # middlewares
       - "traefik.http.middlewares.www-redirectregex.redirectregex.permanent=true"
       - "traefik.http.middlewares.www-redirectregex.redirectregex.regex=^https://www.(.*)"
       - "traefik.http.middlewares.www-redirectregex.redirectregex.replacement=https://$$1"
       - "traefik.http.middlewares.http-redirectscheme.redirectscheme.permanent=true"
       - "traefik.http.middlewares.http-redirectscheme.redirectscheme.scheme=https"
   ```
   instead of the port-publishing version:
   ```bash
   nginx:
     build:
       context: ./nginx
       args:
         - PHP_UPSTREAM_CONTAINER=${NGINX_PHP_UPSTREAM_CONTAINER}
         - PHP_UPSTREAM_PORT=${NGINX_PHP_UPSTREAM_PORT}
         - CHANGE_SOURCE=${CHANGE_SOURCE}
     volumes:
       - ${APP_CODE_PATH_HOST}:${APP_CODE_PATH_CONTAINER}
       - ${NGINX_HOST_LOG_PATH}:/var/log/nginx
       - ${NGINX_SITES_PATH}:/etc/nginx/sites-available
       - ${NGINX_SSL_PATH}:/etc/nginx/ssl
     ports:
       - "${NGINX_HOST_HTTP_PORT}:80"
       - "${NGINX_HOST_HTTPS_PORT}:443"
     depends_on:
       - php-fpm
     networks:
       - frontend
       - backend
   ```




## Networking & Domains

<a name="Use-custom-Domain"></a>
### Use a custom domain

> Use a real domain instead of the Docker IP. Assuming your domain is `laravel.test`:

1. Map it to localhost in your `/etc/hosts`:
   ```bash
   127.0.0.1    laravel.test
   ```
2. Open `http://laravel.test`.

Optionally set the server name in your NGINX config:

```conf
server_name laravel.test;
```


<a name="ca-certificates"></a>
### Add CA certificates

To install your own CA certificates, drop them in the `workspace/ca-certificates` folder. They're added to the workspace container's system CA store on build.




<a name="Production"></a>
## Production & Deployment

<a name="Laradock-for-Production"></a>
### Prepare Laradock for production

For production, create a dedicated Compose file — for example `production-docker-compose.yml` — that includes only the containers you'll actually run:

```bash
docker-compose -f production-docker-compose.yml up -d nginx mysql redis ...
```

> **Security:** do not forward database ports in production. Docker publishes them on the host unless told otherwise, which is insecure. Remove lines like:
> ```yml
> ports:
>     - "3306:3306"
> ```
> See [this post on Docker and iptables](https://fralef.me/docker-and-iptables.html) for why.


<a name="Setup-gcloud"></a>
### Set up Google Cloud

Configure Docker for the Google Container Registry, then authenticate:

```bash
gcloud auth configure-docker
gcloud auth login
```




<a name="Misc"></a>
## Environment & Platform

Workspace access, host-specific tuning, and scheduling.

<a name="Workspace-ssh"></a>
### Access the workspace over SSH

Reach the Workspace at `localhost:2222` by setting `INSTALL_WORKSPACE_SSH` to `true`.

To change the forwarded port, edit `docker-compose.yml`:

```yml
    workspace:
        ports:
            - "2222:22" # edit this line
    ...
```

Then connect:

```bash
ssh -o PasswordAuthentication=no    \
    -o StrictHostKeyChecking=no     \
    -o UserKnownHostsFile=/dev/null \
    -p 2222                         \
    -i workspace/insecure_id_rsa    \
    laradock@localhost
```

> Replace `laradock@localhost` with `root@localhost` to log in as root.


<a name="Change-the-timezone"></a>
### Change the timezone

Set the `TZ` build argument for the `workspace` container in `docker-compose.yml` to any value from the [TZ database](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones). For example, New York:

```yml
    workspace:
        build:
            context: ./workspace
            args:
                - TZ=America/New_York
    ...
```

We also recommend [setting the timezone in Laravel](http://www.camroncade.com/managing-timezones-with-laravel/).


<a name="Add locales to PHP-FPM"></a>
### Add locales to PHP-FPM

**Add locales:**

1. In `.env`, set `PHP_FPM_INSTALL_ADDITIONAL_LOCALES` to `true`.
2. Add the locale codes to `PHP_FPM_ADDITIONAL_LOCALES`.
3. Rebuild: `docker-compose build php-fpm`.
4. Check them: `docker-compose exec php-fpm locale -a`.

**Change the default locale** (default is `POSIX`):

1. In `.env`, set `PHP_FPM_DEFAULT_LOCALE` to your locale, for example `en_US.UTF8`.
2. Rebuild: `docker-compose build php-fpm`.
3. Check it: `docker-compose exec php-fpm locale`.


<a name="CronJobs"></a>
### Add cron jobs

Add your cron jobs to `workspace/crontab/laradock`, after the `php artisan` line:

```
* * * * * laradock /usr/bin/php /var/www/artisan schedule:run >> /dev/null 2>&1

# Custom cron
* * * * * root echo "Every Minute" > /var/log/cron.log 2>&1
```

> [Change the timezone](#change-the-timezone) if you don't want UTC. On Windows, make sure this file uses LF line endings, or the cron jobs silently fail.


<a name="Speed-MacOS"></a>
### Improve speed on macOS

Sharing code into containers via osxfs is slower than on Linux, which can hurt on larger projects ([background](https://github.com/docker/for-mac/issues/77)). Modern Docker Desktop's VirtioFS reduces this a lot; if you still need more, the workarounds below help.

#### Workaround A: Dinghy

[Dinghy](https://github.com/codekitchen/dinghy) creates its own VM via docker-machine without touching your existing docker-machine VMs.

1. `brew tap codekitchen/dinghy`
2. `brew install dinghy`
3. `dinghy create --provider virtualbox` (VirtualBox required; other providers are supported)
4. Copy the env variables it prints into your shell profile so Docker uses the VM's server.
5. `docker-compose up ...`

<a name="Docker-Sync"></a>
#### Workaround B: d4m-nfs

You can use d4m-nfs either through Laradock's built-in integration or as a standalone tool.

**B.1 — Built-in docker-sync integration**

docker-sync runs an intermediate container holding a copy of your app files that the other containers read quickly, while a host process continuously syncs changes into it. It's preconfigured for macOS and works on Windows by changing `DOCKER_SYNC_STRATEGY`.

Laradock ships `sync.sh` to install, run, and stop docker-sync (you may need `chmod 755 sync.sh`).

1. Configure Laradock as usual and confirm your sites work.
2. Set `DOCKER_SYNC_STRATEGY` in `.env` (see the [syncing strategies](https://github.com/EugenMayer/docker-sync/wiki/8.-Strategies)):
   ```
   # osx: 'native_osx' (default)
   # windows: 'unison'
   # linux: docker-sync not required

   DOCKER_SYNC_STRATEGY=native_osx
   ```
3. Set `APP_CODE_CONTAINER_FLAG=:nocopy` in `.env`.
4. Install the docker-sync gem on the host:
   ```bash
   ./sync.sh install
   ```
5. Start docker-sync and the environment, naming the services you want (as with `docker-compose up`):
   ```bash
   ./sync.sh up nginx mysql
   ```
   > The first run copies all files into the intermediate container, which can take 15+ minutes.
6. Stop everything:
   ```bash
   ./sync.sh down
   ```

*Optional aliases* — add to `~/.bash_profile` to avoid retyping:

```bash
alias devup="cd /PATH_TO_LARADOCK/laradock; ./sync.sh up nginx mysql" #add your services
alias devbash="cd /PATH_TO_LARADOCK/laradock; ./sync.sh bash"
alias devdown="cd /PATH_TO_LARADOCK/laradock; ./sync.sh down"
```

*Additional commands:*

```bash
./sync.sh bash    # open bash on the workspace container
./sync.sh sync    # manually trigger a sync
./sync.sh clean   # remove the docker-sync container (host files untouched)
```

*Notes:*

- You can run Laradock with or without docker-sync using the same `.env` and `docker-compose.yml` — the config is overridden automatically when docker-sync is used.
- If a container can't access the synced files, set a user with UID 1000 in its Dockerfile (the UID nginx and php-fpm use). Changing permissions to 777 works but isn't recommended.

See the [docker-sync documentation](https://github.com/EugenMayer/docker-sync/wiki).

**B.2 — Standalone d4m-nfs tool**

[d4m-nfs](https://github.com/IFSight/d4m-nfs) mounts an NFS volume instead of osxfs.

1. In Docker's **File Sharing** preferences, remove everything except `/tmp`.
2. Restart Docker.
3. Clone d4m-nfs into your home directory:
   ```bash
   git clone https://github.com/IFSight/d4m-nfs ~/d4m-nfs
   ```
4. Create `~/d4m-nfs/etc/d4m-nfs-mounts.txt` with:
   ```txt
   /Users:/Users
   ```
5. Make sure `/etc/exports` exists and is empty (watch for collisions from Vagrant or a previous run).
6. Run the script (may need sudo):
   ```bash
   ~/d4m-nfs/d4m-nfs.sh
   ```
7. Start your containers: `docker-compose up ...`

> If you hit errors, restart Docker, ensure there are no spaces in `d4m-nfs-mounts.txt`, and confirm `/etc/exports` is clear.




## Maintenance

<a name="keep-tracking-Laradock"></a>
### Track your Laradock changes

To keep your Laradock customizations under version control while staying able to pull upstream updates:

1. Fork the Laradock repository.
2. Use your fork as a submodule.
3. Commit your changes to your fork.
4. Pull from the main repository periodically.


<a name="upgrade-laradock"></a>
### Upgrade Laradock

Moving from Docker Toolbox (VirtualBox) to Docker Desktop, and Laradock v3 to v4:

1. Stop the docker VM: `docker-machine stop {default}`.
2. Install [Docker Desktop for Mac](https://docs.docker.com/docker-for-mac/) or [Windows](https://docs.docker.com/docker-for-windows/).
3. Upgrade Laradock to `v4.*.*`: `git pull origin master`.
4. Use Laradock as usual: `docker-compose up -d nginx mysql`.

> If the last step fails, rebuild everything with `docker-compose build --no-cache`. **Warning:** container data might be lost.
