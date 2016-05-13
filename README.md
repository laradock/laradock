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
	- [What is Docker](#what-is-docker)
	- [What is Laravel](#what-is-laravel)
	- [Why Docker not Vagrant](#why-docker-not-vagrant)
	- [LaraDock VS Homestead](#laradock-vs-homestead)
- [Supported Containers](#Supported-Containers)
- [Requirements](#Requirements)
- [Installation](#Installation)
- [Usage](#Usage)
- [Documentation](#Documentation)
	- [List current running Containers](#List-current-running-Containers)
	- [Close all running Containers](#Close-all-running-Containers)
	- [Delete all existing Containers](#Delete-all-existing-Containers)
	- [Build/Re-build Containers](#Build-Re-build-Containers)
	- [Change the PHP Version](#Change-the-PHP-Version)
	- [Add/Remove a Docker Container](#AddRemove-a-Docker-Container)
	- [Add more Software's (Docker Images)](#Add-Docker-Images)
	- [Edit default container configuration](#Edit-Container)
	- [Use custom Domain](Use-custom-Domain)
	- [View the Log files](#View-the-Log-files)
	- [Use Redis](#Use-Redis)
	- [Enter a Container (SSH into a running Container)](#Enter-Container)
	- [Edit a Docker Image](#Edit-a-Docker-Image)
	- [Run a Docker Virtual Host](#Run-Docker-Virtual-Host)
	- [Find your Docker IP Address](#Find-Docker-IP-Address)





<a name="Intro"></a>
## Intro

LaraDock strives to make the development experience easier.
It contains pre-packaged Docker Images that provides you a wonderful development environment without requiring you to install PHP, NGINX, MySQL, REDIS, and any other software on your local machine.


**Usage Overview:** Run `NGINX`, `MySQL` and `Redis`.

```shell
docker-compose up -d  nginx mysql redis 
```

<a name="features"></a>
### Features

- Easy switch between PHP versions: 7.0 - 5.6 - 5.5 ...
- Choose your favorite database engine: MySQL - Postgres - Redis ...
- Run your own combination of software's: Memcached - MariaDB ...
- Every software runs on a separate container: PHP - NGINX ...
- Easy to customize any container, with simple edit to the `dockerfile`.
- All Images extends from an official base Image. (Trusted base Images).
- Pre-configured Nginx for Laravel.
- Data container, to keep Data safe and accessible.
- Easy to apply configurations inside containers.
- Clean and well structured Dockerfiles (`dockerfile`).
- Latest version of the Docker Compose file (`docker-compose`).
- Everything is visible and editable.


<a name="Supported-Containers"></a>
## Supported Containers

- PHP (7.0 - 5.6 - 5.5)
- NGINX
- MySQL
- PostgreSQL
- MariaDB
- Redis
- Memcached
- Beanstalkd
- Beanstalkd Console
- Data Volume

>Cannot find your container! we would love to have it as well. Consider contributing your container and adding it to this list.





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
| [Docker Engine](https://docs.docker.com/engine/installation/linux/ubuntulinux/#install) |     [Docker Toolbox](https://www.docker.com/toolbox)    |
|                [Docker Compose](https://docs.docker.com/compose/install)                |                                                         |


<a name="Installation"></a>
## Installation

1 - Clone the `LaraDock` repository, in any of your `Laravel` projects:

```bash
git clone https://github.com/LaraDock/laradock.git docker
```

You can use `git submodule add` instead of `git clone` if you are already using Git for your Laravel project *(Recommended)*:

```bash
git submodule add https://github.com/LaraDock/laradock.git docker
```

>These commands should create a `docker` folder, on the root directory of your Laravel project.




<a name="Usage"></a>
## Usage

0 - For **Windows & MAC** users only: make sure you have a running Docker Virtual Host on your machine. 
(**Linux** users don't need a Virtual Host, so skip this step).
<br>
[How to run a Docker Virtual Host?](#Run-Docker-Virtual-Host)


<br>
1 - Open your Laravel's `.env` file and set the `DB_HOST` to your `{Docker-IP}`:

```env
DB_HOST=xxx.xxx.xxx.xxx
```
[How to find my Docker IP Address?](#Find-Docker-IP-Address)

<br>
2 - Run the Containers, (you can select the software's (containers) that you wish to run)
<br>
*Make sure you are in the `docker` folder before running the `docker-compose` command.*

> Running PHP, NGINX, MySQL and Redis:

```bash
docker-compose up -d  php nginx mysql redis
```

Note: you can choose your own combination of software's (containers), another example:

> Running PHP, NGINX, Postgres and Memcached:

```bash
docker-compose up -d  php nginx postgres memcached
```

Supported Containers: `nginx`, `mysql`, `redis`, `postgres`, `mariadb`, `memcached`, `beanstalkd`, `beanstalkd-console`, `data`, `php`.

<br>
3 - Open your browser and visit your `{Docker-IP}` address (`http://xxx.xxx.xxx.xxx`).


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

<a name="List-current-running-Containers"></a>
#### List current running Containers
```bash
docker ps
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
docker-compose rm -f
```

*Note: Careful with this command as it will delete your Data Volume Container as well. (if you want to keep your Database data than you should stop each container by itself as follow):* 




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
<a name="Change-the-PHP-Version"></a>
#### Change the PHP Version
By default **PHP 7.0** is running.
<br>
To change the default PHP version:

1 - Open the `dockerfile` of the `php` folder.

2 - Change the PHP version number in the first line,

```txt
FROM php:7.0-fpm
```

Supported Versions:

- For (PHP 7.0.*) use `php:7.0-fpm`
- For (PHP 5.6.*) use `php:5.6-fpm`
- For (PHP 5.5.*) use `php:5.5-fpm`

For more details visit the [official PHP docker images](https://hub.docker.com/_/php/).

3 - Finally rebuild the container

```bash
docker-compose build php
```




<br>
<a name="Add-Docker-Images"></a>
#### Add more Software's (Docker Images)

To add an image (software), just edit the `docker-compose.yml` and add your container details, to do so you need to be familiar with the [docker compose file syntax](https://docs.docker.com/compose/compose-file/).



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

```
server_name laravel.dev;
```




<br>
<a name="View-the-Log-files"></a>
#### View the Log files 
The Log files are stored in the `docker/logs` directory.





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
<a name="Enter-Container"></a>
#### Enter a Container (SSH into a running Container)

1 - first list the current running containers with `docker ps`

2 - enter any container using:

```bash
docker exec -it {container-name-or-id} bash
```
3 - to exit a container, type `exit`.


<br>
<a name="AddRemove-a-Docker-Container"></a>
#### Add/Remove a Docker Container
To prevent a container (software) from running, open the `docker-compose.yml` file, and comment out the container section or remove it entirely.




<br>
<a name="Edit-a-Docker-Image"></a>
#### Edit a Docker Image

1 - Find the `dockerfile` of the image you want to edit, 
<br>
example for `php` it will be `docker/php/dockerfile`.

2 - Edit the file the way you want.

3 - Re-build the container:

```bash
docker-compose build
```

*If you find any bug or you have and suggestion that can improve the performance of any image, please consider contributing. Thanks in advance.*




<br>
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
*(The default IP is 192.168.99.100)*

**On Linux:** 

Your IP Address is `127.0.0.1`

> **boot2docker** users: run `boot2docker ip` *(when boot2docker is up)*.




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