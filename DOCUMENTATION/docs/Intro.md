---
sidebar_position: 1
title: Introduction
description: Laradock is a full PHP development environment for Docker. Spin up a ready-to-use stack in seconds with 70+ pre-configured services for Laravel, Symfony, WordPress, or plain PHP.
keywords:
  - laradock
  - docker php
  - php development environment
  - laravel docker
  - docker compose php
  - laradock services
---

**Laradock** is a full PHP development environment for Docker. Spin up a ready-to-use stack in seconds, with popular pre-configured services.

![Laradock](/img/laradock/laradock-logo.png)

Instead of installing and configuring Nginx, databases, caches, and queues by hand, you get them all as ready-made containers you can switch on and off per project. It works with any PHP project (Laravel, Symfony, WordPress, or plain PHP) and behaves the same on Linux, macOS, and Windows, so your whole team shares one identical setup.

Laradock is free, open-source under the MIT license, and has been battle-tested in real-world PHP projects since 2015.

> **Use Docker first. Learn about it later.**

## Features

- **Any PHP Version**: Run any version from 5.6 to 8.5. Set `PHP_VERSION` in `.env`, rebuild, and you're on it.
- **70+ Ready-made Services**: Databases, caches, queues, search engines, and more, all pre-configured and waiting.
- **Pick Your Database**: MySQL, PostgreSQL, MariaDB, MongoDB, Redis, and many others, ready to switch on.
- **Toggle Services On Demand**: Start only what a project needs with `docker-compose up`, and stop them easily.
- **One Environment Everywhere**: Identical setup on Linux, macOS, and Windows, so your team shares the same stack.
- **A Container Per Service**: Every service is isolated, so nothing conflicts and each piece is easy to manage.
- **Configure From One File**: Add or drop software for any container by flipping variables in `.env`.
- **Official Base Images**: Every image builds on a trusted upstream source for reliability and security.
- **Web Server Ready**: NGINX, Apache, and Caddy come pre-configured to serve your code out of the box.
- **One or Many Projects**: Run a dedicated Laradock per project, or share a single setup across all of them.
- **Yours to Edit**: Every `Dockerfile` and config is plain, readable, and open for you to change.



## The Workspace

**Run every command your project needs, and install nothing on your machine.** Beyond the preconfigured stack, the Workspace container is Laradock's standout feature: a ready-to-use shell with PHP CLI, Composer, Git, Node, Yarn, PHPUnit, and dozens of dev tools already installed and waiting.

Enter it and work from inside:

```bash
docker-compose exec workspace bash
```

From there `artisan`, `composer`, `phpunit`, `npm`, and `git` all just work, with nothing installed on your host: no PHP, no Composer, no Node, no version conflicts. Stop the project and **zero traces are left on your device.**

That makes Laradock great for:

- **Running legacy projects** on older PHP (5.6, 7.x) without changing your system's PHP version.
- **Spinning up any existing project in seconds**, with no local setup and no "works on my machine."
- **Juggling multiple projects** that each need a different PHP or database version, fully isolated.
- **Keeping your machine clean**, so your host never gets polluted with language runtimes or CLIs.



## Works With

Laradock provides the PHP runtime, web server, databases, and background services your app needs, so it runs virtually any PHP framework, CMS, or e-commerce platform, right down to plain framework-free PHP.

| Type | Projects |
|------|----------|
| **Frameworks**  | Laravel, Symfony, CodeIgniter, Yii, Laminas (Zend Framework), CakePHP, Phalcon, Slim, Lumen, FuelPHP |
| **CMS**         | WordPress, Drupal, Joomla, October CMS, Statamic, Craft CMS, TYPO3, Concrete CMS, Grav |
| **E-commerce**  | Magento, WooCommerce, PrestaShop, OpenCart, Sylius, Bagisto |
| **Apps**        | Moodle, MediaWiki, phpBB, Matomo |



## Quick Start

Set up a demo stack with `PHP`, `NGINX`, `MySQL`, `Redis` and `Composer`:

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
docker-compose up -d workspace nginx mysql redis
```

4 - Open your project's `.env` file and set the following:

```shell
DB_HOST=mysql
REDIS_HOST=redis
QUEUE_HOST=beanstalkd
```

5 - Open your browser and visit localhost: `http://localhost`.

Done.

<div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', margin: '1.5rem 0' }}>
  <a className="button button--primary button--lg" href="/docs/getting-started">Full Getting Started Guide</a>
  <a className="button button--secondary button--lg" href="/docs/usage">Usage and Commands</a>
</div>



## Supported Services

> Laradock adheres to the 'separation of concerns' principle, so it runs each software in its own Docker container.
> You can turn instances on or off as needed without worrying about configuration.

> To run a chosen container from the list below, run `docker-compose up -d {container-name}`. 
> The container name `{container-name}` is the same as its folder name. Example to run the "PHP FPM" container, use the name "php-fpm".



| Category                  | Services (Containers)                                                                 |
|---------------------------|--------------------------------------------------------------------------|
| (**Laradock Workspace**)    | PHP CLI, Composer, Git, Vim, xDebug, Linuxbrew, Node, V8JS, Gulp, SQLite, Laravel Envoy, Deployer, Yarn, SOAP, Drush, Wordpress CLI, dnsutils, Terraform, ImageMagick, Drupal Console, Protoc, JDK, Docker Client |
| **Web Servers**           | NGINX, Apache2, Caddy, OpenResty, Tomcat                                            |
| **Load Balancers**        | HAProxy, Traefik                                                         |
| **PHP Compilers**         | PHP FPM, HHVM                                                            |
| **Database Management Systems** | MySQL, PostgreSQL (PostGIS), MariaDB, Percona, MSSQL, MongoDB, Neo4j, CouchDB, RethinkDB, Cassandra, ClickHouse, Tarantool |
| **Database Management Tools** | PhpMyAdmin, Adminer, PgAdmin, MongoDB Web UI, Tarantool Admin, pgbackups (PostgreSQL) |
| **Cache Engines**         | Redis, Redis Web UI, Redis Cluster, Memcached, Aerospike, Varnish, SSDB        |
| **Message Brokers**       | RabbitMQ, RabbitMQ Admin Console, Beanstalkd, Beanstalkd Admin Console, Eclipse Mosquitto, Gearman, NATS, Apache Kafka, Kafka Manager |
| **Log Management**        | GrayLog, Kibana, LogStash                                                |
| **Search Engines**        | ElasticSearch, Apache Solr, Manticore Search, Dejavu                     |
| **PHP Extensions**        | Swoole, Blackfire, Phalcon, PHP Worker, Laravel Horizon                  |
| **Mail Servers**          | Mailu, MailCatcher, Mailhog, MailDev, Mailpit                                     |
| **Real-time Communication** | Laravel Echo, Mercure, Soketi                                                  |
| **Monitoring**            | Grafana, NetData                                                         |
| **Coordination Services** | Apache ZooKeeper                                                         |
| **Container Management**  | Portainer, Docker Registry, Docker Web UI                                |
| **CI/CD Tools**           | Jenkins, SonarQube, Gitlab, OneDev                                       |
| **Cloud Tools**           | AWS EB CLI, Amazon Simple Queue Service                                  |
| **Image Processing**      | Thumbor                                                                  |
| **Interactive Computing** | IPython, Jupyter Hub                                                     |
| **Security Tools**        | Certbot                                                                  |
| **Object Storage**        | Minio                                                                    |
| **Testing**               | Selenium                                                                 |
| **IDEs**                  | Codiad, ICE Coder, Theia, Web IDE                                                |
| **API Documentation**     | Swagger UI, Swagger Editor                                              |



You can choose, which tools to install in your workspace container and other containers, from the `.env` file.


*If you modify `docker-compose.yml`, `.env` or any `dockerfile` file, you must re-build your containers, to see those effects in the running instance.*



> If you can't find your Software in the list, build it yourself and submit it. Contributions are welcomed :)



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
            <img width="115" height="115" src="https://github.com/mahmoudz.png?s=150" />
            <br/>
            <strong>Mahmoud Zalt</strong>
            <br/>
            <a href="https://github.com/Mahmoudz">@mahmoudz</a>
        </td>
        <td align="center" valign="top">
            <img width="115" height="115" src="https://github.com/appleboy.png?s=150" />
            <br/>
            <strong>Bo-Yi Wu</strong>
            <br/>
            <a href="https://github.com/appleboy">@appleboy</a>
        </td>
        <td align="center" valign="top">
            <img width="115" height="115" src="https://github.com/philtrep.png?s=150" />
            <br/>
            <strong>Philippe Trépanier</strong>
            <br/>
            <a href="https://github.com/philtrep">@philtrep</a>
        </td>
        <td align="center" valign="top">
            <img width="115" height="115" src="https://github.com/mikeerickson.png?s=150" />
            <br/>
            <strong>Mike Erickson</strong>
            <br/>
            <a href="https://github.com/mikeerickson">@mikeerickson</a>
        </td>
        <td align="center" valign="top">
            <img width="115" height="115" src="https://github.com/zeroc0d3.png?s=150" />
            <br/>
            <strong>Dwi Fahni Denni</strong>
            <br/>
            <a href="https://github.com/zeroc0d3">@zeroc0d3</a>
        </td>
     </tr>
     <tr>
        <td align="center" valign="top">
            <img width="115" height="115" src="https://github.com/thorerik.png?s=150" />
            <br/>
            <strong>Thor Erik</strong>
            <br/>
            <a href="https://github.com/thorerik">@thorerik</a>
        </td>
        <td align="center" valign="top">
            <img width="115" height="115" src="https://github.com/winfried-van-loon.png?s=150" />
            <br/>
            <strong>Winfried van Loon</strong>
            <br/>
            <a href="https://github.com/winfried-van-loon">@winfried-van-loon</a>
        </td>
        <td align="center" valign="top">
            <img width="115" height="115" src="https://github.com/sixlive.png?s=150" />
            <br/>
            <strong>TJ Miller</strong>
            <br/>
            <a href="https://github.com/sixlive">@sixlive</a>
        </td>
        <td align="center" valign="top">
            <img width="115" height="115" src="https://github.com/bestlong.png?s=150" />
            <br/>
            <strong>Yu-Lung Shao (Allen)</strong>
            <br/>
            <a href="https://github.com/bestlong">@bestlong</a>
        </td>
        <td align="center" valign="top">
            <img width="115" height="115" src="https://github.com/urukalo.png?s=150" />
            <br/>
            <strong>Milan Urukalo</strong>
            <br/>
            <a href="https://github.com/urukalo">@urukalo</a>
        </td>
     </tr>
     <tr>
        <td align="center" valign="top">
            <img width="115" height="115" src="https://github.com/vwchu.png?s=150" />
            <br/>
            <strong>Vince Chu</strong>
            <br/>
            <a href="https://github.com/vwchu">@vwchu</a>
        </td>
        <td align="center" valign="top">
            <img width="115" height="115" src="https://github.com/zuohuadong.png?s=150" />
            <br/>
            <strong>Huadong Zuo</strong>
            <br/>
            <a href="https://github.com/zuohuadong">@zuohuadong</a>
        </td>
        <td align="center" valign="top">
            <img width="115" height="115" src="https://github.com/lanphan.png?s=150" />
            <br/>
            <strong>Lan Phan</strong>
            <br/>
            <a href="https://github.com/lanphan">@lanphan</a>
        </td>
        <td align="center" valign="top">
            <img width="115" height="115" src="https://github.com/ahkui.png?s=150" />
            <br/>
            <strong>Ahkui</strong>
            <br/>
            <a href="https://github.com/ahkui">@ahkui</a>
        </td>
        <td align="center" valign="top">
            <img width="115" height="115" src="https://raw.githubusercontent.com/laradock/laradock/master/.github/home-page-images/join-us.png" />
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

[![Open Collective backers](https://opencollective.com/laradock/tiers/awesome-backers.svg?width=800&avatarHeight=55&button=false&isActive=false)](https://opencollective.com/laradock#contributors)


---



## Sponsors

<!-- Listing Contributors Refference: https://docs.opencollective.com/help/collectives/collective-settings/data-export#contributor-image -->



### Diamond Sponsors

<div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'left', alignItems: 'left' }}>
  <a href="https://sistava.com/?utm_source=docs_laradock&utm_medium=sponsor&utm_campaign=landing_page_content" target="_blank">
    <img src="https://raw.githubusercontent.com/laradock/laradock/master/.github/home-page-images/custom-sponsors/sista-ai-icon.png" height="165px" alt="Sistava - Hire AI Employees to Run Your Business." />
  </a>

  <a href="http://apiato.io/" target="_blank" style={{ marginRight: '10px' }}>
    <img src="https://raw.githubusercontent.com/laradock/laradock/master/.github/home-page-images/custom-sponsors/apiato.png" height="135px" alt="Apiato - A powerful PHP framework for building scalable, enterprise-grade APIs!" />
  </a>
</div>


### Gold Sponsors

  <!-- Gold sponsors get a true dofollow link (no rel attribute) so they receive
  ranking authority — the premium they pay for. We use custom per-slot links + the
  avatar.png endpoint (the .svg endpoint is broken upstream, emits data:false MIME).
  Silver/Bronze stay nofollow via the aggregate iframe. Logos auto-populate from
  Open Collective on payment — no deploy needed. -->
  
  <!-- <iframe 
    src="https://opencollective.com/laradock/tiers/gold-sponsors.svg?avatarHeight=120&width=800&format=svg&button=false&background=#1B1B1D" 
    width="800"
    height="200"
    style={{ border: 'none', backgroundColor: '#1B1B1D' }}>
  </iframe> -->


<div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'left', alignItems: 'left' }}>

  <a href="https://opencollective.com/laradock/tiers/gold-sponsors/0/website" target="_blank">
    <img src="https://opencollective.com/laradock/tiers/gold-sponsors/0/avatar.png?isActive=true&avatarHeight=100" height="115" />
  </a>

  <a href="https://opencollective.com/laradock/tiers/gold-sponsors/1/website" target="_blank">
    <img src="https://opencollective.com/laradock/tiers/gold-sponsors/1/avatar.png?isActive=true&avatarHeight=100" height="115" />
  </a>

  <a href="https://opencollective.com/laradock/tiers/gold-sponsors/2/website" target="_blank">
    <img src="https://opencollective.com/laradock/tiers/gold-sponsors/2/avatar.png?isActive=true&avatarHeight=100" height="115" />
  </a>

  <a href="https://opencollective.com/laradock/tiers/gold-sponsors/3/website" target="_blank">
    <img src="https://opencollective.com/laradock/tiers/gold-sponsors/3/avatar.png?isActive=true&avatarHeight=100" height="115" />
  </a>

  <a href="https://opencollective.com/laradock/tiers/gold-sponsors/4/website" target="_blank">
    <img src="https://opencollective.com/laradock/tiers/gold-sponsors/4/avatar.png?isActive=true&avatarHeight=100" height="115" />
  </a>

  <a href="https://opencollective.com/laradock/tiers/gold-sponsors/5/website" target="_blank">
    <img src="https://opencollective.com/laradock/tiers/gold-sponsors/5/avatar.png?isActive=true&avatarHeight=100" height="115" />
  </a>

<a href="https://opencollective.com/laradock/tiers/gold-sponsors/6/website" target="_blank">
    <img src="https://opencollective.com/laradock/tiers/gold-sponsors/6/avatar.png?isActive=true&avatarHeight=100" height="115" />
  </a>

  <a href="https://opencollective.com/laradock/tiers/gold-sponsors/7/website" target="_blank">
    <img src="https://opencollective.com/laradock/tiers/gold-sponsors/7/avatar.png?isActive=true&avatarHeight=100" height="115" />
  </a>

  <a href="https://opencollective.com/laradock/tiers/gold-sponsors/8/website" target="_blank">
    <img src="https://opencollective.com/laradock/tiers/gold-sponsors/8/avatar.png?isActive=true&avatarHeight=100" height="115" />
  </a>

  <a href="https://opencollective.com/laradock/tiers/gold-sponsors/9/website" target="_blank">
    <img src="https://opencollective.com/laradock/tiers/gold-sponsors/9/avatar.png?isActive=true&avatarHeight=100" height="115" />
  </a>

  <a href="https://opencollective.com/laradock/tiers/gold-sponsors/10/website" target="_blank">
    <img src="https://opencollective.com/laradock/tiers/gold-sponsors/10/avatar.png?isActive=true&avatarHeight=100" height="115" />
  </a>

  <a href="https://opencollective.com/laradock/tiers/gold-sponsors/11/website" target="_blank">
    <img src="https://opencollective.com/laradock/tiers/gold-sponsors/11/avatar.png?isActive=true&avatarHeight=100" height="115" />
  </a>

  <a href="https://opencollective.com/laradock/tiers/gold-sponsors/12/website" target="_blank">
    <img src="https://opencollective.com/laradock/tiers/gold-sponsors/12/avatar.png?isActive=true&avatarHeight=100" height="115" />
  </a>

  <a href="https://opencollective.com/laradock/tiers/gold-sponsors/13/website" target="_blank">
    <img src="https://opencollective.com/laradock/tiers/gold-sponsors/13/avatar.png?isActive=true&avatarHeight=100" height="115" />
  </a>

  <a href="https://opencollective.com/laradock/tiers/gold-sponsors/14/website" target="_blank">
    <img src="https://opencollective.com/laradock/tiers/gold-sponsors/14/avatar.png?isActive=true&avatarHeight=100" height="115" />
  </a>

  <a href="https://opencollective.com/laradock/tiers/gold-sponsors/15/website" target="_blank">
    <img src="https://opencollective.com/laradock/tiers/gold-sponsors/15/avatar.png?isActive=true&avatarHeight=100" height="115" />
  </a>

  <a href="https://opencollective.com/laradock/tiers/gold-sponsors/16/website" target="_blank">
    <img src="https://opencollective.com/laradock/tiers/gold-sponsors/16/avatar.png?isActive=true&avatarHeight=100" height="115" />
  </a>

  <a href="https://opencollective.com/laradock/tiers/gold-sponsors/17/website" target="_blank">
    <img src="https://opencollective.com/laradock/tiers/gold-sponsors/17/avatar.png?isActive=true&avatarHeight=100" height="115" />
  </a>

  <a href="https://opencollective.com/laradock/tiers/gold-sponsors/18/website" target="_blank">
    <img src="https://opencollective.com/laradock/tiers/gold-sponsors/18/avatar.png?isActive=true&avatarHeight=100" height="115" />
  </a>

  <a href="https://opencollective.com/laradock/tiers/gold-sponsors/19/website" target="_blank">
    <img src="https://opencollective.com/laradock/tiers/gold-sponsors/19/avatar.png?isActive=true&avatarHeight=100" height="115" />
  </a>

</div>


### Silver Sponsors

<div style={{ display: 'flex', flexWrap: 'nowrap', gap: '15px', justifyContent: 'left', alignItems: 'center' }}>
  <a href="https://sista.ai/?utm_source=docs_laradock&utm_medium=sponsor&utm_campaign=landing_page_content" target="_blank" style={{ flexShrink: 0 }}>
    <img src="/img/sponsors/sista-ai-icon-gradient-purple-orange.png" height="90px" alt="Sista AI - AI Workforce platform." />
  </a>

  <iframe 
    src="https://opencollective.com/laradock/tiers/silver-sponsors.svg?avatarHeight=90&width=700&format=svg&button=false&background=%231B1B1D&isActive=true" 
    width="700"
    height="110"
    style={{ border: 'none', backgroundColor: '#1B1B1D' }}>
  </iframe>
</div>

### Bronze Sponsors

  <iframe 
    src="https://opencollective.com/laradock/tiers/bronze-sponsors.svg?avatarHeight=55&width=800&format=svg&button=false&background=%231B1B1D&isActive=true" 
    width="800"
    height="300"
    style={{ border: 'none', backgroundColor: '#1B1B1D' }}>
  </iframe>



### Sponsorship Support 

Sponsoring is an act of giving in a unique way. 🌱  
You can support us using any of the methods below:

**1:** [Open Collective](https://opencollective.com/laradock)  
*Available for all tiers:* Gold, Silver, Bronze, and Backers (Financial Contributors). **Preferred method.**

**2:** [GitHub Sponsors](https://github.com/sponsors/Mahmoudz)  
*Supports the creator of the project directly:* Ideal for personal support of the project creator.

## License

[MIT](https://github.com/laradock/laradock/blob/master/LICENSE) © [Mahmoud Zalt](https://zalt.me/)



