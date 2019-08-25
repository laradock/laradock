---
title: 5. Help & Questions
type: index
weight: 5
---

Join the chat room on [Gitter](https://gitter.im/Laradock/laradock) and get help and support from the community.

You can as well can open an [issue](https://github.com/laradock/laradock/issues) on Github (will be labeled as Question) and discuss it with people on [Gitter](https://gitter.im/Laradock/laradock).


<br>
<a name="Common-Problems"></a>
# Common Problems

*Here's a list of the common problems you might face, and the possible solutions.*


<br>
## I see a blank (white) page instead of the Laravel 'Welcome' page!

Run the following command from the Laravel root directory:

```bash
sudo chmod -R 777 storage bootstrap/cache
```






<br>
## I see "Welcome to nginx" instead of the Laravel App!

Use `http://127.0.0.1` instead of `http://localhost` in your browser.






<br>
## I see an error message containing `address already in use` or `port is already allocated`

Make sure the ports for the services that you are trying to run (22, 80, 443, 3306, etc.) are not being used already by other programs on the host, such as a built in `apache`/`httpd` service or other development tools you have installed.






<br>
## I get NGINX error 404 Not Found on Windows.

1. Go to docker Settings on your Windows machine.
2. Click on the `Shared Drives` tab and check the drive that contains your project files.
3. Enter your windows username and password.
4. Go to the `reset` tab and click restart docker.






<br>
## The time in my services does not match the current time

1. Make sure you've [changed the timezone](#Change-the-timezone).
2. Stop and rebuild the containers (`docker-compose up -d --build <services>`)






<br>
## I get MySQL connection refused

This error sometimes happens because your Laravel application isn't running on the container localhost IP (Which is 127.0.0.1). Steps to fix it:

* Option A
  1. Check your running Laravel application IP by dumping `Request::ip()` variable using `dd(Request::ip())` anywhere on your application. The result is the IP of your Laravel container.
  2. Change the `DB_HOST` variable on env with the IP that you received from previous step.
* Option B
   1. Change the `DB_HOST` value to the same name as the MySQL docker container. The Laradock docker-compose file currently has this as `mysql`

## I get stuck when building nginx on `fetch http://mirrors.aliyun.com/alpine/v3.5/main/x86_64/APKINDEX.tar.gz`

As stated on [#749](https://github.com/laradock/laradock/issues/749#issuecomment-419652646), Already fixed，just set `CHANGE_SOURCE` to false.

## Custom composer repo packagist url and npm registry url

In China, the origin source of composer and npm is very slow. You can add `WORKSPACE_NPM_REGISTRY` and `WORKSPACE_COMPOSER_REPO_PACKAGIST` config in `.env` to use your custom source.

Example:
```bash
WORKSPACE_NPM_REGISTRY=https://registry.npm.taobao.org
WORKSPACE_COMPOSER_REPO_PACKAGIST=https://packagist.phpcomposer.com
```

<br>

## I get `Module build failed: Error: write EPIPE` while compiling react application

When you run `npm build` or `yarn dev` building a react application using webpack with elixir you may receive a `Error: write EPIPE` while processing .jpg images.

This is caused of an outdated library for processing **.jpg files** in ubuntu 16.04.

To fix the problem you can follow those steps

1 - Open the `.env`.

2 - Search for `WORKSPACE_INSTALL_LIBPNG` or add the key if missing.

3 - Set the value to true:

```dotenv
WORKSPACE_INSTALL_LIBPNG=true
```

4 - Finally rebuild the workspace image

```bash
docker-compose build workspace
```

