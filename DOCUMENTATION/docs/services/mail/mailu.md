---
slug: /services/mailu
title: Mailu
description: Run Mailu, a full self-hosted mail server suite, in Laradock. Configure domains, TLS, webmail, antispam, and connect your app to real SMTP/IMAP.
keywords:
  - laradock mailu
  - mailu docker
  - mailu docker compose
  - self hosted mail server docker
  - docker smtp imap server
  - mailu webmail
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

## What is Mailu?

[Mailu](https://mailu.io) is a full self-hosted mail server suite: SMTP, IMAP, webmail, antispam, and antivirus, all in one stack. Unlike the other mail services in Laradock (Mailpit, MailHog, MailDev, MailCatcher), which only catch and display outgoing dev email, Mailu is a real mail server capable of sending and receiving actual mail for a domain you control. Laradock wires up the whole Mailu stack as a group of containers.

## Start Mailu

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock start mailu
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose up -d mailu
```

</TabItem>
</Tabs>

`mailu/compose.yml` defines `mailu` as the umbrella service, depending on `mailu-front` (nginx), `mailu-imap` (Dovecot), `mailu-smtp` (Postfix), `mailu-antispam` (rspamd), `mailu-antivirus` (ClamAV), `mailu-webdav`, `mailu-admin`, and `mailu-webmail` (Rainloop by default), plus `mailu-fetchmail`. Starting `mailu` brings up the whole chain automatically. `mailu-admin` also depends on `redis`.

## Stop Mailu

Stopping just pauses the containers; **your data is safe**. `depends_on` only cascades on `up`, not `stop`, so every container has to be named explicitly:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock stop mailu mailu-front mailu-imap mailu-smtp mailu-antispam mailu-antivirus mailu-webdav mailu-admin mailu-webmail mailu-fetchmail
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose stop mailu mailu-front mailu-imap mailu-smtp mailu-antispam mailu-antivirus mailu-webdav mailu-admin mailu-webmail mailu-fetchmail
```

</TabItem>
</Tabs>

To delete all the containers entirely (the data on disk is still untouched, it lives under `DATA_PATH_HOST/mailu/`):

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock remove mailu mailu-front mailu-imap mailu-smtp mailu-antispam mailu-antivirus mailu-webdav mailu-admin mailu-webmail mailu-fetchmail
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose rm -sf mailu mailu-front mailu-imap mailu-smtp mailu-antispam mailu-antivirus mailu-webdav mailu-admin mailu-webmail mailu-fetchmail
```

</TabItem>
</Tabs>

## Configuration

All settings live in `mailu/defaults.env` and can be overridden by adding the same line to your own `.env`. This is a large suite, so only the most commonly touched settings are listed here, the file has more (DMARC report addresses, welcome-email text, statistics opt-out, password hashing scheme).

| Variable | Default | What it does |
|---|---|---|
| `MAILU_VERSION` | `latest` | Image tag shared by every Mailu container. |
| `MAILU_DOMAIN` | `example.com` | Main mail domain. |
| `MAILU_HOSTNAMES` | `mail.example.com,alternative.example.com,yetanother.example.com` | Comma-separated hostnames this server answers to. |
| `MAILU_POSTMASTER` | `admin` | Local part of the postmaster address (`postmaster@`+`MAILU_DOMAIN`). |
| `MAILU_HTTP_PORT` | `6080` | Host-side port for the web admin/webmail (container port `80`). |
| `MAILU_HTTPS_PORT` | `60443` | Host-side port for HTTPS (container port `443`). |
| `MAILU_WEB_ADMIN` | `/admin` | URL path the admin interface is served under. |
| `MAILU_WEB_WEBMAIL` | `/webmail` | URL path the webmail client is served under. |
| `MAILU_INIT_ADMIN_USERNAME` | `laradock` | Username for the admin account created on first boot. |
| `MAILU_INIT_ADMIN_PASSWORD` | `laradock` | Password for that admin account. |
| `MAILU_SECRET_KEY` | `ChangeMeChangeMe` | Random 16-byte secret used internally; change this before any real use. |
| `MAILU_TLS_FLAVOR` | `cert` | TLS mode: `letsencrypt`, `cert`, `notls`, or `mail`. |
| `MAILU_MESSAGE_SIZE_LIMIT` | `50000000` | Max accepted message size in bytes (default 50MB). |
| `MAILU_RELAYHOST` | *(empty)* | Upstream SMTP relay for outgoing mail, if any. |
| `MAILU_RELAYNETS` | `172.16.0.0/12` | Networks granted relay permission; must include your Docker network. |
| `MAILU_RECIPIENT_DELIMITER` | `+` | Character separating the local part from a custom tag (`user+tag@domain`). |
| `MAILU_WEBMAIL` | `rainloop` | Which webmail client to run (`rainloop`, `roundcube`, or `none`). |
| `MAILU_WEBDAV` | `radicale` | DAV server implementation (`radicale` or `none`). |
| `MAILU_ADMIN` | `true` | Whether the admin web interface is exposed. |
| `MAILU_AUTH_RATELIMIT` | `10/minute;1000/hour` | Login rate limit per source IP. |
| `MAILU_RECAPTCHA_PUBLIC_KEY` | *(placeholder)* | reCAPTCHA public key, required for the signup form. |
| `MAILU_RECAPTCHA_PRIVATE_KEY` | *(placeholder)* | reCAPTCHA private key, required for the signup form. |

## Set up a domain

You'll need a registered domain and a [reCAPTCHA key pair](https://www.google.com/recaptcha/admin) for the signup email flow. In your `.env`:

```env
MAILU_RECAPTCHA_PUBLIC_KEY=<YOUR_RECAPTCHA_PUBLIC_KEY>
MAILU_RECAPTCHA_PRIVATE_KEY=<YOUR_RECAPTCHA_PRIVATE_KEY>
MAILU_DOMAIN=laradock.io
MAILU_HOSTNAMES=mail.laradock.io
```

Then [start the stack](#start-mailu) and open `http://YOUR_DOMAIN` (or `https://` with a proper `MAILU_TLS_FLAVOR`).

## Ports and real mail protocols

Unlike the other mail services, Mailu's `mailu-front` container publishes real mail protocol ports directly, hardcoded in `mailu/compose.yml` rather than driven by env vars: `110` (POP3), `143` (IMAP), `993` (IMAPS), `995` (POP3S), `25` (SMTP), `465` (SMTPS), `587` (submission). Only the web ports (`MAILU_HTTP_PORT`, `MAILU_HTTPS_PORT`) are configurable via `.env`. This also means you can only run **one** Mailu stack per host at a time, since a second project can't rebind those same protocol ports.

## Initial admin login

On first boot, the `mailu` container automatically provisions an admin account from `MAILU_INIT_ADMIN_USERNAME` and `MAILU_INIT_ADMIN_PASSWORD` (`laradock` / `laradock` by default), it's not something you need to unlock or dig out of a log file.

- **Admin panel**: `http://<your host>:<MAILU_HTTP_PORT><MAILU_WEB_ADMIN>` (`http://localhost:6080/admin` with defaults). Log in with `MAILU_INIT_ADMIN_USERNAME@MAILU_DOMAIN` and `MAILU_INIT_ADMIN_PASSWORD`.
- **Webmail**: `http://<your host>:<MAILU_HTTP_PORT><MAILU_WEB_WEBMAIL>` (`http://localhost:6080/webmail` with defaults), same credentials for any mailbox you create.

Change `MAILU_INIT_ADMIN_PASSWORD` and `MAILU_SECRET_KEY` in your `.env` before using this for anything beyond local testing, both ship with placeholder values.

## Manage users and domains from the CLI

The admin panel's signup form needs a working reCAPTCHA key pair. If you haven't set one up yet, create domains and mailboxes directly through `manage.py` inside the admin container instead:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock enter mailu-admin
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose exec mailu-admin bash
```

</TabItem>
</Tabs>

Then, inside the container:

```bash
python manage.py domain laradock.io
python manage.py user newuser laradock.io somepassword
```

The same `manage.py admin <localpart> <domain> <password>` form is what Laradock itself runs on first boot to create `MAILU_INIT_ADMIN_USERNAME` (see the `mailu` service's `command` in `mailu/compose.yml`), use it to promote any mailbox to admin.

## Backup and restore

Everything Mailu owns (mailboxes, DKIM keys, webmail state, TLS certs, spam filter data, DAV data) lives under `DATA_PATH_HOST/mailu/`, there's no separate export tool like a database dump, it's just files on disk. Stop the stack first so nothing is mid-write:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock stop mailu mailu-front mailu-imap mailu-smtp mailu-antispam mailu-antivirus mailu-webdav mailu-admin mailu-webmail mailu-fetchmail
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose stop mailu mailu-front mailu-imap mailu-smtp mailu-antispam mailu-antivirus mailu-webdav mailu-admin mailu-webmail mailu-fetchmail
```

</TabItem>
</Tabs>

Then archive the data folder:

```bash
tar -czf mailu-backup.tar.gz -C "${DATA_PATH_HOST:-~/.laradock/data}" mailu
```

To restore, stop the stack, delete or move aside the existing `DATA_PATH_HOST/mailu/` folder, extract the archive back into `DATA_PATH_HOST`, then [start Mailu](#start-mailu) again.

## Start completely fresh (wipe all data)

To throw away every mailbox, domain, and cert and start Mailu from a clean, empty state (⚠️ this **permanently deletes** all mail data, back up first if you need anything):

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock stop mailu mailu-front mailu-imap mailu-smtp mailu-antispam mailu-antivirus mailu-webdav mailu-admin mailu-webmail mailu-fetchmail
./laradock remove mailu mailu-front mailu-imap mailu-smtp mailu-antispam mailu-antivirus mailu-webdav mailu-admin mailu-webmail mailu-fetchmail
rm -rf "${DATA_PATH_HOST:-~/.laradock/data}/mailu"
./laradock start mailu
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose stop mailu mailu-front mailu-imap mailu-smtp mailu-antispam mailu-antivirus mailu-webdav mailu-admin mailu-webmail mailu-fetchmail
docker compose rm -sf mailu mailu-front mailu-imap mailu-smtp mailu-antispam mailu-antivirus mailu-webdav mailu-admin mailu-webmail mailu-fetchmail
rm -rf "${DATA_PATH_HOST:-~/.laradock/data}/mailu"
docker compose up -d mailu
```

</TabItem>
</Tabs>

Deleting the folder and starting again re-provisions the admin account from `MAILU_INIT_ADMIN_USERNAME`/`MAILU_INIT_ADMIN_PASSWORD`, exactly like a brand-new install.

## Common issues

- **Signup form doesn't work.** You still have placeholder reCAPTCHA keys (`MAILU_RECAPTCHA_PUBLIC_KEY`/`MAILU_RECAPTCHA_PRIVATE_KEY`). Generate a real pair and rebuild, or [create mailboxes from the CLI](#manage-users-and-domains-from-the-cli) instead.
- **Mail rejected or not relayed.** Check `MAILU_RELAYNETS` includes your Docker network range, and that `MAILU_RELAYHOST` is set correctly if you're relaying through an upstream SMTP provider.
- **Only the `mailu` container is running, the rest aren't.** `depends_on` only affects `up`, not `stop`. If you tore down the stack partially, bring everything back with `./laradock start mailu`.
- **Data lost between restarts on multi-project setups.** Two Laradock projects on the same machine need unique `COMPOSE_PROJECT_NAME` and `DATA_PATH_HOST` values, otherwise they share the same `DATA_PATH_HOST/mailu/` data on disk.
- **Second Laradock project won't start Mailu at all.** The real mail protocol ports (`25`, `110`, `143`, `465`, `587`, `993`, `995`) are hardcoded in `mailu/compose.yml`, not driven by `.env`, so only one Mailu stack can run per host regardless of `DATA_PATH_HOST`/`COMPOSE_PROJECT_NAME`.
- **Just testing outgoing mail in dev, not building a real mail server?** Mailu is overkill for that, use a lightweight catcher instead.

---

Just need to catch dev email, not run a real mail server? See **[Mailpit](/docs/services/mailpit)**. New to Laradock? Start with **[Getting Started](/docs/getting-started)**.
