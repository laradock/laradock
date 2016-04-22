# LaraDock

[![forthebadge](http://forthebadge.com/images/badges/built-with-love.svg)](http://www.zalt.me)


LaraDock helps you run your **Laravel** App on **Docker** real quick.
<br>
It's like Laravel Homestead but for Docker instead of Vagrant.


![](http://s18.postimg.org/fhykchl09/new_laradock_cover.png)

<br>
## Contents


- [Intro](#Intro)
- [Supported Software (Docker Images)](#Supported-Software)
- [Requirements](#Requirements)
- [Installation](#Installation)
- [Usage](#Usage)
- [Documentation](#Documentation)
	- [List current running Containers](#List-current-running-Containers)
	- [Close all running Containers](#Close-all-running-Containers)
	- [Delete all existing Containers](#Delete-all-existing-Containers)
	- [Use Redis in Laravel](#Use-Redis-in-Laravel)
	- [Use custom Domain](Use-custom-Domain)
	- [Change the PHP Version](#Change-the-PHP-Version)
	- [Add/Remove a Docker Container](#AddRemove-a-Docker-Container)
	- [Add Docker Images](#Add-Docker-Images)
	- [Edit a Docker Container](#Edit-a-Docker-Container)
	- [View the Log files](#View-the-Log-files)
	- [Upgrade the Docker Images](#Upgrade-the-Docker-Images)
	- [Edit a Docker Image](#Edit-a-Docker-Image)
	- [Run a Docker Virtual Host](#Run-Docker-Virtual-Host)
	- [Find your Docker IP Address](#Find-Docker-IP-Address)





<a name="Intro"></a>
## Intro

LaraDock strives to make the development experience easier.
It contains pre-packaged Docker Images that provides you a wonderful development environment without requiring you to install PHP, NGINX, MySQL, REDIS, and any other software on your local machine.



### What is Docker?

[Docker](https://www.docker.com)  is an open-source project that automates the deployment of applications inside software containers, by providing an additional layer of abstraction and automation of [operating-system-level virtualization](https://en.wikipedia.org/wiki/Operating-system-level_virtualization) on Linux, Mac OS and Windows.

### What is Laravel?

Seriously!!!

### Why Docker not Vagrant!?
[Vagrant](https://www.vagrantup.com) gives you Virtual Machines in minutes while Docker gives you Virtual Containers in seconds.

Instead of providing a full Virtual Machines, like you get with Vagrant, Docker provides you **lightweight** Virtual Containers, that share the same kernel and allow to safely execute independent processes.


<a name="Supported-Software"></a>
## Supported Software (Docker Images)

- PHP 5.6 / NGINX
- PHP 5.5 / NGINX
- MySQL
- Redis
- Data Volume (for MySQL & Redis)
- Beanstalked


The Images links on [Github](https://github.com/LaraDock)
<br>
The Images links on [Docker Hub](https://hub.docker.com/u/laradock/)


<a name="Requirements"></a>
## Requirements
- Laravel ([Download](https://laravel.com/docs/master/installation))
- Docker Toolbox ([Download](https://www.docker.com/toolbox))
- Git ([Download](https://git-scm.com/downloads))
- Composer ([Download](https://getcomposer.org/download/))

<a name="Installation"></a>
## Installation

1 - Clone the `LaraDock` repository, in any of your `Laravel` projects:

```bash
git clone https://github.com/LaraDock/laradock.git docker
```

Instead of `git clone` you can use `git submodule add` in case you are already using Git for your Laravel project *(Recommended)*:

```bash
git submodule add https://github.com/LaraDock/laradock.git docker
```

>These commands should create a `docker` folder, on the root directory of your Laravel project.


<a name="Usage"></a>
## Usage

>**(Windows & MAC users)** Make sure you have a running Docker Virtual Host on your machine first. 
><br>
>[How to run a Docker Virtual Host?](#Run-Docker-Virtual-Host)


<br>
1 - Open your Laravel's `.env` file and set the `DB_HOST` to your `{Docker-IP}`:

```env
DB_HOST=xxx.xxx.xxx.xxx
```
[How to find my Docker IP Address?](#Find-Docker-IP-Address)

<br>
2 - Run the containers: 
<br>
*(Make sure you are in the `docker` folder before running this command)*

```bash
docker-compose up -d
```

>*Only the first time you run this command, it will take up to 5 minutes (depend on your connection speed) to download the Docker Images on your local machine.*

<br>
3 - Open your browser and visit your `{Docker-IP}` address (`http://xxx.xxx.xxx.xxx`).


> **Debugging**: in case you faced an error here, run this command from the Laravel root directory:
> <br>
> `sudo chmod -R 777 storage && sudo chmod -R 777 bootstrap/cache`

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


<br>
<a name="Delete-all-existing-Containers"></a>
#### Delete all existing Containers
```bash
docker-compose rm -f
```

*Note: Careful with this command as it will delete your Data Volume Container as well. (if you want to keep your Database data than you should stop each container by itself as follow):* 

`docker stop {container-name}`



<br>
<a name="Use-Redis-in-Laravel"></a>
#### Use Redis in Laravel

Open your Laravel's `.env` file and set the `REDIS_HOST` to your `Docker-IP` instead of the default `127.0.0.1`.

```env
REDIS_HOST=xxx.xxx.xxx.xxx
```

If you don't find the `REDIS_HOST` variable in your `.env` file. Go to the database config file `config/database.php` and replace the `127.0.0.1` with your `Docker-IP` for Redis like this:

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

To enable Redis Caching and/or for Sessions Management. Also from the `.env` file set `CACHE_DRIVER` and `SESSION_DRIVER` to `redis` instead of the default `file`.

```env
CACHE_DRIVER=redis
SESSION_DRIVER=redis
```

Finally make sure you have the `predis/predis` package `(~1.0)` installed via Composer first.

```shell
composer require predis/predis:^1.0
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

3 - Open the nginx config file `docker/settings/nginx/default` and add this in the `server`:

```
server_name laravel.dev;
```

4 - Open your browser and visit `{http://laravel.dev}`


>In case you faced any problem, try this additional step:
>
>Open the `docker-compose.yml` and add the following to `php-nginx:`
>
>```yaml
>  extra_hosts:
>    - "laravel.dev:xxx.xxx.xxx.xxx"
>```



<br>
<a name="Change-the-PHP-Version"></a>
#### Change the PHP Version
By default **PHP 5.6** is running.
<br>
To change the default PHP version, simply open your `docker-compose.yml` file and edit this line:

```yaml
image: laradock/php56nginx:latest
```
Supported versions:

- (PHP 5.5.*) laradock/php55nginx:latest
- (PHP 5.6.*) laradock/php56nginx:latest


**Note:** If you use this `laradock/phpnginx` image, it will pull from `laradock/php56nginx`.





<br>
<a name="Add-Docker-Images"></a>
#### Add Docker Images 
*(add a software to run with other Containers)*
<br>
To add an image (software), just edit the `docker-compose.yml` and add your container details, to do so you need to be familiar with the [docker compose file syntax](https://docs.docker.com/compose/yml/).



<br>
<a name="Edit-a-Docker-Container"></a>
#### Edit a Docker Container (change Ports or Volumes)
To modify a container you can simply open the `docker-compose.yml` and change everything you want.

Example: if you want to set the MySQL port to 3333, just replace the default port with yours:

```yml
  ports:
    - "3333:3306"
```



<br>
<a name="View-the-Log-files"></a>
#### View the Log files 
The Log files are stored in the `docker/logs` directory.




<br>
<a name="Upgrade-the-Docker-Images"></a>
#### Upgrade the Docker Images

By default `docker-compose.yml` is configured to use the latest stable version of the image (latest stable realease `tag`).


To use the latest build you can edit the `docker-compose.yml` file and replace the version number at the end of every image name with `:latest`
<br>
Example: change `image: laradock/mysql:0.1.0` to `image: laradock/mysql:latest`


<br>
<a name="AddRemove-a-Docker-Container"></a>
#### Add/Remove a Docker Container
To prevent a container (software) from running, open the `docker-compose.yml` file, and comment out the container section or remove it entirely.



<br>
<a name="Edit-a-Docker-Image"></a>
#### Edit a Docker Image (change some configuration in the image)
To edit an image, and take full control of it:

1. Clone any Image from [https://github.com/LaraDock](https://github.com/LaraDock)
2. Modify the `Dockfile`
3. Run `docker build -t {your-image-name} .`

All the images are open source and hosted on the [Docker Hub](https://hub.docker.com/u/laradock/).

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



#### Questions?
[![Join the chat at https://gitter.im/LaraDock/laradock](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/LaraDock/laradock?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge) 



## Credits

[![Mahmoud Zalt](https://img.shields.io/badge/Author-Mahmoud%20Zalt-orange.svg)](http://www.zalt.me)



## License

[MIT License (MIT)](https://github.com/laradock/laradock/blob/master/LICENSE)
[]([]())