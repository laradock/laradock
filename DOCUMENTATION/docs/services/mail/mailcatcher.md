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

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

## What is MailCatcher?

[MailCatcher](https://mailcatcher.me) is a Ruby-based SMTP testing tool and one of the original tools in this space, it runs a fake SMTP server that catches outgoing dev email and shows it in a web UI instead of delivering it. Laradock builds it from the `schickling/mailcatcher` image.

## Start MailCatcher

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock start mailcatcher
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose up -d mailcatcher
```

</TabItem>
</Tabs>

## Stop MailCatcher

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock stop mailcatcher
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose stop mailcatcher
```

</TabItem>
</Tabs>

This stops the container without touching anything on disk. To remove the container:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock remove mailcatcher
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose rm -sf mailcatcher
```

</TabItem>
</Tabs>

Either way, all captured mail is gone once the container stops, see [Captured mail is not persisted](#captured-mail-is-not-persisted-by-design) below.

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

## Clear captured mail

Click **Clear** in the top-right of the web UI to delete every caught message, or do it from the command line with MailCatcher's own HTTP API:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
curl -X DELETE http://localhost:1080/messages
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
curl -X DELETE http://localhost:1080/messages
```

</TabItem>
</Tabs>

This hits MailCatcher directly over the published web UI port, it's the same for both columns since it's a plain HTTP call, not a container command. You can also list captured messages as JSON with `curl http://localhost:1080/messages`, useful for asserting on sent mail from a test script.

## Captured mail is not persisted by design

MailCatcher has no `compose.yml` volume mount, it keeps every caught message in an in-memory SQLite database inside the container. That means:

- Stopping, removing, or rebuilding the container **wipes all captured mail**, there's nothing to back up and nothing to restore.
- There's no "start completely fresh" step needed, every fresh start already is one.

If you need captured mail to survive container restarts across a longer test run, that's a reason to reach for **[Mailpit](/docs/services/mailpit)** instead, which persists to a database file on disk.

## Common issues

- **Mail isn't showing up in the UI.** Confirm your app's `.env` uses `MAIL_HOST=mailcatcher` (the container name), not `localhost` or `127.0.0.1`, those only resolve from your host machine, not from inside another container.
- **Mail I caught yesterday is gone.** Expected, see [Captured mail is not persisted](#captured-mail-is-not-persisted-by-design) above, restarting the container always clears the inbox.
- **Port `1025` or `1080` already taken on your host.** MailCatcher's ports aren't configurable via `.env`. Either free the port, or switch to `mailpit` or `maildev`, both of which expose equivalent ports through env vars.
- **Looking for something more actively developed.** MailCatcher (the Ruby gem) sees infrequent updates. **[Mailpit](/docs/services/mailpit)** is a modern, actively maintained alternative with the same core idea.

---

Prefer the actively maintained, Go-based alternative? See **[Mailpit](/docs/services/mailpit)**. New to Laradock? Start with **[Getting Started](/docs/getting-started)**.
