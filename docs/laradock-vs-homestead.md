# Laradock vs Homestead / Vagrant

Source: https://laradock.io/docs/laradock-vs-homestead

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

## What is Laravel Homestead?

[Laravel Homestead](https://github.com/laravel/homestead) was Laravel's official pre-built [Vagrant](https://developer.hashicorp.com/vagrant) box: a downloadable virtual machine image, pre-configured with PHP, Nginx, MySQL, and other common services, that you launched with the `vagrant up` command to get a full local Linux server running inside a VM on your machine.

It was the standard Laravel local-development recommendation for years, before Docker-based tools took over. This page compares it to Laradock, which offers the same batteries-included philosophy but built on lightweight Docker containers instead of a full virtual machine.

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
cd laradock
```

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock start nginx mysql redis workspace
./laradock workspace
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
cp .env.example .env
docker compose up -d nginx mysql redis workspace
docker compose exec workspace bash
```

</TabItem>
</Tabs>

That's the same "ssh in and work" feeling Homestead users like. Containers start in seconds, take memory only while running, and each service is isolated instead of sharing one Ubuntu. The `workspace` container gives you the same "one machine with all the tools" experience Homestead users like (PHP, Composer, Node, git inside), without the VM around it.

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

## Frequently Asked Questions

### Is Laravel Homestead still maintained?

No. The Homestead repository was archived by Laravel in June 2025 and is now read-only; it will not receive further updates. Laravel's documentation points users to Sail instead.

### Is Homestead free?

Yes, Homestead itself is free and open-source; you only pay for the resources it reserves on your own machine (RAM, disk) or for a paid VM provider if you use one instead of local VirtualBox.

### Does Homestead use Docker?

No, Homestead provisions a full virtual machine via Vagrant (typically using VirtualBox), not Docker containers. That heavier VM model is exactly why the ecosystem, including Laravel itself, moved toward containers.

### Can I still use Homestead in 2026?

Yes, existing Homestead boxes continue to work, but since the repository is archived you will not get compatibility fixes for newer host OS versions, VirtualBox releases, or PHP versions.

### What replaced Laravel Homestead?

Laravel now recommends [Sail](https://laradock.io/docs/laradock-vs-laravel-sail) for Docker-based local development or [Herd](https://laradock.io/docs/laradock-vs-laravel-herd) for a native macOS/Windows setup. Laradock is a third path for teams who want Homestead's old batteries-included feel without the VM weight.

See the full landscape, including DDEV, Sail, Herd and XAMPP: **[Laradock vs Others](https://laradock.io/docs/laradock-alternatives)**. Ready to try it? **[Getting Started](https://laradock.io/docs/getting-started)** takes about five minutes.
