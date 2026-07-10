---
slug: /services/maildev
title: MailDev
description: Run MailDev in Laradock to catch outgoing dev email and view it in a web UI, with configurable HTTP and SMTP ports.
keywords:
  - laradock maildev
  - maildev docker
  - maildev docker compose
  - laravel mail testing docker
  - fake smtp server docker
  - catch email in development
---

## What is MailDev?

[MailDev](https://github.com/maildev/maildev) is a simple SMTP testing tool: it catches outgoing dev email and shows it in a web UI instead of delivering it, similar in purpose to [Mailpit](/docs/services/mailpit) and [MailHog](/docs/services/mailhog). Laradock builds it as its own container from the official `maildev/maildev` image.

## Start MailDev

```bash
docker compose up -d maildev
```

## Stop MailDev

```bash
docker compose stop maildev
```

This stops the container without deleting its data. To remove the container: `docker compose rm -f maildev`.

## Configuration

All settings live in `maildev/defaults.env` and can be overridden by adding the same line to your own `.env`:

| Variable | Default | What it does |
|---|---|---|
| `MAILDEV_HTTP_PORT` | `1080` | Host-side port for the web UI (container port `1080`). |
| `MAILDEV_SMTP_PORT` | `25` | Host-side port for the SMTP catcher (container port `25`). |

## Connect your app

Open the web UI at [http://localhost:1080](http://localhost:1080). Point your app's SMTP settings at the `maildev` container name (not `localhost`) on its internal SMTP port:

```env
MAIL_MAILER=smtp
MAIL_HOST=maildev
MAIL_PORT=25
MAIL_USERNAME=null
MAIL_PASSWORD=null
```

## Common issues

- **Mail isn't showing up in the UI.** Confirm your app's `.env` uses `MAIL_HOST=maildev` (the container name), not `localhost` or `127.0.0.1`, those only resolve from your host machine, not from inside another container.
- **Port `25` conflicts on your host.** Port 25 is often reserved or blocked by ISPs/host mail agents. Change `MAILDEV_SMTP_PORT` in `.env` and restart: `docker compose up -d maildev`.
- **Port already in use for the web UI.** Change `MAILDEV_HTTP_PORT` in `.env` and restart the container.

---

Prefer a more actively maintained, Go-based catcher? See **[Mailpit](/docs/services/mailpit)**. New to Laradock? Start with **[Getting Started](/docs/getting-started)**.
