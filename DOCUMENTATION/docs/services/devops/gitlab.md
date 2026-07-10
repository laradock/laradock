---
slug: /services/gitlab
title: GitLab
description: Run a self-hosted GitLab instance in Laradock. Start the container, set your domain, and connect it to Postgres and Redis.
keywords:
  - laradock gitlab
  - gitlab docker
  - gitlab docker compose
  - self hosted gitlab
  - gitlab omnibus docker
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

## What is GitLab?

[GitLab](https://about.gitlab.com) is a self-hosted Git server with built-in issue tracking, code review, and CI/CD pipelines. Laradock runs the Omnibus image as its own container, wired to the `postgres` and `redis` services that are already part of the stack.

## Start GitLab

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock start gitlab
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose up -d gitlab
```

</TabItem>
</Tabs>

GitLab depends on `redis` and `postgres` (declared in `gitlab/compose.yml`), so starting it starts both automatically. First boot takes a while, GitLab is a large application; watch progress with:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock logs gitlab
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose logs -f gitlab
```

</TabItem>
</Tabs>

## Stop GitLab

Stopping just pauses the container; **your data is safe**:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock stop gitlab
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose stop gitlab
```

</TabItem>
</Tabs>

GitLab's config, repositories, and logs live under `DATA_PATH_HOST` and `GITLAB_HOST_LOG_PATH` on your host, stopping (or even deleting) the container never touches them.

To delete the container entirely (the data on disk is still untouched):

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock remove gitlab
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose rm -sf gitlab
```

</TabItem>
</Tabs>

## Configuration

All settings live in `gitlab/defaults.env` and can be overridden by adding the same line to your own `.env` (your `.env` always wins):

| Variable | Default | What it does |
|---|---|---|
| `GITLAB_HOST_HTTP_PORT` | `8989` | Host-side port for the GitLab web UI (HTTP). |
| `GITLAB_HOST_HTTPS_PORT` | `9898` | Host-side port for the GitLab web UI (HTTPS). |
| `GITLAB_HOST_SSH_PORT` | `2289` | Host-side port for Git-over-SSH. |
| `GITLAB_DOMAIN_NAME` | `http://localhost` | External URL GitLab advertises itself as; set this to your real domain in production. |
| `GITLAB_ROOT_PASSWORD` | `laradock` | Initial password for the `root` user. |
| `GITLAB_HOST_LOG_PATH` | `./logs/gitlab` | Host folder mounted to `/var/log/gitlab`. |
| `GITLAB_POSTGRES_HOST` | `postgres` | Hostname of the Postgres container GitLab connects to. |

GitLab also needs `GITLAB_POSTGRES_USER`, `GITLAB_POSTGRES_PASSWORD`, and `GITLAB_POSTGRES_DB` to create its database in Postgres. These aren't in `gitlab/defaults.env`, they ship as top-level defaults in `.env.example` (`laradock_gitlab` for all three). The `postgres` service also needs `GITLAB_POSTGRES_INIT=true` (set by default in `postgres/defaults.env`) to auto-create that database and user on its first boot.

## Set your domain

```env
GITLAB_DOMAIN_NAME=http://localhost
```

Change this to your real domain (or `https://` URL) before exposing GitLab beyond local dev, GitLab uses it to generate links, clone URLs, and webhooks. `GITLAB_DOMAIN_NAME` feeds straight into the Omnibus `external_url` setting (see `gitlab/compose.yml`), so a container restart is enough to pick it up, no rebuild needed:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock restart gitlab
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose restart gitlab
```

</TabItem>
</Tabs>

## Reset the root password

If you changed `GITLAB_ROOT_PASSWORD` after the data volume already existed, GitLab won't pick it up (it's only applied on first boot, just like the database credentials above). Reset it from inside the container instead. Open a terminal and start GitLab's Rails console:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock enter gitlab
gitlab-rails console
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose exec gitlab bash
gitlab-rails console
```

</TabItem>
</Tabs>

Then, inside the Rails console:

```ruby
user = User.find_by(username: 'root')
user.password = 'your_new_password'
user.password_confirmation = 'your_new_password'
user.save!
```

## Backup and restore

**Create a backup** (repositories, uploads, and the Postgres database, written to `/var/opt/gitlab/backups` inside the container, which lives under `DATA_PATH_HOST/gitlab/data/backups` on your host):

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock enter gitlab
gitlab-backup create
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose exec gitlab bash
gitlab-backup create
```

</TabItem>
</Tabs>

A backup archive alone isn't enough to restore GitLab on a different machine or after a full reset, GitLab also needs its secrets file to decrypt CI/CD variables and two-factor secrets. Copy that out separately, straight from the host (it's bind-mounted, no container access needed):

```bash
cp "${DATA_PATH_HOST:-~/.laradock/data}/gitlab/config/gitlab-secrets.json" ./gitlab-secrets.json.bak
```

**Restore a backup.** Put the backup `.tar` file into `DATA_PATH_HOST/gitlab/data/backups` (and `gitlab-secrets.json` back into `DATA_PATH_HOST/gitlab/config` if you're restoring onto a fresh instance), then run:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock enter gitlab
gitlab-backup restore BACKUP=<timestamp_of_backup>
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose exec gitlab bash
gitlab-backup restore BACKUP=<timestamp_of_backup>
```

</TabItem>
</Tabs>

`<timestamp_of_backup>` is the numeric prefix of the `.tar` file in the backups folder (GitLab prints it after `gitlab-backup create` too). Restoring stops and restarts GitLab's internal services and prompts for confirmation before overwriting existing data.

## Start completely fresh (wipe all data)

To throw away everything, every user, repository, and setting, and start GitLab from a clean, empty state (⚠️ this **permanently deletes** all of it, back up first if you need anything):

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock stop gitlab
./laradock remove gitlab
rm -rf "${DATA_PATH_HOST:-~/.laradock/data}/gitlab"
rm -rf "${GITLAB_HOST_LOG_PATH:-./logs/gitlab}"
./laradock start gitlab
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose stop gitlab
docker compose rm -sf gitlab
rm -rf "${DATA_PATH_HOST:-~/.laradock/data}/gitlab"
rm -rf "${GITLAB_HOST_LOG_PATH:-./logs/gitlab}"
docker compose up -d gitlab
```

</TabItem>
</Tabs>

`DATA_PATH_HOST/gitlab` holds both `config` (`/etc/gitlab`, including `gitlab-secrets.json`) and `data` (`/var/opt/gitlab`, repos and the Rails app data); `GITLAB_HOST_LOG_PATH` is a separate, relative-by-default path (`./logs/gitlab`). Deleting both and starting again re-runs GitLab's own first-boot setup: `GITLAB_ROOT_PASSWORD`, `GITLAB_DOMAIN_NAME`, and the Postgres database from `GITLAB_POSTGRES_*` all apply fresh, exactly like a brand-new install.

## Edit `gitlab.rb` directly

For Omnibus settings that don't have a `.env` variable in Laradock yet, edit the config file GitLab itself uses. It's bind-mounted to your host at `DATA_PATH_HOST/gitlab/config/gitlab.rb`, so you can edit it from either side. Unlike the `.env` variables above (which regenerate this file on every container start), manual edits need an explicit reconfigure to take effect:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock enter gitlab
gitlab-ctl reconfigure
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose exec gitlab bash
gitlab-ctl reconfigure
```

</TabItem>
</Tabs>

Note that `GITLAB_OMNIBUS_CONFIG` (built from the `.env` variables in the [Configuration](#configuration) table above) is reapplied on every container restart, so a manual `gitlab-rb` edit can be overwritten by it on the next restart unless you also add the same setting to `gitlab/compose.yml`.

## Check what's running inside the container

GitLab's Omnibus image bundles many internal services (Puma, Sidekiq, Gitaly, Postgres connection pooling, etc.), all supervised by `runit`. To see which are up, useful when the web UI is slow or 502ing after the container itself reports "running":

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock enter gitlab
gitlab-ctl status
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose exec gitlab bash
gitlab-ctl status
```

</TabItem>
</Tabs>

## Common issues

- **First page load times out or 502s.** GitLab's Omnibus stack takes several minutes to fully initialize on first boot. Run `./laradock logs gitlab` until it reports it's ready, or check `gitlab-ctl status` inside the container to see which internal service is still starting.
- **Can't log in as root.** Use `GITLAB_ROOT_PASSWORD` (default `laradock`). If you changed it after the data volume was already initialized, the change won't retroactively apply, [reset the password](#reset-the-root-password) from inside the container instead.
- **Database connection errors on first boot.** Confirm `postgres` is running and that `GITLAB_POSTGRES_INIT=true` in `postgres/defaults.env` so the `laradock_gitlab` database and user get created automatically.
- **Wrong clone URLs or broken webhooks.** `GITLAB_DOMAIN_NAME` is still `http://localhost` or doesn't match how you actually access GitLab; update it and restart with `./laradock restart gitlab`.
- **Port already in use on your host.** Change `GITLAB_HOST_HTTP_PORT`, `GITLAB_HOST_HTTPS_PORT`, or `GITLAB_HOST_SSH_PORT` in `.env` and restart: `./laradock restart gitlab`.

---

Need CI runners to execute your `.gitlab-ci.yml` pipelines? See **[GitLab Runner](/docs/services/gitlab-runner)**. New to Laradock? Start at **[Getting Started](/docs/getting-started)**.
