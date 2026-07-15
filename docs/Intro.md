# Introduction

Source: https://laradock.io/docs/Intro

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import TerminalDemo from '@site/src/components/TerminalDemo';
import { GoalBar } from '@site/src/components/SupportBanner';

<p style={{fontSize: '1.4rem', fontWeight: 700, marginBottom: '1.5rem'}}>The easiest way to run PHP on Docker.</p>

**Laradock is a complete Docker environment for PHP.** Clone it into any PHP project, run one command, and you have a complete local stack running.

![Laradock - full PHP development environment based on Docker](https://laradock.io/img/laradock/laradock-logo.png)

It ships pre-configured containers for everything a PHP application needs: a web server ([Nginx](https://laradock.io/docs/services/nginx)), the PHP runtime ([PHP-FPM](https://laradock.io/docs/services/php-fpm)), a database ([MySQL](https://laradock.io/docs/services/mysql)), caching ([Redis](https://laradock.io/docs/services/redis)), background jobs ([PHP Worker](https://laradock.io/docs/services/php-worker)), search ([Elasticsearch](https://laradock.io/docs/services/elasticsearch)), mail testing ([Mailpit](https://laradock.io/docs/services/mailpit)), and [100+ additional services](#supported-services), all ready to use with zero manual configuration.

Whether you're using the built-in [Laradock CLI](https://laradock.io/docs/cli), no Docker knowledge required, or plain `docker compose` when you want full control, the same stack works with **any PHP project**, including [Laravel](https://laradock.io/docs/laravel-on-docker), [WordPress](https://laradock.io/docs/wordpress-on-docker), [Symfony](https://laradock.io/docs/symfony-on-docker), [Drupal](https://laradock.io/docs/drupal-on-docker), [Magento](https://laradock.io/docs/magento-on-docker), [100+ other](https://laradock.io/docs/supported-php-projects) frameworks and applications, or plain PHP. Every developer gets the same environment on Linux, macOS, and Windows, eliminating setup differences and "works on my machine" problems.

Laradock doesn't stop at local development. Built-in production deployment with [`./laradock ship`](https://laradock.io/docs/production) packages your application and deploys it to [Kubernetes](https://laradock.io/docs/deploy-to-kubernetes), [Google Cloud Run](https://laradock.io/docs/deploy-to-google-cloud-run), [AWS ECS](https://laradock.io/docs/deploy-to-aws-ecs), [your own server](https://laradock.io/docs/deploy-to-a-server), and [many more](https://laradock.io/docs/production), without switching tools or rebuilding your environment.

Trusted by 100K+ developers, it's free and open-source under the MIT license, and has been battle-tested in real-world PHP projects since 2015.

<div style={{
  display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '1rem',
  margin: '1.75rem 0', padding: '1.1rem 1.3rem',
  background: 'linear-gradient(135deg, rgba(153,110,225,0.16), rgba(153,110,225,0.06))',
  border: '1px solid rgba(153,110,225,0.45)', borderRadius: '12px'
}}>
  <div style={{flex: '1 1 240px', lineHeight: 1.5}}>
    <strong style={{fontSize: '1.05rem'}}>Already running an older version of Laradock?</strong><br />
    Upgrade straight to the latest, with AI, in one go. It's safe, nothing you already run changes.
  </div>
  <div style={{display: 'flex', gap: '0.7rem', flexWrap: 'wrap', alignItems: 'center'}}>
    <a className="button button--primary button--lg" href="/docs/upgrade-guide#let-an-ai-agent-do-it-for-you">🤖 Upgrade with AI</a>
    <a href="/docs/upgrade-guide" style={{fontWeight: 600, whiteSpace: 'nowrap'}}>Upgrade Guide →</a>
  </div>
</div>

> **Use Docker first. Learn about it later.**


<br />

<TerminalDemo />

<br />
<br />

{/* SYNC: keep this tip identical in docs/Intro.md and docs/getting-started.md */}
:::tip[Let AI use it]
Three ways to point your AI assistant at Laradock:

- **Run it for you** - the repo ships agent instructions ([`AGENTS.md`](https://github.com/laradock/laradock/blob/master/AGENTS.md) + rule files for [Claude Code](https://claude.com/claude-code), [Gemini CLI](https://github.com/google-gemini/gemini-cli), [Cursor](https://cursor.com), [Cline](https://cline.bot), and [Windsurf](https://windsurf.com)). Open the repo in your agent and say *"Set up Laradock for this project."*
- **Ask about it, no clone** - add the docs as an MCP server: `https://gitmcp.io/laradock/laradock`.
- **Read a walkthrough** - browse the AI-generated overview on [DeepWiki](https://deepwiki.com/laradock/laradock), starting with its [architecture diagram](https://deepwiki.com/laradock/laradock/1-overview-of-laradock#system-architecture).
:::

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

The first time, `start` runs a short setup wizard, then launches your stack. Full walkthrough and all options: [Getting Started](https://laradock.io/docs/getting-started#get-started).

4 - Enter the Laradock Workspace (a dev shell with `php`, `composer`, `node`, and `git` inside):

```shell
./laradock workspace
```

Then open `http://localhost`. Done.

The CLI is optional, transparent sugar: it prints every real `docker compose` command it runs, keeps no state, and writes nothing but your `.env`. Full reference: [The Laradock CLI](https://laradock.io/docs/cli).

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
  <a className="button button--secondary button--lg" href="/docs/getting-started#the-stack">See How It Works</a>
  <a className="button button--secondary button--lg" href="/docs/cli">Usage and Commands</a>
</div>

<img src="https://laradock.io/img/laradock/separator.png" width="100%" height="9" alt="" />

## What's New (2026)

Battle-tested since 2015, and still growing. Recent highlights:

- **Deploy to production**, [`./laradock ship`](https://laradock.io/docs/production) builds an image for any server or cloud.
- **A plain-English CLI**, [`./laradock start`](https://laradock.io/docs/cli) runs your whole stack, no Docker needed.
- **Local AI built in**, run LLMs and vector databases on your own machine.
- **100+ services ready**, plus every PHP version from 5.6 to 8.5.

See the [release notes](https://github.com/laradock/laradock/releases) for the full history.

Already on an older version? Jumping straight to the latest is safe, nothing you run changes. See the **[Upgrade Guide](https://laradock.io/docs/upgrade-guide)** for the one structural change to know about.

## Features



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

New here? Jump straight to a step-by-step guide for the most popular platforms:

<div className="install-grid">
  <a href="/docs/laravel-on-docker">Laravel</a>
  <a href="/docs/wordpress-on-docker">WordPress</a>
  <a href="/docs/symfony-on-docker">Symfony</a>
  <a href="/docs/drupal-on-docker">Drupal</a>
  <a href="/docs/magento-on-docker">Magento</a>
  <a href="/docs/woocommerce-on-docker">WooCommerce</a>
  <a href="/docs/moodle-on-docker">Moodle</a>
  <a href="/docs/codeigniter-on-docker">CodeIgniter</a>
  <a href="/docs/nextcloud-on-docker">Nextcloud</a>
  <a href="/docs/prestashop-on-docker">PrestaShop</a>
</div>

Not listed? Pick from the full catalog of 100+ supported projects below.


| Type | Projects |
|------|----------|
| **Frameworks**  | [Laravel](https://laradock.io/docs/laravel-on-docker), [Symfony](https://laradock.io/docs/symfony-on-docker), [CodeIgniter](https://laradock.io/docs/codeigniter-on-docker), [Yii](https://laradock.io/docs/yii-on-docker), [Laminas (Zend Framework)](https://laradock.io/docs/laminas-on-docker), [CakePHP](https://laradock.io/docs/cakephp-on-docker), [Phalcon](https://laradock.io/docs/phalcon-on-docker), [Slim](https://laradock.io/docs/slim-on-docker), [Lumen](https://laradock.io/docs/lumen-on-docker), [FuelPHP](https://laradock.io/docs/fuelphp-on-docker), [Spiral](https://laradock.io/docs/spiral-on-docker), [Hyperf](https://laradock.io/docs/hyperf-on-docker), [API Platform](https://laradock.io/docs/api-platform-on-docker), [Mezzio](https://laradock.io/docs/mezzio-on-docker), [Flight](https://laradock.io/docs/flight-on-docker), [Fat-Free Framework (F3)](https://laradock.io/docs/fat-free-framework-on-docker), [ThinkPHP](https://laradock.io/docs/thinkphp-on-docker), [Silex](https://laradock.io/docs/silex-on-docker), [Swoole](https://laradock.io/docs/swoole-on-docker), [Workerman](https://laradock.io/docs/workerman-on-docker), [Ubiquity](https://laradock.io/docs/ubiquity-on-docker), [SilverStripe](https://laradock.io/docs/silverstripe-on-docker), [Nette](https://laradock.io/docs/nette-on-docker), [Leaf PHP](https://laradock.io/docs/leaf-php-on-docker) |
| **CMS**         | [WordPress](https://laradock.io/docs/wordpress-on-docker), [Drupal](https://laradock.io/docs/drupal-on-docker), [Joomla](https://laradock.io/docs/joomla-on-docker), [October CMS](https://laradock.io/docs/october-cms-on-docker), [Statamic](https://laradock.io/docs/statamic-on-docker), [Craft CMS](https://laradock.io/docs/craft-cms-on-docker), [TYPO3](https://laradock.io/docs/typo3-on-docker), [Concrete CMS](https://laradock.io/docs/concrete-cms-on-docker), [Grav](https://laradock.io/docs/grav-on-docker), [Backdrop CMS](https://laradock.io/docs/backdrop-cms-on-docker), [HTMLy](https://laradock.io/docs/htmly-on-docker), [Kirby](https://laradock.io/docs/kirby-on-docker), [ProcessWire](https://laradock.io/docs/processwire-on-docker), [Pico](https://laradock.io/docs/pico-on-docker), [Bolt CMS](https://laradock.io/docs/bolt-cms-on-docker), [Contao](https://laradock.io/docs/contao-on-docker), [b2evolution](https://laradock.io/docs/b2evolution-on-docker), [Serendipity](https://laradock.io/docs/serendipity-on-docker), [Nucleus](https://laradock.io/docs/nucleus-cms-on-docker), [e107](https://laradock.io/docs/e107-on-docker), [Pligg](https://laradock.io/docs/pligg-on-docker), [Sulu CMS](https://laradock.io/docs/sulu-cms-on-docker), [Pimcore](https://laradock.io/docs/pimcore-on-docker), [Winter CMS](https://laradock.io/docs/winter-cms-on-docker), [Neos CMS](https://laradock.io/docs/neos-cms-on-docker), [Textpattern](https://laradock.io/docs/textpattern-on-docker), [ExpressionEngine](https://laradock.io/docs/expressionengine-on-docker) |
| **E-commerce**  | [Magento](https://laradock.io/docs/magento-on-docker), [WooCommerce](https://laradock.io/docs/woocommerce-on-docker), [PrestaShop](https://laradock.io/docs/prestashop-on-docker), [OpenCart](https://laradock.io/docs/opencart-on-docker), [Sylius](https://laradock.io/docs/sylius-on-docker), [Bagisto](https://laradock.io/docs/bagisto-on-docker), [Aimeos](https://laradock.io/docs/aimeos-on-docker), [Avored](https://laradock.io/docs/avored-on-docker), [OroCommerce](https://laradock.io/docs/orocommerce-on-docker), [Zen Cart](https://laradock.io/docs/zen-cart-on-docker), [osCommerce](https://laradock.io/docs/oscommerce-on-docker), [AbanteCart](https://laradock.io/docs/abantecart-on-docker), [CubeCart](https://laradock.io/docs/cubecart-on-docker), [Shopware](https://laradock.io/docs/shopware-on-docker), [LiteCart](https://laradock.io/docs/litecart-on-docker), [OpenMage](https://laradock.io/docs/openmage-on-docker) |
| **Apps**        | [Moodle](https://laradock.io/docs/moodle-on-docker), [MediaWiki](https://laradock.io/docs/mediawiki-on-docker), [phpBB](https://laradock.io/docs/phpbb-on-docker), [Matomo](https://laradock.io/docs/matomo-on-docker), [MyBB](https://laradock.io/docs/mybb-on-docker), [FluxBB](https://laradock.io/docs/fluxbb-on-docker), [PunBB](https://laradock.io/docs/punbb-on-docker), [Flarum](https://laradock.io/docs/flarum-on-docker), [bbPress](https://laradock.io/docs/bbpress-on-docker), [Simple Machines Forum (SMF)](https://laradock.io/docs/smf-on-docker), [DokuWiki](https://laradock.io/docs/dokuwiki-on-docker), [BookStack](https://laradock.io/docs/bookstack-on-docker), [Roundcube](https://laradock.io/docs/roundcube-on-docker), [phpMyAdmin](https://laradock.io/docs/phpmyadmin-on-docker), [Adminer](https://laradock.io/docs/adminer-on-docker), [SuiteCRM](https://laradock.io/docs/suitecrm-on-docker), [EspoCRM](https://laradock.io/docs/espocrm-on-docker), [Vtiger](https://laradock.io/docs/vtiger-on-docker), [Dolibarr](https://laradock.io/docs/dolibarr-on-docker), [Aureus ERP](https://laradock.io/docs/aureus-erp-on-docker), [WebERP](https://laradock.io/docs/weberp-on-docker), [FrontAccounting](https://laradock.io/docs/frontaccounting-on-docker), [Kanboard](https://laradock.io/docs/kanboard-on-docker), [Firefly III](https://laradock.io/docs/firefly-iii-on-docker), [Invoice Ninja](https://laradock.io/docs/invoice-ninja-on-docker), [X2CRM](https://laradock.io/docs/x2crm-on-docker), [Nextcloud](https://laradock.io/docs/nextcloud-on-docker), [ownCloud](https://laradock.io/docs/owncloud-on-docker), [Pydio](https://laradock.io/docs/pydio-on-docker), [Mautic](https://laradock.io/docs/mautic-on-docker), [Crater](https://laradock.io/docs/crater-on-docker), [Akaunting](https://laradock.io/docs/akaunting-on-docker), [Monica CRM](https://laradock.io/docs/monica-crm-on-docker), [Leantime](https://laradock.io/docs/leantime-on-docker), [Cachet](https://laradock.io/docs/cachet-on-docker), [PHP Server Monitor](https://laradock.io/docs/php-server-monitor-on-docker), [YOURLS](https://laradock.io/docs/yourls-on-docker), [LinkAce](https://laradock.io/docs/linkace-on-docker), [Koel](https://laradock.io/docs/koel-on-docker), [AzuraCast](https://laradock.io/docs/azuracast-on-docker), [Lychee](https://laradock.io/docs/lychee-on-docker), [Vanilla Forums](https://laradock.io/docs/vanilla-forums-on-docker) |



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




| Category                  | Services (Containers)                                                                 |
|---------------------------|--------------------------------------------------------------------------|
| (**Laradock Workspace**)  | [PHP CLI](https://laradock.io/docs/services/workspace), [Composer](https://laradock.io/docs/services/workspace), [Git](https://laradock.io/docs/services/workspace), [Vim](https://laradock.io/docs/services/workspace), [xDebug](https://laradock.io/docs/services/workspace), [Linuxbrew](https://laradock.io/docs/services/workspace), [Node](https://laradock.io/docs/services/workspace), [V8JS](https://laradock.io/docs/services/workspace), [Gulp](https://laradock.io/docs/services/workspace), [SQLite](https://laradock.io/docs/services/workspace), [Laravel Envoy](https://laradock.io/docs/services/workspace), [Deployer](https://laradock.io/docs/services/workspace), [Yarn](https://laradock.io/docs/services/workspace), [SOAP](https://laradock.io/docs/services/workspace), [Drush](https://laradock.io/docs/services/workspace), [Wordpress CLI](https://laradock.io/docs/services/workspace), [dnsutils](https://laradock.io/docs/services/workspace), [Terraform](https://laradock.io/docs/services/workspace), [ImageMagick](https://laradock.io/docs/services/workspace), [Drupal Console](https://laradock.io/docs/services/workspace), [Protoc](https://laradock.io/docs/services/workspace), [JDK](https://laradock.io/docs/services/workspace), [Docker Client](https://laradock.io/docs/services/workspace) |
| **Web Servers**  | [NGINX](https://laradock.io/docs/services/nginx), [Apache2](https://laradock.io/docs/services/apache2), [Caddy](https://laradock.io/docs/services/caddy), [OpenResty](https://laradock.io/docs/services/openresty), [Tomcat](https://laradock.io/docs/services/tomcat), [FrankenPHP](https://laradock.io/docs/services/frankenphp) |
| **Load Balancers**  | [HAProxy](https://laradock.io/docs/services/haproxy), [Traefik](https://laradock.io/docs/services/traefik) |
| **PHP Compilers**  | [PHP FPM](https://laradock.io/docs/services/php-fpm), [RoadRunner](https://laradock.io/docs/services/roadrunner) |
| **Database Management Systems**  | [MySQL](https://laradock.io/docs/services/mysql), [PostgreSQL](https://laradock.io/docs/services/postgres), [PostGIS](https://laradock.io/docs/services/postgres-postgis), [pgvector](https://laradock.io/docs/services/pgvector), [MariaDB](https://laradock.io/docs/services/mariadb), [Percona](https://laradock.io/docs/services/percona), [MSSQL](https://laradock.io/docs/services/mssql), [MongoDB](https://laradock.io/docs/services/mongo), [Neo4j](https://laradock.io/docs/services/neo4j), [CouchDB](https://laradock.io/docs/services/couchdb), [RethinkDB](https://laradock.io/docs/services/rethinkdb), [Cassandra](https://laradock.io/docs/services/cassandra), [ClickHouse](https://laradock.io/docs/services/clickhouse), [Tarantool](https://laradock.io/docs/services/tarantool) |
| **Database Management Tools**  | [PhpMyAdmin](https://laradock.io/docs/services/phpmyadmin), [Adminer](https://laradock.io/docs/services/adminer), [PgAdmin](https://laradock.io/docs/services/pgadmin), [MongoDB Web UI](https://laradock.io/docs/services/mongo-webui), [Tarantool Admin](https://laradock.io/docs/services/tarantool-admin), [pgbackups (PostgreSQL)](https://laradock.io/docs/services/pgbackups) |
| **Cache Engines**  | [Redis](https://laradock.io/docs/services/redis), [Redis Web UI](https://laradock.io/docs/services/redis-webui), [Redis Cluster](https://laradock.io/docs/services/redis-cluster), [Valkey](https://laradock.io/docs/services/valkey), [Dragonfly](https://laradock.io/docs/services/dragonfly), [Memcached](https://laradock.io/docs/services/memcached), [Aerospike](https://laradock.io/docs/services/aerospike), [Varnish](https://laradock.io/docs/services/varnish), [SSDB](https://laradock.io/docs/services/ssdb) |
| **Message Brokers**  | [RabbitMQ](https://laradock.io/docs/services/rabbitmq), [RabbitMQ Admin Console](https://laradock.io/docs/services/rabbitmq), [Beanstalkd](https://laradock.io/docs/services/beanstalkd), [Beanstalkd Admin Console](https://laradock.io/docs/services/beanstalkd-console), [Eclipse Mosquitto](https://laradock.io/docs/services/mosquitto), [Gearman](https://laradock.io/docs/services/gearman), [NATS](https://laradock.io/docs/services/nats), [Apache Kafka](https://laradock.io/docs/services/kafka), [Kafka Manager](https://laradock.io/docs/services/kafka-manager) |
| **Log Management**  | [GrayLog](https://laradock.io/docs/services/graylog), [Kibana](https://laradock.io/docs/services/kibana), [LogStash](https://laradock.io/docs/services/logstash) |
| **Search Engines**  | [ElasticSearch](https://laradock.io/docs/services/elasticsearch), [OpenSearch](https://laradock.io/docs/services/opensearch), [Apache Solr](https://laradock.io/docs/services/solr), [Manticore Search](https://laradock.io/docs/services/manticore), [Typesense](https://laradock.io/docs/services/typesense), [Meilisearch](https://laradock.io/docs/services/meilisearch), [Dejavu](https://laradock.io/docs/services/dejavu) |
| **Vector Databases**  | [pgvector](https://laradock.io/docs/services/pgvector), [Qdrant](https://laradock.io/docs/services/qdrant), [Weaviate](https://laradock.io/docs/services/weaviate), [Chroma](https://laradock.io/docs/services/chroma) |
| **Graph / Multi-model Databases**  | [Neo4j](https://laradock.io/docs/services/neo4j), [ArangoDB](https://laradock.io/docs/services/arangodb), [SurrealDB](https://laradock.io/docs/services/surrealdb) |
| **Time-series Databases**  | [InfluxDB](https://laradock.io/docs/services/influxdb) |
| **AI / LLM**  | [Ollama](https://laradock.io/docs/services/ollama), [vLLM](https://laradock.io/docs/services/vllm), [LocalAI](https://laradock.io/docs/services/localai), [LiteLLM](https://laradock.io/docs/services/litellm), [Open WebUI](https://laradock.io/docs/services/open-webui), [MCP](https://laradock.io/docs/services/mcp) |
| **Agentic / Automation**  | [n8n](https://laradock.io/docs/services/n8n), [Flowise](https://laradock.io/docs/services/flowise), [Langflow](https://laradock.io/docs/services/langflow) |
| **PHP Extensions**  | [Swoole](https://laradock.io/docs/swoole-on-docker), [Blackfire](https://laradock.io/docs/services/blackfire), [Phalcon](https://laradock.io/docs/phalcon-on-docker), [PHP Worker](https://laradock.io/docs/services/php-worker), [Laravel Horizon](https://laradock.io/docs/services/laravel-horizon) |
| **Mail Servers**  | [Mailu](https://laradock.io/docs/services/mailu), [MailCatcher](https://laradock.io/docs/services/mailcatcher), [Mailhog](https://laradock.io/docs/services/mailhog), [MailDev](https://laradock.io/docs/services/maildev), [Mailpit](https://laradock.io/docs/services/mailpit) |
| **Real-time Communication**  | [Laravel Echo](https://laradock.io/docs/services/laravel-echo-server), [Laravel Reverb](https://laradock.io/docs/services/laravel-reverb), [Mercure](https://laradock.io/docs/services/mercure), [Soketi](https://laradock.io/docs/services/soketi) |
| **Monitoring**  | [Grafana](https://laradock.io/docs/services/grafana), [NetData](https://laradock.io/docs/services/netdata), [Prometheus](https://laradock.io/docs/services/prometheus) |
| **Coordination Services**  | [Apache ZooKeeper](https://laradock.io/docs/services/zookeeper) |
| **Container Management**  | [Portainer](https://laradock.io/docs/services/portainer), [Docker Registry](https://laradock.io/docs/services/docker-registry) |
| **CI/CD Tools**  | [Jenkins](https://laradock.io/docs/services/jenkins), [SonarQube](https://laradock.io/docs/services/sonarqube), [Gitlab](https://laradock.io/docs/services/gitlab), [GitLab Runner](https://laradock.io/docs/services/gitlab-runner), [OneDev](https://laradock.io/docs/services/onedev) |
| **Cloud Tools**  | [AWS EB CLI](https://laradock.io/docs/services/aws-eb-cli), [Amazon Simple Queue Service](https://laradock.io/docs/services/sqs) |
| **Image Processing**  | [Thumbor](https://laradock.io/docs/services/thumbor) |
| **Security & Identity Tools**  | [Certbot](https://laradock.io/docs/services/certbot), [Keycloak](https://laradock.io/docs/services/keycloak) |
| **Object Storage**  | [Minio](https://laradock.io/docs/services/minio) |
| **Testing**  | [Selenium](https://laradock.io/docs/services/selenium) |
| **IDEs**  | [Theia](https://laradock.io/docs/services/ide-theia) |
| **API Documentation**  | [Swagger UI](https://laradock.io/docs/services/swagger-ui), [Swagger Editor](https://laradock.io/docs/services/swagger-editor) |
| **Analytics / BI**  | [Metabase](https://laradock.io/docs/services/metabase) |
| **Collaboration**  | [Confluence](https://laradock.io/docs/services/confluence) |



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
| **Managed clouds** | [Google Cloud Run](https://laradock.io/docs/deploy-to-google-cloud-run) · [AWS ECS](https://laradock.io/docs/deploy-to-aws-ecs) · [AWS App Runner](https://laradock.io/docs/deploy-to-aws-app-runner) · [Azure Container Apps](https://laradock.io/docs/deploy-to-azure-container-apps) · [Fly.io](https://laradock.io/docs/deploy-to-fly-io) · [Render](https://laradock.io/docs/deploy-to-render) · [Railway](https://laradock.io/docs/deploy-to-railway) · [DigitalOcean](https://laradock.io/docs/deploy-to-digitalocean) · [Heroku](https://laradock.io/docs/deploy-to-heroku) |
| **Your own infrastructure** | [Kubernetes](https://laradock.io/docs/deploy-to-kubernetes) · [Kamal](https://laradock.io/docs/deploy-to-kamal) · [A single server](https://laradock.io/docs/deploy-to-a-server) |

Start here: [Deploy to Production](https://laradock.io/docs/production).

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
Laradock doesn't stop at your laptop. When your app is ready, `./laradock ship` turns this exact stack into a hardened image you can deploy anywhere, a single server, Kubernetes (EKS/GKE/AKS), or a managed cloud like AWS ECS, Cloud Run, or Fly. Read more: [Deploy to Production](https://laradock.io/docs/production).
:::



:::info[How it's organized]
One folder per service; each holds that service's `compose.yml` (container definition), `defaults.env` (pre-filled settings), and `Dockerfile`. Change any setting by adding one line to your `.env`, it always wins. Full map in [Getting Started](https://laradock.io/docs/getting-started). Going deeper? [Customizing Images](https://laradock.io/docs/customizing-images) covers changing what's inside a container, and [Data & Volumes](https://laradock.io/docs/volumes) covers where your data lives.
:::

## The Story: Laravel + Docker = Laradock

Laradock started in 2015 as exactly what the name says: **Lara**vel + **Dock**er, a simple way to run a Laravel app in containers back when Laravel had no official Docker answer of its own. Then the demand grew. Developers wanted more databases, caches, queues, and search engines, and wanted to run projects that were never Laravel at all (Symfony, WordPress, Magento, plain PHP). So Laradock grew with them, from one Laravel stack into 100+ pre-configured services for any PHP project, and now all the way to production with `./laradock ship`. Laravel eventually shipped its own minimal, Laravel-only [Sail](https://laravel.com/docs/sail); Laradock is where you go when you outgrow it.

## How Laradock Compares {#laradock-alternatives}

Every other option either installs software on your machine (XAMPP, MAMP, Herd) or puts a tool between you and Docker (DDEV, Lando, Sail). Laradock does neither: **it is raw Docker with the wiring already done.** Nothing to install, no new commands to learn, nothing generated or hidden; you use `docker compose` directly on plain, readable files you fully own. That makes it the lightest option to adopt and the easiest one to inspect, debug, and bend to your will.

And today it goes further than any of them combine: an [AI agent can operate the whole stack](https://github.com/laradock/laradock/blob/master/AGENTS.md) (`AGENTS.md` + [`llms.txt`](https://laradock.io/llms.txt)), a one-click local AI stack ([Ollama](https://laradock.io/docs/services/ollama), vector databases) is built in, and [`./laradock ship`](https://laradock.io/docs/production) carries the same environment to production. Each rival wins on a single axis (Herd on native speed, DDEV on automatic HTTPS); Laradock wins on the combination.

See the full honest breakdown, including when the other tools are the better choice: **[Laradock vs Others](https://laradock.io/docs/laradock-alternatives)** (DDEV, Sail, Herd, Lando, XAMPP, and more).

## Community

Gitter's done. Our community of 2,000+ active members has a new home on [GitHub Discussions](https://github.com/laradock/laradock/discussions).



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

  {/* Diamond auto-slots: paid Diamond sponsors auto-populate from Open Collective (dofollow, largest logo); empty slots hide themselves. Same mechanism as Gold. */}
  <a href="https://opencollective.com/laradock/tiers/diamond-sponsors/0/website" target="_blank">
    <img src="https://opencollective.com/laradock/tiers/diamond-sponsors/0/avatar.png?isActive=true&avatarHeight=130" height="150" onLoad={(e) => { if (e.target.naturalWidth <= 1) e.target.parentNode.style.display = "none"; }} />
  </a>

  <a href="https://opencollective.com/laradock/tiers/diamond-sponsors/1/website" target="_blank">
    <img src="https://opencollective.com/laradock/tiers/diamond-sponsors/1/avatar.png?isActive=true&avatarHeight=130" height="150" onLoad={(e) => { if (e.target.naturalWidth <= 1) e.target.parentNode.style.display = "none"; }} />
  </a>

  <a href="https://opencollective.com/laradock/tiers/diamond-sponsors/2/website" target="_blank">
    <img src="https://opencollective.com/laradock/tiers/diamond-sponsors/2/avatar.png?isActive=true&avatarHeight=130" height="150" onLoad={(e) => { if (e.target.naturalWidth <= 1) e.target.parentNode.style.display = "none"; }} />
  </a>

  <a href="https://opencollective.com/laradock/tiers/diamond-sponsors/3/website" target="_blank">
    <img src="https://opencollective.com/laradock/tiers/diamond-sponsors/3/avatar.png?isActive=true&avatarHeight=130" height="150" onLoad={(e) => { if (e.target.naturalWidth <= 1) e.target.parentNode.style.display = "none"; }} />
  </a>

  <a href="https://opencollective.com/laradock/tiers/diamond-sponsors/4/website" target="_blank">
    <img src="https://opencollective.com/laradock/tiers/diamond-sponsors/4/avatar.png?isActive=true&avatarHeight=130" height="150" onLoad={(e) => { if (e.target.naturalWidth <= 1) e.target.parentNode.style.display = "none"; }} />
  </a>
</div>


### Gold Sponsors

  
  
  


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
    <img src="https://laradock.io/img/sponsors/sista-ai-icon-gradient-purple-orange.png" height="90px" alt="Sista AI - AI Workforce platform." />
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
