---
title: 4. Guides
type: index
weight: 4
---


<a name="Digital-Ocean"></a>
## Production Setup on Digital Ocean

### Install Docker

- Visit [DigitalOcean](https://cloud.digitalocean.com/login) and login.
- Click the `Create Droplet` button.
- Open the `One-click apps` tab.
- Select Docker with your preferred version.
- Continue creating the droplet as you normally would.
- If needed, check your e-mail for the droplet root password.

### SSH to your Server

Find the IP address of the droplet in the DigitalOcean interface. Use it to connect to the server.

```
ssh root@ipaddress
```

You may be prompted for a password. Type the one you found within your e-mailbox. It'll then ask you to change the password.

You can now check if Docker is available:

```
$root@server:~# docker
```

### Set Up Your Laravel Project

```
$root@server:~# apt-get install git
$root@server:~# git clone https://github.com/laravel/laravel
$root@server:~# cd laravel
$root@server:~/laravel/ git submodule add https://github.com/Laradock/laradock.git
$root@server:~/laravel/ cd laradock
```

###  Enter the laradock folder and rename env-example to .env.
```
$root@server:~/laravel/laradock# cp env-example .env
```

### Create Your Laradock Containers

```
$root@server:~/laravel/laradock# docker-compose up -d nginx mysql
```

Note that more containers are available, find them in the [docs](http://laradock.io/introduction/#supported-software-containers) or the `docker-compose.yml` file.

### Go to Your Workspace

```
docker-compose exec workspace bash
```

### Execute commands

If you want to only execute some command and don't want to enter bash, you can execute `docker-compose run workspace <command>`.

```
docker-compose run workspace php artisan migrate
```

### Install and configure Laravel

Let's install Laravel's dependencies, add the `.env` file, generate the key and give proper permissions to the cache folder.

```
$ root@workspace:/var/www# composer install
$ root@workspace:/var/www# cp .env.example .env
$ root@workspace:/var/www# php artisan key:generate
$ root@workspace:/var/www# exit
$root@server:~/laravel/laradock# cd ..
$root@server:~/laravel# sudo chmod -R 777 storage bootstrap/cache
```

You can then view your Laravel site by visiting the IP address of your server in your browser. For example:

```
http://192.168.1.1
```

It should show you the Laravel default welcome page.

However, we want it to show up using your custom domain name, as well.

### Using Your Own Domain Name

Login to your DNS provider, such as Godaddy, Namecheap.

Point the Custom Domain Name Server to:

```
ns1.digitalocean.com
ns2.digitalocean.com
ns3.digitalocean.com
```

Within DigitalOcean, you'll need to change some settings, too.

Visit: https://cloud.digitalocean.com/networking/domains

Add your domain name and choose the server IP you'd provision earlier.

### Serving Site With NGINX (HTTP ONLY)

Go back to command line.

```
$root@server:~/laravel/laradock# cd nginx
$root@server:~/laravel/laradock/nginx# vim laravel.conf
```

Remove `default_server`

```
    listen 80 default_server;
    listen [::]:80 default_server ipv6only=on;
```

And add `server_name` (your custom domain)

```
    listen 80;
    listen [::]:80 ipv6only=on;
    server_name yourdomain.com;
```

### Rebuild Your Nginx

```
$root@server:~/laravel/laradock# docker-compose down
$root@server:~/laravel/laradock# docker-compose build nginx
```

### Re Run Your Containers MYSQL and NGINX

```
$root@server:~/laravel/laradock/nginx# docker-compose up -d nginx mysql
```

**View Your Site with HTTP ONLY (http://yourdomain.com)**

### Run Site on SSL with Let's Encrypt Certificate

**Note: You need to Use Caddy here Instead of Nginx**

To go Caddy Folders and Edit CaddyFile

```
$root@server:~/laravel/laradock# cd caddy
$root@server:~/laravel/laradock/caddy# vim Caddyfile
```

Remove 0.0.0.0:80

```
0.0.0.0:80
root /var/www/public
```

and replace with your https://yourdomain.com

```
https://yourdomain.com
root /var/www/public
```

uncomment tls

```
#tls self-signed
```

and replace self-signed with your email address

```
tls serverbreaker@gmai.com
```

This is needed Prior to Creating Let's Encypt

### Run Your Caddy Container without the -d flag and Generate SSL with Let's Encrypt

```
$root@server:~/laravel/laradock# docker-compose up  caddy
```

You'll be prompt here to enter your email... you may enter it or not

```
Attaching to laradock_mysql_1, laradock_caddy_1
caddy_1               | Activating privacy features...
caddy_1               | Your sites will be served over HTTPS automatically using Let's Encrypt.
caddy_1               | By continuing, you agree to the Let's Encrypt Subscriber Agreement at:
caddy_1               |   https://letsencrypt.org/documents/LE-SA-v1.0.1-July-27-2015.pdf
caddy_1               | Activating privacy features... done.
caddy_1               | https://yourdomain.com
caddy_1               | http://yourdomain.com
```

After it finishes, press `Ctrl` + `C` to exit.

### Stop All Containers and ReRun Caddy and Other Containers on Background

```
$root@server:~/laravel/laradock# docker-compose down
$root@server:~/laravel/laradock# docker-compose up -d mysql caddy
```

View your Site in the Browser Securely Using HTTPS (https://yourdomain.com)

**Note that Certificate will be Automatically Renew By Caddy**

>References:
>
- [https://www.digitalocean.com/community/tutorials/how-to-install-and-use-docker-on-ubuntu-16-04](https://www.digitalocean.com/community/tutorials/how-to-install-and-use-docker-on-ubuntu-16-04)
- [https://www.digitalocean.com/products/one-click-apps/docker/](https://www.digitalocean.com/products/one-click-apps/docker/)
- [https://docs.docker.com/engine/installation/linux/ubuntulinux/](https://docs.docker.com/engine/installation/linux/ubuntulinux/)
- [https://docs.docker.com/compose/install/](https://docs.docker.com/compose/install/)
- [https://caddyserver.com/docs/automatic-https](https://caddyserver.com/docs/automatic-https)
- [https://caddyserver.com/docs/tls](https://caddyserver.com/docs/tls)
- [https://caddyserver.com/docs/caddyfile](https://caddyserver.com/docs/caddyfile)

<br>
<br>
<br>
<br>
<br>

<a name="Laravel-Dusk"></a>
## Running Laravel Dusk Tests

### Option 1: Without Selenium

- [Intro](#option1-dusk-intro)
- [Workspace Setup](#option1-workspace-setup)
- [Application Setup](#option1-application-setup)
- [Choose Chrome Driver Version (Optional)](#option1-choose-chrome-driver-version)
- [Run Dusk Tests](#option1-run-dusk-tests)

#### Intro

This is a guide to run Dusk tests in your `workspace` container with headless
google-chrome and chromedriver. It has been tested with Laravel 5.4 and 5.5.

#### Workspace Setup

Update your .env with following entries:

```
...
# Install Laravel installer bin to setup demo app
WORKSPACE_INSTALL_LARAVEL_INSTALLER=true
...
# Install all the necessary dependencies for running Dusk tests
WORKSPACE_INSTALL_DUSK_DEPS=true
...
```

Then run below to build your workspace.

```
docker-compose build workspace
```

#### Application Setup

Run a `workspace` container and you will be inside the container at `/var/www` directory.

```
docker-compose run workspace bash

/var/www#> _
```

Create new Laravel application named `dusk-test` and install Laravel Dusk package.

```
/var/www> laravel new dusk-test
/var/www> cd dusk-test
/var/www/dusk-test> composer require --dev laravel/dusk
/var/www/dusk-test> php artisan dusk:install
```

Create `.env.dusk.local` by copying from `.env` file.

```
/var/www/dusk-test> cp .env .env.dusk.local
```

Update the `APP_URL` entry in `.env.dusk.local` to local Laravel server.

```
APP_URL=http://localhost:8000
```

You will need to run chromedriver with `headless` and `no-sandbox` flag. In Laravel Dusk 2.x it is
already set `headless` so you just need to add `no-sandbox` flag. If you on previous version 1.x,
you will need to update your `DustTestCase#driver` as shown below. 


```
<?php

...

abstract class DuskTestCase extends BaseTestCase
{
    ...

    /**
    * Update chrome driver with below flags
    */
    protected function driver()
    {
        $options = (new ChromeOptions)->addArguments([
            '--disable-gpu',
            '--headless',
            '--no-sandbox'
        ]);

        return RemoteWebDriver::create(
            'http://localhost:9515', DesiredCapabilities::chrome()->setCapability(
                ChromeOptions::CAPABILITY, $options
            )
        );
    }
}
```

#### Choose Chrome Driver Version (Optional)

You could choose to use either:

1. Chrome Driver shipped with Laravel Dusk. (Default)
2. Chrome Driver installed in `workspace` container. (Required tweak on DuskTestCase class)

For Laravel 2.x, you need to update `DuskTestCase#prepare` method if you wish to go with option #2.

```

<?php

...
abstract class DuskTestCase extends BaseTestCase
{
    ...
    public static function prepare()
    {
        // Only add this line if you wish to use chrome driver installed in workspace container.
        // You might want to read the file path from env file.
        static::useChromedriver('/usr/local/bin/chromedriver');

        static::startChromeDriver();
    }
```

For Laravel 1.x, you need to add `DuskTestCase#buildChromeProcess` method if you wish to go with option #2.

```
<?php

...
use Symfony\Component\Process\ProcessBuilder;

abstract class DuskTestCase extends BaseTestCase
{
    ...

    /**
    * Only add this method if you wish to use chrome driver installed in workspace container
    */
    protected static function buildChromeProcess()
    {
        return (new ProcessBuilder())
            ->setPrefix('chromedriver')
            ->getProcess()
            ->setEnv(static::chromeEnvironment());
    }

    ...
}
```

#### Run Dusk Tests

Run local server in `workspace` container and run Dusk tests.

```
# alias to run Laravel server in the background (php artisan serve --quiet &)
/var/www/dusk-test> serve
# alias to run Dusk tests (php artisan dusk)
/var/www/dusk-test> dusk

PHPUnit 6.4.0 by Sebastian Bergmann and contributors.

.                                                                   1 / 1 (100%)

Time: 837 ms, Memory: 6.00MB
```

### Option 2: With Selenium

- [Intro](#dusk-intro)
- [DNS Setup](#dns-setup)
- [Docker Compose Setup](#docker-compose)
- [Laravel Dusk Setup](#laravel-dusk-setup)
- [Running Laravel Dusk Tests](#running-tests)

#### Intro
Setting up Laravel Dusk tests to run with Laradock appears be something that
eludes most Laradock users. This guide is designed to show you how to wire them
up to work together. This guide is written with macOS and Linux in mind. As such,
it's only been tested on macOS. Feel free to create pull requests to update the guide
for Windows-specific instructions.

This guide assumes you know how to use a DNS forwarder such as `dnsmasq` or are comfortable
with editing the `/etc/hosts` file for one-off DNS changes.

#### DNS Setup
According to RFC-2606, only four TLDs are reserved for local testing[^1]:

- `.test`
- `.example`
- `.invalid`
- `.localhost`

A common TLD used for local development is `.dev`, but newer versions of Google
Chrome (such as the one bundled with the Selenium Docker image), will fail to
resolve that DNS as there will appear to be a name collision.

The recommended extension is `.test` for your Laravel web apps because you're
running tests. Using a DNS forwarder such as `dnsmasq` or by editing the `/etc/hosts`
file, configure the host to point to `localhost`.

For example, in your `/etc/hosts` file:
```
##
# Host Database
#
# localhost is used to configure the loopback interface
# when the system is booting.  Do not change this entry.
##
127.0.0.1       localhost
255.255.255.255 broadcasthost
::1             localhost
127.0.0.1       myapp.test
```

This will ensure that when navigating to `myapp.test`, it will route the
request to `127.0.0.1` which will be handled by Nginx in Laradock.

#### Docker Compose setup
In order to make the Selenium container talk to the Nginx container appropriately,
the `docker-compose.yml` needs to be edited to accommodate this. Make the following
changes:

```yaml
...
selenium:
  ...
  depends_on:
  - nginx
  links:
  - nginx:<your_domain>
```

This allows network communication between the Nginx and Selenium containers
and it also ensures that when starting the Selenium container, the Nginx
container starts up first unless it's already running. This allows
the Selenium container to make requests to the Nginx container, which is
necessary for running Dusk tests. These changes also link the `nginx` environment
variable to the domain you wired up in your hosts file.

#### Laravel Dusk Setup

In order to make Laravel Dusk make the proper request to the Selenium container,
you have to edit the `DuskTestCase.php` file that's provided on the initial
installation of Laravel Dusk. The change you have to make deals with the URL the
Remote Web Driver attempts to use to set up the Selenium session.

One recommendation for this is to add a separate config option in your `.env.dusk.local`
so it's still possible to run your Dusk tests locally should you want to.

##### .env.dusk.local
```
...
USE_SELENIUM=true
```

##### DuskTestCase.php
```php
abstract class DuskTestCase extends BaseTestCase
{
...
    protected function driver()
    {
        if (env('USE_SELENIUM', 'false') == 'true') {
            return RemoteWebDriver::create(
                'http://selenium:4444/wd/hub', DesiredCapabilities::chrome()
            );
        } else {
            return RemoteWebDriver::create(
                'http://localhost:9515', DesiredCapabilities::chrome()
            );
        }
    }
}
```

#### Running Laravel Dusk Tests

Now that you have everything set up, to run your Dusk tests, you have to SSH
into the workspace container as you normally would:
```docker-compose exec --user=laradock workspace bash```

Once inside, you can change directory to your application and run:

```php artisan dusk```

One way to make this easier from your project is to create a helper script. Here's one such example:
```bash
#!/usr/bin/env sh

LARADOCK_HOME="path/to/laradock"

pushd ${LARADOCK_HOME}

docker-compose exec --user=laradock workspace bash -c "cd my-project && php artisan dusk && exit"
```

This invokes the Dusk command from inside the workspace container but when the script completes
execution, it returns your session to your project directory.

[^1]: [Don't Use .dev for Development](https://iyware.com/dont-use-dev-for-development/)


<br>
<br>
<br>
<br>
<br>

<a name="PHPStorm-Debugging"></a>
## PHPStorm XDebug Setup

- [Intro](#Intro)
- [Installation](#Installation)
    - [Customize laradock/docker-compose.yml](#CustomizeDockerCompose)
        - [Clean House](#InstallCleanHouse)
        - [Laradock Dial Tone](#InstallLaradockDialTone)
        - [hosts](#AddToHosts)
        - [Firewall](#FireWall)
        - [Enable xDebug on php-fpm](#enablePhpXdebug)
    - [PHPStorm Settings](#InstallPHPStorm)
        - [Configs](#InstallPHPStormConfigs)
- [Usage](#Usage)
    - [Laravel](#UsageLaravel)
        - [Run ExampleTest](#UsagePHPStormRunExampleTest)
        - [Debug ExampleTest](#UsagePHPStormDebugExampleTest)
        - [Debug Web Site](#UsagePHPStormDebugSite)
- [SSH into workspace](#SSHintoWorkspace)
    - [KiTTY](#InstallKiTTY)

### Intro

Wiring up [Laravel](https://laravel.com/), [Laradock](https://github.com/Laradock/laradock) [Laravel+Docker] and [PHPStorm](https://www.jetbrains.com/phpstorm/) to play nice together complete with remote xdebug'ing as icing on top! Although this guide is based on `PHPStorm Windows`,
you should be able to adjust accordingly. This guide was written based on Docker for Windows Native.

### Installation

- This guide assumes the following:
    - you have already installed and are familiar with Laravel, Laradock and PHPStorm.
    - you have installed Laravel as a parent of `laradock`. This guide assumes `/c/_dk/laravel`.

### hosts
- Add `laravel` to your hosts file located on Windows 10 at `C:\Windows\System32\drivers\etc\hosts`. It should be set to the IP of your running container. Mine is: `10.0.75.2`
On Windows you can find it by opening Windows `Hyper-V Manager`.
    - ![Windows Hyper-V Manager](images/photos/PHPStorm/Settings/WindowsHyperVManager.png)

- [Hosts File Editor](https://github.com/scottlerch/HostsFileEditor) makes it easy to change your hosts file.
    - Set `laravel` to your docker host IP. See [Example](images/photos/SimpleHostsEditor/AddHost_laravel.png).


### Firewall
Your PHPStorm will need to be able to receive a connection from PHP xdebug either your running workspace or php-fpm containers on port 9000. This means that your Windows Firewall should either enable connections from the Application PHPStorm OR the port.

- It is important to note that if the Application PHPStorm is NOT enabled in the firewall, you will not be able to recreate a rule to override that.
- Also be aware that if you are installing/upgrade different versions of PHPStorm, you MAY have orphaned references to PHPStorm in your Firewall! You may decide to remove orphaned references however in either case, make sure that they are set to receive public TCP traffic.

#### Edit laradock/docker-compose.yml
Set the following variables:
```
### Workspace Utilities Container ###############

    workspace:
        build:
            context: ./workspace
            args:
                - INSTALL_XDEBUG=true
                - INSTALL_WORKSPACE_SSH=true
                ...


### PHP-FPM Container #####################

    php-fpm:
        build:
            context: ./php-fpm
            args:
                - INSTALL_XDEBUG=true
                ...

```

#### Edit xdebug.ini files
- `laradock/workspace/xdebug.ini`
- `laradock/php-fpm/xdebug.ini`

Set the following variables:

```
xdebug.remote_autostart=1
xdebug.remote_enable=1
xdebug.remote_connect_back=1
xdebug.cli_color=1
```


#### Need to clean house first?

Make sure you are starting with a clean state. For example, do you have other Laradock containers and images?
Here are a few things I use to clean things up.

- Delete all containers using `grep laradock_` on the names, see: [Remove all containers based on docker image name](https://linuxconfig.org/remove-all-containners-based-on-docker-image-name).

`docker ps -a | awk '{ print $1,$2 }' | grep laradock_ | awk '{print $1}' | xargs -I {} docker rm {}`

- Delete all images containing `laradock`.

`docker images | awk '{print $1,$2,$3}' | grep laradock_ | awk '{print $3}' | xargs -I {} docker rmi {}`
**Note:** This will only delete images that were built with `Laradock`, **NOT** `laradock/*` which are pulled down by `Laradock` such as `laradock/workspace`, etc.
**Note:** Some may fail with:
`Error response from daemon: conflict: unable to delete 3f38eaed93df (cannot be forced) - image has dependent child images`

- I added this to my `.bashrc` to remove orphaned images.

```
dclean() {
    processes=`docker ps -q -f status=exited`
    if [ -n "$processes" ]; then
      docker rm $processes
    fi

    images=`docker images -q -f dangling=true`
    if [ -n "$images" ]; then
      docker rmi $images
    fi
}
```

- If you frequently switch configurations for Laradock, you may find that adding the following and added to your `.bashrc` or equivalent useful:

```
# remove laravel* containers
# remove laravel_* images
dcleanlaradockfunction()
{
	echo 'Removing ALL containers associated with laradock'
	docker ps -a | awk '{ print $1,$2 }' | grep laradock | awk '{print $1}' | xargs -I {} docker rm {}

	# remove ALL images associated with laradock_
	# does NOT delete laradock/* which are hub images
	echo 'Removing ALL images associated with laradock_'
	docker images | awk '{print $1,$2,$3}' | grep laradock_ | awk '{print $3}' | xargs -I {} docker rmi {}

	echo 'Listing all laradock docker hub images...'
	docker images | grep laradock

	echo 'dcleanlaradock completed'
}
# associate the above function with an alias
# so can recall/lookup by typing 'alias'
alias dcleanlaradock=dcleanlaradockfunction
```


### Let's get a dial-tone with Laravel

```
# barebones at this point
docker-compose up -d nginx mysql

# run
docker-compose ps

# Should see:
          Name                        Command             State                     Ports
-----------------------------------------------------------------------------------------------------------
laradock_mysql_1            docker-entrypoint.sh mysqld   Up       0.0.0.0:3306->3306/tcp
laradock_nginx_1            nginx                         Up       0.0.0.0:443->443/tcp, 0.0.0.0:80->80/tcp
laradock_php-fpm_1          php-fpm                       Up       9000/tcp
laradock_volumes_data_1     true                          Exit 0
laradock_volumes_source_1   true                          Exit 0
laradock_workspace_1        /sbin/my_init                 Up       0.0.0.0:2222->22/tcp
```

### Enable xDebug on php-fpm

In a host terminal sitting in the laradock folder, run: `./php-fpm/xdebug status`
You should see something like the following:

```
xDebug status
laradock_php-fpm_1
PHP 7.0.9 (cli) (built: Aug 10 2016 19:45:48) ( NTS )
Copyright (c) 1997-2016 The PHP Group
Zend Engine v3.0.0, Copyright (c) 1998-2016 Zend Technologies
    with Xdebug v2.4.1, Copyright (c) 2002-2016, by Derick Rethans
```

Other commands include `./php-fpm/xdebug start | stop`.

If you have enabled `xdebug=true` in `docker-compose.yml/php-fpm`, `xdebug` will already be running when
`php-fpm` is started and listening for debug info on port 9000.


### PHPStorm Settings

- Here are some settings that are known to work:
    - `Settings/BuildDeploymentConnection`
        - ![Settings/BuildDeploymentConnection](/images/photos/PHPStorm/Settings/BuildDeploymentConnection.png)

    - `Settings/BuildDeploymentConnectionMappings`
        - ![Settings/BuildDeploymentConnectionMappings](/images/photos/PHPStorm/Settings/BuildDeploymentConnectionMappings.png)

    - `Settings/BuildDeploymentDebugger`
        - ![Settings/BuildDeploymentDebugger](/images/photos/PHPStorm/Settings/BuildDeploymentDebugger.png)

    - `Settings/EditRunConfigurationRemoteWebDebug`
        - ![Settings/EditRunConfigurationRemoteWebDebug](/images/photos/PHPStorm/Settings/EditRunConfigurationRemoteWebDebug.png)

    - `Settings/EditRunConfigurationRemoteExampleTestDebug`
        - ![Settings/EditRunConfigurationRemoteExampleTestDebug](/images/photos/PHPStorm/Settings/EditRunConfigurationRemoteExampleTestDebug.png)

    - `Settings/LangsPHPDebug`
        - ![Settings/LangsPHPDebug](/images/photos/PHPStorm/Settings/LangsPHPDebug.png)

    - `Settings/LangsPHPInterpreters`
        - ![Settings/LangsPHPInterpreters](/images/photos/PHPStorm/Settings/LangsPHPInterpreters.png)

    - `Settings/LangsPHPPHPUnit`
        - ![Settings/LangsPHPPHPUnit](/images/photos/PHPStorm/Settings/LangsPHPPHPUnit.png)

    - `Settings/LangsPHPServers`
        - ![Settings/LangsPHPServers](/images/photos/PHPStorm/Settings/LangsPHPServers.png)

    - `RemoteHost`
        To switch on this view, go to: `Menu/Tools/Deployment/Browse Remote Host`.
        - ![RemoteHost](/images/photos/PHPStorm/RemoteHost.png)

    - `RemoteWebDebug`
        - ![DebugRemoteOn](/images/photos/PHPStorm/DebugRemoteOn.png)

    - `EditRunConfigurationRemoteWebDebug`
        Go to: `Menu/Run/Edit Configurations`.
        - ![EditRunConfigurationRemoteWebDebug](/images/photos/PHPStorm/Settings/EditRunConfigurationRemoteWebDebug.png)

    - `EditRunConfigurationRemoteExampleTestDebug`
        Go to: `Menu/Run/Edit Configurations`.
        - ![EditRunConfigurationRemoteExampleTestDebug](/images/photos/PHPStorm/Settings/EditRunConfigurationRemoteExampleTestDebug.png)

    - `WindowsFirewallAllowedApps`
        Go to: `Control Panel\All Control Panel Items\Windows Firewall\Allowed apps`.
        - ![WindowsFirewallAllowedApps.png](/images/photos/PHPStorm/Settings/WindowsFirewallAllowedApps.png)

    - `hosts`
        Edit: `C:\Windows\System32\drivers\etc\hosts`.
        - ![WindowsFirewallAllowedApps.png](/images/photos/PHPStorm/Settings/hosts.png)

        - [Enable xDebug on php-fpm](#enablePhpXdebug)



### Usage

#### Run ExampleTest
- right-click on `tests/ExampleTest.php`
    - Select: `Run 'ExampleTest.php'` or `Ctrl+Shift+F10`.
    - Should pass!! You just ran a remote test via SSH!

#### Debug ExampleTest
- Open to edit: `tests/ExampleTest.php`
- Add a BreakPoint on line 16: `$this->visit('/')`
- right-click on `tests/ExampleTest.php`
    - Select: `Debug 'ExampleTest.php'`.
    - Should have stopped at the BreakPoint!! You are now debugging locally against a remote Laravel project via SSH!
    - ![Remote Test Debugging Success](/images/photos/PHPStorm/RemoteTestDebuggingSuccess.png)

#### Debug WebSite
- In case xDebug is disabled, from the `laradock` folder run:
`./php-fpm/xdebug start`.
    - To switch xdebug off, run:
`./php-fpm/xdebug stop`

- Start Remote Debugging
    - ![DebugRemoteOn](/images/photos/PHPStorm/DebugRemoteOn.png)

- Open to edit: `bootstrap/app.php`
- Add a BreakPoint on line 14: `$app = new Illuminate\Foundation\Application(`
- Reload [Laravel Site](http://laravel/)
    - Should have stopped at the BreakPoint!! You are now debugging locally against a remote Laravel project via SSH!
    - ![Remote Debugging Success](/images/photos/PHPStorm/RemoteDebuggingSuccess.png)


### Let's shell into workspace
Assuming that you are in laradock folder, type:
`ssh -i workspace/insecure_id_rsa -p2222 root@laravel`
**Cha Ching!!!!**
- `workspace/insecure_id_rsa.ppk` may become corrupted. In which case:
    - fire up `puttygen`
    - import `workspace/insecure_id_rsa`
    - save private key to `workspace/insecure_id_rsa.ppk`

#### KiTTY
[Kitty](http://www.9bis.net/kitty/) KiTTY is a fork from version 0.67 of PuTTY.

- Here are some settings that are working for me:
    - ![Session](/images/photos/KiTTY/Session.png)
    - ![Terminal](/images/photos/KiTTY/Terminal.png)
    - ![Window](/images/photos/KiTTY/Window.png)
    - ![WindowAppearance](/images/photos/KiTTY/WindowAppearance.png)
    - ![Connection](/images/photos/KiTTY/Connection.png)
    - ![ConnectionData](/images/photos/KiTTY/ConnectionData.png)
    - ![ConnectionSSH](/images/photos/KiTTY/ConnectionSSH.png)
    - ![ConnectionSSHAuth](/images/photos/KiTTY/ConnectionSSHAuth.png)
    - ![TerminalShell](/images/photos/KiTTY/TerminalShell.png)

<br>
<br>
<br>
<br>
<br>

<a name="Setup remote debugging (PhpStorm)"></a>
## Setup remote debugging for PhpStorm on Linux

 - Make sure you have followed the steps above in the [Install Xdebug section](#install-xdebug).

 - Make sure Xdebug accepts connections and listens on port 9000. (Should be default configuration).

![Debug Configuration](/images/photos/PHPStorm/linux/configuration/debugConfiguration.png "Debug Configuration").

 - Create a server with name `laradock` (matches **PHP_IDE_CONFIG** key in environment file) and make sure to map project root path with server correctly.

![Server Configuration](/images/photos/PHPStorm/linux/configuration/serverConfiguration.png "Server Configuration").

 - Start listening for debug connections, place a breakpoint and you are good to go !
