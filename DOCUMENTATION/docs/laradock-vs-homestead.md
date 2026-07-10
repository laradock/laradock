---
slug: /laradock-vs-homestead
title: Laradock vs Homestead / Vagrant
description: Laravel Homestead vs Laradock. Why containers replaced the VM workflow, what Homestead still does well, and a migration guide from Vagrant boxes to Docker.
keywords:
  - laradock vs homestead
  - homestead vs docker
  - laravel homestead alternative
  - homestead alternative
  - vagrant vs docker php
  - migrate from homestead
---

*Homestead was Laravel's official answer before containers: a full Ubuntu virtual machine managed by Vagrant, batteries included. Laradock is the same "everything included" philosophy rebuilt on containers: a fraction of the weight, a fraction of the startup time.*

**TL;DR:** [Homestead](https://github.com/laravel/homestead) is officially over: the repository was archived in June 2025 and is read-only, with Laravel pointing users to Sail instead. If you are still on it, it keeps working but will never be updated. Laradock is the natural next step: the familiar all-in-one environment, minus the VM tax.

## How Homestead works

You install VirtualBox (or another provider) plus Vagrant, add the Homestead box, and describe your machine in `Homestead.yaml`:

```yaml
ip: "192.168.56.56"
memory: 2048
cpus: 2
folders:
  - map: ~/code/my-app
    to: /home/vagrant/my-app
sites:
  - map: my-app.test
    to: /home/vagrant/my-app/public
databases:
  - my_app
```

Then `vagrant up` (minutes), edit your hosts file for `my-app.test`, and `vagrant ssh` to work inside the VM. PHP, Nginx, MySQL, Redis and more are pre-installed in the box.

The tax: the VM permanently reserves gigabytes of RAM, boots slowly, needs full-OS updates, and shared folders are historically the slowest part of the setup. All projects share one VM (or you pay the RAM price several times).

## The same thing with Laradock

```bash
cd my-app
git clone https://github.com/laradock/laradock.git
cd laradock && cp .env.example .env
docker compose up -d nginx mysql redis workspace
docker compose exec workspace bash   # the same "ssh in and work" feeling
```

Containers start in seconds, take memory only while running, and each service is isolated instead of sharing one Ubuntu. The `workspace` container gives you the same "one machine with all the tools" experience Homestead users like (PHP, Composer, Node, git inside), without the VM around it.

## Side by side

| | **Homestead / Vagrant** | **Laradock** |
|---|---|---|
| Runs as | Full Ubuntu VM (VirtualBox/Parallels) | Docker containers |
| Install | VirtualBox + Vagrant + box download (GBs) | nothing (git clone; only Docker itself) |
| Boot time | Minutes | Seconds |
| Memory | Reserved up front (2GB+ typical) | Only what running containers use |
| Config | `Homestead.yaml` + hosts file | `.env` (+ optional site configs) |
| Services | Preinstalled fixed set in the box | 100+, start only what you need |
| File sharing | VM shared folders (slow spot) | Docker bind mounts (VirtioFS on Mac) |
| Isolation | One VM for everything (typically) | Per-service containers, per-project stacks |
| Status | Archived June 2025, read-only, no updates | Actively maintained |

## Stay on Homestead if...

- Your team's workflow is deeply wired into Vagrant (snapshots, custom boxes, provisioning scripts).
- You specifically need a full VM (kernel modules, systemd services, non-containerizable software).

## Choose Laradock if...

- You like Homestead's batteries-included philosophy but not the RAM bill and boot times.
- You want per-project isolation instead of one shared VM.
- You want your local stack built from the same container technology as modern production.
- You want to free VirtualBox-grade resources from your laptop.

## Already on Homestead? Migrating takes minutes

1. **Export your database** from inside the VM: `vagrant ssh` then `mysqldump -uhomestead -psecret my_app > /home/vagrant/my-app/backup.sql` (lands in your synced folder).
2. **Stop the VM:** `vagrant halt` (destroy later with `vagrant destroy` once you are confident).
3. **Add Laradock** next to your code: `git clone https://github.com/laradock/laradock.git && cd laradock && cp .env.example .env`
4. **Start your stack:** `docker compose up -d nginx mysql redis workspace`
5. **Import the database:** `docker compose exec -T mysql mysql -uroot -proot default < ../backup.sql`
6. **Update your app's `.env`:** Homestead's `DB_HOST=127.0.0.1` becomes `DB_HOST=mysql`; user `default`, password `secret` (see `mysql/defaults.env`).
7. Remove the `my-app.test` hosts entry or keep it; your site now answers at `http://localhost` (wire nginx site configs for custom domains if you want them back).

See the full landscape, including DDEV, Sail, Herd and XAMPP: **[Laradock vs Others](/docs/laradock-alternatives)**. Ready to try it? **[Getting Started](/docs/getting-started)** takes about five minutes.
