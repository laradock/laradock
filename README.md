## Getting Started

1. Copy `.env.example` into `.env`
```bash
cp .env.example .env
```

2. Change `APP_CODE_PATH_HOST` in [.env](.env) to point to your project directory.
```environment
APP_CODE_PATH_HOST=../path/to/project
```

3. Replace instances of `__project_slug__` in [.env](.env) with a slug unique to your project. An example value would be `realtyless`.
```environment
# Example values
DATA_PATH_HOST=~/.dev-data/realtyless/data
...
COMPOSE_PROJECT_NAME=realtyless
```

4. Add a URL for your website to the Caddy configuration file ([./caddy/caddy/Caddyfile](./caddy/caddy/Caddyfile)). Alter the second line and add a local development url. If you wanted to use the development url `some-website.local`, you would change it to look like this:
```caddy
0.0.0.0:80, 0.0.0.0:443, 0.0.0.0, some-website.local:443, some-website.local:80 {
```

5. Build containers with build script.
```bash
bash ./scripts/build
```

6. Start environment with start script.
```bash
bash ./start.sh
```

### Stopping the containers
```bash
bash ./stop.sh
```

## Available scripts

* [./scripts/build](./scripts/build) - Builds containers.
* [start.sh](./start.sh) - Starts docker compose environment.
* [stop.sh](./stop.sh) - Stops project docker containers.
* [workspace.sh](./workspace.sh) - Opens shell inside the workspace container.
* [./scripts/exec](./scripts/exec) - Executes a command inside the workspace container.
* [./scripts/workspace-root](./scripts/workspace-root) - Opens shell inside the workspace container as root.
* [./scripts/prep-testing-database](./scripts/prep-testing-database) - Preps testing database for Dusk tests.
* [./scripts/remove-orphans](./scripts/remove-orphans) - Preps testing database for Dusk tests.
* [./php-fpm/xdebug](./php-fpm/xdebug) - Enables and disables xdebug in the php-fpm container. 

### Script Examples
Install composer dependencies.
```bash
bash ./scripts/exec composer i
```

Run an NPM script within the workspace container.
```bash
bash ./scripts/exec npm run prod
```

Run an Artisan command.
```bash
bash ./scripts/exec php artisan migrate
```

## Using Xdebug
Xdebug is enabled by default.  If PhpStorm is set up to listen to port 9000 and listening to PHP debug connections is enabled, then xdebug will stop at breakpoints.  Xdebug can be enabled and disabled using the xdebug management script.  Xdebug breakpoints will be ignored if PhpStorm is not listening for PHP debug connections.

Checking status of Xdebug.  If the output list Xdebug as in the output, then Xdebug is enabled.
```bash
./php-fpm/xdebug status
```

Enable Xdebug
```bash
./php-fpm/xdebug start
```

Disable Xdebug
```bash
./php-fpm/xdebug stop
```

## Containers and Ports

### caddy
Proxy for serving request over http and https.  The main website is available at [https://0.0.0.0](https://0.0.0.0).  
Ports:
*  80 to serve http.
*  443 to serve https.

### mailhog
Mailhog is used to catch all email through smtp.  The web client is available at [http://0.0.0.0:8025](http://0.0.0.0:8025).  
Ports:
* 1025 for smtp and
* 8025 for mail web client.

### mysql
Mysql instance.  
Ports: 
*  3306 to serve mysql by default, but can be changed by setting `MYSQL_PORT` in [.env](./.env).   
  
The mysql server can be connected to at `0.0.0.0:3306`.  The port reflects the value of `MYSQL_PORT` in [.env](./.env).

### php-fpm
Used by Caddy to serve website.

### redis
Redis instance.  
Ports: 
*  6379 to serve redis by default, but can be changed by setting `REDIS_PORT` in [.env](./.env).

The redis server can be connected to at `0.0.0.0:6379`.  The port reflects the value of `REDIS_PORT` in [.env](./.env).

### workspace
Container with various utilities installed.  Use this container if you want to run artisan commands in the docker environment.  The workspace can be used to run npm scripts.

## Adding more services
By default, the project uses these services: `caddy php-fpm workspace mysql mailhog redis`.  If you want to add more services, you will need to add the service to [build.sh](build.sh) and [start.sh](start.sh).  After adding them to those scripts, you will need to uncomment the service or add a new service to [docker-compose.yml](./docker-compose.yml).  See the docker compose documentation for more information on adding services to a docker-compose.yml file.

After adding the service to the scripts and the configuration file, you must rebuild the containers using [build.sh](./build.sh).  Once the containers are re-built, the project can be started using [start.sh](./start.sh).

## Setting Up Chrome Linux Sandbox

You can do either of these steps or both.  If you choose to do only one, it is recommended that you enable user namespace cloning.

### Enable user namespace cloning

User namespace cloning is only supported by modern kernels. Unprivileged user namespaces are generally fine to enable,
but in some cases they open up more kernel attack surface for (unsandboxed) non-root processes to elevate to
kernel privileges. See [linux user namespaces](http://man7.org/linux/man-pages/man7/user_namespaces.7.html) for more information.

```bash
sudo sysctl -w kernel.unprivileged_userns_clone=1
```

### Setup setuid Sandbox

The [setuid sandbox](https://chromium.googlesource.com/chromium/src/+/HEAD/docs/linux/suid_sandbox_development.md) comes as a standalone executable and is located next to the Chromium that Puppeteer downloads. It is
fine to re-use the same sandbox executable for different Chromium versions, so the following could be
done only once per host environment:

```bash
# cd to the downloaded instance
cd <project-dir-path>/node_modules/puppeteer/.local-chromium/linux-<revision>/chrome-linux/
sudo chown root:root chrome_sandbox
sudo chmod 4755 chrome_sandbox
# copy sandbox executable to a shared location
sudo cp -p chrome_sandbox /usr/local/sbin/chrome-devel-sandbox
# export CHROME_DEVEL_SANDBOX env variable
export CHROME_DEVEL_SANDBOX=/usr/local/sbin/chrome-devel-sandbox
```

You might want to export the `CHROME_DEVEL_SANDBOX` env variable by default. In this case, add the following to the `~/.bashrc`
or `.zshenv`:

```bash
export CHROME_DEVEL_SANDBOX=/usr/local/sbin/chrome-devel-sandbox
```

## Troubleshooting Chrome Sandbox

> **NOTE**: Running without a sandbox is **strongly discouraged**. Consider configuring a sandbox instead.

In order to protect the host environment from untrusted web content, Chrome uses [multiple layers of sandboxing](https://chromium.googlesource.com/chromium/src/+/HEAD/docs/linux/sandboxing.md). For this to work properly,
the host should be configured first. If there's no good sandbox for Chrome to use, it will crash
with the error `No usable sandbox!`.

If you **absolutely trust** the content you open in Chrome, you can launch Chrome
with the `--no-sandbox` argument:

```js
const browser = await puppeteer.launch({args: ['--no-sandbox', '--disable-setuid-sandbox']});
```
