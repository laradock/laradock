---
slug: /services/blackfire
title: Blackfire
description: Run Blackfire in Laradock to profile PHP performance. Start the agent, add your Blackfire.io credentials, and probe your app from php-fpm or workspace.
keywords:
  - laradock blackfire
  - blackfire docker
  - blackfire docker compose
  - php profiling docker
  - php performance profiler
---

## What is Blackfire?

[Blackfire](https://www.blackfire.io) is a PHP (and web) performance profiler from the SensioLabs/Symfony team: it traces function calls, memory, I/O, and SQL to help you find bottlenecks. It's a hosted SaaS product, the agent Laradock runs locally only collects and forwards profiling data to your Blackfire.io account.

## Start Blackfire

```bash
docker compose up -d blackfire
```

The `blackfire` container depends on `php-fpm`. It only collects data when a profiling run is triggered from a PHP process with the Blackfire probe enabled, it doesn't serve anything on its own.

## Stop Blackfire

```bash
docker compose stop blackfire
```

## Configuration

`blackfire/defaults.env` holds the credentials for the agent container itself:

| Variable | Default | What it does |
|---|---|---|
| `BLACKFIRE_SERVER_ID` | `<server_id>` | Server ID from your Blackfire.io account (Settings → Credentials). |
| `BLACKFIRE_SERVER_TOKEN` | `<server_token>` | Server token paired with the above. |

You need a [Blackfire.io account](https://blackfire.io) to get real values, the placeholders won't authenticate. Set both in your `.env` before starting the container.

There's a second pair of credentials, `BLACKFIRE_CLIENT_ID`/`BLACKFIRE_CLIENT_TOKEN`, set in `workspace/defaults.env`. Those are for the Blackfire *probe* baked into `php-fpm`/`workspace` at build time (via `INSTALL_BLACKFIRE=true`), not the agent container, and they authenticate the actual profiling client, not just the agent relay.

## Enable profiling on PHP

The agent alone isn't enough, `php-fpm` (or `workspace`, for CLI profiling) needs the Blackfire probe extension installed, which only happens if `INSTALL_XDEBUG=false` and `INSTALL_BLACKFIRE=true` at build time:

```env
INSTALL_BLACKFIRE=true
BLACKFIRE_CLIENT_ID=your_client_id
BLACKFIRE_CLIENT_TOKEN=your_client_token
BLACKFIRE_SERVER_ID=your_server_id
BLACKFIRE_SERVER_TOKEN=your_server_token
```

```bash
docker compose build php-fpm workspace
docker compose up -d blackfire php-fpm workspace
```

Xdebug and the Blackfire probe can't run in the same PHP process, if `INSTALL_XDEBUG=true`, the Blackfire probe install step is skipped even when `INSTALL_BLACKFIRE=true`.

## Common issues

- **Nothing shows up in your Blackfire.io dashboard.** Double-check all four credentials (`BLACKFIRE_SERVER_ID`/`TOKEN` for the agent, `BLACKFIRE_CLIENT_ID`/`TOKEN` for the probe), a mismatch on either pair silently fails to relay profiles.
- **Profiling extension isn't loaded in PHP.** Confirm `INSTALL_BLACKFIRE=true` was set *before* building `php-fpm`/`workspace`, and that `INSTALL_XDEBUG` is `false`, then rebuild: `docker compose build php-fpm`.
- **Placeholder credentials left in `.env`.** The defaults (`<server_id>`, `<server_token>`, etc.) are non-functional placeholders, replace them with real values from your Blackfire.io account before expecting profiles to appear.

---

Profiling instead with step debugging? See the **[PHP-FPM guide](/docs/services/php-fpm)** for `INSTALL_XDEBUG`. New to Laradock? Start at **[Getting Started](/docs/getting-started)**.
