---
title: Documentation
type: index
weight: 3
---






<a name="List-current-running-Containers"></a>
## List current running Containers
```bash
docker ps
```
You can also use the following command if you want to see only this project containers:

```bash
docker-compose ps
```






<br>
<a name="Close-all-running-Containers"></a>
## Close all running Containers
```bash
docker-compose stop
```

To stop single container do:

```bash
docker-compose stop {container-name}
```






<br>
<a name="Delete-all-existing-Containers"></a>
## Delete all existing Containers
```bash
docker-compose down
```






<br>
<a name="Enter-Container"></a>
## Enter a Container

> Run commands in a running Container.

1 - First list the currently running containers with `docker ps`

2 - Enter any container using:

```bash
docker-compose exec {container-name} bash
```

*Example: enter MySQL container*

```bash
docker-compose exec mysql bash
```

*Example: enter to MySQL prompt within MySQL container*

```bash
docker-compose exec mysql mysql -udefault -psecret
```

3 - To exit a container, type `exit`.






<br>
<a name="Edit-Container"></a>
## Edit default Container config

Open the `docker-compose.yml` and change anything you want.

Examples:

Change MySQL Database Name:

```yml
    environment:
        MYSQL_DATABASE: laradock
    ...
```

Change Redis default port to 1111:

```yml
    ports:
        - "1111:6379"
    ...
```






<br>
<a name="Edit-a-Docker-Image"></a>
## Edit a Docker Image

1 - Find the `Dockerfile` of the image you want to edit,
<br>
example for `mysql` it will be `mysql/Dockerfile`.

2 - Edit the file the way you want.

3 - Re-build the container:

```bash
docker-compose build mysql
```
More info on Containers rebuilding [here](#Build-Re-build-Containers).







<br>
<a name="Build-Re-build-Containers"></a>
## Build/Re-build Containers

If you do any change to any `Dockerfile` make sure you run this command, for the changes to take effect:

```bash
docker-compose build
```
Optionally you can specify which container to rebuild (instead of rebuilding all the containers):

```bash
docker-compose build {container-name}
```

You might use the `--no-cache` option if you want full rebuilding (`docker-compose build --no-cache {container-name}`).






<br>
<a name="Add-Docker-Images"></a>
## Add more Docker Images

To add an image (software), just edit the `docker-compose.yml` and add your container details, to do so you need to be familiar with the [docker compose file syntax](https://docs.docker.com/compose/compose-file/).






<br>
<a name="View-the-Log-files"></a>
## View the Log files
The NGINX Log file is stored in the `logs/nginx` directory.

However to view the logs of all the other containers (MySQL, PHP-FPM,...) you can run this:

```bash
docker-compose logs {container-name}
```

```bash
docker-compose logs -f {container-name}
```

More [options](https://docs.docker.com/compose/reference/logs/)






<br>

<a name="PHP"></a>






<a name="Install-PHP-Extensions"></a>
## Install PHP Extensions

You can set extensions to install in the .env file's corresponding section (`PHP_FPM`, `WORKSPACE`, `PHP_WORKER`), 
just change the `false` to `true` at the desired extension's line.
After this you have to rebuild the container with the `--no-cache` option.

```bash
docker build --no-cache {container-name}
```







<br>

<a name="Change-the-PHP-FPM-Version"></a>
## Change the (PHP-FPM) Version

By default, the latest stable PHP version is configured to run.

>The PHP-FPM is responsible for serving your application code, you don't have to change the PHP-CLI version if you are planning to run your application on different PHP-FPM version.


### A) Switch from PHP `7.2` to PHP `5.6`

1 - Open the `.env`.

2 - Search for `PHP_VERSION`.

3 - Set the desired version number:

```dotenv
PHP_VERSION=5.6
```

4 - Finally rebuild the image

```bash
docker-compose build php-fpm
```

> For more details about the PHP base image, visit the [official PHP docker images](https://hub.docker.com/_/php/).






<br>
<a name="Change-the-PHP-CLI-Version"></a>
## Change the PHP-CLI Version

>Note: it's not very essential to edit the PHP-CLI version. The PHP-CLI is only used for the Artisan Commands & Composer. It doesn't serve your Application code, this is the PHP-FPM job.

The PHP-CLI is installed in the Workspace container. To change the PHP-CLI version you need to simply change the `PHP_VERSION` in the .env file as follow:

1 - Open the `.env`.

2 - Search for `PHP_VERSION`.

3 - Set the desired version number:

```dotenv
PHP_VERSION=7.2
```

4 - Finally rebuild the image

```bash
docker-compose build workspace
```



Change the PHP-CLI Version

<br>
<a name="Install-xDebug"></a>
## Install xDebug

1 - First install `xDebug` in the Workspace and the PHP-FPM Containers:
<br>
a) open the `.env` file
<br>
b) search for the `WORKSPACE_INSTALL_XDEBUG` argument under the Workspace settings
<br>
c) set it to `true`
<br>
d) search for the `PHP_FPM_INSTALL_XDEBUG` argument under the PHP-FPM settings
<br>
e) set it to `true`

2 - Re-build the containers `docker-compose build workspace php-fpm`

For information on how to configure xDebug with your IDE and work it out, check this [Repository](https://github.com/LarryEitel/laravel-laradock-phpstorm) or follow up on the next section if you use linux and PhpStorm.

```
###########################################################
################ Containers Customization #################
###########################################################

### WORKSPACE #############################################
...
WORKSPACE_INSTALL_XDEBUG=true
...
### PHP_FPM ###############################################
...
PHP_FPM_INSTALL_XDEBUG=true
...
```



<br>
<a name="Control-xDebug"></a>
## Start/Stop xDebug:

By installing xDebug, you are enabling it to run on startup by default.

To control the behavior of xDebug (in the `php-fpm` Container), you can run the following commands from the Laradock root folder, (at the same prompt where you run docker-compose):

- Stop xDebug from running by default: `.php-fpm/xdebug stop`.
- Start xDebug by default: `.php-fpm/xdebug start`.
- See the status: `.php-fpm/xdebug status`.

Note: If `.php-fpm/xdebug` doesn't execute and gives `Permission Denied` error the problem can be that file `xdebug` doesn't have execution access. This can be fixed by running `chmod` command with desired access permissions.



<br>
<a name="Install-pcov"></a>
## Install pcov

1 - First install `pcov` in the Workspace and the PHP-FPM Containers:
<br>
a) open the `.env` file
<br>
b) search for the `WORKSPACE_INSTALL_PCOV` argument under the Workspace Container
<br>
c) set it to `true`
<br>
d) search for the `PHP_FPM_INSTALL_PCOV` argument under the PHP-FPM Container
<br>
e) set it to `true`

2 - Re-build the containers `docker-compose build workspace php-fpm`

Note that pcov is only supported on PHP 7.1 or newer. For more information on setting up pcov optimally, check the recommended section
of the [README](https://github.com/krakjoe/pcov)



<br>
<a name="Install-phpdbg"></a>
## Install phpdbg

Install `phpdbg` in the Workspace and the PHP-FPM Containers:

<br>
1 - Open the `.env`.

2 - Search for `WORKSPACE_INSTALL_PHPDBG`.

3 - Set value to `true`

4 - Do the same for `PHP_FPM_INSTALL_PHPDBG`

```dotenv
WORKSPACE_INSTALL_PHPDBG=true
```
```dotenv
PHP_FPM_INSTALL_PHPDBG=true
```




<br>
<a name="Install-ionCube-Loader"></a>
## Install ionCube Loader

1 - First install `ionCube Loader` in the Workspace and the PHP-FPM Containers:
<br>
a) open the `.env` file
<br>
b) search for the `WORKSPACE_INSTALL_IONCUBE` argument under the Workspace Container
<br>
c) set it to `true`
<br>
d) search for the `PHP_FPM_INSTALL_IONCUBE` argument under the PHP-FPM Container
<br>
e) set it to `true`

2 - Re-build the containers `docker-compose build workspace php-fpm`

Always download the latest version of [Loaders for ionCube ](http://www.ioncube.com/loaders.php).





<br>
<a name="Install-Deployer"></a>
## Install Deployer

> A deployment tool for PHP.

1 - Open the `.env` file
<br>
2 - Search for the `WORKSPACE_INSTALL_DEPLOYER` argument under the Workspace Container
<br>
3 - Set it to `true`
<br>

4 - Re-build the containers `docker-compose build workspace`

[**Deployer Documentation Here**](https://deployer.org/docs/getting-started.html)



<br>
<a name="Install-SonarQube"></a>

## Install SonarQube

> An automatic code review tool.

SonarQube® is an automatic code review tool to detect bugs, vulnerabilities and code smells in your code. It can integrate with your existing workflow to enable continuous code inspection across your project branches and pull requests.
<br>
1 - Open the `.env` file
<br>
2 - Search for the `SONARQUBE_HOSTNAME=sonar.example.com` argument
<br>
3 - Set it to your-domain `sonar.example.com`
<br>
4 - `docker-compose up -d sonarqube`
<br>
5 - Open your browser: http://localhost:9000/

Troubleshooting:

if you encounter a database error:
```
docker-compose exec --user=root postgres
source docker-entrypoint-initdb.d/init_sonarqube_db.sh
```

If you encounter logs error:
```
docker-compose run --user=root --rm sonarqube chown sonarqube:sonarqube /opt/sonarqube/logs
```
[**SonarQube Documentation Here**](https://docs.sonarqube.org/latest/)





<br>
<a name="Production"></a>






<br>
<a name="Laradock-for-Production"></a>
## Prepare Laradock for Production

It's recommended for production to create a custom `docker-compose.yml` file, for example, `production-docker-compose.yml`

In your new production `docker-compose.yml` file, you should include only the containers you are planning to run in production (usage example: `docker-compose -f production-docker-compose.yml up -d nginx mysql redis ...`).

Note: The Database (MySQL/MariaDB/...) ports should not be forwarded on production, because Docker will automatically publish the port on the host unless specifically told not to.  Forwarding these ports on production is quite insecure - so make sure to remove these lines:

```
ports:
    - "3306:3306"
```

To learn more about how Docker publishes ports, please read [this excellent post on the subject](https://fralef.me/docker-and-iptables.html).









<br>
<a name="Laravel"></a>






<a name="Install-Laravel"></a>
## Install Laravel from Container

1 - First you need to enter the Workspace Container.

2 - Install Laravel.

Example using Composer

```bash
composer create-project laravel/laravel my-cool-app "5.2.*"
```

> We recommend using `composer create-project` instead of the Laravel installer, to install Laravel.

For more about the Laravel installation click [here](https://laravel.com/docs/master#installing-laravel).


3 - Edit `.env` to Map the new application path:

By default, Laradock assumes the Laravel application is living in the parent directory of the laradock folder.

Since the new Laravel application is in the `my-cool-app` folder, we need to replace `../:/var/www` with `../my-cool-app/:/var/www`, as follow:

```dotenv
  APP_CODE_PATH_HOST=../my-cool-app/
```
4 - Go to that folder and start working.

```bash
cd my-cool-app
```

5 - Go back to the Laradock installation steps to see how to edit the `.env` file.






<br>
<a name="Run-Artisan-Commands"></a>
## Run Artisan Commands

You can run artisan commands and many other Terminal commands from the Workspace container.

1 - Make sure you have the workspace container running.

```bash
docker-compose up -d workspace // ..and all your other containers
```

2 - Find the Workspace container name:

```bash
docker-compose ps
```

3 - Enter the Workspace container:

```bash
docker-compose exec workspace bash
```

Note: Should add `--user=laradock` (example `docker-compose exec --user=laradock workspace bash`) to have files created as your host's user to prevent issue owner of log file will be changed to root then laravel website cannot write on log file if using rotated log and new log file not existed


4 - Run anything you want :)

```bash
php artisan
```
```bash
composer update
```
```bash
phpunit
```
```
vue serve
```
(browse the results at `http://localhost:[WORKSPACE_VUE_CLI_SERVE_HOST_PORT]`)
```
vue ui
```
(browse the results at `http://localhost:[WORKSPACE_VUE_CLI_UI_HOST_PORT]`)




<br>
<a name="Run-Laravel-Queue-Worker"></a>
## Run Laravel Queue Worker

1 - Create a suitable configuration file (for example named `laravel-worker.conf`) for Laravel Queue Worker in `php-worker/supervisord.d/` by simply copying from `laravel-worker.conf.example`

2 - Start everything up

```bash
docker-compose up -d php-worker
```






<br>
<a name="Run-Laravel-Scheduler"></a>
## Run Laravel Scheduler

Laradock provides 2 ways to run Laravel Scheduler
1. Using cron in workspace container. 
Most of the time, when you start Laradock, it'll automatically start workspace container with cron inside, along with setting to run `schedule:run` command every minute.
2. Using Supervisord in php-worker to run `schedule:run`. 
This way is suggested when you don't want to start workspace in production environment.
   * Comment out cron setting in workspace container, file `workspace/crontab/laradock`
     ```bash
     # * * * * * laradock /usr/bin/php /var/www/artisan schedule:run >> /dev/null 2>&1
      ```
   * Create a suitable configuration file (for ex., named `laravel-scheduler.conf`) for Laravel Scheduler in `php-worker/supervisord.d/` by simply copying from `laravel-scheduler.conf.example`

   * Start php-worker container
     ```bash
     docker-compose up -d php-worker
     ```
<br>
<a name="Use-Browsersync-With-Laravel-Mix"></a>
## Use Browsersync

> Using Use Browsersync with Laravel Mix.

1. Add the following settings to your `webpack.mix.js` file. Please refer to Browsersync [Options](https://browsersync.io/docs/options) page for more options.

```
const mix = require('laravel-mix')

(...)

mix.browserSync({
  open: false,
  proxy: 'nginx' // replace with your web server container
})
```

2. Run `npm run watch` within your `workspace` container.

3. Open your browser and visit address `http://localhost:[WORKSPACE_BROWSERSYNC_HOST_PORT]`. It will refresh the page automatically whenever you edit any source file in your project.

4. If you wish to access Browsersync UI for your project, visit address `http://localhost:[WORKSPACE_BROWSERSYNC_UI_HOST_PORT]`.




<br>
<a name="Use-Mailu"></a>
## Use Mailu

1. You will need a registered domain.

2. Required RECAPTCHA for signup email [HERE](https://www.google.com/recaptcha/admin)

3. Modify following environment variable in `.env` file

```
MAILU_RECAPTCHA_PUBLIC_KEY=<YOUR_RECAPTCHA_PUBLIC_KEY>
MAILU_RECAPTCHA_PRIVATE_KEY=<YOUR_RECAPTCHA_PRIVATE_KEY>
MAILU_DOMAIN=laradock.io
MAILU_HOSTNAMES=mail.laradock.io
```

4. Open your browser and visit `http://YOUR_DOMAIN`.


<br>
<a name="Use-NetData"></a>
## Use NetData

1. Run the NetData Container (`netdata`) with the `docker-compose up` command. Example:

```bash
docker-compose up -d netdata
```

2. Open your browser and visit the localhost on port **19999**:  `http://localhost:19999`

<br>
<a name="Use-Metabase"></a>
## Use Metabase

1. Run the Metabase Container (`metabase`) with the `docker-compose up` command. Example:
   ```bash
   docker-compose up -d metabase
   ```
2. Open your browser and visit the localhost on port **3030**:  `http://localhost:3030`

3. You can use environment to configure Metabase container. See docs in: [Running Metabase on Docker](https://www.metabase.com/docs/v0.12.0/operations-guide/running-metabase-on-docker.html)





<br>
<a name="Use-Jenkins"></a>
## Use Jenkins

1) Boot the container `docker-compose up -d jenkins`. To enter the container type `docker-compose exec jenkins bash`.

2) Go to `http://localhost:8090/` (if you didn't change your default port mapping)

3) Authenticate from the web app.

- Default username is `admin`.
- Default password is `docker-compose exec jenkins cat /var/jenkins_home/secrets/initialAdminPassword`.

(To enter container as root type `docker-compose exec --user root jenkins bash`).

4) Install some plugins.

5) Create your first Admin user, or continue as Admin.

Note: to add user go to `http://localhost:8090/securityRealm/addUser` and to restart it from the web app visit `http://localhost:8090/restart`.

You may wanna change the default security configuration, so go to `http://localhost:8090/configureSecurity/` under Authorization and choosing "Anyone can do anything" or "Project-based Matrix Authorization Strategy" or anything else.






<br>
<a name="Use-Redis"></a>

## Use Redis

1. First make sure you run the Redis Container (`redis`) with the `docker-compose up` command.
   ```bash
   docker-compose up -d redis
   ```
   > To execute redis commands, enter the redis container first `docker-compose exec redis bash` then enter the `redis-cli`.

2. Open your Laravel's `.env` file and set the `REDIS_HOST` to `redis`
   ```env
   REDIS_HOST=redis
   ```
   If you're using Laravel, and you don't find the `REDIS_HOST` variable in your `.env` file. Go to the database configuration file `config/database.php` and replace the default `127.0.0.1` IP with `redis` for Redis like this:
    ```php
    'redis' => [
        'cluster' => false,
        'default' => [
            'host'     => 'redis',
            'port'     => 6379,
            'database' => 0,
        ],
    ],
    ```
3. To enable Redis Caching and/or for Sessions Management. Also from the `.env` file set `CACHE_DRIVER` and `SESSION_DRIVER` to `redis` instead of the default `file`.
   ```env
   CACHE_DRIVER=redis
   SESSION_DRIVER=redis
   ```
4. Finally make sure you have the `predis/predis` package `(~1.0)` installed via Composer:
   ```bash
   composer require predis/predis:^1.0
   ```
5. You can manually test it from Laravel with this code:
   ```php
   \Cache::store('redis')->put('Laradock', 'Awesome', 10);
   ```





<br>
<a name="Use-Redis-Cluster"></a>
## Use Redis Cluster
1. First make sure you run the Redis-Cluster Container (`redis-cluster`) with the `docker-compose up` command.
   ```bash
   docker-compose up -d redis-cluster
   ```
2. Open your Laravel's `config/database.php` and set the redis cluster configuration. Below is example configuration with phpredis.
   Read the [Laravel official documentation](https://laravel.com/docs/5.7/redis#configuration) for more details.
    ```php
    'redis' => [
        'client' => 'phpredis',
        'options' => [
            'cluster' => 'redis',
        ],
        'clusters' => [
            'default' => [
                [
                    'host' => 'redis-cluster',
                    'password' => null,
                    'port' => 7000,
                    'database' => 0,
                ],
            ],
        ],
    ],
    ```

<br>
<a name="Use-Varnish"></a>

## Use Varnish

The goal was to proxy the request to varnish server using nginx. So only nginx has been configured for Varnish proxy.
Nginx is on port 80 or 443. Nginx sends request through varnish server and varnish server sends request back to nginx on port 81 (external port is defined in `VARNISH_BACKEND_PORT`).

The idea was taken from this [post](https://www.linode.com/docs/websites/varnish/use-varnish-and-nginx-to-serve-wordpress-over-ssl-and-http-on-debian-8/)

The Varnish configuration was developed and tested for Wordpress only. Probably it works with other systems.

#### Steps to configure varnish proxy server:
1. You have to set domain name for VARNISH_PROXY1_BACKEND_HOST variable.
2. If you want to use varnish for different domains, you have to add new configuration section in your env file.
    ```
    VARNISH_PROXY1_CACHE_SIZE=128m
    VARNISH_PROXY1_BACKEND_HOST=replace_with_your_domain.name
    VARNISH_PROXY1_SERVER=SERVER1
    ```
3. Then you have to add new config section into docker-compose.yml with related variables:
    ```
    custom_proxy_name:
          container_name: custom_proxy_name
          build: ./varnish
          expose:
            - ${VARNISH_PORT}
          environment:
            - VARNISH_CONFIG=${VARNISH_CONFIG}
            - CACHE_SIZE=${VARNISH_PROXY2_CACHE_SIZE}
            - VARNISHD_PARAMS=${VARNISHD_PARAMS}
            - VARNISH_PORT=${VARNISH_PORT}
            - BACKEND_HOST=${VARNISH_PROXY2_BACKEND_HOST}
            - BACKEND_PORT=${VARNISH_BACKEND_PORT}
            - VARNISH_SERVER=${VARNISH_PROXY2_SERVER}
          ports:
            - "${VARNISH_PORT}:${VARNISH_PORT}"
          links:
            - workspace
          networks:
            - frontend
    ```
4. change your varnish config and add nginx configuration. Example Nginx configuration is here: `nginx/sites/laravel_varnish.conf.example`.
5. `varnish/default.vcl` is old varnish configuration, which was used in the previous version. Use `default_wordpress.vcl` instead.

#### How to run:
1. Rename `default_wordpress.vcl` to `default.vcl`
2. `docker-compose up -d nginx`
3. `docker-compose up -d proxy`

Keep in mind that varnish server must be built after Nginx cause varnish checks domain affordability.

#### FAQ:

1. How to purge cache? <br>
run from any cli: <br>`curl -X PURGE https://yourwebsite.com/`.
2. How to reload varnish?<br>
`docker container exec proxy varnishreload`
3. Which varnish commands are allowed?
    - varnishadm
    - varnishd
    - varnishhist
    - varnishlog
    - varnishncsa
    - varnishreload
    - varnishstat
    - varnishtest
    - varnishtop
4. How to reload Nginx?<br>
`docker exec Nginx nginx -t`<br>
`docker exec Nginx nginx -s reload`

<br>
<a name="Use-Mongo"></a>

## Use Mongo
1. First install `mongo` in the Workspace and the PHP-FPM Containers:
   * open the `.env` file
   * search for the `WORKSPACE_INSTALL_MONGO` argument under the Workspace Container
   * set it to `true`
   * search for the `PHP_FPM_INSTALL_MONGO` argument under the PHP-FPM Container
   * set it to `true`
2. Re-build the containers 
   * `docker-compose build workspace php-fpm`
3. Run the MongoDB Container (`mongo`) with the `docker-compose up` command.
    ```bash
    docker-compose up -d mongo
    ```
4. Add the MongoDB configurations to the `config/database.php` configuration file:
    ```php
    'connections' => [
    
        'mongodb' => [
            'driver'   => 'mongodb',
            'host'     => env('DB_HOST', 'localhost'),
            'port'     => env('DB_PORT', 27017),
            'database' => env('DB_DATABASE', 'database'),
            'username' => '',
            'password' => '',
            'options'  => [
                'database' => '',
            ]
        ],
    
    	// ...
    
    ],
    ```

5 - Open your Laravel's `.env` file and update the following variables:

- set the `DB_HOST` to your `mongo`.
- set the `DB_PORT` to `27017`.
- set the `DB_DATABASE` to `database`.


6 - Finally make sure you have the `jenssegers/mongodb` package installed via Composer and its Service Provider is added.

```bash
composer require jenssegers/mongodb
```
More details about this [here](https://github.com/jenssegers/laravel-mongodb#installation).

7 - Test it:

- First, let your Models extend from the Mongo Eloquent Model. Check the [documentation](https://github.com/jenssegers/laravel-mongodb#eloquent).
- Enter the Workspace Container.
- Migrate the Database `php artisan migrate`.






<br>
<a name="Use-phpMyAdmin"></a>
## Use PhpMyAdmin
1. Run the phpMyAdmin Container (`phpmyadmin`) with the `docker-compose up` command.
    ```bash
    # use with mysql
    docker-compose up -d mysql phpmyadmin

    # use with mariadb
    docker-compose up -d mariadb phpmyadmin
    ```
    *Note: To use with MariaDB, open `.env` and set `PMA_DB_ENGINE=mysql` to `PMA_DB_ENGINE=mariadb`.*
2. Open your browser and visit the localhost on port **8081**:  `http://localhost:8081`, use server: "mysql", user: "default" and password: "secret for the default mysql setup.  





<br>
<a name="Use-Gitlab"></a>
## Use Gitlab
1. Run the Gitlab Container (`gitlab`) with the `docker-compose up` command. Example:
    ```bash
    docker-compose up -d gitlab
    ```
2. Open your browser and visit the localhost on port **8989**:  `http://localhost:8989`
*Note: You may change GITLAB_DOMAIN_NAME to your own domain name like `http://gitlab.example.com` default is `http://localhost`*






<br>
<a name="Use-Gitlab-Runner"></a>
## Use Gitlab Runner
1. Retrieve the registration token in your gitlab project (Settings > CI / CD > Runners > Set up a specific Runner manually)
2. Open the `.env` file and set the following changes:
    ```
    # so that gitlab container will pass the correct domain to gitlab-runner container
    GITLAB_DOMAIN_NAME=http://gitlab

    GITLAB_RUNNER_REGISTRATION_TOKEN=<value-in-step-1>

    # so that gitlab-runner container will send POST request for registration to correct domain
    GITLAB_CI_SERVER_URL=http://gitlab
    ```
3. Open the `docker-compose.yml` file and add the following changes:
    ```yml
        gitlab-runner:
          environment: # these values will be used during `gitlab-runner register`
            - RUNNER_EXECUTOR=docker # change from shell (default)
            - DOCKER_IMAGE=alpine
            - DOCKER_NETWORK_MODE=laradock_backend
          networks:
            - backend # connect to network where gitlab service is connected
    ```
4. Run the Gitlab-Runner Container (`gitlab-runner`) with the `docker-compose up` command. Example:
    ```bash
    docker-compose up -d gitlab-runner
    ```
5. Register the gitlab-runner to the gitlab container
    ```bash
    docker-compose exec gitlab-runner bash
    gitlab-runner register
    ```

6. Create a `.gitlab-ci.yml` file for your pipeline
    ```yml
    before_script:
      - echo Hello!
    
    job1:
      scripts:
        - echo job1
    ```
7. Push changes to gitlab
8. Verify that pipeline is run successful




<br>
<a name="Use-Adminer"></a>
## Use Adminer

1. Run the Adminer Container (`adminer`) with the `docker-compose up` command. Example:
    ```bash
    docker-compose up -d adminer
    ```
2. Open your browser and visit the localhost on port **8080**:  `http://localhost:8080`

#### Additional Notes

- You can load plugins in the `ADM_PLUGINS` variable in the `.env` file. If a plugin requires parameters to work correctly you will need to add a custom file to the container. [Find more info in section 'Loading plugins'](https://hub.docker.com/_/adminer).

- You can choose a design in the `ADM_DESIGN` variable in the `.env` file. [Find more info in section 'Choosing a design'](https://hub.docker.com/_/adminer).

- You can specify the default host with the `ADM_DEFAULT_SERVER` variable in the `.env` file. This is useful if you are connecting to an external server or a docker container named something other than the default `mysql`.





<br>
<a name="Use-Portainer"></a>
## Use Portainer
1. Run the Portainer Container (`portainer`) with the `docker-compose up` command. Example:
    ```bash
    docker-compose up -d portainer
    ```
2. Open your browser and visit the localhost on port **9010**:  `http://localhost:9010`






<br>
<a name="Use-pgAdmin"></a>
## Use PgAdmin
1. Run the pgAdmin Container (`pgadmin`) with the `docker-compose up` command. Example:
    ```bash
    docker-compose up -d postgres pgadmin
    ```
2. Open your browser and visit the localhost on port **5050**:  `http://localhost:5050`
3. At login page use default credentials:
    Username : pgadmin4@pgadmin.org
    Password : admin





<br>
<a name="Use-Beanstalkd"></a>
## Use Beanstalkd
1. Run the Beanstalkd Container:
    ```bash
    docker-compose up -d beanstalkd
    ```
2. Configure Laravel to connect to that container by editing the `config/queue.php` config file.
    * first set `beanstalkd` as default queue driver
    * set the queue host to beanstalkd : `QUEUE_HOST=beanstalkd`
    *beanstalkd is now available on default port `11300`.*
3. Require the dependency package [pda/pheanstalk](https://github.com/pda/pheanstalk) using composer.
    Optionally you can use the Beanstalkd Console Container to manage your Queues from a web interface.
    * Run the Beanstalkd Console Container:
    ```bash
    docker-compose up -d beanstalkd-console
    ```
    * Open your browser and visit `http://localhost:2080/`
    _Note: You can customize the port on which beanstalkd console is listening by changing `BEANSTALKD_CONSOLE_HOST_PORT` in `.env`. The default value is *2080*._

    * Add the server
        - Host: beanstalkd
        - Port: 11300
4. Done




<br>
<a name="Use-Confluence"></a>

## Use Confluence
1. Run the Confluence Container (`confluence`) with the `docker-compose up` command. Example:
   ```bash
   docker-compose up -d confluence
   ```

2 - Open your browser and visit the localhost on port **8090**:  `http://localhost:8090`

**Note:** Confluence is a licensed application - an evaluation licence can be obtained from Atlassian.

You can set custom confluence version in `CONFLUENCE_VERSION`. [Find more info in section 'Versioning'](https://hub.docker.com/r/atlassian/confluence-server/)


##### Confluence usage with Nginx and SSL.

1. Find an instance configuration file in `nginx/sites/confluence.conf.example` and replace sample domain with yours.

2. Configure ssl keys to your domain.

Keep in mind that Confluence is still accessible on 8090 anyway.

<br>
<a name="Use-ElasticSearch"></a>
## Use ElasticSearch

1 - Run the ElasticSearch Container (`elasticsearch`) with the `docker-compose up` command:

```bash
docker-compose up -d elasticsearch
```

2 - Open your browser and visit the localhost on port **9200**:  `http://localhost:9200`

> The default username is `elastic` and the default password is `changeme`.

### Install ElasticSearch Plugin

1. Install an ElasticSearch plugin.
   ```bash
   docker-compose exec elasticsearch /usr/share/elasticsearch/bin/plugin install {plugin-name}
   ```
2. Restart elasticsearch container
   ```bash
   docker-compose restart elasticsearch
   ```


<br>
<a name="Use-MeiliSearch"></a>
## Use MeiliSearch

1 - Run the MeiliSearch Container (`meilisearch`) with the `docker-compose up` command. Example:

```bash
docker-compose up -d meilisearch
```

2 - Open your browser and visit the localhost on port **7700** at the following URL:  `http://localhost:7700`

> The private API key is `masterkey`



<br>
<a name="Use-Selenium"></a>
## Use Selenium
1. Run the Selenium Container (`selenium`) with the `docker-compose up` command. Example:
   ```bash
   docker-compose up -d selenium
   ```
2. Open your browser and visit the localhost on port **4444** at the following URL:  `http://localhost:4444/wd/hub`






<br>
<a name="Use-RethinkDB"></a>
## Use RethinkDB

The RethinkDB is an open-source Database for Real-time Web ([RethinkDB](https://rethinkdb.com/)).
A package ([Laravel RethinkDB](https://github.com/duxet/laravel-rethinkdb)) is being developed and was released a version for Laravel 5.2 (experimental).

1. Run the RethinkDB Container (`rethinkdb`) with the `docker-compose up` command.
    ```bash
    docker-compose up -d rethinkdb
    ```

2. Access the RethinkDB Administration Console [http://localhost:8090/#tables](http://localhost:8090/#tables) for create a database called `database`.

3. Add the RethinkDB configurations to the `config/database.php` configuration file:
    ```php
    'connections' => [
    
    	'rethinkdb' => [
    		'name'      => 'rethinkdb',
    		'driver'    => 'rethinkdb',
    		'host'      => env('DB_HOST', 'rethinkdb'),
    		'port'      => env('DB_PORT', 28015),
    		'database'  => env('DB_DATABASE', 'test'),
    	]
    
    	// ...
    
    ],
    ```

4. Open your Laravel's `.env` file and update the following variables:
    - set the `DB_CONNECTION` to your `rethinkdb`.
    - set the `DB_HOST` to `rethinkdb`.
    - set the `DB_PORT` to `28015`.
    - set the `DB_DATABASE` to `database`.


#### Additional Notes

- You may do backing up of your data using the next reference: [backing up your data](https://www.rethinkdb.com/docs/backup/).


<br>
<a name="Use-Minio"></a>
## Use Minio

1. Configure Minio:
   - You can change some settings in the `.env` file (`MINIO_*`)
   - You can install Minio Client on the workspace container: `WORKSPACE_INSTALL_MC=true`

2. Run the Minio Container (`minio`) with the `docker-compose up` command. Example:
    ```bash
    docker-compose up -d minio
    ```

3. Open your browser and visit the localhost on port **9000** at the following URL:  `http://localhost:9000`
4. Create a bucket either through the webui or using the Minio Client:
    ```bash
    mc mb minio/bucket
    ```
5. When configuring your other clients use the following details:
    ```
    AWS_URL=http://minio:9000
    AWS_ACCESS_KEY_ID=access
    AWS_SECRET_ACCESS_KEY=secretkey
    AWS_DEFAULT_REGION=us-east-1
    AWS_BUCKET=test
    AWS_USE_PATH_STYLE_ENDPOINT=true
    ```

6. In `filesystems.php` you should use the following details (s3):
    ```php
    's3' => [
        'driver' => 's3',
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION'),
        'bucket' => env('AWS_BUCKET'),
        'endpoint' => env('AWS_URL'),
        'use_path_style_endpoint' => env('AWS_USE_PATH_STYLE_ENDPOINT', false)
    ],
    ```
   
`AWS_USE_PATH_STYLE_ENDPOINT` should set to true only for local purpose 





<br>
<a name="Use-Thumbor"></a>
## Use Thumbor

Thumbor is a smart imaging service. It enables on-demand crop, resizing and flipping of images. ([Thumbor](https://github.com/thumbor/thumbor))

1 - Configure Thumbor:
  - Checkout all the options under the thumbor settings


2 - Run the Thumbor Container (`minio`) with the `docker-compose up` command. Example:

```bash
docker-compose up -d thumbor
```

3 - Navigate to an example image on `http://localhost:8000/unsafe/300x300/i.imgur.com/bvjzPct.jpg`

For more documentation on Thumbor visit the [Thumbor documenation](http://thumbor.readthedocs.io/en/latest/index.html) page


<br>
<a name="Use-AWS"></a>
## Use AWS

1 - Configure AWS:
  - make sure to add your SSH keys in aws-eb-cli/ssh_keys folder

2 - Run the Aws Container (`aws`) with the `docker-compose up` command. Example:

```bash
docker-compose up -d aws
```

3 - Access the aws container with `docker-compose exec aws bash`

4 - To start using eb cli inside the container, initialize your project first by doing 'eb init'. Read the [aws eb cli](http://docs.aws.amazon.com/elasticbeanstalk/latest/dg/eb-cli3-configuration.html) docs for more details.






<br>
<a name="Use-Grafana"></a>
## Use Grafana

1 - Configure Grafana: Change Port using `GRAFANA_PORT` if you wish to. Default is port 3000.

2 - Run the Grafana Container (`grafana`) with the `docker-compose up`command:

```bash
docker-compose up -d grafana
```

3 - Open your browser and visit the localhost on port **3000** at the following URL: `http://localhost:3000`

4 - Login using the credentials User = `admin`, Password = `admin`. Change the password in the web interface if you want to.






<br>
<a name="Use-Graylog"></a>
## Use Graylog

1 - Boot the container `docker-compose up -d graylog`

2 - Open your Laravel's `.env` file and set the `GRAYLOG_PASSWORD` to some passsword, and `GRAYLOG_SHA256_PASSWORD` to the sha256 representation of your password (`GRAYLOG_SHA256_PASSWORD` is what matters, `GRAYLOG_PASSWORD` is just a reminder of your password).

> Your password must be at least 16 characters long
> You can generate sha256 of some password with the following command `echo -n somesupersecretpassword | sha256sum`

```env
GRAYLOG_PASSWORD=somesupersecretpassword
GRAYLOG_SHA256_PASSWORD=b1cb6e31e172577918c9e7806c572b5ed8477d3f57aa737bee4b5b1db3696f09
```

3 - Go to `http://localhost:9000/` (if your port is not changed)

4 - Authenticate from the app.

> Username: admin
> Password: somesupersecretpassword (if you haven't changed the password)

5 - Go to the system->inputs and launch new input






<br>
<a name="Use-Traefik"></a>
## Use Traefik

To use Traefik you need to do some changes in `.env` and `docker-compose.yml`.

1 - Open `.env` and change `ACME_DOMAIN` to your domain and `ACME_EMAIL` to your email.

2 - You need to change the `docker-compose.yml` file to match the Traefik needs. If you want to use Traefik, you must not expose the ports of each container to the internet, but specify some labels.

2.1 For example, let's try with NGINX. You must have:

```bash
nginx:
  build:
    context: ./nginx
    args:
      - PHP_UPSTREAM_CONTAINER=${NGINX_PHP_UPSTREAM_CONTAINER}
      - PHP_UPSTREAM_PORT=${NGINX_PHP_UPSTREAM_PORT}
      - CHANGE_SOURCE=${CHANGE_SOURCE}
  volumes:
    - ${APP_CODE_PATH_HOST}:${APP_CODE_PATH_CONTAINER}
    - ${NGINX_HOST_LOG_PATH}:/var/log/nginx
    - ${NGINX_SITES_PATH}:/etc/nginx/sites-available
  depends_on:
    - php-fpm
  networks:
    - frontend
    - backend
  labels:
    - "traefik.enable=true"
    - "traefik.http.services.nginx.loadbalancer.server.port=80"
    # https router
    - "traefik.http.routers.https.rule=Host(`${ACME_DOMAIN}`, `www.${ACME_DOMAIN}`)"
    - "traefik.http.routers.https.entrypoints=https"
    - "traefik.http.routers.https.middlewares=www-redirectregex"
    - "traefik.http.routers.https.service=nginx"
    - "traefik.http.routers.https.tls.certresolver=letsencrypt"
    # http router
    - "traefik.http.routers.http.rule=Host(`${ACME_DOMAIN}`, `www.${ACME_DOMAIN}`)"
    - "traefik.http.routers.http.entrypoints=http"
    - "traefik.http.routers.http.middlewares=http-redirectscheme"
    - "traefik.http.routers.http.service=nginx"
    # middlewares
    - "traefik.http.middlewares.www-redirectregex.redirectregex.permanent=true"
    - "traefik.http.middlewares.www-redirectregex.redirectregex.regex=^https://www.(.*)"
    - "traefik.http.middlewares.www-redirectregex.redirectregex.replacement=https://$$1"
    - "traefik.http.middlewares.http-redirectscheme.redirectscheme.permanent=true"
    - "traefik.http.middlewares.http-redirectscheme.redirectscheme.scheme=https"
```

instead of

```bash
nginx:
  build:
    context: ./nginx
    args:
      - PHP_UPSTREAM_CONTAINER=${NGINX_PHP_UPSTREAM_CONTAINER}
      - PHP_UPSTREAM_PORT=${NGINX_PHP_UPSTREAM_PORT}
      - CHANGE_SOURCE=${CHANGE_SOURCE}
  volumes:
    - ${APP_CODE_PATH_HOST}:${APP_CODE_PATH_CONTAINER}
    - ${NGINX_HOST_LOG_PATH}:/var/log/nginx
    - ${NGINX_SITES_PATH}:/etc/nginx/sites-available
    - ${NGINX_SSL_PATH}:/etc/nginx/ssl
  ports:
    - "${NGINX_HOST_HTTP_PORT}:80"
    - "${NGINX_HOST_HTTPS_PORT}:443"
  depends_on:
    - php-fpm
  networks:
    - frontend
    - backend
```





<br>
<a name="Use-Mosquitto"></a>
## Use Mosquitto (MQTT Broker)

1 - Configure Mosquitto: Change Port using `MOSQUITTO_PORT` if you wish to. Default is port 9001.

2 - Run the Mosquitto Container (`mosquitto`) with the `docker-compose up`command:

```bash
docker-compose up -d mosquitto
```

3 - Open your command line and use a MQTT Client (Eg. https://github.com/mqttjs/MQTT.js) to subscribe a topic and publish a message.

4 - Subscribe: `mqtt sub -t 'test' -h localhost -p 9001 -C 'ws' -v`

5 - Publish: `mqtt pub -t 'test' -h localhost -p 9001 -C 'ws' -m 'Hello!'`


<br>
<a name="Use-Tarantool"></a>
## Use Tarantool (+ Admin panel)

1 - Configure Tarantool Port and Tarantool Admin Port using environment variables: `TARANTOOL_PORT` and `TARANTOOL_ADMIN_PORT`. Default ports are 3301 and 8002.

2 - Run the Tarantool and Tarantool Admin tool using `docker-compose up`command:

```bash
docker-compose up -d tarantool tarantool-admin
```

3 - You can open admin tool visiting localhost:8002

4 - There you should set `Hostname` with the value `tarantool` 

5 - After that your tarantool data will be available inside admin panel.

6 - Also you can connect to tarantool server in console mode with this command:

```bash
docker-compose exec tarantool console
```

7 - There you can operate with tarantool database ([official documentation](https://www.tarantool.io/en/doc/latest/) can be helpful).


<br>
<a name="use Keycloak"></a>
## Use Keycloak

1. Run the Keycloak Container (`keycloak`) with the `docker-compose up` command. Example:

```bash
docker-compose up -d keycloak
```

2. Open your browser and visit the localhost on port 8081:  `http://localhost:8081`

3. Login with the following credentials:

    - Username: `admin`
    - Password: `secret`


<br>
<a name="use Mailpit"></a>
## Use Mailpit

1. Run the Mailpit Container (`mailpit`) with the `docker-compose up` command. Example:

```bash
docker-compose up -d mailpit
```

2. Open your browser and visit the localhost on port 8125:  `http://localhost:8125`
3. Setup config in your Laravel project’s .env file
```text
MAIL_MAILER=smtp
MAIL_HOST=mailpit
MAIL_PORT=1125
MAIL_USERNAME=null
MAIL_PASSWORD=null
```



<br>
<a name="CodeIgniter"></a>






<br>
<a name="Install-CodeIgniter"></a>
## Install CodeIgniter

To install CodeIgniter 3 on Laradock all you have to do is the following simple steps:

1 - Open the `docker-compose.yml` file.

2 - Change `CODEIGNITER=false` to `CODEIGNITER=true`.

3 - Re-build your PHP-FPM Container `docker-compose build php-fpm`.






<br>
<a name="Install-Powerline"></a>
## Install Powerline

1 - Open the `.env` file and set `WORKSPACE_INSTALL_POWERLINE` and `WORKSPACE_INSTALL_PYTHON` to `true`.

2 - Run `docker-compose build workspace`, after the step above.

Powerline is required python






<br>
<a name="Install-Symfony"></a>
## Install Symfony

1 - Open the `.env` file and set `WORKSPACE_INSTALL_SYMFONY` to `true`.

2 - Run `docker-compose build workspace`, after the step above.

3 - The NGINX sites include a default config file for your Symfony project `symfony.conf.example`, so edit it and make sure the `root` is pointing to your project `web` directory.

4 - Run `docker-compose restart` if the container was already running, before the step above.

5 - Visit `symfony.test`






<br>
<a name="Misc"></a>
## Miscellaneous






<br>
<a name="Change-the-timezone"></a>
## Change the timezone

To change the timezone for the `workspace` container, modify the `TZ` build argument in the Docker Compose file to one in the [TZ database](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones).

For example, if I want the timezone to be `New York`:

```yml
    workspace:
        build:
            context: ./workspace
            args:
                - TZ=America/New_York
    ...
```

We also recommend [setting the timezone in Laravel](http://www.camroncade.com/managing-timezones-with-laravel/).



<br>
<a name="Add locales to PHP-FPM"></a>
## Add locales to PHP-FPM

To add locales to the container:

1 - Open the `.env` file and set `PHP_FPM_INSTALL_ADDITIONAL_LOCALES` to `true`.

2 - Add locale codes to `PHP_FPM_ADDITIONAL_LOCALES`.

3 - Re-build your PHP-FPM Container `docker-compose build php-fpm`.

4 - Check enabled locales with `docker-compose exec php-fpm locale -a`

Update the locale setting, default is `POSIX`

1 - Open the `.env` file and set `PHP_FPM_DEFAULT_LOCALE` to `en_US.UTF8` or other locale you want.

2 - Re-build your PHP-FPM Container `docker-compose build php-fpm`.

3 - Check the default locale with `docker-compose exec php-fpm locale`


<br>
<a name="CronJobs"></a>
## Adding cron jobs

You can add your cron jobs to `workspace/crontab/laradock` after the `php artisan` line.

```
* * * * * laradock /usr/bin/php /var/www/artisan schedule:run >> /dev/null 2>&1

# Custom cron
* * * * * root echo "Every Minute" > /var/log/cron.log 2>&1
```

Make sure you [change the timezone](#Change-the-timezone) if you don't want to use the default (UTC).

If you are on Windows, verify that the line endings for this file are LF only, otherwise the cron jobs will silently fail.






<br>
<a name="Workspace-ssh"></a>
## Access workspace via ssh

You can access the `workspace` container through `localhost:2222` by setting the `INSTALL_WORKSPACE_SSH` build argument to `true`.

To change the default forwarded port for ssh:

```yml
    workspace:
		ports:
			- "2222:22" # Edit this line
    ...
```

Then login using:

```bash
ssh -o PasswordAuthentication=no    \
    -o StrictHostKeyChecking=no     \
    -o UserKnownHostsFile=/dev/null \
    -p 2222                         \
    -i workspace/insecure_id_rsa    \
    laradock@localhost
```

To login as root, replace laradock@localhost with root@localhost.






<br>
<a name="Change-the-MySQL-Version"></a>
## Change the (MySQL) Version
By default **MySQL 8.0** is running.

MySQL 8.0 is a development release.  You may prefer to use the latest stable version, or an even older release.  If you wish, you can change the MySQL image that is used.

Open up your .env file and set the `MYSQL_VERSION` variable to the version you would like to install.

```
MYSQL_VERSION=5.7
```

Available versions are: 5.5, 5.6, 5.7, 8.0, or latest.  See https://store.docker.com/images/mysql for more information.






<br>
<a name="MySQL-root-access"></a>
## MySQL root access

The default username and password for the root MySQL user are `root` and `root `.

1 - Enter the MySQL container: `docker-compose exec mysql bash`.

2 - Enter mysql: `mysql -uroot -proot` for non root access use `mysql -udefault -psecret`.

3 - See all users: `SELECT User FROM mysql.user;`

4 - Run any commands `show databases`, `show tables`, `select * from.....`.






<br>
<a name="Create-Multiple-Databases"></a>
## Create Multiple Databases

> With MySQL.

Create `createdb.sql` from `mysql/docker-entrypoint-initdb.d/createdb.sql.example` in `mysql/docker-entrypoint-initdb.d/*` and add your SQL syntax as follow:

```sql
CREATE DATABASE IF NOT EXISTS `your_db_1` COLLATE 'utf8_general_ci' ;
GRANT ALL ON `your_db_1`.* TO 'mysql_user'@'%' ;
```






<br>
<a name="Change-MySQL-port"></a>
## Change MySQL port

Modify the `mysql/my.cnf` file to set your port number, `1234` is used as an example.

```
[mysqld]
port=1234
```

If you need <a href="#MySQL-access-from-host">MySQL access from your host</a>, do not forget to change the internal port number (`"3306:3306"` -> `"3306:1234"`) in the docker-compose configuration file.






<br>
<a name="Use-custom-Domain"></a>
## Use custom Domain

> How to use a custom domain, instead of the Docker IP.

Assuming your custom domain is `laravel.test`

1 - Open your `/etc/hosts` file and map your localhost address `127.0.0.1` to the `laravel.test` domain, by adding the following:

```bash
127.0.0.1    laravel.test
```

2 - Open your browser and visit `{http://laravel.test}`


Optionally you can define the server name in the NGINX configuration file, like this:

```conf
server_name laravel.test;
```






<br>
<a name="Enable-Global-Composer-Build-Install"></a>
## Global Composer Build Install

Enabling Global Composer Install during the build for the container allows you to get your composer requirements installed and available in the container after the build is done.

1 - Open the `.env` file

2 - Search for the `WORKSPACE_COMPOSER_GLOBAL_INSTALL` argument under the Workspace Container and set it to `true`

3 - Now add your dependencies to `workspace/composer.json`

4 - Re-build the Workspace Container `docker-compose build workspace`






<br>
<a name="Magento-2-authentication-credentials"></a>
## Add authentication for Magento

> Adding authentication credentials for Magento 2.

1 - Open the `.env` file

2 - Search for the `WORKSPACE_COMPOSER_AUTH` argument under the Workspace Container and set it to `true`

3 - Now add your credentials to `workspace/auth.json`

4 - Re-build the Workspace Container `docker-compose build workspace`






<br>
<a name="Install-Prestissimo"></a>
## Install Prestissimo

[Prestissimo](https://github.com/hirak/prestissimo) is a plugin for composer which enables parallel install functionality.

1 - Enable Running Global Composer Install during the Build:

Click on this [Enable Global Composer Build Install](#Enable-Global-Composer-Build-Install) and do steps 1 and 2 only then continue here.

2 - Add prestissimo as requirement in Composer:

a - Now open the `workspace/composer.json` file

b - Add `"hirak/prestissimo": "^0.3"` as requirement

c - Re-build the Workspace Container `docker-compose build workspace`






<br>
<a name="Install-Node"></a>
## Install Node + NVM

To install NVM and NodeJS in the Workspace container

1 - Open the `.env` file

2 - Search for the `WORKSPACE_INSTALL_NODE` argument under the Workspace Container and set it to `true`

3 - Re-build the container `docker-compose build workspace`

A `.npmrc` file is included in the `workspace` folder if you need to utilise this globally. This is copied automatically into the root and laradock user's folders on build.


<br>
<a name="Install-PNPM"></a>
## Install PNPM

pnpm uses hard links and symlinks to save one version of a module only ever once on a disk. When using npm or Yarn for example, if you have 100 projects using the same version of lodash, you will have 100 copies of lodash on disk. With pnpm, lodash will be saved in a single place on the disk and a hard link will put it into the node_modules where it should be installed.

As a result, you save gigabytes of space on your disk and you have a lot faster installations! If you'd like more details about the unique node_modules structure that pnpm creates and why it works fine with the Node.js ecosystem.
More info here: https://pnpm.js.org/en/motivation

1 - Open the `.env` file

2 - Search for the `WORKSPACE_INSTALL_NODE` and `WORKSPACE_INSTALL_PNPM` argument under the Workspace Container and set it to `true`

3 - Re-build the container `docker-compose build workspace`






<br>
<a name="Install-Yarn"></a>
## Install Node + YARN

Yarn is a new package manager for JavaScript. It is so faster than npm, which you can find [here](http://yarnpkg.com/en/compare).To install NodeJS and [Yarn](https://yarnpkg.com/) in the Workspace container:

1 - Open the `.env` file

2 - Search for the `WORKSPACE_INSTALL_NODE` and `WORKSPACE_INSTALL_YARN` argument under the Workspace Container and set it to `true`

3 - Re-build the container `docker-compose build workspace`






<br>
<a name="Install-NPM-GULP"></a>
## Install NPM GULP toolkit

To install NPM GULP toolkit in the Workspace container

1 - Open the `.env` file

2 - Search for the `WORKSPACE_INSTALL_NPM_GULP` argument under the Workspace Container and set it to `true`

3 - Re-build the container `docker-compose build workspace`







<br>
<a name="Install-NPM-BOWER"></a>
## Install NPM BOWER

To install NPM BOWER package manager in the Workspace container

1 - Open the `.env` file

2 - Search for the `WORKSPACE_INSTALL_NPM_BOWER` argument under the Workspace Container and set it to `true`

3 - Re-build the container `docker-compose build workspace`






<br>
<a name="Install-NPM-VUE-CLI"></a>
## Install NPM VUE CLI

To install NPM VUE CLI in the Workspace container

1 - Open the `.env` file

2 - Search for the `WORKSPACE_INSTALL_NPM_VUE_CLI` argument under the Workspace Container and set it to `true`

3 - Change `vue serve` port using `WORKSPACE_VUE_CLI_SERVE_HOST_PORT` if you wish to (default value is 8080)

4 - Change `vue ui` port using `WORKSPACE_VUE_CLI_UI_HOST_PORT` if you wish to (default value is 8001)

5 - Re-build the container `docker-compose build workspace`





<br>
<a name="Install-NPM-ANGULAR-CLI"></a>
## Install NPM ANGULAR CLI

To install NPM ANGULAR CLI in the Workspace container

1 - Open the `.env` file

2 - Search for the `WORKSPACE_INSTALL_NPM_ANGULAR_CLI` argument under the Workspace Container and set it to `true`

3 - Re-build the container `docker-compose build workspace`


<br>
<a name="Install-npm-check-updates"></a>
## Install npm-check-updates CLI

To install npm-check-updates CLI [here](https://www.npmjs.com/package/npm-check-updates) in the Workspace container

1 - Open the `.env` file

2 - Make sure Node is also being installed (`WORKSPACE_INSTALL_NODE` set to `true`)

3 - Search for the `WORKSPACE_INSTALL_NPM_CHECK_UPDATES_CLI` argument under the Workspace Container and set it to `true`

4 - Re-build the container `docker-compose build workspace`

<br>
<a name="Install-poppler-utils"></a>
## Install `poppler-utils` (and `antiword` combined)

Poppler is a PDF rendering library based on Xpdf PDF viewer.

This package contains command line utilities (based on Poppler) for getting information of PDF documents, convert them to other formats, or manipulate them:
* pdfdetach -- lists or extracts embedded files (attachments)
* pdffonts -- font analyzer
* pdfimages -- image extractor
* pdfinfo -- document information
* pdfseparate -- page extraction tool
* pdfsig -- verifies digital signatures
* pdftocairo -- PDF to PNG/JPEG/PDF/PS/EPS/SVG converter using Cairo
* pdftohtml -- PDF to HTML converter
* pdftoppm -- PDF to PPM/PNG/JPEG image converter
* pdftops -- PDF to PostScript (PS) converter
* pdftotext -- text extraction
* pdfunite -- document merging tool

`poppler-utils` is often used by popular PDF/DOC parsing packages in combination with `antiword`, hence both are installed when flags in `.env` are set.

To install `poppler-utils` [(more here)](https://packages.debian.org/sid/poppler-utils) in any of the `workspace/php-fpm/php-worker/laravel-horizon` container

1 - Open the `.env` file

2 - Search for the `WORKSPACE_INSTALL_POPPLER_UTILS` argument under the Workspace Container and set it to `true`

3 - Search for the `PHP_FPM_INSTALL_POPPLER_UTILS` argument under the Workspace Container and set it to `true`

4 - Search for the `PHP_WORKER_INSTALL_POPPLER_UTILS` argument under the Workspace Container and set it to `true`

5 - Search for the `LARAVEL_HORIZON_INSTALL_POPPLER_UTILS` argument under the Workspace Container and set it to `true`

6 - Re-build the container `docker-compose build workspace php-fpm php-worker laravel-horizon`




<br>
<a name="Install-Linuxbrew"></a>
## Install Linuxbrew

Linuxbrew is a package manager for Linux. It is the Linux version of MacOS Homebrew and can be found [here](http://linuxbrew.sh). To install Linuxbrew in the Workspace container:

1 - Open the `.env` file

2 - Search for the `WORKSPACE_INSTALL_LINUXBREW` argument under the Workspace Container and set it to `true`

3 - Re-build the container `docker-compose build workspace`





<br>
<a name="Install-FFMPEG"></a>
## Install FFMPEG

To install FFMPEG in the Workspace container

1 - Open the `.env` file

2 - Search for the `WORKSPACE_INSTALL_FFMPEG` argument under the Workspace Container and set it to `true`

3 - Re-build the container `docker-compose build workspace`

4 - If you use the `php-worker` container too, please follow the same steps above especially if you have conversions that have been queued.

**PS** Don't forget to install the binary in the `php-fpm` container too by applying the same steps above to its container, otherwise you'll get an error when running the `php-ffmpeg` binary.


<br>
<a name="Install-audiowaveform"></a>
## Install BBC Audio Waveform Image Generator

audiowaveform is a C++ command-line application that generates waveform data from either MP3, WAV, FLAC, or Ogg Vorbis format audio files. 
Waveform data can be used to produce a visual rendering of the audio, similar in appearance to audio editing applications.
Waveform data files are saved in either binary format (.dat) or JSON (.json).

To install BBC Audio Waveform Image Generator in the Workspace container

1 - Open the `.env` file

2 - Search for the `WORKSPACE_INSTALL_AUDIOWAVEFORM` argument under the Workspace Container and set it to `true`

3 - Re-build the container `docker-compose build workspace`

4 - If you use the `php-worker` or `laravel-horizon` container too, please follow the same steps above especially if you have processing that have been queued.

**PS** Don't forget to install the binary in the `php-fpm` container too by applying the same steps above to its container, otherwise you'll get an error when running the `audiowaveform` binary.


<br>
<a name="Install-wkhtmltopdf"></a>
## Install wkhtmltopdf

[wkhtmltopdf](https://wkhtmltopdf.org/) is a utility for outputting a PDF from HTML

To install wkhtmltopdf in the Workspace container

1 - Open the `.env` file

2 - Search for the `WORKSPACE_INSTALL_WKHTMLTOPDF` argument under the Workspace Container and set it to `true`

3 - Re-build the container `docker-compose build workspace`

**PS** Don't forget to install the binary in the `php-fpm` container too by applying the same steps above to its container, otherwise the you'll get an error when running the `wkhtmltopdf` binary.



<br>
<a name="Install-GNU-Parallel"></a>
## Install GNU Parallel

GNU Parallel is a command line tool to run multiple processes in parallel.

(see https://www.gnu.org/software/parallel/parallel_tutorial.html)

To install GNU Parallel in the Workspace container

1 - Open the `.env` file

2 - Search for the `WORKSPACE_INSTALL_GNU_PARALLEL` argument under the Workspace Container and set it to `true`

3 - Re-build the container `docker-compose build workspace`






<br>
<a name="Install-Supervisor"></a>
## Install Supervisor

Supervisor is a client/server system that allows its users to monitor and control a number of processes on UNIX-like operating systems.

(see http://supervisord.org/index.html)

To install Supervisor in the Workspace container

1 - Open the `.env` file

2 - Set `WORKSPACE_INSTALL_SUPERVISOR` and `WORKSPACE_INSTALL_PYTHON` to `true`.

3 - Create supervisor configuration file (for ex., named `laravel-worker.conf`) for Laravel Queue Worker in `php-worker/supervisord.d/` by simply copy from `laravel-worker.conf.example`

4 - Re-build the container `docker-compose build workspace` Or `docker-compose up --build -d workspace`






<br>
<a name="Common-Aliases"></a>
<br>
## Common Terminal Aliases
When you start your docker container, Laradock will copy the `aliases.sh` file located in the `laradock/workspace` directory and add sourcing to the container `~/.bashrc` file.

You are free to modify the `aliases.sh` as you see fit, adding your own aliases (or function macros) to suit your requirements.






<br>
<a name="Install-Aerospike-Extension"></a>
## Install Aerospike extension

1 - First install `aerospike` in the Workspace and the PHP-FPM Containers:
<br>
a) open the `.env` file
<br>
b) search for the `WORKSPACE_INSTALL_AEROSPIKE` argument under the Workspace Container
<br>
c) set it to `true`
<br>
d) search for the `PHP_FPM_INSTALL_AEROSPIKE` argument under the PHP-FPM Container
<br>
e) set it to `true`
<br>

2 - Re-build the containers `docker-compose build workspace php-fpm`






<br>
<a name="Install-Laravel-Envoy"></a>
## Install Laravel Envoy

> A Tasks Runner.

1 - Open the `.env` file
<br>
2 - Search for the `WORKSPACE_INSTALL_LARAVEL_ENVOY` argument under the Workspace Container
<br>
3 - Set it to `true`
<br>

4 - Re-build the containers `docker-compose build workspace`

[**Laravel Envoy Documentation Here**](https://laravel.com/docs/5.3/envoy)




<a name="Install php calendar extension"></a>
## Install php calendar extension

1 - Open the `.env` file
<br>
2 - Search for the `PHP_FPM_INSTALL_CALENDAR` argument under the PHP-FPM container
<br>
3 - Set it to `true`
<br>
4 - Re-build the containers `docker-compose build php-fpm`
<br>




<br>
<a name="Install-Faketime"></a>
## Install libfaketime in php-fpm

Libfaketime allows you to control the date and time that is returned from the operating system.
It can be used by specifying a special string in the `PHP_FPM_FAKETIME` variable in the `.env` file.
For example:
`PHP_FPM_FAKETIME=-1d`
will set the clock back 1 day. See (https://github.com/wolfcw/libfaketime) for more information.

1 - Open the `.env` file
<br>
2 - Search for the `PHP_FPM_INSTALL_FAKETIME` argument under the PHP-FPM container
<br>
3 - Set it to `true`
<br>
4 - Search for the `PHP_FPM_FAKETIME` argument under the PHP-FPM container
<br>
5 - Set it to the desired string
<br>
6 - Re-build the containers `docker-compose build php-fpm`<br>




<br>
<a name="Install-YAML"></a>
## Install YAML extension in php-fpm

YAML PHP extension allows you to easily parse and create YAML structured data. I like YAML because it's well readable for humans. See http://php.net/manual/en/ref.yaml.php and http://yaml.org/ for more info.

1 - Open the `.env` file
<br>
2 - Search for the `PHP_FPM_INSTALL_YAML` argument under the PHP-FPM container
<br>
3 - Set it to `true`
<br>
4 - Re-build the container `docker-compose build php-fpm`<br>


<br>
<a name="Install-RDKAFKA-php"></a>
## Install RDKAFKA extension in php-fpm

1 - Open the `.env` file
<br>
2 - Search for the `PHP_FPM_INSTALL_RDKAFKA` argument under the PHP-FPM container
<br>
3 - Set it to `true`
<br>
4 - Re-build the container `docker-compose build php-fpm`<br>


<br>
<a name="Install-RDKAFKA-workspace"></a>
## Install RDKAFKA extension in workspace

This is needed for 'composer install' if your dependencies require Kafka.

1 - Open the `.env` file
<br>
2 - Search for the `WORKSPACE_INSTALL_RDKAFKA` argument under the WORKSPACE container
<br>
3 - Set it to `true`
<br>
4 - Re-build the container `docker-compose build workspace`<br>


<br>
<a name="Install-AST"></a>
## Install AST PHP extension
AST exposes the abstract syntax tree generated by PHP 7+. This extension is required by tools such as `Phan`, a static analyzer for PHP.

1 - Open the `.env` file

2 - Search for the `WORKSPACE_INSTALL_AST` argument under the Workspace Container

3 - Set it to `true`

4 - Re-build the container `docker-compose build workspace`

**Note** If you need a specific version of AST then search for the `WORKSPACE_AST_VERSION` argument under the Workspace Container and set it to the desired version and continue step 4.


<br>
<a name="Install-PHP-Decimal"></a>
## Install PHP Decimal extension
The PHP Decimal extension adds support for correctly-rounded, arbitrary-precision decimal floating point arithmetic. Applications that rely on accurate numbers (ie. money, measurements, or mathematics) can use Decimal instead of float or string to represent numerical values.

For more information visit the [PHP Decimal website](https://php-decimal.io).

2 - Search for the `WORKSPACE_INSTALL_PHPDECIMAL` argument under the Workspace Container

2 - Search for the `PHP_FPM_INSTALL_PHPDECIMAL` argument under the PHP-FPM container

3 - Set it to `true`

4 - Re-build the container `docker-compose build workspace php-fpm`


<br>
<a name="Install-Bash-Git-Prompt"></a>
## Install Git Bash Prompt
A bash prompt that displays information about the current git repository. In particular the branch name, difference with remote branch, number of files staged, changed, etc.

1 - Open the `.env` file

2 - Search for the `WORKSPACE_INSTALL_GIT_PROMPT` argument under the Workspace Container

3 - Set it to `true`

4 - Re-build the container `docker-compose build workspace`

**Note** You can configure bash-git-prompt by editing the `workspace/gitprompt.sh` file and re-building the workspace container.
For configuration information, visit the [bash-git-prompt repository](https://github.com/magicmonty/bash-git-prompt).

<br>
<a name="Install-Oh-My-Zsh"></a>
## Install Oh My ZSH




<br>
<a name="Install-Dnsutils"></a>
## Install Dnsutils

1 - First install `dnsutils` in the Workspace and the PHP-FPM Containers:
<br>
a) open the `.env` file
<br>
b) search for the `WORKSPACE_INSTALL_DNSUTILS` argument under the Workspace Container
<br>
c) set it to `true`
<br>
d) search for the `PHP_FPM_INSTALL_DNSUTILS` argument under the PHP-FPM Container
<br>
e) set it to `true`
<br>

2 - Re-build the containers `docker-compose build workspace php-fpm`




> With the Laravel autocomplete plugin.

[Zsh](https://en.wikipedia.org/wiki/Z_shell) is an extended Bourne shell with many improvements, including some features of Bash, ksh, and tcsh.

[Oh My Zsh](https://ohmyz.sh/) is a delightful, open source, community-driven framework for managing your Zsh configuration.

[Laravel autocomplete plugin](https://github.com/ohmyzsh/ohmyzsh/tree/master/plugins/laravel) adds aliases and autocompletion for Laravel Artisan and Bob command-line interfaces.

1 - Open the `.env` file

2 - Search for the `SHELL_OH_MY_ZSH` argument under the Workspace Container

3 - Set it to `true`

4 - Re-build the container `docker-compose build workspace`

5 - Use it `docker-compose exec --user=laradock workspace zsh`

**Note** You can configure Oh My ZSH by editing the `/home/laradock/.zshrc` in running container.

> With the ZSH autosuggestions plugin.

[ZSH autosuggestions plugin](https://github.com/zsh-users/zsh-autosuggestions) suggests commands as you type based on history and completions.

1 - Enable ZSH as described previously

2 - Set `SHELL_OH_MY_ZSH_AUTOSUGESTIONS` to `true`

3 - Rebuild and use ZSH as described previously

> With bash aliases loaded.

Laradock provides aliases through the `aliases.sh` file located in the `laradock/workspace` directory. You can load it into ZSH.

1 - Enable ZSH as described previously

2 - Set `SHELL_OH_MY_ZSH_ALIASES` to `true`

3 - Rebuild and enjoy aliases

<br>
<a name="phpstorm-debugging"></a>
## PHPStorm Debugging Guide
Remote debug Laravel web and phpunit tests.

[**Debugging Guide Here**](/guides/#PHPStorm-Debugging)



<br>
<a name="Setup-gcloud"></a>
## Setup Google Cloud

> Setting up Google Cloud for the docker registry.

```
gcloud auth configure-docker
```

Login to gcloud for use the registry and auth the permission.

```
gcloud auth login
```



<br>
<a name="keep-tracking-Laradock"></a>
## Track your Laradock changes

1. Fork the Laradock repository.
2. Use that fork as a submodule.
3. Commit all your changes to your fork.
4. Pull new stuff from the main repository from time to time.










<br>
<a name="Speed-MacOS"></a>
## Improve speed on MacOS

Docker on the Mac [is slow](https://github.com/docker/for-mac/issues/77), at the time of writing. Especially for larger projects, this can be a problem. The problem is [older than March 2016](https://forums.docker.com/t/file-access-in-mounted-volumes-extremely-slow-cpu-bound/8076) - as it's a such a long-running issue, we're including it in the docs here.

So since sharing code into Docker containers with osxfs have very poor performance compared to Linux. Likely there are some workarounds:



### Workaround A: using dinghy

[Dinghy](https://github.com/codekitchen/dinghy) creates its own VM using docker-machine, it will not modify your existing docker-machine VMs.

Quick Setup giude, (we recommend you check their docs)

1) `brew tap codekitchen/dinghy`

2) `brew install dinghy`

3) `dinghy create --provider virtualbox` (must have virtualbox installed, but they support other providers if you prefer)

4) after the above command is done it will display some env variables, copy them to the bash profile or zsh or.. (this will instruct docker to use the server running inside the VM)

5) `docker-compose up ...`






<br>
<a name="Docker-Sync"></a>
### Workaround B: using d4m-nfs

You can use the d4m-nfs solution in 2 ways, the first is by using the built-in Laradock integration, and the second is using the tool separately. Below is show case of both methods:


### B.1: using the built in d4m-nfs integration

In simple terms, docker-sync creates a docker container with a copy of all the application files that can be accessed very quickly from the other containers.
On the other hand, docker-sync runs a process on the host machine that continuously tracks and updates files changes from the host to this intermediate container.

Out of the box, it comes pre-configured for OS X, but using it on Windows is very easy to set-up by modifying the `DOCKER_SYNC_STRATEGY` on the `.env`

#### Usage

Laradock comes with `sync.sh`, an optional bash script, that automates installing, running and stopping docker-sync.  Note that to run the bash script you may need to change the permissions `chmod 755 sync.sh`

1) Configure your Laradock environment as you would normally do and test your application to make sure that your sites are running correctly.

2) Make sure to set `DOCKER_SYNC_STRATEGY` on the `.env`. Read the [syncing strategies](https://github.com/EugenMayer/docker-sync/wiki/8.-Strategies) for details.
```
# osx: 'native_osx' (default)
# windows: 'unison'
# linux: docker-sync not required

DOCKER_SYNC_STRATEGY=native_osx
```

3) set `APP_CODE_CONTAINER_FLAG` to `APP_CODE_CONTAINER_FLAG=:nocopy` in the .env file

4) Install the docker-sync gem on the host-machine:
```bash
./sync.sh install
```
5) Start docker-sync and the Laradock environment.
Specify the services you want to run, as you would normally do with `docker-compose up`
```bash
./sync.sh up nginx mysql
```
Please note that the first time docker-sync runs, it will copy all the files to the intermediate container and that may take a very long time (15min+).
6) To stop the environment and docker-sync do:
```bash
./sync.sh down
```

#### Setting up Aliases (optional)

You may create bash profile aliases to avoid having to remember and type these commands for everyday development.
Add the following lines to your `~/.bash_profile`:

```bash
alias devup="cd /PATH_TO_LARADOCK/laradock; ./sync.sh up nginx mysql" #add your services
alias devbash="cd /PATH_TO_LARADOCK/laradock; ./sync.sh bash"
alias devdown="cd /PATH_TO_LARADOCK/laradock; ./sync.sh down"
```

Now from any location on your machine, you can simply run `devup`, `devbash` and `devdown`.


#### Additional Commands

Opening bash on the workspace container (to run artisan for example):
 ```bash
 ./sync.sh bash
 ```
Manually triggering the synchronization of the files:
```bash
./sync.sh sync
```
Removing and cleaning up the files and the docker-sync container. Use only if you want to rebuild or remove docker-sync completely. The files on the host will be kept untouched.
```bash
./sync.sh clean
```


#### Additional Notes

- You may run laradock with or without docker-sync at any time using with the same `.env` and `docker-compose.yml`, because the configuration is overridden automatically when docker-sync is used.
- You may inspect the `sync.sh` script to learn each of the commands and even add custom ones.
- If a container cannot access the files on docker-sync, you may need to set a user on the Dockerfile of that container with an id of 1000 (this is the UID that nginx and php-fpm have configured on laradock). Alternatively, you may change the permissions to 777, but this is **not** recommended.

Visit the [docker-sync documentation](https://github.com/EugenMayer/docker-sync/wiki) for more details.






<br>

### B.2: using the d4m-nfs tool

[D4m-nfs](https://github.com/IFSight/d4m-nfs) automatically mount NFS volume instead of osxfs one.

1) Update the Docker [File Sharing] preferences:

Click on the Docker Icon > Preferences > (remove everything form the list except `/tmp`).

2) Restart Docker.

3) Clone the [d4m-nfs](https://github.com/IFSight/d4m-nfs) repository to your `home` directory.

```bash
git clone https://github.com/IFSight/d4m-nfs ~/d4m-nfs
```

4) Create (or edit) the file `~/d4m-nfs/etc/d4m-nfs-mounts.txt`, and write the following configuration in it:

```txt
/Users:/Users
```

5) Create (or edit) the file `/etc/exports`, make sure it exists and is empty. (There may be collisions if you come from Vagrant or if you already executed the `d4m-nfs.sh` script before).


6) Run the `d4m-nfs.sh` script (might need Sudo):

```bash
~/d4m-nfs/d4m-nfs.sh
```

That's it! Run your containers.. Example:

```bash
docker-compose up ...
```

*Note: If you faced any errors, try restarting Docker, and make sure you have no spaces in the `d4m-nfs-mounts.txt` file, and your `/etc/exports` file is clear.*


<br>
<a name="ca-certificates"></a>
## ca-certificates

To install your own CA certificates, you can add them to the `workspace/ca-certificates` folder.
This way the certificates will be installed into the system ca store of the workspace container.


<br>
<a name="upgrade-laradock"></a>
## Upgrade Laradock

Moving from Docker Toolbox (VirtualBox) to Docker Native (for Mac/Windows). Requires upgrading Laradock from v3.* to v4.*:

1. Stop the docker VM `docker-machine stop {default}`
2. Install Docker for [Mac](https://docs.docker.com/docker-for-mac/) or [Windows](https://docs.docker.com/docker-for-windows/).
3. Upgrade Laradock to `v4.*.*` (`git pull origin master`)
4. Use Laradock as you used to do: `docker-compose up -d nginx mysql`.

**Note:** If you face any problem with the last step above: rebuild all your containers
`docker-compose build --no-cache`
"Warning Containers Data might be lost!"
