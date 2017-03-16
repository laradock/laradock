---
title: Getting Started
type: index
weight: 2
---

## Requirements

- [Git](https://git-scm.com/downloads)
- [Docker](https://www.docker.com/products/docker/) `>= 1.12`







## Installation

Choose the setup the best suits your needs.

- [A) Setup for Single Project](#A)
	- [A.1) Already have a PHP project](#A1)
 	- [A.2) Don't have a PHP project yet](#A2)
- [B) Setup for Multiple Projects](#B)


<a name="A"></a>
### A) Setup for Single Project
> (Follow these steps if you want a separate Docker environment for each project)


<a name="A1"></a>
### A.1) Already have a PHP project:
> (Follow these steps if you already have a PHP project, and all you need is an environment to run it)

1 - Clone laradock on your project root directory:

```bash
git submodule add https://github.com/Laradock/laradock.git
```

**Notes:**

- If you are not using Git yet for your project, you can use `git clone` instead of `git submodule `.

- Note 2: To keep track of your Laradock changes, between your projects and also keep Laradock updated. [Check this](#keep-tracking-Laradock)


Your folder structure should look like this:

```
- project-A
	- laradock-A
- project-B
	- laradock-B
```

(It's important to rename the folders differently in each project)

<a name="A2"></a>
### A.2) Don't have a PHP project yet:
> (Follow these steps if you don't have a PHP project yet, and you need an environment to create the project)

1 - Clone this repository anywhere on your machine:

```bash
git clone https://github.com/laradock/laradock.git
```

Your folder structure should look like this:

```
- laradock
- Project-Z
```

2 - Edit the `docker-compose.yml` file to map to your project directory once you have it (example: `- ../Project-Z:/var/www`).

3 - Stop and re-run your docker-compose command for the changes to take place.

```
docker-compose stop && docker-compose up -d XXXX YYYY ZZZZ ....
```

<a name="B"></a>
### B) Setup for Multiple Projects:
> (Follow these steps if you want a single Docker environment for all project)

1 - Clone this repository anywhere on your machine:

```bash
git clone https://github.com/laradock/laradock.git
```

2 - Edit the `docker-compose.yml` (or the `.env`) file to map to your projects directories:

```
    applications:
        volumes:
            - ../project1/:/var/www/project1
            - ../project2/:/var/www/project2
```

3 - You can access all sites by visiting `http://localhost/project1/public` and `http://localhost/project2/public` but of course that's not very useful so let's setup NGINX quickly.


4 - Go to `nginx/sites` and copy `sample.conf.example` to `project1.conf` then to `project2.conf`

5 - Open the `project1.conf` file and edit the `server_name` and the `root` as follow:

```
    server_name project1.dev;
    root /var/www/project1/public;
```
Do the same for each project `project2.conf`, `project3.conf`,...

6 - Add the domains to the **hosts** files.

```
127.0.0.1  project1.dev
```

7 - Create your project Databases. Right now you have to do it manually by entering your DB container, until we automate it soon.







## Usage

**Read Before starting:**

If you are using **Docker Toolbox** (VM), do one of the following:

- Upgrade to Docker [Native](https://www.docker.com/products/docker) for Mac/Windows (Recommended). Check out [Upgrading Laradock](#upgrading-laradock)
- Use Laradock v3.* (Visit the `Laradock-ToolBox` [Branch](https://github.com/laradock/laradock/tree/Laradock-ToolBox)).

<br>

>**Warning:** If you used an older version of Laradock it's highly recommended to rebuild the containers you need to use [see how you rebuild a container](#Build-Re-build-Containers) in order to prevent as much errors as possible.

<br>

1 - Run Containers: *(Make sure you are in the `laradock` folder before running the `docker-compose` commands).*


**Example:** Running NGINX and MySQL:

```bash
docker-compose up -d nginx mysql
```

**Note**: The `workspace` and `php-fpm` will run automatically in most of the cases, so no need to specify them in the `up` command. If you couldn't find them running then you need specify them as follow: `docker-compose up -d nginx php-fpm mysql workspace`.


You can select your own combination of Containers form the list below:

`nginx`, `hhvm`, `php-fpm`, `mysql`, `redis`, `postgres`, `mariadb`, `neo4j`, `mongo`, `apache2`, `caddy`, `memcached`, `beanstalkd`, `beanstalkd-console`, `rabbitmq`, `beanstalkd-console`, `workspace`, `phpmyadmin`, `aerospike`, `pgadmin`, `elasticsearch`, `rethinkdb`, `postgres-postgis`, `certbot`, `mailhog`, `minio` and more...!

*(Please note that sometimes we forget to update the docs, so check the `docker-compose.yml` file to see an updated list of all available containers).*


<br>
2 - Enter the Workspace container, to execute commands like (Artisan, Composer, PHPUnit, Gulp, ...).

```bash
docker-compose exec workspace bash
```

Alternatively, for Windows PowerShell users: execute the following command to enter any running container:

```bash
docker exec -it {workspace-container-id} bash
```

**Note:** You can add `--user=laradock` to have files created as your host's user. Example: 

```shell
docker-compose exec --user=laradock workspace bash
```

*You can change the PUID (User id) and PGID (group id) variables from the `docker-compose.yml` or the `.env`)*

<br>
3 - Edit your project configurations.

Open your `.env` file and set the `DB_HOST` to `mysql`:

```env
DB_HOST=mysql
```

*If you want to install Laravel as PHP project, see [How to Install Laravel in a Docker Container](#Install-Laravel).*

<br>
4 - Open your browser and visit your localhost address `http://localhost/`.
