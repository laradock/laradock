---
title: 1. Introduction
type: index
weight: 1
---


## Use Docker First - Then Learn About It Later

Laradock is a PHP development environment that runs on Docker.

Supports a variety of useful Docker Images, pre-configured to provide a wonderful PHP development environment.


![](https://raw.githubusercontent.com/laradock/laradock/master/.github/home-page-images/laradock-logo.jpg)




<a name="sponsors"></a>
## Sponsors

<a href="https://opencollective.com/laradock/sponsor/0/website" target="_blank"><img src="https://opencollective.com/laradock/sponsor/0/avatar.svg"></a>
<a href="https://opencollective.com/laradock/sponsor/1/website" target="_blank"><img src="https://opencollective.com/laradock/sponsor/1/avatar.svg"></a>
<a href="https://opencollective.com/laradock/sponsor/2/website" target="_blank"><img src="https://opencollective.com/laradock/sponsor/2/avatar.svg"></a>
<a href="https://opencollective.com/laradock/sponsor/3/website" target="_blank"><img src="https://opencollective.com/laradock/sponsor/3/avatar.svg"></a>
<a href="https://opencollective.com/laradock/sponsor/4/website" target="_blank"><img src="https://opencollective.com/laradock/sponsor/4/avatar.svg"></a>
<a href="https://opencollective.com/laradock/sponsor/5/website" target="_blank"><img src="https://opencollective.com/laradock/sponsor/5/avatar.svg"></a>
<a href="https://opencollective.com/laradock/sponsor/6/website" target="_blank"><img src="https://opencollective.com/laradock/sponsor/6/avatar.svg"></a>
<a href="https://opencollective.com/laradock/sponsor/7/website" target="_blank"><img src="https://opencollective.com/laradock/sponsor/7/avatar.svg"></a>

For basic sponsorships go to [Open Collective](https://opencollective.com/laradock#sponsor), for golden sponsorships contact <a href = "mailto: support@laradock.io">support@laradock.io</a>.
<br>
*Your logo will show up on the [github repository](https://github.com/laradock/laradock/) index page and the [documentation](http://laradock.io/) main page, with a link to your website.* 

## Quick Overview

Let's see how easy it is to setup our demo stack `PHP`, `NGINX`, `MySQL`, `Redis` and `Composer`:

1 - Clone Laradock inside your PHP project:

```shell
git clone https://github.com/Laradock/laradock.git
```

2 - Enter the laradock folder and rename `env-example` to `.env`.

```shell
cp env-example .env
```

3 - Run your containers:

```shell
docker-compose up -d nginx mysql phpmyadmin redis workspace 
```

4 - Open your project's `.env` file and set the following:

```shell
DB_HOST=mysql
REDIS_HOST=redis
QUEUE_HOST=beanstalkd
```

5 - Open your browser and visit localhost: `http://localhost`.

```shell
That's it! enjoy :)
```




<a name="features"></a>
## Features

- Easy switch between PHP versions: 7.3, 7.2, 7.1, 5.6...
- Choose your favorite database engine: MySQL, Postgres, MariaDB...
- Run your own stack: Memcached, HHVM, RabbitMQ...
- Each software runs on its own container: PHP-FPM, NGINX, PHP-CLI...
- Easy to customize any container, with simple edit to the `Dockerfile`.
- All Images extends from an official base Image. (Trusted base Images).
- Pre-configured NGINX to host any code at your root directory.
- Can use Laradock per project, or single Laradock for all projects.
- Easy to install/remove software's in Containers using environment variables.
- Clean and well structured Dockerfiles (`Dockerfile`).
- Latest version of the Docker Compose file (`docker-compose`).
- Everything is visible and editable.
- Fast Images Builds.



<a name="Supported-Containers"></a>
## Supported Software (Docker Images)

> Laradock, adheres to the 'separation of concerns' principle, thus it runs each software on its own Docker Container.
> You can turn On/Off as many instances as you want without worrying about the configurations.

> To run a chosen container from the list below, run `docker-compose up -d {container-name}`. 
> The container name `{container-name}` is the same as its folder name. Example to run the "PHP FPM" container use the name "php-fpm".

- **Web Servers:**
    - NGINX 
    - Apache2 
    - Caddy 

- **Load Balancers:**
    - HAProxy
    - Traefik

- **PHP Compilers:**
    - PHP FPM 
    - HHVM

- **Database Management Systems:**
    - MySQL
    - PostgreSQL
        - PostGIS
    - MariaDB
    - Percona
    - MSSQL 
    - MongoDB
        - MongoDB Web UI
    - Neo4j
    - CouchDB
    - RethinkDB 
    - Cassandra


- **Database Management Apps:**
    - PhpMyAdmin 
    - Adminer 
    - PgAdmin

- **Cache Engines:**
    - Redis 
        - Redis Web UI
        - Redis Cluster
    - Memcached 
    - Aerospike 
    - Varnish

- **Message Brokers:**
    - RabbitMQ
        - RabbitMQ Admin Console 
    - Beanstalkd
        - Beanstalkd Admin Console 
    - Eclipse Mosquitto
    - PHP Worker
    - Laravel Horizon

- **Mail Servers:**
    - Mailu 
    - Mailhog 
    - MailDev

- **Log Management:**
    - GrayLog 

- **Testing:**
    - Selenium 

- **Monitoring:**
    - Grafana
    - NetData 

- **Search Engines:** 
    - ElasticSearch
    - Apache Solr
    - Manticore Search

- **IDE's**  
    - ICE Coder
    - Theia
    - Web IDE

- **Miscellaneous:**
    - Workspace *(Laradock container that includes a rich set of pre-configured useful tools)*
         - `PHP CLI` 
         - `Composer` 
         - `Git`
         - `Vim` 
         - `xDebug`
         - `Linuxbrew` 
         - `Node`
         - `V8JS` 
         - `Gulp` 
         - `SQLite` 
         - `Laravel Envoy` 
         - `Deployer` 
         - `Yarn` 
         - `SOAP` 
         - `Drush` 
         - `Wordpress CLI`
    - Apache ZooKeeper *(Centralized service for distributed systems to a hierarchical key-value store)*
    - Kibana *(Visualize your Elasticsearch data and navigate the Elastic Stack)*
    - LogStash *(Server-side data processing pipeline that ingests data from a multitude of sources simultaneously)*
    - Jenkins *(automation server, that provides plugins to support building, deploying and automating any project)*
    - Certbot *(Automatically enable HTTPS on your website)*
    - Swoole *(Production-Grade Async programming Framework for PHP)* 
    - SonarQube *(continuous inspection of code quality to perform automatic reviews with static analysis of code to detect bugs and more)* 
    - Gitlab *(A single application for the entire software development lifecycle)*
    - PostGIS *(Database extender for PostgreSQL. It adds support for geographic objects allowing location queries to be run in SQL)*
    - Blackfire *(Empowers all PHP developers and IT/Ops to continuously verify and improve their app's performance)*
    - Laravel Echo *(Bring the power of WebSockets to your Laravel applications)*
    - Phalcon *(A PHP web framework based on the model–view–controller pattern)*
    - Minio *(Cloud storage server released under Apache License v2, compatible with Amazon S3)*
    - AWS EB CLI *(CLI that helps you deploy and manage your AWS Elastic Beanstalk applications and environments)*
    - Thumbor *(Photo thumbnail service)*
    - IPython *(Provides a rich architecture for interactive computing)*
    - Jupyter Hub *(Jupyter notebook for multiple users)*
    - Portainer *(Build and manage your Docker environments with ease)*
    - Docker Registry *(The Docker Registry implementation for storing and distributing Docker images)*
    - Docker Web UI *(A browser-based solution for browsing and modifying a private Docker registry)*

You can choose, which tools to install in your workspace container and other containers, from the `.env` file.


> If you modify `docker-compose.yml`, `.env` or any `dockerfile` file, you must re-build your containers, to see those effects in the running instance.



*If you can't find your Software in the list, build it yourself and submit it. Contributions are welcomed :)*



<a name="what-is-docker"></a>
## What is Docker?

[Docker](https://www.docker.com) is an open platform for developing, shipping, and running applications.
Docker enables you to separate your applications from your infrastructure so you can deliver software quickly.
With Docker, you can manage your infrastructure in the same ways you manage your applications.
By taking advantage of Docker’s methodologies for shipping, testing, and deploying code quickly, you can significantly reduce the delay between writing code and running it in production.





<a name="why-docker-not-vagrant"></a>
## Why Docker not Vagrant!?

[Vagrant](https://www.vagrantup.com) creates Virtual Machines in minutes while Docker creates Virtual Containers in seconds.

Instead of providing a full Virtual Machines, like you get with Vagrant, Docker provides you **lightweight** Virtual Containers, that share the same kernel and allow to safely execute independent processes.

In addition to the speed, Docker gives tons of features that cannot be achieved with Vagrant.

Most importantly Docker can run on Development and on Production (same environment everywhere). While Vagrant is designed for Development only, (so you have to re-provision your server on Production every time).






<a name="Demo"></a>
## Demo Video

What's better than a **Demo Video**:

- Laradock [v4.*](https://www.youtube.com/watch?v=TQii1jDa96Y)
- Laradock [v2.*](https://www.youtube.com/watch?v=-DamFMczwDA)
- Laradock [v0.3](https://www.youtube.com/watch?v=jGkyO6Is_aI)
- Laradock [v0.1](https://www.youtube.com/watch?v=3YQsHe6oF80)







<a name="Chat"></a>
## Chat with us

You are welcome to join our chat room on Gitter.

[![Gitter](https://badges.gitter.im/Laradock/laradock.svg)](https://gitter.im/Laradock/laradock?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge)





<a name="Donations"></a>
## Donations

> Help keeping the project development going, by [contributing](http://laradock.io/contributing) or donating a little. 
> Thanks in advance.

Donate directly via [Paypal](https://paypal.me/mzmmzz)

[![Donate](https://img.shields.io/badge/Donate-PayPal-green.svg)](https://paypal.me/mzmmzz) 

or show your support via [Beerpay](https://beerpay.io/laradock/laradock) 

[![Beerpay](https://beerpay.io/laradock/laradock/badge.svg?style=flat)](https://beerpay.io/laradock/laradock)

or become a backer on [Open Collective](https://opencollective.com/laradock#backer)

<a href="https://opencollective.com/laradock#backers" target="_blank"><img src="https://opencollective.com/laradock/backers.svg?width=890"></a>
