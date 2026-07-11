---
slug: /xdebug-ide
title: Debug with Xdebug (IDE setup)
description: Wire PhpStorm or VS Code to Laradock's Xdebug so breakpoints hit. Covers the connection port, IDE key, and the host-to-container path mapping that trips most people up.
keywords:
  - laradock xdebug phpstorm
  - laradock xdebug vscode
  - xdebug path mapping docker
  - xdebug port 9000
  - laradock breakpoints not working
  - php step debugging docker
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

Installing Xdebug in the container is the container's job, see [Install Xdebug](/docs/services/php-fpm#install-xdebug) on the PHP-FPM page for the `.env` flags and rebuild. This page is the other half: pointing your editor at it so breakpoints actually stop.

Laradock ships Xdebug pre-configured to reach your host. You only need to match three values on the IDE side:

| Setting | Value | Why |
| --- | --- | --- |
| Host | `host.docker.internal` | How the container reaches your machine (already set in `php-fpm/xdebug.ini`). |
| Port | `9000` | Laradock's `xdebug.remote_port`. Not the Xdebug 3 default of `9003`. |
| IDE key | `PHPSTORM` | Laradock's `xdebug.idekey`, used by both PhpStorm and VS Code here. |

The one that trips everyone up is the **path mapping**: your code lives at `APP_CODE_PATH_CONTAINER` (`/var/www` by default) inside the container, not at its host path. Without the mapping the debugger connects but never stops on a breakpoint, because the file paths don't line up.

## Turn Xdebug on

It's off by default so it doesn't slow every request. Start it before a debug session, from the Laradock root:

```bash
./php-fpm/xdebug start
```

Stop it again with `./php-fpm/xdebug stop`. See [Start or stop Xdebug](/docs/services/php-fpm#start-or-stop-xdebug) for details.

## Configure your IDE

<Tabs groupId="ide">
<TabItem value="phpstorm" label="PhpStorm">

1. **Settings → PHP → Debug**: confirm **Debug port** is `9000`.
2. **Settings → PHP → Servers**: add a server.
   - **Name**: `laradock` (remember it, you'll reuse it below).
   - **Host**: your app's domain, for example `localhost` or `laravel.test`.
   - Tick **Use path mappings**, and map your **project root** on the host to `/var/www` in the container. If your app sits in a subfolder, map to `/var/www/<subfolder>`.
3. Click **Start Listening for PHP Debug Connections** (the phone icon in the toolbar).
4. Set a breakpoint, then load a page or run an artisan command from the workspace. The debugger stops.

For CLI/artisan debugging, PhpStorm matches the session by server name, so the **Name** in step 2 must match the `PHP_IDE_CONFIG` value if you set one (`serverName=laradock`).

</TabItem>
<TabItem value="vscode" label="VS Code">

Install the **PHP Debug** extension (`xdebug.php-debug`), then add this to `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Listen for Xdebug (Laradock)",
      "type": "php",
      "request": "launch",
      "port": 9000,
      "pathMappings": {
        "/var/www": "${workspaceFolder}"
      }
    }
  ]
}
```

If your app is in a subfolder, change the mapping key to `/var/www/<subfolder>`. Press **F5** to start listening, set a breakpoint, then hit a route or run an artisan command from the workspace.

</TabItem>
</Tabs>

## Breakpoints still not hitting?

- **Xdebug isn't running.** Check with `./php-fpm/xdebug status`, and confirm the extension is loaded: `./laradock exec php-fpm php -m | grep -i xdebug` (or `docker compose exec php-fpm php -m`).
- **Wrong port.** Laradock uses `9000`, not the Xdebug 3 default `9003`. Match your IDE to the container's `xdebug.remote_port`.
- **Path mapping is off.** The container path must be `/var/www` (or your `APP_CODE_PATH_CONTAINER`), mapped to your project root. A mismatched or missing mapping is the usual cause of "connects but never stops".
- **Not listening.** The IDE only catches sessions while it's actively listening (PhpStorm phone icon on, VS Code debug session started).
- **Firewall.** Your host firewall must allow inbound connections on the debug port from Docker's network.
