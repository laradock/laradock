<p align="center">
    <img src="/.github/home-page-images/laradock-logo.png?raw=true" alt="Laradock Logo"/>
</p>

<p align="center">
   <a href="https://laradock.io/contributing"><img src="https://img.shields.io/badge/contributions-welcome-brightgreen.svg?style=flat" alt="contributions welcome"></a>
   <a href="https://github.com/laradock/laradock/network"><img src="https://img.shields.io/github/forks/laradock/laradock.svg" alt="GitHub forks"></a>
   <a href="https://github.com/laradock/laradock/issues"><img src="https://img.shields.io/github/issues/laradock/laradock.svg" alt="GitHub issues"></a>
   <a href="https://github.com/laradock/laradock/stargazers"><a href="#backers" alt="sponsors on Open Collective"><img src="https://opencollective.com/laradock/backers/badge.svg" /></a> <a href="#sponsors" alt="Sponsors on Open Collective"><img src="https://opencollective.com/laradock/sponsors/badge.svg" /></a> <img src="https://img.shields.io/github/stars/laradock/laradock.svg" alt="GitHub stars"></a>
   <a href="https://github.com/laradock/laradock/actions/workflows/main-ci.yml"><img src="https://github.com/laradock/laradock/actions/workflows/main-ci.yml/badge.svg" alt="GitHub CI"></a>
   <a href="https://raw.githubusercontent.com/laradock/laradock/master/LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="GitHub license"></a>
</p>

<p align="center"><b>基于 Docker 的完整 PHP 开发环境。</b></p>

<p align="center">
  🌐 <b>语言:</b> <a href="./README.md">English</a> · <b>简体中文</b> · <a href="./README-ar.md">العربية</a> · <a href="./README-es.md">Español</a>
</p>

<p align="center">
    <a href="https://zalt.me"><img src="http://forthebadge.com/images/badges/built-by-developers.svg" alt="forthebadge" width="180"></a>
</p>

<br>
<br>

<h2 align="center" style="color:#7d58c2">先用 Docker，后学习 Docker！</h2>

## 概述

Laradock 是一套基于 Docker 的完整 PHP 开发环境。它提供了 PHP 应用所需的一切预配置、开箱即用的容器（Nginx、PHP-FPM、MySQL、PostgreSQL、Redis 等等），让你无需任何手动配置，几秒钟内就能启动一整套本地开发环境。

它适用于**任何 PHP 项目**，并且在 Linux、macOS 和 Windows 上表现一致。

环境搭建往往会耗掉 PHP 项目的第一天。Laradock 把这一天还给你：克隆一次、运行一条命令，整套环境即刻就绪。

### 环境要求

- [Docker](https://www.docker.com/products/docker-desktop/)
- [Git](https://git-scm.com/downloads)

### 快速开始

搭建一套包含 `PHP`、`NGINX`、`MySQL`、`Redis` 和 `Composer` 的演示环境：

1 - 在你的 PHP 项目中克隆 Laradock：

```shell
git clone https://github.com/Laradock/laradock.git
```

2 - 进入 laradock 目录，将 `.env.example` 重命名为 `.env`。

```shell
cp .env.example .env
```

3 - 运行容器：

```shell
docker-compose up -d workspace nginx mysql redis
```

4 - 打开你项目的 `.env` 文件，设置以下内容：

```shell
DB_HOST=mysql
REDIS_HOST=redis
QUEUE_HOST=beanstalkd
```

5 - 打开浏览器访问 localhost：`http://localhost`。

完成。

### 选择你的技术栈

上面的快速开始只运行了一套固定组合。你可以换成以下任意服务：

`nginx`、`apache2`、`caddy`、`php-fpm`、`mysql`、`postgres`、`mariadb`、`mongo`、`redis`、`memcached`、`rabbitmq`、`beanstalkd`、`workspace` 等等。

```shell
docker-compose up -d workspace apache2 postgres redis
```

### 常用命令

- 列出正在运行的容器：`docker-compose ps`
- 查看某个容器的日志：`docker logs {容器名称}`
- 停止所有容器：`docker-compose stop`
- 删除所有容器：`docker-compose down`

### 支持的技术栈

Laradock 提供了应用所需的 PHP 运行时、Web 服务器、数据库和后台服务，因此几乎可以运行任何 PHP 框架、CMS 或电商平台：

- **框架：** Laravel、Symfony、CodeIgniter、Yii、Laminas（Zend Framework）、CakePHP、Phalcon、Slim、Lumen、FuelPHP
- **CMS：** WordPress、Drupal、Joomla、October CMS、Statamic、Craft CMS、TYPO3、Concrete CMS、Grav
- **电商：** Magento、WooCommerce、PrestaShop、OpenCart、Sylius、Bagisto
- **应用：** Moodle、MediaWiki、phpBB、Matomo

……或是不依赖任何框架的原生 PHP。

### 主要特性

- **预配置技术栈：** 70 多个开箱即用的容器（Nginx、Apache、Caddy、PHP-FPM、MySQL、PostgreSQL、MariaDB、MongoDB、Redis、Memcached、Elasticsearch、RabbitMQ、Beanstalkd 等等）。
- **一体化开发终端：** 在现成的 `workspace` 容器内运行 Artisan、Composer、Node 以及项目所需的任何命令行工具，宿主机上无需安装任何东西。
- **轻松切换版本：** 在同一个地方切换 PHP（5.6–8.5）、数据库或其他服务的版本。
- **与项目无关：** 适用于 Laravel、Symfony、WordPress、Drupal、Magento 或原生 PHP。
- **跨平台：** 在 Linux、macOS 和 Windows 上提供完全一致的环境。
- **模块化：** 只运行你需要的容器，任意组合。
- **新手友好：** 克隆仓库、复制 env 文件、运行 `docker compose up` 即可。

### Workspace：你的一体化开发终端

一个预装了 PHP、Composer、Node、Git 以及数十种开发工具的命令行环境，让你在*容器内*运行项目所需的一切命令，而不必在自己的机器上安装任何东西。

进入容器，在里面工作：

```bash
docker-compose exec workspace bash
```

`artisan`、`composer`、`phpunit`、`npm`、`git` 全部开箱即用，宿主机无需安装 PHP、Composer、Node，也不会有版本冲突。停止项目后，**你的设备上不会留下任何痕迹。**

为什么这很重要：

- **秒级启动。** 所有工具都已安装配置完毕，无需任何设置；克隆项目即可开始工作。
- **保持机器纯净。** 一切都在容器内运行；宿主机永远不会被装上 PHP、Composer、Node 或任何 CLI 工具，结束后也不会留下任何痕迹。
- **隔离每个项目。** 每个项目运行在各自的 PHP 和数据库版本上，彼此互不冲突。
- **复活老项目。** 在旧版 PHP（5.6、7.x）上运行历史项目，而不影响你系统本身的 PHP 版本。

---

## 联系方式

有问题、发现了 bug，或需要点什么？**mahmoud@zalt.me**

如有安全漏洞，请查看 [SECURITY.md](SECURITY.md)。

## 许可证

[MIT](https://github.com/laradock/laradock/blob/master/LICENSE) © [Mahmoud Zalt](https://zalt.me/)
