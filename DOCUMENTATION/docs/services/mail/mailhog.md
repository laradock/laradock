---
slug: /services/mailhog
title: MailHog
description: Run MailHog in Laradock to catch outgoing dev email and view it in a web UI. Legacy tool, largely superseded by Mailpit.
keywords:
  - laradock mailhog
  - mailhog docker
  - mailhog docker compose
  - laravel mail testing docker
  - fake smtp server docker
  - catch email in development
---

## What is MailHog?

[MailHog](https://github.com/mailhog/MailHog) is an SMTP testing tool that catches outgoing dev email and shows it in a web UI instead of delivering it. It was one of the most widely used dev mail catchers for years, but the project has been effectively unmaintained since 2022. Laradock still ships it for existing setups, but new projects should prefer **[Mailpit](/docs/services/mailpit)**, a modern, actively maintained, drop-in replacement written in Go.

## Start MailHog

```bash
docker compose up -d mailhog
```

## Stop MailHog

```bash
docker compose stop mailhog
```

This stops the container without deleting its data. To remove the container: `docker compose rm -f mailhog`.

## Configuration

MailHog has no `defaults.env`, its ports are fixed directly in `mailhog/compose.yml`:

| Port | Purpose |
|---|---|
| `1025` | SMTP, point your app's mail driver here. |
| `8025` | Web UI, browse caught mail here. |

Because these are hardcoded (`"1025:1025"` and `"8025:8025"`), there's no `MAILHOG_*_PORT` variable to override in `.env`. If you need a configurable port, use `mailpit` or `maildev` instead.

## Connect your app

Open the web UI at [http://localhost:8025](http://localhost:8025). Point your app's SMTP settings at the `mailhog` container name (not `localhost`) on port `1025`:

```env
MAIL_MAILER=smtp
MAIL_HOST=mailhog
MAIL_PORT=1025
MAIL_USERNAME=null
MAIL_PASSWORD=null
```

## Common issues

- **Mail isn't showing up in the UI.** Confirm your app's `.env` uses `MAIL_HOST=mailhog` (the container name), not `localhost` or `127.0.0.1`, those only resolve from your host machine, not from inside another container.
- **Port `1025` or `8025` already taken on your host.** MailHog's ports aren't configurable via `.env`. Either free the port, or switch to `mailpit` or `maildev`, both of which expose `MAILHOG`-equivalent ports through env vars.
- **Considering MailHog for a new project.** The upstream project is largely dormant. Use **[Mailpit](/docs/services/mailpit)** instead, same idea, actively maintained, configurable ports.

---

Prefer the actively maintained successor? See **[Mailpit](/docs/services/mailpit)**. New to Laradock? Start with **[Getting Started](/docs/getting-started)**.
