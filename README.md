# LaraDock


[![forthebadge](http://forthebadge.com/images/badges/built-with-love.svg)](http://www.zalt.me)

### What is this?

**LaraDock** is a **laravel** installation `(v5.1.10)` pre-configured to work on **Docker**.


![](http://s11.postimg.org/uqpl3efab/laradock.jpg)


### What is Docker?

[Docker](https://www.docker.com) is a [Linux](https://www.linux.com) container, written in [Go](http://golang.org) and based on [LXC](https://en.wikipedia.org/wiki/LXC) and [AUFS](https://en.wikipedia.org/wiki/Aufs). 

### What is Laravel?

Are you serious!!

### Why Docker not Vagrant?!
[Vagrant](https://www.vagrantup.com) gives you Virtual Machines in minutes while Docker gives you Linux Containers in seconds.

Instead of providing a full Virtual Machines, like you get with Vagrant, Docker provides you **lightweight** Virtual Containers, that share the same kernel and allow to safely execute independent processes.


### What's next?

LaraDock strives to make the development experience easier.
And it is inspired by [Laravel Homestead](http://laravel.com/docs/master/homestead). 

*In the near future LaraDock will become a stand-alone package that manages your Docker Virtual Containers as Homestead does with your Vagrant Virtual Machines.*




### Questions?
If you have any questions please share it with us on [![Join the chat at https://gitter.im/LaraDock/laradock](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/LaraDock/laradock?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge) or email me on (mahmoud@zalt.me).


## Contents

- [Highlights](#Highlights)
- [Requirements](#Requirements)
- [Usage](#Usage)
- [Documentation](#Documentation)



<a name="Highlights"></a>
## Highlights

__Included Images:__

- NGINX+PHP
- MySQL
- Redis
- Beanstalked
- Data Volume (for MySQL & Redis)

Note: PHP and NGINX are in one container, I will split them whenever I see the need for it.
	

<a name="Requirements"></a>
## Requirements
- Docker toolbox ([Download](https://www.docker.com/toolbox)) this includes:
	- VirtualBox
	- Docker Client
	- Docker Machine
	- Docker Compose (Required)
	- Docker Kitematic (Not Important)
- Git ([Download](https://git-scm.com/downloads))
- Composer ([Download](https://getcomposer.org/download/))

*Note: Git & Composer can be installed on Docker Containers if you don't want to install them on your machine. (But you have to do this yourself for now).*


<a name="Usage"></a>
## Usage

1 - To start you first need to clone the project

```bash
	git clone https://github.com/LaraDock/laradock laradock
```

2 - Inside `laradock` there are 2 directories (Laravel and Docker) let's start with Laravel

```bash
	cd laradock/laravel
```

3 - Install the Composer packages

```bash
	composer install
```

4 - Provide some permissions

```bash
	sudo chmod -R 777 storage && sudo chmod -R 777 bootstrap
```

5 - Now let's start with the Docker stuff

```bash
	cd ../docker
```

6 - Edit the hosts file on your machine, to map your Docker IP to the `laravel.dev` domain, example: 

```bash
	192.168.5x.10x  laravel.dev   # (make sure to set your Docker IP)
```

7 - Finally run the containers and start coding. 

*"Note: Only the first you run this command will take up to 7 minutes (depend on your connection speed) to download the images to your local machine, Only once in life.*

```bash
	docker-compose up -d
```

8 - Open your browser and visit `http://laravel.dev`

You should see a page like this:
![](http://s29.postimg.org/8cvh7wq2f/Screen_Shot_2015_08_21_at_9_23_19_PM.png)


<a name="Documentation"></a>
## Documentation



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




#### Delete an Image (remove the unused softwar)
To delete an image (software), just edit the `laradock/docker/docker-compose.yml` file.

**Example:** Assume you want to stop the `Beanstalkd` Container.


Open the `docker-compose.yml` file, and comment out the `beanstalkd` section:

```php
# Beanstalkd Container #-----------------------------------
# beanstalkd:
#  image: laradock/beanstalkd:latest
#  container_name: beanstalkd
#  ports:
#    - "11300:11300"
#  privileged: true
```

#### Add an Image (add a software to run with other Containers)
To add an image (software), just edit the `laradock/docker/docker-compose.yml` and add your container details, to do so you need to be familiar with the [docker compose file syntax](https://docs.docker.com/compose/yml/).


#### Edit an existing Image (change some configuration in the image)
To edit an image, and take full control of it:

1. clone the LaraDock `docker-images` repository [https://github.com/LaraDock/docker-images](https://github.com/LaraDock/images)
2. modify whichever `Dockfile` you want
3. from the modified image directory run `docker build -t {your-image-name} .`

*If you find any bug or you have and suggestion that can improve the performance of any image, please consider contributing. Thanks in advance.*







## Contributing

All contributions are welcomed.



## Support

[Issues](https://github.com/laradock/laradock/issues) on Github.





## Credits

[![Mahmoud Zalt](https://img.shields.io/badge/Author-Mahmoud%20Zalt-orange.svg)](http://www.zalt.me)



## License

[MIT License (MIT)](https://github.com/laradock/laradock/blob/master/LICENSE)







