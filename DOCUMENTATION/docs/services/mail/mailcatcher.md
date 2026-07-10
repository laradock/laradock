---
slug: /services/mailcatcher
title: MailCatcher
description: Run MailCatcher in Laradock to catch outgoing dev email and view it in a web UI. One of the original Ruby-based dev mail catchers.
keywords:
  - laradock mailcatcher
  - mailcatcher docker
  - mailcatcher docker compose
  - laravel mail testing docker
  - fake smtp server docker
  - catch email in development
---

## What is MailCatcher?

[MailCatcher](https://mailcatcher.me) is a Ruby-based SMTP testing tool and one of the original tools in this space, it runs a fake SMTP server that catches outgoing dev email and shows it in a web UI instead of delivering it. Laradock builds it from the `schickling/mailcatcher` image.

## Start MailCatcher

```bash
docker compose up -d mailcatcher
```

## Stop MailCatcher

```bash
docker compose stop mailcatcher
```

This stops the container without deleting its data. To remove the container: `docker compose rm -f mailcatcher`.

## Configuration

MailCatcher has no `defaults.env`, its ports are fixed directly in `mailcatcher/compose.yml`:

| Port | Purpose |
|---|---|
| `1025` | SMTP, point your app's mail driver here. |
| `1080` | Web UI, browse caught mail here. |

Because these are hardcoded (`"1025:1025"` and `"1080:1080"`), there's no `MAILCATCHER_*_PORT` variable to override in `.env`. The container runs `mailcatcher --no-quit --foreground --ip=0.0.0.0` (set in `mailcatcher/Dockerfile`), so it listens on all interfaces inside the container.

## Connect your app

Open the web UI at [http://localhost:1080](http://localhost:1080). Point your app's SMTP settings at the `mailcatcher` container name (not `localhost`) on port `1025`:

```env
MAIL_MAILER=smtp
MAIL_HOST=mailcatcher
MAIL_PORT=1025
MAIL_USERNAME=null
MAIL_PASSWORD=null
```

## Common issues

- **Mail isn't showing up in the UI.** Confirm your app's `.env` uses `MAIL_HOST=mailcatcher` (the container name), not `localhost` or `127.0.0.1`, those only resolve from your host machine, not from inside another container.
- **Port `1025` or `1080` already taken on your host.** MailCatcher's ports aren't configurable via `.env`. Either free the port, or switch to `mailpit` or `maildev`, both of which expose equivalent ports through env vars.
- **Looking for something more actively developed.** MailCatcher (the Ruby gem) sees infrequent updates. **[Mailpit](/docs/services/mailpit)** is a modern, actively maintained alternative with the same core idea.

---

Prefer the actively maintained, Go-based alternative? See **[Mailpit](/docs/services/mailpit)**. New to Laradock? Start with **[Getting Started](/docs/getting-started)**.
