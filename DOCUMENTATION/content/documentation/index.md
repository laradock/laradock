---
title: Documentation
type: index
weight: 3
---




<a name="List-current-running-Containers"></a>
## List current running Containers
```bash
docker ps
```
You can also use the following command if you want to see only this project containers:

```bash
docker-compose ps
```






<br>
<a name="Close-all-running-Containers"></a>
## Close all running Containers
```bash
docker-compose stop
```

To stop single container do:

```bash
docker-compose stop {container-name}
```






<br>
<a name="Delete-all-existing-Containers"></a>
## Delete all existing Containers
```bash
docker-compose down
```






<br>
<a name="Enter-Container"></a>
## Enter a Container (run commands in a running Container)

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
## Edit default container configuration
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
## Edit a Docker Image

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
## Build/Re-build Containers

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
## Add more Software (Docker Images)

To add an image (software), just edit the `docker-compose.yml` and add your container details, to do so you need to be familiar with the [docker compose file syntax](https://docs.docker.com/compose/compose-file/).






<br>
<a name="View-the-Log-files"></a>
## View the Log files
The NGINX Log file is stored in the `logs/nginx` directory.

However to view the logs of all the other containers (MySQL, PHP-FPM,...) you can run this:

```bash
docker-compose logs {container-name}
```

```bash
docker-compose logs -f {container-name}
```

More [options](https://docs.docker.com/compose/reference/logs/)








<br>
<a name="PHP"></a>






<a name="Install-PHP-Extensions"></a>
## Install PHP Extensions

Before installing PHP extensions, you have to decide whether you need for the `FPM` or `CLI` because each lives on a different container, if you need it for both you have to edit both containers.

The PHP-FPM extensions should be installed in `php-fpm/Dockerfile-XX`. *(replace XX with your default PHP version number)*.
<br>
The PHP-CLI extensions should be installed in `workspace/Dockerfile`.






<br>
<a name="Change-the-PHP-FPM-Version"></a>
## Change the (PHP-FPM) Version
By default the latest stable PHP versin is configured to run.

>The PHP-FPM is responsible of serving your application code, you don't have to change the PHP-CLI version if you are planning to run your application on different PHP-FPM version.


### A) Switch from PHP `7.2` to PHP `5.6`

1 - Open the `.env`.

2 - Search for `PHP_VERSION`.

3 - Set the desired version number:

```dotenv
PHP_VERSION=5.6
```

4 - Finally rebuild the image

```bash
docker-compose build php-fpm
```

> For more details about the PHP base image, visit the [official PHP docker images](https://hub.docker.com/_/php/).




<br>
<a name="Change-the-PHP-CLI-Version"></a>
## Change the PHP-CLI Version
By default **PHP-CLI 7.0** is running.

>Note: it's not very essential to edit the PHP-CLI version. The PHP-CLI is only used for the Artisan Commands & Composer. It doesn't serve your Application code, this is the PHP-FPM job.

The PHP-CLI is installed in the Workspace container. To change the PHP-CLI version you need to simply change the `PHP_VERSION` in te .env file as follow:

1 - Open the `.env`.

2 - Search for `PHP_VERSION`.

3 - Set the desired version number:

```dotenv
PHP_VERSION=7.2
```

4 - Finally rebuild the image

```bash
docker-compose build workspace
```




<br>
<a name="Install-xDebug"></a>
## Install xDebug

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

2 - Open `laradock/workspace/xdebug.ini` and `laradock/php-fpm/xdebug.ini` and enable at least the following configurations:

```
xdebug.remote_autostart=1
xdebug.remote_enable=1
xdebug.remote_connect_back=1
```

3 - Re-build the containers `docker-compose build workspace php-fpm`

For information on how to configure xDebug with your IDE and work it out, check this [Repository](https://github.com/LarryEitel/laravel-laradock-phpstorm) or follow up on the next section if you use linux and PhpStorm.


<a name="Setup remote debugging for PhpStorm on Linux"></a>
## Setup remote debugging for PhpStorm on Linux

 - Make sure you have followed the steps above in the [Install Xdebug section](http://laradock.io/documentation/#install-xdebug).

 - Make sure Xdebug accepts connections and listens on port 9000. (Should be default configuration).

![Debug Configuration](/images/photos/PHPStorm/linux/configuration/debugConfiguration.png "Debug Configuration").

 - Create a server with name `laradock` (matches **PHP_IDE_CONFIG** key in environment file) and make sure to map project root path with server correctly.

![Server Configuration](/images/photos/PHPStorm/linux/configuration/serverConfiguration.png "Server Configuration").

 - Start listening for debug connections, place a breakpoint and you are good to go !


<br>
<a name="Control-xDebug"></a>
## Start/Stop xDebug:

By installing xDebug, you are enabling it to run on startup by default.

To control the behavior of xDebug (in the `php-fpm` Container), you can run the following commands from the Laradock root folder, (at the same prompt where you run docker-compose):

- Stop xDebug from running by default: `.php-fpm/xdebug stop`.
- Start xDebug by default: `.php-fpm/xdebug start`.
- See the status: `.php-fpm/xdebug status`.

Note: If `.php-fpm/xdebug` doesn't execute and gives `Permission Denied` error the problem can be that file `xdebug` doesn't have execution access. This can be fixed by running `chmod` command  with desired access permissions.






<br>
<a name="Install-Deployer"></a>
## Install Deployer (Deployment tool for PHP)

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

[**Deployer Documentation Here**](https://deployer.org/docs)





<br>
<a name="Production"></a>






<br>
<a name="Laradock-for-Production"></a>
## Prepare Laradock for Production

It's recommended for production to create a custom `docker-compose.yml` file. For that reason, Laradock is shipped with `production-docker-compose.yml` which should contain only the containers you are planning to run on production (usage example: `docker-compose -f production-docker-compose.yml up -d nginx mysql redis ...`).

Note: The Database (MySQL/MariaDB/...) ports should not be forwarded on production, because Docker will automatically publish the port on the host, which is quite insecure, unless specifically told not to. So make sure to remove these lines:

```
ports:
    - "3306:3306"
```

To learn more about how Docker publishes ports, please read [this excellent post on the subject](https://fralef.me/docker-and-iptables.html).






<br>
<a name="Digital-Ocean"></a>
## Setup Laravel and Docker on Digital Ocean

### [Full Guide Here](https://github.com/laradock/laradock/blob/master/_guides/digital_ocean.md)





<br>
<a name="Use-Jenkins"></a>
## Use Jenkins

1) Boot the container `docker-compose up -d jenkins`. To enter the container type `docker-compose exec jenkins bash`.

2) Go to `http://localhost:8090/` (if you didn't chanhed your default port mapping) 

3) Authenticate from the web app.

- Default username is `admin`.
- Default password is `docker-compose exec jenkins cat /var/jenkins_home/secrets/initialAdminPassword`. 

(To enter container as root type `docker-compose exec --user root jenkins bash`).

4) Install some plugins.

5) Create your first Admin user, or continue as Admin.

Note: to add user go to `http://localhost:8090/securityRealm/addUser` and to restart it from the web app visit `http://localhost:8090/restart`.

You may wanna change the default security configuration, so go to `http://localhost:8090/configureSecurity/` under Authorization and choosing "Anyone can do anything" or "Project-based Matrix Authorization Strategy" or anything else.




<br>
<a name="Laravel"></a>

<a name="Install-Laravel"></a>
## Install Laravel from a Docker Container

1 - First you need to enter the Workspace Container.

2 - Install Laravel.

Example using Composer

```bash
composer create-project laravel/laravel my-cool-app "5.2.*"
```

> We recommend using `composer create-project` instead of the Laravel installer, to install Laravel.

For more about the Laravel installation click [here](https://laravel.com/docs/master#installing-laravel).


3 - Edit `.env` to Map the new application path:

By default, Laradock assumes the Laravel application is living in the parent directory of the laradock folder.

Since the new Laravel application is in the `my-cool-app` folder, we need to replace `../:/var/www` with `../my-cool-app/:/var/www`, as follow:

```dotenv
  APP_CODE_PATH_HOST=../my-cool-app/
```
4 - Go to that folder and start working..

```bash
cd my-cool-app
```

5 - Go back to the Laradock installation steps to see how to edit the `.env` file.






<br>
<a name="Run-Artisan-Commands"></a>
## Run Artisan Commands

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
## Run Laravel Queue Worker

1 - First add `php-worker` container. It will be similar as like PHP-FPM Container.
<br>
a) open the `docker-compose.yml` file
<br>
b) add a new service container by simply copy-paste this section below PHP-FPM container

```yaml
    php-worker:
      build:
        context: ./php-worker
        args:
          - INSTALL_PGSQL=${PHP_WORKER_INSTALL_PGSQL} #Optionally install PGSQL PHP drivers
      volumes_from:
        - applications
      depends_on:
        - workspace
      extra_hosts:
        - "dockerhost:${DOCKER_HOST_IP}"
      networks:
        - backend
```
2 - Start everything up

```bash
docker-compose up -d php-worker
```





<br>
<a name="Use-Redis"></a>
## Use Redis

1 - First make sure you run the Redis Container (`redis`) with the `docker-compose up` command.

```bash
docker-compose up -d redis
```

> To execute redis commands, enter the redis container first `docker-compose exec redis bash` then enter the `redis-cli`.

2 - Open your Laravel's `.env` file and set the `REDIS_HOST` to `redis`

```env
REDIS_HOST=redis
```

If you're using Laravel, and you don't find the `REDIS_HOST` variable in your `.env` file. Go to the database configuration file `config/database.php` and replace the default `127.0.0.1` IP with `redis` for Redis like this:

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
\Cache::store('redis')->put('Laradock', 'Awesome', 10);
```






<br>
<a name="Use-Mongo"></a>
## Use Mongo

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
## Use PhpMyAdmin

1 - Run the phpMyAdmin Container (`phpmyadmin`) with the `docker-compose up` command. Example:

```bash
# use with mysql
docker-compose up -d mysql phpmyadmin

# use with mariadb
docker-compose up -d mariadb phpmyadmin
```

*Note: To use with MariaDB, open `.env` and set `PMA_DB_ENGINE=mysql` to `PMA_DB_ENGINE=mariadb`.*

2 - Open your browser and visit the localhost on port **8080**:  `http://localhost:8080`






<br>
<a name="Use-Adminer"></a>
## Use Adminer

1 - Run the Adminer Container (`adminer`) with the `docker-compose up` command. Example:

```bash
docker-compose up -d adminer
```

2 - Open your browser and visit the localhost on port **8080**:  `http://localhost:8080`

**Note:** We've locked Adminer to version 4.3.0 as at the time of writing [it contained a major bug](https://sourceforge.net/p/adminer/bugs-and-features/548/) preventing PostgreSQL users from logging in. If that bug is fixed (or if you're not using PostgreSQL) feel free to set Adminer to the latest version within [the Dockerfile](https://github.com/laradock/laradock/blob/master/adminer/Dockerfile#L1): `FROM adminer:latest`





<br>
<a name="Use-pgAdmin"></a>
## Use PgAdmin

1 - Run the pgAdmin Container (`pgadmin`) with the `docker-compose up` command. Example:

```bash
docker-compose up -d postgres pgadmin
```

2 - Open your browser and visit the localhost on port **5050**:  `http://localhost:5050`






<br>
<a name="Use-Beanstalkd"></a>
## Use Beanstalkd

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

_Note: You can customize the port on which beanstalkd console is listening by changing `BEANSTALKD_CONSOLE_HOST_PORT` in `.env`. The default value is *2080*._

3 - Add the server

- Host: beanstalkd
- Port: 11300

4 - Done.






<br>
<a name="Use-ElasticSearch"></a>
## Use ElasticSearch

1 - Run the ElasticSearch Container (`elasticsearch`) with the `docker-compose up` command:

```bash
docker-compose up -d elasticsearch
```

2 - Open your browser and visit the localhost on port **9200**:  `http://localhost:9200`

> The default username is `user` and the default password is `changeme`.

### Install ElasticSearch Plugin

1 - Install an ElasticSearch plugin.

```bash
docker-compose exec elasticsearch /usr/share/elasticsearch/bin/plugin install {plugin-name}
```

2 - Restart elasticsearch container

```bash
docker-compose restart elasticsearch
```






<br>
<a name="Use-Selenium"></a>
## Use Selenium

1 - Run the Selenium Container (`selenium`) with the `docker-compose up` command. Example:

```bash
docker-compose up -d selenium
```

2 - Open your browser and visit the localhost on port **4444** at the following URL:  `http://localhost:4444/wd/hub`






<br>
<a name="Use-RethinkDB"></a>
## Use RethinkDB

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
<a name="Use-Minio"></a>
## Use Minio

1 - Configure Minio:
  - On the workspace container, change `INSTALL_MC` to true to get the client
  - Set `MINIO_ACCESS_KEY` and `MINIO_ACCESS_SECRET` if you wish to set proper keys

2 - Run the Minio Container (`minio`) with the `docker-compose up` command. Example:

```bash
docker-compose up -d minio
```

3 - Open your browser and visit the localhost on port **9000** at the following URL:  `http://localhost:9000`

4 - Create a bucket either through the webui or using the mc client:
  ```bash
  mc mb minio/bucket
  ```

5 - When configuring your other clients use the following details:
  ```
  S3_HOST=http://minio
  S3_KEY=access
  S3_SECRET=secretkey
  S3_REGION=us-east-1
  S3_BUCKET=bucket
  ```



<br>
<a name="Use-AWS"></a>
## Use AWS

1 - Configure AWS:
  - make sure to add your SSH keys in aws/ssh_keys folder

2 - Run the Aws Container (`aws`) with the `docker-compose up` command. Example:

```bash
docker-compose up -d aws
```

3 - Access the aws container with `docker-compose exec aws bash`

4 - To start using eb cli inside the container, initiaze your project first by doing 'eb init'. Read the [aws eb cli](http://docs.aws.amazon.com/elasticbeanstalk/latest/dg/eb-cli3-configuration.html) docs for more details.



<br>
<a name="Use-Grafana"></a>
## Use Grafana

1 - Configure Grafana: Change Port using `GRAFANA_PORT` if you wish to. Default is port 3000.

2 - Run the Grafana Container (`grafana`) with the `docker-compose up`command:

```bash
docker-compose up -d grafana
```

3 - Open your browser and visit the localhost on port **3000** at the following URL: `http://localhost:3000`

4 - Login using the credentials User = `admin` Passwort = `admin`. Change the password in the webinterface if you want to.



<br>
<a name="CodeIgniter"></a>






<br>
<a name="Install-CodeIgniter"></a>
## Install CodeIgniter

To install CodeIgniter 3 on Laradock all you have to do is the following simple steps:

1 - Open the `docker-compose.yml` file.

2 - Change `CODEIGNITER=false` to `CODEIGNITER=true`.

3 - Re-build your PHP-FPM Container `docker-compose build php-fpm`.


<a name="Install-Symfony"></a>
## Install Symfony

1 - Open the `.env` file and set `WORKSPACE_INSTALL_SYMFONY` to `true`.

2 - Run `docker-compose build workspace`, after the step above.

3 - The NGINX sites include a default config file for your Symfony project `symfony.conf.example`, so edit it and make sure the `root` is pointing to your project `web` directory.

4 - Run `docker-compose restart` if the container was already running, before the step above.

5 - Visit `symfony.test`

<br>
<a name="Misc"></a>
## Miscellaneous






<br>
<a name="Change-the-timezone"></a>
## Change the timezone

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
## Adding cron jobs

You can add your cron jobs to `workspace/crontab/root` after the `php artisan` line.

```
* * * * * php /var/www/artisan schedule:run >> /dev/null 2>&1

# Custom cron
* * * * * root echo "Every Minute" > /var/log/cron.log 2>&1
```

Make sure you [change the timezone](#Change-the-timezone) if you don't want to use the default (UTC).






<br>
<a name="Workspace-ssh"></a>
## Access workspace via ssh

You can access the `workspace` container through `localhost:2222` by setting the `INSTALL_WORKSPACE_SSH` build argument to `true`.

To change the default forwarded port for ssh:

```yml
    workspace:
		ports:
			- "2222:22" # Edit this line
    ...
```

Then login using:

```bash
ssh -o PasswordAuthentication=no    \
    -o StrictHostKeyChecking=no     \
    -o UserKnownHostsFile=/dev/null \
    -p 2222                         \
    -i workspace/insecure_id_rsa    \
    laradock@localhost
```

To login as root, replace laradock@locahost with root@localhost.

<br>
<a name="Change-the-MySQL-Version"></a>
## Change the (MySQL) Version
By default **MySQL 8.0** is running.

MySQL 8.0 is a development release.  You may prefer to use the latest stable version, or an even older release.  If you wish, you can change the MySQL image that is used.

Open up your .env file and set the `MYSQL_VERSION` variable to the version you would like to install.

```
MYSQL_VERSION=5.7
```

Available versions are: 5.5, 5.6, 5.7, 8.0, or latest.  See https://store.docker.com/images/mysql for more information.






<br>
<a name="MySQL-access-from-host"></a>
## MySQL access from host

You can forward the MySQL/MariaDB port to your host by making sure these lines are added to the `mysql` or `mariadb` section of the `docker-compose.yml` or in your [environment specific Compose](https://docs.docker.com/compose/extends/) file.

```
ports:
    - "3306:3306"
```






<br>
<a name="MySQL-root-access"></a>
## MySQL root access

The default username and password for the root MySQL user are `root` and `root `.

1 - Enter the MySQL container: `docker-compose exec mysql bash`.

2 - Enter mysql: `mysql -uroot -proot` for non root access use `mysql -uhomestead -psecret`.

3 - See all users: `SELECT User FROM mysql.user;`

4 - Run any commands `show databases`, `show tables`, `select * from.....`.





<br>
<a name="Create-Multiple-Databases"></a>
## Create Multiple Databases (MySQL)

Create `createdb.sql` from `mysql/docker-entrypoint-initdb.d/createdb.sql.example` in `mysql/docker-entrypoint-initdb.d/*` and add your SQL syntax as follow:

```sql
CREATE DATABASE IF NOT EXISTS `your_db_1` COLLATE 'utf8_general_ci' ;
GRANT ALL ON `your_db_1`.* TO 'mysql_user'@'%' ;
```




<br>
<a name="Change-MySQL-port"></a>
## Change MySQL port

Modify the `mysql/my.cnf` file to set your port number, `1234` is used as an example.

```
[mysqld]
port=1234
```

If you need <a href="#MySQL-access-from-host">MySQL access from your host</a>, do not forget to change the internal port number (`"3306:3306"` -> `"3306:1234"`) in the docker-compose configuration file.






<br>
<a name="Use-custom-Domain"></a>
## Use custom Domain (instead of the Docker IP)

Assuming your custom domain is `laravel.test`

1 - Open your `/etc/hosts` file and map your localhost address `127.0.0.1` to the `laravel.test` domain, by adding the following:

```bash
127.0.0.1    laravel.test
```

2 - Open your browser and visit `{http://laravel.test}`


Optionally you can define the server name in the NGINX configuration file, like this:

```conf
server_name laravel.test;
```






<br>
<a name="Enable-Global-Composer-Build-Install"></a>
## Enable Global Composer Build Install

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
## Install Prestissimo

[Prestissimo](https://github.com/hirak/prestissimo) is a plugin for composer which enables parallel install functionality.

1 - Enable Running Global Composer Install during the Build:

Click on this [Enable Global Composer Build Install](#Enable-Global-Composer-Build-Install) and do steps 1 and 2 only then continue here.

2 - Add prestissimo as requirement in Composer:

a - Now open the `workspace/composer.json` file

b - Add `"hirak/prestissimo": "^0.3"` as requirement

c - Re-build the Workspace Container `docker-compose build workspace`






<br>
<a name="Install-Node"></a>
## Install Node + NVM

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
## Install Node + YARN

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
## Install Linuxbrew

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
## Common Terminal Aliases
When you start your docker container, Laradock will copy the `aliases.sh` file located in the `laradock/workspace` directory and add sourcing to the container `~/.bashrc` file.

You are free to modify the `aliases.sh` as you see fit, adding your own aliases (or function macros) to suit your requirements.





<br>
<a name="Install-Aerospike-Extension"></a>
## Install Aerospike extension

1 - First install `aerospike` in the Workspace and the PHP-FPM Containers:
<br>
a) open the `docker-compose.yml` file
<br>
b) search for the `INSTALL_AEROSPIKE` argument under the Workspace Container
<br>
c) set it to `true`
<br>
d) search for the `INSTALL_AEROSPIKE` argument under the PHP-FPM Container
<br>
e) set it to `true`

It should be like this:

```yml
    workspace:
        build:
            context: ./workspace
            args:
                - INSTALL_AEROSPIKE=true
    ...
    php-fpm:
        build:
            context: ./php-fpm
            args:
                - INSTALL_AEROSPIKE=true
    ...
```

2 - Re-build the containers `docker-compose build workspace php-fpm`






<br>
<a name="Install-Laravel-Envoy"></a>
## Install Laravel Envoy (Envoy Task Runner)

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

[**Laravel Envoy Documentation Here**](https://laravel.com/docs/5.3/envoy)







<br>
<a name="phpstorm-debugging"></a>
## PHPStorm Debugging Guide
Remote debug Laravel web and phpunit tests.

[**Debugging Guide Here**](https://github.com/laradock/laradock/blob/master/_guides/phpstorm.md)







<br>
<a name="keep-tracking-Laradock"></a>
## Keep track of your Laradock changes

1. Fork the Laradock repository.
2. Use that fork as a submodule.
3. Commit all your changes to your fork.
4. Pull new stuff from the main repository from time to time.







<br>
<a name="upgrading-laradock"></a>
## Upgrading Laradock

Moving from Docker Toolbox (VirtualBox) to Docker Native (for Mac/Windows). Requires upgrading Laradock from v3.* to v4.*:

1. Stop the docker VM `docker-machine stop {default}`
2. Install Docker for [Mac](https://docs.docker.com/docker-for-mac/) or [Windows](https://docs.docker.com/docker-for-windows/).
3. Upgrade Laradock to `v4.*.*` (`git pull origin master`)
4. Use Laradock as you used to do: `docker-compose up -d nginx mysql`.

**Note:** If you face any problem with the last step above: rebuild all your containers
`docker-compose build --no-cache`
"Warning Containers Data might be lost!"









<br>
<a name="Speed-MacOS"></a>
## Improve speed on MacOS

Docker on the Mac [is slow](https://github.com/docker/for-mac/issues/77), at the time of writing. Especially for larger projects, this can be a problem. The problem is [older than March 2016](https://forums.docker.com/t/file-access-in-mounted-volumes-extremely-slow-cpu-bound/8076) - as it's a such a long-running issue, we're including it in the docs here.

So since sharing code into Docker containers with osxfs have very poor performance compared to Linux. Likely there are some workarounds:



### Workaround A: using dinghy

[Dinghy](https://github.com/codekitchen/dinghy) creates its own VM using docker-machine, it will not modify your existing docker-machine VMs.

Quick Setup giude, (we recommend you check their docs)

1) `brew tap codekitchen/dinghy`

2) `brew install dinghy`

3) `dinghy create --provider virtualbox` (must have virtualbox installed, but they support other providers if you prefer)

4) after the above command is done it will display some env variables, copy them to the bash profile or zsh or.. (this will instruct docker to use the server running inside the VM)

5) `docker-compose up ...`



<br>
<a name="Docker-Sync"></a>
### Workaround B: using d4m-nfs

You can use the d4m-nfs solution in 2 ways, one is using the Laradock built it integration, and the other is using the tool separatly. Below is show case of both methods:


### B.1: using the built in d4m-nfs integration

In simple terms, docker-sync creates a docker container with a copy of all the application files that can be accessed very quickly from the other containers.
On the other hand, docker-sync runs a process on the host machine that continuously tracks and updates files changes from the host to this intermediate container.

Out of the box, it comes pre-configured for OS X, but using it on Windows is very easy to set-up by modifying the `DOCKER_SYNC_STRATEGY` on the `.env`

#### Usage

Laradock comes with `sync.sh`, an optional bash script, that automates installing, running and stopping docker-sync.  Note that to run the bash script you may need to change the permissions `chmod 755 sync.sh`

1) Configure your Laradock environment as you would normally do and test your application to make sure that your sites are running correctly.

2) Make sure to set `DOCKER_SYNC_STRATEGY` on the `.env`. Read the [syncing strategies](https://github.com/EugenMayer/docker-sync/wiki/8.-Strategies) for details.
```
# osx: 'native_osx' (default)
# windows: 'unison'
# linux: docker-sync not required

DOCKER_SYNC_STRATEGY=native_osx
```

3) set `APP_CODE_PATH_CONTAINER=/var/www` to `APP_CODE_PATH_CONTAINER=/var/www:nocopy` in the .env file

4) Install the docker-sync gem on the host-machine:
```bash
./sync.sh install
```
5) Start docker-sync and the Laradock environment.
Specify the services you want to run, as you would normally do with `docker-compose up`
```bash
./sync.sh up nginx mysql
```
Please note that the first time docker-sync runs, it will copy all the files to the intermediate container and that may take a very long time (15min+).
6) To stop the environment and docker-sync do:
```bash
./sync.sh down
```

#### Setting up Aliases (optional)

You may create bash profile aliases to avoid having to remember and type these commands for everyday development.
Add the following lines to your `~/.bash_profile`:

```bash
alias devup="cd /PATH_TO_LARADOCK/laradock; ./sync.sh up nginx mysql" #add your services
alias devbash="cd /PATH_TO_LARADOCK/laradock; ./sync.sh bash"
alias devdown="cd /PATH_TO_LARADOCK/laradock; ./sync.sh down"
```

Now from any location on your machine, you can simply run `devup`, `devbash` and `devdown`.


#### Additional Commands

Opening bash on the workspace container (to run artisan for example):
 ```bash
 ./sync.sh bash
 ```
Manually triggering the synchronization of the files:
```bash
./sync.sh sync
```
Removing and cleaning up the files and the docker-sync container. Use only if you want to rebuild or remove docker-sync completely. The files on the host will be kept untouched.
```bash
./sync.sh clean
```


#### Additional Notes

- You may run laradock with or without docker-sync at any time using with the same `.env` and `docker-compose.yml`, because the configuration is overridden automatically when docker-sync is used.
- You may inspect the `sync.sh` script to learn each of the commands and even add custom ones.
- If a container cannot access the files on docker-sync, you may need to set a user on the Dockerfile of that container with an id of 1000 (this is the UID that nginx and php-fpm have configured on laradock). Alternatively, you may change the permissions to 777, but this is **not** recommended.

Visit the [docker-sync documentation](https://github.com/EugenMayer/docker-sync/wiki) for more details.








<br>

### B.2: using the d4m-nfs tool

[D4m-nfs](https://github.com/IFSight/d4m-nfs) automatically mount NFS volume instead of osxfs one.

1) Update the Docker [File Sharing] preferences:

Click on the Docker Icon > Preferences > (remove everything form the list except `/tmp`).

2) Restart Docker.

3) Clone the [d4m-nfs](https://github.com/IFSight/d4m-nfs) repository to your `home` directory.

```bash
git clone https://github.com/IFSight/d4m-nfs ~/d4m-nfs
```

4) Create (or edit) the file `~/d4m-nfs/etc/d4m-nfs-mounts.txt`, and write the follwing configuration in it:

```txt
/Users:/Users
```

5) Create (or edit) the file `/etc/exports`, make sure it exists and is empty. (There may be collisions if you come from Vagrant or if you already executed the `d4m-nfs.sh` script before).


6) Run the `d4m-nfs.sh` script (might need Sudo):

```bash
~/d4m-nfs/d4m-nfs.sh
```

That's it! Run your containers.. Example:

```bash
docker-compose up ...
```

*Note: If you faced any errors, try restarting Docker, and make sure you have no spaces in the `d4m-nfs-mounts.txt` file, and your `/etc/exports` file is clear.*
















<br>
<a name="Common-Problems"></a>
## Common Problems

*Here's a list of the common problems you might face, and the possible solutions.*







<br>
## I see a blank (white) page instead of the Laravel 'Welcome' page!

Run the following command from the Laravel root directory:

```bash
sudo chmod -R 777 storage bootstrap/cache
```





<br>
## I see "Welcome to nginx" instead of the Laravel App!

Use `http://127.0.0.1` instead of `http://localhost` in your browser.





<br>
## I see an error message containing `address already in use` or `port is already allocated`

Make sure the ports for the services that you are trying to run (22, 80, 443, 3306, etc.) are not being used already by other programs on the host, such as a built in `apache`/`httpd` service or other development tools you have installed.





<br>
## I get NGINX error 404 Not Found on Windows.

1. Go to docker Settings on your Windows machine.
2. Click on the `Shared Drives` tab and check the drive that contains your project files.
3. Enter your windows username and password.
4. Go to the `reset` tab and click restart docker.





<br>
## The time in my services does not match the current time

1. Make sure you've [changed the timezone](#Change-the-timezone).
2. Stop and rebuild the containers (`docker-compose up -d --build <services>`)





<br>
## I get MySQL connection refused

This error sometimes happens because your Laravel application isn't running on the container localhost IP (Which is 127.0.0.1). Steps to fix it:

* Option A
  1. Check your running Laravel application IP by dumping `Request::ip()` variable using `dd(Request::ip())` anywhere on your application. The result is the IP of your Laravel container.
  2. Change the `DB_HOST` variable on env with the IP that you received from previous step.
* Option B
   1. Change the `DB_HOST` value to the same name as the MySQL docker container. The Laradock docker-compose file currently has this as `mysql`

## I get stuck when building nginx on `fetch http://mirrors.aliyun.com/alpine/v3.5/main/x86_64/APKINDEX.tar.gz`

As stated on [#749](https://github.com/laradock/laradock/issues/749#issuecomment-293296687), removing the line `RUN sed -i 's/dl-cdn.alpinelinux.org/mirrors.aliyun.com/' /etc/apk/repositories` from `nginx/Dockerfile` solves the problem.		

## Custom composer repo packagist url and npm registry url

In China, the origin source of composer and npm is very slow. You can add `WORKSPACE_NPM_REGISTRY` and `WORKSPACE_COMPOSER_REPO_PACKAGIST` config in `.env` to use your custom source.

Example:
```bash
WORKSPACE_NPM_REGISTRY=https://registry.npm.taobao.org
WORKSPACE_COMPOSER_REPO_PACKAGIST=https://packagist.phpcomposer.com
```
