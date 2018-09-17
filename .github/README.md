# Onestic - Laradock

## Simplified version

### Packages

- Database engines: MySQL, PostgreSQL, MongoDB
- Cache Engiens: Redis, Memcached
- PHP Servers: NGINX, Apache2
- PHP Compilers: PHP FPM
- Message Queueing: RabbitMQ

### Modifications

- Setup for MacOS with PHPStorm w/ xDebug instructions

### Getting started

- Clone this repository
- Create your own .env file copying from the env-example file

```cp env-example .env```

- Modify the .env file using your owns settings. You can setup the folder where your web files are with the variable:
```APP_CODE_PATH_HOST```
- Start your container using the command:

```console/commands/start.sh```

### Command Setup

For install it globally in your computer use this method:

- Create the following symbolic link (In root project)

``` sudo ln -s $(pwd)/bin/ondocker /usr/local/bin/```

*Note:* If you have multiple instances of this repo and want to keep each one as separated, you can use the previous command like this:

```sudo ln -s /path/to/first/project/bin/ondocker-example1 /usr/local/bin```

```sudo ln -s /path/to/second/project/bin/ondocker-example2 /usr/local/bin```

You could use `ondocker-example1` and `ondocker-example2` to run commands on each instance separately.

### Usage
The command must be executed in root project

- List commands available

``` ondocker --help ```

- Execute desired command

``` ondocker <command> ```

### PHPStorm xDebug Setup

Once you have the environment installed with previous instructions, you must setup your IDE to allow the debugging correctly.

First of all, establish the PHP source path.
Open Preferences, then Languages & Frameworks > PHP. Click on the '+' icon and type a name. Then, pick the path for your php binary on your local machine.
You must see an image similar to this:
<br/>
<br/>
<img src="https://raw.githubusercontent.com/onestic/laradock/master/.github/img/xdebug-php-cli.png">
<br/> 
<br/> 
Once you see that PHPStorm show your PHP version successfully, you must add the docker web server.
Go now to Languages & Frameworks > PHP > Servers, click on '+' icon, and fill the fields as you can see on the next image. Also, check the 'Use path mappings' checkbox and enter the path '/var/www' on the right side of your local web folder.
<br/>
<br/>
<img src="https://raw.githubusercontent.com/onestic/laradock/master/.github/img/xdebug-php-server.png">
<br/>
<br/>
Now we can do the final steps and set the xDebug settings for PHPStorm to listen the right ip & port.
At Language & Frameworks > PHP > Debug, uncheck the two checkboxes down from 'Debug port', and enter '9001' on 'Debug port', as you can see on the next image:
<br/>
<br/>
<img src="https://raw.githubusercontent.com/onestic/laradock/master/.github/img/xdebug-php-connection.png">
<br/>
<br/>
Then, go inside Language & Frameworks > PHP > Debug > DBGp Proxy and fill the fields with the same settings as you can see on the following image:
<br/>
<br/>
<img src="https://raw.githubusercontent.com/onestic/laradock/master/.github/img/xdebug-php-proxy.png">
<br/>
<br/>
At this point, you must set on your local network a way to alias the ip 10.254.254.254 to it. Depends your OS, you should use this command:
<br/>
<br/>
<strong>For MacOS:</strong><br/>
```sudo ifconfig lo0 alias 10.254.254.254 255.255.255.0```<br/>
<strong>For Linux:</strong><br>
```sudo ifconfig lo:0 10.254.254.254 up```

Finally, you can test your settings by enabling the xDebug. Just click on 'Debug...' item under the 'Run' menu from the Toolbar.
Add a breakpoint on your code, open your browser, and navigate to your localhost url to see the magic.