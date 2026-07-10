---
slug: /services/mailpit
title: Mailpit
description: Run Mailpit in Laradock to catch outgoing dev email, view it in a web UI, and wire it up as your Laravel mail driver.
keywords:
  - laradock mailpit
  - mailpit docker
  - mailpit docker compose
  - laravel mail testing docker
  - fake smtp server docker
  - catch email in development
---

## What is Mailpit?

[Mailpit](https://mailpit.axllent.org) is a modern, fast, Go-based SMTP testing tool. It runs a fake SMTP server that catches every email your app sends and shows them in a web UI, instead of actually delivering them. Laradock builds it as its own container so you never accidentally send real email from a dev environment.

## Start Mailpit

```bash
docker compose up -d mailpit
```

## Stop Mailpit

```bash
docker compose stop mailpit
```

This stops the container without deleting its data. To remove the container: `docker compose rm -f mailpit`.

## Configuration

All settings live in `mailpit/defaults.env` and can be overridden by adding the same line to your own `.env`:

| Variable | Default | What it does |
|---|---|---|
| `MAILPIT_HTTP_PORT` | `8125` | Host-side port for the web UI (container port `8025`). |
| `MAILPIT_SMTP_PORT` | `1125` | Host-side port for the SMTP catcher (container port `1025`). |

## Connect your app

Open the web UI at [http://localhost:8125](http://localhost:8125) to see caught mail. Point your app's SMTP settings at the `mailpit` container name (not `localhost`) on its internal port `1025`:

```env
MAIL_MAILER=smtp
MAIL_HOST=mailpit
MAIL_PORT=1125
MAIL_USERNAME=null
MAIL_PASSWORD=null
```

## Common issues

- **Mail isn't showing up in the UI.** Confirm your app's `.env` uses `MAIL_HOST=mailpit` (the container name), not `localhost` or `127.0.0.1`, those only resolve from your host machine, not from inside another container like `workspace` or `php-fpm`.
- **Port already in use on your host.** Change `MAILPIT_HTTP_PORT` (and/or `MAILPIT_SMTP_PORT`) in `.env` and restart: `docker compose up -d mailpit`.
- **Confusing the two ports.** `MAILPIT_SMTP_PORT` (`1125` by default) is what your app sends mail to; `MAILPIT_HTTP_PORT` (`8125`) is where you view it in a browser. They're not interchangeable.

---

Looking for the older Go-based tool Mailpit replaced? See **[MailHog](/docs/services/mailhog)**. Need a full mail server instead of a dev catcher? See **[Mailu](/docs/services/mailu)**. New to Laradock? Start with **[Getting Started](/docs/getting-started)**.
