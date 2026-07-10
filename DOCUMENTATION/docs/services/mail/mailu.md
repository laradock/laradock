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

## What is Mailu?

[Mailu](https://mailu.io) is a full self-hosted mail server suite: SMTP, IMAP, webmail, antispam, and antivirus, all in one stack. Unlike the other mail services in Laradock (Mailpit, MailHog, MailDev, MailCatcher), which only catch and display outgoing dev email, Mailu is a real mail server capable of sending and receiving actual mail for a domain you control. Laradock wires up the whole Mailu stack as a group of containers.

## Start Mailu

```bash
docker compose up -d mailu
```

`mailu/compose.yml` defines `mailu` as the umbrella service, depending on `mailu-front` (nginx), `mailu-imap` (Dovecot), `mailu-smtp` (Postfix), `mailu-antispam` (rspamd), `mailu-antivirus` (ClamAV), `mailu-webdav`, `mailu-admin`, and `mailu-webmail` (Rainloop by default), plus `mailu-fetchmail`. Starting `mailu` brings up the whole chain automatically. `mailu-admin` also depends on `redis`.

## Stop Mailu

```bash
docker compose stop mailu mailu-front mailu-imap mailu-smtp mailu-antispam mailu-antivirus mailu-webdav mailu-admin mailu-webmail mailu-fetchmail
```

`docker compose stop mailu` alone only stops the umbrella container; the underlying mail services keep running since compose doesn't cascade `stop` down `depends_on`. Data (mail, DKIM keys, certs, webmail state) lives under `DATA_PATH_HOST/mailu/`.

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

Then start the stack and open `http://YOUR_DOMAIN` (or `https://` with a proper `MAILU_TLS_FLAVOR`).

## Ports and real mail protocols

Unlike the other mail services, Mailu's `mailu-front` container publishes real mail protocol ports directly, hardcoded in `mailu/compose.yml` rather than driven by env vars: `110` (POP3), `143` (IMAP), `993` (IMAPS), `995` (POP3S), `25` (SMTP), `465` (SMTPS), `587` (submission). Only the web ports (`MAILU_HTTP_PORT`, `MAILU_HTTPS_PORT`) are configurable via `.env`.

## Common issues

- **Signup form doesn't work.** You still have placeholder reCAPTCHA keys (`MAILU_RECAPTCHA_PUBLIC_KEY`/`MAILU_RECAPTCHA_PRIVATE_KEY`). Generate a real pair and rebuild.
- **Mail rejected or not relayed.** Check `MAILU_RELAYNETS` includes your Docker network range, and that `MAILU_RELAYHOST` is set correctly if you're relaying through an upstream SMTP provider.
- **Only the `mailu` container is running, the rest aren't.** `depends_on` only affects `up`, not `stop`. If you tore down the stack partially, bring everything back with `docker compose up -d mailu`.
- **Data lost between restarts on multi-project setups.** Two Laradock projects on the same machine need unique `COMPOSE_PROJECT_NAME` and `DATA_PATH_HOST` values, otherwise they share the same `DATA_PATH_HOST/mailu/` data on disk.
- **Just testing outgoing mail in dev, not building a real mail server?** Mailu is overkill for that, use a lightweight catcher instead.

---

Just need to catch dev email, not run a real mail server? See **[Mailpit](/docs/services/mailpit)**. New to Laradock? Start with **[Getting Started](/docs/getting-started)**.
