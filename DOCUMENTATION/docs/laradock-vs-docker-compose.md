---
slug: /laradock-vs-docker-compose
title: Laradock vs Plain Docker Compose
description: Should you write your own docker-compose.yml for PHP or use Laradock? What hand-rolling a PHP Docker environment really involves, and what Laradock saves you, with zero lock-in either way.
keywords:
  - laradock vs docker compose
  - docker compose php setup
  - php docker environment from scratch
  - docker for php development
  - writing docker compose for laravel
  - laradock native docker
---

*This is the closest comparison of all, because Laradock IS plain Docker Compose: the same files, the same commands, just already written. The question is only whether you write the wiring yourself or start from wiring that thousands of teams have battle-tested since 2015.*

**TL;DR:** roll your own if your stack is tiny and you enjoy the craft; it is real engineering fun. Pick Laradock to skip days of wiring and keep 100% of the control, because the result is the same kind of files, fully yours to edit, with zero tool lock-in either way.

## Writing it yourself

The honest inventory of a from-scratch PHP environment:

```yaml
# docker-compose.yml, the easy 20%
services:
  app:
    build: ./php        # <- the hard 80% lives in this Dockerfile
    volumes:
      - ../:/var/www
  nginx:
    image: nginx:alpine
    ports: ["80:80"]
    volumes:
      - ./nginx/default.conf:/etc/nginx/conf.d/default.conf
      - ../:/var/www
  mysql:
    image: mysql:8.4
    environment:
      MYSQL_ROOT_PASSWORD: root
    volumes:
      - dbdata:/var/lib/mysql
volumes:
  dbdata:
```

The compose file is the quick part. The real work is the PHP image: choosing a base, compiling extensions (gd, intl, opcache, redis, xdebug, ...), matching versions, getting file permissions right between host and container (the classic macOS/Linux UID dance), wiring nginx to php-fpm, adding a usable shell with Composer and Node, and then maintaining all of it as PHP versions and base images move underneath you. Plan on days for the first working version and recurring upkeep forever.

## The same thing with Laradock

```bash
git clone https://github.com/laradock/laradock.git
cd laradock && cp .env.example .env
docker compose up -d nginx mysql redis workspace
```

That is the identical architecture you would have built (nginx to php-fpm, per-service containers, named volumes, a dev shell), already wired, with ~100 more services ready behind the same command. The PHP images come with 50+ extensions as one-line toggles (`PHP_FPM_INSTALL_GD=true`), permissions are solved, and every file is in front of you: [mysql/compose.yml](https://github.com/laradock/laradock/blob/master/mysql/compose.yml), `php-fpm/Dockerfile`, `nginx/sites/`. Editing them IS the workflow; there is no abstraction to fight.

## Side by side

| | **Your own Compose** | **Laradock** |
|---|---|---|
| Time to first working stack | Days (PHP image is the hard part) | Minutes |
| Control | Total | Total (same files, pre-written) |
| Commands | `docker compose *` | `docker compose *` (identical) |
| PHP extensions | You compile them | One-line toggles, 50+ ready |
| Services available | What you write | 100+ shipped |
| Maintenance | Yours forever | Community-maintained, `git pull` |
| Battle-testing | Your projects | Thousands of teams since 2015 |
| Lock-in | None | None (it is just compose files) |

## Write your own if...

- Your stack is genuinely tiny (one container, SQLite) and will stay that way.
- You want the learning exercise; building a PHP image once teaches you a lot.
- Your production compose files must be authored in-house line by line, and dev must mirror them exactly.

## Pick Laradock if...

- You want the result of that work today, with the same level of control at the end.
- You need more than a couple of services; nobody hand-writes 100 service definitions.
- You would rather maintain a `git pull` than a PHP Dockerfile as versions move.
- You want your own future customizations to start from a proven baseline instead of a blank file.

## Already have your own compose file? Adopt Laradock gradually

Nothing forces a big bang; it is all just Compose:

1. **Run Laradock alongside** your existing setup for the services you are missing: `docker compose up -d elasticsearch rabbitmq` from the laradock folder while your own stack keeps running (watch for port overlaps; override any port with one line in Laradock's `.env`).
2. **Steal what you like:** every service definition is a small readable file (`<service>/compose.yml` + `<service>/defaults.env`); copy patterns or whole folders into your setup, MIT-licensed.
3. **Or move in fully:** point `APP_CODE_PATH_HOST` at your code, start your services, and bring your custom containers with you; adding one is a folder with a `compose.yml` plus one `include` line in the root file.

See the full landscape, including DDEV, Sail, Herd and XAMPP: **[Laradock vs Others](/docs/laradock-alternatives)**. Ready to try it? **[Getting Started](/docs/getting-started)** takes about five minutes.
