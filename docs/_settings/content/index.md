---
title: Welcome to Laradock
type: index
weight: 0
---

LaraDock strives to make the PHP development experience easier and faster.

It contains pre-packaged Docker Images that provides you a wonderful *development* environment without requiring you to install PHP, NGINX, MySQL, Redis, and any other software on your machines.

LaraDock is configured to run Laravel Apps by default, and it can be modified to run all kinds of PHP Apps (Symfony, CodeIgniter, WordPress, Drupal...).




## Quick Overview:

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







<a name="what-is-docker"></a>
## What is Docker?

[Docker](https://www.docker.com) is an open-source project that automates the deployment of applications inside software containers, by providing an additional layer of abstraction and automation of [operating-system-level virtualization](https://en.wikipedia.org/wiki/Operating-system-level_virtualization) on Linux, Mac OS and Windows.






<a name="why-docker-not-vagrant"></a>
## Why Docker not Vagrant!?

[Vagrant](https://www.vagrantup.com) creates Virtual Machines in minutes while Docker creates Virtual Containers in seconds.

Instead of providing a full Virtual Machines, like you get with Vagrant, Docker provides you **lightweight** Virtual Containers, that share the same kernel and allow to safely execute independent processes.

In addition to the speed, Docker gives tons of features that cannot be achieved with Vagrant.

Most importantly Docker can run on Development and on Production (same environment everywhere). While Vagrant is designed for Development only, (so you have to re-provision your server on Production every time).






<a name="laradock-vs-homestead"></a>
## LaraDock VS Homestead (For Laravel Developers)

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


### Laradock v4 Video

{{< youtube TQii1jDa96Y >}}





<a name="features"></a>
## Features

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
## Supported Software (Containers)

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








<a name="Chat"></a>
## Chat with us

You are welcome to join our chat room on Gitter.

[![Gitter](https://badges.gitter.im/LaraDock/laradock.svg)](https://gitter.im/LaraDock/laradock?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge)
