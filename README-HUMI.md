# Humidock

Humidock is the local hosting platform for Humi applications. Humidock is a fork of Laradock, and it uses Docker.

## Prerequisites

Docker is required. [Install](https://docs.docker.com/install/)

## Setting up Humidock

### Directory structure

Clone the Humidock repo at the same level as your application repositories.

    Note: Humidock needs to live in the same directory as the applications it hosts. If the Laravel application lives in `~/code/humi/application`, then Humidock should live in `~/code/humi/humidock`.

### Additional Docker Configuration

#### Env file

Create a `.env` file in Humidock by copying the example file. 

`env-example`. `cp env-example .env`


#### Resolving applications

Humidock will mount the Humi applications in the container. Humidock uses the the **application's directory name**.

Verify the /nginx/sites/conf files point to the correct directories using the pattern `root /var/www/APP_FOLDER/public`.

Example: If your Laravel Api is in a directory called `application`, the NGINX config file at `nginx/sites/application.conf` should contain the following line: `root /var/www/application/public;`

Now, set your hosts file on your host machine to redirect to the applications.

`/etc/hosts`
```
127.0.0.1 local.api.humi.ca
127.0.0.1 local-admin.api.humi.ca
```

### Application Configuration

The Laravel API and Humi Hideaway environment files need to be modified to work with Docker.

In both the Laravel API and Hideaway, make a `.env` file based on the sample. `cp .env.local .env`.

In the Laravel API, make a `.env.testing` file based on the sample. `cp .env.local .env.testing`.

Both the `.env` and the `.env.testing` files need to use the Docker supplied database and redis. Verify both files contain these lines:

```
DB_HOST=mysql
DB_USERNAME=root
DB_PASSWORD=root
DB_DATABASE=humi
REDIS_HOST=redis
```

For the Laravel application, you must also set the following on both `.env` and `.env.testing`:

```
DB_HOST_V1=mysql
DB_USERNAME_V1=root
DB_PASSWORD_V1=root
DB_DATABASE_V1=humi_v1
```

Any `.env` files (not `.env.testing`) that reference other Humi applications need to be modified:

TODO:  - service api urls: use /etc/hosts aliases (local.api.humi.ca)

#### Setting Up Payroll
Humi Payroll is still on Vagrant, so you cannot connect to it as a Docker Service.

MAC: `PAYROLL_API_URL="http://docker.for.mac.localhost:3030/v2"`

    `http` not `https`, port number, `/v2`, and double quotes necessary

WIN: `PAYROLL_API_URL=docker.for.win.localhost`

LINUX: `PAYROLL_API_URL="http://172.17.0.1:3030/v2"` 
 
    If the ip address for Linux does not work, you'll need to find the ip address for your host machine as it is known in the docker network. You can find it on your host machine using `ip addr | grep docker` (https://nickjanetakis.com/blog/docker-tip-65-get-your-docker-hosts-ip-address-from-in-a-container).

## Running the Applications

You can either run all Docker commands directly, or through the `dock` shell script included with the project. The `dock` shell script makes everything much easier, but it's a good idea to see what it's doing by looking at the code.

You can create a shell alias to the command. `alias dock=$HOME/code/humi/humidock/dock`

To start Humidock (and all applications it hosts), run `dock up` which calls (`docker-compose up -d nginx mysql redis workspace`)

### Database Migration

To run the database migrations, you need first to run `dock workspace`,then 
1. in `application` folder run `php artisan humi:migrate --drop --seed --deploy` (if command failed, first run `composer install`)
As an alternative, you may run `docker-compose exec --user=laradock workspace php artisan humi:migrate --drop --seed --deploy`.
2. in `administration` folder run `php artisan migrate:fresh --seed` (if command failed, first run `composer install`)

### Accessing workspace

To access the workspace using bash, run `dock workspace` or `docker-compose exec --user=laradock workspace bash`

If we wish to ssh to the workspace, enable the `INSTALL_WORKSPACE_SSH` flag as per the docs
(https://laradock.io/documentation/#access-workspace-via-ssh)

```bash
ssh -o PasswordAuthentication=no    \
    -o StrictHostKeyChecking=no     \
    -o UserKnownHostsFile=/dev/null \
    -p 2222                         \
    -i workspace/insecure_id_rsa    \
    laradock@localhost
```

see ./dock for other relevant commands/learning

## Issues 

1. How does composer update/install work now? What's the flow?
2. On Linux, Tom has to use `sudo` for `dock up` the first time it's run. Shouldn't have to. 
