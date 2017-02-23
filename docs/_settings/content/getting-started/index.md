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

#### A) Setup for Single Project:
*(In case you want a Docker environment for each project)*

##### A.1) Setup environment in existing Project:
*(In case you already have a project, and you want to setup an environment to run it)*

1 - Clone this repository on your project root directory:

```bash
git submodule add https://github.com/Laradock/laradock.git
```

*Note 1: If you are not yet using Git for your PHP project, you can use `git clone https://github.com/Laradock/laradock.git` instead.*

*Note 2: To keep track of your LaraDock changes, between your projects and also keep LaraDock updated. [Check this](#keep-tracking-LaraDock)*

*Note 3: In this case the folder structure will be like this:*

```
- project1
	- laradock
- project2
	- laradock
```

##### A.2) Setup environment first then create project:
*(In case you don't have a project, and you want to create your project inside the Docker environment)*

1 - Clone this repository anywhere on your machine:

```bash
git clone https://github.com/laradock/laradock.git
```
Note: In this case the folder structure will be like this:

```
- projects
	- laradock
	- myProject
```

2 - Edit the `docker-compose.yml` file to map to your project directory once you have it (example: `- ../myProject:/var/www`).

3 - Stop and re-run your docker-compose command for the changes to take place.

```
docker-compose stop && docker-compose up -d XXXX YYYY ZZZZ ....
```


#### B) Setup for Multiple Projects:

1 - Clone this repository anywhere on your machine:

```bash
git clone https://github.com/laradock/laradock.git
```

2 - Edit the `docker-compose.yml` file to map to your projects directories:

```
    applications:
        image: tianon/true
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

- Upgrade to Docker [Native](https://www.docker.com/products/docker) for Mac/Windows (Recommended). Check out [Upgrading LaraDock](#upgrading-laradock)
- Use LaraDock v3.* (Visit the `LaraDock-ToolBox` [Branch](https://github.com/laradock/laradock/tree/LaraDock-ToolBox)).

<br>

>**Warning:** If you used an older version of LaraDock it's highly recommended to rebuild the containers you need to use [see how you rebuild a container](#Build-Re-build-Containers) in order to prevent errors as much as possible.

<br>

1 - Run Containers: *(Make sure you are in the `laradock` folder before running the `docker-compose` commands).*


**Example:** Running NGINX and MySQL:

```bash
docker-compose up -d nginx mysql
```

**Note**: The `workspace` and `php-fpm` will run automatically in most of the cases, so no need to specify them in the `up` command. If you couldn't find them running then you need specify them as follow: `docker-compose up -d nginx php-fpm mysql workspace`.


You can select your own combination of Containers form the list below:

`nginx`, `hhvm`, `php-fpm`, `mysql`, `redis`, `postgres`, `mariadb`, `neo4j`, `mongo`, `apache2`, `caddy`, `memcached`, `beanstalkd`, `beanstalkd-console`, `rabbitmq`, `workspace`, `phpmyadmin`, `aerospike`, `pgadmin`, `elasticsearch`, `rethinkdb`.


<br>
2 - Enter the Workspace container, to execute commands like (Artisan, Composer, PHPUnit, Gulp, ...).

```bash
docker-compose exec workspace bash
```

Alternatively, for Windows PowerShell users: execute the following command to enter any running container:

```bash
docker exec -it {workspace-container-id} bash
```

**Note:** You can add `--user=laradock` (example `docker-compose exec --user=laradock workspace bash`) to have files created as your host's user. (you can change the PUID (User id) and PGID (group id) variables from the `docker-compose.yml`).

<br>
3 - Edit your project configurations.

Open your `.env` file and set the `DB_HOST` to `mysql`:

```env
DB_HOST=mysql
```

*If you want to use Laravel and you don't have it installed yet, see [How to Install Laravel in a Docker Container](#Install-Laravel).*

<br>
4 - Open your browser and visit your localhost address (`http://localhost/`).

<br>
**Debugging**: if you are facing any problem here check the [Debugging](#debugging) section.

If you need a special support. Contact me, more details in the [Help & Questions](#Help) section.
