---
sidebar_position: 4
title: Help
description: Get help with Laradock and fix common problems, blank Laravel page, nginx welcome screen, port already in use, MySQL connection refused, timezone, and Windows 404 errors.
keywords:
  - laradock help
  - laradock troubleshooting
  - laradock common problems
  - mysql connection refused laradock
  - laradock port already in use
---

## Get Help

- Open an [issue](https://github.com/laradock/laradock/issues) on GitHub (it will be labeled as a Question).
- Have a question, found a problem, or need something? **mahmoud@zalt.me**
- For security vulnerabilities, please follow the [Security Policy](https://github.com/laradock/laradock/blob/master/SECURITY.md).

## Common Problems

Here are the problems you are most likely to hit, and how to fix them.

### I see a blank (white) page instead of the Laravel welcome page

Fix the storage permissions. Run this from your Laravel project root:

```bash
sudo chmod -R 777 storage bootstrap/cache
```

### I see "Welcome to nginx" instead of my Laravel app

Use `http://127.0.0.1` instead of `http://localhost` in your browser.

### I get "address already in use" or "port is already allocated"

Another program on your host is already using one of the ports Laradock needs (22, 80, 443, 3306, etc.). Stop that program, or change the port in your `.env` (for example `NGINX_HOST_HTTP_PORT`).

### I get an NGINX 404 Not Found on Windows

Docker can't see your project files because the drive is not shared:

- **WSL 2 backend (default):** keep your project inside your WSL 2 distro's filesystem, or enable the distro under Docker Desktop → **Settings → Resources → WSL Integration**.
- **Hyper-V backend:** enable your project's drive under Docker Desktop → **Settings → Resources → File Sharing**.

Then restart Docker Desktop.

### The time in my services does not match the current time

1. Make sure you have [changed the timezone](/docs/environment#change-the-timezone).
2. Rebuild and restart the containers: `docker compose up -d --build <services>`.

### I get MySQL connection refused

This usually means your app is not connecting to the MySQL container. Set `DB_HOST` in your Laravel `.env` to the MySQL container name:

```dotenv
DB_HOST=mysql
```

### I changed the database name, user, or password but nothing happens

MySQL/PostgreSQL only read those values the **first** time the data volume is created. After that the data persists in `DATA_PATH_HOST` (default `~/.laradock/data`), so later `.env` changes are ignored.

To start fresh, stop the containers and delete that database's data folder, then bring it back up:

```bash
docker compose down
rm -rf ~/.laradock/data/mysql   # or /postgres, /mariadb, etc.
docker compose up -d mysql
```

:::warning
This deletes the database's local data. Back it up first if you need it.
:::

### The server requested authentication method unknown to the client

MySQL 8 uses `caching_sha2_password` by default, which some older clients and drivers don't support. Connect through the workspace and switch the user to the legacy method:

```sql
ALTER USER 'default'@'%' IDENTIFIED WITH mysql_native_password BY 'secret';
FLUSH PRIVILEGES;
```

### I can't connect to or log in to phpMyAdmin / pgAdmin

Use the **container name** as the server/host, not `localhost`:

- phpMyAdmin → server `mysql` (or `mariadb`), with the `MYSQL_USER` / `MYSQL_PASSWORD` from your `.env`.
- pgAdmin → host `postgres`, with your `POSTGRES_USER` / `POSTGRES_PASSWORD`.

### Package mirrors are slow or the build hangs fetching sources

Common when your network is far from the default mirrors (for example in China):

- If an image build hangs while fetching Alpine/Debian package indexes, set `CHANGE_SOURCE=false` in your `.env` and rebuild.
- To use faster Composer and NPM mirrors, add these to your `.env`:

```dotenv
WORKSPACE_NPM_REGISTRY=https://registry.npmmirror.com
WORKSPACE_COMPOSER_REPO_PACKAGIST=https://packagist.phpcomposer.com
```

### The apache2 container won't start on Apple Silicon (M1/M2)

1. Set `APACHE_FOR_MAC_M1=true` in your `.env`.
2. Rebuild the image: `docker compose build apache2`.

### Everything is slow on macOS

File-system sync between the host and containers is the usual cause. Enable **VirtioFS** in Docker Desktop → **Settings → General → Choose file sharing implementation**, and give Docker Desktop enough CPU/RAM under **Settings → Resources**.
