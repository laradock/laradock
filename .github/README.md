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

```bin/start.sh```


### PHPStorm xDebug Setup

Once you have the environment installed with previous instructions, you must setup your IDE to allow the debugging correctly.

First of all, establish the PHP source path
<img src="https://github.com/onestic/laradock/master/.github/img/xdebug-php-cli.png"> 