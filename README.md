# LaraDock


[![forthebadge](http://forthebadge.com/images/badges/built-with-love.svg)](http://www.zalt.me)


## Contents


- [Intro](#Intro)
- [Requirements](#Requirements)
- [Usage](#Usage)
- [Documentation](#Documentation)
- [Supported Images](#Supports)

![](http://s11.postimg.org/uqpl3efab/laradock.jpg)



<a name="Intro"></a>
### What is LaraDock?

**LaraDock** helps you run your **Laravel** App on **Docker** in seconds.

LaraDock strives to make the development experience easier.
It contains pre-packaged Docker Images that provides you a wonderful development environment without requiring you to install PHP, NGINX, MySQL, REDIS, and any other software on your local machine.


### What is Docker?

[Docker](https://www.docker.com)  is an open-source project that automates the deployment of applications inside software containers, by providing an additional layer of abstraction and automation of [operating-system-level virtualization](https://en.wikipedia.org/wiki/Operating-system-level_virtualization) on Linux, Mac OS and Windows.

### What is Laravel?

Seriously!!!

### Why Docker not Vagrant!?
[Vagrant](https://www.vagrantup.com) gives you Virtual Machines in minutes while Docker gives you Linux Containers in seconds.

Instead of providing a full Virtual Machines, like you get with Vagrant, Docker provides you **lightweight** Virtual Containers, that share the same kernel and allow to safely execute independent processes.


### Questions?
[![Join the chat at https://gitter.im/LaraDock/laradock](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/LaraDock/laradock?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge) 




<a name="Requirements"></a>
## Requirements
- Laravel Installation
- Docker Toolbox ([Download](https://www.docker.com/toolbox))
- Git ([Download](https://git-scm.com/downloads))
- Composer ([Download](https://getcomposer.org/download/))

*Note: Git & Composer can be installed on Docker Containers if you don't want to install them on your machine. (But you have to do this yourself for now).*


<a name="Usage"></a>
## Usage

1 - First install any version of Laravel, or use any of your existing Laravel projects.

2 - Open your terminal and go to your Laravel project directory.

3 - Create a new folder on the root directory of your Laravel project and name it `docker` then go into it.

```bash
mkdir docker && cd $_
```

3 - Clone the LaraDock repository inside that `docker` folder.

```bash
git clone https://github.com/LaraDock/laradock.git .
```

4 - Find your Docker IP address.

- If you are on Linux OS: your IP Address is `127.0.0.1` because the containers run directly on your localhost.
- If you are on MAC or Windows OS and using the **docker-machine**: start your docker machine then type `docker-machine ip {VM-Name}` to get your IP Address. *(Default is 192.168.99.100)*
- If you are on MAC or Windows OS and using **boot2docker**: type `boot2docker ip` when boot2docker is up, to get your IP Address.

5 - Open your hosts file `/etc/hosts`.

```bash
sudo nano /etc/hosts
```

6 - Map your `Docker IP` to the `laravel.dev` domain, by adding the following to the `hosts` file. 

```bash
xxx.xxx.xxx.xxx          laravel.dev
```

Don't forget to replace the `xxx.xxx.xxx.xxx` with your Docker IP Address.

7 - Open `docker-compose.yml` file and replace the `xxx.xxx.xxx.xxx` with your Docker IP Adress as well.

8 - Open your Laravel's `.env` file and set the `DB_HOST` and the `REDIS_HOST` to `laravel.dev` instead of the default `127.0.0.1`.

```env
DB_HOST=laravel.dev
REDIS_HOST=laravel.dev
```

9 - Finally run the containers to start coding. 

```bash
docker-compose up -d
```

*"Note: Only the first time you run this command, it will take up to 7 minutes (depend on your connection speed) to download the images to your local machine, Only once in life.*

10 - Open your browser and visit `http://laravel.dev`


> Debugging: if you faced an error, it might be that you forget to provide some permissions for Laravel, so try running the following command on the Laravel rood directory:
`sudo chmod -R 777 storage && sudo chmod -R 777 bootstrap/cache`






<a name="Documentation"></a>
## Documentation

#### See current running Containers
```bash
docker ps
```


#### Close all running Containers
```bash
docker-compose stop
```



#### Delete all existing Containers
```bash
docker-compose rm -f
```

*Note: Careful with this command as it will delete your Data Volume Container as well. (if you want to keep your Database data than you should stop each container by itself as follow):* 

`docker stop {container-name}`




#### Remove Container
To prevent a container (software) from running, open the `docker-compose.yml` file, and comment out the container section or remove it entirely.


#### Add an Image (add a software to run with other Containers)
To add an image (software), just edit the `laradock/docker/docker-compose.yml` and add your container details, to do so you need to be familiar with the [docker compose file syntax](https://docs.docker.com/compose/yml/).


#### Edit a Container (change Ports or Volumes)
To modify a container you can simply open the `laradock/docker/docker-compose.yml` and change everything you want.

Example: if you want to set the MySQL port to 3333, just replace the default port with yours:

```yml
  ports:
    - "3333:3306"
```

#### Edit an existing Image (change some configuration in the image)
To edit an image, and take full control of it:

1. clone the LaraDock `docker-images` repository [https://github.com/LaraDock/docker-images](https://github.com/LaraDock/images)
2. modify whichever `Dockfile` you want
3. from the modified image directory run `docker build -t {your-image-name} .`

All the images are open source and hosted on the [Docker Hub](https://hub.docker.com/u/laradock/).

*If you find any bug or you have and suggestion that can improve the performance of any image, please consider contributing. Thanks in advance.*

#### View the Log files 
The Log files are stored in the `docker/logs` directory.



<a name="Supports"></a>
## Highlights

__Currently Supported Docker Images:__

- [NGINX+PHP](https://hub.docker.com/r/laradock/phpnginx/)
- [MySQL](https://hub.docker.com/r/laradock/mysql/)
- [Redis](https://hub.docker.com/r/laradock/redis/)
- [Beanstalked](https://hub.docker.com/r/laradock/beanstalkd/)
- [Data Volume](https://hub.docker.com/r/laradock/data/) (for MySQL & Redis)




## Contributing

All contributions are welcomed.



## Support

[Issues](https://github.com/laradock/laradock/issues) on Github.



## Credits

[![Mahmoud Zalt](https://img.shields.io/badge/Author-Mahmoud%20Zalt-orange.svg)](http://www.zalt.me)



## License

[MIT License (MIT)](https://github.com/laradock/laradock/blob/master/LICENSE)
