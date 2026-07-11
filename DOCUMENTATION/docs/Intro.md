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
import TerminalDemo from '@site/src/components/TerminalDemo';
import { GoalBar } from '@site/src/components/SupportBanner';

**Laradock** is a complete Docker environment for PHP. Everything your application needs is already configured, so you can skip setup and start building in seconds.

![Laradock](/img/laradock/laradock-logo.png)

Standing up a PHP stack by hand burns hours: matching versions, wiring databases and queues, chasing "works on my machine." Laradock hands you the whole environment ready to run, so you skip the setup and get straight to code. Start with the `./laradock` CLI, no Docker knowledge required, and drop to plain `docker compose` whenever you want full control, it's the same files underneath. And the same stack follows you all the way to production.

Instead of installing and configuring Nginx, databases, caches, and queues by hand, you get them all as ready-made containers you can switch on and off per project. It works with any PHP project (Laravel, Symfony, WordPress, or plain PHP) and behaves the same on Linux, macOS, and Windows, so your whole team shares one identical setup.

Laradock is free, open-source under the MIT license, and has been battle-tested in real-world PHP projects since 2015.

> **Use Docker first. Learn about it later.**

<TerminalDemo />

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

The first time, `start` runs a setup wizard: pick your framework, PHP version, and stack (web server, database, cache) from pre-selected menus, then hit Enter. After that, `./laradock start` just starts your stack and prints its URLs and credentials. Re-run the wizard anytime with `./laradock setup`.

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

<div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', margin: '1.5rem 0' }}>
  <a className="button button--primary button--lg" href="/docs/getting-started">Full Getting Started Guide</a>
  <a className="button button--secondary button--lg" href="/docs/containers">Usage and Commands</a>
</div>

## What's New (2026)

Battle-tested since 2015, and still growing. Recent highlights:

- **Deploy to production**, [`./laradock ship`](/docs/production) builds an image for any server or cloud.
- **A plain-English CLI**, [`./laradock start`](/docs/cli) runs your whole stack, no Docker needed.
- **Local AI built in**, run LLMs and vector databases on your own machine.
- **100+ services ready**, plus every PHP version from 5.6 to 8.5.

See the [release notes](https://github.com/laradock/laradock/releases) for the full history.

## Features

<!-- SYNC: keep this list identical to the "Key Features" list in /README.md -->

- **Any PHP Version**: Run any version from 5.6 to 8.5. Set `PHP_VERSION` in `.env`, rebuild, and you're on it.
- **100+ Ready-made Services**: Databases, caches, queues, search engines, and more, all pre-configured and waiting.
- **All-in-One Dev Shell**: Run Artisan, Composer, Node, and any CLI inside the `workspace` container, nothing on your host.
- **Deploy to Production**: Turn your dev stack into a hardened image with `./laradock ship`, then deploy anywhere.
- **Pick Your Database**: MySQL, PostgreSQL, MariaDB, MongoDB, Redis, and many others, ready to switch on.
- **Framework-Agnostic**: Works with Laravel, Symfony, WordPress, Magento, Drupal, or plain PHP.
- **Local AI, Built In**: Run LLMs and vector search locally with Ollama, LiteLLM, pgvector, Qdrant, no cloud bills.
- **Toggle Services On Demand**: Start only what a project needs with `docker compose up`, and stop them easily.
- **One Environment Everywhere**: Identical setup on Linux, macOS, and Windows, so your team shares the same stack.
- **A Container Per Service**: Every service is isolated, so nothing conflicts and each piece is easy to manage.
- **Configure From One File**: Every service ships pre-configured; override any setting with 1 line in your `.env`, always wins.
- **Official Base Images**: Every image builds on a trusted upstream source for reliability and security.
- **Web Server Ready**: NGINX, Apache, and Caddy come pre-configured to serve your code out of the box.
- **One or Many Projects**: Run a dedicated Laradock per project, or share a single setup across all of them.
- **Yours to Edit**: Every `Dockerfile` and config is plain, readable, and open for you to change.



## Supported PHP Projects

Laradock provides the PHP runtime, web server, databases, and background services your app needs, so it runs virtually any PHP framework, CMS, or e-commerce platform, right down to plain framework-free PHP.

<!-- SYNC: one of THREE places listing supported projects. Keep in sync with the "Supported PHP Projects" list in README.md AND the projects_* functions in the ./laradock CLI script. Add a project = update all three. -->
| Type | Projects |
|------|----------|
| **Frameworks**  | [Laravel](/docs/laravel-on-docker), [Symfony](/docs/symfony-on-docker), [CodeIgniter](/docs/codeigniter-on-docker), [Yii](/docs/yii-on-docker), [Laminas (Zend Framework)](/docs/laminas-on-docker), [CakePHP](/docs/cakephp-on-docker), [Phalcon](/docs/phalcon-on-docker), [Slim](/docs/slim-on-docker), [Lumen](/docs/lumen-on-docker), [FuelPHP](/docs/fuelphp-on-docker), [Spiral](/docs/spiral-on-docker), [Hyperf](/docs/hyperf-on-docker), [API Platform](/docs/api-platform-on-docker), [Mezzio](/docs/mezzio-on-docker), [Flight](/docs/flight-on-docker), [Fat-Free Framework (F3)](/docs/fat-free-framework-on-docker), [ThinkPHP](/docs/thinkphp-on-docker), [Silex](/docs/silex-on-docker), [Swoole](/docs/swoole-on-docker), [Workerman](/docs/workerman-on-docker), [Ubiquity](/docs/ubiquity-on-docker), [SilverStripe](/docs/silverstripe-on-docker), [Nette](/docs/nette-on-docker), [Leaf PHP](/docs/leaf-php-on-docker) |
| **CMS**         | [WordPress](/docs/wordpress-on-docker), [Drupal](/docs/drupal-on-docker), [Joomla](/docs/joomla-on-docker), [October CMS](/docs/october-cms-on-docker), [Statamic](/docs/statamic-on-docker), [Craft CMS](/docs/craft-cms-on-docker), [TYPO3](/docs/typo3-on-docker), [Concrete CMS](/docs/concrete-cms-on-docker), [Grav](/docs/grav-on-docker), [Backdrop CMS](/docs/backdrop-cms-on-docker), [HTMLy](/docs/htmly-on-docker), [Kirby](/docs/kirby-on-docker), [ProcessWire](/docs/processwire-on-docker), [Pico](/docs/pico-on-docker), [Bolt CMS](/docs/bolt-cms-on-docker), [Contao](/docs/contao-on-docker), [b2evolution](/docs/b2evolution-on-docker), [Serendipity](/docs/serendipity-on-docker), [Nucleus](/docs/nucleus-cms-on-docker), [e107](/docs/e107-on-docker), [Pligg](/docs/pligg-on-docker), [Sulu CMS](/docs/sulu-cms-on-docker), [Pimcore](/docs/pimcore-on-docker), [Winter CMS](/docs/winter-cms-on-docker), [Neos CMS](/docs/neos-cms-on-docker), [Textpattern](/docs/textpattern-on-docker), [ExpressionEngine](/docs/expressionengine-on-docker) |
| **E-commerce**  | [Magento](/docs/magento-on-docker), [WooCommerce](/docs/woocommerce-on-docker), [PrestaShop](/docs/prestashop-on-docker), [OpenCart](/docs/opencart-on-docker), [Sylius](/docs/sylius-on-docker), [Bagisto](/docs/bagisto-on-docker), [Aimeos](/docs/aimeos-on-docker), [Avored](/docs/avored-on-docker), [OroCommerce](/docs/orocommerce-on-docker), [Zen Cart](/docs/zen-cart-on-docker), [osCommerce](/docs/oscommerce-on-docker), [AbanteCart](/docs/abantecart-on-docker), [CubeCart](/docs/cubecart-on-docker), [Shopware](/docs/shopware-on-docker), [LiteCart](/docs/litecart-on-docker), [OpenMage](/docs/openmage-on-docker) |
| **Apps**        | [Moodle](/docs/moodle-on-docker), [MediaWiki](/docs/mediawiki-on-docker), [phpBB](/docs/phpbb-on-docker), [Matomo](/docs/matomo-on-docker), [MyBB](/docs/mybb-on-docker), [FluxBB](/docs/fluxbb-on-docker), [PunBB](/docs/punbb-on-docker), [Flarum](/docs/flarum-on-docker), [bbPress](/docs/bbpress-on-docker), [Simple Machines Forum (SMF)](/docs/smf-on-docker), [DokuWiki](/docs/dokuwiki-on-docker), [BookStack](/docs/bookstack-on-docker), [Roundcube](/docs/roundcube-on-docker), [phpMyAdmin](/docs/phpmyadmin-on-docker), [Adminer](/docs/adminer-on-docker), [SuiteCRM](/docs/suitecrm-on-docker), [EspoCRM](/docs/espocrm-on-docker), [Vtiger](/docs/vtiger-on-docker), [Dolibarr](/docs/dolibarr-on-docker), [Aureus ERP](/docs/aureus-erp-on-docker), [WebERP](/docs/weberp-on-docker), [FrontAccounting](/docs/frontaccounting-on-docker), [Kanboard](/docs/kanboard-on-docker), [Firefly III](/docs/firefly-iii-on-docker), [Invoice Ninja](/docs/invoice-ninja-on-docker), [X2CRM](/docs/x2crm-on-docker), [Nextcloud](/docs/nextcloud-on-docker), [ownCloud](/docs/owncloud-on-docker), [Pydio](/docs/pydio-on-docker), [Mautic](/docs/mautic-on-docker), [Crater](/docs/crater-on-docker), [Akaunting](/docs/akaunting-on-docker), [Monica CRM](/docs/monica-crm-on-docker), [Leantime](/docs/leantime-on-docker), [Cachet](/docs/cachet-on-docker), [PHP Server Monitor](/docs/php-server-monitor-on-docker), [YOURLS](/docs/yourls-on-docker), [LinkAce](/docs/linkace-on-docker), [Koel](/docs/koel-on-docker), [AzuraCast](/docs/azuracast-on-docker), [Lychee](/docs/lychee-on-docker), [Vanilla Forums](/docs/vanilla-forums-on-docker) |



## Supported Services

A **service** is one piece of software, a database, a web server, a cache, a queue, that Laradock runs for you in its own isolated **container** (a lightweight, self-contained box). Each one is already configured, so you just switch on the ones your project needs and leave the rest off. Because they're isolated, they never conflict with each other or with anything on your machine.

To start any service from the list below, use its name, which is the same as its folder name. For example, the "PHP FPM" service lives in the `php-fpm` folder, so you start it with `php-fpm`:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock start php-fpm
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose up -d php-fpm
```

</TabItem>
</Tabs>



<!-- SYNC: one of THREE places listing Laradock services. Keep in sync with the other table (README.md / DOCUMENTATION/docs/Intro.md) AND the homepage list in DOCUMENTATION/src/pages/index.tsx. Add a service = update all three. -->
| Category                  | Services (Containers)                                                                 |
|---------------------------|--------------------------------------------------------------------------|
| (**Laradock Workspace**)  | [PHP CLI](/docs/services/workspace), [Composer](/docs/services/workspace), [Git](/docs/services/workspace), [Vim](/docs/services/workspace), [xDebug](/docs/services/workspace), [Linuxbrew](/docs/services/workspace), [Node](/docs/services/workspace), [V8JS](/docs/services/workspace), [Gulp](/docs/services/workspace), [SQLite](/docs/services/workspace), [Laravel Envoy](/docs/services/workspace), [Deployer](/docs/services/workspace), [Yarn](/docs/services/workspace), [SOAP](/docs/services/workspace), [Drush](/docs/services/workspace), [Wordpress CLI](/docs/services/workspace), [dnsutils](/docs/services/workspace), [Terraform](/docs/services/workspace), [ImageMagick](/docs/services/workspace), [Drupal Console](/docs/services/workspace), [Protoc](/docs/services/workspace), [JDK](/docs/services/workspace), [Docker Client](/docs/services/workspace) |
| **Web Servers**  | [NGINX](/docs/services/nginx), [Apache2](/docs/services/apache2), [Caddy](/docs/services/caddy), [OpenResty](/docs/services/openresty), [Tomcat](/docs/services/tomcat), [FrankenPHP](/docs/services/frankenphp) |
| **Load Balancers**  | [HAProxy](/docs/services/haproxy), [Traefik](/docs/services/traefik) |
| **PHP Compilers**  | [PHP FPM](/docs/services/php-fpm), [RoadRunner](/docs/services/roadrunner) |
| **Database Management Systems**  | [MySQL](/docs/services/mysql), [PostgreSQL](/docs/services/postgres), [PostGIS](/docs/services/postgres-postgis), [pgvector](/docs/services/pgvector), [MariaDB](/docs/services/mariadb), [Percona](/docs/services/percona), [MSSQL](/docs/services/mssql), [MongoDB](/docs/services/mongo), [Neo4j](/docs/services/neo4j), [CouchDB](/docs/services/couchdb), [RethinkDB](/docs/services/rethinkdb), [Cassandra](/docs/services/cassandra), [ClickHouse](/docs/services/clickhouse), [Tarantool](/docs/services/tarantool) |
| **Database Management Tools**  | [PhpMyAdmin](/docs/services/phpmyadmin), [Adminer](/docs/services/adminer), [PgAdmin](/docs/services/pgadmin), [MongoDB Web UI](/docs/services/mongo-webui), [Tarantool Admin](/docs/services/tarantool-admin), [pgbackups (PostgreSQL)](/docs/services/pgbackups) |
| **Cache Engines**  | [Redis](/docs/services/redis), [Redis Web UI](/docs/services/redis-webui), [Redis Cluster](/docs/services/redis-cluster), [Valkey](/docs/services/valkey), [Dragonfly](/docs/services/dragonfly), [Memcached](/docs/services/memcached), [Aerospike](/docs/services/aerospike), [Varnish](/docs/services/varnish), [SSDB](/docs/services/ssdb) |
| **Message Brokers**  | [RabbitMQ](/docs/services/rabbitmq), [RabbitMQ Admin Console](/docs/services/rabbitmq), [Beanstalkd](/docs/services/beanstalkd), [Beanstalkd Admin Console](/docs/services/beanstalkd-console), [Eclipse Mosquitto](/docs/services/mosquitto), [Gearman](/docs/services/gearman), [NATS](/docs/services/nats), [Apache Kafka](/docs/services/kafka), [Kafka Manager](/docs/services/kafka-manager) |
| **Log Management**  | [GrayLog](/docs/services/graylog), [Kibana](/docs/services/kibana), [LogStash](/docs/services/logstash) |
| **Search Engines**  | [ElasticSearch](/docs/services/elasticsearch), [OpenSearch](/docs/services/opensearch), [Apache Solr](/docs/services/solr), [Manticore Search](/docs/services/manticore), [Typesense](/docs/services/typesense), [Meilisearch](/docs/services/meilisearch), [Dejavu](/docs/services/dejavu) |
| **Vector Databases**  | [pgvector](/docs/services/pgvector), [Qdrant](/docs/services/qdrant), [Weaviate](/docs/services/weaviate), [Chroma](/docs/services/chroma) |
| **Graph / Multi-model Databases**  | [Neo4j](/docs/services/neo4j), [ArangoDB](/docs/services/arangodb), [SurrealDB](/docs/services/surrealdb) |
| **Time-series Databases**  | [InfluxDB](/docs/services/influxdb) |
| **AI / LLM**  | [Ollama](/docs/services/ollama), [LocalAI](/docs/services/localai), [LiteLLM](/docs/services/litellm) |
| **Agentic / Automation**  | [n8n](/docs/services/n8n), [Flowise](/docs/services/flowise) |
| **PHP Extensions**  | [Swoole](/docs/swoole-on-docker), [Blackfire](/docs/services/blackfire), [Phalcon](/docs/phalcon-on-docker), [PHP Worker](/docs/services/php-worker), [Laravel Horizon](/docs/services/laravel-horizon) |
| **Mail Servers**  | [Mailu](/docs/services/mailu), [MailCatcher](/docs/services/mailcatcher), [Mailhog](/docs/services/mailhog), [MailDev](/docs/services/maildev), [Mailpit](/docs/services/mailpit) |
| **Real-time Communication**  | [Laravel Echo](/docs/services/laravel-echo-server), [Laravel Reverb](/docs/services/laravel-reverb), [Mercure](/docs/services/mercure), [Soketi](/docs/services/soketi) |
| **Monitoring**  | [Grafana](/docs/services/grafana), [NetData](/docs/services/netdata), [Prometheus](/docs/services/prometheus) |
| **Coordination Services**  | [Apache ZooKeeper](/docs/services/zookeeper) |
| **Container Management**  | [Portainer](/docs/services/portainer), [Docker Registry](/docs/services/docker-registry) |
| **CI/CD Tools**  | [Jenkins](/docs/services/jenkins), [SonarQube](/docs/services/sonarqube), [Gitlab](/docs/services/gitlab), [GitLab Runner](/docs/services/gitlab-runner), [OneDev](/docs/services/onedev) |
| **Cloud Tools**  | [AWS EB CLI](/docs/services/aws-eb-cli), [Amazon Simple Queue Service](/docs/services/sqs) |
| **Image Processing**  | [Thumbor](/docs/services/thumbor) |
| **Security & Identity Tools**  | [Certbot](/docs/services/certbot), [Keycloak](/docs/services/keycloak) |
| **Object Storage**  | [Minio](/docs/services/minio) |
| **Testing**  | [Selenium](/docs/services/selenium) |
| **IDEs**  | [Theia](/docs/services/ide-theia) |
| **API Documentation**  | [Swagger UI](/docs/services/swagger-ui), [Swagger Editor](/docs/services/swagger-editor) |
| **Analytics / BI**  | [Metabase](/docs/services/metabase) |
| **Collaboration**  | [Confluence](/docs/services/confluence) |



You can choose which tools to install in your workspace container and other containers: browse the available flags in each container's `defaults.env` (e.g. `workspace/defaults.env`), then set the ones you want in your `.env` (your `.env` overrides all defaults).


*If you modify a `compose.yml`, `defaults.env`, `.env` or any `dockerfile` file, you must re-build your containers, to see those effects in the running instance.*



:::tip
If you can't find your Software in the list, build it yourself and submit it. Contributions are welcomed :)
:::



---










## Deploy Anywhere

Laradock follows your app to production. Build one image with `./laradock ship`, then run that same image on any of these:

| Where | Platforms |
|-------|-----------|
| **Managed clouds** | [Google Cloud Run](/docs/deploy-to-google-cloud-run) · [AWS ECS](/docs/deploy-to-aws-ecs) · [AWS App Runner](/docs/deploy-to-aws-app-runner) · [Azure Container Apps](/docs/deploy-to-azure-container-apps) · [Fly.io](/docs/deploy-to-fly-io) · [Render](/docs/deploy-to-render) · [Railway](/docs/deploy-to-railway) · [DigitalOcean](/docs/deploy-to-digitalocean) · [Heroku](/docs/deploy-to-heroku) |
| **Your own infrastructure** | [Kubernetes](/docs/deploy-to-kubernetes) · [Kamal](/docs/deploy-to-kamal) · [A single server](/docs/deploy-to-a-server) |

Start here: [Deploy to Production](/docs/production).

## Your All-in-One Dev Workspace

Laradock ships a **Workspace**: a ready-to-use Linux command line with PHP, Composer, Node, Git, and dozens of dev tools already installed. You run every command your project needs *inside* it, so nothing gets installed on your own machine.

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

:::tip[The full journey, from local dev to production]
Laradock doesn't stop at your laptop. When your app is ready, `./laradock ship` turns this exact stack into a hardened image you can deploy anywhere, a single server, Kubernetes (EKS/GKE/AKS), or a managed cloud like AWS ECS, Cloud Run, or Fly. Read more: [Deploy to Production](/docs/production).
:::



:::info[How it's organized]
One folder per service; each holds that service's `compose.yml` (container definition), `defaults.env` (pre-filled settings), and `Dockerfile`. Change any setting by adding one line to your `.env`, it always wins. Full map in [Getting Started](/docs/getting-started).
:::

## The Story: Laravel + Docker = Laradock

Laradock started in 2015 as exactly what the name says: **Lara**vel + **Dock**er, a simple way to run a Laravel app in containers back when Laravel had no official Docker answer of its own. Then the demand grew. Developers wanted more databases, caches, queues, and search engines, and wanted to run projects that were never Laravel at all (Symfony, WordPress, Magento, plain PHP). So Laradock grew with them, from one Laravel stack into 100+ pre-configured services for any PHP project, and now all the way to production with `./laradock ship`. Laravel eventually shipped its own minimal, Laravel-only [Sail](https://laravel.com/docs/sail); Laradock is where you go when you outgrow it.

## How Laradock Compares {#laradock-alternatives}

Every other option either installs software on your machine (XAMPP, MAMP, Herd) or puts a tool between you and Docker (DDEV, Lando, Sail). Laradock does neither: **it is raw Docker with the wiring already done.** Nothing to install, no new commands to learn, nothing generated or hidden; you use `docker compose` directly on plain, readable files you fully own. That makes it the lightest option to adopt and the easiest one to inspect, debug, and bend to your will.

See the full honest breakdown, including when the other tools are the better choice: **[Laradock vs Others](/docs/laradock-alternatives)** (DDEV, Sail, Herd, Lando, XAMPP, and more).

## Community

Gitter's done. Our community of 2,000+ active members has a new home on [GitHub Discussions](https://github.com/laradock/laradock/discussions).

<!-- --- -->

None of this happens on its own. Behind every container, every fix, and every new service added is someone who cared enough to give their time. Meet the people who make Laradock possible.

## Awesome People

Laradock is an MIT-licensed open source project with its ongoing development made possible entirely by the support of you and all these awesome people. 💜


### Project Maintainers

{/* SYNC: keep this list identical to the "Project Maintainers" table in /README.md.
    Order = number of commits, DESCENDING, EXCEPT @mahmoudz is always pinned first (project founder).
    Add/remove a maintainer = update BOTH files. */}

<table className="maintainers">
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
            <img width="115" height="115" src="https://github.com/bestlong.png?s=150" />
            <br/>
            <strong>Yu-Lung Shao (Allen)</strong>
            <br/>
            <a href="https://github.com/bestlong">@bestlong</a>
        </td>
        <td align="center" valign="top">
            <img width="115" height="115" src="https://github.com/winfried-van-loon.png?s=150" />
            <br/>
            <strong>Winfried van Loon</strong>
            <br/>
            <a href="https://github.com/winfried-van-loon">@winfried-van-loon</a>
        </td>
        <td align="center" valign="top">
            <img width="115" height="115" src="https://github.com/appleboy.png?s=150" />
            <br/>
            <strong>Bo-Yi Wu</strong>
            <br/>
            <a href="https://github.com/appleboy">@appleboy</a>
        </td>
        <td align="center" valign="top">
            <img width="115" height="115" src="https://github.com/vlauciani.png?s=150" />
            <br/>
            <strong>Valentino Lauciani</strong>
            <br/>
            <a href="https://github.com/vlauciani">@vlauciani</a>
        </td>
     </tr>
     <tr>
        <td align="center" valign="top">
            <img width="115" height="115" src="https://github.com/arianacosta.png?s=150" />
            <br/>
            <strong>Arian Acosta</strong>
            <br/>
            <a href="https://github.com/arianacosta">@arianacosta</a>
        </td>
        <td align="center" valign="top">
            <img width="115" height="115" src="https://github.com/erikn69.png?s=150" />
            <br/>
            <strong>Erik</strong>
            <br/>
            <a href="https://github.com/erikn69">@erikn69</a>
        </td>
        <td align="center" valign="top">
            <img width="115" height="115" src="https://github.com/zeroc0d3.png?s=150" />
            <br/>
            <strong>Dwi Fahni Denni</strong>
            <br/>
            <a href="https://github.com/zeroc0d3">@zeroc0d3</a>
        </td>
        <td align="center" valign="top">
            <img width="115" height="115" src="https://github.com/makowskid.png?s=150" />
            <br/>
            <strong>Dawid Makowski</strong>
            <br/>
            <a href="https://github.com/makowskid">@makowskid</a>
        </td>
        <td align="center" valign="top">
            <img width="115" height="115" src="https://github.com/iamlucianojr.png?s=150" />
            <br/>
            <strong>Luciano Jr</strong>
            <br/>
            <a href="https://github.com/iamlucianojr">@iamlucianojr</a>
        </td>
     </tr>
     <tr>
        <td align="center" valign="top">
            <img width="115" height="115" src="https://github.com/PavelSavushkinMix.png?s=150" />
            <br/>
            <strong>Pavel Savushkin</strong>
            <br/>
            <a href="https://github.com/PavelSavushkinMix">@PavelSavushkinMix</a>
        </td>
        <td align="center" valign="top">
            <img width="115" height="115" src="https://github.com/philtrep.png?s=150" />
            <br/>
            <strong>Philippe Trépanier</strong>
            <br/>
            <a href="https://github.com/philtrep">@philtrep</a>
        </td>
        <td align="center" valign="top">
            <img width="115" height="115" src="https://github.com/ahkui.png?s=150" />
            <br/>
            <strong>Ahkui</strong>
            <br/>
            <a href="https://github.com/ahkui">@ahkui</a>
        </td>
        <td align="center" valign="top">
            <img width="115" height="115" src="https://github.com/mikeerickson.png?s=150" />
            <br/>
            <strong>Mike Erickson</strong>
            <br/>
            <a href="https://github.com/mikeerickson">@mikeerickson</a>
        </td>
        <td align="center" valign="top">
            <img width="115" height="115" src="https://github.com/lanphan.png?s=150" />
            <br/>
            <strong>Lan Phan</strong>
            <br/>
            <a href="https://github.com/lanphan">@lanphan</a>
        </td>
     </tr>
     <tr>
        <td align="center" valign="top">
            <img width="115" height="115" src="https://github.com/zhushaolong.png?s=150" />
            <br/>
            <strong>zhushaolong</strong>
            <br/>
            <a href="https://github.com/zhushaolong">@zhushaolong</a>
        </td>
        <td align="center" valign="top">
            <img width="115" height="115" src="https://github.com/kideny.png?s=150" />
            <br/>
            <strong>Frank Yuan</strong>
            <br/>
            <a href="https://github.com/kideny">@kideny</a>
        </td>
        <td align="center" valign="top">
            <img width="115" height="115" src="https://github.com/xiagw.png?s=150" />
            <br/>
            <strong>xiagw</strong>
            <br/>
            <a href="https://github.com/xiagw">@xiagw</a>
        </td>
        <td align="center" valign="top">
            <img width="115" height="115" src="https://github.com/Omranic.png?s=150" />
            <br/>
            <strong>Abdelrahman Omran</strong>
            <br/>
            <a href="https://github.com/Omranic">@Omranic</a>
        </td>
        <td align="center" valign="top">
            <img width="115" height="115" src="https://github.com/sixlive.png?s=150" />
            <br/>
            <strong>TJ Miller</strong>
            <br/>
            <a href="https://github.com/sixlive">@sixlive</a>
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
            <img width="115" height="115" src="https://github.com/urukalo.png?s=150" />
            <br/>
            <strong>Milan Urukalo</strong>
            <br/>
            <a href="https://github.com/urukalo">@urukalo</a>
        </td>
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

**Laradock has stayed free and maintained for 10+ years, funded entirely by the developers who use it.** Here's this month's progress toward keeping it alive:

<GoalBar />

Laradock powers local development for developers and companies worldwide: 100K+ active developers, 5M+ downloads, 100+ services, kept working for 10+ years. Like every open-source project, its future depends on the people who rely on it. Your sponsorship directly funds the maintenance that keeps every service working with the latest PHP, database, and framework versions.

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



