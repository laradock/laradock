# Laradock vs Plain Docker Compose

Source: https://laradock.io/docs/laradock-vs-docker-compose

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

## What does "your own Docker Compose" mean?

[Docker Compose](https://docs.docker.com/compose/) is the standard, official tool built into Docker for defining and running a multi-container application from a single YAML file. "Writing your own" means creating that `docker-compose.yml` (or several service files) completely from scratch for your PHP project: choosing base images, writing the PHP Dockerfile, wiring the web server to PHP, and so on, with no starter kit or framework involved.

This page compares that from-scratch path to Laradock, which is not a different technology at all, it is the exact same Docker Compose, just already written, tested, and maintained for 100+ services since 2015.

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
cd laradock
```

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock start nginx mysql redis workspace
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
cp .env.example .env
docker compose up -d nginx mysql redis workspace
```

</TabItem>
</Tabs>

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

1. **Run Laradock alongside** your existing setup for the services you are missing: `./laradock start elasticsearch rabbitmq` (or `docker compose up -d elasticsearch rabbitmq`) from the laradock folder while your own stack keeps running (watch for port overlaps; override any port with one line in Laradock's `.env`).
2. **Steal what you like:** every service definition is a small readable file (`<service>/compose.yml` + `<service>/defaults.env`); copy patterns or whole folders into your setup, MIT-licensed.
3. **Or move in fully:** point `APP_CODE_PATH_HOST` at your code, start your services, and bring your custom containers with you; adding one is a folder with a `compose.yml` plus one `include` line in the root file.

## Frequently Asked Questions

### Is writing my own Docker Compose file hard for PHP?

The compose file itself is easy; the hard part is the PHP image: compiling the right extensions, matching versions, solving host/container file-permission mismatches, and wiring nginx to php-fpm correctly. That is the work Laradock has already done.

### Is Laradock just Docker Compose?

Yes, essentially. Laradock IS a set of plain `docker-compose.yml`/`compose.yml` files; there is no proprietary format or hidden abstraction layer. You use the exact same `docker compose` commands you would use with a hand-written setup.

### Can I mix my own services with Laradock's?

Yes, either run Laradock alongside your existing compose stack for the services you're missing, or copy individual service folders (`compose.yml` + `defaults.env`) into your own project; every file is MIT-licensed and self-contained.

### Do I need to know Docker Compose to use Laradock?

Basic familiarity helps but is not required to get started (`./laradock start nginx mysql`, or `docker compose up -d nginx mysql`, is the whole first step); however, because Laradock is just compose files, learning Docker Compose while using it transfers directly to any future project.

### What Docker Compose version does Laradock require?

Compose v2.20 or newer, because the root `docker-compose.yml` uses the `include` directive to pull in each service's own compose file. Check your version with `docker compose version`.

See the full landscape, including DDEV, Sail, Herd and XAMPP: **[Laradock vs Others](https://laradock.io/docs/laradock-alternatives)**. Ready to try it? **[Getting Started](https://laradock.io/docs/getting-started)** takes about five minutes.
