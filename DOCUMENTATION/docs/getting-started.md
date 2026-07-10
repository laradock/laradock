---
sidebar_position: 2
title: Getting Started
description: Install Laradock and get a full Dockerized PHP stack running in minutes. Step-by-step setup for new and existing projects, single or multiple apps, on Linux, macOS, and Windows.
keywords:
  - laradock installation
  - laradock setup
  - install laradock
  - docker php setup
  - laravel docker install
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

This guide walks you through setting up Laradock for your project, from the prerequisites to a fully running environment. Whether you are starting a brand-new app or adding Docker to an existing one, the steps below have you covered. Pick the installation path that matches your setup and you will have a complete local stack running in minutes.

## Requirements

- [Git](https://git-scm.com/downloads)
- [Docker](https://www.docker.com/products/docker-desktop/) (with Docker Compose v2.20 or newer)




## Installation

Both tabs reach the exact same result, using the exact same files, pick one and switch any time:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

Fastest: a zero-install script shipped in the repo. Clone it, then run one command:

```bash
git clone https://github.com/laradock/laradock.git
cd laradock
./laradock start
```

On the first run, `start` walks you through setup (detects your framework, lets you pick your project, PHP version, and services, all pre-answered), points your app's `.env` at the services, and starts your stack. After that, `./laradock start` just starts. It prints every real `docker compose` command it runs, so nothing is hidden. Full reference: [The Laradock CLI](/docs/cli).

</TabItem>
<TabItem value="docker" label="Docker Compose">

Full control: edit `.env` yourself and run plain `docker compose`. The rest of this page covers this path in detail; the short version:

```bash
git clone https://github.com/laradock/laradock.git
cd laradock
cp .env.example .env
docker compose up -d nginx mysql redis workspace
```

</TabItem>
</Tabs>

### Manual setup

Choose the setup that best suits your needs.

- [A) Setup for Single Project](#a-setup-for-single-project)
	- [A.1) Already have a PHP project](#a1-already-have-a-php-project)
 	- [A.2) Don't have a PHP project yet](#a2-dont-have-a-php-project-yet)
- [B) Setup for Multiple Projects](#b-setup-for-multiple-projects)


<a name="A"></a>
### A) Setup for Single Project
> (Follow these steps if you want a separate Docker environment for each project)


<a name="A1"></a>
### A.1) Already have a PHP project

1 - Clone laradock on your project root directory:

```bash
git submodule add https://github.com/Laradock/laradock.git
```

Note: If you are not using Git yet for your project, you can use `git clone` instead of `git submodule`.

*To keep track of your Laradock changes, between your projects and also keep Laradock updated [check these docs](/docs/maintenance#track-your-laradock-changes)*


2 - Make sure your folder structure looks like this:

```
* project-a
*   laradock-a
* project-b
*   laradock-b
```

*(If you want to run Laradock per project, rename the `laradock` folder to a unique name in each project.)*

3 - Go to the [Usage](#usage) section.

<a name="A2"></a>
### A.2) Don't have a PHP project yet

1 - Clone this repository anywhere on your machine:

```bash
git clone https://github.com/laradock/laradock.git
```

Your folder structure should look like this:

```
* laradock
* project-z
```

2 - Edit your web server sites configuration.

We'll need to do step 1 of the [Usage](#usage) section now to make this happen.

```
cp .env.example .env
```

At the top, change the `APP_CODE_PATH_HOST` variable to your project path.

```
APP_CODE_PATH_HOST=../project-z/
```

Make sure to replace `project-z` with your project folder name.

3 - Go to the [Usage](#usage) section.


<a name="B"></a>
### B) Setup for Multiple Projects
> (Follow these steps if you want a single Docker environment for all your projects)

1 - Clone this repository anywhere on your machine (similar to [Steps A.2. from above](#a2-dont-have-a-php-project-yet)):

```bash
git clone https://github.com/laradock/laradock.git
```

Your folder structure should look like this:

```
* laradock
* project-1
* project-2
```

Make sure the `APP_CODE_PATH_HOST` variable points to the parent directory.

```
APP_CODE_PATH_HOST=../
```

2 - Go to your web server and create config files to point to different project directories when visiting different domains:

For **Nginx** go to `nginx/sites`, for **Apache2** `apache2/sites`. 

Laradock by default includes some sample files for you to copy `app.conf.example`, `laravel.conf.example` and `symfony.conf.example`.

3 - Change the default names `*.conf`:

You can rename the config files, project folders and domains as you like, just make sure the `root` in the config files is pointing to the correct project folder name.

4 - Add the domains to the **hosts** files.

```
127.0.0.1  project-1.test
127.0.0.1  project-2.test
...
```

Don't use `.dev` for local domains (browsers force HTTPS on it). Instead use `.localhost`, `.invalid`, `.test`, or `.example`.

5 - Go to the [Usage](#usage) section.







<a name="Usage"></a>
## Usage

### Read before starting

Laradock needs Docker Compose v2.20 or newer (shipped with any current [Docker Desktop](https://www.docker.com/products/docker-desktop/) or Docker Engine).

:::warning
If you used an older version of Laradock it's highly recommended to rebuild the containers you need to use [see how you rebuild a container](/docs/containers#build-or-rebuild-containers) in order to prevent as much errors as possible.
:::

### Two ways to set up

Laradock gives you two equal ways to work; both use the exact same files, and you can switch any time:

- **Convenient (recommended to start):** the [Laradock CLI](/docs/cli), a zero-install script shipped in the repo. Just `./laradock start`: on the first run it walks you through setup (detects your framework, asks a handful of pre-answered questions, writes your `.env`, and can point your app's `.env` at the services), then starts. After that, `./laradock start` just starts. It prints every real `docker compose` command it executes, so nothing is hidden.
- **Full control:** do it manually, as described below. You edit `.env` yourself and run plain `docker compose` commands. Best when you want to own every detail.

| | Convenient | Full control |
|---|---|---|
| Setup | `./laradock setup` | `cp .env.example .env` |
| Start | `./laradock start` | `docker compose up -d nginx mysql redis workspace` |
| Dev shell | `./laradock workspace` | `docker compose exec workspace bash` |

The rest of this section documents the manual way in full (the CLI simply automates these exact steps).

1 - Enter the laradock folder and copy `.env.example` to `.env`

```shell
cp .env.example .env
```

### How Laradock configuration works

- Your `.env` (the file you just copied) holds the **shared settings**: paths, PHP version, project name.
- Each service keeps its **own settings** pre-filled in its folder: `mysql/defaults.env`, `nginx/defaults.env`, and so on. You never need to copy or edit those files, they work out of the box.
- To change **any** setting, shared or per-service, add that line to your `.env` with your value. **Your `.env` always wins over every `defaults.env`.** For example, to run MySQL on another port, add `MYSQL_PORT=3307` to your `.env`.
- To discover what a service lets you configure, just open its folder's `defaults.env`, it's a short, readable list.
- **Upgrading from an older Laradock?** Your existing full `.env` keeps working exactly as before, no changes needed.

:::warning One exception: database passwords are set on first run only
`MYSQL_PASSWORD`, `POSTGRES_PASSWORD`, and the other database credentials are applied the **first time** that database starts, when it creates its data files on disk. Changing them in `.env` later (even with `./laradock rebuild`) does **not** update an existing database; the old password keeps working. To change a database password for real, either run the change inside the database itself (for example `ALTER USER`), or delete that service's data folder under `DATA_PATH_HOST` so it initializes fresh (this erases that database's data).
:::

### How the repository is organized

One folder per service, and everything about a service lives in its folder:

```
laradock/
├── docker-compose.yml      # the service catalog: shared networks/volumes + include list
├── .env.example            # shared settings template (copy to .env)
├── mysql/
│   ├── compose.yml         # mysql's container definition
│   ├── defaults.env        # mysql's settings, pre-filled
│   └── Dockerfile          # mysql's image
├── nginx/
│   ├── compose.yml
│   ├── defaults.env
│   ├── Dockerfile
│   └── sites/              # your site configs
└── ...                     # ~100 more services, same pattern
```

So when you want to:

| You want to... | Edit... |
|---|---|
| Change any setting (port, version, password, flag) | your `.env` (add one line, it wins) |
| See what a service lets you configure | `<service>/defaults.env` (read-only for you) |
| Change a container's structure (mounts, links, ...) | `<service>/compose.yml` |
| Change how an image is built | `<service>/Dockerfile`, then rebuild |

The root `docker-compose.yml` pulls every service in via Compose `include`, which requires Docker Compose v2.20 or newer.

By default the containers that will be created have the current directory name as suffix (e.g. `laradock_workspace_1`). This can cause mixture of data inside the container volumes if you use laradock in multiple projects. In this case, either read the guide for [multiple projects](#b-setup-for-multiple-projects) or change the variable `COMPOSE_PROJECT_NAME` to something unique like your project name.

:::warning[Running more than one Laradock on the same machine?]
Set BOTH of these per project in your `.env`, or your projects will share the same databases on disk:

```env
COMPOSE_PROJECT_NAME=myproject        # separates the containers
DATA_PATH_HOST=~/.laradock/data-myproject   # separates the stored data
```
:::

2 - Build the environment and run it using Docker Compose (v2.20 or newer is required)

In this example we'll see how to run NGINX (web server) and MySQL (database engine) to host PHP web scripts:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock start nginx mysql
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose up -d nginx mysql
```

</TabItem>
</Tabs>

**Note**: All the web server containers (`nginx`, `apache`, etc.) depend on `php-fpm`, which means if you run any of them, they will automatically launch the `php-fpm` container for you, so there's no need to explicitly specify it in the `up` command. If you have to do so, you may need to run them as follows: `./laradock start nginx php-fpm mysql` (or `docker compose up -d nginx php-fpm mysql`).


You can select your own combination of containers from [this list](/docs/Intro#supported-services).

*(Every top-level folder in the repo is a runnable container; the folder list is always the up-to-date list of available services.)*


3 - Enter the Workspace container, to execute commands like (Artisan, Composer, PHPUnit, Gulp, ...)

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock workspace
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose exec workspace bash
```

</TabItem>
</Tabs>

*Alternatively, for Windows PowerShell users: execute the following command to enter any running container:*

```bash
docker exec -it {workspace-container-id} bash
```

**Note:** `./laradock workspace` already enters as your host's user (files come out owned by you, not root); the raw `docker compose` form needs `--user=laradock` spelled out:

```shell
docker compose exec --user=laradock workspace bash
```

*You can change the PUID (User id) and PGID (group id) by adding `WORKSPACE_PUID` / `WORKSPACE_PGID` to your `.env` (defaults are in `workspace/defaults.env`)*

:::tip[Where do I run `artisan`, `composer`, `npm`?]
Inside the workspace container, not on your machine. The Laravel and PHP docs assume these tools are installed on your host, but with Laradock they live in the workspace. So either enter it once with `./laradock workspace` (or `docker compose exec workspace bash`) and run commands from there, or prefix a single command: `./laradock exec workspace php artisan migrate` (or `docker compose exec workspace php artisan migrate`).
:::

4 - Update your project configuration to use the database host

Open your PHP project's `.env` file or whichever configuration file you are reading from, and set the database host `DB_HOST` to `mysql`:

```env
DB_HOST=mysql
```

You need to use Laradock's default DB credentials, which can be found in `mysql/defaults.env` (ex: `MYSQL_USER=`). 
Or you can override them in your `.env` and rebuild the container.  

*If you want to install Laravel as your PHP project, see [How to Install Laravel in a Docker Container](/docs/laravel-on-docker).*

5 - Open your browser and visit your localhost address. 

Make sure you use the right port number provided by your running server.

[http://localhost](http://localhost)

If you followed the multiple projects setup, you can visit `http://project-1.test/` and `http://project-2.test/`.



 
