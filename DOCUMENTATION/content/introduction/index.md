---
title: 1. Introduction
type: index
weight: 1
---

<b>Laradock is a full PHP development environment based on Docker.</b>

Supporting a variety of common services, all pre-configured to provide a full PHP development environment.


<a name="features"></a>
## Features

- Easy switch between PHP versions: 7.4, 7.3, 7.2, 7.1, 5.6...
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

<br>

---
### Use Docker First - Then Learn About It Later</q>
---


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
    - Gearman

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

---



<a name="Chat"></a>
## Chat with us

Feel free to join us on Gitter.

[![Gitter](https://badges.gitter.im/Laradock/laradock.svg)](https://gitter.im/Laradock/laradock?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge)

---

Laradock exists thanks to all the people who contribute.

## Project Maintainers

<table>
  <tbody>
    <tr>
        <td align="center" valign="top">
            <img width="125" height="125" src="https://github.com/mahmoudz.png?s=150">
            <br>
            <strong>Mahmoud Zalt</strong>
            <br>
            <a href="https://github.com/Mahmoudz">@mahmoudz</a>
        </td>
        <td align="center" valign="top">
            <img width="125" height="125" src="https://github.com/appleboy.png?s=150">
            <br>
            <strong>Bo-Yi Wu</strong>
            <br>
            <a href="https://github.com/appleboy">@appleboy</a>
        </td>
        <td align="center" valign="top">
            <img width="125" height="125" src="https://github.com/philtrep.png?s=150">
            <br>
            <strong>Philippe Trépanier</strong>
            <br>
            <a href="https://github.com/philtrep">@philtrep</a>
        </td>
        <td align="center" valign="top">
            <img width="125" height="125" src="https://github.com/mikeerickson.png?s=150">
            <br>
            <strong>Mike Erickson</strong>
            <br>
            <a href="https://github.com/mikeerickson">@mikeerickson</a>
        </td>
        <td align="center" valign="top">
            <img width="125" height="125" src="https://github.com/zeroc0d3.png?s=150">
            <br>
            <strong>Dwi Fahni Denni</strong>
            <br>
            <a href="https://github.com/zeroc0d3">@zeroc0d3</a>
        </td>
     </tr>
     <tr>
        <td align="center" valign="top">
            <img width="125" height="125" src="https://github.com/thorerik.png?s=150">
            <br>
            <strong>Thor Erik</strong>
            <br>
            <a href="https://github.com/thorerik">@thorerik</a>
        </td>
        <td align="center" valign="top">
            <img width="125" height="125" src="https://github.com/winfried-van-loon.png?s=150">
            <br>
            <strong>Winfried van Loon</strong>
            <br>
            <a href="https://github.com/winfried-van-loon">@winfried-van-loon</a>
        </td>
        <td align="center" valign="top">
            <img width="125" height="125" src="https://github.com/sixlive.png?s=150">
            <br>
            <strong>TJ Miller</strong>
            <br>
            <a href="https://github.com/sixlive">@sixlive</a>
        </td>
        <td align="center" valign="top">
            <img width="125" height="125" src="https://github.com/bestlong.png?s=150">
            <br>
            <strong>Yu-Lung Shao (Allen)</strong>
            <br>
            <a href="https://github.com/bestlong">@bestlong</a>
        </td>
        <td align="center" valign="top">
            <img width="125" height="125" src="https://github.com/urukalo.png?s=150">
            <br>
            <strong>Milan Urukalo</strong>
            <br>
            <a href="https://github.com/urukalo">@urukalo</a>
        </td>
     </tr>
     <tr>
        <td align="center" valign="top">
            <img width="125" height="125" src="https://github.com/vwchu.png?s=150">
            <br>
            <strong>Vince Chu</strong>
            <br>
            <a href="https://github.com/vwchu">@vwchu</a>
        </td>
        <td align="center" valign="top">
            <img width="125" height="125" src="https://github.com/zuohuadong.png?s=150">
            <br>
            <strong>Huadong Zuo</strong>
            <br>
            <a href="https://github.com/zuohuadong">@zuohuadong</a>
        </td>
        <td align="center" valign="top">
            <img width="125" height="125" src="https://github.com/lanphan.png?s=150">
            <br>
            <strong>Lan Phan</strong>
            <br>
            <a href="https://github.com/lanphan">@lanphan</a>
        </td>
        <td align="center" valign="top">
            <img width="125" height="125" src="https://github.com/ahkui.png?s=150">
            <br>
            <strong>Ahkui</strong>
            <br>
            <a href="https://github.com/ahkui">@ahkui</a>
        </td>
        <td align="center" valign="top">
            <img width="125" height="125" src="https://raw.githubusercontent.com/laradock/laradock/master/.github/home-page-images/join-us.png">
            <br>
            <strong>< Join Us ></strong>
            <br>
            <a href="https://github.com/laradock">@laradock</a>
        </td>
     </tr>
  </tbody>
</table>

## Code Contributors

<a href="https://github.com/undefined/undefined/graphs/contributors"><img src="https://opencollective.com/laradock/contributors.svg?width=890&button=false" /></a>

---

<a name="Donations"></a>
## Financial Contributors

Contribute and help us sustain the project.

<b>Option 1:</b> Donate via [Paypal](https://paypal.me/mzmmzz).
<br>
<b>Option 2:</b> Become a Sponsor via [Github Sponsors](https://github.com/sponsors/Mahmoudz).
<br>
<b>Option 3:</b> Become a Sponsor/Backer via [Open Collective](https://opencollective.com/laradock/contribute).

<a name="sponsors"></a>
## Sponsors

<a href="https://opencollective.com/laradock/sponsor/0/website?requireActive=false" target="_blank"><img src="https://opencollective.com/laradock/sponsor/0/avatar.svg?requireActive=false"></a>
<a href="https://opencollective.com/laradock/sponsor/1/website?requireActive=false" target="_blank"><img src="https://opencollective.com/laradock/sponsor/1/avatar.svg?requireActive=false"></a>
<a href="https://opencollective.com/laradock/sponsor/2/website?requireActive=false" target="_blank"><img src="https://opencollective.com/laradock/sponsor/2/avatar.svg?requireActive=false"></a>
<a href="https://opencollective.com/laradock/sponsor/3/website?requireActive=false" target="_blank"><img src="https://opencollective.com/laradock/sponsor/3/avatar.svg?requireActive=false"></a>
<a href="https://opencollective.com/laradock/sponsor/4/website?requireActive=false" target="_blank"><img src="https://opencollective.com/laradock/sponsor/4/avatar.svg?requireActive=false"></a>
<a href="https://opencollective.com/laradock/sponsor/5/website?requireActive=false" target="_blank"><img src="https://opencollective.com/laradock/sponsor/5/avatar.svg?requireActive=false"></a>
<a href="https://opencollective.com/laradock/sponsor/6/website?requireActive=false" target="_blank"><img src="https://opencollective.com/laradock/sponsor/6/avatar.svg?requireActive=false"></a>
<a href="https://opencollective.com/laradock/sponsor/7/website?requireActive=false" target="_blank"><img src="https://opencollective.com/laradock/sponsor/7/avatar.svg?requireActive=false"></a>
<a href="https://opencollective.com/laradock/sponsor/8/website?requireActive=false" target="_blank"><img src="https://opencollective.com/laradock/sponsor/8/avatar.svg?requireActive=false"></a>
<a href="https://opencollective.com/laradock/sponsor/9/website?requireActive=false" target="_blank"><img src="https://opencollective.com/laradock/sponsor/9/avatar.svg?requireActive=false"></a>
<a href="https://opencollective.com/laradock/sponsor/10/website?requireActive=false" target="_blank"><img src="https://opencollective.com/laradock/sponsor/10/avatar.svg?requireActive=false"></a>
<a href="https://opencollective.com/laradock/sponsor/11/website?requireActive=false" target="_blank"><img src="https://opencollective.com/laradock/sponsor/11/avatar.svg?requireActive=false"></a>
<a href="https://opencollective.com/laradock/sponsor/12/website?requireActive=false" target="_blank"><img src="https://opencollective.com/laradock/sponsor/12/avatar.svg?requireActive=false"></a>
<a href="https://opencollective.com/laradock/sponsor/13/website?requireActive=false" target="_blank"><img src="https://opencollective.com/laradock/sponsor/13/avatar.svg?requireActive=false"></a>
<a href="https://opencollective.com/laradock/sponsor/14/website?requireActive=false" target="_blank"><img src="https://opencollective.com/laradock/sponsor/14/avatar.svg?requireActive=false"></a>
<a href="https://opencollective.com/laradock/sponsor/15/website?requireActive=false" target="_blank"><img src="https://opencollective.com/laradock/sponsor/15/avatar.svg?requireActive=false"></a>
<a href="https://opencollective.com/laradock/sponsor/16/website?requireActive=false" target="_blank"><img src="https://opencollective.com/laradock/sponsor/16/avatar.svg?requireActive=false"></a>
<a href="https://opencollective.com/laradock/sponsor/17/website?requireActive=false" target="_blank"><img src="https://opencollective.com/laradock/sponsor/17/avatar.svg?requireActive=false"></a>
<a href="https://opencollective.com/laradock/sponsor/18/website?requireActive=false" target="_blank"><img src="https://opencollective.com/laradock/sponsor/18/avatar.svg?requireActive=false"></a>
<a href="https://opencollective.com/laradock/sponsor/19/website?requireActive=false" target="_blank"><img src="https://opencollective.com/laradock/sponsor/19/avatar.svg?requireActive=false"></a>
<a href="https://opencollective.com/laradock/sponsor/20/website?requireActive=false" target="_blank"><img src="https://opencollective.com/laradock/sponsor/20/avatar.svg?requireActive=false"></a>
<a href="https://opencollective.com/laradock/sponsor/21/website?requireActive=false" target="_blank"><img src="https://opencollective.com/laradock/sponsor/21/avatar.svg?requireActive=false"></a>
<a href="https://opencollective.com/laradock/sponsor/22/website?requireActive=false" target="_blank"><img src="https://opencollective.com/laradock/sponsor/22/avatar.svg?requireActive=false"></a>
<a href="https://opencollective.com/laradock/sponsor/23/website?requireActive=false" target="_blank"><img src="https://opencollective.com/laradock/sponsor/23/avatar.svg?requireActive=false"></a>
<a href="https://opencollective.com/laradock/sponsor/24/website?requireActive=false" target="_blank"><img src="https://opencollective.com/laradock/sponsor/24/avatar.svg?requireActive=false"></a>
<a href="https://opencollective.com/laradock/sponsor/25/website?requireActive=false" target="_blank"><img src="https://opencollective.com/laradock/sponsor/25/avatar.svg?requireActive=false"></a>
<a href="https://opencollective.com/laradock/sponsor/26/website?requireActive=false" target="_blank"><img src="https://opencollective.com/laradock/sponsor/26/avatar.svg?requireActive=false"></a>
<a href="https://opencollective.com/laradock/sponsor/27/website?requireActive=false" target="_blank"><img src="https://opencollective.com/laradock/sponsor/27/avatar.svg?requireActive=false"></a>
<a href="https://opencollective.com/laradock/sponsor/28/website?requireActive=false" target="_blank"><img src="https://opencollective.com/laradock/sponsor/28/avatar.svg?requireActive=false"></a>
<a href="https://opencollective.com/laradock/sponsor/29/website?requireActive=false" target="_blank"><img src="https://opencollective.com/laradock/sponsor/29/avatar.svg?requireActive=false"></a>
<a href="https://opencollective.com/laradock/sponsor/30/website?requireActive=false" target="_blank"><img src="https://opencollective.com/laradock/sponsor/30/avatar.svg?requireActive=false"></a>
<a href="https://opencollective.com/laradock/sponsor/31/website?requireActive=false" target="_blank"><img src="https://opencollective.com/laradock/sponsor/31/avatar.svg?requireActive=false"></a>
<a href="https://opencollective.com/laradock/sponsor/32/website?requireActive=false" target="_blank"><img src="https://opencollective.com/laradock/sponsor/32/avatar.svg?requireActive=false"></a>
<a href="https://opencollective.com/laradock/sponsor/33/website?requireActive=false" target="_blank"><img src="https://opencollective.com/laradock/sponsor/33/avatar.svg?requireActive=false"></a>
<a href="https://opencollective.com/laradock/sponsor/34/website?requireActive=false" target="_blank"><img src="https://opencollective.com/laradock/sponsor/34/avatar.svg?requireActive=false"></a>
<a href="https://opencollective.com/laradock/sponsor/35/website?requireActive=false" target="_blank"><img src="https://opencollective.com/laradock/sponsor/35/avatar.svg?requireActive=false"></a>
<a href="https://opencollective.com/laradock/sponsor/36/website?requireActive=false" target="_blank"><img src="https://opencollective.com/laradock/sponsor/36/avatar.svg?requireActive=false"></a>
<a href="https://opencollective.com/laradock/sponsor/37/website?requireActive=false" target="_blank"><img src="https://opencollective.com/laradock/sponsor/37/avatar.svg?requireActive=false"></a>
<a href="https://opencollective.com/laradock/sponsor/38/website?requireActive=false" target="_blank"><img src="https://opencollective.com/laradock/sponsor/38/avatar.svg?requireActive=false"></a>
<a href="https://opencollective.com/laradock/sponsor/39/website?requireActive=false" target="_blank"><img src="https://opencollective.com/laradock/sponsor/39/avatar.svg?requireActive=false"></a>
<a href="https://opencollective.com/laradock/sponsor/40/website?requireActive=false" target="_blank"><img src="https://opencollective.com/laradock/sponsor/40/avatar.svg?requireActive=false"></a>
<a href="https://opencollective.com/laradock/sponsor/41/website?requireActive=false" target="_blank"><img src="https://opencollective.com/laradock/sponsor/41/avatar.svg?requireActive=false"></a>
<a href="https://opencollective.com/laradock/sponsor/42/website?requireActive=false" target="_blank"><img src="https://opencollective.com/laradock/sponsor/42/avatar.svg?requireActive=false"></a>
<a href="https://opencollective.com/laradock/sponsor/43/website?requireActive=false" target="_blank"><img src="https://opencollective.com/laradock/sponsor/43/avatar.svg?requireActive=false"></a>
<a href="https://opencollective.com/laradock/sponsor/44/website?requireActive=false" target="_blank"><img src="https://opencollective.com/laradock/sponsor/44/avatar.svg?requireActive=false"></a>
<a href="https://opencollective.com/laradock/sponsor/45/website?requireActive=false" target="_blank"><img src="https://opencollective.com/laradock/sponsor/45/avatar.svg?requireActive=false"></a>
<a href="https://opencollective.com/laradock/sponsor/46/website?requireActive=false" target="_blank"><img src="https://opencollective.com/laradock/sponsor/46/avatar.svg?requireActive=false"></a>
<a href="https://opencollective.com/laradock/sponsor/47/website?requireActive=false" target="_blank"><img src="https://opencollective.com/laradock/sponsor/47/avatar.svg?requireActive=false"></a>
<a href="https://opencollective.com/laradock/sponsor/48/website?requireActive=false" target="_blank"><img src="https://opencollective.com/laradock/sponsor/48/avatar.svg?requireActive=false"></a>
<a href="https://opencollective.com/laradock/sponsor/49/website?requireActive=false" target="_blank"><img src="https://opencollective.com/laradock/sponsor/49/avatar.svg?requireActive=false"></a>

Support Laradock with your [organization](https://opencollective.com/laradock/contribute/).
<br>
Your logo will show up on the [github repository](https://github.com/laradock/laradock/) index page and the [documentation](http://laradock.io/) main page.
<br>
For more info contact <a href = "mailto: support@laradock.io">support@laradock.io</a>.

<a name="Backers"></a>
## Backers

<a href="https://opencollective.com/laradock/backer/0/website?requireActive=false" target="_blank"><img src="https://opencollective.com/laradock/backer/0/avatar.svg?requireActive=false"></a>
<a href="https://opencollective.com/laradock/backer/1/website?requireActive=false" target="_blank"><img src="https://opencollective.com/laradock/backer/1/avatar.svg?requireActive=false"></a>
<a href="https://opencollective.com/laradock/backer/2/website?requireActive=false" target="_blank"><img src="https://opencollective.com/laradock/backer/2/avatar.svg?requireActive=false"></a>
<a href="https://opencollective.com/laradock/backer/3/website?requireActive=false" target="_blank"><img src="https://opencollective.com/laradock/backer/3/avatar.svg?requireActive=false"></a>
<a href="https://opencollective.com/laradock/backer/4/website?requireActive=false" target="_blank"><img src="https://opencollective.com/laradock/backer/4/avatar.svg?requireActive=false"></a>
<a href="https://opencollective.com/laradock/backer/5/website?requireActive=false" target="_blank"><img src="https://opencollective.com/laradock/backer/5/avatar.svg?requireActive=false"></a>
<a href="https://opencollective.com/laradock/backer/6/website?requireActive=false" target="_blank"><img src="https://opencollective.com/laradock/backer/6/avatar.svg?requireActive=false"></a>
<a href="https://opencollective.com/laradock/backer/7/website?requireActive=false" target="_blank"><img src="https://opencollective.com/laradock/backer/7/avatar.svg?requireActive=false"></a>
<a href="https://opencollective.com/laradock/backer/8/website?requireActive=false" target="_blank"><img src="https://opencollective.com/laradock/backer/8/avatar.svg?requireActive=false"></a>
<a href="https://opencollective.com/laradock/backer/9/website?requireActive=false" target="_blank"><img src="https://opencollective.com/laradock/backer/9/avatar.svg?requireActive=false"></a>
<a href="https://opencollective.com/laradock/backer/10/website?requireActive=false" target="_blank"><img src="https://opencollective.com/laradock/backer/10/avatar.svg?requireActive=false"></a>
<a href="https://opencollective.com/laradock/backer/11/website?requireActive=false" target="_blank"><img src="https://opencollective.com/laradock/backer/11/avatar.svg?requireActive=false"></a>
<a href="https://opencollective.com/laradock/backer/12/website?requireActive=false" target="_blank"><img src="https://opencollective.com/laradock/backer/12/avatar.svg?requireActive=false"></a>
<a href="https://opencollective.com/laradock/backer/13/website?requireActive=false" target="_blank"><img src="https://opencollective.com/laradock/backer/13/avatar.svg?requireActive=false"></a>
<a href="https://opencollective.com/laradock/backer/14/website?requireActive=false" target="_blank"><img src="https://opencollective.com/laradock/backer/14/avatar.svg?requireActive=false"></a>
<a href="https://opencollective.com/laradock/backer/15/website?requireActive=false" target="_blank"><img src="https://opencollective.com/laradock/backer/15/avatar.svg?requireActive=false"></a>
<a href="https://opencollective.com/laradock/backer/16/website?requireActive=false" target="_blank"><img src="https://opencollective.com/laradock/backer/16/avatar.svg?requireActive=false"></a>
<a href="https://opencollective.com/laradock/backer/17/website?requireActive=false" target="_blank"><img src="https://opencollective.com/laradock/backer/17/avatar.svg?requireActive=false"></a>
<a href="https://opencollective.com/laradock/backer/18/website?requireActive=false" target="_blank"><img src="https://opencollective.com/laradock/backer/18/avatar.svg?requireActive=false"></a>
<a href="https://opencollective.com/laradock/backer/19/website?requireActive=false" target="_blank"><img src="https://opencollective.com/laradock/backer/19/avatar.svg?requireActive=false"></a>
<a href="https://opencollective.com/laradock/backer/20/website?requireActive=false" target="_blank"><img src="https://opencollective.com/laradock/backer/20/avatar.svg?requireActive=false"></a>
<a href="https://opencollective.com/laradock/backer/21/website?requireActive=false" target="_blank"><img src="https://opencollective.com/laradock/backer/21/avatar.svg?requireActive=false"></a>
<a href="https://opencollective.com/laradock/backer/22/website?requireActive=false" target="_blank"><img src="https://opencollective.com/laradock/backer/22/avatar.svg?requireActive=false"></a>
<a href="https://opencollective.com/laradock/backer/23/website?requireActive=false" target="_blank"><img src="https://opencollective.com/laradock/backer/23/avatar.svg?requireActive=false"></a>
<a href="https://opencollective.com/laradock/backer/24/website?requireActive=false" target="_blank"><img src="https://opencollective.com/laradock/backer/24/avatar.svg?requireActive=false"></a>
<a href="https://opencollective.com/laradock/backer/25/website?requireActive=false" target="_blank"><img src="https://opencollective.com/laradock/backer/25/avatar.svg?requireActive=false"></a>
<a href="https://opencollective.com/laradock/backer/26/website?requireActive=false" target="_blank"><img src="https://opencollective.com/laradock/backer/26/avatar.svg?requireActive=false"></a>
<a href="https://opencollective.com/laradock/backer/27/website?requireActive=false" target="_blank"><img src="https://opencollective.com/laradock/backer/27/avatar.svg?requireActive=false"></a>
<a href="https://opencollective.com/laradock/backer/28/website?requireActive=false" target="_blank"><img src="https://opencollective.com/laradock/backer/28/avatar.svg?requireActive=false"></a>
<a href="https://opencollective.com/laradock/backer/29/website?requireActive=false" target="_blank"><img src="https://opencollective.com/laradock/backer/29/avatar.svg?requireActive=false"></a>
<a href="https://opencollective.com/laradock/backer/30/website?requireActive=false" target="_blank"><img src="https://opencollective.com/laradock/backer/30/avatar.svg?requireActive=false"></a>
<a href="https://opencollective.com/laradock/backer/31/website?requireActive=false" target="_blank"><img src="https://opencollective.com/laradock/backer/31/avatar.svg?requireActive=false"></a>
<a href="https://opencollective.com/laradock/backer/32/website?requireActive=false" target="_blank"><img src="https://opencollective.com/laradock/backer/32/avatar.svg?requireActive=false"></a>
<a href="https://opencollective.com/laradock/backer/33/website?requireActive=false" target="_blank"><img src="https://opencollective.com/laradock/backer/33/avatar.svg?requireActive=false"></a>
<a href="https://opencollective.com/laradock/backer/34/website?requireActive=false" target="_blank"><img src="https://opencollective.com/laradock/backer/34/avatar.svg?requireActive=false"></a>
<a href="https://opencollective.com/laradock/backer/35/website?requireActive=false" target="_blank"><img src="https://opencollective.com/laradock/backer/35/avatar.svg?requireActive=false"></a>
<a href="https://opencollective.com/laradock/backer/36/website?requireActive=false" target="_blank"><img src="https://opencollective.com/laradock/backer/36/avatar.svg?requireActive=false"></a>
<a href="https://opencollective.com/laradock/backer/37/website?requireActive=false" target="_blank"><img src="https://opencollective.com/laradock/backer/37/avatar.svg?requireActive=false"></a>
<a href="https://opencollective.com/laradock/backer/38/website?requireActive=false" target="_blank"><img src="https://opencollective.com/laradock/backer/38/avatar.svg?requireActive=false"></a>
<a href="https://opencollective.com/laradock/backer/39/website?requireActive=false" target="_blank"><img src="https://opencollective.com/laradock/backer/39/avatar.svg?requireActive=false"></a>
<a href="https://opencollective.com/laradock/backer/40/website?requireActive=false" target="_blank"><img src="https://opencollective.com/laradock/backer/40/avatar.svg?requireActive=false"></a>
<a href="https://opencollective.com/laradock/backer/41/website?requireActive=false" target="_blank"><img src="https://opencollective.com/laradock/backer/41/avatar.svg?requireActive=false"></a>
<a href="https://opencollective.com/laradock/backer/42/website?requireActive=false" target="_blank"><img src="https://opencollective.com/laradock/backer/42/avatar.svg?requireActive=false"></a>
<a href="https://opencollective.com/laradock/backer/43/website?requireActive=false" target="_blank"><img src="https://opencollective.com/laradock/backer/43/avatar.svg?requireActive=false"></a>
<a href="https://opencollective.com/laradock/backer/44/website?requireActive=false" target="_blank"><img src="https://opencollective.com/laradock/backer/44/avatar.svg?requireActive=false"></a>
<a href="https://opencollective.com/laradock/backer/45/website?requireActive=false" target="_blank"><img src="https://opencollective.com/laradock/backer/45/avatar.svg?requireActive=false"></a>
<a href="https://opencollective.com/laradock/backer/46/website?requireActive=false" target="_blank"><img src="https://opencollective.com/laradock/backer/46/avatar.svg?requireActive=false"></a>
<a href="https://opencollective.com/laradock/backer/47/website?requireActive=false" target="_blank"><img src="https://opencollective.com/laradock/backer/47/avatar.svg?requireActive=false"></a>
<a href="https://opencollective.com/laradock/backer/48/website?requireActive=false" target="_blank"><img src="https://opencollective.com/laradock/backer/48/avatar.svg?requireActive=false"></a>
<a href="https://opencollective.com/laradock/backer/49/website?requireActive=false" target="_blank"><img src="https://opencollective.com/laradock/backer/49/avatar.svg?requireActive=false"></a>



<br>

