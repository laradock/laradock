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

<p align="center"><b>Entorno de desarrollo PHP completo basado en Docker.</b></p>

<p align="center">
  🌐 <b>Idiomas:</b> <a href="./README.md">English</a> · <a href="./README-zh.md">简体中文</a> · <a href="./README-ar.md">العربية</a> · <b>Español</b>
</p>

<p align="center">
    <a href="https://zalt.me"><img src="http://forthebadge.com/images/badges/built-by-developers.svg" alt="forthebadge" width="180"></a>
</p>

<br>
<br>

<h2 align="center" style="color:#7d58c2">¡Usa Docker primero, apréndelo después!</h2>

## Descripción general

Laradock es un entorno de desarrollo PHP completo para Docker. Incluye contenedores preconfigurados y listos para usar con todo lo que necesita una aplicación PHP (Nginx, PHP-FPM, MySQL, PostgreSQL, Redis y muchos más), para que puedas levantar un stack local completo en segundos sin ninguna configuración manual.

Funciona con **cualquier proyecto PHP** y se comporta igual en Linux, macOS y Windows.

### Requisitos

- [Docker](https://www.docker.com/products/docker-desktop/)
- [Git](https://git-scm.com/downloads)

### Inicio rápido

Configura un stack de demostración con `PHP`, `NGINX`, `MySQL`, `Redis` y `Composer`:

1 - Clona Laradock dentro de tu proyecto PHP:

```shell
git clone https://github.com/Laradock/laradock.git
```

2 - Entra en la carpeta laradock y renombra `.env.example` a `.env`.

```shell
cp .env.example .env
```

3 - Ejecuta los contenedores:

```shell
docker-compose up -d workspace nginx mysql redis
```

4 - Abre el archivo `.env` de tu proyecto y configura lo siguiente:

```shell
DB_HOST=mysql
REDIS_HOST=redis
QUEUE_HOST=beanstalkd
```

5 - Abre el navegador y visita localhost: `http://localhost`.

Listo.

### Elige tu stack

El inicio rápido de arriba ejecuta una combinación fija. Puedes cambiarla por cualquiera de estos servicios:

`nginx`, `apache2`, `caddy`, `php-fpm`, `mysql`, `postgres`, `mariadb`, `mongo`, `redis`, `memcached`, `rabbitmq`, `beanstalkd`, `workspace`, y más.

```shell
docker-compose up -d workspace apache2 postgres redis
```

### Comandos básicos

- Listar contenedores en ejecución: `docker-compose ps`
- Ver los logs de un contenedor: `docker logs {container-name}`
- Detener todos los contenedores: `docker-compose stop`
- Eliminar todos los contenedores: `docker-compose down`

### Compatible con

Laradock proporciona el runtime de PHP, el servidor web, las bases de datos y los servicios en segundo plano que necesita tu aplicación, por lo que puede ejecutar prácticamente cualquier framework PHP, CMS o plataforma de comercio electrónico:

- **Frameworks:** Laravel, Symfony, CodeIgniter, Yii, Laminas (Zend Framework), CakePHP, Phalcon, Slim, Lumen, FuelPHP
- **CMS:** WordPress, Drupal, Joomla, October CMS, Statamic, Craft CMS, TYPO3, Concrete CMS, Grav
- **Comercio electrónico:** Magento, WooCommerce, PrestaShop, OpenCart, Sylius, Bagisto
- **Aplicaciones:** Moodle, MediaWiki, phpBB, Matomo

…o PHP puro, sin ningún framework.

### Características principales

- **Stack preconfigurado:** más de 70 contenedores listos para usar (Nginx, Apache, Caddy, PHP-FPM, MySQL, PostgreSQL, MariaDB, MongoDB, Redis, Memcached, Elasticsearch, RabbitMQ, Beanstalkd y más).
- **Terminal de desarrollo todo en uno:** ejecuta Artisan, Composer, Node y cualquier CLI que necesite tu proyecto dentro del contenedor `workspace` ya preparado, sin instalar nada en tu equipo.
- **Cambio de versión sencillo:** cambia la versión de PHP (5.6–8.5), la base de datos o los servicios desde un solo lugar.
- **Independiente del proyecto:** funciona con Laravel, Symfony, WordPress, Drupal, Magento o PHP puro.
- **Multiplataforma:** el mismo entorno en Linux, macOS y Windows.
- **Modular:** ejecuta solo los contenedores que necesites, en cualquier combinación.
- **Apto para principiantes:** clona el repositorio, copia el archivo env y ejecuta `docker compose up`.

### Workspace: tu terminal de desarrollo todo en uno

Una línea de comandos precargada con PHP, Composer, Node, Git y decenas de herramientas de desarrollo, para que ejecutes *dentro* de ella cada comando que necesite tu proyecto sin instalar nada en tu propio equipo.

Entra y trabaja desde ahí:

```bash
docker-compose exec workspace bash
```

`artisan`, `composer`, `phpunit`, `npm` y `git` funcionan sin más, sin nada instalado en tu equipo: sin PHP, sin Composer, sin Node, sin conflictos de versiones. Al detener el proyecto, **no queda ningún rastro en tu dispositivo.**

Por qué esto importa:

- **Empieza en segundos.** Cada herramienta ya está instalada y configurada, así que no hay nada que preparar; clona un proyecto y ponte a trabajar.
- **Mantén tu equipo impecable.** Ejecuta todo dentro del contenedor; tu equipo nunca recibe PHP, Composer, Node ni ninguna CLI, y no queda nada al terminar.
- **Aísla cada proyecto.** Cada uno corre con sus propias versiones de PHP y base de datos, sin conflictos entre ellos.
- **Revive proyectos antiguos.** Ejecuta aplicaciones heredadas en versiones antiguas de PHP (5.6, 7.x) sin tocar la versión de PHP de tu sistema.

---

## Contacto

¿Tienes una pregunta, encontraste un problema o necesitas algo? **mahmoud@zalt.me**

Para vulnerabilidades de seguridad, consulta [SECURITY.md](SECURITY.md).

## Licencia

[MIT](https://github.com/laradock/laradock/blob/master/LICENSE) © [Mahmoud Zalt](https://zalt.me/)
