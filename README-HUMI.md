# Humidock

Humidock is the local hosting platform for Humi applications. Humidock is a fork of Laradock, and it uses Docker.

## Prerequisites

Docker is required. [Install](https://docs.docker.com/install/)

## Setting up Humidock

### Directory structure

Clone the Humidock repo at the same level as your application repositories.

    Note: Humidock needs to live in the same directory as the applications it hosts. Ex: If the Laravel application lives in `~/code/humi/application`, then Humidock should live in `~/code/humi/dock`.

### Additional Docker Configuration

#### Resolving applications

Humidock will mount the Humi applications in the container. Humidock uses the the application's directory name.

Verify the /nginx/sites/conf files point to the correct directories using the pattern `root /var/www/APP_FOLDER/public`.

Example: If your Laravel Api is in a directory called `application`, the NGINX config file at `nginx/sites/application.conf` should contain the following line: `root /var/www/application/public;`

Now, set your hosts file on your host machine to redirect to the applications.

`/etc/hosts`
```
127.0.0.1 local.api.humi.ca
127.0.0.1 local-admin.api.humi.ca
```

- Verify mysql 8.0 support with `default_authentication_plugin=mysql_native_password` in /mysql/my.cnf
- Verify the mysql init script in /mysql creates the required databases

#### Setup your own environment file

- cp env-example .env

- Update your local .env/.env.testing files with the following host aliases

  - database hosts: mysql
  - redis host: redis
  - service api urls: use /etc/hosts aliases (local.api.humi.ca)
  - vagrant urls: use docker.for.mac.localhost (on mac) docker.for.win.localhost (on win) start your container and find the host ip address from inside the container, typically labeled docker0 (linux)

- change the database credentials to root/root

see https://laradock.io/documentation/ for all the environment options (including running workers, cron scheduling, etc)
see https://nickjanetakis.com/blog/docker-tip-65-get-your-docker-hosts-ip-address-from-in-a-container for instructions on finding your host ip address

#### Now run docker

- Optional, add the dock command to your path export `export PATH=$PATH:/Users/kevinlanglois/www/humi/humidock`

- run `dock up` or `./dock up` or `docker-compose up -d nginx mysql redis workspace`

#### Accessing workspace

You can access the workspace using bash

- run `dock workspace` or `./dock workspace` or `docker-compose exec --user=laradock workspace bash`

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

```bash
  ./dock workspace - exec bash into workspace

      (docker-compose exec --user=laradock workspace bash)

  ./dock up - start all containers

      (docker-compose up -d nginx mysql redis workspace )

  ./dock down - stop all containers

      (docker-compose stop, docker stop $(docker ps -aq), docker rm $(docker ps -aq))

  ./dock kill - destroy all containers

      (docker system prune -a)

  ./dock build service - build container by name

      (docker-compose build $2)

```
