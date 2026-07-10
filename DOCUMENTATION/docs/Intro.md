---
sidebar_position: 1
title: Introduction
description: Laradock is a full PHP development environment for Docker. Spin up a ready-to-use stack in seconds with 100+ pre-configured services for Laravel, Symfony, WordPress, or plain PHP.
keywords:
  - laradock
  - docker php
  - php development environment
  - laravel docker
  - docker compose php
  - laradock services
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

**Laradock** is a full PHP development environment for Docker. Spin up a ready-to-use stack in seconds, with popular pre-configured services.

![Laradock](/img/laradock/laradock-logo.png)

Standing up a PHP stack by hand burns hours: matching versions, wiring databases and queues, chasing "works on my machine." Laradock hands you the whole environment ready to run, so you skip the setup and get straight to code.

Instead of installing and configuring Nginx, databases, caches, and queues by hand, you get them all as ready-made containers you can switch on and off per project. It works with any PHP project (Laravel, Symfony, WordPress, or plain PHP) and behaves the same on Linux, macOS, and Windows, so your whole team shares one identical setup.

Laradock is free, open-source under the MIT license, and has been battle-tested in real-world PHP projects since 2015.

> **Use Docker first. Learn about it later.**

## Quick Start

Requires Docker with Compose v2.20+. Pick a tab, both reach the exact same result, and you can switch any time.

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

1 - Clone Laradock inside your PHP project:

```shell
git clone https://github.com/Laradock/laradock.git
```

2 - Enter the laradock folder:

```shell
cd laradock
```

3 - Start your stack:

```shell
./laradock start
```

The first time, `start` runs the setup wizard for you: it detects your framework, then lets you pick your project from one searchable list of 100+ frameworks, CMSs, e-commerce platforms and apps grouped by type (just type its name to filter), your PHP version, and your stack (web server, database, cache). Every answer is pre-selected, so you can press Enter through it, and it can point your app's `.env` at the services for you. Then it starts. After that, `./laradock start` just starts what you chose and prints their URLs and credentials. Re-run the wizard anytime with `./laradock setup`.

4 - Enter the Laradock Workspace (a dev shell with `php`, `composer`, `node`, and `git` inside):

```shell
./laradock workspace
```

Then open `http://localhost`. Done.

The CLI is optional, transparent sugar: it prints every real `docker compose` command it runs, keeps no state, and writes nothing but your `.env`. Full reference: [The Laradock CLI](/docs/cli).

</TabItem>
<TabItem value="docker" label="Docker Compose">

The same result, step by step, with you in charge of every detail:

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
docker compose up -d workspace nginx mysql redis
```

4 - Open your project's `.env` file and set the following:

```shell
DB_HOST=mysql
REDIS_HOST=redis
QUEUE_HOST=beanstalkd
```

5 - Open your browser and visit localhost: `http://localhost`.

Done.

</TabItem>
</Tabs>

:::info[How it's organized]
One folder per service; each holds that service's `compose.yml` (container definition), `defaults.env` (pre-filled settings), and `Dockerfile`. Change any setting by adding one line to your `.env`, it always wins. Full map in [Getting Started](/docs/getting-started).
:::

<div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', margin: '1.5rem 0' }}>
  <a className="button button--primary button--lg" href="/docs/getting-started">Full Getting Started Guide</a>
  <a className="button button--secondary button--lg" href="/docs/containers">Usage and Commands</a>
</div>

## Features

<!-- SYNC: keep this list identical to the "Key Features" list in /README.md -->

- **Any PHP Version**: Run any version from 5.6 to 8.5. Set `PHP_VERSION` in `.env`, rebuild, and you're on it.
- **100+ Ready-made Services**: Databases, caches, queues, search engines, and more, all pre-configured and waiting.
- **All-in-One Dev Shell**: Run Artisan, Composer, Node, and any CLI inside the `workspace` container, nothing on your host.
- **Pick Your Database**: MySQL, PostgreSQL, MariaDB, MongoDB, Redis, and many others, ready to switch on.
- **Framework-Agnostic**: Works great with Laravel, and Symfony, WordPress, Magento, Drupal, or plain PHP, on the same stack.
- **Local AI, Built In**: Run LLMs and vector search locally with Ollama, LiteLLM, pgvector, Qdrant, and more, no keys or cloud bills.
- **Toggle Services On Demand**: Start only what a project needs with `docker compose up`, and stop them easily.
- **One Environment Everywhere**: Identical setup on Linux, macOS, and Windows, so your team shares the same stack.
- **A Container Per Service**: Every service is isolated, so nothing conflicts and each piece is easy to manage.
- **Configure From One File**: Every service ships pre-configured; override any setting with 1 line in your `.env`, always wins.
- **Official Base Images**: Every image builds on a trusted upstream source for reliability and security.
- **Web Server Ready**: NGINX, Apache, and Caddy come pre-configured to serve your code out of the box.
- **One or Many Projects**: Run a dedicated Laradock per project, or share a single setup across all of them.
- **Yours to Edit**: Every `Dockerfile` and config is plain, readable, and open for you to change.



## Works With

Laradock provides the PHP runtime, web server, databases, and background services your app needs, so it runs virtually any PHP framework, CMS, or e-commerce platform, right down to plain framework-free PHP.

<!-- SYNC: one of THREE places listing supported projects. Keep in sync with the "Works With" list in README.md AND the projects_* functions in the ./laradock CLI script. Add a project = update all three. -->
| Type | Projects |
|------|----------|
| **Frameworks**  | Laravel, Symfony, CodeIgniter, Yii, Laminas (Zend Framework), CakePHP, Phalcon, Slim, Lumen, FuelPHP, Spiral, Hyperf, API Platform, Mezzio, Flight, Fat-Free Framework (F3), ThinkPHP, Silex, Swoole, Workerman, Ubiquity, SilverStripe, Nette, Leaf PHP |
| **CMS**         | WordPress, Drupal, Joomla, October CMS, Statamic, Craft CMS, TYPO3, Concrete CMS, Grav, Backdrop CMS, HTMLy, Kirby, ProcessWire, Pico, Bolt CMS, Contao, b2evolution, Serendipity, Nucleus, e107, Pligg, Sulu CMS, Pimcore, Winter CMS, Neos CMS, Textpattern, ExpressionEngine |
| **E-commerce**  | Magento, WooCommerce, PrestaShop, OpenCart, Sylius, Bagisto, Aimeos, Avored, OroCommerce, Zen Cart, osCommerce, AbanteCart, CubeCart, Shopware, LiteCart, OpenMage |
| **Apps**        | Moodle, MediaWiki, phpBB, Matomo, MyBB, FluxBB, PunBB, Flarum, bbPress, Simple Machines Forum (SMF), DokuWiki, BookStack, Roundcube, phpMyAdmin, Adminer, SuiteCRM, EspoCRM, Vtiger, Dolibarr, Aureus ERP, WebERP, FrontAccounting, Kanboard, Firefly III, Invoice Ninja, X2CRM, Nextcloud, ownCloud, Pydio, Mautic, Crater, Akaunting, Monica CRM, Leantime, Cachet, PHP Server Monitor, YOURLS, LinkAce, Koel, AzuraCast, Lychee, Vanilla Forums |



## The Workspace: Your All-in-One Dev Shell

A command line preloaded with PHP, Composer, Node, Git, and dozens of dev tools, so you run every command your project needs *inside* it and install nothing on your own machine.

Enter it and work from there:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock workspace
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose exec workspace bash
```

</TabItem>
</Tabs>

`artisan`, `composer`, `phpunit`, `npm`, and `git` all just work, with nothing installed on your host: no PHP, no Composer, no Node, no version conflicts. Stop the project and **zero traces are left on your device.**

Why it's a big deal:

- **Start in seconds.** Every tool is already installed and configured, so there's nothing to set up; clone a project and get to work.
- **Keep your machine spotless.** Run everything inside the container; your host never gets PHP, Composer, Node, or any CLI, and nothing is left behind when you're done.
- **Isolate every project.** Each one runs on its own PHP and database versions with no conflicts between them.
- **Revive old projects.** Run legacy apps on older PHP (5.6, 7.x) without touching your system's PHP version.



## Supported Services

Laradock adheres to the 'separation of concerns' principle, so it runs each software in its own Docker container. You can turn instances on or off as needed without worrying about configuration.

:::tip
To run a chosen container from the list below: `./laradock start {container-name}` (or `docker compose up -d {container-name}`). The container name `{container-name}` is the same as its folder name. For example, to run the "PHP FPM" container, use the name "php-fpm".
:::



<!-- SYNC: one of THREE places listing Laradock services. Keep in sync with the other table (README.md / DOCUMENTATION/docs/Intro.md) AND the homepage list in DOCUMENTATION/src/pages/index.tsx. Add a service = update all three. -->
| Category                  | Services (Containers)                                                                 |
|---------------------------|--------------------------------------------------------------------------|
| (**Laradock Workspace**)    | PHP CLI, Composer, Git, Vim, xDebug, Linuxbrew, Node, V8JS, Gulp, SQLite, Laravel Envoy, Deployer, Yarn, SOAP, Drush, Wordpress CLI, dnsutils, Terraform, ImageMagick, Drupal Console, Protoc, JDK, Docker Client |
| **Web Servers**           | NGINX, Apache2, Caddy, OpenResty, Tomcat, FrankenPHP                                |
| **Load Balancers**        | HAProxy, Traefik                                                         |
| **PHP Compilers**         | PHP FPM, RoadRunner                                                |
| **Database Management Systems** | MySQL, PostgreSQL, PostGIS, pgvector, MariaDB, Percona, MSSQL, MongoDB, Neo4j, CouchDB, RethinkDB, Cassandra, ClickHouse, Tarantool |
| **Database Management Tools** | PhpMyAdmin, Adminer, PgAdmin, MongoDB Web UI, Tarantool Admin, pgbackups (PostgreSQL) |
| **Cache Engines**         | Redis, Redis Web UI, Redis Cluster, Valkey, Dragonfly, Memcached, Aerospike, Varnish, SSDB        |
| **Message Brokers**       | RabbitMQ, RabbitMQ Admin Console, Beanstalkd, Beanstalkd Admin Console, Eclipse Mosquitto, Gearman, NATS, Apache Kafka, Kafka Manager |
| **Log Management**        | GrayLog, Kibana, LogStash                                                |
| **Search Engines**        | ElasticSearch, OpenSearch, Apache Solr, Manticore Search, Typesense, Meilisearch, Dejavu          |
| **Vector Databases**      | pgvector, Qdrant, Weaviate, Chroma                                       |
| **Graph / Multi-model Databases** | Neo4j, ArangoDB, SurrealDB                                       |
| **Time-series Databases** | InfluxDB                                                                 |
| **AI / LLM**              | Ollama, LocalAI, LiteLLM                                                 |
| **Agentic / Automation**  | n8n, Flowise                                                             |
| **PHP Extensions**        | Swoole, Blackfire, Phalcon, PHP Worker, Laravel Horizon                  |
| **Mail Servers**          | Mailu, MailCatcher, Mailhog, MailDev, Mailpit                                     |
| **Real-time Communication** | Laravel Echo, Laravel Reverb, Mercure, Soketi                                        |
| **Monitoring**            | Grafana, NetData, Prometheus                                            |
| **Coordination Services** | Apache ZooKeeper                                                         |
| **Container Management**  | Portainer, Docker Registry                                              |
| **CI/CD Tools**           | Jenkins, SonarQube, Gitlab, GitLab Runner, OneDev                        |
| **Cloud Tools**           | AWS EB CLI, Amazon Simple Queue Service                                  |
| **Image Processing**      | Thumbor                                                                  |
| **Security & Identity Tools** | Certbot, Keycloak                                                    |
| **Object Storage**        | Minio                                                                    |
| **Testing**               | Selenium                                                                 |
| **IDEs**                  | Theia                                                |
| **API Documentation**     | Swagger UI, Swagger Editor                                              |
| **Analytics / BI**        | Metabase                                                                 |
| **Collaboration**         | Confluence                                                               |



You can choose which tools to install in your workspace container and other containers: browse the available flags in each container's `defaults.env` (e.g. `workspace/defaults.env`), then set the ones you want in your `.env` (your `.env` overrides all defaults).


*If you modify a `compose.yml`, `defaults.env`, `.env` or any `dockerfile` file, you must re-build your containers, to see those effects in the running instance.*



:::tip
If you can't find your Software in the list, build it yourself and submit it. Contributions are welcomed :)
:::



---










## How Laradock Compares {#laradock-alternatives}

Every other option either installs software on your machine (XAMPP, MAMP, Herd) or puts a tool between you and Docker (DDEV, Lando, Sail). Laradock does neither: **it is raw Docker with the wiring already done.** Nothing to install, no new commands to learn, nothing generated or hidden; you use `docker compose` directly on plain, readable files you fully own. That makes it the lightest option to adopt and the easiest one to inspect, debug, and bend to your will.

See the full honest breakdown, including when the other tools are the better choice: **[Laradock vs Others](/docs/laradock-alternatives)** (DDEV, Sail, Herd, Lando, XAMPP, and more).

## Community

Gitter's done. Our community of 2,000+ active members has a new home on [GitHub Discussions](https://github.com/laradock/laradock/discussions).

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

[![Laradock Contributors](https://contrib.rocks/image?repo=laradock/laradock)](https://github.com/laradock/laradock/graphs/contributors)

### Financial Contributors (Backers)

[![Open Collective backers](https://opencollective.com/laradock/tiers/awesome-backers.svg?width=800&avatarHeight=55&button=false&isActive=false)](https://opencollective.com/laradock#contributors)


---



## Sponsors

<!-- Listing Contributors Refference: https://docs.opencollective.com/help/collectives/collective-settings/data-export#contributor-image -->

Laradock powers local development for developers and companies worldwide: 5M+ Docker Hub pulls, 12K+ GitHub stars, 100+ services, kept working for 10+ years. Like every open-source project, its future depends on the people who rely on it. Your sponsorship directly funds the maintenance that keeps every service working with the latest PHP, database, and framework versions.

**Your team runs on Laradock? Help fund it:**

- **Individuals** [sponsor monthly on GitHub](https://github.com/sponsors/laradock), from the price of a coffee.
- **Companies** get your logo below with a real dofollow backlink.
- **Pay by invoice or bank transfer** if a sponsor button won't clear your finance team: [Open Collective](https://opencollective.com/laradock) issues invoices and takes bank transfers so your organization can pay Laradock directly.

[**❤️ Sponsor on GitHub**](https://github.com/sponsors/laradock) · [**Sponsor / invoice via Open Collective**](https://opencollective.com/laradock) · custom or annual agreements: **mahmoud@zalt.me**

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
  ranking authority, the premium they pay for. We use custom per-slot links + the
  avatar.png endpoint (the .svg endpoint is broken upstream, emits data:false MIME).
  Silver/Bronze stay nofollow via the aggregate iframe. Logos auto-populate from
  Open Collective on payment, no deploy needed. -->
  
  <!-- <iframe 
    src="https://opencollective.com/laradock/tiers/gold-sponsors.svg?avatarHeight=120&width=800&format=svg&button=false&background=#1B1B1D" 
    width="800"
    height="200"
    style={{ border: 'none', backgroundColor: '#1B1B1D' }}>
  </iframe> -->


<div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'left', alignItems: 'left' }}>

  <a href="https://opencollective.com/laradock/tiers/gold-sponsors/0/website" target="_blank">
    <img src="https://opencollective.com/laradock/tiers/gold-sponsors/0/avatar.png?isActive=true&avatarHeight=100" height="115" onLoad={(e) => { if (e.target.naturalWidth <= 1) e.target.parentNode.style.display = "none"; }} />
  </a>

  <a href="https://opencollective.com/laradock/tiers/gold-sponsors/1/website" target="_blank">
    <img src="https://opencollective.com/laradock/tiers/gold-sponsors/1/avatar.png?isActive=true&avatarHeight=100" height="115" onLoad={(e) => { if (e.target.naturalWidth <= 1) e.target.parentNode.style.display = "none"; }} />
  </a>

  <a href="https://opencollective.com/laradock/tiers/gold-sponsors/2/website" target="_blank">
    <img src="https://opencollective.com/laradock/tiers/gold-sponsors/2/avatar.png?isActive=true&avatarHeight=100" height="115" onLoad={(e) => { if (e.target.naturalWidth <= 1) e.target.parentNode.style.display = "none"; }} />
  </a>

  <a href="https://opencollective.com/laradock/tiers/gold-sponsors/3/website" target="_blank">
    <img src="https://opencollective.com/laradock/tiers/gold-sponsors/3/avatar.png?isActive=true&avatarHeight=100" height="115" onLoad={(e) => { if (e.target.naturalWidth <= 1) e.target.parentNode.style.display = "none"; }} />
  </a>

  <a href="https://opencollective.com/laradock/tiers/gold-sponsors/4/website" target="_blank">
    <img src="https://opencollective.com/laradock/tiers/gold-sponsors/4/avatar.png?isActive=true&avatarHeight=100" height="115" onLoad={(e) => { if (e.target.naturalWidth <= 1) e.target.parentNode.style.display = "none"; }} />
  </a>

  <a href="https://opencollective.com/laradock/tiers/gold-sponsors/5/website" target="_blank">
    <img src="https://opencollective.com/laradock/tiers/gold-sponsors/5/avatar.png?isActive=true&avatarHeight=100" height="115" onLoad={(e) => { if (e.target.naturalWidth <= 1) e.target.parentNode.style.display = "none"; }} />
  </a>

<a href="https://opencollective.com/laradock/tiers/gold-sponsors/6/website" target="_blank">
    <img src="https://opencollective.com/laradock/tiers/gold-sponsors/6/avatar.png?isActive=true&avatarHeight=100" height="115" onLoad={(e) => { if (e.target.naturalWidth <= 1) e.target.parentNode.style.display = "none"; }} />
  </a>

  <a href="https://opencollective.com/laradock/tiers/gold-sponsors/7/website" target="_blank">
    <img src="https://opencollective.com/laradock/tiers/gold-sponsors/7/avatar.png?isActive=true&avatarHeight=100" height="115" onLoad={(e) => { if (e.target.naturalWidth <= 1) e.target.parentNode.style.display = "none"; }} />
  </a>

  <a href="https://opencollective.com/laradock/tiers/gold-sponsors/8/website" target="_blank">
    <img src="https://opencollective.com/laradock/tiers/gold-sponsors/8/avatar.png?isActive=true&avatarHeight=100" height="115" onLoad={(e) => { if (e.target.naturalWidth <= 1) e.target.parentNode.style.display = "none"; }} />
  </a>

  <a href="https://opencollective.com/laradock/tiers/gold-sponsors/9/website" target="_blank">
    <img src="https://opencollective.com/laradock/tiers/gold-sponsors/9/avatar.png?isActive=true&avatarHeight=100" height="115" onLoad={(e) => { if (e.target.naturalWidth <= 1) e.target.parentNode.style.display = "none"; }} />
  </a>

  <a href="https://opencollective.com/laradock/tiers/gold-sponsors/10/website" target="_blank">
    <img src="https://opencollective.com/laradock/tiers/gold-sponsors/10/avatar.png?isActive=true&avatarHeight=100" height="115" onLoad={(e) => { if (e.target.naturalWidth <= 1) e.target.parentNode.style.display = "none"; }} />
  </a>

  <a href="https://opencollective.com/laradock/tiers/gold-sponsors/11/website" target="_blank">
    <img src="https://opencollective.com/laradock/tiers/gold-sponsors/11/avatar.png?isActive=true&avatarHeight=100" height="115" onLoad={(e) => { if (e.target.naturalWidth <= 1) e.target.parentNode.style.display = "none"; }} />
  </a>

  <a href="https://opencollective.com/laradock/tiers/gold-sponsors/12/website" target="_blank">
    <img src="https://opencollective.com/laradock/tiers/gold-sponsors/12/avatar.png?isActive=true&avatarHeight=100" height="115" onLoad={(e) => { if (e.target.naturalWidth <= 1) e.target.parentNode.style.display = "none"; }} />
  </a>

  <a href="https://opencollective.com/laradock/tiers/gold-sponsors/13/website" target="_blank">
    <img src="https://opencollective.com/laradock/tiers/gold-sponsors/13/avatar.png?isActive=true&avatarHeight=100" height="115" onLoad={(e) => { if (e.target.naturalWidth <= 1) e.target.parentNode.style.display = "none"; }} />
  </a>

  <a href="https://opencollective.com/laradock/tiers/gold-sponsors/14/website" target="_blank">
    <img src="https://opencollective.com/laradock/tiers/gold-sponsors/14/avatar.png?isActive=true&avatarHeight=100" height="115" onLoad={(e) => { if (e.target.naturalWidth <= 1) e.target.parentNode.style.display = "none"; }} />
  </a>

  <a href="https://opencollective.com/laradock/tiers/gold-sponsors/15/website" target="_blank">
    <img src="https://opencollective.com/laradock/tiers/gold-sponsors/15/avatar.png?isActive=true&avatarHeight=100" height="115" onLoad={(e) => { if (e.target.naturalWidth <= 1) e.target.parentNode.style.display = "none"; }} />
  </a>

  <a href="https://opencollective.com/laradock/tiers/gold-sponsors/16/website" target="_blank">
    <img src="https://opencollective.com/laradock/tiers/gold-sponsors/16/avatar.png?isActive=true&avatarHeight=100" height="115" onLoad={(e) => { if (e.target.naturalWidth <= 1) e.target.parentNode.style.display = "none"; }} />
  </a>

  <a href="https://opencollective.com/laradock/tiers/gold-sponsors/17/website" target="_blank">
    <img src="https://opencollective.com/laradock/tiers/gold-sponsors/17/avatar.png?isActive=true&avatarHeight=100" height="115" onLoad={(e) => { if (e.target.naturalWidth <= 1) e.target.parentNode.style.display = "none"; }} />
  </a>

  <a href="https://opencollective.com/laradock/tiers/gold-sponsors/18/website" target="_blank">
    <img src="https://opencollective.com/laradock/tiers/gold-sponsors/18/avatar.png?isActive=true&avatarHeight=100" height="115" onLoad={(e) => { if (e.target.naturalWidth <= 1) e.target.parentNode.style.display = "none"; }} />
  </a>

  <a href="https://opencollective.com/laradock/tiers/gold-sponsors/19/website" target="_blank">
    <img src="https://opencollective.com/laradock/tiers/gold-sponsors/19/avatar.png?isActive=true&avatarHeight=100" height="115" onLoad={(e) => { if (e.target.naturalWidth <= 1) e.target.parentNode.style.display = "none"; }} />
  </a>

</div>


### Silver Sponsors

<div style={{ display: 'flex', flexWrap: 'nowrap', gap: '15px', justifyContent: 'left', alignItems: 'center' }}>
  <a href="https://sista.ai/?utm_source=docs_laradock&utm_medium=sponsor&utm_campaign=landing_page_content" target="_blank" style={{ flexShrink: 0 }}>
    <img src="/img/sponsors/sista-ai-icon-gradient-purple-orange.png" height="90px" alt="Sista AI - AI Workforce platform." />
  </a>

  <img
    src="https://opencollective.com/laradock/tiers/silver-sponsors.svg?avatarHeight=90&width=700&format=svg&button=false&background=%231B1B1D&isActive=true"
    width="700"
    style={{ height: 'auto', backgroundColor: '#1B1B1D' }}
    alt="Silver Sponsors" />
</div>

### Bronze Sponsors

  <img
    src="https://opencollective.com/laradock/tiers/bronze-sponsors.svg?avatarHeight=55&width=800&format=svg&button=false&background=%231B1B1D&isActive=true"
    width="800"
    style={{ height: 'auto', backgroundColor: '#1B1B1D' }}
    alt="Bronze Sponsors" />



### Sponsorship Support 

Sponsoring is an act of giving in a unique way. 🌱  
You can support us using any of the methods below:

**1:** [Open Collective](https://opencollective.com/laradock)  
*Available for all tiers:* Gold, Silver, Bronze, and Backers (Financial Contributors). **Preferred method.**

**2:** [GitHub Sponsors](https://github.com/sponsors/Mahmoudz)  
*Supports the creator of the project directly:* Ideal for personal support of the project creator.

## License

[MIT](https://github.com/laradock/laradock/blob/master/LICENSE) © [Mahmoud Zalt](https://zalt.me/)



