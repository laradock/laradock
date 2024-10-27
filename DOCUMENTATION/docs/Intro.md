---
sidebar_position: 1
title: Introduction
---

![Docker Image](/img/laradock/laradock-logo.jpg)

<b>Laradock</b> is a full PHP development environment for Docker.

We offer a range of popular, pre-configured services that provide a ready-to-use PHP development environment in seconds.

---
### Use Docker First - Learn About It Later!
---

<a name="features"></a>
## Features

- **Seamless PHP Version Switching**: Effortlessly switch between PHP versions (8.1, 8.0, 7.4, 7.3, 7.2, 7.1, 5.6...).
- **Flexible Database Choices**: Pick your preferred database engine, whether it's MySQL, Postgres, MariaDB, and more.
- **Customizable Stacks**: Run your own stack with services like Memcached, HHVM, RabbitMQ, and more.
- **Isolated Containers**: Each software runs in its own container, ensuring clean separation and easy management.
- **Simple Customization**: Easily tweak any container by editing its `Dockerfile`.
- **Trusted Base Images**: All images extend from official base images, ensuring reliability and security.
- **Pre-configured Web Servers**: Ready-to-use NGINX setup to host your code right from the root directory.
- **Project Flexibility**: Use Laradock per project or a single Laradock setup for all your projects.
- **Environment Variable Management**: Easily install or remove software in containers using environment variables.
- **Clean Dockerfiles**: Well-structured and easy-to-understand Dockerfiles (`Dockerfile`).
- **Latest Docker Compose**: Always up-to-date with the latest version of the Docker Compose file (`docker-compose`).
- **Full Transparency**: Everything is visible and editable, giving you full control over your environment.
- **Fast Builds**: Enjoy quick image builds to get your environment up and running in no time.



<a name="Supported-Containers"></a>
## Supported Services

> Laradock, adheres to the 'separation of concerns' principle, thus it runs each software on its own Docker Container.
> You can turn On/Off as many instances as you want without worrying about the configurations.

> To run a chosen container from the list below, run `docker-compose up -d {container-name}`. 
> The container name `{container-name}` is the same as its folder name. Example to run the "PHP FPM" container, use the name "php-fpm".

| Category                  | Services                                                                 |
|---------------------------|--------------------------------------------------------------------------|
| **Web Servers**           | NGINX, Apache2, Caddy                                                    |
| **Load Balancers**        | HAProxy, Traefik                                                         |
| **PHP Compilers**         | PHP FPM, HHVM                                                            |
| **Database Management Systems** | MySQL, PostgreSQL (PostGIS), MariaDB, Percona, MSSQL, MongoDB, Neo4j, CouchDB, RethinkDB, Cassandra |
| **Database Management Tools** | PhpMyAdmin, Adminer, PgAdmin, MongoDB Web UI                         |
| **Cache Engines**         | Redis, Redis Web UI, Redis Cluster, Memcached, Aerospike, Varnish        |
| **Message Brokers**       | RabbitMQ, RabbitMQ Admin Console, Beanstalkd, Beanstalkd Admin Console, Eclipse Mosquitto, Gearman |
| **Log Management**        | GrayLog, Kibana, LogStash                                                |
| **Search Engines**        | ElasticSearch, Apache Solr, Manticore Search, Dejavu                     |
| **PHP Extensions**        | Swoole, Blackfire, Phalcon, PHP Worker, Laravel Horizon                  |
| **Mail Servers**          | Mailu, MailCatcher, Mailhog, MailDev                                     |
| **Real-time Communication** | Laravel Echo, Mercure                                                  |
| **Monitoring**            | Grafana, NetData                                                         |
| **Coordination Services** | Apache ZooKeeper                                                         |
| **Container Management**  | Portainer, Docker Registry, Docker Web UI                                |
| **CI/CD Tools**           | Jenkins, SonarQube, Gitlab                                               |
| **Cloud Tools**           | AWS EB CLI, Amazon Simple Queue Service                                  |
| **Image Processing**      | Thumbor                                                                  |
| **Interactive Computing** | IPython, Jupyter Hub                                                     |
| **Security Tools**        | Certbot                                                                  |
| **Object Storage**        | Minio                                                                    |
| **Testing**               | Selenium                                                                 |
| **IDEs**                  | ICE Coder, Theia, Web IDE                                                |
| (**Laradock Workspace**)    | PHP CLI, Composer, Git, Vim, xDebug, Linuxbrew, Node, V8JS, Gulp, SQLite, Laravel Envoy, Deployer, Yarn, SOAP, Drush, Wordpress CLI, dnsutils |


You can choose, which tools to install in your workspace container and other containers, from the `.env` file.


*If you modify `docker-compose.yml`, `.env` or any `dockerfile` file, you must re-build your containers, to see those effects in the running instance.*



> If you can't find your Software in the list, build it yourself and submit it. Contributions are welcomed :)




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



---










<!-- ## Join Us

[![Gitter](https://badges.gitter.im/Laradock/laradock.svg)](https://gitter.im/Laradock/laradock?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge)

[![Gitpod](https://img.shields.io/badge/Gitpod-ready--to--code-blue)](https://gitpod.io/#https://github.com/laradock/laradock) -->

<!-- --- -->


## Awesome People

Laradock is an MIT-licensed open source project with its ongoing development made possible entirely by the support of you and all these awesome people. 💜


### Project Maintainers

<table>
  <tbody>
    <tr>
        <td align="center" valign="top">
            <img width="125" height="125" src="https://github.com/mahmoudz.png?s=150" />
            <br/>
            <strong>Mahmoud Zalt</strong>
            <br/>
            <a href="https://github.com/Mahmoudz">@mahmoudz</a>
        </td>
        <td align="center" valign="top">
            <img width="125" height="125" src="https://github.com/appleboy.png?s=150" />
            <br/>
            <strong>Bo-Yi Wu</strong>
            <br/>
            <a href="https://github.com/appleboy">@appleboy</a>
        </td>
        <td align="center" valign="top">
            <img width="125" height="125" src="https://github.com/philtrep.png?s=150" />
            <br/>
            <strong>Philippe Trépanier</strong>
            <br/>
            <a href="https://github.com/philtrep">@philtrep</a>
        </td>
        <td align="center" valign="top">
            <img width="125" height="125" src="https://github.com/mikeerickson.png?s=150" />
            <br/>
            <strong>Mike Erickson</strong>
            <br/>
            <a href="https://github.com/mikeerickson">@mikeerickson</a>
        </td>
        <td align="center" valign="top">
            <img width="125" height="125" src="https://github.com/zeroc0d3.png?s=150" />
            <br/>
            <strong>Dwi Fahni Denni</strong>
            <br/>
            <a href="https://github.com/zeroc0d3">@zeroc0d3</a>
        </td>
     </tr>
     <tr>
        <td align="center" valign="top">
            <img width="125" height="125" src="https://github.com/thorerik.png?s=150" />
            <br/>
            <strong>Thor Erik</strong>
            <br/>
            <a href="https://github.com/thorerik">@thorerik</a>
        </td>
        <td align="center" valign="top">
            <img width="125" height="125" src="https://github.com/winfried-van-loon.png?s=150" />
            <br/>
            <strong>Winfried van Loon</strong>
            <br/>
            <a href="https://github.com/winfried-van-loon">@winfried-van-loon</a>
        </td>
        <td align="center" valign="top">
            <img width="125" height="125" src="https://github.com/sixlive.png?s=150" />
            <br/>
            <strong>TJ Miller</strong>
            <br/>
            <a href="https://github.com/sixlive">@sixlive</a>
        </td>
        <td align="center" valign="top">
            <img width="125" height="125" src="https://github.com/bestlong.png?s=150" />
            <br/>
            <strong>Yu-Lung Shao (Allen)</strong>
            <br/>
            <a href="https://github.com/bestlong">@bestlong</a>
        </td>
        <td align="center" valign="top">
            <img width="125" height="125" src="https://github.com/urukalo.png?s=150" />
            <br/>
            <strong>Milan Urukalo</strong>
            <br/>
            <a href="https://github.com/urukalo">@urukalo</a>
        </td>
     </tr>
     <tr>
        <td align="center" valign="top">
            <img width="125" height="125" src="https://github.com/vwchu.png?s=150" />
            <br/>
            <strong>Vince Chu</strong>
            <br/>
            <a href="https://github.com/vwchu">@vwchu</a>
        </td>
        <td align="center" valign="top">
            <img width="125" height="125" src="https://github.com/zuohuadong.png?s=150" />
            <br/>
            <strong>Huadong Zuo</strong>
            <br/>
            <a href="https://github.com/zuohuadong">@zuohuadong</a>
        </td>
        <td align="center" valign="top">
            <img width="125" height="125" src="https://github.com/lanphan.png?s=150" />
            <br/>
            <strong>Lan Phan</strong>
            <br/>
            <a href="https://github.com/lanphan">@lanphan</a>
        </td>
        <td align="center" valign="top">
            <img width="125" height="125" src="https://github.com/ahkui.png?s=150" />
            <br/>
            <strong>Ahkui</strong>
            <br/>
            <a href="https://github.com/ahkui">@ahkui</a>
        </td>
        <td align="center" valign="top">
            <img width="125" height="125" src="https://raw.githubusercontent.com/laradock/laradock/master/.github/home-page-images/join-us.png" />
            <br/>
            <strong>< Join Us ></strong>
            <br/>
            <a href="https://github.com/laradock">@laradock</a>
        </td>
     </tr>
  </tbody>
</table>



### Code Contributors

[![Laradock Contributors](https://opencollective.com/laradock/contributors.svg?width=890&button=false&isActive=true)](https://github.com/laradock/laradock/graphs/contributors)

### Financial Contributors (Backers)

[![Open Collective backers](https://opencollective.com/laradock/tiers/awesome-backers.svg?width=800&avatarHeight=65&button=false&isActive=true)](https://opencollective.com/laradock#contributors)


---



## Sponsors

Sponsoring is an act of giving in a different fashion. 🌱

<!-- Listing Contributors Refference: https://docs.opencollective.com/help/collectives/collective-settings/data-export#contributor-image -->

### Dimand Sponsors

<a href="https://smart.sista.ai/?utm_source=docs_laradock&utm_medium=sponsor&utm_campaign=landing_page_content" target="_blank" style={{ marginRight: '4em' }}>
  <img src="https://raw.githubusercontent.com/laradock/laradock/master/.github/home-page-images/custom-sponsors/sista-ai-icon.png" height="165px" alt="Sista AI - Plug-and-Play AI Assistant. (www.sista.ai)" />
</a>

<a href="http://apiato.io/" target="_blank" style={{ marginRight: '4em' }}>
  <img src="https://raw.githubusercontent.com/laradock/laradock/master/.github/home-page-images/custom-sponsors/apiato.png" height="165px" alt="Apiato - Build PHP API's faster!" />
</a>

### Gold Sponsors

  <iframe 
    src="https://opencollective.com/laradock/tiers/gold-sponsors.svg?avatarHeight=120&width=800&format=svg&button=false&background=#1B1B1D" 
    width="800"
    height="200"
    style={{ border: 'none', backgroundColor: '#1B1B1D' }}>
  </iframe>

### Silver Sponsors

  <iframe 
    src="https://opencollective.com/laradock/tiers/silver-sponsors.svg?avatarHeight=90&width=800&format=svg&button=false&background=#1B1B1D" 
    width="800"
    height="200"
    style={{ border: 'none', backgroundColor: '#1B1B1D' }}>
  </iframe>

### Bronze Sponsors

  <iframe 
    src="https://opencollective.com/laradock/tiers/bronze-sponsors.svg?avatarHeight=65&width=800&format=svg&button=false&background=#1B1B1D" 
    width="800"
    height="300"
    style={{ border: 'none', backgroundColor: '#1B1B1D' }}>
  </iframe>


### Supports Us

You can support us using any of the methods below:

<b>1:</b> [Open Collective](https://opencollective.com/laradock) (For Sponsorships checkout Open Collective, or emails us at support@apiato.io)

<b>2:</b> [Github Sponsors](https://github.com/sponsors/Mahmoudz)



## License

[MIT](https://github.com/laradock/laradock/blob/master/LICENSE) © Mahmoud Zalt


