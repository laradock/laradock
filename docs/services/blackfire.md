# Blackfire

Source: https://laradock.io/docs/services/blackfire

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

## What is Blackfire?

[Blackfire](https://www.blackfire.io) is a PHP (and web) performance profiler from the SensioLabs/Symfony team: it traces function calls, memory, I/O, and SQL to help you find bottlenecks. It's a hosted SaaS product, the agent Laradock runs locally only collects and forwards profiling data to your Blackfire.io account.

## Start Blackfire

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock start blackfire
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose up -d blackfire
```

</TabItem>
</Tabs>

The `blackfire` container depends on `php-fpm`. It only collects data when a profiling run is triggered from a PHP process with the Blackfire probe enabled, it doesn't serve anything on its own.

## Stop Blackfire

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock stop blackfire
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose stop blackfire
```

</TabItem>
</Tabs>

There's no data to lose when it stops, the agent only relays profiles as they happen, it doesn't store anything on disk.

## Configuration

`blackfire/defaults.env` holds the credentials for the agent container itself:

| Variable | Default | What it does |
|---|---|---|
| `BLACKFIRE_SERVER_ID` | `<server_id>` | Server ID from your Blackfire.io account (Settings → Credentials). |
| `BLACKFIRE_SERVER_TOKEN` | `<server_token>` | Server token paired with the above. |

You need a [Blackfire.io account](https://blackfire.io) to get real values, the placeholders won't authenticate. Set both in your `.env` before starting the container.

There's a second pair of credentials, `BLACKFIRE_CLIENT_ID`/`BLACKFIRE_CLIENT_TOKEN`, set in `workspace/defaults.env`. Those are for the Blackfire *probe*/CLI baked into `php-fpm`/`workspace` at build time (via `INSTALL_BLACKFIRE=true`), not the agent container, and they authenticate the actual profiling client, not just the agent relay.

## Enable profiling on PHP

The agent alone isn't enough, `php-fpm` (or `workspace`, for CLI profiling) needs the Blackfire probe extension installed, which only happens if `INSTALL_XDEBUG=false` and `INSTALL_BLACKFIRE=true` at build time:

```env
INSTALL_BLACKFIRE=true
BLACKFIRE_CLIENT_ID=your_client_id
BLACKFIRE_CLIENT_TOKEN=your_client_token
BLACKFIRE_SERVER_ID=your_server_id
BLACKFIRE_SERVER_TOKEN=your_server_token
```

Rebuild the images so the probe gets installed:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock rebuild php-fpm workspace
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose build php-fpm workspace
```

</TabItem>
</Tabs>

Then start (or restart) the containers so they pick up the new build and credentials:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock start blackfire php-fpm workspace
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose up -d blackfire php-fpm workspace
```

</TabItem>
</Tabs>

Xdebug and the Blackfire probe can't run in the same PHP process, if `INSTALL_XDEBUG=true`, the Blackfire probe install step is skipped even when `INSTALL_BLACKFIRE=true`.

## Run a profile

With `INSTALL_BLACKFIRE=true`, the `blackfire` CLI binary is installed inside `workspace` alongside the probe. Profile an HTTP request against your app:

```bash
./laradock enter workspace
blackfire curl http://php-fpm/
```

Or profile a CLI script (an Artisan command, a queue worker, a one-off script):

```bash
./laradock enter workspace
blackfire run php artisan your:command
```

Either way, a link to the profile's results on your Blackfire.io dashboard prints to the terminal when it finishes. For profiling real user traffic on a running app instead of one-off CLI calls, use the [Blackfire browser extension or the `X-Blackfire-Query` trigger](https://docs.blackfire.io/profiling-cookbooks/profiling-http) against your app's URL, both talk straight to the probe inside `php-fpm`, the agent container just relays the result.

## Applying new credentials without a rebuild

Only `BLACKFIRE_SERVER_ID`/`BLACKFIRE_SERVER_TOKEN` (read by the `blackfire` container at runtime) can be changed by restarting alone. `BLACKFIRE_CLIENT_ID`/`BLACKFIRE_CLIENT_TOKEN` are baked into `workspace`/`php-fpm` at build time, changing those needs the rebuild above, not just a restart.

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock restart blackfire
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose restart blackfire
```

</TabItem>
</Tabs>

## Common issues

- **Nothing shows up in your Blackfire.io dashboard.** Double-check all four credentials (`BLACKFIRE_SERVER_ID`/`TOKEN` for the agent, `BLACKFIRE_CLIENT_ID`/`TOKEN` for the probe), a mismatch on either pair silently fails to relay profiles.
- **Profiling extension isn't loaded in PHP.** Confirm `INSTALL_BLACKFIRE=true` was set *before* building `php-fpm`/`workspace`, and that `INSTALL_XDEBUG` is `false`, then rebuild: `./laradock rebuild php-fpm workspace`.
- **Probe can't reach the agent.** The probe is hardcoded to talk to `tcp://blackfire:8707`, the `blackfire` container's name and internal port on the Laradock network. If you renamed the service in your own compose override, the probe won't find it.
- **Placeholder credentials left in `.env`.** The defaults (`<server_id>`, `<server_token>`, etc.) are non-functional placeholders, replace them with real values from your Blackfire.io account before expecting profiles to appear.
- **Changed `BLACKFIRE_CLIENT_ID`/`TOKEN` but nothing changed.** Those are build-time values on `workspace`/`php-fpm`, not runtime ones. Edit `.env`, then rebuild those two images (see [Applying new credentials](#applying-new-credentials-without-a-rebuild)) instead of just restarting.

---

Profiling instead with step debugging? See the **[PHP-FPM guide](https://laradock.io/docs/services/php-fpm)** for `INSTALL_XDEBUG`. New to Laradock? Start at **[Getting Started](https://laradock.io/docs/getting-started)**.
