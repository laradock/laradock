# LaraDock

[![forthebadge](http://forthebadge.com/images/badges/built-by-developers.svg)](http://zalt.me)

[![Gitter](https://badges.gitter.im/LaraDock/laradock.svg)](https://gitter.im/LaraDock/laradock?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge)

LaraDock is a Docker PHP development environment. It facilitate running **PHP** Apps on **Docker**.

>Use Docker first and learn about it later.






<a name="Intro"></a>
## Intro

LaraDock strives to make the PHP development experience easier and faster.

It contains pre-packaged Docker Images that provides you a wonderful *development* environment without requiring you to install PHP, NGINX, MySQL, Redis, and any other software on your machines.

LaraDock is configured to run Laravel Apps by default, and it can be modified to run all kinds of PHP Apps (Symfony, CodeIgniter, WordPress, Drupal...).






## Contents

- [Readme Languages](#)
	- [English (Default)](#)
	- [Chinese](https://github.com/laradock/laradock/blob/master/README-zh.md)
- [Intro](#Intro)
	- [Features](#features)
	- [Supported Software](#Supported-Containers)
	- [What is Docker](#what-is-docker)
	- [Why Docker not Vagrant](#why-docker-not-vagrant)
	- [LaraDock VS Homestead](#laradock-vs-homestead)
- [Demo Video](#Demo)
- [Requirements](#Requirements)
- [Installation](#Installation)
- [Usage](#Usage)
- [Documentation](#Documentation)
	- [Docker](#Docker)
		- [List current running Containers](#List-current-running-Containers)
		- [Close all running Containers](#Close-all-running-Containers)
		- [Delete all existing Containers](#Delete-all-existing-Containers)
		- [Enter a Container (run commands in a running Container)](#Enter-Container)
		- [Edit default container configuration](#Edit-Container)
		- [Edit a Docker Image](#Edit-a-Docker-Image)
		- [Build/Re-build Containers](#Build-Re-build-Containers)
		- [Add more Software (Docker Images)](#Add-Docker-Images)
		- [View the Log files](#View-the-Log-files)
	- [PHP](#PHP)
		- [Install PHP Extensions](#Install-PHP-Extensions)
		- [Change the PHP-FPM Version](#Change-the-PHP-FPM-Version)
		- [Change the PHP-CLI Version](#Change-the-PHP-CLI-Version)
		- [Install xDebug](#Install-xDebug)
		    - [Start/Stop xDebug](#Control-xDebug)
		- [Install Deployer](#Install-Deployer)
	- [Production](#Production)
		- [Prepare LaraDock for Production](#LaraDock-for-Production)
		- [Setup Laravel and Docker on Digital Ocean](#Digital-Ocean)
	- [Laravel](#Laravel):
		- [Install Laravel from a Docker Container](#Install-Laravel)
		- [Run Artisan Commands](#Run-Artisan-Commands)
		- [Run Laravel Queue Worker](#Run-Laravel-Queue-Worker)
		- [Use Redis](#Use-Redis)
		- [Use Mongo](#Use-Mongo)
		- [Use PhpMyAdmin](#Use-phpMyAdmin)
		- [Use PgAdmin](#Use-pgAdmin)
		- [Use Beanstalkd](#Use-Beanstalkd)
		- [Use ElasticSearch](#Use-ElasticSearch)
		- [Use Selenium](#Use-Selenium)
		- [Use RethinkDB](#Use-RethinkDB)
	- [CodeIgniter](#CodeIgniter):
		- [Install CodeIgniter](#Install-CodeIgniter)
	- [Misc](#Misc)
		- [Change the timezone](#Change-the-timezone)
		- [Adding cron jobs](#CronJobs)
		- [Access workspace via ssh](#Workspace-ssh)
		- [MySQL access from host](#MySQL-access-from-host)
		- [MySQL root access](#MySQL-root-access)
		- [Change MySQL port](#Change-MySQL-port)
		- [Use custom Domain](#Use-custom-Domain)
		- [Enable Global Composer Build Install](#Enable-Global-Composer-Build-Install)
		- [Install Prestissimo](#Install-Prestissimo)
		- [Install Node + NVM](#Install-Node)
		- [Install Node + YARN](#Install-Yarn)
		- [Install Linuxbrew](#Install-Linuxbrew)
		- [Common Terminal Aliases](#Common-Aliases)
		- [Install Aerospike extension](#Install-Aerospike-Extension)
		- [Install Laravel Envoy](#Install-Laravel-Envoy)
		- [PHPStorm Debugging Guide](#phpstorm-debugging)
		- [Keep track of your LaraDock changes](#keep-tracking-LaraDock)
		- [Upgrading LaraDock](#upgrading-laradock)
		- [Improve speed on MacOS](#Speed-MacOS)
	- [Common Problems](#Common-Problems)
- [Related Projects](#related-projects)
- [Help & Questions](#Help)





### Quick Overview:

Let's see how easy it is to install `NGINX`, `PHP`, `Composer`, `MySQL`, `Redis` and `beanstalkd`:

1 - Clone LaraDock inside your PHP project:

```shell
git clone https://github.com/Laradock/laradock.git
```

2 - Enter the laradock folder and run this command:

```shell
docker-compose up -d nginx mysql redis beanstalkd
```

3 - Open your `.env` file and set the following:

```shell
DB_HOST=mysql
REDIS_HOST=redis
QUEUE_HOST=beanstalkd
```

4 - Open your browser and visit localhost: `http://localhost`.

```shell
That's it! enjoy :)
```





<a name="features"></a>
### Features

- Easy switch between PHP versions: 7.0, 5.6, 5.5...
- Choose your favorite database engine: MySQL, Postgres, MariaDB...
- Run your own combination of software: Memcached, HHVM, Beanstalkd...
- Every software runs on a separate container: PHP-FPM, NGINX, PHP-CLI...
- Easy to customize any container, with simple edit to the `Dockerfile`.
- All Images extends from an official base Image. (Trusted base Images).
- Pre-configured NGINX for Laravel.
- Easy to apply configurations inside containers.
- Clean and well structured Dockerfiles (`Dockerfile`).
- Latest version of the Docker Compose file (`docker-compose`).
- Everything is visible and editable.
- Fast Images Builds.
- More to come every week..






<a name="Supported-Containers"></a>
### Supported Software (Containers)

- **Database Engines:**
	- MySQL
	- PostgreSQL
	- MariaDB
	- MongoDB
	- Neo4j
	- RethinkDB
- **Cache Engines:**
	- Redis
	- Memcached
	- Aerospike
- **PHP Servers:**
	- NGINX
	- Apache2
	- Caddy
- **PHP Compilers:**
	- PHP-FPM
	- HHVM
- **Message Queuing Systems:**
	- Beanstalkd
	- Beanstalkd Console
	- RabbitMQ
	- RabbitMQ Console
- **Tools:**
	- PhpMyAdmin
	- PgAdmin
	- ElasticSearch
	- Selenium
	- Workspace
		- PHP7-CLI
		- Composer
		- Git
		- Linuxbrew
		- Node
		- Gulp
		- SQLite
		- xDebug
		- Envoy
		- Deployer
		- Vim
		- Yarn
		- ... Many other supported tools are not documented. (Will be updated soon)

>If you can't find your Software, build it yourself and add it to this list. Contributions are welcomed :)






<a name="what-is-docker"></a>
### What is Docker?

[Docker](https://www.docker.com) is an open-source project that automates the deployment of applications inside software containers, by providing an additional layer of abstraction and automation of [operating-system-level virtualization](https://en.wikipedia.org/wiki/Operating-system-level_virtualization) on Linux, Mac OS and Windows.






<a name="why-docker-not-vagrant"></a>
### Why Docker not Vagrant!?

[Vagrant](https://www.vagrantup.com) creates Virtual Machines in minutes while Docker creates Virtual Containers in seconds.

Instead of providing a full Virtual Machines, like you get with Vagrant, Docker provides you **lightweight** Virtual Containers, that share the same kernel and allow to safely execute independent processes.

In addition to the speed, Docker gives tons of features that cannot be achieved with Vagrant.

Most importantly Docker can run on Development and on Production (same environment everywhere). While Vagrant is designed for Development only, (so you have to re-provision your server on Production every time).






<a name="laradock-vs-homestead"></a>
### LaraDock VS Homestead (For Laravel Developers)

> LaraDock It's like Laravel Homestead but for Docker instead of Vagrant.

LaraDock and [Homestead](https://laravel.com/docs/master/homestead) both give you complete virtual development environments. (Without the need to install and configure every single software on your own Operating System).

- Homestead is a tool that controls Vagrant for you (using Homestead special commands). And Vagrant manages your Virtual Machine.

- LaraDock is a tool that controls Docker for you (using Docker & Docker Compose official commands). And Docker manages your Virtual Containers.

Running a virtual container is much faster than running a full virtual Machine. Thus **LaraDock is much faster than Homestead**.






<a name="Demo"></a>
## Demo Video

What's better than a **Demo Video**:

- LaraDock [v4.*](https://www.youtube.com/watch?v=TQii1jDa96Y)
- LaraDock [v2.*](https://www.youtube.com/watch?v=-DamFMczwDA)
- LaraDock [v0.3](https://www.youtube.com/watch?v=jGkyO6Is_aI)
- LaraDock [v0.1](https://www.youtube.com/watch?v=3YQsHe6oF80)






<a name="Requirements"></a>
## Requirements

- [Git](https://git-scm.com/downloads)
- [Docker](https://www.docker.com/products/docker/) `>= 1.12`





<a name="Installation"></a>
## Installation

Choose the setup the best suits your needs.

#### A) Setup for Single Project:
*(In case you want a Docker environment for each project)*

##### A.1) Setup environment in existing Project:
*(In case you already have a project, and you want to setup an environment to run it)*

1 - Clone this repository on your project root directory:

```bash
git submodule add https://github.com/Laradock/laradock.git
```

*Note 1: If you are not yet using Git for your PHP project, you can use `git clone https://github.com/Laradock/laradock.git` instead.*

*Note 2: To keep track of your LaraDock changes, between your projects and also keep LaraDock updated. [Check this](#keep-tracking-LaraDock)*

*Note 3: In this case the folder structure will be like this:*

```
- project1
	- laradock
- project2
	- laradock
```

##### A.2) Setup environment first then create project:
*(In case you don't have a project, and you want to create your project inside the Docker environment)*

1 - Clone this repository anywhere on your machine:

```bash
git clone https://github.com/laradock/laradock.git
```
Note: In this case the folder structure will be like this:

```
- projects
	- laradock
	- myProject
```

2 - Edit the `docker-compose.yml` file to map to your project directory once you have it (example: `- ../myProject:/var/www`).

3 - Stop and re-run your docker-compose command for the changes to take place.

```
docker-compose stop && docker-compose up -d XXXX YYYY ZZZZ ....
```


#### B) Setup for Multiple Projects:

1 - Clone this repository anywhere on your machine:

```bash
git clone https://github.com/laradock/laradock.git
```

2 - Edit the `docker-compose.yml` file to map to your projects directories:

```
    applications:
        image: tianon/true
        volumes:
            - ../project1/:/var/www/project1
            - ../project2/:/var/www/project2
```

3 - You can access all sites by visiting `http://localhost/project1/public` and `http://localhost/project2/public` but of course that's not very useful so let's setup NGINX quickly.


4 - Go to `nginx/sites` and copy `sample.conf.example` to `project1.conf` then to `project2.conf`

5 - Open the `project1.conf` file and edit the `server_name` and the `root` as follow:

```
    server_name project1.dev;
    root /var/www/project1/public;
```
Do the same for each project `project2.conf`, `project3.conf`,...

6 - Add the domains to the **hosts** files.

```
127.0.0.1  project1.dev
```

7 - Create your project Databases. Right now you have to do it manually by entering your DB container, until we automate it soon.


<a name="Usage"></a>
## Usage

**Read Before starting:**

If you are using **Docker Toolbox** (VM), do one of the following:

- Upgrade to Docker [Native](https://www.docker.com/products/docker) for Mac/Windows (Recommended). Check out [Upgrading LaraDock](#upgrading-laradock)
- Use LaraDock v3.* (Visit the `LaraDock-ToolBox` [Branch](https://github.com/laradock/laradock/tree/LaraDock-ToolBox)).

<br>

>**Warning:** If you used an older version of LaraDock it's highly recommended to rebuild the containers you need to use [see how you rebuild a container](#Build-Re-build-Containers) in order to prevent errors as much as possible.

<br>

1 - Run Containers: *(Make sure you are in the `laradock` folder before running the `docker-compose` commands).*



**Example:** Running NGINX and MySQL:

```bash
docker-compose up -d nginx mysql
```

**Note**: The `workspace` and `php-fpm` will run automatically in most of the cases, so no need to specify them in the `up` command. If you couldn't find them running then you need specify them as follow: `docker-compose up -d nginx php-fpm mysql workspace`.


You can select your own combination of Containers form the list below:

`nginx`, `hhvm`, `php-fpm`, `mysql`, `redis`, `postgres`, `mariadb`, `neo4j`, `mongo`, `apache2`, `caddy`, `memcached`, `beanstalkd`, `beanstalkd-console`, `rabbitmq`, `workspace`, `phpmyadmin`, `aerospike`, `pgadmin`, `elasticsearch`, `rethinkdb`.


<br>
2 - Enter the Workspace container, to execute commands like (Artisan, Composer, PHPUnit, Gulp, ...).

```bash
docker-compose exec workspace bash
```

Alternatively, for Windows PowerShell users: execute the following command to enter any running container:

```bash
docker exec -it {workspace-container-id} bash
```

**Note:** You can add `--user=laradock` (example `docker-compose exec --user=laradock workspace bash`) to have files created as your host's user. (you can change the PUID (User id) and PGID (group id) variables from the `docker-compose.yml`).

<br>
3 - Edit your project configurations.

Open your `.env` file and set the `DB_HOST` to `mysql`:

```env
DB_HOST=mysql
```

*If you want to use Laravel and you don't have it installed yet, see [How to Install Laravel in a Docker Container](#Install-Laravel).*

<br>
4 - Open your browser and visit your localhost address (`http://localhost/`).

<br>
**Debugging**: if you are facing any problem here check the [Debugging](#debugging) section.

If you need a special support. Contact me, more details in the [Help & Questions](#Help) section.






<br>
<a name="Documentation"></a>
## Documentation






<a name="Docker"></a>






<a name="List-current-running-Containers"></a>
### List current running Containers
```bash
docker ps
```
You can also use the following command if you want to see only this project containers:

```bash
docker-compose ps
```






<br>
<a name="Close-all-running-Containers"></a>
### Close all running Containers
```bash
docker-compose stop
```

To stop single container do:

```bash
docker-compose stop {container-name}
```






<br>
<a name="Delete-all-existing-Containers"></a>
### Delete all existing Containers
```bash
docker-compose down
```






<br>
<a name="Enter-Container"></a>
### Enter a Container (run commands in a running Container)

1 - First list the current running containers with `docker ps`

2 - Enter any container using:

```bash
docker-compose exec {container-name} bash
```

*Example: enter MySQL container*

```bash
docker-compose exec mysql bash
```

*Example: enter to MySQL prompt within MySQL container*

```bash
docker-compose exec mysql mysql -u homestead -psecret
```

3 - To exit a container, type `exit`.






<br>
<a name="Edit-Container"></a>
### Edit default container configuration
Open the `docker-compose.yml` and change anything you want.

Examples:

Change MySQL Database Name:

```yml
    environment:
        MYSQL_DATABASE: laradock
    ...
```

Change Redis default port to 1111:

```yml
    ports:
        - "1111:6379"
    ...
```






<br>
<a name="Edit-a-Docker-Image"></a>
### Edit a Docker Image

1 - Find the `Dockerfile` of the image you want to edit,
<br>
example for `mysql` it will be `mysql/Dockerfile`.

2 - Edit the file the way you want.

3 - Re-build the container:

```bash
docker-compose build mysql
```
More info on Containers rebuilding [here](#Build-Re-build-Containers).






<br>
<a name="Build-Re-build-Containers"></a>
### Build/Re-build Containers

If you do any change to any `Dockerfile` make sure you run this command, for the changes to take effect:

```bash
docker-compose build
```
Optionally you can specify which container to rebuild (instead of rebuilding all the containers):

```bash
docker-compose build {container-name}
```

You might use the `--no-cache` option if you want full rebuilding (`docker-compose build --no-cache {container-name}`).






<br>
<a name="Add-Docker-Images"></a>
### Add more Software (Docker Images)

To add an image (software), just edit the `docker-compose.yml` and add your container details, to do so you need to be familiar with the [docker compose file syntax](https://docs.docker.com/compose/compose-file/).






<br>
<a name="View-the-Log-files"></a>
### View the Log files
The NGINX Log file is stored in the `logs/nginx` directory.

However to view the logs of all the other containers (MySQL, PHP-FPM,...) you can run this:

```bash
docker logs {container-name}
```






<br>
<a name="PHP"></a>






<a name="Install-PHP-Extensions"></a>
### Install PHP Extensions

Before installing PHP extensions, you have to decide whether you need for the `FPM` or `CLI` because each lives on a different container, if you need it for both you have to edit both containers.

The PHP-FPM extensions should be installed in `php-fpm/Dockerfile-XX`. *(replace XX with your default PHP version number)*.
<br>
The PHP-CLI extensions should be installed in `workspace/Dockerfile`.






<br>
<a name="Change-the-PHP-FPM-Version"></a>
### Change the (PHP-FPM) Version
By default **PHP-FPM 7.0** is running.

>The PHP-FPM is responsible of serving your application code, you don't have to change the PHP-CLI version if you are planning to run your application on different PHP-FPM version.


#### A) Switch from PHP `7.0` to PHP `5.6`

1 - Open the `docker-compose.yml`.

2 - Search for `Dockerfile-70` in the PHP container section.

3 - Change the version number, by replacing `Dockerfile-70` with `Dockerfile-56`, like this:

```yml
    php-fpm:
        build:
            context: ./php-fpm
            dockerfile: Dockerfile-70
    ...
```

4 - Finally rebuild the container

```bash
docker-compose build php-fpm
```

> For more details about the PHP base image, visit the [official PHP docker images](https://hub.docker.com/_/php/).


#### B) Switch from PHP `7.0` or `5.6` to PHP `5.5`

We do not natively support PHP 5.5 anymore, but you can get it in few steps:

1 - Clone `https://github.com/laradock/php-fpm`.

3 - Rename `Dockerfile-56` to `Dockerfile-55`.

3 - Edit the file `FROM php:5.6-fpm` to `FROM php:5.5-fpm`.

4 - Build an image from `Dockerfile-55`.

5 - Open the `docker-compose.yml` file.

6 - Point `php-fpm` to your `Dockerfile-55` file.






<br>
<a name="Change-the-PHP-CLI-Version"></a>
### Change the PHP-CLI Version
By default **PHP-CLI 7.0** is running.

>Note: it's not very essential to edit the PHP-CLI version. The PHP-CLI is only used for the Artisan Commands & Composer. It doesn't serve your Application code, this is the PHP-FPM job.

The PHP-CLI is installed in the Workspace container. To change the PHP-CLI version you need to edit the `workspace/Dockerfile`.

Right now you have to manually edit the `Dockerfile` or create a new one like it's done for the PHP-FPM. (consider contributing).






<br>
<a name="Install-xDebug"></a>
### Install xDebug

1 - First install `xDebug` in the Workspace and the PHP-FPM Containers:
<br>
a) open the `docker-compose.yml` file
<br>
b) search for the `INSTALL_XDEBUG` argument under the Workspace Container
<br>
c) set it to `true`
<br>
d) search for the `INSTALL_XDEBUG` argument under the PHP-FPM Container
<br>
e) set it to `true`

It should be like this:

```yml
    workspace:
        build:
            context: ./workspace
            args:
                - INSTALL_XDEBUG=true
    ...
    php-fpm:
        build:
            context: ./php-fpm
            args:
                - INSTALL_XDEBUG=true
    ...
```

2 - Re-build the containers `docker-compose build workspace php-fpm`

3 - Open `laradock/workspace/xdebug.ini` and/or `laradock/php-fpm/xdebug.ini` and enable at least the following configurations:

```
xdebug.remote_autostart=1
xdebug.remote_enable=1
xdebug.remote_connect_back=1
```

For information on how to configure xDebug with your IDE and work it out, check this [Repository](https://github.com/LarryEitel/laravel-laradock-phpstorm).






<br>
<a name="Control-xDebug"></a>
### Start/Stop xDebug:

By installing xDebug, you are enabling it to run on startup by default.

To control the behavior of xDebug (in the `php-fpm` Container), you can run the following commands from the LaraDock root folder, (at the same prompt where you run docker-compose):

- Stop xDebug from running by default: `./xdebugPhpFpm stop`.
- Start xDebug by default: `./xdebugPhpFpm start`.
- See the status: `./xdebugPhpFpm status`.

Note: If `./xdebugPhpFpm` doesn't execute and gives `Permission Denied` error the problem can be that file `xdebugPhpFpm` doesn't have execution access. This can be fixed by running `chmod` command  with desired access permissions.





<br>
<a name="Install-Deployer"></a>
### Install Deployer (Deployment tool for PHP)

1 - Open the `docker-compose.yml` file
<br>
2 - Search for the `INSTALL_DEPLOYER` argument under the Workspace Container
<br>
3 - Set it to `true`
<br>

It should be like this:

```yml
    workspace:
        build:
            context: ./workspace
            args:
                - INSTALL_DEPLOYER=true
    ...
```

4 - Re-build the containers `docker-compose build workspace`

######[Deployer Documentation Here](https://deployer.org/docs)





<br>
<a name="Production"></a>






<br>
<a name="LaraDock-for-Production"></a>
### Prepare LaraDock for Production

It's recommended for production to create a custom `docker-compose.yml` file. For that reason, LaraDock is shipped with `production-docker-compose.yml` which should contain only the containers you are planning to run on production (usage example: `docker-compose -f production-docker-compose.yml up -d nginx mysql redis ...`).

Note: The Database (MySQL/MariaDB/...) ports should not be forwarded on production, because Docker will automatically publish the port on the host, which is quite insecure, unless specifically told not to. So make sure to remove these lines:

```
ports:
    - "3306:3306"
```

To learn more about how Docker publishes ports, please read [this excellent post on the subject](https://fralef.me/docker-and-iptables.html).






<br>
<a name="Digital-Ocean"></a>
### Setup Laravel and Docker on Digital Ocean

####[Full Guide Here](https://github.com/laradock/laradock/blob/master/_guides/digital_ocean.md)






<br>
<a name="Laravel"></a>






<a name="Install-Laravel"></a>
### Install Laravel from a Docker Container

1 - First you need to enter the Workspace Container.

2 - Install Laravel.

Example using Composer

```bash
composer create-project laravel/laravel my-cool-app "5.2.*"
```

> We recommend using `composer create-project` instead of the Laravel installer, to install Laravel.

For more about the Laravel installation click [here](https://laravel.com/docs/master#installing-laravel).


3 - Edit `docker-compose.yml` to Map the new application path:

By default, LaraDock assumes the Laravel application is living in the parent directory of the laradock folder.

Since the new Laravel application is in the `my-cool-app` folder, we need to replace `../:/var/www` with `../my-cool-app/:/var/www`, as follow:

```yaml
    application:
		 image: tianon/true
        volumes:
            - ../my-cool-app/:/var/www
    ...
```
4 - Go to that folder and start working..

```bash
cd my-cool-app
```

5 - Go back to the LaraDock installation steps to see how to edit the `.env` file.






<br>
<a name="Run-Artisan-Commands"></a>
### Run Artisan Commands

You can run artisan commands and many other Terminal commands from the Workspace container.

1 - Make sure you have the workspace container running.

```bash
docker-compose up -d workspace // ..and all your other containers
```

2 - Find the Workspace container name:

```bash
docker-compose ps
```

3 - Enter the Workspace container:

```bash
docker-compose exec workspace bash
```

Add `--user=laradock` (example `docker-compose exec --user=laradock workspace bash`) to have files created as your host's user.


4 - Run anything you want :)

```bash
php artisan
```
```bash
Composer update
```
```bash
phpunit
```






<br>
<a name="Run-Laravel-Queue-Worker"></a>
### Run Laravel Queue Worker

1 - First add `php-worker` container. It will be similar as like PHP-FPM Container.
<br>
a) open the `docker-compose.yml` file
<br>
b) add a new service container by simply copy-paste this section below PHP-FPM container

```yaml
    php-worker:
      build:
        context: ./php-fpm
        dockerfile: Dockerfile-70 # or Dockerfile-56, choose your PHP-FPM container setting
      volumes_from:
        - applications
      command: php artisan queue:work
```
2 - Start everything up

```bash
docker-compose up -d php-worker
```

<br>
<a name="Use-Redis"></a>
### Use Redis

1 - First make sure you run the Redis Container (`redis`) with the `docker-compose up` command.

```bash
docker-compose up -d redis
```

2 - Open your Laravel's `.env` file and set the `REDIS_HOST` to `redis`

```env
REDIS_HOST=redis
```

If you don't find the `REDIS_HOST` variable in your `.env` file. Go to the database configuration file `config/database.php` and replace the default `127.0.0.1` IP with `redis` for Redis like this:

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

3 - To enable Redis Caching and/or for Sessions Management. Also from the `.env` file set `CACHE_DRIVER` and `SESSION_DRIVER` to `redis` instead of the default `file`.

```env
CACHE_DRIVER=redis
SESSION_DRIVER=redis
```

4 - Finally make sure you have the `predis/predis` package `(~1.0)` installed via Composer:

```bash
composer require predis/predis:^1.0
```

5 - You can manually test it from Laravel with this code:

```php
\Cache::store('redis')->put('LaraDock', 'Awesome', 10);
```






<br>
<a name="Use-Mongo"></a>
### Use Mongo

1 - First install `mongo` in the Workspace and the PHP-FPM Containers:
<br>
a) open the `docker-compose.yml` file
<br>
b) search for the `INSTALL_MONGO` argument under the Workspace Container
<br>
c) set it to `true`
<br>
d) search for the `INSTALL_MONGO` argument under the PHP-FPM Container
<br>
e) set it to `true`

It should be like this:

```yml
    workspace:
        build:
            context: ./workspace
            args:
                - INSTALL_MONGO=true
    ...
    php-fpm:
        build:
            context: ./php-fpm
            args:
                - INSTALL_MONGO=true
    ...
```

2 - Re-build the containers `docker-compose build workspace php-fpm`



3 - Run the MongoDB Container (`mongo`) with the `docker-compose up` command.

```bash
docker-compose up -d mongo
```


4 - Add the MongoDB configurations to the `config/database.php` configuration file:

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

5 - Open your Laravel's `.env` file and update the following variables:

- set the `DB_HOST` to your `mongo`.
- set the `DB_PORT` to `27017`.
- set the `DB_DATABASE` to `database`.


6 - Finally make sure you have the `jenssegers/mongodb` package installed via Composer and its Service Provider is added.

```bash
composer require jenssegers/mongodb
```
More details about this [here](https://github.com/jenssegers/laravel-mongodb#installation).

7 - Test it:

- First let your Models extend from the Mongo Eloquent Model. Check the [documentation](https://github.com/jenssegers/laravel-mongodb#eloquent).
- Enter the Workspace Container.
- Migrate the Database `php artisan migrate`.






<br>
<a name="Use-phpMyAdmin"></a>
### Use PhpMyAdmin

1 - Run the phpMyAdmin Container (`phpmyadmin`) with the `docker-compose up` command. Example:

```bash
# use with mysql
docker-compose up -d mysql phpmyadmin

# use with mariadb
docker-compose up -d mariadb phpmyadmin
```

2 - Open your browser and visit the localhost on port **8080**:  `http://localhost:8080`






<br>
<a name="Use-pgAdmin"></a>
### Use PgAdmin

1 - Run the pgAdmin Container (`pgadmin`) with the `docker-compose up` command. Example:

```bash
docker-compose up -d postgres pgadmin
```

2 - Open your browser and visit the localhost on port **5050**:  `http://localhost:5050`






<br>
<a name="Use-Beanstalkd"></a>
### Use Beanstalkd

1 - Run the Beanstalkd Container:

```bash
docker-compose up -d beanstalkd
```

2 - Configure Laravel to connect to that container by editing the `config/queue.php` config file.

a. first set `beanstalkd` as default queue driver
b. set the queue host to beanstalkd : `QUEUE_HOST=beanstalkd`

*beanstalkd is now available on default port `11300`.*

3 - Require the dependency package [pda/pheanstalk](https://github.com/pda/pheanstalk) using composer.


Optionally you can use the Beanstalkd Console Container to manage your Queues from a web interface.

1 - Run the Beanstalkd Console Container:

```bash
docker-compose up -d beanstalkd-console
```

2 - Open your browser and visit `http://localhost:2080/`

3 - Add the server

- Host: beanstalkd
- Port: 11300

4 - Done.






<br>
<a name="Use-ElasticSearch"></a>
### Use ElasticSearch

1 - Run the ElasticSearch Container (`elasticsearch`) with the `docker-compose up` command:

```bash
docker-compose up -d elasticsearch
```

2 - Open your browser and visit the localhost on port **9200**:  `http://localhost:9200`


#### Install ElasticSearch Plugin

1 - Install the ElasticSearch plugin like [delete-by-query](https://www.elastic.co/guide/en/elasticsearch/plugins/current/plugins-delete-by-query.html).

```bash
docker exec {container-name} /usr/share/elasticsearch/bin/plugin install delete-by-query
```

2 - Restart elasticsearch container

```bash
docker restart {container-name}
```






<br>
<a name="Use-Selenium"></a>
### Use Selenium

1 - Run the Selenium Container (`selenium`) with the `docker-compose up` command. Example:

```bash
docker-compose up -d selenium
```

2 - Open your browser and visit the localhost on port **4444** at the following URL:  `http://localhost:4444/wd/hub`






<br>
<a name="Use-RethinkDB"></a>
### Use RethinkDB

The RethinkDB is an open-source Database for Real-time Web ([RethinkDB](https://rethinkdb.com/)).
A package ([Laravel RethinkDB](https://github.com/duxet/laravel-rethinkdb)) is being developed and was released a version for Laravel 5.2 (experimental).

1 - Run the RethinkDB Container (`rethinkdb`) with the `docker-compose up` command.

```bash
docker-compose up -d rethinkdb
```

2 - Access the RethinkDB Administration Console [http://localhost:8090/#tables](http://localhost:8090/#tables) for create a database called `database`.

3 - Add the RethinkDB configurations to the `config/database.php` configuration file:

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

4 - Open your Laravel's `.env` file and update the following variables:

- set the `DB_CONNECTION` to your `rethinkdb`.
- set the `DB_HOST` to `rethinkdb`.
- set the `DB_PORT` to `28015`.
- set the `DB_DATABASE` to `database`.






<br>
<a name="CodeIgniter"></a>






<br>
<a name="Install-CodeIgniter"></a>
### Install CodeIgniter

To install CodeIgniter 3 on LaraDock all you have to do is the following simple steps:

1 - Open the `docker-compose.yml` file.

2 - Change `CODEIGNITER=false` to `CODEIGNITER=true`.

3 - Re-build your PHP-FPM Container `docker-compose build php-fpm`.






<br>
<a name="Misc"></a>
## Miscellaneous






<br>
<a name="Change-the-timezone"></a>
### Change the timezone

To change the timezone for the `workspace` container, modify the `TZ` build argument in the Docker Compose file to one in the [TZ database](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones).

For example, if I want the timezone to be `New York`:

```yml
    workspace:
        build:
            context: ./workspace
            args:
                - TZ=America/New_York
    ...
```

We also recommend [setting the timezone in Laravel](http://www.camroncade.com/managing-timezones-with-laravel/).






<br>
<a name="CronJobs"></a>
### Adding cron jobs

You can add your cron jobs to `workspace/crontab/root` after the `php artisan` line.

```
* * * * * php /var/www/artisan schedule:run >> /dev/null 2>&1

# Custom cron
* * * * * root echo "Every Minute" > /var/log/cron.log 2>&1
```

Make sure you [change the timezone](#Change-the-timezone) if you don't want to use the default (UTC).






<br>
<a name="Workspace-ssh"></a>
### Access workspace via ssh

You can access the `workspace` container through `localhost:2222` by setting the `INSTALL_WORKSPACE_SSH` build argument to `true`.

To change the default forwarded port for ssh:

```yml
    workspace:
		ports:
			- "2222:22" # Edit this line
    ...
```






<br>
<a name="MySQL-access-from-host"></a>
### MySQL access from host

You can forward the MySQL/MariaDB port to your host by making sure these lines are added to the `mysql` or `mariadb` section of the `docker-compose.yml` or in your [environment specific Compose](https://docs.docker.com/compose/extends/) file.

```
ports:
    - "3306:3306"
```






<br>
<a name="MySQL-root-access"></a>
### MySQL root access

The default username and password for the root MySQL user are `root` and `root `.

1 - Enter the MySQL container: `docker-compose exec mysql bash`.

2 - Enter mysql: `mysql -uroot -proot` for non root access use `mysql -uhomestead -psecret`.

3 - See all users: `SELECT User FROM mysql.user;`

4 - Run any commands `show databases`, `show tables`, `select * from.....`.






<br>
<a name="Change-MySQL-port"></a>
### Change MySQL port

Modify the `mysql/my.cnf` file to set your port number, `1234` is used as an example.

```
[mysqld]
port=1234
```

If you need <a href="#MySQL-access-from-host">MySQL access from your host</a>, do not forget to change the internal port number (`"3306:3306"` -> `"3306:1234"`) in the docker-compose configuration file.






<br>
<a name="Use-custom-Domain"></a>
### Use custom Domain (instead of the Docker IP)

Assuming your custom domain is `laravel.dev`

1 - Open your `/etc/hosts` file and map your localhost address `127.0.0.1` to the `laravel.dev` domain, by adding the following:

```bash
127.0.0.1    laravel.dev
```

2 - Open your browser and visit `{http://laravel.dev}`


Optionally you can define the server name in the NGINX configuration file, like this:

```conf
server_name laravel.dev;
```






<br>
<a name="Enable-Global-Composer-Build-Install"></a>
### Enable Global Composer Build Install

Enabling Global Composer Install during the build for the container allows you to get your composer requirements installed and available in the container after the build is done.

1 - Open the `docker-compose.yml` file

2 - Search for the `COMPOSER_GLOBAL_INSTALL` argument under the Workspace Container and set it to `true`

It should be like this:

```yml
    workspace:
        build:
            context: ./workspace
            args:
                - COMPOSER_GLOBAL_INSTALL=true
    ...
```
3 - Now add your dependencies to `workspace/composer.json`

4 - Re-build the Workspace Container `docker-compose build workspace`






<br>
<a name="Install-Prestissimo"></a>
### Install Prestissimo

[Prestissimo](https://github.com/hirak/prestissimo) is a plugin for composer which enables parallel install functionality.

1 - Enable Running Global Composer Install during the Build:

Click on this [Enable Global Composer Build Install](#Enable-Global-Composer-Build-Install) and do steps 1 and 2 only then continue here.

2 - Add prestissimo as requirement in Composer:

a - Now open the `workspace/composer.json` file

b - Add `"hirak/prestissimo": "^0.3"` as requirement

c - Re-build the Workspace Container `docker-compose build workspace`






<br>
<a name="Install-Node"></a>
### Install Node + NVM

To install NVM and NodeJS in the Workspace container

1 - Open the `docker-compose.yml` file

2 - Search for the `INSTALL_NODE` argument under the Workspace Container and set it to `true`

It should be like this:

```yml
    workspace:
        build:
            context: ./workspace
            args:
                - INSTALL_NODE=true
    ...
```

3 - Re-build the container `docker-compose build workspace`






<br>
<a name="Install-Yarn"></a>
### Install Node + YARN

Yarn is a new package manager for JavaScript. It is so faster than npm, which you can find [here](http://yarnpkg.com/en/compare).To install NodeJS and [Yarn](https://yarnpkg.com/) in the Workspace container:

1 - Open the `docker-compose.yml` file

2 - Search for the `INSTALL_NODE` and `INSTALL_YARN` argument under the Workspace Container and set it to `true`

It should be like this:

```yml
    workspace:
        build:
            context: ./workspace
            args:
                - INSTALL_NODE=true
                - INSTALL_YARN=true
    ...
```

3 - Re-build the container `docker-compose build workspace`






<br>
<a name="Install-Linuxbrew"></a>
### Install Linuxbrew

Linuxbrew is a package manager for Linux. It is the Linux version of MacOS Homebrew and can be found [here](http://linuxbrew.sh). To install Linuxbrew in the Workspace container:

1 - Open the `docker-compose.yml` file

2 - Search for the `INSTALL_LINUXBREW` argument under the Workspace Container and set it to `true`

It should be like this:

```yml
    workspace:
        build:
            context: ./workspace
            args:
                - INSTALL_LINUXBREW=true
    ...
```

3 - Re-build the container `docker-compose build workspace`





<br>
<a name="Common-Aliases"></a>
<br>
### Common Terminal Aliases
When you start your docker container, LaraDock will copy the `aliases.sh` file located in the `laradock/workspace` directory and add sourcing to the container `~/.bashrc` file.

You are free to modify the `aliases.sh` as you see fit, adding your own aliases (or function macros) to suit your requirements.





<br>
<a name="Install-Aerospike-Extension"></a>
### Install Aerospike extension

1 - First install `aerospike` in the Workspace and the PHP-FPM Containers:
<br>
a) open the `docker-compose.yml` file
<br>
b) search for the `INSTALL_AEROSPIKE_EXTENSION` argument under the Workspace Container
<br>
c) set it to `true`
<br>
d) search for the `INSTALL_AEROSPIKE_EXTENSION` argument under the PHP-FPM Container
<br>
e) set it to `true`

It should be like this:

```yml
    workspace:
        build:
            context: ./workspace
            args:
                - INSTALL_AEROSPIKE_EXTENSION=true
    ...
    php-fpm:
        build:
            context: ./php-fpm
            args:
                - INSTALL_AEROSPIKE_EXTENSION=true
    ...
```

2 - Re-build the containers `docker-compose build workspace php-fpm`






<br>
<a name="Install-Laravel-Envoy"></a>
### Install Laravel Envoy (Envoy Task Runner)

1 - Open the `docker-compose.yml` file
<br>
2 - Search for the `INSTALL_LARAVEL_ENVOY` argument under the Workspace Container
<br>
3 - Set it to `true`
<br>

It should be like this:

```yml
    workspace:
        build:
            context: ./workspace
            args:
                - INSTALL_LARAVEL_ENVOY=true
    ...
```

4 - Re-build the containers `docker-compose build workspace`

######[Laravel Envoy Documentation Here](https://laravel.com/docs/5.3/envoy)







<br>
<a name="phpstorm-debugging"></a>
### PHPStorm Debugging Guide
Remote debug Laravel web and phpunit tests.

######[Debugging Guide Here](https://github.com/laradock/laradock/blob/master/_guides/phpstorm.md)








<br>
<a name="keep-tracking-LaraDock"></a>
### Keep track of your LaraDock changes

1. Fork the LaraDock repository.
2. Use that fork as a submodule.
3. Commit all your changes to your fork.
4. Pull new stuff from the main repository from time to time.






<br>
<a name="upgrading-laradock"></a>
### Upgrading LaraDock

Moving from Docker Toolbox (VirtualBox) to Docker Native (for Mac/Windows). Requires upgrading LaraDock from v3.* to v4.*:

1. Stop the docker VM `docker-machine stop {default}`
2. Install Docker for [Mac](https://docs.docker.com/docker-for-mac/) or [Windows](https://docs.docker.com/docker-for-windows/).
3. Upgrade LaraDock to `v4.*.*` (`git pull origin master`)
4. Use LaraDock as you used to do: `docker-compose up -d nginx mysql`.

**Note:** If you face any problem with the last step above: rebuild all your containers
`docker-compose build --no-cache`
"Warning Containers Data might be lost!"


<a name="Speed-MacOS"></a>
### Improve speed on MacOS

Sharing code into Docker containers with osxfs have very poor performance compared to Linux. You can get around this issue by using NFS to share your files betwen your host and your container.
  
#### How to share files using NFS (d4m-nfs)

[d4m-nfs](https://github.com/IFSight/d4m-nfs) automatically mount NFS volume instead of osxfs one.

 1. Update docker File Sharing preferences. You should have only /tmp.
 2. Restart docker.
 3. Clone d4m-nfs repository in your home directory
  ```bash
    $ git clone https://github.com/IFSight/d4m-nfs ~/d4m-nfs
  ```
 4. Edit/create the file ~/d4m-nfs/etc/d4m-nfs-mounts.txt with this configuration:
 ```
/Users:/Users
/Volumes:/Volumes
/private:/private
 ```
 5. Empty the file /etc/exports and clean it up if required (there may be collisions if you come from Vagrant or if you already executed the d4m-nfs.sh script)
 6. Run the d4m-nfs.sh script
  ```bash
 ~/d4m-nfs/d4m-nfs.sh
  ```
  
That's it! Now you just have to bring your container up with docker compose. For example:

```bash
docker-compose up -d nginx mysql
```


<br>
<a name="Common-Problems"></a>
## Common Problems 

*Here's a list of the common problems you might face, and the possible solutions.*






<br>
#### I see a blank (white) page instead of the Laravel 'Welcome' page!

Run the following command from the Laravel root directory:

```bash
sudo chmod -R 777 storage bootstrap/cache
```





<br>
#### I see "Welcome to nginx" instead of the Laravel App!

Use `http://127.0.0.1` instead of `http://localhost` in your browser.





<br>
#### I see an error message containing `address already in use` or `port is already allocated`

Make sure the ports for the services that you are trying to run (22, 80, 443, 3306, etc.) are not being used already by other programs on the host, such as a built in `apache`/`httpd` service or other development tools you have installed.





<br>
#### I get NGINX error 404 Not Found on Windows.

1. Go to docker Settings on your Windows machine.
2. Click on the `Shared Drives` tab and check the drive that contains your project files.
3. Enter your windows username and password.
4. Go to the `reset` tab and click restart docker.




<br>
#### The time in my services does not match the current time

1. Make sure you've [changed the timezone](#Change-the-timezone).
2. Stop and rebuild the containers (`docker-compose up -d --build <services>`)



<br>
#### I get MySQL connection refused

This error sometimes happens because your Laravel application isn't running on the container localhost IP (Which is 127.0.0.1). Steps to fix it:

* Option A
  1. Check your running Laravel application IP by dumping `Request::ip()` variable using `dd(Request::ip())` anywhere on your application. The result is the IP of your Laravel container.
  2. Change the `DB_HOST` variable on env with the IP that you received from previous step.
* Option B
   1. Change the `DB_HOST` value to the same name as the MySQL docker container. The LaraDock docker-compose file currently has this as `mysql`







<br>
## Contributing

This little project was built by one man who has a full time job and many responsibilities, so if you like this project and you find that it needs a bug fix or support for new software or upgrade any container, or anything else, do not hesitate to contribute, you are more than welcome :)

#### Read the [Contribution Guidelines](https://github.com/laradock/laradock/blob/master/CONTRIBUTING.md).






<br>
<a name="related-projects"></a>
## Related Projects

LaraDock related projects:
* [LaraDock CLI](https://github.com/lorinlee/laradock-cli) by [LorinLee](https://github.com/lorinlee)
* [LaraDock Env](https://github.com/bagart/laradock_env) by [BAGArt](https://github.com/bagart)
* [Klaradock](https://github.com/poyhsiao/Klaradock) by [Kim Hsiao](https://github.com/poyhsiao)
* [Ansible LaraDock Kubernetes](https://github.com/sifat-rahim/ansible-laradock-kubernetes) by [Sifat Rahim](https://github.com/sifat-rahim)

These Docker Compose projects have piqued our interest:
* [MageDock](https://github.com/ojhaujjwal/magedock) by [Ujjwal Ojha](https://github.com/ojhaujjwal)
* [RubyDev-Dock](https://github.com/scudelletti/rubydev-dock) by [Diogo Scudelletti](https://github.com/scudelletti)
* [NoDock](https://github.com/Osedea/nodock) by [Osedea](https://github.com/Osedea)

If you want your project listed here, please open an issue.






<br>
<a name="Help"></a>
## Help & Questions

Join the chat room on [Gitter](https://gitter.im/LaraDock/laradock) and get help and support from the community.

You can as well can open an [issue](https://github.com/laradock/laradock/issues) on GitHub (will be labeled as Question) and discuss it with people on [Gitter](https://gitter.im/LaraDock/laradock).

For special help with Docker and/or Laravel, you can schedule a live call with the creator of this project at [Codementor.io](https://www.codementor.io/mahmoudz).






## Credits

**Super Admins:**

- [Mahmoud Zalt](https://github.com/Mahmoudz) (mahmoudz)  [ [Twitter](https://twitter.com/Mahmoud_Zalt) | [Personal Site](http://zalt.me) | [LinkedIn](https://www.linkedin.com/in/mahmoudzalt) ]
- [Bo-Yi Wu](https://github.com/appleboy) (appleboy)
- [Philippe Trépanier](https://github.com/philtrep) (philtrep)
- [Mike Erickson](https://github.com/mikeerickson) (mikeerickson)
- Join Us!

**Amazing Contributors:**

- [Contributors](https://github.com/laradock/laradock/graphs/contributors)






## License

[MIT License](https://github.com/laradock/laradock/blob/master/LICENSE) (MIT)
