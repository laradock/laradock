---
title: 2. Getting Started
type: index
weight: 2
---

## 2.1 Requirements

- [Git](https://git-scm.com/downloads)
- [Docker](https://www.docker.com/products/docker/) `>= 17.12`




## 2.2 Installation

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

1 - Clone laradock on your project root directory:

```bash
git submodule add https://github.com/Laradock/laradock.git
```

Note: If you are not using Git yet for your project, you can use `git clone` instead of `git submodule `.

*To keep track of your Laradock changes, between your projects and also keep Laradock updated [check these docs](/documentation/#keep-track-of-your-laradock-changes)*


2 - Make sure your folder structure should look like this:

```
+ project-a
  + laradock-a
+ project-b
  + laradock-b
```

*(It's important to rename the laradock folders to unique name in each project, if you want to run laradock per project).*

3 - Go to the [Usage](#Usage) section.

<a name="A2"></a>
### A.2) Don't have a PHP project yet:

1 - Clone this repository anywhere on your machine:

```bash
git clone https://github.com/laradock/laradock.git
```

Your folder structure should look like this:

```
+ laradock
+ project-z
```

2 - Edit your web server sites configuration.

We'll need to do step 1 of the [Usage](#Usage) section now to make this happen.

```
cp env-example .env
```

At the top, change the `APP_CODE_PATH_HOST` variable to your project path.

```
APP_CODE_PATH_HOST=../project-z/
```

Make sure to replace `project-z` with your project folder name.

3 - Go to the [Usage](#Usage) section.


<a name="B"></a>
### B) Setup for Multiple Projects:
> (Follow these steps if you want a single Docker environment for all your projects)

1 - Clone this repository anywhere on your machine (similar to [Steps A.2. from above](#A2)):

```bash
git clone https://github.com/laradock/laradock.git
```

Your folder structure should look like this:

```
+ laradock
+ project-1
+ project-2
```

2 - Go to your web server and create config files to point to different project directory when visiting different domains:

For **Nginx** go to `nginx/sites`, for **Apache2** `apache2/sites`. 

Laradock by default includes some sample files for you to copy `app.conf.example`, `laravel.conf.example` and `symfony.conf.example`.

3 - change the default names `*.conf`:

You can rename the config files, project folders and domains as you like, just make sure the `root` in the config files, is pointing to the correct project folder name.

4 - Add the domains to the **hosts** files.

```
127.0.0.1  project-1.test
127.0.0.1  project-2.test
...
```

If you use Chrome 63 or above for development, don't use `.dev`. [Why?](https://laravel-news.com/chrome-63-now-forces-dev-domains-https). Instead use `.localhost`, `.invalid`, `.test`, or `.example`.

4 - Go to the [Usage](#Usage) section.







<a name="Usage"></a>
## 2.3 Usage

**Read Before starting:**

If you are using **Docker Toolbox** (VM), do one of the following:

- Upgrade to Docker [Native](https://www.docker.com/products/docker) for Mac/Windows (Recommended). Check out [Upgrading Laradock](/documentation/#upgrading-laradock)
- Use Laradock v3.\*. Visit the [Laradock-ToolBox](https://github.com/laradock/laradock/tree/LaraDock-ToolBox) branch. *(outdated)*

<br>

We recommend using a Docker version which is newer than 1.13. 

<br>

>**Warning:** If you used an older version of Laradock it's highly recommended to rebuild the containers you need to use [see how you rebuild a container](#Build-Re-build-Containers) in order to prevent as much errors as possible.

<br>

1 - Enter the laradock folder and copy `env-example` to `.env`

```shell
cp env-example .env
```

You can edit the `.env` file to choose which software's you want to be installed in your environment. You can always refer to the `docker-compose.yml` file to see how those variables are being used.

Depending on the host's operating system you may need to change the value given to `COMPOSE_FILE`. When you are running Laradock on Mac OS the correct file separator to use is `:`. When running Laradock from a Windows environment multiple files must be separated with `;`.

By default the containers that will be created have the current directory name as suffix (e.g. `laradock_workspace_1`). This can cause mixture of data inside the container volumes if you use laradock in multiple projects. In this case, either read the guide for [multiple projects](#B) or change the variable `COMPOSE_PROJECT_NAME` to something unique like your project name.

2 - Build the environment and run it using `docker-compose`

In this example we'll see how to run NGINX (web server) and MySQL (database engine) to host a PHP Web Scripts:

```bash
docker-compose up -d nginx mysql
```

**Note**: All the web server containers `nginx`, `apache` ..etc depends on `php-fpm`, which means if you run any of them, they will automatically launch the `php-fpm` container for you, so no need to explicitly specify it in the `up` command. If you have to do so, you may need to run them as follows: `docker-compose up -d nginx php-fpm mysql`.


You can select your own combination of containers from [this list](http://laradock.io/introduction/#supported-software-images).

*(Please note that sometimes we forget to update the docs, so check the `docker-compose.yml` file to see an updated list of all available containers).*


<br>
3 - Enter the Workspace container, to execute commands like (Artisan, Composer, PHPUnit, Gulp, ...)

```bash
docker-compose exec workspace bash
```

*Alternatively, for Windows PowerShell users: execute the following command to enter any running container:*

```bash
docker exec -it {workspace-container-id} bash
```

**Note:** You can add `--user=laradock` to have files created as your host's user. Example: 

```shell
docker-compose exec --user=laradock workspace bash
```

*You can change the PUID (User id) and PGID (group id) variables from the `.env` file)*

<br>
4 - Update your project configuration to use the database host

Open your PHP project's `.env` file or whichever configuration file you are reading from, and set the database host `DB_HOST` to `mysql`:

```env
DB_HOST=mysql
```

You need to use the Laradock's default DB credentials which can be found in the `.env` file (ex: `MYSQL_USER=`). 
Or you can change them and rebuild the container.  

*If you want to install Laravel as PHP project, see [How to Install Laravel in a Docker Container](#Install-Laravel).*

<br>
5 - Open your browser and visit your localhost address. 

If you followed the multiple projects setup, you can visit `http://project-1.test/` and `http://project-2.test/`.

[http://localhost:8080](http://localhost:8080)

Make sure you add use the right port number as provided by your running server. Ex: NGINX uses port 8080 by default while Apache2 uses 80.   
