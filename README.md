# LaraDock

[![forthebadge](http://forthebadge.com/images/badges/built-by-developers.svg)](http://zalt.me)


LaraDock helps you run your **Laravel** App on **Docker** real quick.
<br>
It's like Laravel Homestead but for Docker instead of Vagrant.


![](http://s18.postimg.org/fhykchl09/new_laradock_cover.png)

<br>
## Contents


- [Intro](#Intro)
	- [Features](#features)
	- [Supported Containers](#Supported-Containers)
	- [What is Docker](#what-is-docker)
	- [What is Laravel](#what-is-laravel)
	- [Why Docker not Vagrant](#why-docker-not-vagrant)
	- [LaraDock VS Homestead](#laradock-vs-homestead)
- [Requirements](#Requirements)
- [Installation](#Installation)
- [Usage](#Usage)
- [Documentation](#Documentation)
	- [Docker](#Docker)
		- [List current running Containers](#List-current-running-Containers)
		- [Close all running Containers](#Close-all-running-Containers)
		- [Delete all existing Containers](#Delete-all-existing-Containers)
		- [Enter a Container (SSH into a running Container)](#Enter-Container)
		- [Edit default container configuration](#Edit-Container)
		- [Edit a Docker Image](#Edit-a-Docker-Image)
		- [Build/Re-build Containers](#Build-Re-build-Containers)
		- [Add more Software's (Docker Images)](#Add-Docker-Images)
		- [View the Log files](#View-the-Log-files)
	- [Laravel](#Laravel):
		- [Run Artisan Commands](#Run-Artisan-Commands)
		- [Use Redis](#Use-Redis)
	- [PHP](#PHP)
		- [Install PHP Extensions](#Install-PHP-Extensions)
		- [Change the PHP-FPM Version](#Change-the-PHP-FPM-Version)
		- [Change the PHP-CLI Version](#Change-the-PHP-CLI-Version)
	- [Misc](#Misc)
		- [Run a Docker Virtual Host](#Run-Docker-Virtual-Host)
		- [Find your Docker IP Address](#Find-Docker-IP-Address)
		- [Use custom Domain](#Use-custom-Domain)




<a name="Intro"></a>
## Intro

LaraDock strives to make the development experience easier.
It contains pre-packaged Docker Images that provides you a wonderful development environment without requiring you to install PHP, NGINX, MySQL, REDIS, and any other software on your local machine.


**Usage Overview:** Run `NGINX` and `MySQL`.

```shell
docker-compose up  nginx mysql 
```

<a name="features"></a>
### Features

- Easy switch between PHP versions: 7.0 - 5.6 - 5.5 ...
- Choose your favorite database engine: MySQL - Postgres - Redis ...
- Run your own combination of software's: Memcached - MariaDB ...
- Every software runs on a separate container: PHP-FPM - NGINX ...
- Easy to customize any container, with simple edit to the `dockerfile`.
- All Images extends from an official base Image. (Trusted base Images).
- Pre-configured Nginx for Laravel.
- Data container, to keep Data safe and accessible.
- Easy to apply configurations inside containers.
- Clean and well structured Dockerfiles (`dockerfile`).
- Latest version of the Docker Compose file (`docker-compose`).
- Everything is visible and editable.


<a name="Supported-Containers"></a>
### Supported Containers

- PHP-FPM (7.0 - 5.6 - 5.5)
- NGINX
- MySQL
- PostgreSQL
- MariaDB
- Redis
- Memcached
- Beanstalkd
- Beanstalkd Console
- Workspace (contains: Composer, PHP7-CLI, Laravel Installer, Git, Node, Gulp, Bower, SQLite,  Vim, Nano and cURL)
- Data Volume *(Databases Data Container)*
- Application *(Application Code Container)*


>If you can't find your container, build it yourself and add it to this list. Contributions are welcomed :)





<a name="what-is-docker"></a>
### What is Docker?

[Docker](https://www.docker.com)  is an open-source project that automates the deployment of applications inside software containers, by providing an additional layer of abstraction and automation of [operating-system-level virtualization](https://en.wikipedia.org/wiki/Operating-system-level_virtualization) on Linux, Mac OS and Windows.

<a name="what-is-laravel"></a>
### What is Laravel?

Seriously!!!


<a name="why-docker-not-vagrant"></a>
### Why Docker not Vagrant!?

[Vagrant](https://www.vagrantup.com) creates Virtual Machines in minutes while Docker creates Virtual Containers in seconds.

Instead of providing a full Virtual Machines, like you get with Vagrant, Docker provides you **lightweight** Virtual Containers, that share the same kernel and allow to safely execute independent processes.

In addition to the speed, Docker gives tens of features that cannot be achieved with Vagrant.

Most importantly Docker can run on Development and on Production (same environment everywhere). While Vagrant is designed for Development only, (so you have to re-provision your server on Production every time).


<a name="laradock-vs-homestead"></a>
### LaraDock VS Homestead

LaraDock and [Homestead](https://laravel.com/docs/master/homestead) both gives you a complete virtual development environments. (Without the need to install and configure every single software on your own Operating System).

- Homestead is a tool that controls Vagrant for you (using Homestead special commands). And Vagrant manages your Virtual Machine.

- LaraDock is a tool that controls Docker for you (using Docker Compose official commands). And Docker manages you Virtual Containers.

Running a virtual Container is much faster than running a full virtual Machine. 
<br>Thus **LaraDock is much faster than Homestead**.



<a name="Requirements"></a>
## Requirements

| Linux                                                                                   | Windows & MAC                                           |
|-----------------------------------------------------------------------------------------|---------------------------------------------------------|
|                 [Laravel](https://laravel.com/docs/master/installation)                 | [Laravel](https://laravel.com/docs/master/installation) |
|                           [Git](https://git-scm.com/downloads)                          |           [Git](https://git-scm.com/downloads)          |
| [Docker Engine](https://docs.docker.com/engine/installation/linux/ubuntulinux) |     [Docker Toolbox](https://www.docker.com/toolbox)    |
|                [Docker Compose](https://docs.docker.com/compose/install)                |                                                         |


<a name="Installation"></a>
## Installation

#### A - In existing Laravel Projects:

1 - Clone the `LaraDock` repository, inside your `Laravel` project root direcotry:

```bash
git submodule add https://github.com/LaraDock/laradock.git
```

2 - That's it, jump to the Usage section now.

*If you are not already using Git for your Laravel project, you can use `git clone` instead of `git submodule`.*


<br>
#### B - From scratch (Install LaraDock and Laravel):

*If you don't have any Laravel project yet, and you want to start your Laravel project with Docker.*

1 - Clone the `LaraDock` repository anywhere on your machine:

```bash
git clone https://github.com/LaraDock/laradock.git
```

2 - Go to the Uage section below and do the steps 1 and 3 then come back here.

3 - Enter the Workspace container. (assuming you have the Workspace container running):

```bash
docker exec -it {Workspace-Container-Name} bash
```
Replace `{Workspace-Container-Name}` with your Workspace container name. To get the name type `docker-compose ps` and copy it.

4 - Install Laravel anyway you like. 

Example using the Laravel Installer:

```bash
laravel new my-cool-app
```
For more about this check out this [link](https://laravel.com/docs/master#installing-laravel).

5 - Edit `docker-compose.yml` to Map the new application path:

By default LaraDock assumes the Laravel application is living in the parent directory of the laradock folder. 

Since the new Laravel application is in the `my-cool-app` folder, we should replace `../:/var/www/laravel` with `../my-cool-app/:/var/www/laravel`, as follow:

```yaml
    application:
        build: ./application
        volumes:
            - ../my-cool-app/:/var/www/laravel
```
6 - finally go to the Usage section below again and do steps 2 and 4.




<a name="Usage"></a>
## Usage

1 - For **Windows & MAC** users only: make sure you have a running Docker Virtual Host on your machine. 
(**Linux** users don't need a Virtual Host, so skip this step).
<br>
[How to run a Docker Virtual Host?](#Run-Docker-Virtual-Host)


<br>
2 - Open your Laravel's `.env` file and set the `DB_HOST` to your `{Docker-IP}`:

```env
DB_HOST=xxx.xxx.xxx.xxx
```
[How to find my Docker IP Address?](#Find-Docker-IP-Address)

<br>
3 - Run the Containers, (you can select the software's (containers) that you wish to run)
<br>
*Make sure you are in the `laradock` folder before running the `docker-compose` command.*

**Example:** Running NGINX, MySQL, Redis and the Workspace:

```bash
docker-compose up -d  nginx mysql redis workspace
```
*Note: the PHP-FPM, Application and Data Containers will automatically run.*


Supported Containers: `workspace`, `nginx`, `mysql`, `redis`, `postgres`, `mariadb`, `memcached`, `beanstalkd`, `beanstalkd-console`, `data`, `php-fpm`, `application`.

<br>
4 - Open your browser and visit your `{Docker-IP}` address (`http://xxx.xxx.xxx.xxx`).


<br>
**Debugging**: in case you faced an error here, run this command from the Laravel root directory:

```bash
sudo chmod -R 777 storage && sudo chmod -R 777 bootstrap/cache
```

<br>


[Follow @Mahmoud_Zalt](https://twitter.com/Mahmoud_Zalt)




<br>
<a name="Documentation"></a>
## Documentation



<a name="Docker"></a>
### Docker



<a name="List-current-running-Containers"></a>
#### List current running Containers
```bash
docker ps
```
You can also use the this command if you want to see only this project containers:

```bash
docker-compose ps
```





<br>
<a name="Close-all-running-Containers"></a>
#### Close all running Containers
```bash
docker-compose stop
```

To stop single container do:

```bash
docker-compose stop {container-name}
```






<br>
<a name="Delete-all-existing-Containers"></a>
#### Delete all existing Containers
```bash
docker-compose down
```

*Note: Careful with this command as it will delete your Data Volume Container as well. (if you want to keep your Database data than you should stop each container by itself as follow):* 







<br>
<a name="Enter-Container"></a>
#### Enter a Container (SSH into a running Container)

1 - first list the current running containers with `docker ps`

2 - enter any container using:

```bash
docker exec -it {container-name} bash
```
3 - to exit a container, type `exit`.







<br>
<a name="Edit-Container"></a>
#### Edit default container configuration
Open the `docker-compose.yml` and change anything you want.

Examples: 

Change MySQL Database Name:

```yml
  environment:
    MYSQL_DATABASE: laradock
```

Change Redis defaut port to 1111:

```yml
  ports:
    - "1111:6379"
```








<br>
<a name="Edit-a-Docker-Image"></a>
#### Edit a Docker Image

1 - Find the `dockerfile` of the image you want to edit, 
<br>
example for `mysql` it will be `mysql/Dockerfile`.

2 - Edit the file the way you want.

3 - Re-build the container:

```bash
docker-compose build mysql
```

*If you find any bug or you have and suggestion that can improve the performance of any image, please consider contributing. Thanks in advance.*










<br>
<a name="Build-Re-build-Containers"></a>
#### Build/Re-build Containers

If you do any change to any `dockerfile` make sure you run this command, for the changes to take effect:

```bash
docker-compose build
```
Optionally you can specify which container to rebuild (instead of rebuilding all the containers):

```bash
docker-compose build {container-name}
```






<br>
<a name="Add-Docker-Images"></a>
#### Add more Software's (Docker Images)

To add an image (software), just edit the `docker-compose.yml` and add your container details, to do so you need to be familiar with the [docker compose file syntax](https://docs.docker.com/compose/compose-file/).









<br>
<a name="View-the-Log-files"></a>
#### View the Log files 
The Nginx Log file is stored in the `logs/nginx` directory.

However to view the logs of all the other containers (MySQL, PHP-FPM,...) you can run this:

```bash
docker logs {container-name}
```





<br>
<a name="Laravel"></a>
### Laravel




<a name="Run-Artisan-Commands"></a>
#### Run Artisan Commands

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
docker exec -it {workspace-container-name} bash
```

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
```bash
laravel new blog
```








<br>
<a name="Use-Redis"></a>
#### Use Redis

1 - First make sure you run the Redis Container with the `docker-compose` command.

2 - Open your Laravel's `.env` file and set the `REDIS_HOST` to your `Docker-IP` instead of the default `127.0.0.1` IP.

```env
REDIS_HOST=xxx.xxx.xxx.xxx
```

If you don't find the `REDIS_HOST` variable in your `.env` file. Go to the database config file `config/database.php` and replace the default `127.0.0.1` IP with your `Docker-IP` for Redis like this:

```php
'redis' => [
    'cluster' => false,
    'default' => [
        'host'     => 'xxx.xxx.xxx.xxx',
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

4 - Finally make sure you have the `predis/predis` package `(~1.0)` installed via Composer first.

```bash
composer require predis/predis:^1.0
```

5 - You can manually test it from Laravel with this code:

```php
\Cache::store('redis')->put('LaraDock', 'Awesome', 10);
```










<br>
<a name="PHP"></a>
### PHP






<a name="Install-PHP-Extensions"></a>
#### Install PHP Extensions

Before installing PHP extensions, you have to decide whether you need for the `FPM` or `CLI` because each lives on a different container, if you need it for both you have to edit both containers.

The PHP-FPM extensions should be installed in `php-fpm/Dockerfile-XX`. *(replace XX with your default PHP version number)*.
<br>
The PHP-CLI extensions should be installed in `workspace/Dockerfile`.









<br>
<a name="Change-the-PHP-FPM-Version"></a>
#### Change the PHP-FPM Version
By default **PHP-FPM 7.0** is running.

>The PHP-FPM is responsible of serving your application code, you don't have to change the PHP-CLI version if you are planing to run your application on different PHP-FPM version.

1 - Open the `docker-compose.yml`.

2 - Search for `Dockerfile-70` in the PHP container section.

3 - Change the version number. 
<br>
Example to select version 5.6 instead of 7.0 you have to replace `Dockerfile-70` with `Dockerfile-56`.

Sample: 

```txt
php-fpm:
    build:
        context: ./php-fpm
        dockerfile: Dockerfile-70
```

Supported Versions:

- For (PHP 7.0.*) use `Dockerfile-70`
- For (PHP 5.6.*) use `Dockerfile-56`
- For (PHP 5.5.*) use `Dockerfile-55`


4 - Finally rebuild the container

```bash
docker-compose build php
```

For more details about the PHP base image, visit the [official PHP docker images](https://hub.docker.com/_/php/).









<br>
<a name="Change-the-PHP-CLI-Version"></a>
#### Change the PHP-CLI Version
By default **PHP-CLI 7.0** is running.

>Note: it's not very essential to edit the PHP-CLI verion. The PHP-CLI is only used for the Artisan Commands & Composer. It doesn't serve your Application code, this is the PHP-FPM job.

The PHP-CLI is installed in the Workspace container. To change the PHP-CLI version you need to edit the `workspace/Dockerfile`.

Right now you have to manually edit the `Dockerfile` or create a new one like it's done for the PHP-FPM. (consider contributing).











<br>
<a name="Misc"></a>
### Misc





<a name="Run-Docker-Virtual-Host"></a>
#### Run a Docker Virtual Host

These steps are only for **Windows & MAC** users *(Linux users don't need a virtual host)*:

1 - Run the default Host:

```bash
docker-machine start default
```

* If the host "default" does not exist, create one using the command below, else skip it:

* ```bash
  docker-machine create -d virtualbox default
  ```

2 - Run this command to configure your shell:

```bash
eval $(docker-machine env)
```







<br>
<a name="Find-Docker-IP-Address"></a>
#### Find your Docker IP Address 

**On Windows & MAC:** 

```bash
docker-machine ip default
```
If your Host name is different then `default`, you have to specify it (`docker-machine ip my-host`).

*(The default IP is 192.168.99.100)*

> **boot2docker** users: run `boot2docker ip` *(when boot2docker is up)*.

<br>
**On Linux:** 

1 - Run `ifconfig` in the terminal.

2 - In the result search for `docker0`, your IP address will be next to `inet addr`.

Example: (In this example your IP address is `172.17.0.1`).

```shell
docker0   Link encap:Ethernet  HWaddr 02:42:41:2d:c4:24
          inet addr:172.17.0.1  Bcast:0.0.0.0  Mask:255.255.0.0
          UP BROADCAST MULTICAST  MTU:1500  Metric:1
          RX packets:0 errors:0 dropped:0 overruns:0 frame:0
          TX packets:0 errors:0 dropped:0 overruns:0 carrier:0
          collisions:0 txqueuelen:0
          RX bytes:0 (0.0 B)  TX bytes:0 (0.0 B)
```
>If you have an easier way to do it, share it with us.






<br>
<a name="Use-custom-Domain"></a>
#### Use custom Domain (instead of the Docker IP)

Assuming your custom domain is `laravel.dev` and your current `Docker-IP` is `xxx.xxx.xxx.xxx`.

1 - Open your `/etc/hosts` file and map your `Docker IP` to the `laravel.dev` domain, by adding the following:

```bash
xxx.xxx.xxx.xxx    laravel.dev
```

2 - Open your Laravel's `.env` file and replace the `127.0.0.1` default values with your `{Docker-IP}`.
<br>
Example:

```env
DB_HOST=xxx.xxx.xxx.xxx
```

3 - Open your browser and visit `{http://laravel.dev}`



Optionally you can define the server name in the nginx config file, like this:

```conf
server_name laravel.dev;
```










<br>
## Contributing

This little project was built by one man who has a full time job and many responsibilities, so if you like this project and you find that it needs a bug fix or support for new software or upgrade for the current containers, or anything else.. Do not hesitate to contribute, you are more than welcome :)

All Docker Images can be found at [https://github.com/LaraDock](https://github.com/LaraDock)

## Support

[Issues](https://github.com/laradock/laradock/issues) on Github.



### Questions?
If you have any question, send me a direct message on LaraChat, my username is `mahmoud_zalt`.


## Credits

[![Mahmoud Zalt](https://img.shields.io/badge/Author-Mahmoud%20Zalt-orange.svg)](http://www.zalt.me)



## License

[MIT License (MIT)](https://github.com/laradock/laradock/blob/master/LICENSE)
[]([]())
