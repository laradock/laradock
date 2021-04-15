---
title: Introduction
type: index
weight: 1
---

<b>Laradock</b> is a full PHP development environment for Docker.

It supports a variety of common services, all pre-configured to provide a ready PHP development environment.

<br>

---
### Use Docker First - Learn About It Later!</q>
---

<a name="features"></a>
## Features

- Easy switch between PHP versions: 7.4, 7.3, 7.2, 7.1, 5.6...
- Choose your favorite database engine: MySQL, Postgres, MariaDB...
- Run your own stack: Memcached, HHVM, RabbitMQ...
- Each software runs on its own container: PHP-FPM, NGINX, PHP-CLI...
- Easy to customize any container, with simple edits to the `Dockerfile`.
- All Images extend from an official base Image. (Trusted base Images).
- Pre-configured NGINX to host any code at your root directory.
- Can use Laradock per project, or single Laradock for all projects.
- Easy to install/remove software's in Containers using environment variables.
- Clean and well-structured Dockerfiles (`Dockerfile`).
- The Latest version of the Docker Compose file (`docker-compose`).
- Everything is visible and editable.
- Fast Images Builds.






## Quick Overview

Let's see how easy it is to setup our demo stack `PHP`, `NGINX`, `MySQL`, `Redis` and `Composer`:

1 - Clone Laradock inside your PHP project:

```shell
git clone https://github.com/Laradock/laradock.git
```

2 - Enter the laradock folder and rename `.env.example` to `.env`.

```shell
cp .env.example .env
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
## Supported Services

> Laradock, adheres to the 'separation of concerns' principle, thus it runs each software on its own Docker Container.
> You can turn On/Off as many instances as you want without worrying about the configurations.

> To run a chosen container from the list below, run `docker-compose up -d {container-name}`. 
> The container name `{container-name}` is the same as its folder name. Example to run the "PHP FPM" container, use the name "php-fpm".

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
    - Amazon Simple Queue Service

- **Mail Servers:**
    - Mailu 
    - MailCatcher
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
    - Dejavu *(Edit your Elasticsearch data)*
    - LogStash *(Server-side data processing pipeline that ingests data from a multitude of sources simultaneously)*
    - Jenkins *(automation server, that provides plugins to support building, deploying and automating any project)*
    - Certbot *(Automatically enable HTTPS on your website)*
    - Swoole *(Production-Grade Async programming Framework for PHP)* 
    - SonarQube *(continuous inspection of code quality to perform automatic reviews with static analysis of code to detect bugs and more)* 
    - Gitlab *(A single application for the entire software development lifecycle)*
    - PostGIS *(Database extender for PostgreSQL. It adds support for geographic objects allowing location queries to be run in SQL)*
    - Blackfire *(Empowers all PHP developers and IT/Ops to continuously verify and improve their app's performance)*
    - Laravel Echo *(Bring the power of WebSockets to your Laravel applications)*
    - Mercure *(Server-sent events)*
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










## Join Us

[![Gitter](https://badges.gitter.im/Laradock/laradock.svg)](https://gitter.im/Laradock/laradock?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge)

[![Gitpod](https://img.shields.io/badge/Gitpod-ready--to--code-blue)](https://gitpod.io/#https://github.com/laradock/laradock)

---


## Awesome People

Laradock is an MIT-licensed open source project with its ongoing development made possible entirely by the support of all these smart and generous people, from code contributors to financial contributors. 💜


### Project Maintainers

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

### Code Contributors

[![Laradock Contributors][contributors-src]][contributors-href]

### Financial Contributors

[![Open Collective backers][backers-src]][backers-href]

You can support us using any of the methods below:

<b>1:</b> [Open Collective](https://opencollective.com/laradock)
<br>
<b>2:</b> [Paypal](https://paypal.me/mzmmzz)
<br>
<b>3:</b> [Github Sponsors](https://github.com/sponsors/Mahmoudz)
<br>
<b>4:</b> [Patreon](https://www.patreon.com/zalt)

---


## Sponsors

Sponsoring is an act of giving in a different fashion. 🌱


### Gold Sponsors

<p align="center">

<a href="https://casinopilotti.com/"        target="_blank"   style="margin-right: 4em"><img src="https://raw.githubusercontent.com/laradock/laradock/master/.github/home-page-images/custom-sponsors/casinopilotti.png"        height="75px"    alt="CasinoPilotti" ></a>
<a href="https://www.bestonlinecasino.com/" target="_blank"   style="margin-right: 4em"><img src="https://raw.githubusercontent.com/laradock/laradock/master/.github/home-page-images/custom-sponsors/bestonlinecasino.jpg"     height="75px"    alt="We thank bestonlinecasino.com for their support"></a>
<a href="http://apiato.io/"                 target="_blank"   style="margin-right: 4em"><img src="https://raw.githubusercontent.com/laradock/laradock/master/.github/home-page-images/custom-sponsors/apiato.png"               height="75px"    alt="Apiato Build PHP API's faster"></a>


<a href="https://opencollective.com/laradock/tiers/gold-sponsors/0/website" target="_blank"><img src="https://opencollective.com/laradock/tiers/gold-sponsors/0/avatar.svg?button=false&isActive=true" height="75px"></a>
<a href="https://opencollective.com/laradock/tiers/gold-sponsors/1/website" target="_blank"><img src="https://opencollective.com/laradock/tiers/gold-sponsors/1/avatar.svg?button=false&isActive=true" height="75px"></a>
<a href="https://opencollective.com/laradock/tiers/gold-sponsors/2/website" target="_blank"><img src="https://opencollective.com/laradock/tiers/gold-sponsors/2/avatar.svg?button=false&isActive=true" height="75px"></a>
<a href="https://opencollective.com/laradock/tiers/gold-sponsors/3/website" target="_blank"><img src="https://opencollective.com/laradock/tiers/gold-sponsors/3/avatar.svg?button=false&isActive=true" height="75px"></a>
<a href="https://opencollective.com/laradock/tiers/gold-sponsors/4/website" target="_blank"><img src="https://opencollective.com/laradock/tiers/gold-sponsors/4/avatar.svg?button=false&isActive=true" height="75px"></a>
<a href="https://opencollective.com/laradock/tiers/gold-sponsors/5/website" target="_blank"><img src="https://opencollective.com/laradock/tiers/gold-sponsors/5/avatar.svg?button=false&isActive=true" height="75px"></a>
<a href="https://opencollective.com/laradock/tiers/gold-sponsors/6/website" target="_blank"><img src="https://opencollective.com/laradock/tiers/gold-sponsors/6/avatar.svg?button=false&isActive=true" height="75px"></a>
<a href="https://opencollective.com/laradock/tiers/gold-sponsors/7/website" target="_blank"><img src="https://opencollective.com/laradock/tiers/gold-sponsors/7/avatar.svg?button=false&isActive=true" height="75px"></a>
<a href="https://opencollective.com/laradock/tiers/gold-sponsors/8/website" target="_blank"><img src="https://opencollective.com/laradock/tiers/gold-sponsors/8/avatar.svg?button=false&isActive=true" height="75px"></a>
<a href="https://opencollective.com/laradock/tiers/gold-sponsors/9/website" target="_blank"><img src="https://opencollective.com/laradock/tiers/gold-sponsors/9/avatar.svg?button=false&isActive=true" height="75px"></a>

<a href="https://opencollective.com/laradock/tiers/gold-sponsors/10/website" target="_blank"><img src="https://opencollective.com/laradock/tiers/gold-sponsors/10/avatar.svg?button=false&isActive=true" height="75px"></a>
<a href="https://opencollective.com/laradock/tiers/gold-sponsors/11/website" target="_blank"><img src="https://opencollective.com/laradock/tiers/gold-sponsors/11/avatar.svg?button=false&isActive=true" height="75px"></a>
<a href="https://opencollective.com/laradock/tiers/gold-sponsors/12/website" target="_blank"><img src="https://opencollective.com/laradock/tiers/gold-sponsors/12/avatar.svg?button=false&isActive=true" height="75px"></a>
<a href="https://opencollective.com/laradock/tiers/gold-sponsors/13/website" target="_blank"><img src="https://opencollective.com/laradock/tiers/gold-sponsors/13/avatar.svg?button=false&isActive=true" height="75px"></a>
<a href="https://opencollective.com/laradock/tiers/gold-sponsors/14/website" target="_blank"><img src="https://opencollective.com/laradock/tiers/gold-sponsors/14/avatar.svg?button=false&isActive=true" height="75px"></a>
<a href="https://opencollective.com/laradock/tiers/gold-sponsors/15/website" target="_blank"><img src="https://opencollective.com/laradock/tiers/gold-sponsors/15/avatar.svg?button=false&isActive=true" height="75px"></a>

</p>

### Silver Sponsors

<p align="center">

<a href="https://opencollective.com/laradock/tiers/silver-sponsors/0/website" target="_blank"><img src="https://opencollective.com/laradock/tiers/silver-sponsors/0/avatar.svg?button=false&isActive=true" height="65px"></a>
<a href="https://opencollective.com/laradock/tiers/silver-sponsors/1/website" target="_blank"><img src="https://opencollective.com/laradock/tiers/silver-sponsors/1/avatar.svg?button=false&isActive=true" height="65px"></a>
<a href="https://opencollective.com/laradock/tiers/silver-sponsors/2/website" target="_blank"><img src="https://opencollective.com/laradock/tiers/silver-sponsors/2/avatar.svg?button=false&isActive=true" height="65px"></a>
<a href="https://opencollective.com/laradock/tiers/silver-sponsors/3/website" target="_blank"><img src="https://opencollective.com/laradock/tiers/silver-sponsors/3/avatar.svg?button=false&isActive=true" height="65px"></a>
<a href="https://opencollective.com/laradock/tiers/silver-sponsors/4/website" target="_blank"><img src="https://opencollective.com/laradock/tiers/silver-sponsors/4/avatar.svg?button=false&isActive=true" height="65px"></a>
<a href="https://opencollective.com/laradock/tiers/silver-sponsors/5/website" target="_blank"><img src="https://opencollective.com/laradock/tiers/silver-sponsors/5/avatar.svg?button=false&isActive=true" height="65px"></a>
<a href="https://opencollective.com/laradock/tiers/silver-sponsors/6/website" target="_blank"><img src="https://opencollective.com/laradock/tiers/silver-sponsors/6/avatar.svg?button=false&isActive=true" height="65px"></a>
<a href="https://opencollective.com/laradock/tiers/silver-sponsors/7/website" target="_blank"><img src="https://opencollective.com/laradock/tiers/silver-sponsors/7/avatar.svg?button=false&isActive=true" height="65px"></a>
<a href="https://opencollective.com/laradock/tiers/silver-sponsors/8/website" target="_blank"><img src="https://opencollective.com/laradock/tiers/silver-sponsors/8/avatar.svg?button=false&isActive=true" height="65px"></a>
<a href="https://opencollective.com/laradock/tiers/silver-sponsors/9/website" target="_blank"><img src="https://opencollective.com/laradock/tiers/silver-sponsors/9/avatar.svg?button=false&isActive=true" height="65px"></a>

<a href="https://opencollective.com/laradock/tiers/silver-sponsors/10/website" target="_blank"><img src="https://opencollective.com/laradock/tiers/silver-sponsors/10/avatar.svg?button=false&isActive=true" height="65px"></a>
<a href="https://opencollective.com/laradock/tiers/silver-sponsors/11/website" target="_blank"><img src="https://opencollective.com/laradock/tiers/silver-sponsors/11/avatar.svg?button=false&isActive=true" height="65px"></a>
<a href="https://opencollective.com/laradock/tiers/silver-sponsors/12/website" target="_blank"><img src="https://opencollective.com/laradock/tiers/silver-sponsors/12/avatar.svg?button=false&isActive=true" height="65px"></a>
<a href="https://opencollective.com/laradock/tiers/silver-sponsors/13/website" target="_blank"><img src="https://opencollective.com/laradock/tiers/silver-sponsors/13/avatar.svg?button=false&isActive=true" height="65px"></a>
<a href="https://opencollective.com/laradock/tiers/silver-sponsors/14/website" target="_blank"><img src="https://opencollective.com/laradock/tiers/silver-sponsors/14/avatar.svg?button=false&isActive=true" height="65px"></a>
<a href="https://opencollective.com/laradock/tiers/silver-sponsors/15/website" target="_blank"><img src="https://opencollective.com/laradock/tiers/silver-sponsors/15/avatar.svg?button=false&isActive=true" height="65px"></a>
<a href="https://opencollective.com/laradock/tiers/silver-sponsors/16/website" target="_blank"><img src="https://opencollective.com/laradock/tiers/silver-sponsors/16/avatar.svg?button=false&isActive=true" height="65px"></a>
<a href="https://opencollective.com/laradock/tiers/silver-sponsors/17/website" target="_blank"><img src="https://opencollective.com/laradock/tiers/silver-sponsors/17/avatar.svg?button=false&isActive=true" height="65px"></a>
<a href="https://opencollective.com/laradock/tiers/silver-sponsors/18/website" target="_blank"><img src="https://opencollective.com/laradock/tiers/silver-sponsors/18/avatar.svg?button=false&isActive=true" height="65px"></a>
<a href="https://opencollective.com/laradock/tiers/silver-sponsors/19/website" target="_blank"><img src="https://opencollective.com/laradock/tiers/silver-sponsors/19/avatar.svg?button=false&isActive=true" height="65px"></a>

</p>

### Bronze Sponsors

<p align="center">

<a href="https://opencollective.com/laradock/tiers/bronze-sponsors/0/website" target="_blank"><img src="https://opencollective.com/laradock/tiers/bronze-sponsors/0/avatar.svg?button=false&isActive=true" height="55px"></a>
<a href="https://opencollective.com/laradock/tiers/bronze-sponsors/1/website" target="_blank"><img src="https://opencollective.com/laradock/tiers/bronze-sponsors/1/avatar.svg?button=false&isActive=true" height="55px"></a>
<a href="https://opencollective.com/laradock/tiers/bronze-sponsors/2/website" target="_blank"><img src="https://opencollective.com/laradock/tiers/bronze-sponsors/2/avatar.svg?button=false&isActive=true" height="55px"></a>
<a href="https://opencollective.com/laradock/tiers/bronze-sponsors/3/website" target="_blank"><img src="https://opencollective.com/laradock/tiers/bronze-sponsors/3/avatar.svg?button=false&isActive=true" height="55px"></a>
<a href="https://opencollective.com/laradock/tiers/bronze-sponsors/4/website" target="_blank"><img src="https://opencollective.com/laradock/tiers/bronze-sponsors/4/avatar.svg?button=false&isActive=true" height="55px"></a>
<a href="https://opencollective.com/laradock/tiers/bronze-sponsors/5/website" target="_blank"><img src="https://opencollective.com/laradock/tiers/bronze-sponsors/5/avatar.svg?button=false&isActive=true" height="55px"></a>
<a href="https://opencollective.com/laradock/tiers/bronze-sponsors/6/website" target="_blank"><img src="https://opencollective.com/laradock/tiers/bronze-sponsors/6/avatar.svg?button=false&isActive=true" height="55px"></a>
<a href="https://opencollective.com/laradock/tiers/bronze-sponsors/7/website" target="_blank"><img src="https://opencollective.com/laradock/tiers/bronze-sponsors/7/avatar.svg?button=false&isActive=true" height="55px"></a>
<a href="https://opencollective.com/laradock/tiers/bronze-sponsors/8/website" target="_blank"><img src="https://opencollective.com/laradock/tiers/bronze-sponsors/8/avatar.svg?button=false&isActive=true" height="55px"></a>
<a href="https://opencollective.com/laradock/tiers/bronze-sponsors/9/website" target="_blank"><img src="https://opencollective.com/laradock/tiers/bronze-sponsors/9/avatar.svg?button=false&isActive=true" height="55px"></a>

<a href="https://opencollective.com/laradock/tiers/bronze-sponsors/10/website" target="_blank"><img src="https://opencollective.com/laradock/tiers/bronze-sponsors/10/avatar.svg?button=false&isActive=true" height="55px"></a>
<a href="https://opencollective.com/laradock/tiers/bronze-sponsors/11/website" target="_blank"><img src="https://opencollective.com/laradock/tiers/bronze-sponsors/11/avatar.svg?button=false&isActive=true" height="55px"></a>
<a href="https://opencollective.com/laradock/tiers/bronze-sponsors/12/website" target="_blank"><img src="https://opencollective.com/laradock/tiers/bronze-sponsors/12/avatar.svg?button=false&isActive=true" height="55px"></a>
<a href="https://opencollective.com/laradock/tiers/bronze-sponsors/13/website" target="_blank"><img src="https://opencollective.com/laradock/tiers/bronze-sponsors/13/avatar.svg?button=false&isActive=true" height="55px"></a>
<a href="https://opencollective.com/laradock/tiers/bronze-sponsors/14/website" target="_blank"><img src="https://opencollective.com/laradock/tiers/bronze-sponsors/14/avatar.svg?button=false&isActive=true" height="55px"></a>
<a href="https://opencollective.com/laradock/tiers/bronze-sponsors/15/website" target="_blank"><img src="https://opencollective.com/laradock/tiers/bronze-sponsors/15/avatar.svg?button=false&isActive=true" height="55px"></a>
<a href="https://opencollective.com/laradock/tiers/bronze-sponsors/16/website" target="_blank"><img src="https://opencollective.com/laradock/tiers/bronze-sponsors/16/avatar.svg?button=false&isActive=true" height="55px"></a>
<a href="https://opencollective.com/laradock/tiers/bronze-sponsors/17/website" target="_blank"><img src="https://opencollective.com/laradock/tiers/bronze-sponsors/17/avatar.svg?button=false&isActive=true" height="55px"></a>
<a href="https://opencollective.com/laradock/tiers/bronze-sponsors/18/website" target="_blank"><img src="https://opencollective.com/laradock/tiers/bronze-sponsors/18/avatar.svg?button=false&isActive=true" height="55px"></a>
<a href="https://opencollective.com/laradock/tiers/bronze-sponsors/19/website" target="_blank"><img src="https://opencollective.com/laradock/tiers/bronze-sponsors/19/avatar.svg?button=false&isActive=true" height="55px"></a>

<a href="https://opencollective.com/laradock/tiers/bronze-sponsors/20/website" target="_blank"><img src="https://opencollective.com/laradock/tiers/bronze-sponsors/20/avatar.svg?button=false&isActive=true" height="55px"></a>
<a href="https://opencollective.com/laradock/tiers/bronze-sponsors/21/website" target="_blank"><img src="https://opencollective.com/laradock/tiers/bronze-sponsors/21/avatar.svg?button=false&isActive=true" height="55px"></a>
<a href="https://opencollective.com/laradock/tiers/bronze-sponsors/22/website" target="_blank"><img src="https://opencollective.com/laradock/tiers/bronze-sponsors/22/avatar.svg?button=false&isActive=true" height="55px"></a>
<a href="https://opencollective.com/laradock/tiers/bronze-sponsors/23/website" target="_blank"><img src="https://opencollective.com/laradock/tiers/bronze-sponsors/23/avatar.svg?button=false&isActive=true" height="55px"></a>
<a href="https://opencollective.com/laradock/tiers/bronze-sponsors/24/website" target="_blank"><img src="https://opencollective.com/laradock/tiers/bronze-sponsors/24/avatar.svg?button=false&isActive=true" height="55px"></a>
<a href="https://opencollective.com/laradock/tiers/bronze-sponsors/25/website" target="_blank"><img src="https://opencollective.com/laradock/tiers/bronze-sponsors/25/avatar.svg?button=false&isActive=true" height="55px"></a>
<a href="https://opencollective.com/laradock/tiers/bronze-sponsors/26/website" target="_blank"><img src="https://opencollective.com/laradock/tiers/bronze-sponsors/26/avatar.svg?button=false&isActive=true" height="55px"></a>
<a href="https://opencollective.com/laradock/tiers/bronze-sponsors/27/website" target="_blank"><img src="https://opencollective.com/laradock/tiers/bronze-sponsors/27/avatar.svg?button=false&isActive=true" height="55px"></a>
<a href="https://opencollective.com/laradock/tiers/bronze-sponsors/28/website" target="_blank"><img src="https://opencollective.com/laradock/tiers/bronze-sponsors/28/avatar.svg?button=false&isActive=true" height="55px"></a>
<a href="https://opencollective.com/laradock/tiers/bronze-sponsors/29/website" target="_blank"><img src="https://opencollective.com/laradock/tiers/bronze-sponsors/29/avatar.svg?button=false&isActive=true" height="55px"></a>

</p>


You can sponsor us using any of the methods below:

<b>1:</b> Sponsor via [Open Collective](https://opencollective.com/laradock/).
<br>
<b>2:</b> Email us at <a href = "mailto: support@laradock.io">support@laradock.io</a>.

*Sponsors logos are displayed on the [github repository](https://github.com/laradock/laradock/) page and the [documentation website](http://laradock.io/) home page.*

## License

[MIT](https://github.com/laradock/laradock/blob/master/LICENSE) © Mahmoud Zalt


[comment]: # (Open Collective Tiers)

[contributors-src]: https://opencollective.com/laradock/contributors.svg?width=890&button=false&isActive=true
[contributors-href]: https://github.com/laradock/laradock/graphs/contributors
[backers-src]: https://opencollective.com/laradock/tiers/awesome-backers.svg?width=890&button=false&isActive=true
[backers-href]: https://opencollective.com/laradock#contributors

[gold-sponsors-src]: https://opencollective.com/laradock/tiers/gold-sponsors.svg?avatarHeight=80&width=890&button=false&isActive=true
[gold-sponsors-href]: https://opencollective.com/laradock#contributors
[silver-sponsors-src]: https://opencollective.com/laradock/tiers/silver-sponsors.svg?avatarHeight=64&width=890&button=false&isActive=true
[silver-sponsors-href]: https://opencollective.com/laradock#contributors
[bronze-sponsors-src]: https://opencollective.com/laradock/tiers/bronze-sponsors.svg?avatarHeight=48&width=890&button=false&isActive=true
[bronze-sponsors-href]: https://opencollective.com/laradock#contributors







<br>

