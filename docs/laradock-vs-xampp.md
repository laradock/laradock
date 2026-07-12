# Laradock vs XAMPP / MAMP

Source: https://laradock.io/docs/laradock-vs-xampp

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

## What is XAMPP / MAMP?

[XAMPP](https://www.apachefriends.org/) and [MAMP](https://www.mamp.info/) are free, all-in-one installer packages that put Apache, MySQL (or MariaDB), and PHP directly onto your Windows, macOS, or Linux machine. They have been the default way millions of developers got a local PHP environment running since the early 2000s: download one installer, click through a control panel, and your server is running, no command line and no Docker required.

This page compares that classic native approach to Laradock, which delivers the same one-download simplicity but runs everything in isolated Docker containers instead of installing software directly on your machine.

*XAMPP, MAMP and WAMP served a whole generation of PHP developers: one installer, Apache + MySQL + PHP, done. Laradock keeps that "download and go" simplicity but swaps global installs for disposable containers. This page compares them honestly, and ends with a 10-minute migration guide.*

**TL;DR:** pick [XAMPP](https://www.apachefriends.org/)/MAMP only if Docker is not an option on your machine. Otherwise Laradock gives you the same convenience with per-project versions, a production-like stack, and a host machine that stays clean.

## How XAMPP works

One installer puts Apache, MySQL and PHP directly on your OS. Projects live in `htdocs/`, services start from the control panel, databases are managed in phpMyAdmin at `localhost/phpmyadmin`. It works, and it is genuinely beginner-friendly.

The costs show up over time: **one global PHP version** for every project (switching means reinstalling), config drift between teammates' machines, no isolation (one broken MySQL config affects everything), an environment that looks nothing like your Linux server, and an uninstall that never quite cleans up.

## The same thing with Laradock

```bash
cd my-project
git clone https://github.com/laradock/laradock.git
cd laradock
```

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock start nginx mysql phpmyadmin
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
cp .env.example .env
docker compose up -d nginx mysql phpmyadmin
```

</TabItem>
</Tabs>

- Your app: `http://localhost`
- phpMyAdmin: `http://localhost:8081` (host `mysql`, user `default`, password `secret`)
- Prefer Apache like XAMPP? `./laradock start apache2 mysql phpmyadmin` (or `docker compose up -d apache2 mysql phpmyadmin`). That is the entire difference.

Everything runs in containers: each project can have its own PHP (5.6 to 8.5) and its own database, teammates get an identical stack from the same files, and `./laradock remove` leaves your machine exactly as it was.

## Side by side

| | **XAMPP / MAMP** | **Laradock** |
|---|---|---|
| Install | Desktop installer (global Apache/MySQL/PHP) | Nothing (git clone; only Docker itself) |
| Start | Control panel buttons | `./laradock start nginx mysql` |
| PHP versions | One global (reinstall to switch) | 5.6 to 8.5, per project, via `.env` |
| Isolation between projects | None | Full (containers per project) |
| Services beyond LAMP | No (Apache + MySQL only) | 100+ (Redis, Postgres, queues, search, mail, LLMs, ...) |
| Matches your Linux server | No (native Windows/macOS) | Yes (same containers) |
| Team consistency | Everyone configures by hand | Same files = same stack for everyone |
| Cleanup | Uninstaller, leftovers linger | `./laradock remove`, zero traces |
| Machine footprint | Apache/MySQL/PHP installed globally | Nothing installed on the host |

## Choose XAMPP / MAMP if...

- Docker cannot run on your machine (old hardware, company restrictions).
- You are teaching absolute beginners where a GUI control panel lowers the barrier.
- You have a single small project and native simplicity is all you need.

## Choose Laradock if...

- You have more than one project, or more than one PHP version in your life.
- You want your local environment to behave like your production server.
- You need anything beyond Apache + MySQL: Redis, Postgres, queues, search, mail catchers, each one command away.
- You want a machine you can wipe clean in one command.

## Migrate from XAMPP to Laradock in about 10 minutes

1. **Install [Docker Desktop](https://www.docker.com/products/docker-desktop/)** (Windows/macOS) or Docker Engine (Linux). The only installation in this guide.
2. **Export your database** in your OLD phpMyAdmin (XAMPP) as a SQL file.
3. **Move your project out of `htdocs/`** to anywhere you like, and add Laradock next to it:
   ```bash
   cd my-project
   git clone https://github.com/laradock/laradock.git
   cd laradock && cp .env.example .env
   ```
4. **Start your stack:** `./laradock start nginx mysql phpmyadmin` (or `docker compose up -d nginx mysql phpmyadmin`; first run builds for a few minutes, afterwards it starts in seconds).
5. **Import the database** in the NEW phpMyAdmin at `localhost:8081`: create the database, import the file.
6. **Update your app's config:** database host becomes `mysql` (not `localhost`; containers reach each other by service name), user `default`, password `secret` (changeable in `.env`).
7. **Retire the old habits:**

| In XAMPP you... | With Laradock you... |
|---|---|
| Open the control panel and press Start | `./laradock start nginx mysql` |
| Stop Apache/MySQL from the panel | `./laradock stop` |
| Put projects in `htdocs/` | Keep projects anywhere; set `APP_CODE_PATH_HOST` in `.env` |
| Edit `php.ini` | Edit `php-fpm/phpX.Y.ini`, rebuild once |
| Switch PHP by reinstalling XAMPP | Change `PHP_VERSION=` in `.env`, rebuild once |
| Run `php` / `composer` on your OS | `./laradock workspace` (Linux shell with PHP, Composer, Node, git preinstalled) |
| phpMyAdmin at `localhost/phpmyadmin` | phpMyAdmin at `localhost:8081` |

## Frequently Asked Questions

### Is XAMPP free?

Yes, XAMPP (Apache Friends) is free and open-source. MAMP has a free tier with a paid MAMP PRO upgrade for more advanced features like multiple virtual hosts.

### Can XAMPP run multiple PHP versions?

Not natively; XAMPP installs one global PHP version per installation. Running multiple versions side by side requires installing separate XAMPP copies or a third-party version switcher, whereas Laradock gives every project its own container with its own PHP version out of the box.

### Is XAMPP good for production?

No. XAMPP is explicitly designed and documented as a local development tool; its default configuration (open MySQL root password, exposed phpMyAdmin) is not hardened for production use.

### Does XAMPP support Docker?

No, XAMPP installs Apache, MySQL, and PHP directly on your operating system; it does not use containers. That is precisely the difference this page compares.

### How do I move a XAMPP project to Docker?

Export your database from phpMyAdmin, move your project files out of `htdocs/`, and follow the [step-by-step migration guide](#migrate-from-xampp-to-laradock-in-about-10-minutes) further up this page; it takes about 10 minutes.

See the full landscape, including DDEV, Sail, Herd and Lando: **[Laradock vs Others](https://laradock.io/docs/laradock-alternatives)**. For the complete setup reference, head to **[Getting Started](https://laradock.io/docs/getting-started)**.
