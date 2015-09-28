# LaraDock


[![forthebadge](http://forthebadge.com/images/badges/built-with-love.svg)](http://www.zalt.me)

### What is this?

**LaraDock** is a starter project to get you up and running with **Laravel** 5 and **Docker**. 

It includes a Laravel `v5.1.10` fresh installation and a pre-configured **Docker Compose** file (containg most required **images** to run a Laravel application).

**Watch the demonstration video [https://www.youtube.com/watch?v=3YQsHe6oF80](https://www.youtube.com/watch?v=3YQsHe6oF80).**

![](http://s11.postimg.org/uqpl3efab/laradock.jpg)


### What is Docker?

[Docker](https://www.docker.com)  is an open-source project that automates the deployment of applications inside software containers, by providing an additional layer of abstraction and automation of [operating-system-level virtualization](https://en.wikipedia.org/wiki/Operating-system-level_virtualization) on Linux, Mac OS and Windows.

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


<a name="Highlights"></a>
## Highlights

__Included Images:__

- [NGINX+PHP](https://hub.docker.com/r/laradock/phpnginx/)
- [MySQL](https://hub.docker.com/r/laradock/mysql/)
- [Redis](https://hub.docker.com/r/laradock/redis/)
- [Beanstalked](https://hub.docker.com/r/laradock/beanstalkd/)
- [Data Volume](https://hub.docker.com/r/laradock/data/) (for MySQL & Redis)

*Note: PHP and NGINX are in one container, I will split them whenever I see the need for it.*
	


## Contents

- [Requirements](#Requirements)
- [Tutorial](#Tutorial)
- [Usage](#Usage)
- [Documentation](#Documentation)



<a name="Requirements"></a>
## Requirements
- Docker toolbox ([Download](https://www.docker.com/toolbox)) this includes:
	- VirtualBox
	- Docker Client
	- Docker Machine
	- Docker Compose (Required, minimum version 1.4.0)
	- Docker Kitematic (Not Important)
- Git ([Download](https://git-scm.com/downloads))
- Composer ([Download](https://getcomposer.org/download/))

*Note: Git & Composer can be installed on Docker Containers if you don't want to install them on your machine. (But you have to do this yourself for now).*

<a name="Tutorial"></a>
## Tutorial

What's better than a quick [video](https://www.youtube.com/watch?v=3YQsHe6oF80) ;)

<a name="Usage"></a>
## Usage

1 - First clone the project

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

4 - On laravel's root directory `laradock/laravel`, rename the file `.env.docker` to `.env`

```bash
	sudo mv .env.docker .env
```

5 - Provide some permissions (directories should be writable by the web server)

```bash
	sudo chmod -R 777 storage && sudo chmod -R 777 bootstrap/cache
```

6 - Now let's start with the Docker stuff

```bash
	cd ../docker
```

7 - Edit the hosts file `/etc/hosts` on your machine, to map your `Docker IP` to the `laravel.dev` domain

```bash
	sudo nano /etc/hosts
```

`127.0.0.x          laravel.dev`


> To find the IP address:
> 
> - if you are on Linux, the containers run directly on your localhost so this `127.0.0.1` will be your IP Address.
> - if you are on MAC and using **boot2docker**, type `boot2docker ip` when boot2docker is up.
> - if you are on MAC and using **docker-machine**, type `docker-machine ip {VM-Name}` after starting a virtual machine.
> - if you are on Windows, check the Docker documentation for how you get the VM IP Address.

8 - Additional step for `Docker-Machine` users only. *(Skip this if you are not using `Docker-Machine`)*:

a. Edit this file `docker/docker-compose.yml`

b. Uncomment: 

```yaml
  # extra_hosts:
  #   - "laravel.dev:xxx.xxx.xxx.xxx"
```
c. Replace `xxx.xxx.xxx.xxx` with your the VM IP address.


9 - Finally run the containers and start coding. 

*"Note: Only the first you run this command will take up to 7 minutes (depend on your connection speed) to download the images to your local machine, Only once in life.*

```bash
	docker-compose up -d
```

10 - Open your browser and visit `http://laravel.dev`

You should see a page like this:
![](http://s29.postimg.org/8cvh7wq2f/Screen_Shot_2015_08_21_at_9_23_19_PM.png)








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




#### Delete an Image (remove the unused software)
To delete an image (software), just edit the `laradock/docker/docker-compose.yml` file.

**Example:** Assume you want to remove the `Beanstalkd` Container.


Open the `docker-compose.yml` file, and comment out the `beanstalkd` section:

```yml
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
The Log files are stored in the `laradock/docker/logs` directory.




## Contributing

All contributions are welcomed.



## Support

[Issues](https://github.com/laradock/laradock/issues) on Github.





## Credits

[![Mahmoud Zalt](https://img.shields.io/badge/Author-Mahmoud%20Zalt-orange.svg)](http://www.zalt.me)



## License

[MIT License (MIT)](https://github.com/laradock/laradock/blob/master/LICENSE)







