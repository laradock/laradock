---
slug: /multiple-projects
title: Running Multiple Projects
description: Run several projects on Laradock at once, either one isolated Laradock per project (separate containers and data), or many sites served from a single Laradock instance with one web-server config each.
keywords:
  - laradock multiple projects
  - laradock multiple sites
  - laradock multiple apps
  - run two projects laradock
  - laradock virtual hosts
  - COMPOSE_PROJECT_NAME laradock
---

By default each container is named after the current folder (e.g. `laradock_workspace_1`), so one Laradock serves one project. There are two ways to run more than one, pick based on whether the projects should be **isolated** or can **share** a stack.

## One Laradock per project (isolated)

To run more than one Laradock on the same machine, set **both** of these per project in your `.env`, or the projects will share the same databases on disk:

```env
COMPOSE_PROJECT_NAME=myproject               # separates the containers
DATA_PATH_HOST=~/.laradock/data-myproject    # separates the stored data
```

Each project gets its own containers, its own data, and can run its own PHP version and services independently. This is the cleanest option when projects shouldn't touch each other.

## Many sites from one Laradock (shared)

To serve several sites from a **single** Laradock instead, point `APP_CODE_PATH_HOST` at the parent folder and add one web-server config per site:

```env
APP_CODE_PATH_HOST=../
```

For **Nginx** add configs under `nginx/sites`, for **Apache2** under `apache2/sites` (each ships `*.conf.example` samples to copy). Then map the domains in your `hosts` file:

```
127.0.0.1  project-1.test
127.0.0.1  project-2.test
```

:::tip Local domains
Don't use `.dev` for local domains (browsers force HTTPS on it). Use `.localhost`, `.invalid`, `.test`, or `.example` instead.
:::

## Different PHP versions per project

Need those projects (or one project's microservices) on **different PHP versions at the same time**? See [Multiple PHP Versions](/docs/multiple-php-versions).
