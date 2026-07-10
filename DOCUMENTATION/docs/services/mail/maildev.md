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

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

## What is MailDev?

[MailDev](https://github.com/maildev/maildev) is a simple SMTP testing tool: it catches outgoing dev email and shows it in a web UI instead of delivering it, similar in purpose to [Mailpit](/docs/services/mailpit) and [MailHog](/docs/services/mailhog). Laradock builds it as its own container from the official `maildev/maildev` image.

## Start MailDev

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock start maildev
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose up -d maildev
```

</TabItem>
</Tabs>

MailDev keeps no volume on disk, everything it catches lives in the container's memory only. That's fine for day-to-day dev testing, just know that stopping or removing the container discards every captured email (see [Clear captured mail](#clear-captured-mail) below if you want to do that on purpose without restarting).

## Stop MailDev

Stopping just pauses the container:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock stop maildev
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose stop maildev
```

</TabItem>
</Tabs>

To remove the container:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock remove maildev
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose rm -sf maildev
```

</TabItem>
</Tabs>

Since MailDev has no data volume, stopping or removing it has the same practical effect either way: whatever mail was captured is gone once the container isn't running.

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

## Clear captured mail

MailDev has no "delete all" data-wipe step the way a database would, since it never writes to disk. To clear what's currently showing in the web UI:

- **From the UI**: open [http://localhost:1080](http://localhost:1080) and use the trash/delete-all icon in the toolbar to clear every captured message, or delete individual messages from their row.
- **From the REST API**: MailDev exposes a small HTTP API on the same port as the web UI. To delete everything:

```bash
curl -X DELETE http://localhost:1080/email/all
```

Restarting or removing the container achieves the same result, since nothing is persisted between runs anyway.

## Common issues

- **Mail isn't showing up in the UI.** Confirm your app's `.env` uses `MAIL_HOST=maildev` (the container name), not `localhost` or `127.0.0.1`, those only resolve from your host machine, not from inside another container.
- **Port `25` conflicts on your host.** Port 25 is often reserved or blocked by ISPs/host mail agents. Change `MAILDEV_SMTP_PORT` in `.env` and restart: `./laradock restart maildev`.
- **Port already in use for the web UI.** Change `MAILDEV_HTTP_PORT` in `.env` and restart: `./laradock restart maildev`.
- **Captured mail disappeared.** Expected if the container was stopped, removed, or restarted, MailDev keeps everything in memory only, there's no volume backing it.

---

Prefer a more actively maintained, Go-based catcher? See **[Mailpit](/docs/services/mailpit)**. New to Laradock? Start with **[Getting Started](/docs/getting-started)**.
