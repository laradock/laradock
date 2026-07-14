---
slug: /supported-php-projects
title: Supported PHP Projects
description: Laradock runs any PHP project in Docker, frameworks, CMSs, and e-commerce platforms alike. Browse the guides for Laravel, Symfony, WordPress, Drupal, Magento, and dozens more.
keywords:
  - php docker
  - laravel docker
  - symfony docker
  - wordpress docker
  - drupal docker
  - magento docker
  - run php project in docker
---

import HubCardList from '@site/src/components/HubCardList';

Laradock is not tied to one framework. It's a Docker environment for **PHP itself**, so anything that runs on PHP-FPM and a web server runs on Laradock: a modern framework, a legacy CMS, or a hand-rolled app with no framework at all.

## One environment, every project

The setup is the same no matter what you're building. You point Laradock at your code (`APP_CODE_PATH_HOST`), start the services your project needs (nginx or apache, MySQL or Postgres, Redis, and so on), and open the site. The per-project guides below only differ in the small details: the document root, which database driver to enable, and any framework-specific commands.

That means the skills transfer. Learn Laradock once for a Laravel app and you already know how to run a WordPress site or a Symfony API next to it, on the same machine, without reinstalling anything.

## Don't see your project?

If it's PHP, it works, even if there's no dedicated guide yet. Start from the [Getting Started guide](/docs/getting-started), set your document root, and enable a database. The framework and CMS guides below are shortcuts, not requirements.

## Browse by type

<HubCardList />
