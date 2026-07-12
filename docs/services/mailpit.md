# Mailpit

Source: https://laradock.io/docs/services/mailpit

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

## What is Mailpit?

[Mailpit](https://mailpit.axllent.org) is a modern, fast, Go-based SMTP testing tool. It runs a fake SMTP server that catches every email your app sends and shows them in a web UI, instead of actually delivering them. Laradock builds it as its own container so you never accidentally send real email from a dev environment.

## Start Mailpit

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock start mailpit
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose up -d mailpit
```

</TabItem>
</Tabs>

Mailpit keeps caught mail **in memory only**, there's no data volume in its `compose.yml`. Any mail it has caught is gone the moment the container stops or restarts, that's expected, not a bug.

## Stop Mailpit

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock stop mailpit
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose stop mailpit
```

</TabItem>
</Tabs>

This also clears every caught email, since nothing is written to disk. To remove the container as well:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock remove mailpit
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose rm -sf mailpit
```

</TabItem>
</Tabs>

## Configuration

All settings live in `mailpit/defaults.env` and can be overridden by adding the same line to your own `.env`:

| Variable | Default | What it does |
|---|---|---|
| `MAILPIT_HTTP_PORT` | `8125` | Host-side port for the web UI (container port `8025`). |
| `MAILPIT_SMTP_PORT` | `1125` | Host-side port for the SMTP catcher (container port `1025`). |

## Connect your app

Open the web UI at [http://localhost:8125](http://localhost:8125) to see caught mail. Other containers on the same Laradock network (`workspace`, `php-fpm`, ...) reach Mailpit by its **container name** on its **container-internal** ports, `8025` and `1025`, not the host-side `MAILPIT_HTTP_PORT`/`MAILPIT_SMTP_PORT` values:

```env
MAIL_MAILER=smtp
MAIL_HOST=mailpit
MAIL_PORT=1025
MAIL_USERNAME=null
MAIL_PASSWORD=null
```

From your **host machine** (a native mail client, a script outside Docker), use `localhost` and the host-side ports instead: SMTP on `MAILPIT_SMTP_PORT` (`1125`), web UI on `MAILPIT_HTTP_PORT` (`8125`).

## Clear captured mail

Click the trash icon in the web UI to delete all messages, or delete them from the command line via Mailpit's REST API:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
curl -X DELETE http://localhost:8125/api/v1/messages
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
curl -X DELETE http://localhost:8125/api/v1/messages
```

</TabItem>
</Tabs>

This talks to the published web UI port from your host, so the command is identical either way; there's no container-specific form of it. Restarting the container (see [Start Mailpit](#start-mailpit)) achieves the same thing, since caught mail doesn't survive a restart anyway.

## Read caught mail from a test suite

Mailpit exposes a JSON API, handy for E2E tests that need to grab a verification code or a magic link out of an email your app just sent, without a human opening the UI:

```bash
curl http://localhost:8125/api/v1/messages
```

Each entry includes an `ID` you can pass to `GET /api/v1/message/{ID}` for the full body (HTML/text/headers). See the [Mailpit API docs](https://mailpit.axllent.org/docs/api-cli/view/) for the full schema. From inside another container, use the container-internal address instead: `http://mailpit:8025/api/v1/messages`.

## Common issues

- **Mail isn't showing up in the UI.** Confirm your app's `.env` uses `MAIL_HOST=mailpit` (the container name) and `MAIL_PORT=1025` (the container-internal SMTP port), not `localhost`/`MAILPIT_SMTP_PORT`, those only resolve from your host machine, not from inside another container like `workspace` or `php-fpm`.
- **Mail I caught yesterday is gone.** Expected: Mailpit only keeps mail in memory. Any `./laradock stop mailpit`, `./laradock restart mailpit`, or host reboot clears it.
- **Port already in use on your host.** Change `MAILPIT_HTTP_PORT` (and/or `MAILPIT_SMTP_PORT`) in `.env` and restart: `./laradock restart mailpit`.
- **Confusing the two ports.** `MAILPIT_SMTP_PORT` (`1125` by default) is what you send mail to *from your host*; `MAILPIT_HTTP_PORT` (`8125`) is where you view it in a browser *from your host*. Containers on the Laradock network use the container-internal `1025`/`8025` instead, not either of these.

---

Looking for the older Go-based tool Mailpit replaced? See **[MailHog](https://laradock.io/docs/services/mailhog)**. Need a full mail server instead of a dev catcher? See **[Mailu](https://laradock.io/docs/services/mailu)**. New to Laradock? Start with **[Getting Started](https://laradock.io/docs/getting-started)**.
