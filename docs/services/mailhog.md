# MailHog

Source: https://laradock.io/docs/services/mailhog

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

## What is MailHog?

[MailHog](https://github.com/mailhog/MailHog) is an SMTP testing tool that catches outgoing dev email and shows it in a web UI instead of delivering it. It was one of the most widely used dev mail catchers for years, but the project has been effectively unmaintained since 2022. Laradock still ships it for existing setups, but new projects should prefer **[Mailpit](https://laradock.io/docs/services/mailpit)**, a modern, actively maintained, drop-in replacement written in Go.

## Start MailHog

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock start mailhog
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose up -d mailhog
```

</TabItem>
</Tabs>

## Stop MailHog

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock stop mailhog
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose stop mailhog
```

</TabItem>
</Tabs>

This stops the container without deleting anything. MailHog keeps caught messages **in memory only** (no data volume), so stopping, restarting, or removing the container also clears every caught email, there's nothing on disk to preserve.

To remove the container:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock remove mailhog
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose rm -sf mailhog
```

</TabItem>
</Tabs>

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

## Clear captured mail

MailHog has no persistent storage, so any of these throw away everything it has caught so far:

- **From the web UI**: open [http://localhost:8025](http://localhost:8025) and click the trash/delete-all button in the top bar.
- **Via the HTTP API**, from your host machine:

```bash
curl -X DELETE http://localhost:8025/api/v1/messages
```

- **By restarting the container** (same effect, since nothing is written to disk):

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock restart mailhog
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose restart mailhog
```

</TabItem>
</Tabs>

## Common issues

- **Mail isn't showing up in the UI.** Confirm your app's `.env` uses `MAIL_HOST=mailhog` (the container name), not `localhost` or `127.0.0.1`, those only resolve from your host machine, not from inside another container.
- **Port `1025` or `8025` already taken on your host.** MailHog's ports aren't configurable via `.env`. Either free the port, or switch to `mailpit` or `maildev`, both of which expose `MAILHOG`-equivalent ports through env vars.
- **Caught mail disappeared after a restart.** Expected: MailHog only keeps messages in memory, restarting or recreating the container always clears them. There's nothing to back up or restore.
- **Considering MailHog for a new project.** The upstream project is largely dormant. Use **[Mailpit](https://laradock.io/docs/services/mailpit)** instead, same idea, actively maintained, configurable ports.

---

Prefer the actively maintained successor? See **[Mailpit](https://laradock.io/docs/services/mailpit)**. New to Laradock? Start with **[Getting Started](https://laradock.io/docs/getting-started)**.
